// @vitest-environment jsdom
// =============================================================================
// publishProblems.test.ts — group B's refusals (B-1) and finding them in the
// editor (B-2). docs/design/ui-review-group-b.md
// -----------------------------------------------------------------------------
// Blocks and sections are located by POSITION because serialize re-mints their
// ids on every save; these tests build a real editor, serialize it the way the
// autosave does, and check the problem points back at the right node.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { ActivityMeta } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { tiptapToActivity } from '../lib/serialize';
import { findPublishProblems, problemText, publishProblemsSentence } from '../lib/prePublishCheck';
import { locateProblem, problemLabel, selectProblem } from '../editor/locateProblem';

const META = ActivityMeta.parse({ title: 'B', course: 'Y7' });
let convert: MarkdownImporter;
let editor: Editor | null = null;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});
afterEach(() => {
    editor?.destroy();
    editor = null;
});

const MC_OK = '```mc\nprompt: 2 + 2?\n( ) 3\n(x) 4\n```';
const MC_TWO = '```mc\nprompt: 3 + 3?\n( ) 5\n(x) 6\n```';

/** Unmark every choice of the nth multiple choice, as a teacher would. */
function unmarkAll(ed: Editor, nth: number) {
    let seen = 0;
    ed.state.doc.descendants((node, pos) => {
        if (node.type.name !== 'multipleChoice') return true;
        if (seen++ === nth) {
            const choices = (node.attrs.choices as { correct?: boolean }[]).map((c) => ({ ...c, correct: false }));
            ed.view.dispatch(ed.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, choices }));
        }
        return false;
    });
}

function editorFor(md: string): Editor {
    editor = new Editor({ extensions: buildEditorExtensions(), content: wrapBlocksStrict(convert(md).blocks) });
    return editor;
}

describe('B-1: questions no student can get right are refused', () => {
    it('multiple choice with no correct choice — found, labelled and selected in the editor', () => {
        const ed = editorFor(`${MC_OK}\n\n${MC_TWO}`);
        expect(findPublishProblems(tiptapToActivity(ed.getJSON(), META))).toEqual([]);
        unmarkAll(ed, 1);
        const problems = findPublishProblems(tiptapToActivity(ed.getJSON(), META));
        expect(problems).toEqual([{ kind: 'mc-no-correct', block: { type: 'multiple_choice', index: 1 } }]);
        const p = problems[0]!;
        const pos = locateProblem(ed as never, p);
        expect(pos).not.toBeNull();
        expect(problemLabel(ed as never, p, pos)).toBe('Q2');
        expect(problemText(p)).toBe('no choice is marked correct');
        expect(selectProblem(ed as never, p)).toBe(true);
        expect((ed.state.selection as NodeSelection).node.type.name).toBe('multipleChoice');
        expect((ed.state.selection as NodeSelection).from).toBe(pos);
    });

    it('matching items and correspondence cells with no answer are counted', () => {
        const I1 = '11111111-1111-4111-8111-111111111111';
        const I2 = '22222222-2222-4222-8222-222222222222';
        const T1 = '33333333-3333-4333-8333-333333333333';
        const C1 = '44444444-4444-4444-8444-444444444444';
        const doc = {
            sections: [
                {
                    rows: [
                        {
                            columns: [
                                {
                                    blocks: [
                                        { type: 'matching', items: [{ id: I1 }, { id: I2 }], targets: [{ id: T1 }], key: { [I1]: T1 } },
                                        {
                                            type: 'correspondence',
                                            items: [{ id: I1 }, { id: I2 }],
                                            targetColumns: [{ id: C1, targets: [{ id: T1 }] }],
                                            key: { [I1]: { [C1]: T1 } },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(findPublishProblems(doc)).toEqual([
            { kind: 'match-unmatched', block: { type: 'matching', index: 0 }, count: 1 },
            { kind: 'correspondence-unmatched', block: { type: 'correspondence', index: 0 }, count: 1 },
        ]);
    });

    it('a maths gap with no answer is refused; an answered one is not', () => {
        const block = (prompts: { id: string }[]) => ({
            sections: [{ rows: [{ columns: [{ blocks: [{ type: 'math_block', latex: 'x=\\placeholder[g1]{}+\\placeholder[g2]{}', prompts }] }] }] }],
        });
        expect(findPublishProblems(block([{ id: 'g1' }]))).toEqual([
            { kind: 'math-gap-empty', block: { type: 'math_block', index: 0 }, count: 1 },
        ]);
        expect(findPublishProblems(block([{ id: 'g1' }, { id: 'g2' }]))).toEqual([]);
    });

    it('a DoL with no skills, or skills that do not fit its questions, is refused', () => {
        const sec = (skills: string[]) => ({
            sections: [
                { rows: [] },
                {
                    dol: { skills },
                    rows: [{ columns: [{ blocks: [{ type: 'short_answer', prompt: [], solution: [] }] }] }],
                },
            ],
        });
        expect(findPublishProblems(sec([]))).toEqual([{ kind: 'dol-no-skills', section: 1 }]);
        expect(findPublishProblems(sec(['a', 'b']))).toEqual([{ kind: 'dol-item-count', section: 1, items: 1, skills: 2 }]);
        expect(findPublishProblems(sec(['a']))).toEqual([]);
    });

    it('"Republish changed" gets one sentence that still says what is wrong', () => {
        expect(publishProblemsSentence([{ kind: 'mc-no-correct', block: { type: 'multiple_choice', index: 0 } }])).toBe(
            'Not published: no choice is marked correct.',
        );
        expect(
            publishProblemsSentence([
                { kind: 'mc-no-correct', block: { type: 'multiple_choice', index: 0 } },
                { kind: 'empty-blank', blankId: 'b' },
            ]),
        ).toBe('Not published: 2 questions need fixing first.');
    });
});
