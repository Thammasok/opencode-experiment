# Molecules — Composite Components

Molecules are components built from 2+ atoms working together as a functional unit.

---

## Form Field

Combines: Label + Input + Helper Text + Error Message

### Anatomy
```
<div role="group">          ← optional, use when grouping related fields
  <Label />                 ← htmlFor={inputId}
  <Input />                 ← id={inputId}, aria-describedby={helpId errorId}
  <HelperText />            ← id={helpId}
  <ErrorMessage />          ← id={errorId}, role="alert"
</div>
```

### States
| State | Label color | Border | Message |
|---|---|---|---|
| Default | neutral-700 | border-DEFAULT | helper text (neutral-500) |
| Focus | neutral-700 | border-focus (blue) | helper text |
| Error | error-DEFAULT | border-error (red) | error message |
| Disabled | neutral-400 | border-subtle | – |
| Success | success-DEFAULT | border-success | success message |

### Rules
- Error replaces helper text (never show both)
- `aria-required="true"` on required inputs
- Field width defaults to 100% of container

---

## Search Bar

Combines: Input + Search Icon (prefix) + Clear Button (suffix) + optional Dropdown

### Anatomy
```
[🔍] [search input              ] [✕ clear?]
      [suggestion dropdown?          ]
```

### Behavior
- Trigger search: on Enter or after 300ms debounce
- Clear button: visible only when input has content
- Dropdown: `role="listbox"`, results are `role="option"`
- Arrow keys navigate dropdown options
- Escape: close dropdown, keep typed text

### Accessibility
```tsx
<div role="search">
  <label htmlFor="search" className="sr-only">Search</label>
  <input
    id="search"
    type="search"
    role="combobox"
    aria-expanded={open}
    aria-controls="search-results"
    aria-autocomplete="list"
  />
  <ul id="search-results" role="listbox" />
</div>
```

---

## Card

Combines: Surface + Shadow + Padding + optional Header / Body / Footer

### Variants
- `flat` — no shadow, border only
- `elevated` — `shadows.elevation.sm`
- `interactive` — hover/focus state, acts as link or button
- `selected` — highlighted border + bg tint

### Anatomy
```
┌─────────────────────────────────┐
│ [Card Header: title + actions]  │
│─────────────────────────────────│
│ [Card Body: main content]       │
│─────────────────────────────────│
│ [Card Footer: actions / meta]   │
└─────────────────────────────────┘
```

### Interactive Card
```tsx
// Entire card is clickable — use <article> or <section> + button
<article
  className="cursor-pointer rounded-lg border hover:border-primary focus-within:ring-2"
  onClick={handleClick}
>
  {/* Primary action as <a> or <button> that stretches to card */}
  <a href={href} className="focus:outline-none after:absolute after:inset-0">
    {title}
  </a>
</article>
```

---

## Navigation Item

Combines: Icon (optional) + Label + Badge (optional) + Active Indicator

### States
- default | hover | active/current | disabled | collapsed (icon-only)

```tsx
<a
  href={href}
  aria-current={isActive ? 'page' : undefined}
  className={cn('nav-item', isActive && 'nav-item--active')}
>
  <Icon aria-hidden="true" />
  <span>{label}</span>
  {badge && <Badge>{badge}</Badge>}
</a>
```

- `aria-current="page"` on active navigation item
- Keyboard: Tab to navigate, Enter/Space to activate

---

## Alert

Variants: `info` | `success` | `warning` | `error`
Dismissible: yes/no

### Anatomy
```
[icon] [title]          [✕ dismiss?]
       [description]
       [actions?]
```

| Variant | Icon | Color scheme |
|---|---|---|
| info | InfoCircle | blue |
| success | CheckCircle | green |
| warning | AlertTriangle | yellow |
| error | XCircle | red |

```tsx
<div role="alert" aria-live="polite" className="alert alert--error">
  <AlertIcon aria-hidden="true" />
  <div>
    <p className="font-medium">{title}</p>
    <p>{description}</p>
  </div>
  {dismissible && (
    <button aria-label="Dismiss alert" onClick={onDismiss}>
      <X aria-hidden="true" />
    </button>
  )}
</div>
```

- `role="alert"` for error/warning (assertive)
- `role="status"` + `aria-live="polite"` for info/success
- Icon must be `aria-hidden` — meaning is conveyed by color + text

---

## Dropdown (Menu)

Combines: Trigger Button + Floating Menu + Menu Items

### Anatomy
```
[Trigger Button ▾]
  ┌──────────────┐
  │ Menu Item    │
  │ Menu Item    │
  │ ───────────  │  ← separator
  │ Danger Item  │
  └──────────────┘
```

### ARIA Pattern
```tsx
<button
  aria-haspopup="menu"
  aria-expanded={open}
  aria-controls="menu-id"
>
  Options
</button>

<ul id="menu-id" role="menu" aria-label="Options">
  <li role="menuitem" tabIndex={-1}>Edit</li>
  <li role="menuitem" tabIndex={-1}>Duplicate</li>
  <li role="separator" />
  <li role="menuitem" tabIndex={-1} className="text-red-600">Delete</li>
</ul>
```

### Keyboard
| Key | Action |
|---|---|
| Enter / Space | Open menu, activate item |
| Arrow Down/Up | Navigate items |
| Home / End | First / last item |
| Escape | Close menu, return focus to trigger |
| Tab | Close menu |
