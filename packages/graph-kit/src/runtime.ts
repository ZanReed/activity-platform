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
  mountGraphDisplay,
  type GraphQuestionHandle,
  type GraphResponseData,
} from './graph-question.js';
import type {
  GraphBlockState,
  GraphRuntimeBlockRef,
  GraphRuntimeContext,
  GraphRuntimeExt,
  GraphSectionStateView,
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
  // state↔DOM consistent). No-op when the block has no fieldset.
  for (const radio of chrome.confidenceRadios) {
    const wantChecked = radio.value === graphState.confidence;
    if (radio.checked !== wantChecked) {
      radio.checked = wantChecked;
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

    mountGraphQuestion(chrome.canvas, config, {
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
        if (gs && (gs.points.length > 0 || gs.noSolution)) {
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
