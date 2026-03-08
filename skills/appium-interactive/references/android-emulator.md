# Android Emulators

Read this file when the task targets an Android emulator.

## Target Selection

- Decide whether the emulator is already running or whether Appium should boot it.
- If multiple emulators are running, do not guess. Pick one running serial explicitly and copy it into `TARGET_DEVICE.serial`.
- Use `appium:avd` only when you want Appium to launch a named AVD for the session.

## Capability Patterns

Running emulator by serial:

```javascript
TARGET_DEVICE = {
  kind: "emulator",
  serial: "emulator-5554",
};

wdOpts = {
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  logLevel: "info",
  capabilities: {
    ...ANDROID_BASE_CAPS,
    "appium:udid": TARGET_DEVICE.serial,
    "appium:deviceName": TARGET_DEVICE.serial,
    "appium:appPackage": "com.android.settings",
    "appium:appActivity": ".Settings",
  },
};
```

Launch emulator by AVD:

```javascript
TARGET_DEVICE = {
  kind: "emulator",
  avd: "Pixel_8_API_34",
};

wdOpts = {
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  logLevel: "info",
  capabilities: {
    ...ANDROID_BASE_CAPS,
    "appium:avd": TARGET_DEVICE.avd,
    "appium:deviceName": TARGET_DEVICE.avd,
    "appium:appPackage": "com.android.settings",
    "appium:appActivity": ".Settings",
  },
};
```

## Recovery

- Emulator is listed but boot is incomplete: wait for the home screen or boot completion before creating the session.
- Multiple emulators exist and the session attaches to the wrong one: delete the session and reconnect with an explicit serial.
- Emulator is stale or frozen: cold-boot or recreate the emulator, then recreate the Appium session.
- AVD launch is flaky: start the emulator yourself and switch to the explicit serial workflow instead of relying on implicit launch behavior.

## Notes

- Emulator artifacts are useful for repeatability, but they do not prove behavior on real hardware.
- Keep real-device and emulator evidence separate in signoff notes when both are used for the same task.
