// @vitest-environment jsdom
// =============================================================================
// rowMoveButtons.test.tsx — Move up / Move down on answer lists (multiple
// choice, matching items and options, correspondence items and cards). Each
// test reads the SAVED document, so a move that only repaints the editor fails.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/react';
import type { ComponentType } from 'react';
import { ActivityMeta } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { tiptapToActivity } from '../lib/serialize';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { moveAt } from '../editor/nodeViews/RowMoveButtons';
import MultipleChoiceView from '../editor/nodeViews/MultipleChoiceView';
import MatchingView from '../editor/nodeViews/MatchingView';
import CorrespondenceView from '../editor/nodeViews/CorrespondenceView';

afterEach(cleanup);

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});
const META = ActivityMeta.parse({ title: 'M', course: 'Y9' });

function mount(md: string, type: string, View: ComponentType<NodeViewProps>): Editor {
    const editor = new Editor({ extensions: buildEditorExtensions(), content: wrapBlocksStrict(convert(md).blocks) });
    let pos = -1;
    editor.state.doc.descendants((n, p) => {
        if (pos < 0 && n.type.name === type) pos = p;
        return pos < 0;
    });
    const props = () =>
        ({
            node: editor.state.doc.nodeAt(pos)!,
            editor,
            getPos: () => pos,
            updateAttributes: (attrs: Record<string, unknown>) =>
                editor.commands.command(({ tr }) => {
                    tr.setNodeMarkup(pos, undefined, { ...editor.state.doc.nodeAt(pos)!.attrs, ...attrs });
                    return true;
                }),
            selected: false,
            extension: { options: {} },
        }) as unknown as NodeViewProps;
    const view = render(<View {...props()} />);
    editor.on('transaction', () => view.rerender(<View {...props()} />));
    return editor;
}

// The first block of the saved document, whatever grid wraps it.
function savedBlock(editor: Editor): Record<string, unknown> {
    const doc = tiptapToActivity(editor.getJSON(), META) as unknown as { rows?: unknown };
    let found: Record<string, unknown> | undefined;
    const walk = (v: unknown) => {
        if (found || !v || typeof v !== 'object') return;
        const o = v as Record<string, unknown>;
        if (o.type === 'multiple_choice' || o.type === 'matching' || o.type === 'correspondence') {
            found = o;
            return;
        }
        Object.values(o).forEach(walk);
    };
    walk(doc);
    if (!found) throw new Error('no question block in the saved document');
    return found;
}
const text = (content: unknown) => JSON.stringify(content).match(/"text":"([^"]*)"/g)?.join('') ?? '';

describe('moveAt', () => {
    it('moves one place and refuses past either end', () => {
        expect(moveAt(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
        expect(moveAt(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
        expect(moveAt(['a', 'b'], 0, -1)).toBeNull();
        expect(moveAt(['a', 'b'], 1, 1)).toBeNull();
    });
});

describe('multiple choice', () => {
    const MC = ['```mc', 'prompt: Which is the unit rate?', '( ) $12', '(x) $3 per kg', '( ) None of these', '```'].join('\n');

    it('moves a choice; the correct choice travels with it', () => {
        const editor = mount(MC, 'multipleChoice', MultipleChoiceView);
        expect((screen.getByRole('button', { name: 'Move choice A up' }) as HTMLButtonElement).disabled).toBe(true);
        expect((screen.getByRole('button', { name: 'Move choice C down' }) as HTMLButtonElement).disabled).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: 'Move choice B up' }));
        const choices = savedBlock(editor).choices as { content: unknown; correct: boolean }[];
        expect(choices.map((c) => text(c.content))).toEqual(['"text":"$3 per kg"', '"text":"$12"', '"text":"None of these"']);
        expect(choices.map((c) => c.correct)).toEqual([true, false, false]);
        editor.destroy();
    });

    it('keeps keyboard focus on the moved row', async () => {
        const editor = mount(MC, 'multipleChoice', MultipleChoiceView);
        const down = screen.getByRole('button', { name: 'Move choice A down' });
        down.focus();
        fireEvent.click(down);
        // Still mid-list: the same direction keeps focus.
        await waitFor(() => expect(document.activeElement?.getAttribute('aria-label')).toBe('Move choice B down'));
        fireEvent.click(document.activeElement!);
        // At the end, down disables, so focus goes to up.
        await waitFor(() => expect(document.activeElement?.getAttribute('aria-label')).toBe('Move choice C up'));
        editor.destroy();
    });
});

describe('matching', () => {
    const MATCH = ['```match', 'prompt: Match each equation to its slope.', 'y = 2x = 2', 'y = -x = -1', '= 0', '```'].join('\n');

    it('moves an item and an option; the answer key still pairs them', () => {
        const editor = mount(MATCH, 'matching', MatchingView);
        fireEvent.click(screen.getByRole('button', { name: 'Move item 2 up' }));
        fireEvent.click(screen.getByRole('button', { name: 'Move option 3 up' }));
        const block = savedBlock(editor) as {
            items: { id: string; content: unknown }[];
            targets: { id: string; content: unknown }[];
            key: Record<string, string>;
        };
        expect(block.items.map((i) => text(i.content))).toEqual(['"text":"y = -x"', '"text":"y = 2x"']);
        expect(block.targets.map((t) => text(t.content))).toEqual(['"text":"2"', '"text":"0"', '"text":"-1"']);
        const optionFor = (item: number) =>
            text(block.targets.find((t) => t.id === block.key[block.items[item]!.id])?.content);
        expect(optionFor(0)).toBe('"text":"-1"');
        expect(optionFor(1)).toBe('"text":"2"');
        editor.destroy();
    });
});

describe('correspondence', () => {
    const CORR = [
        '```correspond',
        'prompt: Match each function to its graph and its description.',
        'columns: Graph | Description',
        'y = 2x | rises | doubles',
        'y = -x | falls | drops',
        '```',
    ].join('\n');

    it('moves an item and a card', () => {
        const editor = mount(CORR, 'correspondence', CorrespondenceView);
        fireEvent.click(screen.getByRole('button', { name: 'Move item 1 down' }));
        fireEvent.click(screen.getByRole('button', { name: 'Move column 1 card 2 up' }));
        const block = savedBlock(editor) as {
            items: { content: unknown }[];
            targetColumns: { targets: { content: unknown }[] }[];
        };
        expect(block.items.map((i) => text(i.content))).toEqual(['"text":"y = -x"', '"text":"y = 2x"']);
        expect(block.targetColumns[0]!.targets.map((t) => text(t.content))).toEqual(['"text":"falls"', '"text":"rises"']);
        editor.destroy();
    });
});
