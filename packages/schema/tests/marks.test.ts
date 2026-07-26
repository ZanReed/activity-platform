// Mark schema coverage — the object-mark model and its legacy-string upgrade.
// Lives in tests/ (the active suite; schema vitest only globs tests/**).
import { describe, it, expect } from 'vitest';
import { Mark, DefinitionMark, TextNode } from '../src/index.js';

// A definition's content is a BLOCK array (docs/design/definition-rich-content.md).
// NOTE on entry points: the legacy upgrades live in `Mark`'s z.preprocess, not on
// DefinitionMark, because z.preprocess yields a ZodEffects and
// z.discriminatedUnion needs real ZodObjects for its members. So legacy shapes
// must be parsed through `Mark` (which is the only path real documents take —
// ActivityDocument → … → TextNode.marks → Mark); DefinitionMark.parse sees the
// current shape only. The legacy cases below therefore go through Mark.
describe('DefinitionMark', () => {
  it('parses block content — paragraph with inline math, plus a display equation', () => {
    const parsed = DefinitionMark.parse({
      type: 'definition',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'the longest side, ' },
            { type: 'math_inline', latex: 'c' },
          ],
        },
        { type: 'math_block', latex: 'a^2 + b^2 = c^2' },
      ],
    });
    expect(parsed.content).toHaveLength(2);
    expect(parsed.content[0]?.type).toBe('paragraph');
    expect(parsed.content[1]).toEqual({
      type: 'math_block',
      latex: 'a^2 + b^2 = c^2',
    });
    expect(parsed.glossaryKey).toBeUndefined();
  });

  it('accepts headings and nested lists', () => {
    const parsed = DefinitionMark.parse({
      type: 'definition',
      content: [
        { type: 'heading', level: 3, content: [{ type: 'text', text: 'Forms' }] },
        {
          type: 'bullet_list',
          items: [
            {
              content: [{ type: 'text', text: 'slope-intercept' }],
              children: [
                {
                  type: 'ordered_list',
                  items: [{ content: [{ type: 'text', text: 'y = mx + b' }] }],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(parsed.content[0]).toMatchObject({ type: 'heading', level: 3 });
    expect(parsed.content[1]).toMatchObject({ type: 'bullet_list' });
  });

  it('accepts an image block (alt defaults to empty) with sizing and crop', () => {
    const parsed = DefinitionMark.parse({
      type: 'definition',
      content: [
        {
          type: 'image',
          src: 'https://example.com/triangle.png',
          width: 0.5,
          align: 'left',
          crop: { x: 0.1, y: 0.1, w: 0.5, h: 0.5 },
          srcAspect: 1.5,
        },
      ],
    });
    expect(parsed.content[0]).toEqual({
      type: 'image',
      src: 'https://example.com/triangle.png',
      alt: '',
      width: 0.5,
      align: 'left',
      crop: { x: 0.1, y: 0.1, w: 0.5, h: 0.5 },
      srcAspect: 1.5,
    });
  });

  it('accepts a graph_figure block (D3 — the one member reused verbatim)', () => {
    const parsed = DefinitionMark.parse({
      type: 'definition',
      content: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          type: 'graph_figure',
          axis: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
          drawables: [
            { kind: 'curve', model: { family: 'linear', slope: 2, intercept: 0 } },
          ],
        },
      ],
    });
    expect(parsed.content[0]).toMatchObject({ type: 'graph_figure' });
  });

  it('carries an optional glossaryKey (reserved for Phase 4)', () => {
    const parsed = DefinitionMark.parse({
      type: 'definition',
      content: [],
      glossaryKey: 'factor-noun',
    });
    expect(parsed.glossaryKey).toBe('factor-noun');
  });

  it('defaults content to empty when absent', () => {
    const parsed = DefinitionMark.parse({ type: 'definition' });
    expect(parsed.content).toEqual([]);
  });

  it('forbids a nested definition mark inside its content (non-recursion pin)', () => {
    // The whole reason DefinitionBlock defines its text-bearing members locally
    // over DefinitionContentInline (which admits SimpleMark only) instead of
    // reusing blocks/paragraph.ts. If this ever passes, the cycle is back.
    expect(() =>
      DefinitionMark.parse({
        type: 'definition',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'x',
                marks: [{ type: 'definition', content: [] }],
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects blocks outside the curated subset (D2/D3 + never-gradeable)', () => {
    const reject = (block: unknown) =>
      expect(() =>
        DefinitionMark.parse({ type: 'definition', content: [block] }),
      ).toThrow();

    // A definition is never gradeable.
    reject({
      id: '11111111-1111-4111-8111-111111111111',
      type: 'fill_in_blank',
      content: [],
    });
    // D3: callout is out.
    reject({
      id: '11111111-1111-4111-8111-111111111111',
      type: 'callout',
      variant: 'info',
      content: [],
    });
    // D2: columns are out.
    reject({
      id: '11111111-1111-4111-8111-111111111111',
      type: 'columns',
      columns: [],
    });
  });
});

describe('DefinitionMark — legacy upgrades (via Mark preprocess)', () => {
  it('v1: a plain-string definition becomes one paragraph', () => {
    const parsed = Mark.parse({ type: 'definition', definition: 'a divisor' });
    expect(parsed).toEqual({
      type: 'definition',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'a divisor', marks: [] }],
        },
      ],
    });
  });

  it('v2: an inline content array is wrapped in one paragraph', () => {
    const parsed = Mark.parse({
      type: 'definition',
      content: [
        { type: 'text', text: 'the longest side, ' },
        { type: 'math_inline', latex: 'c' },
      ],
    });
    expect(parsed).toEqual({
      type: 'definition',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'the longest side, ', marks: [] },
            { type: 'math_inline', latex: 'c' },
          ],
        },
      ],
    });
  });

  it('v2 (D7): the separate image attr becomes a trailing image block', () => {
    const parsed = Mark.parse({
      type: 'definition',
      content: [{ type: 'text', text: 'factor' }],
      image: { src: 'https://example.com/triangle.png', alt: 'a triangle' },
    });
    expect(parsed).toEqual({
      type: 'definition',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'factor', marks: [] }],
        },
        {
          type: 'image',
          src: 'https://example.com/triangle.png',
          alt: 'a triangle',
        },
      ],
    });
    expect(parsed).not.toHaveProperty('image');
  });

  it('v1 + image compose in one pass (oldest shape, fully upgraded)', () => {
    const parsed = Mark.parse({
      type: 'definition',
      definition: 'a divisor',
      image: { src: 'https://example.com/f.png' },
    });
    expect(parsed).toEqual({
      type: 'definition',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'a divisor', marks: [] }],
        },
        { type: 'image', src: 'https://example.com/f.png', alt: '' },
      ],
    });
  });

  it('leaves current-shape block content alone (no double-wrap)', () => {
    const current = {
      type: 'definition',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [] }] },
      ],
    };
    expect(Mark.parse(current)).toEqual(current);
  });

  it('is deterministic — parsing the same stored mark twice is identical', () => {
    // The upgrades must mint no ids and no randomness, or re-serialization
    // byte-identity breaks. This is why DefinitionBlock ids are optional.
    const stored = {
      type: 'definition',
      definition: 'a divisor',
      image: { src: 'https://example.com/f.png' },
    };
    expect(Mark.parse(stored)).toEqual(Mark.parse(stored));
  });
});

describe('Mark — object model + legacy-string upgrade', () => {
  it('accepts a simple mark in object form', () => {
    expect(Mark.parse({ type: 'bold' })).toEqual({ type: 'bold' });
  });

  it('upgrades a legacy bare-string mark to the object form (preprocess)', () => {
    expect(Mark.parse('bold')).toEqual({ type: 'bold' });
    expect(Mark.parse('subscript')).toEqual({ type: 'subscript' });
  });

  it('rejects an unknown mark type', () => {
    expect(() => Mark.parse('strikethrough')).toThrow();
    expect(() => Mark.parse({ type: 'strikethrough' })).toThrow();
  });
});

describe('TextNode marks', () => {
  it('parses object marks, including a definition mark', () => {
    const node = TextNode.parse({
      type: 'text',
      text: 'factor',
      marks: [
        { type: 'bold' },
        {
          type: 'definition',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'a divisor' }],
            },
          ],
        },
      ],
    });
    expect(node.marks).toEqual([
      { type: 'bold' },
      {
        type: 'definition',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'a divisor', marks: [] }],
          },
        ],
      },
    ]);
  });

  it('upgrades a legacy document whose marks are bare strings', () => {
    // A v1 document stored marks as strings; it must still parse, normalized
    // to the object form, without a schemaVersion bump.
    const node = TextNode.parse({ type: 'text', text: 'x', marks: ['bold', 'italic'] });
    expect(node.marks).toEqual([{ type: 'bold' }, { type: 'italic' }]);
  });

  it('defaults to no marks', () => {
    const node = TextNode.parse({ type: 'text', text: 'plain' });
    expect(node.marks).toEqual([]);
  });
});
