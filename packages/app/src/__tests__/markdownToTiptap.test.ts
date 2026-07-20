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
import { getSchema } from '@tiptap/core';
import type { JSONContent } from '@tiptap/react';
import { ActivityMeta, DataPlotBlock, NumberLineBlock } from '@activity/schema';
import {
    getMarkdownImporter,
    type MarkdownImporter,
} from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { buildEditorExtensions } from '../editor/editorExtensions';
import {
    activityToTiptapBare as activityToTiptap,
    tiptapToActivityBare as tiptapToActivity,
} from '../lib/serializeTestBridge';

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

// The real editor schema — the strict-grid doc/row/column contract the imported
// content must satisfy once wrapped.
const editorSchema = getSchema(buildEditorExtensions());

// Strict-grid import pin (T8): the importer emits a bare block stream; the
// import call sites wrap it with wrapBlocksStrict before setContent. This checks
// that the WRAPPED result is a valid strict-grid document against the real
// ProseMirror schema — so import can't silently produce an invalid tree.
describe('strict-grid import (T8)', () => {
    const cases: Array<[string, string]> = [
        ['a heading + paragraph', '# Title\n\nSome intro text.'],
        ['a section break (checkpoint heading)', '## Part 2 {checkpoint}\n\nWork below.'],
        ['a bullet list', '- one\n- two\n- three'],
        ['a fill-in-blank', 'The capital is {{Paris}}.'],
        ['mixed content', '# T\n\npara\n\n## Sec {checkpoint}\n\n- a\n- b'],
    ];

    it.each(cases)('wraps %s into a schema-valid strict doc', (_label, md) => {
        const doc = wrapBlocksStrict(convert(md).blocks);
        // Every top-level node is a row or a sectionBreak (never a bare block).
        for (const node of doc.content ?? []) {
            expect(['row', 'sectionBreak']).toContain(node.type);
        }
        // The real editor schema accepts it (throws on any invalid nesting).
        expect(() => editorSchema.nodeFromJSON(doc).check()).not.toThrow();
    });
});

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

describe('data-plot fence (```dataplot)', () => {
    it('imports a graded dot-plot build with prompt math and an auto-fit axis', () => {
        const { blocks, warnings } = convert(
            '```dataplot\nprompt: Make a dot plot of $x$.\ndata: 3, 5, 5, 6, 8\nanswer: dotplot\n```',
        );
        expect(warnings).toHaveLength(0);
        const plot = blocks[0]!;
        expect(plot.type).toBe('dataPlot');
        expect(plot.attrs).toMatchObject({
            data: [3, 5, 5, 6, 8],
            interaction: { type: 'build_dotplot' },
            // auto-fit: floor(3)..ceil(8) at the default step 1
            config: { min: 3, max: 8, tickStep: 1, snapToTick: true },
            hasConfidenceRating: false,
        });
        expect(plot.content).toEqual([
            { type: 'text', text: 'Make a dot plot of ' },
            { type: 'mathInline', attrs: { latex: 'x' } },
            { type: 'text', text: '.' },
        ]);
    });

    it('an explicit axis line sets the window and step (= histogram bin width)', () => {
        const { blocks, warnings } = convert(
            '```dataplot\ndata: 2 7 7 12 18\naxis: 0..20 step 5\nanswer: histogram\n```',
        );
        expect(warnings).toHaveLength(0);
        expect(blocks[0]!.attrs).toMatchObject({
            interaction: { type: 'build_histogram' },
            config: { min: 0, max: 20, tickStep: 5 },
        });
    });

    it('auto-fit rounds the window out to the step', () => {
        const { blocks } = convert(
            '```dataplot\ndata: 2, 7, 18\naxis: 0..20 step 5\nshow: histogram\n```',
        );
        expect(blocks[0]!.attrs).toMatchObject({ config: { min: 0, max: 20 } });
        const auto = convert('```dataplot\ndata: 2, 7, 18\nanswer: dotplot\n```')
            .blocks[0]!;
        expect(auto.attrs).toMatchObject({ config: { min: 2, max: 18, tickStep: 1 } });
    });

    it('a boxplot answer takes an optional tolerance (default 0.5)', () => {
        const withTol = convert(
            '```dataplot\ndata: 1, 2, 4, 6, 7\nanswer: boxplot tolerance 1\n```',
        ).blocks[0]!;
        expect(withTol.attrs).toMatchObject({
            interaction: { type: 'build_boxplot', tolerance: 1 },
        });
        const noTol = convert(
            '```dataplot\ndata: 1, 2, 4, 6, 7\nanswer: box plot\n```',
        ).blocks[0]!;
        expect(noTol.attrs).toMatchObject({
            interaction: { type: 'build_boxplot', tolerance: 0.5 },
        });
    });

    it('show: makes a static display chart; spaced/hyphenated names tolerated', () => {
        const { blocks, warnings } = convert(
            '```dataplot\ndata: 1, 2, 4, 6, 7\nshow: box-plot\n```',
        );
        expect(warnings).toHaveLength(0);
        expect(blocks[0]!.attrs).toMatchObject({
            interaction: { type: 'display', chart: 'boxplot' },
        });
    });

    it('repeated data lines append (long datasets)', () => {
        const { blocks } = convert(
            '```dataplot\ndata: 1, 2, 3\ndata: 4, 5\nanswer: dotplot\n```',
        );
        expect(blocks[0]!.attrs).toMatchObject({ data: [1, 2, 3, 4, 5] });
    });

    it('solution and options: confidence carry through', () => {
        const { blocks } = convert(
            '```dataplot\ndata: 1, 2\nanswer: dotplot\nsolution: Stack a dot per value.\noptions: confidence\n```',
        );
        expect(blocks[0]!.attrs).toMatchObject({ hasConfidenceRating: true });
        expect(blocks[0]!.attrs!.solution).toEqual([
            { type: 'text', text: 'Stack a dot per value.', marks: [] },
        ]);
    });

    it('data outside an explicit axis window imports with a warning', () => {
        const { blocks, warnings } = convert(
            '```dataplot\ndata: 5, 25\naxis: 0..10\nanswer: dotplot\n```',
        );
        expect(blocks[0]!.type).toBe('dataPlot');
        expect(warnings.some((w) => w.includes('outside the axis window'))).toBe(true);
    });

    const degraded: { name: string; md: string; hint: string }[] = [
        {
            name: 'no data line',
            md: '```dataplot\nprompt: hi\nanswer: dotplot\n```',
            hint: 'data:',
        },
        {
            name: 'neither answer nor show',
            md: '```dataplot\ndata: 1, 2\n```',
            hint: 'answer:',
        },
        {
            name: 'both answer and show',
            md: '```dataplot\ndata: 1, 2\nanswer: dotplot\nshow: boxplot\n```',
            hint: 'one answer: or show:',
        },
        {
            name: 'an unknown chart name',
            md: '```dataplot\ndata: 1, 2\nanswer: scatterplot\n```',
            hint: 'dotplot, histogram, or boxplot',
        },
        {
            name: 'a non-numeric data entry',
            md: '```dataplot\ndata: 1, two, 3\nanswer: dotplot\n```',
            hint: 'not a number',
        },
        {
            name: 'tolerance on a non-boxplot answer',
            md: '```dataplot\ndata: 1, 2\nanswer: histogram tolerance 1\n```',
            hint: 'boxplot answer',
        },
        {
            name: 'a malformed axis line',
            md: '```dataplot\ndata: 1, 2\naxis: 0 to 10\nanswer: dotplot\n```',
            hint: 'axis must look like',
        },
        {
            name: 'an unrecognized line',
            md: '```dataplot\ndata: 1, 2\nbins: 4\nanswer: dotplot\n```',
            hint: 'unrecognized line',
        },
    ];

    it.each(degraded)('$name degrades to plain text with a warning', ({ md, hint }) => {
        const { blocks, warnings } = convert(md);
        expect(blocks[0]!.type).not.toBe('dataPlot');
        expect(warnings.some((w) => w.includes(hint))).toBe(true);
    });

    it('the imported block survives the schema bridge and Zod-validates', () => {
        const md =
            '```dataplot\nprompt: Build the box plot.\ndata: 1, 2, 4, 6, 7\nanswer: boxplot tolerance 1\nsolution: Order the data first.\noptions: confidence\n```';
        // The save-boundary path: Tiptap doc → ActivityDocument → Zod parse.
        const doc = { type: 'doc', content: convert(md).blocks };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections
            .flatMap((s) => s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)))
            .find((b) => b.type === 'data_plot')!;
        expect(() => DataPlotBlock.parse(block)).not.toThrow();
        // And it re-emits unchanged — imported ≡ authored.
        expect(roundTrip(md)).toEqual(blocks(md));
    });
});

describe('number-line fence (```numberline)', () => {
    it('imports a point-plot answer and auto-fits the axis around it', () => {
        const { blocks, warnings } = convert(
            '```numberline\nprompt: Plot $-3$ and 4.\nanswer: -3, 4\n```',
        );
        expect(warnings).toHaveLength(0);
        const nl = blocks[0]!;
        expect(nl.type).toBe('numberLine');
        expect(nl.attrs).toMatchObject({
            interaction: { type: 'plot_point', correctPoints: [-3, 4], tolerance: 0.1 },
            // floor(-3)..ceil(4) padded a step each side at the default step 1
            config: { min: -4, max: 5, tickStep: 1, snapToTick: true },
        });
        expect(nl.content).toEqual([
            { type: 'text', text: 'Plot ' },
            { type: 'mathInline', attrs: { latex: '-3' } },
            { type: 'text', text: ' and 4.' },
        ]);
    });

    it('a single >= inequality becomes a closed-min ray', () => {
        const nl = convert('```numberline\nanswer: x >= -2\n```').blocks[0]!;
        expect(nl.attrs).toMatchObject({
            interaction: {
                type: 'plot_interval',
                correctInterval: { min: -2, minStyle: 'closed' },
                tolerance: 0.1,
            },
        });
        expect(nl.attrs!.interaction.correctInterval).not.toHaveProperty('max');
    });

    it('a strict < inequality becomes an open-max ray', () => {
        const nl = convert('```numberline\nanswer: x < 5\n```').blocks[0]!;
        expect(nl.attrs!.interaction.correctInterval).toEqual({ max: 5, maxStyle: 'open' });
    });

    it('a compound inequality becomes a two-sided interval with per-end styles', () => {
        const nl = convert('```numberline\nanswer: -2 <= x < 5\n```').blocks[0]!;
        expect(nl.attrs!.interaction.correctInterval).toEqual({
            min: -2,
            minStyle: 'closed',
            max: 5,
            maxStyle: 'open',
        });
    });

    it('accepts the variable on the right (3 < x) and flips it to a lower bound', () => {
        const nl = convert('```numberline\nanswer: 3 < x\n```').blocks[0]!;
        expect(nl.attrs!.interaction.correctInterval).toEqual({ min: 3, minStyle: 'open' });
    });

    it('an explicit axis line sets the window and step', () => {
        const { blocks, warnings } = convert(
            '```numberline\nanswer: x >= 3\naxis: -10..10 step 2\n```',
        );
        expect(warnings).toHaveLength(0);
        expect(blocks[0]!.attrs).toMatchObject({
            config: { min: -10, max: 10, tickStep: 2 },
        });
    });

    it('solution and options: confidence carry through', () => {
        const nl = convert(
            '```numberline\nanswer: 5\nsolution: A dot marks the value.\noptions: confidence\n```',
        ).blocks[0]!;
        expect(nl.attrs).toMatchObject({ hasConfidenceRating: true });
        expect(nl.attrs!.solution).toEqual([
            { type: 'text', text: 'A dot marks the value.', marks: [] },
        ]);
    });

    it('an answer value outside an explicit window imports with a warning', () => {
        const { blocks, warnings } = convert(
            '```numberline\nanswer: 25\naxis: 0..10\n```',
        );
        expect(blocks[0]!.type).toBe('numberLine');
        expect(warnings.some((w) => w.includes('outside the axis window'))).toBe(true);
    });

    it('the imported block survives the schema bridge and Zod-validates', () => {
        const md =
            '```numberline\nprompt: Graph the solution.\nanswer: -2 <= x < 5\nsolution: Note the endpoints.\noptions: confidence\n```';
        const doc = { type: 'doc', content: convert(md).blocks };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections
            .flatMap((s) => s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)))
            .find((b) => b.type === 'number_line')!;
        expect(() => NumberLineBlock.parse(block)).not.toThrow();
        expect(roundTrip(md)).toEqual(blocks(md));
    });

    const degraded: { name: string; md: string; hint: string }[] = [
        { name: 'no answer line', md: '```numberline\nprompt: hi\n```', hint: 'answer:' },
        {
            name: 'two answer lines',
            md: '```numberline\nanswer: 5\nanswer: x > 1\n```',
            hint: 'one answer:',
        },
        {
            name: 'an unreadable inequality',
            md: '```numberline\nanswer: x =< 3\n```',
            hint: "couldn't read the inequality",
        },
        {
            name: 'a non-numeric point',
            md: '```numberline\nanswer: -3, foo\n```',
            hint: 'not a number',
        },
        {
            name: 'a malformed axis line',
            md: '```numberline\nanswer: 5\naxis: 0 to 10\n```',
            hint: 'axis must look like',
        },
        {
            name: 'an unrecognized line',
            md: '```numberline\nanswer: 5\nshow: dotplot\n```',
            hint: 'unrecognized line',
        },
    ];

    it.each(degraded)('$name degrades to plain text with a warning', ({ md, hint }) => {
        const { blocks, warnings } = convert(md);
        expect(blocks[0]!.type).not.toBe('numberLine');
        expect(warnings.some((w) => w.includes(hint))).toBe(true);
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

    it('carries a domain clause on a pictured inequality (calculator-parity batch)', () => {
        const md = '```graph\nshow: line y > 2x + 1 for x >= 0\n```';
        const g = convert(md).blocks.find((b) => b.type === 'interactiveGraph')!;
        const q = g.attrs!.interaction;
        expect(q.type).toBe('display');
        expect(q.drawables[0].kind).toBe('curve');
        expect(q.drawables[0].shade).toBe('above');
        expect(q.drawables[0].style).toBe('dashed'); // strict
        expect(q.drawables[0].domain).toEqual({ min: 0, minStyle: 'closed' });
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

describe('pedagogical block fences (objectives / worked / faded / explain)', () => {
    it('```objectives → a titled learning-objectives list', () => {
        const md = '```objectives\ntitle: Today\'s goals\nSolve two-step equations\n- Graph a line\n```';
        const out = blocks(md);
        expect(out).toEqual([
            {
                type: 'learningObjectives',
                attrs: { title: 'Today\'s goals' },
                content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Solve two-step equations' }] },
                    { type: 'paragraph', content: [{ type: 'text', text: 'Graph a line' }] },
                ],
            },
        ]);
    });

    it('```objectives defaults the title and survives the schema round-trip', () => {
        const md = '```objectives\nUnderstand slope\n```';
        expect(blocks(md)[0]).toMatchObject({
            type: 'learningObjectives',
            attrs: { title: 'Learning objectives' },
        });
        expect(roundTrip(md)[0]).toMatchObject({ type: 'learningObjectives' });
    });

    it('```explain → an ungraded self-explanation with an optional starter', () => {
        const md = '```explain\nWhy did you subtract 3?\nstarter: I subtracted 3 because…\n```';
        expect(blocks(md)).toEqual([
            {
                type: 'selfExplanation',
                attrs: { placeholder: 'I subtracted 3 because…' },
                content: [{ type: 'text', text: 'Why did you subtract 3?' }],
            },
        ]);
        expect(roundTrip(md)[0]).toMatchObject({ type: 'selfExplanation' });
    });

    it('```worked → one block per line; a $$…$$ line becomes block math', () => {
        const md = '```worked\ntitle: Solve it\nSubtract 3.\n$$2x = 8$$\n```';
        expect(blocks(md)).toEqual([
            {
                type: 'workedExample',
                attrs: { title: 'Solve it' },
                content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Subtract 3.' }] },
                    { type: 'mathBlock', attrs: { latex: '2x = 8' } },
                ],
            },
        ]);
        expect(roundTrip(md)[0]).toMatchObject({ type: 'workedExample' });
    });

    it('```worked keeps {{…}} literal (the example shows the answer)', () => {
        const md = '```worked\nx = {{4}} after dividing\n```';
        const we = blocks(md)[0]!;
        expect(we.type).toBe('workedExample');
        expect(we.content).toEqual([
            { type: 'paragraph', content: [{ type: 'text', text: 'x = {{4}} after dividing' }] },
        ]);
    });

    it('```faded → a {{blank}} line becomes a fill-in step; other lines are shown', () => {
        const md = '```faded\nSubtract 3.\n$$2x = 8$$\nx = {{4}}\n```';
        const fwe = blocks(md)[0]!;
        expect(fwe.type).toBe('fadedWorkedExample');
        expect(fwe.attrs).toMatchObject({ title: 'Guided practice' });
        expect(fwe.content!.map((c) => c.type)).toEqual([
            'paragraph',
            'mathBlock',
            'fillInBlank',
        ]);
        expect(roundTrip(md)[0]).toMatchObject({ type: 'fadedWorkedExample' });
    });

    it('an empty fence degrades to plain text with a warning', () => {
        const res = convert('```worked\n```');
        expect(res.blocks.every((b) => b.type !== 'workedExample')).toBe(true);
        expect(res.warnings.length).toBeGreaterThan(0);
    });
});

describe('graded free-text fences (```shortanswer / ```essay)', () => {
    type Criteria = Array<Record<string, unknown>>;
    const criteriaOf = (node: JSONContent): Criteria =>
        (node.attrs!.rubric as { criteria: Criteria }).criteria;

    it('```shortanswer → a graded short-answer with a pipe rubric', () => {
        const md =
            '```shortanswer\nprompt: Explain the idea.\nstarter: Because…\nrubric: Reasoning | 3 | Names the rule\nrubric: Clarity | 2\n```';
        const sa = blocks(md)[0]!;
        expect(sa.type).toBe('shortAnswer');
        expect(sa.attrs).toMatchObject({ placeholder: 'Because…' });
        expect(sa.content).toEqual([{ type: 'text', text: 'Explain the idea.' }]);
        const criteria = criteriaOf(sa);
        expect(criteria).toHaveLength(2);
        expect(criteria[0]).toMatchObject({
            label: 'Reasoning',
            maxPoints: 3,
            description: 'Names the rule',
        });
        expect(criteria[0]!.id).toEqual(expect.any(String));
        expect(criteria[1]).toMatchObject({ label: 'Clarity', maxPoints: 2 });
        expect(criteria[1]).not.toHaveProperty('description');
    });

    it('a short-answer rubric survives the schema round-trip', () => {
        const md = '```shortanswer\nprompt: Q\nrubric: Reasoning | 3\n```';
        const sa = roundTrip(md)[0]!;
        expect(sa.type).toBe('shortAnswer');
        expect(criteriaOf(sa)[0]).toMatchObject({ label: 'Reasoning', maxPoints: 3 });
    });

    it('```shortanswer with no rubric leaves rubric null', () => {
        const sa = blocks('```shortanswer\nprompt: Just answer.\n```')[0]!;
        expect(sa.type).toBe('shortAnswer');
        expect(sa.attrs!.rubric).toBeNull();
    });

    it('a bad rubric line is skipped with a warning; the block still imports', () => {
        const res = convert(
            '```shortanswer\nprompt: Q\nrubric: | 3\nrubric: Good | 2\n```',
        );
        const sa = res.blocks[0]!;
        expect(sa.type).toBe('shortAnswer');
        expect(criteriaOf(sa)).toHaveLength(1);
        expect(res.warnings.some((w) => /rubric/i.test(w))).toBe(true);
    });

    it('a rubric with non-numeric points is skipped', () => {
        const res = convert('```shortanswer\nprompt: Q\nrubric: Reasoning | lots\n```');
        expect(res.blocks[0]!.attrs!.rubric).toBeNull();
        expect(res.warnings.some((w) => /rubric/i.test(w))).toBe(true);
    });

    it('```essay → a graded essay with a words range and rubric', () => {
        const md = '```essay\nprompt: Argue it.\nwords: 200-300\nrubric: Thesis | 3\n```';
        const essay = blocks(md)[0]!;
        expect(essay.type).toBe('essay');
        expect(essay.attrs).toMatchObject({ wordMin: 200, wordMax: 300 });
        expect(criteriaOf(essay)).toHaveLength(1);
        expect(roundTrip(md)[0]).toMatchObject({ type: 'essay' });
    });

    it('essay words: accepts an open-ended range (min only / max only)', () => {
        expect(blocks('```essay\nprompt: Q\nwords: 200-\n```')[0]!.attrs).toMatchObject(
            { wordMin: 200, wordMax: null },
        );
        expect(blocks('```essay\nprompt: Q\nwords: -300\n```')[0]!.attrs).toMatchObject(
            { wordMin: null, wordMax: 300 },
        );
    });

    it('an inverted essay words range is dropped with a warning', () => {
        const res = convert('```essay\nprompt: Q\nwords: 300-200\n```');
        expect(res.blocks[0]!.attrs).toMatchObject({ wordMin: null, wordMax: null });
        expect(res.warnings.some((w) => /words/i.test(w))).toBe(true);
    });

    it('a words: line inside a shortanswer is ignored with a warning', () => {
        const res = convert('```shortanswer\nprompt: Q\nwords: 200-300\n```');
        expect(res.blocks[0]!.type).toBe('shortAnswer');
        expect(res.warnings.some((w) => /word-count|words/i.test(w))).toBe(true);
    });

    it('a graded free-text fence with no prompt degrades to plain text', () => {
        const res = convert('```essay\nrubric: Thesis | 3\n```');
        expect(res.blocks.every((b) => b.type !== 'essay')).toBe(true);
        expect(res.warnings.length).toBeGreaterThan(0);
    });
});
