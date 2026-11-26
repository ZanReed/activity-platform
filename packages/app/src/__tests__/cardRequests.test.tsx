// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { blockControlsRegistry } from '../editor/blockControls';
import { requestCardAction, useCardRequest } from '../editor/components/cardRequests';

// The chart and video panels are local state in their cards, so the bar's
// buttons post a request the card reads (cardRequests.ts).
describe('chart and video bar buttons reach their cards', () => {
    /** An editor whose selected node has `id`; `others` are the ids of the
     *  other nodes of the same type in the document. */
    function editorWith(id: string, others: string[] = [], written: unknown[][] = []): Editor {
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
        return {
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
        } as unknown as Editor;
    }
    function activate(type: 'chart' | 'video', label: string, id: string): void {
        const entry = blockControlsRegistry[type]?.primary.find((p) => p.label === label);
        if (!entry) throw new Error(`${type} has no "${label}" on its bar`);
        entry.onActivate(editorWith(id), 0);
    }

    it('each button asks its own card, by id, for its own panel', () => {
        const chart = renderHook(() => useCardRequest('chart-a'));
        const other = renderHook(() => useCardRequest('chart-b'));
        const before = chart.result.current.nonce;

        act(() => activate('chart', 'Chart source', 'chart-a'));
        expect(chart.result.current).toEqual({ nonce: before + 1, action: 'source' });
        act(() => activate('chart', 'Edit chart', 'chart-a'));
        expect(chart.result.current).toEqual({ nonce: before + 2, action: 'edit' });
        // The same action asked twice still moves, so a closed panel reopens.
        act(() => activate('chart', 'Edit chart', 'chart-a'));
        expect(chart.result.current.nonce).toBe(before + 3);
        expect(other.result.current.nonce).toBe(0);

        const video = renderHook(() => useCardRequest('video-a'));
        act(() => activate('video', 'Edit video', 'video-a'));
        expect(video.result.current).toEqual({ nonce: 1, action: 'edit' });
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
        const card = renderHook(() => useCardRequest(id as string));
        expect(card.result.current).toEqual({ nonce: 1, action: 'edit' });
    });

    it('a copy sharing its original\'s id gets its own before the request', () => {
        const written: unknown[][] = [];
        const original = renderHook(() => useCardRequest('shared-id'));
        const entry = blockControlsRegistry.chart?.primary.find((p) => p.label === 'Edit chart');
        act(() => entry?.onActivate(editorWith('shared-id', ['shared-id'], written), 3));
        expect(original.result.current.nonce).toBe(0);
        expect(written[0]?.[1]).toBe('id');
        expect(written[0]?.[2]).not.toBe('shared-id');

        // A unique id is left alone.
        const untouched: unknown[][] = [];
        act(() => entry?.onActivate(editorWith('only-one', ['someone-else'], untouched), 3));
        expect(untouched).toEqual([]);
    });

    it('the store ignores an empty id', () => {
        const blank = renderHook(() => useCardRequest(''));
        act(() => requestCardAction('', 'edit'));
        expect(blank.result.current.nonce).toBe(0);
    });
});
