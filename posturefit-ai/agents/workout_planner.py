from __future__ import annotations

from dataclasses import dataclass

from recommendation_engine import generate_recommendation


@dataclass
class WorkoutPlanner:
    """Wraps the existing rule engine as a planner tool."""

    def generate(self, user, payload: dict) -> dict:
        return generate_recommendation(
            user,
            payload.get("message") or payload.get("problem") or "general beginner fitness plan",
            int(payload.get("weekly_frequency", 3)),
            int(payload.get("session_minutes", 30)),
            payload.get("scenario", "home"),
            payload.get("schedule"),
        )
