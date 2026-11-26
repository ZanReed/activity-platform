// =============================================================================
// db-rpc.test.mjs — the app calls the database through lib/db.ts, and the
// hand-written jsonb shapes say which migration they were matched to
// (review C1 slice 4; docs/design/database-snapshot-and-types.md D3, D6)
// -----------------------------------------------------------------------------
//   1. No `.rpc(` in the app outside packages/app/src/lib/db.ts. Everything
//      else goes through its typed rpc() / rpcOrThrow(), so tsc checks the
//      function name and every argument against the generated schema.
//   2. A RATCHET on casts of a result (`data as X`, `(data ?? []) as X[]`)
//      outside db.ts: never more than CAST_CEILING, and when the count falls
//      the ceiling must fall with it (the shell ledger's anti-fossil rule), so
//      a later cast cannot quietly spend a slot someone freed. Counted: casts
//      of a variable named data / result / res. A renamed destructure
//      (`{ data: rows }` then `rows as X`) is not counted — the ratchet slows
//      new casts, it does not make them impossible.
//   3. Every lib/dbShapes.ts entry is a live function that returns jsonb, and
//      its `@shape-as-of` is the migration holding that function's LATEST
//      definition — or, when its body hands back another jsonb function's
//      result (`return class_plan(…)`), that function's, whichever is later.
//      Restating either turns this red until someone re-reads the keys and
//      bumps the stamp — the moment the hand-written shape can go stale.
//      Limit: a shape assembled from several functions' results some other
//      way is followed only through `return f(…)`.
//   4. A `@derived-from x` entry's function still returns `to_jsonb` of x's
//      rows (the 0104/0106 wrapper form), and x is a live row set.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { REPO, functions, functionBody } from '../lib/migrations.mjs';

const APP = resolve(REPO, 'packages/app/src');
const WRAPPER = 'packages/app/src/lib/db.ts';
const SHAPES = 'packages/app/src/lib/dbShapes.ts';

/** Result casts outside lib/db.ts. Lower it when you remove one (rule 2). */
export const CAST_CEILING = 77;

function appFiles(dir = APP, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '__tests__' || name === 'node_modules') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) appFiles(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

/** `data as X`, `result as X`, `(data ?? []) as X[]` — a hand-typed result. */
export const RESULT_CAST = /\b(?:data|result|res)\b\)?(?:\s*\?\?\s*[^;\n]*?\))?\s+as\s+(?!const\b)/g;

test('the app calls the database only through lib/db.ts', () => {
  const direct = [];
  for (const f of appFiles()) {
    const rel = relative(REPO, f);
    if (rel === WRAPPER) continue;
    const s = stripComments(readFileSync(f, 'utf8'));
    for (const m of s.matchAll(/\.rpc\s*(?:<[^>]*>)?\(/g)) direct.push(`${rel}:${s.slice(0, m.index).split('\n').length}`);
  }
  assert.deepEqual(direct, [], `call rpc()/rpcOrThrow() from lib/db.ts instead (typed name and arguments):\n${direct.join('\n')}`);
});

test(`result casts outside lib/db.ts only go down (ceiling ${CAST_CEILING})`, () => {
  let n = 0;
  for (const f of appFiles()) {
    if (relative(REPO, f) === WRAPPER) continue;
    n += (stripComments(readFileSync(f, 'utf8')).match(RESULT_CAST) ?? []).length;
  }
  assert.ok(n >= 40, `only ${n} casts counted — the pattern stopped matching (vacuous)`);
  assert.ok(n <= CAST_CEILING, `${n} result casts, ceiling ${CAST_CEILING}: give the function an entry in lib/dbShapes.ts instead of casting at the call site`);
  assert.equal(n, CAST_CEILING, `${n} result casts, below the ceiling — lower CAST_CEILING to ${n} so the freed slots cannot be spent again`);
});

/** [{ fn, asOf, derivedFrom, line }] from the JsonShapes interface. */
export function shapeEntries(text) {
  const body = text.slice(text.indexOf('export interface JsonShapes {'));
  const out = [];
  for (const m of body.matchAll(/\/\*\*\s*@shape-as-of (\d{4})([^*]*)\*\/\s*\n\s*([a-z_0-9]+):/g)) {
    out.push({ fn: m[3], asOf: m[1], derivedFrom: m[2].match(/@derived-from ([a-z_0-9]+)/)?.[1] ?? null });
  }
  const keys = [...body.matchAll(/^\s{2}([a-z_0-9]+):/gm)].map((m) => m[1]);
  return { entries: out, keys };
}

/** The latest migration that can change F's result: F's own latest definition,
 *  or that of a jsonb function F's body hands its result back from
 *  (`return class_plan(…)` — set_class_plan's shape IS class_plan's). */
export function effectiveAsOf(fn, live, seen = new Set()) {
  seen.add(fn);
  const defs = live.get(fn);
  let latest = defs.map((d) => d.file.slice(0, 4)).sort().at(-1);
  let via = null;
  for (const d of defs) {
    for (const m of functionBody(d).matchAll(/\breturn\s+(?:public\.)?([a-z_0-9]+)\s*\(/gi)) {
      const inner = m[1].toLowerCase();
      if (seen.has(inner) || !live.get(inner)?.every((x) => x.returns === 'jsonb')) continue;
      const sub = effectiveAsOf(inner, live, seen);
      if (sub.latest > latest) { latest = sub.latest; via = sub.via ?? inner; }
    }
  }
  return { latest, via };
}

/** Problems with the shape map's entries, as strings (empty = fine). */
export function stampProblems(entries, live) {
  const problems = [];
  for (const e of entries) {
    const defs = live.get(e.fn);
    if (!defs) { problems.push(`${e.fn}: no live function of that name`); continue; }
    if (!defs.every((d) => d.returns === 'jsonb')) problems.push(`${e.fn}: returns ${defs.map((d) => d.returns).join(' | ')}, not jsonb — the generated type already has its shape; remove the entry`);
    const { latest, via } = effectiveAsOf(e.fn, live);
    if (e.asOf !== latest) {
      const where = via ? `${via} (whose result ${e.fn} returns)` : e.fn;
      const file = (live.get(via ?? e.fn)).find((d) => d.file.startsWith(latest))?.file ?? latest;
      problems.push(`${e.fn}: ${where} was restated in ${file} since this shape was matched (@shape-as-of ${e.asOf}) — re-read its keys, fix the type in its lib file if they moved, then set @shape-as-of ${latest}`);
    }
    if (e.derivedFrom) {
      const inner = live.get(e.derivedFrom);
      if (!inner?.some((d) => d.rowset)) problems.push(`${e.fn}: @derived-from ${e.derivedFrom}, which is not a live row set`);
      const body = defs.length === 1 ? functionBody(defs[0]) : '';
      if (!new RegExp(`to_jsonb\\(\\s*\\w+\\s*\\)[\\s\\S]*\\bfrom\\s+(?:public\\.)?${e.derivedFrom}\\s*\\(`).test(body)) {
        problems.push(`${e.fn}: no longer returns to_jsonb of ${e.derivedFrom}'s rows, so its shape is not derived — write it by hand`);
      }
    }
  }
  return problems;
}

test('every jsonb shape names the migration it was matched to, and it is the latest', () => {
  const { live } = functions();
  const { entries, keys } = shapeEntries(readFileSync(resolve(REPO, SHAPES), 'utf8'));
  assert.ok(entries.length >= 30, `only ${entries.length} entries read from ${SHAPES} — its layout changed`);
  assert.deepEqual(keys.filter((k) => !entries.some((e) => e.fn === k)), [], 'every entry needs a /** @shape-as-of NNNN */ line above it');
  const problems = stampProblems(entries, live);
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
});

test('the stamp check fails a stale stamp, directly and through a delegated result (mutation pins, P9)', () => {
  const { live } = functions();
  assert.match(stampProblems([{ fn: 'class_progress', asOf: '0001', derivedFrom: null }], live).join('\n'), /was restated in/);
  // set_class_plan was last defined in 0088 but returns class_plan(), restated later.
  const own = live.get('set_class_plan')[0].file.slice(0, 4);
  assert.match(stampProblems([{ fn: 'set_class_plan', asOf: own, derivedFrom: null }], live).join('\n'), /class_plan \(whose result set_class_plan returns\)/);
  assert.match(stampProblems([{ fn: 'list_bank_json', asOf: effectiveAsOf('list_bank_json', live).latest, derivedFrom: 'list_class_members' }], live).join('\n'), /no longer returns to_jsonb/);
});

// ---- slice 5: the viewer's seams and the grading worker ------------------------
// (The Edge Functions are typechecked separately: CI's `deno check` step.)
// Their calls go straight to a client's .rpc(), so the TYPE on that client is
// the whole check. Pin it, so a seam re-declared as `rpc(name: string, …)` or a
// worker file reaching for the untyped SupabaseClient goes red. Not seen: a
// client cast through `any` / `as never` at a call site.
test('the viewer seams and the worker call through the schema-typed client', () => {
  for (const f of ['packages/viewer/src/blocks/videoSourceSeam.ts', 'packages/viewer/src/blocks/photoLinkSeam.ts']) {
    const s = stripComments(readFileSync(resolve(REPO, f), 'utf8'));
    assert.match(s, /\brpc:\s*TypedRpc\['rpc'\];/, `${f}: its client's rpc must be TypedRpc['rpc'] (@activity/db-types/rpc)`);
  }
  const worker = resolve(REPO, 'packages/grading-worker');
  const walk = (d, out = []) => {
    for (const n of readdirSync(d)) {
      if (n === 'node_modules' || n === 'dist') continue;
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p, out); else if (/\.ts$/.test(n)) out.push(p);
    }
    return out;
  };
  const files = [...walk(join(worker, 'src')), ...walk(join(worker, 'tests'))];
  assert.ok(files.some((f) => f.includes('/cli/')), 'the worker walk must reach src/cli (vacuity)');
  const untyped = files.filter((f) => !f.endsWith('/src/db.ts'))
    .filter((f) => /\bSupabaseClient\b/.test(stripComments(readFileSync(f, 'utf8'))))
    .map((f) => relative(REPO, f));
  assert.deepEqual(untyped, [], 'grading-worker: use WorkerClient (src/db.ts), not the untyped SupabaseClient');
  assert.match(readFileSync(join(worker, 'src/db.ts'), 'utf8'), /WorkerClient = Omit<SupabaseClient<Database>, 'rpc'> & TypedRpc/);
});
