# Design-to-Code Workflow

A structured process for translating design into production-ready, accessible, maintainable code.

---

## Handoff Checklist (Designer → Developer)

Before writing code, verify the design spec contains:

### Visual Specs
- [ ] All states: default, hover, active, focus, disabled, loading, error, empty
- [ ] All breakpoints: mobile (320px), tablet (768px), desktop (1280px)
- [ ] Component sizes/variants explicitly named
- [ ] Spacing values map to the token scale
- [ ] Color values use semantic tokens (not raw palette)

### Interaction Specs
- [ ] Transition duration + easing specified
- [ ] Micro-interactions documented
- [ ] Loading/skeleton states shown
- [ ] Error states: form validation, API errors, empty states

### Content Specs
- [ ] Character limits for truncation
- [ ] Fallback content (broken image, missing avatar)
- [ ] Internationalization: does layout hold for long translated text?

---

## Implementation Steps

### 1. Audit Design Before Coding
- Map every color/spacing/typography value to a design token
- Flag anything that doesn't exist in the token system
- Identify re-usable patterns vs one-offs

### 2. Build in Isolation
- Use Storybook or a dev server page to build components in isolation
- Start with the smallest atoms first
- Each component covers all variants and states before moving on

### 3. State Documentation Matrix

For every interactive component, explicitly handle:

| State | UI Change | Code Trigger |
|---|---|---|
| default | – | initial render |
| loading | skeleton / spinner | `isLoading === true` |
| empty | empty state illustration | `data.length === 0` |
| error | error alert / inline error | `error !== null` |
| success | success toast / feedback | `onSuccess()` |

### 4. Edge Cases Checklist
- [ ] **Overflow:** Long text truncates with `...` and tooltip on hover
- [ ] **Zero state:** List with 0 items shows empty state component
- [ ] **Single item:** List with 1 item looks correct (no "ghost" spacing)
- [ ] **Max content:** What does a name with 80 characters look like?
- [ ] **Network errors:** API down, timeout, 404, 500 — each shows correct UI
- [ ] **Slow networks:** Progressive loading, no layout shift
- [ ] **High contrast mode:** Uses `forced-colors: active` media query
- [ ] **RTL languages:** Does layout flip correctly?

---

## CSS Implementation Order

```
1. Layout (display, grid, flex, position)
2. Box model (width, height, padding, margin, border)
3. Typography (font, line-height, text-align, color)
4. Visual decoration (background, shadow, border-radius, opacity)
5. Animation (transition, animation)
6. State overrides (:hover, :focus, :disabled, [aria-selected])
```

---

## Component API Design

When writing a React component:

```tsx
// Define prop interface explicitly
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  // Don't add: className override (let cva handle it)
  // Do add: asChild (Radix pattern) if polymorphic needed
}

// Component with forwarded ref for composability
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={button({ variant, size })}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? <Spinner className="mr-2" aria-hidden="true" /> : leftIcon}
        {children}
        {rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

---

## Definition of Done

A component is done when:

- [ ] All design variants and sizes implemented
- [ ] All states (hover, focus, disabled, loading, error) styled
- [ ] Responsive behavior matches spec at all breakpoints
- [ ] Keyboard navigable and operable
- [ ] Screen reader tested (VoiceOver or NVDA)
- [ ] Color contrast passes WCAG AA (4.5:1 for normal text, 3:1 for large/UI)
- [ ] Works with 200% browser zoom
- [ ] Works without JavaScript (if applicable)
- [ ] Prop types / TypeScript types documented
- [ ] Story or demo page created
- [ ] Peer code review passed
