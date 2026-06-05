// =============================================================================
// runtime/blanks.ts — Blank scoring, state updates, per-blank wiring
// -----------------------------------------------------------------------------
// Post-Stage-13-Session-2: covers all per-blank concerns — scoring, mistake
// feedback dispatch, edit-to-clear, and the hint modal trigger. No DOM
// mutation happens here; every state change routes through onUpdate → render.
//
// Layered API:
//   trimValue                  — whitespace rule, shared with scoring + matching
//   scoreBlank                 — pure: ref + typed → true/false/null
//   matchMistakeFeedback       — pure: ref + typed → matched feedback text | null
//   scoreBlankAndUpdateState   — composition: read input, score, write to state
//                                (result + matchedMistake). No DOM writes.
//   clearBlankState            — clear stale result + matchedMistake when the
//                                student edits a previously-scored blank.
//                                Returns boolean: did anything actually change?
//                                The caller uses that to skip onUpdate when
//                                there's nothing to render — avoids cascading
//                                renders on every keystroke during initial
//                                typing.
//   wireBlanks                 — attaches blur (score) + input (clear) handlers
//   wireHints                  — `?` buttons open the global hint modal
//   wireHintModal              — modal close handlers (×, overlay, Escape)
//
// Mistake matching rule: string match against BlankRef.mistakeFeedback
// entries' `match` field, case-insensitive (both sides trimmed + lowercased),
// first match wins. Deliberately looser than the case-sensitive scoring rule —
// a student shouldn't lose targeted help over capitalization. Only ever runs on
// a wrong answer (result === false), so it can't contradict a correct score.
//
// Architectural note: evaluateAnswer (strategies.ts) still reads data-*
// off ref.input — same small leak acknowledged in Stage 12. It hasn't
// been friction; STATE.md keeps it on the "refactor if friction" list.
// =============================================================================

import type { AnswerFeedback } from './config.js';
import type { BlankRef, Refs } from './refs.js';
import type { RuntimeState } from './state.js';
import { evaluateAnswer } from './strategies.js';

/** Trim leading/trailing whitespace. Shared so the rule has one home. */
export function trimValue(value: string): string {
  return value.replace(/^\s+|\s+$/g, '');
}

/**
 * Pure: score one blank against its ref, returning true/false/null.
 * Null means the typed value is empty (or whitespace-only) and therefore
 * unscored. Does not touch the DOM and does not touch state.
 */
export function scoreBlank(ref: BlankRef, typed: string): boolean | null {
  const trimmed = trimValue(typed);
  if (trimmed === '') return null;
  return evaluateAnswer(ref.input, trimmed);
}

/**
 * Pure: find a mistake-feedback entry whose `match` equals the trimmed,
 * lowercased typed value (case-insensitive). Returns the feedback text, or
 * null when no entry matches.
 *
 * Empty/whitespace-only typed values always return null — even if the
 * teacher authored an entry with an empty match string, an empty answer
 * is "unscored" rather than "wrong in a specific way," so no targeted
 * feedback applies.
 *
 * Matching is case-insensitive (both sides trimmed + lowercased): a student
 * who types "Slope" still gets the feedback authored for "slope". The student
 * shouldn't lose targeted help over capitalization.
 *
 * First match wins. Teachers shouldn't author duplicate match strings;
 * if they do, the array order in mistakeFeedback wins (which is document
 * order from the schema).
 */
export function matchMistakeFeedback(
  ref: BlankRef,
  typed: string,
): string | null {
  const needle = trimValue(typed).toLowerCase();
  if (needle === '') return null;
  for (const entry of ref.mistakeFeedback) {
    if (trimValue(entry.match).toLowerCase() === needle) return entry.feedback;
  }
  return null;
}

/**
 * Read ref.input.value, score it, write result + matchedMistake to
 * state.blanks[id]. Returns the result so callers (gatherResponses) can
 * use it directly.
 *
 * matchedMistake is only populated when result === false AND a match
 * exists. Correct or unscored answers always clear it — a stale message
 * from a previous incorrect attempt would be confusing after the student
 * fixes the answer.
 *
 * No DOM writes — render(state, refs) handles propagation.
 *
 * Silently no-ops the state write when state.blanks[id] is absent
 * (graceful degradation — refs and state should always agree post-init,
 * but defense-in-depth).
 */
export function scoreBlankAndUpdateState(
  state: RuntimeState,
  id: string,
  ref: BlankRef,
): boolean | null {
  const typed = ref.input.value;
  const result = scoreBlank(ref, typed);
  const blankState = state.blanks[id];
  if (blankState) {
    blankState.result = result;
    blankState.matchedMistake =
    result === false ? matchMistakeFeedback(ref, typed) : null;
  }
  return result;
}

/**
 * Clear stale result + matchedMistake on a blank. Used by the input
 * event handler so an edited answer doesn't keep its green "correct"
 * border (or stale mistake text) until the student blurs again.
 *
 * Returns true when anything actually changed; false when state was
 * already clean. The caller uses this to skip a needless render — on
 * keystrokes 2..N of a fresh edit there's nothing to clear, so onUpdate
 * isn't called and render() doesn't run.
 *
 * Does NOT touch hint-modal state. Editing a blank shouldn't close an
 * open hint — the hint is independent of the answer state.
 */
export function clearBlankState(state: RuntimeState, id: string): boolean {
  const blankState = state.blanks[id];
  if (!blankState) return false;
  if (blankState.result === null && blankState.matchedMistake === null) {
    return false;
  }
  blankState.result = null;
  blankState.matchedMistake = null;
  return true;
}

/**
 * Wire every blank's blur (commit + score) and input (clear stale state).
 * After either handler runs, the onUpdate callback fires — index.ts wires
 * it to render(state, refs).
 *
 * answerFeedback gates the blur handler. In 'immediate' mode, blur scores the
 * blank so the student sees correct/incorrect right away (self-check). In
 * 'on_check' mode, blur does NOT score — correctness stays hidden until the
 * section is checked or the activity is submitted (both of which score through
 * their own paths). The typed value still persists regardless (storage saves
 * input.value independently of blank result state).
 *
 * The input handler runs in BOTH modes: even in 'on_check', once a section
 * check has set results, editing a blank should clear its stale border
 * (edit-to-clear). It's gated by clearBlankState's return — keystrokes that
 * don't change state don't trigger renders.
 */
export function wireBlanks(
  answerFeedback: AnswerFeedback,
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  for (const [id, ref] of refs.blanks) {
    if (answerFeedback === 'immediate') {
      ref.input.addEventListener('blur', () => {
        scoreBlankAndUpdateState(state, id, ref);
        onUpdate();
      });
    }
    ref.input.addEventListener('input', () => {
      if (clearBlankState(state, id)) {
        onUpdate();
      }
    });
  }
}

/**
 * Wire every blank that has a hint button. Click opens the global hint modal
 * for that blank (state.hintModalBlankId = id); render copies the blank's hint
 * text into the modal and reveals it. Focus is moved into the dialog (the
 * close button) so keyboard + screen-reader users land inside the modal.
 *
 * Blanks without an authored hint have hintButton === null and are
 * skipped silently — no hint affordance is emitted by the renderer for
 * those blanks.
 */
export function wireHints(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  for (const [id, ref] of refs.blanks) {
    if (!ref.hintButton) continue;
    ref.hintButton.addEventListener('click', () => {
      state.hintModalBlankId = id;
      onUpdate();
      refs.hintModal?.closeButton.focus();
    });
  }
}

/**
 * Wire the global hint modal's three close affordances: the × button, a click
 * on the overlay outside the dialog box, and the Escape key. On close, focus
 * returns to the `?` button that opened the modal (kept for keyboard users).
 *
 * No-ops when the page has no modal markup (refs.hintModal === null).
 */
export function wireHintModal(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  const modal = refs.hintModal;
  if (!modal) return;

  const close = () => {
    const previousId = state.hintModalBlankId;
    if (previousId === null) return;
    state.hintModalBlankId = null;
    onUpdate();
    refs.blanks.get(previousId)?.hintButton?.focus();
  };

  modal.closeButton.addEventListener('click', close);

  // A click on the overlay itself (not bubbled up from the dialog) is an
  // "outside" click — close. Clicks inside the dialog have a different target.
  modal.overlay.addEventListener('click', (e) => {
    if (e.target === modal.overlay) close();
  });

  // Escape closes, but only while the modal is open so we don't swallow
  // Escape elsewhere on the page.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.hintModalBlankId !== null) {
      e.preventDefault();
      close();
    }
  });
}
