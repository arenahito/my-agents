# Future iOS Extension

Initial scope excludes iOS implementation. This file exists to keep the skill structure extensible without mixing incomplete iOS steps into `SKILL.md`.

## Preserve These Extension Points

- Keep the main workflow phrased around target selection and persistent session reuse rather than Android-only control flow.
- Keep bootstrap bindings generic enough that a future iOS path can reuse `remote`, `driver`, `wdOpts`, and the cleanup helpers.
- Keep Android-specific capability examples in references rather than hard-coding them into every section of `SKILL.md`.

## Future XCUITest Overlay Should Add

- XCUITest driver installation and environment prerequisites
- iOS simulator versus real-device target selection rules
- Device discovery and deterministic UDID selection
- WebDriverAgent-related recovery guidance
- iOS-specific capability examples and app launch patterns
- iOS-specific evidence notes where screenshots, permissions, or device prompts differ from Android

## Boundary Rule

Until iOS support is intentionally implemented, do not present Android instructions as if they are cross-platform. Keep the boundary explicit so the skill stays trustworthy.
