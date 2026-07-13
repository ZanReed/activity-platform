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
//
// A fadedWorkedExample counts as ONE problem and is treated as ATOMIC: we add 1
// and do not descend into it, so its fill_in_blank steps (lettered locally, see
// fadedStepContextAt) never inflate the worksheet's problem numbers. This
// mirrors renderFadedWorkedExample, which pulls nextProblemNumber once for the
// box and letters the steps.
// ============================================================================

export function problemNumberAt(editor: Editor, pos: number | undefined): number {
    if (pos === undefined) return 1;
    let count = 1;
    editor.state.doc.descendants((node, nodePos) => {
        if (nodePos >= pos) return false;
        const name = node.type.name;
        if (name === 'fadedWorkedExample') {
            // The box is one numbered problem; its faded steps are lettered
            // locally, so don't descend and count them.
            count++;
            return false;
        }
        if (
            name === 'fillInBlank' ||
            name === 'multipleChoice' ||
            name === 'matching' ||
            name === 'ordering' ||
            name === 'numberLine'
        ) {
            count++;
        } else if (name === 'interactiveGraph' || name === 'dataPlot') {
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

// Bijective base-26 index → letter: 0→"a" … 25→"z", 26→"aa". Mirrors the
// renderer's stepLetter (packages/renderer/src/blocks/step-letter.ts).
export function stepLetter(index: number): string {
    let n = index + 1;
    let out = '';
    while (n > 0) {
        const rem = (n - 1) % 26;
        out = String.fromCharCode(97 + rem) + out;
        n = Math.floor((n - 1) / 26);
    }
    return out;
}

export interface FadedStepContext {
    /** The compact letter for this step, e.g. "a". */
    letter: string;
}

// If the fill_in_blank at `pos` is a faded step (a direct child of a
// fadedWorkedExample), return its local letter; otherwise null (it's a
// standalone problem, numbered by problemNumberAt). Whether the letter is
// actually shown is the parent box's concern (showStepLabels → a CSS modifier),
// since a child NodeView can't react to a parent attribute change.
export function fadedStepContextAt(
    editor: Editor,
    pos: number | undefined,
): FadedStepContext | null {
    if (pos === undefined) return null;
    const $pos = editor.state.doc.resolve(pos);
    const parent = $pos.parent;
    if (parent.type.name !== 'fadedWorkedExample') return null;
    const myIndex = $pos.index();
    let stepIndex = 0;
    for (let i = 0; i < myIndex; i++) {
        if (parent.child(i).type.name === 'fillInBlank') stepIndex++;
    }
    return { letter: stepLetter(stepIndex) };
}
