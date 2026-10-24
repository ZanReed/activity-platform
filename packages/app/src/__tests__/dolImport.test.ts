// =============================================================================
// dolImport.test.ts — the `{checkpoint dol}` section at import (D65)
// -----------------------------------------------------------------------------
// docs/design/dol-retake.md DL-1…DL-5, DL-11, DL-17, DE-6, DE-8, DE-13, DE-17.
// Through the REAL importer and serializer: what a batch import stores is the
// SectionDol these assertions read.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { ActivityDocument, ActivityMeta } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import { capRows, DOL_ROWS_STORED } from '../lib/dolImport';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const META = ActivityMeta.parse({ title: 'DoL', course: 'Year 9 Mathematics' });

function toDoc(md: string): { doc: ActivityDocument; result: ReturnType<MarkdownImporter> } {
    const result = convert(md);
    const doc = tiptapToActivity(wrapBlocksStrict(result.blocks), META);
    return { doc, result };
}

// The curriculum side's B-208 sample (C-163), with DL-17's maths spelling.
const SAMPLE = [
    '```meta',
    'skill: algebra.factorise.common-factor',
    'dol_skills: algebra.factorise.common-factor, algebra.expressions.like-terms',
    '```',
    '',
    '## Lesson {checkpoint}',
    '',
    'Some teaching.',
    '',
    '## Check for understanding {checkpoint dol}',
    '',
    '```seed',
    'g: list 4, 6, 8, 9, 10, 12',
    'a: int 2..7',
    'b: int 1..7',
    'p: = g * a',
    'q: = g * b',
    'h: = g / 2',
    'where dol: gcd(a, b) == 1 and mod(g, 2) == 0',
    'c: int 5..9',
    'r: int 2..4',
    'd: int 2..9',
    'k: = c - r',
    '```',
    '',
    'Factorise fully: $\\seed{p}x - \\seed{q}$.',
    '',
    '$\\seed{p}x - \\seed{q} =$ {{=g | !h :: Not the highest. :: mis.factorise.not-highest}} ( {{=a}} x - {{=b}} )',
    '',
    'Simplify {c}m + {d}n - {r}m: {{=k}} m + {{=d}} n',
].join('\n');

function dolOf(doc: ActivityDocument) {
    return doc.sections.find((s) => s.dol)?.dol;
}

describe('the `{checkpoint dol}` section (D65)', () => {
    it('the sample imports: two groups, the curriculum checker’s row counts, a retake', () => {
        const { doc, result } = toDoc(SAMPLE);
        expect(result.dolProblems).toBeUndefined();
        const dol = dolOf(doc)!;
        expect(dol.skills).toEqual([
            'algebra.factorise.common-factor',
            'algebra.expressions.like-terms',
        ]);
        expect(dol.retake).toBe(true);
        const tables = dol.seed!.tables;
        // C-163: "140 valid of 252 combinations for the primary and 120 of
        // 120 for the review". The review item's 120 is two INDEPENDENT groups
        // here — {c, r, k} (15) and {d} (8): nothing links d to the others, so
        // they draw separately (15 × 8 = 120, the same set of forms).
        expect(tables).toHaveLength(3);
        const primary = tables.find((t) => t.columns.includes('g'))!;
        const review = tables.find((t) => t.columns.includes('k'))!;
        const lone = tables.find((t) => t.columns.includes('d'))!;
        expect([primary.rows.length, primary.total]).toEqual([140, 252]);
        expect(review.columns).toEqual(['c', 'r', 'k']);
        expect([review.rows.length * lone.rows.length]).toEqual([120]);
        // The DoL section is a checkpoint, and the fence never became prose.
        const section = doc.sections.find((s) => s.dol)!;
        expect(section.isCheckpoint).toBe(true);
        expect(JSON.stringify(section.rows)).not.toContain('where dol');
        // DoL names are checked against ITS fence, not the activity's.
        expect(result.warnings.filter((w) => w.startsWith('Seed:'))).toEqual([]);
    });

    it('round-trips through the editor (DE-18): the DoL survives a save', () => {
        const { doc } = toDoc(SAMPLE);
        const again = tiptapToActivity(activityToTiptap(doc), META);
        expect(dolOf(again)).toEqual(dolOf(doc));
    });

    it('DL-2: an item count that differs from `dol_skills:` is a DoL problem', () => {
        const md = SAMPLE.replace('dol_skills: algebra.factorise.common-factor, algebra.expressions.like-terms',
            'dol_skills: algebra.factorise.common-factor');
        const { doc, result } = toDoc(md);
        expect(result.dolProblems?.[0]).toContain('2 gradable items');
        expect(dolOf(doc)).toBeUndefined();
    });

    it('DL-1: the first DoL skill must be `skill:`', () => {
        const md = SAMPLE.replace('skill: algebra.factorise.common-factor\n', 'skill: algebra.other\n');
        expect(toDoc(md).result.dolProblems?.[0]).toContain('must be the activity’s skill');
    });

    it('DL-1: a `{checkpoint dol}` with no `dol_skills:` is a problem', () => {
        const md = SAMPLE.replace(/dol_skills:.*\n/, '');
        expect(toDoc(md).result.dolProblems?.[0]).toContain('needs a `dol_skills:` line');
    });

    it('DL-1: two DoL sections are refused', () => {
        const md = SAMPLE + '\n\n## Again {checkpoint dol}\n\nMore {{=1}}';
        expect(toDoc(md).result.dolProblems?.[0]).toContain('at most one DoL');
    });

    it('DL-4: only `where dol:` is accepted in a DoL', () => {
        const md = SAMPLE.replace('where dol:', 'where t1:');
        expect(toDoc(md).result.dolProblems?.some((p) => p.includes('only spelling is `where dol:`'))).toBe(true);
    });

    it('DL-4: a DoL variable used outside the DoL is refused', () => {
        const md = SAMPLE.replace('Some teaching.', 'Some teaching with {c}.');
        expect(toDoc(md).result.dolProblems?.some((p) => p.includes('used outside the DoL'))).toBe(true);
    });

    it('DE-6: a DoL variable may not shadow an activity variable', () => {
        const md = '```seed\nc: int 1..3\n```\n\n' + SAMPLE;
        expect(toDoc(md).result.dolProblems?.some((p) => p.includes('reuse an activity variable'))).toBe(true);
    });

    it('DL-4: an activity variable used inside the DoL is refused (it would not redraw)', () => {
        const md = [
            '```meta', 'skill: s.one', 'dol_skills: s.one', '```',
            '```seed', 'a: int 2..9', '```',
            'Lesson uses {a}.',
            '## Check {checkpoint dol}',
            'What is {a} + 1? {{=a+1}}',
        ].join('\n\n');
        expect(toDoc(md).result.dolProblems?.[0]).toContain('would not redraw');
    });

    it('DL-5: an unseeded DoL stores retake: false and warns', () => {
        const md = ['```meta', 'skill: s.one', 'dol_skills: s.one', '```',
            '## Check {checkpoint dol}', 'What is 2 + 2? {{=4}}'].join('\n\n');
        const { doc, result } = toDoc(md);
        expect(result.dolProblems).toBeUndefined();
        expect(dolOf(doc)).toEqual({ skills: ['s.one'], retake: false });
        expect(result.warnings.some((w) => w.includes('one attempt, no retake'))).toBe(true);
    });

    it('DE-8: a seed that reaches only the review item gives no retake', () => {
        const md = ['```meta', 'skill: s.one', 'dol_skills: s.one, s.two', '```',
            '## Check {checkpoint dol}',
            '```seed\nc: int 2..9\n```',
            'What is 2 + 2? {{=4}}',
            'What is {c} + 1? {{=c+1}}'].join('\n\n');
        const { doc, result } = toDoc(md);
        expect(result.dolProblems).toBeUndefined();
        expect(dolOf(doc)?.retake).toBe(false);
        expect(result.warnings.some((w) => w.includes('DE-8'))).toBe(true);
    });

    it('DE-13: a primary group with one valid row gives no retake', () => {
        const md = ['```meta', 'skill: s.one', 'dol_skills: s.one', '```',
            '## Check {checkpoint dol}',
            '```seed\na: int 2..9\nwhere dol: a == 4\n```',
            'What is {a} + 1? {{=a+1}}'].join('\n\n');
        expect(dolOf(toDoc(md).doc)?.retake).toBe(false);
    });

    it('DL-11: `dol_rubric_levels:` lands on the primary rubric’s criteria', () => {
        const md = ['```meta', 'skill: s.one', 'dol_skills: s.one, s.two', 'dol_rubric_levels: A, M', '```',
            '## Check {checkpoint dol}',
            '```shortanswer\nprompt: Explain.\nrubric: Method | 2\nrubric: Reason | 2\n```',
            'What is 2 + 2? {{=4}}'].join('\n\n');
        const { doc, result } = toDoc(md);
        expect(result.dolProblems).toBeUndefined();
        const sa = doc.sections.flatMap((s) => s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)))
            .find((b) => b.type === 'short_answer') as { rubric?: { criteria: { level?: string }[] } };
        expect(sa.rubric?.criteria.map((c) => c.level)).toEqual(['A', 'M']);
    });

    it('DL-11: a level count that differs from the rubric is a problem', () => {
        const md = ['```meta', 'skill: s.one', 'dol_skills: s.one', 'dol_rubric_levels: A, M, E', '```',
            '## Check {checkpoint dol}',
            '```shortanswer\nprompt: Explain.\nrubric: Method | 2\n```'].join('\n\n');
        expect(toDoc(md).result.dolProblems?.[0]).toContain('3 levels');
    });

    it('DL-17: `\\seed{name}` in maths is a reference, a bare `{name}` still warns', () => {
        const md = '```seed\na: int 2..9\n```\n\nSolve $\\seed{a}x = 1$ and $x^{a}$.';
        const { warnings } = convert(md);
        expect(warnings.some((w) => w.includes('Write \\seed{a} inside the dollars'))).toBe(true);
        expect(warnings.some((w) => w.includes('declared but nothing references'))).toBe(false);
    });

    it('DE-17: a group is capped at DOL_ROWS_STORED rows, evenly spaced, keeping its total', () => {
        const rows = Array.from({ length: 2000 }, (_, i) => [i]);
        const capped = capRows({ columns: ['a'], rows, total: 2000 });
        expect(capped.rows).toHaveLength(DOL_ROWS_STORED);
        expect(capped.rows[0]).toEqual([0]);
        expect(capped.rows[1]).toEqual([4]);
        expect(capped.total).toBe(2000);
    });
});
