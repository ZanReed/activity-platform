/**
 * @vitest-environment jsdom
 */
// =============================================================================
// number-line-runtime.test.ts — the kit-side number-line plumbing (chrome half)
// -----------------------------------------------------------------------------
// The 1-D sibling of runtime.test.ts. Covers the DOM-heavy number-line logic:
// parsing a block's chrome from its element (buildNumberLineChrome) and
// reflecting state into it (renderNumberLineChrome) — the feedback line's
// narrate/result modes (leaner than graphs: no mistakes), the solution slot,
// and confidence radios. The widget-mount path (attachNumberLineRuntime →
// mountNumberLineQuestion → JSXGraph) stays browser-verified, like the boards.
// The markup mirrors the renderer's number-line output.
// =============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildNumberLineChrome,
  renderNumberLineChrome,
} from '../src/runtime.js';
import type {
  NumberLineBlockState,
  NumberLineRuntimeBlockRef,
  GraphSectionStateView,
} from '../src/runtime-contract.js';

const NL_ID = '33333333-3333-4333-8333-333333333333';
const SECTION_ID = '44444444-4444-4444-8444-444444444444';

const esc = (s: string): string => s.replace(/"/g, '&quot;');

function mount(
  opts: {
    withSolution?: boolean;
    withConfidence?: boolean;
    interactionType?: string;
  } = {},
): NumberLineRuntimeBlockRef {
  const lineConfig = esc(JSON.stringify({ min: 0, max: 10, tickStep: 1 }));
  const answerKey = esc(JSON.stringify({ correctPoints: [3], tolerance: 0.1 }));
  const solution = opts.withSolution
    ? '<div class="js-solution" data-for-block="' + NL_ID + '" hidden>Because.</div>'
    : '';
  const confidence = opts.withConfidence
    ? '<fieldset class="js-confidence-rating">' +
      '<input type="radio" name="conf" value="unsure">' +
      '<input type="radio" name="conf" value="certain">' +
      '</fieldset>'
    : '';
  document.body.innerHTML =
    '<div class="block block-number-line" data-block-category="question"' +
    ' data-block-type="number_line" data-block-id="' + NL_ID + '"' +
    ' data-numberline-block-id="' + NL_ID + '"' +
    ' data-numberline-interaction-type="' + (opts.interactionType ?? 'plot_point') + '"' +
    ' data-numberline-config="' + lineConfig + '"' +
    ' data-numberline-answer-key="' + answerKey + '">' +
    '<div class="block-problem-body">' +
    '<div class="number-line-canvas" data-numberline-canvas="' + NL_ID + '" role="application" tabindex="0"></div>' +
    '<div class="js-numberline-feedback" data-for-numberline="' + NL_ID + '" aria-live="polite" hidden></div>' +
    solution +
    confidence +
    '</div></div>';
  const el = document.querySelector<HTMLElement>('[data-block-type="number_line"]')!;
  return {
    el,
    canvas: el.querySelector<HTMLElement>('.number-line-canvas')!,
    sectionId: SECTION_ID,
    interactionType: opts.interactionType ?? 'plot_point',
  };
}

function baseState(over: Partial<NumberLineBlockState> = {}): NumberLineBlockState {
  return {
    studentPoints: [],
    answered: false,
    result: null,
    solutionRevealed: false,
    confidence: null,
    ...over,
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('buildNumberLineChrome', () => {
  it('parses config + answer key + chrome elements from the element', () => {
    const ref = mount({ withSolution: true, withConfidence: true });
    const chrome = buildNumberLineChrome(NL_ID, ref);
    expect((chrome.config as { min: number }).min).toBe(0);
    expect((chrome.answerKey as { correctPoints: number[] }).correctPoints).toEqual([3]);
    expect(chrome.feedbackEl).not.toBeNull();
    expect(chrome.solutionEl).not.toBeNull();
    expect(chrome.confidenceRadios.length).toBe(2);
    expect(chrome.handle).toBeNull();
  });

  it('tolerates a malformed config attribute (parses to undefined, no throw)', () => {
    const ref = mount();
    ref.el.dataset.numberlineConfig = '{not json';
    const chrome = buildNumberLineChrome(NL_ID, ref);
    expect(chrome.config).toBeUndefined();
  });
});

describe('renderNumberLineChrome — feedback line', () => {
  const section = (over: Partial<GraphSectionStateView> = {}): GraphSectionStateView => ({
    checked: false,
    locked: false,
    ...over,
  });

  it('narrates a plotted point pre-check (SR-only via data-mode=narrate)', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount());
    renderNumberLineChrome(chrome, baseState({ studentPoints: [3], answered: true }), section());
    expect(chrome.feedbackEl!.hidden).toBe(false);
    expect(chrome.feedbackEl!.textContent).toBe('Point plotted at 3.');
    expect(chrome.feedbackEl!.getAttribute('data-mode')).toBe('narrate');
    expect(chrome.feedbackEl!.getAttribute('data-state')).toBeNull();
  });

  it('narrates multiple points', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount());
    renderNumberLineChrome(chrome, baseState({ studentPoints: [-4, 5], answered: true }), section());
    expect(chrome.feedbackEl!.textContent).toBe('Points plotted at -4, 5.');
  });

  it('narrates an interval answer', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount({ interactionType: 'plot_interval' }));
    renderNumberLineChrome(
      chrome,
      baseState({ answered: true, interval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' } }),
      section(),
    );
    expect(chrome.feedbackEl!.textContent).toBe('Interval from -2 (closed) to 4 (open).');
    expect(chrome.feedbackEl!.getAttribute('data-mode')).toBe('narrate');
  });

  it('narrates a one-sided ray as unbounded', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount({ interactionType: 'plot_interval' }));
    renderNumberLineChrome(
      chrome,
      baseState({ answered: true, interval: { min: 3, minStyle: 'closed' } }),
      section(),
    );
    expect(chrome.feedbackEl!.textContent).toBe(
      'Interval from 3 (closed) unbounded on the right.',
    );
  });

  it('shows the visible verdict after check (data-mode=result)', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount());
    renderNumberLineChrome(
      chrome,
      baseState({ studentPoints: [3], answered: true, result: true }),
      section({ checked: true }),
    );
    expect(chrome.feedbackEl!.textContent).toBe('Correct!');
    expect(chrome.feedbackEl!.getAttribute('data-mode')).toBe('result');
    expect(chrome.feedbackEl!.getAttribute('data-state')).toBe('correct');
  });

  it('shows a generic miss line for a wrong answer (no mistake feedback — lean)', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount());
    renderNumberLineChrome(
      chrome,
      baseState({ studentPoints: [5], answered: true, result: false }),
      section({ checked: true }),
    );
    expect(chrome.feedbackEl!.textContent).toBe('Not quite — try again.');
    expect(chrome.feedbackEl!.getAttribute('data-state')).toBe('incorrect');
  });

  it('stays hidden before the student answers', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount());
    renderNumberLineChrome(chrome, baseState(), section());
    expect(chrome.feedbackEl!.hidden).toBe(true);
  });
});

describe('renderNumberLineChrome — solution + confidence', () => {
  const section = (over: Partial<GraphSectionStateView> = {}): GraphSectionStateView => ({
    checked: false,
    locked: false,
    ...over,
  });

  it('reveals the solution slot only once solutionRevealed is set', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount({ withSolution: true }));
    renderNumberLineChrome(chrome, baseState(), section());
    expect(chrome.solutionEl!.hidden).toBe(true);
    renderNumberLineChrome(chrome, baseState({ solutionRevealed: true }), section());
    expect(chrome.solutionEl!.hidden).toBe(false);
  });

  it('reflects the stored confidence selection and freezes radios when locked', () => {
    const chrome = buildNumberLineChrome(NL_ID, mount({ withConfidence: true }));
    renderNumberLineChrome(chrome, baseState({ confidence: 'certain' }), section());
    const certain = chrome.confidenceRadios.find((r) => r.value === 'certain')!;
    expect(certain.checked).toBe(true);
    expect(certain.disabled).toBe(false);
    renderNumberLineChrome(chrome, baseState({ confidence: 'certain' }), section({ locked: true }));
    expect(certain.disabled).toBe(true);
  });
});
