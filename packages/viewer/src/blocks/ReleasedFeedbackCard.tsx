// =============================================================================
// blocks/ReleasedFeedbackCard.tsx — teacher feedback on the recorded family
// -----------------------------------------------------------------------------
// THE RULE THIS COMPONENT EXISTS TO KEEP (design review D6, 2026-08-15). The
// recorded family's contract is "never a verdict glyph, never a score, never
// anything a student could read as auto-grading" — and this card renders a
// score. That is not a violation, and the distinction is ATTRIBUTION: the rule
// guards the SOURCE of judgment, not its existence. A machine must never appear
// to judge an essay; a teacher judging one is the promise the pill already
// makes ("your teacher will review"). Showing the teacher's judgment keeps that
// promise. What would break the rule is making teacher judgment LOOK like
// machine judgment, so four things are load-bearing here:
//
//   1. SEPARATE CARD, outside the state-chrome row. This lives in the
//      authored-content register (ink/canvas/line), never adjacent to or
//      aligned with StatePill.
//   2. ATTRIBUTION FIRST, before any number. The eye hits the human before the
//      score, every time.
//   3. SCORES AS TEXT DATA, never as status. No --state-* tokens on numbers, no
//      total, no percentage.
//   4. NO GLYPHS AT ALL. ✓ and ✗ are the auto-graded family's property; they
//      must not appear here even meaning "criterion met".
//
// If a future change needs a fifth rule, it belongs in this comment before it
// belongs in the JSX.
// =============================================================================

import type { ReleasedBlockFeedback } from '../check/wire.js';

export interface ReleasedFeedbackCardProps {
  feedback: ReleasedBlockFeedback;
  /** True when the card's grade belongs to a version other than the one being
   * viewed — a republish minted new block ids, so the feedback cannot be
   * placed against this document's questions (G6: tag, don't map). */
  fromAnotherVersion: boolean;
}

/** Copy lives here rather than inline so the a11y lane and the RTL rows assert
 *  the same strings the student reads. */
export const FEEDBACK_COPY = {
  fromTeacher: 'Feedback from your teacher',
  fromFormerTeacher: 'Feedback from a former teacher',
  revised: 'You’ve revised your answer since this feedback.',
  otherVersion:
    'On an earlier version of this worksheet — your newest answers aren’t graded yet.',
} as const;

export function ReleasedFeedbackCard({
  feedback,
  fromAnotherVersion,
}: ReleasedFeedbackCardProps) {
  // "a former teacher" is not a euphemism: 0034 nulls graded_by when the
  // grading account is deleted, so the grade genuinely outlives its author and
  // the card should say so rather than imply the current teacher wrote it.
  const attribution = feedback.hasGrader
    ? FEEDBACK_COPY.fromTeacher
    : FEEDBACK_COPY.fromFormerTeacher;

  return (
    <div className="viewer-released-feedback" data-released-feedback="true">
      <p className="viewer-released-feedback__from">{attribution}</p>

      {feedback.feedbackText ? (
        <p className="viewer-released-feedback__text">{feedback.feedbackText}</p>
      ) : null}

      {feedback.criteria.length > 0 ? (
        <ul className="viewer-released-feedback__criteria">
          {feedback.criteria.map((criterion) => (
            <li key={criterion.criterionId} className="viewer-released-feedback__criterion">
              <span className="viewer-released-feedback__score">
                {criterion.earned}/{criterion.maxPoints}
              </span>
              {criterion.feedbackText ? (
                <span className="viewer-released-feedback__criterion-text">
                  {criterion.feedbackText}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Both notes are muted metadata, never alarms: the student did nothing
          wrong by revising, and an earlier-version grade is not an error. */}
      {feedback.stale && !fromAnotherVersion ? (
        <p className="viewer-released-feedback__note">{FEEDBACK_COPY.revised}</p>
      ) : null}
      {fromAnotherVersion ? (
        <p className="viewer-released-feedback__note">{FEEDBACK_COPY.otherVersion}</p>
      ) : null}
    </div>
  );
}
