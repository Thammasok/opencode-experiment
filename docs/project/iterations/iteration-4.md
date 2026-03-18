# Iteration 4 — Home Timeline, Explore Feed, and Search

**Goal:** Member sees a personalised home timeline from followed users. Explore feed and keyword search are available to all visitors.

**Stories in scope:** US-MB-012, US-MB-013
**Priority:** Must Have
**Duration:** 1 week

---

## Scenarios in Scope

| SC-ID           | Scenario                                                              | Type       |
|-----------------|-----------------------------------------------------------------------|------------|
| SC-TIMELINE-001 | Home timeline returns followed-user posts, newest first              | Functional |
| SC-TIMELINE-002 | Home timeline empty for member who follows no one                    | Functional |
| SC-TIMELINE-003 | Home timeline does not include own or unfollowed user posts          | Functional |
| SC-TIMELINE-004 | Home timeline paginates at 20 posts per page                         | Boundary   |
| SC-TIMELINE-005 | Explore feed accessible without authentication                       | Functional |
| SC-TIMELINE-006 | Search returns posts and users matching keyword                      | Functional |
| SC-TIMELINE-007 | Search with no matches returns empty arrays (200)                    | Negative   |
| SC-TIMELINE-009 | Home timeline rejected for unauthenticated request                   | Security   |
| SC-TIMELINE-010 | Timeline limit=1 returns exactly one post                            | Boundary   |
| SC-TIMELINE-011 | Timeline limit=50 (max) accepted                                     | Boundary   |
| SC-TIMELINE-012 | Timeline limit=0 rejected                                            | Boundary   |
| SC-TIMELINE-013 | Timeline limit=51 rejected                                           | Boundary   |

---

## Definition of Done — Test Cases

**P1 — All must pass:**

| TC-ID            | Title                                                        | Level |
|------------------|--------------------------------------------------------------|-------|
| TC-TIMELINE-001  | Home timeline — followed-user posts only, newest first       | API   |
| TC-TIMELINE-002  | 25 posts → page of 20 + nextCursor; page 2 = 5 + null        | API   |
| TC-TIMELINE-003  | Empty timeline for member who follows no one                 | API   |
| TC-TIMELINE-004  | Explore feed accessible without auth; email absent           | API   |
| TC-TIMELINE-005  | Timeline limit=0 → 400 VALIDATION_ERROR                      | API   |

**P2 — Target, not blocking:**

| Description                                                    |
|----------------------------------------------------------------|
| Search returns posts + users matching keyword                  |
| New posts banner appears on home timeline after polling        |

---

## Developer Tasks

| Task        | Title                                                         | Layer    | Complexity | Owner |
|-------------|---------------------------------------------------------------|----------|------------|-------|
| DEV-MB-034  | GET /api/timeline — home feed with cursor pagination          | API      | M          | Dev   |
| DEV-MB-035  | GET /api/explore — public posts feed                          | API      | S          | Dev   |
| DEV-MB-036  | GET /api/search?q= — keyword search (posts + users)           | API      | M          | Dev   |
| DEV-MB-037  | Home timeline page UI (/home)                                 | Frontend | M          | Dev   |
| DEV-MB-038  | Explore page UI (/explore) + search results                   | Frontend | M          | Dev   |
| DEV-MB-039  | New posts banner component                                    | Frontend | S          | Dev   |

**Dependencies:** All require DEV-MB-033 (Redis, Iter 1) and DEV-MB-020 (fan-out, Iter 3) to be complete.

---

## NFRs Enforced This Iteration

| NFR           | Requirement                                                   | Enforced in  |
|---------------|---------------------------------------------------------------|--------------|
| NFR-PERF-002  | Timeline served from Redis cache; no real-time JOIN           | DEV-MB-034   |
| NFR-COMP-003  | Email never in explore/search response                        | DEV-MB-035–036 |

---

## Increment

At the end of Iteration 4:
- A member's home timeline shows posts from followed users in reverse-chronological order
- Empty state guides new members to the explore page
- New-posts banner appears when new content is available during a session
- Timeline pagination works correctly with cursor (20 per page, limit 1–50)
- Any visitor can browse all public posts on `/explore`
- Keyword search returns matching posts and user accounts
