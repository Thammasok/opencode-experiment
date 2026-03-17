# Templates — Page-Level Layouts

Templates define the structural skeleton for full pages. They position organisms and define responsive behavior.

---

## Dashboard Layout

### Structure
```
┌────────────────────────────────────────────────────────┐
│                    Header (sticky)                     │
├──────────┬─────────────────────────────────────────────┤
│          │  Page Title + Breadcrumb                    │
│ Sidebar  │─────────────────────────────────────────────│
│          │  Stats Row [ Card ][ Card ][ Card ][ Card ] │
│  240px   │─────────────────────────────────────────────│
│          │  Main Content Area (12-column grid)         │
│          │  [ Chart 8col ]  [ Activity Feed 4col ]     │
│          │─────────────────────────────────────────────│
│          │  Data Table (full width)                    │
└──────────┴─────────────────────────────────────────────┘
```

### Grid Usage
- Stats: 4 columns on lg+, 2 on md, 1 on sm
- Content: use 12-column grid — chart takes 8, sidebar takes 4
- Mobile: sidebar collapses to overlay drawer

### Next.js App Router Structure
```
app/
  (dashboard)/
    layout.tsx     ← Sidebar + Header wrapper
    page.tsx       ← Dashboard overview
    analytics/
      page.tsx
    settings/
      page.tsx
```

---

## Auth Layout

### Structure
```
┌────────────────────────────────────────────────────────┐
│          [ Brand Logo / Illustration ]  (50% - lg+)    │
│  Auth                                                  │
│  Card   ├───────────────────────────────────────────── │
│  (50%   │  [Logo]                                      │
│  lg+,   │  [Title: Sign in to App]                     │
│  100%   │  [Subtitle]                                  │
│  sm)    │  [Form Fields]                               │
│         │  [Primary CTA Button]                        │
│         │  [Divider: or]                               │
│         │  [OAuth Buttons]                             │
│         │  [Link: Don't have an account? Sign up]      │
└─────────┴───────────────────────────────────────────── ┘
```

### Layout Rules
- Always `min-h-screen` with `flex items-center justify-center`
- Card max-width: 400px
- Add `autocomplete` attributes to all auth inputs
- Group password + confirm-password in `<fieldset>`

### Landmark Regions
```tsx
<main aria-label="Authentication">
  <section aria-labelledby="auth-title">
    <h1 id="auth-title">Sign in</h1>
    <form>...</form>
  </section>
</main>
```

---

## Settings Layout

### Structure
```
┌────────────────────────────────────────────────────────┐
│ Header                                                 │
├──────────────────┬─────────────────────────────────────┤
│                  │  Page Header: Settings              │
│  Settings Nav    │─────────────────────────────────────│
│  ─────────────   │  [Section Title]                    │
│  > Profile       │  [Description]                      │
│    Account       │  ┌──────────────────────────────┐   │
│    Notifications │  │ Form Section (Card)          │   │
│    Security      │  │  Field  Field  Field         │   │
│    Billing       │  │  [Save]                      │   │
│    Appearance    │  └──────────────────────────────┘   │
│    API Keys      │  ┌──────────────────────────────┐   │
│                  │  │ Danger Zone (red border)     │   │
│                  │  └──────────────────────────────┘   │
└──────────────────┴─────────────────────────────────────┘
```

### Layout Rules
- Settings nav: 200px fixed left on lg+, tabs on mobile
- Content max-width: 720px (prose-readable)
- Each section in its own `<section>` with `<h2>`
- Danger zone: last section, red border card, destructive actions only

### Navigation Role
```tsx
<nav aria-label="Settings sections">
  <ul role="list">
    {sections.map(s => (
      <li key={s.id}>
        <a
          href={`#${s.id}`}
          aria-current={active === s.id ? 'true' : undefined}
        >
          {s.label}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

---

## List / Detail Layout

### Structure (Split View — lg+)
```
┌───────────────────┬────────────────────────────────────┐
│  List Panel       │  Detail Panel                      │
│  ──────────────   │  ───────────────────────────────   │
│  [Search/Filter]  │  [Item Title]       [Actions]      │
│  ──────────────   │  ─────────────────────────────     │
│  [Item]  ▶ active │  [Full content / tabs / sections]  │
│  [Item]           │                                    │
│  [Item]           │                                    │
│  [Item]           │                                    │
│  [Load more]      │                                    │
└───────────────────┴────────────────────────────────────┘
```

### Responsive Behavior
| Breakpoint | Layout |
|---|---|
| xs–md | Single column: list → navigate to detail (full page) |
| lg+ | Split view: list (320px) + detail (remaining) |

### State Handling
- **Empty list**: empty state illustration + CTA
- **Loading**: skeleton items (3–5)
- **No selection**: "Select an item to view details" placeholder
- **Item deleted**: auto-select next item or show empty state

### Route Pattern (Next.js)
```
app/
  inbox/
    layout.tsx        ← list + detail split layout
    page.tsx          ← default: no selection
    [messageId]/
      page.tsx        ← detail view
```

---

## Template Checklist

Before shipping any template:

- [ ] All heading levels are sequential (`h1` → `h2` → `h3`)
- [ ] Landmark regions: `<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`
- [ ] Skip-to-main-content link as first focusable element
- [ ] Page title is unique and descriptive
- [ ] Responsive breakpoints tested: 320px, 768px, 1024px, 1440px
- [ ] Content remains accessible without sidebar/nav (mobile)
- [ ] Loading/error/empty states handled for all data-fetching sections
