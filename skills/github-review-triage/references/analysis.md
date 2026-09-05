# Analysis Reference

Use this file for cluster-scoped analysis, including an intake subagent continuing into analysis of one bounded concern. `SKILL.md` remains the orchestration contract.

## Purpose

Each analysis subagent handles exactly one cluster identified by intake. When the entire surface is one bounded concern, the intake subagent may continue using its existing context without a separate handoff or repeated research.

Its job is to:

- read the cluster-specific review context
- inspect the minimum repository context needed for that cluster
- decide item-level triage outcomes inside that cluster
- preserve enough reasoning for later skipped-item reply drafting
- return compact final triage material for the parent agent to aggregate

Its job is not to:

- redo intake for the whole review surface
- perform unrelated repo-wide exploration
- start implementation work

## Input Contract

Each analysis subagent should receive only:

- one cluster handoff from intake
- the target URL for reference
- repository or workspace path if known
- the user constraints that still apply to that cluster
- the required final triage output for that cluster

## Workflow

1. Accept exactly one cluster handoff from intake, or use the single bounded concern identified during the same subagent's intake phase.
2. Read the cluster-specific review context needed to understand that cluster.
3. Inspect the minimum repository context needed for that cluster only when the intake handoff says deeper analysis is required.
4. Decide the final triage outcome for each item in that cluster:
   - `⛔ must-fix`
   - `🟡 should-fix`
   - `⚪ can-skip`
   - `❓ needs-confirmation`
5. Return one compact result for that cluster.

## Output Contract

Return:

- the cluster summary
- one or more item-level triage entries
- for each item:
  - title
  - URL
  - final recommendation
  - issue
  - response
  - reply draft material when the item may be skipped, including the reason to communicate externally
  - confidence or uncertainty
- whether implementation follow-up is needed for the cluster

The `response` field is for the user-facing triage report. It explains why the item received its recommendation and what handling approach is suggested.

Reply draft material is supporting reasoning, not a finished reply draft. Keep it concise, externally suitable, and tied to the item's GitHub URL. The parent may use it for requested final drafts after skip decisions are finalized, or for clearly marked provisional drafts when triage plus reply preparation is requested. Preserve unresolved assumptions so provisional drafts cannot imply finalized decisions. Triage-only requests do not authorize drafting.

The visible report remains item-based. The parent agent is responsible for aggregating multiple cluster results into the final report.

## Parallelism And Batching

For larger surfaces, use separate analysis subagents per independent cluster. For one bounded concern, the intake subagent may also perform analysis.

Parallelize only when clusters are independent and non-overlapping.

Do not impose a fixed analysis-subagent concurrency cap in this skill.

Batch clusters only when batching helps keep the work scoped and non-overlapping.

Prefer scheduling by cluster independence first, then by likely importance.

## Parent Wait Boundary

While analysis subagents are running, the parent agent must not redo the same cluster-level detailed analysis, repository inspection, or final triage labeling.

Allowed parent work while waiting:

- keep track of user constraints and chosen mode
- prepare the final report shell
- batch independent clusters when that helps keep orchestration manageable
- aggregate completed analysis results into the final report

If there is no clearly non-overlapping local work, the parent agent should wait.

## Guardrails

- Do not redo intake for the whole review surface.
- Do not expand into unrelated repository-wide exploration.
- Do not continue into implementation from the same analysis subagent.
- Keep repository inspection limited to what is needed for the assigned cluster.
