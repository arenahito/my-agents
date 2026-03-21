# Troubleshooting

Read this file when setup, server start, session start, or target switching fails.

Canonical setup-target and target-switch rules still live in `SKILL.md`. This file groups common failures by phase and keeps each entry in `symptom -> cause -> fix` form.

## Mode Selection

### Evaluation, verification, or regression task has no execution mode

Symptom: the task is clearly about skill evaluation, skill verification, or regression checking, but no execution mode was specified.
Cause: this class of task must not auto-pick `strict` or `operational`.
Fix: stop and ask the user to choose `strict` or `operational` before continuing.

## Setup Target And Runtime Anchor

### `Cannot find module 'webdriverio'`

Symptom: the runtime anchor cannot import `webdriverio`.
Cause: setup did not finish in the selected runtime anchor, or cwd was not changed to the selected runtime anchor before loading helpers.
Fix: change cwd to the selected runtime anchor, verify the import there, then load `scripts/bootstrap-helpers.mjs`.

### Workspace root `package.json` exists but has no `appium`

Symptom: the repo has a package manifest, but it is not an Appium runtime anchor.
Cause: the workspace root does not satisfy the setup-target rules.
Fix: follow the setup-target rules. If `./tmp/codex-appium-harness` does not exist yet, ask the user to choose between the existing package and the harness, and recommend the harness.

### Workspace root `package.json` has `appium` but import still fails

Symptom: the existing package was selected as the runtime anchor, but imports still fail.
Cause: local dependencies are incomplete inside the selected runtime anchor.
Fix: keep the existing package as the selected runtime anchor, install the missing local dependencies there, and rerun the import check.

### `./tmp/codex-appium-harness` exists but is incomplete

Symptom: the harness directory exists, but imports or CLI checks fail.
Cause: the harness was only partially created or later drifted.
Fix: repair that harness in place. Do not create a second harness with a different path.

### Selected runtime anchor cannot execute `npm exec -- appium`

Symptom: the selected target resolves `npm`, but not local Appium.
Cause: `appium` is missing or broken in the selected runtime anchor.
Fix: install or repair `appium` in the selected target. Do not fall back to a global `appium`.

### Global Appium appears to work but the selected runtime anchor still fails

Symptom: PATH-resolved Appium answers, but the chosen runtime anchor remains unhealthy.
Cause: the check is accidentally mixing local and global tooling.
Fix: ignore the global result and repair the selected target. Global Appium is not a valid fallback for this skill.

### Runtime anchor is unset

Symptom: helper calls fail before session work starts and mention an unset runtime anchor.
Cause: `setRuntimeAnchor(...)` was never called after loading helpers.
Fix: change cwd to the selected runtime anchor, then call `setRuntimeAnchor(process.cwd())` before `setWdOpts(...)` or session helpers.

### `process is not defined` in `js_repl`

Symptom: a `js_repl` cell tries to call `process.chdir(...)` or inspect `process`, but `process` is unavailable.
Cause: the live REPL environment does not expose the Node process object in the way the canonical helper flow expects.
Fix: stop treating the REPL cell as the runtime bootstrap layer. Materialize `appium-runtime-bridge.mjs` into the selected runtime anchor, import that bridge, and call `await ensureRuntimeContext()` there.

### Current cwd does not match the selected runtime anchor

Symptom: helper calls fail with a cwd/runtime-anchor mismatch message.
Cause: the process moved away from the selected runtime anchor, or `setRuntimeAnchor(...)` was called with a different path.
Fix: align `process.chdir(...)` with the selected runtime anchor and call `setRuntimeAnchor(...)` with the same path.

### Helper call attempted outside the selected runtime anchor

Symptom: `setWdOpts(...)`, `startFreshSession()`, screenshot, page-source, or session cleanup helpers fail immediately on validation.
Cause: helper guardrails are blocking work outside the selected runtime anchor.
Fix: return to the selected runtime anchor before running Appium helpers. Do not create repo-root `node_modules` links or other fallback paths.

### Handwritten helpers drifted away from the shared helper contract

Symptom: new top-level helper functions or ad-hoc session state disagree with `bootstrap-helpers.mjs`.
Cause: the session flow created a parallel helper stack instead of reusing the canonical helper contract.
Fix: return to the selected runtime anchor, materialize or refresh `appium-runtime-bridge.mjs`, import it, call `await ensureRuntimeContext()`, repopulate the resume inputs through `setResumeInputs(...)`, and continue with `await startSessionFromResumeInputs()` instead of the handwritten helpers.

## Appium CLI And Server Start

### `Could not connect to Appium`

Symptom: the client cannot reach the server URL.
Cause: the server is not running in a persistent TTY session, or `hostname`, `port`, and `path` do not match the actual server.
Fix: confirm the server is running in a persistent TTY session and that `hostname`, `port`, and `path` match the server.

### `[ERROR] Unrecognized arguments: -- --address ...`

Symptom: Appium rejects the launch command with an extra `--`.
Cause: the `npm exec` command passed an extra separator after `appium`.
Fix: use `npm exec -- appium --address 127.0.0.1 --port 4725 --session-override`.

### `npm warn Unknown cli config "--address"` followed by Appium argument errors

Symptom: npm consumes Appium flags before Appium starts.
Cause: the command omitted the separator before the package name.
Fix: use `npm exec -- appium --address 127.0.0.1 --port 4725 --session-override`.

### Session works only with `/wd/hub`

Symptom: the client succeeds only when `path` is `/wd/hub`.
Cause: the server was started with `--base-path=/wd/hub`.
Fix: keep the client path consistent instead of mixing defaults.

## SDK And Device Readiness

### `Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported`

Symptom: Appium starts or validates without a usable Android SDK location.
Cause: the server shell does not have `ANDROID_HOME` or `ANDROID_SDK_ROOT` set and resolvable.
Fix: restart the Appium server from an environment where `ANDROID_HOME` or `ANDROID_SDK_ROOT` is set and resolvable. Do not work around this with `adb`.

### `No driver found for automationName 'UiAutomator2'`

Symptom: session start fails because the UiAutomator2 driver is missing.
Cause: the driver was never installed in the selected runtime anchor.
Fix: run `npm exec -- appium driver install uiautomator2` from the selected runtime anchor.

### `device unauthorized`

Symptom: the Android target is visible but refuses control.
Cause: USB debugging has not been accepted on the device.
Fix: unlock the device, accept the USB debugging prompt, then reconnect and recreate the session.

### Multiple Android targets appear in `adb devices`

Symptom: several candidate devices are visible and target selection is ambiguous.
Cause: no explicit `udid` or emulator serial was chosen before connecting.
Fix: set an explicit real-device `udid` or emulator serial before connecting.

### Emulator is visible but not ready

Symptom: the emulator appears in `adb devices`, but the session cannot start cleanly.
Cause: boot is incomplete or the emulator is stale.
Fix: wait for boot completion or cold-boot the emulator, then recreate the session.

## Session State And Resume

### Invalid target shape

Symptom: `setTargetDevice(...)` fails immediately and prints the allowed target shapes.
Cause: a non-canonical target shape such as `kind: "serial"` or an invalid field combination was passed.
Fix: use exactly one of these shapes: `{ kind: "real", udid: "..." }`, `{ kind: "emulator", serial: "..." }`, or `{ kind: "emulator", avd: "..." }`.

### `Cannot read properties of undefined (reading 'automationProtocol')` during `remote(...)`

Symptom: `remote(...)` fails before the session is created.
Cause: `setWdOpts(...)` received an options object without `automationProtocol: "webdriver"`.
Fix: add `automationProtocol: "webdriver"` to the object passed to `setWdOpts(...)`.

### `startFreshSession()` still says `Call setWdOpts(...) before starting an Appium session.`

Symptom: session start still fails even after later setup cells ran.
Cause: the helpers are reading `globalThis.__appiumState`, but the target or options were only changed in stale top-level variables.
Fix: call `setTargetDevice(...)` and `setWdOpts(...)` so the helpers read current state from `globalThis.__appiumState`.

### Helper functions immediately say `No active Appium session`

Symptom: helper calls fail right after a seemingly successful `remote(...)`.
Cause: the live session was not stored on `globalThis.__appiumDriver`, or a shared top-level `driver` binding interfered.
Fix: set `injectGlobals: false`, store the result on `globalThis.__appiumDriver`, and avoid a shared top-level `driver` binding.

### `js_repl` reset or timeout destroyed the bindings

Symptom: helper names or shared state disappeared between turns.
Cause: the kernel was reset or the session state was lost.
Fix: return to the selected runtime anchor, rematerialize or refresh `appium-runtime-bridge.mjs`, import it again, call `await ensureRuntimeContext()`, repopulate the resume inputs through `setResumeInputs(...)`, and recreate the session with shorter, focused cells through `await startSessionFromResumeInputs()`.

### Bridge import fails after setup is already ready

Symptom: setup already proved the environment ready, but importing `appium-runtime-bridge.mjs` fails in `js_repl`.
Cause: the canonical bridge path is broken in the current runtime context.
Fix:
- `strict`: report `bridge flow broken`, attach the import failure evidence, and stop that flow. Do not bypass the bridge with a throwaway script, raw WebDriver HTTP, or a second helper stack.
- `operational`: capture the failure evidence, retry the canonical bridge path once, then continue into `scripts/appium-operational-fallback.mjs` if the retry still fails. Use the emergency hatch only after the supported fallback also fails.

### `ensureRuntimeContext()` fails after bridge import

Symptom: the generated bridge imports, but `ensureRuntimeContext()` still fails.
Cause: the canonical runtime-context setup did not complete cleanly in the selected runtime anchor.
Fix:
- `strict`: report `bridge flow broken`, attach the failure evidence, and stop that flow. Do not treat this symptom as permission to create another session-start path.
- `operational`: capture the failure evidence, rematerialize and retry the bridge once, then move into `scripts/appium-operational-fallback.mjs` if the retry still fails.

### Setup passed but resume hit import, helper, or scope trouble

Symptom: setup already says `remaining blocker: none`, but the flow fails again before or during the first session start because helper names, imports, or resume state are missing.
Cause: the environment is not necessarily stale. The failure is usually in REPL state, helper loading, runtime-anchor alignment, or missing resume inputs.
Fix: stay on the selected runtime anchor, materialize or refresh `appium-runtime-bridge.mjs`, import it, call `await ensureRuntimeContext()`, set `globalThis.selectedRuntimeAnchor`, `globalThis.resumeTargetDevice`, and `globalThis.resumeWdOpts` through `setResumeInputs(...)`, then rerun `await startSessionFromResumeInputs()`. Do not treat this symptom as a reason to patch a shim, build a parallel helper stack, or restart setup unless the setup result is proven stale.

### `startSessionFromResumeInputs()` fails after bridge setup succeeded

Symptom: the bridge imported and `ensureRuntimeContext()` succeeded, but `startSessionFromResumeInputs()` still fails.
Cause: the canonical bridge-driven session start is broken for the current flow.
Fix:
- `strict`: report `bridge flow broken`, attach the failure evidence, and stop that flow. Only return to setup if later evidence proves the setup result stale.
- `operational`: capture the failure evidence, retry the canonical bridge path once, then use `scripts/appium-operational-fallback.mjs`. Use the emergency hatch only if the supported fallback also fails.

### Bare `webdriverio` import fails in `js_repl`

Symptom: `await import("webdriverio")` fails in `js_repl`, even though setup already proved the selected runtime anchor healthy.
Cause: package resolution in the REPL does not match the runtime-anchor environment that setup validated.
Fix: do not patch a shim or rebuild the helper stack inside the REPL. Materialize `appium-runtime-bridge.mjs` into the selected runtime anchor and let the bridge load the canonical helpers from the runtime-anchor context.

### Local file import fails because the module uses static builtin imports

Symptom: a local helper file exists, but importing it from `js_repl` fails because the module depends on static builtin or package imports that the REPL cannot resolve in the same way.
Cause: the local file was written for a normal Node module context, not for direct REPL execution.
Fix: route the flow through `appium-runtime-bridge.mjs` instead of turning the file into a second ad-hoc REPL helper. The bridge is the canonical place to absorb REPL import constraints.

### Resume script assumes the wrong runtime anchor

Symptom: the resume example fails because `selectedRuntimeAnchor` is missing or points at the wrong place.
Cause: the setup result `selected runtime anchor` was not carried into the resume step.
Fix: set `globalThis.selectedRuntimeAnchor` from the setup result, rematerialize or refresh `appium-runtime-bridge.mjs` in that path, import the bridge, call `await ensureRuntimeContext()`, and rerun the bridge-based resume path.

### Resume script is missing target or session options

Symptom: the resume example fails before session start and asks for missing resume inputs.
Cause: `resumeTargetDevice` or `resumeWdOpts` was not set before the resume cell ran.
Fix: call `setResumeInputs({ targetDevice, wdOpts })` through the generated bridge, then rerun `await startSessionFromResumeInputs()`.

## Target Switch And Cleanup

### Changing targets later still mentions the old `udid` or emulator serial

Symptom: reconnect attempts still reference the previous target.
Cause: the old session did not clean up cleanly, or the server is still stuck on old-target cleanup.
Fix: restart Appium, confirm `adb devices` for the new target, then create a fresh session with the new explicit target.

### Single-session flows accumulate stale sessions across target switches

Symptom: later target switches are blocked by leftover server state.
Cause: the server keeps old sessions alive between reconnects.
Fix: start Appium with `--session-override` so the server closes leftovers before accepting the next session.

### Setup finished but the flow returned to repair work

Symptom: setup checks already passed, yet later cells try to recreate the harness, reinstall packages, reinstall drivers, or restart the server without new evidence.
Cause: the flow ignored the `SETUP_HANDOFF` result and drifted back into setup.
Fix: if `remaining blocker` is `none`, return to the bridge path: materialize or refresh `appium-runtime-bridge.mjs`, call `await ensureRuntimeContext()`, set resume inputs, and run `await startSessionFromResumeInputs()`. Only re-enter setup after proving the setup result is stale.

### Final report merged fallback success into the requested target

Symptom: the report says the task succeeded, but the originally requested click, search result, or screen transition was actually blocked.
Cause: fallback observation was recorded as if it completed the requested target.
Fix: split the report into `requested target status`, `canonical path status`, `fallback path used`, and `fallback status`. Keep the requested target as `failed` or `blocked` when it was not completed, even if the fallback observation succeeded, and keep `canonical path status` as `failed` or `blocked` when only a fallback path succeeded.
