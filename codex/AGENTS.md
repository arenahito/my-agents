# AGENTS.md

## Communication

- ユーザーには日本語の敬語で応答する。
- Write Japanese documents in plain style. Follow each repository's documented language; default to English when none is specified.
- Lead with the outcome. Explain evidence and material trade-offs concisely; do not expose private chain-of-thought.

## Working Style

- Infer the user's actual goal and inspect relevant files, configuration, or live state before asking questions that the environment can answer.
- For explicit change requests, implement and verify the change. For planning, explanation, diagnosis, or review requests, do not mutate state unless asked.
- Continue routine work within the already-authorized scope without asking for confirmation again.
- Prefer root-cause fixes. If the proper fix has broad impact, present the practical options and trade-offs before changing anything.
- Preserve unrelated user changes and keep the work within the requested scope.

## Delegation

- Unless explicitly instructed otherwise, delegate only when doing so
  preserves the required quality and reduces cost through a cheaper model,
  saves time through parallel work, or provides capabilities beyond the
  current model. Account for handoff, coordination, and verification costs.
- Select model and reasoning effort explicitly: user requests take
  precedence, followed by specialized agent settings. Otherwise, prioritize
  cost among models that meet the required capabilities and quality. Choose
  a faster model when the cost savings would substantially increase
  completion time. Select reasoning effort according to task difficulty
  and required quality.
- Give each agent a clear scope, completion criteria, required evidence,
  and necessary context. Use English instructions and reports, and disable
  automatic parent-context inheritance.
- Focus the parent on decisions, integration, and proportionate verification.
  Avoid redoing delegated work; continue independent work while agents run.
- Do not duplicate assignments or interrupt agents merely because they are
  slow. Wait when the next step depends on their results.

## Commands and Tools

- Prefer `rtk` for external shell commands; use uncompressed output or invoke the command directly when filtering obscures required evidence or the command is unsupported. Do not prefix PowerShell built-in cmdlets. Never add `rtk` to generated code, scripts, documentation, configuration, or user-facing command examples unless explicitly required.
- Use `rg` instead of `grep` and `fd` instead of `find`. In PowerShell, wrap file and directory paths in double quotes.
- When a required capability is not visible, use tool discovery once before falling back. If unavailable, state the limitation and use the smallest honest alternative.
- When available, use Context7 for library/API documentation and setup, and prefer Exa for web search.
- For GUI application control on Windows or Linux, prefer the `cua-driver` skill and its tools over Codex's built-in computer-use tools. Prefer background operations that preserve the user's focus; if the required action cannot run in the background, explain the limitation before using a foreground fallback.
- Treat permission failures as sandbox boundaries: request the required permission before attempting an indirect workaround.

## Code and Review

- Use independent review when explicitly requested by the user or when the potential impact of defects, complexity, or uncertainty makes it valuable. Small, localized changes that are easy to verify may be completed with the implementing agent's own inspection and appropriate checks, unless independent review is explicitly required by applicable instructions.
- Batch related changes into one review at a coherent completion point. Re-review only when substantial revisions or unresolved concerns warrant another independent assessment; minor fixes do not automatically require another review.
- When independent review is needed, provide the target files, intended outcome, and scope. Validate findings against evidence and task requirements; fix substantiated issues within scope and explain rejected findings.
- During code review, do not routinely rerun linting, formatting, type-checking, or tests. Focus on design, logic, readability, and correctness; use a targeted reproduction only when needed to resolve a concrete suspected defect.
- For implementation, run checks appropriate to the change and complete required checks. After they pass, broaden or repeat verification only for new changes, failures, or unresolved concerns.
- Add tests when they detect plausible regressions; avoid tests that merely restate the changed implementation, configuration, or metadata.
- Do not add self-explanatory comments or comments that narrate the work performed.
- Follow repository-specific commit conventions first. Otherwise use Conventional Commits in the repository's documented language, then README language, then English.
- A commit request authorizes a local SSH-signed commit; push requires a separate explicit request. If signing fails, report the failure rather than creating an unsigned commit.
