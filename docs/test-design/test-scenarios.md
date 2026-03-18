# Test Scenarios — MicroBlog Platform

> Source: `docs/requirements/requirements.md`
> Covers: FR-MB-001 through FR-MB-033 · NFR-SEC, NFR-PERF, NFR-COMP

---

## Feature: AUTH — Registration, Sign In, Sign Out

| SC-ID        | Scenario                                                                  | Precondition                        | Expected                                          | Priority | Type        | FR Ref              |
|--------------|---------------------------------------------------------------------------|-------------------------------------|---------------------------------------------------|----------|-------------|---------------------|
| SC-AUTH-001  | Successful registration with all valid fields                             | No existing account with this email/username | Account created; access + refresh tokens returned | High     | Functional  | FR-MB-001           |
| SC-AUTH-002  | Registration rejected when username is below minimum length (< 3 chars)  | None                                | 400 VALIDATION_ERROR on username field            | High     | Boundary    | FR-MB-001           |
| SC-AUTH-003  | Registration rejected when username exceeds maximum length (> 30 chars)  | None                                | 400 VALIDATION_ERROR on username field            | High     | Boundary    | FR-MB-001           |
| SC-AUTH-004  | Registration rejected when username contains invalid characters (spaces/symbols) | None                         | 400 VALIDATION_ERROR on username field            | High     | Negative    | FR-MB-001           |
| SC-AUTH-005  | Registration rejected when email format is invalid                        | None                                | 400 VALIDATION_ERROR on email field               | High     | Negative    | FR-MB-001           |
| SC-AUTH-006  | Registration rejected when password is below minimum length (< 8 chars)  | None                                | 400 VALIDATION_ERROR on password field            | High     | Boundary    | FR-MB-001           |
| SC-AUTH-007  | Registration rejected when password lacks required character types        | None                                | 400 VALIDATION_ERROR on password field            | High     | Negative    | FR-MB-001           |
| SC-AUTH-008  | Registration rejected when email is already registered                    | Account with same email exists      | 409 EMAIL_ALREADY_EXISTS                          | High     | Negative    | FR-MB-002           |
| SC-AUTH-009  | Registration rejected when username is already taken                      | Account with same username exists   | 409 USERNAME_TAKEN                                | High     | Negative    | FR-MB-003           |
| SC-AUTH-010  | Password is never returned in any registration response                   | None                                | Response body contains no password or hash field  | High     | Security    | FR-MB-008           |
| SC-AUTH-011  | Successful sign-in with valid credentials                                 | Account exists and is active        | 200 with new access token + refresh token         | High     | Functional  | FR-MB-004           |
| SC-AUTH-012  | Sign-in rejected with wrong password                                      | Account exists                      | 401 generic message — does not reveal field       | High     | Negative    | FR-MB-005           |
| SC-AUTH-013  | Sign-in rejected with unregistered email                                  | No account with email               | 401 same generic message as wrong password        | High     | Security    | FR-MB-005           |
| SC-AUTH-014  | Account is locked after 5 consecutive failed sign-in attempts             | Account exists                      | 6th attempt returns 429 RATE_LIMIT_EXCEEDED with lock message | High | State   | FR-MB-006           |
| SC-AUTH-015  | Successful sign-out invalidates the session token                         | Member is authenticated             | 200; subsequent request with same token returns 401 | High   | Functional  | FR-MB-007           |
| SC-AUTH-016  | Unauthenticated request to protected endpoint is rejected                 | No auth header                      | 401 UNAUTHENTICATED                               | High     | Security    | FR-MB-007           |

---

## Feature: PROFILE — View and Edit

| SC-ID         | Scenario                                                                  | Precondition                             | Expected                                                            | Priority | Type        | FR Ref     |
|---------------|---------------------------------------------------------------------------|------------------------------------------|---------------------------------------------------------------------|----------|-------------|------------|
| SC-PROFILE-001| Authenticated member views their own profile page                        | Member has posts, followers, following    | Returns avatar, displayName, username, bio, follower/following count, posts | High | Functional | FR-MB-009  |
| SC-PROFILE-002| Visitor views a public profile page                                       | Target account exists                    | Same profile data returned without auth token                        | High     | Functional  | FR-MB-009  |
| SC-PROFILE-003| Successful profile update — display name and bio                         | Member authenticated                     | 200; profile reflects new values immediately                         | High     | Functional  | FR-MB-010  |
| SC-PROFILE-004| Profile update rejected when bio exceeds 160 characters                  | Member authenticated                     | 400 VALIDATION_ERROR on bio field                                    | High     | Boundary    | FR-MB-011  |
| SC-PROFILE-005| Profile update accepted at bio boundary (160 chars exactly)              | Member authenticated                     | 200; bio saved as 160 chars                                          | High     | Boundary    | FR-MB-011  |
| SC-PROFILE-006| Avatar upload accepted for valid JPG/PNG under 5 MB                     | Member authenticated                     | 200; avatarUrl is a CDN URL pointing to resized image                | Medium   | Functional  | FR-MB-012  |
| SC-PROFILE-007| Avatar upload rejected for unsupported file type                         | Member authenticated                     | 400 VALIDATION_ERROR on avatar field                                 | Medium   | Negative    | FR-MB-012  |
| SC-PROFILE-008| Email is not exposed in public profile response                          | Any caller                               | Response body contains no email field                                | High     | Security    | NFR-COMP-003|

---

## Feature: POST — Create, Delete, Reply

| SC-ID      | Scenario                                                                  | Precondition                         | Expected                                                         | Priority | Type        | FR Ref              |
|------------|---------------------------------------------------------------------------|--------------------------------------|------------------------------------------------------------------|----------|-------------|---------------------|
| SC-POST-001| Member creates a valid post (1 char body)                                 | Member authenticated                 | 201; post returned with postId, body, authorId, likeCount=0      | High     | Boundary    | FR-MB-013           |
| SC-POST-002| Member creates a valid post (280 char body — max boundary)               | Member authenticated                 | 201 post created                                                  | High     | Boundary    | FR-MB-013           |
| SC-POST-003| Post rejected when body is empty string                                   | Member authenticated                 | 400 POST_EMPTY                                                   | High     | Negative    | FR-MB-015           |
| SC-POST-004| Post rejected when body is whitespace only                                | Member authenticated                 | 400 POST_EMPTY                                                   | High     | Negative    | FR-MB-015           |
| SC-POST-005| Post rejected when body is 281 characters (exceeds max)                  | Member authenticated                 | 400 POST_TOO_LONG                                                | High     | Boundary    | FR-MB-014           |
| SC-POST-006| Post creation rejected for unauthenticated request                        | No auth token                        | 401 UNAUTHENTICATED                                              | High     | Security    | FR-MB-013           |
| SC-POST-007| Created post is fan-fanned out to followers' timelines                   | Author has at least one follower     | Follower's timeline contains new post within 5 seconds           | High     | Integration | FR-MB-018           |
| SC-POST-008| Member deletes their own post                                             | Member is author of the post         | 204; post not returned in profile or any timeline                | High     | Functional  | FR-MB-016           |
| SC-POST-009| Delete request for another member's post is rejected                     | Member authenticated; post belongs to other member | 403 FORBIDDEN                                      | High     | Security    | FR-MB-017           |
| SC-POST-010| Delete request for non-existent post returns 404                         | Member authenticated                 | 404 NOT_FOUND                                                    | Medium   | Negative    | FR-MB-016           |
| SC-POST-011| Member replies to a post (parentPostId set)                              | Member authenticated; parent post exists | 201; reply linked to parentPostId; appears in thread         | Medium   | Functional  | FR-MB-013           |
| SC-POST-012| Reply to non-existent parent post is rejected                            | Member authenticated                 | 404 NOT_FOUND                                                    | Medium   | Negative    | FR-MB-013           |

---

## Feature: LIKE — Like and Unlike

| SC-ID      | Scenario                                                                  | Precondition                         | Expected                                          | Priority | Type        | FR Ref     |
|------------|---------------------------------------------------------------------------|--------------------------------------|---------------------------------------------------|----------|-------------|------------|
| SC-LIKE-001| Member likes a post they have not previously liked                       | Member authenticated; post exists    | 201; likeCount incremented by 1                   | High     | Functional  | FR-MB-019  |
| SC-LIKE-002| Member unlikes a post they have previously liked                         | Member has liked the post            | 204; likeCount decremented by 1                   | High     | Functional  | FR-MB-020  |
| SC-LIKE-003| Duplicate like on the same post is rejected                              | Member has already liked the post    | 409 ALREADY_LIKED                                 | High     | Negative    | FR-MB-021  |
| SC-LIKE-004| Like request from unauthenticated visitor is rejected                    | No auth token                        | 401 UNAUTHENTICATED                               | High     | Security    | FR-MB-019  |
| SC-LIKE-005| Like on non-existent post returns 404                                    | Member authenticated                 | 404 NOT_FOUND                                     | Medium   | Negative    | FR-MB-019  |
| SC-LIKE-006| Previously liked post shows active like state on re-fetch                | Member has liked the post            | Response includes `likedByMe: true`               | High     | State       | FR-MB-019  |

---

## Feature: FOLLOW — Follow and Unfollow

| SC-ID        | Scenario                                                                  | Precondition                         | Expected                                          | Priority | Type        | FR Ref     |
|--------------|---------------------------------------------------------------------------|--------------------------------------|---------------------------------------------------|----------|-------------|------------|
| SC-FOLLOW-001| Member follows another member                                             | Both accounts exist; not yet following | 201; follower_count of target incremented       | High     | Functional  | FR-MB-022  |
| SC-FOLLOW-002| Member unfollows a member they follow                                     | Follow relationship exists           | 204; follower_count of target decremented         | High     | Functional  | FR-MB-023  |
| SC-FOLLOW-003| Self-follow attempt is rejected                                           | Member authenticated                 | 403 FORBIDDEN                                     | High     | Security    | FR-MB-024  |
| SC-FOLLOW-004| Duplicate follow is rejected                                              | Follow relationship already exists   | 409 ALREADY_FOLLOWING                             | High     | Negative    | FR-MB-025  |
| SC-FOLLOW-005| Follow request for non-existent user returns 404                         | Member authenticated                 | 404 NOT_FOUND                                     | Medium   | Negative    | FR-MB-022  |
| SC-FOLLOW-006| After unfollowing, new posts from unfollowed user do not appear in timeline | Unfollow completed                 | New posts from that user absent from home timeline| High     | Integration | FR-MB-023  |

---

## Feature: TIMELINE — Home Feed, Explore, Search, Thread

| SC-ID          | Scenario                                                                  | Precondition                                   | Expected                                                         | Priority | Type        | FR Ref     |
|----------------|---------------------------------------------------------------------------|------------------------------------------------|------------------------------------------------------------------|----------|-------------|------------|
| SC-TIMELINE-001| Home timeline returns posts from followed users in reverse-chron order   | Member follows at least 2 users with posts     | Posts from followed users only, newest first                     | High     | Functional  | FR-MB-026  |
| SC-TIMELINE-002| Home timeline is empty with prompt for member who follows no one         | Member has no follows                          | Empty posts array; prompt message present                        | High     | Functional  | FR-MB-026  |
| SC-TIMELINE-003| Home timeline does not include own posts or posts from unfollowed users  | Member has own posts and posts from non-followed users exist | Only followed-user posts returned             | High     | Functional  | FR-MB-026  |
| SC-TIMELINE-004| Home timeline paginates at 20 posts per page                             | Followed user has 25 posts                     | First page returns 20; second page returns 5; nextCursor is null | High     | Boundary    | FR-MB-026  |
| SC-TIMELINE-005| Explore feed returns all public posts (no auth required)                 | Multiple members have posts                    | 200; all public posts returned newest-first                      | High     | Functional  | FR-MB-027  |
| SC-TIMELINE-006| Search returns posts and users matching keyword                          | Posts and users exist with matching content    | Posts containing keyword + users with matching name returned     | Medium   | Functional  | FR-MB-028  |
| SC-TIMELINE-007| Search with keyword that matches nothing returns empty results           | No matching content                            | 200 with empty arrays; no 404                                    | Medium   | Negative    | FR-MB-028  |
| SC-TIMELINE-008| Post detail view returns the post and all its direct replies             | Post with 3 replies exists                     | Post body + all 3 reply objects in thread array                  | High     | Functional  | FR-MB-029  |
| SC-TIMELINE-009| Home timeline rejected for unauthenticated request                       | No auth token                                  | 401 UNAUTHENTICATED                                              | High     | Security    | FR-MB-026  |
| SC-TIMELINE-010| Timeline limit boundary — limit=1 returns exactly one post              | Multiple posts in timeline                     | 200; posts array has exactly 1 item; nextCursor present          | Medium   | Boundary    | FR-MB-026  |
| SC-TIMELINE-011| Timeline limit boundary — limit=50 (max) accepted                       | Multiple posts in timeline                     | 200; posts array has up to 50 items                              | Medium   | Boundary    | FR-MB-026  |
| SC-TIMELINE-012| Timeline limit=0 rejected                                                | Any timeline                                   | 400 VALIDATION_ERROR                                             | Medium   | Boundary    | FR-MB-026  |
| SC-TIMELINE-013| Timeline limit=51 rejected (exceeds max)                                 | Any timeline                                   | 400 VALIDATION_ERROR                                             | Medium   | Boundary    | FR-MB-026  |

---

## Feature: NOTIF — In-App Notifications

| SC-ID       | Scenario                                                                   | Precondition                           | Expected                                                        | Priority | Type        | FR Ref     |
|-------------|----------------------------------------------------------------------------|----------------------------------------|-----------------------------------------------------------------|----------|-------------|------------|
| SC-NOTIF-001| Notification created for post author when their post is liked              | Author has a post; another member likes it | Notification record created for author with type=LIKE       | Medium   | Integration | FR-MB-030  |
| SC-NOTIF-002| Notification created for post author when a reply is posted               | Author has a post; member replies      | Notification record created with type=REPLY and link to reply   | Medium   | Integration | FR-MB-031  |
| SC-NOTIF-003| Notification created for target when they are followed                    | Target member exists; follower follows them | Notification record created for target with type=FOLLOW    | Medium   | Integration | FR-MB-032  |
| SC-NOTIF-004| Notifications page returns items in reverse-chron order, unread highlighted| Member has 3 notifications (2 unread) | 200; 3 items; 2 unread items have `read: false`                 | Medium   | Functional  | FR-MB-033  |
| SC-NOTIF-005| No self-notification when member likes their own post                     | Member likes their own post            | No notification created for that member                         | Medium   | Negative    | FR-MB-030  |
