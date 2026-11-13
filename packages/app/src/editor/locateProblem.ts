// =============================================================================
// locateProblem.ts — find a pre-publish problem in the editor, name it, and
// select it ("Q4 · no choice is marked correct — Show me"; UI review B-2)
// -----------------------------------------------------------------------------
// prePublishCheck locates blocks and sections by POSITION (the nth block of a
// type, the nth section) because serialize re-mints their ids on every save.
// This walks the editor's document in the same pre-order to find them. Blanks
// keep their ids, so they are found by id.
// =============================================================================

import type { Editor } from '@tiptap/core';
import type { PublishProblem } from '../lib/prePublishCheck';
import { PM_NAME_TO_SCHEMA_TYPE, problemNumberAt } from './problemNumbering';

const schemaTypeOf = (pmName: string): string => PM_NAME_TO_SCHEMA_TYPE[pmName] ?? pmName;

/** The document position of the problem's blank, block or section, or null. */
export function locateProblem(editor: Editor, p: PublishProblem): number | null {
    const doc = editor.state.doc;
    let found: number | null = null;
    if (p.kind === 'empty-blank') {
        doc.descendants((node, pos) => {
            if (found !== null) return false;
            if (node.type.name === 'blank' && node.attrs.id === p.blankId) found = pos;
            return found === null;
        });
        return found;
    }
    if (p.kind === 'dol-no-skills' || p.kind === 'dol-item-count') {
        // Section 0 has no break when the document doesn't start with one.
        const startsWithBreak = doc.firstChild?.type.name === 'sectionBreak';
        const breakIndex = startsWithBreak ? p.section : p.section - 1;
        if (breakIndex < 0) return 0;
        let seen = 0;
        doc.forEach((node, offset) => {
            if (found !== null || node.type.name !== 'sectionBreak') return;
            if (seen === breakIndex) found = offset;
            seen += 1;
        });
        return found;
    }
    let seen = 0;
    doc.descendants((node, pos) => {
        if (found !== null) return false;
        if (schemaTypeOf(node.type.name) === p.block.type) {
            if (seen === p.block.index) {
                found = pos;
                return false;
            }
            seen += 1;
        }
        return true;
    });
    return found;
}

/** "Q4", "Section 2", or null when it can't be placed. */
export function problemLabel(editor: Editor, p: PublishProblem, pos: number | null): string | null {
    if (pos === null) return null;
    if (p.kind === 'dol-no-skills' || p.kind === 'dol-item-count') return `Section ${p.section + 1}`;
    let blockPos = pos;
    if (p.kind === 'empty-blank') {
        // The question a blank belongs to: its nearest numbered ancestor.
        const $pos = editor.state.doc.resolve(pos);
        blockPos = -1;
        for (let d = $pos.depth; d > 0; d--) {
            if (PM_NAME_TO_SCHEMA_TYPE[$pos.node(d).type.name] !== undefined) {
                blockPos = $pos.before(d);
                break;
            }
        }
        if (blockPos < 0) return null;
    }
    const node = editor.state.doc.nodeAt(blockPos);
    if (!node || PM_NAME_TO_SCHEMA_TYPE[node.type.name] === undefined) return null;
    return `Q${problemNumberAt(editor, blockPos)}`;
}

/** Select it and bring it into view; false when it can't be found. */
export function selectProblem(editor: Editor, p: PublishProblem): boolean {
    const pos = locateProblem(editor, p);
    if (pos === null) return false;
    return editor.chain().focus().setNodeSelection(pos).scrollIntoView().run();
}
