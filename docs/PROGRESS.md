# Progress

Currently on: **Phase 3 — Auth (Spring Security + JWT), finishing**

Build phases follow `docs/backend-plan.md`.

## Phases

- [x] **Phase 0 — Setup & Tooling** — Spring Boot project, Maven starters, docker-compose (Postgres + Redis)
- [x] **Phase 1 — Database Layer (JPA + Flyway)** — entities, repositories, Flyway migrations, `ddl-auto: validate`
- [x] **Phase 2 — REST API Layer (CRUD)** — `ProblemController` CRUD, DTO records, `GlobalExceptionHandler` (partial)
- [x] **Phase 3 — Auth (Spring Security + JWT)** — register/login/me, `JwtAuthFilter`, `SecurityConfig`, `User implements UserDetails`, Redis refresh tokens *(done)*; **open:** `@PreAuthorize` admin check, validation/conflict exception handling, jjwt 0.12 API migration
- [x] **Phase 4 — Submission API + Redis Producer**
- [x] **Phase 5 — Judge Worker + Docker Sandbox**
- [ ] **Phase 6 — WebSocket Real-time**

## Open threads in the current phase (Phase 3)

1. Method-level authorization — add `@EnableMethodSecurity` + `@PreAuthorize("hasRole('ADMIN')")` on `POST /problems` (HW-3B).
2. Exception handling — `register()` throws raw `IllegalArgumentException` (→ 500); should be a 409 conflict. No `MethodArgumentNotValidException` handler yet (→ validation errors don't return 400 with field messages).
3. jjwt API — currently the deprecated 0.11-style (`parserBuilder()`, `setSubject()`, `SignatureAlgorithm.HS256`); the plan targets 0.12.x (`Jwts.parser().verifyWith()`, `.subject()`).
