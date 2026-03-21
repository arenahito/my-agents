#!/usr/bin/env node

import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const BRIDGE_VERSION = "appium-runtime-bridge-v2";

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error(
    "Usage: node materialize-runtime-bridge.mjs <selected-runtime-anchor>"
  );
  process.exit(1);
}

const selectedRuntimeAnchor = path.resolve(args[0]);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(scriptDir, "appium-runtime-bridge-template.mjs");
const helpersPath = path.join(scriptDir, "bootstrap-helpers.mjs");
const resumeExamplePath = path.join(scriptDir, "parent-resume-example.mjs");
const bridgePath = path.join(selectedRuntimeAnchor, "appium-runtime-bridge.mjs");
const resolverPath = path.join(
  selectedRuntimeAnchor,
  "__appium-runtime-bridge-resolver__.mjs"
);

await fs.mkdir(selectedRuntimeAnchor, { recursive: true });

const requireFromRuntimeAnchor = createRequire(resolverPath);

let webdriverioModulePath;
let webdriverioImportPath;

try {
  webdriverioModulePath = requireFromRuntimeAnchor.resolve("webdriverio");
} catch (error) {
  console.error(
    `Could not resolve webdriverio from the selected runtime anchor: ${selectedRuntimeAnchor}. Install it there before materializing the runtime bridge. Original error: ${error.message}`
  );
  process.exit(1);
}

try {
  const webdriverioPackageRoot = path.dirname(path.dirname(webdriverioModulePath));
  const webdriverioPackageJsonPath = path.join(
    webdriverioPackageRoot,
    "package.json"
  );
  const webdriverioPackageJson = JSON.parse(
    await fs.readFile(webdriverioPackageJsonPath, "utf8")
  );
  const importEntry =
    webdriverioPackageJson?.exports?.["."]?.import ??
    webdriverioPackageJson?.module ??
    webdriverioPackageJson?.main;

  webdriverioImportPath = importEntry
    ? path.resolve(webdriverioPackageRoot, importEntry)
    : webdriverioModulePath;
} catch (error) {
  webdriverioImportPath = webdriverioModulePath;
}

let template = await fs.readFile(templatePath, "utf8");

const replacements = [
  ["__APP_INT_BRIDGE_VERSION__", BRIDGE_VERSION],
  ["__APP_INT_RUNTIME_ANCHOR__", selectedRuntimeAnchor.replace(/\\/g, "/")],
  ["__APP_INT_HELPERS_URL__", pathToFileURL(helpersPath).href],
  ["__APP_INT_RESUME_EXAMPLE_URL__", pathToFileURL(resumeExamplePath).href],
  [
    "__APP_INT_WEBDRIVERIO_MODULE_URL__",
    pathToFileURL(webdriverioImportPath).href,
  ],
];

for (const [token, value] of replacements) {
  template = template.replaceAll(token, value);
}

await fs.writeFile(bridgePath, template, "utf8");

console.log(
  JSON.stringify(
    {
      bridgeVersion: BRIDGE_VERSION,
      bridgePath,
      runtimeAnchor: selectedRuntimeAnchor,
      webdriverioModuleUrl: pathToFileURL(webdriverioImportPath).href,
    },
    null,
    2
  )
);
