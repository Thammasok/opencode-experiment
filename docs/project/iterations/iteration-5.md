# Iteration 5 — Like, Follow, and Notifications

**Goal:** Member can like/unlike posts and follow/unfollow users. In-app notifications fire for all social engagement events.

**Stories in scope:** US-MB-009, US-MB-010, US-MB-011, US-MB-015
**Priority:** Must Have (009, 010) / Should Have (011, 015)
**Duration:** 1 week

---

## Scenarios in Scope

| SC-ID         | Scenario                                                             | Type        |
|---------------|----------------------------------------------------------------------|-------------|
| SC-LIKE-001   | Member likes a post — likeCount increments                          | Functional  |
| SC-LIKE-002   | Member unlikes a post — likeCount decrements                        | State       |
| SC-LIKE-003   | Duplicate like rejected                                             | Negative    |
| SC-LIKE-004   | Unauthenticated like rejected                                       | Security    |
| SC-LIKE-005   | Like on non-existent post returns 404                               | Negative    |
| SC-LIKE-006   | Previously liked post shows likedByMe=true on re-fetch              | State       |
| SC-FOLLOW-001 | Member follows another member                                       | Functional  |
| SC-FOLLOW-002 | Member unfollows a member they follow                               | Functional  |
| SC-FOLLOW-003 | Self-follow rejected                                                | Security    |
| SC-FOLLOW-004 | Duplicate follow rejected                                           | Negative    |
| SC-FOLLOW-005 | Follow request for non-existent user returns 404                    | Negative    |
| SC-FOLLOW-006 | After unfollow, new posts from that user absent from timeline       | Integration |
| SC-NOTIF-001  | Notification created when post is liked                             | Integration |
| SC-NOTIF-002  | Notification created when post is replied to                        | Integration |
| SC-NOTIF-003  | Notification created when user is followed                          | Integration |
| SC-NOTIF-004  | Notifications returned in reverse-chron, unread highlighted         | Functional  |
| SC-NOTIF-005  | No self-notification when member likes own post                     | Negative    |

---

## Definition of Done — Test Cases

**P1 — All must pass:**

| TC-ID          | Title                                                        | Level       |
|----------------|--------------------------------------------------------------|-------------|
| TC-LIKE-001    | First like → 201, likeCount +1                               | API         |
| TC-LIKE-002    | Unlike → 204, likeCount -1                                   | API         |
| TC-LIKE-003    | Duplicate like → 409 ALREADY_LIKED                           | API         |
| TC-FOLLOW-001  | Follow → 201, target follower_count +1                       | API         |
| TC-FOLLOW-002  | Self-follow → 403 FORBIDDEN                                  | API         |
| TC-FOLLOW-003  | Duplicate follow → 409 ALREADY_FOLLOWING                     | API         |
| TC-FOLLOW-004  | Unfollow → new posts from that user absent in timeline       | Integration |

**P2 — Target, not blocking:**

| TC-ID          | Title                                              |
|----------------|----------------------------------------------------|
| TC-NOTIF-001   | Like → notification for post author                |
| TC-NOTIF-002   | Notifications in reverse-chron, unread=false        |

---

## Developer Tasks

| Task        | Title                                                         | Layer    | Complexity | Owner |
|-------------|---------------------------------------------------------------|----------|------------|-------|
| DEV-MB-025  | Create likes table schema and migration                       | DB       | XS         | Dev   |
| DEV-MB-026  | POST /api/posts/:postId/likes — like a post                   | API      | S          | Dev   |
| DEV-MB-027  | DELETE /api/posts/:postId/likes — unlike a post               | API      | S          | Dev   |
| DEV-MB-029  | POST /api/follows — follow a user                             | API      | S          | Dev   |
| DEV-MB-030  | DELETE /api/follows/:targetId — unfollow a user               | API      | S          | Dev   |
| DEV-MB-031  | GET /api/users/:username/followers+following                  | API      | S          | Dev   |
| DEV-MB-040  | Create notifications table schema and migration               | DB       | XS         | Dev   |
| DEV-MB-041  | Notification service (BullMQ consumers: like/reply/follow)    | Domain   | M          | Dev   |
| DEV-MB-042  | GET /api/notifications                                        | API      | S          | Dev   |
| DEV-MB-032  | FollowButton UI with optimistic update                        | Frontend | S          | Dev   |
| DEV-MB-043  | Notifications page UI (/notifications)                        | Frontend | S          | Dev   |
| DEV-MB-044  | Notification badge counter on navigation                      | Frontend | XS         | Dev   |

**Note:** DEV-MB-028 (follows table) was done in Iteration 2. DEV-MB-029–030 depend on it.

---

## NFRs Enforced This Iteration

| NFR          | Requirement                                                  | Enforced in  |
|--------------|--------------------------------------------------------------|--------------|
| NFR-COMP-002 | Deleted likes/follows do not leave orphan notification data  | DEV-MB-041   |

---

## Increment

At the end of Iteration 5:
- A member can like any post; the like count updates immediately (optimistic) and persists
- Duplicate likes are rejected with 409
- A member can follow/unfollow any other user; self-follow is blocked
- After unfollowing, the unfollowed user's new posts no longer appear in the timeline
- In-app notifications are created for likes, replies, and follows
- The notifications page shows items in reverse-chronological order with unread highlighting
- The nav bell icon shows an unread count badge

---

## MVP Feature Complete

After Iteration 5, all **Must Have** user stories are delivered:

| Story      | Delivered in |
|------------|--------------|
| US-MB-001  | Iteration 1  |
| US-MB-002  | Iteration 1  |
| US-MB-003  | Iteration 1  |
| US-MB-004  | Iteration 2  |
| US-MB-005  | Iteration 2  |
| US-MB-006  | Iteration 3  |
| US-MB-007  | Iteration 3  |
| US-MB-009  | Iteration 5  |
| US-MB-010  | Iteration 5  |
| US-MB-012  | Iteration 4  |
| US-MB-013  | Iteration 4  |
| US-MB-014  | Iteration 3  |

**Should Have** stories delivered:

| Story      | Delivered in |
|------------|--------------|
| US-MB-008  | Iteration 3  |
| US-MB-011  | Iteration 2  |
| US-MB-015  | Iteration 5  |
