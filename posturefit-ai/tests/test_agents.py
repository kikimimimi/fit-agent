from types import SimpleNamespace

from fastapi.testclient import TestClient

from app import app
from agents.orchestrator import OrchestratorAgent
from agents.profile_agent import ProfileAgent
from agents.safety_checker import SafetyChecker
from agents.workout_planner import WorkoutPlanner


def user(level="beginner", injury_notes=""):
    return SimpleNamespace(
        id=1,
        name="Tester",
        age=22,
        sex="female",
        height_cm=165,
        weight_kg=58,
        fitness_level=level,
        goal="posture_improvement",
        injury_notes=injury_notes,
    )


def test_orchestrator_routes_workout_plan_requests():
    agent = OrchestratorAgent()
    assert agent.detect_intent("Create a 3 day workout plan") == "generate_workout_plan"


def test_profile_agent_normalizes_user_profile():
    profile = ProfileAgent().from_user(user(injury_notes="old knee pain"))
    assert profile["training_level"] == "beginner"
    assert profile["injuries"] == "old knee pain"
    assert profile["fitness_goal"] == "posture_improvement"


def test_workout_planner_returns_structured_weekly_plan():
    result = WorkoutPlanner().generate(
        user(),
        {
            "message": "rounded shoulders plan",
            "weekly_frequency": 3,
            "session_minutes": 30,
            "scenario": "home",
        },
    )
    assert len(result["weekly_plan"]) == 3
    assert result["target_muscles"]
    assert result["weekly_plan"][0]["exercises"]


def test_safety_checker_flags_beginner_overtraining():
    review = SafetyChecker().review(
        {"training_level": "beginner", "injuries": ""},
        {"weekly_plan": []},
        weekly_frequency=7,
    )
    assert review["risk_level"] == "review_needed"
    assert any("rest day" in warning.lower() or "beginner" in warning.lower() for warning in review["warnings"])


def test_orchestrator_runs_generate_plan_workflow_without_database():
    result = OrchestratorAgent().run(
        user(),
        {
            "message": "Create a home plan for weak core",
            "weekly_frequency": 2,
            "session_minutes": 30,
            "scenario": "home",
        },
    )
    assert result["intent"] == "generate_workout_plan"
    assert result["plan"]["weekly_plan"]
    assert "safety_review" in result
    assert "nutrition_guidance" in result


def test_exercise_image_endpoint_falls_back_without_image_provider(monkeypatch):
    monkeypatch.setenv("IMAGE_GENERATION_PROVIDER", "local")
    response = TestClient(app).post(
        "/api/exercise-images",
        json={
            "exercise_ref_id": "unit_test_missing_photo",
            "name": "Unit Test Exercise",
            "scenario": "home",
            "target_muscles": ["deep core"],
            "instruction": "Hold a stable position with controlled breathing.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["fallback"] is True
    assert data["status"] == "skipped"
