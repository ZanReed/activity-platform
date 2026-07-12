/**
 * @vitest-environment jsdom
 */
// =============================================================================
// numberlines.test.ts — runtime integration for the number_line block (Slice 1)
// -----------------------------------------------------------------------------
// The 1-D sibling of graphs.test.ts. Exercises the INLINE half of the
// numberLineExt bridge — the part that must work even when the lazy kit never
// loads: the cheap init walk over the data-attribute contract, checkpoint
// scoring that includes number-line blocks, the submit payload's
// numberLineResponses + score, and the storage round-trip. The widget's job
// (moving handles / cycling endpoint pills) is simulated by writing
// state.numberLines[id] directly — exactly what the kit plumbing's onChange
// does. Chrome rendering (feedback line, solution slot) lives in the kit and is
// covered there. The markup mirrors the renderer's number-line output.
// =============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { buildRefs } from '../init.js';
import { createInitialState } from '../state.js';
import { checkSection } from '../checkpoints.js';
import { gatherResponses, buildSubmissionPayload } from '../submission.js';
import { saveActivityState, loadActivityState, applyStoredState } from '../storage.js';
import type { RuntimeConfig } from '../config.js';

const NL_ID = '33333333-3333-4333-8333-333333333333';
const SECTION_ID = '44444444-4444-4444-8444-444444444444';

const config: RuntimeConfig = {
  activityId: 'a0000000-0000-4000-8000-000000000002',
  versionNum: 1,
  submissionEndpoint: 'https://example.com/ingest',
  submissionMode: 'free',
  revisionMode: 'free',
  gradingMode: 'auto',
  answerFeedback: 'on_check',
};

const esc = (s: string): string => s.replace(/"/g, '&quot;');

/** Renderer-shaped markup for a number_line block inside a checkpoint section. */
function mount(
  opts: {
    interaction?: 'plot_point' | 'plot_interval';
    withSolution?: boolean;
    withKit?: boolean;
  } = {},
): void {
  const interaction = opts.interaction ?? 'plot_point';
  const lineConfig = esc(
    JSON.stringify({ min: 0, max: 10, tickStep: 1, snapToTick: true }),
  );
  const answerKey = esc(
    JSON.stringify(
      interaction === 'plot_interval'
        ? {
            correctInterval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' },
            tolerance: 0.1,
          }
        : { correctPoints: [3], tolerance: 0.1 },
    ),
  );
  const kitAttr =
    opts.withKit === false
      ? ''
      : ' data-numberline-kit-src="https://cdn.example.com/graph-kit-ABC.js"';
  const solution = opts.withSolution
    ? '<div class="js-solution" data-for-block="' + NL_ID + '" hidden>Because.</div>'
    : '';
  document.body.innerHTML =
    '<section class="activity-section" data-block-category="content"' +
    ' data-section-id="' + SECTION_ID + '" data-is-checkpoint="true">' +
    '<div class="block block-number-line" data-block-category="question"' +
    ' data-block-type="number_line" data-block-id="' + NL_ID + '"' +
    ' data-numberline-block-id="' + NL_ID + '"' +
    ' data-numberline-interaction-type="' + interaction + '"' +
    ' data-numberline-config="' + lineConfig + '"' +
    ' data-numberline-answer-key="' + answerKey + '"' +
    kitAttr + '>' +
    '<div class="block-problem-number">1.</div>' +
    '<div class="block-problem-body">' +
    '<div class="number-line-prompt">Plot it.</div>' +
    '<div class="number-line-canvas" data-numberline-canvas="' + NL_ID + '" role="application" tabindex="0"></div>' +
    '<div class="js-numberline-feedback" data-for-numberline="' + NL_ID + '" aria-live="polite" hidden></div>' +
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
  it('builds a slim NumberLineRef and lists it on its section', () => {
    mount();
    const refs = buildRefs(document);
    expect(refs.numberLines.has(NL_ID)).toBe(true);
    const ref = refs.numberLines.get(NL_ID)!;
    expect(ref.interactionType).toBe('plot_point');
    expect(ref.kitSrc).toBe('https://cdn.example.com/graph-kit-ABC.js');
    // The heavy attributes stay ON the element for the kit to parse at attach.
    expect(ref.el.dataset.numberlineAnswerKey).toContain('correctPoints');
    expect(ref.canvas.dataset.numberlineCanvas).toBe(NL_ID);
    expect(refs.sections.get(SECTION_ID)!.numberLineBlockIds).toEqual([NL_ID]);
  });

  it('leaves kitSrc null when the block has no data-numberline-kit-src', () => {
    mount({ withKit: false });
    const refs = buildRefs(document);
    expect(refs.numberLines.get(NL_ID)!.kitSrc).toBeNull();
  });

  it('seeds initial number-line state', () => {
    mount();
    const state = createInitialState(buildRefs(document));
    expect(state.numberLines[NL_ID]).toEqual({
      studentPoints: [], answered: false, result: null, solutionRevealed: false, confidence: null,
    });
  });
});

describe('checkpoint scoring', () => {
  it('counts a correct number line in the section score and total', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.numberLines[NL_ID] = {
      studentPoints: [3], answered: true, result: true, solutionRevealed: false, confidence: null,
    };
    checkSection(config, state, refs, SECTION_ID);
    expect(state.sections[SECTION_ID]!.score).toBe(1);
    expect(state.sections[SECTION_ID]!.total).toBe(1);
    expect(state.sections[SECTION_ID]!.checked).toBe(true);
  });

  it('counts an unanswered number line as an omission (total 1, score 0)', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    checkSection(config, state, refs, SECTION_ID);
    expect(state.sections[SECTION_ID]!.score).toBe(0);
    expect(state.sections[SECTION_ID]!.total).toBe(1);
  });

  it('flips the solutionRevealed state gate on check', () => {
    mount({ withSolution: true });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    checkSection(config, state, refs, SECTION_ID);
    expect(state.numberLines[NL_ID]!.solutionRevealed).toBe(true);
  });
});

describe('submit payload', () => {
  it('builds a plot_point numberLineResponse and folds it into the score', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.numberLines[NL_ID] = {
      studentPoints: [3], answered: true, result: true, solutionRevealed: false, confidence: 'certain',
    };
    const gathered = gatherResponses(state, refs);
    expect(gathered.score).toBe(1);
    expect(gathered.totalScored).toBe(1);
    const payload = buildSubmissionPayload(config, 'Ada', gathered, undefined);
    expect(payload.responses.schemaVersion).toBe(8);
    expect(payload.responses.numberLineResponses).toEqual({
      [NL_ID]: {
        type: 'plot_point',
        studentPoints: [3],
        correct: true,
        confidence: 'certain',
      },
    });
  });

  it('builds a plot_interval numberLineResponse with bounds + styles (never studentPoints)', () => {
    mount({ interaction: 'plot_interval' });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.numberLines[NL_ID] = {
      studentPoints: [],
      interval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' },
      answered: true,
      result: true,
      solutionRevealed: false,
      confidence: null,
    };
    const gathered = gatherResponses(state, refs);
    const payload = buildSubmissionPayload(config, 'Ada', gathered, undefined);
    expect(payload.responses.numberLineResponses).toEqual({
      [NL_ID]: {
        type: 'plot_interval',
        min: -2,
        minStyle: 'closed',
        max: 4,
        maxStyle: 'open',
        correct: true,
      },
    });
    // The discriminated union must not carry the sibling variant's field.
    expect(
      'studentPoints' in payload.responses.numberLineResponses![NL_ID]!,
    ).toBe(false);
  });

  it('emits a one-sided ray interval (unbounded max is simply absent)', () => {
    mount({ interaction: 'plot_interval' });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.numberLines[NL_ID] = {
      studentPoints: [],
      interval: { min: 3, minStyle: 'closed' },
      answered: true,
      result: false,
      solutionRevealed: false,
      confidence: null,
    };
    const gathered = gatherResponses(state, refs);
    expect(gathered.numberLineResponses![NL_ID]).toEqual({
      type: 'plot_interval',
      min: 3,
      minStyle: 'closed',
      correct: false,
    });
  });

  it('omits an unanswered number line from numberLineResponses', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    const gathered = gatherResponses(state, refs);
    expect(gathered.numberLineResponses).toBeUndefined();
    expect(gathered.totalScored).toBe(0);
  });

  it('gathers a RESTORED answer even though the kit never attached (kit-fail path)', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.numberLines[NL_ID] = {
      studentPoints: [3], answered: true, result: true, solutionRevealed: true, confidence: null,
    };
    saveActivityState(config, refs, state);
    const fresh = createInitialState(refs);
    applyStoredState(loadActivityState(config)!, refs, fresh);
    const gathered = gatherResponses(fresh, refs);
    expect(gathered.score).toBe(1);
    expect(gathered.numberLineResponses![NL_ID]!.studentPoints).toEqual([3]);
  });
});

describe('storage round-trip', () => {
  it('persists and restores a plotted point + scoring', () => {
    mount();
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.numberLines[NL_ID] = {
      studentPoints: [3], answered: true, result: true, solutionRevealed: true, confidence: null,
    };
    saveActivityState(config, refs, state);

    const fresh = createInitialState(refs);
    const stored = loadActivityState(config);
    expect(stored).not.toBeNull();
    applyStoredState(stored!, refs, fresh);
    expect(fresh.numberLines[NL_ID]).toEqual({
      studentPoints: [3], answered: true, result: true, solutionRevealed: true, confidence: null,
    });
  });

  it('persists and restores an interval answer', () => {
    mount({ interaction: 'plot_interval' });
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    state.numberLines[NL_ID] = {
      studentPoints: [],
      interval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' },
      answered: true,
      result: true,
      solutionRevealed: false,
      confidence: null,
    };
    saveActivityState(config, refs, state);

    const fresh = createInitialState(refs);
    applyStoredState(loadActivityState(config)!, refs, fresh);
    expect(fresh.numberLines[NL_ID]!.interval).toEqual({
      min: -2, minStyle: 'closed', max: 4, maxStyle: 'open',
    });
  });
});
