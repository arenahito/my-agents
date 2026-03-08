# Android Real Devices

Read this file when the task targets a physical Android device.

## Target Selection

- Run `adb devices` before creating the Appium session.
- If more than one Android target is listed, do not guess. Pick the exact ADB device entry you want to use and copy that entry into `TARGET_DEVICE.udid`.
- Use `ro.serialno` only to prove whether multiple ADB entries point to the same physical phone. Deterministic selection comes from the chosen ADB device entry in `appium:udid`.
- Treat `appium:deviceName` as descriptive metadata only. Mirror the chosen ADB device entry there if you want consistent logs, but do not rely on it for target selection.

If multiple device entries appear, use this standard procedure before choosing `TARGET_DEVICE.udid`:

1. Record each `adb devices` entry exactly as shown.
2. Run `adb -s "<entry>" shell getprop ro.serialno` for each entry.
3. Run `adb -s "<entry>" shell getprop ro.product.model` for each entry.
4. If two entries report the same `ro.serialno`, treat them as the same physical device exposed through different transports and choose the entry you intend to keep using.
5. If the entries report different serial numbers, stop and choose the specific physical device intentionally before creating the session.

Example:

```text
adb devices
adb -s "192.168.0.109:32833" shell getprop ro.serialno
adb -s "192.168.0.109:32833" shell getprop ro.product.model
adb -s "adb-57261FDCH0006N._adb-tls-connect._tcp" shell getprop ro.serialno
adb -s "adb-57261FDCH0006N._adb-tls-connect._tcp" shell getprop ro.product.model
```

## Capability Pattern

Use the shared `ANDROID_BASE_CAPS` from `SKILL.md`, then add:

```javascript
TARGET_DEVICE = {
  kind: "real",
  udid: "192.168.0.109:32833",
};

wdOpts = {
  automationProtocol: "webdriver",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  logLevel: "info",
  injectGlobals: false,
  capabilities: {
    ...ANDROID_BASE_CAPS,
    "appium:udid": TARGET_DEVICE.udid,
    "appium:deviceName": TARGET_DEVICE.udid,
    "appium:appPackage": "com.android.settings",
    "appium:appActivity": ".Settings",
  },
};
```

Replace the app target with project-specific values when needed.

## Recovery

- `device unauthorized`: unlock the device, accept the USB debugging prompt, reconnect the cable, rerun `adb devices`, then recreate the Appium session.
- Device disappears from `adb devices`: replug USB, confirm developer options stay enabled, and do not reuse the stale Appium session.
- Wrong device chosen: delete the session, set the correct `udid`, and reconnect. Never swap the serial under an existing live session handle.

## Notes

- Real-device screenshots and timing can differ from emulators. Record that the artifact came from a real device in your QA evidence.
- If the app depends on device-specific state such as biometrics, notifications, or hardware permissions, keep that expectation in the QA inventory before signoff.
