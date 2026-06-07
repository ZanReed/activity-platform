import { describe, it, expect } from 'vitest';
import { ActivityDocument } from '@activity/schema';
import {
    groupSubmissions,
    buildActivityIndex,
    formatScore,
    type SubmissionRow,
} from '../lib/submissions';

// A fixed-uuid helper so fixtures are deterministic.
const U = (n: number): string =>
    `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;

function row(partial: Partial<SubmissionRow>): SubmissionRow {
    return {
        id: partial.id ?? U(999),
        display_name: partial.display_name ?? null,
        opaque_token: partial.opaque_token ?? null,
        responses: partial.responses ?? { schemaVersion: 2, blanks: {} },
        score: partial.score ?? null,
        submitted_at: partial.submitted_at ?? '2026-06-01T00:00:00.000Z',
        attempt_number: partial.attempt_number ?? 1,
    };
}

describe('groupSubmissions', () => {
    it('groups by exact display_name', () => {
        const groups = groupSubmissions([
            row({ id: U(1), display_name: 'Alice', attempt_number: 1 }),
            row({ id: U(2), display_name: 'Bob', attempt_number: 1 }),
            row({ id: U(3), display_name: 'Alice', attempt_number: 2 }),
        ]);
        expect(groups).toHaveLength(2);
        const alice = groups.find((g) => g.label === 'Alice')!;
        expect(alice.count).toBe(2);
        expect(alice.attempts.map((a) => a.attempt_number)).toEqual([1, 2]);
    });

    it('does not merge differently-typed names (Phase 1 limitation)', () => {
        const groups = groupSubmissions([
            row({ id: U(1), display_name: 'Bob S' }),
            row({ id: U(2), display_name: 'Bobby Smith' }),
        ]);
        expect(groups).toHaveLength(2);
    });

    it('latest = highest attempt_number, best = highest score', () => {
        const groups = groupSubmissions([
            row({
                id: U(1),
                display_name: 'Alice',
                attempt_number: 1,
                score: 0.9,
                submitted_at: '2026-06-01T10:00:00.000Z',
            }),
            row({
                id: U(2),
                display_name: 'Alice',
                attempt_number: 2,
                score: 0.5,
                submitted_at: '2026-06-01T11:00:00.000Z',
            }),
        ]);
        const alice = groups[0]!;
        expect(alice.latest.id).toBe(U(2)); // attempt 2 is latest
        expect(alice.best.id).toBe(U(1)); // attempt 1 scored higher
    });

    it('treats null score as below any real score for "best"', () => {
        const groups = groupSubmissions([
            row({ id: U(1), display_name: 'Alice', attempt_number: 1, score: null }),
            row({ id: U(2), display_name: 'Alice', attempt_number: 2, score: 0.1 }),
        ]);
        expect(groups[0]!.best.id).toBe(U(2));
    });

    it('breaks attempt ties by submitted_at', () => {
        const groups = groupSubmissions([
            row({
                id: U(1),
                display_name: 'Alice',
                attempt_number: 1,
                submitted_at: '2026-06-01T10:00:00.000Z',
            }),
            row({
                id: U(2),
                display_name: 'Alice',
                attempt_number: 1,
                submitted_at: '2026-06-01T12:00:00.000Z',
            }),
        ]);
        expect(groups[0]!.latest.id).toBe(U(2));
    });

    it('sorts groups by most-recent activity first', () => {
        const groups = groupSubmissions([
            row({
                id: U(1),
                display_name: 'Alice',
                submitted_at: '2026-06-01T10:00:00.000Z',
            }),
            row({
                id: U(2),
                display_name: 'Bob',
                submitted_at: '2026-06-02T10:00:00.000Z',
            }),
        ]);
        expect(groups.map((g) => g.label)).toEqual(['Bob', 'Alice']);
    });

    it('prefers opaque_token as the grouping key when present', () => {
        const groups = groupSubmissions([
            row({ id: U(1), opaque_token: 'tok-1', display_name: null }),
            row({ id: U(2), opaque_token: 'tok-1', display_name: null }),
        ]);
        expect(groups).toHaveLength(1);
        expect(groups[0]!.count).toBe(2);
    });

    it('returns [] for no rows', () => {
        expect(groupSubmissions([])).toEqual([]);
    });
});

describe('buildActivityIndex', () => {
    const doc: ActivityDocument = ActivityDocument.parse({
        schemaVersion: 1,
        meta: {
            title: 'Test',
            course: 'Algebra II',
            submissionMode: 'free',
            revisionMode: 'free',
            gradingMode: 'auto',
            activityType: 'worksheet',
            answerFeedback: 'on_check',
            skills: [],
        },
        sections: [
            {
                id: U(100),
                title: 'Warm-up',
                isCheckpoint: true,
                blocks: [
                    {
                        id: U(200),
                        type: 'fill_in_blank',
                        number: 1,
                        hasConfidenceRating: false,
                        skills: [],
                        content: [
                            { type: 'text', text: 'Simplify ', marks: [] },
                            {
                                type: 'blank',
                                id: U(300),
                                answer: '3x',
                                acceptableAnswers: ['3*x'],
                            },
                            { type: 'text', text: ' over ', marks: [] },
                            {
                                type: 'blank',
                                id: U(301),
                                answer: 'y',
                                acceptableAnswers: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: U(101),
                isCheckpoint: false,
                blocks: [
                    {
                        id: U(201),
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'no blanks here', marks: [] }],
                    },
                ],
            },
        ],
    });

    it('indexes every blank with prompt, answer, and section', () => {
        const idx = buildActivityIndex(doc);
        expect(idx.blanks.size).toBe(2);
        const b = idx.blanks.get(U(300))!;
        expect(b.problemNumber).toBe(1);
        expect(b.problemPrompt).toBe('Simplify ____ over ____');
        expect(b.canonicalAnswer).toBe('3x / 3*x');
        expect(b.sectionTitle).toBe('Warm-up');
        expect(b.problemId).toBe(U(200));
    });

    it('indexes sections in document order', () => {
        const idx = buildActivityIndex(doc);
        expect(idx.sections.get(U(100))!.order).toBe(1);
        expect(idx.sections.get(U(101))!.order).toBe(2);
        expect(idx.sections.get(U(101))!.title).toBeNull();
    });

    it('skips non-fill-in-blank blocks', () => {
        const idx = buildActivityIndex(doc);
        // Only the two blanks from the fill_in_blank block are present.
        expect([...idx.blanks.keys()].sort()).toEqual([U(300), U(301)].sort());
    });
});

describe('formatScore', () => {
    it('renders 0..1 as a rounded percent', () => {
        expect(formatScore(0.85)).toBe('85%');
        expect(formatScore(1)).toBe('100%');
        expect(formatScore(0)).toBe('0%');
    });
    it('renders null as a dash', () => {
        expect(formatScore(null)).toBe('—');
    });
});
