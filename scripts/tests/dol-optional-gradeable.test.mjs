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
import { readFileSync } from 'node:fs';
import { functions, functionBody } from '../lib/migrations.mjs';

const root = new URL('../../', import.meta.url);
const predicates = readFileSync(new URL('packages/schema/src/block-predicates.ts', root), 'utf8');
// The LIVE definition, from the shared parser (review C1). Until 2026-11-26
// this was a search for the lowercase string `create or replace function
// dol_optional_block`, which missed 0096's `CREATE OR REPLACE FUNCTION
// public.dol_optional_block` and read 0094's superseded body (Fable review).
const defs = functions().live.get('dol_optional_block') ?? [];
const latest = defs[0]?.file;

test('every type isGradeable names is in dol_optional_block', () => {
  const start = predicates.indexOf('export function isGradeable');
  const end = predicates.indexOf('\n}\n', start);
  const types = [...predicates.slice(start, end).matchAll(/case '([a-z_]+)':/g)].map((m) => m[1]);
  assert.ok(types.length >= 13, `parsed only ${types.length} types`);
  assert.equal(defs.length, 1, 'one live dol_optional_block');
  const fn = functionBody(defs[0]);
  // Only the `gradable` CTE: the function names the manually graded types a
  // second time (the optional-marking list), and a whole-body search passed
  // with a type missing from the gradable list (mutation-tested 2026-11-18).
  const gradable = fn.slice(fn.indexOf('gradable as ('), fn.indexOf('\n  select', fn.indexOf('gradable as (')));
  assert.ok(gradable.length > 100, 'could not find the gradable CTE');
  for (const t of types) assert.ok(gradable.includes(`'${t}'`), `${t} is gradable but missing from ${latest}'s gradable list`);
});
