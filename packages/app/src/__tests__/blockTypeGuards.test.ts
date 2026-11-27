// =============================================================================
// blockTypeGuards.test.ts — add-a-block-type structural guards
// -----------------------------------------------------------------------------
// The multiple_choice block shipped without being placeable in columns (fixed
// in 3ffb6d4) because the wiring point is easy to miss. This guard makes the
// app-side half of the README add-a-block-type checklist fail loudly instead:
//
//   EDITOR: every schema-legal column-cell block the editor can represent
//   must be accepted by the `column` node's content expression.
//
// A second guard used to live here — DASHBOARD: buildActivityIndex indexes a
// block identically inside a column and at top level. It died with its
// subject at S9 Drop 3: the Submissions dashboard + lib/submissions.ts were
// the Phase 2.6 manual-grading surface, RETIRED whole (OV-5; the parked
// teacher-grading slice owns any successor index, and the viewer's per-block
// conformance factory is the surviving per-type structural gate).
//
// The schema-side half (ColumnCellBlock = Block minus columns) is guarded in
// packages/schema/tests/columns.test.ts. The reference-panel drawer guard
// (constrained editor registers every node its serializer emits) lives in
// ActivityConfigDrawer.test.tsx.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { getSchema, type JSONContent } from '@tiptap/core';
import {
    ActivityDocument,
    createEmptyDocument,
    createParagraphBlock,
    createHeadingBlock,
    createMathBlock,
    createImageBlock,
    createCalloutBlock,
    createFillInBlankBlock,
    createMultipleChoiceBlock,
    createMatchingBlock,
    createCorrespondenceBlock,
    createOrderingBlock,
    createBulletListBlock,
    createOrderedListBlock,
    createInteractiveGraphBlock,
    createNumberLineBlock,
    createDataPlotBlock,
    createLearningObjectivesBlock,
    createWorkedExampleBlock,
    createFadedWorkedExampleBlock,
    createGraphFigureBlock,
    createChartBlock,
    createVideoBlock,
    createSelfExplanationBlock,
    createShortAnswerBlock,
    createPhotoResponseBlock,
    createEssayBlock,
    createBlankToken,
    createTableBlock,
    Block,
} from '@activity/schema';
import { activityToTiptap, tiptapBlockToActivity } from '../lib/serialize';
import { indexDocument } from '@activity/viewer';
import {
    authoredFixtureDocument,
    blockRegistry,
    sanitizedFixtureDocument,
} from '@activity/viewer/fixtures';
import { ANSWER_FAMILIES, indexDoc } from '../lib/answerText';
import { GRADED_BLOCKS, REFUSED_BLOCKS, blockCensus } from '../lib/bankImport';
import { sanitizeActivityDocument } from '@activity/viewer';
import { toBare } from '../lib/serializeTestBridge';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { blockControlsRegistry } from '../editor/blockControls';

// Discriminator literals of a Zod discriminated union, read at runtime.
const unionTypes = (union: { options: readonly unknown[] }): string[] =>
    union.options.map(
        (opt) => (opt as { shape: { type: { value: string } } }).shape.type.value,
    );

// A representative instance per cell-legal block type. Question types carry
// real content (kept from the dashboard-guard era — representative beats
// hollow). A NEW block type hits the `default` throw — extend this map as
// part of the add-a-block-type checklist, then the guard below covers it
// automatically.
function representativeBlock(type: string): Block {
    switch (type) {
        case 'paragraph':
            return createParagraphBlock();
        case 'heading':
            return createHeadingBlock();
        case 'math_block':
            return createMathBlock('x^2');
        case 'image':
            return createImageBlock('https://example.com/x.png', 'an image');
        case 'callout':
            return createCalloutBlock();
        case 'fill_in_blank': {
            const block = createFillInBlankBlock();
            block.content = [
                { type: 'text', text: 'x = ', marks: [] },
                createBlankToken('4'),
            ];
            return block;
        }
        case 'multiple_choice':
            return createMultipleChoiceBlock();
        case 'matching':
            return createMatchingBlock();
        case 'correspondence':
            return createCorrespondenceBlock();
        case 'ordering':
            return createOrderingBlock();
        case 'interactive_graph':
            return createInteractiveGraphBlock();
        case 'number_line':
            return createNumberLineBlock();
        case 'data_plot':
            return createDataPlotBlock();
        case 'bullet_list':
            return createBulletListBlock();
        case 'ordered_list':
            return createOrderedListBlock();
        case 'learning_objectives': {
            const block = createLearningObjectivesBlock();
            block.items = [[{ type: 'text', text: 'Solve linear equations', marks: [] }]];
            return block;
        }
        case 'worked_example': {
            const block = createWorkedExampleBlock();
            block.content = [
                {
                    id: crypto.randomUUID(),
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Step 1: isolate x', marks: [] }],
                },
            ];
            return block;
        }
        case 'faded_worked_example': {
            // A shown step + a faded (fill_in_blank) step carrying a real blank,
            // so the dashboard indexing guard is non-vacuous (the nested blank
            // must index the same at top level and inside a column).
            const block = createFadedWorkedExampleBlock();
            const faded = createFillInBlankBlock();
            faded.content = [
                { type: 'text', text: 'x = ', marks: [] },
                createBlankToken('4'),
            ];
            block.content = [
                {
                    id: crypto.randomUUID(),
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Step 1: isolate x', marks: [] }],
                },
                faded,
            ];
            return block;
        }
        case 'graph_figure': {
            // A static figure with one drawable (content block — contributes
            // nothing to the dashboard index, same as worked_example).
            const block = createGraphFigureBlock();
            block.drawables = [{ kind: 'point', at: [1, 2] }];
            return block;
        }
        case 'chart':
            return createChartBlock();
        case 'video':
            return createVideoBlock();
        case 'self_explanation': {
            const block = createSelfExplanationBlock();
            block.prompt = [
                { type: 'text', text: 'Explain your reasoning.', marks: [] },
            ];
            return block;
        }
        case 'short_answer': {
            const block = createShortAnswerBlock();
            block.prompt = [{ type: 'text', text: 'Answer briefly.', marks: [] }];
            return block;
        }
        case 'photo_response': {
            // maxPhotos 2: the guard proves the editor holds the field, not
            // just the default.
            const block = createPhotoResponseBlock();
            block.prompt = [{ type: 'text', text: 'Photograph your working.', marks: [] }];
            block.maxPhotos = 2;
            return block;
        }
        case 'essay': {
            const block = createEssayBlock();
            block.prompt = [{ type: 'text', text: 'Write an essay.', marks: [] }];
            block.wordCountHint = { min: 200, max: 300 };
            return block;
        }
        case 'table': {
            // A blank-bearing table: the guard's job is to prove the editor can
            // HOLD what the schema allows, so a hollow one would be vacuous.
            // Serializes to null for now (see serialize.ts's `case 'table'`),
            // which this guard reads as "no editor mapping" and skips — the
            // same path callout and problem take.
            const block = createTableBlock();
            const [first] = block.rows;
            if (first?.cells[1]) {
                first.cells[1].content = [createBlankToken('9.00')];
            }
            return block;
        }
        default:
            throw new Error(
                `No representative block for type '${type}' — a new block type ` +
                    `was added to the Block union. Extend this map (and see the ` +
                    `README add-a-block-type checklist).`,
            );
    }
}

// Wrap one block in a minimal valid document. The single section is untitled
// and not a checkpoint, so activityToTiptap emits no sectionBreak node — just
// one `row > column` holding the block (strict grid). The guard below reads the
// block back out via toBare (a 1-col row unwraps to its blocks).
function docWith(...blocks: Block[]): ActivityDocument {
    const doc = createEmptyDocument({ title: 'Guard' });
    // Single-column content lives in one full-width 1-col row (the schema's
    // rows-of-columns shape) — which is exactly what the editor emits now.
    doc.sections[0]!.rows = [
        { id: crypto.randomUUID(), gridLines: 'inherit', columns: [{ id: crypto.randomUUID(), blocks }] },
    ];
    return ActivityDocument.parse(doc);
}

// Every leaf Block is column-legal now (the old ColumnCellBlock "Block minus
// columns" carve-out is gone — layout is not a block).
const cellTypes = unionTypes(Block);

describe('editor column-cell guard', () => {
    const pmSchema = getSchema(buildEditorExtensions());
    const columnNode = pmSchema.nodes.column;

    it('the column node exists', () => {
        expect(columnNode).toBeDefined();
    });

    it.each(cellTypes)(
        'cell-legal block type %s is insertable in a column cell (when editor-mappable)',
        (type) => {
            const block = representativeBlock(type);
            // toBare unwraps the 1-col stack row back to its blocks, so nodes[0]
            // is the serialized block node the column must accept.
            const serialized = toBare(activityToTiptap(docWith(block)));
            const nodes = serialized.content ?? [];

            if (nodes.length === 0) {
                // No editor mapping (callout/problem serialize to null today —
                // documented in serialize.ts). Nothing to guard in the editor.
                return;
            }
            const nodeName = nodes[0]!.type!;
            const nodeType = pmSchema.nodes[nodeName];
            expect(
                nodeType,
                `serializer emitted unknown node '${nodeName}' for ${type}`,
            ).toBeDefined();
            expect(
                columnNode!.contentMatch.matchType(nodeType!),
                `The editor's column cell rejects '${nodeName}' (${type}) — add it ` +
                    `to the Column node's content expression in extensions/Columns.ts`,
            ).not.toBeNull();
        },
    );
});

// (The dashboard column-indexing guard that stood here died with
// buildActivityIndex at S9 Drop 3 — see the header.)

// =============================================================================
// The app half of the add-a-block-type touch list (review 2026-11-26, C2).
// Each roster below is cross-checked against one the compiler already keys by
// BlockType — the viewer's `blockRegistry` — or against the real ProseMirror
// schema, so neither side can grow a type the other does not know (policy P4).
// =============================================================================

describe('editor → document: every insertable node has a case (C2)', () => {
    const pmSchema = getSchema(buildEditorExtensions());
    const column = pmSchema.nodes.column!;
    // Every node a column cell accepts is a block a teacher can place. A node
    // with no case in tiptapBlockToActivity hits its `default:` — a warning and
    // `null`, so the block vanishes on the next save.
    const insertable = Object.values(pmSchema.nodes).filter(
        (type) => column.contentMatch.matchType(type) !== null,
    );

    it('the column accepts some nodes (the roster is not empty)', () => {
        expect(insertable.length).toBeGreaterThan(10);
    });

    it.each(insertable.map((t) => [t.name, t] as const))(
        '%s is read back by tiptapBlockToActivity',
        (_name, type) => {
            const node = (type.createAndFill() ?? type.create()).toJSON();
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                tiptapBlockToActivity(node);
                const unsupported = warn.mock.calls.filter((c) =>
                    String(c[0]).includes('Skipping unsupported Tiptap block'),
                );
                expect(
                    unsupported,
                    `'${type.name}' has no case in serialize.ts tiptapBlockToActivityRaw — it would vanish on save`,
                ).toEqual([]);
            } finally {
                warn.mockRestore();
            }
        },
    );
});

describe("answerText's index agrees with the viewer's (C2)", () => {
    // The teacher's answer views (answerText.ts BLOCK_FAMILY) and the student's
    // check payload (viewer container/blockIndex.ts) must file every item under
    // the same family, or a teacher sees an answer the student never sent.
    // Bound to output: both indexers over the viewer's fixture document, which
    // holds one instance of every registered block type and variant.
    const authored = authoredFixtureDocument();
    const viewerIndex = indexDocument(sanitizedFixtureDocument());
    const appIndex = indexDoc(authored);

    const viewerFamilies = (sectionId: string): Record<string, string[]> => {
        // Every key the viewer files items under, not only the app's families,
        // so a new viewer category the app has never heard of is seen here.
        // (`dolForm` is the DoL's form number, not a list of items.)
        const items = viewerIndex.bySection[sectionId]!.items as Record<string, unknown>;
        const out: Record<string, string[]> = {};
        for (const [family, ids] of Object.entries(items)) {
            if (family === 'dolForm') continue;
            if (Array.isArray(ids) && ids.length > 0) out[family] = [...(ids as string[])];
        }
        return out;
    };
    const appFamilies = (sectionId: string): Record<string, string[]> => {
        const out: Record<string, string[]> = {};
        for (const item of appIndex.bySection[sectionId] ?? []) {
            (out[item.family] ??= []).push(item.itemId);
        }
        // Unsorted on purpose: both walk in document order, and the app's
        // "blank 2 of 3" labels depend on that order.
        return out;
    };

    it('the fixture exercises every family the viewer indexes', () => {
        const seen = new Set(authored.sections.flatMap((s) => Object.keys(viewerFamilies(s.id))));
        expect([...seen].sort()).toEqual([...ANSWER_FAMILIES].sort());
    });

    it.each(authored.sections.map((s, i) => [i, s.id] as const))(
        'section %i: same items under the same families',
        (_i, sectionId) => {
            expect(appFamilies(sectionId)).toEqual(viewerFamilies(sectionId));
        },
    );
});

describe("the bank importer's block lists cover every block type (C2)", () => {
    // bankImport.ts admits a bank item only if it holds at least one scored
    // response and nothing it cannot score or that teaches (PB-9, DM-19).
    // Derived from the viewer registry's `family` (compile-keyed by BlockType):
    //   recorded       → refused (the grader records it, never marks it);
    //   auto_gradable  → counted by GRADED_BLOCKS, or its answers are in-band
    //                    blanks / maths gaps (sanitize.inlineBlankSecrets), or
    //                    refused as teaching;
    //   static         → never counted as graded.
    const entries = Object.values(blockRegistry) as {
        type: string;
        family: string;
        sanitize: { inlineBlankSecrets?: boolean };
    }[];

    it('the registry covers the schema union', () => {
        expect(entries.map((e) => e.type).sort()).toEqual([...cellTypes].sort());
    });

    it.each(entries.map((e) => [e.type, e] as const))('%s is classified', (type, entry) => {
        const refused = type in REFUSED_BLOCKS;
        const graded = GRADED_BLOCKS.has(type);
        expect(refused && graded, `${type} is both refused and graded`).toBe(false);
        if (entry.family === 'recorded') {
            expect(refused, `${type} is recorded, not scored: add it to REFUSED_BLOCKS`).toBe(true);
        } else if (entry.family === 'auto_gradable') {
            expect(
                graded || refused || entry.sanitize.inlineBlankSecrets === true,
                `${type} is scored but bankImport never counts it: add it to GRADED_BLOCKS (or REFUSED_BLOCKS)`,
            ).toBe(true);
        } else {
            expect(graded, `${type} is static but GRADED_BLOCKS counts it`).toBe(false);
        }
    });

    // Bound to output: for each top-level fixture block, the number of scored
    // responses bankImport counts must equal the number of scored items the
    // viewer's index files for it (everything but recorded free text and
    // photos). Catches a counting rule that drifts, e.g. maths gaps or a new
    // scored block whose answers the census never sees.
    const SCORED_FAMILIES_EXCLUDED = new Set(['freeText', 'photos', 'dolForm']);
    const fixtureBlocks = authoredFixtureDocument().sections.flatMap((s) =>
        s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)),
    );
    it.each(fixtureBlocks.map((b) => [`${b.type} (${b.id.slice(-4)})`, b] as const))(
        '%s: bankImport counts what the viewer would score',
        (_name, block) => {
            const doc = docWith(block);
            const items = indexDocument(sanitizeActivityDocument(doc)).sections[0]!.items as Record<string, unknown>;
            const scored = Object.entries(items)
                .filter(([family]) => !SCORED_FAMILIES_EXCLUDED.has(family))
                .reduce((n, [, ids]) => n + (Array.isArray(ids) ? ids.length : 0), 0);
            expect(blockCensus(doc).graded).toBe(scored);
        },
    );

    it('every listed name is a real block type', () => {
        const real = new Set(cellTypes);
        const bogus = [...Object.keys(REFUSED_BLOCKS), ...GRADED_BLOCKS].filter((t) => !real.has(t));
        expect(bogus).toEqual([]);
    });
});

describe('every insertable node has a command bar (C2)', () => {
    // BlockCommandBarHost shows the bar (universal actions + ⚙ settings) only
    // for a node with a blockControlsRegistry entry; a node without one cannot
    // be moved, duplicated or deleted from the bar. Five had none until the
    // author ruled 2026-11-27 (lists, callout, chart, video). A NEW insertable
    // node must get an entry: the roster is read from the editor's schema.
    const pmSchema = getSchema(buildEditorExtensions());
    const column = pmSchema.nodes.column!;
    const insertable = Object.values(pmSchema.nodes)
        .filter((type) => column.contentMatch.matchType(type) !== null)
        .map((type) => type.name);

    it('the schema offers the blocks this guard is about', () => {
        // Liveness: an empty or mis-derived roster would pass the next row.
        expect(insertable).toEqual(
            expect.arrayContaining(['paragraph', 'bulletList', 'orderedList', 'callout', 'chart', 'video']),
        );
    });

    it('no insertable node is without a bar', () => {
        expect(insertable.filter((n) => !(n in blockControlsRegistry)).sort()).toEqual([]);
    });
});

describe('containers keep every child their editor node accepts (C2)', () => {
    // A worked example's children are filtered on the way back
    // (serialize.ts WORKED_EXAMPLE_CHILD_TYPES): a child the node accepts but
    // the filter does not list is dropped on save with no warning. For each
    // container node, build it around every child type its content expression
    // accepts — real fixture children, not empty defaults — and read it back.
    const pmSchema = getSchema(buildEditorExtensions());
    const byNode = new Map<string, { node: JSONContent; type: string }>();
    for (const section of authoredFixtureDocument().sections) {
        for (const row of section.rows) {
            for (const column of row.columns) {
                for (const block of column.blocks) {
                    const node = toBare(activityToTiptap(docWith(block))).content?.[0];
                    if (node?.type && !byNode.has(node.type)) byNode.set(node.type, { node, type: block.type });
                }
            }
        }
    }
    const containers = ['workedExample', 'fadedWorkedExample'];

    it.each(containers)('%s is in the fixture', (name) => {
        expect(byNode.has(name)).toBe(true);
    });

    const cases = containers.flatMap((container) =>
        Object.values(pmSchema.nodes)
            .filter((t) => pmSchema.nodes[container]!.contentMatch.matchType(t) !== null)
            .map((child) => [container, child.name] as const),
    );
    it('the containers accept some children (not vacuous)', () => {
        expect(cases.length).toBeGreaterThan(4);
    });
    it.each(cases)('%s keeps a %s child', (container, childName) => {
        const outer = byNode.get(container)!.node;
        const child = byNode.get(childName);
        expect(child, `no fixture block serializes to '${childName}'`).toBeDefined();
        const back = tiptapBlockToActivity({ ...outer, content: [child!.node] }) as
            | (Block & { content?: Block[] })
            | null;
        expect((back?.content ?? []).map((b) => b.type)).toEqual([child!.type]);
    });
});
