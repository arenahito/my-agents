# Setup And Handoff

Read this file when `preflight-lite` fails, when setup phase must continue, or when you need to resume after setup.

Canonical setup-target rules still live in `SKILL.md`. This file covers the execution details for setup phase, setup-result recording, and the canonical post-setup resume path.

Mode reminder:

- if the task is a skill evaluation, skill verification, or regression check and no execution mode was specified, stop and ask the user to choose `strict` or `operational` before you continue
- otherwise keep using the mode selected by `Execution Mode Contract` in `SKILL.md`

## Setup Phase Contract

Use setup as one phase of the same Appium workflow.

- Setup phase owns `runtime anchor resolution -> bootstrap or repair -> driver install -> import check -> SDK env check -> Appium server start -> server status verification`.
- Session creation still belongs to the next step after setup phase proves the environment is ready.
- The same agent may perform setup, resume, and the user-visible flow end to end.
- Once setup says the environment is ready, stop doing repair work and move straight into runtime-bridge materialization, target selection, `setWdOpts(...)`, and session start.

## Runtime-Anchor Verification

From the selected runtime anchor:

1. Install `webdriverio` and `appium`.
2. Install the `uiautomator2` driver with `npm exec -- appium driver install uiautomator2`.
3. Verify that `webdriverio` imports successfully.
4. Verify that `npm exec -- appium driver list --installed` shows the required driver.
5. Verify that `adb devices` can see the intended Android target.

Canonical verification commands:

```text
node -e "import('webdriverio').then(() => console.log('webdriverio import ok')).catch((error) => { console.error(error); process.exit(1); })"
node -e "console.log(process.env.ANDROID_HOME || 'ANDROID_HOME unset'); console.log(process.env.ANDROID_SDK_ROOT || 'ANDROID_SDK_ROOT unset')"
npm exec -- appium driver list --installed
adb devices
node -e "const url = process.argv[1]; fetch(url).then(async (response) => { if (!response.ok) throw new Error('HTTP ' + response.status); const payload = await response.json(); console.log(payload.value?.ready ?? payload.ready ?? 'status ok'); }).catch((error) => { console.error(error); process.exit(1); })" "<server-status-url>"
```

Run import and CLI verification from the selected runtime anchor in the shell, then let the generated runtime bridge carry that runtime anchor into `js_repl`. After helpers load through the bridge, `setRuntimeAnchor(...)` should receive the selected runtime anchor directly instead of depending on `process.cwd()`.

## Runtime Bridge Materialization

`js_repl` is not the canonical place to solve runtime-anchor resolution, direct helper imports, or resume wiring.

Materialize the official bridge into the selected runtime anchor and let that bridge own the runtime-context setup:

```text
node "<skill-dir>/scripts/materialize-runtime-bridge.mjs" "<selected-runtime-anchor>"
```

This writes:

```text
<selected runtime anchor>/appium-runtime-bridge.mjs
```

The generated bridge is a skill-managed runtime artifact, not an ad-hoc patch. It owns:

- fixing the canonical runtime anchor for this task
- resolving the selected runtime anchor's `webdriverio` module
- loading `bootstrap-helpers.mjs`
- calling `setRuntimeAnchor(<selected runtime anchor>)`
- accepting resume inputs
- running `parent-resume-example.mjs`

When setup already finished, treat bridge materialization or refresh as the first normal step before session start.

## Canonical Appium Server Commands

Run the Appium server from the selected runtime anchor. Do not launch a global `appium` process from outside that target.

Persistent TTY example:

```text
npm exec -- appium
```

Canonical dedicated-server example:

```text
npm exec -- appium --address 127.0.0.1 --port 4725 --session-override
```

Base-path compatibility example:

```text
npm exec -- appium --base-path=/wd/hub
```

Before launching, confirm `ANDROID_HOME` or `ANDROID_SDK_ROOT` in the same shell session that will own the Appium server.

## Setup Result Block

Keep this fixed block whenever setup phase produces reusable environment details:

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

The setup result is ready only when the environment is effectively `ready for session start` and `remaining blocker` is `none`.

## Post-Setup Recovery

Use this section when the setup result already says `remaining blocker: none`, but the flow still fails before or during the first session start.

Treat the failure as a post-setup recovery problem first, not as environment repair.

Check these in order:

1. the generated `appium-runtime-bridge.mjs` exists in the setup result `selected runtime anchor`
2. the bridge version matches the current skill version
3. the bridge imports successfully in the current `js_repl` kernel
4. `await ensureRuntimeContext()` succeeds through the bridge
5. `globalThis.selectedRuntimeAnchor`, `globalThis.resumeTargetDevice`, and `globalThis.resumeWdOpts` are populated for resume

If one of those checks fails, fix that bridge, REPL, or resume-input problem and continue with the canonical resume path below.

If the bridge still cannot be imported or its canonical functions still fail after those checks:

- in `strict` mode, report `bridge flow broken`, keep the current Appium server and session state unchanged unless a verified recovery step requires cleanup, and stop instead of switching to a throwaway script or another session-start path
- in `operational` mode, enter the controlled fallback ladder from `SKILL.md` in this order:
  1. rematerialize the bridge once and retry the canonical bridge path
  2. if that still fails, use `scripts/appium-operational-fallback.mjs`
  3. if that also fails, use the emergency hatch only with captured evidence and explicit reporting

Only return to setup work when the setup result is later proven stale. Examples: the selected runtime anchor no longer imports `webdriverio`, the driver list changed, the Android target disappeared, or the server URL from setup no longer answers.

## Resume Order

Resume in this order:

1. Resolve the `selected runtime anchor` from the setup result.
2. Materialize or refresh `appium-runtime-bridge.mjs` in that runtime anchor.
3. Import the generated bridge in `js_repl`.
4. Call `await ensureRuntimeContext()`.
5. Reuse the setup result `server URL` and `server path`.
6. Resolve or confirm the target device.
7. Call `setResumeInputs({ targetDevice, wdOpts })` through the bridge.
8. Start the first session with `await startSessionFromResumeInputs()`.

Use the generated runtime-anchor bridge as the canonical post-setup resume cell. It expects all of the following to be set before `startSessionFromResumeInputs()` runs:

- `globalThis.selectedRuntimeAnchor`
- `globalThis.resumeTargetDevice`
- `globalThis.resumeWdOpts`

Use the setup result and the current task target to populate those values before resuming.

`scripts/parent-resume-example.mjs` remains the lower-level resume step, but the normal `js_repl` entrypoint is the generated bridge.

If resume fails before `startSessionFromResumeInputs()`:

1. stay on the selected runtime anchor
2. rematerialize or refresh `appium-runtime-bridge.mjs` if the version is stale or the file is missing
3. reimport the bridge and rerun `await ensureRuntimeContext()`
4. repopulate the resume inputs
5. rerun `await startSessionFromResumeInputs()`

If the bridge path still fails after that retry:

- in `strict` mode, report `bridge flow broken` and stop the requested flow
- in `operational` mode, switch to the supported fallback path before considering the emergency hatch
- in both modes, do not treat that failure as a reason to create a new harness, reinstall packages, reinstall drivers, or restart the Appium server unless the setup result is proven stale

## Result Reporting

Separate the requested target from any fallback observation.

- If the requested click, search result, or screen transition was blocked, mark the requested target as `failed` or `blocked`.
- If you then verify a fallback page or alternate path, record it as `fallback status`, not as completion of the requested target.
- Include `execution mode`, `canonical path status`, and `fallback path used` in the final report.
- Include `session kept alive: yes | no` and `cleanup performed: ...` in the final report.
