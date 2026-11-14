// =============================================================================
// formImport.test.ts — form grading's authoring half (form-grading.md step 3)
// -----------------------------------------------------------------------------
// `{{===…}}`, `\gap[form]{…}`, `!form-wrong`, the named warnings, and FG-6's
// refuse/warn over every stored seed row of a bank template.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { parseBlankSpec, FORM_WRONG_MATCH } from '../lib/blankSyntax';
import { parseBankFile } from '../lib/bankImport';
import { formSeedFindings, mathBlankWarnings } from '../lib/formRules';
import { FORM_WRONG_MATCH as GRADER_FORM_WRONG } from '../../../viewer/src/server/grading/blanks';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

function nodes(blocks: JSONContent[], type: string): JSONContent[] {
    const out: JSONContent[] = [];
    const walk = (n: JSONContent) => {
        if (n.type === type) out.push(n);
        (n.content ?? []).forEach(walk);
    };
    blocks.forEach(walk);
    return out;
}

describe('{{===…}} (FG-7)', () => {
    it('is a math blank with equivalence form; == stays value', () => {
        const r = convert('Factorise: {{===6(3x-2) | -6(2-3x) | !2(9x-6) :: Not the highest. :: mis.factorise.not-highest | !form-wrong :: One product.}}\n\nSimplify: {{==2a}}');
        const [form, value] = nodes(r.blocks, 'blank');
        expect(form!.attrs).toMatchObject({
            answer: '6(3x-2)',
            answerType: 'math',
            equivalence: 'form',
            acceptableAnswers: ['-6(2-3x)'],
        });
        expect((form!.attrs!.mistakeFeedback as Array<{ match: string }>).map((m) => m.match)).toEqual(['2(9x-6)', 'form-wrong']);
        expect(value!.attrs!.equivalence).toBeUndefined();
        expect(r.warnings).toEqual([]);
    });
    it('composes with ~', () => {
        const s = parseBlankSpec('~===x+3', '');
        expect(s).toMatchObject({ canonical: 'x+3', answerType: 'math', equivalence: 'form', interchangeableWithPrevious: true });
    });
    it('refuses unit: and +- with a named warning', () => {
        const u = parseBlankSpec('===12ab unit: cm', '')!;
        expect(u.canonical).toBe('12ab');
        expect(u.warnings.join()).toMatch(/form blank .* can’t take a "unit:" clause/);
        const t = parseBlankSpec('===2/3 +- 0.01', '')!;
        expect(t.canonical).toBe('2/3');
        expect(t.warnings.join()).toMatch(/form blank .* can’t take a "\+-" tolerance/);
    });
    it('warns when !form-wrong sits on a blank that is not a form blank', () => {
        const s = parseBlankSpec('==2a', '!form-wrong :: nope')!;
        expect(s.warnings.join()).toMatch(/only fires on a form blank/);
        expect(parseBlankSpec('===2a', '!form-wrong :: ok')!.warnings).toEqual([]);
    });
    it('the reserved token is the grader’s', () => {
        expect(FORM_WRONG_MATCH).toBe(GRADER_FORM_WRONG);
    });
});

describe('engine-backed import warnings', () => {
    it('a form key that will not parse', () => {
        expect(mathBlankWarnings(parseBlankSpec('===6(3x-', '')!).join()).toMatch(/can’t be read as maths/);
    });
    it('a lone e inside a letter run (FG-3)', () => {
        expect(mathBlankWarnings(parseBlankSpec('==3ex', '')!).join()).toMatch(/“e” in “ex”.*Euler/);
        expect(mathBlankWarnings(parseBlankSpec('==exp(x)', '')!)).toEqual([]);
    });
    it('two ! entries that now match the same answers, and one the key satisfies (FG-4)', () => {
        const dup = mathBlankWarnings(parseBlankSpec('==x^2+2x', '!x^2+2 :: a | !2+x^2 :: b')!);
        expect(dup.join()).toMatch(/“!x\^2\+2” and “!2\+x\^2” match the same answers/);
        const formDup = mathBlankWarnings(parseBlankSpec('===6(3x-2)', '!2(9x-6) :: a | !(9x-6)2 :: b')!);
        expect(formDup.join()).toMatch(/match the same answers .*by meaning and form/);
        const dead = mathBlankWarnings(parseBlankSpec('===6(3x-2)', '!(3x-2)6 :: a')!);
        expect(dead.join()).toMatch(/the answer in an accepted form/);
        // Different forms of one value are NOT duplicates on a form blank.
        expect(mathBlankWarnings(parseBlankSpec('===6(3x-2)', '!18x-12 :: a | !2(9x-6) :: b')!)).toEqual([]);
    });
    it('reach the importer’s warnings', () => {
        const r = convert('It is {{==3ex}}.');
        expect([...r.warnings].join()).toMatch(/Euler/);
    });
});

describe('\\gap[form]{…} (FG-7)', () => {
    it('sets the gap to form; a plain gap stays value; an unknown option warns', () => {
        const r = convert('$$4a \\times 3b = \\gap[form]{12ab}$$\n\n$$2x = \\gap{8}$$\n\n$$y = \\gap[shape]{3}$$');
        const prompts = nodes(r.blocks, 'mathBlock').map((n) => (n.attrs!.prompts as Array<Record<string, unknown>>)[0]!);
        expect(prompts[0]).toMatchObject({ answer: '12a b', equivalence: 'form' });
        expect(prompts[1]!.equivalence).toBeUndefined();
        expect(prompts[2]!.equivalence).toBeUndefined();
        expect([...r.warnings].join()).toMatch(/the only option is \[form\]/);
    });
});

describe('FG-6 · seeded form keys over every stored row', () => {
    const bank = (seed: string, body: string) =>
        '```meta\nkind: bank\nstatus: draft\nskill: algebra.factorise.common-factor\n```\n\n```seed\n' + seed + '\n```\n\n' + body;
    const parse = (md: string) => parseBankFile(md, { stem: 'algebra.factorise.common-factor', importer: convert });

    it('a clean seed passes with no form findings', () => {
        const r = parse(bank('g: list 2, 3\np: list 5, 7\nq: list 1, 2', '## t1\n\nFactorise {g*p}x - {g*q}: {{===g*(p*x - q)}}'));
        expect(r.problems).toEqual([]);
        expect(r.warnings.filter((w) => /form answer|outer factor|common factor/.test(w))).toEqual([]);
    });
    it('warns on q = 0 (collapsed bracket), g = 1 (no outer factor), gcd > 1 (not highest), naming the row', () => {
        const r = parse(bank('g: list 1, 6\np: list 3, 4\nq: list 0, 2', '## t1\n\nFactorise: {{===g*(p*x - q)}}'));
        const w = r.warnings.join('\n');
        expect(w).toMatch(/at g=\d, p=\d, q=0 the form answer “g\*\(p\*x - q\)” collapses a bracket/);
        expect(w).toMatch(/at g=1, .* the outer factor of “g\*\(p\*x - q\)” is 1/);
        expect(w).toMatch(/at g=\d, p=4, q=2 the bracket in “\d?\(4x - 2\)” still has the common factor 2/);
    });
    it('a computed coefficient folds and needs no warning', () => {
        const r = parse(bank('c: list 3, 4\nd: list 2, 5', '## t1\n\nSimplify {c}a × {d}b: {{===(c*d)ab}}'));
        expect(r.problems).toEqual([]);
        expect(r.warnings.filter((w) => /form answer/.test(w))).toEqual([]);
    });
    it('refuses a row whose bound key will not parse', () => {
        // A list variable binds as an array, which is never a form.
        const f = formSeedFindings(
            { type: 'blank', answer: 'v*x', answerType: 'math', equivalence: 'form' },
            [{ v: [1, 2] }],
            't1',
            new Set(['v']),
        );
        expect(f.problems.join()).toMatch(/can’t be read as maths at v=\[1,2\]/);
    });
    it('warns when a single-letter seed bound in a form key is also a bare letter in the maths (FG-3)', () => {
        const f = formSeedFindings(
            [
                { type: 'math_inline', latex: 'Simplify 4a \\times 3b' },
                { type: 'blank', answer: 'a*b*x', answerType: 'math', equivalence: 'form' },
            ],
            [{ a: 2 }],
            't1',
            new Set(['a']),
        );
        expect(f.warnings.join()).toMatch(/seed name “a” is bound in the form answer/);
    });

    it('step-3 review: an all-number bracket is folded seed arithmetic, not a collapse', () => {
        const r = parse(bank('a: list 2, 3\nb: list 4, 5\nn: list 2\nm: list 3', '## t1\n\nCollect: {{===(a+b)x}}\n\n## t2\n\nIndex law: {{===x^(n+m)}}'));
        expect(r.warnings.filter((w) => /collapses a bracket/.test(w))).toEqual([]);
    });
    it('step-3 review: g(…) without a star is a reference to g, and its g = 1 row warns', () => {
        const r = parse(bank('g: list 1, 3\np: list 2', '## t1\n\nFactorise: {{===g(p*x - 1)}}'));
        expect(r.warnings.join('\n')).not.toMatch(/“g” is declared but no template uses it/);
        expect(r.warnings.join('\n')).toMatch(/at g=1, p=2 the outer factor of “g\(p\*x - 1\)” is 1/);
    });
    it('step-3 review: a negative seed in the bracket is still checked for a common factor', () => {
        const r = parse(bank('g: list 3\np: list 4\nq: list -2', '## t1\n\nFactorise: {{===g*(p*x - q)}}'));
        expect(r.warnings.join('\n')).toMatch(/still has the common factor 2/);
    });
    it('step-3 review: the seed-letter warning sees adjacent letters (4ab)', () => {
        const f = formSeedFindings(
            [
                { type: 'math_inline', latex: 'Simplify 4ab' },
                { type: 'blank', answer: '(a*b)x', answerType: 'math', equivalence: 'form' },
            ],
            [{ a: 2, b: 3 }],
            't1',
            new Set(['a', 'b']),
        );
        expect(f.warnings.join()).toMatch(/seed name “a” is bound/);
    });
});

describe('step-3 review: the e warning knows declared seed names', () => {
    it('an activity seed named base is bound, so no Euler warning', () => {
        const r = convert('```seed\nbase: int 2..9\nh: int 2..9\n```\n\nArea: {{==base*h/2}}');
        expect([...r.warnings].join()).not.toMatch(/Euler|specs are/);
    });
    it('a bank template defers the check to the bound key', () => {
        const r = parseBankFile(
            '```meta\nkind: bank\nstatus: draft\nskill: algebra.x\n```\n\n```seed\nbase: list 4\n```\n\n## t1\n\nArea: {{==base*2}}',
            { stem: 'algebra.x', importer: convert },
        );
        expect(r.warnings.join()).not.toMatch(/Euler/);
    });
});
