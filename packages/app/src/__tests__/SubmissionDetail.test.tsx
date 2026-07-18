// @vitest-environment jsdom
// =============================================================================
// SubmissionDetail.test.tsx — the interleaved drill-down (design pass 2026-07-18)
// -----------------------------------------------------------------------------
// Pins the rewrite's contract: one problem-ordered list sorted by docOrder
// (every response type interleaved, storage-map grouping gone), type badges on
// every item, confidence rendered ONLY when the submission carries any, and
// removed-block responses sinking to the bottom under their label.
//
// The component is pure (row + index in, DOM out), imported through the route
// module's test-only SubmissionDetailForTest export — no Supabase, no router.
// =============================================================================

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ActivityDocument } from '@activity/schema';
import { buildActivityIndex, type SubmissionRow } from '../lib/submissions';
import { SubmissionDetailForTest as SubmissionDetail } from '../routes/Submissions';

afterEach(cleanup);

const U = (n: number): string =>
    `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;

// Minimal v2 doc: MC (first), fill-in-blank (second), reflection (third) — the
// on-screen order must follow this document order even though the response
// maps list blanks first.
const doc = ActivityDocument.parse({
    schemaVersion: 2,
    meta: {
        title: 'T', course: 'Algebra II', submissionMode: 'free',
        revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet',
        answerFeedback: 'on_check', skills: [],
    },
    sections: [
        {
            id: U(1), title: 'S', isCheckpoint: false,
            rows: [
                {
                    id: U(2), gridLines: 'inherit',
                    columns: [
                        {
                            id: U(3),
                            blocks: [
                                {
                                    id: U(10), type: 'multiple_choice', number: 1,
                                    prompt: [{ type: 'text', text: 'Pick one.', marks: [] }],
                                    multiSelect: false,
                                    choices: [
                                        { id: U(20), content: [{ type: 'text', text: 'yes', marks: [] }], correct: true },
                                        { id: U(21), content: [{ type: 'text', text: 'no', marks: [] }], correct: false },
                                    ],
                                },
                                {
                                    id: U(11), type: 'fill_in_blank', number: 2,
                                    hasConfidenceRating: false, skills: [],
                                    content: [
                                        { type: 'text', text: 'x = ', marks: [] },
                                        { type: 'blank', id: U(30), answer: '4', acceptableAnswers: [] },
                                    ],
                                },
                                {
                                    id: U(12), type: 'self_explanation',
                                    prompt: [{ type: 'text', text: 'Why?', marks: [] }],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
});
const index = buildActivityIndex(doc);

function subRow(responses: unknown): SubmissionRow {
    return {
        id: U(99),
        display_name: 'Alice',
        opaque_token: null,
        responses,
        score: null,
        submitted_at: '2026-07-01T00:00:00.000Z',
        attempt_number: 1,
        activity_version_id: null,
    };
}

// Responses deliberately listed blanks-first: the OLD UI rendered blanks
// before MC regardless of document order; the rewrite must not. schemaVersion
// is the CURRENT wire (9) so migrateSubmissionResponses passes it through —
// an old version would strip the maps that version predates.
const fullResponses = {
    schemaVersion: 9,
    blanks: { [U(30)]: { answer: '4', correct: true } },
    choices: { [U(10)]: { selected: [U(21)], correct: false } },
    freeResponses: { [U(12)]: { text: 'because' } },
};

describe('SubmissionDetail (interleaved drill-down)', () => {
    it('renders items in document order, not storage-map order', () => {
        render(<SubmissionDetail row={subRow(fullResponses)} index={index} />);
        const headings = screen
            .getAllByText(/^Problem \d$/)
            .map((el) => el.textContent);
        // MC is Problem 1 (first in the doc), blank is Problem 2 — in that
        // order on screen even though responses.blanks precedes .choices.
        expect(headings).toEqual(['Problem 1', 'Problem 2']);
        // The free-text item renders too (no number, badge only).
        expect(screen.getByText('because')).toBeTruthy();
    });

    it('badges every item with its type', () => {
        render(<SubmissionDetail row={subRow(fullResponses)} index={index} />);
        expect(screen.getByText('Multiple choice')).toBeTruthy();
        expect(screen.getByText('Fill in the blank')).toBeTruthy();
        expect(screen.getByText('Reflection')).toBeTruthy();
    });

    it('hides confidence everywhere when the submission carries none', () => {
        render(<SubmissionDetail row={subRow(fullResponses)} index={index} />);
        expect(screen.queryByText(/Confidence/)).toBeNull();
    });

    it('shows confidence when any response carries it', () => {
        render(
            <SubmissionDetail
                row={subRow({
                    ...fullResponses,
                    choices: {
                        [U(10)]: {
                            selected: [U(21)],
                            correct: false,
                            confidence: 'certain',
                        },
                    },
                })}
                index={index}
            />,
        );
        expect(screen.getByText(/Confidence: Certain/)).toBeTruthy();
    });

    it('sinks removed-block responses to the bottom under a label', () => {
        render(
            <SubmissionDetail
                row={subRow({
                    ...fullResponses,
                    // A blank the current activity no longer contains.
                    blanks: {
                        ...((fullResponses as { blanks: object }).blanks),
                        [U(31)]: { answer: 'ghost', correct: false },
                    },
                })}
                index={index}
            />,
        );
        const label = screen.getByText('No longer in this activity');
        expect(label).toBeTruthy();
        // It renders after the live problems: compare DOM order.
        const p1 = screen.getByText('Problem 1');
        expect(
            p1.compareDocumentPosition(label) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });
});
