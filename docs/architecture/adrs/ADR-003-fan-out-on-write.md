# ADR-003: Fan-Out-on-Write for Home Timeline (Redis Pre-computed Feeds)

**Status:** Accepted
**Date:** 2026-03-17
**Scenario:** SC-POST-007, SC-TIMELINE-001 (Iteration 3–4)
**Deciders:** Architecture team

---

## Context

The home timeline must return posts from followed users in reverse-chronological order with low latency (NFR-PERF-001: ≤300ms p95). Two main approaches exist for social media timelines: fan-out-on-write (push model) and fan-out-on-read (pull model).

---

## Decision

Use **fan-out-on-write** (push model): when a member posts, the post ID is asynchronously pushed into a Redis list (`timeline:{followerId}`) for each follower via a BullMQ worker. The timeline API reads directly from Redis — no JOIN across follows + posts tables at read time.

---

## Alternatives Considered

| Option | Read latency | Write latency | Storage cost | Celebrity problem |
|--------|-------------|---------------|--------------|-------------------|
| **Fan-out-on-write / push (chosen)** | Very low (Redis list read) | Slightly higher (async fan-out) | O(follows × posts) | High fan-out for users with 10k+ followers |
| Fan-out-on-read / pull | Higher (JOIN at read time) | None | O(posts) | No celebrity problem |
| Hybrid (push for normal, pull for celebrities) | Low for most | Moderate complexity | Moderate | Handled explicitly |

---

## Consequences

**Positive:**
- Timeline reads are O(1) Redis LRANGE — no database JOIN under read load
- Scales naturally for most users (MVP target: ≤10k followers per NFR-SCALE-001)
- Fan-out is async (BullMQ) — post creation API returns immediately without waiting for fan-out

**Negative:**
- Higher storage: each follower stores a copy of followed post IDs (mitigated by LTRIM to 1000 items)
- Celebrity problem: authors with 10k+ followers require 10k+ Redis writes per post — acceptable for MVP
- Redis timeline lists must be seeded when a new follow relationship is created (backfill recent posts)

**Mitigation for celebrity problem (post-MVP):**
- Hybrid model: switch to fan-out-on-read for accounts with > 50k followers

**Timeline list management:**
- Max 1000 post IDs per timeline (LTRIM after LPUSH)
- On unfollow: do not backfill-remove old posts (too expensive); they expire naturally as new posts push them out
- On follow: backfill last 20 posts from followed user into follower's timeline (one-time on follow)

---

## Related

- NFR-PERF-002: Timeline served from pre-computed read store (no real-time JOIN)
- NFR-PERF-003: Fan-out ≤5s for ≤10k followers
- NFR-SCALE-001: Fan-out-on-write model for ≤10k followers
- NFR-REL-002: Fan-out queue failure must not block post creation
- DEV-MB-020: BullMQ fan-out worker implementation
- DEV-MB-033: Redis timeline store setup
