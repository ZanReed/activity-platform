// =============================================================================
// blankSize.ts — how many characters wide a blank's input is
// -----------------------------------------------------------------------------
// One rule for every blank the viewer renders (prose blanks in FillInBlank and
// blanks in table cells), so the two can never disagree.
//
//   - An authored `width` always wins.
//   - An UNSIZED NUMERIC blank starts at NUMERIC_BLANK_MIN_CHARS on screen and
//     GROWS with what is typed in it (one character of room past the value), up
//     to NUMERIC_BLANK_MAX_CHARS. Author finding 2026-10-04: at the browser
//     default of 20 characters, "The scale factor is ____ ." took a line of its
//     own in a third-width column. A fixed 8 (option 2, 2026-10-05) still
//     wrapped there — about 5 characters remain after the sentence — so the
//     author chose start-small-and-grow (2026-10-05). The start is FIXED per
//     answer type and the growth follows only the student's own typing, so the
//     width says nothing about the answer — the reason the student side never
//     sizes a blank from its answer. `answerType` is already served (it is not a
//     BLANK_SECRET_FIELD). The cap is the old browser default; the column's
//     `max-width: 100%` (viewer.css) bounds it further.
//   - A text or math blank keeps the browser default, as before.
//   - PRINT is unchanged: paper has its own 8ch floor for handwriting
//     (viewer.css, underline-blanks), and handwriting needs more room than a
//     typed character.
//
// No number keypad (inputmode) for numeric blanks: a numeric blank may require
// a UNIT typed into the same box ({{=1.5 unit: km/h}}), the unit is stripped
// as answer-key material, so the viewer cannot tell which numeric blanks need
// letters — and a digits-only keypad would make "km/h" untypeable.
// =============================================================================

export const NUMERIC_BLANK_MIN_CHARS = 4;
export const NUMERIC_BLANK_MAX_CHARS = 20;

export function blankInputSize(
  blank: { width?: number; answerType?: string },
  mode: 'screen' | 'print',
  value: string,
): number | undefined {
  if (blank.width) return blank.width;
  if (mode === 'screen' && blank.answerType === 'numeric') {
    return Math.min(NUMERIC_BLANK_MAX_CHARS, Math.max(NUMERIC_BLANK_MIN_CHARS, value.length + 1));
  }
  return undefined;
}
