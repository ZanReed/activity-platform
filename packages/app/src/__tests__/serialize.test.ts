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
import {
    ActivityDocument,
    ActivityMeta,
    ReferencePanel,
    type CalculatorTool,
} from '@activity/schema';
import {
    activityToTiptap,
    tiptapToActivity,
    referencePanelToTiptap,
    tiptapToReferencePanel,
} from '../lib/serialize';

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

describe('reference panel (opaque carry)', () => {
    // The panel is authored on its own surface and threaded into
    // tiptapToActivity as a third argument — it is never encoded in the main
    // editor's Tiptap doc. These tests pin the pass-through contract that closes
    // the latent drop-bug (a stored panel discarded on the next save).
    const PANEL: ReferencePanel = {
        title: 'Formula reference',
        blocks: [
            {
                id: '11111111-1111-4111-8111-111111111111',
                type: 'heading',
                level: 2,
                content: [{ type: 'text', text: 'Key formulas', marks: [] }],
            },
            {
                id: '22222222-2222-4222-8222-222222222222',
                type: 'math_block',
                latex: 'a^2 + b^2 = c^2',
            },
        ],
    };
    const body: JSONContent = {
        type: 'doc',
        content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Body' }] },
        ],
    };

    it('carries the reference panel through verbatim when provided', () => {
        const result = tiptapToActivity(body, META, PANEL);
        expect(result.referencePanel).toEqual(PANEL);
    });

    it('omits the reference panel when not provided', () => {
        const result = tiptapToActivity(body, META);
        expect(result.referencePanel).toBeUndefined();
    });

    it('carries a panel with no title verbatim', () => {
        const panelNoTitle: ReferencePanel = { blocks: PANEL.blocks };
        const result = tiptapToActivity(body, META, panelNoTitle);
        expect(result.referencePanel).toEqual(panelNoTitle);
        expect(result.referencePanel?.title).toBeUndefined();
    });

    it('produces a schema-valid document with a panel', () => {
        const result = tiptapToActivity(body, META, PANEL);
        expect(ActivityDocument.safeParse(result).success).toBe(true);
    });
});

describe('calculator (opaque carry)', () => {
    // Like the reference panel, the calculator config is activity-level editor
    // state threaded into tiptapToActivity (4th arg), never encoded in the Tiptap
    // doc. Pins the same pass-through contract.
    const CALC: CalculatorTool = {
        enabled: true,
        restrictions: { mode: 'scientific', allowTrig: false, allowLogExp: true },
    };
    const body: JSONContent = {
        type: 'doc',
        content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Body' }] },
        ],
    };

    it('carries the calculator through verbatim when provided', () => {
        const result = tiptapToActivity(body, META, undefined, CALC);
        expect(result.calculator).toEqual(CALC);
    });

    it('omits the calculator when not provided', () => {
        expect(tiptapToActivity(body, META).calculator).toBeUndefined();
    });

    it('carries a disabled calculator verbatim (config preserved while off)', () => {
        const off: CalculatorTool = { ...CALC, enabled: false };
        expect(tiptapToActivity(body, META, undefined, off).calculator).toEqual(off);
    });

    it('carries the panel AND the calculator together', () => {
        const panel: ReferencePanel = { blocks: [] };
        const result = tiptapToActivity(body, META, panel, CALC);
        expect(result.referencePanel).toEqual(panel);
        expect(result.calculator).toEqual(CALC);
    });

    it('produces a schema-valid document with a calculator', () => {
        const result = tiptapToActivity(body, META, undefined, CALC);
        expect(ActivityDocument.safeParse(result).success).toBe(true);
    });
});

describe('reference panel ⇄ tiptap', () => {
    // The panel editor produces a FLAT Tiptap doc (no sectionBreak); these
    // bridge it to ReferencePanel.blocks, with the title threaded separately.
    const tiptap: JSONContent = {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Formulas' }],
            },
            { type: 'mathBlock', attrs: { latex: 'a^2+b^2=c^2' } },
            { type: 'paragraph', content: [{ type: 'text', text: 'A note.' }] },
        ],
    };

    it('maps a flat Tiptap doc to a panel and back (no sections)', () => {
        const panel = tiptapToReferencePanel(tiptap, 'Reference');
        expect(panel.title).toBe('Reference');
        expect(panel.blocks.map((b) => b.type)).toEqual([
            'heading',
            'math_block',
            'paragraph',
        ]);
        // Tiptap-side round-trip is exact (no UUIDs on the Tiptap side).
        expect(referencePanelToTiptap(panel)).toEqual(tiptap);
    });

    it('omits a blank/whitespace title', () => {
        expect(tiptapToReferencePanel(tiptap, '   ').title).toBeUndefined();
        expect(tiptapToReferencePanel(tiptap).title).toBeUndefined();
    });

    it('produces a schema-valid ReferencePanel', () => {
        expect(
            ReferencePanel.safeParse(tiptapToReferencePanel(tiptap, 'T')).success,
        ).toBe(true);
    });

    it('round-trips an empty doc to a panel with no blocks', () => {
        const empty: JSONContent = { type: 'doc', content: [] };
        const panel = tiptapToReferencePanel(empty);
        expect(panel.blocks).toEqual([]);
        expect(referencePanelToTiptap(panel)).toEqual(empty);
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

    it('preserves underline marks', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'key term',
                            marks: [{ type: 'underline' }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves a definition mark with its rich content', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'factor',
                            marks: [{ type: 'definition', attrs: { content: [{ type: 'text', text: 'a number that divides another exactly' }] } }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves a definition mark image + glossaryKey', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'hypotenuse',
                            marks: [{ type: 'definition', attrs: { content: [{ type: 'text', text: 'the longest side' }], image: { src: 'https://example.com/triangle.png', alt: 'a right triangle' }, glossaryKey: 'factor-noun' } }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('drops an empty definition mark (no content and no image)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'factor', marks: [{ type: 'definition', attrs: { content: [] } }] },
                    ],
                },
            ],
        };
        const result = tiptapToActivity(doc, META);
        const block = result.sections[0]!.blocks[0]!;
        if (block.type !== 'paragraph') throw new Error('expected paragraph');
        const text = block.content[0]!;
        if (text.type !== 'text') throw new Error('expected text node');
        expect(text.marks).toEqual([]);
    });

    it('keeps a definition mark that has only an image (no text)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'parabola', marks: [{ type: 'definition', attrs: { content: [], image: { src: 'https://example.com/parabola.png', alt: 'a U-shaped curve' } } }] },
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

    it('preserves a hard break between text runs', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Blah blah blah. Hello!' },
                        { type: 'hardBreak' },
                        { type: 'text', text: 'Hope this works' },
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
        expect(text.marks).toEqual([{ type: 'bold' }]);
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
    describe('fill_in_blank with blanks', () => {
        it('round-trips a fillInBlank with one blank carrying all four fields', () => {
            const blankAttrs = {
                id: 'blank-1',
                answer: '2x + 6',
                acceptableAnswers: ['2x+6', '6 + 2x'],
                interchangeableWithPrevious: false,
                hint: [{ type: 'text', text: 'Distribute the 2.', marks: [] }],
                mistakeFeedback: [
                    {
                        match: '2x + 3',
                        feedback: [
                            {
                                type: 'text',
                                text: 'Did you forget to distribute to the 3?',
                                marks: [],
                            },
                        ],
                    },
                    {
                        match: 'x + 6',
                        feedback: [
                            { type: 'text', text: 'Distribute the 2 to both terms.', marks: [] },
                        ],
                    },
                ],
            };
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-1' },
                        content: [
                            { type: 'text', text: 'Simplify: 2(x + 3) = ' },
           { type: 'blank', attrs: blankAttrs },
                        ],
                    },
                ],
            };
            const result = roundTrip(doc);
            // fillInBlank.attrs.id is intentionally re-minted by tiptapBlockToActivity
            // (per the file header convention); assert on content shape rather than
            // full doc equality. Blank ids ARE preserved.
            const fib = result.content?.[0] as JSONContent;
            expect(fib.type).toBe('fillInBlank');
            expect(fib.content).toEqual([
                { type: 'text', text: 'Simplify: 2(x + 3) = ' },
                                        { type: 'blank', attrs: blankAttrs },
            ]);
        });

        it('round-trips a fillInBlank with a blank that has no optional fields', () => {
            const blankAttrs = {
                id: 'blank-2',
                answer: '5',
                acceptableAnswers: [],
                interchangeableWithPrevious: false,
            };
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-2' },
                        content: [
                            { type: 'text', text: 'Solve: x = ' },
                            { type: 'blank', attrs: blankAttrs },
                        ],
                    },
                ],
            };
            const result = roundTrip(doc);
            const fib = result.content?.[0] as JSONContent;
            expect(fib.type).toBe('fillInBlank');
            expect(fib.content).toEqual([
                { type: 'text', text: 'Solve: x = ' },
                { type: 'blank', attrs: blankAttrs },
            ]);
        });
    });

    describe('fill_in_blank block-level fields (Stage 15)', () => {
        it('round-trips solution, hasConfidenceRating, and skills', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: {
                            id: 'fib-1',
                            solution: [
                                {
                                    type: 'text',
                                    text: 'Distribute the 2 to get 2x + 6.',
                                    marks: [],
                                },
                            ],
                            hasConfidenceRating: true,
                            skills: ['distributing', 'simplifying'],
                        },
                        content: [
                            { type: 'text', text: 'Simplify: 2(x + 3) = ' },
                            {
                                type: 'blank',
                                attrs: {
                                    id: 'blank-1',
                                    answer: '2x + 6',
                                    acceptableAnswers: [],
                                },
                            },
                        ],
                    },
                ],
            };
            const result = roundTrip(doc);
            const fib = result.content?.[0] as JSONContent;
            expect(fib.attrs?.solution).toEqual([
                { type: 'text', text: 'Distribute the 2 to get 2x + 6.', marks: [] },
            ]);
            expect(fib.attrs?.hasConfidenceRating).toBe(true);
            expect(fib.attrs?.skills).toEqual(['distributing', 'simplifying']);
        });

        it('passes block fields into the ActivityDocument', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: {
                            id: 'fib-1',
                            solution: [
                                { type: 'text', text: 'Worked answer.', marks: [] },
                            ],
                            hasConfidenceRating: true,
                            skills: ['factoring'],
                        },
                        content: [
                            {
                                type: 'blank',
                                attrs: {
                                    id: 'b1',
                                    answer: '5',
                                    acceptableAnswers: [],
                                },
                            },
                        ],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = activity.sections[0]!.blocks[0]!;
            expect(block.type).toBe('fill_in_blank');
            if (block.type !== 'fill_in_blank') throw new Error('unreachable');
            expect(block.solution).toEqual([
                { type: 'text', text: 'Worked answer.', marks: [] },
            ]);
            expect(block.hasConfidenceRating).toBe(true);
            expect(block.skills).toEqual(['factoring']);
        });

        it('defaults block fields when the attrs are absent', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-1' },
                        content: [
                            {
                                type: 'blank',
                                attrs: {
                                    id: 'b1',
                                    answer: '5',
                                    acceptableAnswers: [],
                                },
                            },
                        ],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = activity.sections[0]!.blocks[0]!;
            if (block.type !== 'fill_in_blank') throw new Error('unreachable');
            expect(block.solution).toBeUndefined();
            expect(block.hasConfidenceRating).toBe(false);
            expect(block.skills).toEqual([]);

            // And the reverse direction emits explicit defaults for the editor.
            const back = roundTrip(doc);
            const fib = back.content?.[0] as JSONContent;
            expect(fib.attrs?.solution).toBeNull();
            expect(fib.attrs?.hasConfidenceRating).toBe(false);
            expect(fib.attrs?.skills).toEqual([]);
            expect(fib.attrs?.workSpace).toBeNull();
        });
    });

    describe('fill_in_blank workSpace override (Drop B)', () => {
        it('round-trips a per-problem work-space override', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-1', workSpace: 3 },
                        content: [
                            {
                                type: 'blank',
                                attrs: { id: 'b1', answer: '5', acceptableAnswers: [] },
                            },
                        ],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = activity.sections[0]!.blocks[0]!;
            if (block.type !== 'fill_in_blank') throw new Error('unreachable');
            expect(block.workSpace).toBe(3);

            const back = roundTrip(doc);
            const fib = back.content?.[0] as JSONContent;
            expect(fib.attrs?.workSpace).toBe(3);
        });

        it('leaves workSpace off the block when absent (inherits default)', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-1' },
                        content: [
                            {
                                type: 'blank',
                                attrs: { id: 'b1', answer: '5', acceptableAnswers: [] },
                            },
                        ],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = activity.sections[0]!.blocks[0]!;
            if (block.type !== 'fill_in_blank') throw new Error('unreachable');
            expect(block.workSpace).toBeUndefined();
        });
    });
});

describe('columns', () => {
    it('round-trips a two-column block preserving cell content and order', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'columns',
                    attrs: { id: 'cols-1' },
                    content: [
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'left' }] },
                            ],
                        },
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'right' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        // columns.attrs.id is re-minted by tiptapBlockToActivity (file-header
        // convention), so assert on the content shape rather than the id.
        const result = roundTrip(doc);
        const cols = result.content?.[0] as JSONContent;
        expect(cols.type).toBe('columns');
        expect(cols.content).toEqual([
            {
                type: 'column',
                attrs: {},
                content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'left' }] },
                ],
            },
            {
                type: 'column',
                attrs: {},
                content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'right' }] },
                ],
            },
        ]);
    });

    it('preserves a per-column width weight', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'columns',
                    attrs: { id: 'cols-1' },
                    content: [
                        {
                            type: 'column',
                            attrs: { width: 2 },
                            content: [{ type: 'paragraph', content: [] }],
                        },
                        {
                            type: 'column',
                            attrs: {},
                            content: [{ type: 'paragraph', content: [] }],
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.blocks[0]!;
        if (block.type !== 'columns') throw new Error('unreachable');
        expect(block.columns[0]!.width).toBe(2);
        expect(block.columns[1]!.width).toBeUndefined();

        const back = roundTrip(doc);
        const cols = back.content?.[0] as JSONContent;
        const cells = cols.content as JSONContent[];
        expect(cells[0]!.attrs).toEqual({ width: 2 });
        expect(cells[1]!.attrs).toEqual({});
    });

    it('numbers nested fill-in-blanks column-major in the ActivityDocument', () => {
        const fib = (id: string): JSONContent => ({
            type: 'fillInBlank',
            attrs: { id },
            content: [
                { type: 'blank', attrs: { id: id + '-b', answer: '1', acceptableAnswers: [] } },
            ],
        });
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'columns',
                    attrs: { id: 'cols-1' },
                    content: [
                        { type: 'column', attrs: {}, content: [fib('a'), fib('b')] },
                        { type: 'column', attrs: {}, content: [fib('c')] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.blocks[0]!;
        if (block.type !== 'columns') throw new Error('unreachable');
        // Column-major cell order is structural here; the renderer assigns the
        // visible numbers by walking cells in array order (verified in the
        // renderer's columns.test.ts). This asserts the serialize layer keeps
        // cells and their blocks in that order.
        expect(block.columns[0]!.blocks.map((b) => b.type)).toEqual([
            'fill_in_blank',
            'fill_in_blank',
        ]);
        expect(block.columns[1]!.blocks.map((b) => b.type)).toEqual([
            'fill_in_blank',
        ]);
    });

    it('produces a schema-valid intermediate for a columns block', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'columns',
                    attrs: { id: 'cols-1' },
                    content: [
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('seeds an empty paragraph when a column would otherwise be empty', () => {
        // A column whose only block is unmappable (e.g. a future/unsupported
        // type) must still emit a valid `(...)+` cell in the editor direction.
        const activity = ActivityDocument.parse({
            schemaVersion: 1,
            meta: META,
            sections: [
                {
                    id: crypto.randomUUID(),
                    isCheckpoint: false,
                    blocks: [
                        {
                            id: crypto.randomUUID(),
                            type: 'columns',
                            columns: [
                                { id: crypto.randomUUID(), blocks: [] },
                                {
                                    id: crypto.randomUUID(),
                                    blocks: [
                                        {
                                            id: crypto.randomUUID(),
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'x', marks: [] }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        const tiptap = activityToTiptap(activity);
        const cols = tiptap.content?.[0] as JSONContent;
        const cells = cols.content as JSONContent[];
        expect(cells[0]!.content).toEqual([{ type: 'paragraph' }]);
    });

    it('round-trips an explicit gridLines override', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'columns',
                    attrs: { id: 'cols-1', gridLines: 'on' },
                    content: [
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.blocks[0]!;
        if (block.type !== 'columns') throw new Error('unreachable');
        expect(block.gridLines).toBe('on');

        const back = roundTrip(doc);
        const cols = back.content?.[0] as JSONContent;
        expect(cols.attrs?.gridLines).toBe('on');
    });

    it("defaults gridLines to 'inherit' when the attr is absent", () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'columns',
                    attrs: { id: 'cols-1' },
                    content: [
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.blocks[0]!;
        if (block.type !== 'columns') throw new Error('unreachable');
        expect(block.gridLines).toBe('inherit');
    });

    it("falls back to 'inherit' for an unknown gridLines attr", () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'columns',
                    attrs: { id: 'cols-1', gridLines: 'bogus' },
                    content: [
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.blocks[0]!;
        if (block.type !== 'columns') throw new Error('unreachable');
        expect(block.gridLines).toBe('inherit');
    });
});

describe('image', () => {
    it('round-trips src + alt + caption', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'image',
                    attrs: {
                        id: 'img-1',
                        src: 'https://example.com/photo.png',
                        alt: 'A photo',
                        caption: 'Figure 1',
                    },
                },
            ],
        };
        // id is re-minted by tiptapBlockToActivity (file-header convention), so
        // assert on the content-bearing attrs rather than the id.
        const back = roundTrip(doc);
        const img = back.content?.[0] as JSONContent;
        expect(img.type).toBe('image');
        expect(img.attrs?.src).toBe('https://example.com/photo.png');
        expect(img.attrs?.alt).toBe('A photo');
        expect(img.attrs?.caption).toBe('Figure 1');
    });

    it('omits caption when empty (round-trip yields empty-string caption)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'image',
                    attrs: {
                        id: 'img-1',
                        src: 'https://example.com/photo.png',
                        alt: '',
                        caption: '',
                    },
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.blocks[0]!;
        if (block.type !== 'image') throw new Error('unreachable');
        expect(block.caption).toBeUndefined();

        // The editor direction always emits a caption attr (defaulting to '')
        // so the node's attr shape is stable.
        const back = roundTrip(doc);
        const img = back.content?.[0] as JSONContent;
        expect(img.attrs?.caption).toBe('');
    });

    it('drops an image with an empty src', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'image', attrs: { id: 'img-1', src: '', alt: '', caption: '' } },
                { type: 'paragraph', content: [{ type: 'text', text: 'after' }] },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const types = activity.sections[0]!.blocks.map((b) => b.type);
        expect(types).toEqual(['paragraph']);
    });

    it('produces a schema-valid intermediate', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'image',
                    attrs: {
                        id: 'img-1',
                        src: 'https://example.com/photo.png',
                        alt: 'alt',
                        caption: '',
                    },
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('round-trips an image nested inside a column', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'columns',
                    attrs: { id: 'cols-1' },
                    content: [
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                {
                                    type: 'image',
                                    attrs: {
                                        id: 'img-1',
                                        src: 'https://example.com/a.png',
                                        alt: 'a',
                                        caption: '',
                                    },
                                },
                            ],
                        },
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'right' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.blocks[0]!;
        if (block.type !== 'columns') throw new Error('unreachable');
        expect(block.columns[0]!.blocks.map((b) => b.type)).toEqual(['image']);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });
});
