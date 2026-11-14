// @vitest-environment jsdom
// =============================================================================
// formGui.test.tsx — form grading's GUI (form-grading.md "The GUI", FG-10):
// insert / edit (the Equivalence choice), the wrong-form message field that
// writes `!form-wrong`, remove (back to "Any equal form"), and the chip badge.
// Every capability ships with a GUI (CLAUDE.md, 2026-11-12).
// =============================================================================

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/react';
import { ActivityMeta } from '@activity/schema';
import BlankEditPopover from '../editor/components/BlankEditPopover';
import BlankView from '../editor/nodeViews/BlankView';
import { formWrongOf, mistakeRowsOf } from '../editor/components/blankPopoverLogic';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { tiptapToActivity, activityToTiptap } from '../lib/serialize';

vi.mock('../lib/misconceptionList', async (orig) => ({
    ...(await orig<typeof import('../lib/misconceptionList')>()),
    fetchMisconceptionList: () =>
        Promise.resolve([{ id: 'mis.factorise.not-highest', description: 'Takes out a common factor that is not the highest' }]),
}));

afterEach(cleanup);

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const para = (text: string) => [{ type: 'text', text, marks: [] }];

function popover(opts: {
    equivalence?: 'value' | 'form';
    mistakes?: Array<{ match: string; feedback: unknown[]; misconceptionId?: string }>;
    onChange?: (attrs: Record<string, unknown>) => void;
}) {
    const onChange = opts.onChange ?? vi.fn();
    const anchor = document.createElement('span');
    document.body.appendChild(anchor);
    render(
        <BlankEditPopover
            referenceElement={anchor}
            isOpen
            blankId="b1"
            initialAnswer="6(3x-2)"
            initialAcceptableAnswers={[]}
            initialHint={undefined}
            initialMistakeFeedback={opts.mistakes as never}
            initialInterchangeable={false}
            initialAnswerType="math"
            initialTolerance={undefined}
            initialUnit={undefined}
            initialAcceptableUnits={undefined}
            initialEquivalence={opts.equivalence}
            canGroupWithPrevious={false}
            onChange={onChange}
            onClose={() => {}}
        />,
    );
    return onChange as ReturnType<typeof vi.fn>;
}

// The popover is visibility-hidden until floating-ui positions it, which jsdom
// never does, so these queries go by text / label, not by accessible role.
const openAdvanced = () => {
    const add = screen.queryByText(/Advanced options/);
    if (add) fireEvent.click(add);
};

describe('the Equivalence choice (insert / edit)', () => {
    it('offers "Any equal form" and "Equal, and in this form"; "Exact form only" is gone', () => {
        popover({});
        const select = screen.getByLabelText('Math equivalence mode') as HTMLSelectElement;
        expect([...select.options].map((o) => [o.value, o.textContent?.trim()])).toEqual([
            ['value', 'Any equal form'],
            ['form', 'Equal, and in this form'],
        ]);
        expect(screen.queryByText(/Exact form only/)).toBeNull();
    });
    it('choosing the form writes equivalence: form and shows the helper line', () => {
        const onChange = popover({});
        fireEvent.change(screen.getByLabelText('Math equivalence mode'), { target: { value: 'form' } });
        expect(onChange).toHaveBeenLastCalledWith({ equivalence: 'form' });
        expect(document.querySelector('[data-form-help]')).toHaveTextContent('2(9x-6) is wrong for 6(3x-2)');
    });
});

describe('the wrong-form message (writes !form-wrong)', () => {
    it('is shown only for a form blank, and the reserved entry is not listed as a mistake row', () => {
        popover({
            equivalence: 'form',
            mistakes: [
                { match: '2(9x-6)', feedback: para('Not the highest.') },
                { match: 'form-wrong', feedback: para('Write it as one product.'), misconceptionId: 'mis.factorise.not-highest' },
            ],
        });
        openAdvanced();
        expect(document.querySelector('[data-form-wrong-field]')).not.toBeNull();
        const rows = screen.getAllByLabelText('Wrong answer to match') as HTMLInputElement[];
        expect(rows.map((r) => r.value)).toEqual(['2(9x-6)', '']);
        expect(screen.getByText(/matches in any order/)).toBeInTheDocument();
        cleanup();
        popover({ equivalence: 'value', mistakes: [{ match: '7', feedback: para('x') }] });
        openAdvanced();
        expect(document.querySelector('[data-form-wrong-field]')).toBeNull();
    });
    it('a row edit keeps the reserved entry in the committed list', () => {
        const onChange = popover({
            equivalence: 'form',
            mistakes: [
                { match: '2(9x-6)', feedback: para('a') },
                { match: 'form-wrong', feedback: para('b') },
            ],
        });
        openAdvanced();
        fireEvent.change(screen.getAllByLabelText('Wrong answer to match')[0]!, { target: { value: '3(6x-4)' } });
        expect(onChange).toHaveBeenLastCalledWith({
            mistakeFeedback: [
                { match: '3(6x-4)', feedback: para('a') },
                { match: 'form-wrong', feedback: para('b') },
            ],
        });
    });
    it('a misconception on the wrong-form field alone writes the entry (empty prose = the built-in line)', async () => {
        const onChange = popover({ equivalence: 'form' });
        openAdvanced();
        fireEvent.click(await screen.findByLabelText('Add a misconception to an equal answer in the wrong form'));
        fireEvent.change(await screen.findByLabelText('Search misconceptions for an equal answer in the wrong form'), {
            target: { value: 'highest' },
        });
        fireEvent.click((await screen.findByLabelText('Matching misconceptions')).querySelector('button')!);
        const last = onChange.mock.calls.at(-1)![0] as { mistakeFeedback: Array<Record<string, unknown>> };
        expect(last.mistakeFeedback).toEqual([
            { match: 'form-wrong', feedback: [], misconceptionId: 'mis.factorise.not-highest' },
        ]);
    });
});

describe('the wrong-form PROSE path (step-4 review)', () => {
    const fieldEditor = () =>
        (document.querySelector('[data-form-wrong-field] .ProseMirror') as unknown as { editor?: { commands: { insertContent: (c: string) => void } } })
            ?.editor;
    it('typed prose writes the entry, and survives a later row edit', async () => {
        const onChange = popover({ equivalence: 'form', mistakes: [{ match: '2(9x-6)', feedback: para('a') }] });
        openAdvanced();
        const ed = await vi.waitFor(() => {
            const e = fieldEditor();
            if (!e) throw new Error('no editor yet');
            return e;
        });
        act(() => ed.commands.insertContent('One product, please.'));
        await vi.waitFor(() => {
            const last = onChange.mock.calls.at(-1)?.[0] as { mistakeFeedback?: Array<{ match: string }> } | undefined;
            expect(last?.mistakeFeedback?.map((m) => m.match)).toEqual(['2(9x-6)', 'form-wrong']);
        });
        fireEvent.change(screen.getAllByLabelText('Wrong answer to match')[0]!, { target: { value: '3(6x-4)' } });
        const last = onChange.mock.calls.at(-1)![0] as { mistakeFeedback: Array<{ match: string; feedback: unknown[] }> };
        expect(last.mistakeFeedback.map((m) => m.match)).toEqual(['3(6x-4)', 'form-wrong']);
        expect(JSON.stringify(last.mistakeFeedback[1]!.feedback)).toContain('One product, please.');
    });
    it('a typed "form-wrong" row never doubles the reserved entry', () => {
        const onChange = popover({ equivalence: 'form', mistakes: [{ match: 'form-wrong', feedback: para('b') }] });
        openAdvanced();
        fireEvent.change(screen.getAllByLabelText('Wrong answer to match')[0]!, { target: { value: 'form-wrong' } });
        const last = onChange.mock.calls.at(-1)![0] as { mistakeFeedback: Array<{ match: string }> };
        expect(last.mistakeFeedback.filter((m) => m.match === 'form-wrong')).toHaveLength(1);
    });
    it('on a TEXT blank a literal form-wrong is an ordinary, visible row', () => {
        const anchor = document.createElement('span');
        document.body.appendChild(anchor);
        render(
            <BlankEditPopover
                referenceElement={anchor} isOpen blankId="t1" initialAnswer="Paris" initialAcceptableAnswers={[]}
                initialHint={undefined} initialMistakeFeedback={[{ match: 'form-wrong', feedback: para('x') }] as never}
                initialInterchangeable={false} initialAnswerType="text" initialTolerance={undefined}
                initialUnit={undefined} initialAcceptableUnits={undefined} initialEquivalence={undefined}
                canGroupWithPrevious={false} onChange={() => {}} onClose={() => {}}
            />,
        );
        const rows = screen.getAllByLabelText('Wrong answer to match') as HTMLInputElement[];
        expect(rows.map((r) => r.value)).toEqual(['form-wrong', '']);
    });
});

describe('remove', () => {
    it('back to "Any equal form" drops the form flag and the wrong-form entry, keeping the other rows', () => {
        const onChange = popover({
            equivalence: 'form',
            mistakes: [
                { match: '2(9x-6)', feedback: para('a') },
                { match: 'form-wrong', feedback: para('b') },
            ],
        });
        fireEvent.change(screen.getByLabelText('Math equivalence mode'), { target: { value: 'value' } });
        expect(onChange).toHaveBeenLastCalledWith({
            equivalence: undefined,
            mistakeFeedback: [{ match: '2(9x-6)', feedback: para('a') }],
        });
    });
    it('switching the blank to text drops it too', () => {
        const onChange = popover({ equivalence: 'form', mistakes: [{ match: 'form-wrong', feedback: para('b') }] });
        fireEvent.click(screen.getByLabelText('Text'));
        expect(onChange.mock.calls.at(-1)![0]).toMatchObject({ answerType: 'text', equivalence: undefined, mistakeFeedback: undefined });
    });
});

describe('the chip badge (visible state)', () => {
    const chip = (attrs: Record<string, unknown>) =>
        render(<BlankView {...({ node: { attrs: { id: 'b1', acceptableAnswers: [], ...attrs } }, selected: false } as unknown as NodeViewProps)} />)
            .container.querySelector('.blank-chip') as HTMLElement;
    it('a form blank shows "form"; a value math blank does not', () => {
        const form = chip({ answer: '12ab', answerType: 'math', equivalence: 'form' });
        expect(form.querySelector('[data-form-badge]')).toHaveTextContent('form');
        expect(form).toHaveClass('is-form');
        cleanup();
        expect(chip({ answer: '2a', answerType: 'math' }).querySelector('[data-form-badge]')).toBeNull();
    });
});

describe('end to end through the editor document', () => {
    it('an imported {{===…}} blank loads into the editor and saves back as form, with its !form-wrong', () => {
        const editor = new Editor({
            extensions: buildEditorExtensions(),
            content: wrapBlocksStrict(convert('Factorise: {{===6(3x-2) | !form-wrong :: One product. :: mis.x}}').blocks),
        });
        const meta = ActivityMeta.parse({ title: 't' });
        const doc = tiptapToActivity(editor.getJSON(), meta);
        const text = JSON.stringify(doc);
        expect(text).toContain('"equivalence":"form"');
        expect(text).toContain('"match":"form-wrong"');
        // …and reloads into the editor as form.
        expect(JSON.stringify(activityToTiptap(doc))).toContain('"equivalence":"form"');
        editor.destroy();
    });
    it('the logic helpers split the reserved entry out', () => {
        const all = [
            { match: 'a', feedback: [] },
            { match: ' FORM-WRONG ', feedback: [] },
        ];
        expect(mistakeRowsOf(all as never)).toEqual([{ match: 'a', feedback: [] }]);
        expect(formWrongOf(all as never)).toEqual({ match: ' FORM-WRONG ', feedback: [] });
    });
});
