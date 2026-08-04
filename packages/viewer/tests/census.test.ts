// =============================================================================
// census.test.ts — the S7 census module: roster completeness + attribution
// -----------------------------------------------------------------------------
// Two properties carry this slice, and both fail SILENTLY when broken — a
// miscounted census doesn't crash, it just lies:
//
//   1. COMPLETENESS. Every registry entry (and every declared interaction
//      variant) must produce a census key. The required roster is DERIVED from
//      the registry, not listed here, so a new block type fails this suite
//      until it is counted — the S4-8 guard pattern.
//
//   2. ATTRIBUTION. Every id the CLIENT can send in a check must be present in
//      the item map. That crossing is the real guarantee: blockIndex decides
//      what a student sends, the grader decides what it is worth, and the
//      census decides what it counts as. If the census misses an id, that
//      student's answer is aggregated under nothing at all.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { ActivityDocument, createEmptyDocument } from '@activity/schema';
import {
  UNKNOWN_CENSUS_KEY,
  censusOfDocument,
} from '../src/census/census.js';
import { indexDocument } from '../src/container/blockIndex.js';
import { blockRegistry, registeredBlockTypes } from '../src/registry/registry.js';
import {
  authoredBlockFixture,
  authoredFixtureDocument,
  servedFixtureDocument,
} from '../src/fixtures/index.js';

/** The keys the registry says must exist: one per type, or one per declared
 * interaction variant for the blocks that have an interaction axis. */
function expectedCensusKeys(): string[] {
  const keys: string[] = [];
  for (const type of registeredBlockTypes) {
    const entry = blockRegistry[type];
    if (entry.variants) {
      for (const variant of entry.variants) {
        keys.push(`${entry.analyticsKey}.${variant}`);
      }
    } else {
      keys.push(entry.analyticsKey);
    }
  }
  return keys;
}

describe('census — roster completeness', () => {
  const census = censusOfDocument(authoredFixtureDocument());
  const present = new Set(census.counts.map((c) => c.censusKey));

  it('produces a census key for every registry entry and variant', () => {
    const missing = expectedCensusKeys().filter((key) => !present.has(key));
    expect(missing).toEqual([]);
  });

  it('emits no unknown-type bucket for a schema-valid document', () => {
    expect(present.has(UNKNOWN_CENSUS_KEY)).toBe(false);
  });

  it('keys variant blocks by variant, never by the bare type', () => {
    const variantTypes = registeredBlockTypes.filter(
      (type) => blockRegistry[type].variants,
    );
    expect(variantTypes.length).toBeGreaterThan(0);
    for (const type of variantTypes) {
      expect(present.has(blockRegistry[type].analyticsKey)).toBe(false);
    }
  });

  it('counts instances, not kinds', () => {
    const total = census.counts.reduce((sum, c) => sum + c.blockCount, 0);
    // The fixture document is one block per row; every row's block is counted.
    const rows = authoredFixtureDocument().sections.flatMap((s) => s.rows);
    expect(total).toBeGreaterThanOrEqual(rows.length);
  });
});

describe('census — document structure', () => {
  it('counts blocks nested inside container blocks as themselves', () => {
    // faded_worked_example carries nested step blocks; they must count as the
    // child's own kind, matching how the grader attributes their blanks.
    const doc = authoredFixtureDocument();
    const census = censusOfDocument(doc);
    const byKey = new Map(census.counts.map((c) => [c.censusKey, c.blockCount]));

    // Every block id the deep walk found is attributable — a container whose
    // children were skipped would leave those ids out of the item map.
    const counted = census.counts.reduce((sum, c) => sum + c.blockCount, 0);
    let shallow = 0;
    for (const section of doc.sections) {
      for (const row of section.rows) {
        for (const column of row.columns) shallow += column.blocks.length;
      }
    }
    expect(counted).toBeGreaterThanOrEqual(shallow);
    expect(byKey.get('paragraph')).toBeGreaterThan(0);
  });

  it('counts reference-panel blocks (scaffold the teacher authored)', () => {
    // Measured as a DELTA against the same document without a panel, so the
    // starter content createEmptyDocument seeds can't mask the contribution.
    const bare = JSON.parse(
      JSON.stringify(createEmptyDocument({ title: 'Panel' })),
    ) as Record<string, unknown>;
    const paragraphOf = (doc: ActivityDocument): number =>
      censusOfDocument(doc).counts.find((c) => c.censusKey === 'paragraph')
        ?.blockCount ?? 0;

    const without = ActivityDocument.parse(bare);
    const withPanel = ActivityDocument.parse({
      ...bare,
      referencePanel: {
        title: 'Formulas',
        blocks: [JSON.parse(JSON.stringify(authoredBlockFixture('paragraph')))],
      },
    });

    expect(paragraphOf(withPanel)).toBe(paragraphOf(without) + 1);
    // Scaffold is never checked: counted, contributing no response ids.
    expect(censusOfDocument(withPanel).items).toEqual(
      censusOfDocument(without).items,
    );
    expect(without.referencePanel).toBeUndefined();
  });

  it('is total on an unregistered block type instead of throwing', () => {
    // Unreachable for a schema-valid document (the registry guard), but the
    // read path must never lose its cache row to a census crash.
    const doc = {
      ...authoredFixtureDocument(),
      sections: [
        {
          id: 'ffffffff-ffff-4fff-8fff-000000000009',
          isCheckpoint: false,
          rows: [
            {
              id: 'ffffffff-ffff-4fff-8fff-00000000000a',
              gridLines: 'inherit',
              columns: [
                {
                  id: 'ffffffff-ffff-4fff-8fff-00000000000b',
                  blocks: [{ id: 'x', type: 'not_a_real_block' }],
                },
              ],
            },
          ],
        },
      ],
    } as unknown as ActivityDocument;
    const census = censusOfDocument(doc);
    expect(census.counts).toEqual([
      { censusKey: UNKNOWN_CENSUS_KEY, blockCount: 1 },
    ]);
  });
});

describe('census — read-bundle safety', () => {
  // The census reaches into the GRADING walk (ruling S7-5: one enumeration of
  // accepted ids, not two). That is only free because walk.ts imports its
  // siblings as `import type` — erased at build time, so blanks.ts/graphs.ts
  // and their mathjs dependency never enter the read bundle.
  //
  // The bundlers guard leaks by SIZE on purpose (a substring scan
  // false-positives on the comments these deliberately-unminified bundles
  // keep), and a mathjs leak would blow the read bundle's ceiling several
  // times over. This pins the narrower property that ceiling depends on, at
  // the source, where the fix would be obvious: flip one of these to a value
  // import and the read path starts carrying the grading engine.
  it('the grading walk imports its siblings as types only', async () => {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const walkPath = fileURLToPath(
      new URL('../src/server/grading/walk.ts', import.meta.url),
    );
    const source = await readFile(walkPath, 'utf8');
    const siblingImports = [...source.matchAll(/^import\s+(type\s+)?.*$/gm)]
      .map((m) => m[0])
      .filter((line) => line.includes("from './"));

    expect(siblingImports.length).toBeGreaterThan(0);
    const valueImports = siblingImports.filter(
      (line) => !/^import\s+type\s/.test(line),
    );
    expect(valueImports).toEqual([]);
  });
});

describe('census — item attribution', () => {
  const census = censusOfDocument(authoredFixtureDocument());
  const attributed = new Map(census.items.map((i) => [i.itemId, i.censusKey]));

  it('attributes every id the client would send in a check', () => {
    // The crossing that matters: blockIndex walks the SERVED document and
    // decides what a student submits. Anything it names must be attributable,
    // or that answer aggregates under nothing.
    const index = indexDocument(servedFixtureDocument());
    const sent: string[] = [];
    for (const section of index.sections) {
      for (const ids of Object.values(section.items)) {
        sent.push(...(ids ?? []));
      }
    }
    expect(sent.length).toBeGreaterThan(0);
    const unattributable = sent.filter((id) => !attributed.has(id));
    expect(unattributable).toEqual([]);
  });

  it('maps blank and math-gap ids to their OWNING block kind', () => {
    const fillIn = census.items.filter((i) => i.censusKey === 'fill_in_blank');
    expect(fillIn.length).toBeGreaterThan(0);
    // A blank id is not a block id: it must not collide with the census of
    // the block that contains it.
    const blockIds = new Set(
      authoredFixtureDocument().sections.flatMap((s) =>
        s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks.map((b) => b.id))),
      ),
    );
    expect(fillIn.some((i) => !blockIds.has(i.itemId))).toBe(true);
  });

  it('attributes free-text ids (recorded, never judged — still counted)', () => {
    const freeText = census.items.filter((i) =>
      ['short_answer', 'essay', 'self_explanation'].includes(i.censusKey),
    );
    expect(freeText.length).toBeGreaterThan(0);
  });

  it('emits each item id at most once', () => {
    const ids = census.items.map((i) => i.itemId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('never attributes an item to the unknown bucket in a valid document', () => {
    expect(
      census.items.filter((i) => i.censusKey === UNKNOWN_CENSUS_KEY),
    ).toEqual([]);
  });
});
