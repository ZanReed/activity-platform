// =============================================================================
// classes.test.ts — class data layer (S1 ruling 3.1C; identity slice E-2/E-3)
// -----------------------------------------------------------------------------
// The assertion gate and input normalization are the testable logic; the thin
// Supabase reads aren't re-tested (grades.ts convention). createClass's gate
// matters most: a class row without a real assertion must be unrepresentable
// from this code path. REWRITTEN with 0027 (regression row from the eng
// review's IRON RULE): creation goes through the audited create_class RPC —
// the direct INSERT is privilege-dead — so the mock pins the RPC wire shape.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

const rpcMock = vi.fn();
vi.mock('../lib/supabase', () => ({
    supabase: {
        rpc: (fn: string, args: unknown) => rpcMock(fn, args),
    },
}));

import {
    ASSERTION_TEXT_VERSION,
    createClass,
    regenerateJoinCode,
    normalizeExpectedDomain,
} from '../lib/classes';
import { POLICY_VERSION } from '../lib/policyVersion';

describe('normalizeExpectedDomain', () => {
    it('trims and lowercases', () => {
        expect(normalizeExpectedDomain('  District.ORG ')).toBe('district.org');
    });
    it('accepts a pasted email or @-prefixed form', () => {
        expect(normalizeExpectedDomain('kid@district.org')).toBe('district.org');
        expect(normalizeExpectedDomain('@district.org')).toBe('district.org');
    });
    it('empty → null (no pin)', () => {
        expect(normalizeExpectedDomain('')).toBeNull();
        expect(normalizeExpectedDomain('   ')).toBeNull();
        expect(normalizeExpectedDomain('@')).toBeNull();
    });
});

describe('createClass assertion gate', () => {
    beforeEach(() => rpcMock.mockReset());

    it('refuses to create without the age assertion — no DB call at all', async () => {
        await expect(
            createClass({
                name: 'Algebra I — Period 2',
                expectedDomain: '',
                ageAsserted: false,
            }),
        ).rejects.toThrow(/age assertion/);
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it('refuses an empty name', async () => {
        await expect(
            createClass({
                name: '   ',
                expectedDomain: '',
                ageAsserted: true,
            }),
        ).rejects.toThrow(/name/i);
        expect(rpcMock).not.toHaveBeenCalled();
    });

    it('calls the audited RPC with normalized inputs + the policy version in force', async () => {
        rpcMock.mockResolvedValue({
            data: {
                id: 'c-1',
                name: 'Algebra I — Period 2',
                join_code: 'ABC234',
                expected_domain: 'district.org',
                age_assertion_at: '2026-07-28T00:00:00Z',
                assertion_text_version: ASSERTION_TEXT_VERSION,
                created_at: '2026-07-28T00:00:00Z',
            },
            error: null,
        });

        const info = await createClass({
            name: '  Algebra I — Period 2  ',
            expectedDomain: 'Kid@District.org',
            ageAsserted: true,
        });

        // The RPC wire shape (P2: the e2e stub derives from this same
        // contract — 0027's create_class(p_name, p_expected_domain,
        // p_assertion_text_version)).
        expect(rpcMock).toHaveBeenCalledWith('create_class', {
            p_name: 'Algebra I — Period 2',
            p_expected_domain: 'district.org',
            p_assertion_text_version: ASSERTION_TEXT_VERSION,
        });
        expect(info.joinCode).toBe('ABC234');
    });
});

describe('regenerateJoinCode', () => {
    beforeEach(() => rpcMock.mockReset());

    it('is one audited RPC call, no client compose (E-3)', async () => {
        rpcMock.mockResolvedValue({ data: { join_code: 'R8KD4N' }, error: null });
        const code = await regenerateJoinCode('class-1');
        expect(rpcMock).toHaveBeenCalledWith('regenerate_join_code', {
            p_class_id: 'class-1',
        });
        expect(code).toBe('R8KD4N');
    });
});

describe('assertion/policy version linkage', () => {
    it('rides the privacy policy version (3.1C paper-trail contract)', () => {
        expect(ASSERTION_TEXT_VERSION).toBe(POLICY_VERSION);
    });
});
