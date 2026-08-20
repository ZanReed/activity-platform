// =============================================================================
// sub-part-lettering.test.tsx — "(a) ___ (b) ___" on a numbered multi-blank
// -----------------------------------------------------------------------------
// Ruling N7. The decision logic is pinned in numbering.test.ts; this file pins
// what actually reaches the page, because the markup is where two things can go
// wrong that a boolean cannot see: the letter must be DERIVED from render
// position (never stored), and it must not be announced twice to a screen
// reader now that the block number is already announced by the wrapper's group
// label (ruling D3).
//
// The fixture fill_in_blank carries ONE blank, so the harness route cannot show
// the positive case at all — which is exactly why it is built explicitly here
// rather than left to a dev-server eyeball.
// =============================================================================

import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import FillInBlank from '../../src/blocks/FillInBlank.js';
import type { ResolvedLabel } from '../../src/numbering/numbering.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

function harness(ui: ReactElement) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService({}),
  });
  return render(
    <ViewerProvider store={store} defaultSectionId="sec-1">
      {ui}
    </ViewerProvider>,
  );
}

/** A served fill_in_blank with `count` blanks in its content. */
const blanksBlock = (count: number) => ({
  id: 'blk-1',
  type: 'fill_in_blank',
  content: [
    { type: 'text', text: 'Solve: ', marks: [] },
    ...Array.from({ length: count }, (_, i) => ({
      type: 'blank',
      id: `b${i}`,
      answerType: 'text',
    })),
  ],
});

const letters = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.viewer-blank__sublabel')).map(
    (el) => el.textContent,
  );

const NUMBERED: ResolvedLabel = { kind: 'number', n: 3 };

describe('sub-part lettering', () => {
  it('letters each gap in order on a numbered multi-blank problem', () => {
    const { container } = harness(
      <FillInBlank block={blanksBlock(3) as never} mode="screen" label={NUMBERED} />,
    );
    expect(letters(container)).toEqual(['(a)', '(b)', '(c)']);
  });

  it('does not letter a single-blank problem', () => {
    const { container } = harness(
      <FillInBlank block={blanksBlock(1) as never} mode="screen" label={NUMBERED} />,
    );
    expect(letters(container)).toEqual([]);
  });

  it('does not letter a custom-labelled problem (out of sequence)', () => {
    const { container } = harness(
      <FillInBlank
        block={blanksBlock(3) as never}
        mode="screen"
        label={{ kind: 'custom', text: 'Warm-up' }}
      />,
    );
    expect(letters(container)).toEqual([]);
  });

  it('does not letter when no label is passed at all — the nested-step case', () => {
    // ChildBlocks renders a faded example's steps and passes no label, so this
    // is the faded-step exclusion as the component actually sees it. The box
    // letters its own steps with a real <ol>; a second scheme would collide.
    const { container } = harness(
      <FillInBlank block={blanksBlock(3) as never} mode="screen" />,
    );
    expect(letters(container)).toEqual([]);
  });

  it('folds the part into the accessible NAME and hides the visible marker', () => {
    // The marker is decoration once the input's own name carries "Part b";
    // exposing both would say it twice. And the problem number is absent from
    // here entirely — the wrapper's group label announces that once (D3).
    const { container } = harness(
      <FillInBlank block={blanksBlock(2) as never} mode="screen" label={NUMBERED} />,
    );

    for (const marker of Array.from(
      container.querySelectorAll('.viewer-blank__sublabel'),
    )) {
      expect(marker.getAttribute('aria-hidden')).toBe('true');
    }

    const names = Array.from(
      container.querySelectorAll('.viewer-blank__input'),
    ).map((el) => el.getAttribute('aria-label'));
    expect(names).toEqual([
      'Part a, blank 1 of 2',
      'Part b, blank 2 of 2',
    ]);
    for (const name of names) expect(name).not.toContain('3');
  });

  it('keeps the plain positional name when the problem is not lettered', () => {
    const { container } = harness(
      <FillInBlank block={blanksBlock(2) as never} mode="screen" />,
    );
    const names = Array.from(
      container.querySelectorAll('.viewer-blank__input'),
    ).map((el) => el.getAttribute('aria-label'));
    expect(names).toEqual(['Blank 1 of 2', 'Blank 2 of 2']);
  });
});
