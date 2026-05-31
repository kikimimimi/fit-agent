# FitAgent Architecture Design

## 1. Product Overview

FitAgent is an AI personal fitness coach for personalized workout planning, progress tracking, and habit formation. It is aimed at beginners, students, and light fitness users who need safe, repeatable, and adaptive training guidance.

Current state: FastAPI, SQLite, rule-based workout planning, frontend wizard, workout logs, and modular agent workflow.

Future state: production AI agent product with scalable serving, LLM fallback, semantic memory, monitoring, and cost controls.

## 2. Functional Requirements

- Create and maintain user profiles.
- Generate structured weekly workout plans.
- Support home, gym, and mixed scenarios.
- Record workout completion.
- Record feedback and safety concerns.
- Provide basic nutrition habit guidance.
- Generate weekly progress reviews.
- Remember user preferences and safety context.
- Log LLM or local-agent calls.

## 3. Non-functional Requirements

- Low latency for simple rule-based requests.
- Graceful degradation when LLM providers fail.
- Clear safety boundaries for health guidance.
- Privacy-aware handling of health-related user data.
- Horizontal scalability for future high concurrency.
- Observability for latency, errors, token cost, and user retention.

## 4. 100,000-level Concurrency Design

The MVP does not support 100,000 concurrent users today. The following is the production design.

Request path:

```text
Client
-> CDN / Nginx
-> API Gateway
-> Load Balancer
-> Application Service Cluster
-> LLM Orchestrator
-> LLM Provider Pool
-> Redis Cache
-> PostgreSQL
-> Vector Database
-> Message Queue
-> Monitoring System
```

High concurrency modules:

- CDN for static frontend assets.
- Nginx for TLS termination, compression, and request buffering.
- API Gateway for authentication, quota, request validation, and routing.
- Load Balancer for distributing API traffic.
- Horizontal Scaling with stateless FastAPI services.
- Redis Cache for sessions, hot plans, rate limits, and idempotency keys.
- Semantic Cache for repeated common fitness questions.
- Message Queue for weekly reports, feedback processing, and analytics.
- Async Task Workers for long-running LLM tasks.
- Rate Limiting by user, IP, and plan tier.
- Circuit Breaker for LLM provider failures.
- LLM Fallback to smaller, cheaper, or cached responses.

Capacity approach:

- Keep synchronous API work short.
- Move complex reports to background workers.
- Use read replicas for heavy analytics reads.
- Cache common content and common explanations.
- Use streaming or polling for long LLM responses.
- Separate public API traffic from worker traffic.

## 5. High-level Architecture

FitAgent has four layers:

- Client layer: web frontend and future mobile app.
- API layer: FastAPI services and API gateway.
- Agent layer: orchestrator, planner, safety, nutrition, progress, and memory modules.
- Data layer: relational database, cache, vector memory, queue, logs, and monitoring.

## 6. LLM Engine Design

Implemented:

- Local deterministic planner and mock LLM call logging.
- Environment-variable placeholders for future LLM provider keys.

Designed only:

- Provider pool with primary and fallback models.
- Prompt templates by workflow type.
- Token budget and max-output controls.
- Prompt and response logging with privacy filtering.
- Semantic cache for common questions.
- Evaluation set for safety and plan quality.

## 7. Agent Orchestration Design

Implemented modules:

- `OrchestratorAgent`: detects intent and routes the workflow.
- `ProfileAgent`: normalizes profile data.
- `WorkoutPlanner`: wraps the rule-based recommendation engine.
- `NutritionPlanner`: returns conservative habit-level guidance.
- `SafetyChecker`: flags obvious risk patterns.
- `ProgressTracker`: summarizes workout logs.
- `MemoryManager`: stores and retrieves SQLite memories.

Workflow:

```text
Input -> Intent Detection -> Profile Context -> Memory Retrieval
-> Tool Selection -> Safety Review -> Memory Write -> Response
```

## 8. Data Processing Module

Current processing:

- Rule matching maps user text to target muscles.
- Exercise filtering uses scenario and fitness level.
- Weekly plans are generated from exercise cycles.
- Agent workflow adds memory, safety, and nutrition context.

Future processing:

- Feedback classification.
- Workout adherence scoring.
- Progress trend detection.
- Embedding-based retrieval for long-term memory.

## 9. Database Design

Implemented:

- SQLite tables for users, normalized profiles, plans, workout logs, agent memory, feedback logs, chat sessions, and LLM call logs.

Production design:

- PostgreSQL for relational records.
- Vector database for semantic memory.
- Redis for short-lived cache and rate limits.
- Data retention policy for logs and health-related notes.

See `docs/database_schema.md`.

## 10. Cache Design

Designed only:

- Redis session cache.
- User profile cache with short TTL.
- Plan generation idempotency cache.
- Semantic cache for common fitness Q&A.
- LLM response cache for safe, generic, non-personalized answers.

## 11. Message Queue Design

Designed only:

- Queue names: `weekly_review`, `feedback_analysis`, `llm_retry`, `analytics_events`.
- Workers generate weekly summaries, process feedback, retry failed LLM calls, and aggregate metrics.
- Dead-letter queues store repeated failures for inspection.

## 12. Monitoring and Operation Module

Metrics:

- Request latency.
- p95 and p99 latency.
- LLM token cost.
- Error rate.
- Failed LLM calls.
- User retention.
- Workout completion rate.
- Model fallback count.

Operational tools:

- Structured logs.
- Health checks.
- Dashboard alerts.
- Cost reports by provider and prompt type.
- Safety warning audit logs.

## 13. Security and Privacy

- Do not provide medical diagnosis.
- Ask users to consult professionals for pain, injury, chronic disease, pregnancy, or severe symptoms.
- Store health-related notes carefully.
- Apply authentication and authorization in production.
- Encrypt transport with HTTPS.
- Avoid logging unnecessary personal data in prompts.
- Support deletion/export of user data in future production versions.

## 14. Failure Handling and Fallback

- If one LLM fails, switch to a backup model.
- If all LLMs fail, return rule-based fallback guidance.
- If database writes fail, return a degraded result only when it is safe.
- During peak traffic, limit free-user requests.
- Generate complex weekly reports asynchronously.
- Cache common Q&A to reduce provider dependency.

## 15. Deployment Plan

MVP:

- Single FastAPI service.
- SQLite.
- Static frontend served by FastAPI.

Production:

- Dockerized API services.
- Nginx or managed ingress.
- PostgreSQL.
- Redis.
- Queue workers.
- Vector database.
- Object storage for reports.
- Monitoring stack.
- CI/CD pipeline with tests and migrations.

## 16. Cost Control

- Prefer rule-based tools for deterministic plan structure.
- Use LLMs for explanation, summarization, and coaching tone.
- Cache common answers.
- Limit prompt size with profile summaries.
- Use smaller fallback models for simple tasks.
- Track token cost per workflow.
- Run weekly reports asynchronously and batch low-priority jobs.

## Implementation Status

Implemented:

- Local API, database, planner, workout logs, and modular agent workflow.

Partially implemented:

- Memory, safety checks, progress review, and LLM logging.

Designed only:

- High-scale infrastructure, real provider pool, vector memory, Redis, message queues, and production monitoring.
