#!/usr/bin/env node
// =============================================================================
// db-types-live-diff.mjs — does the LIVE database match main's migrations?
// -----------------------------------------------------------------------------
// Review C1, slice 3 (docs/design/database-snapshot-and-types.md D7). The
// committed types describe the migrations on this checkout; live matches them
// only once every migration is applied. Run after `supabase db push`, and
// before pushing UI that calls a new table or RPC (OV-7):
//
//   pnpm db:types:live-diff
//
// It generates types from the linked project (`supabase gen types
// --project-id`, read-only; needs `supabase login`) and compares the
// `Database` type with packages/db-types/database.types.ts. Exit 0 = live has
// the same tables, columns, views, enums and function SIGNATURES as main.
// Otherwise the diff names what differs (a `-` line is in main but not live:
// "- grading_queue" = 0104 not applied).
//
// Compared: the `Database` type only. Ignored: the generator's own preamble
// (`__InternalSupabase`, the PostgREST version, which only the hosted
// generator emits) and the helper types after it, whose formatting differs
// between generator versions. NOT compared: function bodies, RLS policies,
// grants, triggers, indexes, constraints, cron jobs, other schemas. A migration
// that only replaces a body or changes a policy exits 0 unapplied, so this
// never replaces the `schema_migrations` count after `db push` (CLAUDE.md
// close-out question 2); it answers OV-7's question — are the tables and RPCs
// this UI calls live?
// =============================================================================

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO } from './lib/migrations.mjs';
import { DB_TYPES_FILES } from './db-types.mjs';

/** The `Database` type's text, without the generator's `__InternalSupabase` block. */
export function databaseBody(text) {
  const start = text.indexOf('export type Database = {');
  if (start < 0) throw new Error('no `export type Database` in the generated types');
  const end = text.indexOf('\n}\n', start);
  if (end < 0) throw new Error('could not find the end of `export type Database` in the generated types');
  return text
    .slice(start, end + 2)
    .replace(/\n {2}\/\/ Allows to automatically[^\n]*\n {2}\/\/ instead of[^\n]*\n {2}__InternalSupabase: \{[\s\S]*?\n {2}\}/, '');
}

function projectRef() {
  if (process.env.SUPABASE_PROJECT_REF) return process.env.SUPABASE_PROJECT_REF;
  const f = resolve(REPO, 'supabase/.temp/project-ref');
  if (existsSync(f)) return readFileSync(f, 'utf8').trim();
  throw new Error('no linked project: run `supabase link`, or set SUPABASE_PROJECT_REF');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ref = projectRef();
  let live;
  try {
    live = execFileSync('supabase', ['gen', 'types', 'typescript', '--project-id', ref, '--schema', 'public'], {
      cwd: REPO, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    console.error(`could not read live types (is \`supabase login\` done?):\n${err.stderr ?? err.message}`);
    process.exit(2);
  }
  const committed = databaseBody(readFileSync(resolve(REPO, DB_TYPES_FILES[0]), 'utf8'));
  const fromLive = databaseBody(live);
  if (committed === fromLive) {
    console.log(`live matches main: same tables, columns, views, enums and function signatures as ${DB_TYPES_FILES[0]}`);
    console.log('(function bodies, RLS, grants and cron are not compared — check schema_migrations for those)');
    process.exit(0);
  }
  const dir = mkdtempSync(join(tmpdir(), 'db-types-live-'));
  try {
    writeFileSync(join(dir, 'main'), committed);
    writeFileSync(join(dir, 'live'), fromLive);
    let diff = '';
    try {
      execFileSync('diff', ['-u', '--label', 'main (migrations)', '--label', 'live', join(dir, 'main'), join(dir, 'live')], { encoding: 'utf8' });
    } catch (err) {
      diff = err.stdout;
    }
    console.log(diff);
    console.log('live DIFFERS from main. "-" lines are in the migrations but not live (a migration not yet applied?);');
    console.log('"+" lines are live but not in the migrations (a dashboard edit, or types not regenerated: `pnpm db:types`).');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  process.exit(1);
}
