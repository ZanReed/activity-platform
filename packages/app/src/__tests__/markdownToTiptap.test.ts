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
                        attrs: { answer: 'Paris', acceptableAnswers: [] },
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
            { type: 'blank', attrs: { answer: '4', acceptableAnswers: [] } },
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
