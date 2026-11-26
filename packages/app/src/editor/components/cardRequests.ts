import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { Editor } from '@tiptap/core';

// ============================================================================
// Card requests — the command bar asks a chart, video or figure card to open
// one of its own panels ("Edit chart", "Chart source", "Edit video", …).
// ----------------------------------------------------------------------------
// These cards cannot be typed into, so a click selects them and the bar is
// where their buttons live (author ruling 2026-11-27: bar only, as the image
// has always been). But each panel is LOCAL React state in the NodeView — it
// must be: typing in a form drops node selection, so a selection-gated panel
// closes after one keystroke. The bar cannot reach that state, so it posts a
// request keyed by the block's stable `attrs.id`, and the card opens the panel
// itself. Ephemeral: never touches the document, never serializes.
//
// A request is CONSUMED by the card that handles it. So one posted while a
// lazy card is still loading is handled when it mounts, and a card remounted
// by undo does not replay an old one.
//
// NOT EVERY EDITOR HAS A BAR. The reference-panel editor and the definition
// dialog host these cards with no BlockCommandBarHost, and there the card's
// own buttons are the only way in. The host registers its editor here, and a
// card shows its own buttons exactly when its editor is not registered.
// ============================================================================

export type CardAction = 'edit' | 'source';

export interface CardRequest {
    /** 0 means "no request"; any other value is a request not yet handled. */
    nonce: number;
    action: CardAction;
}

const NONE: CardRequest = { nonce: 0, action: 'edit' };
// Keyed by editor, then id: a block copied from the body into the reference
// panel keeps its id, and the bar must open only the card in its own editor.
let requests = new WeakMap<Editor, Map<string, CardRequest>>();
let barEditors = new WeakSet<Editor>();
let counter = 0;
const listeners = new Set<() => void>();

function emit(): void {
    for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
}

function inbox(editor: Editor): Map<string, CardRequest> {
    let box = requests.get(editor);
    if (!box) {
        box = new Map();
        requests.set(editor, box);
    }
    return box;
}

/** Ask the card with this id, in this editor, to open a panel (no-op on an
 *  empty id). */
export function requestCardAction(editor: Editor, id: string, action: CardAction): void {
    if (!id) return;
    counter += 1;
    inbox(editor).set(id, { nonce: counter, action });
    emit();
}

/**
 * Run `handle` once for each request addressed to this card, then forget the
 * request. `handle` reads the card's state at the moment it runs.
 */
export function useCardRequests(editor: Editor, id: string, handle: (action: CardAction) => void): void {
    const request = useSyncExternalStore(
        subscribe,
        () => requests.get(editor)?.get(id) ?? NONE,
        () => NONE,
    );
    // A request already handled by this card (React may run an effect twice
    // on mount in development) is not handled again.
    const handled = useRef(0);
    useEffect(() => {
        if (request.nonce === 0 || request.nonce === handled.current) return;
        handled.current = request.nonce;
        const box = requests.get(editor);
        if (box?.get(id) === request) box.delete(id);
        handle(request.action);
        // `handle` is deliberately not a dependency: it is a new function each
        // render, and only a new request should run it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [request, id, editor]);
}

/** Is a request waiting for this id? (Tests, and nothing else.) */
export function pendingCardRequest(editor: Editor, id: string): CardRequest | null {
    return requests.get(editor)?.get(id) ?? null;
}

/** BlockCommandBarHost says "this editor has a bar". Returns the undo. */
export function registerCommandBar(editor: Editor): () => void {
    barEditors.add(editor);
    emit();
    return () => {
        barEditors.delete(editor);
        emit();
    };
}

/** Does this card's editor have a command bar to carry its buttons? */
export function useHasCommandBar(editor: Editor): boolean {
    return useSyncExternalStore(
        subscribe,
        () => barEditors.has(editor),
        () => false,
    );
}

/** Test seam: forget every request and every registered bar. */
export function resetCardRequests(): void {
    requests = new WeakMap();
    barEditors = new WeakSet<Editor>();
    emit();
}
