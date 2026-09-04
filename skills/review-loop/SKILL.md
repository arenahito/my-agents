---
name: review-loop
description: Review and autonomously fix code, documentation, plans, or other artifacts through iterative subagent review. Use when the user asks for a review loop, iterative review, repeated review/fix/re-review, or review until actionable findings are resolved. The parent evaluates findings, fixes accepted issues, and uses same-reviewer rechecks and fresh independent review to validate the result.
---

# Review Loop

## Purpose

Use this skill to separate implementation context from review judgment. The parent owns scope, context, fixes, and acceptance decisions. Review subagents provide independent critique from a cleaner context.

Do not turn this into a generic code review checklist. Its job is to assess findings, fix accepted issues, recheck those fixes with the same reviewer, and review the whole artifact with a fresh reviewer after changes. A full review that requires no changes ends the loop.

Invoking this skill requests both review and fixes within the task scope unless
the user explicitly limits the task to review only. Judge findings and implement
accepted fixes autonomously. Ask the user only when relevant evidence and existing
instructions do not resolve a decision needed to proceed. The invocation does
not authorize unrelated changes or additional external actions.

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

For an explicit review-only request, review and assess the findings, then report
them with proposed fixes. Skip the fix/recheck loop and its resolution-based
completion requirements, including in the local fallback.

1. Start a fresh review subagent for the current artifact.
2. Read every finding and decide whether it requires action. When assessing a full review of the current artifact, finish here if no fixes are needed and no decisions remain unresolved; record any rejected or deferred findings with reasons. This includes an initial review with no findings. When assessing a focused fix recheck, proceed to step 8 once no further fixes or unresolved decisions remain.
3. For accepted findings, implement and verify the fix in the parent context.
4. For rejected findings, record a short reason tied to user intent, existing design, risk, or higher-priority rules.
5. Report the implemented fixes and rejected-findings list back to the same subagent.
6. Ask the same subagent to re-review only the response to its findings and any affected nearby behavior.
7. Repeat steps 2-6 with that same subagent while parent-validated, in-scope findings remain unresolved. Reassess new evidence, but do not repeat a settled rejection merely to obtain reviewer agreement.
8. After fixes have been made and rechecked, start a new review subagent for an independent full review of the latest artifact. Its purpose is to detect issues in the artifact as a whole after the changes, not just to recheck individual fixes.
9. Include previously rejected findings and reasons in the new prompt to reduce repeated non-actionable feedback.
10. Evaluate the new subagent's findings using step 2. If fixes are needed, treat it as the active reviewer and repeat steps 3-9, including another full review after those fixes.
11. Finish when a full review of the latest artifact requires no further fixes and no decisions remain unresolved. The initial review satisfies this condition if it requires no changes; a focused fix recheck alone does not. Reviewer agreement with every rejection is not required. Report any remaining disagreement or deferred issue.

## Decision Rules

- Do not accept findings automatically. The parent must judge each finding against task intent, current context, existing contracts, and risk.
- Prefer root-cause fixes when the impact scope is manageable.
- If a finding is valid but too broad for the current task, record it as out of scope and tell the user.
- Resolve uncertainties using available evidence and existing instructions first. Ask the user only when a finding's validity, scope, or required fix remains undecidable; do not mark that decision resolved while awaiting an answer.
- Preserve a running rejected-findings list across fresh-reviewer passes.

## Subagent Rules

- Use the same subagent for re-reviewing fixes to its own findings so judgment stays consistent.
- Start an additional fresh review only after changes have been made since the last full review, those fixes have been rechecked, and no parent-validated, unresolved, in-scope findings remain. Preserve evidence-backed rejections even if the reviewer disagrees.
- Do not interrupt or duplicate a running subagent review.
- Do not make the parent independently redo the same review while waiting.
- Do not delegate implementation to review subagents unless the user explicitly changes the task.
- If no suitable subagent capability is available, perform the best possible local review/fix/recheck loop. Finish when no validated, unresolved, in-scope findings remain; the fresh-subagent requirement does not apply. Disclose that independent review was unavailable.

## Output Contract

The parent final response should include:

- final review status
- accepted findings fixed
- rejected findings with short reasons, when any remain relevant
- verification performed by the parent
- whether completion followed the initial full review, a fresh full review after fixes, or the local fallback
