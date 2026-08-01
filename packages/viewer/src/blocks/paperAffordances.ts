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
