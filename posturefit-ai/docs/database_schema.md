# FitAgent Database Schema

This document separates the implemented SQLite MVP from the planned production database. The current app uses SQLite through SQLAlchemy. A production version would move core relational data to PostgreSQL and keep vector memory in a vector database.

## Implemented SQLite Tables

### users

Stores the account-level user record and the basic profile fields used by the existing MVP.

Fields:

- `id`: primary key.
- `name`: display name.
- `age`: user age.
- `sex`: gender or sex label from the current UI.
- `height_cm`: height in centimeters.
- `weight_kg`: weight in kilograms.
- `fitness_level`: beginner, intermediate, or advanced.
- `goal`: high-level goal such as posture improvement or fat loss.
- `injury_notes`: free-text safety context.
- `created_at`: creation timestamp.

### user_profiles

Stores the normalized agent profile. It overlaps with `users` for MVP compatibility, but gives the agent system a stable extension point.

Fields:

- `id`: primary key.
- `user_id`: foreign key to `users`.
- `age`: normalized age.
- `gender`: normalized gender.
- `height_cm`: normalized height.
- `weight_kg`: normalized weight.
- `fitness_goal`: user goal.
- `training_level`: experience level.
- `weekly_frequency`: preferred sessions per week.
- `available_equipment`: equipment list.
- `injuries`: injury or pain notes.
- `diet_preference`: nutrition preference.
- `training_experience`: free-text training background.
- `created_at`, `updated_at`: timestamps.

### plans

Existing workout plan table used by the original `/api/generate-plan` endpoint.

Fields:

- `id`: primary key.
- `user_id`: owner.
- `problem`: original user request.
- `problem_analysis`: rule-engine analysis.
- `target_muscles`: JSON text list.
- `training_focus`: JSON text list.
- `scenario`: home, gym, or mixed.
- `weekly_frequency`: sessions per week.
- `session_minutes`: average session length.
- `agent_summary`: natural language explanation.
- `disclaimer`: safety disclaimer.
- `created_at`, `updated_at`: timestamps.

### plan_days

Stores each day in a generated weekly plan.

Fields:

- `id`: primary key.
- `plan_id`: parent plan.
- `day_number`: day order.
- `title`: day title.
- `warmup`: warmup text.
- `cooldown`: cooldown text.

### plan_exercises

Stores each exercise in a plan day.

Fields:

- `id`: primary key.
- `day_id`: parent day.
- `exercise_ref_id`: internal exercise library id.
- `name`: exercise name.
- `target_muscles`: JSON text list.
- `sets`: set count.
- `reps_or_duration`: reps or time.
- `rest_seconds`: rest interval.
- `instruction`: movement instructions.
- `safety_note`: exercise-level safety note.
- `sort_order`: exercise order.

### workout_plans

Agent-oriented structured plan snapshot. This is implemented as a table boundary for future richer workflow persistence, while the current UI still reads from `plans`.

Fields:

- `id`: primary key.
- `user_id`: owner.
- `source_plan_id`: optional link to `plans`.
- `status`: draft, active, completed, or archived.
- `goal`: plan goal.
- `plan_json`: full structured plan JSON.
- `safety_review_json`: safety review JSON.
- `created_by_agent`: planner module name.
- `created_at`, `updated_at`: timestamps.

### workout_logs

Stores completed workouts.

Fields:

- `id`: primary key.
- `user_id`: owner.
- `plan_id`: optional related plan.
- `day_number`: completed plan day.
- `notes`: completion notes.
- `completed_at`: completion timestamp.

### chat_sessions

Stores agent conversation sessions.

Fields:

- `id`: primary key.
- `user_id`: owner.
- `title`: session title.
- `channel`: web, mobile, API, or another channel.
- `status`: active or closed.
- `created_at`, `updated_at`: timestamps.

### agent_memory

Stores long-term memory for the MVP. It is intentionally simple and can later be replaced or complemented by vector search.

Fields:

- `id`: primary key.
- `user_id`: owner.
- `memory_type`: preference, safety, feedback, habit, or system.
- `key`: memory key.
- `value`: memory text.
- `confidence`: confidence score.
- `source`: source module or workflow.
- `created_at`, `updated_at`: timestamps.

### feedback_logs

Stores user feedback that can drive future plan adjustment.

Fields:

- `id`: primary key.
- `user_id`: owner.
- `plan_id`: optional related plan.
- `rating`: optional numeric rating.
- `energy_level`: low, medium, high, or similar.
- `soreness_level`: low, medium, high, or similar.
- `feedback_text`: user feedback.
- `agent_action`: action taken by the agent.
- `created_at`: timestamp.

### llm_call_logs

Stores LLM or local-agent call metadata. The current app logs local orchestrator calls; production would include real provider and token data.

Fields:

- `id`: primary key.
- `user_id`: optional owner.
- `session_id`: optional chat session.
- `provider`: local_mock, OpenAI, Anthropic, or another provider.
- `model`: model name.
- `prompt_type`: workflow prompt category.
- `prompt_tokens`: input tokens.
- `completion_tokens`: output tokens.
- `latency_ms`: latency.
- `status`: success, fallback, or failed.
- `error_message`: failure detail.
- `created_at`: timestamp.

## Production Notes

Designed only:

- PostgreSQL for relational data.
- Redis for sessions, rate limits, and semantic cache.
- Vector database for embeddings and memory retrieval.
- Object storage for exported reports.
- Event stream or message queue for asynchronous weekly review generation.
