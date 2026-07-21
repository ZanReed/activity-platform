// =============================================================================
// markdownImportPrompt.test.ts — anti-drift guard for the import format spec
// -----------------------------------------------------------------------------
// The accepted import format is described in THREE places that must never drift
// apart, because drift here silently misleads a teacher (or an AI assistant)
// into writing markdown the importer mangles:
//
//   1. MARKDOWN_IMPORT_AI_PROMPT      (the copy-paste prompt constant)
//   2. docs/markdown-import-format.md (the human reference + the same prompt)
//   3. markdownToTiptap              (the actual converter behavior)
//
// This file binds all three:
//   - the doc's fenced prompt block must EQUAL the constant (1 ↔ 2);
//   - every concrete example the prompt teaches must (a) appear in the prompt
//     and (b) actually produce the promised node through the real converter
//     (1/2 ↔ 3);
//   - the doc's worked example and its "unsupported" list must behave as
//     documented (2 ↔ 3).
// Edit any one of the three out of step and a test below goes red.
// =============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import {
    getMarkdownImporter,
    type MarkdownImporter,
} from '../lib/markdownToTiptap';
import { MARKDOWN_IMPORT_AI_PROMPT } from '../lib/markdownImportPrompt';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const DOC = readFileSync(
    fileURLToPath(
        new URL('../../../../docs/markdown-import-format.md', import.meta.url),
    ),
    'utf8',
);

// Extract the first fenced block of a given language tag from the doc.
function fence(lang: string): string {
    const m = new RegExp('```' + lang + '\\n([\\s\\S]*?)\\n```').exec(DOC);
    expect(m, `expected a \`\`\`${lang} block in the doc`).not.toBeNull();
    return m![1]!;
}

function flatten(blocks: JSONContent[]): JSONContent[] {
    const out: JSONContent[] = [];
    const walk = (n: JSONContent) => {
        out.push(n);
        (n.content ?? []).forEach(walk);
    };
    blocks.forEach(walk);
    return out;
}
function nodesOfType(blocks: JSONContent[], type: string): JSONContent[] {
    return flatten(blocks).filter((n) => n.type === type);
}

// =============================================================================
// 1 ↔ 2 — the doc's prompt block is byte-for-byte the constant
// =============================================================================

describe('prompt constant ↔ doc', () => {
    it('the doc embeds the exact MARKDOWN_IMPORT_AI_PROMPT', () => {
        expect(fence('text')).toBe(MARKDOWN_IMPORT_AI_PROMPT);
    });
});

// =============================================================================
// 1/2 ↔ 3 — every example the prompt teaches actually works in the converter
// -----------------------------------------------------------------------------
// `fragment` must appear verbatim in the prompt (so the prompt really teaches
// this syntax); `md` is run through the live converter and `check` asserts the
// promised node. Change the syntax in either the prompt or the converter and
// one half of the pair fails.
// =============================================================================

interface Claim {
    name: string;
    fragment: string;
    md: string;
    check: (blocks: JSONContent[]) => void;
}

const CLAIMS: Claim[] = [
    {
        name: 'fill-in-the-blank {{answer}}',
        fragment: '{{Paris}}',
        md: 'The capital of France is {{Paris}}.',
        check: (b) => {
            const blanks = nodesOfType(b, 'blank');
            expect(blanks).toHaveLength(1);
            expect(blanks[0]!.attrs).toMatchObject({ answer: 'Paris' });
            // a paragraph with a blank must become a fillInBlank block
            expect(b[0]!.type).toBe('fillInBlank');
        },
    },
    {
        name: 'alternate answers {{answer|alt}}',
        fragment: '{{oxygen|O2}}',
        md: 'Made of hydrogen and {{oxygen|O2}}.',
        check: (b) => {
            const blank = nodesOfType(b, 'blank')[0]!;
            expect(blank.attrs).toMatchObject({
                answer: 'oxygen',
                acceptableAnswers: ['O2'],
            });
        },
    },
    {
        name: 'order-independent group {{~answer}}',
        fragment: '{{~3}}',
        md: '(x + {{2}})(x + {{~3}})',
        check: (b) => {
            const blanks = nodesOfType(b, 'blank');
            expect(blanks).toHaveLength(2);
            expect(blanks[0]!.attrs).toMatchObject({
                answer: '2',
                interchangeableWithPrevious: false,
            });
            // The ~ marks the second blank, and the answer is stripped of it.
            expect(blanks[1]!.attrs).toMatchObject({
                answer: '3',
                interchangeableWithPrevious: true,
            });
        },
    },
    {
        name: 'numeric blank {{=answer}}',
        fragment: '{{=12}}',
        md: 'the area is {{=12}}.',
        check: (b) => {
            const blank = nodesOfType(b, 'blank')[0]!;
            expect(blank.attrs).toMatchObject({
                answer: '12',
                answerType: 'numeric',
            });
            expect(blank.attrs).not.toHaveProperty('tolerance');
        },
    },
    {
        name: 'numeric blank with tolerance {{=answer +- tol}}',
        fragment: '{{=3.14 +- 0.01}}',
        md: 'pi is about {{=3.14 +- 0.01}}.',
        check: (b) => {
            const blank = nodesOfType(b, 'blank')[0]!;
            expect(blank.attrs).toMatchObject({
                answer: '3.14',
                answerType: 'numeric',
                tolerance: 0.01,
            });
        },
    },
    {
        name: 'grouped numeric blank {{~=answer}}',
        fragment: '{{~=3}}',
        md: 'roots: {{=2}} and {{~=3}}',
        check: (b) => {
            const blanks = nodesOfType(b, 'blank');
            expect(blanks).toHaveLength(2);
            expect(blanks[1]!.attrs).toMatchObject({
                answer: '3',
                answerType: 'numeric',
                interchangeableWithPrevious: true,
            });
        },
    },
    {
        name: 'math blank {{==expr}}',
        fragment: '{{==2a}}',
        md: 'simplify to {{==2a}}.',
        check: (b) => {
            const blank = nodesOfType(b, 'blank')[0]!;
            expect(blank.attrs).toMatchObject({ answer: '2a', answerType: 'math' });
        },
    },
    {
        name: 'blank hint {{answer | ?hint}}',
        fragment: '{{Paris | ?It starts with P}}',
        md: 'The capital is {{Paris | ?It starts with P}}.',
        check: (b) => {
            const blank = nodesOfType(b, 'blank')[0]!;
            expect(blank.attrs!.answer).toBe('Paris');
            expect(blank.attrs!.hint).toEqual([
                { type: 'text', text: 'It starts with P', marks: [] },
            ]);
        },
    },
    {
        name: 'blank mistake feedback {{answer | !wrong :: msg}}',
        fragment: '{{Paris | !Lyon :: That is the third-largest city, not the capital}}',
        md: 'The capital is {{Paris | !Lyon :: That is the third-largest city, not the capital}}.',
        check: (b) => {
            const blank = nodesOfType(b, 'blank')[0]!;
            const mf = blank.attrs!.mistakeFeedback as Array<{ match: string }>;
            expect(mf).toHaveLength(1);
            expect(mf[0]!.match).toBe('Lyon');
        },
    },
    {
        name: 'literal-sigil escape {{a | ??x}}',
        fragment: '{{a | ??x}}',
        md: 'answer {{a | ??x}}',
        check: (b) => {
            const blank = nodesOfType(b, 'blank')[0]!;
            expect(blank.attrs!.acceptableAnswers).toEqual(['?x']);
        },
    },
    {
        name: 'checkpoint section heading',
        fragment: '## Part 2 {checkpoint}',
        md: '## Part 2 {checkpoint}',
        check: (b) => {
            expect(b).toEqual([
                {
                    type: 'sectionBreak',
                    attrs: { title: 'Part 2', isCheckpoint: true },
                },
            ]);
        },
    },
    {
        name: 'inline math $…$ (LaTeX preserved)',
        fragment: '$\\frac{1}{2}bh$',
        md: 'the area is $\\frac{1}{2}bh$',
        check: (b) => {
            const math = nodesOfType(b, 'mathInline')[0]!;
            expect(math.attrs).toEqual({ latex: '\\frac{1}{2}bh' });
        },
    },
    {
        name: 'display math $$…$$ (own paragraph → block)',
        fragment: '$$\\int_0^1 x\\,dx = \\frac{1}{2}$$',
        md: '$$\\int_0^1 x\\,dx = \\frac{1}{2}$$',
        check: (b) => {
            expect(b).toEqual([
                {
                    type: 'mathBlock',
                    attrs: { latex: '\\int_0^1 x\\,dx = \\frac{1}{2}' },
                },
            ]);
        },
    },
    {
        name: 'graph prompt inline math',
        fragment: 'prompt: Graph $y = 2x + 3$',
        md: '```graph\nprompt: Graph $y = 2x + 3$.\nanswer: y = 2x + 3\n```',
        check: (b) => {
            const g = b.find((n) => n.type === 'interactiveGraph')!;
            expect(g.content).toEqual([
                { type: 'text', text: 'Graph ' },
                { type: 'mathInline', attrs: { latex: 'y = 2x + 3' } },
                { type: 'text', text: '.' },
            ]);
        },
    },
    {
        name: 'number-line fence: point-plot answer',
        fragment: 'answer: -3, 4',
        md: '```numberline\nanswer: -3, 4\n```',
        check: (b) => {
            const nl = b.find((n) => n.type === 'numberLine')!;
            expect(nl).toBeDefined();
            expect(nl.attrs).toMatchObject({
                interaction: { type: 'plot_point', correctPoints: [-3, 4] },
            });
        },
    },
    {
        name: 'number-line fence: inequality → ray',
        fragment: 'answer: x >= 3',
        md: '```numberline\nanswer: x >= 3\n```',
        check: (b) => {
            const nl = b.find((n) => n.type === 'numberLine')!;
            expect(nl.attrs!.interaction).toMatchObject({
                type: 'plot_interval',
                correctInterval: { min: 3, minStyle: 'closed' },
            });
        },
    },
    {
        name: 'number-line fence: compound inequality → interval',
        fragment: 'answer: -2 <= x < 5',
        md: '```numberline\nanswer: -2 <= x < 5\n```',
        check: (b) => {
            const nl = b.find((n) => n.type === 'numberLine')!;
            expect(nl.attrs!.interaction.correctInterval).toEqual({
                min: -2,
                minStyle: 'closed',
                max: 5,
                maxStyle: 'open',
            });
        },
    },
    {
        name: 'data-plot fence: graded build computed from the data',
        fragment: 'data: 3, 5, 5, 6, 8',
        md: '```dataplot\nprompt: Make a dot plot of the data.\ndata: 3, 5, 5, 6, 8\nanswer: dotplot\n```',
        check: (b) => {
            const plot = b.find((n) => n.type === 'dataPlot')!;
            expect(plot).toBeDefined();
            expect(plot.attrs).toMatchObject({
                data: [3, 5, 5, 6, 8],
                interaction: { type: 'build_dotplot' },
            });
        },
    },
    {
        name: 'data-plot show: static ungraded chart',
        fragment: 'show: boxplot',
        md: '```dataplot\ndata: 1, 2, 4, 6, 7\nshow: boxplot\n```',
        check: (b) => {
            const plot = b.find((n) => n.type === 'dataPlot')!;
            expect(plot.attrs).toMatchObject({
                interaction: { type: 'display', chart: 'boxplot' },
            });
        },
    },
    {
        name: 'data-plot boxplot tolerance suffix',
        fragment: 'answer: boxplot tolerance 1',
        md: '```dataplot\ndata: 1, 2, 4, 6, 7\nanswer: boxplot tolerance 1\n```',
        check: (b) => {
            const plot = b.find((n) => n.type === 'dataPlot')!;
            expect(plot.attrs).toMatchObject({
                interaction: { type: 'build_boxplot', tolerance: 1 },
            });
        },
    },
    {
        name: 'multiple-choice fence with (x) correct marker and :: feedback',
        fragment: '( ) 3 :: Check your addition.',
        md: '```mc\nprompt: What is $2 + 2$?\n( ) 3 :: Check your addition.\n(x) 4\n( ) 22\n```',
        check: (b) => {
            const mc = b.find((n) => n.type === 'multipleChoice')!;
            expect(mc).toBeDefined();
            expect(mc.attrs).toMatchObject({ multiSelect: false });
            const choices = mc.attrs!.choices as Array<{
                correct: boolean;
                feedback?: unknown[];
            }>;
            expect(choices.map((c) => c.correct)).toEqual([false, true, false]);
            expect(choices[0]!.feedback).toBeDefined();
        },
    },
    {
        name: 'multi-select via square brackets [x]',
        fragment: 'square brackets [x] / [ ]',
        md: '```mc\nprompt: Which are prime?\n[x] 2\n[x] 3\n[ ] 4\n```',
        check: (b) => {
            const mc = b.find((n) => n.type === 'multipleChoice')!;
            expect(mc.attrs).toMatchObject({ multiSelect: true });
        },
    },
    {
        name: 'matching fence with last-equals split and a distractor',
        fragment: 'y = 2x = 2',
        md: '```match\nprompt: Match each equation to its slope.\ny = 2x = 2\ny = -x = -1\n= 0\n```',
        check: (b) => {
            const match = b.find((n) => n.type === 'matching')!;
            expect(match).toBeDefined();
            const items = match.attrs!.items as Array<{ id: string }>;
            const targets = match.attrs!.targets as Array<{ id: string }>;
            const key = match.attrs!.key as Record<string, string>;
            expect(items).toHaveLength(2);
            expect(targets).toHaveLength(3); // two keyed + one distractor
            expect(key[items[0]!.id]).toBe(targets[0]!.id);
        },
    },
    {
        name: 'matching arrow separator',
        fragment: 'y = 2x -> 2',
        md: '```match\nprompt: Match.\ny = 2x -> 2\ny = -x -> -1\n```',
        check: (b) => {
            const match = b.find((n) => n.type === 'matching')!;
            expect(match).toBeDefined();
            expect(match.attrs!.items as unknown[]).toHaveLength(2);
        },
    },
    {
        name: 'ordering fence: listed order is the answer, numbers stripped',
        fragment: '1. Subtract 3 from both sides',
        md: '```order\nprompt: Put the steps in order.\n1. Subtract 3 from both sides\n2. Divide both sides by 2\n3. Check the solution\n```',
        check: (b) => {
            const ordering = b.find((n) => n.type === 'ordering')!;
            expect(ordering).toBeDefined();
            const items = ordering.attrs!.items as Array<{
                content: Array<{ type: string; text?: string }>;
            }>;
            expect(items).toHaveLength(3);
            expect(items[0]!.content[0]!.text).toBe(
                'Subtract 3 from both sides',
            );
        },
    },
    {
        name: 'short-answer fence with a pipe-delimited rubric',
        fragment: 'rubric: Label | points | optional note',
        md: '```shortanswer\nprompt: Explain why the sum of two even numbers is even.\nrubric: Correct reasoning | 3 | Uses that an even number is 2k\nrubric: Clear explanation | 2\n```',
        check: (b) => {
            const sa = b.find((n) => n.type === 'shortAnswer')!;
            expect(sa).toBeDefined();
            const criteria = (sa.attrs!.rubric as { criteria: Array<Record<string, unknown>> }).criteria;
            expect(criteria).toHaveLength(2);
            expect(criteria[0]).toMatchObject({
                label: 'Correct reasoning',
                maxPoints: 3,
                description: 'Uses that an even number is 2k',
            });
            expect(criteria[1]).toMatchObject({ label: 'Clear explanation', maxPoints: 2 });
            expect(criteria[1]).not.toHaveProperty('description');
        },
    },
    {
        name: 'essay fence with a word-count target and rubric',
        fragment: 'words: 200-300',
        md: '```essay\nprompt: Argue whether zoos do more good than harm.\nwords: 200-300\nrubric: Thesis | 3\n```',
        check: (b) => {
            const essay = b.find((n) => n.type === 'essay')!;
            expect(essay).toBeDefined();
            expect(essay.attrs).toMatchObject({ wordMin: 200, wordMax: 300 });
            const criteria = (essay.attrs!.rubric as { criteria: Array<Record<string, unknown>> }).criteria;
            expect(criteria).toHaveLength(1);
            expect(criteria[0]).toMatchObject({ label: 'Thesis', maxPoints: 3 });
        },
    },
    {
        name: 'image ![alt](url)',
        fragment: '![a short description](https://full-image-url)',
        md: '![a short description](https://full-image-url)',
        check: (b) => {
            expect(b).toHaveLength(1);
            expect(b[0]!.type).toBe('image');
            expect(b[0]!.attrs).toMatchObject({
                src: 'https://full-image-url',
                alt: 'a short description',
            });
        },
    },
];

describe('prompt claims ↔ converter behavior', () => {
    it.each(CLAIMS)('the prompt teaches "$name" verbatim', ({ fragment }) => {
        expect(MARKDOWN_IMPORT_AI_PROMPT).toContain(fragment);
    });

    it.each(CLAIMS)('"$name" produces what the prompt promises', ({ md, check }) => {
        check(convert(md).blocks);
    });
});

// Behavioral promises stated in prose (not as a copyable fragment).
describe('prompt prose ↔ converter behavior', () => {
    it('a blank line separates blocks; touching lines merge', () => {
        expect(convert('a\n\nb').blocks).toHaveLength(2);
        expect(convert('a\nb').blocks).toHaveLength(1);
        expect(MARKDOWN_IMPORT_AI_PROMPT).toContain('blank line between every block');
    });

    it('an empty {{}} is ignored (kept as literal text)', () => {
        const b = convert('nothing here {{}}').blocks;
        expect(nodesOfType(b, 'blank')).toHaveLength(0);
        expect(MARKDOWN_IMPORT_AI_PROMPT).toContain('an empty {{}} is ignored');
    });

    it('a list of problems flattens to one problem per item', () => {
        const b = convert('1. a is {{x}}\n2. b is {{y}}').blocks;
        expect(b).toHaveLength(2);
        expect(b.every((n) => n.type === 'fillInBlank')).toBe(true);
        expect(MARKDOWN_IMPORT_AI_PROMPT).toContain('one\n  problem per item');
    });
});

// =============================================================================
// 2 ↔ 3 — the doc's worked example imports exactly as the doc claims
// =============================================================================

describe('doc worked example ↔ converter', () => {
    it('imports as the documented structure', () => {
        const { blocks } = convert(fence('markdown'));
        // checkpoint section "Cell Biology"
        expect(blocks[0]).toEqual({
            type: 'sectionBreak',
            attrs: { title: 'Cell Biology', isCheckpoint: true },
        });
        // three fill-in-the-blank problems (one prose + two list items)
        expect(nodesOfType(blocks, 'fillInBlank')).toHaveLength(3);
        const answers = nodesOfType(blocks, 'blank').map((n) => n.attrs!.answer);
        expect(answers).toContain('mitochondria');
        expect(answers).toContain('oxygen');
        expect(answers).toContain('12');
        // a display equation and an image block
        expect(nodesOfType(blocks, 'mathBlock')).toHaveLength(1);
        expect(nodesOfType(blocks, 'image')).toHaveLength(1);
    });
});

// =============================================================================
// 2 ↔ 3 — everything the doc lists as unsupported actually degrades + warns
// =============================================================================

describe('documented "not supported" list ↔ converter', () => {
    const cases: { name: string; md: string }[] = [
        { name: 'tables', md: '| a | b |\n| - | - |\n| 1 | 2 |' },
        { name: 'fenced code blocks', md: '```\ncode\n```' },
        { name: 'blockquotes', md: '> quoted' },
        { name: 'links', md: 'see [docs](https://example.com)' },
    ];

    it.each(cases)('$name degrade with a warning, never crash', ({ md }) => {
        const result = convert(md);
        // never an unsupported block type; never throws (we got here)
        const types = new Set(flatten(result.blocks).map((n) => n.type));
        expect(types.has('table')).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('the doc actually lists these as unsupported', () => {
        const lower = DOC.toLowerCase();
        for (const word of ['tables', 'code blocks', 'blockquotes', 'links']) {
            expect(lower).toContain(word);
        }
    });
});
