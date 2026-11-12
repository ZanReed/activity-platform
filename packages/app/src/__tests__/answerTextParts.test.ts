// A faded worked example's steps each held one blank, and both answers were
// labelled "Q4" in the teacher's answer panel (playtest sweep 2026-11-12):
// blanks were numbered per CHILD block. Items across several child blocks of
// one question are now numbered as parts of it.
import { describe, expect, it } from 'vitest';
import type { ActivityDocument } from '@activity/schema';
import { indexDoc, questionLabel } from '../lib/answerText';

const blankPara = (id: string) => ({
    id: `fib-${id}`,
    type: 'fill_in_blank',
    content: [{ type: 'text', text: 'x = ' }, { type: 'blank', id }],
});

function doc(top: unknown): ActivityDocument {
    return {
        sections: [{ id: 's1', title: 'S', rows: [{ id: 'r1', columns: [{ id: 'c1', blocks: [top] }] }] }],
    } as unknown as ActivityDocument;
}

describe('answer labels inside one question', () => {
    it('steps of a faded example get distinct part labels', () => {
        const index = indexDoc(
            doc({ id: 'fwe', type: 'faded_worked_example', title: 'Ex', content: [blankPara('b1'), blankPara('b2')] }),
        );
        const labels = index.bySection.s1!.map((p) => questionLabel(index, p));
        expect(labels).toEqual(['Q1 · part 1', 'Q1 · part 2']);
    });

    it('several blanks in ONE block keep their blank numbers', () => {
        const index = indexDoc(
            doc({ id: 'fib', type: 'fill_in_blank', content: [{ type: 'blank', id: 'a' }, { type: 'text', text: ' and ' }, { type: 'blank', id: 'b' }] }),
        );
        const labels = index.bySection.s1!.map((p) => questionLabel(index, p));
        expect(labels).toEqual(['Q1 · blank 1', 'Q1 · blank 2']);
    });
});
