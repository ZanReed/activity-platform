// =============================================================================
// layoutStyles.test.ts — authored layout reaches the page (S5 T1)
// -----------------------------------------------------------------------------
// The regression these exist for is silent by construction: before this, the
// viewer dropped Column.width, Column.minHeight, and per-block width/align on
// the floor. A teacher's 2:1 split rendered 50/50 and a half-width figure
// rendered full width — on screen and, worse, on paper, where controlling the
// footprint is the entire point of the feature. Nothing failed; it just quietly
// looked wrong.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  columnsTemplate,
  rowStyle,
  columnStyle,
  blockStyle,
  blockAlign,
  isSized,
} from '../src/container/layoutStyles.js';

describe('columnsTemplate — authored weights become grid tracks', () => {
  it('splits an unweighted row evenly', () => {
    expect(columnsTemplate([{}, {}])).toBe('1fr 1fr');
  });

  it('honors a 2:1 split (the case flex `1 1 0` silently flattened)', () => {
    expect(columnsTemplate([{ width: 2 }, { width: 1 }])).toBe('2fr 1fr');
  });

  it('treats an unweighted column beside a weighted one as weight 1', () => {
    // A teacher who set ONE weight meant "twice as wide as its neighbour", not
    // "undefined behaviour".
    expect(columnsTemplate([{ width: 2 }, {}])).toBe('2fr 1fr');
  });

  it('emits one track for a single-column row', () => {
    expect(columnsTemplate([{}])).toBe('1fr');
  });

  it('never emits an empty track list', () => {
    // A row with no columns should not produce `grid-template-columns: ;`,
    // which is a parse error that would take the whole rule down with it.
    expect(columnsTemplate([])).toBe('1fr');
  });

  it('trims float artifacts rather than emitting 33.000000000000004fr', () => {
    expect(columnsTemplate([{ width: 0.1 + 0.2 }])).toBe('0.3fr');
  });

  it('puts the template on the row as a custom property', () => {
    expect(rowStyle([{ width: 3 }, { width: 1 }])).toEqual({
      '--activity-columns-template': '3fr 1fr',
    });
  });
});

describe('columnStyle — reserved work space', () => {
  it('emits the authored floor in rem', () => {
    expect(columnStyle({ minHeight: 8 })).toEqual({
      '--activity-cell-min-height': '8rem',
    });
  });

  it('emits NOTHING when no work space was reserved', () => {
    // Not `0`: "unauthored" and "authored as zero" must stay distinguishable,
    // or the CSS fallback can never be changed safely.
    expect(columnStyle({})).toEqual({});
  });
});

describe('blockStyle / blockAlign — per-block footprint', () => {
  it('turns a width fraction into a percentage', () => {
    expect(blockStyle({ width: 0.5 })).toEqual({ '--activity-block-width': '50%' });
  });

  it('trims float artifacts from thirds', () => {
    expect(blockStyle({ width: 0.33 })).toEqual({ '--activity-block-width': '33%' });
  });

  it('emits nothing for an unsized block', () => {
    expect(blockStyle({})).toEqual({});
    expect(isSized({})).toBe(false);
  });

  it('emits align only for the off-centre values', () => {
    // Absence IS centred — the natural read for a narrowed figure on a
    // worksheet, and the renderer's own convention.
    expect(blockAlign({ width: 0.5, align: 'left' })).toBe('left');
    expect(blockAlign({ width: 0.5, align: 'right' })).toBe('right');
    expect(blockAlign({ width: 0.5, align: 'center' })).toBeUndefined();
    expect(blockAlign({ width: 0.5 })).toBeUndefined();
  });

  it('ignores align on a full-width block', () => {
    // A no-op by design: a full-width block has nothing to align within, and
    // emitting the attribute anyway would imply otherwise.
    expect(blockAlign({ align: 'left' })).toBeUndefined();
  });
});
