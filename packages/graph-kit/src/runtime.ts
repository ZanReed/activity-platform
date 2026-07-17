// =============================================================================
// runtime.ts — the published-page graph plumbing (kit side of the bridge)
// -----------------------------------------------------------------------------
// The DOM-heavy half of the interactive-graph runtime, moved OUT of the inlined
// page runtime and into this lazy kit (2026-07-10 bundle-budget move): full
// data-attribute parsing, block-chrome rendering (feedback line, solution slot,
// confidence radios, widget lock), widget mounting/restoring, and static
// display figures. The page's inline runtime keeps only a thin bridge
// (packages/renderer/src/runtime/graph-integration.ts): a cheap init walk,
// state seeding, the scoring fold, and the submit gather — so scoring and
// submission of restored answers survive even if this module never loads.
//
// The bridge dynamic-imports the kit entry and calls attachGraphRuntime() once,
// handing over the live state object, the block elements, and onUpdate. From
// then on this module follows the runtime's own rules from the outside:
// handlers write state, then call onUpdate; render() is idempotent and is
// driven by the runtime's render tick (the bridge delegates every tick here).
// The shared shapes live in ./runtime-contract.ts — imported by BOTH sides, so
// bridge↔kit drift is a compile error (see that file's header).
//
// Consequence of the move: block chrome (a restored verdict, a revealed
// solution) paints when the kit lands, a beat after first paint — the same
// timing the board itself always had. Accepted trade (author call 2026-07-10).
// =============================================================================

import {
  mountGraphQuestion,
  mountGraphSystemQuestion,
  mountGraphFunctionSystemQuestion,
  mountGraphDisplay,
  type GraphQuestionHandle,
  type GraphResponseData,
} from './graph-question.js';
import {
  mountNumberLineQuestion,
  type NumberLineQuestionHandle,
  type NumberLineResponseData,
} from './number-line-question.js';
import {
  mountDataPlotQuestion,
  type DataPlotQuestionHandle,
  type DataPlotResponseData,
} from './data-plot-question.js';
import { fitFunction, handlesForFamily } from './graph-score.js';
import type {
  GraphBlockState,
  GraphRuntimeBlockRef,
  GraphRuntimeContext,
  GraphRuntimeExt,
  GraphSectionStateView,
  NumberLineBlockState,
  NumberLineRuntimeBlockRef,
  NumberLineRuntimeContext,
  NumberLineRuntimeExt,
  DataPlotBlockState,
  DataPlotRuntimeBlockRef,
  DataPlotRuntimeContext,
  DataPlotRuntimeExt,
} from './runtime-contract.js';

function warn(message: string): void {
  if (typeof console !== 'undefined') {
    console.warn('[activity-runtime graph] ' + message);
  }
}

// Shared JSON-attribute parser for graph blocks: undefined on absence,
// undefined + a warning on malformed JSON (the widget then defaults it — a bad
// attribute degrades to a permissive graph rather than dropping the question).
function parseGraphAttr(
  raw: string | undefined,
  blockId: string,
  label: string,
): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    warn('Graph block ' + blockId + ' has malformed ' + label + '; ignoring.');
    return undefined;
  }
}

/**
 * The chrome-level view of one graded graph block: the parsed data attributes
 * plus the DOM regions this module owns (everything around the canvas). Built
 * once at attach; `handle` is the one mutable field — acquired asynchronously
 * when the widget mounts.
 */
export interface GraphChromeRef {
  el: HTMLElement;
  canvas: HTMLElement;
  sectionId: string;
  interactionType: string;
  feedbackEl: HTMLElement | null;
  solutionEl: HTMLElement | null;
  confidenceRadios: HTMLInputElement[];
  config: unknown;
  answerKey: unknown;
  partialCredit: boolean;
  allowNoSolution: boolean;
  noSolutionCorrect: boolean;
  mistakes: string[];
  builtinFeedback: boolean;
  mistakeTemplates: HTMLTemplateElement[];
  handle: GraphQuestionHandle | null;
}

/**
 * Parse one graded block's full chrome ref from its element. Exported for the
 * kit's own tests (like the pure scorers); attachGraphRuntime is the real
 * consumer.
 */
export function buildGraphChrome(
  blockId: string,
  ref: GraphRuntimeBlockRef,
): GraphChromeRef {
  const el = ref.el;

  const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
    '.js-confidence-rating',
  );
  const confidenceRadios: HTMLInputElement[] = confidenceFieldset
    ? Array.prototype.slice.call(
        confidenceFieldset.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]',
        ),
      )
    : [];

  // Authored anticipated-mistake match strings + their pre-rendered feedback
  // templates (index-aligned). Malformed attribute → no authored feedback,
  // never a broken block.
  let mistakes: string[] = [];
  const rawMistakes = el.dataset.graphMistakes;
  if (rawMistakes) {
    try {
      const parsed = JSON.parse(rawMistakes);
      if (Array.isArray(parsed)) {
        mistakes = parsed.filter((m): m is string => typeof m === 'string');
      }
    } catch {
      warn('Graph block ' + blockId + ' has malformed data-graph-mistakes; ignoring.');
    }
  }
  const mistakeTemplates: HTMLTemplateElement[] = Array.prototype.slice.call(
    el.querySelectorAll<HTMLTemplateElement>('template.js-graph-mistake-content'),
  );

  return {
    el,
    canvas: ref.canvas,
    sectionId: ref.sectionId,
    interactionType: ref.interactionType,
    feedbackEl: el.querySelector<HTMLElement>('.js-graph-feedback'),
    solutionEl: el.querySelector<HTMLElement>('.js-solution'),
    confidenceRadios,
    config: parseGraphAttr(el.dataset.graphConfig, blockId, 'data-graph-config'),
    answerKey: parseGraphAttr(
      el.dataset.graphAnswerKey,
      blockId,
      'data-graph-answer-key',
    ),
    partialCredit: el.dataset.graphPartialCredit === 'true',
    allowNoSolution: el.dataset.graphAllowNoSolution === 'true',
    noSolutionCorrect: el.dataset.graphNoSolutionCorrect === 'true',
    mistakes,
    // Omit-when-default: the renderer emits the attribute only when OFF.
    builtinFeedback: el.dataset.graphBuiltinFeedback !== 'false',
    mistakeTemplates,
    handle: null,
  };
}

// True when a curve-fitting block's plotted points can't define its family's
// curve (e.g. a handle at y ≤ 0 on an exponential, coincident x on a linear).
// Sighted students see the drawn curve vanish; the narrate line says the same
// thing for screen-reader users. Vertical is excluded — it draws a line through
// the handles directly, no fit involved.
function curveUndefined(
  chrome: GraphChromeRef,
  points: [number, number][],
): boolean {
  let model: unknown;
  if (chrome.interactionType === 'plot_function') {
    const models = ((chrome.answerKey ?? {}) as { models?: unknown }).models;
    model = Array.isArray(models) ? models[0] : undefined;
  } else if (chrome.interactionType === 'graph_inequality') {
    const arr = ((chrome.answerKey ?? {}) as { inequalities?: unknown }).inequalities;
    const first = Array.isArray(arr) ? arr[0] : undefined;
    model = (first as { boundary?: unknown } | undefined)?.boundary;
  } else {
    return false;
  }
  const family = (model as { family?: unknown } | undefined)?.family;
  if (typeof family !== 'string' || family === 'vertical') return false;
  if (points.length < handlesForFamily(family)) return false;
  return fitFunction(family, points) === null;
}

/**
 * Reflect one graph block's state into the DOM regions this module owns: the
 * aria-live feedback line, the solution slot, the confidence radios, and the
 * widget lock. The canvas board itself is the widget's (mounted by attach);
 * this drives only the surrounding block chrome. Exported for the kit's tests.
 */
export function renderGraphChrome(
  chrome: GraphChromeRef,
  graphState: GraphBlockState,
  section: GraphSectionStateView | undefined,
): void {
  // Solution slot — hidden until revealed at check time (fail-closed).
  if (chrome.solutionEl) {
    const wantHidden = !graphState.solutionRevealed;
    if (chrome.solutionEl.hidden !== wantHidden) {
      chrome.solutionEl.hidden = wantHidden;
    }
  }

  // Confidence radios reflect the stored selection (restore-on-load + keep
  // state↔DOM consistent) and freeze with the widget: once the section is
  // locked, the student can't re-rate confidence any more than they can move
  // the board (same section?.locked condition as the setLocked call below).
  // No-op when the block has no fieldset.
  const locked = section?.locked === true;
  for (const radio of chrome.confidenceRadios) {
    const wantChecked = radio.value === graphState.confidence;
    if (radio.checked !== wantChecked) {
      radio.checked = wantChecked;
    }
    if (radio.disabled !== locked) {
      radio.disabled = locked;
    }
  }

  // Feedback line: after the section is checked, reveal correctness (respecting
  // "don't reveal before checking"); before that, narrate the plotted position
  // for screen-reader users on every move. aria-live announces on text change.
  // data-mode distinguishes the two: 'narrate' is VISUALLY HIDDEN by the block
  // CSS (SR-only — a visible coordinate readout would hand a sighted student
  // the answer to any plot-the-point question), 'result' is visible.
  if (chrome.feedbackEl) {
    const checked = section?.checked === true;
    let text = '';
    let dataState: string | null = null;
    let dataMode: string | null = null;
    // Rich authored mistake feedback: the matched entry's pre-rendered
    // template. richKey identifies the clone so re-renders don't re-clone
    // unchanged content.
    let richTpl: HTMLTemplateElement | null = null;
    let richKey: string | null = null;
    if (checked && graphState.result !== null) {
      dataState = graphState.result ? 'correct' : 'incorrect';
      dataMode = 'result';
      if (graphState.result) {
        text = 'Correct!';
      } else {
        const idx = graphState.mistakeIndex;
        const tpl = idx !== undefined ? chrome.mistakeTemplates[idx] : undefined;
        if (tpl) {
          richTpl = tpl;
          richKey = 'authored-' + idx;
        } else {
          // Built-in classifier nudge, else the generic miss line.
          text = graphState.mistakeText ?? 'Not quite — try again.';
        }
      }
    } else if (graphState.answered && graphState.points.length > 0) {
      const plotted = graphState.points
        .map((p) => '(' + p[0] + ', ' + p[1] + ')')
        .join(', ');
      const label =
        graphState.points.length > 1 ? 'Points plotted at ' : 'Point plotted at ';
      text = label + plotted + '.';
      if (curveUndefined(chrome, graphState.points)) {
        text += ' These points do not define a curve yet.';
      }
      dataMode = 'narrate';
    }
    const wantHidden = text === '' && richKey === null;
    if (chrome.feedbackEl.hidden !== wantHidden) chrome.feedbackEl.hidden = wantHidden;
    if (richTpl && richKey !== null) {
      if (chrome.feedbackEl.getAttribute('data-feedback-key') !== richKey) {
        chrome.feedbackEl.setAttribute('data-feedback-key', richKey);
        chrome.feedbackEl.replaceChildren(richTpl.content.cloneNode(true));
      }
    } else {
      // Leaving rich mode must force a text write even if the strings happen
      // to coincide — the element still holds cloned nodes.
      const hadRich = chrome.feedbackEl.getAttribute('data-feedback-key') !== null;
      if (hadRich) chrome.feedbackEl.removeAttribute('data-feedback-key');
      if (hadRich || chrome.feedbackEl.textContent !== text) {
        chrome.feedbackEl.textContent = text;
      }
    }
    const current = chrome.feedbackEl.getAttribute('data-state');
    if (dataState !== current) {
      if (dataState === null) chrome.feedbackEl.removeAttribute('data-state');
      else chrome.feedbackEl.setAttribute('data-state', dataState);
    }
    const currentMode = chrome.feedbackEl.getAttribute('data-mode');
    if (dataMode !== currentMode) {
      if (dataMode === null) chrome.feedbackEl.removeAttribute('data-mode');
      else chrome.feedbackEl.setAttribute('data-mode', dataMode);
    }
  }

  // Lock the widget in locked mode once the section is checked. The handle is
  // acquired asynchronously on mount, so this no-ops until the board is up;
  // attach also applies the restored lock when the handle arrives.
  if (chrome.handle) {
    chrome.handle.setLocked(section?.locked === true);
  }
}

/**
 * The bridge's entry point: parse every graph block's chrome, mount the graded
 * widgets and static display figures, bridge widget moves into the runtime's
 * state, and hand back the render delegate the runtime drives on every tick.
 *
 * Defensive throughout: a missing canvas or a failed board mount leaves the
 * static "needs JavaScript" placeholder in place and the rest of the page
 * working — the graph just can't be answered (it still submits as unanswered).
 */
export function attachGraphRuntime(ctx: GraphRuntimeContext): GraphRuntimeExt {
  const chromes = new Map<string, GraphChromeRef>();
  for (const [blockId, ref] of ctx.blocks) {
    chromes.set(blockId, buildGraphChrome(blockId, ref));
  }

  // Mount each graded widget. Each mount is async (the board chunk is fetched
  // on demand); state/chrome are updated as handles resolve.
  for (const [blockId, chrome] of chromes) {
    const config = {
      interactionType: chrome.interactionType,
      axisConfig: chrome.config,
      answerKey: chrome.answerKey,
      partialCredit: chrome.partialCredit,
      allowNoSolution: chrome.allowNoSolution,
      noSolutionCorrect: chrome.noSolutionCorrect,
      mistakes: chrome.mistakes,
      builtinFeedback: chrome.builtinFeedback,
    };

    // A "system" is a graph_inequality whose answer key has more than one
    // inequality — it mounts the N-boundary system widget instead of the single
    // one. N=1 (or any other interaction) takes the unchanged single path.
    const ineqs = (chrome.answerKey as { inequalities?: unknown } | null)?.inequalities;
    const isSystem =
      chrome.interactionType === 'graph_inequality' &&
      Array.isArray(ineqs) &&
      ineqs.length > 1;
    // A functions-system: plot_function whose answer key has more than one model.
    const models = (chrome.answerKey as { models?: unknown } | null)?.models;
    const isFunctionSystem =
      chrome.interactionType === 'plot_function' &&
      Array.isArray(models) &&
      models.length > 1;
    const mountFn = isSystem
      ? mountGraphSystemQuestion
      : isFunctionSystem
        ? mountGraphFunctionSystemQuestion
        : mountGraphQuestion;

    mountFn(chrome.canvas, config, {
      onChange: (resp: GraphResponseData) => {
        const gs = ctx.state.graphs[blockId];
        if (!gs) return;
        gs.points = resp.studentPoints;
        gs.answered = resp.answered;
        // Unanswered → unscored (an omission), like an empty blank; once the
        // student has moved a handle, its correctness is live.
        gs.result = resp.answered ? resp.correct : null;
        // Present only when the widget reports them.
        gs.strict = resp.strict;
        gs.side = resp.side;
        gs.noSolution = resp.noSolution;
        gs.earned = resp.earned;
        gs.total = resp.total;
        gs.domain = resp.domain;
        gs.shape = resp.shape;
        gs.fromStyle = resp.fromStyle;
        gs.endpoints = resp.endpoints;
        gs.parts = resp.parts; // the N-boundary inequality-system answer (else undefined)
        gs.curveParts = resp.curveParts; // the N-curve function-system answer (else undefined)
        gs.mistakeIndex = resp.mistakeIndex;
        gs.mistakeText = resp.mistakeText;
        ctx.onUpdate();
      },
    })
      .then((handle) => {
        chrome.handle = handle;
        // Restore the answer persisted on a prior load. Its onChange re-populates
        // state.graphs[blockId] (answered + result), so a checked-and-reloaded
        // graph comes back scored.
        const gs = ctx.state.graphs[blockId];
        // Restore ONLY a genuinely-answered prior submission (gs.answered set by
        // applyStoredState from storage) — never the fresh-load default state.
        if (gs && gs.answered && gs.parts && gs.parts.length > 0) {
          handle.restore([], { parts: gs.parts });
        } else if (gs && gs.answered && gs.curveParts && gs.curveParts.length > 0) {
          handle.restore([], { curveParts: gs.curveParts });
        } else if (gs && (gs.points.length > 0 || gs.noSolution)) {
          handle.restore(gs.points, {
            strict: gs.strict,
            side: gs.side,
            noSolution: gs.noSolution,
            domain: gs.domain,
            shape: gs.shape,
            fromStyle: gs.fromStyle,
            endpoints: gs.endpoints,
          });
        }
        // Reflect any restored lock (locked mode after a prior check).
        if (ctx.state.sections[chrome.sectionId]?.locked) handle.setLocked(true);
      })
      .catch((err) => {
        console.error('[activity-runtime] graph widget failed to mount', err);
      });
  }

  // Mount each DISPLAY (static, ungraded) block's read-only figure. No state,
  // no hooks, no scoring — just draw the authored drawables.
  for (const dref of ctx.displays) {
    const blockId = dref.el.dataset.graphBlockId ?? '(unknown)';
    const config = {
      axisConfig: parseGraphAttr(
        dref.el.dataset.graphConfig,
        blockId,
        'data-graph-config',
      ),
      drawables: parseGraphAttr(
        dref.el.dataset.graphDrawables,
        blockId,
        'data-graph-drawables',
      ),
    };
    mountGraphDisplay(dref.canvas, config).catch((err) => {
      console.error('[activity-runtime] display graph failed to mount', err);
    });
  }

  const ext: GraphRuntimeExt = {
    render(): void {
      for (const [blockId, chrome] of chromes) {
        const graphState = ctx.state.graphs[blockId];
        if (graphState) {
          renderGraphChrome(chrome, graphState, ctx.state.sections[chrome.sectionId]);
        }
      }
    },
  };

  // First chrome paint: reflect whatever state the runtime restored before we
  // arrived (revealed solutions, verdicts, confidence) — the "beat later"
  // paint the move accepted.
  ext.render();

  return ext;
}

// =============================================================================
// Number-line plumbing (kit side of the numberLineExt bridge)
// -----------------------------------------------------------------------------
// The 1-D sibling of the graph plumbing above, riding the SAME lazy kit. The
// inline bridge (packages/renderer/src/runtime/graph-integration.ts) keeps only
// the cheap init walk + scoring fold + submit gather; this owns the DOM-heavy
// half: data-attribute parsing, chrome rendering (feedback line, solution slot,
// confidence radios, widget lock), and mounting/restoring the board. Leaner
// than the graph plumbing by design (decision 6): no mistakes, no partial
// credit — the widget scores all-or-nothing and reports correct/answered.
// =============================================================================

/** The chrome-level view of one graded number-line block: parsed attributes +
 *  the DOM regions this module owns. `handle` resolves asynchronously on mount. */
export interface NumberLineChromeRef {
  el: HTMLElement;
  canvas: HTMLElement;
  sectionId: string;
  interactionType: string;
  feedbackEl: HTMLElement | null;
  solutionEl: HTMLElement | null;
  confidenceRadios: HTMLInputElement[];
  config: unknown;
  answerKey: unknown;
  handle: NumberLineQuestionHandle | null;
}

/** Parse one graded number-line block's chrome from its element. Exported for
 *  the kit's own tests, like buildGraphChrome. */
export function buildNumberLineChrome(
  blockId: string,
  ref: NumberLineRuntimeBlockRef,
): NumberLineChromeRef {
  const el = ref.el;
  const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
    '.js-confidence-rating',
  );
  const confidenceRadios: HTMLInputElement[] = confidenceFieldset
    ? Array.prototype.slice.call(
        confidenceFieldset.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]',
        ),
      )
    : [];

  return {
    el,
    canvas: ref.canvas,
    sectionId: ref.sectionId,
    interactionType: ref.interactionType,
    feedbackEl: el.querySelector<HTMLElement>('.js-numberline-feedback'),
    solutionEl: el.querySelector<HTMLElement>('.js-solution'),
    confidenceRadios,
    config: parseGraphAttr(
      el.dataset.numberlineConfig,
      blockId,
      'data-numberline-config',
    ),
    answerKey: parseGraphAttr(
      el.dataset.numberlineAnswerKey,
      blockId,
      'data-numberline-answer-key',
    ),
    handle: null,
  };
}

// SR-only narration of an interval/ray answer (the visible readout would hand
// away a "graph the inequality" answer, so the block CSS hides data-mode=
// narrate). Describes each bounded end + its open/closed style; an absent bound
// reads as unbounded (a ray).
function describeInterval(iv: NumberLineBlockState['interval']): string {
  if (!iv) return '';
  const left =
    iv.min === undefined
      ? 'unbounded on the left'
      : 'from ' + iv.min + ' (' + (iv.minStyle ?? 'closed') + ')';
  const right =
    iv.max === undefined
      ? 'unbounded on the right'
      : 'to ' + iv.max + ' (' + (iv.maxStyle ?? 'closed') + ')';
  return 'Interval ' + left + ' ' + right + '.';
}

/**
 * Reflect one number-line block's state into the DOM regions this module owns:
 * the aria-live feedback line, the solution slot, the confidence radios, and the
 * widget lock. The board itself is the widget's. Exported for the kit's tests.
 */
export function renderNumberLineChrome(
  chrome: NumberLineChromeRef,
  nlState: NumberLineBlockState,
  section: GraphSectionStateView | undefined,
): void {
  // Solution slot — hidden until revealed at check time (fail-closed).
  if (chrome.solutionEl) {
    const wantHidden = !nlState.solutionRevealed;
    if (chrome.solutionEl.hidden !== wantHidden) {
      chrome.solutionEl.hidden = wantHidden;
    }
  }

  // Confidence radios reflect the stored selection and freeze with the widget
  // once the section is locked (same section?.locked condition as setLocked).
  const locked = section?.locked === true;
  for (const radio of chrome.confidenceRadios) {
    const wantChecked = radio.value === nlState.confidence;
    if (radio.checked !== wantChecked) radio.checked = wantChecked;
    if (radio.disabled !== locked) radio.disabled = locked;
  }

  // Feedback line: after the section is checked, reveal correctness; before
  // that, narrate the plotted answer for screen-reader users (SR-only via
  // data-mode=narrate; the visible result stays data-mode=result). Lean —
  // no mistake feedback (decision 6).
  if (chrome.feedbackEl) {
    const checked = section?.checked === true;
    let text = '';
    let dataState: string | null = null;
    let dataMode: string | null = null;
    if (checked && nlState.result !== null) {
      dataState = nlState.result ? 'correct' : 'incorrect';
      dataMode = 'result';
      text = nlState.result ? 'Correct!' : 'Not quite — try again.';
    } else if (nlState.answered) {
      if (chrome.interactionType === 'plot_interval') {
        text = describeInterval(nlState.interval);
      } else if (nlState.studentPoints.length > 0) {
        const plotted = nlState.studentPoints.join(', ');
        text =
          (nlState.studentPoints.length > 1
            ? 'Points plotted at '
            : 'Point plotted at ') +
          plotted +
          '.';
      }
      if (text !== '') dataMode = 'narrate';
    }
    const wantHidden = text === '';
    if (chrome.feedbackEl.hidden !== wantHidden) {
      chrome.feedbackEl.hidden = wantHidden;
    }
    if (chrome.feedbackEl.textContent !== text) {
      chrome.feedbackEl.textContent = text;
    }
    const currentState = chrome.feedbackEl.getAttribute('data-state');
    if (dataState !== currentState) {
      if (dataState === null) chrome.feedbackEl.removeAttribute('data-state');
      else chrome.feedbackEl.setAttribute('data-state', dataState);
    }
    const currentMode = chrome.feedbackEl.getAttribute('data-mode');
    if (dataMode !== currentMode) {
      if (dataMode === null) chrome.feedbackEl.removeAttribute('data-mode');
      else chrome.feedbackEl.setAttribute('data-mode', dataMode);
    }
  }

  // Lock the widget once the section is locked. The handle resolves async on
  // mount, so this no-ops until the board is up (attach re-applies on arrival).
  if (chrome.handle) {
    chrome.handle.setLocked(section?.locked === true);
  }
}

/**
 * The bridge's entry point for number-line blocks: parse each block's chrome,
 * mount the graded widget, bridge widget moves into the runtime's state, and
 * hand back the render delegate the runtime drives on every tick.
 *
 * Defensive throughout: a missing canvas or a failed mount leaves the static
 * SVG fallback in place — the line just can't be answered (it still submits as
 * unanswered, and a RESTORED answer still scores + submits via the inline
 * fold/gather in the bridge).
 */
export function attachNumberLineRuntime(
  ctx: NumberLineRuntimeContext,
): NumberLineRuntimeExt {
  const chromes = new Map<string, NumberLineChromeRef>();
  for (const [blockId, ref] of ctx.blocks) {
    chromes.set(blockId, buildNumberLineChrome(blockId, ref));
  }

  for (const [blockId, chrome] of chromes) {
    const config = {
      interactionType: chrome.interactionType,
      config: chrome.config,
      answerKey: chrome.answerKey,
    };

    mountNumberLineQuestion(chrome.canvas, config, {
      onChange: (resp: NumberLineResponseData) => {
        const ns = ctx.state.numberLines[blockId];
        if (!ns) return;
        ns.studentPoints = resp.studentPoints ?? [];
        ns.interval = resp.interval;
        ns.answered = resp.answered;
        // Unanswered → unscored (an omission), like an empty blank.
        ns.result = resp.answered ? resp.correct : null;
        ctx.onUpdate();
      },
    })
      .then((handle) => {
        chrome.handle = handle;
        // Restore the answer persisted on a prior load. Its onChange re-populates
        // state.numberLines[blockId] (answered + result), so a checked-and-
        // reloaded line comes back scored.
        const ns = ctx.state.numberLines[blockId];
        const hasInterval =
          ns?.interval !== undefined &&
          (ns.interval.min !== undefined || ns.interval.max !== undefined);
        if (ns && (ns.studentPoints.length > 0 || hasInterval)) {
          handle.restore(ns.studentPoints, { interval: ns.interval });
        }
        if (ctx.state.sections[chrome.sectionId]?.locked) handle.setLocked(true);
      })
      .catch((err) => {
        console.error('[activity-runtime] number-line widget failed to mount', err);
      });
  }

  const ext: NumberLineRuntimeExt = {
    render(): void {
      for (const [blockId, chrome] of chromes) {
        const ns = ctx.state.numberLines[blockId];
        if (ns) {
          renderNumberLineChrome(chrome, ns, ctx.state.sections[chrome.sectionId]);
        }
      }
    },
  };

  // First chrome paint: reflect whatever state the runtime restored before we
  // arrived (revealed solutions, verdicts, confidence).
  ext.render();

  return ext;
}

// =============================================================================
// Data-plot runtime (build_dotplot) — the statistics sibling of the above
// -----------------------------------------------------------------------------
// The graded data_plot widget's kit-side plumbing, mirroring the number-line
// runtime but leaner still: one interaction (build_dotplot), no interval state,
// no partial credit. display data_plots never reach here — they're static SVG
// the renderer draws, so there is no display path to mount.
// =============================================================================

interface DataPlotChromeRef {
  el: HTMLElement;
  canvas: HTMLElement;
  sectionId: string;
  interactionType: string;
  feedbackEl: HTMLElement | null;
  solutionEl: HTMLElement | null;
  confidenceRadios: HTMLInputElement[];
  config: unknown;
  data: unknown;
  answerKey: unknown; // build_boxplot: { tolerance }
  handle: DataPlotQuestionHandle | null;
}

/** Parse one graded data-plot block's chrome from its element. Exported for the
 *  kit's own tests, like buildNumberLineChrome. */
export function buildDataPlotChrome(
  blockId: string,
  ref: DataPlotRuntimeBlockRef,
): DataPlotChromeRef {
  const el = ref.el;
  const confidenceFieldset = el.querySelector<HTMLFieldSetElement>(
    '.js-confidence-rating',
  );
  const confidenceRadios: HTMLInputElement[] = confidenceFieldset
    ? Array.prototype.slice.call(
        confidenceFieldset.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]',
        ),
      )
    : [];

  return {
    el,
    canvas: ref.canvas,
    sectionId: ref.sectionId,
    interactionType: ref.interactionType,
    feedbackEl: el.querySelector<HTMLElement>('.js-dataplot-feedback'),
    solutionEl: el.querySelector<HTMLElement>('.js-solution'),
    confidenceRadios,
    config: parseGraphAttr(
      el.dataset.dataplotConfig,
      blockId,
      'data-dataplot-config',
    ),
    data: parseGraphAttr(el.dataset.dataplotData, blockId, 'data-dataplot-data'),
    answerKey: parseGraphAttr(
      el.dataset.dataplotAnswerKey,
      blockId,
      'data-dataplot-answer-key',
    ),
    handle: null,
  };
}

/**
 * Reflect one data-plot block's state into the DOM regions this module owns: the
 * aria-live feedback line, the solution slot, the confidence radios, and the
 * widget lock. Exported for the kit's tests.
 */
export function renderDataPlotChrome(
  chrome: DataPlotChromeRef,
  dpState: DataPlotBlockState,
  section: GraphSectionStateView | undefined,
): void {
  // Solution slot — hidden until revealed at check time (fail-closed).
  if (chrome.solutionEl) {
    const wantHidden = !dpState.solutionRevealed;
    if (chrome.solutionEl.hidden !== wantHidden) {
      chrome.solutionEl.hidden = wantHidden;
    }
  }

  // Confidence radios reflect the stored selection and freeze with the widget
  // once the section is locked (same section?.locked condition as setLocked).
  const locked = section?.locked === true;
  for (const radio of chrome.confidenceRadios) {
    const wantChecked = radio.value === dpState.confidence;
    if (radio.checked !== wantChecked) radio.checked = wantChecked;
    if (radio.disabled !== locked) radio.disabled = locked;
  }

  // Feedback line: after the section is checked, reveal correctness; before that,
  // narrate the number of dots placed for screen-reader users (SR-only via
  // data-mode=narrate). Narrating the COUNT (not "where") avoids handing away the
  // target distribution the student is building. Lean — no mistake feedback.
  if (chrome.feedbackEl) {
    const checked = section?.checked === true;
    let text = '';
    let dataState: string | null = null;
    let dataMode: string | null = null;
    if (checked && dpState.result !== null) {
      dataState = dpState.result ? 'correct' : 'incorrect';
      dataMode = 'result';
      text = dpState.result ? 'Correct!' : 'Not quite — try again.';
    } else if (dpState.answered) {
      // Narrate a shape-appropriate progress cue (never the target answer).
      if (dpState.studentBins) {
        text = 'Bar heights: ' + dpState.studentBins.join(', ') + '.';
      } else if (dpState.studentFive) {
        const f = dpState.studentFive;
        text = `Box: min ${f.min}, Q1 ${f.q1}, median ${f.median}, Q3 ${f.q3}, max ${f.max}.`;
      } else if (dpState.studentValues.length > 0) {
        const n = dpState.studentValues.length;
        text = n === 1 ? '1 dot plotted.' : n + ' dots plotted.';
      }
      if (text !== '') dataMode = 'narrate';
    }
    const wantHidden = text === '';
    if (chrome.feedbackEl.hidden !== wantHidden) {
      chrome.feedbackEl.hidden = wantHidden;
    }
    if (chrome.feedbackEl.textContent !== text) {
      chrome.feedbackEl.textContent = text;
    }
    const currentState = chrome.feedbackEl.getAttribute('data-state');
    if (dataState !== currentState) {
      if (dataState === null) chrome.feedbackEl.removeAttribute('data-state');
      else chrome.feedbackEl.setAttribute('data-state', dataState);
    }
    const currentMode = chrome.feedbackEl.getAttribute('data-mode');
    if (dataMode !== currentMode) {
      if (dataMode === null) chrome.feedbackEl.removeAttribute('data-mode');
      else chrome.feedbackEl.setAttribute('data-mode', dataMode);
    }
  }

  if (chrome.handle) {
    chrome.handle.setLocked(section?.locked === true);
  }
}

/**
 * The bridge's entry point for data-plot blocks: parse each block's chrome, mount
 * the graded widget, bridge widget changes into the runtime's state, and hand
 * back the render delegate the runtime drives on every tick. Defensive: a failed
 * mount leaves the static SVG fallback in place (the plot can't be built, but a
 * RESTORED answer still scores + submits via the inline fold/gather in the bridge).
 */
export function attachDataPlotRuntime(
  ctx: DataPlotRuntimeContext,
): DataPlotRuntimeExt {
  const chromes = new Map<string, DataPlotChromeRef>();
  for (const [blockId, ref] of ctx.blocks) {
    chromes.set(blockId, buildDataPlotChrome(blockId, ref));
  }

  for (const [blockId, chrome] of chromes) {
    const config = {
      interactionType: chrome.interactionType,
      config: chrome.config,
      data: chrome.data,
      answerKey: chrome.answerKey, // build_boxplot: { tolerance }
    };

    mountDataPlotQuestion(chrome.canvas, config, {
      onChange: (resp: DataPlotResponseData) => {
        const dp = ctx.state.dataPlots[blockId];
        if (!dp) return;
        // Exactly one of these is set per interaction type; keep them all so a
        // reload restores whichever build this block uses.
        dp.studentValues = resp.studentValues ?? [];
        dp.studentBins = resp.studentBins;
        dp.studentFive = resp.studentFive;
        dp.answered = resp.answered;
        // Unanswered → unscored (an omission), like an empty blank.
        dp.result = resp.answered ? resp.correct : null;
        ctx.onUpdate();
      },
    })
      .then((handle) => {
        chrome.handle = handle;
        // Restore the answer persisted on a prior load. Its onChange re-populates
        // state.dataPlots[blockId], so a checked-and-reloaded plot comes back
        // scored.
        const dp = ctx.state.dataPlots[blockId];
        const hasAnswer =
          dp &&
          ((dp.studentValues && dp.studentValues.length > 0) ||
            (dp.studentBins && dp.studentBins.length > 0) ||
            dp.studentFive !== undefined);
        if (dp && hasAnswer) {
          handle.restore({
            studentValues: dp.studentValues,
            studentBins: dp.studentBins,
            studentFive: dp.studentFive,
          });
        }
        if (ctx.state.sections[chrome.sectionId]?.locked) handle.setLocked(true);
      })
      .catch((err) => {
        console.error('[activity-runtime] data-plot widget failed to mount', err);
      });
  }

  const ext: DataPlotRuntimeExt = {
    render(): void {
      for (const [blockId, chrome] of chromes) {
        const dp = ctx.state.dataPlots[blockId];
        if (dp) {
          renderDataPlotChrome(chrome, dp, ctx.state.sections[chrome.sectionId]);
        }
      }
    },
  };

  ext.render();
  return ext;
}
