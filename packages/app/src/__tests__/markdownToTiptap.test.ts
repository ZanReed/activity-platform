// =============================================================================
// markdownToTiptap.test.ts — Markdown import converter
// -----------------------------------------------------------------------------
// End-to-end tests over the real markdown-it integration (the lazy importer is
// loaded once via getMarkdownImporter). Each case asserts on the emitted Tiptap
// blocks AND, where it matters, that those blocks survive the
// tiptapToActivity → activityToTiptap round trip — proving imported content is
// indistinguishable from authored content.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import { ActivityMeta } from '@activity/schema';
import {
    getMarkdownImporter,
    type MarkdownImporter,
} from '../lib/markdownToTiptap';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const META = ActivityMeta.parse({ title: 'Imported', course: 'Algebra II' });

// Strip volatile attrs (fresh UUIDs) so structural assertions are stable.
function stripIds(node: JSONContent): JSONContent {
    const out: JSONContent = { ...node };
    if (out.attrs) {
        const attrs = { ...out.attrs };
        delete attrs.id;
        out.attrs = attrs;
    }
    if (out.content) out.content = out.content.map(stripIds);
    return out;
}

function blocks(md: string): JSONContent[] {
    return convert(md).blocks.map(stripIds);
}

// Round-trip through the schema bridge: imported blocks → ActivityDocument →
// back to Tiptap. Returns the re-emitted blocks (ids already non-deterministic,
// so compare structurally via stripIds at the call site).
function roundTrip(md: string): JSONContent[] {
    const doc = { type: 'doc', content: convert(md).blocks };
    const activity = tiptapToActivity(doc, META);
    return (activityToTiptap(activity).content ?? []).map(stripIds);
}

describe('headings', () => {
    it('maps #/##/### to levels 1/2/3', () => {
        expect(blocks('# One\n\n## Two\n\n### Three')).toEqual([
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'One' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Two' }] },
            { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Three' }] },
        ]);
    });

    it('clamps deeper headings (h4–h6) to level 3', () => {
        const out = blocks('#### Deep');
        expect(out[0]).toMatchObject({ type: 'heading', attrs: { level: 3 } });
    });
});

describe('paragraphs and marks', () => {
    it('maps a plain paragraph', () => {
        expect(blocks('Hello world')).toEqual([
            { type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] },
        ]);
    });

    it('maps bold, italic, and inline code to marks', () => {
        expect(blocks('a **b** *c* `d`')).toEqual([
            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'a ' },
                    { type: 'text', text: 'b', marks: [{ type: 'bold' }] },
                    { type: 'text', text: ' ' },
                    { type: 'text', text: 'c', marks: [{ type: 'italic' }] },
                    { type: 'text', text: ' ' },
                    { type: 'text', text: 'd', marks: [{ type: 'code' }] },
                ],
            },
        ]);
    });

    it('nests marks (bold inside italic)', () => {
        const out = blocks('*a **b** c*');
        expect(out[0]!.content).toEqual([
            { type: 'text', text: 'a ', marks: [{ type: 'italic' }] },
            { type: 'text', text: 'b', marks: [{ type: 'italic' }, { type: 'bold' }] },
            { type: 'text', text: ' c', marks: [{ type: 'italic' }] },
        ]);
    });

    it('collapses a soft break to a space within one paragraph', () => {
        // Two adjacent lines (no blank line) are one paragraph in markdown.
        expect(blocks('line one\nline two')).toEqual([
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'line one line two' }],
            },
        ]);
    });

    it('maps a hard break (trailing backslash) to hardBreak', () => {
        const out = blocks('line one\\\nline two');
        expect(out[0]!.content).toEqual([
            { type: 'text', text: 'line one' },
            { type: 'hardBreak' },
            { type: 'text', text: 'line two' },
        ]);
    });
});

describe('blanks → fillInBlank', () => {
    it('promotes a paragraph with a blank to a fillInBlank block', () => {
        expect(blocks('The capital of France is {{Paris}}.')).toEqual([
            {
                type: 'fillInBlank',
                attrs: {
                    solution: null,
                    hasConfidenceRating: false,
                    skills: [],
                    workSpace: null,
                },
                content: [
                    { type: 'text', text: 'The capital of France is ' },
                    {
                        type: 'blank',
                        attrs: {
                            answer: 'Paris',
                            acceptableAnswers: [],
                            interchangeableWithPrevious: false,
                            answerType: 'text',
                        },
                    },
                    { type: 'text', text: '.' },
                ],
            },
        ]);
    });

    it('parses pipe-delimited acceptable answers', () => {
        const out = convert('Answer: {{color|colour}}').blocks;
        expect(out[0]!.content![1]).toMatchObject({
            type: 'blank',
            attrs: { answer: 'color', acceptableAnswers: ['colour'] },
        });
    });

    it('a leading ~ groups a blank with the previous one (and is stripped)', () => {
        const out = convert('(x + {{2}})(x + {{~3}})').blocks;
        const blanks = (out[0]!.content ?? []).filter((n) => n.type === 'blank');
        expect(blanks).toHaveLength(2);
        expect(blanks[0]!.attrs).toMatchObject({
            answer: '2',
            interchangeableWithPrevious: false,
        });
        // The ~ flips the flag and does NOT remain in the answer.
        expect(blanks[1]!.attrs).toMatchObject({
            answer: '3',
            interchangeableWithPrevious: true,
        });
    });

    it('assigns a unique id to every blank', () => {
        const out = convert('{{a}} and {{b}}').blocks;
        const ids = out[0]!.content!
            .filter((n) => n.type === 'blank')
            .map((n) => n.attrs!.id);
        expect(ids).toHaveLength(2);
        expect(new Set(ids).size).toBe(2);
        expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
    });

    it('keeps an empty-answer sentinel as literal text (no blank emitted)', () => {
        // {{}} has no canonical answer → not a valid blank; stays text, so the
        // block is a plain paragraph.
        expect(blocks('nothing here {{}}')).toEqual([
            { type: 'paragraph', content: [{ type: 'text', text: 'nothing here {{}}' }] },
        ]);
    });

    it('does not parse blanks inside a heading (kept literal)', () => {
        const out = blocks('# Topic {{x}}');
        expect(out[0]).toEqual({
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Topic {{x}}' }],
        });
    });

    it('converts a break inside a problem to a space (fillInBlank has no hardBreak)', () => {
        const out = convert('solve {{4}}\\\nnow').blocks;
        expect(out[0]!.type).toBe('fillInBlank');
        expect(out[0]!.content).toEqual([
            { type: 'text', text: 'solve ' },
            expect.objectContaining({ type: 'blank' }),
            { type: 'text', text: ' now' },
        ]);
    });
});

describe('lists', () => {
    it('maps a plain bullet list', () => {
        expect(blocks('- a\n- b')).toEqual([
            {
                type: 'bulletList',
                content: [
                    { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }] },
                    { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'b' }] }] },
                ],
            },
        ]);
    });

    it('maps an ordered list', () => {
        const out = blocks('1. first\n2. second');
        expect(out[0]!.type).toBe('orderedList');
        expect(out[0]!.content).toHaveLength(2);
    });

    it('preserves a nested list', () => {
        const out = blocks('- a\n    - a1\n- b');
        const firstItem = out[0]!.content![0]!;
        expect(firstItem.content!.map((n) => n.type)).toEqual([
            'paragraph',
            'bulletList',
        ]);
    });

    it('flattens a numbered list of problems into fillInBlank blocks', () => {
        const out = blocks(
            '1. The powerhouse of the cell is the {{mitochondria}}.\n' +
                '2. Water is hydrogen and {{oxygen}}.',
        );
        expect(out).toHaveLength(2);
        expect(out.every((b) => b.type === 'fillInBlank')).toBe(true);
        expect(out[0]!.content![1]).toMatchObject({
            type: 'blank',
            attrs: { answer: 'mitochondria' },
        });
    });
});

describe('section breaks', () => {
    it('maps a {checkpoint} heading to a checkpoint section break', () => {
        expect(blocks('# Cell Biology {checkpoint}')).toEqual([
            {
                type: 'sectionBreak',
                attrs: { title: 'Cell Biology', isCheckpoint: true },
            },
        ]);
    });

    it('strips marks from the checkpoint title', () => {
        expect(blocks('## **Unit** Two {checkpoint}')).toEqual([
            {
                type: 'sectionBreak',
                attrs: { title: 'Unit Two', isCheckpoint: true },
            },
        ]);
    });

    it('leaves a plain heading as a heading (not a section break)', () => {
        expect(blocks('# Plain')[0]!.type).toBe('heading');
    });
});

describe('math', () => {
    it('maps inline $…$ to mathInline', () => {
        const out = blocks('The identity $E = mc^2$ holds.');
        expect(out[0]).toEqual({
            type: 'paragraph',
            content: [
                { type: 'text', text: 'The identity ' },
                { type: 'mathInline', attrs: { latex: 'E = mc^2' } },
                { type: 'text', text: ' holds.' },
            ],
        });
    });

    it('maps a standalone $$…$$ paragraph to a mathBlock', () => {
        expect(blocks('$$\\int_0^1 x\\,dx$$')).toEqual([
            { type: 'mathBlock', attrs: { latex: '\\int_0^1 x\\,dx' } },
        ]);
    });

    it('handles multi-line display math in one paragraph', () => {
        const out = blocks('$$\na + b\n$$');
        expect(out).toEqual([
            { type: 'mathBlock', attrs: { latex: 'a + b' } },
        ]);
    });

    it('does NOT treat currency as math', () => {
        expect(blocks('It costs $5 and $10 total')).toEqual([
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'It costs $5 and $10 total' }],
            },
        ]);
    });

    it('allows inline math inside a heading', () => {
        expect(blocks('# Energy $E=mc^2$')).toEqual([
            {
                type: 'heading',
                attrs: { level: 1 },
                content: [
                    { type: 'text', text: 'Energy ' },
                    { type: 'mathInline', attrs: { latex: 'E=mc^2' } },
                ],
            },
        ]);
    });

    it('preserves LaTeX backslashes and underscores (no CommonMark mangling)', () => {
        // The reason math is lifted before markdown-it: \frac, \, and _ would
        // otherwise be eaten by backslash-escape / emphasis processing.
        const out = blocks('Area $\\frac{1}{2} b h$ and index $a_b$.');
        expect(out[0]!.content).toEqual([
            { type: 'text', text: 'Area ' },
            { type: 'mathInline', attrs: { latex: '\\frac{1}{2} b h' } },
            { type: 'text', text: ' and index ' },
            { type: 'mathInline', attrs: { latex: 'a_b' } },
            { type: 'text', text: '.' },
        ]);
    });

    it('does NOT treat $…$ inside inline code as math', () => {
        const out = blocks('Type `$x$` to write math.');
        expect(out[0]!.content).toEqual([
            { type: 'text', text: 'Type ' },
            { type: 'text', text: '$x$', marks: [{ type: 'code' }] },
            { type: 'text', text: ' to write math.' },
        ]);
    });

    it('mixes math and a blank in one problem', () => {
        const out = blocks('Compute $2+2$ = {{4}}');
        expect(out[0]!.type).toBe('fillInBlank');
        expect(out[0]!.content).toEqual([
            { type: 'text', text: 'Compute ' },
            { type: 'mathInline', attrs: { latex: '2+2' } },
            { type: 'text', text: ' = ' },
            {
                type: 'blank',
                attrs: {
                    answer: '4',
                    acceptableAnswers: [],
                    interchangeableWithPrevious: false,
                    answerType: 'text',
                },
            },
        ]);
    });
});

describe('multiple-choice fence (```mc)', () => {
    const FENCE =
        '```mc\nprompt: What is $2 + 2$?\n( ) 3 :: Check your addition.\n(x) 4\n( ) 22\n```';

    it('imports a single-select block with prompt math, feedback, and one correct choice', () => {
        const { blocks, warnings } = convert(FENCE);
        expect(warnings).toHaveLength(0);
        expect(blocks).toHaveLength(1);
        const mc = blocks[0]!;
        expect(mc.type).toBe('multipleChoice');
        expect(mc.attrs).toMatchObject({ multiSelect: false });
        const choices = mc.attrs!.choices as Array<{
            content: JSONContent[];
            correct: boolean;
            feedback?: JSONContent[];
        }>;
        expect(choices).toHaveLength(3);
        expect(choices.map((c) => c.correct)).toEqual([false, true, false]);
        // Attrs-stored inline content is the CANONICAL schema shape (marks
        // arrays, math_inline) — the NodeViews read it back through
        // activityInlineToTiptap, which requires it. Node content (the prompt
        // below) stays Tiptap-shaped.
        expect(choices[0]!.feedback).toEqual([
            { type: 'text', text: 'Check your addition.', marks: [] },
        ]);
        expect(choices[1]!.feedback).toBeUndefined();
        // Prompt carries real inline math.
        expect(mc.content).toEqual([
            { type: 'text', text: 'What is ' },
            { type: 'mathInline', attrs: { latex: '2 + 2' } },
            { type: 'text', text: '?' },
        ]);
    });

    it('square brackets author multi-select', () => {
        const { blocks } = convert(
            '```mc\nprompt: Which are prime?\n[x] 2\n[x] 3\n[ ] 4\n```',
        );
        const mc = blocks[0]!;
        expect(mc.attrs).toMatchObject({ multiSelect: true });
        const choices = mc.attrs!.choices as Array<{ correct: boolean }>;
        expect(choices.map((c) => c.correct)).toEqual([true, true, false]);
    });

    it('more than one (x) in parens also flips to multi-select', () => {
        const { blocks } = convert('```mc\n(x) a\n(x) b\n( ) c\n```');
        expect(blocks[0]!.attrs).toMatchObject({ multiSelect: true });
    });

    it('solution and options: confidence carry through', () => {
        const { blocks } = convert(
            '```mc\nprompt: Pick.\n(x) yes\n( ) no\nsolution: Because $x = 1$.\noptions: confidence\n```',
        );
        const mc = blocks[0]!;
        expect(mc.attrs).toMatchObject({ hasConfidenceRating: true });
        expect(mc.attrs!.solution).toEqual([
            { type: 'text', text: 'Because ', marks: [] },
            { type: 'math_inline', latex: 'x = 1' },
            { type: 'text', text: '.', marks: [] },
        ]);
    });

    it('no correct choice degrades to plain text with a warning', () => {
        const { blocks, warnings } = convert('```mc\n( ) a\n( ) b\n```');
        expect(blocks[0]!.type).not.toBe('multipleChoice');
        expect(warnings.some((w) => w.includes('(x)'))).toBe(true);
    });

    it('fewer than two choices degrades with a warning', () => {
        const { blocks, warnings } = convert('```mc\nprompt: Hm.\n(x) only\n```');
        expect(blocks[0]!.type).not.toBe('multipleChoice');
        expect(warnings.some((w) => w.includes('two choice'))).toBe(true);
    });

    it('an unrecognized line degrades with a warning', () => {
        const { blocks, warnings } = convert('```mc\n(x) a\n( ) b\nbogus line\n```');
        expect(blocks[0]!.type).not.toBe('multipleChoice');
        expect(warnings.length).toBeGreaterThan(0);
    });

    it('![alt](url) on a choice line becomes the choice image', () => {
        const { blocks, warnings } = convert(
            '```mc\nprompt: Which shape?\n(x) a square ![a square](https://example.com/sq.png)\n( ) circle\n```',
        );
        expect(warnings).toHaveLength(0);
        const choices = blocks[0]!.attrs!.choices as Array<{
            content: JSONContent[];
            image?: { src: string; alt: string };
        }>;
        expect(choices[0]!.image).toEqual({
            src: 'https://example.com/sq.png',
            alt: 'a square',
        });
        // The image markdown is stripped from the choice text.
        expect(choices[0]!.content).toEqual([
            { type: 'text', text: 'a square', marks: [] },
        ]);
        expect(choices[1]!.image).toBeUndefined();
    });

    it('an image-only choice line is legal', () => {
        const { blocks, warnings } = convert(
            '```mc\n(x) ![the graph of y = x](https://example.com/a.png)\n( ) b\n```',
        );
        expect(warnings).toHaveLength(0);
        const choices = blocks[0]!.attrs!.choices as Array<{
            content: JSONContent[];
            image?: { src: string; alt: string };
        }>;
        expect(choices[0]!.image?.src).toBe('https://example.com/a.png');
        expect(choices[0]!.content).toEqual([]);
    });

    it('an unparseable image URL stays literal text', () => {
        const { blocks } = convert(
            '```mc\n(x) ![alt](not a url)\n( ) b\n```',
        );
        const choices = blocks[0]!.attrs!.choices as Array<{
            image?: { src: string; alt: string };
        }>;
        expect(choices[0]!.image).toBeUndefined();
    });
});

describe('matching fence (```match)', () => {
    type Side = { id: string; content: JSONContent[]; image?: { src: string } };

    it('splits pairs on the LAST " = " so equation items keep their equals signs', () => {
        const { blocks, warnings } = convert(
            '```match\nprompt: Match each equation to its slope.\ny = 2x = 2\ny = -x = -1\n```',
        );
        expect(warnings).toHaveLength(0);
        const match = blocks[0]!;
        expect(match.type).toBe('matching');
        const items = match.attrs!.items as Side[];
        const targets = match.attrs!.targets as Side[];
        const key = match.attrs!.key as Record<string, string>;
        expect(items[0]!.content).toEqual([{ type: 'text', text: 'y = 2x', marks: [] }]);
        expect(targets[0]!.content).toEqual([{ type: 'text', text: '2', marks: [] }]);
        expect(key[items[0]!.id]).toBe(targets[0]!.id);
        expect(key[items[1]!.id]).toBe(targets[1]!.id);
    });

    it('" -> " wins over " = " when present', () => {
        const { blocks } = convert(
            '```match\na = b -> x = y\nc -> d\n```',
        );
        const items = blocks[0]!.attrs!.items as Side[];
        const targets = blocks[0]!.attrs!.targets as Side[];
        expect(items[0]!.content).toEqual([{ type: 'text', text: 'a = b', marks: [] }]);
        expect(targets[0]!.content).toEqual([{ type: 'text', text: 'x = y', marks: [] }]);
    });

    it('a leading = (or ->) line adds a distractor target with no key entry', () => {
        const { blocks } = convert(
            '```match\na = 1\nb = 2\n= 3\n-> 4\n```',
        );
        const items = blocks[0]!.attrs!.items as Side[];
        const targets = blocks[0]!.attrs!.targets as Side[];
        const key = blocks[0]!.attrs!.key as Record<string, string>;
        expect(items).toHaveLength(2);
        expect(targets).toHaveLength(4);
        expect(Object.keys(key)).toHaveLength(2);
    });

    it('\\= escapes a literal equals', () => {
        const { blocks } = convert('```match\na \\= b = c\nd = e\n```');
        const items = blocks[0]!.attrs!.items as Side[];
        expect(items[0]!.content).toEqual([{ type: 'text', text: 'a = b', marks: [] }]);
    });

    it('options: reuse + confidence and solution carry through', () => {
        const { blocks } = convert(
            '```match\na = 1\nb = 1\nsolution: Same slope.\noptions: reuse, confidence\n```',
        );
        expect(blocks[0]!.attrs).toMatchObject({
            allowTargetReuse: true,
            hasConfidenceRating: true,
        });
        expect(blocks[0]!.attrs!.solution).toEqual([
            { type: 'text', text: 'Same slope.', marks: [] },
        ]);
    });

    it('an image on a side becomes that side\'s figure', () => {
        const { blocks, warnings } = convert(
            '```match\n![line](https://example.com/l.png) = positive slope\nb = 2\n```',
        );
        expect(warnings).toHaveLength(0);
        const items = blocks[0]!.attrs!.items as Side[];
        expect(items[0]!.image?.src).toBe('https://example.com/l.png');
        expect(items[0]!.content).toEqual([]);
    });

    it('fewer than two pairs degrades with a warning', () => {
        const { blocks, warnings } = convert('```match\na = 1\n= 2\n```');
        expect(blocks[0]!.type).not.toBe('matching');
        expect(warnings.some((w) => w.includes('two'))).toBe(true);
    });

    it('a line with no separator degrades with a warning', () => {
        const { blocks, warnings } = convert('```match\na = 1\nno separator here\n```');
        expect(blocks[0]!.type).not.toBe('matching');
        expect(warnings.length).toBeGreaterThan(0);
    });
});

describe('ordering fence (```order)', () => {
    it('imports items in listed order with numbers stripped', () => {
        const { blocks, warnings } = convert(
            '```order\nprompt: Put the steps in order.\n1. Subtract 3\n2. Divide by 2\n3. Check\n```',
        );
        expect(warnings).toHaveLength(0);
        const ordering = blocks[0]!;
        expect(ordering.type).toBe('ordering');
        const items = ordering.attrs!.items as Array<{ content: JSONContent[] }>;
        expect(items.map((i) => (i.content[0] as { text?: string }).text)).toEqual([
            'Subtract 3',
            'Divide by 2',
            'Check',
        ]);
    });

    it('bare and dashed lines work too; inline math carries through', () => {
        const { blocks } = convert(
            '```order\n- solve $2x = 8$\nfirst bare line\n```',
        );
        const items = blocks[0]!.attrs!.items as Array<{ content: JSONContent[] }>;
        expect(items).toHaveLength(2);
        expect(items[0]!.content).toEqual([
            { type: 'text', text: 'solve ', marks: [] },
            { type: 'math_inline', latex: '2x = 8' },
        ]);
    });

    it('solution and options: confidence carry through', () => {
        const { blocks } = convert(
            '```order\na\nb\nsolution: Reverse the operations.\noptions: confidence\n```',
        );
        expect(blocks[0]!.attrs).toMatchObject({ hasConfidenceRating: true });
    });

    it('fewer than two items degrades with a warning', () => {
        const { blocks, warnings } = convert('```order\nonly one\n```');
        expect(blocks[0]!.type).not.toBe('ordering');
        expect(warnings.some((w) => w.includes('two'))).toBe(true);
    });
});

describe('numeric blanks ({{=…}})', () => {
    it('a leading = makes the blank numeric (and is stripped)', () => {
        const out = convert('the area is {{=12}}.').blocks;
        const blank = out[0]!.content!.find((n) => n.type === 'blank')!;
        expect(blank.attrs).toMatchObject({
            answer: '12',
            answerType: 'numeric',
        });
        expect(blank.attrs).not.toHaveProperty('tolerance');
    });

    it('a trailing +- (or ±) sets the tolerance', () => {
        const out = convert('pi is {{=3.14 +- 0.01}} and e is {{=2.72 ± 0.01}}').blocks;
        const blanks = out[0]!.content!.filter((n) => n.type === 'blank');
        expect(blanks[0]!.attrs).toMatchObject({
            answer: '3.14',
            answerType: 'numeric',
            tolerance: 0.01,
        });
        expect(blanks[1]!.attrs).toMatchObject({
            answer: '2.72',
            answerType: 'numeric',
            tolerance: 0.01,
        });
    });

    it('combines with ~ (tilde first: {{~=3}})', () => {
        const out = convert('roots: {{=2}} and {{~=3}}').blocks;
        const blanks = out[0]!.content!.filter((n) => n.type === 'blank');
        expect(blanks[1]!.attrs).toMatchObject({
            answer: '3',
            answerType: 'numeric',
            interchangeableWithPrevious: true,
        });
    });

    it('a bare {{=}} is ignored like an empty blank', () => {
        const out = convert('nothing {{=}}').blocks;
        const blanks = (out[0]!.content ?? []).filter((n) => n.type === 'blank');
        expect(blanks).toHaveLength(0);
    });

    it('a lone +- clause without an answer stays the whole answer', () => {
        // "{{=+- 5}}" has no answer before the +-, so nothing is split off;
        // the literal remains the canonical answer rather than importing a
        // blank with an empty answer.
        const out = convert('odd {{=+- 5}}').blocks;
        const blank = out[0]!.content!.find((n) => n.type === 'blank')!;
        expect(blank.attrs).toMatchObject({
            answer: '+- 5',
            answerType: 'numeric',
        });
    });
});

describe('images', () => {
    it('lifts a standalone image into an image block', () => {
        expect(blocks('![a cat](https://example.com/cat.png)')).toEqual([
            {
                type: 'image',
                attrs: {
                    src: 'https://example.com/cat.png',
                    alt: 'a cat',
                    caption: '',
                },
            },
        ]);
    });

    it('splits a paragraph around an inline image, preserving order', () => {
        const out = blocks('before ![a](https://x/a.png) after');
        expect(out.map((b) => b.type)).toEqual([
            'paragraph',
            'image',
            'paragraph',
        ]);
        expect(out[0]!.content).toEqual([{ type: 'text', text: 'before ' }]);
        expect(out[2]!.content).toEqual([{ type: 'text', text: ' after' }]);
    });

    it('skips an image with no URL and warns', () => {
        const result = convert('![alt]()');
        expect(result.blocks).toEqual([]);
        expect(result.warnings.some((w) => /image/i.test(w))).toBe(true);
    });
});

describe('graceful degradation', () => {
    it('flattens a fenced code block to text with a warning', () => {
        const result = convert('```\nconst x = 1;\n```');
        expect(result.blocks[0]!.type).toBe('paragraph');
        expect(result.warnings.some((w) => /code/i.test(w))).toBe(true);
    });

    it('unwraps a blockquote and warns', () => {
        const result = convert('> quoted text');
        expect(result.blocks[0]).toMatchObject({ type: 'paragraph' });
        expect(result.warnings.some((w) => /quote/i.test(w))).toBe(true);
    });

    it('keeps link text, drops the URL, and warns', () => {
        const result = convert('see [the docs](https://example.com)');
        const para = result.blocks[0]!;
        expect(para.content).toEqual([{ type: 'text', text: 'see the docs' }]);
        expect(result.warnings.some((w) => /link/i.test(w))).toBe(true);
    });

    it('does not throw on empty input', () => {
        expect(convert('')).toEqual({ blocks: [], warnings: [] });
    });

    it('deduplicates repeated warnings', () => {
        const result = convert('```\na\n```\n\n```\nb\n```');
        const codeWarnings = result.warnings.filter((w) => /code/i.test(w));
        expect(codeWarnings).toHaveLength(1);
    });
});

describe('AI code-fence wrapper (safety net)', () => {
    it('unwraps a whole-paste ```markdown fence and imports the contents', () => {
        const fenced = '```markdown\n# Title\n\nThe answer is {{Paris}}.\n```';
        expect(blocks(fenced)).toEqual(blocks('# Title\n\nThe answer is {{Paris}}.'));
    });

    it('also accepts a ```md tag', () => {
        expect(blocks('```md\n# Hi\n```')).toEqual(blocks('# Hi'));
    });

    it('does NOT unwrap a plain ``` code block (still flattened to text + warning)', () => {
        const result = convert('```\nconst x = 1;\n```');
        expect(result.blocks[0]!.type).toBe('paragraph');
        expect(result.warnings.some((w) => /code/i.test(w))).toBe(true);
    });
});

describe('schema round-trip', () => {
    it('imported blocks survive tiptapToActivity → activityToTiptap unchanged', () => {
        const md =
            '# Warm up\n\n' +
            'Solve for x: {{5}}.\n\n' +
            '## Practice {checkpoint}\n\n' +
            '- step one\n- step two\n\n' +
            'The mass-energy relation is $E = mc^2$.\n\n' +
            '$$\\sum_{i=1}^{n} i$$\n\n' +
            '![diagram](https://example.com/d.png)\n\n' +
            'Capital: {{Paris|paris}}';
        // Round-trip equals a fresh import (both id-stripped) → structurally stable.
        expect(roundTrip(md)).toEqual(blocks(md));
    });
});

describe('```graph fence (Drop 7)', () => {
    it('imports a graded line with axes + prompt + options', () => {
        const md = '```graph\naxes: -5..5, -5..5\nprompt: Graph the line.\nanswer: 2x + 3y = 6\noptions: partial-credit\n```';
        const { blocks, warnings } = convert(md);
        expect(warnings).toEqual([]);
        const g = blocks.find((b) => b.type === 'interactiveGraph')!;
        expect(g.attrs!.axisConfig.xMin).toBe(-5);
        expect(g.attrs!.partialCredit).toBe(true);
        const models = g.attrs!.interaction.models;
        expect(models[0].family).toBe('linear');
        expect(models[0].slope).toBeCloseTo(-2 / 3, 4);
        expect(g.content).toEqual([{ type: 'text', text: 'Graph the line.' }]);
    });

    it('imports an inequality answer', () => {
        const md = '```graph\nanswer: y > 2x + 1\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        const q = g.attrs!.interaction;
        expect(q.type).toBe('graph_inequality');
        expect(q.inequalities[0].strict).toBe(true);
        expect(q.inequalities[0].shadeSide).toBe('above');
    });

    it('imports a display graph from show lines (incl. pictured inequality + ray)', () => {
        const md = '```graph\nshow: line y <= x^2\nshow: point (2, 3) open "A"\nshow: ray (0,0) (2,1) closed\nshow: expression sin(x) dashed\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        const q = g.attrs!.interaction;
        expect(q.type).toBe('display');
        const kinds = q.drawables.map((d: { kind: string }) => d.kind);
        expect(kinds).toEqual(['curve', 'point', 'ray', 'expression']);
        expect(q.drawables[0].shade).toBe('below');
        expect(q.drawables[1].style).toBe('open');
    });

    it('translates show-line domain clauses to minStyle/maxStyle endpoint styles', () => {
        // Regression: parseGraphFormula's ParsedDomain uses minClosed/maxClosed
        // booleans, but CurveDrawable.domain wants minStyle/maxStyle. Passing
        // the booleans through meant renderers fell back to 'closed' and drew
        // an open endpoint ("for x > 0") as a closed dot.
        const md = '```graph\nshow: curve y = x^2 for x > 0\nshow: line y = 2x for -2 <= x < 5\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        const q = g.attrs!.interaction;
        expect(q.type).toBe('display');
        expect(q.drawables[0].domain).toEqual({ min: 0, minStyle: 'open' });
        expect(q.drawables[1].domain).toEqual({ min: -2, minStyle: 'closed', max: 5, maxStyle: 'open' });
    });

    it('translates a max-only domain clause (no min keys emitted)', () => {
        const md = '```graph\nshow: curve y = x^2 for x <= 5\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        const q = g.attrs!.interaction;
        expect(q.type).toBe('display');
        expect(q.drawables[0].domain).toEqual({ max: 5, maxStyle: 'closed' });
    });

    it('accepts "dotted" as a synonym for "dashed" without eating the line options', () => {
        // Regression: 'dotted' wasn't a recognized style token, so it stayed in
        // the formula body, failed the inequality parse, and the drawable fell
        // back to a bare expression — silently losing BOTH style and shade.
        const md = '```graph\nshow: line y > 2x + 1 dotted\nshow: line y = x dotted\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        const q = g.attrs!.interaction;
        expect(q.type).toBe('display');
        expect(q.drawables[0].kind).toBe('curve');
        expect(q.drawables[0].style).toBe('dashed');
        expect(q.drawables[0].shade).toBe('above'); // shade side retained
        expect(q.drawables[1].kind).toBe('curve');
        expect(q.drawables[1].style).toBe('dashed');
    });

    it('imports mistake: lines + the no-builtin-feedback option', () => {
        const md = '```graph\nanswer: y = 2x + 1\nmistake: y = x + 2 :: The number multiplying x is the slope.\nmistake: y = -2x + 1 :: Check the sign of the slope.\noptions: no-builtin-feedback\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        expect(g.attrs!.builtinFeedback).toBe(false);
        expect(g.attrs!.mistakeFeedback).toEqual([
            { match: 'y = x + 2', feedback: [{ type: 'text', text: 'The number multiplying x is the slope.', marks: [] }] },
            { match: 'y = -2x + 1', feedback: [{ type: 'text', text: 'Check the sign of the slope.', marks: [] }] },
        ]);
    });

    it('falls back with a warning on a malformed mistake line', () => {
        const md = '```graph\nanswer: y = 2x + 1\nmistake: y = x + 2 no separator\n```';
        const { blocks, warnings } = convert(md);
        expect(blocks.some((b) => b.type === 'interactiveGraph')).toBe(false);
        expect(warnings.some((w) => /mistake lines look like/.test(w))).toBe(true);
    });

    it('imports answer: none as a no-solution trick question', () => {
        const md = '```graph\nanswer: none\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        expect(g.attrs!.allowNoSolution).toBe(true);
        expect(g.attrs!.noSolutionCorrect).toBe(true);
    });

    it('steers a domain clause to the ray/segment syntax (gliders deprecated)', () => {
        const md = '```graph\nanswer: y = 2x + 3 for x >= 0\n```';
        const { blocks, warnings } = convert(md);
        expect(blocks.some((b) => b.type === 'interactiveGraph')).toBe(false);
        expect(warnings.some((w) => /answer: ray \(1, 2\) through \(3, 4\)/.test(w))).toBe(true);
    });

    it('imports ray and segment answers with endpoint styles', () => {
        const md = '```graph\nanswer: ray (1, 2) through (3, 4) open\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        expect(g.attrs!.interaction).toEqual({
            type: 'plot_ray',
            rays: [{ from: [1, 2], through: [3, 4], fromStyle: 'open', tolerance: 0.25 }],
        });

        const md2 = '```graph\nanswer: segment (1, 2) to (3, 4) open closed\n```';
        const g2 = convert(md2).blocks.find((b) => b.type === 'interactiveGraph')!;
        expect(g2.attrs!.interaction).toEqual({
            type: 'plot_segment',
            segments: [{ from: [1, 2], to: [3, 4], endpoints: ['open', 'closed'], tolerance: 0.25 }],
        });
    });

    it('falls back to plain text with a warning on a bad line', () => {
        const md = '```graph\nanswer: y = squiggle(x)\n```';
        const { blocks, warnings } = convert(md);
        expect(blocks.some((b) => b.type === 'interactiveGraph')).toBe(false);
        expect(warnings.some((w) => /Graph block/.test(w))).toBe(true);
    });

    it('parses $…$ inline math in the prompt line', () => {
        const md =
            '```graph\nprompt: Graph $y = 2 \\cdot 3^x$ on the grid.\nanswer: y = 2*3^x\n```';
        const { blocks, warnings } = convert(md);
        expect(warnings).toEqual([]);
        const g = blocks.find((b) => b.type === 'interactiveGraph')!;
        expect(g.content).toEqual([
            { type: 'text', text: 'Graph ' },
            { type: 'mathInline', attrs: { latex: 'y = 2 \\cdot 3^x' } },
            { type: 'text', text: ' on the grid.' },
        ]);
        // Imported prompt math must survive the schema bridge like any
        // editor-authored prompt (text/mathInline nodes carry no volatile ids).
        expect(
            roundTrip(md).find((b) => b.type === 'interactiveGraph')!.content,
        ).toEqual(g.content);
    });

    it('keeps currency dollars in a prompt literal (Pandoc guard applies)', () => {
        const md = '```graph\nprompt: Tickets cost $5 and $10 each.\nanswer: y = 5x\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        expect(g.content).toEqual([
            { type: 'text', text: 'Tickets cost $5 and $10 each.' },
        ]);
    });

    it('keeps {{…}} literal in a prompt (no blanks inside graph prompts)', () => {
        const md = '```graph\nprompt: A {{trap}} answer.\nanswer: y = x\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        expect(g.content).toEqual([{ type: 'text', text: 'A {{trap}} answer.' }]);
    });
});
