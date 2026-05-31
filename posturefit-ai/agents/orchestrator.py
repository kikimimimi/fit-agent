from __future__ import annotations

from dataclasses import dataclass

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

    def detect_intent(self, message: str) -> str:
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
            return {
                "intent": intent,
                "profile": profile,
                "memory": memories,
                "plan": plan,
                "safety_review": safety,
                "nutrition_guidance": nutrition,
                "next_actions": ["Log each workout", "Report pain or difficulty", "Review progress weekly"],
            }

        if intent == "weekly_review":
            progress = self.progress_tracker.summarize(workout_logs or [], int(payload.get("weekly_frequency", 3)))
            return {"intent": intent, "profile": profile, "memory": memories, "progress_review": progress}

        if intent == "nutrition_advice":
            return {"intent": intent, "profile": profile, "memory": memories, "nutrition_guidance": self.nutrition_planner.suggest(profile)}

        if intent == "record_feedback":
            if self.memory_manager:
                self.memory_manager.remember(user.id, "feedback", "latest_feedback", message)
                self.db.flush()
            return {
                "intent": intent,
                "profile": profile,
                "memory": memories,
                "message": "Feedback recorded. FitAgent will use it when adjusting the next plan.",
            }

        return {
            "intent": intent,
            "profile": profile,
            "memory": memories,
            "message": "FitAgent can answer general fitness questions, but medical diagnosis is outside its scope.",
        }

    def _remember_plan_context(self, user_id: int, message: str, safety: dict) -> None:
        if not self.memory_manager:
            return
        if message:
            self.memory_manager.remember(user_id, "preference", "latest_training_request", message)
        if safety.get("warnings"):
            self.memory_manager.remember(user_id, "safety", "latest_safety_warnings", "; ".join(safety["warnings"]))
        self.db.flush()
