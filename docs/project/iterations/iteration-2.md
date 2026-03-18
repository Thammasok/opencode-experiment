# Iteration 2 — Auth Hardening + User Profile

**Goal:** Account lockout works; rate limits enforced; member can view and edit their public profile.

**Stories in scope:** US-MB-001–003 (hardening), US-MB-004, US-MB-005, US-MB-011
**Priority:** Must Have
**Duration:** 1 week

---

## Scenarios in Scope

| SC-ID          | Scenario                                                            | Type       |
|----------------|---------------------------------------------------------------------|------------|
| SC-AUTH-014    | Account locked after 5 consecutive failed sign-in attempts         | State      |
| SC-PROFILE-001 | Authenticated member views own profile page                        | Functional |
| SC-PROFILE-002 | Visitor views a public profile page (no auth)                      | Functional |
| SC-PROFILE-003 | Successful profile update — display name and bio                   | Functional |
| SC-PROFILE-004 | Profile update rejected — bio exceeds 160 chars                    | Boundary   |
| SC-PROFILE-005 | Profile update accepted at bio boundary (160 chars exactly)        | Boundary   |
| SC-PROFILE-006 | Avatar upload accepted for valid JPG/PNG under 5 MB               | Functional |
| SC-PROFILE-007 | Avatar upload rejected for unsupported file type                   | Negative   |
| SC-PROFILE-008 | Email not exposed in public profile response                       | Security   |

---

## Definition of Done — Test Cases

**P1 — All must pass:**

| TC-ID       | Title                                                   | Level |
|-------------|------------------------------------------------------|-------|
| TC-AUTH-010 | 5 failed sign-ins → 6th attempt returns 429 (carried from Iter 1) | API |
| (profile)   | GET /api/users/:username → all public fields returned, no email | API |
| (profile)   | PATCH /api/users/:id → bio 161 chars → 400             | API   |
| (profile)   | PATCH /api/users/:id → bio 160 chars → 200             | API   |
| (profile)   | Avatar upload valid JPG → CDN URL returned             | API   |
| (profile)   | Avatar upload invalid type → 400                       | API   |

**P2 — Target, not blocking:**

| Description                                          |
|------------------------------------------------------|
| GET /api/users/:username/followers returns paginated list |
| GET /api/users/:username/following returns paginated list |

---

## Developer Tasks

| Task        | Title                                                        | Layer    | Complexity | Owner |
|-------------|--------------------------------------------------------------|----------|------------|-------|
| DEV-MB-006  | Auth rate-limiter (10 req/IP/min on auth endpoints)          | Infra    | S          | Dev   |
| DEV-MB-010  | GET /api/users/:username public profile endpoint             | API      | S          | Dev   |
| DEV-MB-011  | PATCH /api/users/:id — update display name and bio           | API      | S          | Dev   |
| DEV-MB-012  | Avatar upload → S3 + sharp resize pipeline                   | API+Infra| M          | Dev   |
| DEV-MB-028  | Create follows table (needed for follower counts on profile) | DB       | XS         | Dev   |
| DEV-MB-031  | GET /api/users/:username/followers and /following            | API      | S          | Dev   |
| DEV-MB-032  | FollowButton UI component with optimistic update             | Frontend | S          | Dev   |
| DEV-MB-013  | Profile page UI (/users/:username)                           | Frontend | M          | Dev   |

---

## NFRs Enforced This Iteration

| NFR          | Requirement                                              | Enforced in  |
|--------------|----------------------------------------------------------|--------------|
| NFR-SEC-006  | Rate limit: 10 req/IP/min on auth endpoints              | DEV-MB-006   |
| NFR-COMP-003 | Email never in public profile response                   | DEV-MB-010   |
| NFR-PERF-004 | Avatar images served from CDN (TTL ≥ 7 days)            | DEV-MB-012   |

---

## Increment

At the end of Iteration 2:
- Account lockout after 5 failed sign-ins is enforced (15-minute lock)
- Auth endpoints are rate-limited (10 req/IP/min)
- Any visitor can view a public profile at `/users/:username`
- A member can update their display name, bio, and avatar
- Bio exceeding 160 chars is rejected with a validation error
- Follower and following lists are accessible via profile tabs
- Email is never returned in any profile API response
