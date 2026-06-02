from __future__ import annotations

from dataclasses import dataclass
import json

from agents.llm_client import LLMClient, LLMResult
from agents.memory_manager import MemoryManager
from agents.nutrition_planner import NutritionPlanner
from agents.profile_agent import ProfileAgent
from agents.progress_tracker import ProgressTracker
from agents.safety_checker import SafetyChecker
from agents.workout_planner import WorkoutPlanner


@dataclass
class OrchestratorAgent:
    """Routes user intent to specialized FitAgent tools."""

    db: object | None = None

    def __post_init__(self) -> None:
        self.profile_agent = ProfileAgent()
        self.workout_planner = WorkoutPlanner()
        self.nutrition_planner = NutritionPlanner()
        self.safety_checker = SafetyChecker()
        self.progress_tracker = ProgressTracker()
        self.memory_manager = MemoryManager(self.db) if self.db is not None else None
        self.llm_client = LLMClient()

    def detect_intent(self, message: str) -> str:
        llm_intent = self._detect_intent_with_llm(message)
        if llm_intent:
            return llm_intent
        text = message.lower()
        if any(term in text for term in ("weekly report", "review", "progress", "summary", "\u590d\u76d8", "\u5468\u62a5")):
            return "weekly_review"
        if any(term in text for term in ("feedback", "too hard", "too easy", "pain", "sore", "\u53cd\u9988", "\u75bc")):
            return "record_feedback"
        if any(term in text for term in ("nutrition", "diet", "meal", "protein", "\u996e\u98df", "\u8425\u517b")):
            return "nutrition_advice"
        if any(term in text for term in ("plan", "workout", "train", "exercise", "\u8ba1\u5212", "\u8bad\u7ec3")):
            return "generate_workout_plan"
        return "general_fitness_question"

    def run(self, user, payload: dict, workout_logs: list | None = None) -> dict:
        message = payload.get("message") or payload.get("problem") or ""
        intent = payload.get("intent") or self.detect_intent(message)
        profile = self.profile_agent.merge_session_context(self.profile_agent.from_user(user), payload)
        memories = self.memory_manager.recent(user.id) if self.memory_manager else []

        if intent == "generate_workout_plan":
            plan = self.workout_planner.generate(user, payload)
            safety = self.safety_checker.review(profile, plan, int(payload.get("weekly_frequency", 3)))
            nutrition = self.nutrition_planner.suggest(profile)
            self._remember_plan_context(user.id, message, safety)
            memories = self._recent_memories(user.id)
            llm = self._coach_with_llm(
                "plan_explanation",
                payload,
                {
                    "profile": profile,
                    "intent": intent,
                    "target_muscles": plan.get("target_muscles", []),
                    "training_focus": plan.get("training_focus", []),
                    "weekly_days": len(plan.get("weekly_plan", [])),
                    "safety_review": safety,
                    "nutrition_guidance": nutrition,
                    "memory": memories[:3],
                },
            )
            return {
                "intent": intent,
                "profile": profile,
                "memory": memories,
                "plan": plan,
                "safety_review": safety,
                "nutrition_guidance": nutrition,
                "coach_message": llm.text,
                "llm_enabled": llm.status == "success",
                "llm_call": llm.to_log(),
                "next_actions": ["Log each workout", "Report pain or difficulty", "Review progress weekly"],
            }

        if intent == "weekly_review":
            progress = self.progress_tracker.summarize(workout_logs or [], int(payload.get("weekly_frequency", 3)))
            llm = self._coach_with_llm("weekly_review", payload, {"profile": profile, "progress_review": progress, "memory": memories[:3]})
            return {
                "intent": intent,
                "profile": profile,
                "memory": memories,
                "progress_review": progress,
                "coach_message": llm.text,
                "llm_enabled": llm.status == "success",
                "llm_call": llm.to_log(),
            }

        if intent == "nutrition_advice":
            nutrition = self.nutrition_planner.suggest(profile)
            llm = self._coach_with_llm("nutrition_advice", payload, {"profile": profile, "nutrition_guidance": nutrition, "memory": memories[:3]})
            return {
                "intent": intent,
                "profile": profile,
                "memory": memories,
                "nutrition_guidance": nutrition,
                "coach_message": llm.text,
                "llm_enabled": llm.status == "success",
                "llm_call": llm.to_log(),
            }

        if intent == "record_feedback":
            if self.memory_manager:
                self.memory_manager.remember(user.id, "feedback", "latest_feedback", message)
                self.db.flush()
                memories = self._recent_memories(user.id)
            llm = self._coach_with_llm("feedback_response", payload, {"profile": profile, "feedback": message, "memory": memories[:3]})
            return {
                "intent": intent,
                "profile": profile,
                "memory": memories,
                "message": llm.text or "Feedback recorded. FitAgent will use it when adjusting the next plan.",
                "coach_message": llm.text,
                "llm_enabled": llm.status == "success",
                "llm_call": llm.to_log(),
            }

        llm = self._coach_with_llm("general_fitness_question", payload, {"profile": profile, "question": message, "memory": memories[:3]})
        fallback_message = self._local_general_response(message, payload.get("language") or "en")
        return {
            "intent": intent,
            "profile": profile,
            "memory": memories,
            "message": llm.text or fallback_message,
            "coach_message": llm.text,
            "llm_enabled": llm.status == "success",
            "llm_call": llm.to_log(),
        }

    def _remember_plan_context(self, user_id: int, message: str, safety: dict) -> None:
        if not self.memory_manager:
            return
        if message:
            self.memory_manager.remember(user_id, "preference", "latest_training_request", message)
        if safety.get("warnings"):
            self.memory_manager.remember(user_id, "safety", "latest_safety_warnings", "; ".join(safety["warnings"]))
        self.db.flush()

    def _recent_memories(self, user_id: int) -> list[dict]:
        if not self.memory_manager:
            return []
        return self.memory_manager.recent(user_id)

    def _detect_intent_with_llm(self, message: str) -> str | None:
        if not message or not self.llm_client.enabled():
            return None
        system_prompt = (
            "Classify a fitness coaching request. Return exactly one label from: "
            "generate_workout_plan, record_feedback, weekly_review, nutrition_advice, general_fitness_question. "
            "Do not return any explanation."
        )
        result = self.llm_client.complete("intent_classification", system_prompt, message, max_tokens=16)
        allowed = {
            "generate_workout_plan",
            "record_feedback",
            "weekly_review",
            "nutrition_advice",
            "general_fitness_question",
        }
        text = result.text.strip().split()[0] if result.text else ""
        return text if text in allowed else None

    def _coach_with_llm(self, prompt_type: str, payload: dict, context: dict) -> LLMResult:
        language = payload.get("language") or "en"
        language_name = "Chinese" if language == "zh" else "English"
        system_prompt = (
            f"You are FitAgent, a cautious AI personal fitness coach. Respond in {language_name}. "
            "Use the supplied structured plan and safety review as ground truth. "
            "Do not invent medical diagnoses, treatment claims, guaranteed posture correction, or extreme weight-loss advice. "
            "If pain, injury, dizziness, numbness, pregnancy, or chronic disease is relevant, recommend consulting a qualified professional. "
            "Keep the response concise, supportive, and practical."
        )
        user_prompt = json.dumps(
            {
                "task": prompt_type,
                "user_message": payload.get("message") or payload.get("problem") or "",
                "context": context,
            },
            ensure_ascii=False,
            default=str,
        )
        return self.llm_client.complete(prompt_type, system_prompt, user_prompt)

    def _local_general_response(self, message: str, language: str) -> str:
        text = message.lower()
        zh = language == "zh"
        if any(term in text for term in ("pain", "hurt", "sharp", "dizzy", "numb", "疼", "痛", "头晕", "麻")):
            return (
                "如果出现疼痛、头晕、麻木或尖锐不适，请先停止训练，不要硬撑。可以记录出现不适的动作、位置和强度；如果持续存在，建议咨询医生或康复/运动专业人士。"
                if zh
                else "If you feel pain, dizziness, numbness, or sharp discomfort, stop training first. Note which movement caused it, where it happened, and how intense it was; if it continues, consult a qualified medical or fitness professional."
            )
        if any(term in text for term in ("warm", "warmup", "warm-up", "squat", "热身", "深蹲")):
            return (
                "深蹲前可以用 5-8 分钟热身：先做轻松步行或原地踏步，再做髋、膝、踝活动，最后做 1-2 组徒手深蹲。正式训练时让膝盖跟随脚尖方向，先用能稳定控制的深度。"
                if zh
                else "Before squats, use a 5-8 minute warmup: easy walking or marching, then hip, knee, and ankle mobility, then 1-2 light bodyweight squat sets. During the squat, let knees track over toes and use a depth you can control."
            )
        if any(term in text for term in ("recover", "rest", "sore", "sleep", "恢复", "休息", "酸")):
            return (
                "恢复可以先看三件事：睡眠、训练间隔和酸痛程度。初学者同一部位通常间隔 48 小时更稳妥；轻微酸胀可以低强度活动，明显疼痛或动作变形就应降低强度。"
                if zh
                else "For recovery, watch sleep, spacing between sessions, and soreness. Beginners usually do better with about 48 hours before training the same area hard again. Mild soreness can use easy movement; pain or form breakdown means reduce intensity."
            )
        if any(term in text for term in ("frequency", "how many", "week", "次数", "频率", "每周")):
            return (
                "如果是新手，建议先从每周 2-4 次开始；每次 20-45 分钟即可。等动作稳定、恢复良好后，再逐步增加次数或时长。"
                if zh
                else "If you are a beginner, start with 2-4 sessions per week, about 20-45 minutes each. Increase frequency or duration only after your form feels stable and recovery is good."
            )
        return (
            "我可以帮你分析训练动作、体态改善、恢复安排和计划调整。这个建议属于一般健身信息，不替代医学诊断；如果有疼痛或慢性疾病，请咨询专业人士。"
            if zh
            else "I can help with exercise technique, posture goals, recovery, and plan adjustments. This is general fitness guidance, not a medical diagnosis; if you have pain or a chronic condition, consult a qualified professional."
        )
