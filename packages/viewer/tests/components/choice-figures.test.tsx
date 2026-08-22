// =============================================================================
// choice-figures.test.tsx — what a choice figure actually puts on the page
// -----------------------------------------------------------------------------
// These fields (MultipleChoiceOption.image/.graph, MatchingItem/Target's same
// slot) were authored by the editor, accepted by the importer, carried through
// the sanitizer and stored in the database for eight days while EVERY student
// saw a blank option. The implementation lived in the renderer package, deleted
// at S9 Drop 4; the declarations outlived it.
//
// So the bar here is the one commit 4a50b00 set for showCellLabels, and it is
// deliberately higher than "a test exists":
//
//   ASSERT CONTENT, NEVER EXISTENCE. `querySelector('.viewer-choice-figure')
//   !== null` passes against an empty <div>, which is precisely the shape of
//   guard that let eight orphans survive. Every assertion below reaches for
//   something only a real render can produce: an <img> with the authored src,
//   an <svg> the engine actually drew, the accessible name of the control.
//
//   ASSERT ABSENCE ONLY AFTER SETTLING. The graph engine is imported lazily
//   (eng review E1 — multiple_choice is an EAGER binding, so a static import
//   would land in the student shell). That means a naive "there is no figure"
//   assertion can pass merely by running before the chunk resolves — a test
//   passing for the wrong reason, which is the sw-lane lesson restated: a lane
//   that passes because of what is ABSENT from the machine is not passing, it
//   is unobserved. Absence is therefore asserted only after a positive signal
//   has settled.
//
// MUTATION-TESTED: reverting the <ChoiceFigure> mount in MultipleChoice.tsx
// turns the figure cases red; reverting the A6 grid condition turns the layout
// case red; reverting the A4 naming branch turns the accessible-name case red.
// =============================================================================

import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import MultipleChoice from '../../src/blocks/MultipleChoice.js';
import Matching from '../../src/blocks/Matching.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

// A 1x1 gif. A data: URI, not an http one, for the same reason the block-level
// image fixture uses one: the print e2e blocks all network, so a remote src
// would make a broken-image glyph the thing that "actually prints".
const PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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

const t = (text: string) => ({ type: 'text', text, marks: [] });

/** A line through the origin — the marquee "which graph shows y = 2x?" case. */
const lineGraph = () => ({
  axis: {
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    xGridStep: 1,
    yGridStep: 1,
    showGrid: true,
    snapToGrid: true,
  },
  drawables: [{ kind: 'line', through: [[0, 0], [1, 2]], color: 'slate' }],
});

const mcBlock = (choices: unknown[]) => ({
  id: 'mc-1',
  type: 'multiple_choice',
  prompt: [t('Which graph shows y = 2x?')],
  choices,
  multiSelect: false,
  skills: [],
});

describe('choice figures reach the page', () => {
  it('renders an authored choice IMAGE with its src and alt', async () => {
    harness(
      <MultipleChoice
        mode="screen"
        block={
          mcBlock([
            { id: 'c1', content: [t('A square')], image: { src: PIXEL, alt: 'a square' } },
            { id: 'c2', content: [t('A circle')] },
          ]) as never
        }
      />,
    );

    const img = await screen.findByAltText('a square');
    // CONTENT, not existence: the element carries the authored source.
    expect(img.getAttribute('src')).toBe(PIXEL);
    expect(img.tagName).toBe('IMG');
  });

  it('renders an authored choice GRAPH as real drawn SVG', async () => {
    const { container } = harness(
      <MultipleChoice
        mode="screen"
        block={mcBlock([{ id: 'c1', content: [], graph: lineGraph() }]) as never}
      />,
    );

    // The engine is lazily imported, so this must wait — and what it waits for
    // is the SVG the engine DREW, not a wrapper the component always emits.
    await waitFor(() => {
      const svg = container.querySelector('.viewer-choice-figure__graph svg');
      expect(svg, 'the graph engine never produced an <svg>').not.toBeNull();
      // data-drawables is the engine's own count of what it rendered — the
      // same signal print-twins.test.tsx asserts. An empty wrapper cannot
      // fake it.
      expect(svg?.getAttribute('data-drawables')).toBe('1');
    });
  });

  it('does NOT render a figure when none is authored — checked after settling', async () => {
    const { container } = harness(
      <MultipleChoice
        mode="screen"
        block={
          mcBlock([
            { id: 'c1', content: [t('plain')] },
            { id: 'c2', content: [], graph: lineGraph() },
          ]) as never
        }
      />,
    );

    // Settle FIRST on the choice that does have a graph. Without this the
    // absence assertion below could pass simply by running before the lazy
    // chunk resolved, which would make it vacuous rather than false.
    await waitFor(() => {
      expect(container.querySelector('.viewer-choice-figure__graph svg')).not.toBeNull();
    });

    const figures = container.querySelectorAll('.viewer-choice-figure');
    expect(figures).toHaveLength(1);
  });

  it('image WINS when a choice carries both (A5)', async () => {
    const { container } = harness(
      <MultipleChoice
        mode="screen"
        block={
          mcBlock([
            {
              id: 'c1',
              content: [t('both')],
              image: { src: PIXEL, alt: 'the image' },
              graph: lineGraph(),
            },
          ]) as never
        }
      />,
    );

    const img = await screen.findByAltText('the image');
    expect(img).toBeTruthy();
    // And the graph branch never ran — asserted after the image settled, so
    // this is a real absence rather than an early look.
    expect(container.querySelector('.viewer-choice-figure__graph')).toBeNull();
    expect(container.querySelector('[data-choice-figure="image"]')).not.toBeNull();
  });
});

describe('the arrangement is conditional on content (A6)', () => {
  it('grids only when EVERY choice carries a figure', () => {
    const { container: allFigures } = harness(
      <MultipleChoice
        mode="screen"
        block={
          mcBlock([
            { id: 'c1', content: [], graph: lineGraph() },
            { id: 'c2', content: [], graph: lineGraph() },
          ]) as never
        }
      />,
    );
    expect(
      allFigures.querySelector('.viewer-mc__choices')?.getAttribute('data-figure-layout'),
    ).toBe('grid');

    const { container: mixed } = harness(
      <MultipleChoice
        mode="screen"
        block={
          mcBlock([
            { id: 'c1', content: [], graph: lineGraph() },
            { id: 'c2', content: [t('just text')] },
          ]) as never
        }
      />,
    );
    // A mixed question stays stacked: a grid cell of bare text beside cells of
    // graphs reads as ragged, and a vertical list is how options scan.
    expect(
      mixed.querySelector('.viewer-mc__choices')?.getAttribute('data-figure-layout'),
    ).toBeNull();
  });
});

describe('a figure-only choice is still named (A4)', () => {
  it('names a figure-only choice whose alt is EMPTY — the case A4 exists for', async () => {
    // ⚠ THIS TEST WAS VACUOUS ON ITS FIRST DRAFT, and the mutation run is what
    // caught it. Written with alt: 'a parabola', it passed with the A4 branch
    // reverted — because a non-empty alt names the control on its own, so the
    // branch never ran. `ChoiceImage.alt` DEFAULTS TO '' in the schema, which
    // is exactly the case that produces an unnamed radio, so that is the case
    // worth pinning. Same lesson as P9: when a check's headline lesson is
    // "this was vacuous", re-run that lesson over the fix.
    harness(
      <MultipleChoice
        mode="screen"
        block={mcBlock([{ id: 'c1', content: [], image: { src: PIXEL, alt: '' } }]) as never}
      />,
    );
    // With A4 reverted this is an unnamed radio — an axe violation, and the
    // a11y lane has caught the sibling case before.
    const radio = await screen.findByRole('radio', { name: /choice a/i });
    expect(radio).toBeTruthy();
  });

  it('keeps an authored alt as the name when one is supplied', async () => {
    harness(
      <MultipleChoice
        mode="screen"
        block={
          mcBlock([{ id: 'c1', content: [], image: { src: PIXEL, alt: 'a parabola' } }]) as never
        }
      />,
    );
    // The fallback must not CLOBBER a real description — "Choice A" is worse
    // than "a parabola" for someone who cannot see the figure.
    const radio = await screen.findByRole('radio', { name: /a parabola/i });
    expect(radio).toBeTruthy();
  });

  it('falls back to the choice LETTER for a graph-only choice', async () => {
    harness(
      <MultipleChoice
        mode="screen"
        block={mcBlock([{ id: 'c1', content: [], graph: lineGraph() }]) as never}
      />,
    );
    // renderGraphSvg hardcodes aria-hidden on its <svg>, so a graph can never
    // name anything. The letter is the fallback — the same resolution
    // showCellLabels used for table sub-labels.
    const radio = await screen.findByRole('radio', { name: /choice a/i });
    expect(radio).toBeTruthy();
  });
});

describe('matching carries figures on both sides', () => {
  const matchBlock = () => ({
    id: 'mt-1',
    type: 'matching',
    prompt: [t('Match the graph to its equation')],
    items: [{ id: 'i1', content: [t('y = 2x')] }],
    targets: [{ id: 'g1', content: [], graph: lineGraph() }],
    skills: [],
  });

  it('draws a target figure and marks the bank as gridded', async () => {
    const { container } = harness(<Matching mode="screen" block={matchBlock() as never} />);

    await waitFor(() => {
      const svg = container.querySelector(
        '.viewer-matching__bank .viewer-choice-figure__graph svg',
      );
      expect(svg, 'the bank never drew its target figure').not.toBeNull();
    });

    // A9: the bank grids, which is also what flips its page-break behaviour.
    expect(
      container.querySelector('.viewer-matching__bank')?.getAttribute('data-figure-layout'),
    ).toBe('grid');
    // …and the BLOCK carries the marker the print CSS resolves the conditional
    // from. Without it the bank could break internally while the block around
    // it still could not, which fixes nothing.
    expect(
      container.querySelector('[data-block-type="matching"]')?.getAttribute('data-has-figures'),
    ).toBe('true');
  });
});
