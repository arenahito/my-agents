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

- Follow applicable skill guidance. Otherwise, use subagents freely for well-scoped tasks.
- Never duplicate a delegated task or interrupt a running subagent merely because it is slow. Wait when the next step depends on its result.
- Write subagent instructions in English, require English reports, provide task-specific context explicitly, and disable automatic parent-context inheritance.

## Commands and Tools

- Prefer `rtk` for external shell commands; use uncompressed output or invoke the command directly when filtering obscures required evidence or the command is unsupported. Do not prefix PowerShell built-in cmdlets. Never add `rtk` to generated code, scripts, documentation, configuration, or user-facing command examples unless explicitly required.
- Use `rg` instead of `grep` and `fd` instead of `find`. In PowerShell, wrap file and directory paths in double quotes.
- When a required capability is not visible, use tool discovery once before falling back. If unavailable, state the limitation and use the smallest honest alternative.
- When available, use Context7 for library/API documentation and setup, and prefer Exa for web search.
- For GUI application control on Windows or Linux, prefer the `cua-driver` skill and its tools over Codex's built-in computer-use tools. Prefer background operations that preserve the user's focus; if the required action cannot run in the background, explain the limitation before using a foreground fallback.
- Treat permission failures as sandbox boundaries: request the required permission before attempting an indirect workaround.

## Code and Review

- During code review, do not routinely rerun linting, formatting, type-checking, or tests. Focus on design, logic, readability, and correctness; use a targeted reproduction only when needed to resolve a concrete suspected defect.
- For implementation, run checks appropriate to the change and complete required checks. After they pass, broaden or repeat verification only for new changes, failures, or unresolved concerns.
- Do not add self-explanatory comments or comments that narrate the work performed.
- Follow repository-specific commit conventions first. Otherwise use Conventional Commits in the repository's documented language, then README language, then English.
- A commit request authorizes a local SSH-signed commit; push requires a separate explicit request. If signing fails, report the failure rather than creating an unsigned commit.
