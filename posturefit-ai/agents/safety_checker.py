from __future__ import annotations

from dataclasses import dataclass


HIGH_IMPACT_TERMS = ("jump", "burpee", "sprint", "sled push", "mountain climber")
KNEE_TERMS = ("knee", "acl", "meniscus", "patellar")


@dataclass
class SafetyChecker:
    """Checks obvious fitness risk patterns before a plan is presented."""

    def review(self, profile: dict, plan: dict, weekly_frequency: int) -> dict:
        warnings: list[str] = []
        injuries = str(profile.get("injuries") or "").lower()
        training_level = str(profile.get("training_level") or "beginner").lower()

        if any(term in injuries for term in KNEE_TERMS) and self._plan_contains(plan, HIGH_IMPACT_TERMS):
            warnings.append("Knee injury was mentioned, so high-impact or aggressive conditioning should be replaced.")
        if training_level == "beginner" and weekly_frequency > 5:
            warnings.append("Beginner frequency above 5 sessions per week may reduce recovery. Start with 2-4 sessions.")
        if weekly_frequency >= 7:
            warnings.append("The weekly plan has no rest day. Add at least one recovery day.")
        if any(term in injuries for term in ("pain", "sharp", "dizzy", "numb")):
            warnings.append("Pain, dizziness, numbness, or sharp discomfort requires stopping exercise and consulting a professional.")

        return {
            "risk_level": "review_needed" if warnings else "low",
            "warnings": warnings,
            "disclaimer": "This is a basic automated safety screen, not medical clearance.",
        }

    def _plan_contains(self, plan: dict, terms: tuple[str, ...]) -> bool:
        text = str(plan).lower()
        return any(term in text for term in terms)
