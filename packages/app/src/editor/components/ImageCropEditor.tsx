import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
    FULL_CROP,
    canEnterCrop,
    clampRect,
    isFullCrop,
    panRect,
    resizeRect,
    roundRect,
    type CropHandle,
    type Rect,
} from '../cropGeometry';

// ============================================================================
// ImageCropEditor — the crop-mode gesture surface (image crop mode).
// ----------------------------------------------------------------------------
// Rendered by ImageView when the "Crop" command-bar primary is triggered. Shows
// the FULL source at its natural aspect (Open Q#2), dims everything outside a
// draggable + resizable frame, and commits ONCE on apply:
//   • drag the frame body  → pan  (panRect, size preserved, clamped in-bounds)
//   • drag a corner/edge   → zoom (resizeRect, min-size + in-bounds clamped)
//   • Enter / ✓            → onApply(crop|null, srcAspect)   — one doc commit
//   • Escape / ✕           → onCancel                        — no commit (CR-M5)
// A frame dragged back to the full source applies as "no crop" (isFullCrop →
// onApply(null)), so the image drops crop+srcAspect and is byte-identical again.
//
// Gesture discipline mirrors useBlockWidthResize: setPointerCapture, live LOCAL
// preview during a drag (setState only — no transactions), Escape mid-drag
// reverts that drag. The frame is 2-D, so it is its own gesture, not the shared
// 1-D width hook. srcAspect is captured from THIS editor's loaded <img>
// (naturalWidth/Height) — Apply stays disabled until it loads (CR-INV1) and is
// refused for a 0×0 source (CR-M8).
// ============================================================================

interface ImageCropEditorProps {
    src: string;
    alt: string;
    /** The existing crop rect to seed the frame (CR-M10), or null for a fresh full frame. */
    initialCrop: Rect | null;
    /**
     * Commit. `crop` is null when the frame is the whole source ("no crop"); a
     * rounded in-bounds rect otherwise. `srcAspect` is the source's natural W/H.
     */
    onApply: (crop: Rect | null, srcAspect: number) => void;
    onCancel: () => void;
}

// A live drag: which grip (null = panning the body), the pointer's start, the
// frame at drag start, and the rendered image px size for delta→fraction.
interface DragState {
    handle: CropHandle | null;
    startX: number;
    startY: number;
    startFrame: Rect;
    renderedW: number;
    renderedH: number;
}

const HANDLES: CropHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export default function ImageCropEditor({
    src,
    alt,
    initialCrop,
    onApply,
    onCancel,
}: ImageCropEditorProps) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    // The source's natural W/H, captured on load. null until loaded — Apply is
    // gated on it (CR-INV1); a 0×0 source (sizeless SVG) keeps it un-applyable
    // (CR-M8) since canEnterCrop rejects it.
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(
        null,
    );
    // The live frame in normalized coords. Seeded to the existing rect (CR-M10)
    // or the full source for a fresh crop; clampRect guards a stray stored rect.
    const [frame, setFrame] = useState<Rect>(() =>
        initialCrop ? clampRect(initialCrop) : FULL_CROP,
    );
    const dragRef = useRef<DragState | null>(null);

    const applyable = canEnterCrop(natural);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };

    const beginDrag =
        (handle: CropHandle | null) =>
        (event: ReactPointerEvent<HTMLElement>) => {
            if (event.button !== 0) return;
            // Own the gesture: no block drag, no text selection, no PM mousedown.
            event.preventDefault();
            event.stopPropagation();

            const img = imgRef.current;
            if (!img) return;
            const rect = img.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            dragRef.current = {
                handle,
                startX: event.clientX,
                startY: event.clientY,
                startFrame: frame,
                renderedW: rect.width,
                renderedH: rect.height,
            };

            const target = event.currentTarget;
            try {
                target.setPointerCapture(event.pointerId);
            } catch {
                /* synthetic events may have no active pointer to capture */
            }

            const onMove = (ev: PointerEvent) => {
                const d = dragRef.current;
                if (!d) return;
                const dx = (ev.clientX - d.startX) / d.renderedW;
                const dy = (ev.clientY - d.startY) / d.renderedH;
                setFrame(
                    d.handle
                        ? resizeRect(d.startFrame, d.handle, dx, dy)
                        : panRect(d.startFrame, dx, dy),
                );
            };

            const finish = () => {
                target.removeEventListener('pointermove', onMove);
                target.removeEventListener('pointerup', onUp);
                target.removeEventListener('pointercancel', onAbort);
                window.removeEventListener('keydown', onKeyDown, true);
                try {
                    if (target.hasPointerCapture(event.pointerId)) {
                        target.releasePointerCapture(event.pointerId);
                    }
                } catch {
                    /* mirror of the capture guard */
                }
                dragRef.current = null;
            };

            const onUp = () => finish();

            // Escape / pointercancel mid-drag reverts THIS drag (no commit), and
            // stops so the editor-level Escape doesn't also discard crop mode.
            const onAbort = () => {
                const d = dragRef.current;
                if (d) setFrame(d.startFrame);
                finish();
            };
            const onKeyDown = (ev: KeyboardEvent) => {
                if (ev.key === 'Escape') {
                    ev.preventDefault();
                    ev.stopPropagation();
                    onAbort();
                }
            };

            target.addEventListener('pointermove', onMove);
            target.addEventListener('pointerup', onUp);
            target.addEventListener('pointercancel', onAbort);
            window.addEventListener('keydown', onKeyDown, true);
        };

    const apply = () => {
        if (!applyable) return;
        const srcAspect = natural.w / natural.h;
        // A full-source frame is "no crop": drop crop+srcAspect (identity).
        onApply(isFullCrop(frame) ? null : roundRect(frame), srcAspect);
    };

    // Editor-level keys: Enter applies, Escape discards. Scoped to the overlay
    // (a drag's own handler intercepts Escape first via capture + stopPropagation).
    const onOverlayKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            apply();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
    };

    const framePct = {
        left: `${frame.x * 100}%`,
        top: `${frame.y * 100}%`,
        width: `${frame.w * 100}%`,
        height: `${frame.h * 100}%`,
    };

    return (
        <div
            className="image-crop"
            role="group"
            aria-label="Crop image"
            tabIndex={-1}
            onKeyDown={onOverlayKeyDown}
            // Swallow pointer so selecting/deleting the block doesn't fire while
            // cropping; the frame/handles own their own drags.
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className="image-crop__stage">
                <img
                    ref={imgRef}
                    className="image-crop__img"
                    src={src}
                    alt={alt}
                    draggable={false}
                    onLoad={handleLoad}
                />
                <div
                    className="image-crop__frame"
                    style={framePct}
                    onPointerDown={beginDrag(null)}
                >
                    {HANDLES.map((h) => (
                        <span
                            key={h}
                            className={`image-crop__handle image-crop__handle--${h}`}
                            role="presentation"
                            onPointerDown={beginDrag(h)}
                        />
                    ))}
                </div>
            </div>
            <div className="image-crop__toolbar">
                <span className="image-crop__hint">
                    Drag to reframe · corners to zoom
                </span>
                <button
                    type="button"
                    className="image-crop__btn image-crop__btn--cancel"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="image-crop__btn image-crop__btn--apply"
                    onClick={apply}
                    disabled={!applyable}
                >
                    Apply
                </button>
            </div>
        </div>
    );
}
