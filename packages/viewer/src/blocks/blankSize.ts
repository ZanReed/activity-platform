// =============================================================================
// blankSize.ts — how many characters wide a blank's input is
// -----------------------------------------------------------------------------
// One rule for every blank the viewer renders (prose blanks in FillInBlank and
// blanks in table cells), so the two can never disagree.
//
//   - An authored `width` always wins.
//   - An UNSIZED NUMERIC blank defaults to NUMERIC_BLANK_DEFAULT_CHARS on
//     screen. The browser's own default is 20 characters, which pushed "The
//     scale factor is ____ ." onto a line of its own in a third-width column
//     (author finding 2026-10-04; option 2, ruled 2026-10-05). The default is
//     FIXED per answer type, so it says nothing about the answer's length —
//     the reason the student side never sizes a blank from its answer.
//     `answerType` is already served (it is not a BLANK_SECRET_FIELD).
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

export const NUMERIC_BLANK_DEFAULT_CHARS = 8;

export function blankInputSize(
  blank: { width?: number; answerType?: string },
  mode: 'screen' | 'print',
): number | undefined {
  if (blank.width) return blank.width;
  if (mode === 'screen' && blank.answerType === 'numeric') return NUMERIC_BLANK_DEFAULT_CHARS;
  return undefined;
}
