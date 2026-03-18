# Wireframes — MicroBlog Platform

> Artifacts: WF-MB-001 through WF-MB-007
> Layout system: 3-column desktop (sidebar 240px | feed 600px | aside 360px)
> Mobile: full-width feed + bottom navigation
> Breakpoints: mobile < 768px | tablet 768–1279px | desktop ≥ 1280px

---

## WF-MB-001 — Authentication Pages (Register & Sign In)

### Register — /register

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ◉ MicroBlog              (logo + wordmark) │
│                                                         │
│         ┌─────────────────────────────────┐             │
│         │  Create your account            │             │
│         │                                 │             │
│         │  Username                       │             │
│         │  ┌───────────────────────────┐  │             │
│         │  │ alice_dev                 │  │             │
│         │  └───────────────────────────┘  │             │
│         │  ✓ 3–30 chars, lowercase + _    │             │
│         │                                 │             │
│         │  Email address                  │             │
│         │  ┌───────────────────────────┐  │             │
│         │  │ alice@example.com         │  │             │
│         │  └───────────────────────────┘  │             │
│         │                                 │             │
│         │  Password                       │             │
│         │  ┌───────────────────────────┐  │             │
│         │  │ ••••••••••        [eye]   │  │             │
│         │  └───────────────────────────┘  │             │
│         │  Min 8 chars, 1 upper, 1 digit, │             │
│         │  1 special                      │             │
│         │                                 │             │
│         │  [        Create account      ] │  ← primary  │
│         │                                 │             │
│         │  Already have an account?       │             │
│         │  Sign in →                      │             │
│         └─────────────────────────────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘

Error state — inline field error:
  Username field:
  ┌───────────────────────────────┐
  │ Alice_Dev                     │  ← red border
  └───────────────────────────────┘
  ⚠ Username can only contain lowercase letters, digits, and _
                                      ↑ error.DEFAULT text, textSm
```

### Sign In — /signin

```
┌─────────────────────────────────────────────────────────┐
│              ◉ MicroBlog                                │
│                                                         │
│         ┌─────────────────────────────────┐             │
│         │  Sign in to MicroBlog           │             │
│         │                                 │             │
│         │  Email address                  │             │
│         │  ┌───────────────────────────┐  │             │
│         │  │                           │  │             │
│         │  └───────────────────────────┘  │             │
│         │                                 │             │
│         │  Password                       │             │
│         │  ┌───────────────────────────┐  │             │
│         │  │                  [eye]    │  │             │
│         │  └───────────────────────────┘  │             │
│         │                                 │             │
│         │  [          Sign in           ] │  ← primary  │
│         │                                 │             │
│         │  Don't have an account?         │             │
│         │  Create account →               │             │
│         └─────────────────────────────────┘             │
│                                                         │
│  Account locked alert (conditional):                    │
│  ┌───────────────────────────────────────────────┐      │
│  │ ⚠ Account temporarily locked.                │      │
│  │   Try again in 14 minutes.                   │      │
│  └───────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## WF-MB-002 — Home Timeline (Desktop 3-column)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  ┌─────────────────────┐ │
│  │ LEFT SIDEBAR     │  │ MAIN FEED (600px)                │  │ RIGHT SIDEBAR       │ │
│  │ (240px, sticky)  │  │                                  │  │ (360px)             │ │
│  │                  │  │ ┌──────────────────────────────┐ │  │                     │ │
│  │ ◉ MicroBlog      │  │ │ COMPOSE AREA                 │ │  │ ┌─────────────────┐ │ │
│  │                  │  │ │ [Avatar] What's on your mind?│ │  │ │ 🔍 Search       │ │ │
│  │ 🏠 Home          │  │ │                              │ │  │ └─────────────────┘ │ │
│  │ 🔍 Explore       │  │ │ ───────────────────── 0/280  │ │  │                     │ │
│  │ 🔔 Notifications │  │ │              [    Post    ]  │ │  │ ┌─────────────────┐ │ │
│  │    (badge: 3)    │  │ └──────────────────────────────┘ │  │ │ Who to follow   │ │ │
│  │ 👤 Profile       │  │                                  │  │ │                 │ │ │
│  │                  │  │ ── NEW POSTS BANNER (conditional)│  │ │ [Av] alice_dev  │ │ │
│  │                  │  │ ┌──────────────────────────────┐ │  │ │ @alice  [Follow]│ │ │
│  │                  │  │ │ ↑ Show 4 new posts           │ │  │ │                 │ │ │
│  │                  │  │ └──────────────────────────────┘ │  │ │ [Av] bob_codes  │ │ │
│  │                  │  │                                  │  │ │ @bob    [Follow]│ │ │
│  │ [  + New Post  ] │  │ POST CARD ────────────────────── │  │ └─────────────────┘ │ │
│  │ (primary button) │  │ ┌──────────────────────────────┐ │  │                     │ │
│  │                  │  │ │[Av] Bob Coder  @bob · 2m     │ │  └─────────────────────┘ │
│  │ ─────────────── │  │ │                              │ │                           │
│  │ [Av] alice_dev  │  │ │ This is a sample post with   │ │                           │
│  │ Settings ↗      │  │ │ some content that wraps to   │ │                           │
│  │                  │  │ │ multiple lines.              │ │                           │
│  └──────────────────┘  │ │                              │ │                           │
│                        │ │ 💬 12   ❤ 47   🗑 (own)      │ │                           │
│                        │ └──────────────────────────────┘ │                           │
│                        │                                  │                           │
│                        │ POST CARD ────────────────────── │                           │
│                        │ ┌──────────────────────────────┐ │                           │
│                        │ │[Av] Carol X  @carol_x · 15m  │ │                           │
│                        │ │                              │ │                           │
│                        │ │ Another post in the feed.    │ │                           │
│                        │ │                              │ │                           │
│                        │ │ 💬 3    ❤ 8  ♥ (liked)      │ │                           │
│                        │ └──────────────────────────────┘ │                           │
│                        └──────────────────────────────────┘                           │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### Home Timeline — Mobile (< 768px)

```
┌─────────────────────────┐
│ MicroBlog     🔔(3) 👤  │  ← top nav bar
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │[Av] What's on your  │ │  ← compact compose
│ │     mind?    [Post] │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ POST CARD               │
│ [Av] Bob · 2m           │
│ Post content here...    │
│ 💬 12   ❤ 47            │
├─────────────────────────┤
│ POST CARD               │
│ [Av] Carol · 15m        │
│ Another post...         │
│ 💬 3   ❤♥ 8             │
├─────────────────────────┤
│                         │
│                    [✏] │  ← FAB (floating action button, primary)
├─────────────────────────┤
│ 🏠  🔍  🔔  👤          │  ← bottom navigation
└─────────────────────────┘
```

### Home Timeline — Empty State

```
│                                          │
│         ┌────────────────────────┐       │
│         │     👥                 │       │
│         │  Follow people to see  │       │
│         │  posts here            │       │
│         │                        │       │
│         │  Discover accounts on  │       │
│         │  Explore to get started│       │
│         │                        │       │
│         │  [  Browse Explore  ]  │       │
│         └────────────────────────┘       │
```

---

## WF-MB-003 — Compose Post (Modal on Desktop / Full Screen on Mobile)

### Desktop — Compose Modal

```
┌─────────────────────────────────────────────────────┐
│ ╳                          New Post                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Avatar]  ┌─────────────────────────────────────┐  │
│           │ What's on your mind?                │  │
│           │                                     │  │
│           │                                     │  │
│           │                                     │  │
│           └─────────────────────────────────────┘  │
│                                                     │
│           ────────────────────────────── 0 / 280    │
│                                                     │
│                                   [     Post     ]  │
│                                   (disabled if empty│
│                                    or > 280)        │
└─────────────────────────────────────────────────────┘

Character counter states:
  0–239:   slate.400    "0 / 280"
  240–269: warning.DEFAULT  "240 / 280"
  270–279: orange (warning-ish)  "270 / 280"
  280:     success.DEFAULT  "280 / 280"  — Post enabled
  281+:    error.DEFAULT "-1" — Post disabled, counter in red
```

---

## WF-MB-004 — Profile Page

```
┌───────────────────────────────────────────────────────────────┐
│ LEFT SIDEBAR │                 PROFILE (600px)                │
│              │                                                │
│              │ ┌──────────────────────────────────────────┐  │
│              │ │  PROFILE HEADER                          │  │
│              │ │ ┌──────────────────────────────────────┐ │  │
│              │ │ │  [Avatar 80×80]                       │ │  │
│              │ │ │  Bob Coder                   [Follow] │ │  │
│              │ │ │  @bob_codes                          │ │  │
│              │ │ │  Building cool things in public.     │ │  │
│              │ │ │                                      │ │  │
│              │ │ │  📅 Joined March 2026                │ │  │
│              │ │ │  128 Following  · 842 Followers      │ │  │
│              │ │ └──────────────────────────────────────┘ │  │
│              │ │                                          │  │
│              │ │  [Posts]  [Replies]  [Likes]  ← tabs    │  │
│              │ │  ─────────────────────────────           │  │
│              │ │                                          │  │
│              │ │  POST CARD                               │  │
│              │ │  Bob's latest post here...               │  │
│              │ │  💬 5   ❤ 21                             │  │
│              │ │                                          │  │
│              │ │  POST CARD                               │  │
│              │ │  Earlier post...                         │  │
│              │ │  💬 2   ❤ 9                              │  │
│              │ └──────────────────────────────────────────┘  │
│              │                                                │
└───────────────────────────────────────────────────────────────┘

Own profile — Edit Profile button replaces Follow:
  [Avatar 80×80]
  Alice Dev                         [Edit Profile]
  @alice_dev

Edit Profile — Inline panel (or slide-over on mobile):
  Display name: [Alice Dev            ]  (max 50)
  Bio:          [Building things...   ]  (0/160 counter)
  Avatar:       [Upload image         ]  (JPG/PNG < 5MB)
                [     Save            ]
```

---

## WF-MB-005 — Explore / Search

```
┌──────────────────────────────────────────────────────────────┐
│ LEFT SIDEBAR │              EXPLORE (600px)                  │
│              │                                               │
│              │ ┌────────────────────────────────────────┐   │
│              │ │ 🔍  Search posts and people...     [×] │   │
│              │ └────────────────────────────────────────┘   │
│              │                                               │
│              │ ── DEFAULT STATE (no search query) ─────────  │
│              │                                               │
│              │ Latest  ─────────────────────────────────    │
│              │                                               │
│              │ POST CARD (public, all members)               │
│              │ [Av] dave_z · 1m                              │
│              │ Latest public post...                         │
│              │ 💬 0   ❤ 1                                    │
│              │                                               │
│              │ POST CARD                                     │
│              │ ...                                           │
│              │                                               │
│              │ ── SEARCH RESULTS STATE ────────────────────  │
│              │                                               │
│              │ Results for "design"                          │
│              │                                               │
│              │ People ──────────────────────────────────    │
│              │ ┌──────────────────────────────────────────┐ │
│              │ │[Av] carol_x  @carol_x        [Follow]    │ │
│              │ │    UI/UX designer from Berlin            │ │
│              │ └──────────────────────────────────────────┘ │
│              │                                               │
│              │ Posts ───────────────────────────────────    │
│              │ POST CARD (contains "design")                 │
│              │ POST CARD (contains "design")                 │
│              │                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## WF-MB-006 — Post Thread Detail

```
┌──────────────────────────────────────────────────────────────┐
│ LEFT SIDEBAR │            THREAD VIEW (600px)                │
│              │                                               │
│              │ ← Back                                        │
│              │                                               │
│              │ ┌────────────────────────────────────────┐   │
│              │ │ PARENT POST                            │   │
│              │ │ [Av] Bob Coder  @bob_codes             │   │
│              │ │                                        │   │
│              │ │ This is the main post content that     │   │
│              │ │ everyone is replying to.               │   │
│              │ │                                        │   │
│              │ │ Mar 17, 2026 · 10:42 AM                │   │
│              │ │ ─────────────────────────────────────  │   │
│              │ │ 47 Likes · 12 Replies                  │   │
│              │ │ ─────────────────────────────────────  │   │
│              │ │ 💬 Reply    ❤ Like                     │   │
│              │ └────────────────────────────────────────┘   │
│              │                                               │
│              │ ┌────────────────────────────────────────┐   │
│              │ │ REPLY COMPOSE (if authenticated)       │   │
│              │ │ [Av] Reply to @bob_codes...   [Reply]  │   │
│              │ └────────────────────────────────────────┘   │
│              │                                               │
│              │ 12 Replies ─────────────────────────────     │
│              │                                               │
│              │ REPLY CARD                                    │
│              │ ┌────────────────────────────────────────┐   │
│              │ │ [Av] Carol  @carol_x · 5m              │   │
│              │ │ Great point! I agree with this.        │   │
│              │ │ 💬 1   ❤ 3                             │   │
│              │ └────────────────────────────────────────┘   │
│              │                                               │
│              │ REPLY CARD                                    │
│              │ ┌────────────────────────────────────────┐   │
│              │ │ [Av] Alice @alice_dev · 8m             │   │
│              │ │ Adding my thoughts here...             │   │
│              │ │ 💬 0   ❤ 1                             │   │
│              │ └────────────────────────────────────────┘   │
│              │                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## WF-MB-007 — Notifications

```
┌──────────────────────────────────────────────────────────────┐
│ LEFT SIDEBAR │          NOTIFICATIONS (600px)               │
│ 🔔 (badge 3) │                                               │
│              │ Notifications                                 │
│              │                                               │
│              │ ┌────────────────────────────────────────┐   │
│              │ │ ● [Av] bob_codes liked your post       │   │
│              │ │        "This is a sample post..."  2m  │   │
│              │ └────────────────────────────────────────┘   │
│              │ (unread — subtle blue left border)            │
│              │                                               │
│              │ ┌────────────────────────────────────────┐   │
│              │ │ ● [Av] carol_x replied to your post    │   │
│              │ │        "Great point! I agree..." 15m   │   │
│              │ └────────────────────────────────────────┘   │
│              │ (unread — subtle blue left border)            │
│              │                                               │
│              │ ┌────────────────────────────────────────┐   │
│              │ │ ○ [Av] dave_z started following you    │   │
│              │ │                              Yesterday  │   │
│              │ └────────────────────────────────────────┘   │
│              │ (read — no left border, slightly muted)       │
│              │                                               │
│              │ ── Empty state ─────────────────────────     │
│              │ ┌────────────────────────────────────────┐   │
│              │ │         🔔                             │   │
│              │ │  No notifications yet                  │   │
│              │ │  When people like, reply to, or        │   │
│              │ │  follow you, you'll see it here.       │   │
│              │ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Responsive Breakpoint Behaviour

| Breakpoint   | Left Sidebar  | Main Feed | Right Sidebar |
|--------------|---------------|-----------|---------------|
| ≥ 1280px     | 240px fixed   | 600px     | 360px         |
| 768–1279px   | 72px (icons only, no labels) | fill | hidden |
| < 768px      | Hidden → bottom nav | 100vw | hidden |

### Tablet (768–1279px) — Sidebar collapses to icon-only

```
┌────┬─────────────────────────────────────┐
│ 🏠 │                                     │
│ 🔍 │   MAIN FEED (full remaining width)  │
│ 🔔 │                                     │
│ 👤 │                                     │
│    │                                     │
│[✏] │                                     │
└────┴─────────────────────────────────────┘
```
