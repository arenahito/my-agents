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
| `skills/` | `~/.agents/skills/` |
| `rtk/` | `~/.config/rtk/` |

## Directory & File Descriptions

### `codex/`

Configuration for OpenAI Codex CLI.

### `rtk/`

Configuration files for [rtk](https://github.com/rtk-ai/rtk).

### `skills/`

Task-specific instruction sets used by the Codex skills feature.

| Skill | Description |
| --- | --- |
| appium-interactive | Interactive debugging & QA procedures for Android apps using WebdriverIO + Appium |
| codebase-explorer | Fast codebase exploration through orchestrated subagents |
| github-review-response | Triage and follow-up workflow for GitHub pull request review URLs |
| ui-ux-design-guide | Shared UI/UX baseline for frontend design, implementation, and review across web and mobile products |
| readability-rules | Skill for defining and applying rule priorities in coding guidance |
