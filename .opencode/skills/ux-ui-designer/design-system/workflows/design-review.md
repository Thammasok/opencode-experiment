# Design Review Process

A rubric-based approach to evaluating UI designs before handoff to engineering.

---

## Review Rubric (Score 1–5)

| Dimension | What to evaluate |
|---|---|
| **Clarity** | Can a new user understand what to do without explanation? |
| **Consistency** | Do similar elements look and behave similarly? |
| **Hierarchy** | Is the most important information visually dominant? |
| **Feedback** | Does every action have a visible response? |
| **Efficiency** | Can users reach their goal in minimum steps? |
| **Error prevention** | Are destructive actions guarded? |
| **Accessibility** | Does it work for users with visual/motor/cognitive differences? |

---

## Nielsen's 10 Heuristics — Quick Audit

| # | Heuristic | Common violations to check |
|---|---|---|
| 1 | Visibility of system status | Loading states? Progress indication? |
| 2 | Match between system and real world | Industry vocabulary? Real-world metaphors? |
| 3 | User control and freedom | Undo/cancel available? Easy exit? |
| 4 | Consistency and standards | Same patterns across all screens? |
| 5 | Error prevention | Confirm before destructive actions? Input constraints? |
| 6 | Recognition over recall | Options visible? No need to memorize? |
| 7 | Flexibility and efficiency | Shortcuts for power users? Defaults for novices? |
| 8 | Aesthetic and minimalist design | Only necessary information? No visual clutter? |
| 9 | Help users recognize/recover from errors | Error messages plain-language? Suggest fix? |
| 10 | Help and documentation | Contextual help available? |

---

## Design Review Checklist

### Visual Consistency
- [ ] All colors reference semantic tokens (not raw hex)
- [ ] Typography uses the defined text style scale
- [ ] Spacing values snap to the 4px grid
- [ ] Component sizes match the defined size scale
- [ ] Icons are from the approved library, consistent size

### Layout & Responsiveness
- [ ] Designed at minimum 3 breakpoints: mobile, tablet, desktop
- [ ] Content doesn't overflow at narrow widths
- [ ] Touch targets are ≥44×44px on mobile
- [ ] Scrollable areas have visible scroll indicators
- [ ] Modals/drawers are full-screen on mobile

### Information Architecture
- [ ] Heading levels are logical and sequential
- [ ] Navigation is consistent across all screens
- [ ] Current location is indicated
- [ ] Related content is grouped visually

### Interaction Design
- [ ] All interactive elements have hover + focus + active states
- [ ] Hover/focus states are visually distinct from default
- [ ] Disabled states look different from default (opacity, cursor)
- [ ] Loading states are designed for all async operations
- [ ] Transition/animation is smooth and purposeful

### Content & Copy
- [ ] Button labels are action-oriented verbs ("Save changes", not "OK")
- [ ] Error messages are human-readable and suggest fixes
- [ ] Empty states have a call-to-action
- [ ] Placeholder copy is realistic (not "Lorem ipsum")
- [ ] Long text scenarios tested (international strings 30–40% longer)

### Accessibility
- [ ] Color contrast ≥4.5:1 for body text, ≥3:1 for large text + UI
- [ ] No information conveyed by color alone
- [ ] Focus order follows logical visual flow
- [ ] All interactive elements have visible labels

---

## Design Audit Process

### Step 1: Inventory
List all screens, states, and variants. Confirm with designer that design is complete.

### Step 2: Heuristic Pass (30 min)
Walk through each Nielsen heuristic. Note violations with screenshot + heuristic number.

### Step 3: Accessibility Pass (20 min)
- Run Figma A11y plugin for contrast
- Manually trace reading order (does it match visual order?)
- Identify all interactive elements and check for labels

### Step 4: Edge Case Simulation (20 min)
- Long text (50+ chars in titles, truncated labels)
- Empty state
- Error state
- Loading state
- Single vs many items in lists

### Step 5: Document Findings

| Issue | Screen | Severity | Heuristic | Recommendation |
|---|---|---|---|---|
| Submit button has no loading state | /checkout | P0 | H1 (Status) | Add spinner + disabled state during submission |
| "Delete" has no confirmation | /settings | P0 | H5 (Error prevention) | Add confirmation dialog |

**Severity:** P0 = blocks launch | P1 = should fix before launch | P2 = nice to have

---

## Sign-Off Criteria

Design is ready for engineering handoff when:

- [ ] All P0 issues resolved
- [ ] All states and variants documented (Figma auto-layout + component properties)
- [ ] Token annotations added to Figma components
- [ ] Responsive specs defined for all breakpoints
- [ ] Interactive prototype exists for complex flows
- [ ] Design reviewed by at least one developer (for feasibility)
- [ ] Accessibility checklist items P0 + P1 passed
