// =============================================================================
// scripts/bundle-renderer.mjs — Bundle @activity/renderer for Edge Functions
// -----------------------------------------------------------------------------
// Supabase Edge Functions run on Deno, which doesn't natively understand our
// pnpm workspace's `@activity/schema` and `@activity/renderer` packages. We
// solve this by bundling the renderer (with schema and katex inlined) into a
// single ESM file that the Edge Function imports via a relative path.
//
// Run:
//   pnpm run bundle:renderer
//   # equivalent to: node scripts/bundle-renderer.mjs
//
// Output:
//   supabase/functions/_shared/renderer.bundle.js
//
// When the renderer or schema changes, re-run this before deploying. CI
// should run it automatically on every push so deploys never use a stale
// bundle.
// =============================================================================

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const entryPoint = resolve(root, 'packages/renderer/src/index.ts');
const outFile = resolve(root, 'supabase/functions/_shared/renderer.bundle.js');

await mkdir(dirname(outFile), { recursive: true });

const result = await build({
  entryPoints: [entryPoint],
  bundle: true,
  format: 'esm',
  // We target ES2022, which Deno supports natively. The renderer is pure
  // (no DOM access), so neither 'browser' nor 'node' platform is strictly
  // correct — 'neutral' is the right choice for Deno.
  platform: 'neutral',
  target: 'es2022',
  // Deno doesn't like `.js` extensions when resolving local modules in some
  // contexts; the bundle is a single file so this doesn't matter for output.
  outfile: outFile,
  sourcemap: 'inline',
  // Bundle EVERYTHING. No externals — the Edge Function should not depend on
  // any package that isn't in this bundle. KaTeX comes along for the ride.
  external: [],
  // Mainfields tells esbuild which package.json field to use for entry
  // resolution. Important for KaTeX which ships multiple builds.
  mainFields: ['module', 'main'],
  // KaTeX uses some Node-specific globals (Buffer, process) in error paths
  // we don't hit. Define them as undefined to avoid runtime errors if the
  // dead-code-elimination misses them.
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  // Don't minify — keeps stack traces readable in the Edge Function logs.
  // The bundle is loaded once per function instance; size matters less than
  // debuggability.
  minify: false,
  metafile: true,
  logLevel: 'info',
});

// Print a quick summary so the build script gives useful feedback.
const totalBytes = Object.values(result.metafile.outputs).reduce(
  (sum, o) => sum + o.bytes,
  0,
);
console.log('');
console.log(`Bundle: ${outFile}`);
console.log(`Size:   ${(totalBytes / 1024).toFixed(1)} KiB`);
console.log('');
console.log('Re-run after any change to packages/schema or packages/renderer.');
