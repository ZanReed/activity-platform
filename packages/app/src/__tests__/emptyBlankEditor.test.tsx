// @vitest-environment jsdom
// =============================================================================
// emptyBlankEditor.test.tsx — the editor side of G-2: an empty blank chip says
// "needs an answer", and the publish refusal's "Show me" selects that blank.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import type { NodeViewProps } from '@tiptap/react';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { buildEditorExtensions } from '../editor/editorExtensions';
import BlankView from '../editor/nodeViews/BlankView';
import { selectBlankById } from '../editor/selectBlankById';

afterEach(cleanup);

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

function chip(answer: string) {
    const props = { node: { attrs: { id: 'b1', answer, acceptableAnswers: [] } }, selected: false } as unknown as NodeViewProps;
    return render(<BlankView {...props} />).container.querySelector('.blank-chip') as HTMLElement;
}

describe('an empty blank in the editor (G-2)', () => {
    it('the chip says it needs an answer, and an answered one shows its answer', () => {
        const empty = chip('');
        expect(empty).toHaveClass('is-empty');
        expect(empty).toHaveTextContent('needs an answer');
        cleanup();
        const full = chip('450');
        expect(full).not.toHaveClass('is-empty');
        expect(full).toHaveTextContent('450');
    });

    it('"Show me" selects the blank by its id, and says false when it is gone', () => {
        const editor = new Editor({
            extensions: buildEditorExtensions(),
            content: wrapBlocksStrict(convert('45 × 10 = {{450}} and 36 ÷ 4 = {{9}}').blocks),
        });
        const ids: string[] = [];
        editor.state.doc.descendants((n) => {
            if (n.type.name === 'blank') ids.push(n.attrs.id as string);
        });
        expect(ids.length).toBe(2);
        expect(selectBlankById(editor, ids[1]!)).toBe(true);
        const sel = editor.state.selection;
        expect(sel).toBeInstanceOf(NodeSelection);
        expect((sel as NodeSelection).node.attrs.id).toBe(ids[1]);
        expect(selectBlankById(editor, 'no-such-blank')).toBe(false);
        editor.destroy();
    });
});
