---
name: github-review-response
description: Handle GitHub pull request, review, and review comment URLs when the user wants response planning, triage, or implementation follow-up. Use when a user provides a GitHub PR URL, pull request review URL, review comment URL, or PR discussion URL and asks what to fix, what can be ignored, or how to respond. The orchestrator stays thin and delegates the heavy review intake to a minimal-context subagent.
---

# GitHub Review Response

Use this skill when the user gives a GitHub URL that points to a pull request or review discussion and wants help deciding what to do next.

This skill exists to keep the orchestrator small. Large review threads, PR context, and surrounding code should be handled in a minimal-context subagent whenever possible, without inheriting the full parent context by default.

## Supported URLs

- pull request URL such as `https://github.com/org/repo/pull/123`
- pull request review URL such as `.../pull/123#pullrequestreview-<id>`
- pull request review comment or discussion URL such as `.../pull/123#discussion_r<id>`
- issue-style comment URL attached to a PR thread when the URL still points at the PR page

If the URL is not clearly one of the above, stop and say that the skill only handles GitHub PR review surfaces for now.

## Orchestrator Role

The parent agent acts only as orchestrator.

Do directly:

1. Identify the URL type and extract the smallest useful target:
   - whole PR
   - one review
   - one comment or discussion
2. Confirm whether the user wants:
   - recommendation report
   - post-triage implementation follow-up
3. Gather only the minimum context needed to start a subagent:
   - URL
   - local workspace path if known
   - whether nitpicks should be included
   - whether the user has already finished final triage

Do not directly:

- read broad PR history unless needed to disambiguate the target
- keep long comment bodies in the main context
- keep large diffs or copied review text in the main context
- mix actionable review work with unrelated refactors

## Subagent Requirement

For review intake, launch exactly one minimal-context subagent first, without inheriting the full parent context unless that is strictly necessary.

The first subagent should receive only:

- the target URL
- repository or workspace path if known
- user constraints such as `nitpick included` or `nitpick excluded`
- required output contract

Recommended split:

- intake subagent: resolve the URL target, fetch the review surface, identify actionable items, and cluster them into the smallest useful work buckets
- follow-up investigation subagent: only when one cluster still needs repository inspection before implementation
- implementation subagent: only if the user asked to make changes, and only for one cluster or one tightly related bucket at a time
- reviewer subagent: only after implementation, with minimal changed-file context

Do not reuse the intake subagent for implementation. Close it after it returns the recommendation-report input material.

## Intake Workflow

1. Resolve the GitHub surface from the URL.
2. Fetch only the relevant review object:
   - whole PR only when the user asked about the whole PR
   - one review when given a review URL
   - one discussion or one comment when given a comment URL
3. Extract actionable items.
4. Separate:
   - actionable comments
   - non-actionable comments
   - ambiguous comments that need more repository context
5. Cluster actionable items into the smallest useful groups. Prefer grouping by:
   - shared files or modules
   - shared behavior or failure mode
   - shared implementation strategy
   - shared test surface
6. For each cluster, identify:
   - included comments or comment ids
   - likely affected files
   - likely code path or behavior
   - whether repository inspection is required
   - whether the cluster is safe to implement independently
7. If the linked discussion contains many distinct concerns, stop at clustering and hand the clusters back to the orchestrator instead of trying to fully resolve everything in one subagent.
8. Return compact recommendation material to the orchestrator.

## Clustering Rule

The intake subagent is not responsible for solving a large review thread end-to-end.

Use one intake subagent per incoming URL as the default entry point. If that URL expands into many distinct concerns, the intake subagent should produce a partition plan rather than continue deeper analysis.

Prefer clustering over one-comment-per-subagent. Split to the next stage only after the intake result shows natural buckets.

Strong signals to cluster:

- more than 5 actionable comments
- comments spread across 3 or more file groups
- clearly different concerns such as UI, state, API, tests, typing, or accessibility
- one discussion thread containing unrelated fixes

## Tooling Guidance

- Prefer your available GitHub integration, API client, connector, or MCP tools for PR, review, and comment retrieval.
- If repository structure or ownership is unclear, hand off code discovery to a dedicated codebase exploration workflow instead of expanding the review intake subagent.
- Keep review analysis and codebase exploration as separate subagent steps.

## Output Contract

For recommendation-report mode, return a compact result with one entry per review comment or discussion item that the user may need to triage.

Use this item layout:

- item title
- URL
- recommendation
- issue
- response

Each entry should contain:

- item title: a short summary of the review point; append ` (nitpick)` only when the reviewer explicitly marked the comment as nitpick
- URL: show the raw URL directly, without a `Comment URL:` label
- recommendation: one of the fixed recommendation labels below
- issue: a short plain-language summary of the review point so the user does not need to open the URL just to recall the comment
- response: a short multi-line explanation that combines the reason, the proposed handling approach when relevant, and any uncertainty or follow-up needed

In addition, include these report-level summary sections:

- a markdown table summarizing recommendation counts
- proposed clusters
- cluster independence notes
- recommended next step

For nitpick labeling:

- show ` (nitpick)` at the end of the item title only when the reviewer explicitly marked the comment as nitpick
- otherwise show no nitpick marker
- do not infer nitpick status from the comment text

For handling recommendations, use exactly one of these labels:

- ⛔ must-fix
- 🟡 should-fix
- ⚪ can-skip
- ❓ needs-confirmation

Label meanings:

- `⛔ must-fix`: likely actionable and important enough that the user should normally include it in final triage
- `🟡 should-fix`: likely worth addressing, but urgency or scope is lower than `⛔ must-fix`
- `⚪ can-skip`: likely safe to exclude from final triage based on current evidence
- `❓ needs-confirmation`: more repository inspection, diff review, or user intent confirmation is needed before deciding

For comments judged out of scope or low priority, give a short reason such as:

- nitpick only
- already addressed by later changes
- unrelated to the requested scope
- not enough context from the linked review surface alone

## Report Template

Use this output shape:

```md
## Recommendation Report

### Summary

| Recommendation | Count |
|---|---:|
| ⛔ must-fix | <n> |
| 🟡 should-fix | <n> |
| ⚪ can-skip | <n> |
| ❓ needs-confirmation | <n> |

### Items

#### 1. <short title>
- `<url>`
- Recommendation: `⛔ must-fix`
- Issue: <short summary of the review point>
- Response:
  <reason>
  <proposed handling approach if relevant>
  <uncertainty or follow-up note if relevant>

#### 2. <short title> (nitpick)
- `<url>`
- Recommendation: `⚪ can-skip`
- Issue: <short summary of the review point>
- Response:
  <reason>
  <proposed handling approach if relevant>
```

When the reviewer did not explicitly mark nitpick, do not add any nitpick suffix to the title.

## Guardrails

- Default to the narrowest possible review surface.
- Do not treat the full PR as required context when the user gave one review or one discussion URL.
- Do not quote large review bodies back into the main thread.
- Do not run lint, tests, or builds during pure intake or triage.
- Do not let the orchestrator accumulate raw review data.
- If the user wants implementation, assume the user has already completed final triage and start a fresh implementation or investigation subagent per cluster rather than continuing in the same review-analysis subagent.

## Example Prompts

- "Inspect this GitHub review URL and return a recommendation report with comment URLs, handling recommendations, reasons, and proposed handling approaches."
- "Analyze this PR comment URL, ignore nitpicks, and return a recommendation report I can use for final triage."
- "The final triage is done. Use this PR URL to prepare implementation follow-up for the selected review items."
