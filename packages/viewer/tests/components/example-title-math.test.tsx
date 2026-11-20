// =============================================================================
// example-title-math.test.tsx — `$…$` in a worked/faded example's title
// -----------------------------------------------------------------------------
// The title is a plain string, and the import format's own example puts math
// in it (`title: Solving $2x + 3 = 11$`). The viewer printed it raw, dollars
// and all, on screen and in print (walkthrough stress test, 2026-11-20). These
// pins read the RENDERED heading: KaTeX markup present, no literal "$" left.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import { loadMathRenderer } from '../../src/inline/math.js';
import { splitMathText } from '../../src/inline/splitMathText.js';
import { documentUsesMath } from '../../src/inline/mathPreload.js';
import WorkedExample from '../../src/blocks/WorkedExample.js';
import FadedWorkedExample from '../../src/blocks/FadedWorkedExample.js';
import { sanitizedBlockFixture } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

function renderBlock(ui: React.ReactElement) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
    checkService: createMockCheckService({}),
  });
  return render(
    <ViewerProvider store={store} defaultSectionId="sec-1">
      {ui}
    </ViewerProvider>,
  );
}

beforeAll(async () => {
  await loadMathRenderer(); // real KaTeX, resident — renders on first paint
});

describe('example titles render their math', () => {
  for (const mode of ['screen', 'print'] as const) {
    it(`worked example (${mode})`, () => {
      const block = {
        ...(sanitizedBlockFixture('worked_example') as object),
        title: 'Solving $3(x - 2) = 12$',
      } as never;
      const { container } = renderBlock(<WorkedExample block={block} mode={mode} />);
      const h = container.querySelector('.viewer-worked-example__title')!;
      expect(h.querySelector('.katex')).not.toBeNull();
      expect(h.querySelector('[data-math-pending]')).toBeNull();
      // KaTeX's MathML annotation carries the source; the visible text must not.
      expect(h.querySelector('.katex-html')?.textContent ?? '').not.toContain('$');
      expect(h.textContent?.startsWith('Solving ')).toBe(true);
      expect(h.querySelector('annotation')?.textContent).toBe('3(x - 2) = 12');
    });

    it(`faded example (${mode})`, () => {
      const block = {
        ...(sanitizedBlockFixture('faded_worked_example') as object),
        title: 'Your turn: solve $5x + 4 = 29$',
      } as never;
      const { container } = renderBlock(<FadedWorkedExample block={block} mode={mode} />);
      const h = container.querySelector('.viewer-faded-example__title')!;
      expect(h.querySelector('.katex')).not.toBeNull();
      expect(h.querySelector('annotation')?.textContent).toBe('5x + 4 = 29');
      expect(h.textContent).not.toMatch(/\$5x/);
    });
  }

  it('leaves a math-free title as plain text', () => {
    const block = {
      ...(sanitizedBlockFixture('worked_example') as object),
      title: 'Worked example',
    } as never;
    const { container } = renderBlock(<WorkedExample block={block} mode="screen" />);
    const h = container.querySelector('.viewer-worked-example__title')!;
    expect(h.innerHTML).toBe('Worked example');
  });
});

describe('splitMathText — the importer\'s delimiter rules', () => {
  it('keeps currency as text', () => {
    // The closing `$` of a would-be pair is followed by a digit: not math.
    expect(splitMathText('Save $5 on a $20 item')).toEqual([
      { text: 'Save $5 on a $20 item' },
    ]);
    expect(splitMathText('Pay \\$3 for $x$')).toEqual([
      { text: 'Pay $3 for ' },
      { latex: 'x' },
    ]);
  });
  it('needs non-space just inside the delimiters', () => {
    expect(splitMathText('a $ b $ c')).toEqual([{ text: 'a $ b $ c' }]);
  });
  it('takes $$…$$ as one run', () => {
    expect(splitMathText('Find $$x^2$$ now')).toEqual([
      { text: 'Find ' },
      { latex: 'x^2' },
      { text: ' now' },
    ]);
  });
});

describe('the KaTeX preload sees title math', () => {
  it('a document whose only math is an example title still preloads', () => {
    const doc = { blocks: [{ type: 'worked_example', title: 'Solve $x+1=2$', content: [] }] };
    expect(documentUsesMath(doc)).toBe(true);
    expect(
      documentUsesMath({ blocks: [{ type: 'worked_example', title: 'Plain', content: [] }] }),
    ).toBe(false);
  });
});
