# Prompts Used

This file records representative prompts used to shape the course project. It does not claim external experiments, real users, or production results.

## Startup Idea Prompt

```text
Design a profitable indie startup concept based on an AI personal fitness coach for beginners. The product should solve a real beginner pain point, avoid medical claims, and support personalized workout planning, progress tracking, and habit formation.
```

## Business Plan Prompt

```text
Write a business plan for FitAgent, an AI personal fitness coach. Include problem, target users, solution, product features, market opportunity as assumptions, business model, pricing, go-to-market, competitive advantage, risks, roadmap, and LLM system used. Do not invent real revenue, users, or traction.
```

## Competitor Analysis Prompt

```text
Compare FitAgent with ChatGPT, MyFitnessPal, Fitbod, Nike Training Club, Keep, and Freeletics. Use the dimensions Product, Target User, Core Features, Pricing Model, Strengths, Weaknesses, and Difference from FitAgent. Emphasize convenience, personalization, long-term memory, feedback-driven adjustment, and beginner focus.
```

## Architecture Design Prompt

```text
Create an industrial-grade architecture design for FitAgent. Include product overview, functional and non-functional requirements, 100,000-level concurrency design, high-level architecture, LLM engine, agent orchestration, data processing, database design, cache, message queue, monitoring, security, failure handling, deployment, and cost control. Clearly separate implemented MVP features from planned future work.
```

## System Design Diagram Prompt

```text
Write Mermaid diagrams for FitAgent covering overall system architecture, agent workflow, data flow, and 100k concurrency handling. The architecture should include Client, CDN/Nginx, API Gateway, Load Balancer, Application Service Cluster, LLM Orchestrator, LLM Provider Pool, Redis Cache, PostgreSQL, Vector Database, Message Queue, and Monitoring System.
```

## Code Refactoring Prompt

```text
Read the existing FastAPI and SQLite project before editing. Do not delete working features. Add modular agent components for orchestration, profile management, workout planning, nutrition guidance, safety checking, progress tracking, and memory. Extend the database with agent-oriented tables and add focused tests for the new workflow.
```
