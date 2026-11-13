// @vitest-environment jsdom
// =============================================================================
// imagePasteDrop.test.ts — E-1 (ui-review-group-e.md) paste/drop, against the
// REAL editor schema. The cases are the ones the Fable review measured against
// the first version: a selected neighbour replaced, a question block split into
// two with one id, an Office paste taken over.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { createEmptyDocument, type Block } from '@activity/schema';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { activityToTiptap } from '../lib/serialize';
import { imageFilesIn, imageInsertPos, isLoneImageHtml, pastedImageFiles, placeImages } from '../editor/imagePasteDrop';

const file = (name: string, type = 'image/png') => new File(['x'], name, { type });
const para = (text: string) => ({ id: crypto.randomUUID(), type: 'paragraph', content: [{ type: 'text', text, marks: [] }] });
const image = (src: string) => ({ id: crypto.randomUUID(), type: 'image', src, alt: '', caption: '' });
const mc = () => ({
    id: crypto.randomUUID(), type: 'multiple_choice',
    prompt: [{ type: 'text', text: 'HelloWorld', marks: [] }],
    choices: [{ id: crypto.randomUUID(), content: [{ type: 'text', text: 'A', marks: [] }], correct: true }],
    multiple: false,
});

function editorWith(blocks: unknown[]) {
    const doc = createEmptyDocument({ title: 'Paste guard' });
    doc.sections[0]!.rows = [
        { id: crypto.randomUUID(), gridLines: 'inherit', columns: [{ id: crypto.randomUUID(), blocks: blocks as Block[] }] },
    ] as never;
    return new Editor({ element: document.createElement('div'), extensions: buildEditorExtensions(), content: activityToTiptap(doc) });
}

/** The column's children, as "type:src-or-text". */
function columnOf(ed: Editor): string[] {
    const out: string[] = [];
    ed.state.doc.descendants((n) => {
        if (n.type.name !== 'column') return true;
        n.forEach((c) => {
            // The editor keeps a trailing empty paragraph in a column; it is
            // not one of the blocks under test.
            if (c.type.name === 'paragraph' && c.textContent === '') return;
            out.push(c.type.name === 'image' ? `image:${c.attrs.src}` : c.type.name);
        });
        return false;
    });
    return out;
}
const firstPos = (ed: Editor, name: string) => {
    let pos = -1;
    ed.state.doc.descendants((n, p) => {
        if (pos === -1 && n.type.name === name) pos = p;
        return pos === -1;
    });
    return pos;
};
const ok = { upload: async (f: File) => `u/${f.name}`, status: () => undefined };

describe('placeImages — where an image lands', () => {
    it('a selected image is kept: the paste goes AFTER it', async () => {
        const ed = editorWith([image('one'), image('two')]);
        ed.view.dispatch(ed.state.tr.setSelection(NodeSelection.create(ed.state.doc, firstPos(ed, 'image'))));
        await placeImages(ed.view, [file('new.png')], null, ok);
        expect(columnOf(ed)).toEqual(['image:one', 'image:u/new.png', 'image:two']);
        ed.destroy();
    });

    it('a caret mid-text in a question does not split it: the image goes after the block', async () => {
        const ed = editorWith([mc(), para('after')]);
        let mid = -1;
        ed.state.doc.descendants((n, p) => {
            if (mid === -1 && n.isText && n.text === 'HelloWorld') mid = p + 5;
            return mid === -1;
        });
        ed.view.dispatch(ed.state.tr.setSelection(TextSelection.create(ed.state.doc, mid)));
        await placeImages(ed.view, [file('new.png')], null, ok);
        expect(columnOf(ed)).toEqual(['multipleChoice', 'image:u/new.png', 'paragraph']);
        ed.destroy();
    });

    it('several files keep their order, each after the last', async () => {
        const ed = editorWith([para('Look')]);
        ed.view.dispatch(ed.state.tr.setSelection(TextSelection.create(ed.state.doc, firstPos(ed, 'paragraph') + 2)));
        await placeImages(ed.view, [file('a.png'), file('b.png')], null, ok);
        expect(columnOf(ed)).toEqual(['paragraph', 'image:u/a.png', 'image:u/b.png']);
        ed.destroy();
    });

    it('a drop on a section break goes to the top of the next column, replacing nothing', async () => {
        const ed = editorWith([image('first'), para('x')]);
        const breakPos = firstPos(ed, 'sectionBreak');
        await placeImages(ed.view, [file('drop.png')], breakPos, ok);
        expect(columnOf(ed)).toEqual(['image:u/drop.png', 'image:first', 'paragraph']);
        ed.destroy();
    });

    it('a failed upload says why, inserts nothing, and stops', async () => {
        const ed = editorWith([para('x')]);
        const status = vi.fn();
        const upload = vi.fn(async () => {
            throw new Error('Image too large (max 10 MB).');
        });
        await placeImages(ed.view, [file('big.png'), file('next.png')], null, { upload, status });
        expect(columnOf(ed)).toEqual(['paragraph']);
        expect(upload).toHaveBeenCalledTimes(1);
        expect(status).toHaveBeenLastCalledWith({ kind: 'error', message: 'Image too large (max 10 MB).' });
        ed.destroy();
    });

    it('imageInsertPos always lands between a column\'s blocks', () => {
        const ed = editorWith([mc(), image('i'), para('p')]);
        const { doc } = ed.state;
        for (let p = 0; p <= doc.content.size; p++) {
            expect(doc.resolve(imageInsertPos(doc, p)).parent.type.name).toBe('column');
        }
        ed.destroy();
    });
});

describe('which pastes are taken over', () => {
    const dt = (files: File[], data: Record<string, string>) =>
        ({ files, getData: (t: string) => data[t] ?? '' }) as unknown as DataTransfer;

    it('a screenshot (a file, no text) and a browser "Copy image" (a lone <img>)', () => {
        expect(pastedImageFiles(dt([file('s.png')], {}))).toHaveLength(1);
        expect(pastedImageFiles(dt([file('s.png')], { 'text/html': '<meta charset="utf-8"><img src="https://x/y.png">' }))).toHaveLength(1);
    });

    it('NOT an Office paste: text or HTML with a picture of it alongside', () => {
        expect(pastedImageFiles(dt([file('table.png')], { 'text/html': '<table><tr><td>12</td></tr></table>', 'text/plain': '12' }))).toEqual([]);
        expect(pastedImageFiles(dt([file('p.png')], { 'text/plain': 'Some words' }))).toEqual([]);
    });

    it('helpers', () => {
        expect(isLoneImageHtml('<p>hi <img src="a"></p>')).toBe(false);
        expect(imageFilesIn({ files: [file('a.txt', 'text/plain')] } as unknown as DataTransfer)).toEqual([]);
    });
});
