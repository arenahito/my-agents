---
name: review-loop
description: Run an iterative subagent review loop for code, documentation, plans, or other artifacts. Use when the user asks for a review loop, iterative review, repeated review/fix/re-review, or review until all actionable findings are resolved. The parent coordinates fresh subagent review, decides which findings require action, implements accepted fixes, asks the same subagent to re-review those fixes, and starts new subagent review passes until no actionable findings remain.
---

# Review Loop

## Purpose

Use this skill to separate implementation context from review judgment. The parent owns scope, context, fixes, and acceptance decisions. Review subagents provide independent critique from a cleaner context.

Do not turn this into a generic code review checklist. Its job is the loop contract: delegate review, decide action, fix accepted findings, re-review with the same subagent, then repeat with fresh subagents until no actionable findings remain.

## Parent Setup

Before delegating, the parent must:

- identify the artifact under review: diff, files, plan, document, or other output
- state the review goal and any requested focus areas
- collect relevant constraints: user intent, repository rules, accepted tradeoffs, compatibility limits, and known non-goals
- choose the smallest review scope that still lets the reviewer judge correctness
- start a review subagent with a clean task-specific prompt and without automatic parent-context inheritance
- decide what the parent will do while the subagent runs; if the next step depends on the review, wait

The review prompt should ask for actionable findings only, with severity, evidence, and a brief fix direction. Ask the subagent not to modify files.

## Loop Workflow

1. Start a fresh review subagent for the current artifact.
2. Read every finding and decide whether it requires action.
3. For accepted findings, implement the fix in the parent context.
4. For rejected findings, record a short reason tied to user intent, existing design, risk, or higher-priority rules.
5. Report the implemented fixes and rejected-findings list back to the same subagent.
6. Ask the same subagent to re-review only the response to its findings and any affected nearby behavior.
7. Repeat steps 2-6 with that same subagent until it reports no actionable findings.
8. Start a new review subagent for an independent full review of the latest artifact.
9. Include previously rejected findings and reasons in the new prompt to reduce repeated non-actionable feedback.
10. If the new subagent reports actionable findings, treat it as the active reviewer and repeat steps 2-7.
11. Finish only after a fresh subagent review reports no actionable findings.

## Decision Rules

- Do not accept findings automatically. The parent must judge each finding against task intent, current context, existing contracts, and risk.
- Prefer root-cause fixes when the impact scope is manageable.
- If a finding is valid but too broad for the current task, record it as out of scope and tell the user.
- If rejecting a finding depends on uncertain product intent, ask the user before treating it as resolved.
- Preserve a running rejected-findings list across fresh-reviewer passes.

## Subagent Rules

- Use the same subagent for re-reviewing fixes to its own findings so judgment stays consistent.
- Use a new subagent only after the current subagent has no actionable findings.
- Do not interrupt or duplicate a running subagent review.
- Do not make the parent independently redo the same review while waiting.
- Do not delegate implementation to review subagents unless the user explicitly changes the task.
- If no suitable subagent capability is available, state the blocker and perform the best possible local review loop without claiming it is independent.

## Output Contract

The parent final response should include:

- final review status
- accepted findings fixed
- rejected findings with short reasons, when any remain relevant
- verification performed by the parent
- whether the final clean pass came from a fresh subagent
