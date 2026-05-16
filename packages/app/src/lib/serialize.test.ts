// =============================================================================
// serialize.test.ts — Round-trip tests for serialize/deserialize
// -----------------------------------------------------------------------------
// Core invariant: activityToTiptap(tiptapToActivity(x)) ≈ x for any Tiptap
// doc made up of supported types. Tests start from the Tiptap side because
// Tiptap doesn't have UUIDs, so structural equality after round-trip is
// strict deep-equal — no ID stripping needed.
// =============================================================================

import { describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import { ActivityDocument, ActivityMeta } from '@activity/schema';
import { activityToTiptap, tiptapToActivity } from './serialize';

const META = ActivityMeta.parse({
    title: 'Test Activity',
    course: 'Algebra II',
});

// Round-trip from the Tiptap side.
function roundTrip(input: JSONContent): JSONContent {
    return activityToTiptap(tiptapToActivity(input, META));
}

describe('empty doc', () => {
    it('round-trips an empty doc', () => {
        const empty: JSONContent = { type: 'doc', content: [] };
        expect(roundTrip(empty)).toEqual(empty);
    });
});

describe('paragraphs', () => {
    it('round-trips an empty paragraph', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [] }],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips a paragraph with plain text', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Hello world' }],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves bold marks', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'bold',
                            marks: [{ type: 'bold' }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves subscript marks', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'H' },
                        {
                            type: 'text',
                            text: '2',
                            marks: [{ type: 'subscript' }],
                        },
                        { type: 'text', text: 'O' },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves superscript marks', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'x' },
                        {
                            type: 'text',
       text: '2',
       marks: [{ type: 'superscript' }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves multiple marks on one text run', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'bold italic',
                            marks: [{ type: 'bold' }, { type: 'italic' }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves mixed plain and marked runs in one paragraph', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'plain ' },
                        {
                            type: 'text',
                            text: 'bold',
                            marks: [{ type: 'bold' }],
                        },
                        { type: 'text', text: ' end' },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });
});

describe('headings', () => {
    it.each([1, 2, 3] as const)('round-trips heading level %i', (level) => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level },
                    content: [{ type: 'text', text: `Heading ${level}` }],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('clamps invalid heading levels to 1', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 5 },
                    content: [{ type: 'text', text: 'Too deep' }],
                },
            ],
        };
        const result = roundTrip(doc);
        expect((result.content?.[0] as JSONContent).attrs?.level).toBe(1);
    });
});

describe('math', () => {
    it('round-trips inline math inside a paragraph', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'The formula is ' },
                        {
                            type: 'mathInline',
                            attrs: { latex: 'x^2 + y^2 = z^2' },
                        },
                        { type: 'text', text: '.' },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips block math', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'mathBlock',
                    attrs: {
                        latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
                    },
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });
});

describe('multi-block doc', () => {
    it('round-trips a representative worksheet', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: 'Worksheet 1' }],
                },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Solve for ' },
                        { type: 'mathInline', attrs: { latex: 'x' } },
                        { type: 'text', text: ':' },
                    ],
                },
                {
                    type: 'mathBlock',
                    attrs: { latex: '2x + 3 = 11' },
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });
});

describe('graceful degradation', () => {
    it('skips unknown block types without throwing', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'before' }],
                },
                // horizontalRule is in StarterKit defaults but not in our
                // schema — exactly the "real but unsupported" case the
                // graceful-degradation path is designed for.
                { type: 'horizontalRule' } as JSONContent,
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'after' }],
                },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections[0]!.blocks).toHaveLength(2);
        expect(result.sections[0]!.blocks[0]!.type).toBe('paragraph');
        expect(result.sections[0]!.blocks[1]!.type).toBe('paragraph');
    });

    it('drops unsupported marks (e.g., strike) silently', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'mixed',
                            marks: [{ type: 'strike' }, { type: 'bold' }],
                        },
                    ],
                },
            ],
        };
        const result = tiptapToActivity(doc, META);
        const block = result.sections[0]!.blocks[0]!;
        if (block.type !== 'paragraph') throw new Error('expected paragraph');
        const text = block.content[0]!;
        if (text.type !== 'text') throw new Error('expected text node');
        expect(text.marks).toEqual(['bold']);
    });
});

describe('schema validity', () => {
    it('produces output that parses against ActivityDocument', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Hi' }],
                },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'mathInline', attrs: { latex: 'x' } },
                    ],
                },
                { type: 'mathBlock', attrs: { latex: 'y' } },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });
});

describe('meta and sections', () => {
    it('preserves meta in the result', () => {
        const doc: JSONContent = { type: 'doc', content: [] };
        const meta = { ...META, title: 'Quadratic Equations', unit: 'Polynomials' };
        const result = tiptapToActivity(doc, meta);
        expect(result.meta).toEqual(meta);
    });

    it('wraps blocks in exactly one section with a uuid id', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [] }],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(1);
        expect(result.sections[0]!.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
    });
});

describe('section breaks', () => {
    it('produces single implicit section with defaults when no sectionBreak present', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [] }],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(1);
        expect(result.sections[0]!.title).toBeUndefined();
        expect(result.sections[0]!.isCheckpoint).toBe(false);
    });

    it('first section takes the leading sectionBreak attrs when doc starts with one', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: 'Warm-up', isCheckpoint: true } },
                { type: 'paragraph', content: [] },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(1);
        expect(result.sections[0]!.title).toBe('Warm-up');
        expect(result.sections[0]!.isCheckpoint).toBe(true);
        expect(result.sections[0]!.blocks).toHaveLength(1);
    });

    it('splits content at a mid-doc sectionBreak', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'part 1' }] },
                { type: 'sectionBreak', attrs: { title: 'Practice', isCheckpoint: false } },
                { type: 'paragraph', content: [{ type: 'text', text: 'part 2' }] },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(2);
        expect(result.sections[0]!.title).toBeUndefined();
        expect(result.sections[0]!.isCheckpoint).toBe(false);
        expect(result.sections[0]!.blocks).toHaveLength(1);
        expect(result.sections[1]!.title).toBe('Practice');
        expect(result.sections[1]!.blocks).toHaveLength(1);
    });

    it('produces a trailing empty section for a trailing sectionBreak', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [] },
                { type: 'sectionBreak', attrs: { title: 'Last', isCheckpoint: false } },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(2);
        expect(result.sections[1]!.title).toBe('Last');
        expect(result.sections[1]!.blocks).toHaveLength(0);
    });

    it('handles consecutive sectionBreaks — empty first, second carries the latter break', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: 'A', isCheckpoint: false } },
                { type: 'sectionBreak', attrs: { title: 'B', isCheckpoint: true } },
                { type: 'paragraph', content: [] },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(2);
        expect(result.sections[0]!.title).toBe('A');
        expect(result.sections[0]!.blocks).toHaveLength(0);
        expect(result.sections[1]!.title).toBe('B');
        expect(result.sections[1]!.isCheckpoint).toBe(true);
        expect(result.sections[1]!.blocks).toHaveLength(1);
    });

    it('round-trip: doc without sectionBreaks (default first section)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'plain' }] }],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trip: doc with leading sectionBreak (first section has title)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: 'Warm-up', isCheckpoint: false } },
                { type: 'paragraph', content: [] },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trip: first section with isCheckpoint: true but no title', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: null, isCheckpoint: true } },
                { type: 'paragraph', content: [] },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trip: three-section worksheet with mixed metadata', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'intro' }] },
                { type: 'sectionBreak', attrs: { title: 'Practice', isCheckpoint: true } },
                { type: 'paragraph', content: [{ type: 'text', text: 'work' }] },
                { type: 'sectionBreak', attrs: { title: 'Reflect', isCheckpoint: false } },
                { type: 'paragraph', content: [{ type: 'text', text: 'how did it go' }] },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });
});


describe('lists', () => {
    it('round-trips a simple bullet list', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
                            ],
                        },
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'two' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips an ordered list', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'orderedList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'first' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves marks inside list items', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [
                                        { type: 'text', text: 'plain ' },
                                        { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips inline math inside a list item', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [
                                        { type: 'text', text: 'solve ' },
                                        { type: 'mathInline', attrs: { latex: 'x + 1' } },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips nested bullet lists', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'outer' }] },
                                {
                                    type: 'bulletList',
                                    content: [
                                        {
                                            type: 'listItem',
                                            content: [
                                                { type: 'paragraph', content: [{ type: 'text', text: 'inner' }] },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips mixed bullet/ordered nesting', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'orderedList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'Step 1' }] },
                                {
                                    type: 'bulletList',
                                    content: [
                                        {
                                            type: 'listItem',
                                            content: [
                                                { type: 'paragraph', content: [{ type: 'text', text: 'detail a' }] },
                                            ],
                                        },
                                        {
                                            type: 'listItem',
                                            content: [
                                                { type: 'paragraph', content: [{ type: 'text', text: 'detail b' }] },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('produces a schema-valid intermediate for a list', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [{ type: 'paragraph', content: [] }],
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });
});
