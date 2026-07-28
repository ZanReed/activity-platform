// =============================================================================
// scripts/bundle-viewer-server.mjs — Bundle the read-API server surface (S2)
// -----------------------------------------------------------------------------
// Bundles packages/viewer/src/server/index.ts (upgrade-on-read + the answer-key
// sanitizer + serve-time shuffles + SANITIZER_REV) into a single ESM file the
// get-activity Edge Function imports via a relative path — the same
// committed-bundle discipline as renderer.bundle.js, in a SEPARATE bundle so
// the read path never pays for (or waits on) the full renderer + KaTeX.
//
// Run:
//   pnpm bundle:viewer-server
//
// Output:
//   supabase/functions/_shared/viewer-server.bundle.js   (committed)
//
// Re-run after any change to packages/viewer/src/sanitize/, src/registry/, or
// packages/schema. CI regenerates it on every push and fails if it drifts from
// the committed file, so a stale bundle can't reach a deploy.
// =============================================================================

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const entry = resolve(root, 'packages/viewer/src/server/index.ts');
const outFile = resolve(
  root,
  'supabase/functions/_shared/viewer-server.bundle.js',
);

await mkdir(dirname(outFile), { recursive: true });

const result = await build({
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  // Deno-neutral, same as the renderer bundle: no DOM, no node built-ins.
  platform: 'neutral',
  target: 'es2022',
  outfile: outFile,
  sourcemap: 'inline',
  // Bundle EVERYTHING (zod rides along via @activity/schema) — the Edge
  // Function must not depend on any package outside this bundle.
  external: [],
  mainFields: ['module', 'main'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  // Unminified for readable Edge Function stack traces (renderer precedent).
  minify: false,
  metafile: true,
  logLevel: 'info',
});

const bytes = Object.values(result.metafile.outputs).reduce(
  (sum, o) => sum + o.bytes,
  0,
);

console.log('');
console.log('Viewer server bundle: ' + outFile);
console.log('          ' + (bytes / 1024).toFixed(1) + ' KiB');
console.log('');
console.log(
  'Re-run after any change to packages/schema or packages/viewer sanitize/registry.',
);
