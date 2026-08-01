// =============================================================================
// grading/choices.ts — multiple_choice, matching, ordering (parity port)
// -----------------------------------------------------------------------------
// Ports runtime/mcs.ts, runtime/matches.ts, runtime/orderings.ts to schema
// fields. All three share one discipline that is easy to lose in a rewrite:
// AN UNANSWERED QUESTION IS UNSCORED (null), NOT WRONG. Each type has its own
// definition of "unanswered", and each is a rule rather than an accident:
//
//   multiple_choice — nothing selected
//   matching        — no pairs placed at all (NOT "no pairs correct")
//   ordering        — the arrangement was never touched
//
// The ordering case is the interesting one; see `scoreOrdering`.
// =============================================================================

/** null = unscored (unanswered). Same tri-state as blanks. */
export type ItemVerdict = boolean | null;

// ---- multiple_choice --------------------------------------------------------

/**
 * Set equality against the ids of choices flagged `correct`.
 *
 * SINGLE- AND MULTI-SELECT USE THE SAME RULE. The block's `multiSelect` field
 * chooses radio vs checkbox in the UI and is deliberately not consulted here —
 * the runtime doesn't branch on it either. All-or-nothing, order-free, no
 * partial credit for getting 2 of 3 right in a multi-select.
 *
 * A block with zero correct choices is not a schema error (mid-edit drafts
 * exist), so it must not crash: it simply means nothing scores correct, and an
 * empty selection is still an omission rather than a lucky match.
 */
export function scoreMultipleChoice(
  selected: string[],
  correctIds: string[],
): ItemVerdict {
  // Short-circuits BEFORE the equality test on purpose: with zero correct
  // choices authored, an empty selection would otherwise compare equal and
  // score a student "correct" for doing nothing.
  if (selected.length === 0) return null;
  if (selected.length !== correctIds.length) return false;
  for (const id of correctIds) {
    if (selected.indexOf(id) === -1) return false;
  }
  return true;
}

/** Per-choice feedback for the ids the student ACTUALLY SELECTED.
 *
 * Never for unselected choices, even when the author wrote feedback on them:
 * revealing the correct choice's feedback to a student who picked something
 * else hands them the answer. (The runtime gates on `sectionChecked &&
 * isSelected` for exactly this reason.) Selected-and-correct still returns its
 * feedback — praise and confirmation are legitimate authored content. */
export function selectChoiceFeedback(
  selected: string[],
  choices: Array<{ id: string; feedback?: unknown[] }>,
): Map<string, unknown[]> {
  const out = new Map<string, unknown[]>();
  for (const choice of choices) {
    if (!choice.feedback) continue;
    if (selected.indexOf(choice.id) === -1) continue;
    out.set(choice.id, choice.feedback);
  }
  return out;
}

// ---- matching ---------------------------------------------------------------

export interface MatchScore {
  verdict: ItemVerdict;
  /** Correct pairs. Carries the partial credit the verdict throws away. */
  earned: number;
  /** Always the full item count — the denominator does not shrink because the
   * student left pairs empty. */
  total: number;
}

/**
 * Per-pair scoring with an all-or-nothing block verdict.
 *
 * Iterates the AUTHORED ITEM LIST, not the student's submitted pairs: a pair
 * naming an item that isn't in the block is ignored rather than counted, and an
 * item the student never paired simply earns nothing. Iterating the submission
 * instead would let a malformed payload inflate `total`.
 *
 * `key` may legitimately be PARTIAL (a mid-edit draft can omit items). An item
 * missing from the key can never be correct — that is a content problem to
 * surface, not a crash and not a free point.
 */
export function scoreMatching(
  pairs: Record<string, string>,
  key: Record<string, string>,
  itemIds: string[],
): MatchScore {
  let earned = 0;
  for (const itemId of itemIds) {
    const placed = pairs[itemId];
    if (placed !== undefined && placed === key[itemId]) earned += 1;
  }
  const total = itemIds.length;
  // The omission gate is "placed NO pairs", not "earned zero" — a student who
  // paired everything wrong has answered, and answered incorrectly.
  const verdict: ItemVerdict =
    Object.keys(pairs).length === 0 ? null : earned === total;
  return { verdict, earned, total };
}

// ---- ordering ---------------------------------------------------------------

/**
 * Exact full-sequence equality against the AUTHORED order.
 *
 * The authored `items` order IS the answer key — ordering blocks have no
 * separate key field. The server grades against the RAW document, so the
 * authored order is available directly; grading against the served document
 * would compare the student's arrangement to their own shuffle and fail
 * everyone.
 *
 * THE OMISSION RULE, AND WHY IT NEEDS `servedOrder`:
 * A shuffled list is always *some* sequence, so the arrangement alone cannot
 * distinguish "the student decided this order is right" from "the student never
 * touched it". The runtime tracks a `moved` flag for this and scores an
 * untouched list null even when the shuffle happens to be correct. The check
 * wire carries no such flag — but it doesn't need one: the serve shuffle is
 * deterministic (seeded `version:user:block:field`), so the server recomputes
 * the exact permutation this student was served and treats "identical to what
 * we served" as untouched.
 *
 * That reconstruction is imperfect in one direction, knowingly: a student who
 * drags an item away and back sets `moved` on the client but looks untouched
 * here. The failure is benign (their answer is scored as an omission rather
 * than as the shuffle-order answer, which was almost certainly wrong anyway)
 * and it is the only reading available without a wire change.
 */
export function scoreOrdering(
  submitted: string[],
  authoredOrder: string[],
  servedOrder: string[],
): ItemVerdict {
  if (sequenceEquals(submitted, servedOrder) && !sequenceEquals(servedOrder, authoredOrder)) {
    // Untouched: unscored. Guarded on the served order differing from the
    // authored one so that a block whose shuffle happened to land on the
    // authored order (or one served unshuffled) can still be answered
    // correctly rather than being permanently unscoreable.
    return null;
  }
  return sequenceEquals(submitted, authoredOrder);
}

function sequenceEquals(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
