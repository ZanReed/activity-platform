import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHECK_ACTIVITY_FUNCTION } from '../lib/edgeFunctions';

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
