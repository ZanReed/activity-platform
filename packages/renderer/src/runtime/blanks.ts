// =============================================================================
// runtime/blanks.ts — Blank validation
// -----------------------------------------------------------------------------
// On blur, mark a blank correct/incorrect. Comparison is whitespace-trimmed
// and case-SENSITIVE — case sensitivity matches what teachers expect for math
// (variable names, function names). Case-insensitive comparison for verbal
// answers is a future per-strategy concern, not a global one.
//
// Note on the regex: the pre-Stage-11 runtime lived inside a TS template
// literal, so the trim pattern was written `\\s` (an escaped backslash, so the
// emitted *string* contained `\s`). As real module source it is a normal
// regex literal — `\s`, single backslash.
// =============================================================================

import { $$ } from './dom.js';
import { evaluateAnswer } from './strategies.js';

/** Trim leading/trailing whitespace. Shared so the trim rule has one home. */
export function trimValue(value: string): string {
  return value.replace(/^\s+|\s+$/g, '');
}

/**
 * Validate one blank. Returns true/false when scored, or null when the blank
 * is empty (unscored). Side effect: toggles the `correct` / `incorrect`
 * classes on the input.
 */
export function checkBlank(input: HTMLInputElement): boolean | null {
  const value = trimValue(input.value);
  if (value === '') {
    input.classList.remove('correct', 'incorrect');
    return null; // unscored
  }
  const correct = evaluateAnswer(input, value);
  input.classList.toggle('correct', correct);
  input.classList.toggle('incorrect', !correct);
  return correct;
}

/** Wire every `.blank` input to validate on blur. */
export function wireBlanks(): void {
  $$<HTMLInputElement>('.blank').forEach((input) => {
    input.addEventListener('blur', () => {
      checkBlank(input);
    });
  });
}
