// =============================================================================
// migrations-index.test.mjs — every migration file has a row in the index
// -----------------------------------------------------------------------------
// WHY THIS EXISTS (drift audit, 2026-10-07). `supabase/migrations/README.md`'s
// "Files" table is the one place a reader learns what each migration does
// without opening the SQL. It stopped at 0043 while 0044–0053 landed over
// 2026-10-04..06 — ten migrations, including the two that added student timing
// data (0045, 0050) and the second function in this repo that deletes student
// work (0048). Nothing noticed, because nothing read the table against the
// directory.
//
// HOW IT WORKS: it lists the `.sql` files actually in the directory and asserts
// each filename appears, backticked, in the README. It deliberately does not
// check what the row SAYS — that is prose for a reader, and wording churn is not
// the failure worth catching. "A migration nobody indexed" is.
//
// WHEN THIS FAILS: add a row for the new migration (what it does, whether it
// adds personal data, its verify script). Do not add a skip list.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = join(repo, 'supabase/migrations');
const index = readFileSync(join(dir, 'README.md'), 'utf8');

test('every migration file has a row in supabase/migrations/README.md', () => {
  const files = readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f));
  assert.ok(files.length > 0, 'found no migration files — the directory moved?');
  const missing = files.filter((f) => !index.includes(`\`${f}\``));
  assert.deepEqual(
    missing,
    [],
    `supabase/migrations/README.md has no row for: ${missing.join(', ')}.\n` +
      '  Add one per migration to the "Files" table (what it does, personal data, verify script).',
  );
});
