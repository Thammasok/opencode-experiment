# Knowledge Base

Reference material agents can look up to make better-informed decisions. Unlike rules, knowledge is **informational** — it provides context, not constraints.

## Structure

```
knowledge/
├── README.md          # This file
├── domain/            # Business domain concepts, glossary, entities
├── tech/              # Technology decisions, stack reference, integrations
└── process/           # Process context, team conventions, project history
```

## How to use

- Agents should consult relevant knowledge files when they need domain or technical context.
- Knowledge files describe **what is true**, not what must be done (see `rules/` for that).
- Keep entries factual and concise — avoid duplicating what is already in code or CLAUDE.md.

## Adding a new knowledge file

1. Place it in the appropriate subdirectory (`domain/`, `tech/`, or `process/`).
2. Name it after the topic (e.g. `domain/user-roles.md`, `tech/database.md`).
3. Include a one-line summary at the top so agents can quickly decide relevance.
