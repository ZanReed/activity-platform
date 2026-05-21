// =============================================================================
// runtime/blanks.ts — Blank scoring + feedback rendering
// -----------------------------------------------------------------------------
// Three-layer split (post-Stage-12-6b):
//
//   scoreBlank         — pure: takes a BlankRef + typed value, returns
//                        true/false/null (null = empty). No DOM mutation.
//   applyBlankFeedback — DOM-only: toggles .correct / .incorrect classes
//                        on the input. Reads no state, makes no decisions.
//   checkBlank         — convenience: reads ref.input.value, runs scoreBlank,
//                        runs applyBlankFeedback, returns the result. Used
//                        by both blur wiring and gatherResponses so the two
//                        paths stay in lockstep about what "checking" means.
//
// Trim rule: leading/trailing whitespace only. Case-SENSITIVE comparison
// matches what teachers expect for math (variable names, function names).
// Case-insensitive verbal-answer matching is a future per-strategy concern,
// not a global one.
//
// Architectural note: evaluateAnswer (from strategies.ts) still reads
// data-* off the ref.input element. That's a small architectural leak
// accepted for 6b's scope — strategies.ts and its tests stay untouched.
// Refactoring strategies to take parsed (strategy, answers) as plain
// values is a Stage 13 candidate if it becomes friction.
// =============================================================================

import type { BlankRef, Refs } from './refs.js';
import { evaluateAnswer } from './strategies.js';

/** Trim leading/trailing whitespace. Shared so the rule has one home. */
export function trimValue(value: string): string {
  return value.replace(/^\s+|\s+$/g, '');
}

/**
 * Pure: score one blank against its ref, returning true/false/null.
 * Null means the typed value is empty (or whitespace-only) and therefore
 * unscored. Does not touch the DOM.
 */
export function scoreBlank(ref: BlankRef, typed: string): boolean | null {
  const trimmed = trimValue(typed);
  if (trimmed === '') return null;
  return evaluateAnswer(ref.input, trimmed);
}

/**
 * DOM-only: apply correct/incorrect feedback classes to the blank's input.
 * Clears both classes when result is null (empty / unscored). Partner of
 * scoreBlank in the "compute then render" pattern — Stage 13's render()
 * function takes over once feedback grows beyond class toggles.
 */
export function applyBlankFeedback(
  ref: BlankRef,
  correct: boolean | null,
): void {
  if (correct === null) {
    ref.input.classList.remove('correct', 'incorrect');
    return;
  }
  ref.input.classList.toggle('correct', correct);
  ref.input.classList.toggle('incorrect', !correct);
}

/**
 * Score + apply in one call. Reads ref.input.value so the caller doesn't
 * have to. Used by both the blur handler (wireBlanks) and gatherResponses
 * so the two paths stay consistent about what "checking" means.
 */
export function checkBlank(ref: BlankRef): boolean | null {
  const result = scoreBlank(ref, ref.input.value);
  applyBlankFeedback(ref, result);
  return result;
}

/** Wire every blank in refs.blanks to validate on blur. */
export function wireBlanks(refs: Refs): void {
  for (const ref of refs.blanks.values()) {
    ref.input.addEventListener('blur', () => {
      checkBlank(ref);
    });
  }
}
