import { useEffect, useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import {
    DRAWABLE_PALETTE,
    DRAWABLE_PALETTE_KEYS,
    resolveDrawableColor,
    type DrawableColorKey,
} from '@activity/graph-kit';
import type { DrawableAttr } from '../extensions/InteractiveGraph';
import FormulaField from './FormulaField';
import { drawablesFromFreeform } from './drawableFormulaLogic';
import { formatDrawable, updateDrawableFromText } from './drawableText';

// ============================================================================
// DrawableListEditor — the uniform (Desmos-style) expression list for a static
// graph's drawables. Every drawable is ONE row: a color swatch, its expression
// as monospace text (type `y = x^2` or `(2, 3)` — no per-kind categories), and
// a quiet kebab that opens the row's options (color + the per-kind extras that
// don't live in the text). Adding routes freeform text to the right kind
// (drawablesFromFreeform); polygon, the one kind with no text grammar, is a
// read-only summary row created by a "+ shape" button and edited in its options.
//
// `kinds` narrows what a row/add may create (MC choice figures omit `expression`
// — a formula drawable needs the kit's parser at render time and the kit-free
// choice figure would draw nothing). The caller renders its own live preview.
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
            className="drawable-row__num"
            onChange={(e) => onChange(num(e.target.value, value))}
            onKeyDown={(e) => e.stopPropagation()}
        />
    );
}

// Point rows read as a circle swatch, everything else a square — the one shape
// cue that keeps a single uniform list scannable (Desmos's trick).
const swatchRadius = (kind: DrawableAttr['kind']): string =>
    kind === 'point' ? '50%' : '3px';

// ---- The row's text field (commit on Enter / blur, no-op on unchanged) ------
function RowTextInput({
    value,
    disabled,
    onApply,
}: {
    value: string;
    disabled: boolean;
    onApply: (raw: string) => string | null;
}) {
    const [draft, setDraft] = useState(value);
    const [error, setError] = useState<string | null>(null);
    // Re-sync when the drawable changes underneath us (e.g. an options edit, or
    // the committed text canonicalized "y=2x" -> "y = 2x").
    useEffect(() => setDraft(value), [value]);

    const commit = (): void => setError(onApply(draft));

    return (
        <span className="drawable-row__field">
            <input
                type="text"
                className="drawable-row__text"
                value={draft}
                disabled={disabled}
                spellCheck={false}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commit();
                    }
                }}
            />
            {error && <span className="drawable-row__error">{error}</span>}
        </span>
    );
}

// ---- Color picker (curated palette; stores a KEY, not a hex) -----------------
function ColorPicker({
    value,
    disabled,
    onChange,
}: {
    value: DrawableColorKey | undefined;
    disabled: boolean;
    onChange: (key: DrawableColorKey | undefined) => void;
}) {
    return (
        <div className="drawable-row__colors" role="group" aria-label="Color">
            <button
                type="button"
                disabled={disabled}
                title="Default color"
                aria-label="Default color"
                aria-pressed={value === undefined}
                className={`drawable-row__swatch-btn${value === undefined ? ' is-on' : ''}`}
                style={{ background: resolveDrawableColor(undefined) }}
                onClick={() => onChange(undefined)}
            />
            {DRAWABLE_PALETTE_KEYS.map((key) => (
                <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    title={key}
                    aria-label={key}
                    aria-pressed={value === key}
                    className={`drawable-row__swatch-btn${value === key ? ' is-on' : ''}`}
                    style={{ background: DRAWABLE_PALETTE[key] }}
                    onClick={() => onChange(key)}
                />
            ))}
        </div>
    );
}

// ---- Per-kind extras that don't live in the row's text ----------------------
function RowOptions({
    d,
    disabled,
    onChange,
}: {
    d: DrawableAttr;
    disabled: boolean;
    onChange: (d: DrawableAttr) => void;
}) {
    const check = (
        label: string,
        checked: boolean,
        toggle: (on: boolean) => void,
    ) => (
        <label className="drawable-row__check">
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => toggle(e.target.checked)}
            />
            {label}
        </label>
    );

    return (
        <div className="drawable-row__options">
            <div className="drawable-row__opt-line">
                <span className="drawable-row__opt-label">Color</span>
                <ColorPicker
                    value={d.color}
                    disabled={disabled}
                    onChange={(color) => onChange({ ...d, color })}
                />
            </div>

            {d.kind === 'point' && (
                <div className="drawable-row__opt-line">
                    {check('open dot', d.style === 'open', (on) =>
                        onChange({ ...d, style: on ? 'open' : undefined }),
                    )}
                    <label className="drawable-row__check">
                        label
                        <input
                            type="text"
                            className="drawable-row__label-input"
                            value={d.label ?? ''}
                            disabled={disabled}
                            onChange={(e) =>
                                onChange({ ...d, label: e.target.value || undefined })
                            }
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </label>
                </div>
            )}

            {/* Curve: a dashed toggle ONLY for a plain equation — for an
                inequality the operator (>/< vs >=/<=) already sets the boundary
                style, so a separate toggle would be redundant. */}
            {d.kind === 'curve' && (
                <div className="drawable-row__opt-line">
                    {!d.shade &&
                        check('dashed', d.style === 'dashed', (on) =>
                            onChange({ ...d, style: on ? 'dashed' : undefined }),
                        )}
                    {check('arrows', d.arrows !== false, (on) =>
                        onChange({ ...d, arrows: on ? undefined : false }),
                    )}
                </div>
            )}

            {d.kind === 'expression' && (
                <div className="drawable-row__opt-line">
                    {check('dashed', d.style === 'dashed', (on) =>
                        onChange({ ...d, style: on ? 'dashed' : undefined }),
                    )}
                    {check('arrows', d.arrows !== false, (on) =>
                        onChange({ ...d, arrows: on ? undefined : false }),
                    )}
                </div>
            )}

            {d.kind === 'ray' && (
                <div className="drawable-row__opt-line">
                    {check('open start', d.fromStyle === 'open', (on) =>
                        onChange({ ...d, fromStyle: on ? 'open' : undefined }),
                    )}
                    {check('arrow', d.arrows !== false, (on) =>
                        onChange({ ...d, arrows: on ? undefined : false }),
                    )}
                </div>
            )}

            {d.kind === 'segment' && (
                <div className="drawable-row__opt-line">
                    {check('open start', d.endpoints?.[0] === 'open', (on) =>
                        onChange({
                            ...d,
                            endpoints: [on ? 'open' : 'closed', d.endpoints?.[1] ?? 'closed'],
                        }),
                    )}
                    {check('open end', d.endpoints?.[1] === 'open', (on) =>
                        onChange({
                            ...d,
                            endpoints: [d.endpoints?.[0] ?? 'closed', on ? 'open' : 'closed'],
                        }),
                    )}
                </div>
            )}

            {d.kind === 'polygon' && (
                <div className="drawable-row__opt-line drawable-row__opt-line--stack">
                    {d.vertices.map((v, vi) => (
                        <span key={vi} className="drawable-row__vertex">
                            <NumCell
                                value={v[0]}
                                disabled={disabled}
                                onChange={(x) =>
                                    onChange({
                                        ...d,
                                        vertices: d.vertices.map((w, wj) => (wj === vi ? [x, w[1]] : w)),
                                    })
                                }
                            />
                            <NumCell
                                value={v[1]}
                                disabled={disabled}
                                onChange={(y) =>
                                    onChange({
                                        ...d,
                                        vertices: d.vertices.map((w, wj) => (wj === vi ? [w[0], y] : w)),
                                    })
                                }
                            />
                            {d.vertices.length > 3 && (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    className="drawable-row__vertex-x"
                                    aria-label="Remove vertex"
                                    onClick={() =>
                                        onChange({ ...d, vertices: d.vertices.filter((_, wj) => wj !== vi) })
                                    }
                                >
                                    <X size={12} aria-hidden="true" />
                                </button>
                            )}
                        </span>
                    ))}
                    <span className="drawable-row__opt-line">
                        <button
                            type="button"
                            disabled={disabled}
                            className="drawable-row__mini-btn"
                            onClick={() => onChange({ ...d, vertices: [...d.vertices, [0, 0]] })}
                        >
                            + vertex
                        </button>
                        {check('filled', d.filled, (on) => onChange({ ...d, filled: on }))}
                    </span>
                </div>
            )}
        </div>
    );
}

// ---- One uniform row --------------------------------------------------------
function DrawableRow({
    d,
    disabled,
    kinds,
    onChange,
    onRemove,
}: {
    d: DrawableAttr;
    disabled: boolean;
    kinds: readonly DrawableKind[];
    onChange: (d: DrawableAttr) => void;
    onRemove: () => void;
}) {
    const [open, setOpen] = useState(false);
    const text = formatDrawable(d);

    return (
        <div className="drawable-row">
            <div className="drawable-row__main">
                <span
                    className="drawable-row__swatch"
                    style={{
                        background: resolveDrawableColor(d.color),
                        borderRadius: swatchRadius(d.kind),
                    }}
                    aria-hidden="true"
                />
                {d.kind === 'polygon' ? (
                    <span className="drawable-row__text drawable-row__text--readonly">{text}</span>
                ) : (
                    <RowTextInput
                        value={text}
                        disabled={disabled}
                        onApply={(raw) => {
                            const res = updateDrawableFromText(d, raw, kinds);
                            if (!res.ok) return res.message;
                            onChange(res.drawable);
                            return null;
                        }}
                    />
                )}
                <button
                    type="button"
                    className={`drawable-row__kebab${open ? ' is-open' : ''}`}
                    title="Options"
                    aria-label="Options"
                    aria-expanded={open}
                    disabled={disabled}
                    onClick={() => setOpen((o) => !o)}
                >
                    <MoreHorizontal size={15} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className="drawable-row__remove"
                    title="Remove shape"
                    aria-label="Remove shape"
                    disabled={disabled}
                    onClick={onRemove}
                >
                    <X size={14} aria-hidden="true" />
                </button>
            </div>
            {open && <RowOptions d={d} disabled={disabled} onChange={onChange} />}
        </div>
    );
}

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
    const remove = (i: number): void => onChange(drawables.filter((_, j) => j !== i));

    // The add row: route whatever the author types to the right drawable
    // kind(s). Polygon is the one kind with no text syntax; it keeps a button.
    const addFromFormula = (raw: string): string | null => {
        const res = drawablesFromFreeform(raw, kinds);
        if (res.kind === 'error') return res.message;
        onChange([...drawables, ...res.drawables]);
        return null;
    };
    const addPolygon = (): void =>
        onChange([...drawables, { kind: 'polygon', vertices: [[0, 0], [3, 0], [1, 3]], filled: true }]);

    return (
        <div className="drawable-list">
            {drawables.length === 0 && (
                <p className="drawable-list__empty">
                    No shapes yet — type an equation, point, or ray below.
                </p>
            )}
            {drawables.map((d, i) => (
                <DrawableRow
                    key={i}
                    d={d}
                    disabled={disabled}
                    kinds={kinds}
                    onChange={(nd) => replace(i, nd)}
                    onRemove={() => remove(i)}
                />
            ))}
            <div className="drawable-list__add">
                <FormulaField
                    value=""
                    disabled={disabled}
                    label="Add:"
                    placeholder="y = x^2 - 4   ·   (2, 3)   ·   y > 2x + 1   ·   ray (0, 0) through (2, 1)   ·   segment (1, 1) to (4, 3)"
                    containerStyle={{ marginTop: 0, flex: 1, minWidth: '16rem' }}
                    onApply={addFromFormula}
                    // Text default: the add box accepts command syntax (ray/
                    // segment) that isn't math notation. Flippable to math.
                    modeKey="drawable:add"
                    defaultMode="text"
                />
                {kinds.includes('polygon') && (
                    <button
                        type="button"
                        disabled={disabled}
                        className="drawable-list__add-shape"
                        onClick={addPolygon}
                    >
                        + shape
                    </button>
                )}
            </div>
        </div>
    );
}
