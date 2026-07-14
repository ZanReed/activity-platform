// =============================================================================
// rows.test.ts — Render of the structural Row (rows-of-columns layout)
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  createRow,
  createParagraphBlock,
  createProblemBlock,
  createInteractiveGraphBlock,
  createFillInBlankBlock,
  createBlankToken,
  type ActivityDocument,
  type Row,
} from '@activity/schema';
import { renderBody } from '../src/index.js';

function docWithRows(...rows: Row[]): ActivityDocument {
  const doc = createEmptyDocument({ title: 'T' });
  doc.sections[0]!.rows = rows;
  return doc;
}

// A 1-column row whose single column holds the given block stack.
function rowOf(...blocks: Row['columns'][number]['blocks']): Row {
  const row = createRow(1);
  row.columns[0]!.blocks = blocks;
  return row;
}

describe('renderRow — multi-column', () => {
  it('renders a .block-row grid carrying the column template', () => {
    const body = renderBody(docWithRows(createRow(2)));
    expect(body).toContain('class="block block-row"');
    expect(body).toContain('data-block-type="row"');
    expect(body).toContain('--columns-template:1fr 1fr');
    expect(body.match(/class="column-cell"/g)).toHaveLength(2);
  });

  it('builds grid-template fractions from per-column width weights', () => {
    const row = createRow(2);
    row.columns[0]!.width = 2;
    row.columns[1]!.width = 1;
    expect(renderBody(docWithRows(row))).toContain('--columns-template:2fr 1fr');
  });

  it('renders nested blocks through the normal block path', () => {
    const row = createRow(2);
    const para = createParagraphBlock();
    para.content = [{ type: 'text', text: 'hello in a column', marks: [] }];
    row.columns[0]!.blocks = [para];
    const body = renderBody(docWithRows(row));
    expect(body).toContain('hello in a column');
    expect(body).toContain('class="block block-paragraph"');
  });

  it('renders an interactive_graph inside a column and numbers it in sequence', () => {
    // col 1: a problem (#1) then a graph (#2); col 2: a problem (#3).
    const row = createRow(2);
    row.columns[0]!.blocks = [createProblemBlock(), createInteractiveGraphBlock()];
    row.columns[1]!.blocks = [createProblemBlock()];
    const body = renderBody(docWithRows(row));
    expect(body).toContain('data-block-type="interactive_graph"');
    expect(body).toContain('class="graph-canvas"');
    const numbers = [...body.matchAll(/block-problem-number">(\d+)\./g)].map((m) => m[1]);
    expect(numbers).toEqual(['1', '2', '3']);
  });

  it('numbers nested problems column-major, sharing the document sequence', () => {
    // multi-col row: col 1 → 1,2; col 2 → 3. A 1-col row after → 4.
    const row = createRow(2);
    row.columns[0]!.blocks = [createProblemBlock(), createProblemBlock()];
    row.columns[1]!.blocks = [createProblemBlock()];
    const body = renderBody(docWithRows(row, rowOf(createProblemBlock())));
    const numbers = [...body.matchAll(/block-problem-number">(\d+)\./g)].map((m) => m[1]);
    expect(numbers).toEqual(['1', '2', '3', '4']);
  });

  it('honors a per-problem number override without shifting the sequence', () => {
    const row = createRow(2);
    const overridden = createProblemBlock();
    overridden.number = 99;
    row.columns[0]!.blocks = [overridden];
    row.columns[1]!.blocks = [createProblemBlock()];
    const numbers = [...renderBody(docWithRows(row)).matchAll(/block-problem-number">(\d+)\./g)].map(
      (m) => m[1],
    );
    expect(numbers).toEqual(['99', '2']);
  });

  it('threads showAnswers into nested fill-in-blank cells', () => {
    const row = createRow(2);
    const fill = createFillInBlankBlock();
    fill.content = [createBlankToken('forty-two')];
    row.columns[0]!.blocks = [fill];
    const body = renderBody(docWithRows(row), { showAnswers: true });
    expect(body).toContain('value="forty-two"');
  });
});

describe('renderRow — flat 1-column fast path', () => {
  it('renders a 1-col row as a bare block stream (no grid wrapper)', () => {
    const para = createParagraphBlock();
    para.content = [{ type: 'text', text: 'plain flow', marks: [] }];
    const body = renderBody(docWithRows(rowOf(para)));
    expect(body).toContain('plain flow');
    expect(body).toContain('class="block block-paragraph"');
    // No layout wrapper for the common single-column case.
    expect(body).not.toContain('block-row');
    expect(body).not.toContain('column-cell');
  });

  it('a 1-col row WITH a minHeight floor falls back to the grid path', () => {
    const row = rowOf(createParagraphBlock());
    row.columns[0]!.minHeight = 8;
    const body = renderBody(docWithRows(row));
    expect(body).toContain('class="column-cell"');
    expect(body).toContain('--cell-min-height:8rem');
  });
});

// Mandatory reshape pin: an interactive block nested in a row's cell renders
// with its data-block-type intact, so the runtime's depth-agnostic
// querySelectorAll discovery finds it (mirrors the faded-example nested case).
describe('renderRow — nested interactive discovery', () => {
  it('a fill_in_blank nested in a row cell keeps its data-block-type', () => {
    const row = createRow(2);
    const fill = createFillInBlankBlock();
    fill.content = [createBlankToken('x')];
    row.columns[1]!.blocks = [fill];
    const body = renderBody(docWithRows(row));
    expect(body).toContain('data-block-type="fill_in_blank"');
  });
});

describe('renderRow grid lines', () => {
  function docWithGrid(
    rowGridLines: 'inherit' | 'on' | 'off',
    activityDefault: boolean,
  ): ActivityDocument {
    const row = createRow(2);
    row.gridLines = rowGridLines;
    const doc = createEmptyDocument({ title: 'T' });
    doc.meta.print.gridLines = activityDefault;
    doc.sections[0]!.rows = [row];
    return doc;
  }

  it('omits data-grid-lines when row=inherit and activity default is off', () => {
    expect(renderBody(docWithGrid('inherit', false))).not.toContain('data-grid-lines');
  });

  it('emits data-grid-lines when row=inherit and activity default is on', () => {
    expect(renderBody(docWithGrid('inherit', true))).toContain('data-grid-lines="true"');
  });

  it("emits data-grid-lines for row='on' even when activity default is off", () => {
    expect(renderBody(docWithGrid('on', false))).toContain('data-grid-lines="true"');
  });

  it("omits data-grid-lines for row='off' even when activity default is on", () => {
    expect(renderBody(docWithGrid('off', true))).not.toContain('data-grid-lines');
  });
});
