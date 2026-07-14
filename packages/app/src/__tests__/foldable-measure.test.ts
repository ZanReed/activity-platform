// @vitest-environment jsdom
// =============================================================================
// foldable-measure.test.ts — the foldable's body-flattening boundary
// -----------------------------------------------------------------------------
// measure.ts is browser-only (it reads block heights from a live iframe, which
// jsdom can't lay out). But the step BEFORE measurement — parsing renderBody
// output and extracting the top-level flow blocks — is pure parse-and-select and
// runs fine in jsdom. extractFlowBlocks() is that step, lifted out so this
// boundary can be tested without real layout.
//
// The load-bearing guarantee proven here: a structural `columns` container is a
// single `.activity-section > *` child, so it comes back as ONE flow item with
// both cells inside it. That is what lets paginate pack and (never) split the
// whole container across a fold — its cells are never flattened into separate,
// independently-paginated items. We also pin the width-resolution contract: the
// columns item carries `--columns-template` with `fr` tracks, which resolve
// against the fixed-width foldable panel (not a hardcoded px width).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderBody } from '@activity/renderer';
import { ActivityDocument } from '@activity/schema';
import { extractFlowBlocks } from '../lib/foldable/measure';

// A document whose single section is: intro paragraph → a 2-column container
// (weighted 2:1, each cell carrying its own nested content) → outro paragraph.
// Parsed through the schema so print defaults materialize and the shape is
// exactly what the published renderer sees.
function docWithColumns(): ActivityDocument {
  return ActivityDocument.parse({
    schemaVersion: 2,
    meta: { title: 'Columns foldable', course: 'Algebra II' },
    sections: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        rows: [
          // 1-col row (renders flat: the INTRO paragraph directly).
          {
            id: 'a1111111-1111-4111-8111-111111111111',
            gridLines: 'inherit',
            columns: [
              {
                id: 'b1111111-1111-4111-8111-111111111111',
                blocks: [
                  {
                    id: '22222222-2222-4222-8222-222222222222',
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'INTRO' }],
                  },
                ],
              },
            ],
          },
          // 2-col row (renders as a .block-row grid).
          {
            id: '33333333-3333-4333-8333-333333333333',
            gridLines: 'inherit',
            columns: [
              {
                id: '44444444-4444-4444-8444-444444444444',
                width: 2,
                blocks: [
                  {
                    id: '55555555-5555-4555-8555-555555555555',
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'LEFTCELL' }],
                  },
                ],
              },
              {
                id: '66666666-6666-4666-8666-666666666666',
                width: 1,
                blocks: [
                  {
                    id: '77777777-7777-4777-8777-777777777777',
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'RIGHTCELL' }],
                  },
                ],
              },
            ],
          },
          // 1-col row (renders flat: the OUTRO paragraph directly).
          {
            id: 'c1111111-1111-4111-8111-111111111111',
            gridLines: 'inherit',
            columns: [
              {
                id: 'd1111111-1111-4111-8111-111111111111',
                blocks: [
                  {
                    id: '88888888-8888-4888-8888-888888888888',
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'OUTRO' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
}

describe('extractFlowBlocks — columns containers flow whole', () => {
  function blocks() {
    const html = renderBody(docWithColumns());
    return extractFlowBlocks(html, document);
  }

  it('extracts exactly one flow item per top-level block (cells not flattened)', () => {
    // Three top-level blocks: intro paragraph, the columns container, outro
    // paragraph. If the columns cells leaked out as their own items this would
    // be 4+, and the container would split across a fold.
    expect(blocks()).toHaveLength(3);
  });

  it('preserves document order across the columns container', () => {
    const items = blocks();
    expect(items[0]?.textContent).toContain('INTRO');
    expect(items[1]?.className).toContain('block-row');
    expect(items[2]?.textContent).toContain('OUTRO');
  });

  it('keeps both cells inside the single columns flow item', () => {
    const columns = blocks()[1];
    // One item, both cells' content within it.
    expect(columns?.textContent).toContain('LEFTCELL');
    expect(columns?.textContent).toContain('RIGHTCELL');
    expect(columns?.querySelectorAll('.column-cell')).toHaveLength(2);
    expect(columns?.getAttribute('data-block-type')).toBe('row');
  });

  it('carries the fr track template so inner width resolves against the panel', () => {
    const columns = blocks()[1];
    // fr units (not fixed px) are what make the grid resolve against the
    // foldable panel's fixed width; the 2:1 weights become "2fr 1fr".
    const style = columns?.getAttribute('style') ?? '';
    expect(style).toContain('--columns-template:2fr 1fr');
  });
});
