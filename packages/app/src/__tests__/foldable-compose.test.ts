// =============================================================================
// foldable-compose.test.ts — duplex booklet imposition
// -----------------------------------------------------------------------------
// Pure arrangement logic: a count of paginated content panels → one Foldable
// per physical sheet, with the glue tab fixed as the back cover and content
// laid out in reading order across the outside/inside faces.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { compose, CONTENT_PANELS_PER_FOLDABLE } from '../lib/foldable/compose';

describe('compose', () => {
  it('places 3 content panels on one sheet with the glue tab as back cover', () => {
    const foldables = compose(3);
    expect(foldables).toHaveLength(1);
    const f = foldables[0]!;
    // Outside face: [glue tab | content #1]
    expect(f.outside).toEqual([
      { kind: 'glue' },
      { kind: 'content', panelIndex: 0 },
    ]);
    // Inside face: [content #2 | content #3]
    expect(f.inside).toEqual([
      { kind: 'content', panelIndex: 1 },
      { kind: 'content', panelIndex: 2 },
    ]);
    expect(f.index).toBe(1);
  });

  it('pads the trailing slots of a partly-filled final sheet', () => {
    const f = compose(1)[0]!;
    expect(f.outside).toEqual([
      { kind: 'glue' },
      { kind: 'content', panelIndex: 0 },
    ]);
    expect(f.inside).toEqual([{ kind: 'pad' }, { kind: 'pad' }]);
  });

  it('spills into multiple self-contained foldables past 3 panels', () => {
    const foldables = compose(4);
    expect(foldables).toHaveLength(2);
    const second = foldables[1]!;
    // Second sheet carries content #4 (index 3) and two pads, its own glue tab.
    expect(second.index).toBe(2);
    expect(second.outside).toEqual([
      { kind: 'glue' },
      { kind: 'content', panelIndex: 3 },
    ]);
    expect(second.inside).toEqual([{ kind: 'pad' }, { kind: 'pad' }]);
  });

  it('numbers content panels contiguously across sheets', () => {
    const foldables = compose(CONTENT_PANELS_PER_FOLDABLE * 2);
    expect(foldables).toHaveLength(2);
    expect(foldables[0]!.outside[1]).toEqual({ kind: 'content', panelIndex: 0 });
    expect(foldables[0]!.inside).toEqual([
      { kind: 'content', panelIndex: 1 },
      { kind: 'content', panelIndex: 2 },
    ]);
    expect(foldables[1]!.outside[1]).toEqual({ kind: 'content', panelIndex: 3 });
  });

  it('yields a single blank foldable for zero content', () => {
    const foldables = compose(0);
    expect(foldables).toHaveLength(1);
    const f = foldables[0]!;
    expect(f.outside).toEqual([{ kind: 'glue' }, { kind: 'pad' }]);
    expect(f.inside).toEqual([{ kind: 'pad' }, { kind: 'pad' }]);
  });
});
