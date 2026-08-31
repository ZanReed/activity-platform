// =============================================================================
// blocks/Correspondence.tsx — the N-way match (wishlist #4)
// -----------------------------------------------------------------------------
// Matching's shipped affordance, generalized per column: each anchor item gets
// one <select> PER TARGET COLUMN (design R1 — the review established that the
// shipped matching interaction is a native select, not the drag the schema
// comment imagines, and the select is what generalizes). The response is
// { item id → { column id → target id } }, so distractors and reordering are
// harmless per column exactly as they are in matching.
//
// Each column shuffles independently, seeded blockId + columnId (R2 — the
// same client-side seededShuffle matching uses; stable across reloads, same
// for every student, no server involvement). Card markers are derived from
// the shuffle order per column in visually distinct sequences (A/i/α), so a
// paper answer line reads "C · ii · β" unambiguously.
// =============================================================================

import { useId } from 'react';
import type { CorrespondenceBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { ChoiceFigure } from './ChoiceFigure.js';
import { allHaveFigures, figureIsSoleContent } from './figureSlot.js';
import { columnLetter } from './paperAffordances.js';
import { seededShuffle } from '../sanitize/shuffle.js';
import { useBlockAnswerKey } from '../answer-key/context.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

export default function Correspondence({
  block,
  mode = 'screen',
}: BlockComponentProps<CorrespondenceBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const groupId = useId();
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);
  const placed = (state.responses.correspondences ?? {})[block.id] ?? {};
  const answerKey = useBlockAnswerKey(block.id);

  // Per-column shuffle, seeded by block + column so the banks are stable and
  // independent (the authored n-th card of every column belongs to the n-th
  // item — identical seeds would preserve that alignment and leak the key).
  const columns = block.targetColumns.map((column, columnIndex) => ({
    column,
    columnIndex,
    targets: seededShuffle(column.targets, `${block.id}:${column.id}`),
  }));

  return (
    <div
      className="viewer-correspondence"
      data-block-type="correspondence"
      data-block-id={block.id}
      data-phase={phase}
      {...(columns.some(({ targets }) => allHaveFigures(targets))
        ? { 'data-has-figures': 'true' }
        : {})}
    >
      <p className="viewer-correspondence__prompt">
        <InlineContent nodes={block.prompt} />
      </p>

      {/* One marked bank per column, so prose and print can refer to "ii". */}
      {columns.map(({ column, columnIndex, targets }) => (
        <div
          key={column.id}
          className="viewer-correspondence__bank"
          data-column-id={column.id}
          {...(allHaveFigures(targets) ? { 'data-figure-layout': 'grid' } : {})}
        >
          <p className="viewer-correspondence__bank-header">
            <InlineContent nodes={column.header} />
          </p>
          <ul className="viewer-correspondence__bank-list">
            {targets.map((target, i) => (
              <li
                key={target.id}
                className="viewer-correspondence__target"
                data-letter={columnLetter(columnIndex, i)}
                data-target-id={target.id}
              >
                <span className="viewer-correspondence__letter">
                  {columnLetter(columnIndex, i)}.
                </span>{' '}
                <span className="viewer-correspondence__target-content">
                  <InlineContent nodes={target.content} />
                  <ChoiceFigure
                    owner={target}
                    blockId={block.id}
                    letterLabel={columnLetter(columnIndex, i)}
                    isSoleContent={figureIsSoleContent(target)}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <ul className="viewer-correspondence__items">
        {block.items.map((item) => {
          const keyRow = answerKey?.targetIdByItemAndColumn?.[item.id];
          return (
            <li
              key={item.id}
              className="viewer-correspondence__item"
              data-item-id={item.id}
            >
              <span className="viewer-correspondence__item-label">
                <InlineContent nodes={item.content} />
                <ChoiceFigure
                  owner={item}
                  blockId={block.id}
                  isSoleContent={figureIsSoleContent(item)}
                />
              </span>
              <span className="viewer-correspondence__cells">
                {columns.map(({ column, columnIndex, targets }) => {
                  const selectId = `${groupId}-${item.id}-${column.id}`;
                  const keyedTargetId = keyRow?.[column.id];
                  const keyLetter =
                    keyedTargetId !== undefined
                      ? (() => {
                          const at = targets.findIndex(
                            (t) => t.id === keyedTargetId,
                          );
                          return at >= 0
                            ? columnLetter(columnIndex, at)
                            : undefined;
                        })()
                      : undefined;
                  return (
                    <span
                      key={column.id}
                      className="viewer-correspondence__cell"
                      data-column-id={column.id}
                    >
                      {/* Paper answer line, one per column (hidden on screen;
                          the select is hidden in print — both always in the
                          DOM, matching's discipline). */}
                      <span
                        className={
                          keyLetter
                            ? 'viewer-correspondence__letter-line viewer-correspondence__letter-line--key'
                            : 'viewer-correspondence__letter-line'
                        }
                        aria-hidden="true"
                        {...(keyLetter ? { 'data-answer-key': keyLetter } : {})}
                      >
                        {keyLetter ?? ''}
                      </span>
                      <select
                        id={selectId}
                        className="viewer-correspondence__select"
                        value={placed[item.id]?.[column.id] ?? ''}
                        disabled={mode === 'print'}
                        aria-label={`Item ${
                          block.items.findIndex((i) => i.id === item.id) + 1
                        }: choose from column ${columnIndex + 1}`}
                        onChange={(event) =>
                          store.setCorrespondence(
                            block.id,
                            item.id,
                            column.id,
                            event.target.value || null,
                          )
                        }
                      >
                        <option value="">— choose —</option>
                        {targets.map((target, i) => (
                          <option key={target.id} value={target.id}>
                            {columnLetter(columnIndex, i)}
                          </option>
                        ))}
                      </select>
                    </span>
                  );
                })}
              </span>
            </li>
          );
        })}
      </ul>

      {phase === 'checking' ? (
        <StatePill state="pending" label="Checking…" />
      ) : null}
      {result ? (
        <StatePill
          state={result.verdict === 'correct' ? 'correct' : 'incorrect'}
        />
      ) : null}
      {result?.feedback ? (
        <p className="viewer-correspondence__feedback" data-feedback="server">
          <InlineContent nodes={result.feedback} />
        </p>
      ) : null}

      {solution ? (
        <details className="viewer-solution">
          <summary>Show solution</summary>
          <div className="viewer-solution__body">
            <InlineContent nodes={solution} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
