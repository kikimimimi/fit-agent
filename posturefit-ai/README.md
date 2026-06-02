# FitAgent

FitAgent is an AI personal fitness coach for personalized workout planning, progress tracking, and habit formation. The project started as PostureFit AI, a posture and body-shape workout demo, and is now structured as an agent-style MVP for a course project.

The current product provides general fitness guidance only. It is not a medical diagnosis, treatment plan, or emergency service. Users with pain, injury, chronic disease, pregnancy, or severe posture problems should consult a qualified professional.

## Product Overview

FitAgent helps beginners, students, and light fitness users turn goals, body data, equipment, injuries, and weekly availability into a practical workout plan. Instead of a one-time chatbot answer, the product is designed as a continuous coaching agent that can remember user context, track completed workouts, adjust recommendations, and generate weekly reviews.

## Target Users

- Fitness beginners who do not know how to build a safe weekly plan.
- Students and busy users who need simple home or gym routines.
- Users with posture, body-shape, fat-loss, or habit-formation goals.
- Indie product users who prefer conversational guidance over complex fitness apps.

## Core Pain Points

- Generic workout plans ignore user level, schedule, equipment, and injury notes.
- Fitness beginners often cannot judge training risk or intensity.
- Existing apps can be either too manual, too broad, or too expensive.
- One-off chatbot answers do not remember progress or adapt over time.

## Solution

FitAgent combines rule-based workout planning with an agent workflow:

1. Collect and normalize the user profile.
2. Route the user request through an orchestrator.
3. Generate a structured weekly workout plan.
4. Run a basic safety check.
5. Add conservative nutrition and habit suggestions.
6. Store useful long-term memories.
7. Track workout completion and summarize progress.

## MVP Features

Implemented:

- FastAPI backend with SQLite persistence.
- User profile creation.
- Problem-to-muscle rule mapping.
- Home, gym, and mixed weekly plan generation.
- Exercise library with 30+ movements.
- Editable weekly plans.
- Workout completion logs.
- Agent-style explanation layer.
- Modular agent package: orchestrator, profile agent, workout planner, nutrition planner, safety checker, progress tracker, and memory manager.
- SQLite-backed agent memory and LLM call logs.
- `/api/agent/run` workflow endpoint.
- Plain HTML/CSS/JavaScript frontend.

Partially implemented:

- Long-term memory exists in SQLite, but semantic retrieval and vector search are future work.
- LLM integration points are reserved, but the current workflow uses local deterministic logic and mock LLM logging.
- Progress adaptation gives rule-based suggestions, but automatic plan rewriting from feedback is still basic.

Designed only:

- 100,000-level concurrency architecture.
- Redis semantic cache.
- Message queue workers.
- LLM provider pool and circuit breaker.
- Production monitoring stack.
- Vector database memory retrieval.

## Agent Workflow

```text
User request
-> Orchestrator Agent
-> Profile Agent
-> Memory Manager
-> Intent routing
-> Workout Planner / Nutrition Planner / Progress Tracker
-> Safety Checker
-> Response + memory write + LLM call log
```

Main intents:

- `generate_workout_plan`
- `record_feedback`
- `weekly_review`
- `nutrition_advice`
- `general_fitness_question`

## Tech Stack

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Pytest
- Plain HTML, CSS, JavaScript

## Local Setup

macOS / Linux:

```bash
cd posturefit-ai
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn pydantic sqlalchemy pytest
python seed_data.py
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Windows PowerShell:

```powershell
cd posturefit-ai
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn pydantic sqlalchemy pytest
python seed_data.py
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Open:

```text
http://127.0.0.1:8000/
```

Run tests:

```bash
pytest
```

## Optional LLM Setup

FitAgent works without a model key by using the local rule-based agent. To enable the LLM-powered coaching layer, set these environment variables locally or in Render:

```text
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
```

The model is used for intent understanding and coaching explanations. Workout selection and safety boundaries still come from the deterministic planner and safety checker.

For an OpenAI-compatible proxy, keep `LLM_PROVIDER=openai`, put the proxy card/key in `OPENAI_API_KEY`, and set `OPENAI_BASE_URL` to the proxy's OpenAI-compatible endpoint.

For DeepSeek, either use the explicit provider:

```text
LLM_PROVIDER=deepseek
LLM_MODEL=deepseek-chat
DEEPSEEK_API_KEY=your_deepseek_key
LLM_DISPLAY_NAME=DeepSeek
```

or keep the generic OpenAI-compatible style:

```text
LLM_PROVIDER=openai
LLM_MODEL=deepseek-chat
OPENAI_API_KEY=your_deepseek_key
OPENAI_BASE_URL=https://api.deepseek.com
LLM_DISPLAY_NAME=DeepSeek
```

OpenAI-compatible providers use Chat Completions by default so the fitness assistant chat works with DeepSeek and common proxy services.

Missing exercise PNGs can also be generated automatically when the same OpenAI key is available. Optional overrides:

```text
IMAGE_GENERATION_PROVIDER=openai
IMAGE_MODEL=gpt-image-1
IMAGE_QUALITY=medium
IMAGE_SIZE=1024x1024
```

If `IMAGE_GENERATION_PROVIDER` is not set, FitAgent reuses `LLM_PROVIDER`. Generated files are cached in `frontend/assets/exercises/`, and the frontend falls back to the local illustration if image generation is unavailable.

## API Examples

Create a user:

```bash
curl -X POST http://127.0.0.1:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","age":28,"sex":"female","height_cm":168,"weight_kg":62,"fitness_level":"beginner","goal":"posture_improvement","injury_notes":""}'
```

Generate a plan through the original planner endpoint:

```bash
curl -X POST http://127.0.0.1:8000/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"problem":"I have knock knees and want to improve lower body alignment.","weekly_frequency":3,"session_minutes":30,"scenario":"home"}'
```

Run the new agent workflow:

```bash
curl -X POST http://127.0.0.1:8000/api/agent/run \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"message":"Create a 3 day home workout plan for rounded shoulders","weekly_frequency":3,"session_minutes":30,"scenario":"home"}'
```

Other endpoints:

```text
GET  /
POST /api/users
GET  /api/users/{user_id}
POST /api/generate-plan
POST /api/agent/run
GET  /api/plans/{plan_id}
PUT  /api/plans/{plan_id}
POST /api/workout-logs
GET  /api/workout-logs/{user_id}
GET  /api/health
```

## Project Structure

```text
posturefit-ai/
  agents/                  Agent workflow modules
  docs/                    Course-ready product, architecture, and business docs
  frontend/                Plain web frontend and assets
  tests/                   Pytest tests
  app.py                   FastAPI app and API routes
  database.py              SQLAlchemy models and SQLite setup
  recommendation_engine.py Rule-based workout planner
  schemas.py               Pydantic request/response models
  seed_data.py             Local database bootstrap helper
```

## Safety Boundaries

- FitAgent does not provide medical diagnosis.
- Training plans are general wellness guidance.
- Pain, injury, chronic disease, pregnancy, dizziness, numbness, or severe symptoms should be handled by qualified professionals.
- High-risk requests such as extreme weight loss or overtraining should be refused or redirected to safer guidance.

## Roadmap

Near term:

- Add plan adjustment from feedback logs.
- Add weekly review UI.
- Add basic charts for completion and consistency.
- Improve Chinese localization encoding.

Future work:

- Real LLM provider integration with prompt logging and fallback.
- Redis cache and semantic cache.
- Vector memory retrieval.
- Message queue workers for weekly reports.
- Authentication and multi-user dashboards.
- Production observability and cost controls.

## Documentation

- [Database schema](docs/database_schema.md)
- [中文 Agent 讲解报告](docs/agent_explanation_report_zh.md)
- [Architecture design](docs/architecture_design.md)
- [System design diagrams](docs/system_design_diagram.md)
- [Business plan](docs/business_plan.md)
- [Competitor analysis](docs/competitor_analysis.md)
- [Roadshow PPT outline](docs/roadshow_ppt_outline.md)
- [Prompts used](docs/prompts_used.md)

## Asset Attribution

- Muscle model path data: `frontend/assets/muscle-body-data.js`
- Source: `react-muscle-highlighter` by soroojshehryar
- Repository: https://github.com/soroojshehryar/react-muscle-highlighter
- License: MIT
- Training-focus photos: `frontend/assets/focus/*.png`
- Source: AI-generated project assets created for this MVP
