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
import {
  INT_DOMAIN,
  LOCAL_ANON_KEY,
  LOCAL_SUPABASE_URL,
} from './contract';

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

export async function seedAdmission(stack: LocalStack): Promise<void> {
  const headers = {
    apikey: stack.serviceRoleKey,
    Authorization: `Bearer ${stack.serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=ignore-duplicates',
  };
  const teacherEmail = (await import('./contract')).INT_TEACHER.email;
  const domainRes = await fetch(`${LOCAL_SUPABASE_URL}/rest/v1/student_domain`, {
    method: 'POST',
    headers,
    body: JSON.stringify([{ domain: INT_DOMAIN }]),
  });
  const allowRes = await fetch(`${LOCAL_SUPABASE_URL}/rest/v1/allowlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify([{ email: teacherEmail }]),
  });
  if (!domainRes.ok || !allowRes.ok) {
    fail(
      `seeding failed (student_domain ${domainRes.status}, allowlist ${allowRes.status}).`,
      'check the local stack is healthy: `supabase status`, then re-run',
    );
  }
}
