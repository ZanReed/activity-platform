// @vitest-environment jsdom
// =============================================================================
// editorBatch6.test.tsx — the editor shortlist of 2026-11-15:
//   find and replace (main text + answer fields, one undo, answers untouched),
//   ⌘D duplicate, the shortcuts list, the graph figure's alt/caption fields,
//   picture upload under a choice, and the nested field showing outside edits.
// Each reads the SAVED document where saving is the point.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { ActivityMeta } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { tiptapToActivity } from '../lib/serialize';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { countInFields, findInDoc, replaceAll } from '../editor/findReplace';
import { findHighlightKey } from '../editor/extensions/FindHighlight';
import { controlsFor } from '../editor/blockControls';
import { SHORTCUT_GROUPS } from '../editor/shortcutList';
import { ChoiceFigureEditor } from '../editor/nodeViews/MultipleChoiceView';
import { ImageUploadContext } from '../editor/components/imageUpload';
import InlineRichTextEditor from '../editor/components/InlineRichTextEditor';
import FindReplaceBar from '../editor/components/FindReplaceBar';

afterEach(cleanup);

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});
const META = ActivityMeta.parse({ title: 'T', course: 'Y9' });

function editorFor(md: string): Editor {
    return new Editor({ extensions: buildEditorExtensions(), content: wrapBlocksStrict(convert(md).blocks) });
}
const saved = (e: Editor) => JSON.stringify(tiptapToActivity(e.getJSON(), META));

const MD = [
    'Sam buys 3 apples. How many does sam have? {{3|?Count what Sam bought}}',
    '',
    '```mc',
    'prompt: Who has more, Sam or Ana?',
    '(x) Sam',
    '( ) Ana',
    '```',
    '',
    'Name the boy: {{Sam}}',
].join('\n');

describe('find and replace', () => {
    it('finds in the main text and counts what sits in answer fields', () => {
        const e = editorFor(MD);
        const opts = { matchCase: true };
        // "Sam buys" and the MC prompt are text; "Name the boy: {{Sam}}" is not
        // (the blank's answer is an answer key, not prose).
        expect(findInDoc(e.state.doc, 'Sam', opts)).toHaveLength(2);
        expect(findInDoc(e.state.doc, 'Sam', { matchCase: false })).toHaveLength(3); // + "sam have"
        // Fields: the choice "Sam" and the blank's hint. Not the answer.
        expect(countInFields(e.state.doc, 'Sam', opts)).toBe(2);
        e.destroy();
    });

    it('replace all reaches text and fields in one undo step, and never changes an answer', () => {
        const e = editorFor(MD);
        // Tiptap JSON, not the saved document: tiptapToActivity mints fresh ids.
        const before = JSON.stringify(e.getJSON());
        const tr = e.state.tr;
        const n = replaceAll(tr, 'Sam', 'Priya', { matchCase: true });
        e.view.dispatch(tr);
        const after = saved(e);
        expect(n).toBe(4);
        expect(after).not.toContain('Sam buys');
        expect(after).toContain('Priya buys');
        expect(after).toContain('"text":"Priya"'); // the choice
        expect(after).toContain('Who has more, Priya or Ana?');
        expect(after).toContain('Count what Priya bought'); // the hint
        // The blank's accepted answer is an answer key, not prose.
        expect(after).toContain('"answer":"Sam"');
        expect(findInDoc(e.state.doc, 'Sam', { matchCase: true })).toHaveLength(0);
        // One undo puts every one back.
        e.commands.undo();
        expect(JSON.stringify(e.getJSON())).toBe(before);
        e.destroy();
    });

    it('reaches prose kept as a plain setting: alt text and captions', () => {
        const e = editorFor('```figure\naxis: -5..5, -5..5\nalt: Sam drew a point\ncaption: Sam\npoint (1, 2)\n```');
        expect(countInFields(e.state.doc, 'Sam', { matchCase: true })).toBe(2);
        const tr = e.state.tr;
        replaceAll(tr, 'Sam', 'Priya', { matchCase: true });
        e.view.dispatch(tr);
        expect(saved(e)).toContain('"alt":"Priya drew a point"');
        expect(saved(e)).toContain('"caption":"Priya"');
        e.destroy();
    });

    it('highlights follow the query and the document', () => {
        const e = editorFor(MD);
        e.view.dispatch(e.state.tr.setMeta(findHighlightKey, { query: 'apples', opts: { matchCase: false }, current: 0 }));
        expect(findHighlightKey.getState(e.state)?.matches).toHaveLength(1);
        expect(e.view.dom.querySelectorAll('.find-match--current')).toHaveLength(1);
        e.commands.insertContentAt(1, 'apples ');
        expect(findHighlightKey.getState(e.state)?.matches).toHaveLength(2);
        e.view.dispatch(e.state.tr.setMeta(findHighlightKey, { query: '' }));
        expect(e.view.dom.querySelectorAll('.find-match')).toHaveLength(0);
        e.destroy();
    });
});

describe('⌘D duplicates the block the cursor is in', () => {
    it('copies it below and keeps the cursor at the same place in the copy', () => {
        const e = editorFor('First line\n\nSecond line');
        const firstText = findInDoc(e.state.doc, 'First', { matchCase: true })[0]!;
        e.commands.setTextSelection(firstText.from + 2);
        const ev = new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, bubbles: true, cancelable: true });
        e.view.dom.dispatchEvent(ev);
        expect(ev.defaultPrevented).toBe(true);
        expect(findInDoc(e.state.doc, 'First line', { matchCase: true })).toHaveLength(2);
        const copies = findInDoc(e.state.doc, 'First line', { matchCase: true });
        // The caret is in the copy (the second one), two characters in.
        expect(e.state.selection.from).toBe(copies[1]!.from + 2);
        e.destroy();
    });
});

describe('the find bar', () => {
    it('Replace moves on past the new text, even when it contains the query', async () => {
        const e = editorFor('Sam and Sam went.');
        render(<FindReplaceBar editor={e as never} onClose={() => {}} />);
        fireEvent.change(screen.getByLabelText('Find'), { target: { value: 'Sam' } });
        fireEvent.change(screen.getByLabelText('Replace with'), { target: { value: 'Samuel' } });
        await waitFor(() => expect(findHighlightKey.getState(e.state)?.matches).toHaveLength(2));
        fireEvent.click(screen.getByRole('button', { name: 'Replace' }));
        fireEvent.click(screen.getByRole('button', { name: 'Replace' }));
        expect(e.state.doc.textContent).toContain('Samuel and Samuel went.');
        e.destroy();
    });

    it('Escape closes it and clears the highlights', async () => {
        const e = editorFor('Sam went.');
        const onClose = vi.fn();
        const { unmount } = render(<FindReplaceBar editor={e as never} onClose={onClose} />);
        fireEvent.change(screen.getByLabelText('Find'), { target: { value: 'Sam' } });
        await waitFor(() => expect(findHighlightKey.getState(e.state)?.matches).toHaveLength(1));
        fireEvent.keyDown(screen.getByLabelText('Find'), { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
        unmount();
        expect(findHighlightKey.getState(e.state)?.matches).toHaveLength(0);
        e.destroy();
    });
});

describe('the shortcuts list', () => {
    it('has a row for each shortcut this app binds itself', () => {
        const keys = SHORTCUT_GROUPS.flatMap((g) => g.rows.map((r) => r[0]));
        expect(keys).toEqual(expect.arrayContaining(['⌘D', '⌘F', '⌘/', '⌘⇧B', '⌘⇧↑  ⌘⇧↓']));
    });
});

describe('graph figure alt text and caption', () => {
    it('are drawer fields, and an emptied field saves no alt', () => {
        const e = editorFor('```figure\naxis: -5..5, -5..5\npoint (1, 2)\n```');
        let pos = -1;
        e.state.doc.descendants((n, p) => {
            if (n.type.name === 'graphFigure') pos = p;
        });
        expect(pos).toBeGreaterThanOrEqual(0);
        const fields = controlsFor('graphFigure')!.advanced!.flatMap((g) => g.fields);
        const alt = fields.find((f) => f.label === 'Alt text')!;
        const caption = fields.find((f) => f.label === 'Caption')!;
        if (alt.kind !== 'text' || caption.kind !== 'text') throw new Error('expected text fields');
        alt.set(e, pos, 'A point at (1, 2)');
        caption.set(e, pos, 'Figure A');
        expect(saved(e)).toContain('"alt":"A point at (1, 2)"');
        expect(saved(e)).toContain('"caption":"Figure A"');
        alt.set(e, pos, '  ');
        expect(saved(e)).not.toContain('"alt"');
        e.destroy();
    });
});

describe('a choice figure can be uploaded', () => {
    const choice = { id: 'c1', image: { src: '', alt: '' } };

    it('uploads the picked file and stores its URL', async () => {
        const upload = vi.fn(() => Promise.resolve('https://cdn.example/x.png'));
        const onImage = vi.fn();
        render(
            <ImageUploadContext.Provider value={upload}>
                <ChoiceFigureEditor choice={choice} label="choice A" disabled={false} onImage={onImage} onGraph={() => {}} />
            </ImageUploadContext.Provider>,
        );
        expect(screen.getByRole('button', { name: 'Upload a picture for choice A' })).toBeInTheDocument();
        const file = new File(['x'], 'x.png', { type: 'image/png' });
        fireEvent.change(document.querySelector('[data-figure-file]')!, { target: { files: [file] } });
        await waitFor(() => expect(onImage).toHaveBeenCalledWith({ src: 'https://cdn.example/x.png', alt: '' }));
        expect(upload).toHaveBeenCalledWith(file);
    });

    it('an edit made during the upload survives it', async () => {
        let finish: (url: string) => void = () => undefined;
        const upload = vi.fn(() => new Promise<string>((r) => (finish = r)));
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = render(
            <ImageUploadContext.Provider value={upload}>
                <ChoiceFigureEditor choice={choice} label="choice A" disabled={false} onImage={first} onGraph={() => {}} />
            </ImageUploadContext.Provider>,
        );
        fireEvent.change(document.querySelector('[data-figure-file]')!, {
            target: { files: [new File(['x'], 'x.png', { type: 'image/png' })] },
        });
        // The teacher types alt text while it uploads; the block re-renders.
        rerender(
            <ImageUploadContext.Provider value={upload}>
                <ChoiceFigureEditor
                    choice={{ id: 'c1', image: { src: '', alt: 'A red square' } }}
                    label="choice A"
                    disabled={false}
                    onImage={second}
                    onGraph={() => {}}
                />
            </ImageUploadContext.Provider>,
        );
        finish('https://cdn.example/x.png');
        await waitFor(() => expect(second).toHaveBeenCalledWith({ src: 'https://cdn.example/x.png', alt: 'A red square' }));
        expect(first).not.toHaveBeenCalled();
    });

    it('says why an upload failed', async () => {
        const upload = vi.fn(() => Promise.reject(new Error('Image too large (max 10 MB).')));
        render(
            <ImageUploadContext.Provider value={upload}>
                <ChoiceFigureEditor choice={choice} label="choice A" disabled={false} onImage={() => {}} onGraph={() => {}} />
            </ImageUploadContext.Provider>,
        );
        fireEvent.change(document.querySelector('[data-figure-file]')!, {
            target: { files: [new File(['x'], 'x.png', { type: 'image/png' })] },
        });
        expect(await screen.findByRole('alert')).toHaveTextContent('Image too large (max 10 MB).');
    });

    it('offers no upload where there is no activity to file it under', () => {
        render(<ChoiceFigureEditor choice={choice} label="choice A" disabled={false} onImage={() => {}} onGraph={() => {}} />);
        expect(screen.queryByRole('button', { name: /Upload a picture/ })).toBeNull();
        expect(screen.getByText('Image URL')).toBeInTheDocument();
    });
});

describe('a nested field shows a change made from outside', () => {
    it('takes the new value without writing it back', async () => {
        const onChange = vi.fn();
        const v1 = [{ type: 'text' as const, text: 'Sam', marks: [] }];
        const v2 = [{ type: 'text' as const, text: 'Priya', marks: [] }];
        const { rerender, container } = render(<InlineRichTextEditor value={v1} onChange={onChange} ariaLabel="Choice A" />);
        await waitFor(() => expect(container.textContent).toContain('Sam'));
        rerender(<InlineRichTextEditor value={v2} onChange={onChange} ariaLabel="Choice A" />);
        await waitFor(() => expect(container.textContent).toContain('Priya'));
        // Setting it from outside is not an edit: nothing is written back.
        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps what is typed when the parent re-renders with the same value', async () => {
        // The definition popover's pattern: value stays [] (a fresh array each
        // render) while the draft lives elsewhere.
        const { rerender, container } = render(<InlineRichTextEditor value={[]} onChange={() => {}} ariaLabel="Definition" />);
        await waitFor(() => expect(container.querySelector('.ProseMirror')).not.toBeNull());
        const field = (container.querySelector('.ProseMirror') as unknown as { editor: Editor }).editor;
        field.commands.insertContent('a polygon with three sides');
        rerender(<InlineRichTextEditor value={[]} onChange={() => {}} ariaLabel="Definition" />);
        expect(container.textContent).toContain('a polygon with three sides');
    });
});
