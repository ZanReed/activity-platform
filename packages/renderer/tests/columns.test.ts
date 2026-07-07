// =============================================================================
// columns.test.ts — Render of the structural columns container
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  createColumnsBlock,
  createParagraphBlock,
  createProblemBlock,
  createInteractiveGraphBlock,
  createFillInBlankBlock,
  createBlankToken,
  type ActivityDocument,
} from '@activity/schema';
import { renderBody } from '../src/index.js';

function docWith(...blocks: ActivityDocument['sections'][number]['blocks']): ActivityDocument {
  const doc = createEmptyDocument({ title: 'T' });
  doc.sections[0]!.blocks = blocks;
  return doc;
}

describe('renderColumns', () => {
  it('renders a .block-columns grid carrying the column template', () => {
    const cols = createColumnsBlock(2);
    const body = renderBody(docWith(cols));
    expect(body).toContain('class="block block-columns"');
    expect(body).toContain('data-block-type="columns"');
    expect(body).toContain('--columns-template:1fr 1fr');
    // One cell per column.
    expect(body.match(/class="column-cell"/g)).toHaveLength(2);
  });

  it('builds grid-template fractions from per-column width weights', () => {
    const cols = createColumnsBlock(2);
    cols.columns[0]!.width = 2;
    cols.columns[1]!.width = 1;
    const body = renderBody(docWith(cols));
    expect(body).toContain('--columns-template:2fr 1fr');
  });

  it('renders nested blocks through the normal block path', () => {
    const cols = createColumnsBlock(2);
    const para = createParagraphBlock();
    para.content = [{ type: 'text', text: 'hello in a column', marks: [] }];
    cols.columns[0]!.blocks = [para];
    const body = renderBody(docWith(cols));
    expect(body).toContain('hello in a column');
    expect(body).toContain('class="block block-paragraph"');
  });

  it('renders an interactive_graph inside a column and numbers it in sequence (Drop 1)', () => {
    // col 1: a problem (#1) then a graph (#2); col 2: a problem (#3).
    const cols = createColumnsBlock(2);
    cols.columns[0]!.blocks = [createProblemBlock(), createInteractiveGraphBlock()];
    cols.columns[1]!.blocks = [createProblemBlock()];
    const body = renderBody(docWith(cols));
    // The graph block renders through the normal block path inside the cell.
    expect(body).toContain('data-block-type="interactive_graph"');
    expect(body).toContain('class="graph-canvas"');
    // It participates in the shared column-major problem sequence.
    const numbers = [...body.matchAll(/block-problem-number">(\d+)\./g)].map(
      (m) => m[1],
    );
    expect(numbers).toEqual(['1', '2', '3']);
  });

  it('numbers nested problems column-major, sharing the document sequence', () => {
    // col 1: problems that should be 1 then 2; col 2: problem that should be 3;
    // a problem AFTER the columns block should be 4.
    const cols = createColumnsBlock(2);
    cols.columns[0]!.blocks = [createProblemBlock(), createProblemBlock()];
    cols.columns[1]!.blocks = [createProblemBlock()];
    const trailing = createProblemBlock();
    const body = renderBody(docWith(cols, trailing));

    const numbers = [...body.matchAll(/block-problem-number">(\d+)\./g)].map(
      (m) => m[1],
    );
    expect(numbers).toEqual(['1', '2', '3', '4']);
  });

  it('honors a per-problem number override without shifting the sequence', () => {
    const cols = createColumnsBlock(2);
    const overridden = createProblemBlock();
    overridden.number = 99;
    cols.columns[0]!.blocks = [overridden];
    cols.columns[1]!.blocks = [createProblemBlock()];
    const body = renderBody(docWith(cols));
    const numbers = [...body.matchAll(/block-problem-number">(\d+)\./g)].map(
      (m) => m[1],
    );
    // Override displays 99; the next problem still gets 2 (slot not skipped).
    expect(numbers).toEqual(['99', '2']);
  });

  it('threads showAnswers into nested fill-in-blank cells', () => {
    const cols = createColumnsBlock(2);
    const fill = createFillInBlankBlock();
    fill.content = [createBlankToken('forty-two')];
    cols.columns[0]!.blocks = [fill];
    const body = renderBody(docWith(cols), { showAnswers: true });
    expect(body).toContain('value="forty-two"');
  });
});

describe('renderColumns grid lines', () => {
  // gridLines on the block is the absolute say; 'inherit' defers to
  // meta.print.gridLines. The renderer signals "ruled" by emitting the
  // data-grid-lines="true" attribute, and signals "unruled" by its absence.
  function docWithGrid(
    blockGridLines: 'inherit' | 'on' | 'off',
    activityDefault: boolean,
  ): ActivityDocument {
    const cols = createColumnsBlock(2);
    cols.gridLines = blockGridLines;
    const doc = createEmptyDocument({ title: 'T' });
    doc.meta.print.gridLines = activityDefault;
    doc.sections[0]!.blocks = [cols];
    return doc;
  }

  it('omits data-grid-lines when block=inherit and activity default is off', () => {
    expect(renderBody(docWithGrid('inherit', false))).not.toContain(
      'data-grid-lines',
    );
  });

  it('emits data-grid-lines when block=inherit and activity default is on', () => {
    expect(renderBody(docWithGrid('inherit', true))).toContain(
      'data-grid-lines="true"',
    );
  });

  it("emits data-grid-lines for block='on' even when activity default is off", () => {
    expect(renderBody(docWithGrid('on', false))).toContain(
      'data-grid-lines="true"',
    );
  });

  it("omits data-grid-lines for block='off' even when activity default is on", () => {
    expect(renderBody(docWithGrid('off', true))).not.toContain(
      'data-grid-lines',
    );
  });
});
