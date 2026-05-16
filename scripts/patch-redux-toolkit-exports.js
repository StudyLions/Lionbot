#!/usr/bin/env node
// ============================================================
// AI-GENERATED FILE
// Created: 2026-05-16
// Purpose: Patch @reduxjs/toolkit's package.json#exports map before
//   `next build` so Node's runtime resolver in Vercel's serverless
//   functions returns the CJS entry instead of the ESM .mjs entry.
//
//   Next.js 12.1's outputFileTracing follows the `import` condition
//   (dist/redux-toolkit.modern.mjs) for dependency resolution but does
//   NOT copy that .mjs file into /var/task/node_modules in the
//   serverless bundle. recharts v3 pulls @reduxjs/toolkit as a
//   transitive ESM dep, so every SSR'd /dashboard page 500s with
//   MODULE_NOT_FOUND on redux-toolkit.modern.mjs.
//
//   Rewriting exports to point unconditionally at the CJS index
//   (which IS present in the trace) makes runtime require succeed.
//   No app code uses @reduxjs/toolkit directly — it's only a
//   transitive runtime dep, so swapping ESM for CJS is safe.
//
//   Wired into `build` in package.json so it runs on Vercel (between
//   npm install and next build) and on any local `npm run build`.
//   Idempotent — does nothing if the patch is already applied.
// ============================================================
const fs = require("fs");
const path = require("path");

const TARGET = path.join(
  __dirname,
  "..",
  "node_modules",
  "@reduxjs",
  "toolkit",
  "package.json"
);

const PATCH_MARKER = "__patched_by_patch_redux_toolkit_exports__";

function main() {
  if (!fs.existsSync(TARGET)) {
    console.warn(
      `[patch-redux-toolkit-exports] ${TARGET} not found — skipping ` +
        "(package may not be installed). This is fine in environments " +
        "without recharts."
    );
    return;
  }

  const raw = fs.readFileSync(TARGET, "utf8");
  const pkg = JSON.parse(raw);

  if (pkg[PATCH_MARKER]) {
    console.log("[patch-redux-toolkit-exports] already patched, skipping");
    return;
  }

  pkg.exports = "./dist/cjs/index.js";
  pkg[PATCH_MARKER] = true;

  fs.writeFileSync(TARGET, JSON.stringify(pkg, null, 2) + "\n");
  console.log(
    "[patch-redux-toolkit-exports] rewrote exports to CJS index in " + TARGET
  );
}

main();
