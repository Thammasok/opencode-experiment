# ADR-002: bcrypt Cost Factor 12 for Password Hashing

**Status:** Accepted
**Date:** 2026-03-17
**Scenario:** SC-AUTH-001
**Deciders:** Architecture team

---

## Context

Password hashing algorithm and cost factor must be chosen. NFR-SEC-001 requires bcrypt with minimum cost 12. We need to confirm this is appropriate and document the trade-off.

---

## Decision

Use **bcrypt with cost factor 12**. This is the minimum specified in NFR-SEC-001 and provides a good balance between security and registration/login latency.

---

## Alternatives Considered

| Option | Hash time (approx) | Security | Notes |
|--------|-------------------|----------|-------|
| bcrypt cost 10 | ~100ms | Good | OWASP minimum recommendation; may be too fast on modern hardware |
| **bcrypt cost 12 (chosen)** | ~300–400ms | Strong | OWASP recommended; ~3× slower than cost 10 |
| bcrypt cost 14 | ~1000ms+ | Very strong | Login feels sluggish; impacts auth rate limit testing |
| Argon2id | Variable | Best | More modern; not as universally supported in Node.js ecosystem |

---

## Consequences

**Positive:**
- 300–400ms hash time makes brute-force attacks expensive even with leaked hashes
- bcrypt is well-supported in Node.js (`bcrypt` / `bcryptjs` packages)
- Cost factor is a single config value — can be increased in future migrations

**Negative:**
- 300–400ms added latency on register and sign-in endpoints (acceptable — these are not high-frequency)
- Higher CPU usage per auth request — mitigated by auth rate limiting (10 req/IP/min)

**Note:** Cost factor is hardcoded at 12 (not env-configurable) as a security floor — lower values must not be deployed accidentally.

---

## Related

- NFR-SEC-001: bcrypt cost ≥12
- DEV-MB-002: POST /api/auth/register (hashing implementation)
- DEV-MB-003: POST /api/auth/signin (verify implementation)
