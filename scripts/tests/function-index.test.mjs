// =============================================================================
// function-index.test.mjs — docs/function-index.md is current (review C1, D5a)
// -----------------------------------------------------------------------------
// The index is GENERATED from the migrations, the verify scripts and the
// callers (scripts/function-index.mjs). A migration that creates, replaces or
// drops a function changes it, so the same commit runs `pnpm db:index` — the
// bundle discipline, with no database needed.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO } from '../lib/migrations.mjs';
import { renderIndex, FUNCTION_INDEX_DOC } from '../function-index.mjs';

const committed = readFileSync(resolve(REPO, FUNCTION_INDEX_DOC), 'utf8');
const fresh = renderIndex();

test('docs/function-index.md matches the migrations (run `pnpm db:index`)', () => {
  if (committed === fresh) return;
  const a = committed.split('\n'), b = fresh.split('\n');
  const i = a.findIndex((line, n) => line !== b[n]);
  assert.fail(
    `docs/function-index.md is stale — run \`pnpm db:index\` and commit it.\n` +
      `first difference at line ${i + 1}:\n  committed: ${a[i] ?? '(end)'}\n  fresh:     ${b[i] ?? '(end)'}`,
  );
});

test('the index is not vacuous (P9)', () => {
  const rows = fresh.split('\n').filter((l) => l.startsWith('| `'));
  assert.ok(rows.length >= 200, `only ${rows.length} rows`);
  const row = (name) => rows.find((l) => l.startsWith(`| \`${name}(`)) ?? '';
  assert.match(row('record_check'), /0070_dol_retake\.sql:\d+.*\| edge\b[^|]*\|$/, 'record_check: latest body in 0070, called by an Edge Function');
  assert.match(row('sync_fact_scope'), /\| scripts \|$/, 'sync_fact_scope: called only by the batch importer');
  assert.match(row('purge_soft_deleted'), /\| 11 \|/, 'purge_soft_deleted has 11 definitions');
  assert.equal(rows.filter((l) => l.startsWith('| `photo_answers_on(')).length, 2, 'both overloads get a row');
  assert.match(row('grading_queue'), /\| invoker \|/, '0104 grading_queue is security invoker');
});
