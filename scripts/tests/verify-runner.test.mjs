// Unit tests for the verify runner's pure halves (parse + judge). The psql
// execution half is author-side by design (no DB in CI); these pin the
// protocol so a section-marker typo or a judging regression fails loudly
// before apply day (P1: the runner ships with a caller-side proof).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSections, judgeSection, AUTH_VERIFY_SET } from '../verify-runner.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

test('parseSections: modes and SQL bodies', () => {
  const sections = parseSections(
    [
      '-- prose preamble stays invisible',
      '-- @section one',
      '-- @expect-rows',
      "select 'a', true, '';",
      '-- @section two',
      '-- @expect-error EXPECTED ROLLBACK',
      'do $$ begin raise exception \'EXPECTED ROLLBACK >>> ok\'; end $$;',
      '-- @section three',
      '-- @expect-log join_class refused',
      'set client_min_messages = log;',
    ].join('\n'),
    'fixture.sql',
  );
  assert.equal(sections.length, 3);
  assert.deepEqual(sections.map((s) => s.mode), ['expect-rows', 'expect-error', 'expect-log']);
  assert.equal(sections[1].expectText, 'EXPECTED ROLLBACK');
  assert.match(sections[0].sql.join('\n'), /select 'a'/);
});

test('judgeSection: EXPECTED ROLLBACK on stderr is a PASS (the green-path raise)', () => {
  const section = { id: 'D', mode: 'expect-error', expectText: 'EXPECTED ROLLBACK' };
  const pass = judgeSection(section, {
    status: 3,
    stdout: '',
    stderr: 'ERROR:  EXPECTED ROLLBACK >>> teacher_exact=teacher (all four branches correct)',
  });
  assert.equal(pass[0].pass, true);
  const fail = judgeSection(section, { status: 3, stdout: '', stderr: 'ERROR:  BRANCH PROOF FAILED >>> …' });
  assert.equal(fail[0].pass, false);
});

test('judgeSection: expect-log checks stderr, not rows', () => {
  const section = { id: 'F', mode: 'expect-log', expectText: 'join_class refused' };
  assert.equal(
    judgeSection(section, { status: 0, stdout: '', stderr: 'LOG:  join_class refused (bad_code) user=x' })[0].pass,
    true,
  );
  assert.equal(judgeSection(section, { status: 0, stdout: '', stderr: '' })[0].pass, false);
});

test('judgeSection: expect-rows parses csv booleans and fails vacuous sections', () => {
  const section = { id: 'A', mode: 'expect-rows', expectText: null };
  const results = judgeSection(section, {
    status: 0,
    stdout: 'check_one,t,detail\ncheck_two,f,broke\n',
    stderr: '',
  });
  assert.deepEqual(results.map((r) => r.pass), [true, false]);
  assert.equal(results[1].checkId, 'A:check_two');
  // No rows at all = vacuous, never a silent pass (P9).
  assert.equal(judgeSection(section, { status: 0, stdout: '', stderr: '' })[0].pass, false);
});

test('the full auth verify set exists and every script is runner-compatible', () => {
  for (const file of AUTH_VERIFY_SET) {
    const sql = readFileSync(resolve(ROOT, 'scripts', file), 'utf8');
    const sections = parseSections(sql, file);
    assert.ok(sections.length > 0, `${file} has no @section markers — not runner-compatible`);
    for (const s of sections) {
      assert.ok(s.sql.join('\n').trim().length > 0, `${file} section ${s.id} is empty`);
      if (s.mode !== 'expect-rows') {
        assert.ok(s.expectText, `${file} section ${s.id} missing expect text`);
      }
    }
  }
});

test('verify-0027 carries the ruled proof sections', () => {
  const sql = readFileSync(resolve(ROOT, 'scripts', 'verify-0027.sql'), 'utf8');
  const ids = parseSections(sql, 'verify-0027.sql').map((s) => s.id);
  for (const required of ['A-schema', 'B-grants', 'C-prosrc-contract', 'D-trigger-branches', 'E-join-branches', 'F-raise-log', 'G-audit-doors']) {
    assert.ok(ids.includes(required), `verify-0027 missing section ${required}`);
  }
});
