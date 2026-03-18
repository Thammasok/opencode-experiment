# SUT Definition — MicroBlog Platform

## System Name: MicroBlog Platform
**Version:** MVP v1.0
**Description:** A public micro-blogging platform where members post short text updates, follow other users, like posts, and browse personalised timelines. Visitors can read public content without authentication.

---

## Architecture

**Architecture Style:** Modular Monolith (services as modules, independently deployable in future)

**Components:**

| Name              | Type             | Responsibility                                              |
|-------------------|------------------|-------------------------------------------------------------|
| `web-app`         | Frontend         | Next.js App Router — renders timeline, profiles, posts UI   |
| `auth-module`     | Backend Module   | Registration, sign-in, sign-out, token management           |
| `post-module`     | Backend Module   | Create, delete, reply, fetch posts                          |
| `follow-module`   | Backend Module   | Follow/unfollow relationships, follower/following lists     |
| `like-module`     | Backend Module   | Like/unlike posts, like counts                              |
| `timeline-module` | Backend Module   | Home timeline (pre-computed), explore feed, search          |
| `notif-module`    | Backend Module   | In-app notifications (like, reply, follow events)           |
| `fanout-worker`   | Background Job   | Pushes new post IDs into follower timeline stores           |
| `postgres`        | Database         | Primary data store — users, posts, follows, likes           |
| `redis`           | Cache / Store    | Pre-computed timeline feeds (list per member)               |
| `message-queue`   | Message Queue    | PostCreated, LikeCreated, FollowCreated events (BullMQ)     |

**Communication:**
- REST API between frontend and backend modules
- Async events via BullMQ (Redis-backed) for fan-out and notifications
- Direct module-to-module calls within the monolith for co-located reads

---

## Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Frontend    | Next.js 14 (App Router), React 18, Tailwind CSS         |
| Backend     | Node.js 20, Express 5, TypeScript                       |
| ORM         | Prisma + PostgreSQL 15                                  |
| Auth        | JWT (1h TTL) + Refresh Token (30d), HttpOnly cookies    |
| Cache/Queue | Redis 7 + BullMQ                                        |
| File Store  | AWS S3 (avatar images) / LocalStack in tests            |
| Infra       | Docker Compose (local), GitHub Actions (CI)             |

---

## External Dependencies & Integration Points

| Name        | Type           | Test Approach                                      |
|-------------|----------------|----------------------------------------------------|
| AWS S3      | File Storage   | LocalStack in integration tests; mock in unit/API  |
| BullMQ      | Message Queue  | In-memory mock in unit; real Redis queue in integration |

---

## Data Stores

| Name            | Type       | Owned By           | Shared? |
|-----------------|------------|--------------------|---------|
| `microblog_db`  | PostgreSQL | All backend modules| Yes (monolith) — isolated per test via transactions/reset |
| `timeline_cache`| Redis      | timeline-module    | Read by fanout-worker |

---

## Environments

| Environment | Purpose                  | Test Types Allowed                       |
|-------------|--------------------------|------------------------------------------|
| local       | Developer machine        | Unit, Component, API                     |
| dev         | Shared integration       | Unit, Component, API, Integration        |
| staging     | Pre-production mirror    | All types including E2E                  |
| production  | Live system              | Smoke tests only (read-only GET requests)|

---

## Test Scope Boundaries

**In scope:**
- All 7 backend modules (auth, post, follow, like, timeline, notif, fanout-worker)
- REST API endpoints for all modules
- Frontend component rendering and interaction
- Fan-out correctness (post appears in follower timelines)
- Notification creation on social events
- Pagination behaviour across all list endpoints

**Out of scope:**
- AWS S3 production service (mocked / LocalStack in all tests)
- BullMQ Redis internals (queue infrastructure reliability)
- CDN cache eviction behaviour
- Browser-level performance benchmarks

---

## Test Level Applicability

| Level               | Applicable | Owner         | Trigger              |
|---------------------|------------|---------------|----------------------|
| Unit                | Yes        | Developer     | Every commit         |
| Component (Backend) | Yes        | Developer     | Every commit         |
| API                 | Yes        | Dev / QA      | Every PR             |
| Contract            | No         | —             | N/A (monolith)       |
| Integration         | Yes        | QA            | Merge to main        |
| Frontend Component  | Yes        | Developer     | Every PR             |
| E2E                 | Yes        | QA            | Merge to main / nightly |
