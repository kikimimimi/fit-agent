# PostureFit AI

PostureFit AI is a course-project MVP for a problem-driven posture and body-shape workout agent. It provides general fitness guidance only. It is not a medical diagnosis or treatment system.

## Features

- User profile capture and SQLite persistence
- Problem-to-muscle rule mapping for goals such as knock knees, rounded shoulders, hunchback posture habits, anterior pelvic tilt, weak core, glute shaping, and fat-loss support
- Built-in exercise library with 30+ home and gym exercises
- Rule-based weekly plan generation by scenario, fitness level, weekly frequency, and session length
- Agent-style explanation layer with reserved `OPENAI_API_KEY` / `LLM_API_KEY` integration points
- Editable weekly plans
- Workout completion logs and history display
- Simple HTML, CSS, and JavaScript frontend
- Training-focus photo cards styled like gym equipment instruction stickers

## Tech Stack

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Pytest
- Plain HTML, CSS, JavaScript

## Install

macOS / Linux:

```bash
cd posturefit-ai
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn pydantic sqlalchemy pytest
python seed_data.py
```

Windows PowerShell:

```powershell
cd posturefit-ai
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn pydantic sqlalchemy pytest
python seed_data.py
```

## Start Backend

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Open the frontend at:

```text
http://127.0.0.1:8000/
```

## Run Tests

```bash
pytest
```

## API Examples

Create a user:

```bash
curl -X POST http://127.0.0.1:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","age":28,"sex":"female","height_cm":168,"weight_kg":62,"fitness_level":"beginner","goal":"posture_improvement","injury_notes":""}'
```

Generate a plan:

```bash
curl -X POST http://127.0.0.1:8000/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"problem":"I have knock knees and want to improve lower body alignment.","weekly_frequency":3,"session_minutes":30,"scenario":"home"}'
```

Other endpoints:

```text
GET  /
POST /api/users
GET  /api/users/{user_id}
POST /api/generate-plan
GET  /api/plans/{plan_id}
PUT  /api/plans/{plan_id}
POST /api/workout-logs
GET  /api/workout-logs/{user_id}
GET  /api/health
```

## Safety Disclaimer

This product provides general fitness and posture-improvement guidance only. It is not a medical diagnosis or treatment plan. Users with pain, injury, chronic disease, pregnancy, or severe posture problems should consult a qualified professional.

The app intentionally uses wording such as "support better posture habits", "strengthen related muscles", and "general training guidance". It does not claim to cure, diagnose, guarantee correction, or permanently fix posture issues.

## Asset Attribution

- Muscle model path data: `frontend/assets/muscle-body-data.js`
- Source: `react-muscle-highlighter` by soroojshehryar
- Repository: https://github.com/soroojshehryar/react-muscle-highlighter
- License: MIT
- Training-focus photos: `frontend/assets/focus/*.png`
- Source: AI-generated project assets created for this MVP

## Future Roadmap

- Optional real LLM explanation provider behind the existing API-key interface
- Exercise substitution UI
- Progress charts for completion history
- More granular equipment filters
- Exportable weekly plan summary
- Authentication and multi-user dashboards
