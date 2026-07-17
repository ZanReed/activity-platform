// =============================================================================
// cropGeometry.ts — pure math for the image crop-mode frame (image crop mode;
// see docs/design/image-crop.md).
// -----------------------------------------------------------------------------
// The crop frame is a normalized rectangle {x,y,w,h} in [0,1], relative to the
// SOURCE image (x,y = the window's top-left; w,h = its size). Crop mode renders
// the full source at its natural aspect (Open Q#2 → full source, not a fixed
// canvas), so a pointer delta in px converts to a fraction by dividing by the
// rendered image's px width/height, and the frame's normalized rect maps 1:1 to
// where it sits over the image.
//
// Every function here is a TOTAL function into the valid-rect space: the output
// always satisfies x≥0, y≥0, x+w≤1, y+h≤1 and w,h ≥ MIN_CROP (CR-INV3), so the
// gesture never leans on schema-rejection to catch an out-of-bounds crop, and
// the renderer never sees a w/h of 0 that would emit `Infinity%` (CR-M6). Pure
// so the coordinate mapping (CR-M7), the min-size clamp (CR-M6) and the
// in-bounds invariant (CR-INV3) are unit-testable without a live pointer.
// =============================================================================

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** The full-source window — applying this is "no crop" (see isFullCrop). */
export const FULL_CROP: Rect = { x: 0, y: 0, w: 1, h: 1 };

// The smallest crop the gesture will produce, as a fraction of the source. Keeps
// w,h strictly positive so the render math (100/w %, 100/h %) stays finite
// (CR-M6). The exact value is a tuning detail, not a specced behavior — the
// clamp EXISTING is the requirement.
export const MIN_CROP = 0.05;

function clamp(v: number, lo: number, hi: number): number {
    return Math.min(Math.max(v, lo), hi);
}

/** The eight resize grips: corners drive two edges, edges drive one. */
export type CropHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface EdgeMask {
    l?: boolean;
    r?: boolean;
    t?: boolean;
    b?: boolean;
}

const HANDLE_EDGES: Record<CropHandle, EdgeMask> = {
    nw: { l: true, t: true },
    n: { t: true },
    ne: { r: true, t: true },
    e: { r: true },
    se: { r: true, b: true },
    s: { b: true },
    sw: { l: true, b: true },
    w: { l: true },
};

/**
 * Can crop be entered? Only once the source has loaded WITH a real intrinsic
 * size — a viewBox-less SVG / sizeless data-URI fires `load` with 0×0, which
 * would derive a 0/NaN srcAspect and break the render, so it is NOT croppable
 * (CR-INV1 = disabled until load; CR-M8 = disabled when naturalW/H === 0).
 */
export function canEnterCrop(
    natural: { w: number; h: number } | null,
): natural is { w: number; h: number } {
    return (
        natural !== null &&
        Number.isFinite(natural.w) &&
        Number.isFinite(natural.h) &&
        natural.w > 0 &&
        natural.h > 0
    );
}

/**
 * Pan the frame by a normalized delta, preserving its size and clamping the
 * origin so the window stays fully inside the source (CR-INV3).
 */
export function panRect(r: Rect, dx: number, dy: number): Rect {
    return {
        x: clamp(r.x + dx, 0, Math.max(0, 1 - r.w)),
        y: clamp(r.y + dy, 0, Math.max(0, 1 - r.h)),
        w: r.w,
        h: r.h,
    };
}

/**
 * Resize the frame by dragging one grip by a normalized delta. The affected
 * edges move; the opposite edges stay pinned. Each moving edge is clamped so the
 * window stays in-bounds (CR-INV3) AND keeps at least MIN_CROP on that axis
 * (CR-M6). A handle never drives both left+right (or top+bottom), so the two
 * axes are independent.
 */
export function resizeRect(
    r: Rect,
    handle: CropHandle,
    dx: number,
    dy: number,
    min: number = MIN_CROP,
): Rect {
    const e = HANDLE_EDGES[handle];
    let left = r.x;
    let right = r.x + r.w;
    let top = r.y;
    let bottom = r.y + r.h;

    if (e.l) left = clamp(left + dx, 0, right - min);
    if (e.r) right = clamp(right + dx, left + min, 1);
    if (e.t) top = clamp(top + dy, 0, bottom - min);
    if (e.b) bottom = clamp(bottom + dy, top + min, 1);

    return { x: left, y: top, w: right - left, h: bottom - top };
}

/**
 * Force any rect fully in-bounds with w,h ≥ MIN_CROP. Defensive backstop for a
 * stored rect (e.g. re-entering crop with an existing rect); the interactive
 * pan/resize already stay in-bounds.
 */
export function clampRect(r: Rect): Rect {
    const w = clamp(r.w, MIN_CROP, 1);
    const h = clamp(r.h, MIN_CROP, 1);
    return {
        x: clamp(r.x, 0, 1 - w),
        y: clamp(r.y, 0, 1 - h),
        w,
        h,
    };
}

/**
 * Is this window (within epsilon) the whole source? Applying a full window is
 * "no crop" — the editor stores crop only for a real sub-rectangle, so an image
 * cropped back to full carries neither `crop` nor `srcAspect` (the identity
 * invariant, CR-INV-both).
 */
export function isFullCrop(r: Rect, eps = 1e-3): boolean {
    return (
        r.x <= eps &&
        r.y <= eps &&
        r.w >= 1 - eps &&
        r.h >= 1 - eps
    );
}

/**
 * Round to the stored precision (4 dp, matching the renderer's fmt) and re-pin
 * x+w ≤ 1 / y+h ≤ 1 EXACTLY. Independent rounding of x and w could nudge their
 * sum a few 1e-5 over 1 — past the schema's 1e-6 tolerance — which would make
 * CropRect.safeParse reject and serialize silently drop the crop. Deriving the
 * size from the rounded origin keeps the sum exact.
 */
export function roundRect(r: Rect): Rect {
    const round = (n: number) => Math.round(n * 1e4) / 1e4;
    const x = round(r.x);
    const y = round(r.y);
    let w = round(r.w);
    let h = round(r.h);
    if (x + w > 1) w = round(1 - x);
    if (y + h > 1) h = round(1 - y);
    return { x, y, w, h };
}
