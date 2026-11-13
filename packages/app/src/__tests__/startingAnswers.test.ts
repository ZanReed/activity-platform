// @vitest-environment jsdom
// =============================================================================
// startingAnswers.test.ts — B-3 / B-4: a graph or number line still on the
// answer it was inserted with is found (a CHECK at publish, a badge in the
// editor); one the teacher changed is not.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { findStartingAnswers, isStartingAnswer } from '../editor/startingAnswers';
import { defaultPointInteraction, defaultRegionInteraction } from '../editor/extensions/InteractiveGraph';
import { defaultNumberLinePointInteraction } from '../editor/extensions/NumberLine';

let convert: MarkdownImporter;
let editor: Editor | null = null;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});
afterEach(() => {
    editor?.destroy();
    editor = null;
});

describe('isStartingAnswer', () => {
    it('matches each type\'s inserted default, whatever the key order', () => {
        expect(isStartingAnswer('interactiveGraph', defaultPointInteraction())).toBe(true);
        expect(isStartingAnswer('interactiveGraph', defaultRegionInteraction())).toBe(true);
        expect(isStartingAnswer('numberLine', defaultNumberLinePointInteraction())).toBe(true);
        expect(isStartingAnswer('interactiveGraph', { tolerance: 0.1, correctPoints: [[0, 0]], type: 'plot_point' })).toBe(true);
    });

    it('does not match an answer the teacher changed, or a display graph', () => {
        expect(isStartingAnswer('interactiveGraph', { ...defaultPointInteraction(), correctPoints: [[2, 3]] })).toBe(false);
        expect(isStartingAnswer('numberLine', { ...defaultNumberLinePointInteraction(), correctPoints: [4] })).toBe(false);
        expect(isStartingAnswer('interactiveGraph', { type: 'display', drawables: [] })).toBe(false);
        expect(isStartingAnswer('paragraph', defaultPointInteraction())).toBe(false);
    });

    it('a graph whose answer is "No solution" is a set answer, not a starting one', () => {
        expect(isStartingAnswer('interactiveGraph', defaultPointInteraction(), { allowNoSolution: true, noSolutionCorrect: true })).toBe(false);
        expect(isStartingAnswer('interactiveGraph', defaultPointInteraction(), { allowNoSolution: true, noSolutionCorrect: false })).toBe(true);
    });
});

describe('findStartingAnswers', () => {
    it('lists only the blocks still on their starting answer, labelled by question number', () => {
        editor = new Editor({
            extensions: buildEditorExtensions(),
            content: wrapBlocksStrict(
                convert('```graph\nprompt: Plot it.\nanswer: (2, 3)\n```\n\n```numberline\nprompt: Plot 4.\nanswer: 4\n```').blocks,
            ),
        });
        expect(findStartingAnswers(editor)).toEqual([]);
        // The teacher resets the number line to its starting answer.
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name !== 'numberLine') return true;
            editor!.view.dispatch(
                editor!.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, interaction: defaultNumberLinePointInteraction() }),
            );
            return false;
        });
        const found = findStartingAnswers(editor);
        expect(found).toHaveLength(1);
        expect(found[0]!.label).toBe('Q2 number line');
        expect(editor.state.doc.nodeAt(found[0]!.pos)?.type.name).toBe('numberLine');
    });
});
