// =============================================================================
// graph-kit-barrel.test.mjs — nothing in this repo imports the graph-kit BARREL
// -----------------------------------------------------------------------------
// `@activity/graph-kit` (packages/graph-kit/src/index.ts) re-exports the mount
// functions, the math-prompt mount and the legacy runtime, so one import of it
// reaches MathLive, mathjs and JSXGraph. That has broken things three ways:
//   - size outside a browser: scorers through the barrel put 1 MB of MathLive
//     into the grading Edge Function;
//   - node resolution: the barrel's `import { MathfieldElement } from
//     'mathlive'` does not exist in mathlive's node build (batch importer,
//     2026-08-20; vitest does not catch it);
//   - size INSIDE a browser: until 2026-11-26 the student viewer reached every
//     widget through the barrel, so a data plot downloaded ~300 KiB gz of
//     MathLive and mathjs it never used (review D1).
// So the rule is: import a subpath from packages/graph-kit/package.json
// "exports", everywhere — app, viewer, tests, scripts, Edge Functions. Add a
// subpath rather than reach through `.`.
//
// Inside packages/graph-kit the barrel is reached by a relative path
// (`../src/index.js`), so files there are also checked for that.
//
// The scan is over IMPORT SITES (a static `from`, `import '…'`, `import(…)`
// including `typeof import(…)`, `require(…)`, `vi.mock(…)`/`importActual(…)`),
// not over every mention, so prose and lint config naming the package do not
// count. There is no "type-only is fine" exception: a type import today is a
// value import after the next refactor, and a subpath costs nothing.
//
// What a student downloads is checked on the BUILT chunks, separately:
// scripts/perf-budgets.mjs → STUDENT_KIT_JOURNEYS. The app's lint rule
// (packages/app/eslint.config.js, non-editor routes) predates this and allows
// type imports; this test is the stricter, repo-wide one.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

/** Directories scanned, relative to the repo root. */
const SCAN_ROOTS = ['packages', 'scripts', 'supabase/functions'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.vite', 'coverage', 'playwright-report', 'test-results']);
const SOURCE_FILE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
/** Committed esbuild output: generated, and checked by the bundle-drift gates. */
const GENERATED = /\.bundle\.js$/;

/** A quoted bare `@activity/graph-kit` at an import site, never a subpath. */
export const BARREL_IMPORT =
  /(?:\bfrom\s*|\bimport\s*\(?\s*|\b(?:require|mock|doMock|importActual|importOriginal)\s*(?:<[^>]*>)?\(\s*)(['"`])@activity\/graph-kit\1/;
/** Inside graph-kit itself the barrel is a RELATIVE path: `../src/index.js`. */
export const RELATIVE_BARREL_IMPORT =
  /(?:\bfrom\s*|\bimport\s*\(?\s*|\b(?:require|mock|doMock|importActual|importOriginal)\s*(?:<[^>]*>)?\(\s*)(['"`])(?:\.\.?\/)+(?:src\/)?index(?:\.[cm]?[jt]s)?\1/;
const IN_GRAPH_KIT = /^packages\/graph-kit\//;
const SUBPATH_IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*)(['"`])@activity\/graph-kit\/[a-z-]+\1/;

/** This file names the barrel in its own patterns' tests. */
const SELF = relative(ROOT, fileURLToPath(import.meta.url));

function sourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (SOURCE_FILE.test(name) && !GENERATED.test(name)) out.push(path);
  }
  return out;
}

const FILES = SCAN_ROOTS.map((r) => join(ROOT, r))
  .filter((d) => existsSync(d))
  .flatMap(sourceFiles)
  .map((f) => ({ rel: relative(ROOT, f), text: readFileSync(f, 'utf8') }));

test('the scan is not vacuous: it sees the files that import subpaths', () => {
  const users = FILES.filter((f) => SUBPATH_IMPORT.test(f.text)).map((f) => f.rel);
  // One per side of the split: the student viewer, the teacher editor, a test.
  for (const expected of [
    'packages/viewer/src/blocks/kitSurfaces.ts',
    'packages/app/src/editor/nodeViews/InteractiveGraphView.tsx',
    'packages/app/src/__tests__/mathFormula.test.ts',
  ]) {
    assert.ok(users.includes(expected), `scan did not see ${expected} (${users.length} subpath users)`);
  }
});

test('no file imports the graph-kit barrel', () => {
  const offenders = FILES.filter(
    (f) =>
      f.rel !== SELF &&
      (BARREL_IMPORT.test(f.text) || (IN_GRAPH_KIT.test(f.rel) && RELATIVE_BARREL_IMPORT.test(f.text))),
  ).map((f) => f.rel);
  assert.deepEqual(
    offenders,
    [],
    'import a subpath from packages/graph-kit/package.json "exports" instead ' +
      '(the barrel carries MathLive, mathjs and JSXGraph; review D1)',
  );
});

test('the pattern matches barrel import sites and nothing else', () => {
  const hits = [
    `import { a } from '@activity/graph-kit';`,
    `import type { A } from "@activity/graph-kit";`,
    `export { a } from '@activity/graph-kit';`,
    `import '@activity/graph-kit';`,
    `await import('@activity/graph-kit')`,
    `type K = typeof import('@activity/graph-kit');`,
    `vi.mock('@activity/graph-kit', () => ({}))`,
    `vi.importActual<typeof K>('@activity/graph-kit')`,
    `require('@activity/graph-kit')`,
  ];
  const misses = [
    `import { a } from '@activity/graph-kit/formula';`,
    `await import('@activity/graph-kit/calculator')`,
    `// prose naming the string '@activity/graph-kit' in a comment`,
    `name: '@activity/graph-kit',`,
    `import { b } from '@activity/graph-kit-extra';`,
  ];
  for (const s of hits) assert.ok(BARREL_IMPORT.test(s), `should match: ${s}`);
  for (const s of misses) assert.ok(!BARREL_IMPORT.test(s), `should not match: ${s}`);
  // graph-kit's own files reach the barrel by relative path.
  for (const s of [`from '../src/index.js';`, `import('./index')`, `from '../index.ts'`]) {
    assert.ok(RELATIVE_BARREL_IMPORT.test(s), `should match: ${s}`);
  }
  for (const s of [`from '../src/graph-question.js';`, `from './static-svg/index.js'`, `from '../src/indexer.js'`]) {
    assert.ok(!RELATIVE_BARREL_IMPORT.test(s), `should not match: ${s}`);
  }
});
