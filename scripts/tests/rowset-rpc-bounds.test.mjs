// =============================================================================
// rowset-rpc-bounds.test.mjs — every row-set RPC the code calls states its
// row bound (code review 2026-11-26, A5)
// -----------------------------------------------------------------------------
// PostgREST stops a row set at max_rows (1,000 by default; supabase/config.toml
// sets none) and says NOTHING: HTTP 200, `Content-Range: 0-999/*`, the rest
// gone. The teacher's grading queue lost the older version's students that way
// (fixed by 0104's one-jsonb wrapper), after 0043 and 0060 had closed the same
// trap one function at a time. This file makes it a rule instead of a habit:
//
//   ROW-SET RPCs are DERIVED from the migrations: every function whose LATEST
//   definition RETURNS TABLE or RETURNS SETOF (a later DROP FUNCTION with no
//   re-create removes it).
//   CALLED RPCs are DERIVED from source: a row-set function's name appearing
//   as a whole quoted string in non-test code that talks to PostgREST (the
//   app, the viewer and its server handlers, the Edge Functions, the grading
//   worker). Constants modules count, so `rpc(SOME_RPC)` is seen through its
//   definition. Comments are skipped.
//
// Each called row-set RPC needs an entry in BOUNDS below saying WHY its rows
// stay under 1,000 — by construction (one row, one per section, an explicit
// LIMIT, a cap that counts what the function returns), or by a caller that
// chunks or pages. "It's small today" is NOT a bound: a read whose rows grow
// with use returns one jsonb instead (0104, 0106) and its row-set name goes on
// NEVER_CALL. There is no WATCH category any more (author, 2026-11-26: "fix all
// the watch entries now"). Neither roster is hand-written; only the reasons
// are (P4).
//
// NOT swept: table reads (`.from(...)`), cut by the same cap —
// listTeacherClassActivities pages for that reason (classReads.test.ts); RPC
// names built from template strings; code outside SOURCE_DIRS.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { REPO as ROOT, functions } from '../lib/migrations.mjs';

/** The reasons. Keyed by function name; the text is read by people, so say
 *  the mechanism, not a number observed once (P11). */
export const BOUNDS = {
  // ---- one row by construction ---------------------------------------------
  get_published_activity: 'one row: filtered to one activity id (its current version)',
  get_activity_public_meta: 'one row: filtered to one activity id',
  get_activity_version_for_check: 'one row: filtered to one activity id and one version id',
  get_class_public_meta: 'one row: join codes are unique',
  video_source: 'one row: one block of one version',
  my_work_photo_usage: 'one row: a single aggregate over the caller\'s photos',

  // ---- bounded by a document or a cap ---------------------------------------
  my_checked_section_ids: 'one row per section of ONE version the caller checked (0060)',
  my_latest_checks: 'one row per requested section of ONE version (DISTINCT ON section, 0060)',
  get_my_released_feedback: 'one row per hand-graded block of ONE activity for the caller (DISTINCT ON block)',
  work_photo_deletion_batch: 'explicit LIMIT least(p_limit, 1000) — exactly max_rows at most (0093)',
  work_photo_orphans: 'explicit LIMIT least(p_limit, 1000) — exactly max_rows at most (0093)',
  work_photo_states: 'one row per id passed in; fetchPhotoStates sends at most PHOTO_STATES_CHUNK (500) ids per call',
};

// The A5 regression pin: row sets whose rows grow with use. The app reads them
// through 0104's and 0106's jsonb wrappers; no source may name them again, with
// or without a BOUNDS entry.
const NEVER_CALL = [
  'list_grading_queue', 'list_grade_suggestions',                  // 0104
  'list_bank', 'my_activity_progress', 'list_class_activities',    // 0106
  'list_class_members', 'dol_pass_status', 'list_deleted_classes', // 0106
  'list_deleted_activities',                                       // 0106 (bounded by time only)
];

// ---- derive: row-set functions from the migrations --------------------------
// Through the shared parser (scripts/lib/migrations.mjs, review C1 slice 2):
// overloads keyed by input TYPES, as Postgres keys them. A name is a row set
// if ANY of its live overloads is, so a scalar overload cannot hide one.
export function rowsetFunctions(root = ROOT) {
  const out = new Map();
  for (const defs of functions(root).live.values()) {
    for (const d of defs) if (d.rowset && !out.has(d.name)) out.set(d.name, d);
  }
  return out;
}

// ---- derive: names the code calls --------------------------------------------
const SOURCE_DIRS = [
  'packages/app/src',
  'packages/viewer/src',
  'packages/grading-worker/src',
  'supabase/functions',
];
const SKIP_DIR = new Set(['node_modules', 'dist', '__tests__', '__mocks__', 'fixtures']);

function sourceFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) sourceFiles(p, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(name) && !/\.(test|spec)\.|\.bundle\.js$|\.d\.ts$/.test(name)) out.push(p);
  }
  return out;
}

/** Drops whole-line and block comments; keeps code. Good enough for names:
 *  a name inside a comment is not a call. */
function stripJsComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

export function quotedNames() {
  const seen = new Map(); // name -> Set(file)
  for (const d of SOURCE_DIRS) {
    for (const file of sourceFiles(resolve(ROOT, d))) {
      // lib/dbShapes.ts is types only (review C1 slice 4): it names a row set
      // in `RowsOf<'list_grading_queue'>` to DERIVE a wrapper's shape, and a
      // type cannot call anything. Every other file is swept.
      if (relative(ROOT, file) === 'packages/app/src/lib/dbShapes.ts') continue;
      const src = stripJsComments(readFileSync(file, 'utf8'));
      for (const m of src.matchAll(/(['"`])([a-z][a-z_0-9]*)\1/g)) {
        if (!seen.has(m[2])) seen.set(m[2], new Set());
        seen.get(m[2]).add(relative(ROOT, file));
      }
    }
  }
  return seen;
}

// ---- the rule ------------------------------------------------------------------
test('every row-set RPC the code names has a stated row bound', () => {
  const rowset = rowsetFunctions();
  const names = quotedNames();
  // Anti-vacuity (P9): the derivations see known cases both ways.
  assert.ok(rowset.size >= 30, `only ${rowset.size} row-set functions derived — the parser is broken`);
  assert.ok(rowset.has('list_grading_queue'), 'the parser must see 0099\'s list_grading_queue as a row set');
  assert.ok(!rowset.has('grading_queue'), 'the parser must see 0104\'s grading_queue as a scalar');
  assert.ok(names.has('grading_queue'), 'the sweep must see the app\'s grading_queue constant');

  const called = [...rowset.keys()].filter((n) => names.has(n)).sort();
  assert.ok(called.length >= 10, `only ${called.length} called row-set RPCs found — the sweep is broken`);
  const missing = called.filter((n) => !(n in BOUNDS) && !NEVER_CALL.includes(n));
  assert.deepEqual(
    missing.map((n) => `${n} (${rowset.get(n).file}; named in ${[...names.get(n)].join(', ')})`),
    [],
    'a row-set RPC is called with no stated bound: PostgREST will cut it at 1,000 rows with no error. ' +
      'Return one jsonb or page it; add a BOUNDS entry only if its rows are bounded by construction.',
  );
});

test('the growing reads are never read as row sets again (A5, 0104 + 0106)', () => {
  const names = quotedNames();
  for (const n of NEVER_CALL) {
    assert.ok(!names.has(n), `${n} is named in ${[...(names.get(n) ?? [])].join(', ')} — read it through its jsonb wrapper (0104 / 0106)`);
    assert.ok(!(n in BOUNDS), `${n} must not get a BOUNDS entry`);
  }
});

test('no BOUNDS entry is stale', () => {
  const rowset = rowsetFunctions();
  const names = quotedNames();
  for (const [n, why] of Object.entries(BOUNDS)) {
    assert.ok(rowset.has(n), `BOUNDS.${n}: not a row-set function in the migrations any more — remove the entry`);
    assert.ok(names.has(n), `BOUNDS.${n}: no source names it any more — remove the entry`);
    assert.ok(why.length >= 20, `BOUNDS.${n}: say why the rows stay bounded`);
    assert.ok(!/\bWATCH\b/.test(why), `BOUNDS.${n}: a WATCH entry is not a bound — return one jsonb (see 0106)`);
  }
});
