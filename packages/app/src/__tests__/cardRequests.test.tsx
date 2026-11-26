// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { blockControlsRegistry } from '../editor/blockControls';
import {
    pendingCardRequest,
    registerCommandBar,
    requestCardAction,
    resetCardRequests,
    useCardRequests,
    useHasCommandBar,
    type CardAction,
} from '../editor/components/cardRequests';

afterEach(() => resetCardRequests());

/** The editor every card below lives in, unless a row says otherwise. */
const MAIN = {} as Editor;

/** A card's request hook, recording every action it handles. */
function card(id: string, editor: Editor = MAIN) {
    const handled: CardAction[] = [];
    const hook = renderHook(({ cardId }) => useCardRequests(editor, cardId, (a: CardAction) => handled.push(a)), {
        initialProps: { cardId: id },
    });
    return { handled, hook };
}

// The chart, video and figure panels are local state in their cards, so the
// bar's buttons post a request the card handles (cardRequests.ts).
describe('chart, video and figure bar buttons reach their cards', () => {
    /** An editor whose selected node has `id`; `others` are the ids of the
     *  other nodes of the same type in the document. */
    function editorWith(id: string, others: string[] = [], written: unknown[][] = [], target: Editor = MAIN): Editor {
        const type = {};
        const node = { type, attrs: { id } };
        const tr = {
            setNodeAttribute(pos: number, key: string, value: unknown) {
                written.push([pos, key, value]);
                return tr;
            },
            setMeta(key: string, value: unknown) {
                written.push(['meta', key, value]);
                return tr;
            },
        };
        return Object.assign(target, {
            state: {
                tr,
                doc: {
                    nodeAt: () => node,
                    descendants: (fn: (n: unknown, pos: number) => boolean) => {
                        others.some((otherId, i) => fn({ type, attrs: { id: otherId } }, 100 + i) === false);
                    },
                },
            },
            view: { dispatch: () => undefined },
        }) as unknown as Editor;
    }
    function activate(type: 'chart' | 'video' | 'graphFigure', label: string, id: string): void {
        const entry = blockControlsRegistry[type]?.primary.find((p) => p.label === label);
        if (!entry) throw new Error(`${type} has no "${label}" on its bar`);
        entry.onActivate(editorWith(id), 0);
    }

    it('each button asks its own card, by id, for its own panel', () => {
        const chart = card('chart-a');
        const other = card('chart-b');
        act(() => activate('chart', 'Chart source', 'chart-a'));
        act(() => activate('chart', 'Edit chart', 'chart-a'));
        // The same action asked twice is handled twice, so a closed panel reopens.
        act(() => activate('chart', 'Edit chart', 'chart-a'));
        expect(chart.handled).toEqual(['source', 'edit', 'edit']);
        expect(other.handled).toEqual([]);

        const video = card('video-a');
        act(() => activate('video', 'Edit video', 'video-a'));
        expect(video.handled).toEqual(['edit']);

        const figure = card('figure-a');
        act(() => activate('graphFigure', 'Figure source', 'figure-a'));
        act(() => activate('graphFigure', 'Edit figure', 'figure-a'));
        expect(figure.handled).toEqual(['source', 'edit']);
    });

    it('a handled request is consumed: a remounted card does not replay it', () => {
        const first = card('chart-c');
        act(() => requestCardAction(MAIN, 'chart-c', 'source'));
        expect(first.handled).toEqual(['source']);
        expect(pendingCardRequest(MAIN, 'chart-c')).toBeNull();
        first.hook.unmount();
        // Undo remounts a NodeView; the old request must not open a panel.
        const again = card('chart-c');
        expect(again.handled).toEqual([]);
    });

    it('a request posted before the card mounts is handled when it mounts', () => {
        // The chart body is lazy: a fresh card may not be mounted yet.
        act(() => requestCardAction(MAIN, 'chart-late', 'edit'));
        expect(pendingCardRequest(MAIN, 'chart-late')?.action).toBe('edit');
        const late = card('chart-late');
        expect(late.handled).toEqual(['edit']);
        expect(pendingCardRequest(MAIN, 'chart-late')).toBeNull();
    });

    it('a card whose id changes picks up the request addressed to its new id', () => {
        // openCardPanel mints an id and posts in one go; the card re-renders
        // with the new id afterwards.
        const c = card('');
        act(() => requestCardAction(MAIN, 'minted', 'source'));
        expect(c.handled).toEqual([]);
        c.hook.rerender({ cardId: 'minted' });
        expect(c.handled).toEqual(['source']);
    });

    it('a block with no id is given one, outside undo, and the request goes to it', () => {
        // A video fresh from the slash menu has no id; a request with nowhere
        // to go would make the bar's button do nothing (caught in the browser).
        const written: unknown[][] = [];
        const entry = blockControlsRegistry.video?.primary.find((p) => p.label === 'Edit video');
        entry?.onActivate(editorWith('', [], written), 7);
        expect(written).toHaveLength(2);
        const [pos, key, id] = written[0]!;
        expect([pos, key]).toEqual([7, 'id']);
        expect(written[1]).toEqual(['meta', 'addToHistory', false]);
        expect(typeof id === 'string' && id.length > 0).toBe(true);
        const fresh = card(id as string);
        expect(fresh.handled).toEqual(['edit']);
    });

    it("a copy sharing its original's id gets its own before the request", () => {
        const written: unknown[][] = [];
        const original = card('shared-id');
        const entry = blockControlsRegistry.chart?.primary.find((p) => p.label === 'Edit chart');
        act(() => entry?.onActivate(editorWith('shared-id', ['shared-id'], written), 3));
        expect(original.handled).toEqual([]);
        expect(written[0]?.[1]).toBe('id');
        expect(written[0]?.[2]).not.toBe('shared-id');

        // A unique id is left alone.
        const untouched: unknown[][] = [];
        act(() => entry?.onActivate(editorWith('only-one', ['someone-else'], untouched), 3));
        expect(untouched).toEqual([]);
    });

    it('a request reaches only the card in its own editor, though another editor holds the same id', () => {
        // A figure copied from the body into the reference panel keeps its id.
        const panel = {} as Editor;
        const inBody = card('copied-id');
        const inPanel = card('copied-id', panel);
        act(() => activate('graphFigure', 'Edit figure', 'copied-id'));
        expect(inBody.handled).toEqual(['edit']);
        expect(inPanel.handled).toEqual([]);
    });

    it('the store ignores an empty id', () => {
        const blank = card('');
        act(() => requestCardAction(MAIN, '', 'edit'));
        expect(blank.handled).toEqual([]);
        expect(pendingCardRequest(MAIN, '')).toBeNull();
    });
});

// A card shows its own buttons exactly when its editor has no command bar
// (the reference panel and the definition dialog have none).
describe('useHasCommandBar', () => {
    it('is false for an editor no bar registered, true once one does, false again after', () => {
        const editor = {} as Editor;
        const elsewhere = {} as Editor;
        const has = renderHook(() => useHasCommandBar(editor));
        const other = renderHook(() => useHasCommandBar(elsewhere));
        expect(has.result.current).toBe(false);
        let undo = (): void => undefined;
        act(() => {
            undo = registerCommandBar(editor);
        });
        expect(has.result.current).toBe(true);
        expect(other.result.current).toBe(false);
        act(() => undo());
        expect(has.result.current).toBe(false);
    });
});
