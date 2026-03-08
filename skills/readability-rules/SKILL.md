---
name: readability-rules
description: Define and enforce rule priority for coding guidance. Use this skill during implementation, refactoring, and code review to apply rules in a fixed order, with this skill positioned below repository-specific and language-specific rules, and to apply user preference rules as fallback guidance.
---

# Rule Priority

## Overview

Define the priority order for coding guidance and apply it consistently.  
Treat `references/readability.md` as the source of priority definitions and
`references/preferences.md` as the source of fallback preference rules.

## Execution Steps

1. Check repository-specific rules first.
2. Check language-specific rules second.
3. Use this skill only when higher-priority rules do not define the case.
4. Apply fallback preference rules from `references/preferences.md`.
5. State which priority level each decision comes from.

## Application Policy

- Priority order: repository-specific rules > language-specific rules > this skill.
- Never override higher-priority rules with this skill.
- Use this skill only as a fallback layer.

## Output Rules

- In change proposals and reviews, explicitly mention the applied priority level.
- If multiple rules conflict, explain which higher-priority rule won.

## Reference

- Priority definition: `references/readability.md`
- Preference rules: `references/preferences.md`
