---
name: appium-interactive
description: Persistent Appium-based Android app debugging and QA through `js_repl` with WebdriverIO. Use when Codex needs to drive a local Android app on a real device or emulator, keep the same Appium session alive across iterations, verify behavior through structural Appium signals first, and capture screenshots or page source only when necessary. Initial scope is Android only; keep the workflow extensible for future iOS support.
---

# Appium Interactive

Use a persistent `js_repl` Appium session to debug local Android apps on real devices or emulators, keep the same WebdriverIO/Appium handles alive across iterations, and verify behavior through lightweight structural signals before reaching for screenshots or page source dumps.

Evidence priority for this skill:

1. package and activity checks
2. app state checks such as `queryAppState(...)`
3. element presence, enabled state, checked state, content descriptions, and visible text
4. page source only when locator debugging is blocked
5. screenshots only when the user asked for them, visual QA is the task, or the UI state is ambiguous after the checks above

## Read This First

Keep `SKILL.md` as the contract and navigation layer. Read additional files only when the current phase needs them.

- Read `scripts/bootstrap-helpers.mjs` when the current `js_repl` kernel does not already have the shared helpers. Load it through the generated runtime bridge instead of relying on REPL cwd.
- Read `scripts/preflight-lite-example.mjs` when you need the cheap probe for `preflight-lite`.
- Read `scripts/materialize-runtime-bridge.mjs` when the selected runtime anchor needs the canonical runtime bridge. It writes `appium-runtime-bridge.mjs` into that anchor.
- Read `scripts/appium-runtime-bridge-template.mjs` only when you need to inspect the generated bridge contents or bridge API.
- Read `references/setup-and-handoff.md` as soon as `preflight-lite` fails. It is the canonical file for setup phase and bridge-based post-setup resume.
- Read `scripts/parent-resume-example.mjs` only as the lower-level resume step used by the runtime bridge.
- Read `scripts/appium-operational-fallback.mjs` only when `Execution Mode Contract` selected `operational` and the canonical bridge path already failed.
- Read `references/troubleshooting.md` when setup, server start, session start, target switching, runtime-anchor validation, or post-setup resume fails.
- Read `references/session-recipes.md` only when you need real-device, emulator, relaunch, or target-switch examples after the bridge context is already established.
- Read `references/android-real.md` or `references/android-emulator.md` only for target-specific inspection and recovery notes.
- Read `references/future-ios.md` only when planning an iOS extension. Do not improvise iOS commands into this skill.

## Quick Start

- Confirm `js_repl` is enabled, sandboxing is disabled, and the Android SDK is discoverable from the shell that will launch Appium.
- Resolve the setup target from workspace state using `Setup Target Rules`.
- Materialize `appium-runtime-bridge.mjs` into the selected runtime anchor with `scripts/materialize-runtime-bridge.mjs`.
- Import the generated runtime bridge into `js_repl` and call `ensureRuntimeContext()`.
- Run `Entry Gate` before any requested app flow.
- If `preflight-lite` fails, follow `references/setup-and-handoff.md`, finish setup in the same agent, and use the runtime bridge for the first session start after setup.
- If setup is already ready but helper, import, scope, or resume-input problems appear before session start, follow `Post-Setup Recovery` instead of jumping back into setup.
- Apply `Execution Mode Contract` before deciding whether a bridge failure stops the turn or enters a controlled fallback ladder.
- Use `references/session-recipes.md` only when you need a concrete session recipe after the bridge context is already in place.
- Leave the Appium server and healthy session running between turns unless cleanup is explicitly requested or a verified recovery step requires it.

## Execution Mode Contract

Choose one execution mode before running the requested flow:

- `operational`: use this for normal QA and routine task execution. It is the default unless the task is an evaluation-only case described below.
- `strict`: use this only when the user explicitly wants canonical-path purity, hard-stop analysis, or fallback disabled.

Mode selection rules:

- if the user explicitly says `execution mode: strict` or `execution mode: operational`, use that mode
- if the task is a skill evaluation, skill verification, or regression check and the mode is not specified, stop and ask the user to choose `strict` or `operational` before continuing
- otherwise default to `operational`

When you ask in an evaluation, verification, or regression task:

- explain that `strict` validates the canonical bridge path and stops on bridge failure
- explain that `operational` validates task completion with controlled fallback paths
- do not recommend one as the default for that class of task

## Setup Target Rules

Resolve a setup target before you install or launch anything. Inspect the workspace root only.

Use this order:

1. If the workspace root `package.json` exists and lists `appium` in `dependencies` or `devDependencies`, use the existing package.
2. Otherwise, if `./tmp/codex-appium-harness` already exists, use the harness.
3. Otherwise, if the workspace root `package.json` exists, ask the user to choose between the existing package and `./tmp/codex-appium-harness`. Recommend `./tmp/codex-appium-harness`.
4. Otherwise, use `./tmp/codex-appium-harness`.

Canonical target rules:

- existing package: use the workspace root as the runtime anchor
- tmp harness: use `./tmp/codex-appium-harness` as the runtime anchor
- existing package with missing `webdriverio`: keep the existing package and auto-bootstrap the missing dependency there
- tmp harness missing or incomplete: create or repair it in place
- do not search parent directories or other manifests in the repo
- do not use global `appium` as a fallback

Read `references/setup-and-handoff.md` for the setup-phase command set, canonical Appium server command, and the exact verification commands that must pass from the selected runtime anchor.

## Setup Is Single-Phase

Treat setup as one phase of the same Appium workflow, not as a separate required agent role.

- If `preflight-lite` fails because the runtime anchor, dependencies, SDK wiring, or Appium server are not ready, continue into setup phase in the same agent.
- Setup phase owns `runtime anchor resolution -> bootstrap or repair -> driver install -> import check -> SDK env check -> Appium server start -> server status verification`.
- Session creation still happens only after setup phase proves the environment is ready.
- Once setup phase says the environment is ready, stop doing runtime-anchor repair work and move on to session start and user-visible interaction.

Read `references/setup-and-handoff.md` for the setup result block, bridge materialization, and the bridge-based resume order.

## Entry Gate

Start every Appium task here. Do not touch the requested app flow until this gate tells you whether a healthy same-target session already exists or whether the environment must be repaired first.

Canonical start order:

1. Resolve the setup target from `Setup Target Rules`.
2. Materialize or refresh `appium-runtime-bridge.mjs` in the selected runtime anchor with `scripts/materialize-runtime-bridge.mjs`.
3. Import the generated runtime bridge into `js_repl`.
4. Call `ensureRuntimeContext()`.
5. Run `runPreflightLite()`.
6. Reuse the healthy same-target session on success. Otherwise continue into setup phase.

Do not replace this order with handwritten bootstrap cells, ad-hoc helper definitions, or raw WebDriver HTTP as the normal path.

### Preflight-Lite

Run `preflight-lite` at the beginning of every task, including quick actions.

Treat the existing session as healthy only when all of the following are true:

- `globalThis.__appiumDriver` exists
- `getRuntimeAnchor()` is already set and matches the runtime anchor configured by the generated bridge
- `getTargetDevice()` is already set and matches the intended target for this task
- `getWdOpts()` is already set for that target
- a cheap probe can read either `getCurrentPackage()` or `getCurrentActivity()`

Read and run `scripts/preflight-lite-example.mjs` only when you need to inspect the cheap probe itself. In normal `js_repl` flow, call `runPreflightLite()` from the generated runtime bridge.

If `preflight-lite` fails:

- do not proceed with the requested action
- enumerate the problem as `missing or unhealthy: ...`
- resolve the setup target from `Setup Target Rules`
- follow `references/setup-and-handoff.md`
- fall through to `full preflight` only after the selected runtime anchor is repaired

If `preflight-lite` succeeds:

- reuse the current same-target session
- do not reinstall dependencies, reinstall drivers, recreate the harness, or restart the Appium server
- proceed directly to the requested action

### Full Preflight

Run `full preflight` only when `preflight-lite` cannot prove that a healthy same-target session is ready, or when server ownership or environment clearly changed.

Do not start the requested QA flow until all of the following are true:

- the selected runtime anchor exists and is the canonical runtime base for import and CLI checks
- `webdriverio` imports successfully from the selected runtime anchor
- `npm exec -- appium` resolves from the selected runtime anchor
- `ANDROID_HOME` or `ANDROID_SDK_ROOT` is set in the exact shell session that will launch the Appium server
- the Appium server is reachable at the exact `hostname` / `port` / `path` you will pass to `remote(...)`
- the required Appium driver is installed and visible to that server
- the Appium server process can resolve the Android SDK location it needs
- a fresh session can be created for the chosen target

Use `references/setup-and-handoff.md` for the exact verification command set and `references/troubleshooting.md` when any check fails.

## Runtime Bridge Contract

Treat `appium-runtime-bridge.mjs` in the selected runtime anchor as the canonical `js_repl` entrypoint for setup recovery and session start.

- materialize it from `scripts/materialize-runtime-bridge.mjs`, not by hand
- import the generated bridge into `js_repl` instead of re-creating runtime-anchor or helper wiring inline
- use `ensureRuntimeContext()` before any bridge-driven preflight or session-start call
- use `setResumeInputs({ targetDevice, wdOpts })` plus `startSessionFromResumeInputs()` for the first session start after setup
- treat the bridge as skill-internal runtime glue, not as app code or a user-maintained helper
- do not create a throwaway shell script, a runtime-anchor-local ad-hoc WebdriverIO script, a raw WebDriver HTTP path, or a second helper stack as a substitute for the bridge
- if bridge import, `ensureRuntimeContext()`, `runPreflightLite()`, or `startSessionFromResumeInputs()` fails, report `bridge flow broken`, capture the failure evidence, and stop that requested flow instead of bypassing the bridge
- once `bridge flow broken` is reached, do not create a new session, do not switch to raw WebDriver or direct Appium REST, do not add a throwaway script, do not add a handwritten helper stack, and do not continue the requested flow through a fallback route in the same turn
- after bridge failure, the only allowed actions in that turn are collecting failure evidence, preserving the current session or server state, and writing the final report

The generated bridge exports exactly these functions:

- `ensureRuntimeContext()`
- `setResumeInputs({ targetDevice, wdOpts })`
- `runPreflightLite()`
- `startSessionFromResumeInputs()`
- `getDriver()`

These rules are the hard-stop contract for `strict` mode.

## Operational Fallback Contract

Use this contract only in `operational` mode after the canonical bridge path fails.

Fallback ladder:

1. canonical bridge retry
2. supported fallback
3. emergency hatch

Canonical bridge retry:

- rematerialize the runtime bridge once
- use `js_repl_reset` only when the current kernel state is likely stale or conflicting
- reimport the bridge
- rerun `ensureRuntimeContext()`
- rerun `runPreflightLite()`
- retry this ladder step only once

Supported fallback:

- use `scripts/appium-operational-fallback.mjs`
- call `ensureOperationalRuntime({ runtimeAnchor })`
- call `setOperationalInputs({ targetDevice, wdOpts })`
- call `runOperationalPreflight()`
- call `startOperationalSession()` only when the supported fallback preflight says the missing piece is the session
- treat this path as skill-owned degraded execution, not as an ad-hoc workaround

Emergency hatch:

- use it only after canonical bridge retry and supported fallback both failed with captured evidence
- allowed paths are limited to a temporary script inside the selected runtime anchor or direct Appium REST inside `js_repl`
- do not edit repo-tracked files, do not add scripts outside the selected runtime anchor, do not patch the global skill, and do not perform silent cleanup
- report emergency hatch usage explicitly in the final report

Operational mode still forbids free-form fallback. If the path is not listed in this ladder, do not use it.

## Session Persistence Contract

Treat session persistence as a hard contract, not as a convenience preference.

- do not call `deleteSession()`, `deleteDriverSession()`, or stop the Appium server at the end of a request by default
- do not put session cleanup in `finally`, deferred cleanup helpers, or end-of-task shell commands
- allow cleanup only when the user explicitly requested it or when a verified recovery step in this skill requires it
- if a request ends with the session still healthy, leave it running and say so explicitly
- if a verified recovery step deleted the session or stopped the server, say so explicitly

Every final report for this skill must include:

- `session kept alive: yes | no`
- `cleanup performed: none | session deleted | server stopped | ...`

## Shared Helper Contract

Treat `scripts/bootstrap-helpers.mjs` as the canonical shared-helper source for this skill.

- prefer loading `scripts/bootstrap-helpers.mjs` through the runtime bridge over writing new top-level helper functions in ad-hoc `js_repl` cells
- keep reusable session state in the helper-managed shared state instead of duplicating state in handwritten bindings
- use `globalThis` only for the helper contract's shared state and explicitly named setup or resume inputs
- if a temporary import, scope, or REPL quirk appears, return to the helper contract instead of building a parallel helper stack

When helper behavior and handwritten cells disagree, treat the helper contract as the source of truth and re-align the session flow to it.

### Setup Result Block

Keep this fixed setup result block in your notes whenever setup phase produces reusable environment details:

```text
SETUP_HANDOFF
- selected runtime anchor: ...
- cwd used for setup: ...
- setup target source: existing package | tmp harness
- webdriverio import result: pass | fail ...
- driver-list result: ...
- adb devices result: ...
- server URL: ...
- server path: ...
- exact server launch command: ...
- target-selection status: resolved ... | selection required
- remaining blocker: none | ...
```

When the setup result says `remaining blocker: none` or `ready for session start`, treat later failures as post-setup recovery problems first. Return to setup work only when the setup result is later proven stale.

After setup phase is ready:

- materialize or refresh the runtime bridge in the selected runtime anchor
- move to `setResumeInputs({ targetDevice, wdOpts })` and `startSessionFromResumeInputs()` through the runtime bridge
- treat helper, import, scope, or missing-input failures as resume-path problems first
- treat `scripts/parent-resume-example.mjs` as the lower-level step used by the runtime bridge
- return to runtime repair work only when the setup result is proven stale
- do not add cleanup to the post-setup happy path

### Post-Setup Recovery

Use this branch only when setup already proved the environment ready, but the first session start still failed because helpers, imports, scope, or resume inputs are missing or inconsistent.

Run this order:

1. return to the selected runtime anchor from the setup result
2. materialize or refresh `appium-runtime-bridge.mjs`
3. import the generated bridge and call `ensureRuntimeContext()`
4. call `setResumeInputs({ targetDevice, wdOpts })`
5. call `startSessionFromResumeInputs()`

Treat this as REPL or resume-state recovery, not environment repair.

- in `strict` mode, if any bridge step in this branch fails, report `bridge flow broken` and stop that requested flow for the current turn instead of switching to a different session-start path
- in `operational` mode, if any bridge step in this branch fails, enter the controlled fallback ladder from `Operational Fallback Contract`
- in either mode, do not jump back into setup unless the setup result is proven stale by new evidence

## Target and Session Rules

The canonical target and recovery rules live here. The reference files are examples and recovery notes, not the source of truth.

Only these target shapes are valid:

- real device: `TARGET_DEVICE.udid`
- already running emulator: `TARGET_DEVICE.serial`
- Appium-launched emulator: `TARGET_DEVICE.avd`

When multiple Android targets are visible, do not guess. Stop and set the exact target explicitly.

Treat the target as changed when any of these change:

- `kind`
- `udid`
- `serial`
- `avd`

When the target changed:

- delete the old session
- set the new explicit target
- update `wdOpts` for that target
- create a fresh Appium session before any requested action

Do not restart the Appium server for a target switch by default. Restart it only when one of these is true:

- stale cleanup from the previous target is failing
- the old target disappeared before cleanup completed
- the server's ADB state is clearly wedged around the old target

Read `references/session-recipes.md` for concrete real-device, emulator, relaunch, and target-switch examples.

## Quick Action Mode

Use this mode for short requests such as launching an installed app, bringing an app back to the foreground, confirming the frontmost package, entering text, tapping one control, or taking one screenshot of the current state when the user explicitly asked for it.

Decision path:

1. Materialize or refresh the runtime bridge in the selected runtime anchor.
2. Import the bridge and call `ensureRuntimeContext()`.
3. Run `Entry Gate`.
4. If `runPreflightLite()` proves a healthy same-target session, reuse it.
5. Otherwise, resolve the setup target, finish setup in the same agent, and continue from the setup result through the bridge.
6. Execute the requested action.
7. Verify the result through package, activity, locator state, or visible text.
8. Capture a screenshot only when the user explicitly asked for it, when the task is visual, or when structural checks still leave the state ambiguous.
9. Leave the session alive unless an explicit cleanup request or verified recovery step says otherwise.

Quick Action Mode still follows `Execution Mode Contract`. If the task is a skill evaluation, verification, or regression check with no mode specified, ask the user to choose the mode before running even a quick action.

Minimal quick-action inventory:

- one action check
- one visible-result check
- no artifact by default

Prefer `activateAndVerify(...)` plus `logForegroundApp()` over rebuilding the session after every turn.

## Result Classification Contract

Keep the requested target result separate from any fallback observation.

- `execution mode` states whether the flow used `strict` or `operational`
- `requested target status` is about the exact task the user asked for
- `requested target` means the original objective exactly as requested by the user
- `canonical path status` is about the generated runtime bridge path only
- `fallback path used` states whether the flow stayed canonical or used `supported` or `emergency` fallback
- `fallback status` is about any secondary observation you used after the requested target failed or was blocked
- `requested target status: success` is allowed only when the original requested objective itself was completed
- if the original objective succeeds only through a fallback path, keep `canonical path status` as `failed` or `blocked`
- do not upgrade overall success when the requested target is still `failed` or `blocked`
- do not infer `requested target success` from an alternate path, fallback navigation, or any other secondary observation
- if the original requested objective is still `failed` or `blocked`, keep it that way even when the fallback observation succeeds
- fallback success must not be reported as `requested target success`
- do not describe a fallback page load as if it completed the originally requested click or search flow

Use this minimum final-report shape:

- `execution mode: strict | operational`
- `requested target status: success | failed | blocked`
- `canonical path status: success | failed | blocked`
- `fallback path used: none | supported | emergency`
- `fallback status: not used | success | failed`
- `exact blocker: ...` for the requested target
- `supporting evidence: ...` with requested-target evidence and fallback evidence kept distinct
- `session kept alive: yes | no`
- `cleanup performed: none | session deleted | server stopped | ...`

## Minimal Evidence Policy

Do not call screenshots or page source helpers by default for routine functional tasks when package, activity, locator state, text, or counters already prove success.

Use this order:

1. `logForegroundApp()` or `ensureForegroundApp(...)`
2. direct locator checks such as text, `content-desc`, `checked`, `enabled`, or `isExisting()`
3. aggregate UI signals such as counters, badges, or other visible text that can be queried through locators
4. page source only for locator debugging
5. screenshots only for visual signoff or unresolved ambiguity

When you escalate from structural checks to page source or screenshots, state what the earlier checks could not prove and why the extra evidence is needed.

Cleanup defaults:

- do not run cleanup at the end of a request by default; follow `Session Persistence Contract`
- stop the Appium server only for explicit cleanup requests
- delete and recreate the session only for verified recovery steps or explicit cleanup requests

## Code Placement Rules

- Keep inline JavaScript blocks in `SKILL.md` under roughly 10 lines.
- Move JavaScript blocks longer than 20 lines into `scripts/*.mjs`.
- Keep fixed text contracts such as `SETUP_HANDOFF` in `SKILL.md`.
- Keep long examples, recipes, and failure catalogs in `references/*.md`.
- Name `scripts/*.mjs` by role: `*-helpers` for shared bootstrap code, `*-example` for runnable snippets, and `*-probe` if a file exists only to inspect or verify state.
