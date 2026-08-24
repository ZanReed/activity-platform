// =============================================================================
// grading/walk.ts — raw document → the gradable inventory of one section
// -----------------------------------------------------------------------------
// The server's counterpart to the viewer's container/blockIndex.ts. Same walk,
// opposite side of the wire: blockIndex tells the CLIENT which ids to send,
// this tells the SERVER what each of those ids is worth. They must agree, and
// the golden corpus plus the conformance suite are what hold them together.
//
// Two properties inherited deliberately from blockIndex:
//
//  1. IN-BAND IDS COME FROM A DEEP WALK, not a per-type field list. A blank
//     lives in fill_in_blank.content, but also inside a faded_worked_example's
//     nested steps, and a prompted math_inline may appear in ANY content array.
//     Walking unconditionally means a new block type that embeds blanks is
//     gradable the day it renders, with no registry edit. The failure this
//     avoids is the worst kind: a student answer that is submitted, stored, and
//     never scored.
//
//  2. CONTAINERS ATTRIBUTE TO THE CHILD. A blank inside a faded example belongs
//     to that example's step, not to the container, so ids line up with what
//     the client sent.
//
// This walk reads the RAW document. That is what makes `ordering` gradable at
// all (its authored item order IS the key) and what gives the grader the answer
// keys, hints, and solutions the served document had stripped.
//
// MALFORMED-DOCUMENT POSTURE (ruled B8/D10, 2026-08-06; landed red-green):
// the walk carries an INTEGRITY GATE. The rule that decides every check below:
// a grader-read field that is PRESENT with a shape the schema cannot author is
// structurally broken → MalformedDocumentError (the handler maps it to the
// wire code `malformed_document`, the client to its own non-retryable copy).
// A field that is ABSENT, or authored empty, grades exactly as it always has —
// authored-empty is a teacher mid-edit, not corruption, and refusing it would
// break legitimate documents. Before the gate, every field was silently
// narrowed, so a broken block produced a MARK (graded against a coerced-empty
// key) — a confident wrong verdict nobody could see (s4-audit missed-9);
// server-authoritative grading makes that worse than a typed failure.
//
// Two deliberate scope edges:
//   * The graph family is NOT gated here. scoreGraphBlock dispatches on the
//     served interaction and REFUSES work that disagrees (null → no mark) —
//     it already fails safe rather than coercing, which is the property the
//     gate exists to add elsewhere.
//   * On today's handler path the upgrade step's Zod validation means no
//     STORABLE document reaches this walk broken — the gate is the engine's
//     own contract (defense in depth behind the handler's `as never` cast),
//     so safety stops depending on every caller validating first. S7's real
//     malformed case (schemaVersion-1 documents) is refused upstream by the
//     upgrade path itself.
//
// The census (read path) opts OUT via `{ integrity: 'coerce' }` — a censused
// malformed document merely miscounts, and the read path's ruled posture is
// withhold-and-serve, not fail. Grading always runs the gate.
// =============================================================================

import {
  childBlocksOf,
  looksLikeBlockArray,
} from '../../container/blockIndex.js';
import { PROMPT_CARRIER_TYPES } from '../../sanitize/promptCarriers.js';
import type { BlankKey } from './blanks.js';
import type { RawGraphBlock } from './graphs.js';

/** Loosely-typed raw block: the server dispatches on `type` strings and reads
 * fields the sanitized types deliberately don't admit. */
export type RawBlock = Record<string, unknown> & { id?: string; type?: string };

/** Structurally broken document (eng-review B8/D10): a grader-read field was
 * present with a shape the schema cannot author. Thrown instead of grading,
 * because a silently wrong mark is worse than a typed failure. The handler
 * maps this to the wire code `malformed_document`. */
export class MalformedDocumentError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`Structurally broken document: ${problems.join('; ')}`);
    this.name = 'MalformedDocumentError';
    this.problems = problems;
  }
}

export interface GradableInventory {
  /** Blank + math-gap keys, in document order, grouped per owning block so
   * interchangeable runs can be resolved within their block. */
  blankGroupsByBlock: Array<{ blockId: string; keys: BlankKey[] }>;
  multipleChoice: Array<{
    blockId: string;
    correctIds: string[];
    choices: Array<{
      id: string;
      correct?: boolean;
      feedback?: unknown[];
      misconceptionId?: string;
    }>;
  }>;
  matching: Array<{
    blockId: string;
    key: Record<string, string>;
    itemIds: string[];
  }>;
  ordering: Array<{ blockId: string; authoredOrder: string[] }>;
  graphs: Array<{ blockId: string; block: RawGraphBlock }>;
  /** Every free-text block in the section — recorded, never judged. */
  freeText: string[];
  /** blockId → authored solution content, for EVERY block in the section that
   * has one. Includes STATIC blocks (a `problem`'s worked explanation), which
   * is the whole reason this is collected by walking blocks rather than by
   * walking the blocks that produced responses. */
  solutions: Array<{ blockId: string; solution: unknown[] }>;
}

// Exported for the roster-bond test ONLY (rosterBonds.test.ts) — these two
// Sets restate registry facts (family 'recorded'; deriveQuestionShape) that
// this module deliberately does not import the registry to derive, and a
// hand-list that restates a registry fact is a claim that needs a guard (A7,
// policy P10b). Production code must keep consuming them from here.
export const FREE_TEXT_TYPES = new Set([
  'self_explanation',
  'short_answer',
  'essay',
]);
export const GRAPH_TYPES = new Set([
  'interactive_graph',
  'number_line',
  'data_plot',
]);

/** Project a raw BlankToken onto the grading key shape. */
function blankTokenToKey(node: Record<string, unknown>): BlankKey {
  const answer = typeof node.answer === 'string' ? node.answer : '';
  const acceptable = Array.isArray(node.acceptableAnswers)
    ? (node.acceptableAnswers as unknown[]).filter(
        (a): a is string => typeof a === 'string',
      )
    : [];
  const answerType = node.answerType;
  return {
    id: String(node.id ?? ''),
    // `answer` first, then the alternates — one list, matching how the
    // renderer joins them into data-blank-answers.
    answers: [answer, ...acceptable],
    answerType:
      answerType === 'numeric' || answerType === 'math' ? answerType : 'text',
    tolerance: typeof node.tolerance === 'number' ? node.tolerance : 0,
    equivalence: node.equivalence === 'exact-form' ? 'exact-form' : 'value',
    mistakeFeedback: Array.isArray(node.mistakeFeedback)
      ? (node.mistakeFeedback as Array<{
          match: string;
          feedback: unknown[];
          misconceptionId?: string;
        }>)
      : [],
    hint: Array.isArray(node.hint) ? (node.hint as unknown[]) : undefined,
    interchangeableWithPrevious: node.interchangeableWithPrevious === true,
  };
}

/** Project a raw MathPrompt onto the same shape. A gap is ALWAYS graded as a
 * math expression and never carries hint/mistakeFeedback — and its id is not a
 * uuid, but it keys into the same `blanks` response map. */
function mathPromptToKey(node: Record<string, unknown>): BlankKey {
  const answer = typeof node.answer === 'string' ? node.answer : '';
  const acceptable = Array.isArray(node.acceptableAnswers)
    ? (node.acceptableAnswers as unknown[]).filter(
        (a): a is string => typeof a === 'string',
      )
    : [];
  return {
    id: String(node.id ?? ''),
    answers: [answer, ...acceptable],
    answerType: 'math',
    tolerance: typeof node.tolerance === 'number' ? node.tolerance : 0,
    equivalence: node.equivalence === 'exact-form' ? 'exact-form' : 'value',
    mistakeFeedback: [],
    hint: undefined,
    // A gap never joins an interchangeable run: the flag is a BlankToken field.
    interchangeableWithPrevious: false,
  };
}

// PROMPT_CARRIER_TYPES is imported from sanitize/promptCarriers.ts — the ONE
// declaration both the sanitizer's deep strip and this walk consume (A7).

// ---- The integrity gate (B8/D10) --------------------------------------------
// Each helper below APPENDS problems and never changes what is collected — in
// 'coerce' mode the inventory must stay byte-identical to the pre-gate walk,
// and in 'throw' mode the collected inventory is discarded anyway. Every
// message leads with the owning block id: the error's problems list is what
// turns "checking is broken" into a findable defect in an edge log.

/** The answerType / equivalence vocabularies the projections coerce toward.
 * A value OUTSIDE them is a shape the schema cannot author — coercing it
 * silently changes grading semantics (e.g. a math answer graded byte-wise). */
const ANSWER_TYPES = new Set(['text', 'numeric', 'math']);
const EQUIVALENCES = new Set(['value', 'exact-form']);

/** present-with-the-wrong-shape, the rule's one predicate: absent is always
 * fine (authored-empty), a bad shape never is. */
function bad(value: unknown, ok: (v: unknown) => boolean): boolean {
  return value !== undefined && !ok(value);
}

const isString = (v: unknown) => typeof v === 'string';
const isNumber = (v: unknown) => typeof v === 'number';
const isBoolean = (v: unknown) => typeof v === 'boolean';
const isArrayV = (v: unknown) => Array.isArray(v);
const isPlainObject = (v: unknown) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

/** Matching/ordering item entries: `String(i.id)` minted 'undefined'-style
 * ids the client could never send back. An entry that exists but lacks its
 * identity is broken, not authored-empty — an EMPTY items array is the
 * authored-empty form and stays fine. */
function checkItemIds(
  items: Array<Record<string, unknown>>,
  blockId: string,
  problems: string[],
): void {
  for (const item of items) {
    if (!isPlainObject(item)) {
      problems.push(`block ${blockId}: an item entry that is not an object`);
    } else if (typeof item.id !== 'string') {
      problems.push(`block ${blockId}: an item without a string id`);
    }
  }
}

/** The fields blankTokenToKey / mathPromptToKey narrow, checked instead of
 * coerced. `forPrompt` skips the three BlankToken-only fields. */
function checkKeyFields(
  node: Record<string, unknown>,
  where: string,
  problems: string[],
  forPrompt: boolean,
): void {
  if (bad(node.answer, isString)) {
    problems.push(`${where}: answer is not a string`);
  }
  if (bad(node.acceptableAnswers, isArrayV)) {
    problems.push(`${where}: acceptableAnswers is not an array`);
  } else if (Array.isArray(node.acceptableAnswers)) {
    // The projection FILTERS non-string entries — an authored alternate that
    // silently vanishes marks a correct student wrong.
    if (!node.acceptableAnswers.every(isString)) {
      problems.push(`${where}: acceptableAnswers has a non-string entry`);
    }
  }
  if (bad(node.answerType, (v) => ANSWER_TYPES.has(v as string))) {
    problems.push(`${where}: answerType is outside the vocabulary`);
  }
  if (bad(node.tolerance, isNumber)) {
    problems.push(`${where}: tolerance is not a number`);
  }
  if (bad(node.equivalence, (v) => EQUIVALENCES.has(v as string))) {
    problems.push(`${where}: equivalence is outside the vocabulary`);
  }
  if (forPrompt) return;
  if (bad(node.mistakeFeedback, isArrayV)) {
    problems.push(`${where}: mistakeFeedback is not an array`);
  }
  if (bad(node.hint, isArrayV)) {
    problems.push(`${where}: hint is not an array`);
  }
  if (bad(node.interchangeableWithPrevious, isBoolean)) {
    // `=== true` narrowing would silently degrade the group to positional
    // grading — a swapped-but-correct pair marked wrong.
    problems.push(`${where}: interchangeableWithPrevious is not a boolean`);
  }
}

/** Collect in-band keys (blanks + math gaps) belonging to THIS block, at any
 * depth short of a nested child block. */
function collectInBandKeys(
  value: unknown,
  out: BlankKey[],
  isChildBlockArray: (value: unknown) => boolean,
  blockId: string,
  problems: string[],
): void {
  if (Array.isArray(value)) {
    if (isChildBlockArray(value)) return;
    for (const item of value) {
      collectInBandKeys(item, out, isChildBlockArray, blockId, problems);
    }
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const node = value as Record<string, unknown>;

  if (node.type === 'blank' && typeof node.id !== 'string') {
    // Not even recognized as a blank — the typed answer would vanish. The id
    // is the token's identity, so an entry without one is broken, not
    // authored-empty. Falls through to the child walk exactly as the
    // pre-gate code did, so 'coerce' mode stays byte-identical.
    problems.push(`block ${blockId}: a blank token without a string id`);
  }
  if (node.type === 'blank' && typeof node.id === 'string') {
    checkKeyFields(node, `block ${blockId}: blank ${node.id}`, problems, false);
    out.push(blankTokenToKey(node));
    return;
  }
  if (typeof node.type === 'string' && PROMPT_CARRIER_TYPES.has(node.type)) {
    if (bad(node.prompts, isArrayV)) {
      problems.push(`block ${blockId}: prompts is not an array`);
    }
    if (Array.isArray(node.prompts)) {
      for (const prompt of node.prompts) {
        if (prompt === null || typeof prompt !== 'object') {
          problems.push(`block ${blockId}: a prompt entry that is not an object`);
          continue;
        }
        const p = prompt as Record<string, unknown>;
        if (typeof p.id !== 'string') {
          problems.push(`block ${blockId}: a prompt without a string id`);
        } else {
          checkKeyFields(p, `block ${blockId}: prompt ${p.id}`, problems, true);
        }
        out.push(mathPromptToKey(p));
      }
      // Keep walking siblings: a math_block carries content fields too.
    }
  }
  for (const child of Object.values(node)) {
    collectInBandKeys(child, out, isChildBlockArray, blockId, problems);
  }
}

// looksLikeBlockArray / childBlocksOf are IMPORTED from container/blockIndex —
// this file carried a private, logically-identical copy of the subtle
// heuristic until 2026-08-06 (A24), hedged "mirroring blockIndex's" while the
// source file claimed "this one is the source": the copy that would silently
// drift, and drifted attribution mis-grades invisibly. Same package, and the
// census already imports childBlocksOf server-side, so the bundle boundary
// was proven before this joined it.

function visit(
  block: RawBlock,
  inv: GradableInventory,
  problems: string[],
): void {
  const id = typeof block.id === 'string' ? block.id : '';
  const type = typeof block.type === 'string' ? block.type : '';
  if (bad(block.id, isString)) {
    // Skipped entirely by the pre-gate walk: the student's answer for it was
    // submitted, stored, and never scored — the exact failure the deep walk
    // exists to prevent.
    problems.push(`a block whose id is not a string (${JSON.stringify(block.id)})`);
  }
  if (bad(block.type, isString)) {
    problems.push(`block ${id || '<no id>'}: type is not a string`);
  }
  if (bad(block.solution, isArrayV)) {
    // Silently dropped before: the section says "checked" but the worked
    // explanation never unlocks — a content bug from the student's seat.
    problems.push(`block ${id || '<no id>'}: solution is not an array`);
  }
  if (!id) return;

  // Solutions are collected for EVERY block that has one, including statics.
  // A grader that walked only responding blocks would never unlock a
  // `problem`'s worked solution, and to a student that reads as a content bug
  // (the section says "checked" but one box stays shut).
  if (Array.isArray(block.solution) && block.solution.length > 0) {
    inv.solutions.push({ blockId: id, solution: block.solution as unknown[] });
  }

  const inBand: BlankKey[] = [];
  collectInBandKeys(block, inBand, looksLikeBlockArray, id, problems);
  if (inBand.length > 0) {
    inv.blankGroupsByBlock.push({ blockId: id, keys: inBand });
  }

  switch (type) {
    case 'multiple_choice': {
      if (bad(block.choices, isArrayV)) {
        // Coerced to [] before: the selection graded against an EMPTY key and
        // the student was marked wrong with confidence.
        problems.push(`block ${id}: choices is not an array`);
      }
      if (Array.isArray(block.choices)) {
        for (const c of block.choices) {
          if (!isPlainObject(c)) {
            problems.push(`block ${id}: a choice entry that is not an object`);
            continue;
          }
          const choice = c as Record<string, unknown>;
          if (typeof choice.id !== 'string') {
            // String(c.id) minted ids the served page never rendered.
            problems.push(`block ${id}: a choice without a string id`);
          }
          if (bad(choice.correct, isBoolean)) {
            // `=== true` narrowing silently emptied the key.
            problems.push(`block ${id}: a choice whose correct flag is not a boolean`);
          }
          if (bad(choice.feedback, isArrayV)) {
            problems.push(`block ${id}: a choice whose feedback is not an array`);
          }
        }
      }
      const choices = Array.isArray(block.choices)
        ? (block.choices as Array<Record<string, unknown>>)
        : [];
      inv.multipleChoice.push({
        blockId: id,
        correctIds: choices
          .filter((c) => c.correct === true)
          .map((c) => String(c.id)),
        choices: choices.map((c) => ({
          id: String(c.id),
          correct: c.correct === true,
          ...(Array.isArray(c.feedback)
            ? { feedback: c.feedback as unknown[] }
            : {}),
          ...(typeof c.misconceptionId === 'string' && c.misconceptionId
            ? { misconceptionId: c.misconceptionId }
            : {}),
        })),
      });
      break;
    }
    case 'matching': {
      if (bad(block.items, isArrayV)) {
        problems.push(`block ${id}: items is not an array`);
      }
      if (bad(block.key, isPlainObject)) {
        // The bare cast passed anything through: lookups on a broken key
        // return undefined and every placed pair is wrong.
        problems.push(`block ${id}: key is not an object`);
      } else if (isPlainObject(block.key)) {
        if (!Object.values(block.key as object).every(isString)) {
          problems.push(`block ${id}: key has a non-string target`);
        }
      }
      const items = Array.isArray(block.items)
        ? (block.items as Array<Record<string, unknown>>)
        : [];
      checkItemIds(items, id, problems);
      inv.matching.push({
        blockId: id,
        key: (block.key as Record<string, string>) ?? {},
        itemIds: items.map((i) => String(i.id)),
      });
      break;
    }
    case 'ordering': {
      if (bad(block.items, isArrayV)) {
        // authoredOrder coerced to [] before: a deliberate arrangement graded
        // against an empty key and was marked wrong.
        problems.push(`block ${id}: items is not an array`);
      }
      const items = Array.isArray(block.items)
        ? (block.items as Array<Record<string, unknown>>)
        : [];
      checkItemIds(items, id, problems);
      // The authored order IS the key — available only because this walks the
      // raw document rather than the served one.
      inv.ordering.push({ blockId: id, authoredOrder: items.map((i) => String(i.id)) });
      break;
    }
    case 'table': {
      // A table contributes NO per-type inventory: its gradable content is
      // blank tokens, already collected (and gated) by the in-band walk above,
      // wherever in the cells they sit. That is the whole design.
      //
      // What that walk cannot see is a SKELETON present with the wrong shape.
      // `rows: 'nope'`, or a `cells` object, simply yields no keys — so the
      // section "checks" successfully while the student's table answers go
      // unscored and unreported. That is the same worst-case the section-level
      // rows check guards against, one level down, and the reason this case
      // exists at all despite adding nothing to the inventory.
      if (bad(block.rows, isArrayV)) {
        problems.push(`block ${id}: rows is not an array`);
      }
      if (Array.isArray(block.rows)) {
        for (const row of block.rows) {
          if (!isPlainObject(row)) {
            problems.push(`block ${id}: a row that is not an object`);
            continue;
          }
          const cells = (row as Record<string, unknown>).cells;
          if (bad(cells, isArrayV)) {
            problems.push(`block ${id}: a row whose cells is not an array`);
            continue;
          }
          for (const cell of Array.isArray(cells) ? cells : []) {
            if (!isPlainObject(cell)) {
              problems.push(`block ${id}: a cell that is not an object`);
              continue;
            }
            if (bad((cell as Record<string, unknown>).content, isArrayV)) {
              problems.push(`block ${id}: a cell whose content is not an array`);
            }
          }
        }
      }
      break;
    }

    default:
      if (FREE_TEXT_TYPES.has(type)) {
        inv.freeText.push(id);
      } else if (GRAPH_TYPES.has(type)) {
        inv.graphs.push({ blockId: id, block: block as unknown as RawGraphBlock });
      }
      break;
  }

  for (const child of childBlocksOf(block)) visit(child, inv, problems);
}

export interface RawSection {
  id?: string;
  rows?: Array<{ columns?: Array<{ blocks?: RawBlock[] }> }>;
}

/** Find a section by id in the raw document. Returns null when absent — the
 * handler turns that into a 400 rather than grading nothing and reporting
 * success. */
export function findSection(
  doc: { sections?: RawSection[] },
  sectionId: string,
): RawSection | null {
  for (const section of doc.sections ?? []) {
    if (section.id === sectionId) return section;
  }
  return null;
}

export interface WalkOptions {
  /**
   * 'throw' (default): the B8/D10 integrity gate — a structurally broken
   * document raises MalformedDocumentError instead of grading. The default on
   * purpose: a new caller gets the gate unless it argues its way out.
   *
   * 'coerce': the pre-gate defensive narrowing, byte-identical inventory.
   * Reserved for the READ path (census), whose ruled failure posture is
   * withhold-and-serve — a censused malformed document merely miscounts,
   * where a graded one mints a wrong mark.
   */
  integrity?: 'throw' | 'coerce';
}

/** Build the gradable inventory for one section of the RAW document. */
export function inventorySection(
  section: RawSection,
  options: WalkOptions = {},
): GradableInventory {
  const inv: GradableInventory = {
    blankGroupsByBlock: [],
    multipleChoice: [],
    matching: [],
    ordering: [],
    graphs: [],
    freeText: [],
    solutions: [],
  };
  const problems: string[] = [];
  // The skeleton runs the same present-vs-absent rule as the blocks: rows
  // coerced to [] is the worst silent outcome of all — the whole section
  // "checks" successfully with zero items.
  const raw = section as Record<string, unknown>;
  if (bad(raw.rows, isArrayV)) {
    problems.push('section: rows is not an array');
  }
  for (const row of Array.isArray(raw.rows) ? (section.rows ?? []) : []) {
    if (!isPlainObject(row)) {
      problems.push('section: a row that is not an object');
      continue;
    }
    if (bad(row.columns, isArrayV)) {
      problems.push('section: a row whose columns is not an array');
    }
    for (const column of Array.isArray(row.columns) ? row.columns : []) {
      if (!isPlainObject(column)) {
        problems.push('section: a column that is not an object');
        continue;
      }
      if (bad(column.blocks, isArrayV)) {
        problems.push('section: a column whose blocks is not an array');
      }
      for (const block of Array.isArray(column.blocks) ? column.blocks : []) {
        if (!isPlainObject(block)) {
          problems.push('section: a blocks entry that is not an object');
          continue;
        }
        visit(block, inv, problems);
      }
    }
  }
  if (problems.length > 0 && options.integrity !== 'coerce') {
    throw new MalformedDocumentError(problems);
  }
  return inv;
}
