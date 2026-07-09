/**
 * @vitest-environment jsdom
 */
// =============================================================================
// runtime.test.ts — the kit-side published-page plumbing (chrome half)
// -----------------------------------------------------------------------------
// Covers the DOM-heavy graph logic that moved here from the page runtime in the
// 2026-07-10 bundle-budget move: parsing a block's chrome from its element
// (buildGraphChrome) and reflecting state into it (renderGraphChrome) — the
// feedback line's narrate/result modes, mistake feedback (authored template +
// built-in classifier text), the solution slot, and confidence radios. These
// tests moved from packages/renderer's graphs.test.ts; the markup mirrors the
// renderer's output exactly as before. The widget-mount path (attachGraphRuntime
// → mountGraphQuestion → JSXGraph) stays browser-verified, like the boards
// themselves always were.
// =============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { buildGraphChrome, renderGraphChrome } from '../src/runtime.js';
import type { GraphChromeRef } from '../src/runtime.js';
import type {
  GraphBlockState,
  GraphRuntimeBlockRef,
  GraphSectionStateView,
} from '../src/runtime-contract.js';

const GRAPH_ID = '11111111-1111-4111-8111-111111111111';
const SECTION_ID = '22222222-2222-4222-8222-222222222222';

const esc = (s: string): string => s.replace(/"/g, '&quot;');

/** Renderer-shaped markup for a plot_point graph block. */
function mount(opts: { withSolution?: boolean; withMistakes?: boolean; withConfidence?: boolean } = {}): GraphRuntimeBlockRef {
  const config = esc(JSON.stringify({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 }));
  const answerKey = esc(JSON.stringify({ correctPoints: [[3, 4]], tolerance: 0.1 }));
  const solution = opts.withSolution
    ? '<div class="js-solution" data-for-block="' + GRAPH_ID + '" hidden>The origin.</div>'
    : '';
  const mistakeAttr = opts.withMistakes
    ? ' data-graph-mistakes="' + esc(JSON.stringify(['(4, 3)'])) + '"'
    : '';
  const mistakeTemplates = opts.withMistakes
    ? '<template class="js-graph-mistake-content"><strong>Coordinates are (x, y)</strong> — x first.</template>'
    : '';
  const confidence = opts.withConfidence
    ? '<fieldset class="js-confidence-rating">' +
      '<input type="radio" name="conf" value="unsure">' +
      '<input type="radio" name="conf" value="certain">' +
      '</fieldset>'
    : '';
  document.body.innerHTML =
    '<div class="block block-interactive-graph" data-block-category="question"' +
    ' data-block-type="interactive_graph" data-block-id="' + GRAPH_ID + '"' +
    ' data-graph-block-id="' + GRAPH_ID + '"' +
    ' data-graph-interaction-type="plot_point"' +
    ' data-graph-config="' + config + '"' +
    ' data-graph-answer-key="' + answerKey + '"' +
    mistakeAttr + '>' +
    '<div class="block-problem-body">' +
    '<div class="graph-canvas" data-graph-canvas="' + GRAPH_ID + '" role="application" tabindex="0"></div>' +
    '<div class="js-graph-feedback" data-for-graph="' + GRAPH_ID + '" aria-live="polite" hidden></div>' +
    mistakeTemplates + confidence + solution +
    '</div></div>';
  const el = document.querySelector<HTMLElement>('[data-graph-block-id]')!;
  return {
    el,
    canvas: el.querySelector<HTMLElement>('.graph-canvas')!,
    sectionId: SECTION_ID,
    interactionType: 'plot_point',
  };
}

function freshState(overrides: Partial<GraphBlockState> = {}): GraphBlockState {
  return {
    points: [], answered: false, result: null, solutionRevealed: false, confidence: null,
    ...overrides,
  };
}

const UNCHECKED: GraphSectionStateView = { checked: false, locked: false };
const CHECKED: GraphSectionStateView = { checked: true, locked: false };

function chromeFor(ref: GraphRuntimeBlockRef): GraphChromeRef {
  return buildGraphChrome(GRAPH_ID, ref);
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('buildGraphChrome', () => {
  it('parses config, answer key, chrome elements, and defaults off the element', () => {
    const chrome = chromeFor(mount({ withSolution: true }));
    expect(chrome.config).toMatchObject({ xMin: -10 });
    expect(chrome.answerKey).toEqual({ correctPoints: [[3, 4]], tolerance: 0.1 });
    expect(chrome.feedbackEl).not.toBeNull();
    expect(chrome.solutionEl).not.toBeNull();
    expect(chrome.partialCredit).toBe(false);
    expect(chrome.mistakes).toEqual([]);
    expect(chrome.handle).toBeNull();
  });

  it('builtinFeedback attr parses (absent = true, "false" = false)', () => {
    const ref = mount();
    expect(chromeFor(ref).builtinFeedback).toBe(true);
    ref.el.setAttribute('data-graph-builtin-feedback', 'false');
    expect(chromeFor(ref).builtinFeedback).toBe(false);
  });

  it('collects authored mistakes with their templates, index-aligned', () => {
    const chrome = chromeFor(mount({ withMistakes: true }));
    expect(chrome.mistakes).toEqual(['(4, 3)']);
    expect(chrome.mistakeTemplates).toHaveLength(1);
  });

  it('tolerates malformed JSON attributes (undefined, not a crash)', () => {
    const ref = mount();
    ref.el.setAttribute('data-graph-answer-key', '{not json');
    expect(chromeFor(ref).answerKey).toBeUndefined();
  });
});

describe('feedback line modes', () => {
  it('position narration is SR-only (data-mode="narrate") before check', () => {
    const chrome = chromeFor(mount());
    renderGraphChrome(chrome, freshState({ points: [[3, 4]], answered: true, result: false }), UNCHECKED);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.textContent).toBe('Point plotted at (3, 4).');
    // 'narrate' is the CSS hook that visually hides the readout — a visible
    // live coordinate readout gives away plot-the-point answers.
    expect(el.getAttribute('data-mode')).toBe('narrate');
    expect((el as HTMLElement).hidden).toBe(false);
  });

  it('post-check correctness is visible (data-mode="result")', () => {
    const chrome = chromeFor(mount());
    renderGraphChrome(chrome, freshState({ points: [[3, 4]], answered: true, result: true }), CHECKED);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.textContent).toBe('Correct!');
    expect(el.getAttribute('data-mode')).toBe('result');
    expect(el.getAttribute('data-state')).toBe('correct');
  });
});

describe('mistake feedback display', () => {
  it('shows a built-in classifier message on a wrong checked answer', () => {
    const chrome = chromeFor(mount());
    renderGraphChrome(
      chrome,
      freshState({ points: [[4, 3]], answered: true, result: false, mistakeText: 'Check the order of your coordinates.' }),
      CHECKED,
    );
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.textContent).toBe('Check the order of your coordinates.');
    expect(el.getAttribute('data-state')).toBe('incorrect');
    expect(el.getAttribute('data-mode')).toBe('result');
  });

  it('clones the matched authored template (rich content) into the feedback line', () => {
    const chrome = chromeFor(mount({ withMistakes: true }));
    const state = freshState({ points: [[4, 3]], answered: true, result: false, mistakeIndex: 0 });
    renderGraphChrome(chrome, state, CHECKED);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.querySelector('strong')?.textContent).toBe('Coordinates are (x, y)');
    expect(el.getAttribute('data-feedback-key')).toBe('authored-0');
    // Re-render must not re-clone (key unchanged).
    const node = el.querySelector('strong');
    renderGraphChrome(chrome, state, CHECKED);
    expect(el.querySelector('strong')).toBe(node);
  });

  it('falls back to the generic line when nothing matched, and Correct! never carries feedback', () => {
    const chrome = chromeFor(mount());
    const state = freshState({ points: [[0, 0]], answered: true, result: false });
    renderGraphChrome(chrome, state, CHECKED);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.textContent).toBe('Not quite — try again.');
    // Flip to correct: mistake state clears with the generic path.
    state.result = true;
    renderGraphChrome(chrome, state, CHECKED);
    expect(el.textContent).toBe('Correct!');
  });

  it('leaving rich mode clears the cloned nodes even when the text coincides', () => {
    const chrome = chromeFor(mount({ withMistakes: true }));
    renderGraphChrome(chrome, freshState({ points: [[4, 3]], answered: true, result: false, mistakeIndex: 0 }), CHECKED);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.getAttribute('data-feedback-key')).toBe('authored-0');
    renderGraphChrome(chrome, freshState({ points: [[0, 0]], answered: true, result: false }), CHECKED);
    expect(el.getAttribute('data-feedback-key')).toBeNull();
    expect(el.querySelector('strong')).toBeNull();
    expect(el.textContent).toBe('Not quite — try again.');
  });
});

describe('solution slot + confidence radios', () => {
  it('unhides the solution slot only once solutionRevealed', () => {
    const chrome = chromeFor(mount({ withSolution: true }));
    renderGraphChrome(chrome, freshState(), UNCHECKED);
    expect(chrome.solutionEl!.hidden).toBe(true);
    renderGraphChrome(chrome, freshState({ solutionRevealed: true }), CHECKED);
    expect(chrome.solutionEl!.hidden).toBe(false);
  });

  it('reflects the stored confidence selection into the radios', () => {
    const chrome = chromeFor(mount({ withConfidence: true }));
    expect(chrome.confidenceRadios).toHaveLength(2);
    renderGraphChrome(chrome, freshState({ confidence: 'certain' }), UNCHECKED);
    expect(chrome.confidenceRadios.find((r) => r.value === 'certain')!.checked).toBe(true);
    expect(chrome.confidenceRadios.find((r) => r.value === 'unsure')!.checked).toBe(false);
  });
});
