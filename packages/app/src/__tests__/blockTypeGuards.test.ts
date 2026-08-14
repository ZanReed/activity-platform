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

import { describe, it, expect } from 'vitest';
import { getSchema } from '@tiptap/core';
import {
    ActivityDocument,
    createEmptyDocument,
    createParagraphBlock,
    createHeadingBlock,
    createMathBlock,
    createImageBlock,
    createCalloutBlock,
    createProblemBlock,
    createFillInBlankBlock,
    createMultipleChoiceBlock,
    createMatchingBlock,
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
    createSelfExplanationBlock,
    createShortAnswerBlock,
    createEssayBlock,
    createBlankToken,
    Block,
} from '@activity/schema';
import { activityToTiptap } from '../lib/serialize';
import { toBare } from '../lib/serializeTestBridge';
import { buildEditorExtensions } from '../editor/editorExtensions';

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
        case 'matching':
            return createMatchingBlock();
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
        case 'essay': {
            const block = createEssayBlock();
            block.prompt = [{ type: 'text', text: 'Write an essay.', marks: [] }];
            block.wordCountHint = { min: 200, max: 300 };
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
