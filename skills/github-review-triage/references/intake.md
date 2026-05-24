# Intake Reference

Use this file only for the intake subagent phase. `SKILL.md` remains the orchestration contract.

## Purpose

The intake subagent handles only the first-pass review intake.

Its job is to:

- resolve the review surface from the incoming URL
- extract issues that may need triage
- cluster related issues into the smallest useful buckets
- return cluster handoff material to the parent agent

Its job is not to:

- decide final recommendation labels
- perform full cluster-level analysis
- make implementation decisions
- solve the entire review thread end-to-end

## Workflow

1. Resolve the GitHub surface from the URL.
2. Fetch only the relevant review object:
   - whole PR only when the user asked about the whole PR
   - one review when given a review URL
   - one discussion or one comment when given a comment URL
3. Extract issues that may need triage.
4. Separate:
   - likely triageable comments
   - likely non-actionable comments
   - ambiguous comments that need deeper cluster analysis
5. Cluster triageable items into the smallest useful groups. Prefer grouping by:
   - shared files or modules
   - shared behavior or failure mode
   - shared implementation strategy
   - shared test surface
6. Return cluster handoff material and stop.

If the linked discussion contains many distinct concerns, stop at clustering and hand the clusters back to the orchestrator instead of continuing deeper analysis.

## Cluster Handoff Contract

For each cluster, return:

- `cluster_id`
- included comment ids or raw URLs
- short cluster summary
- likely affected files or modules
- likely code path or behavior
- uncertainty or missing context
- whether detailed repository inspection is required
- whether the cluster is independent enough for its own analysis subagent

The handoff should be compact and sufficient for one later analysis subagent to continue without rereading unrelated parts of the review.

## Clustering Signals

Prefer clustering over one-comment-per-subagent.

Strong signals to cluster:

- more than 5 actionable comments
- comments spread across 3 or more file groups
- clearly different concerns such as UI, state, API, tests, typing, or accessibility
- one discussion thread containing unrelated fixes

Use one intake subagent per incoming URL as the default entry point. If that URL expands into many distinct concerns, produce a partition plan rather than continue deeper analysis.

## Guardrails

- Do not decide final recommendation labels.
- Do not perform implementation follow-up decisions.
- Do not expand into unrelated repository-wide exploration.
- Do not keep long review bodies in the handoff when a concise summary is enough.
- Do not cross cluster boundaries once natural buckets are clear.
