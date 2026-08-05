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

// PostgREST over plain fetch, deliberately: `@supabase/supabase-js` is a
// dependency of packages/app, and pnpm's strict node_modules means a script run
// from the workspace root cannot resolve it (found the hard way — this script's
// first run died on ERR_MODULE_NOT_FOUND). The root package has no runtime
// dependencies at all and the R2 scripts already talk HTTP directly, so this
// keeps the convention and stays runnable from a clean checkout with no install.
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

const HEADERS = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

/** Never let a failure echo the service-role key back to the terminal. */
const scrub = (s) =>
  String(s).replace(/(sb_secret_|sb_publishable_|eyJ)[A-Za-z0-9._-]+/g, '<redacted>');

async function rest(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...HEADERS, ...(init.headers ?? {}) },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${scrub(text).slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

/** Page through a table — PostgREST caps a single response, and this script is
 * expected to run against a project with far more versions than it has today. */
async function selectAll(table, columns, pageSize = 200) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await rest(
      `${table}?select=${columns}&order=created_at.asc&limit=${pageSize}&offset=${offset}`,
    );
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

// ---- Which versions need work ----------------------------------------------

let versions;
let censused;
try {
  versions = await selectAll('activity_versions', 'id,activity_id,version_num,content');
  censused = await selectAll('activity_version_census', 'version_id');
} catch (err) {
  console.error('');
  console.error('Could not read from the database:', scrub(err.message));
  console.error('');
  console.error('If this is a 404 on activity_version_census, migration 0026 is');
  console.error('not applied yet — run `supabase db push` first.');
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
// Unservable is NOT a failure. A version whose document predates the current
// upgrade chain cannot be upgraded, which means the read API cannot serve it
// either — it is inert history, not a broken write. Counting it as a failure
// (the first version of this script did) makes a normal run exit 1 and reads
// as an outage in a log. Live-published current versions are the ones that
// matter, and they are reported separately below.
let skipped = 0;
const keyTotals = new Map();
/** reason → how many versions hit it, so 110 identical lines collapse to one. */
const skipReasons = new Map();

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
    skipped += 1;
    skipReasons.set(
      err instanceof Error ? err.message : String(err),
      (skipReasons.get(err instanceof Error ? err.message : String(err)) ?? 0) + 1,
    );
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

  try {
    await rest('rpc/write_version_census', {
      method: 'POST',
      body: JSON.stringify({
        p_version_id: version.id,
        p_counts: census.counts,
        p_items: census.items,
      }),
    });
    ok += 1;
    console.log(
      `  ok   ${label} — ${census.counts.length} keys, ${census.items.length} items`,
    );
  } catch (err) {
    failed += 1;
    console.error(`  FAIL ${label} — ${scrub(err.message)}`);
  }
}

// ---- Report -----------------------------------------------------------------

console.log('');
console.log(
  `${DRY_RUN ? 'Would census' : 'Censused'}: ${ok}   Skipped (unservable): ${skipped}   Failed: ${failed}`,
);

if (skipReasons.size > 0) {
  console.log('');
  console.log('Skipped — these documents predate the current upgrade chain, so');
  console.log('the read API cannot serve them either. Expected for superseded and');
  console.log('soft-deleted history; worth investigating only if a LIVE PUBLISHED');
  console.log('activity appears here (none did on the 2026-08-05 run):');
  for (const [reason, count] of [...skipReasons].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${reason}`);
  }
}

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
