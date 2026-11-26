// =============================================================================
// scripts/lib/rpc-calls.mjs — every database call the code makes, read from source
// -----------------------------------------------------------------------------
// The source half of review C1's guards (the migration half is migrations.mjs).
// Reads the four dirs that talk to PostgREST — the app, the viewer and its
// server handlers, the grading worker, the Edge Functions — for every `.rpc(`
// and every call of a file's own pass-through helper (a function whose first
// parameter is a string it hands to `.rpc(` or to a `/rest/v1/rpc/${…}` URL).
// The name is a literal or resolves through a string constant, an object
// property or a JSON contract file; the arguments are an object literal's keys,
// with a conditional spread's keys as "sent sometimes".
//
// Used by scripts/tests/rpc-arguments.test.mjs (the arguments) and
// scripts/function-index.mjs (the index's "called from" column).
// =============================================================================

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { REPO, functions, splitTop, closeOf } from './migrations.mjs';

/** Where a call lives, for the index: app / viewer / worker / edge / scripts. */
export function areaOf(file) {
  if (file.startsWith('packages/app/')) return 'app';
  if (file.startsWith('packages/viewer/')) return 'viewer';
  if (file.startsWith('packages/grading-worker/')) return 'worker';
  if (file.startsWith('supabase/functions/')) return 'edge';
  if (file.startsWith('scripts/')) return 'scripts';
  return 'other';
}

/** Everything that talks to PostgREST. `scripts/` holds the batch importer
 *  (the curriculum mirrors' only writer) and the local e2e/playtest seeders. */
export const SOURCE_DIRS = ['packages/app/src', 'packages/viewer/src', 'packages/grading-worker/src', 'supabase/functions', 'scripts'];
const SKIP_DIR = new Set(['node_modules', 'dist', '__tests__', '__mocks__', 'fixtures']);
const SKIP_PATH = new Set(['scripts/tests', 'scripts/lib']); // the guards themselves

function sourceFiles(root, dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const p = join(dir, name);
    if (SKIP_PATH.has(relative(root, p))) continue;
    if (statSync(p).isDirectory()) sourceFiles(root, p, out);
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
 *  different names is ambiguous and dropped (the caller reports it unread). */
/** Narrowing literals that disagree with the value they narrow (see below). */
export const aliasConflicts = [];

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
  // One level of aliasing: `const X_RPC = AUTH_CONTRACT.rpcNames.redeemJoinCode;`,
  // optionally narrowed for the typed client: `… as 'redeem_join_code';`. The
  // RUNTIME value (the property's) wins; a narrowing literal that disagrees
  // with it is recorded, because tsc would check the wrong function's arguments.
  for (const { rel, s } of srcs) {
    for (const m of s.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\.([A-Za-z_$][\w$]*)\s*(?:as\s+['"]([a-z][a-z_0-9]*)['"]\s*)?;/g)) {
      const name = out.get(m[2]);
      if (name && !out.has(m[1])) out.set(m[1], name);
      if (name && m[3] && m[3] !== name) aliasConflicts.push(`${rel}: ${m[1]} is narrowed to '${m[3]}' but its value is '${name}'`);
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

// A TypeScript generic, two levels deep: `<T>`, `<Record<string, unknown>>`.
const GENERIC = String.raw`(?:<(?:[^<>()]|<(?:[^<>()]|<[^<>()]*>)*>)*>)?`;
const ID = String.raw`[A-Za-z_$][\w$]*`;
const NOT_A_NAME = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'function']);

/** Pass-through helpers in one file: a function, arrow or method one of whose
 *  parameters it hands to `.rpc(` or puts in a `/rpc/${…}` URL. Returns
 *  name -> { nameIdx, argsIdx | null, start, end } (argsIdx null = it only
 *  builds the URL; the arguments travel in the enclosing call's body). */
function helpersIn(s, wrapped = false) {
  const out = new Map();
  const def = new RegExp(String.raw`(?:function\s+(${ID})\s*${GENERIC}\s*\(|(?:const|let|var)\s+(${ID})\s*=\s*(?:async\s*)?\(|(?:^|[\s,{])(?:async\s+)?(${ID})\s*${GENERIC}\s*\()`, 'gm');
  for (const m of s.matchAll(def)) {
    const name = m[1] ?? m[2] ?? m[3];
    if (NOT_A_NAME.has(name)) continue;
    const open = m.index + m[0].length;
    const close = closeOf(s, open);
    const params = splitTop(s.slice(open, close - 1)).map((p) => (p.replace(/^\.\.\./, '').match(new RegExp(`^${ID}`)) ?? [''])[0]);
    const after = s.slice(close);
    const arrow = after.match(/^\s*(?::[^=;{]*)?=>\s*/);
    if (m[2] && !arrow) continue; // `const x = (…)` that is not an arrow
    let bodyEnd;
    if (arrow && s[close + arrow[0].length] !== '{') {
      // An expression arrow: to the end of its statement.
      const semi = after.slice(arrow[0].length).search(/;|\n(?=\s*(?:const|let|var|function|export|async|\}))/);
      bodyEnd = semi < 0 ? s.length : close + arrow[0].length + semi;
    } else {
      const brace = s.indexOf('{', close);
      if (brace < 0) continue;
      bodyEnd = closeOf(s, brace + 1, '{', '}');
    }
    const body = s.slice(close, bodyEnd);
    const nameIdx = params.findIndex((p) => p && (body.includes(`.rpc(${p}`) || body.includes(`/rpc/\${${p}}`)
      || (wrapped && new RegExp(`(?<![\\w$.])rpc(?:OrThrow)?\\s*${GENERIC}\\(\\s*${p.replace(/\$/g, '\\$')}\\b`).test(body))));
    if (nameIdx < 0) continue;
    out.set(name, { nameIdx, argsIdx: nameIdx + 1 < params.length ? nameIdx + 1 : null, param: params[nameIdx], start: m.index, end: bodyEnd });
  }
  return out;
}

/** Keys of the `JSON.stringify({…})` inside an argument (a fetch/init object). */
function bodyKeys(arg) {
  if (arg === undefined) return { sure: [], maybe: [], opaque: true };
  const j = arg.search(/JSON\.stringify\(\s*\{/);
  if (j < 0) return { sure: [], maybe: [], opaque: true };
  return objectKeys(arg, arg.indexOf('{', j));
}

/** The argument after the one ending at `i` in its enclosing call, if any. */
function nextArg(s, i) {
  const m = s.slice(i).match(/^\s*,\s*/);
  if (!m) return undefined;
  const at = i + m[0].length;
  let depth = 0, j = at;
  for (; j < s.length; j++) {
    const ch = s[j];
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) { if (depth === 0) break; depth--; }
    else if (ch === ',' && depth === 0) break;
  }
  return s.slice(at, j).trim();
}

/** The app's typed rpc() wrapper: read as a call SHAPE, not scanned as a caller. */
export const WRAPPER = 'packages/app/src/lib/db.ts';
/** Its jsonb shape map: types only, naming row sets in `RowsOf<'x'>` to derive
 *  a wrapper's shape. A type calls nothing, so it is not a quoting site. */
export const SHAPES = 'packages/app/src/lib/dbShapes.ts';

export function rpcCalls(root = REPO) {
  const { live, history } = functions(root);
  const ever = new Set(history.keys());
  const srcs = SOURCE_DIRS.flatMap((d) => sourceFiles(root, resolve(root, d)))
    .map((p) => ({ p, rel: relative(root, p), s: stripJs(readFileSync(p, 'utf8')) }));
  const consts = constantTable(srcs, ever);
  const resolveName = (tok) => {
    const lit = tok.match(/^['"`]([a-z][a-z_0-9]*)['"`]$/);
    if (lit) return lit[1];
    return new RegExp(`^${ID}(?:\\.${ID})*$`).test(tok) ? consts.get(tok.split('.').pop()) ?? null : null;
  };
  const calls = [];
  for (const { rel, s } of srcs) {
    if (rel.endsWith('.json')) continue;
    const line = (i) => s.slice(0, i).split('\n').length;
    if (rel === WRAPPER) continue; // its one `client.rpc(fn, args)` passes every call through
    // The app's typed wrapper (packages/app/src/lib/db.ts, review C1 slice 4):
    // a file that imports `rpc` from a `…/db` module calls it as rpc(name, args),
    // and a local helper may hand its parameter to it.
    const fromDb = s.match(/import\s*\{([^}]*)\}\s*from\s*['"][^'"]*\/db['"]/)?.[1] ?? '';
    const wrapperFns = ['rpc', 'rpcOrThrow'].filter((n) => new RegExp(`\\b${n}\\b`).test(fromDb));
    const wrapped = wrapperFns.length > 0;
    const helpers = helpersIn(s, wrapped);
    for (const n of wrapperFns) helpers.set(n, { nameIdx: 0, argsIdx: 1, param: null, start: -1, end: -1 });
    const shapes = [['\\.rpc', { nameIdx: 0, argsIdx: 1 }], ...[...helpers].map(([h, v]) => [`(?<![\\w$.])${h.replace(/\$/g, '\\$')}`, v])];
    for (const [pattern, h] of shapes) {
      for (const m of s.matchAll(new RegExp(`${pattern}\\s*${GENERIC}\\(\\s*`, 'g'))) {
        const at = m.index + m[0].length;
        const close = closeOf(s, at);
        const args = splitTop(s.slice(at, close - 1));
        const tok = args[h.nameIdx] ?? '';
        const bare = tok.split(/[\s:=]/)[0];
        // A helper's own definition (`fn: string`) or body passing its parameter through.
        if ([...helpers.values()].some((x) => bare === x.param && m.index >= x.start && m.index <= x.end)) continue;
        if (/^\s*async\b|=>/.test(tok)) continue;
        let keys;
        if (h.argsIdx === null) keys = bodyKeys(nextArg(s, close));
        else if (args[h.argsIdx] === undefined) keys = { sure: [], maybe: [], opaque: false };
        else if (args[h.argsIdx].startsWith('{')) keys = objectKeys(args[h.argsIdx], 0);
        else keys = { sure: [], maybe: [], opaque: true };
        calls.push({ file: rel, line: line(m.index), token: tok, name: resolveName(tok), ...keys });
      }
    }
    // A literal URL: `call('/rpc/sync_fact_scope', { body: JSON.stringify({…}) })`.
    for (const m of s.matchAll(/(['"`])[^'"`\n]*\/rpc\/([a-z][a-z_0-9]*)\1/g)) {
      const end = m.index + m[0].length;
      calls.push({ file: rel, line: line(m.index), token: m[0], name: m[2], ...bodyKeys(nextArg(s, end)) });
    }
  }
  return { live, calls };
}

/** Every whole quoted string naming a function some migration created, by
 *  name -> files. The completeness check: a name the code spells out but the
 *  scan never saw as a call is either a missed call shape or a stated exception. */
export function quotedFunctionNames(root = REPO) {
  const ever = new Set(functions(root).history.keys());
  const out = new Map();
  for (const d of SOURCE_DIRS) {
    for (const p of sourceFiles(root, resolve(root, d))) {
      if (relative(root, p) === SHAPES) continue;
      const s = stripJs(readFileSync(p, 'utf8'));
      for (const m of s.matchAll(/(['"`])([a-z][a-z_0-9]*)\1/g)) {
        if (!ever.has(m[2])) continue;
        if (!out.has(m[2])) out.set(m[2], new Set());
        out.get(m[2]).add(relative(root, p));
      }
    }
  }
  return out;
}
