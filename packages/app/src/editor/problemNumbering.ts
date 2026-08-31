import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { isPageNumberedType, stepLetter } from '@activity/schema';

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
//
// A MISSING ENTRY IS A SILENT MIS-NUMBERING, not a missing number: the walk
// simply doesn't count that block, so every question AFTER it shows a number
// one too low — and the editor and the printed page then disagree about which
// question is which. That is why the map is exported and bound to the schema's
// own membership list by problemNumbering.test.ts. The bond used to be claimed
// in this comment and nowhere else (P11: a comment asserting coverage is a
// claim — guard it or don't make it); the answer-key slice made it real, having
// walked straight into the gap it warns about.
//
// `problem` is deliberately absent: it is page-numbered in the schema but the
// editor has no mapping for it at all (see its tombstone), so it can never
// appear in a ProseMirror document.
export const PM_NAME_TO_SCHEMA_TYPE: Readonly<Record<string, string>> = {
    fillInBlank: 'fill_in_blank',
    multipleChoice: 'multiple_choice',
    matching: 'matching',
    correspondence: 'correspondence',
    ordering: 'ordering',
    numberLine: 'number_line',
    fadedWorkedExample: 'faded_worked_example',
    interactiveGraph: 'interactive_graph',
    dataPlot: 'data_plot',
    mathBlock: 'math_block',
    // Numbered since ruling E7 (answer-key slice): a graded question a teacher
    // marks on paper wears a number, and it consumes a sequence slot here for
    // the same reason it does on the page.
    shortAnswer: 'short_answer',
    essay: 'essay',
    // Numbered only when some cell holds a blank — a blankless table is a
    // stimulus (a chart to READ), not a question. See tableNodeHasBlank.
    table: 'table',
};

/**
 * Does this table node carry a blank in any cell?
 *
 * The editor's counterpart to isGradeable's `table` case, and it has to be a
 * DESCENDANT walk rather than an attrs read: a table's gradable content lives
 * in its cells, not in a field. (A math_block's gaps ARE an attr, which is why
 * that one is a one-liner above.) Both sides must agree or the editor and the
 * printed page disagree about which question is question 4 — the exact defect
 * this file was written after.
 */
function tableNodeHasBlank(node: ProseMirrorNode): boolean {
    let found = false;
    node.descendants((child) => {
        if (found) return false;
        if (child.type.name === 'blank') {
            found = true;
            return false;
        }
        return true;
    });
    return found;
}

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
        if (schemaType === 'table') {
            // ATOMIC, for the same reason as the faded box: the WHOLE table is
            // one numbered problem and its blank cells are lettered (a)/(b)
            // inside it. Nothing within a table is separately numbered, so
            // descending could only ever find something that should not count.
            if (!tableNodeHasBlank(node)) return false; // a stimulus; no number
            const tableLabel = (node.attrs.label as { mode?: string } | undefined)
                ?.mode;
            if (tableLabel !== 'none' && tableLabel !== 'custom') count++;
            return false;
        }
        const interactionType = (
            node.attrs.interaction as { type?: string } | undefined
        )?.type;
        // "This block's CONTENT carries gradable items": in-equation gaps for a
        // math_block, a blank in some cell for a table. The schema's rule takes
        // one flag for both (isPageNumberedType); each caller computes it from
        // whatever shape it holds.
        const hasGradableContent =
            schemaType === 'math_block'
                ? Array.isArray(node.attrs.prompts) &&
                  node.attrs.prompts.length > 0
                : schemaType === 'table'
                  ? tableNodeHasBlank(node)
                  : undefined;
        if (!isPageNumberedType(schemaType, interactionType, hasGradableContent))
            return true;
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

// stepLetter MOVED to @activity/schema (viewer-numbering ruling N9). It lived
// here as the second of what was about to become three copies — the renderer's
// died with the package at S9 Drop 4, and the viewer needs one now that
// sub-part lettering is coming back. Re-exported so this module's existing
// callers keep their import path.
export { stepLetter };

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
