# ADR-001: JWT Access Tokens + Opaque Refresh Tokens for Authentication

**Status:** Accepted
**Date:** 2026-03-17
**Scenario:** SC-AUTH-001, SC-AUTH-011, SC-AUTH-015
**Deciders:** Architecture team

---

## Context

The MicroBlog platform needs an authentication strategy for stateless REST API access. The choice affects session invalidation behaviour, scalability, and implementation complexity. We need to support:
- Short-lived API access (stateless, fast)
- Longer-lived sessions (members expect to stay logged in)
- Immediate session invalidation on sign-out (TC-AUTH-011)
- Account lockout enforcement (TC-AUTH-010)

---

## Decision

Use **JWT access tokens (1-hour TTL, HS256)** combined with **opaque refresh tokens (30-day TTL, stored hashed in PostgreSQL)**.

On sign-out, the JWT JTI is added to a **Redis denylist** (TTL = remaining token lifetime) to enable immediate invalidation without hitting the database on every request.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **JWT only (no refresh)** | Simplest implementation | Long-lived JWTs can't be revoked; short-lived JWTs require frequent re-auth |
| **Server-side sessions (DB)** | Trivial revocation; full control | DB hit on every request; horizontal scaling requires sticky sessions or shared session store |
| **JWT + Redis denylist only** | Stateless + revocable | Redis is single point of failure for auth; denylist grows without TTL management |
| **JWT + opaque refresh (chosen)** | Short-lived access tokens; long sessions; revocable on sign-out | Slightly more complex; Redis required for denylist |
| **HttpOnly cookies** | XSS-resistant token storage | CSRF requires extra protection; harder to use with mobile clients in the future |

---

## Consequences

**Positive:**
- Access tokens are stateless — JWT middleware verifies signature + expiry without a DB call on most requests
- Refresh tokens allow long sessions without keeping users logged in with a powerful credential
- Sign-out is effective immediately via Redis denylist
- Token rotation on refresh prevents token theft from old refresh tokens

**Negative:**
- Redis is a required dependency for the denylist (failure means sign-out doesn't work until Redis recovers)
- Two-token complexity adds implementation overhead vs pure session cookies
- JWT secret rotation requires all active tokens to be re-issued

**Mitigation for Redis dependency:**
- Redis failure during sign-out: log the error, still return 200 to client (best-effort invalidation)
- JWT TTL kept at 1 hour — worst case window if Redis is unavailable is 1 hour

---

## Related

- NFR-SEC-002: JWT signed with HS256, 1h TTL
- NFR-SEC-003: Refresh token ≥32 bytes, stored as hash
- TC-AUTH-011: Sign-out invalidates token (requires Redis denylist)
