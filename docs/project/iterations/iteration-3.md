# Iteration 3 — Post Creation, Deletion, Fan-Out, and Thread View

**Goal:** Member can create and delete posts. Fan-out worker delivers new posts to follower Redis timelines. Thread view shows post + replies.

**Stories in scope:** US-MB-006, US-MB-007, US-MB-008, US-MB-014
**Priority:** Must Have (006, 007, 014) / Should Have (008)
**Duration:** 1–2 weeks

---

## Scenarios in Scope

| SC-ID       | Scenario                                                             | Type        |
|-------------|----------------------------------------------------------------------|-------------|
| SC-POST-001 | Member creates a post with 1-char body (min boundary)               | Boundary    |
| SC-POST-002 | Member creates a post with 280-char body (max boundary)             | Boundary    |
| SC-POST-003 | Post rejected — body is empty string                                | Negative    |
| SC-POST-004 | Post rejected — body is whitespace only                             | Negative    |
| SC-POST-005 | Post rejected — body is 281 chars (max+1)                           | Boundary    |
| SC-POST-006 | Post creation rejected — unauthenticated                            | Security    |
| SC-POST-007 | Created post fan-fanned out to followers' timelines                 | Integration |
| SC-POST-008 | Member deletes their own post                                       | Functional  |
| SC-POST-009 | Delete rejected — requester is not the author                       | Security    |
| SC-POST-010 | Delete request for non-existent post returns 404                    | Negative    |
| SC-POST-011 | Member replies to a post (parentPostId set)                         | Functional  |
| SC-POST-012 | Reply to non-existent parent post rejected                          | Negative    |
| SC-TIMELINE-008 | Post detail view returns post + all replies                     | Functional  |

---

## Definition of Done — Test Cases

**P1 — All must pass:**

| TC-ID       | Title                                                        | Level |
|-------------|--------------------------------------------------------------|-------|
| TC-POST-001 | 1 char body → 201 (min boundary)                             | API   |
| TC-POST-002 | 280 char body → 201 (max boundary)                           | API   |
| TC-POST-003 | 281 chars → 400 POST_TOO_LONG                                | API   |
| TC-POST-004 | Empty body → 400 POST_EMPTY                                  | API   |
| TC-POST-005 | Whitespace-only body → 400 POST_EMPTY                        | API   |
| TC-POST-006 | Unauthenticated → 401                                        | API   |
| TC-POST-007 | Author deletes own post → 204; post absent from DB+timeline  | API   |
| TC-POST-008 | Non-author delete → 403 FORBIDDEN                            | API   |

**P2 — Target, not blocking:**

| Description                                              |
|----------------------------------------------------------|
| Fan-out: post appears in follower's Redis timeline (integration) |
| Reply creates post linked to parentPostId               |
| Thread view returns parent + N replies                  |

---

## Developer Tasks

| Task        | Title                                                         | Layer    | Complexity | Owner |
|-------------|---------------------------------------------------------------|----------|------------|-------|
| DEV-MB-014  | Create posts table schema and migration                       | DB       | S          | Dev   |
| DEV-MB-015  | POST /api/posts — create post                                 | API      | S          | Dev   |
| DEV-MB-016  | DELETE /api/posts/:postId — delete post                       | API      | S          | Dev   |
| DEV-MB-017  | GET /api/posts/:postId — post detail with replies             | API      | S          | Dev   |
| DEV-MB-018  | Reply support — parentPostId in POST /api/posts               | API      | S          | Dev   |
| DEV-MB-019  | Post rate limiter (100 posts/hr per member)                   | Infra    | XS         | Dev   |
| DEV-MB-020  | BullMQ fan-out worker                                         | Domain+Infra | L     | Dev   |
| DEV-MB-021  | PostCard UI component                                         | Frontend | M          | Dev   |
| DEV-MB-022  | ComposeArea UI component                                      | Frontend | M          | Dev   |
| DEV-MB-023  | Thread view page (/posts/:postId)                             | Frontend | S          | Dev   |
| DEV-MB-024  | Post test fixtures                                            | Test hook| XS         | Dev   |

**Critical path:** DEV-MB-014 → DEV-MB-015 → DEV-MB-020
**Parallelisable:** DEV-MB-021, DEV-MB-022, DEV-MB-023 (frontend) can run in parallel with DB/API work

---

## NFRs Enforced This Iteration

| NFR          | Requirement                                                  | Enforced in   |
|--------------|--------------------------------------------------------------|---------------|
| NFR-SEC-007  | Rate limit: 100 posts/hr per member                          | DEV-MB-019    |
| NFR-PERF-003 | Fan-out to ≤10k followers completes within 5 seconds         | DEV-MB-020    |
| NFR-REL-002  | Fan-out async queue; queue failure doesn't affect post creation | DEV-MB-020  |
| NFR-COMP-002 | Deleted posts purged from all stores immediately             | DEV-MB-016+020|

---

## Increment

At the end of Iteration 3:
- A member can create a post (1–280 chars); invalid posts are rejected with clear errors
- Post creation is rate-limited to 100/hr
- New posts are fan-fanned out to follower Redis timelines within 5 seconds
- A member can delete their own post; non-authors receive 403
- Deleted posts are removed from DB and all Redis timelines
- A member can reply to any post (creates linked sub-post)
- Anyone can view a post thread at `/posts/:postId` with all replies
