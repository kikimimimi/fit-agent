import json
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from agent import build_agent_summary
from database import Plan, PlanDay, PlanExercise, User, WorkoutLog, get_db, init_db
from recommendation_engine import generate_recommendation
from schemas import DISCLAIMER, GeneratePlanRequest, PlanOut, PlanUpdate, UserCreate, UserOut, WorkoutLogCreate, WorkoutLogOut


app = FastAPI(title="PostureFit AI", version="0.1.0")
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "PostureFit AI"}


@app.post("/api/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/api/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/generate-plan", response_model=PlanOut)
def generate_plan(payload: GeneratePlanRequest, db: Session = Depends(get_db)):
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        recommendation = generate_recommendation(
            user,
            payload.problem,
            payload.weekly_frequency,
            payload.session_minutes,
            payload.scenario,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    agent_summary = build_agent_summary(user, recommendation, payload.problem)
    plan = Plan(
        user_id=user.id,
        problem=payload.problem,
        problem_analysis=recommendation["problem_analysis"],
        target_muscles=json.dumps(recommendation["target_muscles"]),
        training_focus=json.dumps(recommendation["training_focus"]),
        scenario=payload.scenario,
        weekly_frequency=payload.weekly_frequency,
        session_minutes=payload.session_minutes,
        agent_summary=agent_summary,
        disclaimer=DISCLAIMER,
    )
    db.add(plan)
    db.flush()
    _replace_plan_days(db, plan, recommendation["weekly_plan"])
    db.commit()
    db.refresh(plan)
    return _plan_to_response(plan)


@app.get("/api/plans/{plan_id}", response_model=PlanOut)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.get(Plan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return _plan_to_response(plan)


@app.put("/api/plans/{plan_id}", response_model=PlanOut)
def update_plan(plan_id: int, payload: PlanUpdate, db: Session = Depends(get_db)):
    plan = db.get(Plan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    _replace_plan_days(db, plan, [day.model_dump() for day in payload.weekly_plan])
    db.commit()
    db.refresh(plan)
    return _plan_to_response(plan)


@app.post("/api/workout-logs", response_model=WorkoutLogOut)
def create_workout_log(payload: WorkoutLogCreate, db: Session = Depends(get_db)):
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.plan_id and not db.get(Plan, payload.plan_id):
        raise HTTPException(status_code=404, detail="Plan not found")
    log = WorkoutLog(**payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@app.get("/api/workout-logs/{user_id}", response_model=list[WorkoutLogOut])
def get_workout_logs(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == user_id)
        .order_by(WorkoutLog.completed_at.desc())
        .all()
    )


def _replace_plan_days(db: Session, plan: Plan, weekly_plan: list[dict]) -> None:
    plan.days.clear()
    db.flush()
    for day_data in weekly_plan:
        day = PlanDay(
            plan_id=plan.id,
            day_number=day_data["day_number"],
            title=day_data["title"],
            warmup=day_data["warmup"],
            cooldown=day_data["cooldown"],
        )
        db.add(day)
        db.flush()
        for index, exercise in enumerate(day_data["exercises"]):
            db.add(
                PlanExercise(
                    day_id=day.id,
                    exercise_ref_id=exercise.get("exercise_ref_id"),
                    name=exercise["name"],
                    target_muscles=json.dumps(exercise["target_muscles"]),
                    sets=str(exercise["sets"]),
                    reps_or_duration=str(exercise["reps_or_duration"]),
                    rest_seconds=int(exercise["rest_seconds"]),
                    instruction=exercise["instruction"],
                    safety_note=exercise["safety_note"],
                    sort_order=index,
                )
            )


def _plan_to_response(plan: Plan) -> dict:
    days = sorted(plan.days, key=lambda item: item.day_number)
    return {
        "plan_id": plan.id,
        "problem_analysis": plan.problem_analysis,
        "target_muscles": json.loads(plan.target_muscles),
        "training_focus": json.loads(plan.training_focus),
        "weekly_plan": [
            {
                "id": day.id,
                "day_number": day.day_number,
                "title": day.title,
                "warmup": day.warmup,
                "cooldown": day.cooldown,
                "exercises": [
                    {
                        "id": exercise.id,
                        "exercise_ref_id": exercise.exercise_ref_id,
                        "name": exercise.name,
                        "target_muscles": json.loads(exercise.target_muscles),
                        "sets": exercise.sets,
                        "reps_or_duration": exercise.reps_or_duration,
                        "rest_seconds": exercise.rest_seconds,
                        "instruction": exercise.instruction,
                        "safety_note": exercise.safety_note,
                    }
                    for exercise in sorted(day.exercises, key=lambda item: item.sort_order)
                ],
            }
            for day in days
        ],
        "agent_summary": plan.agent_summary,
        "disclaimer": plan.disclaimer,
    }
