import type { NumberLineIntervalAttr } from './extensions/NumberLine';

// ============================================================================
// numberLineFormula — parse/format a 1-D inequality ↔ a number-line interval.
// ----------------------------------------------------------------------------
// The teacher authors the interval by TYPING an inequality (mirrors the graph
// ray): "2 < x <= 5" → a segment open-at-2 / closed-at-5; "x < -3" → a ray
// pointing left, open at -3. A missing bound = a ray (open-ended that side).
// Shared by the number-line NodeView (authoring) and markdownToTiptap (the
// ```numberline import fence), so the two can never drift.
//   >= / <=  → closed endpoint     > / <  → open endpoint
// ============================================================================

const styleOf = (op: string): 'open' | 'closed' =>
    op === '<=' || op === '>=' ? 'closed' : 'open';

/**
 * Parse a single or compound 1-D inequality into a NumberLineInterval
 * ({ min?, minStyle?, max?, maxStyle? }). Returns null on anything
 * unrecognized. The variable is any single letter.
 */
export function parseNumberLineInterval(
    raw: string,
): NumberLineIntervalAttr | null {
    // Normalize the notation a MathLive field round-trips (unicode ≤/≥ and the
    // minus sign) back to the ASCII the regexes below read, so a math-mode entry
    // parses identically to a typed one. Mirrors graph-kit's parseGraphFormula.
    const value = raw
        .replace(/≥/g, '>=')
        .replace(/≤/g, '<=')
        .replace(/−/g, '-')
        .trim();

    // Compound, low-on-the-left: "-2 <= x < 5" (both operators increasing).
    const compound = /^(-?[\d.]+)\s*(<=|<)\s*[a-z]\s*(<=|<)\s*(-?[\d.]+)$/i.exec(value);
    if (compound) {
        const lo = Number(compound[1]);
        const hi = Number(compound[4]);
        if (!Number.isFinite(lo) || !Number.isFinite(hi) || !(lo < hi)) return null;
        return {
            min: lo,
            minStyle: styleOf(compound[2]!),
            max: hi,
            maxStyle: styleOf(compound[3]!),
        };
    }

    // Single, variable on the left: "x >= 3", "x < 5".
    const left = /^[a-z]\s*(<=|>=|<|>)\s*(-?[\d.]+)$/i.exec(value);
    if (left) {
        const op = left[1]!;
        const n = Number(left[2]);
        if (!Number.isFinite(n)) return null;
        return op === '>' || op === '>='
            ? { min: n, minStyle: styleOf(op) }
            : { max: n, maxStyle: styleOf(op) };
    }

    // Single, variable on the right: "3 <= x" (≡ x >= 3), "5 > x" (≡ x < 5).
    const right = /^(-?[\d.]+)\s*(<=|>=|<|>)\s*[a-z]$/i.exec(value);
    if (right) {
        const op = right[2]!;
        const n = Number(right[1]);
        if (!Number.isFinite(n)) return null;
        return op === '<' || op === '<='
            ? { min: n, minStyle: styleOf(op) }
            : { max: n, maxStyle: styleOf(op) };
    }

    return null;
}

/** Render an interval back to its canonical inequality (the parse inverse). */
export function formatNumberLineInterval(iv: NumberLineIntervalAttr): string {
    const hasMin = iv.min !== undefined;
    const hasMax = iv.max !== undefined;
    const lo = (s?: string) => (s === 'open' ? '<' : '<=');
    const hi = (s?: string) => (s === 'open' ? '<' : '<=');
    if (hasMin && hasMax) {
        return `${iv.min} ${lo(iv.minStyle)} x ${hi(iv.maxStyle)} ${iv.max}`;
    }
    if (hasMin) {
        return `x ${iv.minStyle === 'open' ? '>' : '>='} ${iv.min}`;
    }
    if (hasMax) {
        return `x ${iv.maxStyle === 'open' ? '<' : '<='} ${iv.max}`;
    }
    return '';
}
