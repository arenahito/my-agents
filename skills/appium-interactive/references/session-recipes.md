# Session Recipes

Read this file when you need concrete session examples after the canonical rules in `SKILL.md` are already fixed.

These recipes assume the runtime bridge or an equivalent canonical helper context is already established for the selected runtime anchor. Do not use this file to materialize `appium-runtime-bridge.mjs` or to replace the bridge-based resume path.

When you report the outcome of a recipe-driven flow, keep `requested target status` separate from `fallback status`. A fallback page or alternate navigation path does not complete the originally requested target by itself.

## Binding Rules

- Use `var` for shared top-level bindings so later `js_repl` cells can reuse them.
- Use the generated runtime bridge to establish runtime context before applying these recipes.
- After changing cwd to the selected runtime anchor, call `setRuntimeAnchor(process.cwd())` before `setWdOpts(...)`, `startFreshSession()`, or other Appium helpers.
- Keep mutable session configuration in `globalThis.__appiumState` via `setTargetDevice(...)` and `setWdOpts(...)`.
- Keep one active session handle on `globalThis.__appiumDriver`.
- Do not keep the long-lived session in a top-level `driver` binding.
- If the server or target changes, call `await deleteDriverSession()` and build a fresh session instead of mutating a stale one.
- Replace example app identifiers before running these cells. `appPackage` and `appActivity` below are placeholders for the target app of the current task.

## Real Device Session

Read `references/android-real.md` for target inspection and recovery details.

Assume `await ensureRuntimeContext()` already succeeded through the generated bridge.

Set the selected ADB device entry first:

```javascript
setRuntimeAnchor(process.cwd());

var ADB_DEVICE_ID = "192.168.0.109:32833";

setTargetDevice({
  kind: "real",
  udid: ADB_DEVICE_ID,
});
```

Use a deterministic app target:

```javascript
var APP_PACKAGE = "com.example.android";
var APP_ACTIVITY = ".MainActivity";

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
    "appium:appPackage": APP_PACKAGE,
    "appium:appActivity": APP_ACTIVITY,
  },
});

var session = await startFreshSession();
console.log("Session:", session.sessionId);
```

## Running Emulator Session

Read `references/android-emulator.md` for target inspection and recovery details.

Assume `await ensureRuntimeContext()` already succeeded through the generated bridge.

Prefer an explicit running serial:

```javascript
setRuntimeAnchor(process.cwd());

setTargetDevice({
  kind: "emulator",
  serial: "emulator-5554",
});
```

Attach to the running emulator:

```javascript
var APP_PACKAGE = "com.example.android";
var APP_ACTIVITY = ".MainActivity";

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
    "appium:appPackage": APP_PACKAGE,
    "appium:appActivity": APP_ACTIVITY,
  },
});

var session = await startFreshSession();
console.log("Session:", session.sessionId);
```

## Appium-Launched Emulator Session

Assume `await ensureRuntimeContext()` already succeeded through the generated bridge.

```javascript
setRuntimeAnchor(process.cwd());

setTargetDevice({
  kind: "emulator",
  avd: "Pixel_8_API_34",
});

var APP_PACKAGE = "com.example.android";
var APP_ACTIVITY = ".MainActivity";

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
    "appium:appPackage": APP_PACKAGE,
    "appium:appActivity": APP_ACTIVITY,
  },
});

var session = await startFreshSession();
console.log("Session:", session.sessionId);
```

## Relaunch And Reuse

Keep the same session whenever the Android target and installed build are unchanged and `preflight-lite` still proves the session is healthy.

These cells are follow-up recipes after the bridge has already established helper context.

Fresh session cell:

```javascript
await deleteDriverSession();
var session = await startFreshSession();
console.log("Relaunched session:", session.sessionId);
```

Quick app activation cell:

```javascript
var APP_PACKAGE = "com.example.android";

if (!globalThis.__appiumDriver) {
  if (!getWdOpts()) {
    throw new Error("Call setTargetDevice(...) and setWdOpts(...) before starting a fresh session.");
  }
  await startFreshSession();
}
var launchResult = await activateAndVerify(APP_PACKAGE);
```

## Target Switch

Switching targets does not require an Appium server restart by default. Preferred order:

1. Delete the current session.
2. Set the new explicit target with `setTargetDevice(...)`.
3. Update `setWdOpts(...)` for that target.
4. Start a fresh session.

Restart the Appium server before the replacement session only when stale cleanup is failing, the old target disappeared before cleanup completed, or the server ADB state is clearly wedged around the old target.
