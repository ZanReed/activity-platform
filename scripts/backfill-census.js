// =============================================================================
// backfill-census.js — census the versions the read path hasn't reached (S7)
// -----------------------------------------------------------------------------
// The census is DERIVED: get-activity writes it whenever it fills the read
// cache for a version. That covers every version a student opens from now on,
// and nothing else — versions published before 0026, or already sitting in the
// cache under the current sanitizer rev, would never be counted.
//
// This closes that gap, and it is deliberately RERUNNABLE rather than
// one-shot. Two reasons:
//
//   1. It doubles as the repair tool. If a census write ever fails in
//      production, the read path withholds the cache row so the next read
//      retries — but if you want the gap closed NOW, this is how.
//   2. The census RULE can change (a registry key rename, a new interaction
//      variant). `--all` re-censuses every version, and write_version_census
//      replaces rather than merges, so a stale census is corrected in place.
//
// It computes the census by importing the COMMITTED viewer-server bundle — the
// same bytes the deployed Edge Function runs. Not a reimplementation, not even
// a re-bundle: if this script and production ever disagreed, that would be the
// whole failure mode the shared registry exists to prevent.
//
// ---- Run --------------------------------------------------------------------
//
//   cp .env.supabase.example .env.supabase     # once; gitignored
//   pnpm backfill:census -- --dry-run          # report only, writes nothing
//   pnpm backfill:census                       # census the uncounted versions
//   pnpm backfill:census -- --all              # re-census EVERYTHING
//
// Service-role credentials, so it runs author-side only. It writes exclusively
// to the analytics tables (via write_version_census) and reads
// activity_versions; it can neither modify a document nor touch student work.
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import {
  censusOfDocument,
  upgradeActivityDocument,
} from '../supabase/functions/_shared/viewer-server.bundle.js';

const DRY_RUN = process.argv.includes('--dry-run');
const ALL = process.argv.includes('--all');

const URL = process.env.SUPABASE_URL ?? '';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!URL || !KEY) {
  console.error('');
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.');
  console.error('');
  console.error('  cp .env.supabase.example .env.supabase   # then fill it in');
  console.error('  pnpm backfill:census -- --dry-run');
  console.error('');
  console.error('(The service-role key is in the Supabase dashboard under');
  console.error(' Project Settings → API. It bypasses RLS — never ship it to a');
  console.error(' client, and keep it in the gitignored .env.supabase.)');
  process.exit(1);
}

const db = createClient(URL, KEY, { auth: { persistSession: false } });

// ---- Which versions need work ----------------------------------------------

const { data: versions, error: vErr } = await db
  .from('activity_versions')
  .select('id, activity_id, version_num, content')
  .order('created_at', { ascending: true });

if (vErr) {
  console.error('Could not read activity_versions:', vErr.message);
  process.exit(1);
}

const { data: censused, error: cErr } = await db
  .from('activity_version_census')
  .select('version_id');

if (cErr) {
  console.error('Could not read activity_version_census:', cErr.message);
  process.exit(1);
}

const done = new Set((censused ?? []).map((r) => r.version_id));
const todo = (versions ?? []).filter((v) => ALL || !done.has(v.id));

console.log('');
console.log(`Versions total:     ${versions?.length ?? 0}`);
console.log(`Already censused:   ${done.size}`);
console.log(`To process:         ${todo.length}${ALL ? '  (--all: re-censusing everything)' : ''}`);
if (DRY_RUN) console.log('MODE:               DRY RUN — nothing will be written');
console.log('');

// ---- Census each one --------------------------------------------------------

let ok = 0;
let failed = 0;
const keyTotals = new Map();

for (const version of todo) {
  const label = `${version.id.slice(0, 8)} (activity ${version.activity_id.slice(0, 8)} v${version.version_num})`;
  let census;
  try {
    // Upgrade first, exactly as the read path does: stored documents keep the
    // schema version they were published at, forever.
    const upgraded = upgradeActivityDocument(version.content);
    census = censusOfDocument(upgraded.doc);
  } catch (err) {
    // A version that cannot be upgraded also cannot be SERVED — the read path
    // 500s on it with the same error. Report and keep going: one unservable
    // version must not stop the backfill.
    failed += 1;
    console.error(`  SKIP ${label} — ${err instanceof Error ? err.message : String(err)}`);
    continue;
  }

  for (const { censusKey, blockCount } of census.counts) {
    keyTotals.set(censusKey, (keyTotals.get(censusKey) ?? 0) + blockCount);
  }

  if (DRY_RUN) {
    ok += 1;
    console.log(
      `  WOULD WRITE ${label} — ${census.counts.length} keys, ${census.items.length} items`,
    );
    continue;
  }

  const { error } = await db.rpc('write_version_census', {
    p_version_id: version.id,
    p_counts: census.counts,
    p_items: census.items,
  });
  if (error) {
    failed += 1;
    console.error(`  FAIL ${label} — ${error.message}`);
  } else {
    ok += 1;
    console.log(
      `  ok   ${label} — ${census.counts.length} keys, ${census.items.length} items`,
    );
  }
}

// ---- Report -----------------------------------------------------------------

console.log('');
console.log(`${DRY_RUN ? 'Would census' : 'Censused'}: ${ok}   Failed: ${failed}`);

if (keyTotals.size > 0) {
  console.log('');
  console.log('Block usage across the versions processed:');
  for (const [key, count] of [...keyTotals].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${key}`);
  }
}

if (!DRY_RUN && ok > 0) {
  console.log('');
  console.log('Verify with scripts/verify-0026.sql section D1 (coverage) and D3');
  console.log('(unattributed items — expect 0 once this has run).');
}
console.log('');

process.exit(failed > 0 ? 1 : 0);
