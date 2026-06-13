// =============================================================================
// DevFoldableColumns.tsx — dev-only foldable-with-columns verification harness
// -----------------------------------------------------------------------------
// Mounted only under import.meta.env.DEV (see App.tsx). It builds the journal
// foldable from a fixed document containing a top-level columns container and
// shows the result in the same <iframe srcDoc> the real print route uses, so a
// real browser proves what jsdom can't: that a columns block flows whole into a
// panel, lays out side-by-side at the panel's width, and its fr tracks resolve
// to the authored proportions (here 2:1) rather than collapsing or overflowing.
//
// Not product UI — a measurement bench kept around for future foldable work.
// =============================================================================

import { useEffect, useState } from 'react';
import { ActivityDocument } from '@activity/schema';
import { buildFoldableDocument } from '../lib/foldable';

// Intro → a 2:1 weighted, ruled columns container with reserved work space in
// each cell → outro. Enough content that the side-by-side layout, the fr
// proportions, and the per-cell work-space floor are all visible in one panel.
const columnsDoc: ActivityDocument = ActivityDocument.parse({
  schemaVersion: 1,
  meta: {
    title: 'Foldable × columns — dev bench',
    course: 'Algebra II',
    activityType: 'worksheet',
  },
  sections: [
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      title: 'Side-by-side work',
      blocks: [
        {
          id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Intro paragraph before the columns. The container below should flow whole into a panel and lay out side-by-side at the panel width.',
            },
          ],
        },
        {
          id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          type: 'columns',
          gridLines: 'on',
          columns: [
            {
              id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
              width: 2,
              minHeight: 6,
              blocks: [
                {
                  id: 'd1d1d1d1-d1d1-4d1d-8d1d-d1d1d1d1d1d1',
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Wide cell (weight 2). At 2fr this track should be roughly twice the narrow one. The reserved work space (minHeight 6rem) gives room to write below.',
                    },
                  ],
                },
              ],
            },
            {
              id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
              width: 1,
              minHeight: 6,
              blocks: [
                {
                  id: 'e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1',
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Narrow cell (weight 1).' }],
                },
              ],
            },
          ],
        },
        {
          id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
          type: 'paragraph',
          content: [{ type: 'text', text: 'Outro paragraph after the columns.' }],
        },
      ],
    },
  ],
});

export default function DevFoldableColumns() {
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState<'building' | 'ready' | 'error'>('building');

  useEffect(() => {
    let cancelled = false;
    buildFoldableDocument(columnsDoc)
      .then((out) => {
        if (cancelled) return;
        setHtml(out);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Foldable × columns — dev bench</h1>
      <p style={{ color: '#475569', margin: '4px 0 12px' }}>
        Status: <strong data-testid="fold-status">{status}</strong>. The columns
        container should appear side-by-side (≈2:1) within a panel, never split.
      </p>
      <iframe
        title="foldable-columns-preview"
        srcDoc={html}
        style={{ width: '100%', height: '80vh', border: '1px solid #cbd5e1' }}
      />
    </main>
  );
}
