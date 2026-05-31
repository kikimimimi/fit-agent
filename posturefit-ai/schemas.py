from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


DISCLAIMER = (
    "This product provides general fitness and posture-improvement guidance only. "
    "It is not a medical diagnosis or treatment plan. Users with pain, injury, "
    "chronic disease, pregnancy, or severe posture problems should consult a qualified professional."
)


class UserCreate(BaseModel):
    name: str
    age: int = Field(ge=12, le=100)
    sex: str
    height_cm: float = Field(gt=80, lt=250)
    weight_kg: float = Field(gt=25, lt=300)
    fitness_level: str
    goal: str
    injury_notes: Optional[str] = ""


class UserOut(UserCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GeneratePlanRequest(BaseModel):
    user_id: int
    problem: str
    weekly_frequency: int = Field(ge=1, le=7)
    session_minutes: int = Field(ge=15, le=90)
    scenario: str
    home_sessions: int = Field(default=0, ge=0, le=7)
    home_minutes: int = Field(default=30, ge=15, le=90)
    gym_sessions: int = Field(default=0, ge=0, le=7)
    gym_minutes: int = Field(default=45, ge=15, le=90)


class ExercisePlanItem(BaseModel):
    id: Optional[int] = None
    exercise_ref_id: Optional[str] = None
    name: str
    target_muscles: List[str]
    sets: str
    reps_or_duration: str
    rest_seconds: int
    instruction: str
    safety_note: str


class DayPlan(BaseModel):
    id: Optional[int] = None
    day_number: int
    title: str
    warmup: str
    exercises: List[ExercisePlanItem]
    cooldown: str


class PlanUpdate(BaseModel):
    weekly_plan: List[DayPlan]


class PlanOut(BaseModel):
    plan_id: int
    problem_analysis: str
    target_muscles: List[str]
    training_focus: List[str]
    weekly_plan: List[DayPlan]
    agent_summary: str
    disclaimer: str = DISCLAIMER


class WorkoutLogCreate(BaseModel):
    user_id: int
    plan_id: Optional[int] = None
    day_number: Optional[int] = None
    notes: Optional[str] = ""


class WorkoutLogOut(BaseModel):
    id: int
    user_id: int
    plan_id: Optional[int]
    day_number: Optional[int]
    notes: str
    completed_at: datetime

    class Config:
        from_attributes = True
