import {
    formatModel,
    formatInequality,
    formatPoints,
    formatRay,
    formatSegment,
} from '@activity/graph-kit';
import type { DrawableAttr } from '../extensions/InteractiveGraph';
import { formatCurveDomain } from '../../lib/graphDomain';
import { drawablesFromFreeform } from './drawableFormulaLogic';

// ============================================================================
// drawableText — the pure round-trip spine of the uniform (Desmos-style)
// expression list. `formatDrawable` renders any drawable to the editable text
// its row shows; `updateDrawableFromText` re-parses an edited row back to a
// drawable while PRESERVING the extras that live behind the row's affordance
// (label / open / dashed / arrows) and ALWAYS preserving color. A leaf module
// (the numberLineFormula.ts / blankPopoverLogic.ts pattern) so it unit-tests
// without the component.
//
// The composition MUST include formatCurveDomain — a curve's `for …` domain
// lives IN the text, so dropping it from the format string would wipe the
// domain on the next edit.
//
// Polygon has no text grammar (no parser can read it back), so its row is
// read-only: formatDrawable emits a summary for display, and
// updateDrawableFromText is a no-op for it (vertices are edited in the row's
// options, not its text).
// ============================================================================

export function formatDrawable(d: DrawableAttr): string {
    switch (d.kind) {
        case 'point':
            return formatPoints([d.at]);
        case 'curve':
            return (
                (d.shade
                    ? formatInequality(d.model, d.shade, d.style === 'dashed')
                    : formatModel(d.model)) + formatCurveDomain(d.domain)
            );
        case 'expression':
            return d.expression;
        case 'ray':
            return formatRay(d);
        case 'segment':
            return formatSegment(d);
        case 'polygon':
            // Read-only summary — not reparseable (edited via the row options).
            return `polygon ${d.vertices.map(([x, y]) => `(${x}, ${y})`).join(' ')}`;
        // Y7 geometry marks: read-only summaries too. They are authored in the
        // ```figure fence (letters, not coordinates) and edited through the
        // figure-source popover, never row by row.
        case 'angle_mark':
            return (
                `angle at ${pt(d.at)} from ${pt(d.from)} to ${pt(d.to)}` +
                (d.style === 'right' ? ' right' : '') +
                (d.reflex ? ' reflex' : '') +
                (d.label ? ` "${d.label}"` : '')
            );
        case 'tick_mark':
            return `ticks ${pt(d.from)} ${pt(d.to)} ×${d.count}`;
        case 'parallel_mark':
            return `parallel ${pt(d.from)} ${pt(d.to)} ×${d.count}`;
        case 'side_label':
            return `side ${pt(d.from)} ${pt(d.to)} "${d.text}"`;
        case 'text':
            return `text ${pt(d.at)} "${d.text}"`;
    }
}

const pt = ([x, y]: [number, number]): string => `(${x}, ${y})`;

/** Kinds shown as read-only summary rows — their text never re-parses. */
const READ_ONLY_KINDS: ReadonlySet<DrawableAttr['kind']> = new Set([
    'polygon',
    'angle_mark',
    'tick_mark',
    'parallel_mark',
    'side_label',
    'text',
]);

export type DrawableTextUpdate =
    | { ok: true; drawable: DrawableAttr }
    | { ok: false; message: string };

const normalize = (s: string): string => s.trim().replace(/\s+/g, ' ');

/**
 * Re-parse an edited row's text back to a drawable.
 * - No-op when the text is unchanged (identity guard) so a bare focus/blur
 *   never churns autosave or resets default tolerances.
 * - Honors `kinds` (the same gate as the add box) so, e.g., an MC choice figure
 *   never accepts an `expression` that would silently draw nothing.
 * - One row = one drawable: multi-drawable input (e.g. "(1,2),(3,4)") is
 *   rejected — the add row fans out, an inline edit does not.
 * - Merge-preserve: the new geometry, plus the prior drawable's affordance
 *   extras (label/open/dashed/arrows) when the kind is unchanged, and its color
 *   ALWAYS (color is kind-agnostic and survives even a kind change).
 */
export function updateDrawableFromText(
    prev: DrawableAttr,
    raw: string,
    kinds: readonly DrawableAttr['kind'][],
): DrawableTextUpdate {
    // Polygon and geometry-mark rows are not text-editable.
    if (READ_ONLY_KINDS.has(prev.kind)) return { ok: true, drawable: prev };

    // Identity guard — unchanged text is a true no-op.
    if (normalize(formatDrawable(prev)) === normalize(raw)) {
        return { ok: true, drawable: prev };
    }

    const res = drawablesFromFreeform(raw, kinds);
    if (res.kind === 'error') return { ok: false, message: res.message };
    if (res.drawables.length !== 1) {
        return {
            ok: false,
            message: 'Put one shape per row — use the row below to add another.',
        };
    }
    const next = res.drawables[0] as DrawableAttr;
    return { ok: true, drawable: mergeExtras(prev, next) };
}

// Carry the prior drawable's non-geometry extras onto freshly parsed geometry.
// Kind-specific extras only survive a same-kind edit; color always survives.
function mergeExtras(prev: DrawableAttr, next: DrawableAttr): DrawableAttr {
    let merged: DrawableAttr = next;
    if (next.kind === prev.kind) {
        switch (next.kind) {
            case 'point': {
                const p = prev as Extract<DrawableAttr, { kind: 'point' }>;
                merged = {
                    ...next,
                    ...(p.label !== undefined ? { label: p.label } : {}),
                    ...(p.style !== undefined ? { style: p.style } : {}),
                };
                break;
            }
            case 'curve': {
                const p = prev as Extract<DrawableAttr, { kind: 'curve' }>;
                // model/shade/domain/dashed come from the text; arrows is the
                // independent display extra to carry.
                merged = { ...next, ...(p.arrows !== undefined ? { arrows: p.arrows } : {}) };
                break;
            }
            case 'expression': {
                const p = prev as Extract<DrawableAttr, { kind: 'expression' }>;
                merged = {
                    ...next,
                    ...(p.arrows !== undefined ? { arrows: p.arrows } : {}),
                    ...(p.style !== undefined ? { style: p.style } : {}),
                };
                break;
            }
            case 'ray': {
                const p = prev as Extract<DrawableAttr, { kind: 'ray' }>;
                merged = { ...next, ...(p.arrows !== undefined ? { arrows: p.arrows } : {}) };
                break;
            }
            // segment: no extras beyond geometry + color.
        }
    }
    // Color is kind-agnostic — preserve across any edit, including a kind change.
    // (side_label / text carry no colour — they are always ink — and are
    // read-only anyway, so neither side of this merge can be one.)
    if ('color' in prev && prev.color !== undefined && merged.kind !== 'side_label' && merged.kind !== 'text') {
        merged = { ...merged, color: prev.color };
    }
    return merged;
}
