# WCAG 2.2 Checklist

Organized by POUR principles. Priority: **P0** = must ship | **P1** = should ship | **P2** = nice to have.

---

## Perceivable

| # | Criterion | Level | Priority | Notes |
|---|---|---|---|---|
| 1.1.1 | Non-text content has text alternative | A | P0 | `alt=""` for decorative, descriptive `alt` for informative |
| 1.2.2 | Captions for prerecorded video | A | P0 | All video must have synchronized captions |
| 1.3.1 | Info and relationships conveyed programmatically | A | P0 | Use semantic HTML; headings, lists, tables, forms |
| 1.3.2 | Meaningful sequence is preservable | A | P0 | DOM order = visual order |
| 1.3.3 | Instructions don't rely on shape/color/position alone | A | P0 | "Click the red button" → "Click the Submit button" |
| 1.3.4 | Content not restricted to single orientation | AA | P1 | Don't lock to portrait/landscape |
| 1.3.5 | Input purpose identified (`autocomplete`) | AA | P1 | Add `autocomplete` to name, email, address inputs |
| 1.4.1 | Color not used as only visual means | A | P0 | Always pair color with icon, pattern, or text |
| 1.4.2 | Audio can be paused/stopped/muted | A | P0 | No auto-playing audio without controls |
| 1.4.3 | Text contrast ≥ 4.5:1 (normal) / 3:1 (large) | AA | P0 | Verify with tooling (Figma A11y, Lighthouse) |
| 1.4.4 | Text can resize to 200% without loss | AA | P0 | Use `rem`, avoid fixed heights |
| 1.4.5 | Text not embedded in images | AA | P1 | Exception: logos |
| 1.4.10 | Reflow: content readable at 400% zoom / 320px | AA | P0 | No horizontal scroll for content |
| 1.4.11 | Non-text contrast ≥ 3:1 | AA | P0 | Borders, icons, focus rings |
| 1.4.12 | Text spacing overridable | AA | P1 | Don't use fixed line heights that break layout |
| 1.4.13 | Content on hover/focus can be dismissed/hoverable | AA | P1 | Tooltips must be hoverable, Escape dismisses |

---

## Operable

| # | Criterion | Level | Priority | Notes |
|---|---|---|---|---|
| 2.1.1 | All functionality available via keyboard | A | P0 | Test Tab, Enter, Space, Arrow, Escape |
| 2.1.2 | No keyboard trap | A | P0 | Exception: modal — must have Escape exit |
| 2.1.4 | Single-char shortcuts can be remapped/disabled | A | P1 | If single-key shortcuts exist |
| 2.2.1 | Timed sessions have adjustable/extendable limits | A | P1 | Show warning before timeout |
| 2.2.2 | Moving/blinking content can be paused | A | P0 | Auto-carousels, loading animations |
| 2.3.1 | Nothing flashes more than 3 times/sec | A | P0 | Prevents seizures |
| 2.4.1 | Mechanism to skip repeated navigation | A | P0 | `<a href="#main">Skip to content</a>` as first link |
| 2.4.2 | Page has descriptive title | A | P0 | `<title>Users – Admin Dashboard</title>` |
| 2.4.3 | Focus order is logical | A | P0 | DOM order matters; avoid `tabindex > 0` |
| 2.4.4 | Link purpose clear from text or context | A | P0 | No "click here" or "read more" standalone |
| 2.4.6 | Headings and labels are descriptive | AA | P0 | No placeholder headings |
| 2.4.7 | Focus indicator is visible | AA | P0 | Never `outline: none` without custom ring |
| 2.4.11 | Focus not fully obscured | AA | P0 | WCAG 2.2 — sticky headers must not cover focus |
| 2.4.12 | Focus not obscured (enhanced) | AAA | P2 | |
| 2.5.1 | Pointer gestures have single-point alternatives | A | P1 | Swipe alternatives for touch UIs |
| 2.5.3 | Label matches accessible name | A | P0 | Visible label text matches `aria-label` |
| 2.5.7 | Dragging has single-pointer alternative | AA | P1 | WCAG 2.2 |
| 2.5.8 | Target size ≥ 24×24px | AA | P0 | WCAG 2.2 — prefer 44×44px |

---

## Understandable

| # | Criterion | Level | Priority | Notes |
|---|---|---|---|---|
| 3.1.1 | Language of page declared | A | P0 | `<html lang="en">` |
| 3.1.2 | Language of parts declared | AA | P1 | `lang="fr"` on foreign language phrases |
| 3.2.1 | Context doesn't change on focus | A | P0 | No navigation on focus |
| 3.2.2 | Context doesn't change on input (without warning) | A | P0 | Form submission needs explicit action |
| 3.2.3 | Consistent navigation across pages | AA | P0 | Same nav in same position |
| 3.2.4 | Consistent identification across pages | AA | P0 | Same icon = same function throughout |
| 3.3.1 | Error identified in text | A | P0 | Color + text, not color alone |
| 3.3.2 | Labels or instructions provided | A | P0 | Required fields, format hints |
| 3.3.3 | Error suggestion provided | AA | P1 | "Enter a valid email address" not just "Invalid" |
| 3.3.4 | Error reversible / confirmable | AA | P1 | Confirm before delete; undo for submissions |
| 3.3.7 | Redundant entry not required | A | P1 | WCAG 2.2 — prefill known data |
| 3.3.8 | Accessible authentication | AA | P1 | WCAG 2.2 — no cognitive test without alternative |

---

## Robust

| # | Criterion | Level | Priority | Notes |
|---|---|---|---|---|
| 4.1.1 | Valid HTML (no parsing errors) | A | P0 | Unique IDs, proper nesting, closed tags |
| 4.1.2 | Name, role, value for all UI components | A | P0 | All interactive elements have accessible name + role |
| 4.1.3 | Status messages programmatically determined | AA | P1 | `aria-live` regions for dynamic updates |

---

## Quick Pre-Launch Audit

Run these checks before every release:

```bash
# Automated (catches ~30% of issues)
npx axe-cli https://localhost:3000
npx lighthouse https://localhost:3000 --only-categories=accessibility

# Manual checks (catches the rest)
# 1. Tab through entire page — is every interactive element reachable and operable?
# 2. Test with screen reader (VoiceOver on Mac, NVDA on Windows)
# 3. Check all color pairs with https://webaim.org/resources/contrastchecker/
# 4. Zoom to 200% and 400% — does content reflow without horizontal scroll?
# 5. Test without a mouse (keyboard only)
```
