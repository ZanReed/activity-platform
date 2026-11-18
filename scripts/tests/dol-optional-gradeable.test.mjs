// =============================================================================
// dol-optional-gradeable.test.mjs — 0075's gradable list stays the schema's (P4)
// -----------------------------------------------------------------------------
// dol_optional_block finds a DoL's primary item in SQL, so it restates
// isGradeable. If they part, the server's "to grade" and the viewer's pill
// disagree about which answer is the primary. Bound to the LATEST definition. Every type isGradeable names must
// appear in the migration's list.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const predicates = readFileSync(new URL('packages/schema/src/block-predicates.ts', root), 'utf8');
// The LATEST migration that (re)defines the function — 0076, then 0094 (photo
// answers). Found, not named, so the next re-creation cannot leave this test
// reading a superseded body.
const DEFINES = 'create or replace function dol_optional_block';
const latest = readdirSync(new URL('supabase/migrations/', root))
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .filter((f) => readFileSync(new URL(`supabase/migrations/${f}`, root), 'utf8').includes(DEFINES))
  .at(-1);
const migration = readFileSync(new URL(`supabase/migrations/${latest}`, root), 'utf8');

test('every type isGradeable names is in dol_optional_block', () => {
  const start = predicates.indexOf('export function isGradeable');
  const end = predicates.indexOf('\n}\n', start);
  const types = [...predicates.slice(start, end).matchAll(/case '([a-z_]+)':/g)].map((m) => m[1]);
  assert.ok(types.length >= 13, `parsed only ${types.length} types`);
  const fn = migration.slice(migration.indexOf(DEFINES), migration.length);
  // Only the `gradable` CTE: the function names the manually graded types a
  // second time (the optional-marking list), and a whole-body search passed
  // with a type missing from the gradable list (mutation-tested 2026-11-18).
  const gradable = fn.slice(fn.indexOf('gradable as ('), fn.indexOf('\n  select', fn.indexOf('gradable as (')));
  assert.ok(gradable.length > 100, 'could not find the gradable CTE');
  for (const t of types) assert.ok(gradable.includes(`'${t}'`), `${t} is gradable but missing from ${latest}'s gradable list`);
});
