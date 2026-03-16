---
name: ux-ui-designer
description: >
  Use this skill whenever the user needs UX/UI design assistance, including:
  component design and specifications, design system setup and token configuration,
  accessibility audits (WCAG 2.2), ARIA pattern implementation, design review
  and heuristic evaluation (Nielsen's 10), user flow design, prototyping guidance,
  responsive layout design, design-to-code handoff, color system and typography
  setup, and framework-specific implementation (React + Tailwind, Next.js, SwiftUI).
  Trigger when the user mentions: design system, UI components, UX flows, wireframes,
  prototypes, accessibility, WCAG, ARIA, color tokens, typography scale, spacing,
  Figma handoff, responsive design, dark mode, or asks to design/review/improve UI.
  Always read design-system.config.json first to understand active theme and framework settings.
---

# UX/UI Designer Skill

## Core Principle

Design is problem-solving. Before proposing any visual solution, understand:
1. **Who** is the user and what is their goal?
2. **What** task are they trying to complete?
3. **Where** in the flow does this component/screen appear?
4. **What constraints** exist (framework, accessibility level, existing design system)?

---

## Response Mode

- **Quick question** (e.g., "what color for error state?") → Direct answer + token reference
- **Component design** → Anatomy, variants, states, accessibility requirements, code example
- **Design review** → Heuristic checklist, severity ranking, actionable recommendations
- **System setup** → Walk through `design-system.config.json` → token files → CSS variables → component implementation

---

## 1. Read Design System Config First

Always check the project's design system config before generating any code or specs:

```
.opencode/skills/ux-ui-designer/design-system/design-system.config.json
```

Key fields to read:
- `theme.primaryColor` + `theme.radius` + `theme.density` → affects all component styles
- `framework.name` → determines which framework patterns to use
- `accessibility.wcagLevel` → determines how strict to be
- `darkMode.enabled` → whether to include dark mode variants

---

## 2. Design Token Reference

| Need | File |
|---|---|
| Colors (palette, semantic, component, dark mode) | `tokens/colors.json` |
| Typography (font families, scale, text styles) | `tokens/typography.json` |
| Spacing (4px grid, semantic aliases, density) | `tokens/spacing.json` |
| Shadows (elevation levels, focus rings, colored) | `tokens/shadows.json` |
| Borders (radius scale, presets, width) | `tokens/borders.json` |
| Breakpoints (responsive, grid, z-index) | `tokens/breakpoints.json` |

**Token usage tiers:**
```
palette.*     → raw values, only for token file internals
semantic.*    → for component styles and utility classes
component.*   → component-scoped token overrides
```

---

## 3. Component Design Guidelines

### Atomic Design Hierarchy
```
Atoms      → Button, Input, Icon, Badge, Avatar, Label, Checkbox, Radio, Toggle, Tooltip
Molecules  → Form Field, Card, Search Bar, Alert, Dropdown, Navigation Item
Organisms  → Header, Sidebar, Form, Data Table, Modal, Drawer
Templates  → Dashboard, Auth, Settings, List/Detail
```

Reference files:
- `components/atoms.md`
- `components/molecules.md`
- `components/organisms.md`
- `components/templates.md`

### Component Design Checklist (every component)
- [ ] All variants defined (solid, outline, ghost, destructive...)
- [ ] All sizes defined (xs, sm, md, lg, xl)
- [ ] All states: default, hover, focus, active, disabled, loading, error
- [ ] Mobile touch target ≥ 44×44px
- [ ] Dark mode variant
- [ ] Keyboard interaction documented
- [ ] ARIA role + attributes specified

---

## 4. Accessibility Standards

**Default target: WCAG 2.2 Level AA** (configurable via `accessibility.wcagLevel`)

Critical checks (P0 — never skip):
- Color contrast: ≥4.5:1 body text, ≥3:1 large text + UI elements
- Every interactive element has accessible name
- Focus indicator always visible (never `outline: none` without custom ring)
- No information conveyed by color alone
- Touch targets ≥44×44px
- Focus order matches visual order
- Modal/dialog traps focus + Escape closes

Reference:
- `accessibility/wcag-checklist.md` → full WCAG 2.2 checklist
- `accessibility/aria-patterns.md` → ARIA for 15+ component types

---

## 5. Framework-Specific Implementation

Determine framework from `design-system.config.json > framework.name`:

| Config value | Reference file |
|---|---|
| `react-tailwind` | `frameworks/react-tailwind.md` |
| `nextjs` | `frameworks/nextjs.md` |
| `swiftui` | `frameworks/swiftui.md` |

### React + Tailwind Pattern Summary
- Use `cva` (class-variance-authority) for component variants
- Use `cn()` (clsx + twMerge) for conditional classes
- CSS variables via `@theme` block in `globals.css`
- `React.forwardRef` + `displayName` on all components
- `aria-*` attributes as first-class props

### SwiftUI Pattern Summary
- Use `Font.TextStyle` for body text (Dynamic Type)
- Map design tokens to `Color` extensions + `Spacing` enum
- Minimum 44pt touch targets on iOS
- `@Environment(\.accessibilityReduceMotion)` for animations
- `accessibilityElement(children: .combine)` for grouped content

---

## 6. Design Review Process

When reviewing a design or implementation:

1. **Heuristic scan** — Nielsen's 10 heuristics (see `workflows/design-review.md`)
2. **Consistency check** — do all components use design tokens consistently?
3. **State coverage** — are loading, error, empty states all handled?
4. **Accessibility audit** — run through P0 items in `accessibility/wcag-checklist.md`
5. **Responsive check** — does layout work at 320px, 768px, 1280px?

Severity scale: **P0** = must fix | **P1** = should fix | **P2** = nice to have

---

## 7. Design System Setup Guide

When setting up the design system for a new project:

### Step 1 — Configure
Edit `design-system.config.json`:
```json
{
  "theme": {
    "primaryColor": "blue",   // blue | green | purple | ...
    "radius": "md",           // sharp | sm | md | lg | xl | pill
    "density": "comfortable", // compact | comfortable | spacious
    "mode": "light"           // light | dark | system
  },
  "framework": {
    "name": "react-tailwind"  // react-tailwind | nextjs | swiftui
  }
}
```

### Step 2 — Install CSS Variables
Copy semantic color tokens to CSS `@theme` block in `globals.css`.
Set radius/spacing variables from config presets.

### Step 3 — Implement Base Components
Order: Button → Input → Label → FormField → Card → Badge → Alert

### Step 4 — Test Accessibility
- Tab through all interactive elements
- Test with VoiceOver (macOS) or NVDA (Windows)
- Run `axe-core` in Storybook or browser devtools

---

## 8. Design Decisions Quick Reference

**Color:**
- Primary action → `semantic.primary.DEFAULT`
- Destructive action → `semantic.error.DEFAULT`
- Success feedback → `semantic.success.DEFAULT`
- Warning → `semantic.warning.DEFAULT`
- Body text → `semantic.text.primary`
- Secondary text → `semantic.text.secondary`

**Spacing:**
- Component padding → `semantic.componentPadding.md` (12px)
- Gap between related items → `semantic.gap.sm` (8px)
- Gap between unrelated sections → `semantic.section.md` (48px)

**Typography:**
- Page title → `displayMd` or `displaySm`
- Section heading → `textXl` semibold
- Body copy → `textMd` normal
- UI labels → `labelMd` medium
- Meta/caption → `textXs`

**Elevation:**
- Card → `shadows.elevation.sm`
- Dropdown/Popover → `shadows.elevation.md`
- Modal → `shadows.elevation.lg`
- Floating action → `shadows.elevation.xl`

*Always adapt response depth to context: quick answer for lookup questions, full spec + code for build tasks.*
