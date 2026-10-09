// =============================================================================
// figureSource.ts — a graph figure as ```figure text, and back (Y7 T7, ER-10)
// -----------------------------------------------------------------------------
// The editor's "figure source" popover shows a figure as the SAME fence text
// the importer reads, and re-runs the SAME parser (figureFence.ts) when the
// teacher applies an edit (Q8). The text is GENERATED from the block, never
// stored: a stored copy would be a second truth that drifts from the drawables
// (ER-10). The guard is `parse(format(block))` equals `block`, over a fixture
// of every line form (tests/figureSource.test.ts).
//
// Names are recovered from labelled points: a coordinate that a labelled point
// sits on is written as that name; anything else is written as (x, y). A few
// stored features have NO fence spelling (the grammar is the curriculum
// side's contract, so it is not widened here). formatFigureSource reports
// them in `lossy`, and the popover warns before an apply would drop them.
//
// Editor-safe: the `line` / `curve` / `ray` fallback uses the editor's own
// freeform parser (drawablesFromFreeform), so the editor chunk never pulls in
// markdown-it through markdownToTiptap.
// =============================================================================

import type { DrawableAttr } from '../editor/extensions/InteractiveGraph';
import { formatDrawable } from '../editor/components/drawableText';
import { drawablesFromFreeform } from '../editor/components/drawableFormulaLogic';
import { parseFigureFence, type FigureParse } from './figureFence';

type XY = readonly [number, number] | readonly number[];

export interface FigureSourceAttrs {
    axis: { xMin: number; xMax: number; yMin: number; yMax: number; xGridStep?: number; yGridStep?: number; showGrid?: boolean; snapToGrid?: boolean };
    drawables: readonly DrawableAttr[];
    alt?: string | null;
    caption?: string | null;
    plane?: boolean;
    toScale?: boolean;
}

const num = (n: number): string => String(Number(n.toFixed(6)));
const xyText = (p: XY): string => `(${num(p[0]!)}, ${num(p[1]!)})`;
const quote = (s: string): string => `"${s.replace(/"/g, "'")}"`;
const DEGREE = /^-?\d+(\.\d+)?°$/;

export function formatFigureSource(a: FigureSourceAttrs): { text: string; lossy: string[] } {
    const lossy = new Set<string>();
    const lines: string[] = [];
    if (a.caption) lines.push(`caption: ${a.caption.replace(/\n/g, ' ')}`);
    if (a.alt) lines.push(`alt: ${a.alt.replace(/\n/g, ' ')}`);
    if (a.plane) lines.push('plane: on');
    if (a.toScale) lines.push('to scale');
    const ax = a.axis;
    lines.push(`axes: ${num(ax.xMin)}..${num(ax.xMax)}, ${num(ax.yMin)}..${num(ax.yMax)}`);
    if ((ax.xGridStep ?? 1) !== 1 || (ax.yGridStep ?? 1) !== 1) lossy.add('a grid step other than 1');
    if (ax.showGrid === false) lossy.add('a hidden grid');
    if (ax.snapToGrid === false) lossy.add('snap-to-grid turned off');

    // Names: the first labelled point at each coordinate.
    const names = new Map<string, string>();
    for (const d of a.drawables) {
        if (d.kind === 'point' && d.label && !names.has(`${d.at[0]},${d.at[1]}`)) {
            names.set(`${d.at[0]},${d.at[1]}`, d.label);
        }
    }
    const ref = (p: XY): string => names.get(`${p[0]},${p[1]}`) ?? xyText(p);
    const refs = (...ps: XY[]): string => ps.map(ref).join(' ');
    const colored = (d: DrawableAttr): void => {
        if ('color' in d && d.color) lossy.add('an authored colour');
    };

    const cuboids = a.drawables.filter((d) => d.kind === 'cuboid');
    const cuboidHidden = cuboids.filter((d) => d.kind === 'cuboid' && d.hidden === false).length;
    if (cuboidHidden > 0 && cuboidHidden < cuboids.length) lossy.add('hidden edges shown on some cuboids but not others');
    if (cuboids.length > 0 && cuboidHidden === cuboids.length) lines.push('hidden: off');

    const ds = [...a.drawables];
    for (let i = 0; i < ds.length; i++) {
        const d = ds[i]!;
        colored(d);
        switch (d.kind) {
            case 'point':
                lines.push(`point ${xyText(d.at)}${d.style ? ` ${d.style}` : ''}${d.label ? ` ${quote(d.label)}` : ''}`);
                break;
            case 'polygon':
                lines.push(`${d.filled === false ? 'polygon' : 'region'} ${refs(...d.vertices)}`);
                break;
            case 'segment':
                if (d.endpoints && !d.arrow) lossy.add('segment endpoint dots');
                lines.push(`segment ${refs(d.from, d.to)}${d.style === 'dashed' ? ' dashed' : ''}${d.arrow ? ' arrow' : ''}`);
                break;
            case 'side_label':
                lines.push(`side ${refs(d.from, d.to)} ${quote(d.text)}`);
                break;
            case 'angle_mark': {
                if (d.style === 'double') lossy.add('a double angle arc');
                const label =
                    d.style === 'right' ? ' right' : d.label ? (DEGREE.test(d.label) ? ` ${d.label}` : ` ${quote(d.label)}`) : '';
                lines.push(`angle ${refs(d.from, d.at, d.to)}${label}${d.reflex ? ' reflex' : ''}`);
                break;
            }
            case 'tick_mark':
                lines.push(`ticks ${refs(d.from, d.to)} ${d.count}`);
                break;
            case 'parallel_mark': {
                // One fence line marks TWO sides. Pair with the next parallel
                // mark of the same count; a lone mark has no spelling.
                const j = ds.findIndex((e, k) => k > i && e.kind === 'parallel_mark' && e.count === d.count);
                const mate = j === -1 ? undefined : (ds[j] as Extract<DrawableAttr, { kind: 'parallel_mark' }>);
                if (!mate) {
                    lossy.add('a parallel mark on a single side');
                    break;
                }
                ds.splice(j, 1);
                lines.push(`parallel ${refs(d.from, d.to)} ${refs(mate.from, mate.to)}${d.count === 2 ? ' 2' : ''}`);
                break;
            }
            case 'text':
                lines.push(`text ${xyText(d.at)} ${quote(d.text)}`);
                break;
            case 'cuboid':
                if (d.at && (d.at[0] !== 0 || d.at[1] !== 0)) lossy.add('a cuboid away from the origin');
                lines.push(`cuboid ${num(d.length)} ${num(d.width)} ${num(d.height)}${d.unit ? ` ${d.unit}` : ''}${d.units ? ' units' : ''}`);
                break;
            case 'curve':
                lines.push(`line ${formatDrawable(d)}`);
                break;
            case 'ray':
                lines.push(formatDrawable(d).startsWith('ray') ? formatDrawable(d) : `ray ${formatDrawable(d)}`);
                break;
            case 'expression':
                lossy.add('an expression curve (never drawn in a figure)');
                break;
        }
    }
    return { text: lines.join('\n'), lossy: [...lossy] };
}

/** The editor's parse: figureFence.ts, with the editor's own `line`/`curve`/`ray` parser. */
export function parseFigureSource(text: string): FigureParse {
    return parseFigureFence(text, (line) => {
        const body = line.replace(/^\s*(line|curve)\s+/i, '');
        const res = drawablesFromFreeform(body, ['curve', 'ray', 'segment', 'point']);
        if (res.kind === 'error') return { ok: false, message: res.message };
        if (res.drawables.length !== 1) return { ok: false, message: 'one shape per line' };
        return { ok: true, drawable: res.drawables[0] as unknown as Record<string, unknown> };
    });
}
