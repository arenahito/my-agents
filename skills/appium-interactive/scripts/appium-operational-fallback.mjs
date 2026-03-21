const APPIUM_DRIVER_KEY = "__appiumDriver";
const APPIUM_STATE_KEY = "__appiumState";
const APPIUM_RUNTIME_ANCHOR_KEY = "__appiumRuntimeAnchor";
const OPERATIONAL_RUNTIME_CONFIG_KEY = "__appiumOperationalRuntimeConfig";

var remote;

var normalizeRuntimeAnchor = function (anchorPath) {
  return String(anchorPath).replace(/\\/g, "/").replace(/\/+$/, "");
};

var validateTargetDevice = function (nextTargetDevice) {
  if (!nextTargetDevice || typeof nextTargetDevice !== "object") {
    throw new Error(
      'Invalid target device. Allowed shapes: { kind: "real", udid: "..." }, { kind: "emulator", serial: "..." }, or { kind: "emulator", avd: "..." }.'
    );
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

  throw new Error(
    'Invalid target device shape. Allowed shapes: { kind: "real", udid: "..." }, { kind: "emulator", serial: "..." }, or { kind: "emulator", avd: "..." }.'
  );
};

var getOperationalRuntimeConfig = function () {
  return globalThis[OPERATIONAL_RUNTIME_CONFIG_KEY];
};

var ensureOperationalRuntimeConfig = function () {
  var runtimeConfig = getOperationalRuntimeConfig();
  if (!runtimeConfig || !runtimeConfig.runtimeAnchor) {
    throw new Error(
      "Operational fallback runtime is unset. Call ensureOperationalRuntime({ runtimeAnchor }) first."
    );
  }
  return runtimeConfig;
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

export async function ensureOperationalRuntime(options) {
  if (!options || typeof options !== "object") {
    throw new Error(
      "Call ensureOperationalRuntime({ runtimeAnchor }) before using the operational fallback."
    );
  }

  if (typeof options.runtimeAnchor !== "string" || !options.runtimeAnchor.trim()) {
    throw new Error(
      "ensureOperationalRuntime({ runtimeAnchor }) requires a runtimeAnchor string."
    );
  }

  var runtimeAnchor = options.runtimeAnchor.trim();
  var moduleApi = await import("node:module");
  var pathApi = await import("node:path");
  var requireFromRuntimeAnchor = moduleApi.createRequire(
    pathApi.join(runtimeAnchor, "__appium-operational-fallback__.mjs")
  );
  ({ remote } = requireFromRuntimeAnchor("webdriverio"));

  globalThis[OPERATIONAL_RUNTIME_CONFIG_KEY] = {
    runtimeAnchor,
  };
  globalThis[APPIUM_RUNTIME_ANCHOR_KEY] = runtimeAnchor;

  return {
    runtimeAnchor,
    loadStrategy: "runtime-anchor createRequire",
  };
}

export function setOperationalInputs(options) {
  ensureOperationalRuntimeConfig();

  if (!options || typeof options !== "object") {
    throw new Error(
      "Call setOperationalInputs({ targetDevice, wdOpts }) before starting the operational fallback session."
    );
  }

  if (!options.targetDevice || typeof options.targetDevice !== "object") {
    throw new Error(
      "setOperationalInputs(...) requires a targetDevice object."
    );
  }

  if (!options.wdOpts || typeof options.wdOpts !== "object") {
    throw new Error("setOperationalInputs(...) requires a wdOpts object.");
  }

  var state = getAppiumState();
  state.targetDevice = validateTargetDevice(options.targetDevice);
  state.wdOpts = options.wdOpts;
  globalThis.selectedRuntimeAnchor = globalThis[APPIUM_RUNTIME_ANCHOR_KEY];
  globalThis.resumeTargetDevice = state.targetDevice;
  globalThis.resumeWdOpts = state.wdOpts;

  return {
    runtimeAnchor: globalThis[APPIUM_RUNTIME_ANCHOR_KEY],
    targetDevice: state.targetDevice,
    wdOpts: state.wdOpts,
  };
}

export async function runOperationalPreflight() {
  var issues = [];
  var runtimeConfig = ensureOperationalRuntimeConfig();
  var state = getAppiumState();
  var session = globalThis[APPIUM_DRIVER_KEY];
  var currentPackage;
  var currentActivity;

  if (!runtimeConfig.runtimeAnchor) {
    issues.push("runtime anchor");
  }

  if (!state.targetDevice) {
    issues.push("target device");
  }

  if (!state.wdOpts) {
    issues.push("wdOpts");
  }

  if (!session) {
    issues.push("session");
  }

  if (issues.length > 0) {
    return {
      ok: false,
      status: `missing or unhealthy: ${issues.join(", ")}`,
    };
  }

  try {
    currentPackage = await session.getCurrentPackage();
  } catch (error) {}

  try {
    currentActivity = await session.getCurrentActivity();
  } catch (error) {}

  if (!currentPackage && !currentActivity) {
    return {
      ok: false,
      status: "missing or unhealthy: cheap probe",
    };
  }

  return {
    ok: true,
    currentPackage,
    currentActivity,
  };
}

export async function startOperationalSession() {
  ensureOperationalRuntimeConfig();

  var state = getAppiumState();
  if (!remote) {
    throw new Error(
      "Operational fallback runtime is missing webdriverio. Call ensureOperationalRuntime(...) first."
    );
  }

  if (!state.wdOpts) {
    throw new Error(
      "Call setOperationalInputs({ targetDevice, wdOpts }) before startOperationalSession()."
    );
  }

  if (globalThis[APPIUM_DRIVER_KEY]) {
    throw new Error(
      "An Appium session is already active. Reuse it or perform an explicit verified cleanup before starting another operational fallback session."
    );
  }

  globalThis[APPIUM_DRIVER_KEY] = await remote({
    automationProtocol: "webdriver",
    injectGlobals: false,
    ...state.wdOpts,
  });

  return globalThis[APPIUM_DRIVER_KEY];
}

export function getDriver() {
  var session = globalThis[APPIUM_DRIVER_KEY];
  if (!session) {
    throw new Error("No active Appium session");
  }
  return session;
}
