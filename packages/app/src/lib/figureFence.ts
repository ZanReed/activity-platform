// =============================================================================
// figureFence.ts — the ```figure fence grammar (Y7 geometry, T4)
// -----------------------------------------------------------------------------
// docs/design/y7-figures-and-charts.md §4 Q3, with the eng-review rulings that
// shape it (§8): its own parser, used by the ```figure fence and (T3) the
// ```graph fence's `show:` lines only (ER-11); auto-fit at import (ER-3);
// typed problems that make the batch importer SKIP the file (ER-13, amended);
// a fence with nothing drawable produces no block (ER-12b).
//
//   ```figure
//   alt: Triangle ABC with AB = 8 cm and angle A = 68°
//   point (0,0) "A"            ← a NAME is a quoted point label
//   point (8,0) "B"
//   point (2,5) "C"
//   polygon A B C              ← outline; `region` keeps today's filled meaning
//   side AB "8 cm"             ← names concatenate (AB) or space (A B)
//   angle BAC 68°              ← the angle at the MIDDLE name, from BA to BC
//   angle ABC "x"              ← a label is a degree value, `right`, or QUOTED
//   angle ACB right            ← the square only
//   angle CBA                  ← no label: the arc alone (curriculum B-36)
//   ticks BC 2
//   parallel AB DC
//   segment A C dashed
//   text (4,-1.5) "base"
//   cuboid 4 2 3 cm units      ← length width height [unit word] [units] (Q6)
//   hidden: off                ← the cuboid's dashed hidden edges omitted
//   to scale                   ← drops the "Not to scale" caption (N8)
//   plane: on                  ← grid + axes back (default: plane-less)
//   axes: -2..10, -2..7        ← optional; absent = auto-fit (ER-3)
//   ```
//
// Rules (Q3): names resolve in a SECOND pass, so lines may come in any order;
// a coordinate `(x,y)` is accepted anywhere a name is; the whole fence is ONE
// figure and blank lines are ignored; a bad line is SKIPPED with a problem and
// the figure survives; degenerate geometry is REFUSED with a problem naming
// the line (N2). The output is coordinates only — no name reaches the schema.
//
// Pure: no Tiptap, no ctx. The importer turns `problems` into warnings and
// into ImportResult.figureProblems.
// =============================================================================

import { fitFigureWindow } from '@activity/graph-kit/static-svg';
import { GRAPH_FIGURE_CAPTION_MAX, type Drawable } from '@activity/schema';

type XY = [number, number];
type Out = Record<string, unknown>;

/** A non-figure drawable line (`line`, `curve`, `ray`) handed back to the
 * shared show-spec parser, which the importer owns. */
export type FigureFallback = (line: string) => { ok: true; drawable: Out } | { ok: false; message: string };

export interface FigureWindow {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

export interface FigureParse {
    /** The Tiptap graphFigure attrs, or null when nothing was drawable (ER-12b). */
    attrs: {
        axis: FigureWindow & { xGridStep: number; yGridStep: number; showGrid: boolean; snapToGrid: boolean };
        drawables: Out[];
        plane: boolean;
        toScale: boolean;
        alt?: string;
        /** The figure's short label ("A", "Before"); see GraphFigureBlock.caption. */
        caption?: string;
    } | null;
    /** Every skipped or refused line, a missing alt, an empty figure. */
    problems: string[];
}

const DEFAULT_WINDOW = {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    xGridStep: 1,
    yGridStep: 1,
    showGrid: true,
    snapToGrid: true,
};

// ---- tokens -------------------------------------------------------------------

type Token = { t: 'str'; v: string } | { t: 'xy'; v: XY } | { t: 'word'; v: string } | { t: 'bad'; v: string };

const NUM = String.raw`-?(?:\d+(?:\.\d*)?|\.\d+)`;
const XY_RE = new RegExp(String.raw`^\s*(${NUM})\s*,\s*(${NUM})\s*$`);

function tokenize(line: string): Token[] {
    const out: Token[] = [];
    const re = /"([^"]*)"|\(([^()]*)\)|(\S+)/g;
    for (let m = re.exec(line); m; m = re.exec(line)) {
        if (m[1] !== undefined) out.push({ t: 'str', v: m[1] });
        else if (m[2] !== undefined) {
            const xy = XY_RE.exec(m[2]);
            out.push(xy ? { t: 'xy', v: [Number(xy[1]), Number(xy[2])] } : { t: 'bad', v: `(${m[2]})` });
        } else out.push({ t: 'word', v: m[3]! });
    }
    return out;
}

/** Split a word like "BAC" into known names, longest name first. */
function splitNames(word: string, names: Map<string, XY>, sorted: string[]): XY[] | null {
    const out: XY[] = [];
    let i = 0;
    while (i < word.length) {
        const name = sorted.find((n) => word.startsWith(n, i));
        if (!name) return null;
        out.push(names.get(name)!);
        i += name.length;
    }
    return out;
}

// ---- geometry checks (N2) ---------------------------------------------------------

const same = (a: XY, b: XY): boolean => a[0] === b[0] && a[1] === b[1];
function area2(pts: XY[]): number {
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
        const p = pts[i]!;
        const q = pts[(i + 1) % pts.length]!;
        s += p[0] * q[1] - q[0] * p[1];
    }
    return s;
}
/** Degrees in [0, 180] between rays at→from and at→to; NaN when coincident. */
function angleDeg(at: XY, from: XY, to: XY): number {
    if (same(at, from) || same(at, to)) return NaN;
    const a = Math.atan2(from[1] - at[1], from[0] - at[0]);
    const b = Math.atan2(to[1] - at[1], to[0] - at[0]);
    let d = Math.abs(a - b) * (180 / Math.PI);
    if (d > 180) d = 360 - d;
    return d;
}

// ---- the parser -------------------------------------------------------------------

const LINE_KINDS = ['point', 'polygon', 'region', 'segment', 'side', 'angle', 'ticks', 'parallel', 'text', 'cuboid'] as const;
/** Q6 / N2: more unit cubes than this per dimension is refused. */
const MAX_UNIT_CUBES = 12;
const DEGREE_RE = new RegExp(String.raw`^(${NUM})°$`);

/**
 * Parse a ```figure fence body. `fallback` handles the show-spec kinds the
 * figure grammar does not redefine (`line`, `curve`, `ray`).
 */
export function parseFigureFence(
    src: string,
    fallback?: FigureFallback,
    /**
     * `linesOnly` is the ```graph fence's use (ER-11): its `show:` lines share
     * this grammar, but the graph owns its own window, plane and accessible
     * name — so a missing alt: and an empty result are not problems here, and
     * `who` renames the reporter so a warning names the fence it came from.
     */
    opts: { linesOnly?: boolean; who?: string } = {},
): FigureParse {
    const who = opts.who ?? 'Figure';
    const problems: string[] = [];
    const skip = (line: string, why: string): void => {
        problems.push(`${who}: "${line}" — ${why}; the line was skipped.`);
    };
    const refuse = (line: string, why: string): void => {
        problems.push(`${who}: "${line}" — ${why}; the line was refused.`);
    };

    const lines = src
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '');

    // Pass 1: names. Only `point (x,y) "X"` defines one.
    const names = new Map<string, XY>();
    for (const line of lines) {
        if (!/^point\b/i.test(line)) continue;
        const toks = tokenize(line).slice(1);
        const xy = toks.find((t) => t.t === 'xy');
        const label = toks.find((t) => t.t === 'str');
        if (xy?.t !== 'xy' || label?.t !== 'str' || label.v === '') continue;
        if (names.has(label.v)) continue; // reported in pass 2
        names.set(label.v, xy.v);
    }
    const sorted = [...names.keys()].sort((a, b) => b.length - a.length);
    const seenNames = new Set<string>();

    /** Point references from tokens: (x,y) or words made of names. */
    const refs = (toks: Token[]): XY[] | string => {
        const out: XY[] = [];
        for (const t of toks) {
            if (t.t === 'xy') out.push(t.v);
            else if (t.t === 'word') {
                const r = splitNames(t.v, names, sorted);
                if (!r) return `"${t.v}" is not a named point (name points with point (x,y) "A")`;
                out.push(...r);
            } else return `could not read ${t.t === 'bad' ? t.v : `"${t.v}"`}`;
        }
        return out;
    };

    let alt: string | undefined;
    let caption: string | undefined;
    let plane = false;
    let toScale = false;
    let hidden = true;
    let window: FigureWindow | null = null;
    const drawables: Out[] = [];

    for (const line of lines) {
        const altM = /^alt:\s*(.*)$/i.exec(line);
        if (altM) {
            alt = altM[1]!.trim() || undefined;
            continue;
        }
        const captionM = /^caption:\s*(.*)$/i.exec(line);
        if (captionM) {
            const text = captionM[1]!.trim();
            if (text === '') skip(line, 'caption: needs the label to show, as in caption: A');
            else if (text.length > GRAPH_FIGURE_CAPTION_MAX)
                skip(line, `a caption is a short label, at most ${GRAPH_FIGURE_CAPTION_MAX} characters (describe the figure in alt:)`);
            else caption = text;
            continue;
        }
        const axesM = /^axes:\s*(.*)$/i.exec(line);
        if (axesM) {
            const a = new RegExp(String.raw`^(${NUM})\s*\.\.\s*(${NUM})\s*,\s*(${NUM})\s*\.\.\s*(${NUM})$`).exec(
                axesM[1]!.trim(),
            );
            if (!a) skip(line, 'axes must look like "-2..10, -2..7"');
            else if (!(Number(a[2]) > Number(a[1])) || !(Number(a[4]) > Number(a[3])))
                skip(line, 'the axes window is empty (each maximum must be greater than its minimum)');
            else window = { xMin: Number(a[1]), xMax: Number(a[2]), yMin: Number(a[3]), yMax: Number(a[4]) };
            continue;
        }
        const planeM = /^plane:\s*(\S*)$/i.exec(line);
        if (planeM) {
            const v = planeM[1]!.toLowerCase();
            if (v === 'on') plane = true;
            else if (v === 'off') plane = false;
            else skip(line, 'plane is "on" or "off"');
            continue;
        }
        if (/^to scale$/i.test(line)) {
            toScale = true;
            continue;
        }
        const hiddenM = /^hidden:\s*(\S*)$/i.exec(line);
        if (hiddenM) {
            const v = hiddenM[1]!.toLowerCase();
            if (v === 'off') hidden = false;
            else if (v === 'on') hidden = true;
            else skip(line, 'hidden is "on" or "off"');
            continue;
        }

        const toks = tokenize(line);
        const head = toks[0];
        const kind = head?.t === 'word' ? head.v.toLowerCase() : '';
        const rest = toks.slice(1);

        if (!(LINE_KINDS as readonly string[]).includes(kind)) {
            if (kind === 'expression') {
                skip(line, 'an expression needs the calculator and is never drawn in a figure');
            } else if ((kind === 'line' || kind === 'curve' || kind === 'ray') && fallback) {
                const r = fallback(line);
                if (r.ok) drawables.push(r.drawable);
                else skip(line, r.message);
            } else {
                skip(line, 'not a figure line (point, polygon, region, segment, side, angle, ticks, parallel, text, cuboid, line, ray)');
            }
            continue;
        }

        // Pull the trailing flags and labels out, then read the point refs.
        const strs = rest.filter((t): t is { t: 'str'; v: string } => t.t === 'str');
        const words = rest.filter((t): t is { t: 'word'; v: string } => t.t === 'word');
        const flag = (w: string): boolean => words.some((t) => t.v.toLowerCase() === w);
        const pointToks = (exclude: (t: Token) => boolean) => rest.filter((t) => t.t !== 'str' && !exclude(t));

        switch (kind) {
            case 'point': {
                const xy = rest.filter((t) => t.t === 'xy');
                const style = flag('open') ? 'open' : flag('closed') ? 'closed' : undefined;
                const other = words.filter((t) => !['open', 'closed'].includes(t.v.toLowerCase()));
                if (xy.length !== 1 || other.length > 0 || strs.length > 1 || rest.some((t) => t.t === 'bad')) {
                    skip(line, 'a point is point (x, y) with an optional "label"');
                    break;
                }
                const label = strs[0]?.v;
                if (label !== undefined && label === '') {
                    skip(line, 'a point label cannot be empty');
                    break;
                }
                if (label !== undefined) {
                    if (seenNames.has(label)) {
                        skip(line, `the name "${label}" is already used by another point`);
                        break;
                    }
                    seenNames.add(label);
                }
                drawables.push({
                    kind: 'point',
                    at: (xy[0] as { v: XY }).v,
                    ...(label ? { label } : {}),
                    ...(style ? { style } : {}),
                });
                break;
            }
            case 'polygon':
            case 'region': {
                if (strs.length) {
                    skip(line, `a ${kind} takes no label`);
                    break;
                }
                const pts = refs(rest);
                if (typeof pts === 'string') skip(line, pts);
                else if (pts.length < 3) skip(line, `a ${kind} needs at least three points`);
                else if (Math.abs(area2(pts)) < 1e-9) refuse(line, `its points are in a straight line (zero area)`);
                else drawables.push({ kind: 'polygon', vertices: pts, filled: kind === 'region' });
                break;
            }
            case 'segment': {
                const dashed = flag('dashed');
                const pts = refs(pointToks((t) => t.t === 'word' && t.v.toLowerCase() === 'dashed'));
                if (strs.length) skip(line, 'a segment takes no label (use side AB "…")');
                else if (typeof pts === 'string') skip(line, pts);
                else if (pts.length !== 2) skip(line, 'a segment needs exactly two points');
                else if (same(pts[0]!, pts[1]!)) refuse(line, 'its two points are the same point');
                else drawables.push({ kind: 'segment', from: pts[0], to: pts[1], ...(dashed ? { style: 'dashed' } : {}) });
                break;
            }
            case 'side': {
                const pts = refs(pointToks(() => false));
                if (strs.length !== 1 || strs[0]!.v === '') skip(line, 'a side needs one quoted label, as in side AB "8 cm"');
                else if (typeof pts === 'string') skip(line, pts);
                else if (pts.length !== 2) skip(line, 'a side needs exactly two points');
                else if (same(pts[0]!, pts[1]!)) refuse(line, 'its two points are the same point');
                else drawables.push({ kind: 'side_label', from: pts[0], to: pts[1], text: strs[0]!.v });
                break;
            }
            case 'angle': {
                // Labels: a degree value, `right`, or ONE quoted text label.
                const degree = words.map((t) => DEGREE_RE.exec(t.v)).find(Boolean);
                const right = flag('right');
                const reflex = flag('reflex');
                const ptToks = pointToks(
                    (t) =>
                        t.t === 'word' &&
                        (DEGREE_RE.test(t.v) || ['right', 'reflex'].includes(t.v.toLowerCase())),
                );
                const labelKinds = (degree ? 1 : 0) + (right ? 1 : 0) + strs.length;
                if (strs.some((s) => s.v === '')) {
                    skip(line, 'an empty label "" is not allowed — leave the label off to draw the arc alone');
                    break;
                }
                if (labelKinds > 1) {
                    skip(line, 'an angle takes ONE label: a degree value (68°), right, or quoted text ("x")');
                    break;
                }
                if (right && reflex) {
                    skip(line, 'a right angle cannot be reflex');
                    break;
                }
                const pts = refs(ptToks);
                if (typeof pts === 'string') {
                    // The likeliest cause is an unquoted text label: say so.
                    skip(line, `${pts} — a text label must be quoted, as in angle ABC "x"`);
                    break;
                }
                if (pts.length !== 3) {
                    skip(line, 'an angle needs exactly three points, as in angle BAC (the angle at A)');
                    break;
                }
                const [from, at, to] = pts as [XY, XY, XY];
                const deg = angleDeg(at, from, to);
                if (Number.isNaN(deg)) {
                    refuse(line, 'two of its points coincide');
                    break;
                }
                if (deg < 1e-6 || Math.abs(deg - 180) < 1e-6) {
                    refuse(line, `it is a ${deg < 1 ? '0' : '180'}° angle (the points are in a straight line)`);
                    break;
                }
                drawables.push({
                    kind: 'angle_mark',
                    at,
                    from,
                    to,
                    ...(degree ? { label: `${degree[1]}°` } : {}),
                    ...(strs[0] ? { label: strs[0].v } : {}),
                    ...(right ? { style: 'right' } : {}),
                    ...(reflex ? { reflex: true } : {}),
                });
                break;
            }
            case 'ticks':
            case 'parallel': {
                const max = kind === 'ticks' ? 3 : 2;
                const countToks = words.filter((t) => /^\d+$/.test(t.v));
                const count = countToks.length ? Number(countToks[0]!.v) : 1;
                const pts = refs(pointToks((t) => t.t === 'word' && /^\d+$/.test(t.v)));
                const need = kind === 'ticks' ? 2 : 4;
                if (strs.length) skip(line, `${kind} take no label`);
                else if (countToks.length > 1 || count < 1 || count > max)
                    skip(line, `${kind} count is ${kind === 'ticks' ? '1, 2 or 3' : '1 or 2'}`);
                else if (typeof pts === 'string') skip(line, pts);
                else if (pts.length !== need)
                    skip(line, kind === 'ticks' ? 'ticks need one side, as in ticks BC 2' : 'parallel needs two sides, as in parallel AB DC');
                else {
                    const edges: [XY, XY][] = kind === 'ticks' ? [[pts[0]!, pts[1]!]] : [[pts[0]!, pts[1]!], [pts[2]!, pts[3]!]];
                    if (edges.some(([a, b]) => same(a, b))) {
                        refuse(line, 'a side has the same point at both ends');
                        break;
                    }
                    for (const [from, to] of edges) {
                        drawables.push({ kind: kind === 'ticks' ? 'tick_mark' : 'parallel_mark', from, to, count });
                    }
                }
                break;
            }
            case 'cuboid': {
                // cuboid L W H [unit word] [units] — three numbers, then an
                // optional unit word (absent = unlabelled), then the optional
                // `units` flag for the unit-cube grid.
                const nums = words.filter((t) => /^-?\d+(\.\d+)?$/.test(t.v)).map((t) => Number(t.v));
                const rest = words.filter((t) => !/^-?\d+(\.\d+)?$/.test(t.v));
                const units = rest.some((t) => t.v.toLowerCase() === 'units');
                const unitWords = rest.filter((t) => t.v.toLowerCase() !== 'units');
                if (strs.length || rest.length > 2 || unitWords.length > 1 || rest.some((t) => t.t !== 'word') || rest.length !== unitWords.length + (units ? 1 : 0)) {
                    skip(line, 'a cuboid is cuboid <length> <width> <height> [unit] [units], as in cuboid 4 2 3 cm units');
                    break;
                }
                if (nums.length !== 3) {
                    skip(line, 'a cuboid needs exactly three numbers: length, width, height');
                    break;
                }
                const [length, width, height] = nums as [number, number, number];
                if (nums.some((n) => !(n > 0))) {
                    refuse(line, 'every cuboid dimension must be greater than 0');
                    break;
                }
                if (units && nums.some((n) => !Number.isInteger(n))) {
                    refuse(line, 'units draws whole unit cubes, so every dimension must be a whole number');
                    break;
                }
                if (units && nums.some((n) => n > MAX_UNIT_CUBES)) {
                    refuse(line, `units draws at most ${MAX_UNIT_CUBES} cubes per dimension`);
                    break;
                }
                drawables.push({
                    kind: 'cuboid',
                    length,
                    width,
                    height,
                    ...(unitWords[0] ? { unit: unitWords[0].v } : {}),
                    ...(units ? { units: true } : {}),
                });
                break;
            }
            case 'text': {
                const pts = refs(pointToks(() => false));
                if (strs.length !== 1 || strs[0]!.v === '') skip(line, 'text needs one quoted label, as in text (4,-1.5) "base"');
                else if (typeof pts === 'string') skip(line, pts);
                else if (pts.length !== 1) skip(line, 'text needs exactly one position');
                else drawables.push({ kind: 'text', at: pts[0], text: strs[0]!.v });
                break;
            }
        }
    }

    if (drawables.length === 0) {
        if (!opts.linesOnly) problems.push('Figure: it has no drawable lines, so it was not imported.');
        return { attrs: null, problems };
    }
    if (!alt && !opts.linesOnly) {
        problems.push('Figure: it needs an alt: line describing what it shows (for screen readers).');
    }

    // `hidden: off` applies to every cuboid in the figure (Q6).
    if (!hidden) for (const d of drawables) if (d.kind === 'cuboid') d.hidden = false;

    const fitted = window
        ? { ...DEFAULT_WINDOW, ...window }
        : (fitFigureWindow(drawables as unknown as Drawable[]) ?? DEFAULT_WINDOW);
    return {
        attrs: {
            axis: { ...DEFAULT_WINDOW, ...fitted },
            drawables,
            plane,
            toScale,
            ...(alt ? { alt } : {}),
            ...(caption ? { caption } : {}),
        },
        problems,
    };
}
