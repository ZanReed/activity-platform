// @vitest-environment jsdom
// =============================================================================
// blankUnitAttrs.test.ts — the EDITOR declares the unit attrs (A8 guard)
// -----------------------------------------------------------------------------
// Tiptap silently drops undeclared node attrs on mount, so a unit-bearing
// blank that imports correctly would lose its unit the first time the
// activity is opened and saved in the editor — the repo's orphaned-field
// defect class, and the exact failure the outside-voice review of the
// unit-blanks design named (A8). The pure serialize round-trip cannot catch
// it (it never touches the Tiptap schema); only a REAL headless editor can.
// Mutation: remove `unit`/`acceptableUnits` from Blank.ts addAttributes and
// this goes red while every serializer test stays green.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import {
    ActivityDocument,
    createEmptyDocument,
    type Block,
} from '@activity/schema';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { activityToTiptap } from '../lib/serialize';

function docWith(block: Block): ActivityDocument {
    const doc = createEmptyDocument({ title: 'Unit guard' });
    doc.sections[0]!.rows = [
        {
            id: crypto.randomUUID(),
            gridLines: 'inherit',
            columns: [{ id: crypto.randomUUID(), blocks: [block] }],
        },
    ];
    return ActivityDocument.parse(doc);
}

describe('unit attrs survive a real editor mount', () => {
    it('a mounted unit-bearing blank keeps unit + acceptableUnits', () => {
        const blankId = crypto.randomUUID();
        const block = {
            id: crypto.randomUUID(),
            type: 'fill_in_blank',
            content: [
                { type: 'text', text: 'The speed is ', marks: [] },
                {
                    type: 'blank',
                    id: blankId,
                    answer: '1.5',
                    acceptableAnswers: [],
                    answerType: 'numeric',
                    tolerance: 0.1,
                    unit: 'km/h',
                    acceptableUnits: ['kph'],
                    interchangeableWithPrevious: false,
                },
            ],
            skills: [],
        } as unknown as Block;

        const editor = new Editor({
            element: document.createElement('div'),
            extensions: buildEditorExtensions(),
            content: activityToTiptap(docWith(block)),
        });

        let attrs: Record<string, unknown> | null = null;
        editor.state.doc.descendants((node) => {
            if (node.type.name === 'blank') attrs = node.attrs;
            return true;
        });
        expect(attrs).not.toBeNull();
        expect(attrs!.unit).toBe('km/h');
        expect(attrs!.acceptableUnits).toEqual(['kph']);
        expect(attrs!.tolerance).toBe(0.1);
        editor.destroy();
    });
});
