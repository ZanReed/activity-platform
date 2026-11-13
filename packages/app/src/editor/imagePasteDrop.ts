// =============================================================================
// imagePasteDrop.ts — paste or drop an image into the editor (UI review E-1,
// docs/design/ui-review-group-e.md)
// -----------------------------------------------------------------------------
// Images used to arrive only through the image block's file picker. Now a
// pasted screenshot or a dropped image file goes through the SAME upload
// (`uploadImage`: its type list, its size limit, its error words) and lands as
// an image block — at the drop point, or at the caret for a paste.
//
// Only FILES are taken over. A paste of text or HTML (even HTML holding an
// <img>) is left to ProseMirror, as before; so is a drag that moves content
// inside the editor.
// =============================================================================

import type { EditorView } from '@tiptap/pm/view';
import { NodeSelection, Selection } from '@tiptap/pm/state';

/** The image files in a paste or drop, in order; [] when there are none. */
export function imageFilesIn(data: DataTransfer | null | undefined): File[] {
    if (!data) return [];
    return Array.from(data.files ?? []).filter((f) => f.type.startsWith('image/'));
}

export interface ImageDropHandlers {
    /** Upload one file; resolves to its public URL (throws with the words to show). */
    upload: (file: File) => Promise<string>;
    /** Insert an image block with `src` at the current selection. */
    insert: (src: string) => void;
    /** Report progress: 'uploading', then null when done, or an error message. */
    status: (state: { kind: 'uploading' } | { kind: 'error'; message: string } | null) => void;
}

/** Upload then insert each file, one after another (a multi-file drop keeps
 *  its order). Stops at the first failure and says why. */
export async function placeImages(view: EditorView, files: File[], at: number | null, h: ImageDropHandlers): Promise<void> {
    if (at !== null) {
        // Put the caret at the drop point first, clamped to the current doc.
        const pos = Math.max(0, Math.min(at, view.state.doc.content.size));
        view.dispatch(view.state.tr.setSelection(Selection.near(view.state.doc.resolve(pos))));
    }
    for (const file of files) {
        h.status({ kind: 'uploading' });
        try {
            const url = await h.upload(file);
            // insertImage node-selects what it inserted (so its popover opens);
            // the next insert would REPLACE that selection. Step past it first.
            const sel = view.state.selection;
            if (sel instanceof NodeSelection) {
                view.dispatch(view.state.tr.setSelection(Selection.near(view.state.doc.resolve(sel.to))));
            }
            h.insert(url);
        } catch (err) {
            h.status({ kind: 'error', message: err instanceof Error ? err.message : 'Upload failed' });
            return;
        }
    }
    h.status(null);
}
