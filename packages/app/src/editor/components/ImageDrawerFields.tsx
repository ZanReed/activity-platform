import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';

// ============================================================================
// Image Advanced-drawer custom fields (image crop mode).
// ----------------------------------------------------------------------------
// The "Reset crop" control: clears ONLY crop + srcAspect (both-or-neither), so
// the image drops back to uncropped while KEEPING its width + alignment (CR-S4).
// Disabled when the image isn't cropped. A custom field because it is an action
// (a button), not an attr-backed value the simple field kinds express.
// ============================================================================

export function renderResetCrop({
    editor,
    node,
    pos,
}: {
    editor: Editor;
    node: PMNode;
    pos: number;
}): ReactNode {
    const cropped = node.attrs.crop != null;
    const reset = () => {
        editor
            .chain()
            .command(({ tr }) => {
                // Clear the pair together — never one without the other.
                tr.setNodeAttribute(pos, 'crop', null);
                tr.setNodeAttribute(pos, 'srcAspect', null);
                return true;
            })
            .run();
    };
    return (
        <div className="image-reset-crop">
            <button
                type="button"
                className="image-reset-crop__button"
                disabled={!cropped}
                onClick={reset}
            >
                Reset crop
            </button>
            <span className="block-advanced-drawer__help">
                {cropped
                    ? 'Removes the crop. Keeps width and alignment.'
                    : 'This image isn’t cropped.'}
            </span>
        </div>
    );
}
