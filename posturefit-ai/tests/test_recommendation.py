from types import SimpleNamespace

from recommendation_engine import generate_recommendation


def user(level="beginner"):
    return SimpleNamespace(fitness_level=level, name="Tester")


def test_knock_knees_returns_hip_related_muscles():
    result = generate_recommendation(user(), "I have X-leg / knock knees.", 3, 30, "home")
    muscles = " ".join(result["target_muscles"]).lower()
    assert "gluteus medius" in muscles or "gluteus maximus" in muscles or "hip" in muscles


def test_rounded_shoulders_returns_scapular_muscles():
    result = generate_recommendation(user(), "rounded shoulders from desk work", 3, 30, "home")
    muscles = " ".join(result["target_muscles"]).lower()
    assert "trapezius" in muscles or "rhomboids" in muscles or "shoulder external rotators" in muscles


def test_home_scenario_excludes_gym_only_exercises():
    result = generate_recommendation(user("advanced"), "fat loss and weak core", 3, 45, "home")
    names = {exercise["name"] for day in result["weekly_plan"] for exercise in day["exercises"]}
    gym_only = {"Hip Abduction Machine", "Cable Hip Abduction", "Romanian Deadlift", "Seated Row", "Lat Pulldown"}
    assert names.isdisjoint(gym_only)


def test_weekly_frequency_controls_plan_days():
    result = generate_recommendation(user(), "anterior pelvic tilt", 3, 30, "home")
    assert len(result["weekly_plan"]) == 3


def test_session_minutes_30_has_reasonable_exercise_count():
    result = generate_recommendation(user(), "rounded shoulders", 3, 30, "home")
    assert all(3 <= len(day["exercises"]) <= 5 for day in result["weekly_plan"])
