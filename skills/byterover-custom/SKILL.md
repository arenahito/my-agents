---
name: byterover
description: "Use this when the current project already has a `.brv/` directory, or when the user explicitly tells you to use ByteRover. Before starting work, use `brv` to retrieve project-specific rules, decisions, conventions, preferences, and prior context from `.brv/context-tree`. If `.brv/` does not exist, do not use ByteRover automatically unless the user explicitly requests it."
---

# ByteRover Knowledge Management

Use the `brv` CLI to manage your project's long-term memory.
Knowledge is stored in `.brv/context-tree/` as human-readable Markdown files.

## Workflow
1.  **Check project state:** Only use this skill automatically when the current project already contains a `.brv/` directory.
2.  **Honor explicit instruction:** If the user explicitly tells you to use ByteRover, you may use this skill even when `.brv/` does not exist yet.
3.  **Before Thinking:** If `.brv/` exists or the user explicitly asked for ByteRover, run `brv query` when you need project memory.
4.  **After Implementing:** If `.brv/` exists or the user explicitly asked for ByteRover, run `brv curate` when there is durable new knowledge to save.

## Cold Start
If ByteRover is not already running, the first `brv query` or `brv curate` request may take noticeably longer because of startup latency.

- Do not treat delayed or silent initial output as a failure by itself.
- Do not ignore the result just because the first request is slow.
- Do not start the same request again just because ByteRover has not responded yet.
- Wait for the existing request to finish, or for an explicit error or exit status.
- While waiting, give the user a short progress update so the delay does not look like a hang.

## One-Time Initialization
Use `references/existing-codebase-initialization.md` only when the user wants to create the initial ByteRover memory from an existing codebase.

- Treat it as a one-time bootstrap flow, not part of the normal query/curate loop.
- Do not run this initialization flow automatically just because `.brv/` exists.
- After initialization is complete, return to the normal `brv query` / `brv curate` workflow in this file.

## Commands

### 1. Query Knowledge
**Overview:** Retrieve relevant context from your project's knowledge base. Uses a configured LLM provider to synthesize answers from `.brv/context-tree/` content.

**Use this skill when:**
- The current project already contains a `.brv/` directory
- The user explicitly asks you to use ByteRover, even if `.brv/` does not exist yet
- The user wants you to recall something
- Your context does not contain information you need
- You need to recall your capabilities or past actions
- You need project-specific rules, criteria, or preferences that may be stored in ByteRover

**Do NOT use this skill when:**
- The current project does not contain a `.brv/` directory and the user did not explicitly ask for ByteRover
- The information is already present in your current context
- The query is about general knowledge, not stored memory

```bash
brv query "How is authentication implemented?"
```

### 2. Curate Context
**Overview**: Analyze and save knowledge to the local knowledge base. Uses a configured LLM provider to categorize and structure the context you provide.

**Use this skill when:**
- The user wants you to remember something
- The user intentionally curates memory or knowledge
- There are meaningful memories from user interactions that should be persisted
- There are important facts about what you do, what you know, or what decisions and actions you have taken

**Do NOT use this skill when:**
- The information is already stored and unchanged
- The information is transient or only relevant to the current task, or just general knowledge

```bash
brv curate "Auth uses JWT with 24h expiry. Tokens stored in httpOnly cookies via authMiddleware.ts"
```

**Include source files** (max 5, project-scoped only):

```bash
brv curate "Authentication middleware details" -f src/middleware/auth.ts
```

**View curate history:** to check past curations
- Show recent entries (last 10)
```bash
brv curate view
```
- Full detail for a specific entry: all files and operations performed (logId is printed by `brv curate` on completion, e.g. `cur-1739700001000`)
```bash
brv curate view cur-1739700001000
```
- List entries with file operations visible (no logId needed)
```bash
brv curate view detail
```
- Filter by time and status
```bash
brv curate view --since 1h --status completed
```
- For all filter options
```bash
brv curate view --help
```

### 3. LLM Provider Prerequisite
`brv query` and `brv curate` require a configured LLM provider.

This is user-managed setup, not a normal agent action.

- The user should connect a provider before the agent relies on `brv query` or `brv curate`.
- If no provider is connected, the agent should tell the user what command to run instead of treating provider setup as part of normal task execution.

The default ByteRover provider can be connected without an API key:

```bash
brv providers connect byterover
```

To use a different provider (e.g., OpenAI, Anthropic, Google), the user can list available options and connect with their own API key:

```bash
brv providers list
brv providers connect openai --api-key sk-xxx --model gpt-4.1
```

### 4. Project Locations
**Overview:** List registered projects and their context tree paths. Returns project metadata including initialization status and active state. Use `-f json` for machine-readable output.

**Use this when:**
- You need to find a project's context tree path
- You need to check which projects are registered
- You need to verify if a project is initialized

**Do NOT use this when:**
- You already know the project path from your current context
- You need project content rather than metadata — use `brv query` instead

```bash
brv locations -f json
```

JSON fields: `projectPath`, `contextTreePath`, `isCurrent`, `isActive`, `isInitialized`.

### 5. Optional User-Managed Cloud Sync
**Overview:** Sync local knowledge with ByteRover's cloud service when the user wants cloud sync.

This is user-managed optional setup, not a normal agent action.

- The user should handle authentication, space selection, and sync policy.
- The agent should only discuss or perform cloud sync when the user explicitly asks for it.
- If cloud sync is not already set up, the agent should tell the user what command to run instead of treating sync setup as part of normal task execution.

**User-managed setup steps:**
1. Log in: Get an API key from your ByteRover account and authenticate:
```bash
brv login --api-key sample-key-string
```
2. List available spaces:
```bash
brv space list
```
Sample output:
```
brv space list
1. human-resources-team (team)
   - a-department (space)
   - b-department (space)
2. marketing-team (team)
   - c-department (space)
   - d-department (space)
```
3. Connect to a space:
```bash
brv space switch --team human-resources-team --name a-department
```

**Cloud sync commands:**
Once the user has connected a space, `brv push` and `brv pull` sync with that space.
```bash
# Pull team updates
brv pull

# Push local changes
brv push
```

**Switching spaces:**
- Push local changes first (`brv push`) — switching is blocked if unsaved changes exist.
- Then switch:
```bash
brv space switch --team marketing-team --name d-department
```
- The switch automatically pulls context from the new space.

## Data Handling

**Storage**: All knowledge is stored as Markdown files in `.brv/context-tree/` within the project directory. Files are human-readable and version-controllable.

**File access**: The `-f` flag on `brv curate` reads files from the current project directory only. Paths outside the project root are rejected. Maximum 5 files per command, text and document formats only.

**LLM usage**: `brv query` and `brv curate` send context to a configured LLM provider for processing. The LLM sees the query or curate text and any included file contents. No data is sent to ByteRover servers unless you explicitly run `brv push`.

**Cloud sync**: `brv push` and `brv pull` require authentication (`brv login`) and send knowledge to ByteRover's cloud service. All other commands operate without ByteRover authentication.

## Error Handling
**User Action Required:**
You MUST show this troubleshooting guide to users when errors occur.

"Not authenticated" | User should run `brv login --help` for more details.
"No provider connected" | User should run `brv providers connect byterover` (free, no key needed), or connect another supported provider.
"Connection failed" / "Instance crashed" | User should kill brv process.
"Token has expired" / "Token is invalid" | User should run `brv login` again to re-authenticate.
"Billing error" / "Rate limit exceeded" | User should check account credits or wait before retrying.

**Agent-Fixable Errors:**
You MUST handle these errors gracefully and retry the command after fixing.

"Missing required argument(s)." | Run `brv <command> --help` to see usage instructions.
"Maximum 5 files allowed" | Reduce to 5 or fewer `-f` flags per curate.
"File does not exist" | Verify path with `ls`, use relative paths from project root.
"File type not supported" | Only text, image, PDF, and office files are supported.

### Quick Diagnosis
Run `brv status` to check authentication, project, and provider state.
