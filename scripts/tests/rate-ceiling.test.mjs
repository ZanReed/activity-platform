// =============================================================================
// rate-ceiling.test.mjs — the check rate ceiling's PRODUCTION posture, pinned
// -----------------------------------------------------------------------------
// Eng-review A6 (2026-08-06), the dormant-safeguard rule (policy P3: a
// safeguard is credited only after a liveness proof AT PRODUCTION VALUES).
//
// The ceiling's mechanism was always proven (verify-0020 B8, at a forced limit
// of 1) — but production runs the DEFAULTS: the Edge Function passes neither
// rate parameter, so what actually gates a classroom is `default 60` twice in
// migration 0020. Nothing pinned either half of that sentence:
//   1. that the defaults are still 60/60 (a migration edit could retune them
//      silently — "generous… a 429 means a script" was never a classroom
//      number until the estimate below was written down), and
//   2. that the Deno wiring still relies on them (someone passing an explicit
//      value there would bypass this file's whole premise without failing
//      anything).
// verify-0020 B11 proves the boundary against the live database; this test
// pins the SOURCE so drift is caught on every PR, not on the next manual
// verify run.
//
// CLASSROOM ESTIMATE (recorded per A6): the ceiling is per STUDENT (durable,
// in record_check), not per IP — the S2 lesson; a classroom is one IP but
// thirty students. 60 checks per rolling 60s means a student must sustain one
// check per second for a full minute to hit it. The formative check loop is
// click → read verdicts → fix → re-check; a fast cycle is ~10-15s, so a
// diligent human peaks around 4-6 checks/min — an order of magnitude under
// the ceiling. A 429 therefore still means a script, and a whole class
// checking simultaneously consumes nothing shared. If pedagogy ever changes
// this shape (auto-check-on-keystroke, timed drills), retune the DEFAULTS in
// 0020 and update B11 + this file together.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(repo, p), 'utf8');

test('migration 0020 declares the 60/60 defaults production relies on', () => {
  const sql = read('supabase/migrations/0020_section_checks.sql');
  assert.match(
    sql,
    /p_rate_limit\s+integer\s+default\s+60/,
    'p_rate_limit default changed or vanished — production has no other source for the ceiling; retune deliberately (see this file header) and update verify-0020 B11',
  );
  assert.match(
    sql,
    /p_rate_window_seconds\s+integer\s+default\s+60/,
    'p_rate_window_seconds default changed or vanished — see this file header',
  );
});

test('the Deno wiring passes NEITHER rate parameter (the defaults ARE the ceiling)', () => {
  const deno = read('supabase/functions/check-activity/index.ts');
  const call = deno.match(/rpc\('record_check',\s*\{[\s\S]*?\}\)/);
  assert.ok(call, "could not find the rpc('record_check', {...}) call in the Deno file");
  assert.doesNotMatch(
    call[0],
    /p_rate_limit|p_rate_window_seconds/,
    'the Edge Function now passes an explicit rate parameter — the 60/60-defaults posture this file and verify-0020 B11 pin is no longer the live ceiling; move the pin to wherever the value now lives',
  );
});

test('verify-0020 carries the production-boundary case (B11)', () => {
  const sql = read('scripts/verify-0020.sql');
  assert.match(
    sql,
    /PASS B11: the production 60\/60 defaults gate at exactly 60/,
    'verify-0020 lost its B11 production-defaults boundary case',
  );
});
