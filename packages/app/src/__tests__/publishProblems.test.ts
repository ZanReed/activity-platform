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
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
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

    it('locating skips blocks nested in a worked/faded example (they are not column blocks)', () => {
        // A faded example's steps are fillInBlank nodes too, but the saved
        // document stores them under `content`, so index 0 of fill_in_blank is
        // the top-level question after it, not the first step.
        const ed = editorFor('```faded\nSubtract 3.\nx = {{4}}\ny = {{5}}\n```\n\nThe answer is {{7}}.');
        const p = { kind: 'math-gap-empty' as const, block: { type: 'fill_in_blank', index: 0 }, count: 1 };
        const pos = locateProblem(ed as never, p);
        expect(pos).not.toBeNull();
        const $pos = ed.state.doc.resolve(pos!);
        expect($pos.parent.type.name).toBe('column');
        expect(ed.state.doc.nodeAt(pos!)?.textContent).toContain('The answer is');
        expect(problemLabel(ed as never, p, pos)).toBe('Q2');
    });

    it('blocks in the reference panel or teacher guide are not counted as main-document blocks', () => {
        const mc = (correct: boolean) => ({ type: 'multiple_choice', choices: [{ correct }, { correct: false }] });
        const doc = {
            referencePanel: { blocks: [mc(false)] },
            sections: [{ rows: [{ columns: [{ blocks: [mc(true), mc(false)] }] }] }],
        };
        expect(findPublishProblems(doc)).toEqual([{ kind: 'mc-no-correct', block: { type: 'multiple_choice', index: 1 } }]);
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

    it('a DoL ticked before any skill is chosen survives a save and is refused at publish (author ruling 2026-11-13)', () => {
        const ed = editorFor('Intro.\n\n## Check {checkpoint}\n\nThe answer is {{7}}.');
        let breakPos = -1;
        ed.state.doc.forEach((node, offset) => {
            if (node.type.name === 'sectionBreak') breakPos = offset;
        });
        expect(breakPos).toBeGreaterThanOrEqual(0);
        const node = ed.state.doc.nodeAt(breakPos)!;
        // What the DoL panel stores when the box is ticked with no skills yet.
        ed.view.dispatch(ed.state.tr.setNodeMarkup(breakPos, undefined, { ...node.attrs, dol: { skills: [], retake: false } }));

        const saved = tiptapToActivity(ed.getJSON(), META);
        expect(saved.sections[1]?.dol).toEqual({ skills: [], retake: false });
        // ...and it comes back on reload.
        expect(JSON.stringify(activityToTiptap(saved))).toContain('"dol":{"skills":[],"retake":false}');

        const problems = findPublishProblems(saved);
        expect(problems).toEqual([{ kind: 'dol-no-skills', section: 1 }]);
        expect(locateProblem(ed as never, problems[0]!)).toBe(breakPos);
        expect(problemLabel(ed as never, problems[0]!, breakPos)).toBe('Section 2');
    });

    it('a pasted {checkpoint dol} with no dol_skills keeps its DoL and is refused at publish', () => {
        const ed = editorFor('Intro.\n\n## Check {checkpoint dol}\n\nThe answer is {{7}}.');
        const saved = tiptapToActivity(ed.getJSON(), META);
        expect(saved.sections[1]?.dol).toEqual({ skills: [], retake: false });
        expect(findPublishProblems(saved)).toEqual([{ kind: 'dol-no-skills', section: 1 }]);
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
