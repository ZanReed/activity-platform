// =============================================================================
// document.test.ts — Validates ActivityDocument parsing
// -----------------------------------------------------------------------------
// These tests live in packages/schema/tests/ instead of next to source files
// because they exercise the public API (importing from '@activity/schema'
// via relative paths). If the public API breaks, these tests catch it.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  ActivityDocument,
  createEmptyDocument,
  createParagraphBlock,
  createHeadingBlock,
  createProblemBlock,
  createFillInBlankBlock,
  createBlankToken,
  createSection,
  Block,
} from '../src/index.js';

describe('ActivityDocument', () => {
  it('factory produces a valid empty document', () => {
    const doc = createEmptyDocument({ title: 'Test' });
    const result = ActivityDocument.safeParse(doc);
    expect(result.success).toBe(true);
  });

  it('rejects document with wrong schemaVersion', () => {
    const doc = createEmptyDocument();
    const bad = { ...doc, schemaVersion: 2 };
    const result = ActivityDocument.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects document with missing meta.title', () => {
    const bad = {
      schemaVersion: 1,
      meta: { course: 'Algebra II' }, // no title
      sections: [],
    };
    const result = ActivityDocument.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('parses a document with all phase 1 block types', () => {
    const doc = createEmptyDocument({ title: 'Mixed' });
    const blank = createBlankToken('x+2');
    const fillIn = createFillInBlankBlock();
    fillIn.content = [
      { type: 'text', text: 'Solve: ', marks: [] },
      blank,
    ];
    doc.sections[0]!.blocks = [
      { ...createParagraphBlock(), content: [{ type: 'text', text: 'Hello', marks: [] }] },
      createHeadingBlock(2),
      { id: crypto.randomUUID(), type: 'math_block', latex: 'x^2 + 1' },
      { id: crypto.randomUUID(), type: 'image', src: 'https://example.com/i.png', alt: '' },
      { id: crypto.randomUUID(), type: 'callout', variant: 'info', content: [] },
      createProblemBlock(),
      fillIn,
    ];
    const result = ActivityDocument.safeParse(doc);
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});

describe('Block discriminated union', () => {
  it('parses a paragraph', () => {
    const para = createParagraphBlock();
    expect(Block.safeParse(para).success).toBe(true);
  });

  it('rejects a block with unknown type', () => {
    const bad = { id: crypto.randomUUID(), type: 'gibberish', content: [] };
    const result = Block.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects a paragraph with a blank token in its content', () => {
    // Blank tokens are only allowed in fill_in_blank blocks. The paragraph's
    // content schema is InlineNode (text + math_inline), not
    // FillInBlankInline. Putting a blank in a paragraph should fail.
    const para = createParagraphBlock();
    para.content = [createBlankToken('x') as never];
    const result = Block.safeParse(para);
    expect(result.success).toBe(false);
  });

  it('accepts a blank token inside a fill_in_blank block', () => {
    const fillIn = createFillInBlankBlock();
    fillIn.content = [
      { type: 'text', text: 'a + ', marks: [] },
      createBlankToken('b'),
      { type: 'text', text: ' = c', marks: [] },
    ];
    const result = Block.safeParse(fillIn);
    expect(result.success).toBe(true);
  });
});

describe('Sections', () => {
  it('section without title is valid', () => {
    const section = createSection();
    expect(section.title).toBeUndefined();
  });

  it('multiple sections in a document', () => {
    const doc = createEmptyDocument();
    doc.sections.push(createSection('Part 2'));
    doc.sections.push(createSection('Part 3'));
    expect(ActivityDocument.safeParse(doc).success).toBe(true);
  });
});

describe('PrintConfig grid lines', () => {
  it('defaults meta.print.gridLines to false', () => {
    const doc = createEmptyDocument({ title: 'T' });
    expect(doc.meta.print.gridLines).toBe(false);
  });

  it('fills gridLines=false when print omits it on input', () => {
    const doc = createEmptyDocument({ title: 'T' });
    // Strip gridLines, then re-parse: the schema default repopulates it.
    const { gridLines: _omitted, ...printWithout } = doc.meta.print;
    void _omitted;
    const parsed = ActivityDocument.parse({
      ...doc,
      meta: { ...doc.meta, print: printWithout },
    });
    expect(parsed.meta.print.gridLines).toBe(false);
  });

  it('accepts gridLines=true', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.meta.print.gridLines = true;
    expect(ActivityDocument.safeParse(doc).success).toBe(true);
  });
});
