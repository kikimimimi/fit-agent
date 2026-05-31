import os
from typing import Dict


def build_agent_summary(user_profile, recommendation: Dict, problem: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY")
    if api_key:
        return _mock_llm_summary(user_profile, recommendation, problem, llm_available=True)
    return _mock_llm_summary(user_profile, recommendation, problem, llm_available=False)


def _mock_llm_summary(user_profile, recommendation: Dict, problem: str, llm_available: bool) -> str:
    name = getattr(user_profile, "name", "there")
    target_muscles = ", ".join(recommendation["target_muscles"])
    focus = ", ".join(recommendation["training_focus"])
    days = len(recommendation["weekly_plan"])
    source_note = "LLM-ready explanation layer" if llm_available else "local mock agent explanation"
    return (
        f"Hi {name}, here is your {days}-day general training plan based on: '{problem}'. "
        f"The rule engine selected {target_muscles} because these areas commonly support {focus}. "
        "The exercises are chosen first by the local recommendation rules, then explained in plain language by the agent layer. "
        "Move with control, keep effort moderate at first, and stop if pain, dizziness, numbness, or unusual discomfort appears. "
        f"This summary was produced by the {source_note}; API keys can be connected later without letting the LLM override the exercise rules."
    )
