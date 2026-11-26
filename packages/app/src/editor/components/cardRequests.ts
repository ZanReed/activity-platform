import { useSyncExternalStore } from 'react';

// ============================================================================
// Card requests — the command bar asks a chart or video card to open one of
// its own panels ("Edit chart", "Chart source", "Edit video").
// ----------------------------------------------------------------------------
// Same shape as cropMode.ts, which this generalizes for cards whose panel is
// LOCAL React state in the NodeView (it must be: typing in a form drops node
// selection, so a selection-gated panel closes after one keystroke). The bar
// cannot reach that state, so it posts a request keyed by the block's stable
// `attrs.id`, and the card opens the panel itself. Ephemeral: never touches the
// document, never serializes.
//
// The card's own buttons stay. The bar is a second way in, not a replacement.
// ============================================================================

export type CardAction = 'edit' | 'source';

export interface CardRequest {
    /** Rises by one per request, so the same action asked twice still fires. */
    nonce: number;
    action: CardAction;
}

const NONE: CardRequest = { nonce: 0, action: 'edit' };
const requests = new Map<string, CardRequest>();
const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
}

/** Ask the card with this id to open a panel (no-op on an empty id). */
export function requestCardAction(id: string, action: CardAction): void {
    if (!id) return;
    requests.set(id, { nonce: (requests.get(id)?.nonce ?? 0) + 1, action });
    for (const l of listeners) l();
}

/** Reactive read of the latest request for one card id. */
export function useCardRequest(id: string): CardRequest {
    return useSyncExternalStore(
        subscribe,
        () => requests.get(id) ?? NONE,
        () => NONE,
    );
}
