/**
 * @vitest-environment jsdom
 */
// =============================================================================
// graphs.test.ts — runtime integration for the interactive-graph block (Stage 5)
// -----------------------------------------------------------------------------
// Exercises the INLINE half of the graph feature — the bridge that must work
// even when the lazy kit never loads: the cheap init walk over the
// data-attribute contract, checkpoint scoring that includes graph blocks, the
// submit payload's graphResponses + score, and the storage round-trip. The
// widget's job (moving the point) is simulated by writing state.graphs[id]
// directly — exactly what the kit plumbing's onChange does. Chrome rendering
// (feedback line, solution slot, mistake templates) moved to the kit with the
// bundle-budget move and is covered in packages/graph-kit/tests/runtime.test.ts.
// The block markup here mirrors the renderer's output (which its own suite,
// tests/interactive-graph.test.ts, verifies).
// =============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { buildRefs } from '../init.js';
import { createInitialState } from '../state.js';
import { checkSection } from '../checkpoints.js';
import { gatherResponses, buildSubmissionPayload } from '../submission.js';
import { saveActivityState, loadActivityState, applyStoredState } from '../storage.js';
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

/** Renderer-shaped markup for a graph block inside a checkpoint section. Defaults
 *  to plot_point; pass interactionType/answerKey to mount a graph_inequality or a
 *  system (the inline bridge never parses the key — only interactionType matters,
 *  and the emit branches on state, so these attrs are for realism). */
function mount(opts: {
  withSolution?: boolean;
  withKit?: boolean;
  interactionType?: string;
  answerKey?: unknown;
} = {}): void {
  const interactionType = opts.interactionType ?? 'plot_point';
  const config = esc(JSON.stringify({ xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true }));
  const answerKey = esc(JSON.stringify(opts.answerKey ?? { correctPoints: [[3, 4]], tolerance: 0.1 }));
  const kitAttr = opts.withKit === false ? '' : ' data-graph-kit-src="https://cdn.example.com/graph-kit-ABC.js"';
  const solution = opts.withSolution
    ? '<div class="js-solution" data-for-block="' + GRAPH_ID + '" hidden>The origin.</div>'
    : '';
  document.body.innerHTML =
    '<section class="activity-section" data-block-category="content"' +
    ' data-section-id="' + SECTION_ID + '" data-is-checkpoint="true">' +
    '<div class="block block-interactive-graph" data-block-category="question"' +
    ' data-block-type="interactive_graph" data-block-id="' + GRAPH_ID + '"' +
    ' data-graph-block-id="' + GRAPH_ID + '"' +
    ' data-graph-interaction-type="' + interactionType + '"' +
    ' data-graph-config="' + config + '"' +
    ' data-graph-answer-key="' + answerKey + '"' +
    kitAttr + '>' +
    '<div class="block-problem-number">1.</div>' +
    '<div class="block-problem-body">' +
    '<div class="graph-prompt">Plot the point.</div>' +
    '<div class="graph-canvas" data-graph-canvas="' + GRAPH_ID + '" role="application" tabindex="0"></div>' +
    '<div class="js-graph-feedback" data-for-graph="' + GRAPH_ID + '" aria-live="polite" hidden></div>' +
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
  it('builds a slim GraphRef and lists it on its section', () => {
    mount();
    const refs = buildRefs(document);
    expect(refs.graphs.has(GRAPH_ID)).toBe(true);
    const ref = refs.graphs.get(GRAPH_ID)!;
    expect(ref.interactionType).toBe('plot_point');
    expect(ref.kitSrc).toBe('https://cdn.example.com/graph-kit-ABC.js');
    // The heavy attributes stay ON the element for the kit to parse at attach;
    // the inline bridge deliberately does not parse them.
    expect(ref.el.dataset.graphAnswerKey).toContain('correctPoints');
    expect(ref.canvas.dataset.graphCanvas).toBe(GRAPH_ID);
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

  it('flips the solutionRevealed state gate on check', () => {
    // The gate is pure state since the bundle-budget move; the kit's chrome
    // render unhides the actual slot (covered in graph-kit's runtime tests).
    mount({ withSolution: true });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    checkSection(config, state, refs, SECTION_ID);
    expect(state.graphs[GRAPH_ID]!.solutionRevealed).toBe(true);
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
    expect(payload.responses.schemaVersion).toBe(9);
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

  it('GS-M8: emits graph_inequality_system when the state carries N boundary parts', () => {
    mount({
      interactionType: 'graph_inequality',
      answerKey: {
        inequalities: [
          { boundary: { family: 'linear', slope: 2, intercept: 1 }, strict: false, shadeSide: 'above' },
          { boundary: { family: 'linear', slope: -1, intercept: 0 }, strict: true, shadeSide: 'below' },
        ],
      },
    });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    // Simulate what the kit's onChange writes for a system: N boundary parts.
    state.graphs[GRAPH_ID] = {
      points: [], answered: true, result: true, solutionRevealed: false, confidence: 'think_so',
      parts: [
        { points: [[0, 1], [1, 3]], strict: false, side: 'above', correct: true },
        { points: [[0, 0], [1, -1]], strict: true, side: 'below', correct: true },
      ],
      earned: 2, total: 2,
    };
    const payload = buildSubmissionPayload(config, 'Ada', gatherResponses(state, refs), undefined);
    expect(payload.responses.graphResponses).toEqual({
      [GRAPH_ID]: {
        type: 'graph_inequality_system',
        studentPoints: [],
        parts: [
          { type: 'graph_inequality', studentPoints: [[0, 1], [1, 3]], strict: false, side: 'above', correct: true },
          { type: 'graph_inequality', studentPoints: [[0, 0], [1, -1]], strict: true, side: 'below', correct: true },
        ],
        correct: true,
        confidence: 'think_so',
        earned: 2, total: 2,
      },
    });
  });

  it('GS-M8: a single graph_inequality (no parts) still emits the plain member, not a system', () => {
    mount({
      interactionType: 'graph_inequality',
      answerKey: { inequalities: [{ boundary: { family: 'linear', slope: 2, intercept: 1 }, strict: false, shadeSide: 'above' }] },
    });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[0, 1], [1, 3]], answered: true, result: true, solutionRevealed: false, confidence: null,
      strict: false, side: 'above',
    };
    const payload = buildSubmissionPayload(config, 'Ada', gatherResponses(state, refs), undefined);
    const resp = payload.responses.graphResponses![GRAPH_ID]!;
    expect(resp.type).toBe('graph_inequality'); // NOT graph_inequality_system
    expect('parts' in resp).toBe(false);
    expect(resp).toEqual({
      type: 'graph_inequality', studentPoints: [[0, 1], [1, 3]], strict: false, side: 'above', correct: true,
    });
  });

  it('GS-S2: omits an untouched system (no parts, not answered) from graphResponses', () => {
    mount({
      interactionType: 'graph_inequality',
      answerKey: { inequalities: [{ boundary: { family: 'linear', slope: 2, intercept: 1 }, strict: false, shadeSide: 'above' }, { boundary: { family: 'linear', slope: -1, intercept: 0 }, strict: true, shadeSide: 'below' }] },
    });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    expect(gatherResponses(state, refs).graphResponses).toBeUndefined();
  });

  it('gathers a RESTORED answer even though the kit never attached (kit-fail path)', () => {
    // The inline gather is pure state → JSON: a previously-persisted answer
    // must survive a visit where the kit fails to load.
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.graphs[GRAPH_ID] = {
      points: [[3, 4]], answered: true, result: true, solutionRevealed: true, confidence: null,
    };
    saveActivityState(config, refs, state);
    const fresh = createInitialState(refs);
    applyStoredState(loadActivityState(config)!, refs, fresh);
    const gathered = gatherResponses(fresh, refs);
    expect(gathered.score).toBe(1);
    expect(gathered.graphResponses![GRAPH_ID]!.studentPoints).toEqual([[3, 4]]);
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
