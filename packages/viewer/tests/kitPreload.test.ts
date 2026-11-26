// =============================================================================
// kitPreload.test.ts — graph-kit preload-on-detect (A20, mathPreload's twin)
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';

// The real imports would drag JSXGraph and mathjs into jsdom; the preload only
// needs each dynamic import to RESOLVE. Which one it asks for is checked with
// spies on KIT_PRELOADERS below; that each subpath stays free of MathLive and
// mathjs is checked on the BUILT chunks (scripts/perf-budgets.mjs, student
// journeys), which is the only place that claim can be true or false.
vi.mock('@activity/graph-kit/graph-question', () => ({}));
vi.mock('@activity/graph-kit/number-line-question', () => ({}));
vi.mock('@activity/graph-kit/data-plot-question', () => ({}));

import {
  KIT_PRELOADERS,
  documentUsesGraphKit,
  graphKitTypesIn,
  kitBlockTypes,
  preloadGraphKitIfNeeded,
  resetGraphKitPreload,
} from '../src/blocks/kitPreload.js';

const doc = (blocks: unknown[]) => ({
  schemaVersion: 2,
  meta: { title: 't' },
  sections: [
    { id: 's', rows: [{ id: 'r', columns: [{ id: 'c', blocks }] }] },
  ],
});

afterEach(() => resetGraphKitPreload());

describe('documentUsesGraphKit', () => {
  it('detects each kit-backed type at the top level', () => {
    for (const type of ['interactive_graph', 'number_line', 'data_plot']) {
      expect(documentUsesGraphKit(doc([{ id: 'b', type }]))).toBe(true);
    }
  });

  it('detects a kit block nested inside a container', () => {
    const nested = doc([
      {
        id: 'wrap',
        type: 'callout',
        children: [{ id: 'g', type: 'number_line', interaction: {} }],
      },
    ]);
    expect(documentUsesGraphKit(nested)).toBe(true);
  });

  it('is structural: PROSE mentioning a type name is not a graph block', () => {
    // The string-search trap — a false positive costs a graph-free page the
    // whole kit chunk (same rule as the bundle-marker learning).
    const prose = doc([
      {
        id: 'p',
        type: 'paragraph',
        content: [
          { type: 'text', text: 'we will use the interactive_graph block later' },
        ],
      },
    ]);
    expect(documentUsesGraphKit(prose)).toBe(false);
  });

  it('returns false for a graph-free document and survives cycles', () => {
    expect(documentUsesGraphKit(doc([{ id: 'p', type: 'paragraph' }]))).toBe(false);
    const cyclic: Record<string, unknown> = { type: 'paragraph' };
    cyclic.self = cyclic; // depth cap, not a hang
    expect(documentUsesGraphKit(cyclic)).toBe(false);
  });
});

describe('preloadGraphKitIfNeeded', () => {
  it('fires for a graph-bearing document, once', () => {
    const graphy = doc([{ id: 'g', type: 'data_plot', interaction: {} }]);
    expect(preloadGraphKitIfNeeded(graphy)).toBe(true);
    expect(preloadGraphKitIfNeeded(graphy)).toBe(false); // module cache holds it
  });

  it('does not fire for a graph-free document', () => {
    expect(preloadGraphKitIfNeeded(doc([{ id: 'p', type: 'paragraph' }]))).toBe(false);
  });
});

describe('per-widget preload (review D1)', () => {
  it('has a loader for exactly the registry\'s kit types', () => {
    // P4: the loader map is hand-written, so it is bonded to the derived set.
    expect(new Set(Object.keys(KIT_PRELOADERS))).toEqual(new Set(kitBlockTypes()));
  });

  it('collects every kit type a document holds, and only those', () => {
    const mixed = doc([
      { id: 'n', type: 'number_line' },
      { id: 'p', type: 'paragraph' },
      { id: 'd', type: 'data_plot' },
    ]);
    expect(graphKitTypesIn(mixed)).toEqual(new Set(['number_line', 'data_plot']));
  });

  it('a data plot asks for the data-plot module and nothing else', () => {
    const spies = Object.keys(KIT_PRELOADERS).map((type) => ({
      type,
      spy: vi.spyOn(KIT_PRELOADERS as Record<string, () => Promise<unknown>>, type),
    }));
    try {
      expect(preloadGraphKitIfNeeded(doc([{ id: 'd', type: 'data_plot' }]))).toBe(true);
      const called = spies.filter((s) => s.spy.mock.calls.length > 0).map((s) => s.type);
      expect(called).toEqual(['data_plot']);
    } finally {
      for (const s of spies) s.spy.mockRestore();
    }
  });

  it('a later document with a NEW kit type still preloads that type', () => {
    expect(preloadGraphKitIfNeeded(doc([{ id: 'd', type: 'data_plot' }]))).toBe(true);
    expect(preloadGraphKitIfNeeded(doc([{ id: 'n', type: 'number_line' }]))).toBe(true);
    expect(preloadGraphKitIfNeeded(doc([{ id: 'n', type: 'number_line' }]))).toBe(false);
  });
});
