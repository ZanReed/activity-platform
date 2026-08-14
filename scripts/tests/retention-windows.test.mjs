// =============================================================================
// retention-windows.test.mjs — retention-policy.md ↔ the migrations' intervals
// -----------------------------------------------------------------------------
// Eng-review A11 (2026-08-06), privacy-guard shape. The policy doc churned
// five times with no version signal and nothing ever compared its numbers to
// the SQL that enforces them (s1-retro finding 11). No TS constant exists —
// the windows live only in migration SQL and md prose — so this is the md↔SQL
// leg: extract both, compare.
//
// WRITING THIS TEST FOUND THREE GAPS (2026-08-06), originally recorded as
// `todo` cases. The D2/D3 pack rewrite (2026-08-07, draft-4) reconciled all
// three PROSE-SIDE, and the todos were promoted to the GAP assertions below,
// which pin the corrected prose. Since then: GAP 3 (the ip_hash scrub)
// CLOSED at S9 Drop 3 by DATA REMOVAL — migration 0029 wiped every
// submissions row and dropped the ingest path, so its assertion now pins the
// closure disclosure instead of the unbuilt-mechanism flag. GAP 2 (the
// class-row purge) remains unbuilt; if a future migration builds it, update
// the doc row and the matching assertion together.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(repo, p), 'utf8');

const policy = read('docs/compliance/retention-policy.md');
const m0023 = read('supabase/migrations/0023_account_retention_clock.sql');
const m0025 = read('supabase/migrations/0025_student_dormancy.sql');

test('dormancy: the policy\'s 400-day account window is the SQL\'s 400-day interval', () => {
  assert.match(
    policy,
    /\*\*400 days of dormancy\*\*/,
    'policy no longer states the 400-day dormancy window — if retuned, 0025\'s interval must move in the same change',
  );
  assert.match(
    m0025,
    /< now\(\) - interval '400 days'/,
    "0025's dormancy interval is no longer 400 days — the policy table and the summer-break rationale (30 < a summer break) both key on it",
  );
});

test('explicit deletion: the policy\'s 30-day window is the SQL\'s 30-day interval', () => {
  assert.match(
    policy,
    /\*\*30 days\*\*/,
    'policy no longer states the 30-day explicit-deletion window',
  );
  for (const [name, sql] of [
    ['0023', m0023],
    ['0025', m0025],
  ]) {
    assert.match(
      sql,
      /deleted_at < now\(\) - interval '30 days'/,
      `${name} no longer purges explicit deletions on the 30-day window`,
    );
  }
});

test('the policy\'s prose and table agree with themselves on 400', () => {
  // The doc's own internal consistency — the "~400 days" identity-retention
  // disclosure paragraph and the table's 400-day rows describe one number.
  assert.match(policy, /Rationale for 400 days/);
  assert.match(policy, /~400 days/);
});

test('GAP 1 closed prose-side: the policy DISCLOSES the 30-day activity-deletion path', () => {
  assert.match(
    policy,
    /via ACTIVITY deletion[\s\S]{0,300}30 days/,
    'the activity-deletion disclosure row vanished — the 0022 SQL path still deletes checks 30d after activity soft-deletion, and the policy must keep saying so (or the mechanism must change)',
  );
});

test('GAP 2 closed prose-side: the class-row purge is flagged as not yet built', () => {
  assert.match(
    policy,
    /Class row incl\. 13\+ assertion record[\s\S]{0,400}mechanism not yet built/,
    'the class-row window row no longer admits its mechanism is unbuilt — either the purge now exists (update this pin to assert the SQL) or the honesty flag was lost',
  );
});

test('GAP 3 CLOSED by data removal (S9 Drop 3): the ip_hash row discloses the 0029 wipe', () => {
  // The flip is still guarded, not merely asserted once (P11): if the row
  // stops naming the closure mechanism, the disclosure regressed.
  assert.match(
    policy,
    /`ip_hash`[\s\S]{0,500}deleted whole at the S9 cutover \(migration 0029/,
    'the ip_hash row must disclose HOW the window closed (the 0029 wipe + dropped ingest path), not merely go quiet',
  );
  assert.doesNotMatch(
    policy.split('`ip_hash` + `user_agent`')[1]?.split('\n')[0] ?? '',
    /mechanism not yet built/,
    'the row still carries the unbuilt-mechanism flag — the closure edit half-landed',
  );
});
