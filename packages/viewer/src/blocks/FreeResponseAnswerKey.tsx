// =============================================================================
// blocks/FreeResponseAnswerKey.tsx — the written-answer key panel (T3)
// -----------------------------------------------------------------------------
// The teacher-only key for short_answer and essay. Shared by both components
// because ruling E4 gave the two blocks their answer fields in one round, and a
// key rendered two slightly different ways is a key a teacher has to read twice.
//
// IT RENDERS NOTHING WITHOUT THE ANSWER-KEY PROVIDER, and that is the safety
// property rather than a convenience: useBlockAnswerKey returns undefined when
// no provider is mounted, and the student route never imports the provider at
// all (answer-key/context.tsx). So "can a student see this?" is a question
// about the import graph, which a test can answer, not about a flag that has to
// travel correctly.
//
// THREE STATES, because the third one is the whole reason this exists:
//   answer   — the teacher's canonical answer.
//   solution — the post-check explanation, LABELLED AS SUCH. Printing an
//              explanation under the word "Answer" would misrepresent it to
//              whoever is marking with it.
//   neither  — "Manually graded — see rubric". A positive statement, printed
//              rather than omitted: a question missing from a key looks exactly
//              like a question the key forgot, and the teacher finds out
//              mid-marking.
//
// Grayscale-safe by construction, like every other key affordance: the label,
// the weight and the left rule carry the mark, never colour alone.
//
// IT DELIBERATELY DOES NOT USE ANSWER_KEY_INK, and the reason is worth stating
// because reaching for it is the obvious move. That constant is an SVG STROKE
// colour — it exists for the graph and number-line overlays, which draw into a
// figure and have no inherited text colour to take. This key is text in the
// viewer's own chrome, so it inherits --vw-color-ink like every other key
// affordance does (matching/ordering/MC marks never name a colour either), and
// that is strictly better on both surfaces: on screen it follows the theme,
// while ANSWER_KEY_INK painted on a dark background rendered the key almost
// unreadable (found by looking at the dev harness, not by a test); on paper the
// token block already forces every ink to pure black, which a near-black
// literal would have quietly contradicted.
// =============================================================================

import { InlineContent } from '../inline/InlineContent.js';
import { useBlockAnswerKey } from '../answer-key/context.js';

export function FreeResponseAnswerKey({ blockId }: { blockId: string }) {
  const answerKey = useBlockAnswerKey(blockId);
  if (!answerKey) return null;

  const { writtenAnswer, writtenAnswerSource, manuallyGraded } = answerKey;

  if (manuallyGraded) {
    return (
      <div
        className="viewer-written-key"
        data-answer-key="manually-graded"
      >
        <span className="viewer-written-key__label">Manually graded</span>
        <p className="viewer-written-key__body">
          No answer was authored for this question — mark it against the rubric.
        </p>
      </div>
    );
  }

  if (!writtenAnswer || writtenAnswer.length === 0) return null;

  return (
    <div
      className="viewer-written-key"
      data-answer-key={writtenAnswerSource ?? 'answer'}
    >
      <span className="viewer-written-key__label">
        {writtenAnswerSource === 'solution' ? 'Solution' : 'Answer'}
      </span>
      <p className="viewer-written-key__body">
        <InlineContent nodes={writtenAnswer} />
      </p>
    </div>
  );
}
