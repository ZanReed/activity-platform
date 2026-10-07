#!/usr/bin/env node
/**
 * verify-runner.mjs — one-command execution of the SQL verify walkthroughs
 * (identity slice DX rulings D4/F1/X2; spec detail from OV-DX #2/#3/#5/#6/#7).
 *
 *   pnpm verify:auth --target live     # the post-migration regression set
 *   pnpm verify:auth --target local    # same set against `supabase start`
 *   node scripts/verify-runner.mjs --target live --only verify-0027
 *
 * Zero dependencies (repo rule): shells out to psql. The scripts stay
 * human-runnable in the SQL editor; the runner understands three section
 * protocols, declared by marker comments:
 *
 *   -- @section <id>            start a section (runs as one psql invocation)
 *   -- @expect-rows             section SELECTs rows: check_id | pass | detail
 *   -- @expect-error <text>     section is a rolled-back DO proof; PASS iff
 *                               stderr contains <text> (the verify-0025 idiom
 *                               raises 'EXPECTED ROLLBACK >>>' on its GREEN
 *                               path — a naive runner would fail every
 *                               successful run)
 *   -- @expect-log <text>       PASS iff stderr contains <text> (RAISE LOG
 *                               can't be SELECTed; sections set
 *                               client_min_messages = log so psql forwards it)
 *   -- @live-only               (inside an expect-rows section) the NEXT
 *                               statement needs something the local stack
 *                               lacks (pg_cron's cron.job). --target local
 *                               leaves it out and prints SKIP; live runs it.
 *
 * An expect-rows section is judged STRICTLY (TODOS → "The verify runner drops
 * a row that ERRORS or returns NULL", 2026-10-06). psql runs with
 * ON_ERROR_STOP=0 so one bad row cannot hide the rest, which means psql exits
 * 0 over a failed statement: the runner, not the exit code, has to notice.
 * The section fails on any ERROR on stderr, on a row whose pass column is
 * NULL, on an output line that is not a check row, and on a literally named
 * row (`select '<id>',` at the start of a line) that never came back. Before
 * this, all four simply vanished — verify-0030's client_grant_is_select_only
 * errored on every run from 2026-08-14 to 2026-10-06 and was never reported.
 *
 * Targets are EXPLICIT — running verify SQL against the wrong database is the
 * hazard (OV-DX #5), so there is no default:
 *   --target live   needs SUPABASE_DB_URL in .env.supabase (the POOLER DSN:
 *                   postgres://postgres.<ref>:<db-password>@…pooler.supabase.com:5432/postgres
 *                   — the direct db.<ref> host is IPv6-only; the DB password
 *                   is a dashboard secret: Settings → Database)
 *   --target local  uses SUPABASE_DB_URL_LOCAL if set, else the supabase-cli
 *                   default postgresql://postgres:postgres@127.0.0.1:54322/postgres
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The README-mandated regression set for auth/RLS/grant migrations (X2).
 *
 * REGISTRATION IS THE RULE (DX ruling P2): a verify script that is not in this
 * array is a script nobody runs. Every new grant/RLS/auth migration adds its
 * verify file here in the SAME commit that writes it.
 */
export const AUTH_VERIFY_SET = [
  'verify-0056.sql',
  'verify-0055.sql',
  'verify-0054.sql',
  'verify-0053.sql',
  'verify-0051.sql',
  'verify-0050.sql',
  'verify-0049.sql',
  'verify-0048.sql',
  'verify-0047.sql',
  'verify-0046.sql',
  'verify-0045.sql',
  'verify-0044.sql',
  'verify-0043.sql',
  'verify-0042.sql',
  'verify-0040.sql',
  'verify-0038.sql',
  'verify-0037.sql',
  'verify-0036.sql',
  'verify-0035.sql',
  'verify-0034.sql',
  'verify-0033.sql',
  'verify-0030.sql',
  'verify-0029.sql',
  'verify-0028.sql',
  'verify-0027.sql',
  'verify-0013-0014.sql',
  'verify-0017.sql',
  'verify-image-storage.sql',
  'verify-0020.sql',
];

/** A check row named literally at the start of a line: `select '<id>',`. */
const LITERAL_ROW = /^\s*select\s+'([^']+)'\s*,/i;

/** Parse a verify script into runner sections. Exported for unit tests. */
export function parseSections(sql, file) {
  const sections = [];
  let current = null;
  let liveOnly = null; // the @live-only statement being collected, if any
  const close = () => {
    if (liveOnly) throw new Error(`${file} section ${current.id}: @live-only statement never ends with ';'`);
    if (current) sections.push(current);
  };
  for (const line of sql.split('\n')) {
    const sect = line.match(/^--\s*@section\s+(\S+)/);
    if (sect) {
      close();
      current = {
        id: sect[1], file, mode: 'expect-rows', expectText: null, sql: [],
        expectedIds: [], liveOnly: [], liveOnlyLines: new Set(),
      };
      continue;
    }
    if (!current) continue; // preamble prose stays runner-invisible
    const err = line.match(/^--\s*@expect-error\s+(.+)$/);
    const log = line.match(/^--\s*@expect-log\s+(.+)$/);
    if (err) { current.mode = 'expect-error'; current.expectText = err[1].trim(); continue; }
    if (log) { current.mode = 'expect-log'; current.expectText = log[1].trim(); continue; }
    if (/^--\s*@expect-rows\b/.test(line)) { current.mode = 'expect-rows'; continue; }
    if (/^--\s*@live-only\b/.test(line)) { liveOnly = { id: null }; continue; }
    const named = line.match(LITERAL_ROW);
    if (named) {
      current.expectedIds.push(named[1]);
      if (liveOnly && liveOnly.id === null) liveOnly.id = named[1];
    }
    if (liveOnly) {
      current.liveOnlyLines.add(current.sql.length);
      if (/;\s*(--.*)?$/.test(line)) {
        if (!liveOnly.id) throw new Error(`${file} section ${current.id}: @live-only must mark a literally named row (select '<id>', …)`);
        current.liveOnly.push(liveOnly.id);
        liveOnly = null;
      }
    }
    current.sql.push(line);
  }
  close();
  for (const s of sections) {
    if (s.mode !== 'expect-rows' && s.liveOnly.length > 0) {
      throw new Error(`${file} section ${s.id}: @live-only is for expect-rows sections only`);
    }
  }
  return sections;
}

/** The SQL a section runs against a target: local leaves out @live-only rows. */
export function sectionSql(section, target) {
  return section.sql.filter((_, i) => target !== 'local' || !section.liveOnlyLines.has(i)).join('\n');
}

/** Classify one executed section. Exported for unit tests. */
export function judgeSection(section, { status, stdout, stderr }, { target = 'live' } = {}) {
  if (section.mode === 'expect-error') {
    const pass = stderr.includes(section.expectText);
    return [{
      checkId: section.id, pass,
      detail: pass
        ? (stderr.split('\n').find((l) => l.includes(section.expectText)) ?? '').slice(0, 400)
        : `expected stderr to contain "${section.expectText}"; got: ${stderr.slice(0, 400)}`,
    }];
  }
  if (section.mode === 'expect-log') {
    const pass = stderr.includes(section.expectText);
    return [{
      checkId: section.id, pass,
      detail: pass ? 'log line observed' : `expected LOG "${section.expectText}" on stderr; got: ${stderr.slice(0, 400)}`,
    }];
  }
  // expect-rows: judged strictly (see the header) — nothing may vanish.
  if (status !== 0) {
    return [{ checkId: section.id, pass: false, detail: `psql exited ${status}: ${stderr.slice(0, 400)}` }];
  }
  const results = [];
  for (const e of stderr.split('\n').filter((l) => /\bERROR:/.test(l))) {
    results.push({ checkId: `${section.id}:(error)`, pass: false, detail: `a statement errored, so its row never came back: ${e.trim().slice(0, 400)}` });
  }
  const seen = new Set();
  for (const line of stdout.split('\n').map((l) => l.trim()).filter(Boolean)) {
    // id and pass never hold commas or quotes; the detail may (csv-quoted).
    const m = line.match(/^([^,"]+),([^,]*)(?:,(.*))?$/);
    if (!m) {
      results.push({ checkId: `${section.id}:(stray)`, pass: false, detail: `not a check row (check_id,pass[,detail]): ${line.slice(0, 200)}` });
      continue;
    }
    const [, id, passCol, detail = ''] = m;
    seen.add(id);
    if (passCol === 't' || passCol === 'f') {
      results.push({ checkId: `${section.id}:${id}`, pass: passCol === 't', detail });
    } else if (passCol === '') {
      results.push({ checkId: `${section.id}:${id}`, pass: false, detail: `pass column is NULL — the check could not decide. ${detail}`.trim() });
    } else {
      results.push({ checkId: `${section.id}:(stray)`, pass: false, detail: `not a check row (pass must be t/f): ${line.slice(0, 200)}` });
    }
  }
  const skipped = new Set(target === 'local' ? (section.liveOnly ?? []) : []);
  for (const id of section.expectedIds ?? []) {
    if (skipped.has(id)) {
      results.push({ checkId: `${section.id}:${id}`, skip: true, detail: 'live-only (needs pg_cron); runs on --target live' });
    } else if (!seen.has(id)) {
      results.push({ checkId: `${section.id}:${id}`, pass: false, detail: 'named in the script but never came back' });
    }
  }
  if (!results.some((r) => r.pass !== undefined)) {
    return [{ checkId: section.id, pass: false, detail: 'section emitted no check rows (check_id,pass[,detail]) — vacuous (P9)' }];
  }
  return results;
}

/**
 * The wire-contract bridge (design ruling / OV-DX #10): strings live ONCE in
 * packages/app/src/lib/authContract.json; the runner injects them as psql
 * variables so verify SQL references :'contract_bad_code' etc. instead of
 * retyping — the drift the pin exists to prevent.
 */
function contractVars() {
  const contract = JSON.parse(
    readFileSync(resolve(ROOT, 'packages/app/src/lib/authContract.json'), 'utf8'),
  );
  const vars = {
    contract_not_student: contract.joinClassErrors.notStudent,
    contract_disabled: contract.joinClassErrors.disabled,
    contract_bad_code: contract.joinClassErrors.badCode,
    contract_domain_template: contract.joinClassErrors.domainTemplate,
    contract_signup_template: contract.signupRefusalTemplate,
    contract_log_prefix: contract.joinRefusalLogPrefix,
  };
  return Object.entries(vars).flatMap(([k, v]) => ['-v', `${k}=${v}`]);
}

function loadDbUrl(target) {
  if (target === 'local') {
    return process.env.SUPABASE_DB_URL_LOCAL
      ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
  }
  // live: .env.supabase (never committed) supplies SUPABASE_DB_URL.
  const envPath = resolve(ROOT, '.env.supabase');
  if (!process.env.SUPABASE_DB_URL && existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^SUPABASE_DB_URL=(.+)$/);
      if (m) process.env.SUPABASE_DB_URL = m[1].trim();
    }
  }
  if (!process.env.SUPABASE_DB_URL) {
    console.error(
      'Missing SUPABASE_DB_URL. Add it to .env.supabase (create from .env.supabase.example):\n' +
      '  the POOLER connection string — Dashboard → Connect → Session pooler —\n' +
      '  with the database password from Settings → Database (reset it if never recorded).',
    );
    process.exit(2);
  }
  return process.env.SUPABASE_DB_URL;
}

function main() {
  const args = process.argv.slice(2);
  const targetIx = args.indexOf('--target');
  const target = targetIx >= 0 ? args[targetIx + 1] : null;
  if (target !== 'live' && target !== 'local') {
    console.error('Refusing to run without an explicit --target live|local (wrong-database hazard).');
    process.exit(2);
  }
  const onlyIx = args.indexOf('--only');
  const only = onlyIx >= 0 ? args[onlyIx + 1] : null;

  try {
    execFileSync('psql', ['--version'], { stdio: 'pipe' });
  } catch {
    console.error(
      'psql not found. One-time install (libpq is keg-only — the link step is required):\n' +
      '  brew install libpq && brew link --force libpq',
    );
    process.exit(2);
  }

  const dbUrl = loadDbUrl(target);
  const files = AUTH_VERIFY_SET.filter((f) => !only || f.startsWith(only));
  let pass = 0, fail = 0, skip = 0;
  const failures = [];

  for (const file of files) {
    const path = resolve(ROOT, 'scripts', file);
    if (!existsSync(path)) {
      console.error(`  MISSING  ${file}`);
      fail += 1; failures.push({ file, checkId: '(file)', detail: 'script not found' });
      continue;
    }
    const sections = parseSections(readFileSync(path, 'utf8'), file);
    if (sections.length === 0) {
      console.error(`  NO-SECTIONS  ${file} — not runner-compatible yet (no @section markers)`);
      fail += 1; failures.push({ file, checkId: '(file)', detail: 'no @section markers' });
      continue;
    }
    console.log(`\n${basename(file)} — ${sections.length} sections (target: ${target})`);
    for (const section of sections) {
      const sql = sectionSql(section, target);
      const res = spawnSync('psql', [dbUrl, '--csv', '-t', '-q', '-X', '-v', 'ON_ERROR_STOP=0', ...contractVars()], {
        input: sql, encoding: 'utf8', timeout: 120_000,
      });
      const results = judgeSection(section, {
        status: res.status ?? 1, stdout: res.stdout ?? '', stderr: res.stderr ?? '',
      }, { target });
      for (const r of results) {
        if (r.skip) { skip += 1; console.log(`  SKIP  ${r.checkId} (${r.detail})`); }
        else if (r.pass) { pass += 1; console.log(`  PASS  ${r.checkId}`); }
        else {
          fail += 1;
          console.log(`  FAIL  ${r.checkId}\n        ${r.detail}`);
          failures.push({ file, checkId: r.checkId, detail: r.detail, sql });
        }
      }
    }
  }

  console.log(`\n${pass} passed, ${fail} failed${skip ? `, ${skip} skipped (live-only)` : ''} across ${files.length} scripts.`);
  if (fail > 0) {
    console.log('\nFailing section SQL (paste into a session or the SQL editor to investigate):');
    for (const f of failures.slice(0, 3)) {
      console.log(`\n--- ${f.file} :: ${f.checkId} ---\n${(f.sql ?? '').slice(0, 1200)}`);
    }
    process.exit(1);
  }
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
