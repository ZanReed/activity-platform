import { useCallback, useSyncExternalStore } from 'react';

// ============================================================================
// Preview-as-student toggle — shared by the three graphing NodeViews
// (interactive_graph / number_line / data_plot) AND the BlockQuickBarHost.
// ----------------------------------------------------------------------------
// Per the graph-authoring-redirection design, the toggle hides ALL authoring
// chrome so the author sees the block the way it SITS on the page — a
// flow/layout preview, not a fidelity-accurate student simulation.
//
// The button lives in the block's top-right quick-bar (next to delete /
// duplicate / settings), so the NodeView that HIDES the chrome and the quick-bar
// that OWNS the button must share one piece of state. That state is an
// id-keyed module store, read through useSyncExternalStore: ephemeral by design
// (never touches the document, never serializes, resets on reload), keyed by the
// block's stable `attrs.id` (not its shifting position). React-idiomatic, no
// ProseMirror plugin, no cross-portal context.
// ============================================================================

const previewState = new Map<string, boolean>();
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

/** Is the block with this id currently previewing (chrome hidden)? */
export function isPreviewing(id: string): boolean {
    return previewState.get(id) ?? false;
}

/** Flip the preview state for a block id (no-op on an empty id). */
export function togglePreview(id: string): void {
    if (!id) return;
    previewState.set(id, !isPreviewing(id));
    emit();
}

/** Reactive read + toggle for one block id. */
export function usePreviewToggle(id: string): { preview: boolean; toggle: () => void } {
    const preview = useSyncExternalStore(
        subscribe,
        () => isPreviewing(id),
        () => false,
    );
    const toggle = useCallback(() => togglePreview(id), [id]);
    return { preview, toggle };
}
