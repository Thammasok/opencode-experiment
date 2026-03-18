# Test Cases — MicroBlog Platform

> Source scenarios: `docs/test-design/test-scenarios.md`
> Input contract for: `software-tester-automation` skill
> Test data: `docs/test-design/test-data.md`

---

## AUTH — Registration

---

```
TC-ID:         TC-AUTH-001
Title:         Successful registration with valid username, email, and password
Feature:       AUTH — Registration
Level:         API
Priority:      P1
Technique:     EP (happy path representative)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/register

Preconditions:
  - No existing account with email "alice@example.com" or username "alice_dev"
  - Environment: local

Input:
  username: "alice_dev"         # valid 9-char lowercase alphanumeric+underscore
  email:    "alice@example.com" # valid format
  password: "P@ssw0rd!"         # meets all complexity rules

Steps:
  1. POST /api/auth/register with the above body

Expected Output:
  Status:       201 Created
  Response:
    userId:       string (UUID v4 format)
    username:     "alice_dev"
    email:        "alice@example.com"
    createdAt:    ISO 8601 UTC string
    accessToken:  non-empty string (JWT format)
    refreshToken: non-empty string
    password:     MUST NOT be present in response
  Side effects: User row inserted in DB with hashed password (not plaintext)

Test Data Notes:
  - Fixture: fixtures/auth/valid-register.ts → userAlice

Automation:
  Target file:  src/tests/auth/register.api.test.ts
  Mock needed:  none for this level
```

---

```
TC-ID:         TC-AUTH-002
Title:         Registration rejected — username below minimum (2 chars)
Feature:       AUTH — Registration
Level:         API
Priority:      P1
Technique:     BVA (min-1 boundary)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/register

Preconditions:
  - Environment: local

Input:
  username: "ab"                # 2 chars — below min of 3
  email:    "bob@example.com"
  password: "P@ssw0rd!"

Steps:
  1. POST /api/auth/register with the above body

Expected Output:
  Status:       400 Bad Request
  Response:
    code:     "VALIDATION_ERROR"
    errors[0].field:   "username"
    errors[0].code:    "MIN_LENGTH"
  Side effects: No user row inserted in DB

Automation:
  Target file:  src/tests/auth/register.api.test.ts
```

---

```
TC-ID:         TC-AUTH-003
Title:         Registration rejected — username at minimum boundary (3 chars)
Feature:       AUTH — Registration
Level:         API
Priority:      P1
Technique:     BVA (min boundary — valid)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/register

Preconditions:
  - No existing account with username "abc"

Input:
  username: "abc"               # 3 chars — exactly at min
  email:    "minuser@example.com"
  password: "P@ssw0rd!"

Steps:
  1. POST /api/auth/register with the above body

Expected Output:
  Status:       201 Created
  Response:     userId present; username is "abc"
  Side effects: User row inserted

Automation:
  Target file:  src/tests/auth/register.api.test.ts
```

---

```
TC-ID:         TC-AUTH-004
Title:         Registration rejected — username exceeds maximum (31 chars)
Feature:       AUTH — Registration
Level:         API
Priority:      P1
Technique:     BVA (max+1 boundary)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/register

Input:
  username: "a".repeat(31)      # 31 chars — above max of 30
  email:    "longuser@example.com"
  password: "P@ssw0rd!"

Steps:
  1. POST /api/auth/register with the above body

Expected Output:
  Status:       400 Bad Request
  Response:
    errors[0].field:  "username"
    errors[0].code:   "MAX_LENGTH"
  Side effects: No user row inserted

Automation:
  Target file:  src/tests/auth/register.api.test.ts
```

---

```
TC-ID:         TC-AUTH-005
Title:         Registration rejected — username contains uppercase letters
Feature:       AUTH — Registration
Level:         API
Priority:      P2
Technique:     EP (invalid format partition)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/register

Input:
  username: "Alice_Dev"         # contains uppercase — invalid
  email:    "alice2@example.com"
  password: "P@ssw0rd!"

Steps:
  1. POST /api/auth/register with the above body

Expected Output:
  Status:       400 Bad Request
  Response:     errors[0].field = "username", errors[0].code = "INVALID_FORMAT"

Automation:
  Target file:  src/tests/auth/register.api.test.ts
```

---

```
TC-ID:         TC-AUTH-006
Title:         Registration rejected — email already registered
Feature:       AUTH — Registration
Level:         API
Priority:      P1
Technique:     Error Guessing (duplicate submission)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/register

Preconditions:
  - User with email "existing@example.com" already exists in DB

Input:
  username: "newuser1"
  email:    "existing@example.com"   # already registered
  password: "P@ssw0rd!"

Steps:
  1. POST /api/auth/register with the above body

Expected Output:
  Status:       409 Conflict
  Response:
    code: "EMAIL_ALREADY_EXISTS"
  Side effects: No new user row inserted

Test Data Notes:
  - Seed: fixtures/auth/existing-user.ts → userExisting

Automation:
  Target file:  src/tests/auth/register.api.test.ts
```

---

```
TC-ID:         TC-AUTH-007
Title:         Registration rejected — password missing uppercase character
Feature:       AUTH — Registration
Level:         API
Priority:      P1
Technique:     EP (invalid partition — missing complexity rule)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/register

Input:
  username: "testuser1"
  email:    "test1@example.com"
  password: "p@ssw0rd!"         # no uppercase

Steps:
  1. POST /api/auth/register

Expected Output:
  Status:       400 Bad Request
  Response:     errors[0].field = "password", errors[0].code = "INVALID_FORMAT"
  Side effects: No user created; plaintext password never logged

Automation:
  Target file:  src/tests/auth/register.api.test.ts
```

---

## AUTH — Sign In

---

```
TC-ID:         TC-AUTH-008
Title:         Successful sign-in with valid credentials
Feature:       AUTH — Sign In
Level:         API
Priority:      P1
Technique:     EP (happy path)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/signin

Preconditions:
  - User "alice@example.com" / "P@ssw0rd!" exists

Input:
  email:    "alice@example.com"
  password: "P@ssw0rd!"

Steps:
  1. POST /api/auth/signin with the above body

Expected Output:
  Status:       200 OK
  Response:
    accessToken:  non-empty JWT
    refreshToken: non-empty string
    userId:       UUID matching alice's account
  Side effects: Last-seen timestamp updated

Test Data Notes:
  - Seed: fixtures/auth/valid-register.ts → userAlice (pre-created)

Automation:
  Target file:  src/tests/auth/signin.api.test.ts
```

---

```
TC-ID:         TC-AUTH-009
Title:         Sign-in rejected with wrong password — generic message returned
Feature:       AUTH — Sign In
Level:         API
Priority:      P1
Technique:     Negative / Security (no field enumeration)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/signin

Preconditions:
  - User "alice@example.com" exists

Input:
  email:    "alice@example.com"
  password: "WrongPass1!"

Steps:
  1. POST /api/auth/signin

Expected Output:
  Status:       401 Unauthorized
  Response:
    code:     "UNAUTHENTICATED"
    message:  "Invalid email or password"
  Assert: message does NOT say "password is wrong" or "email not found" (no field enumeration)

Automation:
  Target file:  src/tests/auth/signin.api.test.ts
```

---

```
TC-ID:         TC-AUTH-010
Title:         Account locked after 5 consecutive failed sign-in attempts
Feature:       AUTH — Sign In
Level:         API
Priority:      P1
Technique:     State Transition (open → locked)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/signin (×6)

Preconditions:
  - User "alice@example.com" exists with no prior failed attempts

Input:
  email:    "alice@example.com"
  password: "WrongPass1!"       # wrong password, repeated

Steps:
  1. POST /api/auth/signin with wrong password — repeat 5 times
  2. POST /api/auth/signin with wrong password — 6th attempt

Expected Output:
  Steps 1–5 Status: 401 UNAUTHENTICATED
  Step 6 Status:    429 Too Many Requests
  Response:
    code:     "RATE_LIMIT_EXCEEDED"
    message:  contains "locked" or "try again in 15 minutes"
  Side effects: Account locked in DB for 15 minutes

Automation:
  Target file:  src/tests/auth/signin.api.test.ts
  Mock needed:  Mock clock/time to test lockout expiry in unit level
```

---

```
TC-ID:         TC-AUTH-011
Title:         Sign-out invalidates the access token
Feature:       AUTH — Sign Out
Level:         API
Priority:      P1
Technique:     State Transition (authenticated → unauthenticated)

SUT Reference:
  Component:   auth-module
  Action:      POST /api/auth/signout

Preconditions:
  - Member is signed in; has valid accessToken

Input:
  Authorization: Bearer <accessToken>

Steps:
  1. POST /api/auth/signout with valid token
  2. GET /api/timeline using the same accessToken

Expected Output:
  Step 1 Status: 200 OK
  Step 2 Status: 401 UNAUTHENTICATED
  Side effects: Token/session record invalidated in DB

Automation:
  Target file:  src/tests/auth/signout.api.test.ts
```

---

## POST — Create, Delete, Reply

---

```
TC-ID:         TC-POST-001
Title:         Member creates a post with 1-character body (minimum boundary)
Feature:       POST — Create
Level:         API
Priority:      P1
Technique:     BVA (min boundary)

SUT Reference:
  Component:   post-module
  Action:      POST /api/posts

Preconditions:
  - Member authenticated (alice)

Input:
  body:          "A"              # 1 char — min boundary
  Authorization: Bearer <token>

Steps:
  1. POST /api/posts

Expected Output:
  Status:       201 Created
  Response:
    postId:      UUID v4
    body:        "A"
    authorId:    alice's userId
    likeCount:   0
    replyCount:  0
    createdAt:   ISO 8601 UTC

Automation:
  Target file:  src/tests/post/create-post.api.test.ts
```

---

```
TC-ID:         TC-POST-002
Title:         Member creates a post with 280-character body (maximum boundary)
Feature:       POST — Create
Level:         API
Priority:      P1
Technique:     BVA (max boundary)

SUT Reference:
  Component:   post-module
  Action:      POST /api/posts

Preconditions:
  - Member authenticated

Input:
  body:          "a".repeat(280)   # 280 chars — max boundary
  Authorization: Bearer <token>

Steps:
  1. POST /api/posts

Expected Output:
  Status:       201 Created
  Response:     postId present; body length = 280

Automation:
  Target file:  src/tests/post/create-post.api.test.ts
```

---

```
TC-ID:         TC-POST-003
Title:         Post rejected when body is 281 characters (max+1)
Feature:       POST — Create
Level:         API
Priority:      P1
Technique:     BVA (max+1 boundary)

SUT Reference:
  Component:   post-module
  Action:      POST /api/posts

Input:
  body:          "a".repeat(281)   # 281 chars — exceeds max
  Authorization: Bearer <token>

Steps:
  1. POST /api/posts

Expected Output:
  Status:       400 Bad Request
  Response:     code = "POST_TOO_LONG"
  Side effects: No post row inserted

Automation:
  Target file:  src/tests/post/create-post.api.test.ts
```

---

```
TC-ID:         TC-POST-004
Title:         Post rejected when body is empty string
Feature:       POST — Create
Level:         API
Priority:      P1
Technique:     Error Guessing (empty input)

Input:
  body:          ""
  Authorization: Bearer <token>

Steps:
  1. POST /api/posts

Expected Output:
  Status:       400 Bad Request
  Response:     code = "POST_EMPTY"

Automation:
  Target file:  src/tests/post/create-post.api.test.ts
```

---

```
TC-ID:         TC-POST-005
Title:         Post rejected when body is whitespace only
Feature:       POST — Create
Level:         API
Priority:      P1
Technique:     Error Guessing (whitespace-only)

Input:
  body:          "   "             # spaces only
  Authorization: Bearer <token>

Steps:
  1. POST /api/posts

Expected Output:
  Status:       400 Bad Request
  Response:     code = "POST_EMPTY"

Automation:
  Target file:  src/tests/post/create-post.api.test.ts
```

---

```
TC-ID:         TC-POST-006
Title:         Unauthenticated post creation is rejected
Feature:       POST — Create
Level:         API
Priority:      P1
Technique:     Security

Input:
  body:          "Hello world"
  Authorization: (none)

Steps:
  1. POST /api/posts with no auth header

Expected Output:
  Status:       401 Unauthorized
  Response:     code = "UNAUTHENTICATED"

Automation:
  Target file:  src/tests/post/create-post.api.test.ts
```

---

```
TC-ID:         TC-POST-007
Title:         Author deletes their own post — post removed from profile and timeline
Feature:       POST — Delete
Level:         API
Priority:      P1
Technique:     Functional + Side Effect verification

SUT Reference:
  Component:   post-module
  Action:      DELETE /api/posts/:postId

Preconditions:
  - Post created by alice; bob follows alice (post in bob's timeline)

Input:
  postId:        <alice's postId>
  Authorization: Bearer <alice_token>

Steps:
  1. DELETE /api/posts/:postId
  2. GET /api/posts/:postId
  3. GET /api/timeline (as bob)

Expected Output:
  Step 1 Status: 204 No Content
  Step 2 Status: 404 NOT_FOUND
  Step 3: deleted postId absent from bob's timeline
  Side effects: Post row removed from DB; postId removed from Redis timeline keys

Automation:
  Target file:  src/tests/post/delete-post.api.test.ts
```

---

```
TC-ID:         TC-POST-008
Title:         Delete rejected when requester is not the post author
Feature:       POST — Delete
Level:         API
Priority:      P1
Technique:     Security (authorisation)

Preconditions:
  - Post created by alice; bob is authenticated

Input:
  postId:        <alice's postId>
  Authorization: Bearer <bob_token>

Steps:
  1. DELETE /api/posts/:postId (as bob)

Expected Output:
  Status:       403 Forbidden
  Response:     code = "FORBIDDEN"
  Side effects: Post unchanged in DB

Automation:
  Target file:  src/tests/post/delete-post.api.test.ts
```

---

## LIKE — Like and Unlike

---

```
TC-ID:         TC-LIKE-001
Title:         Member likes a post — likeCount increments by 1
Feature:       LIKE
Level:         API
Priority:      P1
Technique:     Functional

SUT Reference:
  Component:   like-module
  Action:      POST /api/posts/:postId/likes

Preconditions:
  - Post exists with likeCount = 0; alice authenticated; alice has NOT liked this post

Input:
  postId:        <existing postId>
  Authorization: Bearer <alice_token>

Steps:
  1. POST /api/posts/:postId/likes
  2. GET /api/posts/:postId

Expected Output:
  Step 1 Status: 201 Created
  Step 2: post.likeCount = 1; post.likedByMe = true (if alice requests)
  Side effects: Like row inserted in DB

Automation:
  Target file:  src/tests/like/like.api.test.ts
```

---

```
TC-ID:         TC-LIKE-002
Title:         Member unlikes a post — likeCount decrements by 1
Feature:       LIKE
Level:         API
Priority:      P1
Technique:     State Transition (liked → unliked)

Preconditions:
  - Alice has already liked the post (likeCount = 1)

Input:
  postId:        <postId already liked>
  Authorization: Bearer <alice_token>

Steps:
  1. DELETE /api/posts/:postId/likes
  2. GET /api/posts/:postId

Expected Output:
  Step 1 Status: 204 No Content
  Step 2: post.likeCount = 0; post.likedByMe = false

Automation:
  Target file:  src/tests/like/like.api.test.ts
```

---

```
TC-ID:         TC-LIKE-003
Title:         Duplicate like on same post is rejected
Feature:       LIKE
Level:         API
Priority:      P1
Technique:     Error Guessing (duplicate submission)

Preconditions:
  - Alice has already liked the post

Input:
  postId:        <postId>
  Authorization: Bearer <alice_token>

Steps:
  1. POST /api/posts/:postId/likes  (second like attempt)

Expected Output:
  Status:       409 Conflict
  Response:     code = "ALREADY_LIKED"
  Side effects: likeCount unchanged; no duplicate row in DB

Automation:
  Target file:  src/tests/like/like.api.test.ts
```

---

## FOLLOW — Follow and Unfollow

---

```
TC-ID:         TC-FOLLOW-001
Title:         Member follows another member — follower_count incremented
Feature:       FOLLOW
Level:         API
Priority:      P1
Technique:     Functional

SUT Reference:
  Component:   follow-module
  Action:      POST /api/follows

Preconditions:
  - Alice and Bob both exist; Alice does NOT follow Bob

Input:
  targetId:      <bob's userId>
  Authorization: Bearer <alice_token>

Steps:
  1. POST /api/follows { targetId: bob.userId }
  2. GET /api/users/:bobId/profile

Expected Output:
  Step 1 Status: 201 Created
  Step 2: bob.followerCount = previous + 1
  Side effects: Follow row inserted in DB

Automation:
  Target file:  src/tests/follow/follow.api.test.ts
```

---

```
TC-ID:         TC-FOLLOW-002
Title:         Self-follow attempt rejected
Feature:       FOLLOW
Level:         API
Priority:      P1
Technique:     Security / Business Rule

Preconditions:
  - Alice authenticated

Input:
  targetId:      <alice's own userId>
  Authorization: Bearer <alice_token>

Steps:
  1. POST /api/follows { targetId: alice.userId }

Expected Output:
  Status:       403 Forbidden
  Response:     code = "FORBIDDEN"
  Side effects: No follow row inserted

Automation:
  Target file:  src/tests/follow/follow.api.test.ts
```

---

```
TC-ID:         TC-FOLLOW-003
Title:         Duplicate follow rejected
Feature:       FOLLOW
Level:         API
Priority:      P1
Technique:     Error Guessing

Preconditions:
  - Alice already follows Bob

Input:
  targetId:      <bob's userId>
  Authorization: Bearer <alice_token>

Steps:
  1. POST /api/follows { targetId: bob.userId } (second attempt)

Expected Output:
  Status:       409 Conflict
  Response:     code = "ALREADY_FOLLOWING"
  Side effects: follower_count unchanged; no duplicate row

Automation:
  Target file:  src/tests/follow/follow.api.test.ts
```

---

```
TC-ID:         TC-FOLLOW-004
Title:         After unfollowing, that user's new posts do not appear in timeline
Feature:       FOLLOW — Integration with Timeline
Level:         Integration
Priority:      P1
Technique:     State Transition (following → unfollowed) + Side Effect

Preconditions:
  - Alice follows Bob; Bob has existing posts in Alice's timeline

Steps:
  1. DELETE /api/follows/:bobId (Alice unfollows Bob)
  2. Bob creates a new post: POST /api/posts
  3. GET /api/timeline (as Alice)

Expected Output:
  Step 1 Status: 204 No Content
  Step 3: Alice's timeline does NOT contain Bob's new postId
  Side effects: Bob's new post fan-out skips Alice's timeline key

Automation:
  Target file:  src/tests/follow/follow-integration.test.ts
```

---

## TIMELINE — Home Feed, Explore, Pagination

---

```
TC-ID:         TC-TIMELINE-001
Title:         Home timeline returns posts from followed users only, newest first
Feature:       TIMELINE — Home Feed
Level:         API
Priority:      P1
Technique:     Functional

SUT Reference:
  Component:   timeline-module
  Action:      GET /api/timeline

Preconditions:
  - Alice follows Bob and Carol; Dave (not followed) has posts
  - Bob posted post_B at T+2, Carol posted post_C at T+1

Input:
  Authorization: Bearer <alice_token>

Steps:
  1. GET /api/timeline

Expected Output:
  Status:       200 OK
  Response:
    posts[0].postId = post_B  (newest)
    posts[1].postId = post_C
    posts does NOT contain any post by Dave
    nextCursor: null (if fewer than 20 posts)

Automation:
  Target file:  src/tests/timeline/home-timeline.api.test.ts
```

---

```
TC-ID:         TC-TIMELINE-002
Title:         Home timeline pagination — 25 posts returns page of 20 + nextCursor
Feature:       TIMELINE — Pagination
Level:         API
Priority:      P1
Technique:     BVA (page boundary)

Preconditions:
  - Alice follows Bob; Bob has 25 posts

Steps:
  1. GET /api/timeline?limit=20
  2. GET /api/timeline?cursor=<nextCursor>&limit=20

Expected Output:
  Step 1: posts.length = 20; nextCursor is non-null string
  Step 2: posts.length = 5; nextCursor = null
  Assert: no duplicate postIds across both pages

Automation:
  Target file:  src/tests/timeline/home-timeline.api.test.ts
```

---

```
TC-ID:         TC-TIMELINE-003
Title:         Home timeline empty for member who follows no one
Feature:       TIMELINE — Home Feed
Level:         API
Priority:      P1
Technique:     Functional (edge state)

Preconditions:
  - Charlie is authenticated; follows no one

Steps:
  1. GET /api/timeline

Expected Output:
  Status:       200 OK
  Response:     posts = []; nextCursor = null

Automation:
  Target file:  src/tests/timeline/home-timeline.api.test.ts
```

---

```
TC-ID:         TC-TIMELINE-004
Title:         Explore feed accessible by unauthenticated visitor
Feature:       TIMELINE — Explore
Level:         API
Priority:      P1
Technique:     Functional / Security

SUT Reference:
  Component:   timeline-module
  Action:      GET /api/explore

Preconditions:
  - Multiple members have public posts

Steps:
  1. GET /api/explore (no auth header)

Expected Output:
  Status:       200 OK
  Response:     posts[] non-empty; all posts are public
  Assert: email fields NOT present in any post.author object

Automation:
  Target file:  src/tests/timeline/explore.api.test.ts
```

---

```
TC-ID:         TC-TIMELINE-005
Title:         Timeline limit=0 rejected with validation error
Feature:       TIMELINE — Pagination Boundary
Level:         API
Priority:      P2
Technique:     BVA (below min=1)

Input:
  limit:         0
  Authorization: Bearer <alice_token>

Steps:
  1. GET /api/timeline?limit=0

Expected Output:
  Status:       400 Bad Request
  Response:     code = "VALIDATION_ERROR"; field = "limit"

Automation:
  Target file:  src/tests/timeline/home-timeline.api.test.ts
```

---

## NOTIF — Notifications

---

```
TC-ID:         TC-NOTIF-001
Title:         Notification created when a post is liked
Feature:       NOTIF
Level:         Integration
Priority:      P2
Technique:     Integration (event → notification)

SUT Reference:
  Component:   notif-module + like-module
  Action:      POST /api/posts/:postId/likes → notification side effect

Preconditions:
  - Alice has a post; Bob likes it

Steps:
  1. Bob: POST /api/posts/:postId/likes
  2. Alice: GET /api/notifications

Expected Output:
  Step 2: notifications[0].type = "LIKE"; actorId = bob.userId; postId = <postId>
  Side effects: notification row inserted for Alice

Automation:
  Target file:  src/tests/notif/notifications.integration.test.ts
```

---

```
TC-ID:         TC-NOTIF-002
Title:         Notifications returned in reverse-chronological order with unread flag
Feature:       NOTIF
Level:         API
Priority:      P2
Technique:     Functional

SUT Reference:
  Component:   notif-module
  Action:      GET /api/notifications

Preconditions:
  - Alice has 3 notifications: N1 (oldest, read), N2 (unread), N3 (newest, unread)

Steps:
  1. GET /api/notifications

Expected Output:
  Status:       200 OK
  Response:
    notifications[0].id = N3; notifications[0].read = false
    notifications[1].id = N2; notifications[1].read = false
    notifications[2].id = N1; notifications[2].read = true

Automation:
  Target file:  src/tests/notif/notifications.api.test.ts
```

---

## Traceability Matrix — TC → SC → FR

| TC-ID          | SC-ID         | FR Ref               |
|----------------|---------------|----------------------|
| TC-AUTH-001    | SC-AUTH-001   | FR-MB-001            |
| TC-AUTH-002    | SC-AUTH-002   | FR-MB-001            |
| TC-AUTH-003    | SC-AUTH-002   | FR-MB-001            |
| TC-AUTH-004    | SC-AUTH-003   | FR-MB-001            |
| TC-AUTH-005    | SC-AUTH-004   | FR-MB-001            |
| TC-AUTH-006    | SC-AUTH-008   | FR-MB-002            |
| TC-AUTH-007    | SC-AUTH-007   | FR-MB-001, FR-MB-008 |
| TC-AUTH-008    | SC-AUTH-011   | FR-MB-004            |
| TC-AUTH-009    | SC-AUTH-012   | FR-MB-005            |
| TC-AUTH-010    | SC-AUTH-014   | FR-MB-006            |
| TC-AUTH-011    | SC-AUTH-015   | FR-MB-007            |
| TC-POST-001    | SC-POST-001   | FR-MB-013            |
| TC-POST-002    | SC-POST-002   | FR-MB-013            |
| TC-POST-003    | SC-POST-005   | FR-MB-014            |
| TC-POST-004    | SC-POST-003   | FR-MB-015            |
| TC-POST-005    | SC-POST-004   | FR-MB-015            |
| TC-POST-006    | SC-POST-006   | FR-MB-013            |
| TC-POST-007    | SC-POST-008   | FR-MB-016            |
| TC-POST-008    | SC-POST-009   | FR-MB-017            |
| TC-LIKE-001    | SC-LIKE-001   | FR-MB-019            |
| TC-LIKE-002    | SC-LIKE-002   | FR-MB-020            |
| TC-LIKE-003    | SC-LIKE-003   | FR-MB-021            |
| TC-FOLLOW-001  | SC-FOLLOW-001 | FR-MB-022            |
| TC-FOLLOW-002  | SC-FOLLOW-003 | FR-MB-024            |
| TC-FOLLOW-003  | SC-FOLLOW-004 | FR-MB-025            |
| TC-FOLLOW-004  | SC-FOLLOW-006 | FR-MB-023            |
| TC-TIMELINE-001| SC-TIMELINE-001| FR-MB-026           |
| TC-TIMELINE-002| SC-TIMELINE-004| FR-MB-026           |
| TC-TIMELINE-003| SC-TIMELINE-002| FR-MB-026           |
| TC-TIMELINE-004| SC-TIMELINE-005| FR-MB-027           |
| TC-TIMELINE-005| SC-TIMELINE-012| FR-MB-026           |
| TC-NOTIF-001   | SC-NOTIF-001  | FR-MB-030            |
| TC-NOTIF-002   | SC-NOTIF-004  | FR-MB-033            |
