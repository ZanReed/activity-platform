// =============================================================================
// runtime/blanks.ts — Blank scoring + state updates
// -----------------------------------------------------------------------------
// Post-Stage-13-Session-1: the DOM-mutation layer is gone from this file.
// scoreBlank stays as pure scoring; the renamed scoreBlankAndUpdateState
// (was checkBlank) composes scoring with a state write but no DOM write —
// render() handles DOM updates downstream.
//
// Three-layer split now:
//   scoreBlank                — pure: ref + typed value → true/false/null
//   scoreBlankAndUpdateState  — composition: read ref.input.value, score,
//                               write to state.blanks[id]. No DOM writes.
//   wireBlanks                — attaches blur handlers that call the above
//                               and then trigger an onUpdate callback
//                               (which the caller wires to render).
//
// Trim rule: leading/trailing whitespace only. Case-SENSITIVE comparison
// matches what teachers expect for math (variable names, function names).
//
// Architectural note: evaluateAnswer (from strategies.ts) still reads
// data-* off the ref.input element. That's the same small architectural
// leak acknowledged in Stage 12; STATE.md flags refactoring as a Stage 13
// candidate "if it becomes friction." It hasn't been friction in Session 1's
// migration, so it stays as-is.
// =============================================================================

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
 * Read ref.input.value, score it, write the result to state.blanks[id].
 * Returns the result so callers (gatherResponses) can use it directly.
 *
 * No DOM writes here — render(state, refs) handles propagation to the
 * .correct/.incorrect classes (and, in Session 2, the feedback slot text,
 * hint affordance state, and locked-mode input.disabled).
 *
 * id is passed explicitly rather than read from ref.input.dataset.blankId
 * to keep DOM reads out of the scoring path (RUNTIME.md "Don't query the
 * DOM inside scoring or state functions"). The caller has the id from
 * the Map iteration.
 *
 * Was checkBlank in Stage 12. Renamed because "check" hid the side effect
 * — the new name makes the state write explicit.
 *
 * Silently no-ops the state write when state.blanks[id] is absent. This
 * is a graceful-degradation guard: if the refs map and state map ever
 * disagree (shouldn't happen post-init, but defense-in-depth), scoring
 * still returns the result without throwing.
 */
export function scoreBlankAndUpdateState(
  state: RuntimeState,
  id: string,
  ref: BlankRef,
): boolean | null {
  const result = scoreBlank(ref, ref.input.value);
  const blankState = state.blanks[id];
  if (blankState) {
    blankState.result = result;
    // Session 2 will populate blankState.matchedMistake here, scanning
    // ref.mistakeFeedback for a match against ref.input.value when result
    // is false.
  }
  return result;
}

/**
 * Wire every blank in refs.blanks to validate on blur. After scoring,
 * the onUpdate callback fires — index.ts wires it to render(state, refs)
 * so the DOM reflects the new state in one trip.
 */
export function wireBlanks(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  for (const [id, ref] of refs.blanks) {
    ref.input.addEventListener('blur', () => {
      scoreBlankAndUpdateState(state, id, ref);
      onUpdate();
    });
  }
}
