from __future__ import annotations

from dataclasses import dataclass
from itertools import cycle
from typing import Dict, Iterable, List


@dataclass(frozen=True)
class Exercise:
    id: str
    name: str
    target_muscles: List[str]
    scenario: str
    difficulty: str
    equipment: str
    sets: str
    reps_or_duration: str
    rest_seconds: int
    instruction: str
    safety_note: str


PROBLEM_RULES: Dict[str, Dict[str, List[str] | str]] = {
    "knock_knees": {
        "keywords": ["x leg", "x-leg", "knock knee", "knock knees", "x型腿", "x 型腿"],
        "analysis": "Your note suggests a lower-body alignment goal. General training can emphasize hip control, glute activation, and steady knee tracking.",
        "target_muscles": ["gluteus medius", "gluteus maximus", "hip external rotators", "quadriceps control"],
        "training_focus": ["hip abduction", "glute activation", "lower-limb stability"],
    },
    "bow_legs": {
        "keywords": ["o leg", "o-leg", "bow leg", "bow legs", "o型腿", "o 型腿"],
        "analysis": "Your note suggests a lower-body alignment and control goal. The plan uses balanced hip, thigh, and ankle stability work.",
        "target_muscles": ["adductors", "gluteus medius", "quadriceps control", "calf stabilizers"],
        "training_focus": ["controlled squatting", "hip stability", "foot and ankle control"],
    },
    "rounded_shoulders": {
        "keywords": ["rounded shoulder", "rounded shoulders", "圆肩", "round shoulder"],
        "analysis": "Your note suggests a shoulder posture habit goal. General training can support scapular retraction, thoracic extension, and chest mobility.",
        "target_muscles": ["middle and lower trapezius", "rhomboids", "shoulder external rotators", "rear deltoids"],
        "training_focus": ["scapular retraction", "thoracic extension", "chest stretching"],
    },
    "forward_head": {
        "keywords": ["forward head", "text neck", "头前倾", "neck posture"],
        "analysis": "Your note suggests a neck and upper-back posture habit goal. The plan emphasizes upper-back support, shoulder control, and thoracic mobility.",
        "target_muscles": ["middle and lower trapezius", "rhomboids", "shoulder external rotators", "thoracic extensors"],
        "training_focus": ["scapular retraction", "thoracic extension", "back strengthening"],
    },
    "hunchback": {
        "keywords": ["hunchback", "kyphosis", "驼背"],
        "analysis": "Your note suggests an upper-back posture goal. The plan prioritizes thoracic mobility, back strengthening, and core stability.",
        "target_muscles": ["thoracic extensors", "middle and lower trapezius", "core muscles"],
        "training_focus": ["thoracic mobility", "back strengthening", "core stability"],
    },
    "anterior_pelvic_tilt": {
        "keywords": ["anterior pelvic tilt", "pelvic tilt", "骨盆前倾"],
        "analysis": "Your note suggests a pelvis control goal. The plan emphasizes glutes, hamstrings, abdominal control, and hip-flexor mobility.",
        "target_muscles": ["gluteus maximus", "hamstrings", "rectus abdominis", "obliques"],
        "training_focus": ["glute activation", "core control", "hip flexor stretching"],
    },
    "weak_core": {
        "keywords": ["weak core", "core weakness", "核心力量", "腰背无力"],
        "analysis": "Your note suggests a trunk stability goal. The plan builds anti-extension, anti-rotation, and slow controlled strength.",
        "target_muscles": ["deep core", "rectus abdominis", "obliques", "spinal stabilizers"],
        "training_focus": ["core bracing", "spinal stability", "controlled breathing"],
    },
    "glute_shape": {
        "keywords": ["glute shape", "臀腿塑形", "booty", "glutes"],
        "analysis": "Your note suggests a body-shape training goal. The plan balances glute strength, hip control, and lower-body compound work.",
        "target_muscles": ["gluteus maximus", "gluteus medius", "hamstrings", "quadriceps"],
        "training_focus": ["progressive glute work", "hip hinge pattern", "single-leg control"],
    },
    "upper_back_strength": {
        "keywords": ["back muscle", "upper back", "back line", "背部", "背部线条"],
        "analysis": "Your note suggests an upper-back strength or body-shape goal. The plan uses pulling, scapular control, and postural support work.",
        "target_muscles": ["middle and lower trapezius", "rhomboids", "rear deltoids", "thoracic extensors"],
        "training_focus": ["back strengthening", "scapular retraction", "thoracic extension"],
    },
    "shoulder_line": {
        "keywords": ["shoulder muscle", "shoulder line", "deltoids", "肩部", "肩部线条"],
        "analysis": "Your note suggests a shoulder strength or shoulder-line goal. The plan emphasizes shoulder control and upper-back support.",
        "target_muscles": ["rear deltoids", "shoulder external rotators", "middle and lower trapezius"],
        "training_focus": ["scapular retraction", "back strengthening", "shoulder stability"],
    },
    "leg_strength_shape": {
        "keywords": ["leg line", "legs muscle", "lower body muscle", "thighs", "腿部", "腿部线条", "下半身"],
        "analysis": "Your note suggests a lower-body strength or body-shape goal. The plan balances squatting, hip stability, and posterior-chain work.",
        "target_muscles": ["quadriceps", "hamstrings", "gluteus maximus", "gluteus medius"],
        "training_focus": ["controlled squatting", "hip hinge pattern", "lower-limb stability"],
    },
    "fat_loss": {
        "keywords": ["fat loss", "lose fat", "减脂", "weight loss"],
        "analysis": "Your note suggests a fat-loss support goal. The plan combines compound strength, moderate conditioning, and repeatable training frequency.",
        "target_muscles": ["full-body compound training"],
        "training_focus": ["strength training", "cardio intervals", "training consistency"],
    },
}


EXERCISES: List[Exercise] = [
    Exercise("home_glute_bridge", "Glute Bridge", ["gluteus maximus", "hamstrings"], "home", "beginner", "mat", "3", "12-15 reps", 45, "Drive through the heels and pause at the top without arching the low back.", "Stop if you feel sharp back pain."),
    Exercise("home_clamshell", "Clamshell", ["gluteus medius", "hip external rotators"], "home", "beginner", "mini band optional", "3", "12 reps each side", 45, "Keep hips stacked and rotate the top knee without rolling the pelvis back.", "Use a small pain-free range."),
    Exercise("home_side_lying_abduction", "Side-Lying Hip Abduction", ["gluteus medius"], "home", "beginner", "mat", "3", "10-12 reps each side", 45, "Lift the top leg slightly behind the body with toes pointing forward.", "Avoid pinching at the front of the hip."),
    Exercise("home_bodyweight_squat", "Bodyweight Squat", ["quadriceps control", "gluteus maximus"], "home", "beginner", "none", "3", "8-12 reps", 60, "Sit back and down while tracking knees over the middle toes.", "Keep the depth comfortable and controlled."),
    Exercise("home_wall_angel", "Wall Angel", ["middle and lower trapezius", "shoulder external rotators"], "home", "beginner", "wall", "2", "8-10 slow reps", 30, "Keep ribs down and slide arms on the wall as far as comfortable.", "Do not force the shoulder range."),
    Exercise("home_bird_dog", "Bird Dog", ["deep core", "spinal stabilizers", "gluteus maximus"], "home", "beginner", "mat", "3", "8 reps each side", 45, "Reach opposite arm and leg while keeping hips level.", "Move slowly and keep the neck relaxed."),
    Exercise("home_dead_bug", "Dead Bug", ["deep core", "rectus abdominis"], "home", "beginner", "mat", "3", "8 reps each side", 45, "Press the low back gently toward the floor and move opposite limbs.", "Reduce range if the back arches."),
    Exercise("home_plank", "Plank", ["deep core", "rectus abdominis"], "home", "beginner", "mat", "3", "20-40 sec", 45, "Keep a straight line from shoulders to ankles and breathe steadily.", "Stop before form breaks."),
    Exercise("home_side_plank", "Side Plank", ["obliques", "gluteus medius"], "home", "intermediate", "mat", "2", "15-30 sec each side", 45, "Stack shoulders and hips while lifting the pelvis away from the floor.", "Use knees-down variation if needed."),
    Exercise("home_hip_flexor_stretch", "Hip Flexor Stretch", ["hip flexors"], "home", "beginner", "mat", "2", "30 sec each side", 20, "Tuck the pelvis gently and shift forward until you feel the front hip stretch.", "Avoid low-back extension."),
    Exercise("home_chest_stretch", "Doorway Chest Stretch", ["chest mobility"], "home", "beginner", "doorway", "2", "30 sec", 20, "Place forearms on a doorway and step through gently.", "Keep the stretch mild, not painful."),
    Exercise("home_reverse_snow_angel", "Reverse Snow Angel", ["middle and lower trapezius", "rear deltoids"], "home", "beginner", "mat", "2", "8-12 reps", 40, "Lie face down and sweep arms slowly while keeping shoulders away from ears.", "Keep movement small if shoulders feel tight."),
    Exercise("home_step_up", "Step-Up", ["quadriceps control", "gluteus maximus"], "home", "intermediate", "stable step", "3", "8 reps each side", 60, "Step through the whole foot and control the lowering phase.", "Use a low step first."),
    Exercise("home_split_squat", "Split Squat", ["quadriceps control", "gluteus maximus"], "home", "intermediate", "none", "3", "8 reps each side", 60, "Lower straight down and keep the front knee tracking over toes.", "Hold a wall for balance if needed."),
    Exercise("home_good_morning", "Bodyweight Good Morning", ["hamstrings", "gluteus maximus"], "home", "beginner", "none", "3", "10-12 reps", 45, "Hinge at the hips with a long spine, then squeeze glutes to stand.", "Keep the range easy to control."),
    Exercise("home_calf_raise", "Calf Raise", ["calf stabilizers"], "home", "beginner", "wall support", "3", "12-15 reps", 30, "Rise through the big toe mound and lower slowly.", "Hold support for balance."),
    Exercise("home_mountain_climber", "Slow Mountain Climber", ["deep core", "full-body compound training"], "home", "intermediate", "mat", "3", "30 sec", 45, "Move knees toward chest without bouncing the hips.", "Slow down if wrists or back feel stressed."),
    Exercise("home_glute_march", "Glute Bridge March", ["gluteus maximus", "deep core"], "home", "intermediate", "mat", "3", "8 reps each side", 45, "Hold a bridge and lift one foot at a time without dropping the pelvis.", "Return to regular bridges if form changes."),
    Exercise("gym_hip_abduction_machine", "Hip Abduction Machine", ["gluteus medius"], "gym", "beginner", "machine", "3", "12-15 reps", 60, "Open the knees under control and pause briefly before returning.", "Use a load that does not cause hip pinching."),
    Exercise("gym_cable_hip_abduction", "Cable Hip Abduction", ["gluteus medius"], "gym", "intermediate", "cable machine", "3", "10-12 reps each side", 60, "Stand tall and move the working leg out slightly behind the body.", "Avoid leaning or swinging."),
    Exercise("gym_romanian_deadlift", "Romanian Deadlift", ["hamstrings", "gluteus maximus"], "gym", "intermediate", "barbell or dumbbells", "3", "8-10 reps", 90, "Hinge from the hips and keep the weight close to the legs.", "Keep the spine neutral and load conservative."),
    Exercise("gym_seated_row", "Seated Row", ["middle and lower trapezius", "rhomboids"], "gym", "beginner", "cable row", "3", "10-12 reps", 60, "Pull elbows back and squeeze shoulder blades gently.", "Avoid shrugging the shoulders."),
    Exercise("gym_lat_pulldown", "Lat Pulldown", ["middle and lower trapezius", "rhomboids"], "gym", "beginner", "pulldown machine", "3", "10-12 reps", 60, "Pull the bar toward the upper chest with ribs down.", "Do not pull behind the neck."),
    Exercise("gym_face_pull", "Face Pull", ["shoulder external rotators", "rear deltoids"], "gym", "beginner", "cable rope", "3", "12-15 reps", 45, "Pull rope toward eye level with elbows high and wrists relaxed.", "Use light weight and smooth control."),
    Exercise("gym_leg_press", "Leg Press", ["quadriceps control", "gluteus maximus"], "gym", "beginner", "leg press", "3", "10-12 reps", 90, "Press through the full foot while knees track over toes.", "Do not lock knees hard at the top."),
    Exercise("gym_goblet_squat", "Goblet Squat", ["quadriceps control", "gluteus maximus"], "gym", "beginner", "dumbbell or kettlebell", "3", "8-12 reps", 75, "Hold weight at chest and squat with controlled knee tracking.", "Choose a load that keeps posture steady."),
    Exercise("gym_cable_pull_through", "Cable Pull Through", ["gluteus maximus", "hamstrings"], "gym", "intermediate", "cable machine", "3", "10-12 reps", 60, "Hinge away from the cable, then stand tall by squeezing glutes.", "Avoid turning it into a squat."),
    Exercise("gym_back_extension", "Back Extension", ["thoracic extensors", "gluteus maximus"], "gym", "intermediate", "back extension bench", "3", "8-12 reps", 60, "Move through the hips and finish with a long neutral spine.", "Do not hyperextend the low back."),
    Exercise("gym_chest_supported_row", "Chest-Supported Row", ["middle and lower trapezius", "rhomboids", "rear deltoids"], "gym", "intermediate", "bench and dumbbells", "3", "10-12 reps", 60, "Pull elbows toward hips while chest stays on the bench.", "Keep neck relaxed."),
    Exercise("gym_pallof_press", "Pallof Press", ["deep core", "obliques"], "gym", "beginner", "cable or band", "3", "10 reps each side", 45, "Press hands forward and resist trunk rotation.", "Use light resistance first."),
    Exercise("gym_treadmill_incline_walk", "Incline Walk", ["full-body compound training"], "gym", "beginner", "treadmill", "1", "8-15 min", 30, "Walk at a pace where breathing is elevated but controlled.", "Hold rails only if balance requires it."),
    Exercise("gym_sled_push", "Sled Push", ["full-body compound training", "quadriceps control", "gluteus maximus"], "gym", "advanced", "sled", "4", "15-20 m", 90, "Push with a steady torso angle and powerful short steps.", "Use clear space and conservative load."),
]


DIFFICULTY_ORDER = {"beginner": 0, "intermediate": 1, "advanced": 2}
SESSION_LIMITS = [(20, 4), (30, 5), (45, 6), (10_000, 8)]


def analyze_problem(problem: str) -> Dict[str, List[str] | str]:
    text = problem.lower()
    matched = []
    for rule in PROBLEM_RULES.values():
        if any(keyword.lower() in text for keyword in rule["keywords"]):
            matched.append(rule)

    if not matched:
        matched = [PROBLEM_RULES["weak_core"]]

    target_muscles: List[str] = []
    training_focus: List[str] = []
    analyses: List[str] = []
    for rule in matched:
        target_muscles.extend(rule["target_muscles"])  # type: ignore[arg-type]
        training_focus.extend(rule["training_focus"])  # type: ignore[arg-type]
        analyses.append(str(rule["analysis"]))

    return {
        "problem_analysis": " ".join(analyses),
        "target_muscles": _unique(target_muscles),
        "training_focus": _unique(training_focus),
    }


def generate_recommendation(user_profile, problem: str, weekly_frequency: int, session_minutes: int, scenario: str) -> Dict:
    scenario = scenario.lower().strip()
    if scenario not in {"home", "gym"}:
        raise ValueError("scenario must be home or gym")

    analysis = analyze_problem(problem)
    target_muscles = analysis["target_muscles"]
    focus = analysis["training_focus"]
    exercise_count = _exercise_count(session_minutes)
    exercises = _select_exercises(target_muscles, scenario, getattr(user_profile, "fitness_level", "beginner"), exercise_count)
    weekly_plan = _build_weekly_plan(exercises, weekly_frequency, exercise_count, focus)

    return {
        "problem_analysis": analysis["problem_analysis"],
        "target_muscles": target_muscles,
        "training_focus": focus,
        "recommended_exercises": [exercise_to_dict(item) for item in exercises],
        "weekly_plan": weekly_plan,
    }


def exercise_to_dict(exercise: Exercise) -> Dict:
    return {
        "exercise_ref_id": exercise.id,
        "name": exercise.name,
        "target_muscles": exercise.target_muscles,
        "sets": exercise.sets,
        "reps_or_duration": exercise.reps_or_duration,
        "rest_seconds": exercise.rest_seconds,
        "instruction": exercise.instruction,
        "safety_note": exercise.safety_note,
    }


def _select_exercises(target_muscles: Iterable[str], scenario: str, fitness_level: str, count: int) -> List[Exercise]:
    allowed_level = DIFFICULTY_ORDER.get(fitness_level, 0)
    target_words = set(" ".join(target_muscles).lower().replace("-", " ").split())

    candidates = [
        exercise
        for exercise in EXERCISES
        if exercise.scenario == scenario and DIFFICULTY_ORDER[exercise.difficulty] <= allowed_level
    ]
    if not candidates:
        candidates = [exercise for exercise in EXERCISES if exercise.scenario == scenario]

    def score(exercise: Exercise) -> int:
        words = set(" ".join(exercise.target_muscles).lower().replace("-", " ").split())
        return len(words & target_words)

    ranked = sorted(candidates, key=lambda item: (score(item), item.difficulty == "beginner"), reverse=True)
    selected = ranked[: max(count + 2, 6)]

    if len(selected) < count:
        fallback = [exercise for exercise in candidates if exercise not in selected]
        selected.extend(fallback[: count - len(selected)])
    return selected


def _build_weekly_plan(exercises: List[Exercise], weekly_frequency: int, exercise_count: int, focus: List[str]) -> List[Dict]:
    plan = []
    exercise_cycle = cycle(exercises)
    for day in range(1, weekly_frequency + 1):
        day_exercises = [next(exercise_cycle) for _ in range(exercise_count)]
        plan.append(
            {
                "day_number": day,
                "title": f"Day {day}: {focus[(day - 1) % len(focus)].title() if focus else 'Foundation'}",
                "warmup": "5 minutes of easy movement, breathing practice, and gentle joint mobility.",
                "exercises": [exercise_to_dict(exercise) for exercise in day_exercises],
                "cooldown": "3-5 minutes of relaxed stretching for the areas trained today.",
            }
        )
    return plan


def _exercise_count(session_minutes: int) -> int:
    for minutes, count in SESSION_LIMITS:
        if session_minutes <= minutes:
            return count
    return 5


def _unique(items: Iterable[str]) -> List[str]:
    seen = set()
    output = []
    for item in items:
        if item not in seen:
            seen.add(item)
            output.append(item)
    return output
