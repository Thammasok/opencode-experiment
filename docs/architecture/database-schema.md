# Database Schema — MicroBlog Platform

> Iteration 1 scope: Authentication tables
> Subsequent iterations will add: posts, likes, follows, notifications tables

---

## Table: `users`

**Description:** Core member accounts table. Stores identity, credentials, and profile data.
**Owned by:** auth-module + profile-module
**Scenario:** SC-AUTH-001 (register), SC-AUTH-011 (sign in)

### Columns

| Column                   | Type          | Nullable | Default              | Constraints                                      |
|--------------------------|---------------|----------|----------------------|--------------------------------------------------|
| `id`                     | UUID          | No       | `gen_random_uuid()`  | PRIMARY KEY                                      |
| `username`               | VARCHAR(30)   | No       | —                    | UNIQUE · CHECK(length >= 3) · lowercase alphanum+underscore |
| `email`                  | VARCHAR(255)  | No       | —                    | UNIQUE                                           |
| `password_hash`          | VARCHAR(255)  | No       | —                    | bcrypt hash — NEVER plaintext                    |
| `display_name`           | VARCHAR(50)   | No       | —                    | CHECK(length >= 1) — defaults to username on create |
| `bio`                    | VARCHAR(160)  | Yes      | NULL                 |                                                  |
| `avatar_url`             | TEXT          | Yes      | NULL                 | CDN URL after upload                             |
| `failed_login_attempts`  | INTEGER       | No       | 0                    | CHECK(>= 0) — resets on successful sign-in       |
| `locked_until`           | TIMESTAMPTZ   | Yes      | NULL                 | Set to NOW()+15min after 5 failures              |
| `created_at`             | TIMESTAMPTZ   | No       | `now()`              |                                                  |
| `updated_at`             | TIMESTAMPTZ   | No       | `now()`              | Updated by trigger on every UPDATE               |

### Indexes

| Name                     | Columns               | Type    | Purpose                                     |
|--------------------------|-----------------------|---------|---------------------------------------------|
| `users_pkey`             | `id`                  | PK      | Primary key                                 |
| `users_username_unique`  | `username`            | UNIQUE  | Enforce username uniqueness                 |
| `users_email_unique`     | `email`               | UNIQUE  | Enforce email uniqueness + sign-in lookup   |
| `users_created_at_idx`   | `created_at DESC`     | BTREE   | Admin queries by registration date          |

### Design Notes

- `display_name` is set to `username` on registration; can be updated separately via profile edit (Iteration 2)
- `bio` and `avatar_url` are included now to avoid a schema migration in Iteration 2
- `locked_until` is checked on **every** sign-in attempt — if `> NOW()`, return 429 immediately before password check
- `password_hash` column intentionally included in no SELECT used by API responses

---

## Table: `refresh_tokens`

**Description:** Stores hashed refresh tokens for session management and rotation.
**Owned by:** auth-module
**Scenario:** SC-AUTH-011 (sign in), SC-AUTH-015 (sign out)

### Columns

| Column        | Type        | Nullable | Default             | Constraints                                      |
|---------------|-------------|----------|---------------------|--------------------------------------------------|
| `id`          | UUID        | No       | `gen_random_uuid()` | PRIMARY KEY                                      |
| `user_id`     | UUID        | No       | —                   | FK → `users.id` ON DELETE CASCADE                |
| `token_hash`  | VARCHAR(64) | No       | —                   | UNIQUE · SHA-256 hash of the raw refresh token   |
| `expires_at`  | TIMESTAMPTZ | No       | —                   | `NOW() + INTERVAL '30 days'` on insert           |
| `revoked`     | BOOLEAN     | No       | FALSE               | Set TRUE on signout or token rotation            |
| `created_at`  | TIMESTAMPTZ | No       | `now()`             |                                                  |

### Indexes

| Name                          | Columns        | Type    | Purpose                                    |
|-------------------------------|----------------|---------|--------------------------------------------|
| `refresh_tokens_pkey`         | `id`           | PK      | Primary key                                |
| `refresh_tokens_hash_unique`  | `token_hash`   | UNIQUE  | Fast lookup by token hash                  |
| `refresh_tokens_user_idx`     | `user_id`      | BTREE   | List/revoke all tokens for a user          |
| `refresh_tokens_expires_idx`  | `expires_at`   | BTREE   | Cleanup job: delete where expires_at < NOW()|

### Token Lifecycle

```
Register / Sign In:
  1. Generate raw token: crypto.randomBytes(32) → base64url string
  2. Hash token: SHA-256(rawToken) → store as token_hash
  3. Return raw token to client (never stored again)

Refresh:
  1. Receive raw token from client
  2. Hash: SHA-256(rawToken)
  3. Lookup by token_hash WHERE revoked = FALSE AND expires_at > NOW()
  4. If found: revoke old row, issue new token pair
  5. If not found / expired / revoked: 401

Sign Out:
  1. SET revoked = TRUE WHERE user_id = ? (revoke all active sessions)
     OR revoke only the specific session token
```

---

## Migration Scripts

### Migration 001 — Create update trigger function

```sql
-- 20260317_001_create_updated_at_trigger.sql

-- UP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DOWN
DROP FUNCTION IF EXISTS update_updated_at_column();
```

---

### Migration 002 — Create users table

```sql
-- 20260317_002_create_users.sql
-- Scenario: SC-AUTH-001 (register), SC-AUTH-011 (sign in)

-- UP
CREATE TABLE users (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username              VARCHAR(30)  NOT NULL,
    email                 VARCHAR(255) NOT NULL,
    password_hash         VARCHAR(255) NOT NULL,
    display_name          VARCHAR(50)  NOT NULL,
    bio                   VARCHAR(160),
    avatar_url            TEXT,
    failed_login_attempts INTEGER      NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
    locked_until          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT users_username_format CHECK (
        username ~ '^[a-z0-9_]{3,30}$'
    )
);

CREATE UNIQUE INDEX users_username_unique ON users (username);
CREATE UNIQUE INDEX users_email_unique    ON users (email);
CREATE INDEX        users_created_at_idx  ON users (created_at DESC);

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- DOWN
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
DROP TABLE IF EXISTS users CASCADE;
```

---

### Migration 003 — Create refresh_tokens table

```sql
-- 20260317_003_create_refresh_tokens.sql
-- Scenario: SC-AUTH-011 (sign in), SC-AUTH-015 (sign out)

-- UP
CREATE TABLE refresh_tokens (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64)  NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX refresh_tokens_hash_unique  ON refresh_tokens (token_hash);
CREATE INDEX        refresh_tokens_user_idx     ON refresh_tokens (user_id);
CREATE INDEX        refresh_tokens_expires_idx  ON refresh_tokens (expires_at);

-- DOWN
DROP TABLE IF EXISTS refresh_tokens CASCADE;
```

---

## Prisma Schema (ORM)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String    @id @default(uuid()) @db.Uuid
  username             String    @unique @db.VarChar(30)
  email                String    @unique @db.VarChar(255)
  passwordHash         String    @map("password_hash") @db.VarChar(255)
  displayName          String    @map("display_name") @db.VarChar(50)
  bio                  String?   @db.VarChar(160)
  avatarUrl            String?   @map("avatar_url")
  failedLoginAttempts  Int       @default(0) @map("failed_login_attempts")
  lockedUntil          DateTime? @map("locked_until") @db.Timestamptz
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  refreshTokens RefreshToken[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  tokenHash String   @unique @map("token_hash") @db.VarChar(64)
  expiresAt DateTime @map("expires_at") @db.Timestamptz
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}
```

---

## Future Tables (Planned — Not in Iteration 1)

These tables will be added in subsequent iterations. Listed here to avoid conflicting design decisions.

| Table          | Added in   | Purpose                                                |
|----------------|------------|--------------------------------------------------------|
| `posts`        | Iteration 3| User posts (body, parentPostId for replies)            |
| `likes`        | Iteration 5| Like relationship (userId + postId, unique constraint) |
| `follows`      | Iteration 2| Follow relationship (followerId + followingId)         |
| `notifications`| Iteration 5| In-app notifications (type, actorId, recipientId)     |

---

## Query Patterns (Auth Module)

### Register — insert new user

```typescript
// src/modules/auth/auth.repository.ts
async createUser(data: {
  username: string
  email: string
  passwordHash: string
  displayName: string
}): Promise<User> {
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      displayName: data.displayName,
    },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      createdAt: true,
      // passwordHash intentionally excluded
    },
  })
}
```

### Sign In — lookup user by email

```typescript
async findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      username: true,
      email: true,
      passwordHash: true,   // needed for bcrypt.compare
      failedLoginAttempts: true,
      lockedUntil: true,
    },
  })
}
```

### Increment failed login attempts

```typescript
async incrementFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: { increment: 1 },
      lockedUntil: {
        set: await this.shouldLock(userId)
          ? new Date(Date.now() + AUTH_LOCKOUT_MINUTES * 60 * 1000)
          : undefined,
      },
    },
  })
}
```
