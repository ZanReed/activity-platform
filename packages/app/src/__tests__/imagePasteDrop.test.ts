// @vitest-environment jsdom
// =============================================================================
// imagePasteDrop.test.ts — E-1 (ui-review-group-e.md): a pasted or dropped
// image file is uploaded like the file picker's and lands as an image block.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import { createEmptyDocument, type Block } from '@activity/schema';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { activityToTiptap } from '../lib/serialize';
import { imageFilesIn, placeImages } from '../editor/imagePasteDrop';

const file = (name: string, type: string) => new File(['x'], name, { type });

function editorWithParagraph() {
    const doc = createEmptyDocument({ title: 'Paste guard' });
    doc.sections[0]!.rows = [
        {
            id: crypto.randomUUID(),
            gridLines: 'inherit',
            columns: [{ id: crypto.randomUUID(), blocks: [{ id: crypto.randomUUID(), type: 'paragraph', content: [{ type: 'text', text: 'Look at this', marks: [] }] } as unknown as Block] }],
        },
    ] as never;
    return new Editor({ element: document.createElement('div'), extensions: buildEditorExtensions(), content: activityToTiptap(doc) });
}

const images = (ed: Editor) => {
    const out: string[] = [];
    ed.state.doc.descendants((n) => {
        if (n.type.name === 'image') out.push(n.attrs.src as string);
        return true;
    });
    return out;
};

describe('imageFilesIn', () => {
    it('keeps image files only, in order', () => {
        const dt = { files: [file('a.png', 'image/png'), file('notes.txt', 'text/plain'), file('b.jpg', 'image/jpeg')] } as unknown as DataTransfer;
        expect(imageFilesIn(dt).map((f) => f.name)).toEqual(['a.png', 'b.jpg']);
        expect(imageFilesIn(null)).toEqual([]);
    });
});

describe('placeImages', () => {
    it('uploads each file and inserts an image block with its URL, in order', async () => {
        const ed = editorWithParagraph();
        ed.commands.focus('end');
        const status = vi.fn();
        await placeImages(ed.view, [file('a.png', 'image/png'), file('b.png', 'image/png')], null, {
            upload: async (f) => `https://cdn.test/${f.name}`,
            insert: (src) => ed.chain().insertImage({ src }).run(),
            status,
        });
        expect(images(ed)).toEqual(['https://cdn.test/a.png', 'https://cdn.test/b.png']);
        expect(status).toHaveBeenLastCalledWith(null);
        ed.destroy();
    });

    it('a failed upload says why, inserts nothing, and stops', async () => {
        const ed = editorWithParagraph();
        const status = vi.fn();
        const upload = vi.fn(async () => {
            throw new Error('Image too large (max 10 MB).');
        });
        await placeImages(ed.view, [file('big.png', 'image/png'), file('next.png', 'image/png')], 3, {
            upload,
            insert: (src) => ed.chain().insertImage({ src }).run(),
            status,
        });
        expect(images(ed)).toEqual([]);
        expect(upload).toHaveBeenCalledTimes(1);
        expect(status).toHaveBeenLastCalledWith({ kind: 'error', message: 'Image too large (max 10 MB).' });
        ed.destroy();
    });
});
