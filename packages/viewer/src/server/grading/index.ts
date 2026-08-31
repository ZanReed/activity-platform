// =============================================================================
// grading/index.ts — gradeSection: the engine's one entry point
// -----------------------------------------------------------------------------
// Raw document + one section's student responses → the wire's SectionCheckResult
// (verdicts + feedback + the post-check solution unlock). Pure: no I/O, no DB,
// no clock. The Edge Function handler wraps it; every test drives it directly.
//
// THE RULE THAT SHAPES THIS WHOLE FILE: an unanswered item produces NO ENTRY.
// Not `false`, not a null verdict — absent. The wire's `items` map is
// id-keyed, so absence is how "the student skipped this" travels, and the
// viewer renders no mark at all for a missing id. Every scorer already returns
// null for its own flavour of unanswered; this file's job is to drop those
// rather than coerce them into a mark.
//
// Solutions are attached for every block in the section that has one, INCLUDING
// static blocks that produced no response (a `problem`'s worked explanation).
// Collected by walking blocks, never by walking responses.
//
// Everything returned that came out of the raw document — feedback and
// solutions alike — goes through the S2 sanitizer's deep walk on the way out
// (ruling S4-4). This is a second server→client channel and the sanitizer is
// not optional on it: an authored solution containing a pasted blank would
// otherwise hand every checking student that blank's answers.
// =============================================================================

import { sanitizeInlineContent } from '../../sanitize/sanitize.js';
import {
  CHECK_WIRE_VERSION,
  type CheckItemResult,
  type SectionCheckResult,
  type SectionResponses,
} from '../../check/wire.js';
import {
  groupBlanks,
  scoreBlank,
  scoreBlankGroup,
  selectBlankFeedback,
  selectBlankMisconception,
  type BlankKey,
} from './blanks.js';
import {
  scoreMatching,
  scoreCorrespondence,
  scoreMultipleChoice,
  scoreOrdering,
  selectChoiceFeedback,
  selectChoiceMisconceptions,
  type ItemVerdict,
} from './choices.js';
import { scoreGraphBlock, selectGraphMistake } from './graphs.js';
import { findSection, inventorySection, type RawSection } from './walk.js';

export { MalformedDocumentError } from './walk.js';

export interface GradeSectionInput {
  /** The RAW (unsanitized, upgraded) document for the version the student was
   * served. Grading against the served document would be wrong twice over: no
   * answer keys, and `ordering`'s authored order replaced by the student's own
   * shuffle. */
  document: { sections?: RawSection[] };
  sectionId: string;
  responses: SectionResponses;
  /**
   * The `ordering` permutations this student was served, blockId → item ids.
   * Needed because the wire carries no `moved` flag: an arrangement identical
   * to what we served is an untouched list, not an answer. Supplying an empty
   * map degrades safely — every ordering submission is then treated as a real
   * answer, which is the pre-existing behavior, not a crash.
   */
  servedOrderings?: Record<string, string[]>;
}

export class SectionNotFoundError extends Error {
  constructor(sectionId: string) {
    super(`Section not found: ${sectionId}`);
    this.name = 'SectionNotFoundError';
  }
}

/**
 * Grade one section. Throws SectionNotFoundError when the section id is not in
 * the document — the handler maps that to a 400. Grading an absent section as
 * "zero items, all fine" would report success for a request that was wrong.
 */
export function gradeSection(input: GradeSectionInput): SectionCheckResult {
  const section = findSection(input.document, input.sectionId);
  if (!section) throw new SectionNotFoundError(input.sectionId);

  const inv = inventorySection(section);
  const items: Record<string, CheckItemResult> = {};

  // ---- blanks + math gaps ---------------------------------------------------
  // Grouped per owning block so an interchangeable run resolves against its own
  // block's blanks and nothing else.
  for (const { keys } of inv.blankGroupsByBlock) {
    for (const group of groupBlanks(keys)) {
      const raws = group.map((key) => input.responses.blanks[key.id] ?? '');
      const verdicts =
        group.length === 1
          ? [scoreBlank(raws[0] ?? '', group[0] as BlankKey)]
          : scoreBlankGroup(group, raws);

      group.forEach((key, i) => {
        const verdict = verdicts[i];
        if (verdict === null || verdict === undefined) return; // unanswered
        const feedback = selectBlankFeedback(raws[i] ?? '', key, verdict);
        const misconceptionId = selectBlankMisconception(
          raws[i] ?? '',
          key,
          verdict,
        );
        items[key.id] = {
          verdict: verdict ? 'correct' : 'incorrect',
          ...(feedback ? { feedback: sanitizeOut(feedback) } : {}),
          ...(misconceptionId ? { misconceptionIds: [misconceptionId] } : {}),
        };
      });
    }
  }

  // ---- multiple choice ------------------------------------------------------
  for (const mc of inv.multipleChoice) {
    const selected = input.responses.choices[mc.blockId];
    if (selected === undefined) continue;
    const verdict = scoreMultipleChoice(selected, mc.correctIds);
    if (verdict === null) continue;
    // Per-choice feedback for the SELECTED choices only; concatenated in
    // choice order so the student reads it the way the block is laid out.
    const perChoice = selectChoiceFeedback(selected, mc.choices);
    const feedback = mc.choices
      .filter((c) => perChoice.has(c.id))
      .flatMap((c) => perChoice.get(c.id) ?? []);
    const misconceptionIds = verdict
      ? []
      : selectChoiceMisconceptions(selected, mc.choices);
    items[mc.blockId] = {
      verdict: verdict ? 'correct' : 'incorrect',
      ...(feedback.length ? { feedback: sanitizeOut(feedback) } : {}),
      ...(misconceptionIds.length ? { misconceptionIds } : {}),
    };
  }

  // ---- matching -------------------------------------------------------------
  for (const m of inv.matching) {
    const pairs = input.responses.matches[m.blockId];
    if (pairs === undefined) continue;
    const score = scoreMatching(pairs, m.key, m.itemIds);
    if (score.verdict === null) continue;
    items[m.blockId] = { verdict: score.verdict ? 'correct' : 'incorrect' };
  }

  // ---- correspondence -------------------------------------------------------
  for (const c of inv.correspondence) {
    const cells = input.responses.correspondences?.[c.blockId];
    if (cells === undefined) continue;
    const score = scoreCorrespondence(cells, c.key, c.itemIds, c.columnIds);
    if (score.verdict === null) continue;
    items[c.blockId] = { verdict: score.verdict ? 'correct' : 'incorrect' };
  }

  // ---- ordering -------------------------------------------------------------
  for (const o of inv.ordering) {
    const submitted = input.responses.orderings[o.blockId];
    if (submitted === undefined) continue;
    const served = input.servedOrderings?.[o.blockId] ?? o.authoredOrder;
    const verdict = scoreOrdering(submitted, o.authoredOrder, served);
    if (verdict === null) continue;
    items[o.blockId] = { verdict: verdict ? 'correct' : 'incorrect' };
  }

  // ---- graph family ---------------------------------------------------------
  for (const g of inv.graphs) {
    const work = input.responses.graphs[g.blockId];
    if (work === undefined) continue;
    const verdict: ItemVerdict = scoreGraphBlock(g.block, work);
    if (verdict === null) continue;
    // Wrong interactive_graph answers carry their authored mistakeFeedback
    // match: rich feedback + misconception id. Built-in classifier text is
    // deliberately absent — see selectGraphMistake (X3).
    const mistake = verdict ? null : selectGraphMistake(g.block, work);
    const feedback = mistake?.feedback ? sanitizeOut(mistake.feedback) : undefined;
    items[g.blockId] = {
      verdict: verdict ? 'correct' : 'incorrect',
      ...(feedback?.length ? { feedback } : {}),
      ...(mistake?.misconceptionId
        ? { misconceptionIds: [mistake.misconceptionId] }
        : {}),
    };
  }

  // ---- free text ------------------------------------------------------------
  // RECORDED, never judged. The family spec is explicit: a student must not be
  // able to read auto-grading into a captured free-text answer, so there is no
  // path here that can produce correct/incorrect. Teacher feedback reaches them
  // later, through a different channel entirely.
  for (const blockId of inv.freeText) {
    const text = input.responses.freeText[blockId];
    if (text === undefined) continue;
    // An empty box is still an omission, consistent with every other type.
    if (text.trim() === '') continue;
    items[blockId] = { verdict: 'recorded' };
  }

  // ---- solutions ------------------------------------------------------------
  // SIZE BOUND, by derivation rather than by cap (eng-review B9, 2026-08-06):
  // every value here is a subset of the stored document, and documents are
  // bounded at publish — so the response inherits that bound and needs no
  // truncation (which would cut a worked example mid-step). The bound is
  // COUPLED to the publish limit: loosen that and this channel loosens with
  // it. The persistence leg is separate and guarded: record_check persists
  // responses + verdicts for ~400 days, and the handler suite asserts
  // solutions NEVER ride into that row — the response is transient, the row
  // is not, and the storage multiplier lives in the row.
  const solutions: Record<string, unknown[]> = {};
  for (const { blockId, solution } of inv.solutions) {
    solutions[blockId] = sanitizeOut(solution);
  }

  return {
    wireVersion: CHECK_WIRE_VERSION,
    sectionId: input.sectionId,
    items,
    solutions: solutions as SectionCheckResult['solutions'],
  };
}

/** Everything leaving the server that came from the raw document. */
function sanitizeOut(nodes: unknown[]): never[] {
  return sanitizeInlineContent(nodes) as never[];
}

// (A `GradingSectionNotFound` alias re-export lived here with zero consumers —
// deleted 2026-08-06, A17. `SectionNotFoundError` above is the real name.)
export type { GradableInventory } from './walk.js';
