/**
 * @vitest-environment jsdom
 */
// =============================================================================
// dataplots.test.ts — runtime integration for the data_plot block (Slice 4)
// -----------------------------------------------------------------------------
// The statistics sibling of numberlines.test.ts. Exercises the INLINE half of
// the dataPlotExt bridge — the part that must work even when the lazy kit never
// loads: the cheap init walk over the data-attribute contract, checkpoint
// scoring that includes graded data_plot blocks, the submit payload's
// dataPlotResponses + score, and the storage round-trip. The widget's job
// (building the dot plot) is simulated by writing state.dataPlots[id] directly —
// exactly what the kit plumbing's onChange does. A DISPLAY data_plot carries no
// data-dataplot-block-id, so it must NOT be walked or scored.
// =============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { buildRefs } from '../init.js';
import { createInitialState } from '../state.js';
import { checkSection } from '../checkpoints.js';
import { gatherResponses, buildSubmissionPayload } from '../submission.js';
import { saveActivityState, loadActivityState, applyStoredState } from '../storage.js';
import type { RuntimeConfig } from '../config.js';

const DP_ID = '33333333-3333-4333-8333-333333333333';
const SECTION_ID = '44444444-4444-4444-8444-444444444444';

const config: RuntimeConfig = {
  activityId: 'a0000000-0000-4000-8000-000000000003',
  versionNum: 1,
  submissionEndpoint: 'https://example.com/ingest',
  submissionMode: 'free',
  revisionMode: 'free',
  gradingMode: 'auto',
  answerFeedback: 'on_check',
};

const esc = (s: string): string => s.replace(/"/g, '&quot;');

/** Renderer-shaped markup for a graded data_plot block in a checkpoint section. */
function mount(opts: { withSolution?: boolean; withKit?: boolean; interactionType?: string } = {}): void {
  const cfg = esc(JSON.stringify({ min: 0, max: 10, tickStep: 1, snapToTick: true }));
  const data = esc(JSON.stringify([3, 5, 5, 6, 8]));
  const interactionType = opts.interactionType ?? 'build_dotplot';
  const kitAttr =
    opts.withKit === false
      ? ''
      : ' data-dataplot-kit-src="https://cdn.example.com/graph-kit-ABC.js"';
  const solution = opts.withSolution
    ? '<div class="js-solution" data-for-block="' + DP_ID + '" hidden>Because.</div>'
    : '';
  document.body.innerHTML =
    '<section class="activity-section" data-block-category="content"' +
    ' data-section-id="' + SECTION_ID + '" data-is-checkpoint="true">' +
    '<div class="block block-data-plot" data-block-category="question"' +
    ' data-block-type="data_plot" data-block-id="' + DP_ID + '"' +
    ' data-dataplot-block-id="' + DP_ID + '"' +
    ' data-dataplot-interaction-type="' + interactionType + '"' +
    ' data-dataplot-config="' + cfg + '"' +
    ' data-dataplot-data="' + data + '"' +
    kitAttr + '>' +
    '<div class="block-problem-number">1.</div>' +
    '<div class="block-problem-body">' +
    '<div class="data-plot-prompt">Plot it.</div>' +
    '<div class="data-plot-canvas" data-dataplot-canvas="' + DP_ID + '" role="application" tabindex="0"></div>' +
    '<div class="js-dataplot-feedback" data-for-dataplot="' + DP_ID + '" aria-live="polite" hidden></div>' +
    solution +
    '</div></div>' +
    '<button class="js-checkpoint-btn" data-for-section="' + SECTION_ID + '" type="button">Check</button>' +
    '<div class="js-section-score" data-for-section="' + SECTION_ID + '" hidden></div>' +
    '</section>';
}

/** A DISPLAY data_plot: static SVG, no data-dataplot-block-id — never graded. */
function mountDisplay(): void {
  document.body.innerHTML =
    '<section class="activity-section" data-section-id="' + SECTION_ID + '" data-is-checkpoint="true">' +
    '<div class="block block-data-plot block-data-plot-display" data-block-category="content"' +
    ' data-block-type="data_plot" data-block-id="' + DP_ID + '">' +
    '<div class="block-problem-body">' +
    '<div class="data-plot-canvas data-plot-static" role="img" aria-label="Box plot">' +
    '<svg class="data-plot-paper"></svg></div>' +
    '</div></div>' +
    '<button class="js-checkpoint-btn" data-for-section="' + SECTION_ID + '" type="button">Check</button>' +
    '</section>';
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('init walk', () => {
  it('builds a slim DataPlotRef and lists it on its section', () => {
    mount();
    const refs = buildRefs(document);
    expect(refs.dataPlots.has(DP_ID)).toBe(true);
    const ref = refs.dataPlots.get(DP_ID)!;
    expect(ref.interactionType).toBe('build_dotplot');
    expect(ref.kitSrc).toBe('https://cdn.example.com/graph-kit-ABC.js');
    // The heavy attributes stay ON the element for the kit to parse at attach.
    expect(ref.el.dataset.dataplotData).toContain('3');
    expect(ref.canvas.dataset.dataplotCanvas).toBe(DP_ID);
    expect(refs.sections.get(SECTION_ID)!.dataPlotBlockIds).toEqual([DP_ID]);
  });

  it('does NOT walk a display data_plot (no data-dataplot-block-id)', () => {
    mountDisplay();
    const refs = buildRefs(document);
    expect(refs.dataPlots.size).toBe(0);
    expect(refs.sections.get(SECTION_ID)!.dataPlotBlockIds).toEqual([]);
  });

  it('seeds initial data-plot state', () => {
    mount();
    const state = createInitialState(buildRefs(document));
    expect(state.dataPlots[DP_ID]).toEqual({
      studentValues: [], answered: false, result: null, solutionRevealed: false, confidence: null,
    });
  });
});

describe('checkpoint scoring', () => {
  it('counts a correct data plot in the section score and total', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.dataPlots[DP_ID] = {
      studentValues: [3, 5, 5, 6, 8], answered: true, result: true, solutionRevealed: false, confidence: null,
    };
    checkSection(config, state, refs, SECTION_ID);
    expect(state.sections[SECTION_ID]!.score).toBe(1);
    expect(state.sections[SECTION_ID]!.total).toBe(1);
    expect(state.sections[SECTION_ID]!.checked).toBe(true);
  });

  it('counts an unanswered data plot as an omission (total 1, score 0)', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    checkSection(config, state, refs, SECTION_ID);
    expect(state.sections[SECTION_ID]!.score).toBe(0);
    expect(state.sections[SECTION_ID]!.total).toBe(1);
  });

  it('a display data plot contributes nothing to the section total', () => {
    mountDisplay();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    checkSection(config, state, refs, SECTION_ID);
    expect(state.sections[SECTION_ID]!.total).toBe(0);
  });

  it('flips the solutionRevealed state gate on check', () => {
    mount({ withSolution: true });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    checkSection(config, state, refs, SECTION_ID);
    expect(state.dataPlots[DP_ID]!.solutionRevealed).toBe(true);
  });
});

describe('submit payload', () => {
  it('builds a build_dotplot dataPlotResponse and folds it into the score', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.dataPlots[DP_ID] = {
      studentValues: [3, 5, 5, 6, 8], answered: true, result: true, solutionRevealed: false, confidence: 'certain',
    };
    const gathered = gatherResponses(state, refs);
    expect(gathered.score).toBe(1);
    expect(gathered.totalScored).toBe(1);
    const payload = buildSubmissionPayload(config, 'Ada', gathered, undefined);
    expect(payload.responses.schemaVersion).toBe(8);
    expect(payload.responses.dataPlotResponses).toEqual({
      [DP_ID]: {
        type: 'build_dotplot',
        studentValues: [3, 5, 5, 6, 8],
        correct: true,
        confidence: 'certain',
      },
    });
  });

  it('gathers a build_histogram response as studentBins (not studentValues)', () => {
    mount({ interactionType: 'build_histogram' });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.dataPlots[DP_ID] = {
      studentValues: [], studentBins: [2, 3], answered: true, result: false, solutionRevealed: false, confidence: null,
    };
    const gathered = gatherResponses(state, refs);
    expect(gathered.dataPlotResponses![DP_ID]).toEqual({
      type: 'build_histogram', studentBins: [2, 3], correct: false,
    });
    expect('studentValues' in gathered.dataPlotResponses![DP_ID]!).toBe(false);
  });

  it('gathers a build_boxplot response as studentFive', () => {
    mount({ interactionType: 'build_boxplot' });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    const five = { min: 1, q1: 2, median: 4, q3: 6, max: 7 };
    state.dataPlots[DP_ID] = {
      studentValues: [], studentFive: five, answered: true, result: true, solutionRevealed: false, confidence: null,
    };
    const gathered = gatherResponses(state, refs);
    expect(gathered.score).toBe(1);
    expect(gathered.dataPlotResponses![DP_ID]).toEqual({
      type: 'build_boxplot', studentFive: five, correct: true,
    });
  });

  it('omits an unanswered data plot from dataPlotResponses', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    const gathered = gatherResponses(state, refs);
    expect(gathered.dataPlotResponses).toBeUndefined();
    expect(gathered.totalScored).toBe(0);
  });

  it('gathers a RESTORED answer even though the kit never attached (kit-fail path)', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.dataPlots[DP_ID] = {
      studentValues: [3, 5, 5, 6, 8], answered: true, result: true, solutionRevealed: true, confidence: null,
    };
    saveActivityState(config, refs, state);
    const fresh = createInitialState(refs);
    applyStoredState(loadActivityState(config)!, refs, fresh);
    const gathered = gatherResponses(fresh, refs);
    expect(gathered.score).toBe(1);
    expect(gathered.dataPlotResponses![DP_ID]!.studentValues).toEqual([3, 5, 5, 6, 8]);
  });
});

describe('storage round-trip', () => {
  it('persists and restores a built dot plot + scoring', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.dataPlots[DP_ID] = {
      studentValues: [3, 5, 5, 6, 8], answered: true, result: true, solutionRevealed: true, confidence: null,
    };
    saveActivityState(config, refs, state);

    const fresh = createInitialState(refs);
    const stored = loadActivityState(config);
    expect(stored).not.toBeNull();
    applyStoredState(stored!, refs, fresh);
    expect(fresh.dataPlots[DP_ID]).toEqual({
      studentValues: [3, 5, 5, 6, 8], answered: true, result: true, solutionRevealed: true, confidence: null,
    });
  });
});
