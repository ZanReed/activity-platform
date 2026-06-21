// Mark schema coverage — the object-mark model and its legacy-string upgrade.
// Lives in tests/ (the active suite; schema vitest only globs tests/**).
import { describe, it, expect } from 'vitest';
import { Mark, DefinitionMark, TextNode } from '../src/index.js';

describe('DefinitionMark', () => {
  it('parses rich content (formatted text + math)', () => {
    const parsed = DefinitionMark.parse({
      type: 'definition',
      content: [
        { type: 'text', text: 'the longest side, ' },
        { type: 'math_inline', latex: 'c' },
      ],
    });
    expect(parsed.content).toHaveLength(2);
    expect(parsed.image).toBeUndefined();
    expect(parsed.glossaryKey).toBeUndefined();
  });

  it('carries an optional image (with alt defaulting to empty)', () => {
    const parsed = DefinitionMark.parse({
      type: 'definition',
      content: [{ type: 'text', text: 'factor' }],
      image: { src: 'https://example.com/triangle.png' },
    });
    expect(parsed.image).toEqual({ src: 'https://example.com/triangle.png', alt: '' });
  });

  it('carries an optional glossaryKey (reserved for Phase 4)', () => {
    const parsed = DefinitionMark.parse({
      type: 'definition',
      content: [{ type: 'text', text: 'factor' }],
      glossaryKey: 'factor-noun',
    });
    expect(parsed.glossaryKey).toBe('factor-noun');
  });

  it('defaults content to empty when absent', () => {
    const parsed = DefinitionMark.parse({ type: 'definition' });
    expect(parsed.content).toEqual([]);
  });

  it('forbids a nested definition mark inside its content', () => {
    expect(() =>
      DefinitionMark.parse({
        type: 'definition',
        content: [
          {
            type: 'text',
            text: 'x',
            marks: [{ type: 'definition', content: [] }],
          },
        ],
      }),
    ).toThrow();
  });

  it('upgrades a legacy plain-string definition mark to rich content (preprocess)', () => {
    // A v1 definition mark stored `definition: string` before rich content
    // landed; it must still parse, normalized to a single text run.
    const parsed = Mark.parse({ type: 'definition', definition: 'a divisor' });
    expect(parsed).toEqual({
      type: 'definition',
      content: [{ type: 'text', text: 'a divisor', marks: [] }],
    });
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
        { type: 'definition', content: [{ type: 'text', text: 'a divisor' }] },
      ],
    });
    expect(node.marks).toEqual([
      { type: 'bold' },
      { type: 'definition', content: [{ type: 'text', text: 'a divisor', marks: [] }] },
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
