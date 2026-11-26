// =============================================================================
// migrations-lib.test.mjs — the shared migration parser models Postgres where
// it matters (review C1 slice 2; scripts/lib/migrations.mjs)
// -----------------------------------------------------------------------------
// Each case is one rule the four guards and the function index rely on, run
// against a throwaway migrations folder. A parser change that breaks one goes
// red here with the rule's name, not as a silent change in what a guard sees.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { functions, constraintNames, tableColumns, stripSql, argType, highestMigration } from '../lib/migrations.mjs';

/** A repo root holding only these migrations: { '0001_a.sql': '…', … }. */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'migrations-lib-'));
  mkdirSync(join(root, 'supabase/migrations'), { recursive: true });
  for (const [name, sql] of Object.entries(files)) writeFileSync(join(root, 'supabase/migrations', name), sql);
  return root;
}

function withFixture(files, fn) {
  const root = fixture(files);
  try { return fn(root); } finally { rmSync(root, { recursive: true, force: true }); }
}

const fn = (sig, rest = 'returns void language sql as $$ select 1 $$;') => `create or replace function ${sig} ${rest}\n`;

test('overloads are keyed by input TYPES, not arity or names', () => {
  withFixture({
    '0001_a.sql': fn('f(p_id uuid)') + fn('f(p_n int)'),
    '0002_b.sql': fn('f(p_x uuid)'), // same types: replaces the first
  }, (root) => {
    const f = functions(root).live.get('f');
    assert.equal(f.length, 2);
    assert.deepEqual(f.map((d) => d.params[0].name).sort(), ['p_n', 'p_x']);
    assert.equal(functions(root).history.get('f').length, 3);
  });
});

test('a drop removes by types when it gives them, every overload when it does not', () => {
  withFixture({
    '0001_a.sql': fn('f(p_id uuid)') + fn('f(p_n integer)') + fn('g(p_a text)') + fn('g()'),
    '0002_b.sql': 'drop function f(int4);\ndrop function if exists g cascade;\n',
  }, (root) => {
    const { live } = functions(root);
    assert.deepEqual(live.get('f').map((d) => d.types), ['uuid']);
    assert.equal(live.has('g'), false);
  });
});

test('`drop function if exists` with types that match nothing is a no-op', () => {
  withFixture({
    '0001_a.sql': fn('f(p_id uuid)'),
    '0002_b.sql': 'drop function if exists f(text);\n',
  }, (root) => {
    assert.deepEqual(functions(root).live.get('f').map((d) => d.types), ['uuid']);
  });
});

test('a drop that names its arguments, and a create after a drop in the same file', () => {
  withFixture({
    '0001_a.sql': fn('f(p_id uuid)'),
    '0002_b.sql': 'drop function f(p_id uuid);\n' + fn('f(p_klass uuid)'),
  }, (root) => {
    assert.equal(functions(root).live.get('f')[0].params[0].name, 'p_klass');
  });
});

test('defaults make a parameter optional; OUT parameters are not inputs', () => {
  withFixture({
    '0001_a.sql': fn('f(p_a uuid, p_b text default null, p_c int = 3, out total bigint)', 'returns bigint language sql as $$ select 1 $$;'),
  }, (root) => {
    const [d] = functions(root).live.get('f');
    assert.deepEqual(d.params.map((p) => [p.name, p.optional]), [['p_a', false], ['p_b', true], ['p_c', true]]);
    assert.equal(d.types, 'uuid,text,integer');
  });
});

test('security definer is read before OR after the body; the default is invoker', () => {
  withFixture({
    '0001_a.sql':
      fn('a()', 'returns void language sql security definer set search_path = public as $$ select 1 $$;') +
      fn('b()', 'returns void as $body$ select 1 $body$ language plpgsql security definer;') +
      fn('c()', "returns void language plpgsql as $$ begin raise notice 'security definer'; end $$;"),
  }, (root) => {
    const { live } = functions(root);
    assert.equal(live.get('a')[0].security, 'definer');
    assert.equal(live.get('b')[0].security, 'definer');
    assert.equal(live.get('c')[0].security, 'invoker', 'text inside the body is not an attribute');
  });
});

test('returns: scalars normalized, row sets recognized, table columns listed', () => {
  withFixture({
    '0001_a.sql':
      fn('a()', 'returns timestamptz language sql as $$ select now() $$;') +
      fn('b()', 'returns setof public.users language sql as $$ select * from users $$;') +
      fn('c()', 'returns table(id uuid, n numeric(10,2)) language sql as $$ select null, null $$;') +
      fn('d()', 'returns text[] language sql as $$ select null $$;'),
  }, (root) => {
    const { live } = functions(root);
    assert.equal(live.get('a')[0].returns, 'timestamp with time zone');
    assert.deepEqual([live.get('b')[0].returns, live.get('b')[0].rowset], ['setof users', true]);
    assert.deepEqual([live.get('c')[0].returns, live.get('c')[0].rowset], ['table(id, n)', true]);
    assert.deepEqual([live.get('d')[0].returns, live.get('d')[0].rowset], ['text[]', false]);
  });
});

test('comments and literals hide nothing and invent nothing; line numbers survive', () => {
  withFixture({
    '0001_a.sql': [
      '/* a block',
      '   comment: create function ghost() returns void */',
      "comment on table t is 'drop function real;",
      "  still the literal';",
      '-- drop function real;',
      fn('real()').trim(),
      'alter table t drop constraint if exists old_key;',
      '-- constraint below is prose',
    ].join('\n'),
  }, (root) => {
    const { live } = functions(root);
    assert.equal(live.has('ghost'), false);
    assert.equal(live.get('real')[0].line, 6);
    assert.deepEqual([...constraintNames(root)], ['old_key']);
  });
  assert.equal(stripSql("a 'x\ny' b /* c\nd */ e").split('\n').length, 3);
});

test('a non-public schema is not public', () => {
  withFixture({ '0001_a.sql': fn('private.f()') + fn('public.g()') }, (root) => {
    assert.deepEqual([...functions(root).live.keys()], ['g']);
  });
});

test('tables, added columns and the highest migration', () => {
  withFixture({
    '0001_a.sql': 'create table if not exists public.people (\n  id uuid,\n  email text\n);\n',
    '0007_b.sql': 'alter table people add column if not exists graded_by uuid;\n',
  }, (root) => {
    const { created, added } = tableColumns(root);
    assert.deepEqual(created.map((c) => c.table), ['people']);
    assert.match(created[0].body, /email text/);
    assert.deepEqual(added.map((a) => [a.table, a.column]), [['people', 'graded_by']]);
    assert.equal(highestMigration(root), '0007');
  });
});

test('argType normalizes the spellings the migrations use', () => {
  assert.equal(argType('p_a int'), 'integer');
  assert.equal(argType('in p_a int4 default 0'), 'integer');
  assert.equal(argType('timestamptz'), 'timestamp with time zone');
  assert.equal(argType('p_at timestamp with time zone'), 'timestamp with time zone');
  assert.equal(argType('double precision'), 'double precision');
  assert.equal(argType('p_ids uuid[]'), 'uuid[]');
  assert.equal(argType('p_n numeric(10,2)'), 'numeric');
  assert.equal(argType('variadic p_xs text[]'), 'text[]');
});
