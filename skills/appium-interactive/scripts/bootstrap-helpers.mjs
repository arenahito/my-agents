var remote;
var ANDROID_BASE_CAPS;
var APPIUM_DRIVER_KEY;
var APPIUM_STATE_KEY;
var APPIUM_RUNTIME_ANCHOR_KEY;
var APPIUM_BRIDGE_CONFIG_KEY;
var APPIUM_RUNTIME_CONFIG_KEY;
var ALLOWED_TARGET_SHAPES_TEXT;
var getBridgeConfig;
var getRuntimeConfig;
var setRuntimeConfig;

APPIUM_BRIDGE_CONFIG_KEY = "__appiumBridgeConfig";
APPIUM_RUNTIME_CONFIG_KEY = "__appiumRuntimeConfig";

getBridgeConfig = function () {
  return globalThis[APPIUM_BRIDGE_CONFIG_KEY];
};

getRuntimeConfig = function () {
  return globalThis[APPIUM_RUNTIME_CONFIG_KEY];
};

setRuntimeConfig = function (nextRuntimeConfig) {
  if (!nextRuntimeConfig || typeof nextRuntimeConfig !== "object") {
    throw new Error(
      "Runtime bridge config is invalid. Materialize and import appium-runtime-bridge.mjs before loading Appium helpers."
    );
  }
  globalThis[APPIUM_RUNTIME_CONFIG_KEY] = nextRuntimeConfig;
  return globalThis[APPIUM_RUNTIME_CONFIG_KEY];
};

try {
  var bridgeConfig = getBridgeConfig();
  if (
    !bridgeConfig ||
    typeof bridgeConfig.runtimeAnchor !== "string" ||
    !bridgeConfig.runtimeAnchor ||
    typeof bridgeConfig.webdriverioModuleUrl !== "string" ||
    !bridgeConfig.webdriverioModuleUrl
  ) {
    throw new Error(
      "Runtime bridge config is missing runtimeAnchor or webdriverioModuleUrl. Materialize and import appium-runtime-bridge.mjs before loading Appium helpers."
    );
  }
  var moduleApi = await import("node:module");
  var pathApi = await import("node:path");
  var requireFromRuntimeAnchor = moduleApi.createRequire(
    pathApi.join(bridgeConfig.runtimeAnchor, "__appium-runtime-bridge-loader__.mjs")
  );
  ({ remote } = requireFromRuntimeAnchor("webdriverio"));
  setRuntimeConfig({
    runtimeAnchor: bridgeConfig.runtimeAnchor,
    webdriverioModuleUrl: bridgeConfig.webdriverioModuleUrl,
    bridgeVersion: bridgeConfig.bridgeVersion,
  });
  console.log("WebdriverIO loaded");
} catch (error) {
  throw new Error(
    `Could not load webdriverio through the runtime bridge config. Materialize and import appium-runtime-bridge.mjs for the selected runtime anchor before loading helpers. Original error: ${error}`
  );
}

APPIUM_DRIVER_KEY = "__appiumDriver";
APPIUM_STATE_KEY = "__appiumState";
APPIUM_RUNTIME_ANCHOR_KEY = "__appiumRuntimeAnchor";
ALLOWED_TARGET_SHAPES_TEXT =
  'Allowed shapes: { kind: "real", udid: "..." }, { kind: "emulator", serial: "..." }, or { kind: "emulator", avd: "..." }.';

var normalizeRuntimeAnchor = function (anchorPath) {
  return String(anchorPath).replace(/\\/g, "/").replace(/\/+$/, "");
};

var getRuntimeAnchor = function () {
  return globalThis[APPIUM_RUNTIME_ANCHOR_KEY];
};

var setRuntimeAnchor = function (anchorPath) {
  if (typeof anchorPath !== "string" || !anchorPath.trim()) {
    throw new Error(
      "Call setRuntimeAnchor(...) with the selected runtime anchor before using Appium helpers."
    );
  }
  globalThis[APPIUM_RUNTIME_ANCHOR_KEY] = anchorPath.trim();
  return globalThis[APPIUM_RUNTIME_ANCHOR_KEY];
};

var ensureRuntimeAnchor = function () {
  var runtimeAnchor = getRuntimeAnchor();
  if (!runtimeAnchor) {
    throw new Error(
      "Selected runtime anchor is unset. Call setRuntimeAnchor(...) through the runtime bridge before using Appium helpers."
    );
  }

  var runtimeConfig = getRuntimeConfig();
  if (!runtimeConfig || !runtimeConfig.runtimeAnchor) {
    throw new Error(
      "Runtime bridge context is unset. Call await ensureRuntimeContext() before using Appium helpers."
    );
  }

  var normalizedAnchor = normalizeRuntimeAnchor(runtimeAnchor);
  var normalizedConfiguredAnchor = normalizeRuntimeAnchor(
    runtimeConfig.runtimeAnchor
  );

  if (normalizedAnchor !== normalizedConfiguredAnchor) {
    throw new Error(
      `Selected runtime anchor does not match the bridge runtime context. runtimeAnchor=${runtimeAnchor} configuredRuntimeAnchor=${runtimeConfig.runtimeAnchor}. Re-run ensureRuntimeContext() before using Appium helpers.`
    );
  }

  return runtimeAnchor;
};

var validateTargetDevice = function (nextTargetDevice) {
  if (!nextTargetDevice || typeof nextTargetDevice !== "object") {
    throw new Error(`Invalid target device. ${ALLOWED_TARGET_SHAPES_TEXT}`);
  }

  if (
    nextTargetDevice.kind === "real" &&
    typeof nextTargetDevice.udid === "string" &&
    nextTargetDevice.udid.trim() &&
    nextTargetDevice.serial === undefined &&
    nextTargetDevice.avd === undefined
  ) {
    return {
      kind: "real",
      udid: nextTargetDevice.udid.trim(),
    };
  }

  if (
    nextTargetDevice.kind === "emulator" &&
    typeof nextTargetDevice.serial === "string" &&
    nextTargetDevice.serial.trim() &&
    nextTargetDevice.udid === undefined &&
    nextTargetDevice.avd === undefined
  ) {
    return {
      kind: "emulator",
      serial: nextTargetDevice.serial.trim(),
    };
  }

  if (
    nextTargetDevice.kind === "emulator" &&
    typeof nextTargetDevice.avd === "string" &&
    nextTargetDevice.avd.trim() &&
    nextTargetDevice.udid === undefined &&
    nextTargetDevice.serial === undefined
  ) {
    return {
      kind: "emulator",
      avd: nextTargetDevice.avd.trim(),
    };
  }

  throw new Error(`Invalid target device shape. ${ALLOWED_TARGET_SHAPES_TEXT}`);
};

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
  state.targetDevice = validateTargetDevice(nextTargetDevice);
  return state.targetDevice;
};

var getTargetDevice = function () {
  return getAppiumState().targetDevice;
};

var setWdOpts = function (nextWdOpts) {
  ensureRuntimeAnchor();
  var state = getAppiumState();
  state.wdOpts = nextWdOpts;
  return state.wdOpts;
};

var getWdOpts = function () {
  return getAppiumState().wdOpts;
};

var getDriver = function () {
  ensureRuntimeAnchor();
  var session = globalThis[APPIUM_DRIVER_KEY];
  if (!session) throw new Error("No active Appium session");
  return session;
};

var deleteDriverSession = async function () {
  ensureRuntimeAnchor();
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
  ensureRuntimeAnchor();
  var bufferModule = await import("node:buffer");
  var session = getDriver();
  await codex.emitImage({
    bytes: bufferModule.Buffer.from(await session.takeScreenshot(), "base64"),
    mimeType: "image/png",
  });
};

var printCurrentPageSource = async function () {
  ensureRuntimeAnchor();
  var session = getDriver();
  var source = await session.getPageSource();
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
  ensureRuntimeAnchor();
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

Object.assign(globalThis, {
  ANDROID_BASE_CAPS,
  getRuntimeAnchor,
  setRuntimeAnchor,
  setTargetDevice,
  getTargetDevice,
  setWdOpts,
  getWdOpts,
  getDriver,
  deleteDriverSession,
  emitCurrentScreenshot,
  printCurrentPageSource,
  logForegroundApp,
  ensureForegroundApp,
  activateAndVerify,
  startFreshSession,
});
