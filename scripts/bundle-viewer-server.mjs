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

// ---- Client-code leak guard -------------------------------------------------
// The read API imports the registry for its sanitize specs. When component
// BINDINGS lived on those registry entries, this bundle silently absorbed the
// entire component tree: 888 KiB → 2.8 MB once the exemplars were bound, then
// 21 MB once the graph binding pulled in JSXGraph and MathLive. A read API that
// renders nothing was about to ship with a graphing engine inside it.
//
// Components now bind in registry/bindings.ts, which only client code imports.
// SIZE is the guard, deliberately: substring-matching for 'react' or 'mathlive'
// false-positives on the comments this deliberately-unminified bundle keeps,
// while every real leak is enormous — the two above were 3x and 23x the
// ceiling. Raise this only alongside a deliberate, explained growth in what the
// read path legitimately needs.
const MAX_KIB = 1500;
const actualKiB = bytes / 1024;
if (actualKiB > MAX_KIB) {
  console.error('');
  console.error(
    'ERROR: viewer server bundle is ' +
      actualKiB.toFixed(1) +
      ' KiB, over the ' +
      MAX_KIB +
      ' KiB ceiling.',
  );
  console.error('');
  console.error('The read API must not carry rendering code. Most likely');
  console.error('something the server imports now reaches a block component —');
  console.error('components must be imported ONLY from registry/bindings.ts.');
  process.exit(1);
}

console.log('');
console.log('Viewer server bundle: ' + outFile);
console.log('          ' + actualKiB.toFixed(1) + ' KiB');
console.log('');
console.log(
  'Re-run after any change to packages/schema or packages/viewer sanitize/registry.',
);
