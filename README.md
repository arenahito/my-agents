# my-agents

My collection of AI agent configurations.

## Repository Structure

```
my-agents/
├ codex/           # OpenAI Codex CLI configuration
├ rtk/             # Configuration files for rtk
└ skills/          # Reusable skill definitions
```

| Repository Path | Global Path |
| --- | --- |
| `codex/` | `~/.codex/` |
| `skills/` | `~/.agents/skills/my-skills/` |
| `rtk/` | `~/.config/rtk/` |

## Global Synchronization

When global synchronization is requested, use the mappings above to apply only
the intended changes. Preserve unrelated environment-specific settings in the
destination files.

## Directory & File Descriptions

### `codex/`

Configuration for OpenAI Codex CLI.

### `rtk/`

Configuration files for [rtk](https://github.com/rtk-ai/rtk).

### `skills/`

Task-specific instruction sets used by the Codex skills feature.

| Skill | Description |
| --- | --- |
| codebase-explorer | Fast codebase exploration through orchestrated subagents |
| github-review-triage | Triage and follow-up workflow for GitHub pull request review URLs |
| review-loop | Iterative subagent review, fix, same-reviewer recheck, and fresh independent review passes |
| readability-rules | Skill for defining and applying rule priorities in coding guidance |
