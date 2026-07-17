import { useState, type RefObject } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
    dragWidthFraction,
    snapWidthFraction,
} from '../imageSizing';

// ============================================================================
// useBlockWidthResize — the shared width drag-resize gesture for sized blocks.
// ----------------------------------------------------------------------------
// Extracted from ImageView (Group 3 sizing slice, D1) so image / graph /
// data-plot / number-line all drive ONE gesture instead of three copies. The
// gesture is pure DOM + a commit callback; it knows nothing about the editor,
// the schema, or which block it serves — the host passes a wrapper ref, the
// current align (drives the centered vs one-sided growth factor), and an
// onCommit(width) that writes the block's own attr.
//
// Contract (preserved from ImageView verbatim):
//   • live LOCAL preview during the drag (setState only — NO transactions),
//   • ONE onCommit on pointerup (a single undo step),
//   • Escape / pointercancel abort with NO commit,
//   • snaps to the shared width stops; Alt (ev.altKey) drags fine,
//   • a centered block grows on both sides → growthFactor 2; left/right → 1.
//
// The gesture is fully owned here — no decoration plugins, no shared screen
// regions with other affordances (mirrors the ImageView invariant).
// ============================================================================

// The width a sizing fraction resolves against: the containing block's CONTENT
// width (CSS percentage semantics), i.e. the parent minus its padding.
export function containerContentWidth(wrapper: HTMLElement): number {
    const parent = wrapper.parentElement;
    if (!parent) return 0;
    const cs = getComputedStyle(parent);
    return (
        parent.clientWidth -
        parseFloat(cs.paddingLeft || '0') -
        parseFloat(cs.paddingRight || '0')
    );
}

export interface UseBlockWidthResizeOptions {
    /** The sized element — its rendered width seeds the drag; its parent sizes it. */
    wrapperRef: RefObject<HTMLElement | null>;
    /** null = centered (grows both sides); 'left'/'right' = one-sided. */
    align: 'left' | 'right' | null;
    /** Commit the snapped width fraction. A drag always commits an explicit width. */
    onCommit: (width: number) => void;
}

export interface BlockWidthResize {
    /** The fraction being previewed mid-drag; null when not dragging. */
    dragWidth: number | null;
    /** pointerdown handler factory for a given edge handle. */
    startResize: (
        side: 'left' | 'right',
    ) => (event: ReactPointerEvent<HTMLElement>) => void;
}

export function useBlockWidthResize({
    wrapperRef,
    align,
    onCommit,
}: UseBlockWidthResizeOptions): BlockWidthResize {
    // Transient drag fraction (null = not dragging). Document attrs only change
    // on release, via onCommit.
    const [dragWidth, setDragWidth] = useState<number | null>(null);

    const startResize =
        (side: 'left' | 'right') =>
        (event: ReactPointerEvent<HTMLElement>) => {
            if (event.button !== 0) return;
            // Own the gesture: no block drag, no text selection, no PM mousedown.
            event.preventDefault();
            event.stopPropagation();

            const wrapper = wrapperRef.current;
            if (!wrapper) return;
            const containerPx = containerContentWidth(wrapper);
            if (containerPx <= 0) return;

            const startX = event.clientX;
            const startPx = wrapper.getBoundingClientRect().width;
            // Outward pointer travel grows the block. A centered block grows on
            // both sides at once, so a pixel of travel is two pixels of width.
            const outwardSign = side === 'right' ? 1 : -1;
            const growthFactor = align === null ? 2 : 1;
            const handle = event.currentTarget;

            try {
                handle.setPointerCapture(event.pointerId);
            } catch {
                /* synthetic events may have no active pointer to capture */
            }

            let latest = snapWidthFraction(
                dragWidthFraction(startPx, 0, growthFactor, containerPx),
                true,
            );
            setDragWidth(latest);

            const onMove = (ev: PointerEvent) => {
                const outwardPx = (ev.clientX - startX) * outwardSign;
                const raw = dragWidthFraction(
                    startPx,
                    outwardPx,
                    growthFactor,
                    containerPx,
                );
                latest = snapWidthFraction(raw, !ev.altKey);
                setDragWidth(latest);
            };

            const cleanup = () => {
                handle.removeEventListener('pointermove', onMove);
                handle.removeEventListener('pointerup', onUp);
                handle.removeEventListener('pointercancel', onCancel);
                window.removeEventListener('keydown', onKeyDown, true);
                try {
                    if (handle.hasPointerCapture(event.pointerId)) {
                        handle.releasePointerCapture(event.pointerId);
                    }
                } catch {
                    /* mirror of the capture guard */
                }
                setDragWidth(null);
            };

            const onUp = () => {
                cleanup();
                // A drag always commits an explicit width — 1 means "fill the
                // container" (a real value), NOT the unsized default.
                onCommit(latest);
            };

            const onCancel = () => cleanup();

            const onKeyDown = (ev: KeyboardEvent) => {
                if (ev.key === 'Escape') {
                    ev.preventDefault();
                    ev.stopPropagation();
                    onCancel();
                }
            };

            handle.addEventListener('pointermove', onMove);
            handle.addEventListener('pointerup', onUp);
            handle.addEventListener('pointercancel', onCancel);
            window.addEventListener('keydown', onKeyDown, true);
        };

    return { dragWidth, startResize };
}
