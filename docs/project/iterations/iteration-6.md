# Iteration 6 — NFR Hardening, Security, and Production Readiness

**Goal:** Platform meets all security, performance, and reliability NFRs. System is production-ready.

**Stories in scope:** NFR-SEC, NFR-PERF, NFR-REL, NFR-COMP, NFR-MAINT (cross-cutting)
**Priority:** Must Have
**Duration:** 1 week

---

## Work in Scope

### Security Hardening

| Task                                                              | NFR Ref      |
|-------------------------------------------------------------------|--------------|
| Add Helmet.js middleware (CSP, HSTS, X-Frame-Options, etc.)       | NFR-SEC-004  |
| Configure CORS: allowed origins via ALLOWED_ORIGINS env var       | NFR-SEC-005  |
| Verify HTTPS redirect in production config (301 HTTP → HTTPS)     | NFR-SEC-004  |
| Add express-validator for input sanitisation on all endpoints     | NFR-SEC       |
| Run OWASP ZAP baseline scan on staging                            | NFR-SEC       |
| Verify no plaintext password or token ever appears in logs        | NFR-COMP-001 |

### Performance Optimisation

| Task                                                              | NFR Ref      |
|-------------------------------------------------------------------|--------------|
| Add PostgreSQL read replica config for timeline and explore       | NFR-SCALE-002|
| Add DB query explain-analyse on slow queries (timeline, explore)  | NFR-PERF-001 |
| Add p95 response time check via k6 load test (200 concurrent)     | NFR-PERF-001 |
| Verify fan-out completes in ≤5s for 10k followers via load test   | NFR-PERF-003 |
| Configure CDN cache-control headers for avatar images (TTL 7d)    | NFR-PERF-004 |

### Reliability

| Task                                                              | NFR Ref      |
|-------------------------------------------------------------------|--------------|
| Add BullMQ retry config (3 retries, exponential backoff)          | NFR-REL-002  |
| Add health check endpoint GET /health (returns 200 + uptime)      | NFR-REL-001  |
| Configure uptime monitoring alert at 99.9% threshold              | NFR-REL-001  |

### Maintainability

| Task                                                              | NFR Ref      |
|-------------------------------------------------------------------|--------------|
| Move rate limit thresholds to env vars (AUTH_RATE_LIMIT_MAX, POST_RATE_LIMIT_MAX, JWT_TTL) | NFR-MAINT-001 |
| Verify fan-out worker runs as independent Docker service           | NFR-MAINT-002|
| Document all env vars in .env.example                             | NFR-MAINT    |

---

## Definition of Done

| Check                                                              | Pass criteria             |
|--------------------------------------------------------------------|---------------------------|
| All API endpoints respond ≤300ms p95 under 200 concurrent users    | k6 load test report       |
| Helmet.js security headers present on all responses               | curl -I response headers  |
| CORS rejects requests from non-whitelisted origins                 | curl test from bad origin |
| No email or password hash in any API response or log file          | Grep log output           |
| Fan-out completes in ≤5s for 10k follower accounts (load test)     | k6 custom scenario        |
| Rate limits configurable via env var without code change           | Test with different .env  |
| GET /health returns 200                                            | Smoke test                |

---

## Increment

At the end of Iteration 6, the MicroBlog platform is production-ready:
- Security headers enforced on all responses
- CORS locked to registered frontend origins
- All rate limits and TTL values configurable via environment variables
- Fan-out performance verified at scale
- Health check endpoint available for uptime monitoring
- All Must Have and Should Have user stories delivered and hardened
- Platform ready for UAT and technical writer documentation
