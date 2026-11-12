import type { Editor } from '@tiptap/react';

/**
 * Select a blank by its id and scroll to it (UI review G-2's "Show me"). A
 * selected blank opens its edit popover through the single popover host, so
 * this lands the teacher in the answer field. Returns false when no blank with
 * that id is in the document (it was deleted since the publish attempt).
 */
export function selectBlankById(editor: Editor, blankId: string): boolean {
    let found: number | null = null;
    editor.state.doc.descendants((node, pos) => {
        if (found !== null) return false;
        if (node.type.name === 'blank' && node.attrs.id === blankId) {
            found = pos;
            return false;
        }
        return true;
    });
    if (found === null) return false;
    return editor.chain().focus().setNodeSelection(found).scrollIntoView().run();
}
