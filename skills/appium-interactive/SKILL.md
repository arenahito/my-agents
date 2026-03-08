---
name: appium-interactive
description: Persistent Appium-based Android app debugging and QA through `js_repl` with WebdriverIO. Use when Codex needs to drive a local Android app on a real device or emulator, keep the same Appium session alive across iterations, capture screenshots and page source, and collect functional or visual QA evidence. Initial scope is Android only; keep the workflow extensible for future iOS support.
---

# Appium Interactive

Use a persistent `js_repl` Appium session to debug local Android apps on real devices or emulators, keep the same WebdriverIO/Appium handles alive across iterations, and capture QA evidence without rebuilding the session unless target ownership or app state changed.

## Preconditions

- `js_repl` must be enabled for this skill.
- If `js_repl` is missing, enable it in `~/.codex/config.toml`:

```toml
[features]
js_repl = true
```

- Start a new Codex session after enabling `js_repl` so the tool list refreshes.
- Run this workflow with sandboxing disabled: start Codex with `--sandbox danger-full-access` or an equivalent `sandbox_mode=danger-full-access` configuration.
- Make sure the Android SDK, platform tools, and any emulator tooling you need are installed and discoverable from the environment that launches Appium.
- Make sure the Appium server process can resolve the Android SDK location. If auto-discovery is unavailable, set `ANDROID_HOME` or `ANDROID_SDK_ROOT` in the environment that launches Appium before starting the server.
- Keep the Appium server running in a persistent TTY session before creating a client session.
- Do not stop the Appium server or delete a healthy Appium session between user requests unless the user explicitly asks for cleanup or a verified recovery step requires it.
- Treat `js_repl_reset` as a recovery tool. Resetting the kernel destroys your client bindings and forces a fresh Appium session.
- Treat Appium session creation as a hard gate. If the server, driver, or Android SDK wiring is broken, fix that first instead of completing the requested flow with `adb`.
- Initial implementation scope is Android only. Do not improvise iOS commands into this skill body; see `references/future-ios.md` for the intended extension path.

## One-time Setup

Run setup from the same project directory you need to debug. The exact commands depend on your package manager and shell; the important contract is what each step proves:

1. Initialize a package manifest in the workspace if one does not already exist.
2. Install `webdriverio` and `appium` so the current workspace can import and execute them.
3. Install the `uiautomator2` Appium driver from the same environment that will run the Appium server.
4. Verify that `webdriverio` imports successfully from the workspace.
5. Verify that the required Appium driver appears in the installed-driver list.
6. Verify that `adb devices` can see the intended Android target.

Choose one Appium launcher command for your environment and keep using that exact launcher for driver inspection and server startup. Examples: `pnpm exec appium`, `npx appium`, `bunx appium`, or `appium`.

Examples of the verification commands:

```text
node -e "import('webdriverio').then(() => console.log('webdriverio import ok')).catch((error) => { console.error(error); process.exit(1); })"
<appium-cmd> driver list --installed
adb devices
```

Notes:

- Use any package manager or install scope you like, as long as `webdriverio` is importable from the `js_repl` working directory and the Appium server plus Extension CLI run in the same environment.
- Appium installs drivers separately. If `uiautomator2` is not available yet, install it explicitly and confirm it appears in the installed-driver list before attempting `remote(...)`.
- Appium 2 defaults to the server base path `/`. Only use `/wd/hub` if you intentionally started the server with `<appium-cmd> --base-path=/wd/hub`.
- With `webdriverio@9`, set `automationProtocol: "webdriver"` explicitly in the `remote(...)` options you keep in `wdOpts`. Do not rely on an implied default inside `js_repl`.
- Set `injectGlobals: false` in `wdOpts` and keep the live session on `globalThis.__appiumDriver`. This avoids `driver` binding collisions inside `js_repl`.
- If you want to use Appium Inspector alongside this workflow, install the compatible Inspector plugin for your Appium major version first, then launch the server with `<appium-cmd> --use-plugins=inspector --allow-cors`. Plain `--allow-cors` only relaxes CORS; it does not activate the Inspector plugin path by itself. Inspector complements this skill for locator discovery; it does not replace the persistent `js_repl` session.
- Do not treat `adb` reachability by itself as proof that the skill is ready. This skill is ready only after Appium can create and keep a session.

## Preflight Gate

Do not start the requested QA flow until all of the following are true:

- `webdriverio` imports successfully from the current `js_repl` working directory.
- `ANDROID_HOME` or `ANDROID_SDK_ROOT` is set in the exact shell session that will launch the Appium server.
- The Appium server is reachable at the exact `hostname` / `port` / `path` you will pass to `remote(...)`.
- The required Appium driver is installed and visible to that server.
- The Appium server process can resolve the Android SDK location it needs.
- A session can be created for the chosen target.

If any item above fails, stop the user flow and repair the environment first. Do not silently switch to `adb`, coordinate taps, or intent launching as a substitute for Appium-driven QA. `adb` is acceptable only for target discovery, boot checks, authorization prompts, reconnecting the target, and returning the device to a neutral state. It must not advance the requested app flow or replace Appium-collected evidence.

Run this preflight command set before the first session of a task and whenever ownership or environment changed. Replace `<appium-cmd>` with the exact launcher command that matches the Appium server environment, and replace `<server-status-url>` with the exact status endpoint for the server you will call from `remote(...)`. Examples: `http://127.0.0.1:4723/status` for `path: "/"`, `http://127.0.0.1:4723/wd/hub/status` for `path: "/wd/hub"`.

Run the SDK-variable check before starting Appium. If it fails, stop there and fix the launch environment before you open a persistent Appium server session.

```text
node -e "import('webdriverio').then(() => console.log('webdriverio import ok')).catch((error) => { console.error(error); process.exit(1); })"
node -e "console.log(process.env.ANDROID_HOME || 'ANDROID_HOME unset'); console.log(process.env.ANDROID_SDK_ROOT || 'ANDROID_SDK_ROOT unset')"
<appium-cmd> driver list --installed
adb devices
node -e "const url = process.argv[1]; fetch(url).then(async (response) => { if (!response.ok) throw new Error('HTTP ' + response.status); const payload = await response.json(); console.log(payload.value?.ready ?? payload.ready ?? 'status ok'); }).catch((error) => { console.error(error); process.exit(1); })" "<server-status-url>"
```

Treat the preflight as failed when any command exits non-zero or when the SDK variables are unset in the environment that will launch the Appium server.

If the SDK-variable check fails, export one or both variables in the same shell that will launch Appium, then rerun the preflight before starting the server:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
<appium-cmd>
```

```powershell
$env:ANDROID_HOME = "$HOME\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
<appium-cmd>
```

## Core Workflow

1. Write a QA inventory before testing:
   - Build it from the user request, the visible behaviors you implemented, and the claims you expect to make in the final response.
   - Map every claim or behavior to at least one functional check and one evidence artifact.
   - Add at least two exploratory or off-happy-path checks.
2. Run the bootstrap cell once.
3. Confirm `ANDROID_HOME` or `ANDROID_SDK_ROOT` in the exact shell that will launch Appium, then start or confirm the Appium server and Android target in persistent terminal sessions.
4. Choose exactly one Android target type:
   - real device: read `references/android-real.md`
   - emulator: read `references/android-emulator.md`
5. Create or reuse the Appium session for that target.
   - If session creation fails, debug the Appium prerequisites and retry from there.
   - Do not continue the requested flow through `adb` while the Appium session is broken or missing.
6. Run functional QA with normal user input first.
7. Capture screenshots and page source separately from the functional pass.
8. Recreate the session only when the target, installed build, or Appium server ownership changed.
   - A target switch normally requires only a fresh Appium session with the new explicit `udid`, emulator serial, or `avd`.
   - Restart the Appium server only when stale cleanup from the previous target is failing, the previous target disappeared before cleanup completed, or the server's ADB state is clearly wedged around the old target.
9. Do not clean up the session or stop the Appium server at the end of a turn by default.
10. Clean up only when the user explicitly asks for it or a verified recovery step requires it.

## Quick Action Mode

Use this mode for short requests such as launching an installed app, bringing an app back to the foreground, confirming the frontmost package, or taking one screenshot of the current state.

For quick actions:

1. Write a minimal inventory with one action check, one visible-result check, and one evidence artifact.
2. Reuse the existing Appium server and `globalThis.__appiumDriver` whenever possible; if the handle is missing, recreate or attach a session before calling helper functions.
   - If the Android target changed, do not reuse the old driver handle. Delete or replace the session for the new explicit target first.
3. Prefer `activateAndVerify(...)` plus `logForegroundApp()` over rebuilding the session after every turn.
4. Capture one screenshot after the requested state is visible.
5. Leave the Appium server and session running unless explicit cleanup was requested.

## Bootstrap (Run Once)

```javascript
var remote;
var ANDROID_BASE_CAPS;
var APPIUM_DRIVER_KEY;
var APPIUM_STATE_KEY;

try {
  ({ remote } = await import("webdriverio"));
  console.log("WebdriverIO loaded");
} catch (error) {
  throw new Error(
    `Could not load webdriverio from the current js_repl cwd. Run the setup commands from this workspace first. Original error: ${error}`
  );
}

APPIUM_DRIVER_KEY = "__appiumDriver";
APPIUM_STATE_KEY = "__appiumState";

var getAppiumState = function () {
  if (!globalThis[APPIUM_STATE_KEY]) {
    globalThis[APPIUM_STATE_KEY] = {
      wdOpts: undefined,
      targetDevice: undefined,
    };
  }
  return globalThis[APPIUM_STATE_KEY];
};

var setTargetDevice = function (nextTargetDevice) {
  var state = getAppiumState();
  state.targetDevice = nextTargetDevice;
  return state.targetDevice;
};

var getTargetDevice = function () {
  return getAppiumState().targetDevice;
};

var setWdOpts = function (nextWdOpts) {
  var state = getAppiumState();
  state.wdOpts = nextWdOpts;
  return state.wdOpts;
};

var getWdOpts = function () {
  return getAppiumState().wdOpts;
};

var getDriver = function () {
  var session = globalThis[APPIUM_DRIVER_KEY];
  if (!session) throw new Error("No active Appium session");
  return session;
};

var deleteDriverSession = async function () {
  var session = globalThis[APPIUM_DRIVER_KEY];
  if (!session) return;
  try {
    await session.deleteSession();
  } catch (error) {
    console.log("Ignoring deleteSession failure:", error.message);
  }
  globalThis[APPIUM_DRIVER_KEY] = undefined;
};

var emitCurrentScreenshot = async function () {
  const { Buffer } = await import("node:buffer");
  var session = getDriver();
  await codex.emitImage({
    bytes: Buffer.from(await session.takeScreenshot(), "base64"),
    mimeType: "image/png",
  });
};

var printCurrentPageSource = async function () {
  var session = getDriver();
  const source = await session.getPageSource();
  console.log(source);
  return source;
};

var logForegroundApp = async function () {
  var session = getDriver();
  var currentPackage = await session.getCurrentPackage();
  var currentActivity = await session.getCurrentActivity();
  console.log(
    JSON.stringify(
      {
        currentPackage,
        currentActivity,
      },
      null,
      2
    )
  );
  return { currentPackage, currentActivity };
};

var ensureForegroundApp = async function (packageName, timeout) {
  var session = getDriver();
  await session.waitUntil(
    async function () {
      return (await session.getCurrentPackage()) === packageName;
    },
    {
      timeout: timeout ?? 15000,
      timeoutMsg: `Expected ${packageName} to become the foreground app`,
    }
  );
  return await logForegroundApp();
};

var activateAndVerify = async function (packageName, timeout) {
  var session = getDriver();
  var beforeState = await session.queryAppState(packageName);
  await session.activateApp(packageName);
  var foreground = await ensureForegroundApp(packageName, timeout);
  var afterState = await session.queryAppState(packageName);
  console.log(
    JSON.stringify(
      {
        packageName,
        beforeState,
        afterState,
        ...foreground,
      },
      null,
      2
    )
  );
  return {
    packageName,
    beforeState,
    afterState,
    ...foreground,
  };
};

var startFreshSession = async function () {
  var wdOpts = getWdOpts();
  if (globalThis[APPIUM_DRIVER_KEY]) {
    throw new Error(
      "An Appium session is already active. Call await deleteDriverSession() before changing the target or rerunning a session-start cell."
    );
  }
  if (!wdOpts) {
    throw new Error("Call setWdOpts(...) before starting an Appium session.");
  }
  globalThis[APPIUM_DRIVER_KEY] = await remote({
    automationProtocol: "webdriver",
    injectGlobals: false,
    ...wdOpts,
  });
  return globalThis[APPIUM_DRIVER_KEY];
};

ANDROID_BASE_CAPS = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:newCommandTimeout": 300,
};
```

Binding rules:

- Use `var` for shared top-level bindings so later `js_repl` cells can reuse them.
- Prefer `var` even for temporary top-level values that you may rerun during debugging; avoid redeclaration errors caused by `const` or `let` in later cells.
- Keep mutable session configuration in `globalThis.__appiumState` via `setTargetDevice(...)` and `setWdOpts(...)`. Do not rely on later cells mutating a top-level `wdOpts` or `TARGET_DEVICE` binding that helper functions closed over earlier.
- Keep one active Appium session handle on `globalThis.__appiumDriver` per task unless you truly need concurrent sessions.
- Do not keep the long-lived session in a top-level `driver` binding. `webdriverio@9` can behave poorly with `driver` globals inside `js_repl`; `globalThis.__appiumDriver` plus `injectGlobals: false` is the safe pattern.
- If the server or target changes, call `await deleteDriverSession()` and build a fresh session rather than mutating a stale one.
- Do not rerun a session-start cell while `globalThis.__appiumDriver` already exists. Keep using the current session, or delete it first on purpose.
- If you need block-scoped scratch work, wrap it in `{ ... }` instead of redeclaring top-level names such as `Buffer`, `beforeState`, or `currentPackage`.

## Start or Reuse the Appium Server

Before starting the server, confirm `ANDROID_HOME` or `ANDROID_SDK_ROOT` in the same shell session that will launch Appium. Do not start Appium first and check later.

Use a persistent TTY session, for example:

```bash
<appium-cmd>
```

Example shell setup before server launch:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
<appium-cmd>
```

```powershell
$env:ANDROID_HOME = "$HOME\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
<appium-cmd>
```

If the variables are already set in that shell, explicitly verify them anyway before launching the server.

Only change the base path if you have a compatibility reason:

```bash
<appium-cmd> --base-path=/wd/hub
```

Before `remote(...)`, confirm the server is listening on the URL you plan to use.

## Start or Reuse Android Real Device Session

Read `references/android-real.md` before using this path.

Never auto-pick a real device when multiple Android targets are connected. Set the selected ADB device entry first:

```javascript
var ADB_DEVICE_ID = "192.168.0.109:32833";

setTargetDevice({
  kind: "real",
  udid: ADB_DEVICE_ID,
});
```

Use a deterministic app target. For generic smoke checks, system Settings is acceptable:

```javascript
setWdOpts({
  automationProtocol: "webdriver",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  logLevel: "info",
  injectGlobals: false,
  capabilities: {
    ...ANDROID_BASE_CAPS,
    "appium:udid": getTargetDevice().udid,
    "appium:deviceName": getTargetDevice().udid,
    "appium:appPackage": "com.android.settings",
    "appium:appActivity": ".Settings",
  },
});

var session = await startFreshSession();
console.log("Session:", session.sessionId);
```

If your server was started with `--base-path=/wd/hub`, change `path` to `"/wd/hub"` and keep the rest of the contract the same.

For project-specific apps, replace `appPackage` and `appActivity` with your actual launch target or use the app-under-test path required by the project.

## Start or Reuse Android Emulator Session

Read `references/android-emulator.md` before using this path.

Never auto-pick an emulator when multiple emulators are available. Prefer an explicit running serial:

```javascript
setTargetDevice({
  kind: "emulator",
  serial: "emulator-5554",
});
```

Use the running serial when you want to attach to an already-running emulator:

```javascript
setWdOpts({
  automationProtocol: "webdriver",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  logLevel: "info",
  injectGlobals: false,
  capabilities: {
    ...ANDROID_BASE_CAPS,
    "appium:udid": getTargetDevice().serial,
    "appium:deviceName": getTargetDevice().serial,
    "appium:appPackage": "com.android.settings",
    "appium:appActivity": ".Settings",
  },
});

var session = await startFreshSession();
console.log("Session:", session.sessionId);
```

If you need Appium to boot the emulator itself, replace the target fields with an explicit AVD:

```javascript
setTargetDevice({
  kind: "emulator",
  avd: "Pixel_8_API_34",
});

setWdOpts({
  automationProtocol: "webdriver",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  logLevel: "info",
  injectGlobals: false,
  capabilities: {
    ...ANDROID_BASE_CAPS,
    "appium:avd": getTargetDevice().avd,
    "appium:deviceName": getTargetDevice().avd,
    "appium:appPackage": "com.android.settings",
    "appium:appActivity": ".Settings",
  },
});

var session = await startFreshSession();
console.log("Session:", session.sessionId);
```

## Reuse Sessions During Iteration

Keep the same session whenever the Android target and installed build are unchanged.

Use the existing session for:

- repeated functional checks
- repeated screenshots or page-source captures
- short UI state inspections after app interactions

Recreate the session after:

- switching between real device and emulator
- switching to a different physical device or emulator serial
- restarting the Appium server
- reinstalling the app or changing the build under test
- any situation where the session becomes unresponsive or detached

Switching targets does not require an Appium server restart by default. Preferred order:

1. Delete the current session.
2. Set the new explicit target with `setTargetDevice(...)`.
3. Update `setWdOpts(...)` for that target.
4. Start a fresh session.

Restart the Appium server before creating the replacement session when any of these are true:

- the previous target already disappeared and the server is still trying to clean it up
- server logs mention the old `udid` or emulator serial during later cleanup and fail there
- the server stopped responding after the target switch
- you intentionally use a single-session workflow with `--session-override` and want the server to evict leftovers before the next session

Fresh session cell:

```javascript
await deleteDriverSession();
var session = await startFreshSession();
console.log("Relaunched session:", session.sessionId);
```

Quick app activation cell:

```javascript
if (!globalThis.__appiumDriver) {
  if (!getWdOpts()) {
    throw new Error("Call setTargetDevice(...) and setWdOpts(...) before starting a fresh session.");
  }
  await startFreshSession();
}
var launchResult = await activateAndVerify("com.android.chrome");
await emitCurrentScreenshot();
```

## Checklists

### Session Loop

- Bootstrap `js_repl` once and keep the same `globalThis.__appiumDriver` handle alive.
- Confirm `ANDROID_HOME` or `ANDROID_SDK_ROOT` before launching Appium, in the same shell that will own the server process.
- Confirm the Appium server URL and base path before connecting.
- Confirm the Appium server process can resolve the Android SDK before connecting.
- Select the Android target explicitly.
- Create or reuse the session.
- If session creation fails, stop and fix the Appium path or environment issue before doing any user-requested interaction.
- Run the functional checks.
- Capture screenshot and page source only after the state under review is visible.
- Leave the Appium server and healthy session handle running between turns.
- Recreate the session only when target ownership, server ownership, or installed build changed.
- If the previous target vanished before cleanup finished or the server keeps failing cleanup against the old target, restart Appium before connecting to the new target.
- Stop the Appium server only for explicit cleanup requests.
- Delete the session only for explicit cleanup requests or verified recovery steps.

### Target Selection

- Real device: require an explicit `udid`.
- Emulator: require an explicit running serial or an explicit AVD name.
- If multiple Android targets are connected, do not guess. Stop and set the target explicitly.

### Functional QA

- Prefer element-based interactions over coordinate taps.
- Verify at least one end-to-end critical flow.
- Confirm the visible result of the flow, not only the absence of driver errors.
- Use Appium Inspector as a locator aid when the source tree is hard to read.
- Do not replace a broken Appium flow with `adb` input commands just to make progress on the user-visible task.

### Visual QA

- Capture at least one screenshot per signoff claim.
- Pair screenshots with page source or locator evidence when the UI state is ambiguous.
- Note whether the artifact came from a real device or an emulator.
- If a view is scrollable, record whether the important state is visible in the startup view or after an intentional scroll step.

## Evidence Capture

Emit the current screenshot to the model:

```javascript
await emitCurrentScreenshot();
```

Print the current page source to inspect locators:

```javascript
await printCurrentPageSource();
```

Treat page source as potentially sensitive output. It can contain notification text, account labels, message previews, or other user-visible strings from the active device. Avoid printing it unless the locator problem actually requires it.

If you need a saved PNG artifact on disk instead of model-bound output:

```javascript
await getDriver().saveScreenshot("./appium-current.png");
console.log("Saved appium-current.png");
```

## Cleanup

Do not run cleanup by default at the end of a request.

You may stop the Appium server only when the user explicitly asks to stop it.

You may delete and recreate the session without stopping the Appium server only when:

- A verified recovery step requires a fresh session.
- Server ownership, target ownership, or installed build changed and reuse is unsafe.
- The user explicitly asks to close the current session.

```javascript
await deleteDriverSession();
globalThis[APPIUM_STATE_KEY] = {
  wdOpts: undefined,
  targetDevice: undefined,
};
globalThis[APPIUM_DRIVER_KEY] = undefined;
console.log("Appium session closed");
```

## Common Failure Modes

- `Cannot find module 'webdriverio'`: run the one-time setup in the current workspace and verify the import before using `js_repl`.
- `Could not connect to Appium`: confirm the server is running in a persistent TTY session and that `hostname`, `port`, and `path` match the server.
- `Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported`: restart the Appium server from an environment where `ANDROID_HOME` or `ANDROID_SDK_ROOT` is set and resolvable; do not work around this by driving the flow with `adb`. Use one of these restart patterns:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
<appium-cmd>
```

```powershell
$env:ANDROID_HOME = "$HOME\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
<appium-cmd>
```

- Session works only with `/wd/hub`: your server was likely started with `--base-path=/wd/hub`; keep the client path consistent instead of mixing defaults.
- `Cannot read properties of undefined (reading 'automationProtocol')` during `remote(...)`: add `automationProtocol: "webdriver"` to the object you pass to `setWdOpts(...)` explicitly. This has been required in real `webdriverio@9` sessions inside `js_repl`.
- `startFreshSession()` still says `Call setWdOpts(...) before starting an Appium session.` after a later setup cell: call `setTargetDevice(...)` and `setWdOpts(...)` so the helpers read `globalThis.__appiumState` instead of a stale top-level closure.
- `No driver found for automationName 'UiAutomator2'`: run `appium driver install uiautomator2`.
- Helper functions immediately say `No active Appium session` after a successful `remote(...)`: set `injectGlobals: false`, store the result on `globalThis.__appiumDriver`, and avoid a shared top-level `driver` binding.
- `device unauthorized`: unlock the Android device, accept the USB debugging prompt, then reconnect and recreate the session.
- Multiple Android targets appear in `adb devices`: set an explicit real-device `udid` or emulator serial before connecting.
- Emulator is visible but not ready: wait for boot completion or cold-boot the emulator, then recreate the session.
- Changing targets later causes errors that still mention the old `udid` or emulator serial: the old session likely did not clean up cleanly. Restart Appium, confirm `adb devices` for the new target, then create a fresh session with the new explicit target.
- Single-session flows accumulate stale sessions across target switches: start Appium with `--session-override` so the server closes leftovers before accepting the next session.
- `js_repl` reset or timeout destroyed your bindings: rerun the bootstrap cell and recreate the session with shorter, focused cells.
