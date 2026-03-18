# Backlog — MicroBlog Platform

> Source: docs/requirements/requirements.md · docs/test-design/ · docs/ux-design/
> Last updated: 2026-03-17

---

## Artifact Inventory

| ID           | Type           | Title / Summary                                           | Priority    | Source                  |
|--------------|----------------|-----------------------------------------------------------|-------------|-------------------------|
| US-MB-001    | User Story     | Visitor registers with username, email, password          | Must Have   | business-analysis       |
| US-MB-002    | User Story     | Member signs in with email and password                   | Must Have   | business-analysis       |
| US-MB-003    | User Story     | Member signs out                                          | Must Have   | business-analysis       |
| US-MB-004    | User Story     | Member views their public profile                         | Must Have   | business-analysis       |
| US-MB-005    | User Story     | Member edits display name, bio, avatar                    | Must Have   | business-analysis       |
| US-MB-006    | User Story     | Member creates a post (1–280 chars)                       | Must Have   | business-analysis       |
| US-MB-007    | User Story     | Member deletes their own post                             | Must Have   | business-analysis       |
| US-MB-008    | User Story     | Member replies to a post                                  | Should Have | business-analysis       |
| US-MB-009    | User Story     | Member likes / unlikes a post                             | Must Have   | business-analysis       |
| US-MB-010    | User Story     | Member follows / unfollows another user                   | Must Have   | business-analysis       |
| US-MB-011    | User Story     | Visitor / Member views follower and following lists       | Should Have | business-analysis       |
| US-MB-012    | User Story     | Member views home timeline (followed users, paginated)    | Must Have   | business-analysis       |
| US-MB-013    | User Story     | Visitor / Member browses explore feed and searches        | Must Have   | business-analysis       |
| US-MB-014    | User Story     | Visitor / Member views a post thread                      | Must Have   | business-analysis       |
| US-MB-015    | User Story     | Member receives in-app notifications                      | Should Have | business-analysis       |
| FR-MB-001–033| Functional Req | 33 requirements across Auth, Profile, Posts, Likes, Follows, Timeline, Notifications | Mixed | business-analysis |
| NFR-PERF-001–004 | NFR        | API ≤300ms p95; timeline from cache; fan-out ≤5s; CDN avatar | Must Have | business-analysis |
| NFR-SEC-001–007  | NFR        | bcrypt≥12, JWT 1h, HTTPS, CORS, rate limits               | Must Have   | business-analysis       |
| NFR-REL-001–002  | NFR        | 99.9% availability; async fan-out queue                   | Must Have   | business-analysis       |
| NFR-SCALE-001–002| NFR        | Fan-out-on-write for 10k followers; read replicas         | Should Have | business-analysis       |
| SC-AUTH-001–016  | Scenario   | 16 auth scenarios (happy path, BVA, lockout, security)    | High        | software-tester-design  |
| SC-PROFILE-001–008| Scenario  | 8 profile scenarios (view, edit, BVA, security)           | High/Medium | software-tester-design  |
| SC-POST-001–012  | Scenario   | 12 post scenarios (BVA, auth, fan-out, reply)             | High/Medium | software-tester-design  |
| SC-LIKE-001–006  | Scenario   | 6 like/unlike scenarios                                   | High/Medium | software-tester-design  |
| SC-FOLLOW-001–006| Scenario   | 6 follow/unfollow + integration scenarios                 | High/Medium | software-tester-design  |
| SC-TIMELINE-001–013| Scenario | 13 timeline/explore/search/pagination scenarios           | High/Medium | software-tester-design  |
| SC-NOTIF-001–005 | Scenario   | 5 notification scenarios                                  | Medium      | software-tester-design  |
| TC-AUTH-001–011  | Test Case  | 11 auth test cases (API level)                            | P1          | software-tester-design  |
| TC-POST-001–008  | Test Case  | 8 post test cases (API level)                             | P1          | software-tester-design  |
| TC-LIKE-001–003  | Test Case  | 3 like/unlike test cases                                  | P1          | software-tester-design  |
| TC-FOLLOW-001–004| Test Case  | 4 follow test cases (API + integration)                   | P1          | software-tester-design  |
| TC-TIMELINE-001–005| Test Case| 5 timeline/explore test cases                             | P1/P2       | software-tester-design  |
| TC-NOTIF-001–002 | Test Case  | 2 notification test cases                                 | P2          | software-tester-design  |
| UJ-MB-001–003    | UX Journey | 3 user journeys (discover, daily use, discover+follow)    | —           | ux-ui-designer          |
| WF-MB-001–007    | Wireframe  | 7 wireframes (auth, home, compose, profile, explore, thread, notif) | — | ux-ui-designer |
| UI-MB-001–006    | UI Spec    | 6 component specs (PostCard, Compose, Nav, Profile, Forms, Banner) | — | ux-ui-designer |

**Artifact validation:** ✅ All required upstream artifacts present. Proceeding with planning.

---

## Epics

### EPIC-MB-001 — Authentication & Identity
*Visitor can register, sign in, and sign out. Sessions are secure and rate-limited.*

| Story      | Title                                      | Priority    | FR Ref                     | SC Ref                      | TC Ref                      |
|------------|--------------------------------------------|-------------|----------------------------|-----------------------------|------------------------------|
| US-MB-001  | Register with username, email, password    | Must Have   | FR-MB-001–003, FR-MB-008   | SC-AUTH-001–010             | TC-AUTH-001–007             |
| US-MB-002  | Sign in with email and password            | Must Have   | FR-MB-004–006              | SC-AUTH-011–015             | TC-AUTH-008–010             |
| US-MB-003  | Sign out and invalidate session            | Must Have   | FR-MB-007                  | SC-AUTH-015–016             | TC-AUTH-011                 |

---

### EPIC-MB-002 — User Profile
*Member can view any public profile and edit their own display name, bio, and avatar.*

| Story      | Title                                      | Priority    | FR Ref                     | SC Ref                       | TC Ref    |
|------------|--------------------------------------------|-------------|----------------------------|------------------------------|-----------|
| US-MB-004  | View own and others' public profile        | Must Have   | FR-MB-009                  | SC-PROFILE-001–002, 008      | —         |
| US-MB-005  | Edit display name, bio, avatar             | Must Have   | FR-MB-010–012              | SC-PROFILE-003–007           | —         |
| US-MB-011  | View follower and following lists          | Should Have | FR-MB-009                  | SC-PROFILE-001               | —         |

---

### EPIC-MB-003 — Posts
*Member can create, delete, and reply to posts. Fan-out delivers new posts to follower timelines.*

| Story      | Title                                      | Priority    | FR Ref                     | SC Ref                      | TC Ref                      |
|------------|--------------------------------------------|-------------|----------------------------|-----------------------------|------------------------------|
| US-MB-006  | Create a post (1–280 chars)               | Must Have   | FR-MB-013–015, FR-MB-018   | SC-POST-001–007             | TC-POST-001–006             |
| US-MB-007  | Delete own post                            | Must Have   | FR-MB-016–017              | SC-POST-008–010             | TC-POST-007–008             |
| US-MB-008  | Reply to a post                            | Should Have | FR-MB-013–014              | SC-POST-011–012             | —                           |

---

### EPIC-MB-004 — Social Engagement (Like + Follow)
*Member can like/unlike posts and follow/unfollow users. Counts update optimistically.*

| Story      | Title                                      | Priority    | FR Ref                     | SC Ref                       | TC Ref                      |
|------------|--------------------------------------------|-------------|----------------------------|------------------------------|------------------------------|
| US-MB-009  | Like and unlike a post                     | Must Have   | FR-MB-019–021              | SC-LIKE-001–006              | TC-LIKE-001–003             |
| US-MB-010  | Follow and unfollow a user                 | Must Have   | FR-MB-022–025              | SC-FOLLOW-001–006            | TC-FOLLOW-001–004           |

---

### EPIC-MB-005 — Timeline & Discovery
*Member sees personalised home timeline; visitors and members browse explore and search.*

| Story      | Title                                      | Priority    | FR Ref                     | SC Ref                        | TC Ref                       |
|------------|--------------------------------------------|-------------|----------------------------|-------------------------------|------------------------------|
| US-MB-012  | Home timeline — followed users, paginated  | Must Have   | FR-MB-026                  | SC-TIMELINE-001–004, 009–013  | TC-TIMELINE-001–003, 005    |
| US-MB-013  | Explore feed and keyword search            | Must Have   | FR-MB-027–028              | SC-TIMELINE-005–007           | TC-TIMELINE-004             |
| US-MB-014  | Post thread detail with replies            | Must Have   | FR-MB-029                  | SC-TIMELINE-008               | —                           |

---

### EPIC-MB-006 — Notifications
*Member receives in-app notifications for likes, replies, and follows.*

| Story      | Title                                      | Priority    | FR Ref                     | SC Ref                       | TC Ref                      |
|------------|--------------------------------------------|-------------|----------------------------|------------------------------|------------------------------|
| US-MB-015  | In-app notifications (like, reply, follow) | Should Have | FR-MB-030–033              | SC-NOTIF-001–005             | TC-NOTIF-001–002            |
