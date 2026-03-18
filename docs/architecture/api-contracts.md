# API Contracts — MicroBlog Platform

> Iteration 1 scope: Authentication (Register · Sign In · Sign Out)
> Scenarios: SC-AUTH-001 through SC-AUTH-016
> Test Cases: TC-AUTH-001 through TC-AUTH-011

---

## Scope Summary

| What              | Detail                                                             |
|-------------------|--------------------------------------------------------------------|
| Scenarios         | SC-AUTH-001–016 (register, sign in, sign out)                     |
| Actors            | Visitor (register), Member (sign in / sign out), System (JWT)     |
| Data to persist   | `users` table (new row on register), `refresh_tokens` table       |
| Data to read      | `users` by email (sign in), token denylist (Redis) on each request|
| External calls    | None (no email verification in Iteration 1)                       |
| Events to emit    | None in Iteration 1                                               |
| New endpoints     | POST /api/auth/register, POST /api/auth/signin, POST /api/auth/signout |
| New tables        | `users`, `refresh_tokens`                                         |

---

## POST /api/auth/register

**Description:** Create a new member account. Returns JWT access + refresh tokens on success.
**Actor:** Visitor (unauthenticated)
**Auth:** None
**Scenarios:** SC-AUTH-001 through SC-AUTH-010
**Test Cases:** TC-AUTH-001, TC-AUTH-002, TC-AUTH-003, TC-AUTH-004, TC-AUTH-005, TC-AUTH-006, TC-AUTH-007

### Request

```
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "alice_dev",
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

**Field constraints:**

| Field      | Type   | Required | Constraints                                              |
|------------|--------|----------|----------------------------------------------------------|
| `username` | string | Yes      | 3–30 chars · lowercase alphanumeric + underscore only · unique |
| `email`    | string | Yes      | Valid RFC email format · unique                         |
| `password` | string | Yes      | 8–64 chars · ≥1 uppercase · ≥1 digit · ≥1 special char  |

### Response — 201 Created

```json
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "alice_dev",
  "email": "alice@example.com",
  "displayName": "alice_dev",
  "createdAt": "2026-03-17T10:30:00Z",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHNlY3VyZSByYW5kb20gdG9rZW4..."
}
```

> ⚠️ `password` and `passwordHash` fields must **NEVER** appear in any response.

### Error Responses

| Status | Code                    | When                                          |
|--------|-------------------------|-----------------------------------------------|
| 400    | `VALIDATION_ERROR`      | One or more fields fail validation            |
| 409    | `EMAIL_ALREADY_EXISTS`  | Submitted email is already registered         |
| 409    | `USERNAME_TAKEN`        | Submitted username is already taken           |
| 429    | `RATE_LIMIT_EXCEEDED`   | > 10 requests/IP/minute                       |
| 500    | `INTERNAL_ERROR`        | Unexpected server error                       |

**400 Validation error body:**

```json
{
  "code": "VALIDATION_ERROR",
  "message": "One or more fields are invalid.",
  "errors": [
    {
      "field": "username",
      "code": "MIN_LENGTH",
      "message": "Username must be at least 3 characters."
    },
    {
      "field": "password",
      "code": "INVALID_FORMAT",
      "message": "Password must contain at least 1 uppercase letter, 1 digit, and 1 special character."
    }
  ]
}
```

**409 Conflict body:**

```json
{
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "An account with this email address already exists."
}
```

### Side Effects

- DB: Inserts row into `users` table with `password_hash` (bcrypt cost 12)
- DB: Inserts row into `refresh_tokens` table
- Logs: Records registration attempt (timestamp, IP, username, outcome) — never logs password

### Rate Limiting

- 10 requests per IP per minute on this endpoint
- Configurable via `AUTH_RATE_LIMIT_MAX` env var

---

## POST /api/auth/signin

**Description:** Authenticate a member with email and password. Returns new JWT tokens.
**Actor:** Member (with existing account)
**Auth:** None
**Scenarios:** SC-AUTH-011 through SC-AUTH-014
**Test Cases:** TC-AUTH-008, TC-AUTH-009, TC-AUTH-010

### Request

```
POST /api/auth/signin
Content-Type: application/json
```

```json
{
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

**Field constraints:**

| Field      | Type   | Required | Constraints            |
|------------|--------|----------|------------------------|
| `email`    | string | Yes      | Valid email format     |
| `password` | string | Yes      | Non-empty              |

### Response — 200 OK

```json
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "alice_dev",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHNlY3VyZSByYW5kb20gdG9rZW4..."
}
```

### Error Responses

| Status | Code                  | When                                                         |
|--------|-----------------------|--------------------------------------------------------------|
| 400    | `VALIDATION_ERROR`    | Missing required field                                       |
| 401    | `UNAUTHENTICATED`     | Wrong password **or** email not found — same message for both |
| 429    | `RATE_LIMIT_EXCEEDED` | Account locked after 5 consecutive failures (15-min lock)    |

**401 body (identical for wrong-password and unknown-email — no enumeration):**

```json
{
  "code": "UNAUTHENTICATED",
  "message": "Invalid email or password."
}
```

**429 locked body:**

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Account temporarily locked. Try again in 14 minutes.",
  "retryAfterSeconds": 840
}
```

### Lockout Logic

```
On failed attempt:
  1. Increment users.failed_login_attempts
  2. If failed_login_attempts >= 5:
       SET users.locked_until = NOW() + INTERVAL '15 minutes'

On sign-in request:
  1. Check users.locked_until — if future timestamp: return 429
  2. Verify password — if wrong: increment counter + return 401
  3. On success: reset failed_login_attempts = 0, locked_until = NULL
```

### Side Effects

- DB: Updates `users.failed_login_attempts` on failure
- DB: Sets `users.locked_until` on 5th failure
- DB: Resets `users.failed_login_attempts` and `locked_until` on success
- DB: Inserts new row into `refresh_tokens`
- Logs: Records sign-in attempt (timestamp, IP, email, outcome) — never logs password

### Rate Limiting

- 10 requests per IP per minute on this endpoint
- Account-level lockout: 5 failures → 15-minute lock (separate from IP rate limit)
- Configurable via `AUTH_RATE_LIMIT_MAX` (IP) and `AUTH_LOCKOUT_ATTEMPTS` / `AUTH_LOCKOUT_MINUTES` env vars

---

## POST /api/auth/signout

**Description:** Invalidate the current session. Adds the JWT JTI to the Redis denylist.
**Actor:** Authenticated member
**Auth:** Bearer token (required)
**Scenarios:** SC-AUTH-015
**Test Cases:** TC-AUTH-011

### Request

```
POST /api/auth/signout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

No request body required.

### Response — 200 OK

```json
{
  "message": "Signed out successfully."
}
```

### Error Responses

| Status | Code              | When                              |
|--------|-------------------|-----------------------------------|
| 401    | `UNAUTHENTICATED` | Missing, expired, or invalid token|

### Side Effects

- Redis: Adds JWT `jti` (JWT ID claim) to denylist SET with TTL = remaining token lifetime
- DB: Optionally marks `refresh_tokens` row as revoked (for refresh token invalidation)

### Denylist Behaviour

```
On signout:
  1. Verify and decode access token (must be valid)
  2. Extract jti from token payload
  3. SETEX denylist:{jti} → "1" with TTL = token exp - now()
  4. Future requests with same token: JWT middleware checks Redis denylist → 401

Redis key pattern: auth:denylist:{jti}
```

---

## GET /api/auth/me

**Description:** Return the currently authenticated member's profile. Used by the frontend to rehydrate session on page load.
**Actor:** Authenticated member
**Auth:** Bearer token (required)
**Scenarios:** SC-AUTH-016 (implicit — validates auth middleware)

### Request

```
GET /api/auth/me
Authorization: Bearer {accessToken}
```

### Response — 200 OK

```json
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "alice_dev",
  "displayName": "alice_dev",
  "email": "alice@example.com",
  "avatarUrl": null,
  "createdAt": "2026-03-17T10:30:00Z"
}
```

### Error Responses

| Status | Code              | When                              |
|--------|-------------------|-----------------------------------|
| 401    | `UNAUTHENTICATED` | Missing, expired, denylisted token|

---

## POST /api/auth/refresh

**Description:** Exchange a valid refresh token for a new access token (without re-entering credentials).
**Actor:** Authenticated member (token expired)
**Auth:** None (uses refresh token in body)

### Request

```
POST /api/auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "dGhpcyBpcyBhIHNlY3VyZSByYW5kb20gdG9rZW4..."
}
```

### Response — 200 OK

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "bmV3cmVmcmVzaHRva2VuaGVyZQ..."
}
```

**Note:** Issues a new refresh token on each call (token rotation — old refresh token invalidated).

### Error Responses

| Status | Code              | When                              |
|--------|-------------------|-----------------------------------|
| 401    | `UNAUTHENTICATED` | Refresh token not found, expired, or revoked |

---

## JWT Token Structure

### Access Token Payload

```json
{
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "alice_dev",
  "jti": "unique-token-id-uuid",
  "iat": 1710672000,
  "exp": 1710675600
}
```

| Claim      | Value                          | Notes                          |
|------------|--------------------------------|--------------------------------|
| `sub`      | userId (UUID)                  | Subject — used to identify user|
| `username` | member's username              | Cached — avoid extra DB lookup |
| `jti`      | UUID v4                        | Used for denylist on signout   |
| `iat`      | Unix timestamp                 | Issued at                      |
| `exp`      | iat + 3600 (1 hour)            | Configurable via JWT_TTL env   |

### Algorithm: HS256 (HMAC-SHA256)

- Secret: `JWT_SECRET` env var (min 32 chars, cryptographically random)
- TTL: `JWT_TTL` env var (default: `3600` seconds)

### Refresh Token

- Format: Cryptographically random bytes (32), base64url-encoded
- Storage: Hashed with SHA-256 in `refresh_tokens` table
- TTL: 30 days (configurable via `REFRESH_TOKEN_TTL_DAYS`)
- Rotation: New token issued on each refresh call; old token invalidated

---

## Error Response Schema (All Endpoints)

```typescript
// Standard error shape used across all auth endpoints
interface ApiError {
  code: string           // Machine-readable error code
  message: string        // Human-readable description
  errors?: FieldError[]  // Present only for VALIDATION_ERROR
  retryAfterSeconds?: number  // Present only for RATE_LIMIT_EXCEEDED
}

interface FieldError {
  field: string    // Which field failed
  code: string     // Specific validation code
  message: string  // Human-readable field error
}
```

### Validation Error Codes

| Code               | Field         | When                                             |
|--------------------|---------------|--------------------------------------------------|
| `REQUIRED`         | any           | Field missing from request body                  |
| `MIN_LENGTH`       | username      | Username < 3 characters                         |
| `MAX_LENGTH`       | username      | Username > 30 characters                        |
| `INVALID_FORMAT`   | username      | Contains non-lowercase or invalid chars          |
| `INVALID_FORMAT`   | email         | Not a valid email format                        |
| `MIN_LENGTH`       | password      | Password < 8 characters                         |
| `MAX_LENGTH`       | password      | Password > 64 characters                        |
| `INVALID_FORMAT`   | password      | Missing uppercase, digit, or special char        |
