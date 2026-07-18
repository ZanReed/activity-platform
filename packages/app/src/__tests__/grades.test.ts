// =============================================================================
// grades.test.ts — pure grading arithmetic (Phase 2.6 slice 3)
// -----------------------------------------------------------------------------
// The DB touch points (loadGrades/upsertGrade) aren't tested here — they're thin
// Supabase calls. These cover the arithmetic the dashboard renders: point
// totals, grading status, and which blocks are gradable.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { Rubric, SubmissionResponses } from '@activity/schema';
import {
    rubricMaxPoints,
    earnedTotal,
    gradingStatus,
    gradableBlocks,
    submissionNeedsGrading,
    type BlockGrade,
} from '../lib/grades';
import type { ActivityIndex, FreeTextInfo } from '../lib/submissions';

const C1 = '11111111-1111-4111-8111-111111111111';
const C2 = '11111111-1111-4111-8111-111111111112';
const rubric: Rubric = {
    criteria: [
        { id: C1, label: 'Thesis', maxPoints: 4 },
        { id: C2, label: 'Evidence', maxPoints: 6 },
    ],
};

function grade(criteria: BlockGrade['criteria']): BlockGrade {
    return {
        submissionId: 's1',
        blockId: 'b1',
        criteria,
        generalFeedback: null,
        gradedAt: '2026-07-13T00:00:00Z',
        updatedAt: '2026-07-13T00:00:00Z',
    };
}

describe('rubricMaxPoints', () => {
    it('sums criterion maxPoints', () => {
        expect(rubricMaxPoints(rubric)).toBe(10);
    });
});

describe('earnedTotal', () => {
    it('sums earned points; undefined grade → 0', () => {
        expect(earnedTotal(rubric, undefined)).toBe(0);
        expect(
            earnedTotal(rubric, grade([
                { criterionId: C1, earned: 3 },
                { criterionId: C2, earned: 5 },
            ])),
        ).toBe(8);
    });

    it('clamps a criterion to [0, maxPoints]', () => {
        expect(
            earnedTotal(rubric, grade([
                { criterionId: C1, earned: 99 }, // over max 4
                { criterionId: C2, earned: -2 }, // below 0
            ])),
        ).toBe(4);
    });

    it('ignores a grade for a criterion the rubric no longer has', () => {
        expect(
            earnedTotal(rubric, grade([
                { criterionId: C1, earned: 4 },
                { criterionId: 'removed-criterion', earned: 6 },
            ])),
        ).toBe(4);
    });
});

describe('gradingStatus', () => {
    it('none when no grade or no scored criteria', () => {
        expect(gradingStatus(rubric, undefined)).toBe('none');
        expect(gradingStatus(rubric, grade([]))).toBe('none');
    });
    it('partial when some but not all criteria scored', () => {
        expect(gradingStatus(rubric, grade([{ criterionId: C1, earned: 2 }]))).toBe(
            'partial',
        );
    });
    it('full when every criterion scored', () => {
        expect(
            gradingStatus(rubric, grade([
                { criterionId: C1, earned: 2 },
                { criterionId: C2, earned: 6 },
            ])),
        ).toBe('full');
    });
});

// ---- gradableBlocks / submissionNeedsGrading --------------------------------

function info(overrides: Partial<FreeTextInfo> = {}): FreeTextInfo {
    return {
        blockId: 'b1',
        blockType: 'essay',
        docOrder: 1,
        problemPrompt: 'Write.',
        rubric,
        sectionId: 'sec-1',
        sectionTitle: null,
        ...overrides,
    };
}

function index(entries: Array<[string, FreeTextInfo]>): ActivityIndex {
    return {
        blanks: new Map(),
        graphs: new Map(),
        numberLines: new Map(),
        dataPlots: new Map(),
        mcs: new Map(),
        matchings: new Map(),
        orderings: new Map(),
        freeText: new Map(entries),
        sections: new Map(),
    };
}

function responses(free: Record<string, { text: string }>): SubmissionResponses {
    return { schemaVersion: 9, blanks: {}, freeResponses: free };
}

describe('gradableBlocks', () => {
    it('includes only rubric-bearing, answered blocks', () => {
        const idx = index([
            ['b1', info({ blockId: 'b1' })], // rubric + answered → gradable
            ['b2', info({ blockId: 'b2', rubric: null })], // no rubric → not gradable
            ['b3', info({ blockId: 'b3' })], // rubric but unanswered → not gradable
            ['b4', info({ blockId: 'b4', blockType: 'self_explanation', rubric: null })],
        ]);
        const resp = responses({
            b1: { text: 'answer' },
            b2: { text: 'answer' },
            b3: { text: '   ' }, // whitespace = unanswered
        });
        const blocks = gradableBlocks(idx, resp, undefined);
        expect(blocks.map((b) => b.info.blockId)).toEqual(['b1']);
        expect(blocks[0]!.status).toBe('none');
    });
});

describe('submissionNeedsGrading', () => {
    const idx = index([['b1', info({ blockId: 'b1' })]]);
    const resp = responses({ b1: { text: 'answer' } });

    it('true when an answered rubric block is ungraded/partial', () => {
        expect(submissionNeedsGrading(idx, resp, undefined)).toBe(true);
        const partial = new Map([['b1', grade([{ criterionId: C1, earned: 2 }])]]);
        expect(submissionNeedsGrading(idx, resp, partial)).toBe(true);
    });

    it('false when every gradable block is fully graded', () => {
        const full = new Map([
            ['b1', grade([
                { criterionId: C1, earned: 4 },
                { criterionId: C2, earned: 6 },
            ])],
        ]);
        expect(submissionNeedsGrading(idx, resp, full)).toBe(false);
    });

    it('false when there is nothing gradable', () => {
        const noRubric = index([['b1', info({ blockId: 'b1', rubric: null })]]);
        expect(submissionNeedsGrading(noRubric, resp, undefined)).toBe(false);
    });
});
