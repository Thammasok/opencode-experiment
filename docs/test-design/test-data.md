# Test Data — MicroBlog Platform

> Used by: `docs/test-design/test-cases.md`
> Automation location: `src/tests/__fixtures__/`

---

## Seed Users

| Handle       | userId (fixture key) | username    | email                  | password      | Role   | Notes                          |
|--------------|----------------------|-------------|------------------------|---------------|--------|--------------------------------|
| alice        | `userAlice`          | `alice_dev` | `alice@example.com`    | `P@ssw0rd!`   | Member | Primary test actor             |
| bob          | `userBob`            | `bob_codes` | `bob@example.com`      | `P@ssw0rd!`   | Member | Followed by alice in some tests|
| carol        | `userCarol`          | `carol_x`   | `carol@example.com`    | `P@ssw0rd!`   | Member | Second followed user           |
| dave         | `userDave`           | `dave_z`    | `dave@example.com`     | `P@ssw0rd!`   | Member | NOT followed by alice          |
| charlie      | `userCharlie`        | `charlie_0` | `charlie@example.com`  | `P@ssw0rd!`   | Member | Follows nobody (empty timeline)|
| existing     | `userExisting`       | `existing1` | `existing@example.com` | `P@ssw0rd!`   | Member | Pre-created for duplicate tests|

---

## Username Boundary Values

| Test Value         | Length | Expected          | TC Ref       |
|--------------------|--------|-------------------|--------------|
| `"ab"`             | 2      | 400 MIN_LENGTH    | TC-AUTH-002  |
| `"abc"`            | 3      | 201 (min valid)   | TC-AUTH-003  |
| `"abcd"`           | 4      | 201               | —            |
| `"a".repeat(29)`   | 29     | 201               | —            |
| `"a".repeat(30)`   | 30     | 201 (max valid)   | —            |
| `"a".repeat(31)`   | 31     | 400 MAX_LENGTH    | TC-AUTH-004  |
| `"Alice_Dev"`      | 9      | 400 INVALID_FORMAT| TC-AUTH-005  |
| `"alice dev"`      | 9      | 400 INVALID_FORMAT| —            |
| `"alice@dev"`      | 9      | 400 INVALID_FORMAT| —            |
| `""`               | 0      | 400 VALIDATION_ERROR | —         |

---

## Password Boundary & Format Values

| Test Value       | Description                        | Expected             | TC Ref       |
|------------------|------------------------------------|----------------------|--------------|
| `"P@ssw0rd!"`    | Valid (all rules met)              | 201                  | TC-AUTH-001  |
| `"Short1!"`      | 7 chars — below min 8              | 400 VALIDATION_ERROR | —            |
| `"P@ssw0rd"`     | No digit                           | 400 INVALID_FORMAT   | —            |
| `"p@ssw0rd!"`    | No uppercase                       | 400 INVALID_FORMAT   | TC-AUTH-007  |
| `"P@SSW0RD!"`    | No lowercase (valid by rules? check BC) | depends on spec | —           |
| `"Password1"`    | No special char                    | 400 INVALID_FORMAT   | —            |
| `"a".repeat(64)+"!"` | 65 chars — above max 64       | 400 MAX_LENGTH        | —            |
| `"a".repeat(63)+"A1!"` | 66 chars — max boundary     | 201                  | —            |

---

## Post Body Boundary Values

| Test Value         | Length | Expected              | TC Ref      |
|--------------------|--------|-----------------------|-------------|
| `""`               | 0      | 400 POST_EMPTY        | TC-POST-004 |
| `"   "`            | 3      | 400 POST_EMPTY        | TC-POST-005 |
| `"A"`              | 1      | 201 (min valid)       | TC-POST-001 |
| `"AB"`             | 2      | 201                   | —           |
| `"a".repeat(279)`  | 279    | 201                   | —           |
| `"a".repeat(280)`  | 280    | 201 (max valid)       | TC-POST-002 |
| `"a".repeat(281)`  | 281    | 400 POST_TOO_LONG     | TC-POST-003 |

---

## Bio Boundary Values

| Test Value         | Length | Expected                  |
|--------------------|--------|---------------------------|
| `""`               | 0      | 200 (empty bio allowed)   |
| `"a".repeat(159)`  | 159    | 200                       |
| `"a".repeat(160)`  | 160    | 200 (max valid)           |
| `"a".repeat(161)`  | 161    | 400 VALIDATION_ERROR      |

---

## Timeline Pagination Boundary Values

| limit param | Expected                                   | TC Ref           |
|-------------|---------------------------------------------|------------------|
| `0`         | 400 VALIDATION_ERROR                        | TC-TIMELINE-005  |
| `1`         | 200; up to 1 post in array                  | SC-TIMELINE-010  |
| `20`        | 200; up to 20 posts (default)               | TC-TIMELINE-001  |
| `50`        | 200; up to 50 posts (max valid)             | SC-TIMELINE-011  |
| `51`        | 400 VALIDATION_ERROR                        | SC-TIMELINE-013  |

---

## Seed Posts

| Key           | Author  | body                                | parentPostId | Notes                         |
|---------------|---------|-------------------------------------|--------------|-------------------------------|
| `postByBob1`  | bob     | "Bob's first post"                  | null         | In alice's timeline           |
| `postByBob2`  | bob     | "Bob's second post"                 | null         | Newer than postByBob1         |
| `postByCarol1`| carol   | "Carol's post"                      | null         | In alice's timeline           |
| `postByDave1` | dave    | "Dave's post"                       | null         | NOT in alice's timeline       |
| `postByAlice1`| alice   | "Alice's own post"                  | null         | For delete/authz tests        |
| `replyToB1`   | alice   | "Replying to bob"                   | postByBob1   | Reply post for thread tests   |

---

## Security / Edge Case Inputs

| Category         | Value                                | Purpose                                  |
|------------------|--------------------------------------|------------------------------------------|
| SQL injection     | `'; DROP TABLE users;--`            | Ensure parameterised queries — no effect |
| XSS attempt       | `<script>alert(1)</script>`         | Post body stored as text — not executed  |
| Unicode           | `"こんにちは世界"`                    | 7 chars — valid post body                |
| Name apostrophe   | `"O'Brien"`                          | Display name — special char handling     |
| Null body         | `null` (JSON)                        | 400 VALIDATION_ERROR                     |
| Missing body field| `{}` (no body field at all)          | 400 VALIDATION_ERROR                     |
| Oversized payload | 10,000 char string                   | 400 POST_TOO_LONG (or 413 from middleware)|

---

## Fixture File Map

```
src/tests/__fixtures__/
  auth/
    valid-register.ts     → userAlice, userBob, userCarol, userDave, userCharlie
    existing-user.ts      → userExisting (pre-seeded)
  posts/
    posts.ts              → postByBob1, postByBob2, postByCarol1, postByDave1,
                            postByAlice1, replyToB1
  relationships/
    follows.ts            → aliceFollowsBob, aliceFollowsCarol (no alice→dave)
    likes.ts              → aliceLikedPostByBob1
  notifications/
    notifications.ts      → notifLike (read=true), notifReply (read=false),
                            notifFollow (read=false)
```

---

## Test Data Rules

- Never use real PII — all emails and names are synthetic.
- Each test that modifies data must run in an isolated DB transaction (rolled back after) or against a fresh DB seed.
- Fixture keys are the authoritative reference — automation scripts import from `__fixtures__/`, never hardcode IDs.
- Clock-sensitive tests (lockout expiry, token TTL) must mock the system clock via a test utility — do not rely on real sleep.
