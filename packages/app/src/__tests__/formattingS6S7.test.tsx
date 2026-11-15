// @vitest-environment jsdom
// formattingS6S7.test.tsx — alignment, highlight and https links
// (schema-shortlist.md S6, S7): what the editor makes, the save keeps, and the
// importer brings in. The viewer half is viewer tests/formatting-s6-s7.test.tsx.
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { ActivityDocument, ActivityMeta } from '@activity/schema';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import LinkButton, { normalizeLinkInput } from '../editor/components/LinkButton';
import Toolbar from '../editor/Toolbar';

afterEach(cleanup);
let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});
const META = ActivityMeta.parse({ title: 'T', course: 'Y7' });
const saved = (e: Editor) => JSON.parse(JSON.stringify(tiptapToActivity(e.getJSON(), META)));
const firstBlock = (doc: { sections: { rows: { columns: { blocks: unknown[] }[] }[] }[] }) =>
    doc.sections[0]!.rows[0]!.columns[0]!.blocks[0] as Record<string, unknown>;

function editorWith(text: string) {
    return new Editor({
        extensions: buildEditorExtensions(),
        content: { type: 'doc', content: [{ type: 'row', content: [{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] }] }] },
    });
}

describe('alignment (S6-a)', () => {
    it('centre and right save as align; left saves nothing; it survives a round trip', () => {
        const e = editorWith('Title');
        e.commands.setTextSelection(3);
        e.commands.setTextAlign('center');
        const doc = saved(e);
        expect(firstBlock(doc).align).toBe('center');
        expect(firstBlock(tiptapToActivity(activityToTiptap(doc as never), META) as never).align).toBe('center');
        e.commands.setTextAlign('left');
        expect(firstBlock(saved(e))).not.toHaveProperty('align');
        e.destroy();
    });
});

describe('alignment is only offered where it is saved', () => {
    it('a list item\'s line cannot be aligned (it saves as inline text)', () => {
        const e = new Editor({
            extensions: buildEditorExtensions(),
            content: { type: 'doc', content: [{ type: 'row', content: [{ type: 'column', content: [
                { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item' }] }] }] },
            ] }] }] },
        });
        e.commands.setTextSelection(5);
        expect(e.commands.setTextAlign('center')).toBe(false);
        e.destroy();
    });
});

describe('highlight (S6-b)', () => {
    it('⌘⇧H toggles it, and it saves as a mark', () => {
        const e = editorWith('look here');
        e.commands.setTextSelection({ from: 3, to: 7 });
        e.commands.toggleHighlight();
        expect(JSON.stringify(saved(e))).toContain('{"type":"highlight"}');
        e.destroy();
    });
});

describe('links (S7)', () => {
    it('an https link saves with its address; the importer keeps https and drops other schemes', () => {
        const ok = convert('see [the site](https://example.com/a) and [bad](javascript:alert(1)) and [plain](http://example.com)');
        const e = new Editor({ extensions: buildEditorExtensions(), content: wrapBlocksStrict(ok.blocks) });
        const json = JSON.stringify(saved(e));
        expect(json).toContain('{"type":"link","href":"https://example.com/a"}');
        // markdown itself refuses a javascript: link (it stays literal text);
        // what matters is that no link to it exists.
        expect(json).not.toContain('"href":"javascript');
        expect(json).not.toContain('"href":"http://');
        expect(ok.warnings.join(' ')).toMatch(/Only https links are kept/);
        e.destroy();
    });

    it('the save itself refuses a non-https link, whatever wrote it (a paste, an old draft)', () => {
        const json = (href: string) => ({
            type: 'doc',
            content: [{ type: 'row', content: [{ type: 'column', content: [{ type: 'paragraph', content: [
                { type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href } }] },
            ] }] }] }],
        });
        expect(JSON.stringify(tiptapToActivity(json('javascript:alert(1)') as never, META))).not.toContain('"type":"link"');
        expect(JSON.stringify(tiptapToActivity(json('http://example.com') as never, META))).not.toContain('"type":"link"');
        expect(JSON.stringify(tiptapToActivity(json('https://example.com') as never, META))).toContain('"href":"https://example.com/"');
    });

    it('an odd spelling of https is saved canonical, so the schema accepts it (not an unsavable draft)', () => {
        const json = { type: 'doc', content: [{ type: 'row', content: [{ type: 'column', content: [{ type: 'paragraph', content: [
            { type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'Https://Example.com/A' } }] },
        ] }] }] }] };
        const doc = tiptapToActivity(json as never, META);
        expect(JSON.stringify(doc)).toContain('"href":"https://example.com/A"');
        expect(ActivityDocument.safeParse(doc).success).toBe(true);
    });

    it('the definition dialog has no Link button (a definition cannot hold a link)', () => {
        const e = editorWith('term');
        render(<Toolbar editor={e as never} variant="definition" />);
        expect(screen.queryByRole('button', { name: 'Link' })).toBeNull();
        e.destroy();
    });

    it('the link lands in the editor the box was opened for, even if the toolbar target moves', () => {
        const field = editorWith('hint text');
        const main = editorWith('main text');
        field.commands.setTextSelection({ from: 3, to: 7 });
        const { rerender } = render(<LinkButton target={field as never} />);
        fireEvent.click(screen.getByRole('button', { name: 'Link' }));
        // Typing in the box blurs the field; the toolbar falls back to main.
        rerender(<LinkButton target={main as never} />);
        fireEvent.change(screen.getByLabelText('Web address'), { target: { value: 'example.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add link' }));
        expect(JSON.stringify(field.getJSON())).toContain('https://example.com');
        expect(JSON.stringify(main.getJSON())).not.toContain('example.com');
        field.destroy();
        main.destroy();
    });

    it('a bare address becomes https; an explicit other scheme is left to be refused', () => {
        expect(normalizeLinkInput('example.com/page')).toBe('https://example.com/page');
        expect(normalizeLinkInput('http://example.com')).toBe('http://example.com');
        expect(normalizeLinkInput('javascript:alert(1)')).toBe('javascript:alert(1)');
        expect(normalizeLinkInput('example.com:8080/x')).toBe('https://example.com:8080/x');
    });

    it('the Link box refuses http and adds an https link to the selection', () => {
        const e = editorWith('read this page');
        e.commands.setTextSelection({ from: 6, to: 10 });
        render(<LinkButton target={e as never} />);
        fireEvent.click(screen.getByRole('button', { name: 'Link' }));
        const input = screen.getByLabelText('Web address');
        fireEvent.change(input, { target: { value: 'http://example.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add link' }));
        expect(screen.getByRole('alert')).toHaveTextContent('https://');
        fireEvent.change(input, { target: { value: 'example.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add link' }));
        expect(JSON.stringify(saved(e))).toContain('"href":"https://example.com/"');
        e.destroy();
    });
});
