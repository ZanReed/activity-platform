// study:report / telemetry:edit-rates — the canonical per-rev reads (W-5).
// Both are COMMITTED SQL (scripts/grading-*.sql at the repo root): run here
// through psql when GRADING_DATABASE_URL is set, printed with instructions
// when it is not. Documented SQL over a bespoke API on purpose — these reads
// join suggestion rows the teacher-facing RPCs deliberately do not expose
// (study rows, superseded rows), so they run as the author against the
// database directly, exactly like the verify scripts do.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const FILES: Record<string, string> = {
  study: join(REPO_ROOT, 'scripts', 'grading-study-report.sql'),
  'edit-rates': join(REPO_ROOT, 'scripts', 'grading-edit-rates.sql'),
};

const which = process.argv[2] ?? '';
const path = FILES[which];
if (!path) {
  console.error('Usage: sqlReport.ts study|edit-rates');
  process.exit(1);
}

const dbUrl = process.env.GRADING_DATABASE_URL;
if (!dbUrl) {
  console.log(readFileSync(path, 'utf8'));
  console.log(
    `\n-- No GRADING_DATABASE_URL set. Run the SQL above yourself (psql or the\n` +
      `-- SQL editor), or export GRADING_DATABASE_URL and re-run this command.\n` +
      `-- Local stack: postgresql://postgres:postgres@127.0.0.1:54322/postgres`,
  );
  process.exit(0);
}

const res = spawnSync('psql', [dbUrl, '-f', path], { stdio: 'inherit' });
process.exit(res.status ?? 1);
