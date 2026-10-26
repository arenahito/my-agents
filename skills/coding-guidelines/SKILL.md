---
name: coding-guidelines
description: Apply repository conventions and focused implementation guidelines during coding, refactoring, and code review. Use to avoid speculative defensive logic, duplicate input validation, temporary tests in version control, and work-log narration in deliverables.
---

# Coding Guidelines

## Follow Existing Conventions

Unless explicitly instructed otherwise, follow repository rules and existing
code conventions. Where rules are silent, match the affected code and nearby
implementations. Do not introduce a different style based on personal preference.

## Avoid Speculative Handling

Do not add defensive logic, fallbacks, or compatibility paths for hypothetical
conditions outside normal use and current requirements. If such handling is
needed, explain the concrete trigger and why it matters, and ask the user before
adding it. Existing task authorization covers handling already explicitly
requested by the user.

## Validate Inputs at Entry Points

Validate external input at the entry layer. Internal layers should rely on that
validated contract rather than repeat the same checks. If another path accepts
external input, validate it at that entry point.

## Keep Only Durable Tests

Do not include temporary verification code in version control. Run one-off checks
in temporary locations. Tests kept in the repository must verify meaningful
behavior or catch plausible regressions during future changes, rather than merely
confirm that the current edit was made.

## Describe the Resulting State

Do not put narration of the agent's work in code, comments, or documents. Describe
the current behavior, usage, constraints, and necessary design rationale. Keep
reports of actions taken and verification performed in the user conversation.

For formatting choices left unspecified by explicit instructions, repository
rules, existing code, and applicable language conventions, use
[fallback preferences](references/preferences.md).
