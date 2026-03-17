# Organisms — Complex UI Sections

Organisms combine molecules and atoms into distinct sections of the UI.

---

## Header / Top Navigation

### Layout
```
┌─────────────────────────────────────────────────────┐
│ [Logo/Brand]   [Nav Links]   [Search?]  [User Menu] │
└─────────────────────────────────────────────────────┘
```

### Spec
- Height: 64px desktop / 56px mobile
- `position: sticky; top: 0; z-index: {zIndex.sticky}` (200)
- Background: `surface.DEFAULT` with `border-bottom` or `shadows.elevation.xs`
- Mobile: collapse nav links into hamburger menu

### Semantic HTML
```tsx
<header>
  <nav aria-label="Main navigation">
    <a href="/" aria-label="Go to homepage">
      <Logo />
    </a>
    <ul role="list">
      {links.map(link => (
        <li key={link.href}>
          <a href={link.href} aria-current={isActive(link) ? 'page' : undefined}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
    <button aria-controls="mobile-menu" aria-expanded={mobileOpen}>
      <span className="sr-only">Open menu</span>
      <Menu aria-hidden="true" />
    </button>
  </nav>
</header>
```

---

## Sidebar Navigation

### Variants
- **Fixed** — always visible, pushes content
- **Overlay** — slides over content (mobile)
- **Collapsible** — icon-only when collapsed (64px), full when expanded (240px)

### Layout (Collapsible)
```
┌──────────────────────┐
│ [Logo]         [◀▶]  │  ← collapse toggle
│─────────────────────│
│ [icon] Dashboard     │  ← nav item (aria-current="page" when active)
│ [icon] Analytics     │
│ [icon] Settings      │
│─────────────────────│
│ [icon] User Profile  │  ← bottom section
└──────────────────────┘
```

### Accessibility
```tsx
<nav aria-label="Sidebar navigation">
  <button
    aria-expanded={!collapsed}
    aria-controls="sidebar-nav"
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  />
  <ul id="sidebar-nav" role="list">
    {/* nav items */}
  </ul>
</nav>
```

---

## Form (Organism)

A complete form section with field layout, submission, and validation feedback.

### Layout Patterns
- **1-column**: default, max-width 480px
- **2-column**: labels left, inputs right (md+ screens), use CSS grid
- **Section groups**: `<fieldset>` + `<legend>` for logical groups

### Validation Strategy
- **On submit**: validate all fields, scroll to first error, set focus
- **On blur**: validate individual field after user leaves
- **On change**: only after first submit attempt

```tsx
<form
  onSubmit={handleSubmit}
  noValidate
  aria-label="Account settings"
>
  <fieldset>
    <legend className="text-lg font-semibold">Personal Information</legend>
    <FormField name="name" label="Full name" required />
    <FormField name="email" label="Email" type="email" required />
  </fieldset>

  {formError && (
    <div role="alert" className="alert alert--error">
      {formError}
    </div>
  )}

  <div className="flex justify-end gap-3">
    <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
    <Button type="submit" loading={isSubmitting}>Save changes</Button>
  </div>
</form>
```

---

## Data Table

### Features
- Sortable columns
- Row selection (checkbox)
- Pagination or infinite scroll
- Empty state
- Loading skeleton

### Anatomy
```
┌────────────────────────────────────────────────────────┐
│ [Table Title]                        [Search] [Filter] │
│────────────────────────────────────────────────────────│
│ [☐] Name ▲   Email          Role    Actions           │  ← thead
│────────────────────────────────────────────────────────│
│ [☐] Alice    a@example.com  Admin   [Edit] [Delete]   │  ← tbody
│ [☐] Bob      b@example.com  User    [Edit] [Delete]   │
│────────────────────────────────────────────────────────│
│ Showing 1–10 of 47     [< 1 2 3 4 5 >]                │  ← tfoot / pagination
└────────────────────────────────────────────────────────┘
```

### Accessibility
```tsx
<table aria-label="Users" aria-rowcount={totalRows} aria-busy={loading}>
  <caption className="sr-only">Users list, sorted by name ascending</caption>
  <thead>
    <tr>
      <th scope="col">
        <input type="checkbox" aria-label="Select all rows" />
      </th>
      <th scope="col" aria-sort="ascending">
        <button>Name <SortIcon /></button>
      </th>
    </tr>
  </thead>
</table>
```

- `aria-sort="ascending|descending|none"` on sorted column header
- `aria-selected="true"` on selected rows
- `role="status"` for live row count updates

---

## Modal / Dialog

### Anatomy
```
[Overlay backdrop]
┌──────────────────────────────┐
│ Title                  [✕]  │  ← header
│──────────────────────────────│
│                              │  ← body (scrollable)
│ Content                      │
│──────────────────────────────│
│ [Cancel]          [Confirm] │  ← footer
└──────────────────────────────┘
```

### Spec
| Size | Max-width |
|---|---|
| sm | 400px |
| md | 560px |
| lg | 720px |
| xl | 960px |
| full | 100vw - 32px |

### Accessibility (Critical)
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <h2 id="modal-title">Confirm deletion</h2>
  <p id="modal-desc">This action cannot be undone.</p>
</div>
```

**Focus management (mandatory):**
1. On open: move focus to first focusable element (or modal container if none)
2. Trap focus inside modal while open (Tab / Shift+Tab cycle within)
3. On close: return focus to trigger element

**Close triggers:** Escape key, backdrop click (configurable), close button

---

## Drawer

Like modal but slides in from an edge.

| Placement | Width / Height |
|---|---|
| left / right | 320px default (resizable) |
| top / bottom | 50vh default |

- Same focus management as Modal
- `aria-label` for non-titled drawers
- `z-index: {zIndex.modal}` (400)
- Backdrop: `rgba(0,0,0,0.5)` with `backdrop-blur-sm`
