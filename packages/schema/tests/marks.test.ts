// Mark schema coverage — the object-mark model and its legacy-string upgrade.
// Lives in tests/ (the active suite; schema vitest only globs tests/**).
import { describe, it, expect } from 'vitest';
import { Mark, DefinitionMark, TextNode } from '../src/index.js';

describe('DefinitionMark', () => {
  it('parses a definition mark carrying inline text', () => {
    const parsed = DefinitionMark.parse({ type: 'definition', definition: 'a number that divides another exactly' });
    expect(parsed.definition).toBe('a number that divides another exactly');
    expect(parsed.glossaryKey).toBeUndefined();
  });

  it('carries an optional glossaryKey (reserved for Phase 4)', () => {
    const parsed = DefinitionMark.parse({ type: 'definition', definition: 'factor', glossaryKey: 'factor-noun' });
    expect(parsed.glossaryKey).toBe('factor-noun');
  });

  it('requires the definition text in Phase 2', () => {
    expect(() => DefinitionMark.parse({ type: 'definition' })).toThrow();
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
      marks: [{ type: 'bold' }, { type: 'definition', definition: 'a divisor' }],
    });
    expect(node.marks).toEqual([
      { type: 'bold' },
      { type: 'definition', definition: 'a divisor' },
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
