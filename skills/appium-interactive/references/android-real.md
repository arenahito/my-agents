# Android Real Devices

Read this file when the task targets a physical Android device.

Canonical target and recovery rules live in `SKILL.md` under `Target and Session Rules`. Read `references/session-recipes.md` for the full real-device session recipe. Use this file for target inspection and real-device-specific recovery notes.

## Target Inspection Example

If multiple device entries appear, use this inspection procedure before setting `TARGET_DEVICE.udid`:

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

Treat `appium:deviceName` as descriptive metadata only. Mirror the chosen ADB device entry there if you want consistent logs, but do not rely on it for target selection.

## Minimal Target Setup

Use the shared helpers from `scripts/bootstrap-helpers.mjs`, then set the chosen real-device target:

```javascript
setTargetDevice({
  kind: "real",
  udid: "192.168.0.109:32833",
});
```

Continue with the real-device session recipe in `references/session-recipes.md`.

## Recovery

- `device unauthorized`: unlock the device, accept the USB debugging prompt, reconnect the cable, rerun `adb devices`, then recreate the Appium session.
- Device disappears from `adb devices`: replug USB, confirm developer options stay enabled, and do not reuse the stale Appium session.
- Wrong device chosen: delete the session, set the correct `udid`, and reconnect. Never swap the serial under an existing live session handle.

## Notes

- Real-device screenshots and timing can differ from emulators. Record that the artifact came from a real device in your QA evidence.
- If the app depends on device-specific state such as biometrics, notifications, or hardware permissions, keep that expectation in the QA inventory before signoff.
