---
name: codebase-explorer
description: Fast project exploration for unfamiliar or partially familiar repositories and workspaces. Use when Codex needs to map repository structure, find entry points, trace where a feature or bug lives, identify ownership boundaries, follow data flow across modules, inspect logs/config/build/test/runtime surfaces, or answer broad "where is X?" and "how does Y work?" questions. The exploration scope includes source code plus project artifacts such as configuration files, manifests, scripts, logs, traces, fixtures, generated metadata, docs, and CI/deployment files. The main agent orchestrates and synthesizes; fast-model subagents handle the actual exploration at 10x+ speed.
---

# Codebase Explorer

Use this skill to understand a codebase or project workspace quickly before implementation, debugging, or review. "Codebase" means the source code and any project artifacts needed to understand behavior: configuration, manifests, scripts, logs, traces, fixtures, generated metadata, documentation, CI/deployment files, and runtime outputs. The main agent acts strictly as orchestrator: it triages the request, dispatches fast-model subagents for all exploration, and synthesizes the findings. The main agent must not perform exploration directly.

## Exploration Goals

- map the repository and identify the most relevant directories, packages, and entry points
- locate the implementation of a feature, error, route, component, command, or symbol
- trace data flow, dependency flow, or ownership boundaries across files
- identify the logs, config, build, test, and runtime surfaces that constrain later work
- inspect non-code artifacts when they explain behavior, failures, environment assumptions, or operational state
- report what is confirmed, what is inferred, and what still needs verification

## Quick Triage

The main agent performs this step directly — it is lightweight and sets the direction for all subsequent exploration.

1. Classify the request before delegating:
   - repository overview
   - feature or bug location
   - symbol or API usage tracing
   - logs, config, build, test, or runtime surface discovery
   - end-to-end flow tracing
2. Narrow the scope as much as possible:
   - workspace, package, app, or service
   - language or framework
   - known path fragments, symbols, routes, commands, error strings, log lines, config keys, environment variables, or filenames
3. Decide delegation strategy:
   - determine how many subagents are needed and what each should investigate
   - identify natural split boundaries (by layer, domain, or concern)
   - if the scope is already narrow, a single subagent may suffice

## Orchestration Model

The main agent orchestrates; subagents explore. The fast model handles codebase exploration competently and operates at 10x+ speed. All file reading, searching, and code tracing must go through subagents.

| Role | Responsibility |
|---|---|
| **Main agent** | Triage, exploration strategy, split decisions, synthesis, judgment |
| **Subagents (fast)** | File scanning, pattern searching, code reading, structure mapping |

The main agent must not read files, run searches, or trace code directly. Its only pre-delegation work is the triage step: classifying the request and identifying known constraints. All exploration goes to subagents.

### Delegate to subagents

- Repository structure and entry-point mapping
- Symbol, route, error string, or API surface searching
- Manifest, config, script, log, trace, and runtime artifact reading
- Call-site and reference tracing

### Keep in the main agent

- Interpreting the user's actual intent behind the question
- Deciding split boundaries when domain structure is unclear
- Resolving conflicts or ambiguities across subagent findings
- Final synthesis and confidence assessment

## Subagent Exploration

Fewer subagents is better when the scope is already narrow.

Dispatch subagents for all exploration work, including initial reconnaissance. The main agent's triage determines the split, then subagents execute.

Only parallelize when the work splits into independent, non-overlapping questions. Keep synthesis and ambiguity resolution in the main agent.

### Split Patterns

By concern:

- architecture and entry points / feature implementation and call sites / logs, config, tests, runtime outputs, and integration

By domain:

- frontend / backend / infrastructure
- package A / package B / package C
- ingestion / business logic / presentation

Always use the fast model for exploration subagents.

### Subagent Contract

For each subagent:

- give one concrete question
- assign an explicit scope by path, layer, package, or concern
- tell it to search first and read only the most relevant files or artifacts
- require exact paths, key symbols/config keys/log lines, and a short confidence note in the result

Do not:

- give two subagents the same scope unless intentional cross-checking is needed
- wait idly if the main agent can continue synthesis or dispatch further work
- delegate code changes in a pure exploration task unless the user explicitly changes the goal

## Suggested Workflows

### Repository Overview

1. Triage: identify if the repo is monorepo, single-app, library, or multi-service.
2. Dispatch subagent(s) to map root structure, packages, entry points, manifests, and relevant config/runtime artifact locations.
3. Split further only if the repo has clearly distinct domains.
4. Synthesize a map of the repository with main responsibilities and entry points.

### Feature or Bug Hunt

1. Triage: extract feature names, routes, UI labels, error strings, API paths, or symbols from the user's question.
2. Dispatch subagent(s) to search for matches and trace inward to the owning module.
3. If needed, split by surface: caller/entry point, core implementation, tests/config.
4. Synthesize the most likely ownership path and the files that need deeper work.

### Data or Request Flow Trace

1. Triage: identify the start and end points of the flow from the user's question.
2. Dispatch subagent(s) to trace handoff points across modules, services, or layers.
3. Split by pipeline stage only when each stage is independently readable.
4. Synthesize a step-by-step flow with exact file references and unresolved gaps.

## Output Contract

Always provide:

- a concise answer to the user's exploration question
- the key files, artifacts, or directories with exact paths
- the most important symbols, commands, routes, configuration points, log lines, or runtime surfaces
- explicit separation of confirmed facts vs. informed inferences
- remaining unknowns or the next best places to inspect

For broad explorations, prefer a short map over a file dump. Link evidence to the smallest useful set of files or artifacts.

## Guardrails

- The main agent must not read files, run searches, or trace code directly — all exploration goes through subagents.
- Do not mistake wide search for useful understanding.
- Do not skip triage — even a lightweight classification prevents wasted subagent work.
- Do not let subagents duplicate the same reading work.
- Do not over-read irrelevant files or artifacts once the ownership boundary is known.
- Do not present an inference as confirmed behavior.
- Do not turn exploration into implementation unless the user asks for it.
- Do not retain work in the main agent that a subagent can perform faster without loss of quality.

## Example Prompts

- "Use $codebase-explorer to map this repository and identify the main app entry points."
- "Use $codebase-explorer to find where the reservation confirmation dialog is implemented and which tests cover it."
- "Use $codebase-explorer to trace how request data flows from the route layer into persistence."
