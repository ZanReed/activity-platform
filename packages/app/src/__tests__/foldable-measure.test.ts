// @vitest-environment jsdom
// =============================================================================
// foldable-measure.test.ts — the foldable's capture boundary (re-pointed S5.5)
// -----------------------------------------------------------------------------
// measure.ts is browser-only (it reads heights from a live iframe, which jsdom
// cannot lay out). The step BEFORE measurement is not: turning a rendered
// worksheet into the ordered flow items the paginator packs is pure
// parse-and-select, and that is what is pinned here.
//
// THE GUARANTEE, unchanged across the migration even though the implementation
// moved from parsing renderer HTML to walking the viewer's tree: a multi-column
// row comes back as ONE flow item with both cells inside it. paginate never
// splits a flow item, so that is what stops a side-by-side layout being torn in
// half across a fold. Before S5.5 this held because the renderer emitted a
// columns container as a single element; now it holds because the ROW is the
// unit we select. Same property, deliberately re-proven rather than assumed.
//
// Also pinned: cloneDocumentStyles carries the app's CSS into a foreign
// document, which is the S5.5 answer to how KaTeX's fonts reach the measure
// iframe with URLs that actually resolve (see capture.ts).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { ActivityDocument } from '@activity/schema';
import {
  ViewerContainer,
  createMockCheckService,
  createViewerStore,
  sanitizeActivityDocument,
  type SanitizedActivityDocument,
} from '@activity/viewer';
import { cloneDocumentStyles, flattenViewerBlocks } from '../lib/foldable/capture';

const text = (value: string) => ({ type: 'text', text: value, marks: [] });

/** A section that is: intro paragraph → a weighted 2-column row → outro.
 *  Parsed through the real schema so print defaults materialize, then through
 *  the real sanitizer — the same pipeline the print route runs. */
function docWithColumns(): SanitizedActivityDocument {
  return sanitizeActivityDocument(ActivityDocument.parse({
    schemaVersion: 2,
    meta: { title: 'Columns foldable', course: 'Algebra II' },
    sections: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        rows: [
          {
            id: 'a1111111-1111-4111-8111-111111111111',
            gridLines: 'inherit',
            columns: [
              {
                id: 'c1111111-1111-4111-8111-111111111111',
                blocks: [
                  {
                    id: 'b1111111-1111-4111-8111-111111111111',
                    type: 'paragraph',
                    content: [text('Intro paragraph.')],
                  },
                ],
              },
            ],
          },
          {
            id: 'a2222222-1111-4111-8111-111111111111',
            gridLines: 'inherit',
            columns: [
              {
                id: 'c2222222-1111-4111-8111-111111111111',
                width: 2,
                blocks: [
                  {
                    id: 'b2222222-1111-4111-8111-111111111111',
                    type: 'paragraph',
                    content: [text('Left cell, the wide one.')],
                  },
                ],
              },
              {
                id: 'c3333333-1111-4111-8111-111111111111',
                width: 1,
                blocks: [
                  {
                    id: 'b3333333-1111-4111-8111-111111111111',
                    type: 'paragraph',
                    content: [text('Right cell.')],
                  },
                ],
              },
            ],
          },
          {
            id: 'a3333333-1111-4111-8111-111111111111',
            gridLines: 'inherit',
            columns: [
              {
                id: 'c4444444-1111-4111-8111-111111111111',
                blocks: [
                  {
                    id: 'b4444444-1111-4111-8111-111111111111',
                    type: 'paragraph',
                    content: [text('Outro paragraph.')],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }));
}

function renderWorksheet() {
  const store = createViewerStore({
    userId: 'dddddddd-0000-4000-8000-000000000001',
    activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
    checkService: createMockCheckService({}),
  });
  return render(
    createElement(ViewerContainer, {
      document: docWithColumns(),
      store,
      mode: 'print',
    }),
  );
}

const rowsOf = (container: HTMLElement) =>
  flattenViewerBlocks(container).filter((el) =>
    el.classList.contains('viewer-row'),
  );

describe('flattenViewerBlocks — a multi-column row flows whole', () => {
  it('returns one flow item per row, in document order', () => {
    const { container } = renderWorksheet();
    const rows = rowsOf(container);

    expect(rows).toHaveLength(3);
    expect(rows[0]?.textContent).toContain('Intro paragraph.');
    expect(rows[2]?.textContent).toContain('Outro paragraph.');
  });

  it('keeps both cells of a 2-column row inside ONE item', () => {
    const { container } = renderWorksheet();
    const wide = rowsOf(container)[1]!;

    // The load-bearing assertion: not two items, one item containing two
    // columns. paginate cannot split a flow item, so the pair cannot straddle
    // a fold.
    expect(wide.getAttribute('data-column-count')).toBe('2');
    expect(wide.querySelectorAll('.viewer-column')).toHaveLength(2);
    expect(wide.textContent).toContain('Left cell, the wide one.');
    expect(wide.textContent).toContain('Right cell.');
  });

  it('carries the authored column ratio with it', () => {
    // The ratio rides the row as a grid track list, so it survives being moved
    // into a panel — which is why the row, and not the block, is the unit that
    // gets captured.
    const { container } = renderWorksheet();
    const wide = rowsOf(container)[1]!;

    expect(wide.getAttribute('style') ?? '').toMatch(/2fr|--activity/);
  });
});

describe('cloneDocumentStyles — the app’s CSS reaches a foreign document', () => {
  it('captures both <style> and <link rel=stylesheet>', () => {
    const style = document.createElement('style');
    style.textContent = '.probe { color: red }';
    document.head.appendChild(style);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://example.test/app.css';
    document.head.appendChild(link);

    const tags = cloneDocumentStyles(document);

    expect(tags).toContain('.probe { color: red }');
    expect(tags).toContain('https://example.test/app.css');

    style.remove();
    link.remove();
  });
});
