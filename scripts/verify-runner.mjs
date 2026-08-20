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

/** Parse a verify script into runner sections. Exported for unit tests. */
export function parseSections(sql, file) {
  const sections = [];
  let current = null;
  for (const line of sql.split('\n')) {
    const sect = line.match(/^--\s*@section\s+(\S+)/);
    if (sect) {
      if (current) sections.push(current);
      current = { id: sect[1], file, mode: 'expect-rows', expectText: null, sql: [] };
      continue;
    }
    if (!current) continue; // preamble prose stays runner-invisible
    const err = line.match(/^--\s*@expect-error\s+(.+)$/);
    const log = line.match(/^--\s*@expect-log\s+(.+)$/);
    if (err) { current.mode = 'expect-error'; current.expectText = err[1].trim(); continue; }
    if (log) { current.mode = 'expect-log'; current.expectText = log[1].trim(); continue; }
    if (/^--\s*@expect-rows\b/.test(line)) { current.mode = 'expect-rows'; continue; }
    current.sql.push(line);
  }
  if (current) sections.push(current);
  return sections;
}

/** Classify one executed section. Exported for unit tests. */
export function judgeSection(section, { status, stdout, stderr }) {
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
  // expect-rows: any psql error fails the section; otherwise parse CSV rows.
  if (status !== 0) {
    return [{ checkId: section.id, pass: false, detail: `psql exited ${status}: ${stderr.slice(0, 400)}` }];
  }
  const rows = stdout.split('\n').map((l) => l.trim()).filter(Boolean)
    .map((l) => l.split(','))
    .filter((cols) => cols.length >= 2 && (cols[1] === 't' || cols[1] === 'f'));
  if (rows.length === 0) {
    return [{ checkId: section.id, pass: false, detail: 'section emitted no check rows (check_id,pass[,detail]) — vacuous (P9)' }];
  }
  return rows.map((cols) => ({
    checkId: `${section.id}:${cols[0]}`,
    pass: cols[1] === 't',
    detail: cols.slice(2).join(','),
  }));
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
  let pass = 0, fail = 0;
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
      const sql = section.sql.join('\n');
      const res = spawnSync('psql', [dbUrl, '--csv', '-t', '-q', '-X', '-v', 'ON_ERROR_STOP=0', ...contractVars()], {
        input: sql, encoding: 'utf8', timeout: 120_000,
      });
      const results = judgeSection(section, {
        status: res.status ?? 1, stdout: res.stdout ?? '', stderr: res.stderr ?? '',
      });
      for (const r of results) {
        if (r.pass) { pass += 1; console.log(`  PASS  ${r.checkId}`); }
        else {
          fail += 1;
          console.log(`  FAIL  ${r.checkId}\n        ${r.detail}`);
          failures.push({ file, checkId: r.checkId, detail: r.detail, sql });
        }
      }
    }
  }

  console.log(`\n${pass} passed, ${fail} failed across ${files.length} scripts.`);
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
