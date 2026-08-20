// =============================================================================
// numbering-output.test.tsx — the registry's `numbered` binds to RENDERED OUTPUT
// -----------------------------------------------------------------------------
// THIS IS THE GUARD THAT WOULD HAVE CAUGHT THE BUG THIS WHOLE SLICE EXISTS FOR,
// and it is worth being precise about why the existing one did not.
//
// `tests/registry.test.ts` already guards `numbered`. It binds the registry's
// declaration to `block-predicates.ts` — declaration against declaration. Both
// sides stayed perfectly consistent while the thing that made them TRUE was
// deleted: the renderer's `renderNumberGutter` died with packages/renderer at
// S9 Drop 4, the viewer never inherited the job, and for four months every
// numbered type declared `numbered: 'always'` and drew nothing. The suite was
// green the entire time.
//
// That is policy P1 in its purest form — a primitive is not delivered until
// something calls it — and the lesson generalises past this field: when a
// package is deleted, its surviving DECLARATIONS need a consumer audit, because
// a guard comparing two declarations outlives the implementation and is then
// worse than no guard, since it reads as coverage.
//
// So this file asserts against the DOM. Every registry type that declares
// itself numbered must actually put a number on the page, in the real container,
// for the real fixture. A future deletion of the render path turns this red on
// the commit that does it.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  ViewerContainer,
  blockRegistry,
  createMockCheckService,
  createViewerStore,
  registeredBlockTypes,
} from '../../src/index.js';
import { sanitizedFixtureDocument } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

function renderFixture() {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService({}),
  });
  return render(
    <ViewerContainer
      document={sanitizedFixtureDocument()}
      store={store}
      versionId={VERSION}
    />,
  );
}

/** Wrappers carrying a rendered number, by the block type they wrap. */
function numberedTypes(container: HTMLElement): Set<string> {
  const found = new Set<string>();
  for (const el of Array.from(
    container.querySelectorAll('.viewer-block[data-block-number]'),
  )) {
    const type = el.getAttribute('data-block-type');
    const gutter = el.querySelector('.viewer-block__number');
    // A wrapper flagged as numbered with no gutter inside it would be the
    // half-broken state this guard is most likely to meet.
    if (type && gutter && (gutter.textContent ?? '').trim().length > 0) {
      found.add(type);
    }
  }
  return found;
}

/** Types the registry says are ALWAYS numbered — the roster under test. */
const alwaysNumbered = registeredBlockTypes.filter(
  (type) => blockRegistry[type].numbered === 'always',
);

describe('every `numbered: always` type actually renders a number', () => {
  it('the roster is real and plural (anti-vacuity)', () => {
    // Without this, a registry refactor that emptied the roster would make
    // every assertion below pass over an empty loop — the shape of vacuity
    // this repo keeps re-learning.
    expect(alwaysNumbered.length).toBeGreaterThan(5);
    // The two the answer-key slice added, by name: reversing E7 must be argued
    // with here rather than done quietly.
    expect(alwaysNumbered).toContain('short_answer');
    expect(alwaysNumbered).toContain('essay');
  });

  it('each one puts a number on the page', () => {
    const { container } = renderFixture();
    const rendered = numberedTypes(container);

    const missing = alwaysNumbered.filter(
      (type) =>
        // `problem` is page-numbered but the fixture has no instance of it
        // (it is a tombstoned type — answer-key ruling E1), so it cannot be
        // asserted through a fixture render. Named rather than silently
        // filtered, so the exemption is visible.
        type !== 'problem' && !rendered.has(type),
    );

    expect(
      missing,
      `these types declare numbered:'always' and rendered NO number: ${missing.join(', ')}.\n` +
        'The registry declaration is not the feature — something has to draw it. ' +
        'This is exactly the state the viewer sat in for four months after the ' +
        'renderer was deleted, with the declaration-vs-declaration guard in ' +
        'registry.test.ts still green.',
    ).toEqual([]);
  });

  it('numbers run 1..N with no gaps and no repeats', () => {
    // A per-type check cannot see a broken SEQUENCE. Two blocks both numbered
    // "3", or a jump from 4 to 6, would satisfy every assertion above.
    const { container } = renderFixture();
    const seq = Array.from(
      container.querySelectorAll(".viewer-block__number[data-label-kind='number']"),
    ).map((el) => Number((el.textContent ?? '').replace('.', '')));

    expect(seq.length).toBeGreaterThan(5);
    expect(seq).toEqual(seq.map((_, i) => i + 1));
  });

  it('a numbered block is a labelled group, and the gutter is not read twice', () => {
    // Ruling D3: the number reaches assistive tech ONCE, from the wrapper.
    const { container } = renderFixture();
    const wrappers = Array.from(
      container.querySelectorAll('.viewer-block[data-block-number]'),
    );
    expect(wrappers.length).toBeGreaterThan(5);

    for (const wrapper of wrappers) {
      expect(wrapper.getAttribute('role')).toBe('group');
      const labelledBy = wrapper.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      const gutter = wrapper.querySelector('.viewer-block__number');
      expect(gutter?.id).toBe(labelledBy);
      // Named BY it, hidden FROM the reading order — otherwise "3." is
      // announced as the group name and again as loose text inside it.
      expect(gutter?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('an UNnumbered block gets no gutter, no group and no grid attribute', () => {
    // The negative direction. Without it, "everything is numbered" would pass
    // every test above — and prose wearing a problem number is a worse
    // worksheet than one with no numbers at all.
    const { container } = renderFixture();
    const plain = Array.from(
      container.querySelectorAll('.viewer-block:not([data-block-number])'),
    );
    expect(plain.length).toBeGreaterThan(3);

    for (const wrapper of plain) {
      expect(wrapper.querySelector('.viewer-block__number')).toBeNull();
      expect(wrapper.getAttribute('role')).not.toBe('group');
    }
  });
});
