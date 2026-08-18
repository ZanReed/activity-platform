// =============================================================================
// pedagogicalRole.ts — the Activity Bank's trust-layer label (R7)
// -----------------------------------------------------------------------------
// The three values were red-teamed in the 2026-07-24 Activity Bank design (P3)
// and ship as a DB enum in migration 0037. Captured at authoring time so the
// Bank's badge data exists the day Drop 1' starts, instead of a retro pass over
// the whole corpus.
//
// ⚠ NOT the same thing as the DOCUMENT field `meta.activityType`
// (worksheet / exit_ticket / warm_up / review), which is PRESENTATION FORMAT
// and drives rendering. These are orthogonal axes — a Lesson can be a worksheet
// or an exit ticket — and both vocabularies contain the word "review". The
// distinct names ARE the collision fix (taxonomy R2); don't unify them.
//
// Row-native: this lives on the activities row, like `visibility`, not in the
// document. Editing it is immediate listing metadata — no republish.
// =============================================================================

export type PedagogicalRole = 'lesson' | 'review' | 'practice';

export const PEDAGOGICAL_ROLES: readonly PedagogicalRole[] = [
    'lesson',
    'review',
    'practice',
] as const;

export const PEDAGOGICAL_ROLE_LABELS: Record<PedagogicalRole, string> = {
    lesson: 'Lesson',
    review: 'Review',
    practice: 'Practice',
};

// The one-line legend. A bare "Review" badge does not communicate the taxonomy
// (Activity Bank design [A3]) — wherever a role is shown or chosen, this is the
// help text that goes with it.
export const PEDAGOGICAL_ROLE_HELP: Record<PedagogicalRole, string> = {
    lesson: 'Core teaching content; its demonstration-of-learning travels inside it.',
    review: 'Spaced retrieval — primers and attrition prevention, not day-of-teaching content.',
    practice: 'An as-needed resource shelf, not part of the required sequence.',
};

/** Narrow an unknown DB value to a role, or null. Unclassified is legitimate. */
export function asPedagogicalRole(value: unknown): PedagogicalRole | null {
    return typeof value === 'string' &&
        (PEDAGOGICAL_ROLES as readonly string[]).includes(value)
        ? (value as PedagogicalRole)
        : null;
}
