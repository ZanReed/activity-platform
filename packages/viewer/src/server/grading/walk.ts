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
// =============================================================================

import type { BlankKey } from './blanks.js';
import type { RawGraphBlock } from './graphs.js';

/** Loosely-typed raw block: the server dispatches on `type` strings and reads
 * fields the sanitized types deliberately don't admit. */
export type RawBlock = Record<string, unknown> & { id?: string; type?: string };

export interface GradableInventory {
  /** Blank + math-gap keys, in document order, grouped per owning block so
   * interchangeable runs can be resolved within their block. */
  blankGroupsByBlock: Array<{ blockId: string; keys: BlankKey[] }>;
  multipleChoice: Array<{
    blockId: string;
    correctIds: string[];
    choices: Array<{ id: string; feedback?: unknown[] }>;
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

const FREE_TEXT_TYPES = new Set(['self_explanation', 'short_answer', 'essay']);
const GRAPH_TYPES = new Set(['interactive_graph', 'number_line', 'data_plot']);

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
      ? (node.mistakeFeedback as Array<{ match: string; feedback: unknown[] }>)
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

const PROMPT_CARRIER_TYPES = new Set(['math_inline', 'math_block']);

/** Collect in-band keys (blanks + math gaps) belonging to THIS block, at any
 * depth short of a nested child block. */
function collectInBandKeys(
  value: unknown,
  out: BlankKey[],
  isChildBlockArray: (value: unknown) => boolean,
): void {
  if (Array.isArray(value)) {
    if (isChildBlockArray(value)) return;
    for (const item of value) collectInBandKeys(item, out, isChildBlockArray);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const node = value as Record<string, unknown>;

  if (node.type === 'blank' && typeof node.id === 'string') {
    out.push(blankTokenToKey(node));
    return;
  }
  if (
    typeof node.type === 'string' &&
    PROMPT_CARRIER_TYPES.has(node.type) &&
    Array.isArray(node.prompts)
  ) {
    for (const prompt of node.prompts) {
      if (prompt !== null && typeof prompt === 'object') {
        out.push(mathPromptToKey(prompt as Record<string, unknown>));
      }
    }
    // Keep walking siblings: a math_block carries content fields too.
  }
  for (const child of Object.values(node)) {
    collectInBandKeys(child, out, isChildBlockArray);
  }
}

/** Structural child-block detection, mirroring blockIndex's: an array of
 * objects each carrying `id` + a non-inline `type`. Structural rather than
 * registry-declared so a container that forgets its declaration still cannot
 * get its children's ids mis-attributed to itself. */
function looksLikeBlockArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { type?: unknown }).type === 'string',
    ) &&
    value.every((item) => {
      const t = (item as { type: string }).type;
      return (
        t !== 'text' && t !== 'blank' && t !== 'math_inline' && t !== 'hard_break'
      );
    })
  );
}

function childBlocksOf(block: RawBlock): RawBlock[] {
  const out: RawBlock[] = [];
  for (const value of Object.values(block)) {
    if (looksLikeBlockArray(value)) out.push(...(value as RawBlock[]));
  }
  return out;
}

function visit(block: RawBlock, inv: GradableInventory): void {
  const id = typeof block.id === 'string' ? block.id : '';
  const type = typeof block.type === 'string' ? block.type : '';
  if (!id) return;

  // Solutions are collected for EVERY block that has one, including statics.
  // A grader that walked only responding blocks would never unlock a
  // `problem`'s worked solution, and to a student that reads as a content bug
  // (the section says "checked" but one box stays shut).
  if (Array.isArray(block.solution) && block.solution.length > 0) {
    inv.solutions.push({ blockId: id, solution: block.solution as unknown[] });
  }

  const inBand: BlankKey[] = [];
  collectInBandKeys(block, inBand, looksLikeBlockArray);
  if (inBand.length > 0) {
    inv.blankGroupsByBlock.push({ blockId: id, keys: inBand });
  }

  switch (type) {
    case 'multiple_choice': {
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
          ...(Array.isArray(c.feedback)
            ? { feedback: c.feedback as unknown[] }
            : {}),
        })),
      });
      break;
    }
    case 'matching': {
      const items = Array.isArray(block.items)
        ? (block.items as Array<Record<string, unknown>>)
        : [];
      inv.matching.push({
        blockId: id,
        key: (block.key as Record<string, string>) ?? {},
        itemIds: items.map((i) => String(i.id)),
      });
      break;
    }
    case 'ordering': {
      const items = Array.isArray(block.items)
        ? (block.items as Array<Record<string, unknown>>)
        : [];
      // The authored order IS the key — available only because this walks the
      // raw document rather than the served one.
      inv.ordering.push({ blockId: id, authoredOrder: items.map((i) => String(i.id)) });
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

  for (const child of childBlocksOf(block)) visit(child, inv);
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

/** Build the gradable inventory for one section of the RAW document. */
export function inventorySection(section: RawSection): GradableInventory {
  const inv: GradableInventory = {
    blankGroupsByBlock: [],
    multipleChoice: [],
    matching: [],
    ordering: [],
    graphs: [],
    freeText: [],
    solutions: [],
  };
  for (const row of section.rows ?? []) {
    for (const column of row.columns ?? []) {
      for (const block of column.blocks ?? []) visit(block, inv);
    }
  }
  return inv;
}
