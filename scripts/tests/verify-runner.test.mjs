// Unit tests for the verify runner's pure halves (parse + judge). The psql
// execution half is author-side by design (no DB in CI); these pin the
// protocol so a section-marker typo or a judging regression fails loudly
// before apply day (P1: the runner ships with a caller-side proof).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSections, judgeSection, sectionSql, AUTH_VERIFY_SET } from '../verify-runner.mjs';

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

// ---- Strict expect-rows judging (TODOS → "The verify runner drops a row that
// ERRORS or returns NULL", fixed 2026-10-06). Each of these vanished silently
// before: a row whose statement errored, a NULL pass, a stray line, and a
// named row that never came back.

const strictFixture = [
  '-- @section A',
  '-- @expect-rows',
  "select 'one', true, '';",
  "select 'two',",
  '       1 = 1, \'\';',
  "select 'generated_' || x, true, '' from unnest(array['a']) x;",
].join('\n');

test('strict: a clean section passes every named row', () => {
  const [section] = parseSections(strictFixture, 'f.sql');
  assert.deepEqual(section.expectedIds, ['one', 'two']);
  const r = judgeSection(section, { status: 0, stdout: 'one,t,\ntwo,t,\ngenerated_a,t,\n', stderr: '' });
  assert.deepEqual(r.map((x) => [x.checkId, x.pass]), [['A:one', true], ['A:two', true], ['A:generated_a', true]]);
});

test('strict: a statement ERROR fails the section and names the missing row', () => {
  const [section] = parseSections(strictFixture, 'f.sql');
  // psql with ON_ERROR_STOP=0 exits 0 over a failed statement.
  const r = judgeSection(section, {
    status: 0, stdout: 'one,t,\ngenerated_a,t,\n',
    stderr: 'psql:<stdin>:4: ERROR:  operator does not exist: information_schema.character_data[] = text[]',
  });
  const failed = r.filter((x) => x.pass === false).map((x) => x.checkId);
  assert.deepEqual(failed, ['A:(error)', 'A:two']);
});

test('strict: a NULL pass column is a FAIL, not a dropped row', () => {
  const [section] = parseSections(strictFixture, 'f.sql');
  const r = judgeSection(section, { status: 0, stdout: 'one,t,\ntwo,,why\ngenerated_a,t,\n', stderr: '' });
  const two = r.find((x) => x.checkId === 'A:two');
  assert.equal(two.pass, false);
  assert.match(two.detail, /NULL/);
});

test('strict: a line that is not a check row is a FAIL', () => {
  const [section] = parseSections(strictFixture, 'f.sql');
  const r = judgeSection(section, { status: 0, stdout: 'one,t,\ntwo,t,\ngenerated_a,t,\nsomething else\n', stderr: '' });
  assert.deepEqual(r.filter((x) => !x.pass).map((x) => x.checkId), ['A:(stray)']);
});

test('strict: a csv-quoted detail holding commas still parses', () => {
  const [section] = parseSections(strictFixture, 'f.sql');
  const r = judgeSection(section, { status: 0, stdout: 'one,t,"a, b, c"\ntwo,f,\ngenerated_a,t,\n', stderr: '' });
  assert.deepEqual(r.map((x) => x.pass), [true, false, true]);
});

const liveOnlyFixture = [
  '-- @section A',
  '-- @expect-rows',
  "select 'always', true, '';",
  '-- @live-only (pg_cron)',
  "select 'cron_row',",
  '       not exists (select 1 from cron.job),',
  "       'needs pg_cron';",
  "select 'after', true, '';",
].join('\n');

test('@live-only: local leaves the statement out and reports SKIP; live runs it', () => {
  const [section] = parseSections(liveOnlyFixture, 'f.sql');
  assert.deepEqual(section.liveOnly, ['cron_row']);
  const local = sectionSql(section, 'local');
  assert.doesNotMatch(local, /cron/);
  assert.match(local, /'always'/);
  assert.match(local, /'after'/);
  assert.match(sectionSql(section, 'live'), /cron\.job/);

  const r = judgeSection(section, { status: 0, stdout: 'always,t,\nafter,t,\n', stderr: '' }, { target: 'local' });
  assert.deepEqual(r.map((x) => [x.checkId, x.pass, x.skip]), [
    ['A:always', true, undefined], ['A:after', true, undefined], ['A:cron_row', undefined, true],
  ]);
  // On live the same missing row is a FAIL — the mark never excuses live.
  const live = judgeSection(section, { status: 0, stdout: 'always,t,\nafter,t,\n', stderr: '' }, { target: 'live' });
  assert.equal(live.find((x) => x.checkId === 'A:cron_row').pass, false);
});

test('@live-only must mark a named row and must end', () => {
  assert.throws(() => parseSections("-- @section A\n-- @live-only\nselect x, true, '' from t;", 'f.sql'), /literally named row/);
  assert.throws(() => parseSections("-- @section A\n-- @live-only\nselect 'x', true", 'f.sql'), /never ends/);
});

test('the cron rows in the real set are the live-only ones, and only they', () => {
  const marked = [];
  for (const file of AUTH_VERIFY_SET) {
    const sql = readFileSync(resolve(ROOT, 'scripts', file), 'utf8');
    for (const s of parseSections(sql, file)) {
      for (const id of s.liveOnly) marked.push(`${file}:${id}`);
      // Every statement naming cron.job must be marked, or it vanishes locally.
      if (s.mode === 'expect-rows') {
        s.sql.forEach((line, i) => {
          if (/\bcron\.job\b/.test(line) && !line.trim().startsWith('--')) {
            assert.ok(s.liveOnlyLines.has(i), `${file} section ${s.id}: cron.job outside an @live-only statement`);
          }
        });
      }
    }
  }
  assert.deepEqual(marked.sort(), [
    'verify-0048.sql:prune_is_unscheduled',
    'verify-0050.sql:prune_still_unscheduled_and_service_only',
  ]);
});
