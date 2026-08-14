// =============================================================================
// e2e/integration/stack.ts — preflight + reset + seed for the local stack
// -----------------------------------------------------------------------------
// The anti-stub lane's ground rules (D-11/E-5 + DX D7/D9):
//
//  * PREFLIGHT WITH NAMED FIXES (D7): every way a cold machine fails is
//    detected and answered with the exact command to run — the error contract
//    the verify runner set the bar for.
//  * `supabase db reset` PER RUN (D9): deterministic, residue-free, and a
//    free apply-rehearsal of EVERY migration (0001 → the arc's last) on each
//    lane run.
//  * SEEDING DERIVES FROM contract.ts (D10/P2): the SQL is generated from the
//    same constants the specs import — no retyped identities.
//  * REAL TRIGGER, REAL SESSIONS (E-5): users are created as email+password
//    THROUGH auth signup (the real handle_new_auth_user trigger mints the
//    role or refuses), then signInWithPassword issues genuine local JWTs.
//    Admin-minted sessions would bypass the trigger and recreate exactly the
//    stub-blindness this lane exists to end.
// =============================================================================

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { INT_DOMAIN, LOCAL_ANON_KEY } from './contract';

const REPO_ROOT = resolve(import.meta.dirname ?? __dirname, '../../../..');

function fail(problem: string, fix: string): never {
  throw new Error(
    `\n[integration lane] ${problem}\n  FIX: ${fix}\n  (The lane is LOCAL-ONLY and needs Docker + the supabase CLI — see README.)`,
  );
}

function supabaseCli(args: string[]): string {
  try {
    return execFileSync('supabase', args, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    const e = err as { code?: string; stderr?: string };
    if (e.code === 'ENOENT') {
      fail(
        'the `supabase` CLI is not installed (or not on PATH).',
        'brew install supabase/tap/supabase',
      );
    }
    throw err;
  }
}

/** The service-role key, read from the running stack — never hardcoded. */
export interface LocalStack {
  serviceRoleKey: string;
}

export function preflightAndReset(): LocalStack {
  // 1. CLI present + stack running (also catches Docker-not-running: status
  //    fails when the containers are down).
  let status: string;
  try {
    status = supabaseCli(['status', '-o', 'env']);
  } catch {
    fail(
      'the local Supabase stack is not running.',
      'start Docker Desktop, then run `supabase start` in the repo root (first run downloads images)',
    );
  }
  const env = Object.fromEntries(
    status
      .split('\n')
      .map((l) => l.match(/^([A-Z_]+)="?([^"]*)"?$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2]]),
  );
  const anon = env.ANON_KEY ?? '';
  const service = env.SERVICE_ROLE_KEY ?? '';
  if (!anon || !service) {
    fail(
      '`supabase status` did not report ANON_KEY/SERVICE_ROLE_KEY.',
      'run `supabase start` and re-check `supabase status -o env`',
    );
  }
  // 2. The dev server is BUILT with the well-known demo anon key; a custom
  //    JWT secret would silently 401 every request with a confusing symptom.
  if (anon !== LOCAL_ANON_KEY) {
    fail(
      "the local stack's ANON_KEY differs from the well-known demo key the lane's dev server is configured with.",
      'remove any custom jwt secret from supabase/config.toml local config (or update LOCAL_ANON_KEY in e2e/integration/contract.ts to match `supabase status -o env`)',
    );
  }

  // 3. Deterministic world: reset applies EVERY migration from scratch. This
  //    is also the free local apply-rehearsal of the newest migration.
  try {
    execFileSync('supabase', ['db', 'reset'], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 300_000,
    });
  } catch (err) {
    fail(
      `\`supabase db reset\` failed: ${(err as Error).message}`,
      'a migration is broken locally — run `supabase db reset` by hand and read its output',
    );
  }

  // 4. Seed the admission fixtures, GENERATED from contract.ts (P2). psql is
  //    not required: the service role writes through PostgREST.
  return { serviceRoleKey: service };
}

/** Seed the admission fixtures AS `postgres`, through the CLI's own psql.
 *
 *  NOT through PostgREST as the service role, which is what this did until
 *  2026-08-14 and which never worked: `student_domain` and `allowlist` are two
 *  of the SEVEN zero-policy tables, and service_role holds no DML on either, so
 *  every seed returned `42501 permission denied for table`. Nothing had noticed
 *  because the lane had never completed a run (the chain aborted earlier, at
 *  0009).
 *
 *  The fix is deliberately NOT "grant service_role INSERT". Those two tables are
 *  the admission boundary — a row in `student_domain` admits an entire email
 *  domain as students, and a row in `allowlist` mints a teacher — and 0027/0028
 *  hardened exactly that surface. Widening a production grant so a test can
 *  write is the wrong direction; a fixture should reach for more privilege
 *  LOCALLY, not lower the bar globally. `postgres` is also the path 0013
 *  documents for real seeding ("the author seeds rows in the SQL editor"), so
 *  the lane now rehearses the documented path instead of an invented one.
 *
 *  Local-only by construction: this runs inside `supabase db` against the
 *  container stack and has no meaning against a hosted project. */
export async function seedAdmission(): Promise<void> {
  const teacherEmail = (await import('./contract')).INT_TEACHER.email;
  // Generated from contract.ts, never retyped (D10/P2). Quote-escaped rather
  // than interpolated raw: these are test constants, but a seeder that breaks
  // on an apostrophe is a trap for whoever edits the contract next.
  const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
  // ONE command on purpose: `supabase db query` sends a prepared statement, and
  // Postgres refuses multiple commands in one — two bare INSERTs fail with
  // "cannot insert multiple commands into a prepared statement". A DO block is
  // a single command and keeps both seeds in one transaction.
  const sql = [
    `do $seed$ begin`,
    `  insert into public.student_domain (domain) values (${q(INT_DOMAIN)})`,
    `    on conflict (domain) do nothing;`,
    `  insert into public.allowlist (email) values (${q(teacherEmail)})`,
    `    on conflict (email) do nothing;`,
    `end $seed$;`,
  ].join('\n');

  try {
    execFileSync('supabase', ['db', 'query', sql], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 60_000,
    });
  } catch (err) {
    // Surface the CLI's OWN output, not just execFileSync's "Command failed"
    // banner. D7 promises a named fix, and the first version of this seeder
    // buried the actual cause ("cannot insert multiple commands into a prepared
    // statement") behind a truncated echo of the command — which is the failure
    // mode the preflight contract exists to prevent.
    const e = err as { message?: string; stdout?: Buffer; stderr?: Buffer };
    const detail = [e.stdout?.toString(), e.stderr?.toString()]
      .filter((s): s is string => Boolean(s?.trim()))
      .join('\n')
      .trim();
    fail(
      `seeding the admission fixtures failed.\n  CLI SAID: ${detail || e.message}`,
      'check the local stack is healthy: `supabase status`, then re-run',
    );
  }
}
