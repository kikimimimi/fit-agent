from __future__ import annotations

from dataclasses import dataclass


NUTRITION_DISCLAIMER = (
    "Nutrition guidance is general wellness education, not medical diagnosis, "
    "treatment, or a prescription. Users with medical conditions should consult "
    "a qualified professional."
)


@dataclass
class NutritionPlanner:
    """Produces conservative habit-level nutrition suggestions."""

    def suggest(self, profile: dict) -> dict:
        goal = str(profile.get("fitness_goal") or "").lower()
        diet_preference = profile.get("diet_preference") or "no stated preference"
        suggestions = [
            "Build each meal around a protein source, vegetables or fruit, and a steady carbohydrate or healthy fat.",
            "Hydrate before training and keep caffeine timing consistent.",
            "Use a simple weekly meal routine instead of extreme restriction.",
        ]
        if "fat" in goal or "loss" in goal:
            suggestions.append("Use a modest calorie deficit and prioritize protein to support satiety and recovery.")
        elif "muscle" in goal:
            suggestions.append("Pair progressive strength training with enough total calories and protein.")
        else:
            suggestions.append("Keep nutrition consistent enough to support energy, sleep, and workout recovery.")

        return {
            "diet_preference": diet_preference,
            "suggestions": suggestions,
            "disclaimer": NUTRITION_DISCLAIMER,
        }
