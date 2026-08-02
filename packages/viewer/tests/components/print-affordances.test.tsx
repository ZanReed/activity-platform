// =============================================================================
// print-affordances.test.tsx — the paper conventions are IN THE DOM (S5 T1)
// -----------------------------------------------------------------------------
// A printed worksheet answers with conventions that have no screen equivalent:
// circle a letter, write a letter on a line, number the steps in a box. These
// pin that the markup for those conventions exists, always, in the ordinary
// screen render.
//
// WHY "always" is the load-bearing word: the viewer renders with mode='screen',
// and a student pressing Ctrl+P (or File > Print) never changes that — the
// browser prints the screen DOM with the print stylesheet applied, and gives no
// hook to build anything first. So an affordance rendered only when
// mode === 'print' would be absent from every real student printout while
// passing any test that rendered it in print mode. That is the exact shape of
// the S4 bug where both sides of an integration were written against the same
// wrong assumption and both passed: these tests deliberately render in SCREEN
// mode, which is the mode printing actually happens from.
//
// The stylesheet's half of the contract (hidden on screen, revealed in print)
// is pinned in styles.test.ts; the rendered-output half is pinned here.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import MultipleChoice from '../../src/blocks/MultipleChoice.js';
import Matching from '../../src/blocks/Matching.js';
import Ordering from '../../src/blocks/Ordering.js';
import { choiceLetter } from '../../src/blocks/paperAffordances.js';
import { sanitizedBlockFixture } from '../../src/fixtures/index.js';
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
    <ViewerProvider store={store} sectionByBlock={{}}>
      {ui}
    </ViewerProvider>,
  );
}

describe('choiceLetter — one convention, shared', () => {
  it('labels positions A, B, C the way the renderer does', () => {
    expect(choiceLetter(0)).toBe('A');
    expect(choiceLetter(1)).toBe('B');
    expect(choiceLetter(25)).toBe('Z');
  });

  it('wraps rather than growing to AA (matching the renderer exactly)', () => {
    // Not because 27 options is sensible, but because the two surfaces must
    // agree on what they call the 27th thing rather than disagreeing silently.
    expect(choiceLetter(26)).toBe('A');
  });
});

describe('multiple choice prints a circle-me letter', () => {
  it('renders a letter per choice in SCREEN mode', () => {
    const block = sanitizedBlockFixture('multiple_choice');
    const { container } = harness(<MultipleChoice block={block as never} mode="screen" />);

    const letters = Array.from(container.querySelectorAll('.viewer-mc__letter'));
    const choices = Array.from(container.querySelectorAll('.viewer-mc__choice'));
    expect(letters.length).toBe(choices.length);
    expect(letters.length).toBeGreaterThan(1);
    expect(letters[0]?.textContent).toBe('A');
    expect(letters[1]?.textContent).toBe('B');
  });

  it('hides the letters from assistive tech (the label already names the choice)', () => {
    const block = sanitizedBlockFixture('multiple_choice');
    const { container } = harness(<MultipleChoice block={block as never} mode="screen" />);
    for (const letter of Array.from(container.querySelectorAll('.viewer-mc__letter'))) {
      expect(letter.getAttribute('aria-hidden')).toBe('true');
    }
  });
});

describe('matching prints a write-the-letter line', () => {
  it('renders one line per item in SCREEN mode', () => {
    const block = sanitizedBlockFixture('matching');
    const { container } = harness(<Matching block={block as never} mode="screen" />);

    const lines = container.querySelectorAll('.viewer-matching__letter-line');
    const items = container.querySelectorAll('.viewer-matching__item');
    expect(items.length).toBeGreaterThan(0);
    expect(lines.length).toBe(items.length);
  });

  it('letters the bank with the shared convention', () => {
    const block = sanitizedBlockFixture('matching');
    const { container } = harness(<Matching block={block as never} mode="screen" />);
    const bankLetters = Array.from(container.querySelectorAll('.viewer-matching__letter'));
    expect(bankLetters.length).toBeGreaterThan(0);
    expect(bankLetters[0]?.textContent).toBe('A.');
  });

  it('keeps the screen control and the paper line as SEPARATE elements', () => {
    // They are hidden on opposite media. If they were ever merged into one
    // element, one of the two surfaces would lose its way to answer.
    const block = sanitizedBlockFixture('matching');
    const { container } = harness(<Matching block={block as never} mode="screen" />);
    expect(container.querySelector('.viewer-matching__select')).not.toBeNull();
    expect(container.querySelector('.viewer-matching__letter-line')).not.toBeNull();
  });
});

describe('ordering prints a number-the-steps box', () => {
  it('renders one box per row in SCREEN mode', () => {
    const block = sanitizedBlockFixture('ordering');
    const { container } = harness(<Ordering block={block as never} mode="screen" />);

    const boxes = container.querySelectorAll('.viewer-ordering__number-box');
    const items = container.querySelectorAll('.viewer-ordering__item');
    expect(items.length).toBeGreaterThan(0);
    expect(boxes.length).toBe(items.length);
  });

  it('leaves the box EMPTY (the student writes the number)', () => {
    // A pre-filled box would be printing the answer — the served order is a
    // shuffle, so any number we printed would be wrong anyway.
    const block = sanitizedBlockFixture('ordering');
    const { container } = harness(<Ordering block={block as never} mode="screen" />);
    for (const box of Array.from(container.querySelectorAll('.viewer-ordering__number-box'))) {
      expect(box.textContent).toBe('');
    }
  });

  it('hides the boxes from assistive tech', () => {
    const block = sanitizedBlockFixture('ordering');
    const { container } = harness(<Ordering block={block as never} mode="screen" />);
    for (const box of Array.from(container.querySelectorAll('.viewer-ordering__number-box'))) {
      expect(box.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
