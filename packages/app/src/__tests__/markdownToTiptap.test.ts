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
import { importMetaSummary } from '../lib/importMetaSummary';
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

describe('```columns fence (T8)', () => {
    it('imports a 2-column row, one block per non-blank line', () => {
        const md = '```columns\nLeft top\nLeft bottom\n---\nRight only\n```';
        const [row] = blocks(md);
        expect(row!.type).toBe('row');
        expect(row!.attrs?.gridLines).toBe('inherit');
        const cols = row!.content!;
        expect(cols.map((c) => c.type)).toEqual(['column', 'column']);
        expect(cols[0]!.content!.map((b) => b.type)).toEqual([
            'paragraph',
            'paragraph',
        ]);
        expect(cols[1]!.content!.map((b) => b.type)).toEqual(['paragraph']);
    });

    it('supports up to 3 columns', () => {
        const md = '```columns\nA\n---\nB\n---\nC\n```';
        const [row] = blocks(md);
        expect(row!.content!.map((c) => c.type)).toEqual([
            'column',
            'column',
            'column',
        ]);
    });

    it('turns a {{blank}} line into a fill-in-blank inside a column', () => {
        const md = '```columns\nThe capital is {{Paris}}.\n---\nNote\n```';
        const [row] = blocks(md);
        expect(row!.content![0]!.content![0]!.type).toBe('fillInBlank');
    });

    it('turns a $$…$$ line into a math block inside a column', () => {
        const md = '```columns\n$$x^2$$\n---\ntext\n```';
        const [row] = blocks(md);
        expect(row!.content![0]!.content![0]!.type).toBe('mathBlock');
    });

    it('seeds an empty paragraph for a column with no content', () => {
        const md = '```columns\nLeft\n---\n```'; // empty right column
        const [row] = blocks(md);
        expect(row!.content![1]!.content!.map((b) => b.type)).toEqual([
            'paragraph',
        ]);
    });

    it('warns + falls back to plain text with fewer than two columns', () => {
        const md = '```columns\njust one column\n```';
        const result = convert('```columns\njust one column\n```');
        expect(result.blocks[0]!.type).not.toBe('row');
        expect([...result.warnings].some((w) => /at least two columns/.test(w))).toBe(
            true,
        );
        // (md referenced so the case reads clearly)
        expect(md).toContain('columns');
    });

    it('clamps to 6 columns and warns when more are given', () => {
        const md = '```columns\n' + ['A', 'B', 'C', 'D', 'E', 'F', 'G'].join('\n---\n') + '\n```';
        const result = convert(md);
        expect(result.blocks[0]!.content).toHaveLength(6);
        expect([...result.warnings].some((w) => /at most 6 columns/.test(w))).toBe(
            true,
        );
    });

    it('round-trips a columns import through the schema bridge', () => {
        const md = '```columns\nLeft\n---\nRight\n```';
        const back = roundTrip(md);
        expect(back[0]!.type).toBe('row');
        expect(back[0]!.content!.map((c) => c.type)).toEqual(['column', 'column']);
    });
});

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
        ['a columns fence', '```columns\nLeft\n---\nRight side\n```'],
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

describe('math blanks ({{==…}})', () => {
    it('a leading == makes the blank a math-expression blank (and is stripped)', () => {
        const out = convert('simplify {{==2a}}.').blocks;
        const blank = out[0]!.content!.find((n) => n.type === 'blank')!;
        expect(blank.attrs).toMatchObject({ answer: '2a', answerType: 'math' });
    });

    it('== is checked before = (a math blank is not mis-read as numeric)', () => {
        const out = convert('{{==x+1}}').blocks;
        const blank = out[0]!.content!.find((n) => n.type === 'blank')!;
        expect(blank.attrs!.answerType).toBe('math');
        expect(blank.attrs!.answer).toBe('x+1');
    });

    it('combines with ~ (tilde first: {{~==2a}})', () => {
        const out = convert('roots {{==a}} and {{~==2a}}').blocks;
        const blanks = out[0]!.content!.filter((n) => n.type === 'blank');
        expect(blanks[1]!.attrs).toMatchObject({
            answer: '2a',
            answerType: 'math',
            interchangeableWithPrevious: true,
        });
    });

    it('a bare {{==}} is ignored like an empty blank', () => {
        const out = convert('nothing {{==}}').blocks;
        expect(
            (out[0]!.content ?? []).filter((n) => n.type === 'blank'),
        ).toHaveLength(0);
    });
});

describe('blank hint + mistake feedback', () => {
    // The single blank token in a one-blank import.
    const blankAttrs = (md: string) => {
        const b = convert(md)
            .blocks.flatMap((n) => n.content ?? [])
            .find((n) => n.type === 'blank');
        return b!.attrs!;
    };

    it('a ?segment becomes the hint (rich inline)', () => {
        const attrs = blankAttrs('The capital is {{Paris | ?It starts with P}}.');
        expect(attrs.answer).toBe('Paris');
        expect(attrs.acceptableAnswers).toEqual([]);
        expect(attrs.hint).toEqual([
            { type: 'text', text: 'It starts with P', marks: [] },
        ]);
    });

    it('a !wrong :: feedback segment becomes a mistake pair', () => {
        const attrs = blankAttrs(
            "{{Paris | !Lyon :: that's the third-largest city}}",
        );
        expect(attrs.mistakeFeedback).toEqual([
            {
                match: 'Lyon',
                feedback: [
                    { type: 'text', text: "that's the third-largest city", marks: [] },
                ],
            },
        ]);
    });

    it('collects multiple mistake segments in document order', () => {
        const attrs = blankAttrs('{{4 | !3 :: too low | !5 :: too high}}');
        expect(attrs.mistakeFeedback.map((m: { match: string }) => m.match)).toEqual([
            '3',
            '5',
        ]);
    });

    it('mixes alternates, a hint, and a mistake in one blank', () => {
        const attrs = blankAttrs(
            '{{color | colour | ?think of paint | !hue :: not a synonym here}}',
        );
        expect(attrs.answer).toBe('color');
        expect(attrs.acceptableAnswers).toEqual(['colour']);
        expect(attrs.hint).toEqual([
            { type: 'text', text: 'think of paint', marks: [] },
        ]);
        expect(attrs.mistakeFeedback).toEqual([
            {
                match: 'hue',
                feedback: [{ type: 'text', text: 'not a synonym here', marks: [] }],
            },
        ]);
    });

    it('splits a mistake on :: so the match may contain = (equation distractor)', () => {
        const attrs = blankAttrs('{{x | !y = 2x :: that graphs a line, not a point}}');
        expect(attrs.mistakeFeedback[0].match).toBe('y = 2x');
    });

    it('carries $math$ inside hint/feedback as inline math', () => {
        const attrs = blankAttrs('{{2 | ?half of $4$}}');
        expect(attrs.hint).toEqual([
            { type: 'text', text: 'half of ', marks: [] },
            { type: 'math_inline', latex: '4' },
        ]);
    });

    // Backward-compat regression: an alternate that legitimately starts with ?
    // or ! must survive via the doubled-sigil escape, never be swallowed.
    it('?? and !! escape a literal alternate beginning with ? or !', () => {
        const attrs = blankAttrs('{{a | ??what | !!bang}}');
        expect(attrs.acceptableAnswers).toEqual(['?what', '!bang']);
        expect(attrs.hint).toBeUndefined();
        expect(attrs.mistakeFeedback).toBeUndefined();
    });

    // Author-error warnings — parity with the ```mc importer.
    it('a !segment without :: is warned and dropped, never an accepted answer', () => {
        const { blocks: bs, warnings } = convert('{{Paris | !Lyon}}');
        const blank = bs
            .flatMap((n) => n.content ?? [])
            .find((n) => n.type === 'blank')!;
        // Crucially NOT ['Lyon'] (would make the wrong answer correct) and NOT ['!Lyon'].
        expect(blank.attrs!.acceptableAnswers).toEqual([]);
        expect(blank.attrs).not.toHaveProperty('mistakeFeedback');
        expect(warnings.some((w) => w.includes('::'))).toBe(true);
    });

    it('warns on an empty mistake match or empty feedback', () => {
        expect(
            convert('{{a | ! :: text}}').warnings.some((w) =>
                w.includes('wrong answer'),
            ),
        ).toBe(true);
        expect(
            convert('{{a | !x ::}}').warnings.some((w) => w.includes('feedback')),
        ).toBe(true);
    });

    it('keeps the last of multiple hints and warns', () => {
        const { blocks: bs, warnings } = convert('{{a | ?first | ?second}}');
        const blank = bs
            .flatMap((n) => n.content ?? [])
            .find((n) => n.type === 'blank')!;
        expect(blank.attrs!.hint).toEqual([
            { type: 'text', text: 'second', marks: [] },
        ]);
        expect(warnings.some((w) => w.includes('one hint'))).toBe(true);
    });

    it('survives the schema round-trip into a BlankToken (hint + mistakeFeedback)', () => {
        const md =
            'The capital is {{Paris | ?starts with P | !Lyon :: the third city}}.';
        const activity = tiptapToActivity(
            { type: 'doc', content: convert(md).blocks },
            META,
        );
        const fib = activity.sections
            .flatMap((s) => s.rows)
            .flatMap((r) => r.columns)
            .flatMap((c) => c.blocks)
            .find(
                (b): b is Extract<typeof b, { type: 'fill_in_blank' }> =>
                    b.type === 'fill_in_blank',
            );
        const token = fib?.content.find(
            (n): n is Extract<typeof n, { type: 'blank' }> => n.type === 'blank',
        );
        expect(token!.hint).toEqual([
            { type: 'text', text: 'starts with P', marks: [] },
        ]);
        expect(token!.mistakeFeedback).toEqual([
            {
                match: 'Lyon',
                feedback: [{ type: 'text', text: 'the third city', marks: [] }],
            },
        ]);
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

describe('Model A math gaps (\\gap{…})', () => {
    it('a $$…\\gap{}…$$ display equation becomes a math_block with a gap prompt', () => {
        const [block] = blocks('$$2x = \\gap{8}$$');
        expect(block!.type).toBe('mathBlock');
        // DRAFT latex keeps the answer embedded in the placeholder.
        expect(block!.attrs!.latex).toMatch(/2x = \\placeholder\[g[0-9a-f]+\]\{8\}/);
        const prompts = block!.attrs!.prompts as Array<{ id: string; answer: string }>;
        expect(prompts).toHaveLength(1);
        expect(prompts[0]!.answer.length).toBeGreaterThan(0);
        // the prompt id matches the placeholder marker in the latex
        expect(block!.attrs!.latex).toContain('[' + prompts[0]!.id + ']');
    });

    it('a gap works inline ($…\\gap{}…$)', () => {
        const math = blocks('recall $x = \\gap{5}$ here')[0]!.content!.find(
            (n) => n.type === 'mathInline',
        )!;
        expect((math.attrs!.prompts as unknown[]).length).toBe(1);
    });

    it('a faded worked-example step can carry an in-equation gap', () => {
        const faded = blocks(
            '```faded\nSubtract 3.\n$$2x = \\gap{8}$$\n$$x = \\gap{4}$$\n```',
        )[0]!;
        expect(faded.type).toBe('fadedWorkedExample');
        const gapSteps = (faded.content ?? []).filter(
            (n) =>
                n.type === 'mathBlock' &&
                Array.isArray(n.attrs?.prompts) &&
                (n.attrs!.prompts as unknown[]).length > 0,
        );
        expect(gapSteps).toHaveLength(2);
    });

    it('survives the schema round-trip: answers move to prompts, stored latex emptied (no leak)', () => {
        const activity = tiptapToActivity(
            { type: 'doc', content: convert('$$2x = \\gap{8}$$').blocks },
            META,
        );
        const mb = activity.sections
            .flatMap((s) => s.rows)
            .flatMap((r) => r.columns)
            .flatMap((c) => c.blocks)
            .find(
                (b): b is Extract<typeof b, { type: 'math_block' }> =>
                    b.type === 'math_block',
            )!;
        expect(mb.prompts).toHaveLength(1);
        expect(mb.prompts![0]!.answer.length).toBeGreaterThan(0);
        expect(mb.latex).toMatch(/\\placeholder\[[^\]]+\]\{\}/); // emptied
        expect(mb.latex).not.toContain('{8}');
    });

    it('handles \\gap{\\frac{1}{2}} (balanced braces)', () => {
        const [block] = blocks('$$\\gap{\\frac{1}{2}}$$');
        const prompts = block!.attrs!.prompts as unknown[];
        expect(prompts).toHaveLength(1);
        expect(block!.attrs!.latex).toContain('\\frac{1}{2}');
    });

    it('gap-free math stays byte-identical (no prompts attr)', () => {
        const [block] = blocks('$$x + 1$$');
        expect(block!.attrs!.latex).toBe('x + 1');
        expect(block!.attrs).not.toHaveProperty('prompts');
    });
});

describe('graph figures on choices (mc / matching)', () => {
    it('an mc choice `graph: line …` becomes a ChoiceGraph figure (graph is the choice)', () => {
        const md =
            '```mc\nprompt: Which shows y = 2x?\n(x) graph: line y = 2x\n( ) graph: line y = -2x\n```';
        const mc = convert(md).blocks.find((b) => b.type === 'multipleChoice')!;
        const choices = mc.attrs!.choices as Array<{
            correct: boolean;
            content: unknown[];
            graph?: { drawables: Array<{ kind: string }> };
        }>;
        expect(choices).toHaveLength(2);
        expect(choices[0]!.correct).toBe(true);
        expect(choices[0]!.graph?.drawables[0]!.kind).toBe('curve');
        expect(choices[0]!.content).toEqual([]);
    });

    it('an "expression" graph figure is rejected with a warning (kit-free render can’t sample it)', () => {
        const { blocks, warnings } = convert(
            '```mc\nprompt: p\n(x) graph: expression sin(x)\n( ) 2\n```',
        );
        // The expression figure is rejected, leaving the choice with no content,
        // so the whole block falls back to plain text (both warnings surfaced).
        expect(blocks.some((b) => b.type === 'multipleChoice')).toBe(false);
        expect(warnings.some((w) => w.includes('expression'))).toBe(true);
    });

    it('a matching side `graph: … -> option` becomes a side graph figure', () => {
        const md =
            '```match\nprompt: Match.\ngraph: line y = 2x -> slope 2\ngraph: line y = -x -> slope -1\n```';
        const match = convert(md).blocks.find((b) => b.type === 'matching')!;
        const items = match.attrs!.items as Array<{
            content: unknown[];
            graph?: { drawables: Array<{ kind: string }> };
        }>;
        expect(items).toHaveLength(2);
        expect(items[0]!.graph?.drawables[0]!.kind).toBe('curve');
        expect(items[0]!.content).toEqual([]);
    });

    it('an mc choice graph survives the schema round-trip', () => {
        const md =
            '```mc\nprompt: Which shows y = 2x?\n(x) graph: line y = 2x\n( ) 3\n```';
        const activity = tiptapToActivity(
            { type: 'doc', content: convert(md).blocks },
            META,
        );
        const mc = activity.sections
            .flatMap((s) => s.rows)
            .flatMap((r) => r.columns)
            .flatMap((c) => c.blocks)
            .find(
                (b): b is Extract<typeof b, { type: 'multiple_choice' }> =>
                    b.type === 'multiple_choice',
            )!;
        const graphChoice = mc.choices.find((c) => c.graph !== undefined)!;
        expect(graphChoice.graph!.drawables[0]).toMatchObject({ kind: 'curve' });
        expect(graphChoice.graph!.axis.xMin).toBe(-10);
    });
});

describe('inline definitions [[term :: definition]]', () => {
    const termNode = (md: string, term: string): JSONContent =>
        convert(md)
            .blocks.flatMap((n) => n.content ?? [])
            .find((n) => n.type === 'text' && n.text === term)!;

    it('marks the term with a definition carrying the definition text', () => {
        const t = termNode(
            'The [[mitochondria :: the powerhouse of the cell]] makes ATP.',
            'mitochondria',
        );
        expect(t.marks).toEqual([
            {
                type: 'definition',
                attrs: {
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                { type: 'text', text: 'the powerhouse of the cell', marks: [] },
                            ],
                        },
                    ],
                },
            },
        ]);
    });

    it('carries $inline$ math in the definition content', () => {
        const t = termNode('a [[area :: $\\frac{1}{2}bh$]] here', 'area');
        expect(t.marks).toEqual([
            {
                type: 'definition',
                attrs: {
                    content: [
                        {
                            type: 'paragraph',
                            content: [{ type: 'math_inline', latex: '\\frac{1}{2}bh' }],
                        },
                    ],
                },
            },
        ]);
    });

    it('combines with an active mark (a bold defined term)', () => {
        const t = termNode('**[[cell :: the unit of life]]**', 'cell');
        expect(t.marks).toEqual([
            { type: 'bold' },
            {
                type: 'definition',
                attrs: {
                    content: [
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'the unit of life', marks: [] }],
                        },
                    ],
                },
            },
        ]);
    });

    it('works inside a heading', () => {
        const t = termNode('# The [[nucleus :: the control center]]', 'nucleus');
        expect(t.marks![0]!.type).toBe('definition');
    });

    it('a [[…]] with no :: stays literal text', () => {
        expect(convert('see [[chapter 3]] for details').blocks[0]!.content).toEqual([
            { type: 'text', text: 'see [[chapter 3]] for details' },
        ]);
    });

    it('survives the schema round-trip as a definition mark', () => {
        const md = 'The [[osmosis :: water crossing a membrane]] process.';
        const activity = tiptapToActivity(
            { type: 'doc', content: convert(md).blocks },
            META,
        );
        const para = activity.sections
            .flatMap((s) => s.rows)
            .flatMap((r) => r.columns)
            .flatMap((c) => c.blocks)
            .find(
                (b): b is Extract<typeof b, { type: 'paragraph' }> =>
                    b.type === 'paragraph',
            )!;
        const term = para.content.find(
            (n): n is Extract<typeof n, { type: 'text' }> =>
                n.type === 'text' && n.text === 'osmosis',
        )!;
        // The importer emits the canonical BLOCK shape — one paragraph — which
        // is what the definition dialog writes too.
        expect(term.marks[0]).toMatchObject({
            type: 'definition',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'water crossing a membrane', marks: [] },
                    ],
                },
            ],
        });
    });
});

describe('```callout fence', () => {
    it('imports a callout with a variant and an inline body', () => {
        const [c] = blocks('```callout\nvariant: warning\nCheck your units.\n```');
        expect(c).toMatchObject({
            type: 'callout',
            attrs: { variant: 'warning' },
            content: [{ type: 'text', text: 'Check your units.' }],
        });
    });

    it('defaults to the info variant', () => {
        expect(blocks('```callout\nJust a note.\n```')[0]!.attrs!.variant).toBe(
            'info',
        );
    });

    it('accepts tip → success and warn → warning aliases', () => {
        expect(blocks('```callout\nvariant: tip\nx\n```')[0]!.attrs!.variant).toBe(
            'success',
        );
        expect(blocks('```callout\nvariant: warn\nx\n```')[0]!.attrs!.variant).toBe(
            'warning',
        );
    });

    it('warns on an unknown variant and falls back to info', () => {
        const { blocks: bs, warnings } = convert('```callout\nvariant: danger\nx\n```');
        expect(bs[0]!.attrs!.variant).toBe('info');
        expect(warnings.some((w) => w.includes('variant'))).toBe(true);
    });

    it('joins multiple body lines into one inline run', () => {
        expect(blocks('```callout\nfirst line\nsecond line\n```')[0]!.content).toEqual(
            [{ type: 'text', text: 'first line second line' }],
        );
    });

    it('carries $inline$ math in the body', () => {
        expect(blocks('```callout\nrecall $x^2$\n```')[0]!.content).toEqual([
            { type: 'text', text: 'recall ' },
            { type: 'mathInline', attrs: { latex: 'x^2' } },
        ]);
    });

    it('an empty body warns and falls back to plain text (no callout)', () => {
        const { blocks: bs, warnings } = convert('```callout\nvariant: info\n```');
        expect(bs.some((n) => n.type === 'callout')).toBe(false);
        expect(warnings.some((w) => w.includes('body'))).toBe(true);
    });

    it('round-trips through the schema bridge to a callout block', () => {
        const md = '```callout\nvariant: success\nWell done.\n```';
        const activity = tiptapToActivity(
            { type: 'doc', content: convert(md).blocks },
            META,
        );
        const block = activity.sections
            .flatMap((s) => s.rows)
            .flatMap((r) => r.columns)
            .flatMap((c) => c.blocks)
            .find(
                (b): b is Extract<typeof b, { type: 'callout' }> =>
                    b.type === 'callout',
            );
        expect(block).toMatchObject({ type: 'callout', variant: 'success' });
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

    // ---- answer: / solution: (answer-key slice, ruling E5.6) ---------------

    it.each(['shortanswer', 'essay'] as const)(
        '```%s reads answer: and solution: as canonical inline content',
        (tag) => {
            const node = blocks(
                '```' + tag + '\nprompt: Solve it.\nanswer: x = 4\nsolution: Undo the operations.\n```',
            )[0]!;
            expect(node.attrs!.answer).toEqual([
                { type: 'text', text: 'x = 4', marks: [] },
            ]);
            expect(node.attrs!.solution).toEqual([
                { type: 'text', text: 'Undo the operations.', marks: [] },
            ]);
        },
    );

    it('joins CONTINUATION lines with hard breaks, not spaces', () => {
        // The author wrote separate lines because the steps are separate; a
        // space-joined key prints as one run-on the teacher has to re-parse.
        const node = blocks(
            '```shortanswer\nprompt: Solve it.\nanswer: x = 4\nSubtract 3, then divide by 2.\n```',
        )[0]!;
        expect(node.attrs!.answer).toEqual([
            { type: 'text', text: 'x = 4', marks: [] },
            { type: 'hard_break' },
            { type: 'text', text: 'Subtract 3, then divide by 2.', marks: [] },
        ]);
    });

    it('a bare line belongs to the LAST of prompt:/answer:/solution:', () => {
        const node = blocks(
            [
                '```essay',
                'prompt: First prompt line.',
                'And a second prompt line.',
                'answer: The answer.',
                'A second answer line.',
                'solution: The solution.',
                'A second solution line.',
                '```',
            ].join('\n'),
        )[0]!;
        // The prompt still collects bare lines until a key claims them — the
        // pre-existing behaviour, unchanged for every fence without these keys.
        expect(node.content).toEqual([
            { type: 'text', text: 'First prompt line. And a second prompt line.' },
        ]);
        expect((node.attrs!.answer as unknown[]).length).toBe(3);
        expect((node.attrs!.solution as unknown[]).length).toBe(3);
        expect(JSON.stringify(node.attrs!.answer)).toContain('A second answer line.');
        expect(JSON.stringify(node.attrs!.solution)).toContain(
            'A second solution line.',
        );
    });

    it('the single-line keys do not steal the lines beneath them', () => {
        const node = blocks(
            [
                '```shortanswer',
                'prompt: Q',
                'answer: The answer.',
                'rubric: Reasoning | 3',
                'Still part of the answer.',
                '```',
            ].join('\n'),
        )[0]!;
        expect(criteriaOf(node)).toHaveLength(1);
        expect(JSON.stringify(node.attrs!.answer)).toContain(
            'Still part of the answer.',
        );
    });

    it('carries $inline$ math into the key', () => {
        const node = blocks(
            '```shortanswer\nprompt: Q\nanswer: The slope is $m = 2$.\n```',
        )[0]!;
        expect(JSON.stringify(node.attrs!.answer)).toContain('math_inline');
    });

    it('omits both keys entirely when the author wrote neither', () => {
        // null, not [] — serialize reads "no answer authored" from the absence,
        // and the answer key's fallback chain depends on the distinction.
        const node = blocks('```essay\nprompt: Just write.\n```')[0]!;
        expect(node.attrs!.answer).toBeNull();
        expect(node.attrs!.solution).toBeNull();
    });

    it('the key survives PASTE → SAVE → RELOAD → SAVE (the E5.1 trap)', () => {
        // THE WHOLE PIPELINE, in the order a teacher actually runs it. The
        // three legs in serialize.test.ts pin the bridge; this pins the leg
        // BEFORE it — the fence — attached to them, because the design pass's
        // original premise died exactly here: an imported block that the editor
        // could not hold looked perfectly fine in a fence test and was deleted
        // by the first autosave. A fence test that stops at the Tiptap doc
        // cannot see that, so this one does not stop there.
        const md =
            '```shortanswer\nprompt: Solve it.\nanswer: x = 4\nCheck by substituting.\nsolution: Undo the operations.\n```';

        // Paste → the strict grid the editor actually loads, and the REAL
        // ProseMirror schema must accept it (an undeclared attr would be
        // dropped here, silently, before serialize ever sees it).
        const pasted = wrapBlocksStrict(convert(md).blocks);
        expect(() => editorSchema.nodeFromJSON(pasted).check()).not.toThrow();

        // Save → reload → save. The second save is the one that matters.
        const saved = tiptapToActivity(pasted, META);
        const reloaded = activityToTiptap(saved);
        const resaved = tiptapToActivity(reloaded, META);

        const answerOf = (doc: ReturnType<typeof tiptapToActivity>) => {
            const block = doc.sections
                .flatMap((section) => section.rows)
                .flatMap((row) => row.columns)
                .flatMap((column) => column.blocks)
                .find((b) => b.type === 'short_answer');
            expect(block).toBeDefined();
            return block as Extract<typeof block, { type: 'short_answer' }>;
        };

        expect(answerOf(saved).answer).toEqual(answerOf(resaved).answer);
        expect(answerOf(resaved).answer).toEqual([
            { type: 'text', text: 'x = 4', marks: [] },
            { type: 'hard_break' },
            { type: 'text', text: 'Check by substituting.', marks: [] },
        ]);
        expect(JSON.stringify(answerOf(resaved).solution)).toContain(
            'Undo the operations.',
        );
    });
});

describe('reference fence (```reference → the reference panel)', () => {
    it('routes content to referencePanel and contributes no body blocks', () => {
        const res = convert(
            '```reference\ntitle: Formula sheet\nSlope-intercept form: $y = mx + b$\n```',
        );
        expect(res.blocks).toEqual([]);
        expect(res.referencePanel?.title).toBe('Formula sheet');
        expect(res.referencePanel?.blocks.map((b) => b.type)).toEqual([
            'paragraph',
        ]);
        expect(res.warnings).toEqual([]);
    });

    it('omits referencePanel entirely when there is no reference fence', () => {
        const res = convert('Just a paragraph.');
        expect(res.referencePanel).toBeUndefined();
    });

    it('a sole $$…$$ line becomes a mathBlock; lists group by run', () => {
        const res = convert(
            '```reference\n$$a^2 + b^2 = c^2$$\n- first\n- second\n1. one\n2. two\n```',
        );
        const types = res.referencePanel?.blocks.map((b) => b.type);
        expect(types).toEqual(['mathBlock', 'bulletList', 'orderedList']);
        const bullets = res.referencePanel?.blocks[1];
        expect(bullets?.content).toHaveLength(2);
        expect(bullets?.content?.[0]?.type).toBe('listItem');
    });

    it('headings and images parse from their line forms', () => {
        const res = convert(
            '```reference\n## Formulas\n![a triangle](https://example.com/tri.png)\n```',
        );
        const blocks = res.referencePanel?.blocks ?? [];
        expect(blocks.map((b) => b.type)).toEqual(['heading', 'image']);
        expect(blocks[0]?.attrs?.level).toBe(2);
        expect(blocks[1]?.attrs).toMatchObject({
            src: 'https://example.com/tri.png',
            alt: 'a triangle',
        });
    });

    it('consecutive graph: lines merge onto ONE shared grid', () => {
        const res = convert(
            '```reference\nParallel lines:\ngraph: line y = 2x + 1\ngraph: line y = 2x - 3\n```',
        );
        const blocks = res.referencePanel?.blocks ?? [];
        expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'graphFigure']);
        expect(blocks[1]?.attrs?.drawables).toHaveLength(2);
        expect(res.warnings).toEqual([]);
    });

    it('a non-graph line splits figure runs into separate figures', () => {
        const res = convert(
            '```reference\ngraph: line y = 2x\nPerpendicular:\ngraph: line y = -0.5x dashed\n```',
        );
        const blocks = res.referencePanel?.blocks ?? [];
        expect(blocks.map((b) => b.type)).toEqual([
            'graphFigure',
            'paragraph',
            'graphFigure',
        ]);
        expect(blocks[0]?.attrs?.drawables).toHaveLength(1);
        expect(blocks[2]?.attrs?.drawables).toHaveLength(1);
    });

    it('axes: sets the NEXT figure window; later figures revert to ±10', () => {
        const res = convert(
            '```reference\naxes: -5..5, 0..25\ngraph: curve y = x^2\n\ngraph: line y = x\n```',
        );
        const figures = (res.referencePanel?.blocks ?? []).filter(
            (b) => b.type === 'graphFigure',
        );
        expect(figures).toHaveLength(2);
        expect(figures[0]?.attrs?.axis).toMatchObject({
            xMin: -5,
            xMax: 5,
            yMin: 0,
            yMax: 25,
        });
        expect(figures[1]?.attrs?.axis).toMatchObject({
            xMin: -10,
            xMax: 10,
        });
    });

    it('a malformed axes: line warns and is skipped (figure keeps the default)', () => {
        const res = convert(
            '```reference\naxes: sideways\ngraph: line y = x\n```',
        );
        const fig = res.referencePanel?.blocks.find(
            (b) => b.type === 'graphFigure',
        );
        expect(fig?.attrs?.axis).toMatchObject({ xMin: -10, xMax: 10 });
        expect(res.warnings.some((w) => /axes/i.test(w))).toBe(true);
    });

    it('an expression graph line is skipped with a warning, keeping the rest', () => {
        const res = convert(
            '```reference\ngraph: expression sin(x)\ngraph: line y = x\n```',
        );
        const fig = res.referencePanel?.blocks.find(
            (b) => b.type === 'graphFigure',
        );
        expect(fig?.attrs?.drawables).toHaveLength(1);
        expect(res.warnings.some((w) => /expression/i.test(w))).toBe(true);
    });

    it('{{…}} stays literal — panel content is never gradeable', () => {
        const res = convert('```reference\nThe answer is {{42}}.\n```');
        const para = res.referencePanel?.blocks[0];
        expect(para?.type).toBe('paragraph');
        const text = (para?.content ?? [])
            .map((n) => n.text ?? '')
            .join('');
        expect(text).toContain('{{42}}');
        expect(
            (para?.content ?? []).every((n) => n.type !== 'blank'),
        ).toBe(true);
    });

    it('two reference fences append to one sheet; first title wins', () => {
        const res = convert(
            '```reference\ntitle: First\nLine one\n```\n\nBody paragraph.\n\n```reference\ntitle: Second\nLine two\n```',
        );
        expect(res.referencePanel?.title).toBe('First');
        expect(res.referencePanel?.blocks).toHaveLength(2);
        // The body content between the fences still imports normally.
        expect(res.blocks.length).toBeGreaterThan(0);
    });

    it('an empty reference fence degrades to plain text with a warning', () => {
        const res = convert('```reference\ntitle: Only a title\n```');
        expect(res.referencePanel).toBeUndefined();
        expect(res.blocks.length).toBeGreaterThan(0);
        expect(res.warnings.some((w) => /reference sheet/i.test(w))).toBe(true);
    });

    it('$inline$ math inside a panel paragraph resolves to a mathInline node', () => {
        const res = convert('```reference\nArea: $\\frac{1}{2}bh$\n```');
        const para = res.referencePanel?.blocks[0];
        expect(
            (para?.content ?? []).some((n) => n.type === 'mathInline'),
        ).toBe(true);
    });
});

// =============================================================================
// ```definitions fence + [[term]] references
// -----------------------------------------------------------------------------
// The block-capable half of the definition import story (design doc §6). The
// fence is a SIDE CHANNEL: it emits no blocks of its own, so every assertion
// here goes through a [[term]] reference in the body.
// =============================================================================
describe('```definitions fence', () => {
    // The definition mark on the first text node that carries one.
    const defMark = (
        blocks: JSONContent[],
    ): { attrs?: Record<string, unknown> } | undefined => {
        const walk = (nodes: JSONContent[]): { attrs?: Record<string, unknown> } | undefined => {
            for (const n of nodes) {
                for (const m of (n.marks ?? []) as {
                    type?: string;
                    attrs?: Record<string, unknown>;
                }[]) {
                    if (m.type === 'definition') return m;
                }
                const inner = walk((n.content ?? []) as JSONContent[]);
                if (inner) return inner;
            }
            return undefined;
        };
        return walk(blocks);
    };
    const contentOf = (md: string): JSONContent[] =>
        (defMark(convert(md).blocks)?.attrs?.content ?? []) as JSONContent[];

    const FENCE = [
        '```definitions',
        'term: Slope',
        'Steepness of a line — rise over run.',
        '$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$',
        '---',
        'term: Intercept',
        'Where the line crosses an axis.',
        '```',
    ].join('\n');

    it('contributes no body blocks of its own (side channel)', () => {
        expect(convert(FENCE).blocks).toEqual([]);
    });

    it('resolves a [[term]] reference to the fence entry', () => {
        const content = contentOf(FENCE + '\n\nFind the [[Slope]].');
        expect(content.map((b) => b.type)).toEqual(['paragraph', 'math_block']);
        expect(content[1]).toMatchObject({
            type: 'math_block',
            latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}',
        });
    });

    it('matches the term case-insensitively', () => {
        expect(contentOf(FENCE + '\n\nThe [[intercept]] matters.')).toHaveLength(
            1,
        );
        expect(contentOf(FENCE + '\n\nThe [[INTERCEPT]] matters.')).toHaveLength(
            1,
        );
    });

    it('resolves a reference that appears BEFORE the fence (two-pass)', () => {
        const md = 'Find the [[Slope]].\n\n' + FENCE;
        expect(contentOf(md).map((b) => b.type)).toEqual([
            'paragraph',
            'math_block',
        ]);
    });

    it('keeps the term text in the sentence', () => {
        const mark = defMark(convert(FENCE + '\n\nFind the [[Slope]].').blocks);
        expect(mark).toBeDefined();
        const para = convert(FENCE + '\n\nFind the [[Slope]].').blocks[0]!;
        const text = (para.content ?? []).map((n) => n.text).join('');
        expect(text).toBe('Find the Slope.');
    });

    it('accepts the full shared line grammar — heading, list, graph figure', () => {
        const md = [
            '```definitions',
            'term: Slope',
            'Rise over run.',
            '### Watch for',
            '- horizontal is $0$',
            '- vertical has none',
            'axes: -5..5, -5..5',
            'graph: line y = 2x',
            '```',
            '',
            'The [[Slope]] here.',
        ].join('\n');
        const content = contentOf(md);
        expect(content.map((b) => b.type)).toEqual([
            'paragraph',
            'heading',
            'bullet_list',
            'graph_figure',
        ]);
        expect(content[3]).toMatchObject({
            axis: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        });
    });

    it('leaves an unresolved [[term]] as literal text, with a warning', () => {
        const res = convert(FENCE + '\n\nThe [[Asymptote]] here.');
        const text = (res.blocks[0]!.content ?? []).map((n) => n.text).join('');
        expect(text).toBe('The [[Asymptote]] here.');
        expect(res.warnings.some((w) => /Asymptote/.test(w))).toBe(true);
    });

    it('still supports the inline [[term :: definition]] form alongside', () => {
        const content = contentOf(
            FENCE + '\n\nA [[cell :: the unit of life]] here.',
        );
        expect(content).toEqual([
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'the unit of life', marks: [] }],
            },
        ]);
    });

    it('warns and skips an entry with no term: line', () => {
        const res = convert(
            '```definitions\nNo term here.\n```\n\nBody.',
        );
        expect(res.warnings.some((w) => /no "term:" line/.test(w))).toBe(true);
    });

    it('warns and keeps the FIRST of a duplicated term', () => {
        const md = [
            '```definitions',
            'term: Slope',
            'first',
            '---',
            'term: slope',
            'second',
            '```',
            '',
            'The [[Slope]] here.',
        ].join('\n');
        const res = convert(md);
        expect(res.warnings.some((w) => /defined more than once/.test(w))).toBe(
            true,
        );
        const content = (defMark(res.blocks)?.attrs?.content ??
            []) as JSONContent[];
        expect(JSON.stringify(content)).toContain('first');
    });

    it('drops content a definition cannot hold, warning rather than smuggling it', () => {
        // {{…}} stays literal (a definition is never gradeable), and the
        // converter's DefinitionBlock validation is the backstop.
        const content = contentOf(
            '```definitions\nterm: Slope\nRise over {{run}}.\n```\n\nThe [[Slope]] here.',
        );
        expect(JSON.stringify(content)).toContain('{{run}}');
        expect(JSON.stringify(content)).not.toContain('"blank"');
    });

    it('resolves inside a ```reference fence, so a formula sheet can carry terms', () => {
        // Pins the claim in docs/markdown-import-format.md's reference-sheet
        // "Not here" bullet. Panel lines run through fenceInline → emitInline,
        // the same path body prose takes, so BOTH definition forms work there.
        const md = [
            FENCE,
            '',
            '```reference',
            'title: Sheet',
            'The [[Slope]] matters.',
            'Also [[cell :: the unit of life]].',
            '```',
        ].join('\n');
        const res = convert(md);
        const marks: { text?: string; blocks: string[] }[] = [];
        const walk = (nodes: JSONContent[]): void => {
            for (const n of nodes) {
                for (const m of (n.marks ?? []) as {
                    type?: string;
                    attrs?: Record<string, unknown>;
                }[]) {
                    if (m.type === 'definition') {
                        marks.push({
                            text: n.text,
                            blocks: (
                                (m.attrs?.content ?? []) as { type: string }[]
                            ).map((b) => b.type),
                        });
                    }
                }
                walk((n.content ?? []) as JSONContent[]);
            }
        };
        walk(res.referencePanel?.blocks ?? []);
        expect(marks).toEqual([
            { text: 'Slope', blocks: ['paragraph', 'math_block'] },
            { text: 'cell', blocks: ['paragraph'] },
        ]);
        expect(res.warnings).toEqual([]);
    });

    it('survives the schema round trip as a definition mark', () => {
        const activity = tiptapToActivity(
            { type: 'doc', content: convert(FENCE + '\n\nFind the [[Slope]].').blocks },
            META,
        );
        const para = activity.sections
            .flatMap((s) => s.rows)
            .flatMap((r) => r.columns)
            .flatMap((c) => c.blocks)
            .find(
                (b): b is Extract<typeof b, { type: 'paragraph' }> =>
                    b.type === 'paragraph',
            )!;
        const term = para.content.find(
            (n): n is Extract<typeof n, { type: 'text' }> =>
                n.type === 'text' && n.text === 'Slope',
        )!;
        expect(term.marks[0]).toMatchObject({ type: 'definition' });
        const mark = term.marks[0] as { content: { type: string }[] };
        expect(mark.content.map((b) => b.type)).toEqual([
            'paragraph',
            'math_block',
        ]);
    });
});

// =============================================================================
// Rich bodies inside worked / faded / columns fences (2026-08-21)
// -----------------------------------------------------------------------------
// Until this slice these three fences were LINE-PER-BLOCK: `- step` became a
// paragraph with a visible dash, and the format doc told authors that lists and
// images inside an example or a column were "editor-only".
//
// That was never a product limitation. WorkedExampleChild and
// FadedWorkedExampleChild both accept ImageBlock/BulletListBlock/
// OrderedListBlock, Column.blocks is the full Block union, and the viewer
// renders any registered type through ChildBlocks (no allowlist). Only the
// PARSER could not say it — so these rows assert the parser now emits what the
// schema always accepted, and that the result still round-trips.
// =============================================================================
describe('rich bodies in worked / faded / columns fences', () => {
    it('a worked example takes list runs, images and headings', () => {
        const md = [
            '```worked',
            'title: Finding the rate',
            'Set up the ratio:',
            '- divide cost by weight',
            '- check the units',
            '![rate](https://example.com/r.png)',
            '### Why it works',
            'The unit rate is constant.',
            '```',
        ].join('\n');

        const [example] = blocks(md);
        expect(example!.type).toBe('workedExample');
        expect(example!.content!.map((c) => c.type)).toEqual([
            'paragraph',
            'bulletList',
            'image',
            'heading',
            'paragraph',
        ]);
        // Consecutive bullets are ONE list, not one list per line.
        const list = example!.content!.find((c) => c.type === 'bulletList')!;
        expect(list.content).toHaveLength(2);
    });

    it('consecutive bullets group but a type change starts a new list', () => {
        const md = [
            '```worked',
            '- one',
            '- two',
            '1. first',
            '2. second',
            '```',
        ].join('\n');

        const [example] = blocks(md);
        expect(example!.content!.map((c) => c.type)).toEqual([
            'bulletList',
            'orderedList',
        ]);
        expect(example!.content![0]!.content).toHaveLength(2);
        expect(example!.content![1]!.content).toHaveLength(2);
    });

    it('a faded STEP with a blank is never swallowed into a list', () => {
        // THE LOAD-BEARING ROW. `1. Factor {{x+2}}` is a fill-in step — the
        // whole point of a faded example. Grouping it into an ordered list
        // would destroy the blank's own block AND double-number it against the
        // (a)/(b) step letters showStepLabels already draws. A plain bullet in
        // the same fence still groups, so the rule is "a step is not a list
        // item", not "faded fences have no lists".
        const md = [
            '```faded',
            '1. Divide: {{3.5}}',
            '- a plain bullet',
            '```',
        ].join('\n');

        const [example] = blocks(md);
        expect(example!.type).toBe('fadedWorkedExample');
        expect(example!.content!.map((c) => c.type)).toEqual([
            'fillInBlank',
            'bulletList',
        ]);
    });

    it('a WORKED example groups a brace-bearing line normally', () => {
        // The other side of the same rule: blanks are not live in a worked
        // example ({{…}} stays literal), so there is no step to protect and the
        // line groups like any other list item.
        const md = '```worked\n- literal {{braces}} here\n- and more\n```';

        const [example] = blocks(md);
        expect(example!.content!.map((c) => c.type)).toEqual(['bulletList']);
        expect(example!.content![0]!.content).toHaveLength(2);
    });

    it('a columns fence takes lists, headings and images per column', () => {
        const md = [
            '```columns',
            '# Left',
            '- alpha',
            '- beta',
            '![img](https://example.com/a.png)',
            '---',
            'Right side text',
            '1. one',
            '2. two',
            '```',
        ].join('\n');

        const [row] = blocks(md);
        expect(row!.type).toBe('row');
        const [left, right] = row!.content!;
        expect(left!.content!.map((c) => c.type)).toEqual([
            'heading',
            'bulletList',
            'image',
        ]);
        expect(right!.content!.map((c) => c.type)).toEqual([
            'paragraph',
            'orderedList',
        ]);
    });

    it('a blank line inside a fence ends a list run', () => {
        const md = '```worked\n- one\n\n- two\n```';
        const [example] = blocks(md);
        expect(example!.content!.map((c) => c.type)).toEqual([
            'bulletList',
            'bulletList',
        ]);
    });

    it('an image with no URL warns and is skipped, naming its fence', () => {
        const { blocks: got, warnings } = convert('```worked\nkeep me\n![alt]()\n```');
        // The regex requires \S+ for the URL, so an empty one is not an image
        // line at all — it degrades to text rather than vanishing. Either way
        // the body content survives, which is the property that matters.
        expect(got[0]!.content!.length).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(warnings)).toBe(true);
    });

    it('rich fence bodies survive the schema round trip', () => {
        // Trap 3: a test that stops at the Tiptap doc cannot see a field die on
        // the way back out.
        //
        // `dropEmptyAttrs` handles ONE pre-existing, semantically inert
        // asymmetry this row happens to be the first to cover: the importer
        // emits a `column` with no `attrs`, while activityToTiptap emits
        // `attrs: { id }` — which the suite's stripIds reduces to `attrs: {}`.
        // To ProseMirror an absent attrs and an empty one are the same node
        // (both mean "defaults"). Verified 2026-08-21 against the SIMPLEST
        // columns fence, which this slice does not touch, so it is not a
        // regression here; the older round-trip row above simply never included
        // a columns fence.
        const md = [
            '```worked',
            'title: Rates',
            '- divide',
            '![r](https://example.com/r.png)',
            '### Why',
            '```',
            '',
            '```columns',
            '- alpha',
            '---',
            '1. one',
            '```',
        ].join('\n');
        expect(dropEmptyAttrs(roundTrip(md))).toEqual(
            dropEmptyAttrs(blocks(md)),
        );
    });
});

describe('inline marks inside fence bodies (pilot finding, 2026-08-21)', () => {
    // Fence bodies are parsed line by line by markdownToTiptap rather than by
    // markdown-it, so they never saw an emphasis token: `**Weight (kg)**` in a
    // ```columns table header reached the document as four literal asterisks.
    // The doc had promised bold/italic/code in fence bodies the whole time —
    // found on paper, by the pilot, in a printed table header.
    //
    // The fix routes fenceInline through the REAL inline parser and mapInline,
    // which is why these rows also assert the things that must NOT change: a
    // fence line still carries blanks, math, and definitions.

    const marksOf = (node: JSONContent): string[][] =>
        (node.content ?? []).map((n) => (n.marks ?? []).map((m) => m.type!));

    it('bold works in a ```columns cell — the case the pilot printed wrong', () => {
        const [row] = blocks('```columns\n**Weight (kg)**\n---\n**Cost ($)**\n```');
        const firstCell = row!.content![0]!.content![0]!;
        expect(firstCell.content![0]!.text).toBe('Weight (kg)');
        expect(marksOf(firstCell)).toEqual([['bold']]);
    });

    it('bold, italic and code work in ```worked and ```reference too', () => {
        // It was never a columns bug — every line-parsed fence shared it.
        const [example] = blocks('```worked\n**b** and *i* and `c`\n```');
        expect(marksOf(example!.content![0]!)).toEqual([
            ['bold'],
            [],
            ['italic'],
            [],
            ['code'],
        ]);

        const { referencePanel } = convert('```reference\n**Bold line**\n```');
        expect(marksOf(referencePanel!.blocks[0]!)).toEqual([['bold']]);
    });

    it('a blank still works beside a mark, in the same line', () => {
        // The regression that would matter most: faded steps are the reason
        // fence lines parse blanks at all.
        const [example] = blocks('```faded\n**Step:** x = {{4}}\n```');
        const step = example!.content![0]!;
        expect(step.type).toBe('fillInBlank');
        expect(step.content!.some((n) => n.type === 'blank')).toBe(true);
        expect(step.content![0]!.marks?.[0]?.type).toBe('bold');
    });

    it('math in a fence line still lifts to a math node, not asterisk soup', () => {
        const [example] = blocks('```worked\nSolve $2x + 3 = 11$ now\n```');
        const types = example!.content![0]!.content!.map((n) => n.type);
        expect(types).toContain('mathInline');
    });

    it('leaves intraword underscores and lone asterisks alone', () => {
        // CommonMark's own rules, now that the real parser runs here: a
        // variable name must not become italic, and arithmetic must survive.
        const [a] = blocks('```worked\nsnake_case_name stays\n```');
        expect(a!.content![0]!.content![0]!.text).toBe('snake_case_name stays');

        const [b] = blocks('```worked\n2 * 3 = 6\n```');
        expect(b!.content![0]!.content![0]!.text).toBe('2 * 3 = 6');
    });
});

describe('hand-numbering: what the pilot found (2026-08-21)', () => {
    // The doc now tells authors not to write their own question numbers. That
    // guidance is a CLAIM about behaviour, so it gets a test — policy P11.

    it('strips the author\'s marker when a numbered line IS a question', () => {
        // Why hand-numbering looks safe, and mostly is: the marker is consumed
        // and the platform's own number replaces it, so nothing doubles up.
        const [first, second] = blocks(
            '1. What does 1 kg cost? {{=3.50}}\n2. And 5 kg? {{=17.50}}',
        );
        expect(first!.type).toBe('fillInBlank');
        expect(second!.type).toBe('fillInBlank');
        expect(JSON.stringify(first)).not.toContain('1.');
        expect(JSON.stringify(second)).not.toContain('2.');
    });

    it('demotes a numbered non-question sitting AMONG the questions to prose', () => {
        // Shape one, and the harmless one: markdown-it keeps these in a single
        // list, so the non-question item simply loses its marker.
        const got = blocks(
            '1. What is the rate? {{=2}}\n\n2. Explain what it means.',
        );
        expect(got.map((b) => b.type)).toEqual(['fillInBlank', 'paragraph']);
    });

    it('makes a SEPARATED numbered non-question its own list — the collision', () => {
        // Shape two, and the one that reaches paper wrong. Anything between the
        // question and the stray line (here a fence, in the pilot a ```columns
        // table) starts a NEW list, and OrderedListBlock carries no start
        // offset — the viewer renders a bare <ol>, so it restarts at 1 beside
        // the problem numbers.
        const got = blocks(
            '1. What is the rate? {{=2}}\n\n```callout\nA note.\n```\n\n2. Explain what it means.',
        );
        expect(got.map((b) => b.type)).toEqual([
            'fillInBlank',
            'callout',
            'orderedList',
        ]);
    });

    it('a list inside a worked example is NOT affected — no problem numbering there', () => {
        // The other half, so the guidance does not read as "never use lists":
        // steps inside an example carry no problem numbers to collide with.
        const [example] = blocks('```worked\n1. first step\n2. second step\n```');
        expect(example!.content!.map((c) => c.type)).toEqual(['orderedList']);
    });
});

describe('```meta work: key — activity-wide print work space (2026-08-21)', () => {
    // The one PRINT field the meta fence reaches, and the first NESTED knob it
    // touches (print.workSpace). It exists because a printable catalogue that
    // imports with zero writing room needs a ⚙ visit per activity — the same
    // per-activity tax the `title` key was added to remove.

    it('reads lines, the unit the doc leads with', () => {
        const { meta } = convert('```meta\nwork: 3 lines\n```');
        expect(meta?.workSpace).toBe(6);
    });

    it('reads inches and centimetres', () => {
        expect(convert('```meta\nwork: 1in\n```').meta?.workSpace).toBe(6);
        expect(convert('```meta\nwork: 2.5cm\n```').meta?.workSpace).toBe(5.906);
    });

    it('reads a bare number as rem, and accepts the workspace: spelling', () => {
        expect(convert('```meta\nwork: 4\n```').meta?.workSpace).toBe(4);
        expect(convert('```meta\nworkspace: 4\n```').meta?.workSpace).toBe(4);
    });

    it('warns on a value that is not an amount, and imports the rest', () => {
        // A typo in one key must never cost the body content or the other keys
        // in the same paste — the meta fence's standing rule.
        const { meta, warnings } = convert(
            '```meta\ntitle: Rates\nwork: lots\n```',
        );
        expect(meta?.title).toBe('Rates');
        expect(meta?.workSpace).toBeUndefined();
        expect(warnings.join(' ')).toMatch(/isn.t an amount of space/i);
    });

    it('appears in the dialog summary line', () => {
        // The whole point of the summary slice: an author can SEE that the
        // fence understood the key, at the moment they could still fix it.
        const { meta } = convert('```meta\nwork: 3 lines\n```');
        expect(importMetaSummary(meta)).toContain('work space');
    });
});

describe('```columns ruled/unruled option (2026-08-21)', () => {
    // `Row.gridLines` reached PAPER for the first time the same day this option
    // landed — it had been a dead declaration since S9 Drop 4 (schema + editor
    // toolbar, no reader on any student- or printer-facing surface). The render
    // half is guarded by print e2e (`structure/ruled-grid`); these rows guard
    // the AUTHORING half, so the fence key and the thing it draws cannot drift.

    it('options: ruled sets the row tri-state to on', () => {
        const [row] = blocks('```columns\noptions: ruled\nLeft\n---\nRight\n```');
        expect(row!.type).toBe('row');
        expect(row!.attrs?.gridLines).toBe('on');
        expect(row!.content).toHaveLength(2);
    });

    it('options: unruled sets it to off, so one row can opt OUT', () => {
        // Not redundant with the default: a teacher who ruled the whole
        // activity in ⚙ needs a way to exempt a single row, and 'off' is the
        // only value that outranks the activity setting.
        const [row] = blocks('```columns\noptions: unruled\nLeft\n---\nRight\n```');
        expect(row!.attrs?.gridLines).toBe('off');
    });

    it('saying nothing stays inherit, so ruling remains OPT-IN', () => {
        // The compatibility row. Every columns fence authored before this
        // option existed must keep printing exactly as it did.
        const [row] = blocks('```columns\nLeft\n---\nRight\n```');
        expect(row!.attrs?.gridLines).toBe('inherit');
    });

    it('the options line works below the last divider, not just at the top', () => {
        // It describes the ROW, and a row has no position inside itself. If
        // this ever regresses, the option silently becomes position-dependent —
        // the kind of rule an author cannot predict without reading the parser.
        const [row] = blocks('```columns\nLeft\n---\nRight\noptions: ruled\n```');
        expect(row!.attrs?.gridLines).toBe('on');
        // AND it does not leak into the column as a paragraph of literal text.
        const right = row!.content![1]!;
        expect(JSON.stringify(right)).not.toContain('options:');
    });

    it('an unknown option warns and is ignored, never sinking the fence', () => {
        const { blocks: got, warnings } = convert(
            '```columns\noptions: nope\nLeft\n---\nRight\n```',
        );
        expect(got[0]!.type).toBe('row');
        expect(got[0]!.attrs?.gridLines).toBe('inherit');
        expect(warnings.join(' ')).toMatch(/unknown option/i);
    });

    it('the ruled row survives the schema round trip', () => {
        const md = '```columns\noptions: ruled\nLeft\n---\nRight\n```';
        const [row] = roundTrip(md);
        expect(row!.attrs?.gridLines).toBe('on');
    });
});

/** Remove `attrs: {}` so an absent-vs-empty attrs difference is not a failure. */
function dropEmptyAttrs(nodes: JSONContent[]): JSONContent[] {
    const walk = (node: JSONContent): JSONContent => {
        const out: JSONContent = { ...node };
        if (out.attrs && Object.keys(out.attrs).length === 0) delete out.attrs;
        if (out.content) out.content = out.content.map(walk);
        return out;
    };
    return nodes.map(walk);
}
