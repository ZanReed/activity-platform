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
import { getSchema } from '@tiptap/core';
import { Block, isPageNumberedType } from '@activity/schema';
import { PM_NAME_TO_SCHEMA_TYPE } from '../editor/problemNumbering';
import { buildEditorExtensions } from '../editor/editorExtensions';

const schemaTypes = Block.options.map((option) => option.shape.type.value);

/** Every schema type that draws a number in at least one of its forms. The
 *  gradable extreme is the right probe: `when_gradable` types number there. */
const numberedTypes = schemaTypes.filter((type) =>
    isPageNumberedType(type, 'plot_point', true),
);

// `problem` is page-numbered in the schema but has NO editor mapping at all
// (serialize drops it; see its tombstone), so it can never appear in a
// ProseMirror document and needs no bridge entry. It never will.
const PERMANENTLY_NO_EDITOR_FORM = new Set(['problem']);

// A numbered type the editor cannot yet REPRESENT is unreachable for the same
// reason — but during a multi-slice build that is a TEMPORARY state, and a
// hand-listed exemption that outlived it would be exactly the silent
// mis-numbering this file exists to prevent. So the exemption is DERIVED from
// the editor's own ProseMirror schema instead of listed: the moment a slice
// adds the node, the exemption evaporates on its own and the guard below starts
// demanding the bridge entry. The roster test underneath keeps the temporary
// state visible rather than quiet.
const editorSchema = getSchema(buildEditorExtensions());
const pmNameFor = (schemaType: string) =>
    schemaType.replace(/_([a-z])/g, (_full, c: string) => c.toUpperCase());
const hasEditorNode = (schemaType: string) =>
    editorSchema.nodes[pmNameFor(schemaType)] !== undefined;

describe('the editor numbering bridge ↔ the schema numbering rule', () => {
    it('every numbered schema type has a bridge entry', () => {
        const mapped = new Set(Object.values(PM_NAME_TO_SCHEMA_TYPE));
        for (const type of numberedTypes) {
            if (PERMANENTLY_NO_EDITOR_FORM.has(type)) continue;
            if (!hasEditorNode(type)) continue;
            expect(
                mapped.has(type),
                `${type} is page-numbered but problemNumbering.ts cannot see it — ` +
                    'the editor would skip it and mis-number every question after it',
            ).toBe(true);
        }
    });

    it('only the types we KNOW have no editor form are exempt', () => {
        // The exemption above is derived, which makes it self-healing but also
        // silent. This is the loud half: it names exactly which numbered types
        // the editor cannot represent today, so a surprise exemption (someone
        // renamed a node) fails here, and a temporary one (a block mid-build)
        // has to be acknowledged when it ends.
        //
        //   problem — permanent; no editor mapping, ever.
        //   (table was here through Slice 1 and lifted itself when the editor
        //    slice added the node — which is what the derivation above is for.)
        const exempt = numberedTypes
            .filter((type) => !hasEditorNode(type))
            .sort();
        expect(exempt).toEqual(['problem']);
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
