// =============================================================================
// scripts/bundle-renderer.mjs — Build the runtime, then bundle @activity/renderer
// -----------------------------------------------------------------------------
// Two builds, in order, in one script:
//
//   1. RUNTIME BUILD. Bundles packages/renderer/src/runtime/index.ts into a
//      single minified IIFE — the JavaScript that runs in students' browsers
//      on every published activity page. The bundled text is written into a
//      generated TypeScript module (runtime/generated/runtime-bundle.ts) that
//      exports it as a string constant. An external source map is written to
//      packages/renderer/dist/ as a dev/debug artifact (gitignored, never
//      shipped — debugging a runtime bug means reproducing against the local
//      unminified build).
//
//   2. RENDERER BUNDLE. Bundles packages/renderer/src/index.ts into a single
//      ESM file for the Supabase Edge Functions. This is the pre-existing
//      build, unchanged in behavior. It bundles document.ts, which imports the
//      generated module from step 1 — so step 1 MUST complete first. That
//      ordering is the whole reason these two builds live in one script.
//
// The runtime OUTPUT is inlined into published HTML by document.ts; there is
// no separate runtime.js shipped, and publish-activity is untouched. (See
// RUNTIME.md "Build pipeline".)
//
// Run:
//   pnpm run bundle:renderer
//   # equivalent to: node scripts/bundle-renderer.mjs
//
// Output:
//   packages/renderer/src/runtime/generated/runtime-bundle.ts  (committed)
//   packages/renderer/dist/runtime.js.map                      (gitignored)
//   supabase/functions/_shared/renderer.bundle.js              (committed)
//
// When the renderer, schema, or runtime changes, re-run this before deploying.
// CI should run it automatically on every push so deploys never use a stale
// bundle.
// =============================================================================

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Runtime size budget (RUNTIME.md / STATE.md standing constraint). The runtime
// is student-facing and loads on school Chromebooks over slow Wi-Fi.
const RUNTIME_SIZE_TARGET = 20 * 1024; // soft target — warn past this
const RUNTIME_SIZE_CEILING = 40 * 1024; // hard ceiling — fail past this

// -----------------------------------------------------------------------------
// Step 1 — Runtime build
// -----------------------------------------------------------------------------
// Entry: runtime/index.ts. Output: a minified IIFE string, plus an external
// source map written to dist/. `write: false` keeps the JS in memory (we need
// it as a string for the generated module); esbuild still returns the map in
// `outputFiles`, which we write to disk ourselves.

const runtimeEntry = resolve(root, 'packages/renderer/src/runtime/index.ts');
const generatedModulePath = resolve(
  root,
  'packages/renderer/src/runtime/generated/runtime-bundle.ts',
);
const sourceMapPath = resolve(root, 'packages/renderer/dist/runtime.js.map');

await mkdir(dirname(generatedModulePath), { recursive: true });
await mkdir(dirname(sourceMapPath), { recursive: true });

const runtimeResult = await build({
  entryPoints: [runtimeEntry],
  bundle: true,
  // IIFE, not ESM: the output is inlined into a plain <script> tag by
  // document.ts. An ESM bundle could not be inlined that way. (The renderer
  // bundle below is ESM — different consumer, Deno Edge Functions.)
  format: 'iife',
  platform: 'browser',
  // chrome90 covers school-issued Chromebooks per ChromeOS support window,
  // and Firefox 88+ / Safari 14+ / Edge 90+ (RUNTIME.md browser support).
  target: 'chrome90',
  minify: true,
  // External source map. esbuild returns it in outputFiles (write:false); we
  // write only the map to disk. Dev/debug artifact — gitignored, not shipped.
  sourcemap: 'external',
  write: false,
  outdir: resolve(root, 'packages/renderer/dist'),
  metafile: true,
  logLevel: 'info',
});

// outputFiles holds both the JS and the .map. Separate them by extension.
let runtimeJsText = '';
let runtimeMapText = '';
for (const file of runtimeResult.outputFiles) {
  if (file.path.endsWith('.map')) runtimeMapText = file.text;
  else runtimeJsText = file.text;
}

if (!runtimeJsText) {
  throw new Error('Runtime build produced no JS output — aborting.');
}

// Write the source map to disk (dev artifact). The JS stays in memory.
if (runtimeMapText) {
  await writeFile(sourceMapPath, runtimeMapText, 'utf8');
}

// Size budget check against the standing constraint.
const runtimeBytes = Buffer.byteLength(runtimeJsText, 'utf8');
if (runtimeBytes > RUNTIME_SIZE_CEILING) {
  throw new Error(
    `Runtime bundle is ${(runtimeBytes / 1024).toFixed(1)} KiB — over the ` +
      `${RUNTIME_SIZE_CEILING / 1024} KiB hard ceiling. Aborting.`,
  );
}

// -----------------------------------------------------------------------------
// Step 2 — Write the generated string module
// -----------------------------------------------------------------------------
// document.ts imports `runtimeJs` from this file and inlines it into the
// published HTML. The renderer must stay pure (no I/O — it runs in Edge
// Functions), so the runtime text is baked in at build time as a TS string
// literal rather than read from disk at render time.
//
// JSON.stringify produces a correctly-escaped double-quoted string literal
// (backslashes, quotes, newlines all handled). The </script replace is
// defense-in-depth for the eventual HTML embedding — minified JS realistically
// never contains that sequence, but document.ts applies the same guard to its
// config blob, so the runtime string matches that discipline.

const escapedRuntime = JSON.stringify(runtimeJsText).replace(
  /<\/script/gi,
  '<\\/script',
);

const generatedModule =
  '// =============================================================================\n' +
  '// runtime/generated/runtime-bundle.ts — GENERATED FILE, DO NOT EDIT\n' +
  '// -----------------------------------------------------------------------------\n' +
  '// Produced by scripts/bundle-renderer.mjs from packages/renderer/src/runtime/.\n' +
  '// Re-run `pnpm run bundle:renderer` after any change to the runtime source.\n' +
  '// Committed to git so a clean checkout can typecheck/build the renderer\n' +
  '// without first running the bundler (consistent with renderer.bundle.js).\n' +
  '// =============================================================================\n' +
  '\n' +
  '/** Minified runtime IIFE, inlined into published HTML by document.ts. */\n' +
  'export const runtimeJs = ' +
  escapedRuntime +
  ';\n';

await writeFile(generatedModulePath, generatedModule, 'utf8');

// -----------------------------------------------------------------------------
// Step 3 — Renderer bundle (pre-existing build, unchanged)
// -----------------------------------------------------------------------------
// Bundles the renderer (with schema and katex inlined) into a single ESM file
// the Edge Functions import via a relative path. This bundles document.ts,
// which imports the generated module written in step 2 — hence the ordering.

const rendererEntry = resolve(root, 'packages/renderer/src/index.ts');
const rendererOutFile = resolve(
  root,
  'supabase/functions/_shared/renderer.bundle.js',
);

await mkdir(dirname(rendererOutFile), { recursive: true });

const rendererResult = await build({
  entryPoints: [rendererEntry],
  bundle: true,
  format: 'esm',
  // ES2022, which Deno supports natively. The renderer is pure (no DOM), so
  // neither 'browser' nor 'node' is strictly correct — 'neutral' fits Deno.
  platform: 'neutral',
  target: 'es2022',
  outfile: rendererOutFile,
  sourcemap: 'inline',
  // Bundle EVERYTHING. No externals — the Edge Function should not depend on
  // any package outside this bundle. KaTeX comes along for the ride.
  external: [],
  // mainFields tells esbuild which package.json field to use for entry
  // resolution. Important for KaTeX, which ships multiple builds.
  mainFields: ['module', 'main'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  // Don't minify — keeps stack traces readable in Edge Function logs. The
  // bundle loads once per function instance; size matters less than debug.
  minify: false,
  metafile: true,
  logLevel: 'info',
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------

const rendererBytes = Object.values(rendererResult.metafile.outputs).reduce(
  (sum, o) => sum + o.bytes,
  0,
);

console.log('');
console.log('Runtime:  ' + generatedModulePath);
console.log(
  '          ' +
    (runtimeBytes / 1024).toFixed(1) +
    ' KiB minified' +
    (runtimeBytes > RUNTIME_SIZE_TARGET
      ? '  (!) over ' + RUNTIME_SIZE_TARGET / 1024 + ' KiB soft target'
      : '  (within ' + RUNTIME_SIZE_TARGET / 1024 + ' KiB target)'),
);
console.log('Renderer: ' + rendererOutFile);
console.log('          ' + (rendererBytes / 1024).toFixed(1) + ' KiB');
console.log('');
console.log('Re-run after any change to packages/schema, renderer, or runtime.');
