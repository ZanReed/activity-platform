// =============================================================================
// scripts/lib/migrations.mjs — the ONE parser of supabase/migrations/*.sql
// -----------------------------------------------------------------------------
// Review C1 / design pass D5 (docs/design/database-snapshot-and-types.md):
// four tests used to carry four hand-rolled copies of these regexes, and they
// disagreed (rowset-rpc-bounds keyed overloads by arity, so an overload of the
// same arity but another type silently replaced the old one in its view).
// These readers go through here (other tests still read the SQL themselves —
// TODOS → "Database snapshot and types" lists them):
//
//   scripts/tests/rowset-rpc-bounds.test.mjs   row-set functions
//   scripts/tests/rpc-arguments.test.mjs       live overloads + parameters
//   scripts/tests/postgrest-hints.test.mjs     named constraints
//   scripts/tests/data-map-coverage.test.mjs   tables and added columns
//   scripts/function-index.mjs                 docs/function-index.md
//
// What it models, and its honest limits. It is a node reading of the SQL, not
// Postgres: the LATEST `create function` per (name, input TYPES) wins, which
// is Postgres's own overload identity; a `drop function` removes by types when
// it gives them and every overload when it does not. A `create function` or
// `drop function` written INSIDE a body (an EXECUTE string, a DO block) is
// read as if it ran unconditionally — 0031's `rls_auto_enable` is one, and it
// is live; functions in a schema other than `public` are not seen. On 2026-11-26 it derived 228 functions with the same names, overloads
// and security (34 invoker) as the live `public` schema; scripts/tests/
// migrations-lib.test.mjs pins the cases that make it right.
// =============================================================================

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// ---- text helpers ---------------------------------------------------------------

/** Blanks comments and single-quoted literals in ONE left-to-right pass (a
 *  `--` inside a literal is text; an apostrophe in a comment is not a quote).
 *  Newlines are KEPT, so line numbers in the stripped text are the file's. A
 *  literal becomes `''` plus its newlines. Dollar-quoted bodies stay: the
 *  definitions sit outside them. */
export function stripSql(sql) {
  return sql.replace(/'(?:[^']|'')*'|--[^\n]*|\/\*[\s\S]*?\*\//g, (m) => {
    const nl = m.replace(/[^\n]/g, '');
    return m.startsWith("'") ? `''${nl}` : nl;
  });
}

/** Splits on top-level commas (types like numeric(10,2) hold commas). */
export function splitTop(s) {
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
export function closeOf(s, i, open = '(', close = ')') {
  let depth = 1;
  while (depth > 0 && i < s.length) {
    if (s[i] === open) depth++;
    else if (s[i] === close) depth--;
    i++;
  }
  return i;
}

const lineAt = (s, i) => s.slice(0, i).split('\n').length;

// ---- files ------------------------------------------------------------------------

const cache = new Map();

/** [{ file, raw, sql }] in apply order; `sql` is stripSql(raw). */
export function readMigrations(root = REPO) {
  if (cache.has(root)) return cache.get(root);
  const dir = resolve(root, 'supabase/migrations');
  const out = readdirSync(dir)
    .filter((f) => /^\d{4}_.*\.sql$/.test(f))
    .sort()
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf8');
      return { file, raw, sql: stripSql(raw) };
    });
  cache.set(root, out);
  return out;
}

/** The highest migration number, e.g. '0106'. */
export function highestMigration(root = REPO) {
  return readMigrations(root).at(-1)?.file.slice(0, 4);
}

// ---- functions ----------------------------------------------------------------------

// Postgres names an overload by its INPUT TYPES, not its arity or parameter
// names: f(uuid) and f(int) are two functions, and `create or replace f(p_new
// uuid)` over f(p_old uuid) would replace (Postgres refuses the rename, so
// migrations drop first).
const MULTIWORD = new Set(['double', 'character', 'timestamp', 'time', 'bit', 'interval']);
const ALIAS = {
  int: 'integer', int4: 'integer', int8: 'bigint', int2: 'smallint', bool: 'boolean', float8: 'double precision',
  float4: 'real', varchar: 'text', 'character varying': 'text', timestamptz: 'timestamp with time zone',
  'timestamp without time zone': 'timestamp', decimal: 'numeric',
};

/** One argument's type, from `[mode] [name] type [default …]` (a drop may omit the name). */
export function argType(arg) {
  const t = arg.replace(/^(in|inout|variadic)\s+/i, '').replace(/\s+(default\b|=)[\s\S]*$/i, '')
    .replace(/"/g, '').replace(/\bpublic\./gi, '').replace(/\([^)]*\)/g, '').toLowerCase().trim().split(/\s+/);
  const type = (t.length >= 2 && !MULTIWORD.has(t[0]) ? t.slice(1) : t).join(' ');
  const base = type.replace(/\[\]$/, '');
  return (ALIAS[base] ?? base) + (type.endsWith('[]') ? '[]' : '');
}

/** `returns …` right after the parameter list, from index `i`. */
function readReturns(sql, i) {
  const m = sql.slice(i).match(/^\s*returns\s+(setof\s+[\w."]+|table\s*\(|[\w."]+(?:\s+with(?:out)?\s+time\s+zone)?(?:\[\])?)/i);
  if (!m) return { returns: '?', rowset: false, end: i };
  let end = i + m[0].length;
  let returns = m[1].toLowerCase().replace(/\s+/g, ' ').replace(/"/g, '').replace(/\bpublic\./g, '');
  if (/^table\s*\($/.test(returns)) {
    const close = closeOf(sql, end);
    const cols = splitTop(sql.slice(end, close - 1)).map((c) => c.split(/\s+/)[0].toLowerCase());
    returns = `table(${cols.join(', ')})`;
    end = close;
  } else if (!/^setof\b/.test(returns)) {
    const base = returns.replace(/\[\]$/, '');
    returns = (ALIAS[base] ?? base) + (returns.endsWith('[]') ? '[]' : '');
  }
  return { returns, rowset: /^(setof|table)\b/.test(returns), end };
}

/** The attribute text of a definition (`language … security definer …`), which
 *  Postgres allows before AND after the body: `from` sits past `returns`. */
function readAttributes(sql, from) {
  const open = sql.slice(from).match(/\bas\s+(\$[\w]*\$)/i);
  if (!open) return sql.slice(from, sql.indexOf(';', from));
  const bodyStart = from + open.index + open[0].length;
  const bodyEnd = sql.indexOf(open[1], bodyStart);
  const semi = sql.indexOf(';', bodyEnd + open[1].length);
  return sql.slice(from, from + open.index) + ' ' + sql.slice(bodyEnd + open[1].length, semi < 0 ? undefined : semi);
}

/**
 * Every function the migrations define, as of the last one.
 *   live:    Map name -> [Def] (one per live overload)
 *   history: Map name -> [{ file, line }] every `create function`, dropped or not
 * Def = { name, types, params: [{ name, type, optional }], returns, rowset,
 *         security: 'definer' | 'invoker', file, line }
 */
export function functions(root = REPO) {
  const latest = new Map(); // `${name}(${types})` -> Def
  const history = new Map();
  const create = /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?([a-z_0-9]+)"?\s*\(/gi;
  const drop = /drop\s+function\s+(?:if\s+exists\s+)?([^;]+);/gi;
  for (const { file, sql } of readMigrations(root)) {
    const events = [];
    for (const m of sql.matchAll(create)) {
      const start = m.index + m[0].length;
      const close = closeOf(sql, start);
      const args = splitTop(sql.slice(start, close - 1)).filter((p) => !/^out\s/i.test(p));
      const params = args.map((p) => {
        const t = p.replace(/^(in|inout|variadic)\s+/i, '');
        return { name: t.split(/\s+/)[0].replace(/"/g, '').toLowerCase(), type: argType(p), optional: /\bdefault\b|=/i.test(t) };
      });
      const types = params.map((p) => p.type).join(',');
      const { returns, rowset, end } = readReturns(sql, close);
      const security = /\bsecurity\s+definer\b/i.test(readAttributes(sql, end)) ? 'definer' : 'invoker';
      const name = m[1].toLowerCase();
      const line = lineAt(sql, m.index);
      if (!history.has(name)) history.set(name, []);
      history.get(name).push({ file, line });
      events.push({ at: m.index, run: () => latest.set(`${name}(${types})`, {
        name, types, params, returns, rowset, security, file, line,
      }) });
    }
    for (const m of sql.matchAll(drop)) {
      // `drop function a(uuid), b(text, int) cascade;` — every name in the list.
      const ifExists = /^drop\s+function\s+if\s+exists\b/i.test(m[0]);
      for (const d of m[1].matchAll(/(?:public\.)?"?([a-z_0-9]+)"?\s*(\(((?:[^()]|\([^)]*\))*)\))?/gi)) {
        if (/^(cascade|restrict)$/i.test(d[1])) continue;
        const name = d[1].toLowerCase();
        const types = d[2] ? splitTop(d[3]).map(argType).join(',') : null;
        events.push({ at: m.index, run: () => {
          const mine = [...latest.keys()].filter((k) => k.startsWith(`${name}(`));
          if (types === null) return mine.forEach((k) => latest.delete(k));
          if (latest.has(`${name}(${types})`)) return latest.delete(`${name}(${types})`);
          // No exact match. `if exists` is then a no-op in Postgres; a plain drop
          // must have matched something, so it is a type spelling the
          // normalizer missed: fall back to the one overload of that arity.
          if (ifExists) return;
          const n = types ? types.split(',').length : 0;
          const same = mine.filter((k) => latest.get(k).params.length === n);
          if (same.length === 1) latest.delete(same[0]);
        } });
      }
    }
    events.sort((a, b) => a.at - b.at).forEach((e) => e.run());
  }
  const live = new Map();
  for (const d of [...latest.values()].sort((a, b) => a.name.localeCompare(b.name) || a.types.localeCompare(b.types))) {
    if (!live.has(d.name)) live.set(d.name, []);
    live.get(d.name).push(d);
  }
  return { live, history };
}

// ---- constraints and tables -------------------------------------------------------------

/** Every `constraint <name>` a migration writes (comments excluded; a
 *  `drop constraint if exists x` names x, not `if`). */
export function constraintNames(root = REPO) {
  const out = new Set();
  for (const { sql } of readMigrations(root)) {
    for (const m of sql.matchAll(/\bconstraint\s+(?:if\s+exists\s+)?([a-z_][a-z0-9_]*)/gi)) out.add(m[1].toLowerCase());
  }
  return out;
}

/** `create table` blocks and `alter table … add column` pairs, comments excluded.
 *  A block ends at the first `);` at line start — the shape every migration here uses. */
export function tableColumns(root = REPO) {
  const created = [], added = [];
  for (const { file, sql } of readMigrations(root)) {
    for (const m of sql.matchAll(/create table (?:if not exists )?(?:public\.)?(\w+)\s*\(([\s\S]*?)\n\);/gi)) {
      created.push({ file, table: m[1], body: m[2] });
    }
    for (const m of sql.matchAll(/alter table (?:if exists )?(?:only )?(?:public\.)?(\w+)\s+add column\s+(?:if not exists\s+)?(\w+)/gi)) {
      added.push({ file, table: m[1], column: m[2] });
    }
  }
  return { created, added };
}
