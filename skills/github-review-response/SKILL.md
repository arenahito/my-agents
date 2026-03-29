---
name: github-review-response
description: Handle GitHub pull request, review, and review comment URLs when the user wants response planning, triage, or implementation follow-up. Use when a user provides a GitHub PR URL, pull request review URL, review comment URL, or PR discussion URL and asks what to fix, what can be ignored, or how to respond. The orchestrator stays thin and delegates the heavy review intake to a minimal-context subagent.
---

# GitHub Review Response

Use this skill when the user gives a GitHub URL that points to a pull request or review discussion and wants help deciding what to do next.

This skill keeps the parent agent small. Large review threads, PR context, and surrounding code must flow through staged subagents. The parent agent must not perform review intake or cluster-level analysis itself.

## Supported URLs

- pull request URL such as `https://github.com/org/repo/pull/123`
- pull request review URL such as `.../pull/123#pullrequestreview-<id>`
- pull request review comment or discussion URL such as `.../pull/123#discussion_r<id>`
- issue-style comment URL attached to a PR thread when the URL still points at the PR page

If the URL is not clearly one of the above, stop and say that the skill only handles GitHub PR review surfaces for now.

## Read This First

Keep `SKILL.md` as the contract and navigation layer. Read additional files only when the current phase needs them.

- At skill start, read only `SKILL.md`.
- When you launch the intake subagent, read `references/intake.md`.
- When intake returns clusters and you launch analysis subagents, read `references/analysis.md`.
- When the parent agent assembles the final user-facing report, read `references/report-contract.md`.

## Startup Gate

Before reading any review surface, the parent agent must finish this gate.

For every supported GitHub review URL, the parent agent may do only these steps directly:

1. Identify the URL type and narrow the target to:
   - whole PR
   - one review
   - one comment or discussion
2. Confirm the user intent:
   - recommendation report
   - post-triage implementation follow-up
3. Gather the minimal handoff input:
   - target URL
   - repository or workspace path if known
   - nitpick policy
   - triage state, including whether final triage is already complete
   - required output contract
4. Launch exactly one intake subagent with no automatic parent-context inheritance.
5. After intake returns clusters, launch analysis subagents for independent clusters only.

Until the intake subagent is launched, the parent agent must not fetch the review surface, read comment bodies, inspect repository code, or draft recommendation items.

## Subagent Capability Policy

Subagent selection is a parent-only concern.

For this skill, review triage uses one fixed capability floor across both intake and analysis.

- treat review triage as a reasoning-heavy task, not a low-capability fast path
- use review-capable subagents with sufficient reasoning quality for both intake and analysis
- do not lower capability for speed alone
- do not choose different capability tiers per cluster difficulty
- if no subagent meeting that capability floor is available, do not silently fall back to a weaker substitute

## Role Summary

| Role | Responsibility |
|---|---|
| Parent agent | Triage the request shape, launch staged subagents, aggregate results, render the final report |
| Intake subagent | Resolve the review surface, extract issues, cluster them, return cluster handoff material |
| Analysis subagent | Analyze one cluster, inspect minimum needed repo context, decide item-level triage labels |
| Implementation subagent | Make changes only after triage is complete and only for selected clusters |
| Reviewer subagent | Review implementation results with minimal changed-file context |

## Orchestration Sequence

Use this sequence for review triage:

1. Launch exactly one minimal-context intake subagent for the incoming URL.
2. Close the intake subagent after it returns cluster handoff material.
3. Launch zero or more cluster-scoped analysis subagents from that intake result.
4. Aggregate the analysis results into the final user-facing recommendation report.
5. Launch implementation or reviewer subagents only after analysis results exist and the user wants follow-up work.

Do not reuse the intake subagent for analysis or implementation.
Do not reuse an analysis subagent for implementation.

## Condensed Output Contract

For recommendation-report mode:

- the parent agent returns one compact consolidated report
- the visible report stays item-based, not cluster-based
- analysis produces the final item-level `action`, `issue`, and `response` fields
- the parent agent aggregates those results into the final user-facing report

The detailed intake contract lives in `references/intake.md`.
The detailed analysis contract, including parallelism and batching, lives in `references/analysis.md`.
The visible report format, action labels, file-link rules, nitpick rule, and report template live in `references/report-contract.md`.

## Guardrails

- Default to the narrowest possible review surface.
- The parent agent must not fetch the review surface, read comment bodies, classify actionability, cluster items, perform cluster-level detailed analysis, draft recommendation entries, or inspect repository code before the relevant subagent returns.
- Always start with exactly one intake subagent, even for a single comment URL.
- Final recommendation labels belong to analysis subagents, not intake.
- Do not treat the full PR as required context when the user gave one review or one discussion URL.
- Do not quote large review bodies back into the main thread.
- Do not run lint, tests, or builds during pure intake or triage.
- Do not let the orchestrator accumulate raw review data.
- Do not use low-capability fast-path subagents for intake or analysis.
- If the parent agent is blocked on intake or analysis results, wait rather than duplicating the same work locally.
