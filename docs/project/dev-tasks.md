# Developer Task Breakdown — MicroBlog Platform

> Format: DEV-MB-[SEQ] · Layers: DB | API | Domain | Frontend | Infra | Auth | Test hook
> Complexity: XS(<2h) S(2–4h) M(half-day) L(1 day) XL(spike needed)

---

## EPIC-MB-001 — Authentication & Identity

```
DEV-MB-001
Title:       Create users table schema and migration
Story:       US-MB-001
Layer:       DB
Description: Create `users` table: id (UUID PK), username (varchar 30 unique lowercase),
             email (varchar 255 unique), password_hash (varchar 255 NOT NULL),
             display_name (varchar 50 NOT NULL), bio (varchar 160), avatar_url (text),
             failed_login_attempts (int default 0), locked_until (timestamptz nullable),
             created_at (timestamptz), updated_at (timestamptz).
             Add unique indexes on username and email. Add index on created_at.

Acceptance Check:
  - Migration runs cleanly on fresh DB
  - Unique constraint on email enforced
  - Unique constraint on username enforced
  - password_hash column is NOT nullable

Dependencies:
  - Blocked by:  —
  - Blocks:      DEV-MB-002, DEV-MB-003

Complexity:   S
```

---

```
DEV-MB-002
Title:       Implement POST /api/auth/register endpoint
Story:       US-MB-001
Layer:       API
Description: Validate username (3–30 chars, lowercase alphanumeric+underscore), email (valid format),
             password (8–64 chars, ≥1 uppercase, ≥1 digit, ≥1 special). Hash password with bcrypt
             cost=12. Insert user record. Return 201 with userId, username, email, createdAt,
             accessToken (JWT 1h), refreshToken (opaque 30d). Return 409 EMAIL_ALREADY_EXISTS or
             USERNAME_TAKEN on duplicates. Never return password or hash in response.

Acceptance Check:
  - TC-AUTH-001 passes (happy path 201)
  - TC-AUTH-002 passes (username below min → 400)
  - TC-AUTH-004 passes (username above max → 400)
  - TC-AUTH-006 passes (duplicate email → 409)
  - Response body NEVER contains password or password_hash field

Dependencies:
  - Blocked by:  DEV-MB-001 (needs users table)
  - Blocks:      DEV-MB-003, DEV-MB-008

Complexity:   M
```

---

```
DEV-MB-003
Title:       Implement POST /api/auth/signin + JWT generation
Story:       US-MB-002
Layer:       API + Domain
Description: Accept email + password. Look up user by email. Verify password against bcrypt hash.
             Check locked_until — if locked, return 429 RATE_LIMIT_EXCEEDED. On success, reset
             failed_login_attempts to 0, return 200 with accessToken (JWT 1h, HS256) and
             refreshToken. On failure, increment failed_login_attempts; if count reaches 5,
             set locked_until = NOW() + 15 minutes. Return 401 with generic
             "Invalid email or password" — never reveal which field failed.

Acceptance Check:
  - TC-AUTH-008 passes (valid credentials → 200 + tokens)
  - TC-AUTH-009 passes (wrong password → 401 generic message)
  - TC-AUTH-010 passes (5 failures → 6th attempt returns 429)
  - Error message identical for wrong-password vs non-existent-email

Dependencies:
  - Blocked by:  DEV-MB-001
  - Blocks:      DEV-MB-004, DEV-MB-009

Complexity:   M
```

---

```
DEV-MB-004
Title:       Implement POST /api/auth/signout + token invalidation
Story:       US-MB-003
Layer:       API
Description: Accept Authorization: Bearer <accessToken>. Add the token's JTI (JWT ID) to a
             denylist (Redis SET with TTL matching token expiry). Return 200. Subsequent
             requests with the same token must return 401 UNAUTHENTICATED.

Acceptance Check:
  - TC-AUTH-011 passes (signout → subsequent request with same token returns 401)
  - Token cannot be reused after signout

Dependencies:
  - Blocked by:  DEV-MB-003, DEV-MB-037 (Redis setup)
  - Blocks:      —

Complexity:   S
```

---

```
DEV-MB-005
Title:       JWT authentication middleware
Story:       US-MB-001–003 (cross-cutting)
Layer:       Auth
Description: Express middleware that reads Authorization header, verifies JWT signature and
             expiry, checks JTI against Redis denylist. Attaches decoded userId to req.user.
             Returns 401 UNAUTHENTICATED if token missing, expired, invalid, or denylisted.
             Apply to all protected routes.

Acceptance Check:
  - SC-AUTH-016 passes (unauthenticated request to protected route → 401)
  - Expired tokens rejected
  - Denylisted tokens (after signout) rejected

Dependencies:
  - Blocked by:  DEV-MB-003, DEV-MB-037
  - Blocks:      DEV-MB-018, DEV-MB-029, DEV-MB-033 (all protected endpoints)

Complexity:   M
```

---

```
DEV-MB-006
Title:       Auth rate-limiter middleware (10 req/IP/min on auth endpoints)
Story:       US-MB-001–002 (NFR-SEC-006)
Layer:       Infra
Description: Apply express-rate-limit to POST /api/auth/register and POST /api/auth/signin.
             Limit: 10 requests per IP per minute. Return 429 RATE_LIMIT_EXCEEDED on breach.
             Threshold configurable via AUTH_RATE_LIMIT_MAX env var.

Acceptance Check:
  - 11th request from same IP within 1 minute returns 429
  - Threshold respects AUTH_RATE_LIMIT_MAX env var

Dependencies:
  - Blocked by:  DEV-MB-002, DEV-MB-003
  - Blocks:      —

Complexity:   S
```

---

```
DEV-MB-007
Title:       Register form UI component (/register page)
Story:       US-MB-001
Layer:       Frontend
Description: Build /register page (WF-MB-001). Form fields: username, email, password (with
             show/hide toggle). Client-side inline validation matching server rules. Disabled
             submit while form invalid. On success redirect to /home. On API error render
             field-level error messages from response. Use Button, Input components from
             design-system.md.

Acceptance Check:
  - Form submits only when all fields pass client-side validation
  - Error messages display inline below each field
  - Password visibility toggle works
  - Redirects to /home on 201 response

Dependencies:
  - Blocked by:  DEV-MB-002, DEV-MB-049 (App layout)
  - Blocks:      —

Complexity:   M
```

---

```
DEV-MB-008
Title:       Sign-in form UI component (/signin page)
Story:       US-MB-002
Layer:       Frontend
Description: Build /signin page (WF-MB-001). Fields: email, password. Show locked-account
             alert banner when API returns 429. Redirect to /home on 200. Show generic
             "Invalid email or password" error inline on 401.

Acceptance Check:
  - Generic error message shown on 401 (no field-level enumeration)
  - Locked-account banner appears on 429 with minutes remaining
  - Redirects to /home on 200

Dependencies:
  - Blocked by:  DEV-MB-003, DEV-MB-049
  - Blocks:      —

Complexity:   S
```

---

```
DEV-MB-009
Title:       Auth test fixtures and seed helpers
Story:       US-MB-001–003
Layer:       Test hook
Description: Create fixtures/auth/valid-register.ts (userAlice, userBob, userCarol, userDave,
             userCharlie, userExisting) with pre-hashed passwords. Create seed function that
             inserts users into test DB and returns auth tokens. Used by all test files.

Acceptance Check:
  - All six user fixtures can be seeded and return valid JWT tokens
  - Fixture cleanup resets DB state between tests

Dependencies:
  - Blocked by:  DEV-MB-001
  - Blocks:      All test files

Complexity:   S
```

---

## EPIC-MB-002 — User Profile

```
DEV-MB-010
Title:       GET /api/users/:username — public profile endpoint
Story:       US-MB-004
Layer:       API
Description: Return user's displayName, username, bio, avatarUrl, followerCount, followingCount,
             isFollowedByMe (if authenticated), joinedAt. Return user's posts array (paginated,
             reverse-chron). MUST NOT return email or IP in response.

Acceptance Check:
  - SC-PROFILE-001 passes (own profile returns all fields)
  - SC-PROFILE-002 passes (visitor — no auth — sees same public fields)
  - SC-PROFILE-008 passes (email never in response)

Dependencies:
  - Blocked by:  DEV-MB-001, DEV-MB-017 (posts table)
  - Blocks:      DEV-MB-013 (profile page needs this)

Complexity:   S
```

---

```
DEV-MB-011
Title:       PATCH /api/users/:id — update display name and bio
Story:       US-MB-005
Layer:       API
Description: Authenticated endpoint (own profile only). Accept displayName (1–50 chars) and/or
             bio (max 160 chars). Validate each field independently. Update DB. Return 200 with
             updated user object. Return 400 VALIDATION_ERROR on constraint violation.
             Return 403 if attempting to update another user's profile.

Acceptance Check:
  - SC-PROFILE-003 passes (update accepted → profile reflects new values)
  - SC-PROFILE-004 passes (bio > 160 chars → 400)
  - SC-PROFILE-005 passes (bio = 160 chars → 200)

Dependencies:
  - Blocked by:  DEV-MB-001, DEV-MB-005
  - Blocks:      DEV-MB-015

Complexity:   S
```

---

```
DEV-MB-012
Title:       Avatar upload endpoint and S3 resize pipeline
Story:       US-MB-005
Layer:       API + Infra
Description: POST /api/users/:id/avatar. Accept multipart/form-data. Validate file type (JPG/PNG)
             and size (≤5MB). Upload to S3 (LocalStack in test/dev). Resize to 400×400px using
             sharp library. Store CDN URL in users.avatar_url. Return updated avatarUrl.
             Return 400 on invalid file type or size.

Acceptance Check:
  - SC-PROFILE-006 passes (valid image → CDN URL returned)
  - SC-PROFILE-007 passes (invalid type → 400)
  - Avatar served via CDN URL (not direct S3 URL in production)

Dependencies:
  - Blocked by:  DEV-MB-001, DEV-MB-005
  - Blocks:      DEV-MB-013

Complexity:   M
```

---

```
DEV-MB-013
Title:       Profile page UI (/users/:username)
Story:       US-MB-004, US-MB-005
Layer:       Frontend
Description: Build profile page (WF-MB-004). ProfileHeader component: avatar, displayName,
             username, bio, joinedAt, follower/following counts, Follow/Edit Profile button.
             Tabs: Posts | Replies | Likes (Posts tab only in MVP). Post list below.
             Edit Profile panel (slide-over): displayName, bio, avatar upload.
             Follow/Unfollow button with optimistic update (FollowButton component from UI-MB-004).

Acceptance Check:
  - Own profile shows Edit Profile button; others show Follow/Following
  - Edit panel saves and reflects changes without page reload
  - Avatar upload previews before saving

Dependencies:
  - Blocked by:  DEV-MB-010, DEV-MB-011, DEV-MB-012, DEV-MB-050
  - Blocks:      —

Complexity:   M
```

---

## EPIC-MB-003 — Posts

```
DEV-MB-014
Title:       Create posts table schema and migration
Story:       US-MB-006
Layer:       DB
Description: Create `posts` table: id (UUID PK), author_id (UUID FK → users.id ON DELETE CASCADE),
             body (varchar 280 NOT NULL), parent_post_id (UUID FK → posts.id nullable, for replies),
             like_count (int default 0), reply_count (int default 0),
             created_at (timestamptz), updated_at (timestamptz).
             Add index on author_id. Add index on created_at DESC (for explore feed).
             Add index on parent_post_id (for thread queries).

Acceptance Check:
  - Migration runs cleanly
  - author_id FK with CASCADE delete verified
  - parent_post_id nullable, self-referencing FK

Dependencies:
  - Blocked by:  DEV-MB-001
  - Blocks:      DEV-MB-015, DEV-MB-016, DEV-MB-017

Complexity:   S
```

---

```
DEV-MB-015
Title:       Implement POST /api/posts — create post
Story:       US-MB-006
Layer:       API
Description: Authenticated. Validate body: 1–280 chars, strip leading/trailing whitespace, reject
             whitespace-only. Check rate limit (100 posts/hr per member via Redis counter).
             Insert post. Emit PostCreated event to BullMQ queue for fan-out worker.
             Return 201 with postId, body, authorId, likeCount=0, replyCount=0, createdAt.

Acceptance Check:
  - TC-POST-001 passes (1 char body → 201)
  - TC-POST-002 passes (280 char body → 201)
  - TC-POST-003 passes (281 chars → 400 POST_TOO_LONG)
  - TC-POST-004 passes (empty → 400 POST_EMPTY)
  - TC-POST-005 passes (whitespace only → 400 POST_EMPTY)
  - TC-POST-006 passes (unauthenticated → 401)

Dependencies:
  - Blocked by:  DEV-MB-014, DEV-MB-005, DEV-MB-026 (BullMQ)
  - Blocks:      DEV-MB-020, DEV-MB-018

Complexity:   S
```

---

```
DEV-MB-016
Title:       Implement DELETE /api/posts/:postId — delete post
Story:       US-MB-007
Layer:       API
Description: Authenticated. Verify post exists (404 if not). Verify req.user.id === post.author_id
             (403 FORBIDDEN if not). Delete post from DB. Emit PostDeleted event to BullMQ for
             Redis cleanup. Return 204 No Content.

Acceptance Check:
  - TC-POST-007 passes (author deletes own post → 204, post absent from timeline)
  - TC-POST-008 passes (non-author → 403)
  - 404 returned for non-existent postId

Dependencies:
  - Blocked by:  DEV-MB-014, DEV-MB-005
  - Blocks:      —

Complexity:   S
```

---

```
DEV-MB-017
Title:       Implement GET /api/posts/:postId — post detail with replies
Story:       US-MB-014
Layer:       API
Description: Public endpoint (no auth required). Return post object + replies array
             (posts where parent_post_id = postId, ordered by created_at ASC).
             likedByMe = true if authenticated user has liked this post.
             Return 404 if post not found.

Acceptance Check:
  - SC-TIMELINE-008 passes (post + 3 replies returned)
  - Unauthenticated visitor sees post and replies (no likedByMe field)
  - 404 for non-existent postId

Dependencies:
  - Blocked by:  DEV-MB-014
  - Blocks:      DEV-MB-021

Complexity:   S
```

---

```
DEV-MB-018
Title:       Reply to post — parentPostId support in POST /api/posts
Story:       US-MB-008
Layer:       API
Description: Extend POST /api/posts to accept optional parentPostId. If provided, validate
             parent exists (404 if not). Set post.parent_post_id. Increment parent's reply_count.
             Same body validation (1–280 chars) applies.

Acceptance Check:
  - SC-POST-011 passes (reply linked to parentPostId)
  - SC-POST-012 passes (reply to non-existent parent → 404)
  - Parent's replyCount incremented

Dependencies:
  - Blocked by:  DEV-MB-015
  - Blocks:      DEV-MB-021

Complexity:   S
```

---

```
DEV-MB-019
Title:       Post rate limiter (100 posts/hr per member)
Story:       US-MB-006 (NFR-SEC-007)
Layer:       Infra
Description: Redis sliding window counter: key = post_rate:{userId}, TTL 1 hour. Increment on
             each POST /api/posts. Reject with 429 RATE_LIMIT_EXCEEDED when count exceeds 100.
             Configurable via POST_RATE_LIMIT_MAX env var.

Acceptance Check:
  - 101st post within 1 hour returns 429
  - Counter resets after 1 hour window
  - Respects POST_RATE_LIMIT_MAX env var

Dependencies:
  - Blocked by:  DEV-MB-015, DEV-MB-037
  - Blocks:      —

Complexity:   XS
```

---

```
DEV-MB-020
Title:       BullMQ fan-out worker (PostCreated → follower timelines)
Story:       US-MB-006 (FR-MB-018)
Layer:       Domain + Infra
Description: Worker listens to PostCreated queue events {postId, authorId}. Queries
             follows table for all follower_ids of authorId. For each follower, prepend
             postId to Redis list key `timeline:{followerId}` (LPUSH). Cap list at 1000
             items (LTRIM). Also handles PostDeleted: remove postId from all affected
             timeline lists. Worker must be independently deployable.

Acceptance Check:
  - TC-POST-007 (fan-out): post appears in follower's timeline within 5 seconds
  - Deleted post removed from all Redis timeline lists
  - Worker failure does NOT affect POST /api/posts response

Dependencies:
  - Blocked by:  DEV-MB-014, DEV-MB-030, DEV-MB-037
  - Blocks:      DEV-MB-028 (timeline endpoint needs the Redis lists)

Complexity:   L
```

---

```
DEV-MB-021
Title:       PostCard UI component
Story:       US-MB-006, US-MB-009 (UI-MB-001)
Layer:       Frontend
Description: Build PostCard component per UI-MB-001 spec. Props: postId, author, body, createdAt,
             likeCount, replyCount, likedByMe, isOwn. Action bar: Reply (💬), Like (❤ with fill),
             Delete menu (own posts only). Optimistic like toggle. Relative time display.
             Full card clickable → /posts/:postId. Touch targets ≥44px.

Acceptance Check:
  - Like toggles immediately (optimistic); reverts on API error
  - Delete option only visible on own posts
  - Accessible: aria-pressed on Like, aria-label on all buttons
  - Dark mode renders correctly

Dependencies:
  - Blocked by:  DEV-MB-050 (design system atoms: Button, Avatar)
  - Blocks:      DEV-MB-023, DEV-MB-024

Complexity:   M
```

---

```
DEV-MB-022
Title:       ComposeArea UI component (inline + modal + reply variants)
Story:       US-MB-006, US-MB-008 (UI-MB-002)
Layer:       Frontend
Description: Three variants: inline (home feed top), modal (desktop compose button), reply-inline
             (thread view). Character counter with colour thresholds (0–239 grey, 240–279 yellow,
             280 green, 281+ red). Post button disabled when empty or >280. Ctrl/Cmd+Enter submits.
             aria-live counter.

Acceptance Check:
  - Post button disabled on empty or >280
  - Counter turns red and shows negative remaining on overflow
  - Ctrl/Cmd+Enter submits form
  - aria-live announces character count

Dependencies:
  - Blocked by:  DEV-MB-050
  - Blocks:      DEV-MB-023, DEV-MB-024

Complexity:   M
```

---

```
DEV-MB-023
Title:       Thread view page (/posts/:postId)
Story:       US-MB-014
Layer:       Frontend
Description: Build thread view (WF-MB-006): parent post (full PostCard), reply compose
             (if authenticated), replies list (PostCard for each). Back navigation. Public
             (accessible without auth; compose hidden for visitors).

Acceptance Check:
  - Replies display threaded below parent
  - Reply compose shows only for authenticated members
  - Back button returns to previous page

Dependencies:
  - Blocked by:  DEV-MB-021, DEV-MB-022, DEV-MB-017
  - Blocks:      —

Complexity:   S
```

---

```
DEV-MB-024
Title:       Post test fixtures
Story:       US-MB-006–008
Layer:       Test hook
Description: Create fixtures/posts/posts.ts: postByBob1, postByBob2, postByCarol1, postByDave1,
             postByAlice1, replyToB1. Seed function creates posts in DB and returns IDs.

Acceptance Check:
  - All fixtures seed without constraint errors
  - replyToB1 correctly references postByBob1 as parentPostId

Dependencies:
  - Blocked by:  DEV-MB-009, DEV-MB-014
  - Blocks:      All post-related tests

Complexity:   XS
```

---

## EPIC-MB-004 — Social Engagement

```
DEV-MB-025
Title:       Create likes table schema and migration
Story:       US-MB-009
Layer:       DB
Description: Create `likes` table: id (UUID PK), user_id (UUID FK → users.id),
             post_id (UUID FK → posts.id). Add UNIQUE constraint on (user_id, post_id).
             Add indexes on post_id and user_id.

Acceptance Check:
  - Duplicate (user_id, post_id) pair rejected by DB constraint
  - Migration runs cleanly

Dependencies:
  - Blocked by:  DEV-MB-014
  - Blocks:      DEV-MB-026, DEV-MB-027

Complexity:   XS
```

---

```
DEV-MB-026
Title:       POST /api/posts/:postId/likes — like a post
Story:       US-MB-009
Layer:       API
Description: Authenticated. Check post exists (404 if not). Insert like record. Increment
             posts.like_count. Return 201. On duplicate like (DB unique constraint violation),
             return 409 ALREADY_LIKED.

Acceptance Check:
  - TC-LIKE-001 passes (first like → 201, count +1)
  - TC-LIKE-003 passes (duplicate like → 409)
  - TC-LIKE-004 passes (unauthenticated → 401 — via DEV-MB-005 middleware)
  - TC-LIKE-005 passes (non-existent post → 404)

Dependencies:
  - Blocked by:  DEV-MB-025, DEV-MB-005
  - Blocks:      DEV-MB-029

Complexity:   S
```

---

```
DEV-MB-027
Title:       DELETE /api/posts/:postId/likes — unlike a post
Story:       US-MB-009
Layer:       API
Description: Authenticated. Delete like record for (req.user.id, postId). Decrement
             posts.like_count. Return 204. Return 404 if like record not found.

Acceptance Check:
  - TC-LIKE-002 passes (unlike → 204, count -1)
  - likedByMe = false after unlike

Dependencies:
  - Blocked by:  DEV-MB-025, DEV-MB-005
  - Blocks:      —

Complexity:   S
```

---

```
DEV-MB-028
Title:       Create follows table schema and migration
Story:       US-MB-010
Layer:       DB
Description: Create `follows` table: id (UUID PK), follower_id (UUID FK → users.id),
             following_id (UUID FK → users.id). Add UNIQUE constraint on (follower_id, following_id).
             Add CHECK constraint: follower_id ≠ following_id. Add indexes on both FK columns.

Acceptance Check:
  - (follower_id, following_id) unique constraint enforced
  - Self-follow rejected by CHECK constraint
  - Migration runs cleanly

Dependencies:
  - Blocked by:  DEV-MB-001
  - Blocks:      DEV-MB-029, DEV-MB-030, DEV-MB-020

Complexity:   XS
```

---

```
DEV-MB-029
Title:       POST /api/follows — follow a user
Story:       US-MB-010
Layer:       API
Description: Authenticated. Reject self-follow (403 FORBIDDEN). Check target exists (404 if not).
             Insert follow record. Increment target's users.follower_count (denormalised).
             Return 201. On duplicate follow, return 409 ALREADY_FOLLOWING.

Acceptance Check:
  - TC-FOLLOW-001 passes (follow → 201, target follower_count +1)
  - TC-FOLLOW-002 passes (self-follow → 403)
  - TC-FOLLOW-003 passes (duplicate → 409)

Dependencies:
  - Blocked by:  DEV-MB-028, DEV-MB-005
  - Blocks:      DEV-MB-031

Complexity:   S
```

---

```
DEV-MB-030
Title:       DELETE /api/follows/:targetId — unfollow a user
Story:       US-MB-010
Layer:       API
Description: Authenticated. Delete follow record. Decrement target's follower_count.
             Return 204. Return 404 if follow record not found.

Acceptance Check:
  - TC-FOLLOW-004 passes (unfollow → 204; target's new posts absent from timeline)
  - follower_count decremented correctly

Dependencies:
  - Blocked by:  DEV-MB-028, DEV-MB-005
  - Blocks:      —

Complexity:   S
```

---

```
DEV-MB-031
Title:       GET /api/users/:username/followers and /following lists
Story:       US-MB-011
Layer:       API
Description: Public endpoint. Return paginated list of follower or following users
             (username, displayName, avatarUrl, isFollowedByMe). Paginated cursor, limit 20.

Acceptance Check:
  - SC-PROFILE-001 passes (followers list returned)
  - isFollowedByMe correctly set for authenticated caller

Dependencies:
  - Blocked by:  DEV-MB-028
  - Blocks:      —

Complexity:   S
```

---

```
DEV-MB-032
Title:       FollowButton UI component with optimistic update
Story:       US-MB-010 (UI-MB-004)
Layer:       Frontend
Description: FollowButton component per UI-MB-004 spec. States: Follow (primary solid), Following
             (outline), Following hover → Unfollow (red border). Optimistic toggle on click.
             Revert + toast on API error. Not rendered on own profile.

Acceptance Check:
  - Hover on Following shows "Unfollow" with red styling
  - Optimistic update reverts on API error with toast
  - Not rendered when isOwnProfile=true

Dependencies:
  - Blocked by:  DEV-MB-050
  - Blocks:      DEV-MB-013

Complexity:   S
```

---

## EPIC-MB-005 — Timeline & Discovery

```
DEV-MB-033
Title:       Redis timeline store setup and infrastructure
Story:       US-MB-012 (NFR-PERF-002)
Layer:       Infra
Description: Configure Redis 7 connection (ioredis). Define timeline key schema:
             `timeline:{userId}` as Redis LIST of postIds. Define TTL strategy (no expiry on
             list; individual item insertion via LPUSH + LTRIM to 1000). Add Redis to
             Docker Compose. Create test helper to seed and clear timeline lists.

Acceptance Check:
  - LPUSH + LRANGE operations work correctly in integration tests
  - Redis available in Docker Compose local environment
  - Test helper clears lists between tests

Dependencies:
  - Blocked by:  —
  - Blocks:      DEV-MB-004, DEV-MB-020, DEV-MB-034

Complexity:   M
```

---

```
DEV-MB-034
Title:       GET /api/timeline — home feed with cursor pagination
Story:       US-MB-012
Layer:       API
Description: Authenticated. Read postIds from Redis LIST `timeline:{userId}` using cursor-based
             pagination (LRANGE with offset). Batch-fetch post objects from PostgreSQL by IDs.
             Enrich with likedByMe flag. Return {posts[], nextCursor}. Return empty array if
             timeline is empty. Validate limit (1–50, default 20).

Acceptance Check:
  - TC-TIMELINE-001 passes (followed-user posts only, newest first)
  - TC-TIMELINE-002 passes (25 posts → page of 20 + nextCursor)
  - TC-TIMELINE-003 passes (empty timeline → posts=[])
  - TC-TIMELINE-005 passes (limit=0 → 400)

Dependencies:
  - Blocked by:  DEV-MB-033, DEV-MB-005, DEV-MB-014
  - Blocks:      DEV-MB-038

Complexity:   M
```

---

```
DEV-MB-035
Title:       GET /api/explore — public posts feed
Story:       US-MB-013
Layer:       API
Description: Public endpoint (no auth required). Query posts table ORDER BY created_at DESC.
             Cursor-based pagination (created_at + id as compound cursor). Return {posts[], nextCursor}.
             Email and IP must not appear in response.

Acceptance Check:
  - TC-TIMELINE-004 passes (unauthenticated → 200 with public posts)
  - email field absent from all post.author objects
  - Cursor pagination works correctly

Dependencies:
  - Blocked by:  DEV-MB-014
  - Blocks:      DEV-MB-039

Complexity:   S
```

---

```
DEV-MB-036
Title:       GET /api/search?q= — keyword search (posts + users)
Story:       US-MB-013
Layer:       API
Description: Public endpoint. Full-text search on posts.body (PostgreSQL ILIKE or tsvector index).
             Search on users.username and users.display_name (ILIKE). Return {posts[], users[]}.
             Both arrays empty if no matches (200, not 404). Paginated, newest match first.

Acceptance Check:
  - SC-TIMELINE-006 passes (matching posts and users returned)
  - SC-TIMELINE-007 passes (no matches → empty arrays, 200)
  - email never in response

Dependencies:
  - Blocked by:  DEV-MB-014, DEV-MB-001
  - Blocks:      —

Complexity:   M
```

---

```
DEV-MB-037
Title:       Home timeline page UI (/home)
Story:       US-MB-012 (WF-MB-002)
Layer:       Frontend
Description: Home page: ComposeArea at top, new-posts banner (UI-MB-006), infinite-scroll post
             list using GET /api/timeline. Empty state component with "Browse Explore" CTA.
             New-posts banner polls every 30s; clicking loads new posts at top. Mobile: FAB
             compose button.

Acceptance Check:
  - Empty state shows prompt with link to /explore
  - New-posts banner appears when new posts available
  - Infinite scroll loads next page on scroll near bottom

Dependencies:
  - Blocked by:  DEV-MB-021, DEV-MB-022, DEV-MB-034, DEV-MB-050
  - Blocks:      —

Complexity:   M
```

---

```
DEV-MB-038
Title:       Explore page UI (/explore) + Search results
Story:       US-MB-013 (WF-MB-005)
Layer:       Frontend
Description: Explore page: search bar at top (calls GET /api/search on input debounce 300ms).
             Default state: latest public posts from GET /api/explore. Search results state:
             "People" section + "Posts" section. Empty search results message.

Acceptance Check:
  - Default state shows explore feed
  - Search results show people + posts sections
  - Empty search shows helpful empty state message

Dependencies:
  - Blocked by:  DEV-MB-035, DEV-MB-036, DEV-MB-021, DEV-MB-050
  - Blocks:      —

Complexity:   M
```

---

```
DEV-MB-039
Title:       New posts banner component (UI-MB-006)
Story:       US-MB-012
Layer:       Frontend
Description: Sticky banner at top of feed (WF-MB-002). Blue background, white text: "↑ Show N
             new posts". Slides down on appearance (motion animation, 200ms). Dismisses after
             clicking (loads new posts). Polls for new posts every 30 seconds via GET /api/timeline
             with since= param.

Acceptance Check:
  - Banner appears when new posts are available
  - Clicking banner inserts new posts at top of feed and dismisses banner
  - respects prefers-reduced-motion

Dependencies:
  - Blocked by:  DEV-MB-034
  - Blocks:      —

Complexity:   S
```

---

## EPIC-MB-006 — Notifications

```
DEV-MB-040
Title:       Create notifications table schema and migration
Story:       US-MB-015
Layer:       DB
Description: Create `notifications` table: id (UUID PK), recipient_id (UUID FK → users.id),
             actor_id (UUID FK → users.id), type (ENUM: LIKE | REPLY | FOLLOW), post_id (UUID
             FK → posts.id nullable), read (boolean default false),
             created_at (timestamptz). Add index on (recipient_id, created_at DESC).
             Add index on (recipient_id, read). Retention: add created_at < NOW() - INTERVAL 30 days
             cleanup job (optional in MVP).

Acceptance Check:
  - Migration runs cleanly
  - ENUM type enforced for notification type
  - Index on recipient_id + created_at verified

Dependencies:
  - Blocked by:  DEV-MB-014, DEV-MB-001
  - Blocks:      DEV-MB-041

Complexity:   XS
```

---

```
DEV-MB-041
Title:       Notification service — create notifications on social events
Story:       US-MB-015
Layer:       Domain
Description: BullMQ consumers: (1) LikeCreated → create LIKE notification for post.author_id
             if actor ≠ author. (2) ReplyCreated → create REPLY notification for parent post
             author if actor ≠ author. (3) FollowCreated → create FOLLOW notification for
             following_id. No notification created for self-actions.

Acceptance Check:
  - TC-NOTIF-001 passes (like → notification for post author)
  - SC-NOTIF-002 passes (reply → notification)
  - SC-NOTIF-003 passes (follow → notification)
  - SC-NOTIF-005 passes (self-like → no notification)

Dependencies:
  - Blocked by:  DEV-MB-040, DEV-MB-026, DEV-MB-029
  - Blocks:      DEV-MB-042

Complexity:   M
```

---

```
DEV-MB-042
Title:       GET /api/notifications — paginated notifications list
Story:       US-MB-015
Layer:       API
Description: Authenticated. Return notifications for req.user.id ordered by created_at DESC.
             Each notification: id, type, actor (username, avatarUrl), postId (if applicable),
             read, createdAt. Cursor-based pagination, limit 20. Mark returned notifications
             as read in background (PATCH in bulk after response sent).

Acceptance Check:
  - TC-NOTIF-002 passes (reverse-chron, unread items have read=false)
  - Unauthenticated request → 401

Dependencies:
  - Blocked by:  DEV-MB-041, DEV-MB-005
  - Blocks:      DEV-MB-043

Complexity:   S
```

---

```
DEV-MB-043
Title:       Notifications page UI (/notifications)
Story:       US-MB-015 (WF-MB-007)
Layer:       Frontend
Description: Notification list (WF-MB-007). Unread items: blue left border accent. Read items:
             muted. NotifItem component: actor avatar, description text, relative time.
             Empty state. Notification badge on nav shows unread count (polled every 60s).

Acceptance Check:
  - Unread notifications visually distinct from read
  - Clicking a notification item marks it read and navigates to relevant post/profile
  - Badge count updates after marking items read

Dependencies:
  - Blocked by:  DEV-MB-042, DEV-MB-050
  - Blocks:      —

Complexity:   S
```

---

## Infrastructure & App Shell

```
DEV-MB-044
Title:       Notification badge counter on navigation
Story:       US-MB-015 (UI-MB-003)
Layer:       Frontend
Description: Fetch unread notification count from GET /api/notifications/count every 60s.
             Display badge on bell icon in LeftSidebar and BottomNav. Badge: 20px circle,
             red background, white text. Shows "9+" if count > 9.

Acceptance Check:
  - Badge appears when unread count > 0
  - Badge clears after visiting /notifications
  - Accessible: aria-label="Notifications, {n} unread"

Dependencies:
  - Blocked by:  DEV-MB-042, DEV-MB-050
  - Blocks:      —

Complexity:   XS
```

---

```
DEV-MB-045
Title:       Docker Compose setup (postgres + redis + app + worker)
Story:       Cross-cutting (NFR-REL-002)
Layer:       Infra
Description: docker-compose.yml with services: postgres:15, redis:7, app (Next.js + Express),
             fanout-worker (separate Node process). Environment variables from .env.example.
             Health checks on all services. Volumes for postgres data persistence.

Acceptance Check:
  - docker compose up starts all services without errors
  - App connects to postgres and redis on startup
  - Fan-out worker starts and connects to BullMQ queue

Dependencies:
  - Blocked by:  —
  - Blocks:      All development

Complexity:   M
```

---

```
DEV-MB-046
Title:       App layout — 3-column desktop, icon sidebar tablet, bottom nav mobile
Story:       Cross-cutting (WF-MB-002, UI-MB-003)
Layer:       Frontend
Description: AppLayout component from design-system.md. Left sidebar (240px, ≥1280px):
             logo, nav items with active state, New Post button, user footer. Icon sidebar
             (72px, 768–1279px): icons only, FAB compose. Bottom nav (< 768px): 4 tabs.
             Protected route wrapper: redirect to /signin if unauthenticated.

Acceptance Check:
  - Layout correct at 375px, 768px, 1280px, 1440px
  - Active nav item highlighted
  - Protected routes redirect to /signin

Dependencies:
  - Blocked by:  DEV-MB-007, DEV-MB-008 (auth forms must exist)
  - Blocks:      All page components

Complexity:   M
```
