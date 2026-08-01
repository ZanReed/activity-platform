// =============================================================================
// scripts/bundle-grading-server.mjs — Bundle the grading surface (S4)
// -----------------------------------------------------------------------------
// Bundles packages/viewer/src/server/grading-entry.ts (the check handler + the
// grading engine + graph-kit's pure scorers + the math engine) into a single
// ESM file the check-activity Edge Function imports by relative path — the same
// committed-bundle discipline as renderer.bundle.js and viewer-server.bundle.js.
//
// DELIBERATELY SEPARATE FROM viewer-server.bundle.js (ruling S4-1). Grading
// needs mathjs for expression equivalence; the read path does not, and its
// bundle carries a size ceiling precisely so opening an activity never waits on
// code only checking needs. Folding them together would make every activity
// OPEN pay the grader's cold start — and a grading fix would redeploy the read
// path with it.
//
// Run:
//   pnpm bundle:grading-server
//
// Output:
//   supabase/functions/_shared/grading-server.bundle.js   (committed)
//
// Re-run after any change to packages/viewer/src/server/, src/sanitize/,
// src/registry/, packages/schema, or packages/graph-kit's scorers. CI
// regenerates it on every push and fails if it drifts from the committed file,
// so a stale bundle can't reach a deploy.
// =============================================================================


import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const entry = resolve(root, 'packages/viewer/src/server/grading-entry.ts');
const outFile = resolve(
  root,
  'supabase/functions/_shared/grading-server.bundle.js',
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

// ---- Size ceiling -----------------------------------------------------------
// This bundle legitimately carries the math engine, so it is BIGGER than the
// read path's by design. The ceiling still matters for two reasons: cold start
// is on the interactive path (a student is waiting on the Check button), and
// the failure mode the read bundle already hit once — a client component tree
// leaking in through a registry import and taking JSXGraph and MathLive with it
// — applies here identically. That regression went 888 KiB → 2.8 MB → 21 MB
// before anyone noticed, which is why size is the guard rather than
// substring-matching: every real leak has been enormous, while substring checks
// false-positive on the comments this deliberately-unminified bundle keeps.
//
// Raise this only alongside a deliberate, explained growth in what grading
// needs. If it jumps by a multiple, something is importing a component.
const MAX_KIB = 4000;
const actualKiB = bytes / 1024;
if (actualKiB > MAX_KIB) {
  console.error('');
  console.error(
    'ERROR: grading server bundle is ' +
      actualKiB.toFixed(1) +
      ' KiB, over the ' +
      MAX_KIB +
      ' KiB ceiling.',
  );
  console.error('');
  console.error('Grading must not carry rendering or component code. Most');
  console.error('likely something the server imports now reaches a block');
  console.error('component — components import ONLY via registry/bindings.ts.');
  process.exit(1);
}

console.log('');
console.log('Grading server bundle: ' + outFile);
console.log('          ' + actualKiB.toFixed(1) + ' KiB');
console.log('');
console.log(
  'Re-run after any change to packages/viewer/src/server, sanitize/registry,',
);
console.log("packages/schema, or graph-kit's scorers.");
