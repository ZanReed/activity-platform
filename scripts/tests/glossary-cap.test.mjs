// =============================================================================
// glossary-cap.test.mjs — the glossary's entry cap is ONE number in two places
// -----------------------------------------------------------------------------
// GLOSSARY_MAX_ENTRIES (@activity/schema) is what the importer refuses above
// and what the viewer names in its `capped` warning; migration 0043 repeats it
// as SQL literals in glossary_for_activity (the LIMIT and the `capped` test)
// and sync_glossary_entries (the refusal). SQL cannot import a TS constant, so
// this test is the bond: every literal marked `-- = GLOSSARY_MAX_ENTRIES` in
// the migration, and every bare cap comparison next to it, must equal the TS
// value. Drift one side and this goes red (P11: a comment asserting a value
// is a claim — guard it).
//
// ZERO DEPENDENCIES (root-script rule): node:fs + node:path only.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(repo, p), 'utf8');

const ts = read('packages/schema/src/glossary.ts');
const sql = read('supabase/migrations/0043_glossary_entry.sql');

test('GLOSSARY_MAX_ENTRIES matches every cap literal in migration 0043', () => {
  const m = /export const GLOSSARY_MAX_ENTRIES = (\d+);/.exec(ts);
  assert.ok(m, 'GLOSSARY_MAX_ENTRIES not found in packages/schema/src/glossary.ts');
  const cap = Number(m[1]);

  // Strip comments so prose ("capped at 2,000") is not mistaken for code.
  const code = sql.replace(/--.*$/gm, '');
  const marked = [...sql.matchAll(/(\d+)\b[^\n]*-- = GLOSSARY_MAX_ENTRIES/g)].map((x) => Number(x[1]));
  assert.ok(marked.length >= 2, `expected the LIMIT and the sync refusal to be marked; found ${marked.length}`);
  for (const n of marked) assert.equal(n, cap, `a marked SQL literal (${n}) drifted from GLOSSARY_MAX_ENTRIES (${cap})`);

  const comparisons = [...code.matchAll(/(?:limit|>)\s*(\d{3,})/gi)].map((x) => Number(x[1]));
  assert.ok(comparisons.length >= 3, `expected LIMIT, capped and refusal comparisons; found ${comparisons.length}`);
  for (const n of comparisons) assert.equal(n, cap, `SQL cap comparison ${n} drifted from GLOSSARY_MAX_ENTRIES (${cap})`);
});
