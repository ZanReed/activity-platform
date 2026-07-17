import { useSyncExternalStore } from 'react';

// ============================================================================
// Crop-mode entry signal — shared by the image command bar (which OWNS the
// "Crop" primary) and ImageView (which OWNS the crop-frame gesture).
// ----------------------------------------------------------------------------
// Entering crop mode is a request from the command bar to a specific image's
// NodeView. Like the preview-toggle store (usePreviewToggle), it is an id-keyed
// module store read through useSyncExternalStore: ephemeral by design (never
// touches the document, never serializes), keyed by the block's stable
// `attrs.id` (not its shifting position). React-idiomatic — no ProseMirror
// plugin, no cross-portal context.
//
// The store carries only a monotonically increasing REQUEST NONCE per id. The
// ImageView effect watches its own id's nonce and, on a bump, enters crop mode
// IF its source has loaded with a real intrinsic size (canEnterCrop). The
// load-state guard lives in ImageView (it has the <img>), so this store stays a
// pure signal — the "disabled until load" invariant (CR-INV1/CR-M8) is enforced
// where the knowledge is, not here.
// ============================================================================

const requestNonce = new Map<string, number>();
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

/** Ask the image with this id to enter crop mode (no-op on an empty id). */
export function requestCropMode(id: string): void {
    if (!id) return;
    requestNonce.set(id, (requestNonce.get(id) ?? 0) + 1);
    emit();
}

/** Reactive read of the crop-request nonce for one image id. */
export function useCropRequest(id: string): number {
    return useSyncExternalStore(
        subscribe,
        () => requestNonce.get(id) ?? 0,
        () => 0,
    );
}
