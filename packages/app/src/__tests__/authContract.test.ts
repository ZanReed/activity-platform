/**
 * The auth-boundary string contract pin (identity slice E-7, P2 policy:
 * matchers derive from production constants, never retyped).
 *
 * Layer 1 — this test: every wire string in authContract.json appears
 * VERBATIM in the migration that defines the raising function. The grep
 * targets the LATEST defining migration; if a future migration REPLACEs
 * join_class or the trigger, move LATEST_DEFINING_MIGRATION forward in the
 * same commit (the trap this guards is exactly how 0021 silently superseded
 * 0013 — see plan correction 1).
 *
 * Layer 2 — verify-0027 §E: the same strings pinned against LIVE
 * pg_proc.prosrc, which catches what a file grep cannot (drift between the
 * repo and the deployed function).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import contract from '../lib/authContract.json';
import { classifyJoinError, JOIN_ERROR_COPY } from '../lib/authMessages';

const LATEST_DEFINING_MIGRATION = '0027_admission_gate_hardening.sql';

const migrationPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../supabase/migrations',
  LATEST_DEFINING_MIGRATION,
);
const migrationSql = readFileSync(migrationPath, 'utf8');

describe('auth wire contract ↔ migration SQL', () => {
  it('join_class error strings appear verbatim in the defining migration', () => {
    for (const s of Object.values(contract.joinClassErrors)) {
      expect(migrationSql).toContain(`'${s}'`);
    }
  });

  it('signup refusal template appears verbatim in the defining migration', () => {
    expect(migrationSql).toContain(`'${contract.signupRefusalTemplate}'`);
  });

  it('the RAISE LOG refusal prefix appears in the defining migration', () => {
    expect(migrationSql).toContain(contract.joinRefusalLogPrefix);
  });
});

describe('classifyJoinError', () => {
  it('classifies each wire string to its kind', () => {
    expect(classifyJoinError(contract.joinClassErrors.notStudent)).toBe('not_student');
    expect(classifyJoinError(contract.joinClassErrors.disabled)).toBe('disabled');
    expect(classifyJoinError(contract.joinClassErrors.badCode)).toBe('bad_code');
    expect(
      classifyJoinError('This class is limited to school.org accounts'),
    ).toBe('domain');
  });

  it('unknown messages fall through to unknown (never a wrong specific copy)', () => {
    expect(classifyJoinError('TypeError: Failed to fetch')).toBe('unknown');
  });

  it('every kind has student-facing copy distinct from the wire string', () => {
    for (const [kind, copy] of Object.entries(JOIN_ERROR_COPY)) {
      expect(copy.length).toBeGreaterThan(0);
      // The copy layer is what students read; it must never leak raw wire text.
      for (const wire of Object.values(contract.joinClassErrors)) {
        expect(copy).not.toBe(wire);
      }
      expect(kind).toBeTruthy();
    }
  });
});
