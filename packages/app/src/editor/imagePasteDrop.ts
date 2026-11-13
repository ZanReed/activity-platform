// =============================================================================
// imagePasteDrop.ts — paste or drop an image into the editor (UI review E-1,
// docs/design/ui-review-group-e.md)
// -----------------------------------------------------------------------------
// Images used to arrive only through the image block's file picker. Now a
// pasted screenshot or a dropped image file goes through the SAME upload
// (`uploadImage`: its type list, its size limit, its error words) and lands as
// an image block.
//
// WHERE it lands is computed, never "replace the selection" (Fable review of
// E-1 step 2, which measured both failures of the first version):
//   * replacing the selection deleted a selected neighbour — an image, a maths
//     block, a chart — and `Selection.near` hands back exactly such a node
//     selection next to an atom;
//   * replacing a caret mid-text split the block it was in, leaving two blocks
//     with ONE id (a choice question, a fill-in line, a table, a callout).
// So the image always goes BETWEEN blocks of a column: after the block the
// caret (or the drop point) is in, or at the column position itself.
//
// WHEN it takes over (paste): only when the clipboard is just an image — files
// and no text, or HTML that is a lone <img> (a browser's "Copy image").
// Office puts a PNG picture of a copied table or paragraph next to its text;
// that paste stays text, as before. A drop with image files is always taken.
// =============================================================================

import type { EditorView } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { blockAncestor } from './strictGrid';

/** The image files in a paste or drop, in order; [] when there are none. */
export function imageFilesIn(data: DataTransfer | null | undefined): File[] {
    if (!data) return [];
    return Array.from(data.files ?? []).filter((f) => f.type.startsWith('image/'));
}

/** True when the HTML is nothing but one image (a browser's "Copy image"). */
export function isLoneImageHtml(html: string): boolean {
    if (typeof DOMParser === 'undefined') return false;
    const body = new DOMParser().parseFromString(html, 'text/html').body;
    return (body.textContent ?? '').trim() === '' && body.querySelectorAll('img').length === 1;
}

/** The image files a PASTE should take over, or [] to leave it to ProseMirror. */
export function pastedImageFiles(data: DataTransfer | null | undefined): File[] {
    const files = imageFilesIn(data);
    if (files.length === 0 || !data) return [];
    const html = data.getData('text/html');
    const text = data.getData('text/plain');
    if (html) return isLoneImageHtml(html) ? files : [];
    return text.trim() === '' ? files : [];
}

/**
 * A position BETWEEN blocks of a column, for an image arriving at `pos`:
 * after the block `pos` is inside; `pos` itself when it already sits between
 * a column's blocks; otherwise the top of the next column (or the end of the
 * last one), e.g. for a drop on a section break.
 */
export function imageInsertPos(doc: PMNode, pos: number): number {
    const at = Math.max(0, Math.min(pos, doc.content.size));
    const $p = doc.resolve(at);
    if ($p.parent.type.name === 'column') return at;
    const found = blockAncestor($p);
    if (found) {
        const block = doc.nodeAt(found.pos);
        return found.pos + (block ? block.nodeSize : 0);
    }
    let next: number | null = null;
    let last: number | null = null;
    doc.descendants((node, p) => {
        if (node.type.name !== 'column') return true;
        if (next === null && p >= at) next = p + 1;
        last = p + node.nodeSize - 1;
        return false;
    });
    return next ?? last ?? at;
}

export interface ImageDropHandlers {
    /** Upload one file; resolves to its public URL (throws with the words to show). */
    upload: (file: File) => Promise<string>;
    /** Report progress: 'uploading', then null when done, or an error message. */
    status: (state: { kind: 'uploading' } | { kind: 'error'; message: string } | null) => void;
}

/**
 * Upload then insert each file, one after another (a multi-file drop keeps
 * its order, each image after the last). `at` is the drop point; null for a
 * paste, which uses the selection: after a selected block, else after the
 * block the caret is in. Stops at the first failure and says why.
 */
export async function placeImages(view: EditorView, files: File[], at: number | null, h: ImageDropHandlers): Promise<void> {
    const sel = view.state.selection;
    let anchor = at ?? (sel instanceof NodeSelection ? sel.to : sel.from);
    for (const file of files) {
        h.status({ kind: 'uploading' });
        let url: string;
        try {
            url = await h.upload(file);
        } catch (err) {
            h.status({ kind: 'error', message: err instanceof Error ? err.message : 'Upload failed' });
            return;
        }
        const { state } = view;
        const type = state.schema.nodes.image;
        if (!type) return;
        const pos = imageInsertPos(state.doc, anchor);
        const node = type.create({ id: crypto.randomUUID(), src: url, alt: '', caption: '' });
        const tr = state.tr.insert(pos, node);
        try {
            tr.setSelection(NodeSelection.create(tr.doc, pos));
        } catch {
            /* the selection is a nicety; the insert stands */
        }
        view.dispatch(tr);
        anchor = pos + node.nodeSize;
    }
    h.status(null);
}
