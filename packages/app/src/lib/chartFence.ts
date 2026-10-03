// =============================================================================
// chartFence.ts — the ```chart fence grammar, and a chart back to that text
// -----------------------------------------------------------------------------
// docs/design/y7-figures-and-charts.md Q7, with N2 (failure states) and N4
// (label length). Y7 charts, T12.
//
//   ```chart
//   type: bar | stacked | clustered | line     ← optional; default bar
//   title: Books borrowed                      ← required (names the chart)
//   xlabel: Day
//   ylabel: Number of books
//   alt: Tuesday is the quietest day           ← optional (N3)
//   categories: Mon, Tue, Wed, Thu, Fri
//   series: 12, 7, 15, 9, 4                    ← one unnamed series, or
//   series: Bus = 4, 6, 3, 5, 2                ← NAME = values (a legend entry)
//   y: 0..20 step 5                            ← optional; the axis starts at 0
//   ```
//
// Rules: lines may come in any order; blank lines are ignored; a bad line is
// SKIPPED with a problem and the chart survives; data the renderer was never
// laid out for (more than 12 categories or 4 series, a negative value) is
// REFUSED with a problem naming the line (N2). A fence with no categories or
// no usable series produces NO block — never the raw fence as text (the
// figure's ER-12b rule: a student must not see fence source).
//
// Pure: no Tiptap, no ctx, no markdown-it — the editor's chart-source popover
// (Q8) imports this file directly and re-runs the SAME parser the importer
// uses. `formatChartSource` is its inverse; the text is generated from the
// block, never stored (the figure's ER-10 rule), and the guard is
// parse(format(attrs)) equals attrs (tests/chartFence.test.ts).
// =============================================================================

import { CHART_MAX_CATEGORIES, CHART_MAX_SERIES } from '@activity/schema';

export type ChartKindAttr = 'bar' | 'stacked' | 'clustered' | 'line';

export interface ChartSeriesAttr {
    name?: string;
    values: number[];
}

/** The Tiptap `chart` node's data attrs (id and sizing are added by callers). */
export interface ChartAttrs {
    chart: ChartKindAttr;
    title?: string;
    xLabel?: string;
    yLabel?: string;
    alt?: string;
    categories: string[];
    series: ChartSeriesAttr[];
    yMax?: number;
    yStep?: number;
}

export interface ChartParse {
    /** The chart, or null when nothing was drawable. */
    attrs: ChartAttrs | null;
    /** Every skipped or refused line, a missing title, an empty chart. */
    problems: string[];
}

/** A category label longer than this warns at import (N4). */
export const CHART_LABEL_WARN = 20;

const KINDS: readonly ChartKindAttr[] = ['bar', 'stacked', 'clustered', 'line'];
const NUM = String.raw`-?(?:\d+(?:\.\d*)?|\.\d+)`;
const Y_RE = new RegExp(String.raw`^(${NUM})\s*\.\.\s*(${NUM})(?:\s+step\s+(${NUM}))?$`, 'i');

/** Split on commas, trimming; an empty item is kept so it can be reported. */
const list = (s: string): string[] => s.split(',').map((x) => x.trim());

export function parseChartFence(content: string): ChartParse {
    const problems: string[] = [];
    const skip = (line: string, why: string): void => {
        problems.push(`Chart: "${line}" — ${why}; the line was skipped.`);
    };
    const refuse = (line: string, why: string): void => {
        problems.push(`Chart: "${line}" — ${why}; the line was refused.`);
    };

    let kind: ChartKindAttr | null = null;
    let title: string | undefined;
    let xLabel: string | undefined;
    let yLabel: string | undefined;
    let alt: string | undefined;
    let categories: string[] | null = null;
    const seriesLines: { line: string; name?: string; raw: string }[] = [];
    let yLine: { line: string; max: number; step?: number } | null = null;

    for (const rawLine of content.split('\n')) {
        const line = rawLine.trim();
        if (line === '') continue;
        const m = /^([A-Za-z]+)\s*:\s*(.*)$/.exec(line);
        if (!m) {
            skip(line, 'not a "key: value" line');
            continue;
        }
        const key = m[1]!.toLowerCase();
        const value = m[2]!.trim();
        switch (key) {
            case 'type': {
                const k = value.toLowerCase() as ChartKindAttr;
                if (KINDS.includes(k)) kind = k;
                else skip(line, `type must be one of ${KINDS.join(', ')}`);
                break;
            }
            case 'title':
                title = value || undefined;
                break;
            case 'xlabel':
                xLabel = value || undefined;
                break;
            case 'ylabel':
                yLabel = value || undefined;
                break;
            case 'alt':
                alt = value || undefined;
                break;
            case 'categories': {
                const items = list(value);
                if (items.some((c) => c === '')) {
                    refuse(line, 'a category name is empty (check for a doubled or trailing comma)');
                } else if (items.length > CHART_MAX_CATEGORIES) {
                    refuse(line, `a chart takes at most ${CHART_MAX_CATEGORIES} categories (this has ${items.length})`);
                } else if (categories) {
                    skip(line, 'categories: was already given');
                } else {
                    categories = items;
                }
                break;
            }
            case 'series': {
                // NAME = values. The name is everything before the FIRST "=",
                // so a name cannot contain one; values never do.
                const eq = value.indexOf('=');
                const name = eq === -1 ? undefined : value.slice(0, eq).trim();
                const raw = eq === -1 ? value : value.slice(eq + 1).trim();
                if (name === '') skip(line, 'the series name before "=" is empty');
                else seriesLines.push({ line, ...(name ? { name } : {}), raw });
                break;
            }
            case 'y': {
                const y = Y_RE.exec(value);
                if (!y) {
                    skip(line, 'write y: 0..MAX or y: 0..MAX step N');
                } else if (Number(y[1]) !== 0) {
                    skip(line, 'the value axis always starts at 0');
                } else if (!(Number(y[2]) > 0) || (y[3] !== undefined && !(Number(y[3]) > 0))) {
                    skip(line, 'the axis top and step must be greater than 0');
                } else {
                    yLine = { line, max: Number(y[2]), ...(y[3] !== undefined ? { step: Number(y[3]) } : {}) };
                }
                break;
            }
            default:
                skip(line, `"${m[1]}" is not a chart line`);
        }
    }

    // Series are checked AFTER the loop: lines may come in any order, so a
    // series written above categories: must still be measured against it.
    const series: ChartSeriesAttr[] = [];
    if (categories) {
        for (const s of seriesLines) {
            const parts = list(s.raw);
            const values = parts.map((p) => (new RegExp(`^${NUM}$`).test(p) ? Number(p) : NaN));
            if (values.some((v) => Number.isNaN(v))) {
                skip(s.line, 'every value must be a number');
            } else if (values.length !== categories.length) {
                skip(s.line, `it has ${values.length} value${values.length === 1 ? '' : 's'} for ${categories.length} categories`);
            } else if (values.some((v) => v < 0)) {
                refuse(s.line, 'a value is below 0, and the value axis starts at 0');
            } else if (series.length >= CHART_MAX_SERIES) {
                refuse(s.line, `a chart takes at most ${CHART_MAX_SERIES} series`);
            } else {
                series.push({ ...(s.name ? { name: s.name } : {}), values });
            }
        }
    }

    if (!categories || series.length === 0) {
        problems.push(
            !categories
                ? 'Chart: it has no categories: line, so it was not imported.'
                : 'Chart: it has no usable series: line, so it was not imported.',
        );
        return { attrs: null, problems };
    }

    for (const c of categories) {
        if (c.length > CHART_LABEL_WARN) {
            problems.push(
                `Chart: the category "${c}" is longer than ${CHART_LABEL_WARN} characters and will crowd the axis — shorten it.`,
            );
        }
    }
    if (series.length > 1 && series.some((s) => !s.name)) {
        problems.push('Chart: with more than one series, name each one (series: Name = values) so the legend can tell them apart.');
    }
    if (!title) {
        problems.push('Chart: it needs a title: line saying what the chart shows.');
    }

    // One bar per series per category is the only reading of "bar" with
    // several series that loses no data, so it is stored as what it draws.
    const chart: ChartKindAttr = kind === null || kind === 'bar' ? (series.length > 1 ? 'clustered' : 'bar') : kind;

    let yMax: number | undefined;
    let yStep: number | undefined;
    if (yLine) {
        const ceiling = Math.max(
            ...categories.map((_, c) =>
                chart === 'stacked'
                    ? series.reduce((sum, s) => sum + s.values[c]!, 0)
                    : Math.max(...series.map((s) => s.values[c]!)),
            ),
        );
        if (yLine.max < ceiling) {
            skip(yLine.line, `the data reaches ${ceiling}, above the axis top of ${yLine.max}`);
        } else if (yLine.step !== undefined && yLine.max / yLine.step > 20) {
            skip(yLine.line, 'that step would draw more than 20 gridlines');
        } else {
            yMax = yLine.max;
            yStep = yLine.step;
        }
    }

    return {
        attrs: {
            chart,
            ...(title ? { title } : {}),
            ...(xLabel ? { xLabel } : {}),
            ...(yLabel ? { yLabel } : {}),
            ...(alt ? { alt } : {}),
            categories,
            series,
            ...(yMax !== undefined ? { yMax } : {}),
            ...(yStep !== undefined ? { yStep } : {}),
        },
        problems,
    };
}

const num = (n: number): string => String(Number(n.toFixed(6)));
const oneLine = (s: string): string => s.replace(/\s*\n\s*/g, ' ').trim();

/**
 * A chart as ```chart text. `lossy` names what the grammar cannot spell, so the
 * popover can warn before an apply would change it: a comma inside a category,
 * an "=" inside a series name, a step with no axis top.
 */
export function formatChartSource(a: {
    chart: ChartKindAttr;
    title?: string | null;
    xLabel?: string | null;
    yLabel?: string | null;
    alt?: string | null;
    categories: readonly string[];
    series: readonly { name?: string | null; values: readonly number[] }[];
    yMax?: number | null;
    yStep?: number | null;
}): { text: string; lossy: string[] } {
    const lossy = new Set<string>();
    const lines: string[] = [`type: ${a.chart}`];
    if (a.title) lines.push(`title: ${oneLine(a.title)}`);
    if (a.xLabel) lines.push(`xlabel: ${oneLine(a.xLabel)}`);
    if (a.yLabel) lines.push(`ylabel: ${oneLine(a.yLabel)}`);
    if (a.alt) lines.push(`alt: ${oneLine(a.alt)}`);
    if (a.categories.some((c) => c.includes(','))) lossy.add('a category name containing a comma');
    lines.push(`categories: ${a.categories.map(oneLine).join(', ')}`);
    for (const s of a.series) {
        if (s.name?.includes('=')) lossy.add('a series name containing "="');
        lines.push(`series: ${s.name ? `${oneLine(s.name)} = ` : ''}${s.values.map(num).join(', ')}`);
    }
    if (a.yMax != null) lines.push(`y: 0..${num(a.yMax)}${a.yStep != null ? ` step ${num(a.yStep)}` : ''}`);
    else if (a.yStep != null) lossy.add('an axis step with no axis top');
    return { text: lines.join('\n'), lossy: [...lossy] };
}
