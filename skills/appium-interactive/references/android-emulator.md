# Android Emulators

Read this file when the task targets an Android emulator.

Canonical target and recovery rules live in `SKILL.md` under `Target and Session Rules`. Read `references/session-recipes.md` for the full running-emulator and AVD-launch session recipes. Use this file for emulator-specific inspection and recovery notes.

## Target Inspection Example

- Decide whether the emulator is already running or whether Appium should boot it.
- Use the running serial workflow when you already know which emulator instance should be reused.
- Use `appium:avd` only when you want Appium to launch a named AVD for the session.

## Minimal Target Setup

Running emulator by serial:

```javascript
setTargetDevice({
  kind: "emulator",
  serial: "emulator-5554",
});
```

Launch emulator by AVD:

```javascript
setTargetDevice({
  kind: "emulator",
  avd: "Pixel_8_API_34",
});
```

Continue with the matching recipe in `references/session-recipes.md`.

## Recovery

- Emulator is listed but boot is incomplete: wait for the home screen or boot completion before creating the session.
- Multiple emulators exist and the session attaches to the wrong one: delete the session and reconnect with an explicit serial.
- Emulator is stale or frozen: cold-boot or recreate the emulator, then recreate the Appium session.
- AVD launch is flaky: start the emulator yourself and switch to the explicit serial workflow instead of relying on implicit launch behavior.

## Notes

- Emulator artifacts are useful for repeatability, but they do not prove behavior on real hardware.
- Keep real-device and emulator evidence separate in signoff notes when both are used for the same task.
