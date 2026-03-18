# Traceability Matrix — MicroBlog Platform

> Every user story traces to: functional requirements → developer tasks → test cases
> Status: Planned | In Progress | In Review | Done | Blocked

---

## AUTH — Registration & Sign In

| User Story | Functional Requirement            | Dev Task(s)                        | Test Case(s)                               | Iteration | Status  |
|------------|-----------------------------------|------------------------------------|---------------------------------------------|-----------|---------|
| US-MB-001  | FR-MB-001 (create account)        | DEV-MB-001, DEV-MB-002             | TC-AUTH-001                                 | 1         | Planned |
| US-MB-001  | FR-MB-002 (email exists → 409)    | DEV-MB-002                         | TC-AUTH-006                                 | 1         | Planned |
| US-MB-001  | FR-MB-003 (username taken → 409)  | DEV-MB-002                         | (SC-AUTH-009 → TC to add)                   | 1         | Planned |
| US-MB-001  | FR-MB-008 (no plaintext password) | DEV-MB-002                         | TC-AUTH-007 (no pass in response)           | 1         | Planned |
| US-MB-001  | Username BVA                      | DEV-MB-002                         | TC-AUTH-002, TC-AUTH-003, TC-AUTH-004, TC-AUTH-005 | 1  | Planned |
| US-MB-002  | FR-MB-004 (signin → tokens)       | DEV-MB-003                         | TC-AUTH-008                                 | 1         | Planned |
| US-MB-002  | FR-MB-005 (generic error message) | DEV-MB-003                         | TC-AUTH-009                                 | 1         | Planned |
| US-MB-002  | FR-MB-006 (lockout after 5 fails) | DEV-MB-003                         | TC-AUTH-010                                 | 2         | Planned |
| US-MB-002  | NFR-SEC-006 (rate limit auth)     | DEV-MB-006                         | (rate limit integration test)               | 2         | Planned |
| US-MB-003  | FR-MB-007 (signout → invalidate)  | DEV-MB-004                         | TC-AUTH-011                                 | 1         | Planned |

---

## PROFILE — View & Edit

| User Story | Functional Requirement                     | Dev Task(s)                        | Test Case(s)                        | Iteration | Status  |
|------------|--------------------------------------------|------------------------------------|--------------------------------------|-----------|---------|
| US-MB-004  | FR-MB-009 (serve public profile)           | DEV-MB-010                         | (SC-PROFILE-001, 002, 008)           | 2         | Planned |
| US-MB-005  | FR-MB-010 (update profile fields)          | DEV-MB-011                         | (SC-PROFILE-003, 004, 005)           | 2         | Planned |
| US-MB-005  | FR-MB-011 (bio > 160 → 400)               | DEV-MB-011                         | (SC-PROFILE-004, 005)                | 2         | Planned |
| US-MB-005  | FR-MB-012 (avatar → CDN URL)               | DEV-MB-012                         | (SC-PROFILE-006, 007)                | 2         | Planned |
| US-MB-011  | FR-MB-009 (follower/following lists)       | DEV-MB-031                         | (SC-PROFILE-001)                     | 2         | Planned |

---

## POSTS — Create, Delete, Reply

| User Story | Functional Requirement                        | Dev Task(s)                        | Test Case(s)                          | Iteration | Status  |
|------------|-----------------------------------------------|------------------------------------|---------------------------------------|-----------|---------|
| US-MB-006  | FR-MB-013 (create post 1–280 chars)           | DEV-MB-014, DEV-MB-015             | TC-POST-001, TC-POST-002              | 3         | Planned |
| US-MB-006  | FR-MB-014 (body > 280 → 400)                  | DEV-MB-015                         | TC-POST-003                           | 3         | Planned |
| US-MB-006  | FR-MB-015 (empty body → 400)                  | DEV-MB-015                         | TC-POST-004, TC-POST-005              | 3         | Planned |
| US-MB-006  | FR-MB-018 (fan-out within 5s)                 | DEV-MB-020                         | TC-POST-007 (fan-out side effect)     | 3         | Planned |
| US-MB-006  | NFR-SEC-007 (100 posts/hr rate limit)         | DEV-MB-019                         | (rate limit integration test)         | 3         | Planned |
| US-MB-007  | FR-MB-016 (delete own post)                   | DEV-MB-016                         | TC-POST-007                           | 3         | Planned |
| US-MB-007  | FR-MB-017 (delete other's post → 403)         | DEV-MB-016                         | TC-POST-008                           | 3         | Planned |
| US-MB-007  | NFR-COMP-002 (deleted post purged everywhere) | DEV-MB-016, DEV-MB-020             | TC-POST-007 (side effects)            | 3         | Planned |
| US-MB-008  | FR-MB-013 (reply via parentPostId)            | DEV-MB-018                         | (SC-POST-011, 012)                    | 3         | Planned |
| US-MB-014  | FR-MB-029 (post detail + replies)             | DEV-MB-017                         | (SC-TIMELINE-008)                     | 3         | Planned |

---

## LIKE — Like & Unlike

| User Story | Functional Requirement                      | Dev Task(s)               | Test Case(s)         | Iteration | Status  |
|------------|---------------------------------------------|---------------------------|----------------------|-----------|---------|
| US-MB-009  | FR-MB-019 (like → count +1)                 | DEV-MB-025, DEV-MB-026    | TC-LIKE-001          | 5         | Planned |
| US-MB-009  | FR-MB-020 (unlike → count -1)               | DEV-MB-027                | TC-LIKE-002          | 5         | Planned |
| US-MB-009  | FR-MB-021 (duplicate like → 409)            | DEV-MB-026                | TC-LIKE-003          | 5         | Planned |

---

## FOLLOW — Follow & Unfollow

| User Story | Functional Requirement                        | Dev Task(s)               | Test Case(s)             | Iteration | Status  |
|------------|-----------------------------------------------|---------------------------|--------------------------|-----------|---------|
| US-MB-010  | FR-MB-022 (follow user)                       | DEV-MB-028, DEV-MB-029    | TC-FOLLOW-001            | 5         | Planned |
| US-MB-010  | FR-MB-023 (unfollow user)                     | DEV-MB-030                | TC-FOLLOW-004            | 5         | Planned |
| US-MB-010  | FR-MB-024 (self-follow → 403)                 | DEV-MB-029                | TC-FOLLOW-002            | 5         | Planned |
| US-MB-010  | FR-MB-025 (duplicate follow → 409)            | DEV-MB-029                | TC-FOLLOW-003            | 5         | Planned |

---

## TIMELINE & DISCOVERY

| User Story | Functional Requirement                          | Dev Task(s)               | Test Case(s)                     | Iteration | Status  |
|------------|--------------------------------------------------|---------------------------|----------------------------------|-----------|---------|
| US-MB-012  | FR-MB-026 (home timeline paginated)             | DEV-MB-033, DEV-MB-034    | TC-TIMELINE-001, 002, 003, 005   | 4         | Planned |
| US-MB-013  | FR-MB-027 (explore feed — public)               | DEV-MB-035                | TC-TIMELINE-004                  | 4         | Planned |
| US-MB-013  | FR-MB-028 (search posts + users)                | DEV-MB-036                | (SC-TIMELINE-006, 007)           | 4         | Planned |

---

## NOTIFICATIONS

| User Story | Functional Requirement                           | Dev Task(s)               | Test Case(s)    | Iteration | Status  |
|------------|--------------------------------------------------|---------------------------|-----------------|-----------|---------|
| US-MB-015  | FR-MB-030 (notify on like)                       | DEV-MB-040, DEV-MB-041    | TC-NOTIF-001    | 5         | Planned |
| US-MB-015  | FR-MB-031 (notify on reply)                      | DEV-MB-041                | (SC-NOTIF-002)  | 5         | Planned |
| US-MB-015  | FR-MB-032 (notify on follow)                     | DEV-MB-041                | (SC-NOTIF-003)  | 5         | Planned |
| US-MB-015  | FR-MB-033 (list notifications, unread flag)      | DEV-MB-042                | TC-NOTIF-002    | 5         | Planned |

---

## NFR Coverage

| NFR          | Requirement Summary                          | Dev Task           | Verified by                   | Iteration |
|--------------|----------------------------------------------|--------------------|-------------------------------|-----------|
| NFR-PERF-001 | API ≤300ms p95 at 200 concurrent users       | —                  | k6 load test                  | 6         |
| NFR-PERF-002 | Timeline from Redis cache (no real-time JOIN)| DEV-MB-034         | Integration test               | 4         |
| NFR-PERF-003 | Fan-out ≤5s for ≤10k followers               | DEV-MB-020         | k6 custom scenario             | 3         |
| NFR-PERF-004 | Avatar CDN TTL ≥ 7 days                      | DEV-MB-012         | curl header check              | 2         |
| NFR-SEC-001  | bcrypt cost ≥ 12                             | DEV-MB-002         | TC-AUTH-007 (hash not in resp) | 1         |
| NFR-SEC-002  | JWT HS256, 1h TTL                            | DEV-MB-003         | TC-AUTH-011                    | 1         |
| NFR-SEC-003  | Refresh token ≥32 bytes, stored as hash      | DEV-MB-003         | Code review                    | 1         |
| NFR-SEC-004  | HTTPS only (301 redirect)                    | Config / Helmet    | curl http check                | 6         |
| NFR-SEC-005  | CORS — allowed origins only                  | Helmet/CORS config | curl from bad origin           | 6         |
| NFR-SEC-006  | Auth rate limit 10 req/IP/min                | DEV-MB-006         | Integration test               | 2         |
| NFR-SEC-007  | Post rate limit 100/hr/member                | DEV-MB-019         | Integration test               | 3         |
| NFR-REL-001  | 99.9% monthly availability                   | Health check + monitoring | Uptime tool             | 6         |
| NFR-REL-002  | Fan-out async; failure doesn't block post    | DEV-MB-020         | TC-POST-006 (post still 201)   | 3         |
| NFR-SCALE-001| Fan-out-on-write model for 10k followers     | DEV-MB-020         | Load test                      | 3         |
| NFR-SCALE-002| Read replicas for timeline + explore         | Config             | Architecture review            | 6         |
| NFR-COMP-001 | Auth attempts logged (no password in logs)   | DEV-MB-002–003     | Log grep check                 | 1         |
| NFR-COMP-002 | Deleted posts purged from all stores         | DEV-MB-016, 020    | TC-POST-007                    | 3         |
| NFR-COMP-003 | Email/IP not in public API response          | DEV-MB-010, 035    | SC-PROFILE-008, TC-TIMELINE-004| 2, 4      |
| NFR-MAINT-001| Rate limits configurable via env var         | DEV-MB-006, 019    | .env test                      | 6         |
| NFR-MAINT-002| Fan-out worker independently deployable      | DEV-MB-020, 045    | docker compose scale           | 3         |
