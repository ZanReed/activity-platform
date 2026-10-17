import { describe, expect, it } from 'vitest';
import {
    createBlankToken,
    createCorrespondenceBlock,
    createDataPlotBlock,
    createEmptyDocument,
    createFillInBlankBlock,
    createInteractiveGraphBlock,
    createMatchingBlock,
    createMultipleChoiceBlock,
    createNumberLineBlock,
    createOrderingBlock,
    createShortAnswerBlock,
    type ActivityDocument,
    type Block,
} from '@activity/schema';
import { deriveSeedValues, serveSeed } from '@activity/viewer';
import {
    ANSWER_NOT_SHOWN,
    NO_ANSWER,
    answerWords,
    formatNumber,
    sectionAnswerLines,
    servedDocument,
    type AnswerFamily,
} from './answerText';

const t = (text: string) => [{ type: 'text' as const, text, marks: [] }];
const VERSION = '11111111-1111-4111-8111-111111111111';
const STUDENT = '22222222-2222-4222-8222-222222222222';

/** A one-section document holding the given blocks, one row each. */
function docOf(blocks: Block[], extra: Partial<ActivityDocument['meta']> = {}): ActivityDocument {
    const doc = createEmptyDocument();
    const section = doc.sections[0]!;
    section.title = 'Warm-up';
    section.rows = blocks.map((b, i) => ({
        id: `00000000-0000-4000-8000-00000000000${i}`,
        gridLines: 'inherit' as const,
        columns: [{ id: `00000000-0000-4000-8000-0000000001${String(i).padStart(2, '0')}`, blocks: [b] }],
    }));
    doc.meta = { ...doc.meta, ...extra };
    return doc;
}

function linesFor(doc: ActivityDocument, responses: object, verdicts: object, student = STUDENT) {
    const served = servedDocument(doc, VERSION, student);
    return sectionAnswerLines(served, doc.sections[0]!.id, responses, verdicts);
}

// One fixture per family, labels filled in. Each row: the block, the stored
// answer (as the wire stores it), and the words a teacher must read.
const mc = createMultipleChoiceBlock();
mc.choices.forEach((c, i) => (c.content = t(['three quarters', 'one half', 'two thirds'][i]!)));
const match = createMatchingBlock();
match.items.forEach((it, i) => (it.content = t(['0.5', '0.25'][i]!)));
match.targets.forEach((tg, i) => (tg.content = t(['one half', 'one quarter'][i]!)));
const corr = createCorrespondenceBlock();
corr.items.forEach((it, i) => (it.content = t(['3/4', '1/2'][i]!)));
corr.targetColumns.forEach((col, ci) => {
    col.header = t(['Decimal', 'Percent'][ci]!);
    col.targets.forEach((tg, i) => (tg.content = t([['0.75', '0.5'], ['75%', '50%']][ci]![i]!)));
});
const order = createOrderingBlock();
order.items.forEach((it, i) => (it.content = t(['smallest', 'middle', 'largest'][i]!)));
const nl = createNumberLineBlock();
const ig = createInteractiveGraphBlock();
const short = createShortAnswerBlock();
const fib = createFillInBlankBlock();
const blankA = createBlankToken('0.8');
const blankB = createBlankToken('4');
fib.content = [...t('Write 4/5 as a decimal: '), blankA, ...t(' and 8/2 = '), blankB];

describe('answerWords — every family as words (D2)', () => {
    const doc = docOf([fib, mc, match, corr, order, short, nl, ig]);
    const served = servedDocument(doc, VERSION, STUDENT);
    const place = (id: string) => served.index.byItem[id] ?? null;

    const rows: Array<[string, AnswerFamily, string, unknown, string]> = [
        ['blanks', 'blanks', blankA.id, ' 0.75 ', '0.75'],
        ['choices', 'choices', mc.id, [mc.choices[1]!.id], 'one half'],
        ['choices, several', 'choices', mc.id, [mc.choices[0]!.id, mc.choices[2]!.id], 'three quarters, two thirds'],
        ['matches', 'matches', match.id,
            { [match.items[0]!.id]: match.targets[1]!.id, [match.items[1]!.id]: match.targets[0]!.id },
            '0.5 → one quarter, 0.25 → one half'],
        ['correspondences', 'correspondences', corr.id,
            { [corr.items[0]!.id]: { [corr.targetColumns[0]!.id]: corr.targetColumns[0]!.targets[1]!.id,
                                     [corr.targetColumns[1]!.id]: corr.targetColumns[1]!.targets[0]!.id } },
            '3/4: Decimal 0.5, Percent 75%'],
        ['orderings', 'orderings', order.id, [order.items[2]!.id, order.items[0]!.id, order.items[1]!.id],
            'largest → smallest → middle'],
        ['freeText', 'freeText', short.id, 'Because the tenths match.', 'Because the tenths match.'],
        ['graphs: number line', 'graphs', nl.id, { interaction: 'plot_point', points: [[1.09, 0], [1.1, 0], [-1.15, 0]] },
            'plotted 1.09, 1.1, −1.15'],
        ['graphs: number line interval', 'graphs', nl.id,
            { interaction: 'plot_interval', points: [], domain: { minX: 2, minStyle: 'closed', maxX: 7, maxStyle: 'open' } },
            'from 2 closed to 7 open'],
        ['graphs: 2-D point', 'graphs', ig.id, { interaction: 'plot_point', points: [[2, -3]] }, '(2, −3)'],
        ['graphs: no solution', 'graphs', ig.id, { interaction: 'plot_point', points: [], noSolution: true }, 'no solution'],
    ];

    it.each(rows)('%s', (_name, family, itemId, value, words) => {
        expect(answerWords(place(itemId), family, value)).toBe(words);
    });

    it('an id the document does not have reads as a placeholder, never the raw id', () => {
        const unknownChoice = '99999999-9999-4999-8999-999999999999';
        const out = answerWords(place(mc.id), 'choices', [unknownChoice]);
        expect(out).toBe(ANSWER_NOT_SHOWN);
        expect(out).not.toContain(unknownChoice);
    });

    it('a structured family with no place in the document is not shown', () => {
        expect(answerWords(null, 'orderings', [order.items[0]!.id])).toBe(ANSWER_NOT_SHOWN);
    });

    it('a missing or empty answer reads "(no answer)"', () => {
        expect(answerWords(place(blankA.id), 'blanks', undefined)).toBe(NO_ANSWER);
        expect(answerWords(place(short.id), 'freeText', '   ')).toBe(NO_ANSWER);
        expect(answerWords(place(nl.id), 'graphs', { interaction: 'plot_point', points: [] })).toBe(NO_ANSWER);
    });

    it('data plots read by their interaction', () => {
        const dp = createDataPlotBlock();
        const d = servedDocument(docOf([dp]), VERSION, STUDENT);
        const p = d.index.byItem[dp.id]!;
        expect(answerWords(p, 'graphs', { interaction: 'build_dotplot', points: [[3, 1], [5, 1]] })).toBe('dots at 3, 5');
        dp.interaction = { type: 'build_histogram' };
        expect(answerWords(p, 'graphs', { interaction: 'build_histogram', points: [[1, 5], [0, 2]] })).toBe('bar heights 2, 5');
    });
});

describe('sectionAnswerLines — the answer list (CP-3, DR-6)', () => {
    it('labels questions by page number, blanks by position, and shows the answer only under a wrong one', () => {
        const doc = docOf([fib, mc]);
        const lines = linesFor(
            doc,
            { blanks: { [blankA.id]: '0.75', [blankB.id]: '4' }, choices: { [mc.id]: [mc.choices[1]!.id] } },
            {
                [blankA.id]: { verdict: 'incorrect', feedback: t('Count the tenths.'), misconceptionIds: ['mis.decimal.x'] },
                [blankB.id]: { verdict: 'correct' },
                [mc.id]: { verdict: 'incorrect' },
            },
        );
        expect(lines.map((l) => [l.label, l.answer, l.verdict, l.correctAnswer])).toEqual([
            ['Q1 · blank 1', '0.75', 'incorrect', '0.8'],
            ['Q1 · blank 2', '4', 'correct', null],
            ['Q2', 'one half', 'incorrect', 'three quarters'],
        ]);
        expect(lines[0]!.feedback).toBe('Count the tenths.');
        expect(lines[0]!.misconceptionIds).toEqual(['mis.decimal.x']);
    });

    it('keeps an item the grader marked that the document no longer has', () => {
        const lines = linesFor(docOf([mc]), {}, { 'gone-item': { verdict: 'incorrect' } });
        const gone = lines.find((l) => l.itemId === 'gone-item')!;
        expect(gone.label).toBe('Unknown question');
        expect(gone.answer).toBe(NO_ANSWER);
    });
});

describe('a seeded activity reads in the STUDENT\'s own numbers', () => {
    // One seeded variable; the prompt and the answer key both reference it.
    const seededFib = createFillInBlankBlock();
    const seededBlank = { ...createBlankToken('a*2'), answerType: 'numeric' as const };
    seededFib.content = [...t('Double {a}: '), seededBlank];
    const seededMc = createMultipleChoiceBlock();
    seededMc.choices.forEach((c, i) => (c.content = t(['{a} apples', 'none', 'all'][i]!)));
    const seedVars = [{ name: 'a', spec: { kind: 'int' as const, min: 2, max: 9000 } }];
    const doc = docOf([seededFib, seededMc], { seedVars });

    it('the labels and the canonical answer use the values served to that student', () => {
        const other = '33333333-3333-4333-8333-333333333333';
        const mine = deriveSeedValues(seedVars, serveSeed(VERSION, STUDENT)).a as number;
        const theirs = deriveSeedValues(seedVars, serveSeed(VERSION, other)).a as number;
        expect(mine).not.toBe(theirs); // the fixture only proves something if the seeds differ

        const verdicts = { [seededBlank.id]: { verdict: 'incorrect' }, [seededMc.id]: { verdict: 'correct' } };
        const responses = { blanks: { [seededBlank.id]: '1' }, choices: { [seededMc.id]: [seededMc.choices[0]!.id] } };
        const lines = linesFor(doc, responses, verdicts);
        expect(lines[0]!.correctAnswer).toBe(String(mine * 2));
        expect(lines[1]!.answer).toBe(`${mine} apples`);

        const theirLines = linesFor(doc, responses, verdicts, other);
        expect(theirLines[1]!.answer).toBe(`${theirs} apples`);
    });
});

describe('formatNumber', () => {
    it('writes a true minus and drops float noise', () => {
        expect(formatNumber(-3)).toBe('−3');
        expect(formatNumber(0.1 + 0.2)).toBe('0.3');
        expect(formatNumber(-0)).toBe('0');
    });
});
