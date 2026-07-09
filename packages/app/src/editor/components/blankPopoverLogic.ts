// =============================================================================
// blankPopoverLogic.ts — pure decision cores for the blank-edit popover
// -----------------------------------------------------------------------------
// The blank popover's draft/commit/close behavior is a small state machine with
// real bug history (the lost-edit-on-immediate-close bug, the
// preserve-vs-release-selection split). The React components that host it
// (BlankPopoverHost, BlankEditPopover) are coupled to Tiptap / floating-ui /
// FocusTrap / MathLive and can't be unit-tested cheaply — so the *decisions*
// live here as pure functions and the components consume them. Same precedent
// as dragHandleNested.ts: pin the scoring core, not the React shell.
//
// Pure: no DOM, no React, no side effects. Every export is a function of its
// arguments only.
// =============================================================================

import type { InlineNodes } from '../../lib/serialize';

export interface MistakeFeedbackPair {
  match: string;
  feedback: InlineNodes;
}

// The bundle of attrs the popover can commit. answer + acceptableAnswers are
// draft-then-flush; hint + mistakeFeedback commit live, so only the first two
// appear in a flush result.
export type BlankAttrUpdates = Partial<{
  answer: string;
  acceptableAnswers: string[];
}>;

export interface FlushInput {
  /** Current (possibly untrimmed) answer draft. */
  answer: string;
  /** Last-committed answer to diff against. */
  initialAnswer: string;
  /** Current acceptable-answer drafts (may contain blank/whitespace rows). */
  acceptable: string[];
  /** Last-committed acceptable answers to diff against. */
  initialAcceptable: string[];
}

export interface FlushResult {
  updates: BlankAttrUpdates;
  /** True when `updates` carries at least one field worth committing. */
  hasUpdates: boolean;
}

/** Trim each entry and drop the empties — the canonical acceptable-answer shape. */
export function stripList(list: string[]): string[] {
  return list.map((s) => s.trim()).filter((s) => s.length > 0);
}

/** Order-sensitive element-wise string-array equality. */
export function listsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * The flushAll decision: which draft fields differ from their committed values
 * and should be bundled into a single close-time onChange. An empty answer is
 * never committed (the blur handler reverts it instead), so a whitespace-only
 * answer draft contributes nothing. Acceptable answers are stripped before the
 * diff so trailing-empty rows don't register as a change.
 */
export function computeFlush(input: FlushInput): FlushResult {
  const updates: BlankAttrUpdates = {};

  const trimmedAnswer = input.answer.trim();
  if (trimmedAnswer.length > 0 && trimmedAnswer !== input.initialAnswer) {
    updates.answer = trimmedAnswer;
  }

  const stripped = stripList(input.acceptable);
  if (!listsEqual(stripped, input.initialAcceptable)) {
    updates.acceptableAnswers = stripped;
  }

  return { updates, hasUpdates: Object.keys(updates).length > 0 };
}

export type AnswerBlurResult =
  | { action: 'revert' }
  | { action: 'commit'; value: string }
  | { action: 'noop' };

/**
 * The answer-field blur decision. Empty (after trim) ⇒ revert to the last
 * committed value and flag the error; changed ⇒ commit the trimmed value;
 * otherwise a no-op. Keeping this pure means the empty-answer guard (a deliberate
 * rule — a blank with no answer can't be scored) is pinned independently of the
 * input wiring.
 */
export function resolveAnswerBlur(
  answer: string,
  initialAnswer: string,
): AnswerBlurResult {
  const trimmed = answer.trim();
  if (trimmed.length === 0) return { action: 'revert' };
  if (trimmed !== initialAnswer) return { action: 'commit', value: trimmed };
  return { action: 'noop' };
}

export interface AcceptableCommit {
  /** True when the stripped list differs from the committed one. */
  changed: boolean;
  /** The canonical (trimmed, non-empty) list to commit. */
  stripped: string[];
}

/** The commit decision for the acceptable-answers list (strip + diff). */
export function resolveAcceptableCommit(
  acceptable: string[],
  initialAcceptable: string[],
): AcceptableCommit {
  const stripped = stripList(acceptable);
  return { changed: !listsEqual(stripped, initialAcceptable), stripped };
}

/**
 * The mistake-feedback commit filter. A row is carried only when it has BOTH a
 * non-empty match string and non-empty feedback content; half-finished rows
 * stay in the draft UI but are dropped from the committed attr. Returns
 * undefined when nothing survives, so the schema never carries an empty array.
 */
export function filterFeedbackForCommit(
  rows: MistakeFeedbackPair[],
): MistakeFeedbackPair[] | undefined {
  const stripped = rows
    .map((p) => ({ match: p.match.trim(), feedback: p.feedback }))
    .filter((p) => p.match.length > 0 && p.feedback.length > 0);
  return stripped.length > 0 ? stripped : undefined;
}

export interface ToleranceCommit {
  /** True when the parsed draft differs from the committed tolerance. */
  changed: boolean;
  /** The value to commit: a number ≥ 0, or undefined for "exact". */
  value: number | undefined;
}

/**
 * The tolerance-field commit decision. Empty draft ⇒ undefined (exact
 * equality); a valid number ≥ 0 ⇒ that value; anything unparseable or
 * negative ⇒ unchanged (the UI reverts the draft on blur, mirroring the
 * empty-answer revert rule).
 */
export function resolveToleranceCommit(
  draft: string,
  initialTolerance: number | undefined,
): ToleranceCommit {
  const trimmed = draft.trim();
  if (trimmed.length === 0) {
    return { changed: initialTolerance !== undefined, value: undefined };
  }
  const n = Number(trimmed);
  if (!isFinite(n) || n < 0) {
    return { changed: false, value: initialTolerance };
  }
  return { changed: n !== initialTolerance, value: n };
}

export interface SelectedBlankState {
  pos: number;
  blankId: string;
  answer: string;
  acceptableAnswers: string[];
  hint: InlineNodes | undefined;
  mistakeFeedback: MistakeFeedbackPair[] | undefined;
  /** The blank's order-independent grouping flag (a node attr). */
  interchangeableWithPrevious: boolean;
  /** Answer interpretation mode (a node attr; 'text' is the default). */
  answerType: 'text' | 'numeric';
  /** Numeric comparison tolerance (a node attr; undefined = exact). */
  tolerance: number | undefined;
  /**
   * Structural, NOT an attr: whether a previous blank exists in the same
   * fill_in_blank block, so the popover can offer the grouping checkbox. The
   * first blank in a block has nothing to group with. Recomputed per selection.
   */
  canGroupWithPrevious: boolean;
}

/**
 * The host's setSelectedBlank dedup: true when `next` describes the same
 * selection as `prev`, so the host can keep the previous object reference and
 * avoid a re-render (and a needless popover remount). hint/mistakeFeedback are
 * compared by reference — they're attr objects from the same ProseMirror node,
 * stable across selectionUpdate events that don't change them.
 */
export function isSameBlankSelection(
  prev: SelectedBlankState | null,
  next: SelectedBlankState,
): boolean {
  return (
    !!prev &&
    prev.pos === next.pos &&
    prev.blankId === next.blankId &&
    prev.answer === next.answer &&
    listsEqual(prev.acceptableAnswers, next.acceptableAnswers) &&
    prev.hint === next.hint &&
    prev.mistakeFeedback === next.mistakeFeedback &&
    prev.interchangeableWithPrevious === next.interchangeableWithPrevious &&
    prev.answerType === next.answerType &&
    prev.tolerance === next.tolerance &&
    prev.canGroupWithPrevious === next.canGroupWithPrevious
  );
}
