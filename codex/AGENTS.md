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

- Follow applicable skill guidance; explicit user instructions take precedence over skill guidelines, subject to higher-priority instructions. Apply the delegation criteria below when following skill guidance.
- Proactively delegate well-scoped work, especially to Luna, when it can meet the required quality. Prefer delegation when it improves quality, reduces completion time, or lowers total cost. Handle work directly when delegation would compromise quality or its coordination overhead clearly outweighs the benefit.
- Use the model and reasoning effort explicitly requested by the user. For settings the user does not specify, use explicit settings in the specialized agent definition. Apply the defaults below only to settings that neither specifies.
- Do not use Terra under these defaults, including when escalating or replacing an unavailable model.
- Use Astra for graphic design and the visual aspects of UI/UX, including layout, typography, color, and visual styling. This default does not extend to software architecture or system design.
- For other tasks, prefer Luna and the least expensive reasoning effort expected to meet the task's quality requirements. Consider Luna at max effort before selecting Sol or Astra; substantial work can still be a good fit for Luna max. Use lower effort when sufficient, and do not assume extra reasoning eliminates capability gaps.
- Select Sol or Astra upfront when complexity, ambiguity, the impact of errors, or difficulty verifying results makes Luna unsuitable even with appropriate reasoning effort. Do not require trying each model in sequence.
- Luna, Sol, and Astra denote model families. Resolve them to exact model IDs from the current environment's available models when spawning agents; do not guess IDs. If a family is unavailable, choose an available model that meets the same quality and cost criteria and respects the Terra restriction above.
- When choosing settings under these defaults, select the model and effort explicitly instead of unintentionally inheriting an expensive orchestrator configuration. If capability limits become evident, pass the useful findings to a stronger model rather than repeatedly retrying with the same model.
- Give each agent a clear scope, completion criteria, and required evidence. Keep orchestration focused on decisions, integration, and verification proportionate to risk; avoid redoing delegated work. Continue useful independent work while agents run. Delegation can also save cost on substantial sequential work; parallelism is not required.
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

- Use independent review when explicitly requested by the user or when the potential impact of defects, complexity, or uncertainty makes it valuable. Small, localized changes that are easy to verify may be completed with the implementing agent's own inspection and appropriate checks, unless independent review is explicitly required by applicable instructions.
- Batch related changes into one review at a coherent completion point. Re-review only when substantial revisions or unresolved concerns warrant another independent assessment; minor fixes do not automatically require another review.
- When independent review is needed, use `reviewer` for code and documents and `visual_reviewer` for visual appearance artifacts. Provide the target files, intended outcome, and scope. Validate findings against evidence and task requirements; fix substantiated issues within scope and explain rejected findings.
- During code review, do not routinely rerun linting, formatting, type-checking, or tests. Focus on design, logic, readability, and correctness; use a targeted reproduction only when needed to resolve a concrete suspected defect.
- For implementation, run checks appropriate to the change and complete required checks. After they pass, broaden or repeat verification only for new changes, failures, or unresolved concerns.
- Add tests when they detect plausible regressions; avoid tests that merely restate the changed implementation, configuration, or metadata.
- Do not add self-explanatory comments or comments that narrate the work performed.
- Follow repository-specific commit conventions first. Otherwise use Conventional Commits in the repository's documented language, then README language, then English.
- A commit request authorizes a local SSH-signed commit; push requires a separate explicit request. If signing fails, report the failure rather than creating an unsigned commit.
