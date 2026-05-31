from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ProfileAgent:
    """Maintains the normalized user profile used by downstream agents."""

    def from_user(self, user) -> dict:
        return {
            "user_id": getattr(user, "id", None),
            "name": getattr(user, "name", "User"),
            "age": getattr(user, "age", None),
            "gender": getattr(user, "sex", None),
            "height_cm": getattr(user, "height_cm", None),
            "weight_kg": getattr(user, "weight_kg", None),
            "fitness_goal": getattr(user, "goal", None),
            "training_level": getattr(user, "fitness_level", "beginner"),
            "injuries": getattr(user, "injury_notes", "") or "",
        }

    def merge_session_context(self, profile: dict, payload: dict) -> dict:
        merged = dict(profile)
        for key in (
            "weekly_frequency",
            "available_equipment",
            "diet_preference",
            "training_experience",
            "injuries",
        ):
            if payload.get(key) not in (None, ""):
                merged[key] = payload[key]
        return merged
