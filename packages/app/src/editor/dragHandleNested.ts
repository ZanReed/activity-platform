import type { NestedOptions } from '@tiptap/extension-drag-handle';

// =============================================================================
// Nested drag-handle config — drill into column cells and keep the inner handle
// reachable. (The whole columns block is moved via a dedicated grip widget, not
// this hover handle — see the grip plugin in extensions/Columns.ts.)
// -----------------------------------------------------------------------------
// The drag handle defaults to top-level blocks: hovering anything inside a
// `columns` block grabs the *whole* columns block, so an author can't pull a
// single block from one cell into another. Enabling Tiptap's `nested` mode lets
// the handle target deeper nodes — but globally it would also change drag
// behaviour for lists, fill-in-blanks, etc. So we run nested mode with the
// built-in default rules OFF and a single custom rule.
//
// The hard part is not *reaching* an inner block — hovering its text already
// resolves to the inner block — it is reaching the handle without the target
// flipping to the container. The handle floats in the gutter to the LEFT of the
// block it targets. To click it the cursor must leave the block's text and
// cross the cell's left padding (for cell 1) or the inter-column gap (for cell
// 2+). Those bands resolve to a *column-boundary* position (depth 2): the only
// candidates there are the bare cell (which we never drag) and the columns
// container — so the handle would flip up to the container exactly as the author
// reaches for it. (This was the reported bug.)
//
// The fix exploits a property of the drag-handle plugin: when its hover scan
// finds NO eligible target it returns early and KEEPS the node it had locked
// (it does not clear or flip the handle). So the rule is written to produce
// *no candidate* in those padding/gap bands rather than the container:
//
//   • a bare `column` cell is never a drag target;
//   • the `columns` container is NEVER a hover-handle target — whole-block moves
//     are owned by the always-present grip widget (extensions/Columns.ts), so a
//     second hover affordance on the container would just be a redundant,
//     flicker-prone rival to the grip. Excluding it everywhere also means the
//     padding/gap bands yield no candidate and the plugin keeps the inner block
//     the author was already on. (The grip makes a geometric rail unnecessary —
//     the rail padding that an earlier version added has been removed from
//     editor.css so it can't reappear in grid-lines mode as divider stubs.);
//   • a deeper block is eligible ONLY when the resolved position is inside a
//     `column` cell — so inside a columns block the handle reaches the inner
//     blocks, while every other nested structure (lists, etc.) still resolves to
//     its top-level block.
//
// Net effect: hover an inner block → its handle appears; slide left to the
// handle → it stays on that inner block (the gap/padding produce no rival
// candidate); the whole columns block is moved via its grip widget instead.
// Edge detection stays OFF (`edgeDetection: 'none'`): its near-left "grab the
// parent" zone bleeds ~12px into the cell body and re-introduces the very flip
// this rule removes.
// =============================================================================

// Pure core of the rule, split out for unit testing without a live ProseMirror
// document. `nodeTypeName` is the candidate node's type; `depth` is its depth
// (0 = doc root, 1 = top-level block); `insideColumn` is whether the *resolved
// cursor position* sits inside a `column` cell (a property of the position, the
// same for every candidate at that position). Returns a drag-handle score
// deduction: 0 = fully eligible, ≥ 1000 = excluded.
export function columnsDragDeduction(
    nodeTypeName: string,
    depth: number,
    insideColumn: boolean,
): number {
    // Never drag a bare column cell.
    if (nodeTypeName === 'column') return 1000;
    // The columns container is NEVER a hover-handle target: inside a cell so
    // reaching for an inner block's handle can't flip up to it, and outside the
    // cells too, because the whole-block move is owned by the dedicated grip
    // widget (extensions/Columns.ts) — a second hover affordance on the
    // container would just be a redundant, flicker-prone rival to the grip.
    if (nodeTypeName === 'row') return 1000;
    // Any other top-level block stays draggable as a whole block.
    if (depth <= 1) return 0;
    // A deeper block is a drag target only inside a column cell (the inner
    // blocks); every other nested structure resolves to its top-level block.
    return insideColumn ? 0 : 1000;
}

export const columnsNestedDragOptions: NestedOptions = {
    // Built-in list/table rules off — we only want the column behaviour; every
    // non-column nested structure should keep resolving to its top-level block
    // exactly as it did before nested mode.
    defaultRules: false,
    edgeDetection: 'none',
    rules: [
        {
            id: 'columnsOnlyDrill',
            evaluate: ({ node, depth, $pos }) => {
                // insideColumn is a property of the resolved position: does its
                // ancestor chain pass through a `column` cell? Same answer for
                // every candidate enumerated at this position.
                let insideColumn = false;
                for (let d = 1; d <= $pos.depth; d++) {
                    if ($pos.node(d).type.name === 'column') {
                        insideColumn = true;
                        break;
                    }
                }
                return columnsDragDeduction(
                    node.type.name,
                    depth,
                    insideColumn,
                );
            },
        },
    ],
};
