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
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { StatePill } from './StatePill.js';

export default function MultipleChoice({
  block,
  mode = 'screen',
}: BlockComponentProps<MultipleChoiceBlock>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const groupName = useId();

  const selected = state.responses.choices[block.id] ?? [];
  const phase = phaseOf(block.id);
  const result = resultFor(block.id);
  const solution = solutionFor(block.id);
  const disabled = mode === 'print';

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
    >
      <fieldset className="viewer-mc__fieldset">
        <legend className="viewer-mc__prompt">
          <InlineContent nodes={block.prompt} />
        </legend>

        <ul className="viewer-mc__choices">
          {block.choices.map((choice) => {
            const isSelected = selected.includes(choice.id);
            return (
              <li key={choice.id} className="viewer-mc__choice">
                <label className="viewer-mc__label">
                  <input
                    type={block.multiSelect ? 'checkbox' : 'radio'}
                    name={groupName}
                    value={choice.id}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => toggle(choice.id)}
                  />
                  <span className="viewer-mc__choice-content">
                    <InlineContent nodes={choice.content} />
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
