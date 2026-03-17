# Atoms — Base Components

Atoms are the smallest indivisible UI components. They accept no other components as children (only primitive content like text, icons, or images).

---

## Button

**Variants:** `solid` | `outline` | `ghost` | `link` | `destructive`
**Sizes:** `xs` | `sm` | `md` | `lg` | `xl`
**States:** default | hover | active/pressed | focus | disabled | loading

### Anatomy
```
[leading-icon?] [label] [trailing-icon?]
```

### Spec
| Property | Value |
|---|---|
| Min height | 44px (touch target) |
| Padding (md) | 12px 16px |
| Font | `labelMd` (500 weight) |
| Radius | `semantic.radius.button` from config |
| Focus ring | `shadows.focusRing.default` |
| Transition | `bg, border, color 150ms ease` |

### States
- **disabled** — `opacity: 0.4`, `cursor: not-allowed`, no pointer events
- **loading** — replace leading icon with spinner, maintain width, `aria-busy="true"`

### Accessibility
- Must be a `<button>` element (not `<div>`)
- `aria-label` required when icon-only
- `aria-disabled="true"` + `tabindex="-1"` for disabled
- `aria-busy="true"` when loading

### Usage (React + Tailwind cva)
```tsx
const button = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-white hover:bg-primary/90',
        outline: 'border border-primary text-primary hover:bg-primary/10',
        ghost: 'hover:bg-neutral-100 text-neutral-800',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-sm',
        sm: 'h-8 px-3 text-sm rounded',
        md: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-11 px-5 text-base rounded-md',
        xl: 'h-12 px-6 text-base rounded-lg',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  }
)
```

---

## Input

**Variants:** `outline` | `filled` | `flushed` | `unstyled`
**Sizes:** `sm` | `md` | `lg`
**Types:** text | email | password | number | search | tel | url
**States:** default | focus | filled | error | disabled | readonly

### Anatomy
```
[label]
[prefix?] [input-field] [suffix? / clear-btn? / password-toggle?]
[helper-text / error-message]
```

### Spec
| Property | Value |
|---|---|
| Height (md) | 40px |
| Padding | 12px |
| Font | `textMd` |
| Border | 1px `semantic.border.DEFAULT` |
| Focus border | `semantic.border.focus` |
| Error border | `semantic.error.DEFAULT` |

### Accessibility
- `<label>` must be associated via `for`/`htmlFor` or `aria-labelledby`
- Error message needs `role="alert"` or `aria-live="polite"`
- `aria-invalid="true"` on error state
- `aria-describedby` links input to helper/error text

---

## Label

**Variants:** `default` | `required` | `optional` | `disabled`

```tsx
<label htmlFor={id} className="text-sm font-medium text-neutral-700">
  {children}
  {required && <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>}
</label>
```

- Never use `color` alone to indicate required state — pair with text or symbol
- Font: `labelMd`

---

## Icon

- Use `lucide-react` as default icon library (config: `framework.iconLibrary`)
- Always provide `aria-hidden="true"` on decorative icons
- Use `aria-label` + `role="img"` on standalone meaningful icons
- Size scale: `16px` (sm) | `20px` (md, default) | `24px` (lg) | `32px` (xl)

```tsx
<Icon name="ChevronDown" size={20} aria-hidden="true" />
```

---

## Badge

**Variants:** `default` | `primary` | `success` | `warning` | `error` | `outline`
**Sizes:** `sm` | `md`

```
Padding: 2px 8px | Radius: semantic.radius.badge | Font: labelSm
```

- Max width: 120px with text truncation
- Never use color alone to convey status — pair with icon or text
- `role="status"` for live-updating badges

---

## Avatar

**Variants:** image | initials | fallback-icon
**Sizes:** `xs` (24px) | `sm` (32px) | `md` (40px) | `lg` (48px) | `xl` (64px) | `2xl` (96px)

- Always provide `alt` text for image avatars
- Initials are `aria-hidden` — wrap with `<span aria-label="User name">`
- Status dot (online/away/offline) needs `aria-label`

---

## Checkbox

**States:** unchecked | checked | indeterminate | disabled

- Must be a real `<input type="checkbox">` — never a styled div
- `indeterminate` state set via JS: `el.indeterminate = true`
- `aria-checked="mixed"` for indeterminate
- Click target minimum 44×44px (includes visible label)

---

## Radio

**States:** unselected | selected | disabled

- Group wrapped in `<fieldset>` with `<legend>`
- `name` attribute must be same for all radios in group
- Arrow key navigation within group (native behavior)

---

## Toggle (Switch)

**States:** off | on | disabled

```tsx
<button
  role="switch"
  aria-checked={checked}
  aria-label="Enable notifications"
  className="..."
/>
```

- Must use `role="switch"` + `aria-checked`
- Labelled via `aria-label` or `aria-labelledby`
- Click + Enter + Space activate toggle

---

## Tooltip

**Trigger:** hover (150ms delay) | focus (immediate)
**Position:** top | right | bottom | left (auto-flip when near viewport edge)

```tsx
<div role="tooltip" id="tip-id">Tooltip content</div>
<button aria-describedby="tip-id">Trigger</button>
```

- Max width: 240px with text wrapping
- Never put interactive content inside tooltip
- Hide on Escape, mouse-leave, blur
- Don't use for critical information — it's not accessible on touch
