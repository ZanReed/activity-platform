import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHECK_ACTIVITY_FUNCTION,
  PHOTO_HANDOFF_FUNCTION,
  BANK_TEACHER_GUIDE_RPC,
  COPY_BANK_ACTIVITY_RPC,
  GLOSSARY_FOR_ACTIVITY_RPC,
  IS_BANK_LISTER_RPC,
  LIST_BANK_RPC,
  LIST_CLASS_ACTIVITIES_RPC,
  SET_ACTIVITY_LISTING_RPC,
  SET_PUBLIC_NAME_RPC,
  PUBLISH_ACTIVITY_RPC,
  SHARE_ACTIVITY_RPC,
  UNSHARE_ACTIVITY_RPC,
} from '../lib/edgeFunctions';
import { CLASS_TODAY_RPC, SET_CLASS_TODAY_RPC } from '../lib/classTodayRpc';

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

  it(`PHOTO_HANDOFF_FUNCTION names an existing function directory (${PHOTO_HANDOFF_FUNCTION})`, () => {
    expect(existsSync(resolve(FUNCTIONS_DIR, PHOTO_HANDOFF_FUNCTION, 'index.ts'))).toBe(true);
  });

  // The no-sign-in flag is a deliberate, author-ruled exception (MS-24); the
  // declarative record is config.toml (P6). This pins that the phone's
  // function is in it with verify_jwt = false, and that the check function is
  // NOT — a phone with no session must reach the one, never the other.
  it('config.toml runs photo-handoff with no sign-in and keeps check-activity gated', () => {
    const toml = readFileSync(resolve(FUNCTIONS_DIR, '../config.toml'), 'utf8');
    expect(toml).toMatch(/\[functions\.photo-handoff\]\s*\nverify_jwt = false/);
    expect(toml).toMatch(/\[functions\.check-activity\]\s*\nverify_jwt = true/);
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
  const rpcs = [
    PUBLISH_ACTIVITY_RPC,
    SHARE_ACTIVITY_RPC,
    UNSHARE_ACTIVITY_RPC,
    LIST_CLASS_ACTIVITIES_RPC,
    CLASS_TODAY_RPC,
    SET_CLASS_TODAY_RPC,
    GLOSSARY_FOR_ACTIVITY_RPC,
    LIST_BANK_RPC,
    BANK_TEACHER_GUIDE_RPC,
    COPY_BANK_ACTIVITY_RPC,
    SET_ACTIVITY_LISTING_RPC,
    IS_BANK_LISTER_RPC,
    SET_PUBLIC_NAME_RPC,
  ];
  it.each(rpcs)('%s is defined by a migration', (rpc) => {
    const definition = new RegExp(`create or replace function ${rpc}\\(`);
    const defined = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .some((f) =>
        definition.test(readFileSync(resolve(MIGRATIONS_DIR, f), 'utf8')),
      );
    expect(defined).toBe(true);
  });
});
