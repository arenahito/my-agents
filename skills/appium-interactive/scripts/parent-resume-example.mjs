if (
  typeof globalThis.selectedRuntimeAnchor !== "string" ||
  !globalThis.selectedRuntimeAnchor.trim()
) {
  throw new Error(
    "Set globalThis.selectedRuntimeAnchor from the setup result block before running this lower-level resume step. In js_repl, materialize and import appium-runtime-bridge.mjs, then call startSessionFromResumeInputs()."
  );
}

if (!globalThis.resumeTargetDevice) {
  throw new Error(
    "Set globalThis.resumeTargetDevice from the current task target before running this lower-level resume step. In js_repl, prefer setResumeInputs({ targetDevice, wdOpts }) through appium-runtime-bridge.mjs."
  );
}

if (!globalThis.resumeWdOpts) {
  throw new Error(
    "Set globalThis.resumeWdOpts from the current task session plan before running this lower-level resume step. In js_repl, prefer setResumeInputs({ targetDevice, wdOpts }) through appium-runtime-bridge.mjs."
  );
}

setRuntimeAnchor(globalThis.selectedRuntimeAnchor.trim());

setTargetDevice(globalThis.resumeTargetDevice);
setWdOpts(globalThis.resumeWdOpts);

var session = await startFreshSession();
console.log("Session:", session.sessionId);
