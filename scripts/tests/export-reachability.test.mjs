// =============================================================================
// export-reachability.test.mjs — "a primitive is not delivered until something
// calls it", as a gate (policy P1, ratified 2026-08-06)
// -----------------------------------------------------------------------------
// The arc's single most repeated failure: code built, hardened, even fully
// tested — with zero production callers, so its guarantee never existed
// (join_class, both idle watchers, signOutEverything pre-V7, the buffer's
// status port, onCheckShortfall, both retryable fields — 8+ instances across
// four slices, every one invisible precisely BECAUSE its unit tests were
// green). This is the mechanical form: every VALUE exported from the viewer's
// main barrel must be referenced somewhere outside its own defining module and
// outside test code, or it must carry an allowlist entry saying why not.
//
// GREP-LEVEL, deliberately (root scripts carry zero dependencies by design —
// no ts-morph): a word-boundary name match in non-test source counts as
// reachable. That over-counts (a comment mentioning the name passes it) and
// cannot see HOW a symbol is imported — accepted, because the failure class
// this hunts is "zero references anywhere", which grep sees perfectly. The
// bar is one-directional: this test failing means a genuinely unreferenced
// export; it passing is necessary, not sufficient.
//
// Scope v1: the viewer main barrel (the arc's principal seam). Extend to the
// app's lib modules when the S9 slices land their wiring.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const barrelPath = join(repo, 'packages/viewer/src/index.ts');

/**
 * Deliberate exceptions, each with the reason it may stay export-only.
 * An entry here is a PROMISE with an owner — the P8 rule applies: when the
 * owner lands, delete the entry and let the gate enforce the wiring.
 */
const ALLOWLIST = new Map([
  // Consumed by the e2e harness + published-page parity tooling (test-side by
  // design — the wire contract constant exists so mocks import, never retype;
  // policy P2 is the reason it looks unreachable to a non-test grep).
  ['CHECK_WIRE_VERSION', 'P2: exists precisely so TEST mocks import it'],

  // ---- Seeded from the gate's FIRST run (2026-08-06) over pre-existing
  // surface. A "test seam" or "guard surface" reason is legitimate FOREVER —
  // the lint's bar is unreachable AND unexplained, and an export that exists
  // so a guard can see inside is explained. Entries carrying an owner (C6,
  // A17-successor) are P8 promises: when the owner lands, delete the entry.
  // NEW exports get no grandfather clause.

  // Print-gate vocabulary: the gate is spec-referenced FROM the e2e lanes
  // (s5 design — test-side by construction).
  ['suppressedChecksFor', 'print-gate vocabulary (e2e-consumed)'],
  ['targetFor', 'print-gate vocabulary (e2e-consumed)'],
  ['blockPrintRoster', 'print-gate vocabulary (e2e-consumed)'],
  ['variantPrintRoster', 'print-gate vocabulary (e2e-consumed)'],
  ['structuralPrintRoster', 'print-gate vocabulary (e2e + roster cross-check)'],
  ['BLOCK_ROOT', 'print-gate vocabulary (e2e-consumed)'],
  ['PAPER_COLOURS', 'print-gate vocabulary (gate-only; s5-audit missed-8 knows)'],

  // Guard surface: exported so unit guards can assert against the real data.
  ['blockBindings', 'guard surface (registry binding guard)'],
  ['colorTokens', 'guard surface (token guard)'],
  ['staticTokens', 'guard surface (token guard)'],
  ['stateNames', 'guard surface (token guard)'],
  ['extractBlockAnswerKey', 'guard surface (answer-key coverage anti-vacuity)'],

  // Documented test seams.
  ['resetLoadedFonts', 'test seam (documented in typography/fonts.ts)'],
  ['setMathRenderer', 'test seam (math renderer injection)'],
  ['setGraphSurface', 'test seam (kit surface injection)'],
  ['setNumberLineSurface', 'test seam (kit surface injection)'],
  ['setDataPlotSurface', 'test seam (kit surface injection)'],
  ['resetMarksForTest', 'test seam (says so in its name)'],
  ['CheckError', 'thrown in-module; export = suite surface (app branches on kind)'],
  ['documentUsesMath', 'in-module consumer (preloadMathIfNeeded); export = suite surface'],
  ['documentUsesGraphKit', 'in-module consumer (preloadGraphKitIfNeeded); export = suite surface'],
  ['alwaysOnlineConnectivity', 'test/dev port default'],
  ['nullHideSignal', 'test/dev port default'],

  // Key-grammar + store internals whose consumers live in their own module;
  // the export exists for the suites that pin the grammar from outside.
  ['bufferHasUnsentWork', 'in-module consumer (V6 GC exception); export = suite surface'],
  ['activityFontFamily', 'in-module consumer (typographyVars); export = suite surface'],
  ['BUFFER_KEY_PREFIX', 'key-grammar pin surface'],
  ['DEFAULT_BUFFER_DEBOUNCE_MS', 'suite surface (debounce pins)'],
  ['bufferKey', 'key-grammar pin surface'],
  ['parseBufferKey', 'key-grammar pin surface'],
  ['documentKey', 'key-grammar pin surface'],
  // (Four cache-grammar entries + the C6-owned sweepForeignCaches stood here
  // until S9 Drop 4: the D-8 ruling REMOVED the per-student cache machinery
  // instead of writing it a producer — the worker never caches per-student
  // responses, so the pair guarded caches that could not exist. The C6 gate
  // is CLOSED by removal; VIEWER_SHELL_CACHE survives with a live consumer
  // in main.tsx and needs no exemption.)
]);

/** VALUE export names declared by the barrel, name → defining module path. */
function barrelExports() {
  const src = readFileSync(barrelPath, 'utf8');
  const out = new Map();

  // export { A, B as C, type T } from './x.js';
  for (const m of src.matchAll(
    /export\s*\{([^}]+)\}\s*from\s*'([^']+)'/g,
  )) {
    const from = m[2];
    for (const raw of m[1].split(',')) {
      const piece = raw.trim();
      if (!piece || piece.startsWith('type ')) continue;
      const name = (piece.split(/\s+as\s+/).pop() ?? '').trim();
      if (name) out.set(name, from);
    }
  }
  return out;
}

/** Every non-test source file that counts as "production reachability". */
function corpusFiles() {
  const roots = [
    join(repo, 'packages/app/src'),
    join(repo, 'packages/viewer/src'),
    join(repo, 'supabase/functions'),
  ];
  const files = [];
  const skip = (p) =>
    p.includes('__tests__') ||
    p.includes('/tests/') ||
    /\.test\.[tj]sx?$/.test(p) ||
    p.includes('.bundle.js') || // generated builds of this same source
    p.endsWith('.d.ts');
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) {
        if (entry === 'node_modules' || entry === 'dist') continue;
        walk(p);
      } else if (/\.[tj]sx?$/.test(entry) && !skip(p)) {
        files.push(p);
      }
    }
  };
  for (const r of roots) walk(r);
  return files;
}

test('every viewer barrel value export is reachable from non-test code', () => {
  const exportsMap = barrelExports();
  assert.ok(exportsMap.size > 20, 'barrel parse produced suspiciously few exports');

  const files = corpusFiles().map((p) => ({
    path: p,
    text: readFileSync(p, 'utf8'),
  }));

  const unreachable = [];
  for (const [name, from] of exportsMap) {
    if (ALLOWLIST.has(name)) continue;
    const definer = resolve(dirname(barrelPath), from.replace(/\.js$/, '.ts'));
    const re = new RegExp(`\\b${name}\\b`);
    const hit = files.some((f) => {
      if (resolve(f.path).replace(/x?$/, '') === definer) return false;
      if (resolve(f.path) === resolve(barrelPath)) return false;
      // The defining module (either .ts or .tsx) does not count as a consumer.
      const noExt = resolve(f.path).replace(/\.tsx?$/, '');
      if (noExt === definer.replace(/\.ts$/, '')) return false;
      return re.test(f.text);
    });
    if (!hit) unreachable.push(`${name} (from ${from})`);
  }

  assert.deepEqual(
    unreachable,
    [],
    `Barrel exports with ZERO non-test references outside their defining ` +
      `module — either wire a consumer, delete the export, or add a REASONED ` +
      `allowlist entry (an unexplained one re-creates the failure this gate ` +
      `exists for):\n  ${unreachable.join('\n  ')}`,
  );
});
