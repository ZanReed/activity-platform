// =============================================================================
// classes.test.ts — teacher-side class data layer (S1, ruling 3.1C)
// -----------------------------------------------------------------------------
// The assertion gate and input normalization are the testable logic; the thin
// Supabase reads aren't re-tested (grades.ts convention). createClass's gate
// matters most: a class row without a real assertion must be unrepresentable
// from this code path.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn();
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: () => ({ insert: (row: unknown) => insertMock(row) }),
        rpc: vi.fn(),
    },
}));

import {
    ASSERTION_TEXT_VERSION,
    createClass,
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
    beforeEach(() => insertMock.mockReset());

    it('refuses to create without the age assertion — no DB call at all', async () => {
        await expect(
            createClass({
                name: 'Algebra I — Period 2',
                expectedDomain: '',
                ageAsserted: false,
                teacherId: 't-1',
            }),
        ).rejects.toThrow(/age assertion/);
        expect(insertMock).not.toHaveBeenCalled();
    });

    it('refuses an empty name', async () => {
        await expect(
            createClass({
                name: '   ',
                expectedDomain: '',
                ageAsserted: true,
                teacherId: 't-1',
            }),
        ).rejects.toThrow(/name/i);
        expect(insertMock).not.toHaveBeenCalled();
    });

    it('stamps the assertion fields with the policy version in force', async () => {
        insertMock.mockReturnValue({
            select: () => ({
                single: () =>
                    Promise.resolve({
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
                    }),
            }),
        });

        const info = await createClass({
            name: '  Algebra I — Period 2  ',
            expectedDomain: 'Kid@District.org',
            ageAsserted: true,
            teacherId: 't-1',
        });

        expect(insertMock).toHaveBeenCalledWith({
            name: 'Algebra I — Period 2',
            teacher_id: 't-1',
            expected_domain: 'district.org',
            age_assertion_by: 't-1',
            assertion_text_version: ASSERTION_TEXT_VERSION,
        });
        expect(info.joinCode).toBe('ABC234');
    });
});

describe('assertion/policy version linkage', () => {
    it('rides the privacy policy version (3.1C paper-trail contract)', () => {
        expect(ASSERTION_TEXT_VERSION).toBe(POLICY_VERSION);
    });
});
