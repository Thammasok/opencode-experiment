# UI Specifications — MicroBlog Platform

> Design system: React + Tailwind v4 · Inter font · Blue primary · Slate neutral
> WCAG 2.2 Level AA · Dark mode: class strategy (system default)
> Icons: lucide-react · Animations: motion

---

## UI-MB-001 — Post Card Component

### Anatomy

```
┌─────────────────────────────────────────────────────────┐
│  [Avatar]  DisplayName  @username  ·  relative-time     │  ← header
│                                                         │
│  Post body text — up to 280 characters. May wrap to     │  ← body
│  multiple lines. Links are styled in primary blue.      │
│                                                         │
│  ──────────────────────────────────────────────────     │  ← divider
│  💬 12        ❤ 47                   [⋯]               │  ← action bar
└─────────────────────────────────────────────────────────┘
```

### Tokens

| Element           | Light token                          | Dark token                          |
|-------------------|--------------------------------------|-------------------------------------|
| Card background   | `semantic.surface.raised` (#fff)     | `dark.semantic.surface.raised` (slate-800) |
| Card border       | `semantic.border.DEFAULT` (slate-200)| `dark.semantic.border.DEFAULT` (slate-700) |
| Border radius     | `md` (8px)                           | same                                |
| Display name      | `semantic.text.primary` (slate-900)  | `dark.semantic.text.primary` (slate-50) |
| Username / time   | `semantic.text.secondary` (slate-600)| `dark.semantic.text.secondary` (slate-300) |
| Post body         | `semantic.text.primary`              | `dark.semantic.text.primary`        |
| Action icon idle  | `semantic.text.tertiary` (slate-400) | same adjusted                       |
| Like icon — liked | `semantic.error.DEFAULT` (#dc2626) — heart fills red | same |
| Divider           | `semantic.border.subtle` (slate-100) | `dark.semantic.border.subtle`       |

### Typography

| Element       | Style      | Token                    |
|---------------|------------|--------------------------|
| Display name  | `labelLg`  | 16px / medium            |
| @username     | `textSm`   | 12.8px / normal          |
| Relative time | `textSm`   | 12.8px / normal          |
| Post body     | `textMd`   | 16px / normal / 1.5 lh   |
| Action counts | `textSm`   | 12.8px / normal          |

### States

| State          | Visual change                                                   |
|----------------|-----------------------------------------------------------------|
| Default        | White bg, slate-200 border                                     |
| Hover          | `semantic.surface.subtle` bg (slate-50); cursor pointer        |
| Reply icon     | slate-400 idle → primary.DEFAULT on hover                      |
| Like icon      | slate-400 idle → error.DEFAULT filled on active/liked          |
| Liked          | Heart filled red + count in error.DEFAULT                      |
| Delete visible | Only on own posts; ⋯ menu reveals Delete (destructive)         |

### Like Button — Optimistic Update Behaviour
1. User taps ❤ → immediately flip to filled red + increment count (optimistic)
2. API call fires in background
3. On API error → revert to previous state + show toast "Could not like post"

### Action Bar — Touch Targets
- Min 44×44px hit area around each icon (padding applied)
- Icons: `MessageCircle` (reply), `Heart` (like), `MoreHorizontal` (options)
- Size: 20px icon, 44px touch target via `p-3 -m-3` pattern

### Accessibility
- Card root: `article` element
- Header: `<a href="/posts/:id">` wrapping post body (entire card clickable)
- Like button: `<button aria-label="Like post by {displayName}, {count} likes" aria-pressed={liked}`
- Reply button: `<button aria-label="Reply to post by {displayName}">`
- Avatar: `<img alt="{displayName}'s avatar">`

### React Component Interface
```typescript
interface PostCardProps {
  postId: string
  author: { userId: string; displayName: string; username: string; avatarUrl: string }
  body: string
  createdAt: string       // ISO 8601 — displayed as relative time
  likeCount: number
  replyCount: number
  likedByMe: boolean
  isOwn: boolean          // shows delete option in ⋯ menu
  onLike: (postId: string) => void
  onUnlike: (postId: string) => void
  onDelete?: (postId: string) => void
}
```

---

## UI-MB-002 — Compose Post Area

### Variants

| Variant         | Where used                    | Layout                                   |
|-----------------|-------------------------------|------------------------------------------|
| `inline`        | Top of home timeline feed     | Single row: avatar + textarea + Post btn |
| `modal`         | Desktop "New Post" button     | Centered modal, full textarea, char counter |
| `reply-inline`  | Below parent post in thread   | Avatar + textarea + Reply btn            |
| `mobile-fab`    | Mobile floating action button | Opens full-screen compose sheet          |

### Character Counter

```
0–239:    text-slate-400  "0 / 280"
240–279:  text-yellow-600 "240 / 280"   ← approaching limit
280:      text-green-600  "280 / 280"   ← Post button enabled
281+:     text-red-600    "-1"          ← Post button disabled, counter red
```

### Post Button States

| State     | Classes                                                        |
|-----------|----------------------------------------------------------------|
| Disabled  | `bg-blue-200 text-white cursor-not-allowed opacity-60`         |
| Enabled   | `bg-blue-600 text-white hover:bg-blue-800 active:scale-95`     |
| Loading   | spinner icon replaces label; button disabled                   |

### Tokens
- Textarea background: `semantic.surface.DEFAULT`
- Textarea border: `semantic.border.DEFAULT` (none when inline variant)
- Textarea focus ring: `semantic.border.focus` (blue-500)
- Textarea placeholder: `semantic.text.tertiary`

### Accessibility
- `<textarea aria-label="Compose post" aria-describedby="char-counter">`
- `<span id="char-counter" aria-live="polite">{count} of 280 characters</span>`
- Post button: `aria-disabled={!canPost}` (not HTML `disabled` — allows focus)
- Keyboard: Ctrl/Cmd + Enter submits

---

## UI-MB-003 — Navigation

### Left Sidebar (Desktop ≥ 1280px)

```
Width: 240px | Position: fixed | Height: 100vh | z-index: 40
```

| Element           | Spec                                                    |
|-------------------|---------------------------------------------------------|
| Logo              | `displaySm` weight semibold · primary.DEFAULT color     |
| Nav item          | `labelLg` 16px medium · 48px height · full-width click  |
| Active nav item   | `semantic.primary.muted` bg (blue-100) · primary text   |
| Hover nav item    | `semantic.neutral.100` bg (slate-100)                  |
| Notification badge| 20px pill · `semantic.error.DEFAULT` bg · white text · `labelSm` |
| New Post button   | Full-width primary solid · `md` radius · 48px height    |
| User footer       | Avatar 32px + username + settings icon at bottom        |

### Icon-Only Sidebar (Tablet 768–1279px)

```
Width: 72px | Icons centered | No labels
```
- Icons: 24px lucide-react
- Active: primary.DEFAULT color
- Floating compose button: 52px circle FAB at bottom

### Bottom Navigation (Mobile < 768px)

```
Height: 64px | Fixed bottom | z-index: 50 | Full width
Background: semantic.surface.raised + border-top semantic.border.DEFAULT
```

| Tab   | Icon            | Label       |
|-------|-----------------|-------------|
| Home  | `Home`          | Home        |
| Explore | `Search`      | Explore     |
| Notifications | `Bell` | Alerts (badge) |
| Profile | `User`       | Profile     |

- Touch target: 44×44px minimum per tab
- Active tab: `semantic.primary.DEFAULT` icon color
- Inactive tab: `semantic.text.tertiary`
- FAB: 52px circle button · `semantic.primary.DEFAULT` bg · pencil icon · bottom-right fixed

### Accessibility
- `<nav aria-label="Main navigation">`
- Active item: `aria-current="page"`
- Notification badge: `aria-label="Notifications, 3 unread"`
- Bottom nav: `role="navigation" aria-label="Primary navigation"`

---

## UI-MB-004 — Profile Header Component

### Anatomy

```
[Avatar 80px]  DisplayName              [Follow | Following | Edit Profile]
               @username
               Bio text — up to 160 chars
               📅 Joined {month} {year}
               {N} Following  ·  {N} Followers
```

### Tokens

| Element         | Token                                        |
|-----------------|----------------------------------------------|
| Display name    | `textXl` (25px) semibold · text.primary      |
| Username        | `textMd` · text.secondary                    |
| Bio             | `textMd` · text.primary · line-height normal |
| Joined date     | `textSm` · text.tertiary                     |
| Follower counts | `labelLg` bold + `textSm` label · text.secondary |
| Avatar          | 80×80px · border-radius full (circle) · border 3px surface.DEFAULT |

### Follow Button Variants

| State          | Label       | Classes                                                    |
|----------------|-------------|------------------------------------------------------------|
| Not following  | Follow      | `bg-blue-600 text-white hover:bg-blue-800` solid primary   |
| Following (idle) | Following | `bg-transparent border border-slate-300 text-slate-700`   |
| Following (hover) | Unfollow | `border-red-300 text-red-600` — signals destructive action |
| Own profile    | Edit Profile | `bg-transparent border border-slate-300 text-slate-700`  |

- Follow/Unfollow: optimistic update — toggle instantly, revert on API error

### Tab Bar (Posts / Replies / Likes)

```
Height: 44px | Full-width underline indicator
Active tab: underline 2px primary.DEFAULT · text text.primary weight semibold
Inactive tab: text text.secondary · hover bg neutral.50
```

### Accessibility
- Avatar: `<img alt="{displayName}'s profile photo">`
- Follow button: `aria-label="Follow {displayName}"` / `aria-pressed={isFollowing}`
- Follower counts: `<a href="/users/{username}/followers">842 Followers</a>` (linked)

---

## UI-MB-005 — Inline Field Error & Form Feedback

### Input Error State

```
Field label        (labelMd, text.primary)
┌───────────────────────────────────┐
│ invalid value                     │   ← border: error.DEFAULT (red-600)
└───────────────────────────────────┘
⚠  Error message here               ← error.DEFAULT text · textSm · ⚠ icon 16px
```

### Input Variants

| State       | Border                      | Background                    |
|-------------|-----------------------------|-------------------------------|
| Default     | `semantic.border.DEFAULT`   | `semantic.surface.DEFAULT`    |
| Focus       | `semantic.border.focus` 2px | `semantic.surface.DEFAULT`    |
| Error       | `semantic.error.DEFAULT` 1px | `semantic.error.subtle`       |
| Disabled    | `semantic.border.subtle`    | `semantic.neutral.100`        |
| Success     | `semantic.success.DEFAULT`  | `semantic.success.subtle`     |

### Toast Notifications

```
Position: bottom-right (desktop) | bottom-center (mobile)
Duration: 4000ms auto-dismiss
Width: 320px desktop / 100vw – 32px mobile
```

| Type    | Icon        | Background              | Text                      |
|---------|-------------|-------------------------|---------------------------|
| Success | `CheckCircle2` green | `success.subtle` (green-50) | `success.dark` (green-800) |
| Error   | `XCircle` red | `error.subtle` (red-50) | `error.dark` (red-800)    |
| Info    | `Info` blue | `primary.subtle` (blue-50) | `primary.dark` (blue-800) |

### Alert Banner (Account Locked)

```
┌───────────────────────────────────────────────────────┐
│ ⚠  Account temporarily locked.                       │  ← warning.subtle bg
│    Try again in 14 minutes.                          │     warning.dark text
└───────────────────────────────────────────────────────┘
```
- `role="alert" aria-live="assertive"` for screen readers

---

## UI-MB-006 — Design Tokens for New Post Banner

```
Position: sticky top-0 in feed (below header on mobile)
```

```
┌────────────────────────────────────────────────────┐
│ ↑  Show 4 new posts                                │
└────────────────────────────────────────────────────┘
```

| Property    | Value                                              |
|-------------|----------------------------------------------------|
| Background  | `semantic.primary.DEFAULT` (blue-600)              |
| Text        | `semantic.primary.fg` (white) · `labelLg`          |
| Height      | 40px                                               |
| Cursor      | pointer                                            |
| Animation   | slide-down from -40px · duration 200ms · ease-out  |
| On click    | Scrolls to top, inserts new posts, banner dismisses|

Accessibility: `role="button" tabIndex={0} aria-label="Show 4 new posts"`

---

## Design System Configuration Applied

```json
{
  "theme": {
    "name": "microblog",
    "primaryColor": "blue",
    "neutralColor": "slate",
    "radius": "md",
    "density": "comfortable",
    "fontFamilySans": "Inter"
  },
  "framework": { "name": "react-tailwind" },
  "accessibility": { "wcagLevel": "AA" },
  "darkMode": { "enabled": true, "strategy": "class", "defaultMode": "system" }
}
```

### CSS Variables (`globals.css`)

```css
@theme {
  /* Primary */
  --color-primary:         #2563eb;
  --color-primary-hover:   #1e40af;
  --color-primary-subtle:  #eff6ff;
  --color-primary-fg:      #ffffff;

  /* Neutral */
  --color-surface:         #ffffff;
  --color-surface-subtle:  #f8fafc;
  --color-border:          #e2e8f0;
  --color-border-focus:    #3b82f6;

  /* Text */
  --color-text-primary:    #0f172a;
  --color-text-secondary:  #475569;
  --color-text-tertiary:   #94a3b8;

  /* Feedback */
  --color-error:           #dc2626;
  --color-error-subtle:    #fef2f2;
  --color-success:         #16a34a;
  --color-warning:         #eab308;

  /* Radius */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-full: 9999px;

  /* Font */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

.dark {
  --color-surface:         #0f172a;
  --color-surface-subtle:  #020617;
  --color-surface-raised:  #1e293b;
  --color-border:          #334155;
  --color-text-primary:    #f8fafc;
  --color-text-secondary:  #cbd5e1;
  --color-text-tertiary:   #64748b;
}
```

---

## Accessibility Checklist (P0 — must pass before release)

- [ ] Color contrast ≥ 4.5:1 for all body text (verified with Tailwind slate-900 on white = 16.75:1 ✓)
- [ ] Like/Follow state not conveyed by color alone — icon fill + label change
- [ ] All interactive elements reachable by Tab; focus ring always visible (`outline-none ring-2 ring-blue-500`)
- [ ] Modal (compose, delete confirm) traps focus; Escape dismisses
- [ ] Touch targets ≥ 44×44px — action bar icons, nav items, buttons
- [ ] `aria-live="polite"` on character counter; `aria-live="assertive"` on error alerts
- [ ] Bottom nav tabs have visible labels (not icon-only) — labels shown at ≥ 375px
- [ ] Images have `alt` text; decorative icons have `aria-hidden="true"`
- [ ] Keyboard shortcut: `n` opens compose from timeline (with `aria-keyshortcuts`)
