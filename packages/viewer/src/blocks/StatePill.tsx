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
// Announcements: the pill is NOT a live region (D-3, ui-review-group-d.md,
// 2026-11-13 — reverses ruling 6.1A). One check of a 10-blank section used to
// speak 10+ times; the group's status line ("Checked: 7 of 10 right", C-3) is
// now the one announcement. The pill still says its state in words, so a
// screen-reader user hears it on reaching the question; the glyph is
// decorative (aria-hidden) because the label already says the state.
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
