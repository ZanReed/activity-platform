// =============================================================================
// db-types.test.mjs — the committed database types match the migrations
// (review C1 slice 3; docs/design/database-snapshot-and-types.md D2)
// -----------------------------------------------------------------------------
// `pnpm db:types` writes packages/db-types/database.types.ts and its Deno copy
// from the local stack, with a sha256 of every migration file in the header.
// CI cannot run the generator (no Docker in the check job, D1), so it checks
// what it can:
//
//   1. the stamp equals the migrations on this checkout — a migration changed
//      without a regeneration goes red here, naming the fix;
//   2. the two copies are byte-identical;
//   3. the generated Functions section and scripts/lib/migrations.mjs agree on
//      every callable function's name, parameters and which ones have
//      defaults. The generator read the real database, so this is Postgres
//      checking the node parser that rpc-arguments relies on (216 functions,
//      exact, on 2026-11-26).
//
// Honest limits: the stamp proves the file was regenerated after the last
// migration edit, from a local stack whose applied migrations matched the
// files in content (db-types.mjs checks that) — not that nobody hand-edited
// the output, nor that no hand-run SQL changed the local schema.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO, functions, highestMigration } from '../lib/migrations.mjs';
import { DB_TYPES_FILES, migrationsHash, appliedMismatch } from '../db-types.mjs';
import { databaseBody } from '../db-types-live-diff.mjs';

const [main, deno] = DB_TYPES_FILES.map((f) => readFileSync(resolve(REPO, f), 'utf8'));

test('the types were generated from THESE migrations (run `pnpm db:types`)', () => {
  const stamp = main.match(/^\/\/ migrations: 0001–(\d{4}), sha256 ([0-9a-f]{64})$/m);
  assert.ok(stamp, `${DB_TYPES_FILES[0]} has no migrations stamp — regenerate it with \`pnpm db:types\``);
  assert.equal(stamp[1], highestMigration(), `the types stop at ${stamp[1]} but ${highestMigration()} exists — run \`pnpm db:types\` (a cloud session lists it as a pending author action)`);
  assert.equal(stamp[2], migrationsHash(), 'a migration file changed since the types were generated — run `pnpm db:types` and commit both copies');
});

test('the Deno copy is byte-identical', () => {
  assert.ok(main === deno, `${DB_TYPES_FILES[1]} differs from ${DB_TYPES_FILES[0]} — \`pnpm db:types\` writes both`);
});

/** name -> sorted overload signatures `a,b?` from the generated Functions section. */
function generatedSignatures(text) {
  const sec = text.slice(text.indexOf('\n    Functions: {'), text.indexOf('\n    Enums: {'));
  const out = new Map();
  for (const part of sec.split(/\n(?=      [a-z_0-9]+:)/).slice(1)) {
    const name = part.match(/^      ([a-z_0-9]+):/)[1];
    const sigs = [];
    for (const a of part.matchAll(/Args:\s*(never|\{)/g)) {
      if (a[1] === 'never') { sigs.push(''); continue; }
      let depth = 1, j = a.index + a[0].length;
      const from = j;
      while (depth && j < part.length) { if (part[j] === '{') depth++; else if (part[j] === '}') depth--; j++; }
      const keys = [];
      let d = 0;
      for (const k of part.slice(from, j - 1).matchAll(/([{}])|(?:^|[\s;])([a-z_0-9]+)(\?)?:/g)) {
        if (k[1] === '{') d++; else if (k[1] === '}') d--; else if (d === 0) keys.push(k[2] + (k[3] ?? ''));
      }
      sigs.push(keys.sort().join(','));
    }
    out.set(name, sigs.sort());
  }
  return out;
}

test('Postgres (through the generator) and the node parser agree on every callable function', () => {
  const generated = generatedSignatures(main);
  const parsed = new Map();
  for (const [n, defs] of functions().live) {
    if (defs.every((d) => /^(trigger|event_trigger)$/.test(d.returns))) continue; // the generator omits them
    parsed.set(n, defs.map((d) => d.params.map((p) => p.name + (p.optional ? '?' : '')).sort().join(',')).sort());
  }
  assert.ok(generated.size >= 200, `only ${generated.size} functions read from the types file — its layout changed`);
  assert.deepEqual(generated.get('photo_answers_on'), ['', 'p_activity_id'], 'both overloads of photo_answers_on');
  const diff = [...new Set([...generated.keys(), ...parsed.keys()])].sort()
    .filter((n) => JSON.stringify(generated.get(n)) !== JSON.stringify(parsed.get(n)))
    .map((n) => `${n}: generated ${JSON.stringify(generated.get(n) ?? null)} · parser ${JSON.stringify(parsed.get(n) ?? null)}`);
  assert.deepEqual(diff, [], `\n${diff.join('\n')}\n(stale types → \`pnpm db:types\`; otherwise scripts/lib/migrations.mjs mis-reads a migration)`);
});

test('the local-stack check compares CONTENT, not just version numbers', () => {
  const files = [{ file: '0001_a.sql', raw: 'create table t (\n  id uuid\n);\n\nselect 1;\n' }, { file: '0002_b.sql', raw: 'select 2;\n' }];
  const applied = [{ version: '0001', statements: 'create table t (\n  id uuid\n)\nselect 1' }, { version: '0002', statements: 'select 2' }];
  assert.equal(appliedMismatch(applied, files), null, 'whitespace and semicolons between statements do not count');
  assert.match(appliedMismatch(applied.slice(0, 1), files), /not applied: 0002/);
  assert.match(appliedMismatch([...applied, { version: '0003', statements: 'x' }], files), /applied but no file: 0003/);
  const edited = [files[0], { file: '0002_b.sql', raw: 'select 3;\n' }];
  assert.match(appliedMismatch(applied, edited), /edited since it was applied: 0002_b\.sql.*--reset/);
  assert.match(appliedMismatch([], files), /no applied migrations/);
});

test('the live diff ignores the hosted preamble and helper formatting, not a real difference', () => {
  const local = 'export type Json = string\n\nexport type Database = {\n  public: {\n    Functions: {\n      f: { Args: { p_a: string }; Returns: Json }\n    }\n  }\n}\n\ntype X<T extends A extends B ? C : never = never> = T\n';
  const hosted = local
    .replace('export type Database = {\n', 'export type Database = {\n  // Allows to automatically instantiate createClient with right options\n  // instead of createClient<Database, { PostgrestVersion: \'XX\' }>(URL, KEY)\n  __InternalSupabase: {\n    PostgrestVersion: "14.5"\n  }\n')
    .replace('T extends A extends B ? C : never = never', 'T extends (A extends B ? C : never) = never');
  assert.equal(databaseBody(hosted), databaseBody(local));
  assert.notEqual(databaseBody(local.replace('p_a', 'p_b')), databaseBody(local));
  assert.match(databaseBody(main), /^export type Database = \{[\s\S]*Functions: \{[\s\S]*\n\}$/, 'the committed file has a Database type');
});
