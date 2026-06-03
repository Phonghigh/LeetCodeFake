# LeetCode Clone — Portfolio Judge System

A production-like online judge system built to demonstrate real-world backend architecture: microservices, sandboxed code execution, async job queues, and real-time WebSocket results.

## Architecture

```
┌──────────────┐     HTTP      ┌──────────────┐     SQL      ┌──────────────┐
│  Next.js     │ ───────────▶  │  api-service │ ──────────▶  │  PostgreSQL  │
│  Frontend    │               │  (Spring)    │              └──────────────┘
└──────────────┘               └──────┬───────┘
        ▲                             │ Redis Queue
        │ WebSocket                   ▼
        │                      ┌──────────────┐     Docker   ┌──────────────┐
        └──────────────────────│ judge-service│ ──────────▶  │  Sandbox     │
                               │  (Worker)    │              │  Container   │
                               └──────────────┘              └──────────────┘
```

## Repository Structure

```
leetcode-clone/
├── frontend-nextjs/        # Next.js + Monaco Editor
├── api-service/            # Spring Boot REST API
├── judge-service/          # Judge Worker (Redis consumer)
├── docker-images/          # Sandbox Dockerfiles per language
│   ├── java/
│   ├── python/
│   └── cpp/
├── infrastructure/
│   ├── postgres/
│   ├── redis/
│   └── docker-compose.yml
└── docs/
    ├── erd.md
    └── api.md
```

## Domain Model

| Entity     | Key Fields                                                         |
|------------|--------------------------------------------------------------------|
| User       | id, username, email, password, role, created_at                    |
| Problem    | id, title, difficulty, description, constraints, created_at        |
| TestCase   | id, problem_id, input, expected_output, is_hidden                  |
| Submission | id, user_id, problem_id, language, source_code, status, runtime, memory, created_at |

**Submission status flow:** `PENDING` → `RUNNING` → `Accepted` / `Wrong Answer` / `TLE` / `MLE` / `Compilation Error` / `Runtime Error`

## API Endpoints

### Auth
```
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Problems
```
GET  /problems
GET  /problems/{id}
POST /problems          (ADMIN)
PUT  /problems/{id}     (ADMIN)
```

### Submissions
```
POST /submissions
GET  /submissions/{id}
GET  /submissions/me
```

## Judge Flow

1. User submits code → API saves `Submission` with status `PENDING`
2. API pushes `{ "submissionId": 123 }` to Redis queue
3. Judge Worker dequeues the job
4. Worker spins up a Docker sandbox container
5. Writes `Main.java` (or equivalent), compiles, runs each test case
6. Captures stdout, compares with expected output
7. Updates Submission status in DB
8. Pushes result over WebSocket to frontend

## Sandbox Security

```bash
docker run \
  --memory=128m \
  --cpus=1 \
  --network=none \
  --rm \
  judge-java
```

Inside container:
```bash
timeout 2s java Main < input.txt
```

Handles: infinite loops (TLE), memory bombs (MLE), network access attempts.

## Language Support

| Language | Image         | Status  |
|----------|---------------|---------|
| Java     | judge-java    | Phase 1 |
| Python   | judge-python  | Phase 2 |
| C++      | judge-cpp     | Phase 2 |

Backed by a `LanguageExecutor` interface:
```java
interface LanguageExecutor {
    ExecutionResult execute(Submission submission, TestCase testCase);
}
// Implementations: JavaExecutor, PythonExecutor, CppExecutor
```

## Roadmap

| Week | Goal                                      |
|------|-------------------------------------------|
| 1    | ERD, API design, PostgreSQL schema        |
| 2    | Spring Boot CRUD, JWT auth                |
| 3    | Next.js UI, Monaco Editor integration     |
| 4    | Submission API                            |
| 5    | Docker sandbox, Java judge (MVP)          |
| 6    | Redis queue, Judge Worker                 |
| 7    | WebSocket real-time results               |
| 8    | Python support, hidden test cases, deploy |

## Portfolio Highlights

- **Sandboxed execution** — Docker with memory/CPU/network constraints, process timeout
- **Async judge pipeline** — Redis queue decouples API from CPU-bound judge work
- **Real-time feedback** — WebSocket pushes verdict without polling
- **Extensible language support** — Strategy pattern for multi-language execution
- **Hidden test cases** — Visible samples vs. hidden judge cases like real OJs
- **AI Code Review** (planned) — Post-submission complexity analysis via RAG pipeline

## Tech Stack

| Layer       | Technology                       |
|-------------|----------------------------------|
| Frontend    | Next.js, Monaco Editor           |
| API         | Spring Boot, Spring Security, JWT|
| Database    | PostgreSQL                       |
| Queue       | Redis                            |
| Judge       | Java Worker, Docker SDK          |
| Sandbox     | Docker (eclipse-temurin, python, gcc) |
| Real-time   | WebSocket (STOMP)                |

## Getting Started

```bash
# Start infrastructure
cd infrastructure
docker compose up -d

# Start API
cd api-service
./mvnw spring-boot:run

# Start Judge Worker
cd judge-service
./mvnw spring-boot:run

# Start Frontend
cd frontend-nextjs
npm install && npm run dev
```
