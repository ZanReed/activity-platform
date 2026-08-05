// =============================================================================
// inline/mathPreload.ts — start the KaTeX fetch the moment we know math exists
// -----------------------------------------------------------------------------
// THE PROBLEM THIS SOLVES (S8 T7, measured before it was built).
//
// KaTeX is a lazy chunk (ruling D14/D16), and until S8 the import fired from
// inside `InlineMath`/`MathBlock` — in a useEffect, i.e. AFTER the document had
// arrived, after React had rendered the whole tree, and after the math
// component had mounted and painted its readable-LaTeX fallback. The measured
// consequence on a throttled Chromebook-class run: the worksheet was
// interactive at ~840 ms and math was typeset at ~1570 ms, a ~740 ms window in
// which a student reads raw LaTeX — and in which a browser-menu Ctrl+P prints
// it, the residual ruling S5-2 accepted.
//
// But nothing in that sequence required waiting for the render. The document
// itself says whether it contains math, and it says so the instant it lands.
// So: detect on arrival, fire the import immediately, and let the download
// overlap the render that used to precede it.
//
// WHY THIS IS NOT "EAGER LOADING" (and needs no D16 amendment). The chunk stays
// lazy and conditional — a document with no math still fetches nothing, which
// is the entire point of the eager-statics/lazy-heavies split. What changes is
// WHEN a math-bearing page starts its fetch, not WHETHER a math-free page pays
// for one. That distinction is why this was worth trying before amending the
// chunk policy: it costs the shell nothing.
//
//   before │ document ──▶ render tree ──▶ math mounts ──▶ import ──▶ paint
//    after │ document ──┬▶ import ─────────────────────────────────▶ paint
//          │            └▶ render tree ──▶ math mounts ──▶ (resident, no wait)
// =============================================================================

import { loadMathRenderer, residentMathRenderer } from './math.js';

/** Inline/block node types whose presence means KaTeX will be needed. */
const MATH_NODE_TYPES = new Set(['math_inline', 'math_block']);

/**
 * Depth cap for the structural scan.
 *
 * Documents nest predictably (sections → rows → columns → blocks → content →
 * marks), so real content sits well inside this. The cap exists so a
 * pathological or cyclic object cannot turn a preload heuristic into a hang on
 * the student's critical path — this runs before the worksheet renders, and
 * nothing here is allowed to be the reason a student waits.
 */
const MAX_DEPTH = 24;

/**
 * Does this document contain math anywhere?
 *
 * STRUCTURAL, not a string search over the serialized document. Scanning
 * `JSON.stringify(doc)` for "math_inline" would be shorter and would also
 * report true for a worksheet whose PROSE mentions the words — and a false
 * positive here costs a math-free page the 75 KiB gz chunk it is supposed to
 * never download, which is the exact regression the lazy tier exists to
 * prevent. So this looks for an object whose `type` is a math node.
 *
 * Walking generically (any object, any array) rather than following the known
 * sections → rows → columns → blocks path is deliberate too: math appears in
 * rich-text content arrays, inside column containers, and inside definition
 * bodies, and a hand-written path walk would silently stop finding it the first
 * time a new container type lands. The cost is one pass over a small object.
 */
export function documentUsesMath(doc: unknown): boolean {
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
        if (typeof type === 'string' && MATH_NODE_TYPES.has(type)) {
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

/**
 * Start loading KaTeX if (and only if) this document needs it.
 *
 * Fire-and-forget by design. The caller is on the path to rendering a
 * worksheet and must not await this: `loadMathRenderer` already dedupes
 * concurrent callers and caches the resolved engine, so the math components
 * that mount moments later either find it resident (no fallback flash at all)
 * or join the in-flight promise this started. A rejection is swallowed for the
 * same reason the mark stamping is — the fallback renders readable LaTeX, so a
 * failed preload degrades to exactly the behaviour that shipped before it.
 *
 * @returns whether a preload was triggered (for tests and instrumentation).
 */
export function preloadMathIfNeeded(doc: unknown): boolean {
    if (residentMathRenderer()) return false; // already loaded; nothing to do
    if (!documentUsesMath(doc)) return false;
    void loadMathRenderer().catch(() => {
        // Swallowed deliberately: the math components retry on mount and the
        // fallback is legible. A preload must never be able to break a page.
    });
    return true;
}
