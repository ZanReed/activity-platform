import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHECK_ACTIVITY_FUNCTION,
  PUBLISH_ACTIVITY_RPC,
} from '../lib/edgeFunctions';

// A1's real lesson: the app POSTed to a function name that never existed
// (/check-section), and the e2e stub retyped the same wrong name — so the
// mismatch was invisible to the exact test built to catch it (s4:7, s4a).
// The fix has two halves: every consumer derives the name from ONE constant
// (P2), and THIS test pins that constant to a directory that actually exists
// under supabase/functions/ — so a function rename (or an S9-era deletion)
// on either side goes red instead of 404ing a student's check.
const FUNCTIONS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../supabase/functions',
);

describe('edge function name constants', () => {
  it('the functions root itself exists (anti-vacuity: a wrong FUNCTIONS_DIR must not pass the dir checks by matching nothing)', () => {
    expect(existsSync(FUNCTIONS_DIR)).toBe(true);
  });

  it(`CHECK_ACTIVITY_FUNCTION names an existing function directory (${CHECK_ACTIVITY_FUNCTION})`, () => {
    expect(existsSync(resolve(FUNCTIONS_DIR, CHECK_ACTIVITY_FUNCTION))).toBe(true);
  });
});

// The RPC equivalent of the directory pin (S9 Drop 1): publish calls
// `publish_activity` over PostgREST, so the name must match a function some
// migration actually defines — a rename on either side goes red here, not as
// a teacher-facing "function not found" at publish time.
const MIGRATIONS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../supabase/migrations',
);

describe('rpc name constants', () => {
  it(`PUBLISH_ACTIVITY_RPC is defined by a migration (${PUBLISH_ACTIVITY_RPC})`, () => {
    const definition = new RegExp(
      `create or replace function ${PUBLISH_ACTIVITY_RPC}\\(`,
    );
    const defined = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .some((f) =>
        definition.test(readFileSync(resolve(MIGRATIONS_DIR, f), 'utf8')),
      );
    expect(defined).toBe(true);
  });
});
