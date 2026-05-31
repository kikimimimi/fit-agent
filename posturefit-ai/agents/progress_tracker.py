from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ProgressTracker:
    """Summarizes workout history and proposes simple plan adjustments."""

    def summarize(self, logs: list, target_frequency: int = 3) -> dict:
        completed = len(logs)
        completion_ratio = min(1.0, completed / max(target_frequency, 1))
        if completed == 0:
            recommendation = "Start with the first planned session and record how it felt."
        elif completion_ratio < 0.67:
            recommendation = "Reduce friction: keep sessions shorter or lower weekly frequency for the next week."
        else:
            recommendation = "Keep the plan stable for one more week before increasing volume."
        return {
            "completed_sessions": completed,
            "target_frequency": target_frequency,
            "completion_ratio": completion_ratio,
            "recommendation": recommendation,
        }
