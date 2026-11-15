// @vitest-environment jsdom
// questionHint.test.ts — the authoring half of a question hint (S3,
// schema-shortlist.md): the `hint:` fence line, the save, and the drawer field.
// The grading half is viewer tests/question-hint.test.ts.
import { beforeAll, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import { ActivityMeta } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import { controlsFor } from '../editor/blockControls';

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});
const META = ActivityMeta.parse({ title: 'T', course: 'Y7' });

const FENCES = {
    mc: ['```mc', 'prompt: Which?', '(x) 4', '( ) 5', 'hint: Count the ones again.', '```'],
    match: ['```match', 'prompt: Match', 'a = 1', 'b = 2', 'hint: Count the ones again.', '```'],
    order: ['```order', 'prompt: Order', 'first', 'second', 'hint: Count the ones again.', '```'],
};

function firstQuestion(md: string) {
    const editor = new Editor({ extensions: buildEditorExtensions(), content: wrapBlocksStrict(convert(md).blocks) });
    const doc = tiptapToActivity(editor.getJSON(), META);
    editor.destroy();
    return { doc, block: JSON.parse(JSON.stringify(doc)).sections[0].rows[0].columns[0].blocks[0] };
}

describe.each(Object.entries(FENCES))('```%s', (_name, lines) => {
    it('hint: lands on the block, and survives a round trip', () => {
        const { doc, block } = firstQuestion(lines.join('\n'));
        expect(JSON.stringify(block.hint)).toContain('Count the ones again.');
        expect(JSON.stringify(tiptapToActivity(activityToTiptap(doc), META))).toContain('Count the ones again.');
    });

    it('no hint: line means no hint key', () => {
        const { block } = firstQuestion(lines.filter((l) => !l.startsWith('hint:')).join('\n'));
        expect(block).not.toHaveProperty('hint');
    });
});

describe('the drawer', () => {
    it.each(['multipleChoice', 'matching', 'ordering'])('%s has a Hint field', (type) => {
        const labels = controlsFor(type)!.advanced!.flatMap((g) => g.fields.map((f) => f.label));
        expect(labels).toContain('Hint');
    });

    it.each(['fillInBlank', 'correspondence'])('%s has none (blanks hint per blank)', (type) => {
        const labels = controlsFor(type)!.advanced!.flatMap((g) => g.fields.map((f) => f.label));
        expect(labels).not.toContain('Hint');
    });
});
