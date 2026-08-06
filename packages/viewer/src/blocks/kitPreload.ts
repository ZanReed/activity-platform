// =============================================================================
// blocks/kitPreload.ts — start the graph-kit fetch the moment we know it's used
// -----------------------------------------------------------------------------
// The `preloadMathIfNeeded` pattern (S8 T7 — see inline/mathPreload.ts for the
// measured reasoning), applied to the HEAVIER chunk (A20, s3-audit missed-8):
// KaTeX got preload-on-detect while graph-kit — JSXGraph plus the MathLive
// bridge — kept firing its import from inside the mounting component, after
// data arrival, full tree render, and mount. The document says on arrival
// whether it contains graph blocks; fire the import then and let the download
// overlap the render that used to precede it.
//
// Same non-negotiables as the math preload:
//   - STRUCTURAL detection, never a string search: a false positive costs a
//     graph-free page the whole kit chunk the lazy tier exists to withhold.
//   - Depth-capped: a pathological object must not hang the student's
//     critical path.
//   - Fire-and-forget, rejection swallowed: the ES module cache dedupes with
//     the mount-time `import('@activity/graph-kit')` calls in kitSurfaces.ts,
//     which retry on mount — a failed preload degrades to exactly the
//     behaviour that shipped before it.
// =============================================================================

import { blockRegistry, registeredBlockTypes } from '../registry/registry.js';

/**
 * Block types that summon the kit — DERIVED from the registry (P4), not a
 * third hand-list beside the grading walk's: `deriveQuestionShape` is the
 * registry's own marker for "the widget needs shape from the key", which is
 * exactly the set of kit-backed types (bonded in rosterBonds.test.ts).
 */
const KIT_BLOCK_TYPES: ReadonlySet<string> = new Set(
    registeredBlockTypes.filter(
        (type) => blockRegistry[type].sanitize?.deriveQuestionShape === true,
    ),
);

/** Same cap, same reason as mathPreload's: real content sits well inside it. */
const MAX_DEPTH = 24;

/** Does this document contain a kit-backed graph block anywhere? */
export function documentUsesGraphKit(doc: unknown): boolean {
    let found = false;

    const visit = (node: unknown, depth: number): void => {
        if (found || depth > MAX_DEPTH || node === null || typeof node !== 'object') {
            return;
        }
        if (Array.isArray(node)) {
            for (const item of node) visit(item, depth + 1);
            return;
        }
        const type = (node as { type?: unknown }).type;
        if (typeof type === 'string' && KIT_BLOCK_TYPES.has(type)) {
            found = true;
            return;
        }
        for (const value of Object.values(node as Record<string, unknown>)) {
            visit(value, depth + 1);
        }
    };

    visit(doc, 0);
    return found;
}

let fired = false;

/**
 * Start loading the graph kit if (and only if) this document needs it.
 * @returns whether a preload was triggered (for tests and instrumentation).
 */
export function preloadGraphKitIfNeeded(doc: unknown): boolean {
    if (fired) return false; // the module cache holds it; nothing to add
    if (!documentUsesGraphKit(doc)) return false;
    fired = true;
    void import('@activity/graph-kit').catch(() => {
        // Swallowed deliberately: kit surfaces retry on mount and render their
        // own load-failure state. A preload must never be able to break a page.
        fired = false; // allow a later attempt to try again
    });
    return true;
}

/** Test seam: forget that a preload fired. */
export function resetGraphKitPreload(): void {
    fired = false;
}
