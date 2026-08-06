// =============================================================================
// kitPreload.test.ts — graph-kit preload-on-detect (A20, mathPreload's twin)
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';

// The real import would drag JSXGraph + the MathLive bridge into jsdom; the
// preload only needs the dynamic import to RESOLVE.
vi.mock('@activity/graph-kit', () => ({}));

import {
  documentUsesGraphKit,
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
