// =============================================================================
// blockTypeGuards.test.ts — add-a-block-type structural guards
// -----------------------------------------------------------------------------
// The multiple_choice block shipped without being placeable in columns and
// without dashboard indexing inside columns (fixed in 3ffb6d4) because those
// wiring points are easy to miss. These guards make the app-side halves of the
// README add-a-block-type checklist fail loudly instead:
//
//   1. EDITOR: every schema-legal column-cell block the editor can represent
//      must be accepted by the `column` node's content expression.
//   2. DASHBOARD: a block must contribute the same index entries inside a
//      column cell as at the top level (buildActivityIndex recursion).
//
// The schema-side half (ColumnCellBlock = Block minus columns) is guarded in
// packages/schema/tests/columns.test.ts. The reference-panel drawer guard
// (constrained editor registers every node its serializer emits) lives in
// ActivityConfigDrawer.test.tsx.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { getSchema } from '@tiptap/core';
import {
    ActivityDocument,
    ColumnCellBlock,
    createEmptyDocument,
    createColumnsBlock,
    createParagraphBlock,
    createHeadingBlock,
    createMathBlock,
    createImageBlock,
    createCalloutBlock,
    createProblemBlock,
    createFillInBlankBlock,
    createMultipleChoiceBlock,
    createBulletListBlock,
    createOrderedListBlock,
    createInteractiveGraphBlock,
    createBlankToken,
    type Block,
} from '@activity/schema';
import { activityToTiptap } from '../lib/serialize';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { buildActivityIndex, type ActivityIndex } from '../lib/submissions';

// Discriminator literals of a Zod discriminated union, read at runtime.
const unionTypes = (union: { options: readonly unknown[] }): string[] =>
    union.options.map(
        (opt) => (opt as { shape: { type: { value: string } } }).shape.type.value,
    );

// A representative instance per cell-legal block type. Question types carry
// enough content to actually index (an empty fill_in_blank indexes nothing,
// which would let the dashboard guard pass vacuously). A NEW block type hits
// the `default` throw — extend this map as part of the add-a-block-type
// checklist, then the two guards below cover it automatically.
function representativeBlock(type: string): ColumnCellBlock {
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
        case 'problem':
            return createProblemBlock();
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
        case 'interactive_graph':
            return createInteractiveGraphBlock();
        case 'bullet_list':
            return createBulletListBlock();
        case 'ordered_list':
            return createOrderedListBlock();
        default:
            throw new Error(
                `No representative block for type '${type}' — a new block type ` +
                    `was added to ColumnCellBlock. Extend this map (and see the ` +
                    `README add-a-block-type checklist).`,
            );
    }
}

// Wrap one block in a minimal valid document. The single section is untitled
// and not a checkpoint, so activityToTiptap emits no sectionBreak node — the
// serialized doc content is exactly the serialized block (or empty when the
// block has no editor mapping).
function docWith(...blocks: Block[]): ActivityDocument {
    const doc = createEmptyDocument({ title: 'Guard' });
    doc.sections[0]!.blocks = blocks;
    return ActivityDocument.parse(doc);
}

const cellTypes = unionTypes(ColumnCellBlock);

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
            const serialized = activityToTiptap(docWith(block));
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

describe('dashboard column-indexing guard', () => {
    // Every Map-valued index (blanks, graphs, mcs, …future response
    // categories) — compared by size so a new category is covered without
    // touching this test.
    const mapSizes = (idx: ActivityIndex): Record<string, number> =>
        Object.fromEntries(
            Object.entries(idx)
                .filter(([, v]) => v instanceof Map)
                .map(([k, v]) => [k, (v as Map<unknown, unknown>).size]),
        );

    it.each(cellTypes)(
        'block type %s contributes the same index entries in a column as at top level',
        (type) => {
            const topIdx = buildActivityIndex(docWith(representativeBlock(type)));

            const columns = createColumnsBlock(2);
            columns.columns[0]!.blocks = [representativeBlock(type)];
            const colIdx = buildActivityIndex(docWith(columns));

            expect(
                mapSizes(colIdx),
                `'${type}' indexes differently inside a column cell — ` +
                    `buildActivityIndex (lib/submissions.ts) must handle it in its ` +
                    `columns recursion`,
            ).toEqual(mapSizes(topIdx));
        },
    );

    it('the guard is not vacuous: question types actually index', () => {
        for (const type of ['fill_in_blank', 'interactive_graph', 'multiple_choice']) {
            const sizes = mapSizes(buildActivityIndex(docWith(representativeBlock(type))));
            const total = Object.values(sizes).reduce((a, b) => a + b, 0);
            expect(total, `${type} indexed nothing — enrich representativeBlock`).toBeGreaterThan(0);
        }
    });
});
