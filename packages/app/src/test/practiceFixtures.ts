// Mixed practice test fixtures (slice 3): two one-question documents the way
// check-activity serves a planned slot — authored, schema-parsed, then through
// the REAL sanitizer (no answers, no solutions). Shared by the runner's unit
// tests and the e2e stub lane, so both render exactly the same questions.
import { ActivityDocument, createEmptyDocument } from '@activity/schema';
import {
    CHECK_WIRE_VERSION,
    sanitizeActivityDocument,
    type PracticeAnswers,
    type PracticeCheckResult,
    type PracticeSession,
    type PracticeStartResult,
} from '@activity/viewer';

export const PX_SESSION_ID = 'aaaaaaaa-0000-4000-8000-0000000003e1';
export const PX_CLASS_ID = 'cccccccc-0000-4000-8000-0000000003e1';
export const PX_CODE = 'MXP234';

export const PX_BLANK_ID = 'b1b1b1b1-0000-4000-8000-000000000001';
export const PX_MC_ID = 'c2c2c2c2-0000-4000-8000-000000000002';
export const PX_CHOICE_RIGHT = 'c2c2c2c2-0000-4000-8000-0000000000a1';
export const PX_CHOICE_WRONG = 'c2c2c2c2-0000-4000-8000-0000000000a2';

const text = (t: string) => ({ type: 'text' as const, text: t });
/** A text node as a sanitized RESULT carries it (marks always present). */
const served = (t: string) => ({ type: 'text' as const, text: t, marks: [] });

function oneQuestion(sectionId: string, block: unknown) {
    const empty = createEmptyDocument({ title: 'Practice item' });
    return sanitizeActivityDocument(
        ActivityDocument.parse({
            ...JSON.parse(JSON.stringify(empty)),
            sections: [
                {
                    id: sectionId,
                    isCheckpoint: true,
                    rows: [
                        {
                            id: `${sectionId.slice(0, -2)}a1`,
                            gridLines: 'inherit',
                            columns: [{ id: `${sectionId.slice(0, -2)}b1`, blocks: [block] }],
                        },
                    ],
                },
            ],
        }),
    );
}

/** "A recipe uses 3 cups for 12 muffins. For 20 muffins: __ cups." */
export const pxBlankDocument = () =>
    oneQuestion('5e5e5e5e-0000-4000-8000-000000000001', {
        id: 'f1f1f1f1-0000-4000-8000-000000000001',
        type: 'fill_in_blank',
        content: [
            text('A recipe uses 3 cups of flour for 12 muffins. For 20 muffins you need '),
            { type: 'blank', id: PX_BLANK_ID, answer: '5', width: 6, answerType: 'text' },
            text(' cups.'),
        ],
        solution: [text('1 muffin: 3 ÷ 12 = 0.25 cups. 20 muffins: 20 × 0.25 = 5 cups.')],
    });

/** "Which is proportional?" with two choices. */
export const pxChoiceDocument = () =>
    oneQuestion('5e5e5e5e-0000-4000-8000-000000000002', {
        id: PX_MC_ID,
        type: 'multiple_choice',
        prompt: [text('Which table shows a proportional relationship?')],
        choices: [
            { id: PX_CHOICE_RIGHT, content: [text('Doubling x doubles y')], correct: true },
            { id: PX_CHOICE_WRONG, content: [text('y is always x + 3')], correct: false },
        ],
    });

/** A two-question session as practice-start returns it (nothing tried). */
export function pxSession(overrides: Partial<PracticeSession> = {}): PracticeSession {
    return {
        sessionId: PX_SESSION_ID,
        practiceDay: '2026-10-23',
        planned: 2,
        graded: false,
        scoreRight: 0,
        scoreAnswered: 0,
        finished: false,
        items: [
            { seq: 1, document: pxBlankDocument() },
            { seq: 2, document: pxChoiceDocument() },
        ],
        ...overrides,
    };
}

export function pxStartResult(session: PracticeSession = pxSession()): PracticeStartResult {
    return {
        wireVersion: CHECK_WIRE_VERSION,
        state: 'started',
        doneToday: 0,
        graded: session.graded,
        itemsPerSession: session.planned,
        session,
    };
}

/** What check-activity's `practice` mode returns for one try at slot 1 / 2. */
export function pxCheckResult(
    seq: 1 | 2,
    outcome: 'right' | 'wrong' | 'skipped',
): PracticeCheckResult {
    const answers: PracticeAnswers =
        seq === 1
            ? { blanks: { [PX_BLANK_ID]: { answer: '5' } }, choices: {} }
            : { blanks: {}, choices: { [PX_MC_ID]: [PX_CHOICE_RIGHT] } };
    const itemId = seq === 1 ? PX_BLANK_ID : PX_MC_ID;
    const items =
        outcome === 'skipped'
            ? {}
            : outcome === 'right'
              ? { [itemId]: { verdict: 'correct' as const } }
              : {
                    [itemId]: {
                        verdict: 'incorrect' as const,
                        ...(seq === 1
                            ? { feedback: [served('It looks like you added 8 instead of scaling.')] }
                            : {}),
                    },
                };
    return {
        wireVersion: CHECK_WIRE_VERSION,
        seq,
        replayed: false,
        correct: outcome === 'right',
        skipped: outcome === 'skipped',
        items,
        solutions:
            seq === 1
                ? { 'f1f1f1f1-0000-4000-8000-000000000001': [served('1 muffin: 3 ÷ 12 = 0.25 cups. 20 muffins: 20 × 0.25 = 5 cups.')] }
                : {},
        answers,
    };
}
