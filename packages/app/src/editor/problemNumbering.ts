import type { Editor } from '@tiptap/core';
import { isPageNumberedType } from '@activity/schema';

// ============================================================================
// problemNumbering — the editor-side mirror of the renderer's isNumberedBlock.
// ----------------------------------------------------------------------------
// One shared walk so every question NodeView (fill-in-blank, multiple choice,
// matching, ordering, number line, interactive graph) shows the same number the
// published page will render. The numbering RULE (which types number, plus the
// display-graph exception) lives ONCE in @activity/schema's isPageNumberedType;
// this file only bridges ProseMirror's camelCase node names to the schema's
// snake_case block types. A parity test guards that the two never drift.
//
// A fadedWorkedExample counts as ONE problem and is treated as ATOMIC: we add 1
// and do not descend into it, so its fill_in_blank steps (lettered locally, see
// fadedStepContextAt) never inflate the worksheet's problem numbers. This
// mirrors renderFadedWorkedExample, which pulls nextProblemNumber once for the
// box and letters the steps.
// ============================================================================

// ProseMirror node name (camelCase) → schema block type (snake_case), for the
// block kinds that can carry a problem number. This map is the editor's
// name-spelling bridge only; membership + the display-graph rule live in schema.
const PM_NAME_TO_SCHEMA_TYPE: Readonly<Record<string, string>> = {
    fillInBlank: 'fill_in_blank',
    multipleChoice: 'multiple_choice',
    matching: 'matching',
    ordering: 'ordering',
    numberLine: 'number_line',
    fadedWorkedExample: 'faded_worked_example',
    interactiveGraph: 'interactive_graph',
    dataPlot: 'data_plot',
};

export function problemNumberAt(editor: Editor, pos: number | undefined): number {
    if (pos === undefined) return 1;
    let count = 1;
    editor.state.doc.descendants((node, nodePos) => {
        if (nodePos >= pos) return false;
        const schemaType = PM_NAME_TO_SCHEMA_TYPE[node.type.name];
        if (schemaType === undefined) return true; // not a numbered kind; keep descending
        if (schemaType === 'faded_worked_example') {
            // The box is one numbered problem; its faded steps are lettered
            // locally, so count it and don't descend into them.
            count++;
            return false;
        }
        const interactionType = (
            node.attrs.interaction as { type?: string } | undefined
        )?.type;
        if (!isPageNumberedType(schemaType, interactionType)) return true;
        // A custom/none label is out-of-sequence: it shows text or nothing and
        // does NOT consume a problem number. Absent attr = auto = counts.
        const labelMode = (
            node.attrs.label as { mode?: string } | undefined
        )?.mode;
        if (labelMode === 'none' || labelMode === 'custom') return true;
        count++;
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
