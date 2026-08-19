// =============================================================================
// problemNumbering.test.ts — the editor's numbering walk agrees with the schema
// -----------------------------------------------------------------------------
// problemNumbering.ts has always CLAIMED a parity test ("a parity test guards
// that the two never drift"). There wasn't one. The answer-key slice then made
// short_answer and essay page-numbered (ruling E7) and the editor's bridge map
// did not know — which does not merely omit a number, it shifts every number
// AFTER one of those blocks down by one, so the editor and the printed sheet
// disagree about which question is question 4.
//
// This file is that claim made real (policy P11). It binds the editor's
// name-spelling bridge to the schema's membership rule in both directions, so
// the next block type that becomes numbered cannot land on one side only.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { Block, isPageNumberedType } from '@activity/schema';
import { PM_NAME_TO_SCHEMA_TYPE } from '../editor/problemNumbering';

const schemaTypes = Block.options.map((option) => option.shape.type.value);

/** Every schema type that draws a number in at least one of its forms. The
 *  gradable extreme is the right probe: `when_gradable` types number there. */
const numberedTypes = schemaTypes.filter((type) =>
    isPageNumberedType(type, 'plot_point', true),
);

// `problem` is page-numbered in the schema but has NO editor mapping at all
// (serialize drops it; see its tombstone), so it can never appear in a
// ProseMirror document and needs no bridge entry.
const NO_EDITOR_FORM = new Set(['problem']);

describe('the editor numbering bridge ↔ the schema numbering rule', () => {
    it('every numbered schema type has a bridge entry', () => {
        const mapped = new Set(Object.values(PM_NAME_TO_SCHEMA_TYPE));
        for (const type of numberedTypes) {
            if (NO_EDITOR_FORM.has(type)) continue;
            expect(
                mapped.has(type),
                `${type} is page-numbered but problemNumbering.ts cannot see it — ` +
                    'the editor would skip it and mis-number every question after it',
            ).toBe(true);
        }
    });

    it('the bridge names no type the schema does not have', () => {
        for (const type of Object.values(PM_NAME_TO_SCHEMA_TYPE)) {
            expect(schemaTypes, `${type} is not a schema block type`).toContain(type);
        }
    });

    it('is non-vacuous — the numbered set is a real, plural set', () => {
        expect(numberedTypes.length).toBeGreaterThan(5);
        // And the two the answer-key slice added are in it, by name: if E7 is
        // ever reversed, this test is one of the places that must be argued
        // with rather than quietly updated.
        expect(numberedTypes).toContain('short_answer');
        expect(numberedTypes).toContain('essay');
    });
});
