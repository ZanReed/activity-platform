// =============================================================================
// mathPreload.test.ts — S8 T7: detect math on arrival, fetch KaTeX early
// -----------------------------------------------------------------------------
// The detector has two ways to be wrong and they are not symmetric:
//
//   FALSE NEGATIVE — misses math nested somewhere it did not think to look.
//   Costs the ~740 ms LaTeX-fallback window this whole change exists to close.
//   Recoverable: the math components still load the chunk on mount.
//
//   FALSE POSITIVE — preloads for a document with no math. Costs a math-free
//   page 75 KiB gz it was never supposed to download, which is precisely the
//   regression the lazy tier (ruling D16) exists to prevent. NOT recoverable:
//   the student already paid.
//
// So the prose-mentioning-math cases below are the load-bearing ones, and they
// are why detection is structural rather than a substring search over the
// serialized document.
// =============================================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { documentUsesMath, preloadMathIfNeeded } from '../src/inline/mathPreload.js';
import { setMathRenderer } from '../src/inline/math.js';
import { servedFixtureDocument } from '../src/fixtures/index.js';

describe('documentUsesMath', () => {
  it('finds a math_block nested in sections → rows → columns → blocks', () => {
    const doc = {
      sections: [
        {
          rows: [{ columns: [{ blocks: [{ type: 'math_block', latex: 'x^2' }] }] }],
        },
      ],
    };
    expect(documentUsesMath(doc)).toBe(true);
  });

  it('finds a math_inline node inside rich-text content', () => {
    const doc = {
      sections: [
        {
          rows: [
            {
              columns: [
                {
                  blocks: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Solve ' },
                        { type: 'math_inline', latex: 'y = mx + b' },
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
    expect(documentUsesMath(doc)).toBe(true);
  });

  it('finds math in the reference panel, not just the sections', () => {
    // The panel is scaffold and never scored, but it renders — and it is
    // exactly the kind of place a hand-written path walk forgets.
    const doc = {
      sections: [],
      referencePanel: { blocks: [{ type: 'math_block', latex: 'a^2 + b^2' }] },
    };
    expect(documentUsesMath(doc)).toBe(true);
  });

  it('finds math nested inside a column container block', () => {
    const doc = {
      sections: [
        {
          rows: [
            {
              columns: [
                {
                  blocks: [
                    {
                      type: 'columns',
                      columns: [
                        { blocks: [{ type: 'math_inline', latex: 'z' }] },
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
    expect(documentUsesMath(doc)).toBe(true);
  });

  it('says NO for a document with no math at all', () => {
    const doc = {
      sections: [
        {
          rows: [
            {
              columns: [
                {
                  blocks: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(documentUsesMath(doc)).toBe(false);
  });

  it('says NO when prose merely MENTIONS math node names', () => {
    // The false positive a JSON.stringify().includes('math_inline') check
    // would produce — and it would make an English worksheet about typesetting
    // download KaTeX for nothing.
    const doc = {
      sections: [
        {
          rows: [
            {
              columns: [
                {
                  blocks: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Our editor supports math_inline and math_block nodes.',
                        },
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
    expect(documentUsesMath(doc)).toBe(false);
  });

  it('says NO when a block merely has a field named like a math type', () => {
    // `type` is what marks a node; a value elsewhere must not.
    const doc = { sections: [{ rows: [{ columns: [{ blocks: [
      { type: 'callout', variant: 'math_block', content: [] },
    ] }] }] }] };
    expect(documentUsesMath(doc)).toBe(false);
  });

  it('handles null, undefined and primitives without throwing', () => {
    // This runs on the student's critical path before the worksheet renders.
    expect(documentUsesMath(null)).toBe(false);
    expect(documentUsesMath(undefined)).toBe(false);
    expect(documentUsesMath('math_block')).toBe(false);
    expect(documentUsesMath(42)).toBe(false);
  });

  it('terminates on a cyclic object instead of hanging', () => {
    // A preload heuristic must never be the reason a student waits forever.
    const cyclic: Record<string, unknown> = { type: 'paragraph' };
    cyclic.self = cyclic;
    expect(() => documentUsesMath(cyclic)).not.toThrow();
  });

  it('agrees with the real served fixture, which contains math', () => {
    // Guards against the detector drifting away from the actual document
    // shape: this is the same document the perf lane measures.
    expect(documentUsesMath(servedFixtureDocument())).toBe(true);
  });
});

describe('preloadMathIfNeeded', () => {
  beforeEach(() => {
    setMathRenderer(null); // restore the lazy path
  });

  afterEach(() => {
    setMathRenderer(null);
    vi.restoreAllMocks();
  });

  it('does nothing for a document with no math', () => {
    expect(preloadMathIfNeeded({ sections: [] })).toBe(false);
  });

  it('triggers for a document with math', () => {
    expect(preloadMathIfNeeded({ sections: [], referencePanel: { blocks: [
      { type: 'math_block', latex: 'x' },
    ] } })).toBe(true);
  });

  it('does nothing when the renderer is already resident', () => {
    // Re-entering a worksheet, or a second document in the same session:
    // there is no fetch left to start, so claiming a preload would be a lie
    // to both the caller and anyone reading the instrumentation.
    setMathRenderer(() => '<span>math</span>');
    expect(preloadMathIfNeeded({ referencePanel: { blocks: [
      { type: 'math_block', latex: 'x' },
    ] } })).toBe(false);
  });
});
