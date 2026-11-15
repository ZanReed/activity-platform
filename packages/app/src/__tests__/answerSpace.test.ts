// @vitest-environment jsdom
// answerSpace.test.ts — "Answer space (lines)" on short answer and essay
// (schema-shortlist.md S2). The print half is the print lane's
// structure/answer-box-space rows; this is the drawer and the save.
import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import { ActivityMeta } from '@activity/schema';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { controlsFor } from '../editor/blockControls';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';

const META = ActivityMeta.parse({ title: 'T', course: 'Y7' });

describe.each([
    ['shortAnswer', 'short_answer'],
    ['essay', 'essay'],
])('%s', (node, type) => {
    it('the drawer sets the box in lines, saves rem, and an empty field saves nothing', () => {
        const editor = new Editor({
            extensions: buildEditorExtensions(),
            content: { type: 'doc', content: [{ type: 'row', content: [{ type: 'column', content: [{ type: node, content: [{ type: 'text', text: 'Why?' }] }] }] }] },
        });
        let pos = -1;
        editor.state.doc.descendants((n, p) => {
            if (n.type.name === node) pos = p;
        });
        const field = controlsFor(node)!.advanced!.flatMap((g) => g.fields).find((f) => f.label === 'Answer space (lines)');
        if (!field || field.kind !== 'number') throw new Error('no Answer space field');
        field.set(editor, pos, 4);
        const saved = tiptapToActivity(editor.getJSON(), META);
        const block = JSON.parse(JSON.stringify(saved)).sections[0].rows[0].columns[0].blocks[0];
        expect(block.type).toBe(type);
        expect(block.workSpace).toBeGreaterThan(0);
        expect(field.get(editor.state.doc.nodeAt(pos)!)).toBe(4);
        // And back: the value survives a reload of the saved document.
        expect(JSON.stringify(tiptapToActivity(activityToTiptap(saved), META))).toContain(`"workSpace":${block.workSpace}`);
        field.set(editor, pos, null);
        const cleared = JSON.parse(JSON.stringify(tiptapToActivity(editor.getJSON(), META)));
        expect(cleared.sections[0].rows[0].columns[0].blocks[0]).not.toHaveProperty('workSpace');
        editor.destroy();
    });
});
