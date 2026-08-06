// @vitest-environment jsdom
// =============================================================================
// printLeak.test.tsx — the print channel's sentinel leak scan (G3)
// -----------------------------------------------------------------------------
// The THIRD leak channel. Read = blanket sentinel scan, check = value scan
// with a releasable list — and print had NO wire proof at all: its safety was
// "it consumes the sanitizer", which is a design claim, not a scan (s2-retro
// finding 12). This drives the REAL teacher print route over the same
// fully-loaded secret-bearing fixture the other two channels scan, with the
// answer key OFF (showAnswers=false is the pinned posture: the key is a
// second, DELIBERATE secret channel — a scan with it on would be scanning a
// page that is supposed to show answers).
//
// Two legs, deliberately:
//   DATA — the document handed to ViewerContainer. Complete: covers blocks
//          whose lazy components never mount in jsdom.
//   DOM  — the rendered page. Catches print-only rendering (the glossary,
//          print twins) that could re-derive content past the sanitized doc.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import {
  NUM,
  RELEASABLE,
  STR,
  fullyLoadedDocument,
} from '@activity/viewer/fixtures/leak';

const ACTIVITY_ID = 'aaaaaaaa-0000-4000-8000-0000000001ea';

const h = vi.hoisted(() => ({
  row: { current: null as Record<string, unknown> | null },
  servedDoc: { current: null as unknown },
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          is: () => ({
            maybeSingle: async () => ({ data: h.row.current, error: null }),
          }),
        }),
      }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  },
  supabaseConfigured: true,
  MISSING_ENV: 'missing env',
}));

vi.mock('../lib/foldable', () => ({
  buildFoldableDocument: async () => '<html></html>',
}));

vi.mock('@activity/viewer', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const Real = actual.ViewerContainer as (props: unknown) => unknown;
  return {
    ...actual,
    ViewerContainer: (props: { document: unknown }) => {
      h.servedDoc.current = props.document;
      return createElement(Real as never, props as never);
    },
  };
});

const { default: ActivityPrint } = await import('../routes/ActivityPrint');

beforeEach(() => {
  h.servedDoc.current = null;
  h.row.current = {
    id: ACTIVITY_ID,
    title: 'leak scan',
    draft_content: fullyLoadedDocument(),
    current_version_id: null,
  };
});
afterEach(cleanup);

describe('the print route never carries a sentinel (answer key off)', () => {
  it('strips every secret from the served document AND the rendered DOM', async () => {
    // Non-vacuity first: the RAW fixture really carries the secrets — a scan
    // over a document with nothing to strip proves nothing (the S2 lesson).
    const raw = JSON.stringify(fullyLoadedDocument());
    expect(raw).toContain(STR);
    expect(raw).toContain(String(NUM));
    expect(raw).toContain(RELEASABLE);

    render(
      <MemoryRouter initialEntries={[`/activity/${ACTIVITY_ID}/print`]}>
        <Routes>
          <Route path="/activity/:id/print" element={<ActivityPrint />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(document.querySelector('.viewer')).not.toBeNull(),
    );

    // DATA leg — complete coverage regardless of which lazy components mount.
    const served = JSON.stringify(h.servedDoc.current);
    expect(served.length).toBeGreaterThan(0);
    expect(served).not.toContain(STR);
    expect(served).not.toContain(String(NUM));
    // Solutions/feedback content is check-channel material; the print page has
    // no checked state, so it must not carry it either.
    expect(served).not.toContain(RELEASABLE);

    // DOM leg — what actually reaches paper.
    const html = document.body.innerHTML;
    expect(html.length).toBeGreaterThan(500); // something real rendered
    expect(html).not.toContain(STR);
    expect(html).not.toContain(String(NUM));
    expect(html).not.toContain(RELEASABLE);
    // The key is off: no answer-key nodes at all.
    expect(document.querySelectorAll('[data-answer-key]')).toHaveLength(0);
  });
});
