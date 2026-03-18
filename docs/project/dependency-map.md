# Dependency Map — MicroBlog Platform

## Critical Path

```
DEV-MB-045 (Docker)
    ↓
DEV-MB-001 (users table)
    ↓
DEV-MB-002 (register API) ──── DEV-MB-003 (signin API)
    ↓                                ↓
DEV-MB-005 (JWT middleware) ←────────┘
    ↓
DEV-MB-014 (posts table)
    ↓
DEV-MB-015 (create post API)
    ↓
DEV-MB-033 (Redis) ←── DEV-MB-020 (fan-out worker)
    ↓
DEV-MB-034 (timeline API)
    ↓
DEV-MB-037 (home timeline UI)
```

**Minimum delivery sequence:** Iter 1 → Iter 2 → Iter 3 → Iter 4 → Iter 5 → Iter 6

---

## Full Dependency Table

| Task        | Blocked By                              | Reason                                            | Blocks                                     |
|-------------|-----------------------------------------|---------------------------------------------------|--------------------------------------------|
| DEV-MB-045  | —                                       | Foundation — can start immediately                | All                                        |
| DEV-MB-001  | DEV-MB-045                              | Needs Postgres running                            | DEV-MB-002, 003, 009, 010, 014, 028, 040  |
| DEV-MB-033  | DEV-MB-045                              | Needs Redis running                               | DEV-MB-004, 019, 020, 034                 |
| DEV-MB-002  | DEV-MB-001                              | Needs users table                                 | DEV-MB-003, 007                           |
| DEV-MB-003  | DEV-MB-001                              | Needs users table                                 | DEV-MB-004, 005, 008                      |
| DEV-MB-004  | DEV-MB-003, DEV-MB-033                  | Needs token generation + Redis denylist           | —                                         |
| DEV-MB-005  | DEV-MB-003, DEV-MB-033                  | Needs JWT + Redis denylist                        | DEV-MB-015, 016, 017, 026, 027, 029, 030  |
| DEV-MB-006  | DEV-MB-002, DEV-MB-003                  | Applies rate limit to these endpoints             | —                                         |
| DEV-MB-007  | DEV-MB-002, DEV-MB-046                  | Needs register API + app layout                   | —                                         |
| DEV-MB-008  | DEV-MB-003, DEV-MB-046                  | Needs signin API + app layout                     | —                                         |
| DEV-MB-009  | DEV-MB-001                              | Needs users table for seed                        | All test files                            |
| DEV-MB-010  | DEV-MB-001, DEV-MB-014                  | Needs users + posts tables                        | DEV-MB-013                               |
| DEV-MB-011  | DEV-MB-001, DEV-MB-005                  | Needs users table + auth middleware               | DEV-MB-013                               |
| DEV-MB-012  | DEV-MB-001, DEV-MB-005                  | Needs users table + auth middleware               | DEV-MB-013                               |
| DEV-MB-013  | DEV-MB-010, 011, 012, DEV-MB-046        | Needs all profile APIs + layout                   | —                                         |
| DEV-MB-014  | DEV-MB-001                              | Needs users table (FK)                            | DEV-MB-015, 016, 017, 018, 025, 035       |
| DEV-MB-015  | DEV-MB-014, DEV-MB-005                  | Needs posts table + auth middleware               | DEV-MB-016, 018, 020                      |
| DEV-MB-016  | DEV-MB-014, DEV-MB-005                  | Needs posts table + auth                          | —                                         |
| DEV-MB-017  | DEV-MB-014                              | Needs posts table                                 | DEV-MB-023                               |
| DEV-MB-018  | DEV-MB-015                              | Extends create post                               | —                                         |
| DEV-MB-019  | DEV-MB-015, DEV-MB-033                  | Needs create post + Redis                         | —                                         |
| DEV-MB-020  | DEV-MB-014, DEV-MB-028, DEV-MB-033      | Needs posts table, follows table, Redis           | DEV-MB-034                               |
| DEV-MB-021  | DEV-MB-046                              | Needs app layout atoms                            | DEV-MB-023, 037, 038                      |
| DEV-MB-022  | DEV-MB-046                              | Needs app layout atoms                            | DEV-MB-023, 037                           |
| DEV-MB-023  | DEV-MB-021, 022, DEV-MB-017             | Needs PostCard, Compose + thread API              | —                                         |
| DEV-MB-024  | DEV-MB-009, DEV-MB-014                  | Needs auth fixtures + posts table                 | All post tests                            |
| DEV-MB-025  | DEV-MB-014                              | Needs posts table (FK)                            | DEV-MB-026, 027                           |
| DEV-MB-026  | DEV-MB-025, DEV-MB-005                  | Needs likes table + auth                          | DEV-MB-041                               |
| DEV-MB-027  | DEV-MB-025, DEV-MB-005                  | Needs likes table + auth                          | —                                         |
| DEV-MB-028  | DEV-MB-001                              | Needs users table (FK)                            | DEV-MB-029, 030, 031, 020                 |
| DEV-MB-029  | DEV-MB-028, DEV-MB-005                  | Needs follows table + auth                        | DEV-MB-041                               |
| DEV-MB-030  | DEV-MB-028, DEV-MB-005                  | Needs follows table + auth                        | —                                         |
| DEV-MB-031  | DEV-MB-028                              | Needs follows table                               | —                                         |
| DEV-MB-032  | DEV-MB-046                              | Needs app layout atoms                            | DEV-MB-013                               |
| DEV-MB-033  | DEV-MB-045                              | Needs Redis                                       | DEV-MB-034, 037, 039                      |
| DEV-MB-034  | DEV-MB-033, DEV-MB-005, DEV-MB-020      | Needs Redis timelines (fed by fan-out)            | DEV-MB-037                               |
| DEV-MB-035  | DEV-MB-014                              | Needs posts table                                 | DEV-MB-038                               |
| DEV-MB-036  | DEV-MB-014, DEV-MB-001                  | Needs posts + users tables                        | DEV-MB-038                               |
| DEV-MB-037  | DEV-MB-021, 022, DEV-MB-034, DEV-MB-046 | Needs PostCard, Compose, timeline API, layout     | —                                         |
| DEV-MB-038  | DEV-MB-035, 036, DEV-MB-021, DEV-MB-046 | Needs explore/search APIs + PostCard + layout     | —                                         |
| DEV-MB-039  | DEV-MB-034                              | Polls timeline API                                | —                                         |
| DEV-MB-040  | DEV-MB-014, DEV-MB-001                  | Needs posts + users tables (FK)                   | DEV-MB-041                               |
| DEV-MB-041  | DEV-MB-040, 026, 029                    | Needs notif table + like + follow events          | DEV-MB-042                               |
| DEV-MB-042  | DEV-MB-041, DEV-MB-005                  | Needs notification service + auth                 | DEV-MB-043, 044                           |
| DEV-MB-043  | DEV-MB-042, DEV-MB-046                  | Needs notif API + layout                          | —                                         |
| DEV-MB-044  | DEV-MB-042, DEV-MB-046                  | Needs notif count API + nav                       | —                                         |
| DEV-MB-046  | DEV-MB-007, DEV-MB-008                  | Auth forms must exist for redirect                | All page components                        |

---

## Parallelisable Work per Iteration

### Iteration 1
```
Track A (Backend):   DEV-MB-001 → DEV-MB-002 → DEV-MB-003 → DEV-MB-004 + DEV-MB-005
Track B (Infra):     DEV-MB-045 + DEV-MB-033 (in parallel)
Track C (Frontend):  DEV-MB-046 → DEV-MB-007 + DEV-MB-008 (parallel after layout)
```

### Iteration 3
```
Track A (Backend):   DEV-MB-014 → DEV-MB-015 → DEV-MB-020 (fan-out)
Track B (Frontend):  DEV-MB-021 + DEV-MB-022 (parallel, no backend dep)
                     → DEV-MB-023 (after both done)
```

### Iteration 5
```
Track A (Like):      DEV-MB-025 → DEV-MB-026 + DEV-MB-027
Track B (Follow):    DEV-MB-029 + DEV-MB-030 (follows table done in Iter 2)
Track C (Notif):     DEV-MB-040 → DEV-MB-041 → DEV-MB-042
Track D (Frontend):  DEV-MB-032 + DEV-MB-043 + DEV-MB-044 (all parallel after layout)
```

---

## Open Risks

| # | Risk                                             | Likelihood | Impact | Mitigation                                    |
|---|--------------------------------------------------|------------|--------|-----------------------------------------------|
| 1 | Fan-out performance degradation > 10k followers  | Medium     | High   | Load test early in Iter 3; consider hybrid fan-out strategy for high-follower accounts |
| 2 | PostgreSQL full-text search performance on explore | Medium   | Medium | Add tsvector index in Iter 4; fall back to ILIKE for MVP |
| 3 | Redis timeline list memory growth at scale       | Low        | Medium | LTRIM to 1000 items per timeline key in fan-out worker |
| 4 | S3/LocalStack parity issues in CI               | Low        | Medium | Use AWS SDK v3 with consistent endpoint config |
| 5 | BullMQ Redis connection sharing with token denylist | Low     | Low    | Use separate Redis DB numbers (db=0 queue, db=1 denylist) |
