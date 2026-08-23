// =============================================================================
// container/checkGroups.ts — sections → CHECK GROUPS (activity flow modes, F1)
// -----------------------------------------------------------------------------
// A pure fold over the DocumentIndex (ruling 5A: no sixth walk of the
// document — blockIndex already produced the ordered sections, and the
// `{checkpoint}` marker rides along on each one).
//
// The rule (R1): a checkpoint section's Check covers EVERY SECTION SINCE THE
// PREVIOUS CHECKPOINT, inclusive. **The end of the activity is always a
// checkpoint**, so the trailing run is never orphaned and a document with no
// `{checkpoint}` at all degrades to exactly one Check at the end.
//
// WHY the implicit end checkpoint is not optional. The renderer this replaces
// let non-checkpoint sections wait for a final Submit. There is no Submit in
// the viewer (grading moved to the server; a check is the only act and the
// only record), so without this rule a trailing non-checkpoint section's
// questions would NEVER be checked — free text never recorded, blanks never
// graded, silently. That is the defect class this repo keeps paying for, and
// guard 5 in the design doc binds it to RENDERED OUTPUT rather than to this
// fold: a property test over a fold that assigns by construction proves
// nothing (OV#16).
//
// `single` ignores every marker: it means "no mid-activity checkpoints", which
// under R1 is exactly one group covering the whole document. It is redundant
// with `free` + no markers and is kept for authoring convenience (OV#12).
// =============================================================================

import type { CheckErrorKind } from '../client/httpCheckService.js';
import type { SectionStatus } from '../store/persistence.js';
import type { DocumentIndex, SectionIndex } from './blockIndex.js';

/** The authored flow mode. Mirrors ActivityMeta.submissionMode; `revisionMode`
 * and `gradingMode` were deleted in this slice (R4). */
export type SubmissionMode = 'single' | 'locked' | 'free';

export interface CheckGroup {
  /**
   * The group's identity, and the section its Check button renders under: the
   * LAST section in the run (the checkpoint). Stable across renders because it
   * is a document id, not an index — a group keyed by position would re-key
   * every section after an edit.
   */
  id: string;
  /** Sections covered by this group's Check, document order, at least one. */
  sections: SectionIndex[];
  /** True when this group's boundary is the end of the document rather than an
   * authored `{checkpoint}`. Nothing renders differently today; it exists so
   * the coverage guard can mutate the implicit-end rule and watch it fail. */
  implicitEnd: boolean;
}

/**
 * Fold the indexed sections into check groups.
 *
 * Pure and cheap (one pass, no document access); safe to recompute per render,
 * though the container memoizes it on the document like every other walk.
 * An empty document yields no groups — there is nothing to check.
 */
export function checkGroups(
  index: DocumentIndex,
  submissionMode: SubmissionMode,
): CheckGroup[] {
  const groups: CheckGroup[] = [];
  let run: SectionIndex[] = [];

  index.sections.forEach((section, i) => {
    run.push(section);
    const isLast = i === index.sections.length - 1;
    // 'single' ignores every authored marker; the end of the document closes
    // the run in every mode, which is what makes "no section is ever
    // un-checkable" true by construction here and provable in the DOM.
    const closes =
      isLast || (submissionMode !== 'single' && section.isCheckpoint);
    if (!closes) return;
    groups.push({
      id: section.sectionId,
      sections: run,
      implicitEnd: isLast && !(submissionMode !== 'single' && section.isCheckpoint),
    });
    run = [];
  });

  return groups;
}

/**
 * Section id → every section ITS group covers.
 *
 * The shape the solution gate wants (OV#14): a block asks "has my whole group
 * landed?", which is a question about sibling section ids, not about the group
 * object. Every section in the document appears exactly once (R1's guarantee);
 * a section with no entry would be one no Check button covers.
 */
export function sectionsInGroup(groups: CheckGroup[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const group of groups) {
    const ids = group.sections.map((s) => s.sectionId);
    for (const id of ids) map[id] = ids;
  }
  return map;
}

// -----------------------------------------------------------------------------
// Group status — DERIVED from the member sections, never stored (F2)
// -----------------------------------------------------------------------------
// The store already holds one authority per section; a stored group phase
// would be a second authority over the same fact, which is how a section ends
// up showing "pending" in one place and "checked" in another (store.ts's own
// lesson, S6-8). Everything below is a pure function of the member statuses.
// -----------------------------------------------------------------------------

/**
 * What the group's Check button and status line report.
 *
 * 'partial' is the one phase a SECTION never has: some members landed and some
 * did not, with nothing in flight (3A's fan-out made visible). It carries its
 * own copy and its own Retry, which re-fires only the unlanded members.
 */
export type GroupPhase =
  | 'unchecked'
  | 'checking'
  | 'pending'
  | 'checked'
  | 'partial'
  | 'error';

export interface GroupStatus {
  phase: GroupPhase;
  /** Member section ids whose check landed. */
  landed: string[];
  /** Member section ids still needing a fire — exactly the Retry set (3A). */
  unlanded: string[];
  /** The failure this group reports, when it reports one. */
  kind?: CheckErrorKind;
  /** Any member raised the 2.2A "your answers moved while queued" notice. */
  answersChangedWhileQueued?: boolean;
}

/**
 * Fold member section statuses into the group's.
 *
 * ORDER IS THE DESIGN. 'checking' outranks everything (a fire is in flight, so
 * no other reading is stable yet); 'pending' outranks 'partial' because the
 * queue keeps its own promise and a Retry button beside "we'll check when
 * you're back online" is two contradictory instructions; and 'error' is
 * reserved for the case where NOTHING landed, so a group that got half its
 * verdicts never reads as a total failure.
 *
 * `kind` prefers 'locked' over any other failure: it is the one that must
 * never be dressed as retryable, and in a partly-locked group it is the fact
 * the student needs.
 */
export function groupStatus(
  sectionIds: readonly string[],
  sections: Readonly<Record<string, SectionStatus | undefined>>,
): GroupStatus {
  const statuses = sectionIds.map((id) => sections[id]);
  const landed = sectionIds.filter((id) => sections[id]?.phase === 'checked');
  const unlanded = sectionIds.filter((id) => sections[id]?.phase !== 'checked');
  const errors = statuses.flatMap((s) =>
    s?.phase === 'error' ? [s.kind ?? 'unknown'] : [],
  );
  const kind: CheckErrorKind | undefined = errors.includes('locked')
    ? 'locked'
    : errors[0];
  const answersChangedWhileQueued = statuses.some(
    (s) => s?.phase === 'checked' && s.answersChangedWhileQueued === true,
  );
  const base = {
    landed,
    unlanded,
    ...(kind ? { kind } : {}),
    ...(answersChangedWhileQueued ? { answersChangedWhileQueued: true } : {}),
  };

  const phase: GroupPhase = (() => {
    if (sectionIds.length === 0) return 'unchecked';
    if (statuses.every((s) => s === undefined || s.phase === 'unchecked')) {
      return 'unchecked';
    }
    if (statuses.some((s) => s?.phase === 'checking')) return 'checking';
    if (unlanded.length === 0) return 'checked';
    if (statuses.some((s) => s?.phase === 'pending')) return 'pending';
    if (landed.length > 0) return 'partial';
    return 'error';
  })();

  return { phase, ...base };
}

/**
 * Is this section's input frozen? (`locked` mode only — the caller gates.)
 *
 * DERIVED FROM THE SAME FACT THE SERVER DERIVES ITS REFUSAL FROM (T1): the
 * server locks a section once a check row exists for this (student, version,
 * section); the client freezes once a check has been pressed, queued or landed
 * for it. That symmetry is why no flag is sent, no column is stored, and a
 * reload re-derives the freeze from the hydrated `checked` results rather than
 * from a persisted boolean that could disagree with the server.
 *
 * FREEZE AT PRESS, NOT AT FIRE (OV#19): 'checking' and 'pending' both count.
 * Under the earlier "freeze when the check fires" wording an offline press
 * left the student editing for minutes and then froze mid-keystroke when the
 * queue drained, grading whatever happened to be current. Freezing at press
 * means the queued check grades exactly the values the student committed — and
 * it is why the 2.2A "answers changed while queued" notice can never apply to
 * a locked group.
 *
 * A NON-LOCK FAILURE THAWS. A 429 or a 500 wrote no row, so the server does
 * not consider the section locked either; leaving it frozen would strand the
 * student with work they cannot resubmit. The 'locked' refusal is the opposite
 * and stays frozen — it is the second device learning the lock exists.
 */
export function isSectionFrozen(status: SectionStatus | undefined): boolean {
  if (!status) return false;
  switch (status.phase) {
    case 'checking':
    case 'pending':
    case 'checked':
      return true;
    case 'error':
      return status.kind === 'locked';
    default:
      return false;
  }
}
