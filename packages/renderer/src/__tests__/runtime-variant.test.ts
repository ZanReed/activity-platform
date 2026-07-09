// =============================================================================
// runtime-variant.test.ts — base vs graphs runtime selection in renderActivity
// -----------------------------------------------------------------------------
// The published page inlines ONE of two runtime builds (see
// scripts/bundle-renderer.mjs + document.ts): the lean "base" build on pages
// with no graph, and the "graphs" build (base + the thin kit bridge) only when
// the page has an interactive_graph block. `attachGraphRuntime` is a marker
// that exists only in the graphs bundle (the bridge's call into the lazy kit's
// plumbing entry), so its presence/absence tells the two apart. Picking the
// wrong one is a real regression — a graph page with the base runtime never
// hands its blocks to the kit; a plain page with the graphs runtime ships
// bridge code it never uses — so it's worth a guard.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderActivity } from '../document.js';
import type { RenderContext } from '../document.js';
import { ActivityDocument } from '@activity/schema';

const CTX: RenderContext = {
  activityId: '11111111-1111-4111-8111-111111111111',
  versionNum: 1,
  submissionEndpoint: 'https://example.test/ingest',
};

const SECTION_ID = '22222222-2222-4222-8222-222222222222';

/** A plain single-paragraph activity — no graph anywhere. */
function makePlainDoc(): ActivityDocument {
  return ActivityDocument.parse({
    schemaVersion: 1,
    meta: { title: 'Plain' },
    sections: [
      {
        id: SECTION_ID,
        blocks: [
          {
            id: '33333333-3333-4333-8333-333333333333',
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello.' }],
          },
        ],
      },
    ],
  });
}

/** An activity with one graded interactive_graph block. */
function makeGraphDoc(): ActivityDocument {
  return ActivityDocument.parse({
    schemaVersion: 1,
    meta: { title: 'Graphing' },
    sections: [
      {
        id: SECTION_ID,
        blocks: [
          {
            id: '44444444-4444-4444-8444-444444444444',
            type: 'interactive_graph',
            prompt: [{ type: 'text', text: 'Plot (1, 1).' }],
            axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
            interaction: { type: 'plot_point', correctPoints: [[1, 1]] },
          },
        ],
      },
    ],
  });
}

describe('runtime variant selection', () => {
  it('a graph-free page inlines the base runtime (no graph code)', () => {
    const html = renderActivity(makePlainDoc(), CTX);
    expect(html).not.toContain('attachGraphRuntime');
  });

  it('a page with an interactive_graph inlines the graphs runtime', () => {
    const html = renderActivity(makeGraphDoc(), CTX);
    expect(html).toContain('data-block-type="interactive_graph"');
    expect(html).toContain('attachGraphRuntime');
  });
});
