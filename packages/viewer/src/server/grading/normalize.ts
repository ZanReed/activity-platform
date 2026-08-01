// =============================================================================
// grading/normalize.ts — typographic normalization (author ruling G1, S4)
// -----------------------------------------------------------------------------
// The published-page runtime compares blank answers BYTE-EXACTLY: no Unicode
// normalization anywhere (verified against runtime/strategies.ts + blanks.ts —
// zero `normalize(` calls, zero codepoint folding). That is faithful parity,
// and it is also a real bug: a Chromebook math keyboard emits U+2212 MINUS SIGN
// where the answer key has U+002D HYPHEN-MINUS, so a student types an answer
// that is visually identical to the key and is marked wrong for an invisible
// reason. Design ruling 6.1A put "server-side unicode-minus normalization" in
// the a11y baseline; ruling 7.1A demands exact check-semantics parity. Author
// ruling G1 (2026-08-01) resolved the conflict in favour of normalizing.
//
// WHY THIS IS NOT A PEDAGOGY CHANGE (i.e. why it sits inside 7.1A, not against
// it): every mapping here is an INPUT-METHOD artifact. The student knew the
// answer and typed it; their keyboard or their paste buffer chose a different
// codepoint for the same glyph. Nothing here makes a WRONG answer right — it
// makes an answer that was always right stop being punished for its encoding.
//
// THE SET IS CLOSED AND DELIBERATELY TINY. Everything below is a pair of
// characters a reader cannot tell apart in a worksheet. Explicitly NOT here:
//   * case folding          — `X` vs `x` is a real distinction in algebra, and
//                             the runtime's case sensitivity is documented as
//                             deliberate ("matches teacher expectations for
//                             math"). Changing it would change marks.
//   * whitespace collapsing — interior spacing is significant (`x+1` and
//                             `x + 1` are different answers unless the teacher
//                             authored both), so collapsing would silently
//                             widen every answer key in the product.
//   * NFKC / full Unicode   — far too broad: it folds superscripts into digits
//                             (`x²` → `x2`), fractions (`½` → `1⁄2`), and
//                             ligatures, any of which can flip a math answer.
//
// APPLIED TO BOTH SIDES. The answer key gets the same treatment as the student
// value, because a teacher pasting a key out of a Google Doc hits exactly the
// same substitution — and a key with a smart quote in it currently cannot be
// matched by anything typeable on a plain keyboard.
// =============================================================================

/** Codepoint → replacement. Each entry is a glyph pair a reader cannot
 * distinguish at worksheet size. Kept as an explicit map (not a regex class)
 * so every addition is a deliberate, reviewable line. */
const LOOKALIKES: ReadonlyMap<string, string> = new Map([
  // ---- dashes: the case that motivated the ruling -------------------------
  ['−', '-'], // MINUS SIGN — what a math keyboard/MathLive emits
  ['–', '-'], // EN DASH — Docs/Word autocorrect on "3 - 4"
  ['—', '-'], // EM DASH — same autocorrect, longer
  ['‐', '-'], // HYPHEN
  ['‑', '-'], // NON-BREAKING HYPHEN
  ['﹣', '-'], // SMALL HYPHEN-MINUS
  ['－', '-'], // FULLWIDTH HYPHEN-MINUS

  // ---- quotes: paste-from-Docs, and iOS/Android smart punctuation ---------
  ['‘', "'"], // LEFT SINGLE QUOTATION MARK
  ['’', "'"], // RIGHT SINGLE QUOTATION MARK (also the apostrophe)
  ['‛', "'"],
  ['′', "'"], // PRIME — "f'(x)" typed as a prime
  ['“', '"'], // LEFT DOUBLE QUOTATION MARK
  ['”', '"'], // RIGHT DOUBLE QUOTATION MARK
  ['″', '"'], // DOUBLE PRIME

  // ---- spaces: invisible, and the most maddening to debug -----------------
  [' ', ' '], // NO-BREAK SPACE — pasted HTML, and Word's "3 000"
  [' ', ' '], // FIGURE SPACE
  [' ', ' '], // NARROW NO-BREAK SPACE
  [' ', ' '], // THIN SPACE
  ['﻿', ''], // ZERO WIDTH NO-BREAK SPACE (BOM) — delete, not space
  ['​', ''], // ZERO WIDTH SPACE — delete
]);

// Built once from the map so the two can never drift apart.
const LOOKALIKE_RE = new RegExp(
  `[${[...LOOKALIKES.keys()].join('')}]`,
  'g',
);

/**
 * Fold typographic look-alikes to their ASCII equivalents. Applied to BOTH the
 * student's value and every answer-key entry before comparison.
 *
 * Deliberately does NOT trim — trimming is the caller's job and has its own
 * parity rule (the student's value is trimmed; key entries are not).
 */
export function normalizeLookalikes(value: string): string {
  // Fast path: the overwhelming majority of answers are plain ASCII, and this
  // runs once per blank per check.
  if (!LOOKALIKE_RE.test(value)) {
    LOOKALIKE_RE.lastIndex = 0; // `g` regexes are stateful with .test()
    return value;
  }
  LOOKALIKE_RE.lastIndex = 0;
  return value.replace(LOOKALIKE_RE, (ch) => LOOKALIKES.get(ch) ?? ch);
}

/** Trim leading/trailing whitespace exactly as the runtime does
 * (`/^\s+|\s+$/g` — JS `\s`, so it already covers NBSP and friends). Interior
 * whitespace is preserved: it is significant. */
export function trimValue(value: string): string {
  return value.replace(/^\s+|\s+$/g, '');
}

/** The student's typed value, prepared for comparison: normalized, then
 * trimmed. Order matters — normalizing first turns a NBSP-only value into a
 * space-only value, which then trims to empty (and so scores as an omission
 * rather than as a wrong answer, which is the correct reading of "the student
 * left it blank"). */
export function prepareStudentValue(value: string): string {
  return trimValue(normalizeLookalikes(value));
}

/** An answer-key entry, prepared for comparison. Normalized but NOT trimmed —
 * parity: the runtime splits `answers` on `|` and compares the raw entries, so
 * a key authored with a stray trailing space has never matched and must
 * continue not to match (silently "fixing" it here would change marks on
 * already-published activities). */
export function prepareKeyValue(value: string): string {
  return normalizeLookalikes(value);
}
