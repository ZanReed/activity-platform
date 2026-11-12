// @vitest-environment jsdom
// =============================================================================
// misconceptionField.test.tsx — misconception ids set, changed and removed in
// the editor (GUI amendment 2026-11-12, M-1…M-7): the shared field, the
// multiple-choice and graph sites writing the id into the saved document, and
// the course list's search.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/react';
import { ActivityMeta } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { tiptapToActivity } from '../lib/serialize';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { searchMisconceptions } from '../lib/misconceptionList';
import MisconceptionField from '../editor/components/MisconceptionField';
import MultipleChoiceView from '../editor/nodeViews/MultipleChoiceView';
import { renderGraphSettings } from '../editor/components/GraphSettings';
import BlankEditPopover from '../editor/components/BlankEditPopover';

const LIST = [
    { id: 'mis.place-value.digit-reversal', description: 'Reverses the digits of a two-digit number' },
    { id: 'mis.roc.uses-endpoint-value', description: 'Uses an endpoint value instead of the rate' },
    { id: 'mis.slope.reads-intercept', description: 'Reads the intercept as the slope' },
    { id: 'mis.nameless.entry', description: null },
    ...Array.from({ length: 10 }, (_, i) => ({ id: `mis.filler.f${i}`, description: `Filler ${i}` })),
];
vi.mock('../lib/misconceptionList', async (orig) => ({
    ...(await orig<typeof import('../lib/misconceptionList')>()),
    fetchMisconceptionList: () => Promise.resolve(LIST),
}));

afterEach(cleanup);

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});
const META = ActivityMeta.parse({ title: 'M', course: 'Y9' });

function editorFor(md: string): Editor {
    return new Editor({ extensions: buildEditorExtensions(), content: wrapBlocksStrict(convert(md).blocks) });
}
function posOf(editor: Editor, type: string): number {
    let at = -1;
    editor.state.doc.descendants((n, p) => {
        if (at < 0 && n.type.name === type) at = p;
        return at < 0;
    });
    return at;
}
const saved = (editor: Editor) => JSON.stringify(tiptapToActivity(editor.getJSON(), META));

describe('searchMisconceptions', () => {
    it('matches every typed word against the description and the id', () => {
        expect(searchMisconceptions(LIST, 'reverses digits').map((e) => e.id)).toEqual(['mis.place-value.digit-reversal']);
        expect(searchMisconceptions(LIST, 'roc').map((e) => e.id)).toEqual(['mis.roc.uses-endpoint-value']);
        expect(searchMisconceptions(LIST, 'nothing like it')).toEqual([]);
    });
});

describe('MisconceptionField', () => {
    it('shows a bound id by its description, and removes it', async () => {
        const onChange = vi.fn();
        render(<MisconceptionField value="mis.slope.reads-intercept" onChange={onChange} context="it" />);
        await screen.findByText('Reads the intercept as the slope');
        fireEvent.click(screen.getByRole('button', { name: 'Remove the misconception from it' }));
        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('picks from the course list by search', async () => {
        const onChange = vi.fn();
        render(<MisconceptionField value={undefined} onChange={onChange} context="it" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add a misconception to it' }));
        fireEvent.change(await screen.findByLabelText('Search misconceptions for it'), { target: { value: 'endpoint' } });
        const results = await screen.findByRole('list', { name: 'Matching misconceptions' });
        fireEvent.click(within(results).getByRole('button'));
        expect(onChange).toHaveBeenCalledWith('mis.roc.uses-endpoint-value');
    });

    it('an id in the list with no description is NOT called missing (Fable P1)', async () => {
        render(<MisconceptionField value="mis.nameless.entry" onChange={() => {}} context="it" />);
        await screen.findByRole('button', { name: 'Change the misconception for it' });
        await new Promise((r) => setTimeout(r, 0));
        expect(screen.queryByText('Not in the course list')).toBeNull();
    });

    it('Enter picks the first match; Escape closes the search and returns focus', async () => {
        const onChange = vi.fn();
        render(<MisconceptionField value={undefined} onChange={onChange} context="it" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add a misconception to it' }));
        const input = await screen.findByLabelText('Search misconceptions for it');
        fireEvent.change(input, { target: { value: 'intercept' } });
        await screen.findByRole('list', { name: 'Matching misconceptions' });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith('mis.slope.reads-intercept');
        cleanup();
        render(<MisconceptionField value={undefined} onChange={() => {}} context="it" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add a misconception to it' }));
        fireEvent.keyDown(await screen.findByLabelText('Search misconceptions for it'), { key: 'Escape' });
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Add a misconception to it' }));
    });

    it('says when more matches exist than it shows', async () => {
        render(<MisconceptionField value={undefined} onChange={() => {}} context="it" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add a misconception to it' }));
        await screen.findByRole('list', { name: 'Matching misconceptions' });
        expect(document.body.textContent).toMatch(/Showing 8 of 14/);
    });

    it('keeps an id that is not in the course list, and says so', async () => {
        render(<MisconceptionField value="mis.old.retired" onChange={() => {}} context="it" />);
        expect(await screen.findByText('Not in the course list')).toBeTruthy();
        expect(screen.getByText('mis.old.retired')).toBeTruthy();
    });
});

describe('multiple choice (M-4)', () => {
    const MC = ['```mc', 'prompt: Which is the unit rate?', '( ) $12 :: The total. :: mis.roc.uses-endpoint-value', '(x) $3 per kg', '( ) $4', '```'].join('\n');

    function renderChoice(editor: Editor) {
        const pos = posOf(editor, 'multipleChoice');
        const props = () => ({
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
        const view = render(<MultipleChoiceView {...props()} />);
        // A NodeView re-renders with the new node after each transaction.
        editor.on('transaction', () => view.rerender(<MultipleChoiceView {...props()} />));
        return view;
    }

    it('shows the imported binding and removing it clears the saved id', async () => {
        const editor = editorFor(MC);
        expect(saved(editor)).toContain('mis.roc.uses-endpoint-value');
        renderChoice(editor);
        await screen.findByText('Uses an endpoint value instead of the rate');
        fireEvent.click(screen.getByRole('button', { name: 'Remove the misconception from choice A' }));
        expect(saved(editor)).not.toContain('mis.roc.uses-endpoint-value');

        editor.destroy();
    });

    it('a wrong choice can be bound; the save carries the id', async () => {
        const editor = editorFor(MC);
        renderChoice(editor);
        fireEvent.click(screen.getByRole('button', { name: 'Feedback for choice C' }));
        fireEvent.click(screen.getByRole('button', { name: 'Add a misconception to choice C' }));
        fireEvent.change(await screen.findByLabelText('Search misconceptions for choice C'), { target: { value: 'slope' } });
        fireEvent.click(within(await screen.findByRole('list', { name: 'Matching misconceptions' })).getByRole('button'));
        expect(saved(editor)).toContain('mis.slope.reads-intercept');
        editor.destroy();
    });

    it('removing the id from a choice with no feedback text keeps its panel open', async () => {
        const editor = editorFor(['```mc', 'prompt: Pick.', '( ) 12 :: mis.roc.uses-endpoint-value', '(x) 3', '```'].join('\n'));
        renderChoice(editor);
        fireEvent.click(await screen.findByRole('button', { name: 'Remove the misconception from choice A' }));
        expect(screen.getByRole('button', { name: 'Add a misconception to choice A' })).toBeTruthy();
        editor.destroy();
    });

    it('a correct choice offers no field', () => {
        const editor = editorFor(MC);
        renderChoice(editor);
        fireEvent.click(screen.getByRole('button', { name: 'Feedback for choice B' }));
        expect(screen.getByLabelText('Feedback for choice B', { selector: '[contenteditable], [role="textbox"], div' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Add a misconception to choice B' })).toBeNull();
        editor.destroy();
    });
});

describe('graph anticipated mistakes (M-4)', () => {
    const GRAPH = ['```graph', 'prompt: Graph it.', 'answer: y = 2x + 1', 'mistake: y = x + 2 :: The coefficient is the slope. :: mis.slope.reads-intercept', '```'].join('\n');

    it('removing the id keeps the mistake and its feedback', async () => {
        const editor = editorFor(GRAPH);
        const pos = posOf(editor, 'interactiveGraph');
        render(<>{renderGraphSettings({ editor, node: editor.state.doc.nodeAt(pos)!, pos })}</>);
        await screen.findByText('Reads the intercept as the slope');
        fireEvent.click(screen.getByRole('button', { name: 'Remove the misconception from anticipated mistake 1' }));
        const out = saved(editor);
        expect(out).not.toContain('mis.slope.reads-intercept');
        expect(out).toContain('The coefficient is the slope.');
        editor.destroy();
    });

    it('a fresh mistake row offers the field only once it has a match', () => {
        const editor = editorFor(['```graph', 'prompt: Graph it.', 'answer: y = 2x + 1', '```'].join('\n'));
        const pos = posOf(editor, 'interactiveGraph');
        const view = () => render(<>{renderGraphSettings({ editor, node: editor.state.doc.nodeAt(pos)!, pos })}</>);
        view();
        fireEvent.click(screen.getByRole('button', { name: '+ Anticipated mistake' }));
        cleanup();
        view();
        expect(screen.queryByRole('button', { name: 'Add a misconception to anticipated mistake 1' })).toBeNull();
        editor.destroy();
    });
});

describe('blank mistake rows (M-4)', () => {
    const para = (text: string) => [{ type: 'text', text, marks: [] }];

    function renderPopover(onChange: (attrs: Record<string, unknown>) => void) {
        const anchor = document.createElement('span');
        document.body.appendChild(anchor);
        return render(
            <BlankEditPopover
                referenceElement={anchor}
                isOpen
                blankId="b1"
                initialAnswer="12"
                initialAcceptableAnswers={[]}
                initialHint={undefined}
                initialMistakeFeedback={[
                    { match: '21', feedback: para('Digits swapped.') as never, misconceptionId: 'mis.place-value.digit-reversal' },
                ]}
                initialInterchangeable={false}
                initialAnswerType="numeric"
                initialTolerance={undefined}
                initialUnit={undefined}
                initialAcceptableUnits={undefined}
                initialEquivalence={undefined}
                canGroupWithPrevious={false}
                onChange={onChange}
                onClose={() => {}}
            />,
        );
    }

    it('Escape in the search closes the search, not the popover', async () => {
        const onClose = vi.fn();
        const anchor = document.createElement('span');
        document.body.appendChild(anchor);
        render(
            <BlankEditPopover
                referenceElement={anchor} isOpen blankId="b2" initialAnswer="12" initialAcceptableAnswers={[]}
                initialHint={undefined}
                initialMistakeFeedback={[{ match: '21', feedback: para('Swapped.') as never }]}
                initialInterchangeable={false} initialAnswerType="numeric" initialTolerance={undefined}
                initialUnit={undefined} initialAcceptableUnits={undefined} initialEquivalence={undefined}
                canGroupWithPrevious={false} onChange={() => {}} onClose={onClose}
            />,
        );
        fireEvent.click(await screen.findByRole('button', { name: 'Add a misconception to the wrong answer “21”' }));
        fireEvent.keyDown(await screen.findByLabelText('Search misconceptions for the wrong answer “21”'), { key: 'Escape' });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('adds a binding to a row through the popover', async () => {
        const onChange = vi.fn();
        const anchor = document.createElement('span');
        document.body.appendChild(anchor);
        render(
            <BlankEditPopover
                referenceElement={anchor} isOpen blankId="b3" initialAnswer="12" initialAcceptableAnswers={[]}
                initialHint={undefined}
                initialMistakeFeedback={[{ match: '21', feedback: para('Swapped.') as never }]}
                initialInterchangeable={false} initialAnswerType="numeric" initialTolerance={undefined}
                initialUnit={undefined} initialAcceptableUnits={undefined} initialEquivalence={undefined}
                canGroupWithPrevious={false} onChange={onChange} onClose={() => {}}
            />,
        );
        fireEvent.click(await screen.findByRole('button', { name: 'Add a misconception to the wrong answer “21”' }));
        fireEvent.change(await screen.findByLabelText('Search misconceptions for the wrong answer “21”'), { target: { value: 'digits' } });
        fireEvent.click(within(await screen.findByRole('list', { name: 'Matching misconceptions' })).getByRole('button'));
        expect(onChange).toHaveBeenLastCalledWith({
            mistakeFeedback: [{ match: '21', feedback: para('Swapped.'), misconceptionId: 'mis.place-value.digit-reversal' }],
        });
    });

    it('shows the binding on its row; removing it keeps the row and its feedback', async () => {
        const onChange = vi.fn();
        renderPopover(onChange);
        const add = screen.queryByRole('button', { name: /Advanced options/ });
        if (add) fireEvent.click(add);
        await screen.findByText('Reverses the digits of a two-digit number');
        fireEvent.click(screen.getByRole('button', { name: 'Remove the misconception from the wrong answer “21”' }));
        expect(onChange).toHaveBeenLastCalledWith({
            mistakeFeedback: [{ match: '21', feedback: para('Digits swapped.') }],
        });
    });
});
