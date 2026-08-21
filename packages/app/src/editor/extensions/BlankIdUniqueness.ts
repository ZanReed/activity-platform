import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// ============================================================================
// BlankIdUniqueness — one repair pass keeping every blank id unique.
// ----------------------------------------------------------------------------
// A blank's id is the RESPONSE KEY: it is what SubmissionResponses.blanks is
// keyed by, what the grading walk returns, and what the client sends back. It is
// deliberately stable across saves — serialize preserves it rather than minting
// a fresh one, precisely so that reordering blocks never re-assigns a student's
// past answers.
//
// Stability and copying are in tension, and copying wins by default. Duplicating
// a block copies its node JSON verbatim (blockControls' Duplicate), and pasting
// round-trips through HTML where the id rides `data-blank-id`. Either way the
// document ends up with TWO blanks claiming one key, and the failure is silent
// and total:
//
//   - the viewer renders both inputs from `state.responses.blanks[id]`, so
//     typing in one fills the other;
//   - the client sends one value for what the teacher authored as two gaps;
//   - the grading walk collects two keys under one id and marks accordingly.
//
// Nothing throws. The teacher sees two blanks and the student answers one.
//
// FOUND WHILE BUILDING THE TABLE BLOCK (D7.2) and fixed GENERALLY, because the
// defect was never table-specific — duplicating a fill_in_blank has always done
// this. What tables change is the odds: "duplicate this row" is a first-class
// gesture on a table, so the collision goes from a thing you could do to a thing
// you do constantly.
//
// WHY A REPAIR PASS RATHER THAN A PASTE HANDLER. There are several ways a
// duplicate can arrive — paste, the Duplicate action, prosemirror-tables' own
// row/column commands, an undo that resurrects a deleted subtree, a future
// command nobody has written yet. Guarding each entry point means guarding the
// ones that exist today; guarding the DOCUMENT means the invariant holds however
// the duplicate got there. The cost is one descendant walk per doc-changing
// transaction, which is what the `docChanged` gate below is for.
//
// The repair keeps the FIRST occurrence in document order and remints the rest,
// so an existing blank never changes key (its stored answers stay attached) and
// the newly-pasted copy is the one that becomes a new question.
// ============================================================================

export const BlankIdUniqueness = Extension.create({
    name: 'blankIdUniqueness',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('blankIdUniqueness'),
                appendTransaction(transactions, _oldState, newState) {
                    // Selection-only transactions cannot introduce a duplicate.
                    if (!transactions.some((tr) => tr.docChanged)) return null;

                    const seen = new Set<string>();
                    const fixes: { pos: number; attrs: Record<string, unknown> }[] = [];

                    newState.doc.descendants((node, pos) => {
                        if (node.type.name !== 'blank') return true;
                        const id = node.attrs.id as unknown;
                        // AN EMPTY ID IS NOT A COLLISION, and is deliberately
                        // left alone. The node's default is '', a freshly
                        // inserted blank carries it for a moment, and serialize
                        // already mints a real uuid for an id-less blank on the
                        // way to storage — so reminting here would fire this
                        // plugin on ordinary insertions to change a value that
                        // was going to be replaced anyway. Every firing replaces
                        // a node, and replacing a node drops any NodeSelection
                        // on it, which the selection-driven popover host reads.
                        // Cheap churn next to a live selection is not worth it
                        // for zero benefit. Narrow to the stated job: two blanks
                        // claiming ONE key.
                        if (typeof id !== 'string' || id.length === 0) return true;
                        if (!seen.has(id)) {
                            seen.add(id);
                            return true;
                        }
                        fixes.push({
                            pos,
                            attrs: { ...node.attrs, id: crypto.randomUUID() },
                        });
                        return true;
                    });

                    if (fixes.length === 0) return null;

                    const tr = newState.tr;
                    // setNodeMarkup does not change document size, so the
                    // positions collected above stay valid as we apply them.
                    for (const fix of fixes) {
                        tr.setNodeMarkup(fix.pos, undefined, fix.attrs);
                    }
                    // Re-apply the selection over the repaired document. Node
                    // sizes are unchanged, so this is a no-op for a text
                    // selection — but a NodeSelection pointing AT a repaired
                    // blank is dropped by setNodeMarkup, and the popover host is
                    // selection-driven, so losing it closes the popover under
                    // the author's cursor. Same reason Blank.ts's
                    // updateBlankAttrs carries a preserveSelection flag.
                    tr.setSelection(newState.selection.map(tr.doc, tr.mapping));
                    // Not its own undo step: the repair is part of whatever the
                    // author just did, and Ctrl+Z should undo the paste, not
                    // peel the id fix off it and leave the collision behind.
                    return tr.setMeta('addToHistory', false);
                },
            }),
        ];
    },
});
