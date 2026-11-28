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
//   - Fire-and-forget, rejection swallowed: the loader is the SAME function
//     the mount calls (kitSurfaces.ts), so the two share one request; after a
//     failed preload the mount's call fetches the chunk again under a new URL
//     where the build allows it (lazy/retryableChunk.ts; data plot yes, graph
//     and number line no — see kitSurfaces.ts). Re-asking for the failed URL,
//     as before 2026-11-28, is refused at once by Chromium and WebKit.
//   - PER WIDGET, by subpath (review D1, 2026-11-26): it used to fetch the
//     package barrel, which carries MathLive and mathjs, so a data plot paid
//     for both before it drew a dot. Each kit type now preloads the same
//     subpath its seam mounts from, and nothing else.
// =============================================================================

import { blockRegistry, registeredBlockTypes } from '../registry/registry.js';
import {
    loadDataPlotQuestion,
    loadGraphQuestion,
    loadNumberLineQuestion,
} from './kitSurfaces.js';

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

/**
 * What each kit type's seam imports (kitSurfaces.ts), so the preload warms
 * exactly that module. Keyed by block type; `kitPreload.test.ts` bonds the
 * keys to KIT_BLOCK_TYPES, so a new kit type cannot be detected and then
 * silently not preloaded.
 */
export const KIT_PRELOADERS: Readonly<Record<string, () => Promise<unknown>>> = {
    interactive_graph: loadGraphQuestion,
    number_line: loadNumberLineQuestion,
    data_plot: loadDataPlotQuestion,
};

/** The kit types the registry marks (exported for the bond test). */
export const kitBlockTypes = (): ReadonlySet<string> => KIT_BLOCK_TYPES;

/** Same cap, same reason as mathPreload's: real content sits well inside it. */
const MAX_DEPTH = 24;

/** Every kit-backed block type this document contains (empty: none). */
export function graphKitTypesIn(doc: unknown): Set<string> {
    const found = new Set<string>();

    const visit = (node: unknown, depth: number): void => {
        if (
            found.size === KIT_BLOCK_TYPES.size ||
            depth > MAX_DEPTH ||
            node === null ||
            typeof node !== 'object'
        ) {
            return;
        }
        if (Array.isArray(node)) {
            for (const item of node) visit(item, depth + 1);
            return;
        }
        const type = (node as { type?: unknown }).type;
        if (typeof type === 'string' && KIT_BLOCK_TYPES.has(type)) {
            found.add(type);
            return;
        }
        for (const value of Object.values(node as Record<string, unknown>)) {
            visit(value, depth + 1);
        }
    };

    visit(doc, 0);
    return found;
}

/** Does this document contain a kit-backed graph block anywhere? */
export function documentUsesGraphKit(doc: unknown): boolean {
    return graphKitTypesIn(doc).size > 0;
}

/** Kit types whose module has been asked for (the module cache holds them). */
const fired = new Set<string>();

/**
 * Start loading the kit module of each kit type this document uses, once per
 * type per page.
 * @returns whether any preload was triggered (for tests and instrumentation).
 */
export function preloadGraphKitIfNeeded(doc: unknown): boolean {
    if (fired.size === KIT_BLOCK_TYPES.size) return false;
    let triggered = false;
    for (const type of graphKitTypesIn(doc)) {
        const load = KIT_PRELOADERS[type];
        if (fired.has(type) || !load) continue;
        fired.add(type);
        triggered = true;
        void load().catch(() => {
            // Swallowed deliberately: the mount calls the same loader (which
            // retries under a new URL where it can) and renders its own
            // load-failure state. A preload must never be able to break
            // a page.
            fired.delete(type); // allow a later attempt to try again
        });
    }
    return triggered;
}

/** Test seam: forget that a preload fired. */
export function resetGraphKitPreload(): void {
    fired.clear();
}
