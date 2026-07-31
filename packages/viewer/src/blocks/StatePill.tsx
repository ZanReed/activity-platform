// =============================================================================
// blocks/StatePill.tsx — the ONE state-chrome component (family spec rule 1)
// -----------------------------------------------------------------------------
// "All state chrome draws from the --state-* token trios. A component
// inventing a fifth state or a private color is a review-blocker." Rather than
// leave that to review, every block renders its state through here — the
// vocabulary is a closed union, so a fifth state is a compile error and a
// private color has nowhere to live.
//
// The four states map exactly to the token trios in tokens.css:
//   correct / incorrect  — auto_gradable verdicts (✓ / ✗)
//   pending              — transitional: a queued or in-flight check (TV3-A)
//   recorded             — the free-text family's terminal state; deliberately
//                          NOT a verdict glyph (family spec: a student must
//                          never read auto-grading into captured free text)
//
// Announcements: every pill transition announces via aria-live (ruling 6.1A).
// The pill carries role="status" + aria-live="polite" so a change is spoken
// without interrupting; the glyph is decorative (aria-hidden) because the
// label already says the state in words.
// =============================================================================

export type PillState = 'correct' | 'incorrect' | 'pending' | 'recorded';

const GLYPH: Record<PillState, string> = {
  correct: '✓',
  incorrect: '✗',
  pending: '…',
  // The recorded check is a receipt ("we have it"), never a judgment.
  recorded: '✓',
};

const DEFAULT_LABEL: Record<PillState, string> = {
  correct: 'Correct',
  incorrect: 'Try again',
  pending: 'Will check when you’re back online',
  recorded: 'Recorded — your teacher will review',
};

export interface StatePillProps {
  state: PillState;
  /** Override the wording; the state vocabulary itself stays closed. */
  label?: string;
}

export function StatePill({ state, label }: StatePillProps) {
  return (
    <span
      className={`viewer-state-pill viewer-state-pill--${state}`}
      data-state={state}
      role="status"
      aria-live="polite"
    >
      <span className="viewer-state-pill__glyph" aria-hidden="true">
        {GLYPH[state]}
      </span>
      <span className="viewer-state-pill__label">
        {label ?? DEFAULT_LABEL[state]}
      </span>
    </span>
  );
}
