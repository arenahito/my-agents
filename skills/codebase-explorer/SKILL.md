---
name: codebase-explorer
description: >-
  Use for fresh repository evidence gathering before implementation, debugging,
  review, or explanation when the parent agent cannot answer confidently from
  current context. Delegate specific, well-scoped codebase questions to fast,
  low-cost explorer subagents: mapping structure, finding entry points,
  locating a feature or bug, tracing symbols/APIs/data flow, inspecting
  config/log/build/test/runtime surfaces, or answering "where is X?" and
  "how does Y work?" questions. Do not use when existing task-local evidence is
  enough, when only one already-known file needs a quick read, or when the task
  is pure editing with no new codebase discovery needed.
---

# Codebase Explorer

## Purpose

Use this skill to keep fresh repository evidence gathering out of the parent agent's context. The parent should understand the user's intent, design the smallest useful exploration task, delegate specific codebase questions to explorer subagents, and synthesize their findings.

Do not turn this skill into a full repository-reading workflow. Its job is routing and synthesis, not local exploration.

## When To Use

Use this skill when progress depends on fresh evidence from the repository and the parent agent does not already know the relevant files, symbols, behavior, or project surfaces.

Common cases include:

- finding where something lives or how it is wired
- understanding an unfamiliar area before implementation, debugging, review, or explanation
- tracing behavior across more than one file, module, layer, or project artifact
- identifying the relevant code, tests, configuration, commands, logs, docs, or runtime surfaces

Default to one explorer for fresh evidence gathering, even when the question is narrow. Use multiple explorers only for independent, non-overlapping questions.

## When Not To Use

Do not use this skill when:

- existing conversation context, recent command output, or prior subagent results already answer the question
- the parent only needs to read or edit one already-known file to proceed safely
- the task is a small mechanical edit, formatting pass, or direct command execution with no repository discovery
- the user explicitly asks not to delegate or wants the parent to inspect something directly
- the work is implementation rather than exploration and the affected files are already known

## Parent Triage

Before delegating, the parent must:

- decide whether existing task-local evidence already answers the question
- identify the target workspace, package, app, service, path, symbol, route, command, error, log line, config key, or runtime surface
- decide whether the task needs one subagent, multiple independent subagents, reuse of an existing subagent, or no subagent
- use the configured fast, low-cost codebase exploration subagent class for all delegated codebase exploration
- do not choose different subagent types based on repository area, language, or question type
- state any blocker explicitly if that codebase exploration subagent capability is unavailable

Keep this triage lightweight. Do not run broad searches, read many files, or trace code locally.

## Split Rules

Default to one subagent. Split only when each question can be answered independently and in parallel.

Split by:

- target area: frontend, backend, mobile, infra, package, app, or service
- investigation role: entry points, implementation owner, call sites, tests, config, logs, runtime surfaces
- flow stage: source, transformation, persistence, presentation, integration boundary

Do not split when:

- the next question depends on the first subagent's answer
- subagents would search the same symbols, paths, logs, or config
- the scope is already narrow enough for one subagent
- the split mainly reflects uncertainty that a first subagent should resolve

Each subagent gets:

- one concrete question
- explicit scope by path, package, layer, surface, or concern
- expected evidence: exact paths, symbols, config keys, commands, log lines, and a confidence note

## Subagent Reuse

Reuse an existing codebase exploration subagent only when the parent clearly knows that it already explored the same repository, same target area, and a related question.

- If the subagent is alive, send it a queued follow-up.
- If the subagent can be resumed and the target still matches, resume it before sending the follow-up.
- When reusing a resumed subagent, ask it to re-check the relevant current paths, symbols, or artifacts before relying on earlier findings. If it cannot cheaply revalidate, start fresh.
- Do not interrupt a running exploration task for reuse; queue the follow-up or wait.
- If the target repository, area, or question continuity is unclear, start a fresh subagent.
- If an existing subagent is still running on the same task, wait for it or do unrelated local work. Do not duplicate the same investigation locally or with another subagent.

## Spawn Rules

Spawn a new codebase exploration subagent when fresh codebase exploration is needed and no matching subagent can be safely reused.

- Use the configured fast, low-cost codebase exploration subagent class. Do not switch to worker-style roles based on task content.
- Start the subagent without inheriting the full parent conversation; provide task-specific instructions explicitly.
- Keep the prompt small and self-contained.
- Ask the subagent to search first and read only the most relevant files or artifacts.
- Do not delegate code changes for pure exploration tasks.

## Output Contract

The parent's final answer must include:

- the concise answer to the user's question
- the key files, directories, artifacts, or runtime surfaces
- important symbols, commands, routes, config keys, log lines, or test surfaces
- confirmed facts separated from informed inferences
- remaining unknowns or the next best inspection point when relevant

Prefer a short map over a file dump.

## Guardrails

- Do not load broad repository context into the parent when a subagent should do it.
- Do not rediscover information already provided by task-local evidence or subagent results.
- Do not present stale subagent findings as current facts when the code may have changed.
- Do not let multiple subagents cover the same scope unless intentional cross-checking is required.
- Do not mistake wide search for understanding.
- Do not turn exploration into implementation unless the user explicitly changes the goal.
