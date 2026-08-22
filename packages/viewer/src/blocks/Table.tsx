// =============================================================================
// blocks/Table.tsx — a real table, whose cells can hold blanks (S-table)
// -----------------------------------------------------------------------------
// Plan + rulings: docs/design/table-block.md.
//
// WHY A REAL <table> AND NOT A GRID OF DIVS. The workaround this block replaces
// was a ```columns fence, which prints something that LOOKS like a table and is
// two adjacent block stacks: its divider rules are drawn per column,
// independently, so the moment one cell's label wraps to a second line the two
// columns' rules desync. There is no row concept in that DOM to hold a row
// together. A <table> has one, gets it right on paper for free, and — the part
// no div grid can buy back — hands a screen reader the row/column header
// association that makes a blank cell announceable ("Kilograms 2, Cost, blank")
// instead of an unlabelled edit box in a sea of cells.
//
// SO THE HEADER FLAGS ARE NOT STYLING. `headerRow`/`headerColumn` decide which
// cells are <th> and what `scope` they carry, which is exactly what the a11y
// story in the registry promises. An algebra table is as often transposed (x
// down the left) as not, which is why both axes exist.
//
// LETTERS ARE DERIVED, NEVER STORED. `tableBlankIds` gives reading order
// (row-major) and the letter is `stepLetter` of the position in it — the same
// rule fill_in_blank's sub-parts follow, and the same order that decides what
// `interchangeableWithPrevious` means inside a table. One enumeration, in
// schema, so the screen, the paper and the teacher's key cannot disagree about
// which gap is "(b)".
// =============================================================================

import type { TableBlock } from '@activity/schema';
import { stepLetter, tableBlankIds } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useBlockAnswerKey } from '../answer-key/context.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

/** Plain text of a cell's inline content — the accessible name a header cell
 *  lends to the cells it heads. Math and blanks contribute nothing readable, so
 *  they are skipped rather than stringified into noise.
 *
 *  Typed structurally rather than against TableBlock: this component receives
 *  the SANITIZED projection, whose blank tokens are missing the stripped answer
 *  fields and therefore are not the authored type. That mismatch is the
 *  answer-key guarantee showing up in the type system, not an inconvenience. */
function cellText(content: ReadonlyArray<{ type: string; text?: string }>): string {
  return content
    .map((node) => (node.type === 'text' ? (node.text ?? '') : ''))
    .join('')
    .trim();
}

export default function Table({
  block,
  mode = 'screen',
  label,
}: BlockComponentProps<TableBlock>) {
  const { store, state, phaseOf, resultFor } = useViewer();
  const phase = phaseOf(block.id);
  const answerKey = useBlockAnswerKey(block.id);

  // Reading order, and therefore the letters. Computed once per render from the
  // block itself — a property of the DOCUMENT, not of the frame it painted in
  // (the same reason numbering is a precomputed map rather than a counter).
  const blankIds = tableBlankIds(block);

  // Sub-part letters appear on the same terms as fill_in_blank's (ruling N7):
  // a numbered problem with more than one gap. A single-blank table has nothing
  // to tell apart, and an out-of-sequence label (custom/none) is not numbered.
  //
  // …AND the author can switch them off. `showCellLabels` mirrors
  // faded_worked_example's `showStepLabels`, which hides its markers on EVERY
  // surface rather than only on paper — so this does too. The reason a teacher
  // reaches for it is writing room on a printed sheet, but a marker that shows
  // on screen and not on paper would make the screen and the sheet disagree
  // about what the gaps are called, which is worse than either choice alone.
  //
  // The accessible name does NOT disappear with the marker: with letters off it
  // falls through to "Blank 2 of 4" below, so a screen-reader user can still
  // tell the gaps apart. Hiding a visual marker must never remove the only way
  // a non-visual reader has to address a field.
  const letterBlanks =
    block.showCellLabels !== false &&
    label?.kind === 'number' &&
    blankIds.length >= 2;

  const headerTexts = {
    // Column headers: the top row's cells, when the author marked one.
    column: block.headerRow
      ? (block.rows[0]?.cells.map((c) => cellText(c.content)) ?? [])
      : [],
    // Row headers: the first cell of each row, when the author marked that axis.
    row: block.headerColumn
      ? block.rows.map((r) => cellText(r.cells[0]?.content ?? []))
      : [],
  };

  return (
    <div
      className="viewer-table"
      data-block-type="table"
      data-block-id={block.id}
      data-phase={phase}
    >
      <table className="viewer-table__grid">
        <tbody>
          {block.rows.map((row, rowIndex) => {
            const isHeaderRow = block.headerRow && rowIndex === 0;
            return (
              <tr key={row.id} className="viewer-table__row">
                {row.cells.map((cell, cellIndex) => {
                  const isHeaderCell =
                    isHeaderRow || (block.headerColumn && cellIndex === 0);
                  const align = block.columnAligns?.[cellIndex] ?? 'left';
                  const cellProps = {
                    className: 'viewer-table__cell',
                    'data-cell-id': cell.id,
                    'data-align': align,
                    ...(isHeaderCell
                      ? // scope tells a screen reader WHICH cells this header
                        // governs. Without it a <th> is just bold text.
                        { scope: isHeaderRow ? ('col' as const) : ('row' as const) }
                      : {}),
                  };

                  const body = (
                    <InlineContent
                      nodes={cell.content}
                      renderBlank={(blank) => {
                        const keyAnswer = answerKey?.blanks?.[blank.id];
                        const value =
                          keyAnswer ?? state.responses.blanks[blank.id] ?? '';
                        const result = resultFor(block.id, blank.id);
                        const index = blankIds.indexOf(blank.id);

                        // The accessible name a sighted student reads off the
                        // grid: which row, which column. Falls back to the
                        // sub-part letter when an axis carries no header, so
                        // the input is never anonymous.
                        const rowName = headerTexts.row[rowIndex] ?? '';
                        const colName = headerTexts.column[cellIndex] ?? '';
                        const place = [rowName, colName].filter(Boolean).join(', ');
                        const part = letterBlanks
                          ? `Part ${stepLetter(index)}`
                          : blankIds.length > 1
                            ? `Blank ${index + 1} of ${blankIds.length}`
                            : 'Blank';
                        const ariaLabel = place ? `${place}, ${part}` : part;

                        return (
                          <span className="viewer-blank" data-blank-id={blank.id}>
                            {letterBlanks ? (
                              // aria-hidden: the input's own name already says
                              // "Part b"; announcing the marker too would say
                              // it twice (the fill_in_blank rule).
                              <span
                                className="viewer-blank__sublabel"
                                aria-hidden="true"
                              >
                                ({stepLetter(index)})
                              </span>
                            ) : null}
                            <input
                              type="text"
                              className="viewer-blank__input"
                              value={value}
                              readOnly={mode === 'print' || keyAnswer !== undefined}
                              aria-label={ariaLabel}
                              {...(keyAnswer !== undefined
                                ? { 'data-answer-key': 'filled' }
                                : {})}
                              {...(blank.width ? { size: blank.width } : {})}
                              {...(result
                                ? {
                                    'data-verdict': result.verdict,
                                    'aria-invalid': result.verdict === 'incorrect',
                                  }
                                : {})}
                              onChange={(event) =>
                                store.setBlank(blank.id, event.target.value)
                              }
                            />
                            {result ? (
                              <StatePill
                                state={
                                  result.verdict === 'correct'
                                    ? 'correct'
                                    : 'incorrect'
                                }
                              />
                            ) : null}
                          </span>
                        );
                      }}
                    />
                  );

                  return isHeaderCell ? (
                    <th key={cell.id} {...cellProps}>
                      {body}
                    </th>
                  ) : (
                    <td key={cell.id} {...cellProps}>
                      {body}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
