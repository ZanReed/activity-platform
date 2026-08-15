/**
 * The auth-boundary string contract pin (identity slice E-7, P2 policy:
 * matchers derive from production constants, never retyped).
 *
 * Layer 1 — this test: every wire string in authContract.json appears
 * VERBATIM in the migration that defines the raising function. The grep
 * targets the LATEST defining migration PER FAMILY; if a future migration
 * REPLACEs a function, move its entry forward in the same commit (the trap
 * this guards is exactly how 0021 silently superseded 0013 — see plan
 * correction 1).
 *
 * 2026-08-15: this warning came due. 0033 re-creates BOTH join_class (for the
 * member cap) and handle_new_auth_user (the pending branch), so a single
 * LATEST_DEFINING_MIGRATION pointing at 0027 was grepping a superseded file —
 * the test kept passing while asserting against text that no longer defines
 * the deployed behavior. Hence the per-family map below.
 *
 * Layer 2 — verify-0027 §C + verify-0033 §A: the same strings pinned against
 * LIVE pg_proc.prosrc, which catches what a file grep cannot (drift between
 * the repo and the deployed function).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import contract from '../lib/authContract.json';
import {
  classifyClaimError,
  classifyRedeemError,
  CLAIM_ERROR_COPY,
  REDEEM_ERROR_COPY,
} from '../lib/authMessages';

/** function family -> the migration whose body currently defines it. */
const DEFINING_MIGRATION = {
  joinClass: '0033_pending_admission.sql',
  trigger: '0033_pending_admission.sql',
  redeem: '0033_pending_admission.sql',
  claimTeacher: '0033_pending_admission.sql',
} as const;

const migrationsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../supabase/migrations',
);
const sqlFor = (family: keyof typeof DEFINING_MIGRATION) =>
  readFileSync(resolve(migrationsDir, DEFINING_MIGRATION[family]), 'utf8');

describe('auth wire contract ↔ migration SQL', () => {
  it('join_class error strings appear verbatim in its defining migration', () => {
    const sql = sqlFor('joinClass');
    for (const s of Object.values(contract.joinClassErrors)) {
      expect(sql).toContain(`'${s}'`);
    }
  });

  it('redeem_join_code error strings appear verbatim', () => {
    const sql = sqlFor('redeem');
    for (const s of Object.values(contract.redeemErrors)) {
      expect(sql).toContain(`'${s}'`);
    }
  });

  it('claim_teacher error strings appear verbatim', () => {
    const sql = sqlFor('claimTeacher');
    // classCapTemplate is a prefix of the full raise (which appends guidance),
    // so assert containment rather than a quoted-literal match.
    expect(sql).toContain(contract.claimTeacherErrors.classCapTemplate);
    for (const key of ['signedOut', 'alreadySetUp', 'noAttestation'] as const) {
      expect(sql).toContain(`'${contract.claimTeacherErrors[key]}'`);
    }
  });

  it('RPC names match the functions the migration creates', () => {
    const sql = sqlFor('redeem');
    expect(sql).toContain(`create or replace function ${contract.rpcNames.redeemJoinCode}(`);
    expect(sql).toContain(`create or replace function ${contract.rpcNames.claimTeacher}(`);
  });

  /**
   * The retirement pin (0033 R1). signupRefusalTemplate is kept in the contract
   * precisely so its ABSENCE is assertable: the trigger no longer refuses
   * unknown emails, it admits them as pending. A re-added refusal would
   * silently kill self-serve admission, and this is the row that catches it.
   */
  it('the signup refusal is RETIRED from the trigger (admission is pending now)', () => {
    const sql = sqlFor('trigger');
    expect(sql).not.toContain(`raise exception 'Email % is not permitted to sign up'`);
    expect(sql).toContain(`'pending'`);
  });

  it('the RAISE LOG refusal prefix appears in the defining migration', () => {
    expect(sqlFor('joinClass')).toContain(contract.joinRefusalLogPrefix);
  });
});

describe('classifyRedeemError', () => {
  it('classifies each wire string to its kind', () => {
    expect(classifyRedeemError(contract.redeemErrors.signedOut)).toBe('signed_out');
    expect(classifyRedeemError(contract.redeemErrors.wrongRole)).toBe('wrong_role');
    expect(classifyRedeemError(contract.redeemErrors.classFull)).toBe('class_full');
    // Shared with join_class: redeem delegates to it after promoting, so a
    // single call can raise from either body.
    expect(classifyRedeemError(contract.joinClassErrors.disabled)).toBe('disabled');
    expect(classifyRedeemError(contract.joinClassErrors.badCode)).toBe('bad_code');
    expect(classifyRedeemError('This class is limited to school.org accounts')).toBe('domain');
  });

  it('unknown messages fall through to unknown (never a wrong specific copy)', () => {
    expect(classifyRedeemError('TypeError: Failed to fetch')).toBe('unknown');
  });

  it('every kind has student-facing copy distinct from the wire string', () => {
    const wireStrings = [
      ...Object.values(contract.redeemErrors),
      ...Object.values(contract.joinClassErrors),
    ];
    for (const copy of Object.values(REDEEM_ERROR_COPY)) {
      expect(copy.length).toBeGreaterThan(0);
      for (const wire of wireStrings) expect(copy).not.toBe(wire);
    }
  });
});

describe('classifyClaimError', () => {
  it('classifies each wire string to its kind', () => {
    expect(classifyClaimError(contract.claimTeacherErrors.signedOut)).toBe('signed_out');
    expect(classifyClaimError(contract.claimTeacherErrors.alreadySetUp)).toBe('already_set_up');
    expect(classifyClaimError(contract.claimTeacherErrors.noAttestation)).toBe('no_attestation');
    expect(classifyClaimError('This account is limited to 5 classes. Contact support to raise it.')).toBe(
      'class_cap',
    );
  });

  it('unknown messages fall through to unknown', () => {
    expect(classifyClaimError('TypeError: Failed to fetch')).toBe('unknown');
  });

  it('every kind has copy distinct from the wire string', () => {
    for (const copy of Object.values(CLAIM_ERROR_COPY)) {
      expect(copy.length).toBeGreaterThan(0);
      for (const wire of Object.values(contract.claimTeacherErrors)) {
        expect(copy).not.toBe(wire);
      }
    }
  });
});
