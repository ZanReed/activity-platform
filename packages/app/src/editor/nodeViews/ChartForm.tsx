import { useEffect, useState } from 'react';
import { CHART_MAX_CATEGORIES, CHART_MAX_SERIES } from '@activity/schema';
import type { ChartAttrs, ChartKindAttr } from '../../lib/chartFence';

// ============================================================================
// ChartForm — in-place editing for a chart block (author finding 2026-10-04).
//
// Every field commits on BLUR or Enter, never per keystroke, for two reasons:
//   * a half-typed value ("1." on the way to "1.5", an emptied name) must not
//     reach the node — the schema refuses an empty category name and a
//     negative value, and a refused node takes the whole document's save with
//     it;
//   * updating a NodeView's attrs on every keystroke re-renders the view under
//     the caret (the documented "input deselects after one keystroke" hazard).
// A value that cannot be committed snaps back to the stored one on blur.
//
// The form holds to the limits the renderer was laid out for: at most
// CHART_MAX_CATEGORIES categories and CHART_MAX_SERIES series, at least one of
// each, values of 0 or more.
// ============================================================================

const KINDS: { value: ChartKindAttr; label: string }[] = [
    { value: 'bar', label: 'Bar' },
    { value: 'clustered', label: 'Clustered bars' },
    { value: 'stacked', label: 'Stacked bars' },
    { value: 'line', label: 'Time-series line' },
];

/** A text input that commits on blur / Enter and reverts what it cannot commit. */
function Field({
    value,
    label,
    onCommit,
    disabled,
    className,
    numeric = false,
    placeholder,
}: {
    value: string;
    label: string;
    /** Return false to refuse the value (the input snaps back). */
    onCommit: (next: string) => boolean | void;
    disabled: boolean;
    className?: string;
    numeric?: boolean;
    placeholder?: string;
}) {
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);
    const commit = (): void => {
        if (draft === value) return;
        if (onCommit(draft.trim()) === false) setDraft(value);
    };
    return (
        <input
            type="text"
            inputMode={numeric ? 'decimal' : undefined}
            aria-label={label}
            className={className}
            value={draft}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                }
            }}
        />
    );
}

const num = (n: number): string => String(Number(n.toFixed(6)));
/** A non-negative number, or null when the text is not one. */
function parseValue(text: string): number | null {
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
    return Number(text);
}

/** The largest value the axis must reach (a stack's total for stacked). */
function ceilingOf(data: ChartAttrs): number {
    return Math.max(
        0,
        ...data.categories.map((_, c) =>
            data.chart === 'stacked'
                ? data.series.reduce((sum, s) => sum + (s.values[c] ?? 0), 0)
                : Math.max(...data.series.map((s) => s.values[c] ?? 0)),
        ),
    );
}

export default function ChartForm({
    data,
    disabled,
    onChange,
    onDone,
}: {
    data: ChartAttrs;
    disabled: boolean;
    onChange: (next: ChartAttrs) => void;
    onDone: () => void;
}) {
    // An optional text field: empty removes the key (so the node, the fence
    // text and the stored block all agree that it is absent).
    const setText = (key: 'title' | 'xLabel' | 'yLabel' | 'alt', text: string): void => {
        const next = { ...data };
        if (text === '') delete next[key];
        else next[key] = text;
        onChange(next);
    };

    // A step is meaningless without a top (the fence cannot spell it either),
    // and a top below the data would push bars off the plot.
    const setAxis = (key: 'yMax' | 'yStep', text: string): boolean => {
        const next = { ...data };
        if (text === '') {
            delete next[key];
            if (key === 'yMax') delete next.yStep;
            onChange(next);
            return true;
        }
        const v = parseValue(text);
        if (v === null || v <= 0) return false;
        if (key === 'yMax' && v < ceilingOf(data)) return false;
        if (key === 'yStep' && (data.yMax === undefined || data.yMax / v > 20)) return false;
        next[key] = v;
        onChange(next);
        return true;
    };

    const setKind = (chart: ChartKindAttr): void => {
        // One bar per series per category is the only reading of "bar" with
        // several series that loses no data (the importer's rule).
        onChange({ ...data, chart: chart === 'bar' && data.series.length > 1 ? 'clustered' : chart });
    };

    const setCategory = (c: number, text: string): boolean => {
        if (text === '' || text.includes(',')) return false;
        onChange({ ...data, categories: data.categories.map((old, i) => (i === c ? text : old)) });
        return true;
    };
    const addCategory = (): void =>
        onChange({
            ...data,
            categories: [...data.categories, `Category ${data.categories.length + 1}`],
            series: data.series.map((s) => ({ ...s, values: [...s.values, 0] })),
        });
    const removeCategory = (c: number): void =>
        onChange({
            ...data,
            categories: data.categories.filter((_, i) => i !== c),
            series: data.series.map((s) => ({ ...s, values: s.values.filter((_, i) => i !== c) })),
        });

    const setSeriesName = (i: number, text: string): boolean => {
        if (text.includes('=')) return false;
        // With several series every one needs a name (the legend).
        if (text === '' && data.series.length > 1) return false;
        onChange({
            ...data,
            series: data.series.map((s, k) => {
                if (k !== i) return s;
                return text === '' ? { values: s.values } : { name: text, values: s.values };
            }),
        });
        return true;
    };
    const setValue = (i: number, c: number, text: string): boolean => {
        const v = parseValue(text);
        if (v === null) return false;
        const next: ChartAttrs = {
            ...data,
            series: data.series.map((s, k) =>
                k === i ? { ...s, values: s.values.map((old, j) => (j === c ? v : old)) } : s,
            ),
        };
        // An authored axis top the new value outgrows is dropped, not kept as
        // a top the renderer would have to ignore.
        if (next.yMax !== undefined && next.yMax < ceilingOf(next)) {
            delete next.yMax;
            delete next.yStep;
        }
        onChange(next);
        return true;
    };
    const addSeries = (): void => {
        // Adding a second series names the first, so the legend can tell them apart.
        const named = data.series.map((s, i) => (s.name ? s : { ...s, name: `Series ${i + 1}` }));
        onChange({
            ...data,
            chart: data.chart === 'bar' ? 'clustered' : data.chart,
            series: [
                ...named,
                { name: `Series ${named.length + 1}`, values: data.categories.map(() => 0) },
            ],
        });
    };
    const removeSeries = (i: number): void => {
        const series = data.series.filter((_, k) => k !== i);
        onChange({
            ...data,
            chart: series.length === 1 && data.chart === 'clustered' ? 'bar' : data.chart,
            series,
        });
    };

    const canAddCategory = data.categories.length < CHART_MAX_CATEGORIES;
    const canAddSeries = data.series.length < CHART_MAX_SERIES;

    return (
        <div className="chart-form" contentEditable={false}>
            <div className="chart-form__row">
                <label>
                    Type
                    <select
                        value={data.chart}
                        disabled={disabled}
                        onChange={(e) => setKind(e.target.value as ChartKindAttr)}
                    >
                        {KINDS.map((k) => (
                            <option key={k.value} value={k.value}>
                                {k.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="chart-form__grow">
                    Title
                    <Field
                        label="Chart title"
                        value={data.title ?? ''}
                        disabled={disabled}
                        onCommit={(t) => setText('title', t)}
                    />
                </label>
            </div>
            <div className="chart-form__row">
                <label className="chart-form__grow">
                    Bottom axis label
                    <Field
                        label="Bottom axis label"
                        value={data.xLabel ?? ''}
                        disabled={disabled}
                        onCommit={(t) => setText('xLabel', t)}
                    />
                </label>
                <label className="chart-form__grow">
                    Side axis label
                    <Field
                        label="Side axis label"
                        value={data.yLabel ?? ''}
                        disabled={disabled}
                        onCommit={(t) => setText('yLabel', t)}
                    />
                </label>
            </div>

            <div className="chart-form__grid-wrap">
                <table className="chart-form__grid">
                    <thead>
                        <tr>
                            <th scope="col">Series</th>
                            {data.categories.map((category, c) => (
                                <th key={c} scope="col">
                                    <Field
                                        label={`Category ${c + 1} name`}
                                        value={category}
                                        disabled={disabled}
                                        onCommit={(t) => setCategory(c, t)}
                                    />
                                    <button
                                        type="button"
                                        className="chart-form__remove"
                                        aria-label={`Remove category ${category}`}
                                        disabled={disabled || data.categories.length <= 1}
                                        onClick={() => removeCategory(c)}
                                    >
                                        ×
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.series.map((series, i) => (
                            <tr key={i}>
                                <th scope="row">
                                    <Field
                                        label={`Series ${i + 1} name`}
                                        value={series.name ?? ''}
                                        placeholder={data.series.length > 1 ? 'Name' : 'No name'}
                                        disabled={disabled}
                                        onCommit={(t) => setSeriesName(i, t)}
                                    />
                                    <button
                                        type="button"
                                        className="chart-form__remove"
                                        aria-label={`Remove series ${series.name ?? i + 1}`}
                                        disabled={disabled || data.series.length <= 1}
                                        onClick={() => removeSeries(i)}
                                    >
                                        ×
                                    </button>
                                </th>
                                {series.values.map((value, c) => (
                                    <td key={c}>
                                        <Field
                                            numeric
                                            label={`${series.name ?? 'Value'}, ${data.categories[c] ?? ''}`}
                                            value={num(value)}
                                            disabled={disabled}
                                            onCommit={(t) => setValue(i, c, t)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="chart-form__row">
                <button type="button" disabled={disabled || !canAddCategory} onClick={addCategory}>
                    + Category
                </button>
                <button type="button" disabled={disabled || !canAddSeries} onClick={addSeries}>
                    + Series
                </button>
                <span className="chart-form__hint">
                    Up to {CHART_MAX_CATEGORIES} categories and {CHART_MAX_SERIES} series. Values are 0 or more.
                </span>
            </div>

            <div className="chart-form__row">
                <label>
                    Axis top
                    <Field
                        numeric
                        label="Axis top"
                        className="chart-form__num"
                        value={data.yMax !== undefined ? num(data.yMax) : ''}
                        placeholder="auto"
                        disabled={disabled}
                        onCommit={(t) => setAxis('yMax', t)}
                    />
                </label>
                <label>
                    Step
                    <Field
                        numeric
                        label="Axis step"
                        className="chart-form__num"
                        value={data.yStep !== undefined ? num(data.yStep) : ''}
                        placeholder="auto"
                        disabled={disabled || data.yMax === undefined}
                        onCommit={(t) => setAxis('yStep', t)}
                    />
                </label>
                <label className="chart-form__grow">
                    Description for screen readers (optional)
                    <Field
                        label="Description for screen readers"
                        value={data.alt ?? ''}
                        disabled={disabled}
                        onCommit={(t) => setText('alt', t)}
                    />
                </label>
            </div>
            <div className="graph-figure-view__done-row">
                <button type="button" onClick={onDone}>
                    Done
                </button>
            </div>
        </div>
    );
}
