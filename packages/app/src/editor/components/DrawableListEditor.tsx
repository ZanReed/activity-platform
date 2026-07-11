import type { CSSProperties } from 'react';
import { parseGraphFormula, formatModel, formatInequality } from '@activity/graph-kit';
import type { DrawableAttr } from '../extensions/InteractiveGraph';
import FormulaField from './FormulaField';
import { formatCurveDomain } from '../../lib/graphDomain';
import { curveFromFormula, drawablesFromFreeform } from './drawableFormulaLogic';

// ============================================================================
// DrawableListEditor — add/edit/remove the drawables of a static graph.
// ----------------------------------------------------------------------------
// Extracted from InteractiveGraphView's display-mode editor (2026-07-10) so
// multiple-choice per-choice graphs author with the identical control set.
// Numeric coordinates (dragging on a board is a future enhancement); the
// caller renders its own live preview above/beside this list.
//
// Adding is one calculator-style formula box (drawablesFromFreeform routes
// points / equations / inequalities / ray+segment commands to the right
// drawable kind) plus a button for polygon, the one kind with no text syntax.
//
// `kinds` narrows what the freeform box may create: the interactive graph
// block offers every drawable, while MC choice figures omit `expression` — a
// formula drawable needs the kit's parser at render time and the choice figure
// is rendered kit-free (renderGraphSvg), so an expression there would silently
// draw nothing on the published page.
// ============================================================================

export const ALL_DRAWABLE_KINDS = [
    'point',
    'curve',
    'expression',
    'segment',
    'ray',
    'polygon',
] as const;
export type DrawableKind = (typeof ALL_DRAWABLE_KINDS)[number];

const num = (v: string, fallback: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

// A stable (module-scope) numeric cell — kept out of render bodies so its
// element identity survives re-renders and the input doesn't lose focus
// mid-edit. Exported for the MC figure panel's axis-window editor.
export function NumCell({
    value,
    disabled,
    onChange,
}: {
    value: number;
    disabled: boolean;
    onChange: (n: number) => void;
}) {
    return (
        <input
            type="number"
            value={value}
            disabled={disabled}
            step={0.5}
            style={{ width: '3.2rem' }}
            onChange={(e) => onChange(num(e.target.value, value))}
            onKeyDown={(e) => e.stopPropagation()}
        />
    );
}

const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexWrap: 'wrap',
    fontSize: '0.78rem',
    color: '#475569',
    padding: '0.25rem 0',
    borderTop: '1px solid #eef2f6',
};

export default function DrawableListEditor({
    drawables,
    disabled,
    onChange,
    kinds = ALL_DRAWABLE_KINDS,
}: {
    drawables: DrawableAttr[];
    disabled: boolean;
    onChange: (drawables: DrawableAttr[]) => void;
    kinds?: readonly DrawableKind[];
}) {
    const replace = (i: number, d: DrawableAttr): void =>
        onChange(drawables.map((x, j) => (j === i ? d : x)));
    const remove = (i: number): void =>
        onChange(drawables.filter((_, j) => j !== i));
    // The curve row's freeform equation field: parse any family (+ optional
    // `for …` domain) with the same parser as the graded answer + import DSL.
    // Returns an error string (shown inline) or null.
    const applyCurveFormula = (
        i: number,
        d: Extract<DrawableAttr, { kind: 'curve' }>,
        raw: string,
    ): string | null => {
        const parsed = parseGraphFormula(raw);
        if (parsed.kind === 'error') return parsed.message;
        if (parsed.kind === 'points') {
            return 'That looks like a point — add a point shape instead.';
        }
        replace(i, curveFromFormula(d, parsed));
        return null;
    };
    // The unified add box: route whatever the author types — point list,
    // equation/inequality, ray/segment command, freeform expression — to the
    // right drawable kind(s). Polygon is the one kind with no text syntax; it
    // keeps a button.
    const addFromFormula = (raw: string): string | null => {
        const res = drawablesFromFreeform(raw, kinds);
        if (res.kind === 'error') return res.message;
        onChange([...drawables, ...res.drawables]);
        return null;
    };
    const addPolygon = (): void =>
        onChange([...drawables, { kind: 'polygon', vertices: [[0, 0], [3, 0], [1, 3]], filled: true }]);

    return (
        <div style={{ marginTop: '0.4rem' }}>
            {drawables.length === 0 && (
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                    No shapes yet — type a formula, point, ray, or segment below.
                </p>
            )}
            {drawables.map((d, i) => (
                <div key={i} style={rowStyle}>
                    {d.kind === 'point' && (
                        <>
                            <strong style={{ minWidth: '4.5rem' }}>Point</strong>
                            <NumCell value={d.at[0]} disabled={disabled}
                                onChange={(x) => replace(i, { ...d, at: [x, d.at[1]] })} />
                            <NumCell value={d.at[1]} disabled={disabled}
                                onChange={(y) => replace(i, { ...d, at: [d.at[0], y] })} />
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.style === 'open'} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, style: e.target.checked ? 'open' : undefined })} />
                                open
                            </label>
                            <input
                                type="text"
                                placeholder="label"
                                value={d.label ?? ''}
                                disabled={disabled}
                                style={{ width: '5rem' }}
                                onChange={(e) =>
                                    replace(i, {
                                        ...d,
                                        label: e.target.value || undefined,
                                    })
                                }
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </>
                    )}
                    {d.kind === 'curve' && (
                        <>
                            <strong style={{ minWidth: '4.5rem' }}>Curve</strong>
                            {/* Freeform equation OR inequality (any family) +
                                optional `for …` domain — the same parser as the
                                graded answer field and the ```graph import DSL.
                                A shaded row displays as its inequality (strict
                                iff dashed — the same convention the import
                                mapping writes). */}
                            <FormulaField
                                value={
                                    (d.shade
                                        ? formatInequality(d.model, d.shade, d.style === 'dashed')
                                        : formatModel(d.model)) + formatCurveDomain(d.domain)
                                }
                                disabled={disabled}
                                placeholder="y = x^2 - 4   ·   y > 2x + 1   ·   x = 4   ·   y = 2x for x >= 0"
                                containerStyle={{ marginTop: 0, flex: 1, minWidth: '12rem' }}
                                onApply={(raw) => applyCurveFormula(i, d, raw)}
                            />
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.style === 'dashed'} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, style: e.target.checked ? 'dashed' : undefined })} />
                                dashed
                            </label>
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.arrows !== false} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, arrows: e.target.checked ? undefined : false })} />
                                arrows
                            </label>
                        </>
                    )}
                    {d.kind === 'expression' && (
                        <>
                            <strong style={{ minWidth: '4.5rem' }}>Formula</strong>
                            <input
                                type="text"
                                value={d.expression}
                                disabled={disabled}
                                spellCheck={false}
                                style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}
                                onChange={(e) => replace(i, { ...d, expression: e.target.value })}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.style === 'dashed'} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, style: e.target.checked ? 'dashed' : undefined })} />
                                dashed
                            </label>
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.arrows !== false} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, arrows: e.target.checked ? undefined : false })} />
                                arrows
                            </label>
                        </>
                    )}
                    {d.kind === 'ray' && (
                        <>
                            <strong style={{ minWidth: '4.5rem' }}>Ray</strong>
                            <NumCell value={d.from[0]} disabled={disabled}
                                onChange={(x) => replace(i, { ...d, from: [x, d.from[1]] })} />
                            <NumCell value={d.from[1]} disabled={disabled}
                                onChange={(y) => replace(i, { ...d, from: [d.from[0], y] })} />
                            <span>→ through</span>
                            <NumCell value={d.through[0]} disabled={disabled}
                                onChange={(x) => replace(i, { ...d, through: [x, d.through[1]] })} />
                            <NumCell value={d.through[1]} disabled={disabled}
                                onChange={(y) => replace(i, { ...d, through: [d.through[0], y] })} />
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.fromStyle === 'open'} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, fromStyle: e.target.checked ? 'open' : undefined })} />
                                open start
                            </label>
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.arrows !== false} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, arrows: e.target.checked ? undefined : false })} />
                                arrow
                            </label>
                        </>
                    )}
                    {d.kind === 'segment' && (
                        <>
                            <strong style={{ minWidth: '4.5rem' }}>Segment</strong>
                            <NumCell value={d.from[0]} disabled={disabled}
                                onChange={(x) => replace(i, { ...d, from: [x, d.from[1]] })} />
                            <NumCell value={d.from[1]} disabled={disabled}
                                onChange={(y) => replace(i, { ...d, from: [d.from[0], y] })} />
                            <span>→</span>
                            <NumCell value={d.to[0]} disabled={disabled}
                                onChange={(x) => replace(i, { ...d, to: [x, d.to[1]] })} />
                            <NumCell value={d.to[1]} disabled={disabled}
                                onChange={(y) => replace(i, { ...d, to: [d.to[0], y] })} />
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.endpoints?.[0] === 'open'} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, endpoints: [e.target.checked ? 'open' : 'closed', d.endpoints?.[1] ?? 'closed'] })} />
                                open start
                            </label>
                            <label style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.72rem' }}>
                                <input type="checkbox" checked={d.endpoints?.[1] === 'open'} disabled={disabled}
                                    onChange={(e) => replace(i, { ...d, endpoints: [d.endpoints?.[0] ?? 'closed', e.target.checked ? 'open' : 'closed'] })} />
                                open end
                            </label>
                        </>
                    )}
                    {d.kind === 'polygon' && (
                        <>
                            <strong style={{ minWidth: '4.5rem' }}>Polygon</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {d.vertices.map((v, vi) => (
                                    <span key={vi} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        <NumCell value={v[0]} disabled={disabled}
                                            onChange={(x) =>
                                                replace(i, {
                                                    ...d,
                                                    vertices: d.vertices.map((w, wj) => (wj === vi ? [x, w[1]] : w)),
                                                })
                                            } />
                                        <NumCell value={v[1]} disabled={disabled}
                                            onChange={(y) =>
                                                replace(i, {
                                                    ...d,
                                                    vertices: d.vertices.map((w, wj) => (wj === vi ? [w[0], y] : w)),
                                                })
                                            } />
                                        {d.vertices.length > 3 && (
                                            <button type="button" disabled={disabled}
                                                onClick={() =>
                                                    replace(i, { ...d, vertices: d.vertices.filter((_, wj) => wj !== vi) })
                                                }
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                                aria-label="Remove vertex">×</button>
                                        )}
                                    </span>
                                ))}
                                <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button type="button" disabled={disabled}
                                        onClick={() => replace(i, { ...d, vertices: [...d.vertices, [0, 0]] })}
                                        style={{ fontSize: '0.72rem', cursor: 'pointer' }}>+ vertex</button>
                                    <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        <input type="checkbox" checked={d.filled} disabled={disabled}
                                            onChange={(e) => replace(i, { ...d, filled: e.target.checked })} />
                                        filled
                                    </label>
                                </span>
                            </div>
                        </>
                    )}
                    <button type="button" disabled={disabled} onClick={() => remove(i)}
                        style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.78rem' }}
                        aria-label="Remove shape">Remove</button>
                </div>
            ))}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '0.4rem' }}>
                <FormulaField
                    value=""
                    disabled={disabled}
                    label="Add:"
                    placeholder="y = x^2 - 4   ·   (2, 3)   ·   y > 2x + 1   ·   ray (0, 0) through (2, 1)   ·   segment (1, 1) to (4, 3)"
                    containerStyle={{ marginTop: 0, flex: 1, minWidth: '16rem' }}
                    onApply={addFromFormula}
                />
                {kinds.includes('polygon') && (
                    <button type="button" disabled={disabled} onClick={addPolygon}
                        style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: 4, background: '#f8fafc', cursor: 'pointer', color: '#334155' }}>
                        + polygon
                    </button>
                )}
            </div>
        </div>
    );
}
