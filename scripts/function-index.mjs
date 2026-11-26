#!/usr/bin/env node
// =============================================================================
// function-index.mjs — write docs/function-index.md: what the database IS today
// -----------------------------------------------------------------------------
// Review C1 ("nothing in the repo states what the database currently is"),
// design pass D5a (docs/design/database-snapshot-and-types.md). One row per
// live function: its arguments, what it returns, definer or invoker, the file
// and line holding its LATEST definition, how many times it has been defined,
// which verify scripts name it, and which parts of the code call it.
//
//   pnpm db:index
//
// Run it in the same commit as any migration that creates, replaces or drops a
// function (and when a verify script or a caller is added or removed);
// scripts/tests/function-index.test.mjs fails on a stale file. It needs no
// database and no Docker, so a cloud session can run it too.
//
// It reads the migrations, not the live database: on `main` the two agree once
// the author has applied every migration (OV-7). Bodies are not copied — the
// link goes to the line where the live body starts.
// =============================================================================

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO, functions, highestMigration } from './lib/migrations.mjs';
import { rpcCalls, areaOf } from './lib/rpc-calls.mjs';

export const FUNCTION_INDEX_DOC = 'docs/function-index.md';
const AREAS = ['app', 'viewer', 'worker', 'edge', 'scripts'];

/** name -> sorted verify-script suffixes that name it (`0104`, `cron-jobs`). */
function verifyScripts(root) {
  const dir = resolve(root, 'scripts');
  const out = new Map();
  for (const f of readdirSync(dir).filter((x) => /^verify-.+\.sql$/.test(x)).sort()) {
    const sql = readFileSync(join(dir, f), 'utf8');
    const tag = f.replace(/^verify-|\.sql$/g, '');
    for (const m of new Set(sql.toLowerCase().match(/\b[a-z][a-z0-9_]*\b/g))) {
      if (!out.has(m)) out.set(m, []);
      out.get(m).push(tag);
    }
  }
  return out;
}

export function renderIndex(root = REPO) {
  const { live, history } = functions(root);
  const verify = verifyScripts(root);
  const callers = new Map();
  for (const c of rpcCalls(root).calls) {
    if (!c.name) continue;
    if (!callers.has(c.name)) callers.set(c.name, new Set());
    callers.get(c.name).add(areaOf(c.file));
  }
  const defs = [...live.values()].flat();
  const rows = defs.map((d) => {
    const args = d.params.map((p) => `${p.name}${p.optional ? '?' : ''} ${p.type}`).join(', ');
    const where = `[${d.file}:${d.line}](../supabase/migrations/${d.file}#L${d.line})`;
    const times = history.get(d.name).length;
    const v = verify.get(d.name) ?? [];
    const from = AREAS.filter((a) => callers.get(d.name)?.has(a)).join(', ') || '—';
    return `| \`${d.name}(${args})\` | ${d.returns} | ${d.security} | ${where} | ${times} | ${v.join(', ') || '—'} | ${from} |`;
  });
  const called = [...live.keys()].filter((n) => callers.has(n)).length;
  const restated = [...live.keys()].filter((n) => history.get(n).length >= 3).length;
  return [
    '# Function index — GENERATED, do not edit',
    '',
    `Every function the migrations leave live in \`public\`, through **${highestMigration(root)}**:`,
    `${defs.length} overloads of ${live.size} names; ${defs.filter((d) => d.rowset).length} return row sets,`,
    `${defs.filter((d) => d.security === 'invoker').length} are \`security invoker\`, ${called} names are called from the code, and`,
    `${restated} names have been defined three or more times. Written by \`pnpm db:index\`; CI fails`,
    'when it is stale (`scripts/tests/function-index.test.mjs`). The parser and its limits:',
    '[scripts/lib/migrations.mjs](../scripts/lib/migrations.mjs). Design: review C1,',
    '[database-snapshot-and-types.md](design/database-snapshot-and-types.md).',
    '',
    'Columns: arguments (`?` = has a default) · what it returns · definer or invoker · where the **latest**',
    'definition starts (the live body) · how many `create function` statements have named it · the',
    '`scripts/verify-*.sql` files that name it · who calls the NAME over PostgREST (`—` = only other',
    'functions, triggers or cron; both overloads of an overloaded name show the same callers).',
    '',
    '| function | returns | security | latest definition | defined | verify | called from |',
    '|---|---|---|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(resolve(REPO, FUNCTION_INDEX_DOC), renderIndex());
  console.log(`wrote ${FUNCTION_INDEX_DOC}`);
}
