// =============================================================================
// manually-graded-types.test.mjs — the hand-graded set, SQL against TypeScript
// (migration 0096; docs/design/media-submissions.md §7, R-2)
// -----------------------------------------------------------------------------
// The set used to be spelled inline in nine places, and a new hand-graded type
// would have reached the screen without reaching the queue. 0096 made it ONE
// SQL helper (is_manually_graded_type) and ONE TypeScript constant
// (MANUALLY_GRADED_TYPES in @activity/schema). This pins the two to each other:
// the LATEST migration that defines the helper must list exactly the
// constant's types. verify-0096's `no_inline_pair_left` row is the live half
// (no deployed function spells the pair any more).
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MIGRATIONS = resolve(ROOT, 'supabase/migrations');

function sqlSet() {
  const files = readdirSync(MIGRATIONS).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
  let latest = null;
  for (const f of files) {
    const sql = readFileSync(resolve(MIGRATIONS, f), 'utf8');
    const m = sql.match(/create (?:or replace )?function is_manually_graded_type\([^)]*\)[\s\S]*?\$\$([\s\S]*?)\$\$/i);
    if (m) latest = { file: f, body: m[1] };
  }
  assert.ok(latest, 'some migration defines is_manually_graded_type');
  const list = latest.body.match(/in\s*\(([^)]*)\)/i);
  assert.ok(list, `${latest.file}: the helper's body has an IN (...) list`);
  return { file: latest.file, types: [...list[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]).sort() };
}

function tsSet() {
  const src = readFileSync(resolve(ROOT, 'packages/schema/src/block-predicates.ts'), 'utf8');
  const m = src.match(/export const MANUALLY_GRADED_TYPES = \[([^\]]*)\]/);
  assert.ok(m, 'block-predicates.ts exports MANUALLY_GRADED_TYPES as a literal array');
  return [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]).sort();
}

test('the SQL helper and the TypeScript constant name the same hand-graded types', () => {
  const sql = sqlSet();
  const ts = tsSet();
  assert.ok(ts.length >= 3, 'anti-vacuity: the constant is not empty');
  assert.deepEqual(sql.types, ts, `${sql.file}'s is_manually_graded_type and MANUALLY_GRADED_TYPES disagree`);
});

test('the photo of working is hand-graded (MS-23, slice 3)', () => {
  assert.ok(tsSet().includes('photo_response'));
});
