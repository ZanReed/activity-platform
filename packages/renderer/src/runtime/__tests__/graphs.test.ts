/**
 * @vitest-environment jsdom
 */
// =============================================================================
// graphs.test.ts — runtime integration for the interactive-graph block (Stage 5)
// -----------------------------------------------------------------------------
// Exercises the runtime SPINE without the JSXGraph widget (browser-verified
// separately): the init walk over the data-attribute contract, checkpoint
// scoring that includes graph blocks, the submit payload's graphResponses +
// score, and the storage round-trip. The widget's job (moving the point) is
// simulated by writing state.graphs[id] directly — exactly what the sidecar's
// onChange does. The block markup here mirrors the renderer's output (which its
// own suite, tests/interactive-graph.test.ts, verifies).
// =============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { buildRefs } from '../init.js';
import { createInitialState } from '../state.js';
import { checkSection } from '../checkpoints.js';
import { gatherResponses, buildSubmissionPayload } from '../submission.js';
import { saveActivityState, loadActivityState, applyStoredState } from '../storage.js';
import { graphExt } from '../graph-integration.js';
import type { RuntimeConfig } from '../config.js';

const GRAPH_ID = '11111111-1111-4111-8111-111111111111';
const SECTION_ID = '22222222-2222-4222-8222-222222222222';

const config: RuntimeConfig = {
  activityId: 'a0000000-0000-4000-8000-000000000001',
  versionNum: 1,
  submissionEndpoint: 'https://example.com/ingest',
  submissionMode: 'free',
  revisionMode: 'free',
  gradingMode: 'auto',
  answerFeedback: 'on_check',
};

const esc = (s: string): string => s.replace(/"/g, '&quot;');

/** Renderer-shaped markup for a plot_point graph block inside a checkpoint section. */
function mount(opts: { withSolution?: boolean; withKit?: boolean; withMistakes?: boolean } = {}): void {
  const config = esc(JSON.stringify({ xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true }));
  const answerKey = esc(JSON.stringify({ correctPoints: [[3, 4]], tolerance: 0.1 }));
  const kitAttr = opts.withKit === false ? '' : ' data-graph-kit-src="https://cdn.example.com/graph-kit-ABC.js"';
  const solution = opts.withSolution
    ? '<div class="js-solution" data-for-block="' + GRAPH_ID + '" hidden>The origin.</div>'
    : '';
  const mistakeAttr = opts.withMistakes
    ? ' data-graph-mistakes="' + esc(JSON.stringify(['(4, 3)'])) + '"'
    : '';
  const mistakeTemplates = opts.withMistakes
    ? '<template class="js-graph-mistake-content"><strong>Coordinates are (x, y)</strong> — x first.</template>'
    : '';
  document.body.innerHTML =
    '<section class="activity-section" data-block-category="content"' +
    ' data-section-id="' + SECTION_ID + '" data-is-checkpoint="true">' +
    '<div class="block block-interactive-graph" data-block-category="question"' +
    ' data-block-type="interactive_graph" data-block-id="' + GRAPH_ID + '"' +
    ' data-graph-block-id="' + GRAPH_ID + '"' +
    ' data-graph-interaction-type="plot_point"' +
    ' data-graph-config="' + config + '"' +
    ' data-graph-answer-key="' + answerKey + '"' +
    kitAttr + mistakeAttr + '>' +
    '<div class="block-problem-number">1.</div>' +
    '<div class="block-problem-body">' +
    '<div class="graph-prompt">Plot the point.</div>' +
    '<div class="graph-canvas" data-graph-canvas="' + GRAPH_ID + '" role="application" tabindex="0"></div>' +
    '<div class="js-graph-feedback" data-for-graph="' + GRAPH_ID + '" aria-live="polite" hidden></div>' +
    mistakeTemplates +
    solution +
    '</div></div>' +
    '<button class="js-checkpoint-btn" data-for-section="' + SECTION_ID + '" type="button">Check</button>' +
    '<div class="js-section-score" data-for-section="' + SECTION_ID + '" hidden></div>' +
    '</section>';
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('init walk', () => {
  it('builds a GraphRef and lists it on its section', () => {
    mount();
    const refs = buildRefs(document);
    expect(refs.graphs.has(GRAPH_ID)).toBe(true);
    const ref = refs.graphs.get(GRAPH_ID)!;
    expect(ref.interactionType).toBe('plot_point');
    expect(ref.kitSrc).toBe('https://cdn.example.com/graph-kit-ABC.js');
    expect(ref.answerKey).toEqual({ correctPoints: [[3, 4]], tolerance: 0.1 });
    expect(ref.config).toMatchObject({ xMin: -10, snapToGrid: true });
    expect(ref.handle).toBeNull();
    expect(refs.sections.get(SECTION_ID)!.graphBlockIds).toEqual([GRAPH_ID]);
  });

  it('leaves kitSrc null when the block has no data-graph-kit-src', () => {
    mount({ withKit: false });
    const refs = buildRefs(document);
    expect(refs.graphs.get(GRAPH_ID)!.kitSrc).toBeNull();
  });

  it('seeds initial graph state', () => {
    mount();
    const state = createInitialState(buildRefs(document));
    expect(state.graphs[GRAPH_ID]).toEqual({
      points: [], answered: false, result: null, solutionRevealed: false, confidence: null,
    });
  });
});

describe('checkpoint scoring', () => {
  it('counts a correct graph in the section score and total', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[3, 4]], answered: true, result: true, solutionRevealed: false, confidence: null,
    };
    checkSection(config, state, refs, SECTION_ID);
    expect(state.sections[SECTION_ID]!.score).toBe(1);
    expect(state.sections[SECTION_ID]!.total).toBe(1);
    expect(state.sections[SECTION_ID]!.checked).toBe(true);
  });

  it('counts an unanswered graph as an omission (total 1, score 0)', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    checkSection(config, state, refs, SECTION_ID);
    expect(state.sections[SECTION_ID]!.score).toBe(0);
    expect(state.sections[SECTION_ID]!.total).toBe(1);
  });

  it('reveals the graph solution on check when one is authored', () => {
    mount({ withSolution: true });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    expect(refs.graphs.get(GRAPH_ID)!.solutionEl).not.toBeNull();
    checkSection(config, state, refs, SECTION_ID);
    expect(state.graphs[GRAPH_ID]!.solutionRevealed).toBe(true);
  });
});

describe('feedback line modes', () => {
  it('position narration is SR-only (data-mode="narrate") before check', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[3, 4]], answered: true, result: false, solutionRevealed: false, confidence: null,
    };
    graphExt.renderGraphs(state, refs);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.textContent).toBe('Point plotted at (3, 4).');
    // 'narrate' is the CSS hook that visually hides the readout — a visible
    // live coordinate readout gives away plot-the-point answers.
    expect(el.getAttribute('data-mode')).toBe('narrate');
    expect((el as HTMLElement).hidden).toBe(false);
  });

  it('post-check correctness is visible (data-mode="result")', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[3, 4]], answered: true, result: true, solutionRevealed: false, confidence: null,
    };
    checkSection(config, state, refs, SECTION_ID);
    graphExt.renderGraphs(state, refs);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.textContent).toBe('Correct!');
    expect(el.getAttribute('data-mode')).toBe('result');
    expect(el.getAttribute('data-state')).toBe('correct');
  });
});

describe('mistake feedback display (Drop B)', () => {
  it('shows a built-in classifier message on a wrong checked answer', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[4, 3]], answered: true, result: false, solutionRevealed: false, confidence: null,
      mistakeText: 'Check the order of your coordinates.',
    };
    checkSection(config, state, refs, SECTION_ID);
    graphExt.renderGraphs(state, refs);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.textContent).toBe('Check the order of your coordinates.');
    expect(el.getAttribute('data-state')).toBe('incorrect');
    expect(el.getAttribute('data-mode')).toBe('result');
  });

  it('clones the matched authored template (rich content) into the feedback line', () => {
    mount({ withMistakes: true });
    const refs = buildRefs(document);
    expect(refs.graphs.get(GRAPH_ID)!.mistakes).toEqual(['(4, 3)']);
    expect(refs.graphs.get(GRAPH_ID)!.mistakeTemplates).toHaveLength(1);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[4, 3]], answered: true, result: false, solutionRevealed: false, confidence: null,
      mistakeIndex: 0,
    };
    checkSection(config, state, refs, SECTION_ID);
    graphExt.renderGraphs(state, refs);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.querySelector('strong')?.textContent).toBe('Coordinates are (x, y)');
    expect(el.getAttribute('data-feedback-key')).toBe('authored-0');
    // Re-render must not re-clone (key unchanged).
    const node = el.querySelector('strong');
    graphExt.renderGraphs(state, refs);
    expect(el.querySelector('strong')).toBe(node);
  });

  it('falls back to the generic line when nothing matched, and Correct! never carries feedback', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[0, 0]], answered: true, result: false, solutionRevealed: false, confidence: null,
    };
    checkSection(config, state, refs, SECTION_ID);
    graphExt.renderGraphs(state, refs);
    const el = document.querySelector('.js-graph-feedback')!;
    expect(el.textContent).toBe('Not quite — try again.');
    // Flip to correct: mistake state clears with the generic path.
    state.graphs[GRAPH_ID]!.result = true;
    graphExt.renderGraphs(state, refs);
    expect(el.textContent).toBe('Correct!');
  });

  it('builtinFeedback attr parses (absent = true, "false" = false)', () => {
    mount();
    expect(buildRefs(document).graphs.get(GRAPH_ID)!.builtinFeedback).toBe(true);
    document.querySelector('[data-graph-block-id]')!.setAttribute('data-graph-builtin-feedback', 'false');
    expect(buildRefs(document).graphs.get(GRAPH_ID)!.builtinFeedback).toBe(false);
  });
});

describe('submit payload', () => {
  it('builds a plot_point graphResponse and folds it into the score', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[3, 4]], answered: true, result: true, solutionRevealed: false, confidence: 'certain',
    };
    const gathered = gatherResponses(state, refs);
    expect(gathered.score).toBe(1);
    expect(gathered.totalScored).toBe(1);
    const payload = buildSubmissionPayload(config, 'Ada', gathered, undefined);
    expect(payload.responses.schemaVersion).toBe(5);
    expect(payload.responses.graphResponses).toEqual({
      [GRAPH_ID]: {
        type: 'plot_point',
        studentPoints: [[3, 4]],
        correct: true,
        confidence: 'certain',
      },
    });
  });

  it('omits an unanswered graph from graphResponses', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    const gathered = gatherResponses(state, refs);
    expect(gathered.graphResponses).toBeUndefined();
    expect(gathered.totalScored).toBe(0);
  });
});

describe('storage round-trip', () => {
  it('persists and restores the plotted point + scoring', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[3, 4]], answered: true, result: true, solutionRevealed: true, confidence: null,
    };
    saveActivityState(config, refs, state);

    const fresh = createInitialState(refs);
    const stored = loadActivityState(config);
    expect(stored).not.toBeNull();
    applyStoredState(stored!, refs, fresh);
    expect(fresh.graphs[GRAPH_ID]).toEqual({
      points: [[3, 4]], answered: true, result: true, solutionRevealed: true, confidence: null,
    });
  });
});
