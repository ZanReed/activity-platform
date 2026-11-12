// =============================================================================
// republishImpact.test.ts — what the republish confirm says (UI review G-3)
// =============================================================================

import { describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ progress: vi.fn() }));
vi.mock('../lib/classProgress', () => ({ fetchActivityProgress: h.progress }));

import { REPUBLISH_COPY, hasLockedOrDol, isNoChanges, startedStudentCount } from '../lib/republishImpact';

const student = (id: string, checked: number) => ({ student_id: id, sections_checked: checked });

describe('startedStudentCount', () => {
    it('counts each student once, across classes, who has checked on the current version', async () => {
        h.progress.mockResolvedValueOnce({
            classes: [
                { class_id: 'a', students: [student('s1', 2), student('s2', 0)] },
                { class_id: 'b', students: [student('s1', 1), student('s3', 1)] },
            ],
        });
        expect(await startedStudentCount('act')).toBe(2);
    });

    it('nobody started → 0 (the editor then republishes without asking)', async () => {
        h.progress.mockResolvedValueOnce({ classes: [{ class_id: 'a', students: [student('s1', 0)] }] });
        expect(await startedStudentCount('act')).toBe(0);
    });

    it('a failed read → null (the editor still asks, without a number)', async () => {
        h.progress.mockRejectedValueOnce(new Error('offline'));
        expect(await startedStudentCount('act')).toBeNull();
    });
});

describe('hasLockedOrDol', () => {
    it('true for a locked submission mode or any DoL section, false otherwise', () => {
        expect(hasLockedOrDol({ meta: { submissionMode: 'locked' }, sections: [] })).toBe(true);
        expect(hasLockedOrDol({ meta: { submissionMode: 'free' }, sections: [{ id: 's', dol: { skills: ['x'] } }] })).toBe(true);
        expect(hasLockedOrDol({ meta: { submissionMode: 'free' }, sections: [{ id: 's' }] })).toBe(false);
        expect(hasLockedOrDol(null)).toBe(false);
    });
});

describe('the confirm copy', () => {
    it('counts students in a sentence, and says so plainly when it could not', () => {
        expect(REPUBLISH_COPY.started(1)).toBe('1 student has started this.');
        expect(REPUBLISH_COPY.started(4)).toBe('4 students have started this.');
        expect(REPUBLISH_COPY.started(null)).toBe('Students may have started this.');
    });
});

describe('isNoChanges', () => {
    const base = { live: true, hasDraft: false, changeKey: 'k1', cleanKey: 'k1', saving: false };
    it('only when live, no draft, at the clean key, and not saving', () => {
        expect(isNoChanges(base)).toBe(true);
        expect(isNoChanges({ ...base, live: false })).toBe(false); // first publish says Publish
        expect(isNoChanges({ ...base, hasDraft: true })).toBe(false);
        expect(isNoChanges({ ...base, changeKey: 'k2' })).toBe(false); // typed, not saved yet
        expect(isNoChanges({ ...base, saving: true })).toBe(false);
        expect(isNoChanges({ ...base, cleanKey: null })).toBe(false);
    });
});
