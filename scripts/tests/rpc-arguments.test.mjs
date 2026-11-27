// =============================================================================
// rpc-arguments.test.mjs — every RPC the code calls exists, with the arguments
// it is sent (design pass C1, slice 1: docs/design/database-snapshot-and-types.md)
// -----------------------------------------------------------------------------
// The app, the viewer, the grading worker, the Edge Functions and the scripts
// (the batch importer, the playtest and e2e seeders) call database
// functions BY STRING, with hand-built argument objects. Nothing typed checks
// either half: rename a parameter in a migration, drop a function, or add an
// overload, and every caller still compiles and every mocked test still
// passes. The first signal would be a PostgREST error in a classroom
// (PGRST202 "could not find the function", PGRST203 "could not choose").
//
//   DEFINITIONS are DERIVED from the migrations: the LATEST `create function`
//   per (name, input TYPES) wins — Postgres's own overload identity; a later
//   `drop function` removes it (by types when the drop gives them, every
//   overload when it does not). OUT parameters are not inputs. A parameter
//   with `default` (or `=`) is optional. On 2026-11-26 this derived 228
//   overloads, the same 228 the live `public` schema held.
//   CALLS are DERIVED from source (scripts/lib/rpc-calls.mjs → SOURCE_DIRS):
//   every `.rpc(`, every call of a file's own pass-through helper (a function,
//   arrow or method that hands one of its parameters to `.rpc(` or puts it in
//   a `/rpc/${…}` URL), and every literal `'/rpc/<name>'` URL, whose arguments
//   are the `JSON.stringify({…})` in the next argument. The name is a literal
//   or resolves through a string constant, an object property or a JSON file.
//   COMPLETENESS: every quoted string in those dirs that names a function some
//   migration created must be a call the scan saw, or be in NOT_A_CALL with
//   the reason (Fable review 2026-11-26: a nested generic,
//   `rpc<Record<string, unknown>>(…)`, hid the photo sweep's call, and a call
//   count floor could not notice).
//
// For each call: the function exists; every key sent is a parameter; every
// required parameter is sent; exactly ONE live overload fits (two fitting is
// PGRST203). Keys inside a conditional spread (`...(x ? { p_a } : {})`) are
// checked as sent-sometimes: they must exist, but cannot satisfy a required
// parameter. A call whose name or arguments the scan cannot read must be
// listed in UNREAD with the reason, and a stale UNREAD entry fails (P4).
//
// NOT checked: argument VALUES or types, result shapes (slice 4 types those),
// RLS / grants, and names built from template strings (they go in UNREAD).
// The migration half is scripts/lib/migrations.mjs, shared with the other
// three migration readers (review C1 slice 2).
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rpcCalls, quotedFunctionNames, aliasConflicts } from '../lib/rpc-calls.mjs';

/** Calls the scan cannot read, keyed `file:token`. Say why it is safe. */
export const UNREAD = {
  'packages/viewer/src/server/restClient.ts:fn: F':
    "the REST client's own `rpc<F extends FnName>(fn: F, …)` declaration, not a call; its callers (both Edge Functions' index.ts) pass literal names, which this scan reads, and `deno check` types them",
  'scripts/playtest.mjs:name':
    "the playtest seeder's `extras` table ([label, 'fn', {args}] rows) — local stack only, and a wrong name or argument fails the seed loudly the first time it runs",
};

/** Function names the code quotes without calling them. Say why. */
export const NOT_A_CALL = {
  list_grading_queue:
    "authContract.json's rpcNames.gradingQueue, read only by authContract.test.ts; the app reads the queue through grading_queue (0104), and rowset-rpc-bounds' NEVER_CALL forbids calling this one",
};

// ---- source and migrations -------------------------------------------------------
// Both halves are shared (scripts/lib/rpc-calls.mjs, scripts/lib/migrations.mjs,
// review C1 slice 2); this file only holds the rule.


/** Problems for one call, as strings (empty = fine). */
export function check(call, live) {
  const defs = live.get(call.name);
  if (!defs) return [`${call.name}: no live definition in supabase/migrations (dropped, renamed, or never created)`];
  const fits = defs.filter((d) => {
    const ps = new Set(d.params.map((p) => p.name));
    return [...call.sure, ...call.maybe].every((k) => ps.has(k))
      && d.params.filter((p) => !p.optional).every((p) => call.sure.includes(p.name));
  });
  const shape = (d) => `${d.file}:${d.line} (${d.params.map((p) => p.name + (p.optional ? '?' : '')).join(', ')})`;
  if (fits.length === 1) return [];
  const sent = `sent {${call.sure.join(', ')}${call.maybe.length ? ` | sometimes ${call.maybe.join(', ')}` : ''}}`;
  if (fits.length === 0) return [`${call.name}: ${sent} fits no live overload — ${defs.map(shape).join(' | ')}`];
  return [`${call.name}: ${sent} fits ${fits.length} overloads (PGRST203) — ${fits.map(shape).join(' | ')}`];
}

// ---- the rule ---------------------------------------------------------------------

test('every RPC call names a live function with arguments one overload accepts', () => {
  const { live, calls } = rpcCalls();
  // Anti-vacuity (P9): both derivations see known cases.
  assert.ok(live.size >= 200, `only ${live.size} live functions derived — the migration parser is broken`);
  assert.equal(live.get('record_check')?.length, 1, 'the parser must see one live record_check');
  assert.ok(live.get('record_check')[0].params.length >= 15, 'the parser must read record_check\'s 15+ parameters');
  assert.ok((live.get('photo_answers_on')?.length ?? 0) >= 2, 'the parser must see both photo_answers_on overloads (0094 + 0099)');
  const named = new Set(calls.map((c) => c.name).filter(Boolean));
  assert.ok(calls.length >= 150, `only ${calls.length} call sites found — the source scan is broken`);
  assert.ok(named.size >= 100, `only ${named.size} distinct functions called — the source scan is broken`);
  for (const [n, why] of [
    ['mixed_class_summary', "a helper call through MIXED_PRACTICE_RPC.summary (mixedTeacher.ts)"],
    ['redeem_join_code', 'a name from authContract.json'],
    ['handoff_peek', "a ports.rpc call in an Edge Function handler"],
    ['work_photo_orphans', "sweep-work-photos' raw-fetch helper"],
    ['grading_queue', 'an app constant'],
    ['sweep_work_photos_due', 'a helper call with a nested generic, rpc<Record<string, unknown>>(…)'],
    ['sync_fact_scope', "the batch importer's call('/rpc/…', { body: JSON.stringify(…) })"],
    ['get_activity_analytics', "verify-analytics-e2e's URL-only helper, RPC('…') inside fetch"],
  ]) assert.ok(named.has(n), `the scan must see ${n} (${why})`);

  const problems = [];
  const unreadSeen = new Set();
  for (const c of calls) {
    const key = `${c.file}:${c.name ?? c.token}`;
    if (!c.name || c.opaque) {
      if (key in UNREAD) { unreadSeen.add(key); if (!c.name) continue; }
      else { problems.push(`${c.file}:${c.line} ${c.name ?? c.token}: the scan cannot read its ${c.name ? 'arguments' : 'name'} — make it a literal/constant, or add it to UNREAD with a reason`); continue; }
    }
    for (const p of check(c, live)) problems.push(`${c.file}:${c.line} ${p}`);
  }
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
  assert.deepEqual(aliasConflicts, [], 'a constant narrowed for the typed client names a different function than its value');
  for (const [k, why] of Object.entries(UNREAD)) {
    assert.ok(unreadSeen.has(k), `UNREAD['${k}'] matches no call any more — remove it`);
    assert.ok(why.length >= 20, `UNREAD['${k}']: say why it is safe`);
  }
});

test('every function name the code quotes is a call the scan saw (completeness)', () => {
  const called = new Set(rpcCalls().calls.map((c) => c.name));
  const quoted = quotedFunctionNames();
  const missed = [...quoted]
    .filter(([n]) => !called.has(n) && !(n in NOT_A_CALL))
    .map(([n, files]) => `${n} (quoted in ${[...files].join(', ')})`);
  assert.deepEqual(missed, [], `the scan never saw these as calls — a call shape it cannot read, or add to NOT_A_CALL with a reason:\n${missed.join('\n')}`);
  for (const [n, why] of Object.entries(NOT_A_CALL)) {
    assert.ok(quoted.has(n), `NOT_A_CALL.${n}: no source quotes it any more — remove it`);
    assert.ok(!called.has(n), `NOT_A_CALL.${n}: it IS called now — remove it`);
    assert.ok(why.length >= 20, `NOT_A_CALL.${n}: say why`);
  }
});

test('the checker fails each kind of drift (mutation pins, P9)', () => {
  const live = new Map([
    ['f', [{ name: 'f', file: 'x.sql', line: 1, params: [{ name: 'p_a', optional: false }, { name: 'p_b', optional: true }] }]],
    ['g', [
      { name: 'g', file: 'x.sql', line: 2, params: [] },
      { name: 'g', file: 'x.sql', line: 3, params: [{ name: 'p_id', optional: true }] },
    ]],
  ]);
  const call = (name, sure, maybe = []) => ({ name, sure, maybe, opaque: false });
  assert.deepEqual(check(call('f', ['p_a']), live), []);
  assert.deepEqual(check(call('f', ['p_a', 'p_b']), live), []);
  assert.match(check(call('nope', []), live)[0], /no live definition/);
  assert.match(check(call('f', ['p_a', 'p_typo']), live)[0], /fits no live overload/);
  assert.match(check(call('f', ['p_b']), live)[0], /fits no live overload/);        // required missing
  assert.match(check(call('f', [], ['p_a']), live)[0], /fits no live overload/);    // sometimes ≠ sent
  assert.match(check(call('f', ['p_a'], ['p_c']), live)[0], /fits no live overload/); // sometimes must exist
  assert.match(check(call('g', []), live)[0], /PGRST203/);                           // two overloads fit
  assert.deepEqual(check(call('g', ['p_id']), live), []);
});
