// =============================================================================
// blocks/paperAffordances.ts — the conventions a worksheet needs on paper (S5)
// -----------------------------------------------------------------------------
// On screen a question is answered through a control: a radio, a select, a
// reorder button. None of those exist on paper, so a printed worksheet falls
// back on conventions older than the software — circle a letter, write a letter
// on a line, number the steps in a box. These helpers produce the markers for
// those conventions.
//
// Two rules they all follow:
//
//  1. RENDERED ALWAYS, revealed by @media print. The browser's own File > Print
//     gives no hook to prepare in, so an affordance built only when printing
//     starts is simply absent from the page. viewer.css hides them on screen.
//  2. aria-hidden. Every one of them duplicates information the accessible name
//     already carries; a screen reader reading "A" before each option, or an
//     empty box before each step, is noise.
//
// Letters match the renderer's convention exactly (String.fromCharCode(65 + i %
// 26)) so a class discussing "choice B" means the same choice on both surfaces
// — the parity gate asserts the markers exist, and this keeps them AGREEING.
// =============================================================================

/**
 * Position letter for a choice or a matching target: A, B, C, …
 *
 * Wraps after 26 rather than growing to AA, matching the renderer. A 27-option
 * multiple-choice question is not a real worksheet, and the wrap keeps the
 * marker one character wide, which is what the print column is sized for.
 */
export function choiceLetter(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

// Correspondence column marker sequences (design R2/D7): each target column
// labels its cards in a VISUALLY DISTINCT sequence so a written answer line
// ("2. C · ii · β") reads unambiguously in grayscale print. Column 0 reuses
// choiceLetter (A, B, C); these cover columns 1 and 2. Derived at render from
// shuffle order, never stored — the choiceLetter discipline.
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
  'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'];
const GREEK = 'αβγδεζηθικλμνξοπρστυ';

export function romanLetter(index: number): string {
  return ROMAN[index % ROMAN.length]!;
}

export function greekLetter(index: number): string {
  return GREEK.charAt(index % GREEK.length);
}

/** The marker for card `index` of correspondence target column `column`. */
export function columnLetter(column: number, index: number): string {
  if (column === 0) return choiceLetter(index);
  if (column === 1) return romanLetter(index);
  return greekLetter(index);
}
