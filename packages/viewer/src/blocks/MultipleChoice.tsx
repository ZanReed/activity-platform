// =============================================================================
// blocks/MultipleChoice.tsx — the AUTO_GRADABLE exemplar (S3 V5)
// -----------------------------------------------------------------------------
// The template every graded question copies. It exercises the whole
// auto_gradable contract in the simplest possible surface:
//
//   - reads/writes its response through the store by BLOCK ID (id-keyed wire),
//   - shows ✓ / ✗ only from the SERVER's verdict — there is no client-side
//     correctness anywhere in this file, and there cannot be: `correct` is
//     stripped from every choice before it leaves the server (S2 sanitizer),
//     so the component has nothing to cheat with even if it wanted to,
//   - renders feedback ONLY when the server sent it (a hintless wrong answer
//     is mark-only — the designed default, ruling 2.1A),
//   - never touches the student's selection on an incorrect verdict ("the mark
//     never molests the work", family spec rule 2),
//   - discloses the solution inline after the server releases it (ruling 7.4A).
//
// A11y (its registry story): native radio/checkbox inputs inside a
// <fieldset>/<legend>, so arrow keys, grouping, and the accessible name come
// from the platform rather than from re-implemented roving tabindex. multiSelect
// picks checkboxes; single-select picks radios, and the schema's default is
// single. Verdict transitions announce through StatePill's aria-live.
// =============================================================================

import { useId } from 'react';
import type { MultipleChoiceBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { ChoiceFigure } from './ChoiceFigure.js';
import { allHaveFigures, figureIsSoleContent } from './figureSlot.js';
import { choiceLetter } from './paperAffordances.js';
import { useBlockAnswerKey } from '../answer-key/context.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

export default function MultipleChoice({
  block,
  mode = 'screen',
}: BlockComponentProps<MultipleChoiceBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const groupName = useId();
  // The key names correct choices by ID; the LETTER a teacher reads comes from
  // the position this render is drawing them in, so a shuffled print version
  // marks the right letter without the key knowing anything about the shuffle.
  const answerKey = useBlockAnswerKey(block.id);
  const keyedCorrect = new Set(answerKey?.correctChoiceIds ?? []);

  const selected = state.responses.choices[block.id] ?? [];
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);
  const disabled = mode === 'print';
  const figureLayout = allHaveFigures(block.choices);

  const toggle = (choiceId: string) => {
    if (block.multiSelect) {
      const next = selected.includes(choiceId)
        ? selected.filter((id) => id !== choiceId)
        : [...selected, choiceId];
      store.setChoices(block.id, next);
    } else {
      store.setChoices(block.id, [choiceId]);
    }
  };

  return (
    <div
      className="viewer-mc"
      data-block-type="multiple_choice"
      data-block-id={block.id}
      data-phase={phase}
      // Mirrors matching's marker: it makes a figure-bearing INSTANCE
      // addressable, which the print gate needs — the roster renders one
      // instance at a time and a figure rule pointed at the text-only one
      // reports "no element matched" rather than anything true.
      {...(figureLayout ? { 'data-has-figures': 'true' } : {})}
    >
      <fieldset className="viewer-mc__fieldset">
        <legend className="viewer-mc__prompt">
          <InlineContent nodes={block.prompt} />
        </legend>

        {/* A6: the grid applies only when EVERY choice carries a figure.
            Measured on a real page box — four 1.75in graphs stacked take 76% of
            the printable column against 38% gridded, and the block is
            break-inside:avoid, so stacked meant one question per sheet. A mixed
            question stays stacked: a grid cell of bare text beside cells of
            graphs reads as ragged, and a vertical list is how options scan. */}
        <ul
          className="viewer-mc__choices"
          {...(figureLayout ? { 'data-figure-layout': 'grid' } : {})}
        >
          {block.choices.map((choice, index) => {
            const isSelected = selected.includes(choice.id);
            const isKeyed = keyedCorrect.has(choice.id);
            const soleContent = figureIsSoleContent(choice);
            return (
              <li
                key={choice.id}
                className="viewer-mc__choice"
                // The answer mark rides the LETTER (below) rather than the
                // native control, because the control is hidden on paper —
                // marking it would produce a key that prints blank.
                {...(isKeyed ? { 'data-answer-key': 'correct' } : {})}
              >
                <label className="viewer-mc__label">
                  <input
                    type={block.multiSelect ? 'checkbox' : 'radio'}
                    name={groupName}
                    value={choice.id}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => toggle(choice.id)}
                  />
                  {/* The paper marker. On screen the native control carries the
                      choice, but on paper there is no control — the letter is
                      what a student circles, so it is what has to be there.
                      Rendered always and revealed by @media print: the browser's
                      own print command gives no hook to prepare in, so anything
                      not already in the DOM is missing from the page.
                      aria-hidden because the visible label already names the
                      choice; a screen reader announcing "A" before every option
                      is noise, not information. */}
                  <span
                    className={
                      isKeyed
                        ? 'viewer-mc__letter viewer-mc__letter--key'
                        : 'viewer-mc__letter'
                    }
                    aria-hidden="true"
                  >
                    {choiceLetter(index)}
                  </span>
                  {/* A7: the figure sits BELOW the choice text, and the letter
                      stays to the left in both layouts — on paper the letter IS
                      the answer, so it must not move between arrangements.
                      A1: it lives INSIDE the label, so clicking the graph
                      selects the choice, which is what a student does
                      unprompted on a "which graph shows…" question. */}
                  <span className="viewer-mc__choice-content">
                    <InlineContent nodes={choice.content} />
                    <ChoiceFigure
                      owner={choice}
                      blockId={block.id}
                      letterLabel={choiceLetter(index)}
                      isSoleContent={soleContent}
                    />
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* Server verdict only. No client-side scoring exists in this file. */}
      {phase === 'checking' ? <StatePill state="pending" label="Checking…" /> : null}
      {result ? (
        <StatePill state={result.verdict === 'correct' ? 'correct' : 'incorrect'} />
      ) : null}

      {result?.feedback ? (
        <p className="viewer-mc__feedback" data-feedback="server">
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
