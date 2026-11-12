// =============================================================================
// tests/a11yStories.ts — the per-block a11y story (ruling 6.1A), test-side
// -----------------------------------------------------------------------------
// Moved out of registry.ts on 2026-11-13 (shell-size review R1): nothing at
// runtime reads a story, and as registry DATA every word of this prose shipped
// in the student shell (−1.3 KiB gz). The guard in registry.test.ts still makes
// a story REQUIRED for every interactive type, and refuses a story for a type
// that is not interactive, so the set cannot drift from the registry.
// Free text, one paragraph: the full keyboard path and what gets announced. The
// block's component must implement what its story says.
// =============================================================================

import type { BlockType } from '../src/index.js';

export const A11Y_STORIES: Partial<Record<BlockType, string>> = {
  math_block:
    'Each in-equation gap is a text input in tab order, labeled with its ' +
    'position within the equation ("gap 1 of 2"). The PROBLEM number is ' +
    'announced once by the block wrapper, which is a labelled group — not ' +
    'repeated on every gap (viewer-numbering D3). Values type as plain text; ' +
    'verdicts are announced via the shared state-pill aria-live region.',
  fill_in_blank:
    'Each blank is a text input in tab order, labeled with its sub-part ' +
    'and position ("Part b, blank 2 of 3") on a numbered multi-blank ' +
    'problem, and "Blank 2 of 3" otherwise. The PROBLEM number is ' +
    'announced once by the block wrapper, which is a labelled group, ' +
    'rather than repeated on every blank (viewer-numbering D3/N7). ' +
    'Hint and mistake ' +
    'affordances are buttons reachable by Tab; the opened popover traps ' +
    'no focus and closes on Escape. Verdicts announce via aria-live.',
  interactive_graph:
    'The canvas is focusable; handles move by arrow keys with position ' +
    'narration to a visually-hidden aria-live region (a visible readout ' +
    'would hand over the answer — reading the grid is the skill). ' +
    'Post-check results are visible text. Touch targets meet 44px.',
  multiple_choice:
    'Native radio (single) / checkbox (multi) inputs grouped in a ' +
    'fieldset whose legend is the prompt; full label click targets. ' +
    'Standard arrow-key radio behavior; verdicts announce via aria-live.',
  matching:
    'Pointer drag with a keyboard select-then-place grammar underneath: ' +
    'target cards are focusable, Space/Enter lifts, arrows choose a dock, ' +
    'Space/Enter places, Escape cancels. Every move narrates to a ' +
    'visually-hidden aria-live region ("Card B placed on item 2").',
  correspondence:
    'One native <select> per (item, column) cell — operable by keyboard, ' +
    'screen reader, and touch with no custom grammar (the shipped ' +
    'matching affordance, generalized). Each select is labeled with its ' +
    'item and column ("Graph for item 2"); options carry the column\'s ' +
    'derived letters. Verdicts announce via the shared state-pill ' +
    'aria-live region.',
  ordering:
    'Rows are focusable and reorder via the shared lift grammar: ' +
    'Space/Enter lifts, arrows move the row, Space/Enter drops, Escape ' +
    'cancels; positions narrate to a visually-hidden aria-live region.',
  number_line:
    'The line is focusable; points/interval endpoints move by arrow keys ' +
    'with value narration to a visually-hidden aria-live region (visible ' +
    'readout would reveal the answer). Post-check results are visible.',
  data_plot:
    'Chart-building controls are focusable; dots/bars/box handles adjust ' +
    'by arrow keys with value narration to a visually-hidden aria-live ' +
    'region. Post-check results are visible text.',
  table:
    'The table is a real <table> with <th> cells on whichever axis the ' +
    'author marked (headerRow / headerColumn), so a screen reader ' +
    'announces a blank cell with its row and column headers — "Kilograms ' +
    '2, Cost, blank" — which is the information a sighted student reads ' +
    'off the grid. Each blank is a text input in tab order, reading order ' +
    'left to right then down. On a multi-blank table the input also ' +
    'carries its sub-part letter ("Part b"), matching the (b) marker ' +
    'printed beside it; that marker is aria-hidden so it is not announced ' +
    'twice. The PROBLEM number is announced once by the block wrapper, ' +
    'never repeated per cell (viewer-numbering D3). Verdicts announce via ' +
    'the shared state-pill aria-live region.',
  self_explanation:
    'A labeled textarea in tab order. On check the block announces ' +
    '"Recorded — your teacher will review" via aria-live; never a verdict.',
  short_answer:
    'A labeled textarea in tab order. Recorded state announces via ' +
    'aria-live; teacher feedback, once released, renders as a labeled ' +
    'region announced on arrival.',
  essay:
    'A labeled textarea in tab order. The live word counter is ' +
    'aria-live=polite and debounced so it never chatters per keystroke. ' +
    'Recorded state and released teacher feedback announce via aria-live.',
};
