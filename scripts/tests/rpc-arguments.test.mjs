// =============================================================================
// rpc-arguments.test.mjs — every RPC the code calls exists, with the arguments
// it is sent (design pass C1, slice 1: docs/design/database-snapshot-and-types.md)
// -----------------------------------------------------------------------------
// The app, the viewer, the grading worker and the Edge Functions call database
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
//   CALLS are DERIVED from source (the same four dirs as rowset-rpc-bounds):
//   every `.rpc(` and every call of a file's own pass-through helper (a
//   function whose first parameter is a string it hands to `.rpc(` or to a
//   `/rest/v1/rpc/${…}` URL). The name is a literal or resolves through a
//   string constant, an object property or a JSON contract file.
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
// Slice 2 moves this parser into a shared module with the three other
// migration parsers (rowset-rpc-bounds, postgrestHints, data-map-coverage).
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Calls the scan cannot read, keyed `file:token`. Say why it is safe. */
export const UNREAD = {
  // Empty today: all 128 call sites are read. An entry looks like
  // 'packages/app/src/lib/x.ts:SOME_TOKEN': 'why the name/arguments are safe',
};

// ---- migrations ---------------------------------------------------------------

/** Drops comments and single-quoted literals in ONE left-to-right pass. */
function stripSql(sql) {
  return sql.replace(/'(?:[^']|'')*'|--[^\n]*|\/\*[\s\S]*?\*\//g, (m) => (m.startsWith("'") ? "''" : ''));
}

/** Splits on top-level commas (types like numeric(10,2) hold commas). */
function splitTop(s) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

/** Index just past the bracket that closes the one opened before `i`. */
function closeOf(s, i, open = '(', close = ')') {
  let depth = 1;
  while (depth > 0 && i < s.length) {
    if (s[i] === open) depth++;
    else if (s[i] === close) depth--;
    i++;
  }
  return i;
}

// Postgres names an overload by its INPUT TYPES, not its arity or its
// parameter names: f(uuid) and f(int) are two functions, and `create or
// replace f(p_new uuid)` over f(p_old uuid) replaces (Postgres refuses the
// rename, so migrations drop first).
const MULTIWORD = new Set(['double', 'character', 'timestamp', 'time', 'bit', 'interval']);
const ALIAS = {
  int: 'integer', int4: 'integer', int8: 'bigint', int2: 'smallint', bool: 'boolean', float8: 'double precision',
  float4: 'real', varchar: 'text', 'character varying': 'text', timestamptz: 'timestamp with time zone',
  'timestamp without time zone': 'timestamp', decimal: 'numeric',
};
/** One argument's type, from `[mode] [name] type [default …]` (a drop may omit the name). */
function argType(arg) {
  const t = arg.replace(/^(in|inout|variadic)\s+/i, '').replace(/\s+(default\b|=)[\s\S]*$/i, '')
    .replace(/"/g, '').replace(/\bpublic\./gi, '').replace(/\([^)]*\)/g, '').toLowerCase().trim().split(/\s+/);
  const type = (t.length >= 2 && !MULTIWORD.has(t[0]) ? t.slice(1) : t).join(' ');
  const base = type.replace(/\[\]$/, '');
  return (ALIAS[base] ?? base) + (type.endsWith('[]') ? '[]' : '');
}

/** Map name -> [{ params: [{name, optional}], file, line }] of live overloads. */
export function liveFunctions(root = REPO) {
  return parseMigrations(root).live;
}

function parseMigrations(root) {
  const dir = resolve(root, 'supabase/migrations');
  const files = readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
  const latest = new Map(); // `${name}(${types})` -> def
  const ever = new Set();   // every name any migration created, dropped or not
  const create = /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?([a-z_0-9]+)"?\s*\(/gi;
  const drop = /drop\s+function\s+(?:if\s+exists\s+)?([^;]+);/gi;
  for (const f of files) {
    const raw = readFileSync(join(dir, f), 'utf8');
    const sql = stripSql(raw); // same length up to literals, so line numbers stay close
    const events = [];
    for (const m of sql.matchAll(create)) {
      const start = m.index + m[0].length;
      const args = splitTop(sql.slice(start, closeOf(sql, start) - 1)).filter((p) => !/^out\s/i.test(p));
      const types = args.map(argType).join(',');
      const params = args
        .map((p) => {
          const t = p.replace(/^(in|inout|variadic)\s+/i, '');
          return { name: t.split(/\s+/)[0].replace(/"/g, '').toLowerCase(), optional: /\bdefault\b|=/i.test(t) };
        });
      const name = m[1].toLowerCase();
      ever.add(name);
      events.push({ at: m.index, run: () => latest.set(`${name}(${types})`, {
        name, params, file: f, line: sql.slice(0, m.index).split('\n').length,
      }) });
    }
    for (const m of sql.matchAll(drop)) {
      for (const d of m[1].matchAll(/(?:public\.)?"?([a-z_0-9]+)"?\s*(\(((?:[^()]|\([^)]*\))*)\))?/gi)) {
        if (/^(cascade|restrict)$/i.test(d[1])) continue;
        const name = d[1].toLowerCase();
        const types = d[2] ? splitTop(d[3]).map(argType).join(',') : null;
        events.push({ at: m.index, run: () => {
          const mine = [...latest.keys()].filter((k) => k.startsWith(`${name}(`));
          if (types === null) return mine.forEach((k) => latest.delete(k));
          if (latest.has(`${name}(${types})`)) return latest.delete(`${name}(${types})`);
          // A type spelling the normalizer missed: fall back to the one overload of that arity.
          const n = types ? types.split(',').length : 0;
          const same = mine.filter((k) => latest.get(k).params.length === n);
          if (same.length === 1) latest.delete(same[0]);
        } });
      }
    }
    events.sort((a, b) => a.at - b.at).forEach((e) => e.run());
  }
  const out = new Map();
  for (const d of latest.values()) {
    if (!out.has(d.name)) out.set(d.name, []);
    out.get(d.name).push(d);
  }
  return { live: out, ever };
}

// ---- source ---------------------------------------------------------------------

const SOURCE_DIRS = ['packages/app/src', 'packages/viewer/src', 'packages/grading-worker/src', 'supabase/functions'];
const SKIP_DIR = new Set(['node_modules', 'dist', '__tests__', '__mocks__', 'fixtures']);

function sourceFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) sourceFiles(p, out);
    else if (/\.(ts|tsx|js|mjs|json)$/.test(name) && !/\.(test|spec)\.|\.bundle\.js$|\.d\.ts$/.test(name)) out.push(p);
  }
  return out;
}

/** Blanks comments (keeping newlines, so line numbers hold) and leaves strings alone. */
function stripJs(src) {
  return src.replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m) =>
    m.startsWith('/') ? m.replace(/[^\n]/g, ' ') : m);
}

/** `key -> rpc name` from string constants, object properties and JSON keys,
 *  limited to names some migration created (a DROPPED function's constant
 *  must still resolve, so its caller reports "no live definition"). A key that maps to two
 *  different names is ambiguous and dropped (the call then lands in UNREAD). */
function constantTable(srcs, ever) {
  const seen = new Map();
  for (const { s } of srcs) {
    for (const m of s.matchAll(/["']?([A-Za-z_$][\w$]*)["']?\s*[:=]\s*['"]([a-z][a-z_0-9]*)['"]/g)) {
      if (!ever.has(m[2])) continue;
      if (!seen.has(m[1])) seen.set(m[1], new Set());
      seen.get(m[1]).add(m[2]);
    }
  }
  const out = new Map();
  for (const [k, v] of seen) if (v.size === 1) out.set(k, [...v][0]);
  // One level of aliasing: `const X_RPC = AUTH_CONTRACT.rpcNames.redeemJoinCode;`
  for (const { s } of srcs) {
    for (const m of s.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\.([A-Za-z_$][\w$]*)\s*;/g)) {
      const name = out.get(m[2]);
      if (name && !out.has(m[1])) out.set(m[1], name);
    }
  }
  return out;
}

/** Keys of an object literal starting at `s[i] === '{'`: `{ sure, maybe, opaque }`. */
function objectKeys(s, i) {
  const end = closeOf(s, i + 1, '{', '}');
  const sure = [], maybe = [];
  let opaque = false;
  for (const part of splitTop(s.slice(i + 1, end - 1))) {
    if (part.startsWith('...')) {
      // A conditional spread of literals: its keys are sent sometimes.
      const inner = part.slice(3);
      let found = false;
      for (let j = 0; j < inner.length; j++) {
        if (inner[j] !== '{') continue;
        const sub = objectKeys(inner, j);
        maybe.push(...sub.sure, ...sub.maybe);
        opaque ||= sub.opaque;
        found = true;
        j = closeOf(inner, j + 1, '{', '}') - 1;
      }
      if (!found) opaque = true;
      continue;
    }
    const k = part.match(/^\[?['"]?([A-Za-z_$][\w$]*)['"]?\]?/);
    if (!k || part.startsWith('[')) { opaque = true; continue; }
    sure.push(k[1]);
  }
  return { sure, maybe, opaque };
}

export function rpcCalls(root = REPO) {
  const { live, ever } = parseMigrations(root);
  const srcs = SOURCE_DIRS.flatMap((d) => sourceFiles(resolve(root, d)))
    .map((p) => ({ p, rel: relative(root, p), s: stripJs(readFileSync(p, 'utf8')) }));
  const consts = constantTable(srcs, ever);
  const calls = [];
  for (const { rel, s } of srcs) {
    if (rel.endsWith('.json')) continue;
    // Pass-through helpers: `function call<T>(fn: string, …)` / `async rpc(name, args)`
    // whose body hands that first parameter to `.rpc(` or a `/rpc/${…}` URL.
    const helpers = new Set(), passParams = new Set();
    for (const m of s.matchAll(/(?:function\s+([A-Za-z_$][\w$]*)|(?:^|[\s,{])(?:async\s+)?([A-Za-z_$][\w$]*))\s*(?:<[^>()]*>)?\s*\(\s*([A-Za-z_$][\w$]*)\s*(?::\s*string)?\s*,/gm)) {
      const name = m[1] ?? m[2], param = m[3];
      if (['if', 'for', 'while', 'switch', 'catch', 'return'].includes(name)) continue;
      const body = s.slice(m.index, m.index + 600);
      if (body.includes(`.rpc(${param}`) || body.includes(`/rpc/\${${param}}`)) { helpers.add(name); passParams.add(param); }
    }
    const names = ['\\.rpc', ...[...helpers].map((h) => `(?<![\\w$.])${h}`)];
    const rx = new RegExp(`(?:${names.join('|')})\\s*(?:<[^>()]*>)?\\(\\s*`, 'g');
    for (const m of s.matchAll(rx)) {
      const at = m.index + m[0].length;
      const argsAt = s.slice(at, closeOf(s, at) - 1);
      const [first = '', second] = splitTop(argsAt);
      if (/^[A-Za-z_$][\w$]*\s*(:|$)/.test(first) && passParams.has(first.split(/[\s:]/)[0])) continue; // the helper's own body / signature
      if (/^\s*async\b|=>/.test(first)) continue;
      const lit = first.match(/^['"]([a-z][a-z_0-9]*)['"]$/);
      const name = lit ? lit[1] : /^[A-Za-z_$][\w$.]*$/.test(first) ? consts.get(first.split('.').pop()) ?? null : null;
      let keys;
      if (second === undefined) keys = { sure: [], maybe: [], opaque: false };
      else if (second.startsWith('{')) keys = objectKeys(second, 0);
      else keys = { sure: [], maybe: [], opaque: true };
      calls.push({ file: rel, line: s.slice(0, m.index).split('\n').length, token: first, name, ...keys });
    }
  }
  return { live, calls };
}

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
  assert.ok(calls.length >= 120, `only ${calls.length} call sites found — the source scan is broken`);
  assert.ok(named.size >= 100, `only ${named.size} distinct functions called — the source scan is broken`);
  for (const [n, why] of [
    ['mixed_class_summary', "a helper call through MIXED_PRACTICE_RPC.summary (mixedTeacher.ts)"],
    ['redeem_join_code', 'a name from authContract.json'],
    ['handoff_peek', "a ports.rpc call in an Edge Function handler"],
    ['work_photo_orphans', "sweep-work-photos' raw-fetch helper"],
    ['grading_queue', 'an app constant'],
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
  for (const [k, why] of Object.entries(UNREAD)) {
    assert.ok(unreadSeen.has(k), `UNREAD['${k}'] matches no call any more — remove it`);
    assert.ok(why.length >= 20, `UNREAD['${k}']: say why it is safe`);
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
