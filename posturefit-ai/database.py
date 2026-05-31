from datetime import datetime
from pathlib import Path

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker


BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'posturefit.db'}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String(40), nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    fitness_level = Column(String(40), nullable=False)
    goal = Column(String(60), nullable=False)
    injury_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    plans = relationship("Plan", back_populates="user")
    workout_logs = relationship("WorkoutLog", back_populates="user")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem = Column(Text, nullable=False)
    problem_analysis = Column(Text, nullable=False)
    target_muscles = Column(Text, nullable=False)
    training_focus = Column(Text, nullable=False)
    scenario = Column(String(20), nullable=False)
    weekly_frequency = Column(Integer, nullable=False)
    session_minutes = Column(Integer, nullable=False)
    agent_summary = Column(Text, nullable=False)
    disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="plans")
    days = relationship("PlanDay", back_populates="plan", cascade="all, delete-orphan")
    workout_logs = relationship("WorkoutLog", back_populates="plan")


class PlanDay(Base):
    __tablename__ = "plan_days"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    title = Column(String(120), nullable=False)
    warmup = Column(Text, nullable=False)
    cooldown = Column(Text, nullable=False)

    plan = relationship("Plan", back_populates="days")
    exercises = relationship("PlanExercise", back_populates="day", cascade="all, delete-orphan")


class PlanExercise(Base):
    __tablename__ = "plan_exercises"

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("plan_days.id"), nullable=False)
    exercise_ref_id = Column(String(60), nullable=True)
    name = Column(String(160), nullable=False)
    target_muscles = Column(Text, nullable=False)
    sets = Column(String(40), nullable=False)
    reps_or_duration = Column(String(80), nullable=False)
    rest_seconds = Column(Integer, nullable=False)
    instruction = Column(Text, nullable=False)
    safety_note = Column(Text, nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)

    day = relationship("PlanDay", back_populates="exercises")


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    day_number = Column(Integer, nullable=True)
    notes = Column(Text, default="")
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="workout_logs")
    plan = relationship("Plan", back_populates="workout_logs")


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
