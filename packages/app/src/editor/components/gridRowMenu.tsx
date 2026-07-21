import { useSyncExternalStore } from 'react';

// ============================================================================
// gridRowMenu — the multi-col row grip's click-menu state (strict-grid slice 3).
// ----------------------------------------------------------------------------
// The six-dot grip on a multi-col row is drag-only by default; a plain CLICK
// opens this menu (Merge to one column / Add row below). Design ruling
// (docs/design/strict-grid-editor.md, Known gaps bucket 1): reuse the one
// blessed container affordance — the grip — rather than add a second persistent
// widget that would rival it. The grip is built imperatively as a widget
// decoration (Columns.ts), so it can't hold React state; this ephemeral module
// store bridges the imperative grip → the single React GridRowMenuHost, the same
// id/store idiom as usePreviewToggle + cropMode. Never touches the document,
// never serializes. The anchor is the grip's viewport rect (the host portals a
// fixed-position menu just under it).
// ============================================================================

export interface RowMenuAnchor {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

let anchor: RowMenuAnchor | null = null;
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

/** Open the row menu anchored to the given grip rect (viewport coords). */
export function openRowMenu(next: RowMenuAnchor): void {
    anchor = next;
    emit();
}

/** Close the row menu (no-op when already closed). */
export function closeRowMenu(): void {
    if (anchor === null) return;
    anchor = null;
    emit();
}

/** Reactive read of the open row-menu anchor, or null when closed. */
export function useRowMenu(): RowMenuAnchor | null {
    return useSyncExternalStore(
        subscribe,
        () => anchor,
        () => null,
    );
}
