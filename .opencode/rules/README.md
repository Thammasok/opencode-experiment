# Rules

Constraints and guidelines that all agents **must** follow. Each rule file covers one domain.

## Structure

```
rules/
├── README.md          # This file
├── coding.md          # Code style, patterns, and anti-patterns
├── testing.md         # Testing standards and coverage requirements
├── architecture.md    # Architectural constraints and decisions
├── security.md        # Security rules and forbidden patterns
└── workflow.md        # Agent behaviour rules (escalation, review gates)
```

## How to use

- All skills and agents **must** read applicable rule files before producing output.
- Rules are **hard constraints** — they override default behaviour.
- When a rule conflicts with a user request, flag the conflict before proceeding.

## Adding a new rule file

1. Create a new `.md` file in this directory named after the domain.
2. Structure it with `## Must` (hard rules) and `## Should` (soft guidelines) sections.
3. Reference it from any skill or agent that operates in that domain.
