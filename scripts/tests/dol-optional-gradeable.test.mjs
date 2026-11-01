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

const root = new URL('../../', import.meta.url);
const predicates = readFileSync(new URL('packages/schema/src/block-predicates.ts', root), 'utf8');
const migration = readFileSync(new URL('supabase/migrations/0076_dol_optional_null_fix.sql', root), 'utf8');

test('every type isGradeable names is in dol_optional_block', () => {
  const start = predicates.indexOf('export function isGradeable');
  const end = predicates.indexOf('\n}\n', start);
  const types = [...predicates.slice(start, end).matchAll(/case '([a-z_]+)':/g)].map((m) => m[1]);
  assert.ok(types.length >= 13, `parsed only ${types.length} types`);
  const fn = migration.slice(migration.indexOf('create or replace function dol_optional_block'),
                             migration.length);
  for (const t of types) assert.ok(fn.includes(`'${t}'`), `${t} is gradable but missing from 0076`);
});
