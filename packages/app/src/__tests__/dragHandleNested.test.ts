import { describe, it, expect } from 'vitest';
import {
    columnsDragDeduction,
    columnsNestedDragOptions,
} from '../editor/dragHandleNested';

// The nested drag-handle rule must add exactly one behaviour — drilling into
// column cells — while keeping the inner handle reachable and leaving every
// other structure resolving to its top-level block. These tests pin the pure
// scoring core that drives that. Signature:
//   columnsDragDeduction(nodeTypeName, depth, insideColumn)
//   0 = eligible candidate, 1000 = excluded.
describe('columnsDragDeduction', () => {
    it('never deducts for ordinary top-level blocks (depth <= 1)', () => {
        // A top-level paragraph, cursor not inside any column.
        expect(columnsDragDeduction('paragraph', 1, false)).toBe(0);
        // Defensive: the doc root itself (depth 0).
        expect(columnsDragDeduction('doc', 0, false)).toBe(0);
    });

    it('allows a deep block when the cursor is inside a column cell', () => {
        // paragraph inside a column inside a columns block — the inner block we
        // want to be able to drag between cells.
        expect(columnsDragDeduction('paragraph', 3, true)).toBe(0);
        // An inner image atom one level deeper still counts.
        expect(columnsDragDeduction('image', 4, true)).toBe(0);
    });

    it('excludes a deep block when the cursor is NOT inside a column', () => {
        // paragraph inside a listItem inside a bulletList — must NOT become a
        // drag target, so the whole list stays the top-level drag unit.
        expect(columnsDragDeduction('paragraph', 3, false)).toBe(1000);
        // The listItem wrapper itself, likewise excluded.
        expect(columnsDragDeduction('listItem', 2, false)).toBe(1000);
    });

    it('never drags a bare column cell, even with a column ancestor', () => {
        // The `column` node sits inside `columns`; we never want to grab the
        // bare cell regardless of where the cursor resolved.
        expect(columnsDragDeduction('column', 2, true)).toBe(1000);
        expect(columnsDragDeduction('column', 2, false)).toBe(1000);
    });

    it('never grabs the columns container via the hover handle (grip owns it)', () => {
        // Whole-block moves are owned by the dedicated grip widget, so the
        // container is never a hover-handle target — excluded both outside a
        // cell (no redundant rival to the grip) and inside one (so reaching for
        // an inner block's handle can't flip up to the container).
        expect(columnsDragDeduction('row', 1, false)).toBe(1000);
        expect(columnsDragDeduction('row', 1, true)).toBe(1000);
    });
});

describe('columnsNestedDragOptions', () => {
    it('runs nested mode with default rules off and a single custom rule', () => {
        expect(columnsNestedDragOptions.defaultRules).toBe(false);
        expect(columnsNestedDragOptions.rules).toHaveLength(1);
        expect(columnsNestedDragOptions.rules?.[0]?.id).toBe('columnsOnlyDrill');
    });

    it('disables edge detection (its near-left parent-grab zone re-introduces the flip)', () => {
        expect(columnsNestedDragOptions.edgeDetection).toBe('none');
    });
});
