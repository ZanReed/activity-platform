import type { Editor } from '@tiptap/core';

// ============================================================================
// problemNumbering — the editor-side mirror of the renderer's isNumberedBlock.
// ----------------------------------------------------------------------------
// One shared walk so every question NodeView (fill-in-blank, multiple choice,
// matching, ordering, number line, interactive graph) shows the same number the
// published page will render. Counts, in document order before `pos`:
// fillInBlank, multipleChoice, matching, ordering, numberLine, and non-display
// interactiveGraph nodes. Keep in sync with the renderer's isNumberedBlock in
// packages/renderer/src/blocks/index.ts.
// ============================================================================

export function problemNumberAt(editor: Editor, pos: number | undefined): number {
    if (pos === undefined) return 1;
    let count = 1;
    editor.state.doc.descendants((node, nodePos) => {
        if (nodePos >= pos) return false;
        if (
            node.type.name === 'fillInBlank' ||
            node.type.name === 'multipleChoice' ||
            node.type.name === 'matching' ||
            node.type.name === 'ordering' ||
            node.type.name === 'numberLine'
        ) {
            count++;
        } else if (
            node.type.name === 'interactiveGraph' ||
            node.type.name === 'dataPlot'
        ) {
            // Only a graded interaction is numbered; a display chart is not.
            const interactionType = (
                node.attrs.interaction as { type?: string } | undefined
            )?.type;
            if (interactionType !== 'display') count++;
        }
        return true;
    });
    return count;
}
