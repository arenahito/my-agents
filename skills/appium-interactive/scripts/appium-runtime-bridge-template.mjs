export const BRIDGE_VERSION = "__APP_INT_BRIDGE_VERSION__";

const RUNTIME_ANCHOR = "__APP_INT_RUNTIME_ANCHOR__";
const HELPERS_URL = "__APP_INT_HELPERS_URL__";
const RESUME_EXAMPLE_URL = "__APP_INT_RESUME_EXAMPLE_URL__";
const WEBDRIVERIO_MODULE_URL = "__APP_INT_WEBDRIVERIO_MODULE_URL__";
const BRIDGE_CONFIG_KEY = "__appiumBridgeConfig";
const RUNTIME_CONFIG_KEY = "__appiumRuntimeConfig";

var normalizePath = function (value) {
  return String(value).replace(/\\/g, "/").replace(/\/+$/, "");
};

var getBridgeConfig = function () {
  return {
    bridgeVersion: BRIDGE_VERSION,
    runtimeAnchor: RUNTIME_ANCHOR,
    webdriverioModuleUrl: WEBDRIVERIO_MODULE_URL,
  };
};

export async function ensureRuntimeContext() {
  globalThis[BRIDGE_CONFIG_KEY] = getBridgeConfig();

  await import(HELPERS_URL);
  setRuntimeAnchor(RUNTIME_ANCHOR);
  globalThis[RUNTIME_CONFIG_KEY] = {
    bridgeVersion: BRIDGE_VERSION,
    runtimeAnchor: RUNTIME_ANCHOR,
    webdriverioModuleUrl: WEBDRIVERIO_MODULE_URL,
  };

  return {
    bridgeVersion: BRIDGE_VERSION,
    runtimeAnchor: RUNTIME_ANCHOR,
    webdriverioModuleUrl: WEBDRIVERIO_MODULE_URL,
  };
}

export function setResumeInputs(options) {
  if (!options || typeof options !== "object") {
    throw new Error(
      "Call setResumeInputs({ targetDevice, wdOpts }) before starting a session through the runtime bridge."
    );
  }

  if (!options.targetDevice || typeof options.targetDevice !== "object") {
    throw new Error(
      "setResumeInputs(...) requires a targetDevice object."
    );
  }

  if (!options.wdOpts || typeof options.wdOpts !== "object") {
    throw new Error("setResumeInputs(...) requires a wdOpts object.");
  }

  globalThis.selectedRuntimeAnchor = RUNTIME_ANCHOR;
  globalThis.resumeTargetDevice = options.targetDevice;
  globalThis.resumeWdOpts = options.wdOpts;

  if (typeof setTargetDevice === "function") {
    setTargetDevice(options.targetDevice);
  }

  if (typeof setWdOpts === "function") {
    setWdOpts(options.wdOpts);
  }

  return {
    selectedRuntimeAnchor: globalThis.selectedRuntimeAnchor,
    resumeTargetDevice: globalThis.resumeTargetDevice,
    resumeWdOpts: globalThis.resumeWdOpts,
  };
}

export async function runPreflightLite() {
  await ensureRuntimeContext();

  var issues = [];
  var session = globalThis.__appiumDriver;
  var currentPackage;
  var currentActivity;

  if (!session) {
    issues.push("session");
  }

  if (
    typeof getRuntimeAnchor !== "function" ||
    normalizePath(getRuntimeAnchor()) !== normalizePath(RUNTIME_ANCHOR)
  ) {
    issues.push("runtime anchor");
  }

  if (typeof getTargetDevice !== "function" || !getTargetDevice()) {
    issues.push("target device");
  }

  if (typeof getWdOpts !== "function" || !getWdOpts()) {
    issues.push("wdOpts");
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

export async function startSessionFromResumeInputs() {
  await ensureRuntimeContext();

  if (!globalThis.resumeTargetDevice || !globalThis.resumeWdOpts) {
    throw new Error(
      "Call setResumeInputs({ targetDevice, wdOpts }) before startSessionFromResumeInputs()."
    );
  }

  globalThis.selectedRuntimeAnchor = RUNTIME_ANCHOR;
  await import(RESUME_EXAMPLE_URL);
  return globalThis.__appiumDriver;
}

export function getDriver() {
  return globalThis.__appiumDriver;
}
