// =============================================================================
// census/census.ts — a published version's block census + item attribution (S7)
// -----------------------------------------------------------------------------
// P3A's "publish-time registry census", built the way S2 made possible: the
// census is DERIVED from the stored version snapshot, never written by
// publish-activity. Every published version's document already lives in
// activity_versions.content forever, so the tally can be computed whenever the
// document is next read — and `publish-activity`, which S9 rewrites, is never
// touched (this is what dissolved finding R6(b): nothing gets written twice).
// Same posture as 0025's derived student dormancy: don't mark what you can
// derive.
//
// Two products, both per version:
//
//   counts — censusKey → how many block instances of that kind the version
//     contains. The key comes from the registry's censusKeyOf(), so a
//     variant-carrying block tallies per variant (`data_plot.build_histogram`)
//     and a new block type is counted the day it registers.
//
//   items — every RESPONSE id in the version mapped to the census key of the
//     block it belongs to. This is what lets an aggregate over section_checks
//     say "3 of 4 wrong answers were on fill_in_blank" — verdicts are keyed by
//     item id (blank/gap ids for the blanks category, block ids elsewhere), and
//     nothing else in the database knows what an item id IS.
//
// WHY THE ITEM MAP REUSES THE GRADING WALK (ruling S7-5). The set of ids that
// can appear in a verdict map is decided by ONE thing: what the grader accepts
// (inventorySection, server/grading/walk.ts). A second enumeration written here
// would drift from it — and drifted attribution is silent, counting a student's
// answer under the wrong block type or dropping it. So this module owns no id
// rules at all: it asks the grader's inventory for the ids and only supplies
// the id → census-key join. tests/census.test.ts pins the equality.
//
// BUNDLE NOTE: walk.ts imports its two collaborators as `import type` only, so
// pulling it in here costs the read bundle nothing at runtime — no mathjs, no
// scorers (the graph-kit/scorers discipline, checked by the bundle's size
// ceiling and a grep-absence test).
//
//   document ──► eachBlock (rows→columns→blocks, child blocks, referencePanel)
//                   │
//                   ├─► counts:  tally of censusKeyOf(block)
//                   └─► index:   blockId → censusKey
//                                    ▲
//   sections ──► inventorySection ───┘  (blank/gap ids, MC/matching/ordering/
//                (the grader's own       graph/free-text block ids)
//                 accepted-id set)   ──► items
// =============================================================================

import type { ActivityDocument, Block } from '@activity/schema';
import { childBlocksOf } from '../container/blockIndex.js';
import { blockRegistry, censusKeyOf } from '../registry/registry.js';
import { inventorySection } from '../server/grading/walk.js';
import type { RawSection } from '../server/grading/walk.js';

/** Census key for a block whose type the registry doesn't know. Unreachable for
 * a schema-valid document (the registry completeness guard makes every block
 * type registered), and deliberately a VISIBLE bucket rather than a throw: this
 * runs on the read path, where the ruled write ordering means a thrown census
 * would cost the version its cache row on every read. A surfaced `_unknown`
 * row is a bug report; a crash here would be a silent performance cliff. */
export const UNKNOWN_CENSUS_KEY = '_unknown';

export interface CensusCount {
  censusKey: string;
  blockCount: number;
}

export interface CensusItem {
  /** The id a verdict map is keyed by: a blank id, an in-equation gap id
   * (`g`+hex), or a gradable/recorded block id. */
  itemId: string;
  censusKey: string;
}

export interface VersionCensus {
  /** Document order of first appearance. */
  counts: CensusCount[];
  items: CensusItem[];
}

/** The registry's key rule, guarded on its one precondition (a registered
 * type). The rule itself is NOT restated here — censusKeyOf stays the source,
 * variant suffix included. */
function safeCensusKey(block: Block): string {
  const type = (block as { type?: unknown }).type;
  if (typeof type !== 'string' || !(type in blockRegistry)) {
    return UNKNOWN_CENSUS_KEY;
  }
  return censusKeyOf(block);
}

/** Visit a block and, depth-first, every block nested inside it. Child blocks
 * are found STRUCTURALLY via blockIndex's childBlocksOf — the documented single
 * definition of "is this a nested block or content of this one?", shared with
 * the served-document index and the answer-key extraction. A faded example's
 * steps therefore count as themselves, exactly as they grade as themselves. */
function visitDeep(block: Block, visit: (block: Block) => void): void {
  visit(block);
  for (const child of childBlocksOf(block as unknown as object)) {
    visitDeep(child as unknown as Block, visit);
  }
}

/** Every block instance in the document, in document order: section content
 * first (rows → columns → blocks), then the reference panel. The panel is
 * scaffold — it is never checked, so it contributes counts and no items — but
 * it IS authored content a teacher chose, so leaving it out would undercount
 * what the activity actually uses. */
function eachBlock(doc: ActivityDocument, visit: (block: Block) => void): void {
  for (const section of doc.sections ?? []) {
    for (const row of section.rows ?? []) {
      for (const column of row.columns ?? []) {
        for (const block of column.blocks ?? []) visitDeep(block, visit);
      }
    }
  }
  for (const block of doc.referencePanel?.blocks ?? []) visitDeep(block, visit);
}

/**
 * Compute the census of an UPGRADED document (post-upgrade, pre-sanitize).
 *
 * Pre-sanitize on purpose: `ordering`'s authored item order and the blank
 * answer keys are gone from the served artifact, and the grading inventory this
 * joins against reads the same raw shape the grader does. Nothing derived here
 * is secret — a count of block kinds and a list of response ids the client
 * already holds — so the output crosses no sanitizer boundary.
 */
export function censusOfDocument(doc: ActivityDocument): VersionCensus {
  const counts = new Map<string, number>();
  const keyByBlockId = new Map<string, string>();

  eachBlock(doc, (block) => {
    const key = safeCensusKey(block);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    const id = (block as { id?: unknown }).id;
    if (typeof id === 'string') keyByBlockId.set(id, key);
  });

  const items: CensusItem[] = [];
  const seen = new Set<string>();
  const push = (itemId: string, blockId: string): void => {
    if (!itemId || seen.has(itemId)) return;
    seen.add(itemId);
    items.push({
      itemId,
      censusKey: keyByBlockId.get(blockId) ?? UNKNOWN_CENSUS_KEY,
    });
  };

  for (const section of doc.sections ?? []) {
    // 'coerce' opts OUT of the B8/D10 integrity gate, deliberately: this is
    // the READ path, whose ruled failure posture is withhold-and-serve (the
    // cache-fill caller already fails safe). A censused malformed document
    // merely miscounts; only GRADING one mints a wrong mark, so only grading
    // runs the gate.
    const inv = inventorySection(section as unknown as RawSection, {
      integrity: 'coerce',
    });
    // Blanks and math gaps attribute to their OWNING block (the walk already
    // resolves containers to the child), which is why a blank inside a faded
    // example counts as faded_worked_example and not as fill_in_blank.
    for (const group of inv.blankGroupsByBlock) {
      for (const key of group.keys) push(key.id, group.blockId);
    }
    for (const mc of inv.multipleChoice) push(mc.blockId, mc.blockId);
    for (const m of inv.matching) push(m.blockId, m.blockId);
    for (const o of inv.ordering) push(o.blockId, o.blockId);
    for (const g of inv.graphs) push(g.blockId, g.blockId);
    for (const id of inv.freeText) push(id, id);
  }

  return {
    counts: [...counts].map(([censusKey, blockCount]) => ({
      censusKey,
      blockCount,
    })),
    items,
  };
}
