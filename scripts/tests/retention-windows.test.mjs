// =============================================================================
// retention-windows.test.mjs — retention-policy.md ↔ the migrations' intervals
// -----------------------------------------------------------------------------
// Eng-review A11 (2026-08-06), privacy-guard shape. The policy doc churned
// five times with no version signal and nothing ever compared its numbers to
// the SQL that enforces them (s1-retro finding 11). No TS constant exists —
// the windows live only in migration SQL and md prose — so this is the md↔SQL
// leg: extract both, compare.
//
// WRITING THIS TEST FOUND THREE GAPS (2026-08-06), each recorded below as a
// `todo` rather than a green lie or a permanently red suite. They are owned by
// the ratified compliance-pack rewrite (eng-review D2/D3 — the POLICY_VERSION
// bump); whoever lands it either implements the mechanism or corrects the
// prose, then promotes the todo to a real assertion:
//   1. The policy table says student responses/section_checks live 400 days
//      keyed on CLASS deletion. The SQL that actually deletes checks
//      (0022/0025 step 1) fires 30 days after ACTIVITY deletion — a different,
//      shorter path the policy never discloses. A teacher tidying worksheets
//      in June deletes student records in July; the policy told the school
//      those records survive the year.
//   2. The policy table says class rows (incl. the 13+ assertion record) purge
//      400 days after deletion. NO SQL path purges classes at all — the only
//      `interval '400 days'` in the schema is the dormancy clock.
//   3. The policy table says ip_hash/user_agent scrub to NULL at 30 days via a
//      "scheduled scrub". No such scrub exists in any migration. (Bounded in
//      practice by S9 — submissions die with the anonymous wire — but the
//      policy doesn't say that.)
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

test(
  'GAP 1 (D2/D3 owner): checks purge 30d after ACTIVITY deletion; the policy discloses only 400d after CLASS deletion',
  { todo: 'reconcile in the compliance-pack rewrite: implement the class-keyed 400-day window, or disclose the activity-deletion path' },
  () => {},
);

test(
  'GAP 2 (D2/D3 owner): no SQL purges class rows; the policy promises 400 days after deletion',
  { todo: 'implement the class purge or correct the table row (the 13+ assertion record rides on it)' },
  () => {},
);

test(
  'GAP 3 (D2/D3 owner): no ip_hash/user_agent scrub exists; the policy names a scheduled 30-day scrub',
  { todo: 'implement the scrub, or amend the row to say the field dies with the anonymous wire at S9' },
  () => {},
);
