# Prototyping Guide

A fidelity ladder and process guide for validating designs before development.

---

## Fidelity Ladder

Choose fidelity based on what question you're trying to answer:

| Fidelity | When to use | Tools | Time to make |
|---|---|---|---|
| **Paper / Sketch** | Exploring structure, IA, flows | Pen + paper, whiteboard | Minutes |
| **Wireframe (Lo-fi)** | Layout, content hierarchy, flow | Figma (gray boxes) | 1–4 hours |
| **Mid-fi** | Component placement, interaction patterns | Figma + component library | 4–8 hours |
| **Hi-fi** | Visual design validation, stakeholder review | Figma + real tokens | 1–3 days |
| **Code prototype** | Performance, animation, real data | Next.js + design system | 2–5 days |

**Rule:** Use the lowest fidelity that answers your question. Don't build hi-fi before validating structure.

---

## When to Use Each Type

### Paper / Sketch
- Early ideation, brainstorming
- Quick 5-minute sketches with stakeholders
- When all options are still on the table

### Lo-fi Wireframe
- Validating information architecture
- Checking if navigation flows make sense
- Getting early stakeholder alignment on scope

### Mid-fi Prototype
- Testing task completion flows
- Identifying broken or missing states
- Engineering feasibility review

### Hi-fi Prototype
- Visual brand alignment review
- Stakeholder/client approval
- Handoff-ready spec

### Code Prototype
- Performance-sensitive animations
- Complex data interactions
- User testing with real content

---

## User Journey Mapping

Use before designing to understand the full context:

```
Actor: [Primary User Persona]
Scenario: [Specific goal: "User wants to reset their password"]

Stage        | Trigger      | Action          | Thought          | Emotion  | Opportunity
─────────────┼──────────────┼─────────────────┼──────────────────┼──────────┼─────────────
Awareness    | Locked out   | Clicks "Forgot  | "I hope this is  | 😟 Anxious | Show clear
             |              | password?"      | fast"            |           | progress steps
─────────────┼──────────────┼─────────────────┼──────────────────┼──────────┼─────────────
Action       | Email sent   | Checks inbox,   | "Where's the     | 😤 Frustrated | Send email
             |              | clicks link     | email?"          |           | within 30s,
             |              |                 |                  |           | add resend CTA
─────────────┼──────────────┼─────────────────┼──────────────────┼──────────┼─────────────
Resolution   | New password | Enters new      | "Is this secure  | 😌 Relieved | Password
             | form         | password        | enough?"         |           | strength meter
```

---

## Usability Testing Scripts

### Moderated Testing Script Template

```
STUDY: [Feature / Screen Name]
DATE: [Date]
PARTICIPANT ID: P[Number]
FACILITATOR: [Name]

─────────────────────────────────────────────────────
INTRO (5 min)
─────────────────────────────────────────────────────
"Thank you for joining. We're testing the design today, not you —
there are no wrong answers. Please think aloud as you work through
each task. We may ask questions but won't guide you."

─────────────────────────────────────────────────────
WARM-UP (3 min)
─────────────────────────────────────────────────────
"Can you walk me through how you typically [relevant task in their life]?"

─────────────────────────────────────────────────────
TASKS (20–30 min)
─────────────────────────────────────────────────────
TASK 1: [Task description — framed as a scenario, not instructions]
  Example: "You've just joined a new team. Set up your profile."

  ✓ Success criteria: [observable outcome]
  ⏱ Time limit: [seconds] before offering help
  📝 Notes:
    □ Hesitations
    □ Errors
    □ Verbal confusion
    □ Recovery success / failure

TASK 2: [Next task]

─────────────────────────────────────────────────────
DEBRIEF (5 min)
─────────────────────────────────────────────────────
"On a scale of 1–10, how difficult was [feature]? Why?"
"What would you change about what you saw today?"
"Was there anything missing that you expected to find?"
```

### Unmoderated Testing Script (e.g., Maze, UserTesting)

```
INTRODUCTION:
"You'll be completing a few tasks in a prototype. Please work through
them as you naturally would — don't worry about making mistakes."

TASK: "You've forgotten your password. Please recover access to your account."

SUCCESS METRIC: Reached /dashboard within 3 steps
FOLLOW-UP: "How easy was it to complete this task? (1=Very Difficult, 5=Very Easy)"
```

---

## Prototype Review Metrics

Track these in your testing sessions:

| Metric | How to measure |
|---|---|
| **Task completion rate** | % of participants who completed the task |
| **Time on task** | Seconds from task start to completion |
| **Error rate** | Number of wrong paths before success |
| **SUS score** | [System Usability Scale](https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html) — 10 questions → 0–100 |
| **NPS / satisfaction** | "How likely to recommend?" |

**Interpreting SUS:** < 50 = poor | 50–68 = below average | 68–80 = good | > 80 = excellent

---

## Prototype Testing Checklist

Before running sessions:
- [ ] Prototype covers all tasks in the script
- [ ] All interactive elements have hover + click states
- [ ] Error and success states are included
- [ ] Prototype tested by team member unfamiliar with design
- [ ] Recording consent obtained
- [ ] Screener criteria match actual target users

After sessions (5+ participants):
- [ ] Synthesize notes by theme
- [ ] Rank issues by frequency × severity
- [ ] Share insights with PM + engineering within 48h
- [ ] Update design and retest P0 issues before handoff
