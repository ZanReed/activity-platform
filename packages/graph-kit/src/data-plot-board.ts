// =============================================================================
// data-plot-board.ts — the interactive dot-plot builder (dedicated SVG widget)
// -----------------------------------------------------------------------------
// Per design decision 6, the data_plot widget is a small hand-rolled SVG board,
// NOT a JSXGraph board: dot plots / histograms / box plots are chart-like, not
// function-graph-like, so bending JSXGraph into them is a maintenance tax. This
// module has no JSXGraph dependency; it draws with raw SVG and owns its own
// pointer + keyboard handling. It rides the same lazy kit as the graph widgets
// (imported by data-plot-question.ts), so it adds nothing to the base runtime.
//
// The student stacks dots above the axis to build a distribution: click a column
// to add a dot, click a dot to remove it; or move the keyboard cursor between
// tick values and press Enter/↑ to add, ⌫/↓ to remove. Values snap to ticks, so
// the answer is always a clean multiset of tick positions.
//
// Layout constants mirror the renderer's data-plot-svg.ts so the interactive
// board and the static print/no-JS fallback look identical.
// =============================================================================

import { histogramCounts } from './data-plot-score.js';
import {
    AXIS as AXIS_COLOR,
    LABEL as LABEL_COLOR,
    INK,
    ANSWER as ANSWER_COLOR,
    ANSWER_FILL,
    GRID,
    CURSOR_BG,
    OPEN_FILL,
    boardColors,
    detectBoardTheme,
    type BoardTheme,
} from './graph-colors.js';

const SVGNS = 'http://www.w3.org/2000/svg';

const WIDTH = 500;
const HEIGHT = 200;
const MARGIN = 28;
const AXIS_Y = 168;
const TOP_PAD = 18;
const TICK = 6;
const MINOR_TICK = 3;
const DOT_R = 6;

// AXIS_COLOR / LABEL_COLOR / INK / ANSWER_COLOR imported from graph-colors.js.
const CURSOR_COLOR = ANSWER_FILL; // "your answer" light purple

// Structural colors resolved per theme (docs/design/graph-kit-board-dark.md):
// light keeps the graph-colors roles (today's look, value-identical); dark swaps
// to the dark board palette. Content colors (ANSWER, CURSOR_COLOR/FILL) are
// theme-independent. The board BACKGROUND is owned by the host surface.
interface StructuralColors {
  axis: string;
  label: string;
  ink: string;
  grid: string;
  cursorBg: string;
  openFill: string;
}
function structuralColors(theme: BoardTheme): StructuralColors {
  if (theme === 'dark') {
    const d = boardColors('dark');
    return {
      axis: d.axis,
      label: d.label,
      ink: d.ink,
      grid: d.grid,
      cursorBg: d.grid, // a subtle dark band for the cursor highlight
      openFill: d.openFill,
    };
  }
  return {
    axis: AXIS_COLOR,
    label: LABEL_COLOR,
    ink: INK,
    grid: GRID,
    cursorBg: CURSOR_BG,
    openFill: OPEN_FILL,
  };
}

export interface DataPlotBoardConfig {
  min: number;
  max: number;
  tickStep: number;
  minorTicksPerStep: number;
  snapToTick: boolean;
  maxFrequency?: number;
  binWidth?: number;
}

const FILL = ANSWER_FILL; // bar / box fill (light purple — student's answer)

export interface DataPlotBoardHooks {
  /** Fired on every add/remove/cursor move. fromKeyboard steers narration. */
  onChange?: (info: { fromKeyboard: boolean }) => void;
}

export interface DataPlotBoardController {
  /** Every dot's value, ascending, with multiplicity (the student answer). */
  getValues(): number[];
  /** The keyboard cursor's current column: its value and how many dots sit on it. */
  getCursor(): { value: number; count: number };
  /** True once the student has added or removed at least one dot. */
  hasAnswered(): boolean;
  /** Replace the dots (state restore on reload). */
  setValues(values: number[]): void;
  /** Lock / unlock pointer + keyboard. */
  setInteractive(on: boolean): void;
  destroy(): void;
}

function el(name: string, attrs: Record<string, string | number>): SVGElement {
  const node = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

export function createDataPlotBoard(
  container: HTMLElement,
  config: DataPlotBoardConfig,
  hooks: DataPlotBoardHooks = {},
): DataPlotBoardController {
  const sc = structuralColors(detectBoardTheme(container));
  const min = config.min;
  const max = config.max > min ? config.max : min + 10;
  const step = config.tickStep > 0 ? config.tickStep : 1;
  const minors = config.minorTicksPerStep >= 0 ? Math.floor(config.minorTicksPerStep) : 0;

  // Snap unit: minor-tick spacing when there are minor ticks, else the step.
  const snapUnit = minors > 0 ? step / (minors + 1) : step;

  // The addable positions (columns) — every snap position from min to max.
  const positions: number[] = [];
  for (let i = 0, v = min; v <= max + 1e-9 && i < 500; i++, v = min + i * snapUnit) {
    positions.push(Math.round(v * 1e6) / 1e6);
  }

  const span = max - min;
  const px = (v: number): number =>
    MARGIN + ((v - min) / span) * (WIDTH - 2 * MARGIN);
  const valueFromX = (x: number): number => min + ((x - MARGIN) / (WIDTH - 2 * MARGIN)) * span;
  const nearestPosition = (v: number): number => {
    let best = positions[0]!;
    let bestD = Infinity;
    for (const p of positions) {
      const d = Math.abs(p - v);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  };

  // Dot counts keyed by column value.
  const counts = new Map<number, number>();
  let cursorIdx = Math.floor(positions.length / 2);
  let answered = false;
  let interactive = true;

  const svg = el('svg', {
    class: 'data-plot-paper',
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
  }) as SVGSVGElement;
  svg.style.display = 'block';
  svg.style.width = '100%';
  svg.style.height = '100%';
  container.appendChild(svg);

  const dotsLayer = el('g', {});
  const cursorLayer = el('g', {});

  function drawStatic(): void {
    // Axis line.
    svg.appendChild(
      el('line', {
        x1: MARGIN - 8,
        y1: AXIS_Y,
        x2: WIDTH - MARGIN + 8,
        y2: AXIS_Y,
        stroke: sc.axis,
        'stroke-width': 1.5,
      }),
    );
    // Ticks + labels (+ minor ticks).
    for (let idx = 0; idx < positions.length; idx++) {
      const v = positions[idx]!;
      const x = px(v);
      const isLabeled =
        minors === 0 || Math.abs(Math.round((v - min) / step) * step - (v - min)) < 1e-9;
      const half = isLabeled ? TICK : MINOR_TICK;
      svg.appendChild(
        el('line', {
          x1: x,
          y1: AXIS_Y - half,
          x2: x,
          y2: AXIS_Y + half,
          stroke: sc.axis,
          'stroke-width': isLabeled ? 1.5 : 1,
        }),
      );
      if (isLabeled) {
        const label = el('text', {
          x,
          y: AXIS_Y + TICK + 14,
          'text-anchor': 'middle',
          fill: sc.label,
          'font-size': 12,
          'font-family': 'inherit',
        });
        label.textContent = Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000);
        svg.appendChild(label);
      }
    }
    svg.appendChild(cursorLayer);
    svg.appendChild(dotsLayer);
  }

  function redrawDots(): void {
    dotsLayer.textContent = '';
    const cap = config.maxFrequency ?? Math.max(1, ...counts.values());
    const plotH = AXIS_Y - TOP_PAD;
    const spacing = Math.min(2 * DOT_R + 3, cap > 0 ? plotH / cap : plotH);
    for (const [value, count] of counts) {
      const x = px(value);
      for (let k = 0; k < count; k++) {
        dotsLayer.appendChild(
          el('circle', {
            cx: x,
            cy: AXIS_Y - DOT_R - k * spacing,
            r: DOT_R,
            fill: ANSWER_COLOR,
            stroke: sc.ink,
            'stroke-width': 1.5,
          }),
        );
      }
    }
  }

  function redrawCursor(): void {
    cursorLayer.textContent = '';
    if (!interactive) return;
    const v = positions[cursorIdx];
    if (v === undefined) return;
    const x = px(v);
    // A soft vertical guide + a caret below the axis marking the active column.
    cursorLayer.appendChild(
      el('line', {
        x1: x,
        y1: TOP_PAD,
        x2: x,
        y2: AXIS_Y,
        stroke: CURSOR_COLOR,
        'stroke-width': 2,
      }),
    );
    cursorLayer.appendChild(
      el('path', {
        d: `M${x - 5} ${AXIS_Y + TICK + 18} L${x + 5} ${AXIS_Y + TICK + 18} L${x} ${AXIS_Y + TICK + 12} Z`,
        fill: ANSWER_COLOR,
      }),
    );
  }

  function change(fromKeyboard: boolean): void {
    redrawDots();
    redrawCursor();
    hooks.onChange?.({ fromKeyboard });
  }

  function addAt(value: number): void {
    const key = Math.round(value * 1e6) / 1e6;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    answered = true;
  }
  function removeAt(value: number): void {
    const key = Math.round(value * 1e6) / 1e6;
    const c = counts.get(key) ?? 0;
    if (c <= 1) counts.delete(key);
    else counts.set(key, c - 1);
    answered = true;
  }

  // ---- Pointer: click a dot to remove it, else add to the nearest column -----
  function svgPoint(evt: PointerEvent): { x: number; y: number } {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }

  const onPointerDown = (evt: PointerEvent): void => {
    if (!interactive) return;
    evt.preventDefault();
    container.focus();
    const { x, y } = svgPoint(evt);
    const value = nearestPosition(valueFromX(x));
    // Hit-test: is the click on an existing dot in the nearest column?
    const count = counts.get(Math.round(value * 1e6) / 1e6) ?? 0;
    if (count > 0) {
      const colX = px(value);
      const cap = config.maxFrequency ?? Math.max(1, ...counts.values());
      const plotH = AXIS_Y - TOP_PAD;
      const spacing = Math.min(2 * DOT_R + 3, cap > 0 ? plotH / cap : plotH);
      const topY = AXIS_Y - DOT_R - (count - 1) * spacing;
      const onColumn = Math.abs(x - colX) <= DOT_R + 2;
      const onStack = y >= topY - DOT_R && y <= AXIS_Y;
      if (onColumn && onStack) {
        removeAt(value);
        cursorIdx = positions.indexOf(value);
        change(false);
        return;
      }
    }
    addAt(value);
    cursorIdx = positions.indexOf(value);
    change(false);
  };
  svg.addEventListener('pointerdown', onPointerDown);

  // ---- Keyboard --------------------------------------------------------------
  const onKeyDown = (e: KeyboardEvent): void => {
    if (!interactive) return;
    const v = positions[cursorIdx];
    if (e.key === 'ArrowLeft') {
      cursorIdx = Math.max(0, cursorIdx - 1);
      e.preventDefault();
      change(true);
    } else if (e.key === 'ArrowRight') {
      cursorIdx = Math.min(positions.length - 1, cursorIdx + 1);
      e.preventDefault();
      change(true);
    } else if (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === '+') {
      if (v !== undefined) addAt(v);
      e.preventDefault();
      change(true);
    } else if (e.key === 'ArrowDown' || e.key === 'Backspace' || e.key === 'Delete' || e.key === '-') {
      if (v !== undefined) removeAt(v);
      e.preventDefault();
      change(true);
    }
  };
  container.addEventListener('keydown', onKeyDown);

  drawStatic();
  redrawDots();
  redrawCursor();

  return {
    getValues(): number[] {
      const out: number[] = [];
      for (const [value, count] of counts) {
        for (let k = 0; k < count; k++) out.push(value);
      }
      return out.sort((a, b) => a - b);
    },
    getCursor(): { value: number; count: number } {
      const value = positions[cursorIdx] ?? min;
      return { value, count: counts.get(Math.round(value * 1e6) / 1e6) ?? 0 };
    },
    hasAnswered: () => answered,
    setValues(values: number[]): void {
      counts.clear();
      for (const raw of values) addAt(nearestPosition(raw));
      answered = true;
      // change() (not just redrawDots) so restore fires onChange — the question
      // mount re-populates state.dataPlots[id] (answered + result) on reload,
      // like the number-line board's setValues → notify.
      change(false);
    },
    setInteractive(on: boolean): void {
      interactive = on;
      redrawCursor();
    },
    destroy(): void {
      svg.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('keydown', onKeyDown);
      svg.remove();
    },
  };
}

// =============================================================================
// Histogram + box-plot builders (GB slice 2) — same SVG idiom as the dot board
// -----------------------------------------------------------------------------
// Two more graded-build widgets sharing the dot board's constants + `el` helper.
// The histogram board lets the student set each bar's frequency; the box-plot
// board lets them drag five clamped, tick-snapping handles into the box +
// whiskers. Both draw the axis + ticks the same way (extracted below).
// =============================================================================

function makeSvg(container: HTMLElement): SVGSVGElement {
  const svg = el('svg', {
    class: 'data-plot-paper',
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
  }) as SVGSVGElement;
  svg.style.display = 'block';
  svg.style.width = '100%';
  svg.style.height = '100%';
  container.appendChild(svg);
  return svg;
}

// Value → viewBox px, and the reverse.
function makeScaler(min: number, max: number): {
  px: (v: number) => number;
  vx: (x: number) => number;
} {
  const span = (max > min ? max : min + 10) - min;
  return {
    px: (v) => MARGIN + ((v - min) / span) * (WIDTH - 2 * MARGIN),
    vx: (x) => min + ((x - MARGIN) / (WIDTH - 2 * MARGIN)) * span,
  };
}

// Draw the horizontal axis line + labeled/minor ticks + numeric labels.
function drawAxis(
  svg: SVGSVGElement,
  config: { min: number; max: number; tickStep: number; minorTicksPerStep: number },
  px: (v: number) => number,
  sc: StructuralColors,
): void {
  svg.appendChild(
    el('line', {
      x1: MARGIN - 8, y1: AXIS_Y, x2: WIDTH - MARGIN + 8, y2: AXIS_Y,
      stroke: sc.axis, 'stroke-width': 1.5,
    }),
  );
  const step = config.tickStep > 0 ? config.tickStep : 1;
  const minors = config.minorTicksPerStep;
  const snapUnit = minors > 0 ? step / (minors + 1) : step;
  for (let i = 0, v = config.min; v <= config.max + 1e-9 && i < 500; i++, v = config.min + i * snapUnit) {
    const x = px(v);
    const labeled = Math.abs(Math.round((v - config.min) / step) * step - (v - config.min)) < 1e-9;
    const half = labeled ? TICK : MINOR_TICK;
    svg.appendChild(el('line', { x1: x, y1: AXIS_Y - half, x2: x, y2: AXIS_Y + half, stroke: sc.axis, 'stroke-width': labeled ? 1.5 : 1 }));
    if (labeled) {
      const t = el('text', { x, y: AXIS_Y + TICK + 14, 'text-anchor': 'middle', fill: sc.label, 'font-size': 12, 'font-family': 'inherit' });
      t.textContent = Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000);
      svg.appendChild(t);
    }
  }
}

function pointerToVb(svg: SVGSVGElement, evt: PointerEvent): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

// ---- Histogram board (set each bar's frequency) -----------------------------

export interface HistogramBoardController {
  getBins(): number[];
  getActive(): { bin: number; freq: number };
  hasAnswered(): boolean;
  setBins(bins: number[]): void;
  setInteractive(on: boolean): void;
  destroy(): void;
}

export function createHistogramBoard(
  container: HTMLElement,
  config: DataPlotBoardConfig,
  data: number[],
  hooks: DataPlotBoardHooks = {},
): HistogramBoardController {
  const sc = structuralColors(detectBoardTheme(container));
  const min = config.min;
  const max = config.max > min ? config.max : min + 10;
  const width = config.binWidth && config.binWidth > 0 ? config.binWidth : (config.tickStep > 0 ? config.tickStep : 1);
  const { px } = makeScaler(min, max);

  // Bin edges spanning [min, max]; the y-cap must fit the true max bar, so
  // derive it from the data when the author didn't pin config.maxFrequency.
  const edges: { x0: number; x1: number }[] = [];
  for (let i = 0, x0 = min; x0 < max - 1e-9 && i < 200; i++, x0 += width) {
    edges.push({ x0, x1: Math.min(x0 + width, max) });
  }
  const cap = config.maxFrequency ?? Math.max(1, ...histogramCounts(data, config)) + 1;
  const unitH = (AXIS_Y - TOP_PAD) / cap;

  const bins = new Array(edges.length).fill(0) as number[];
  let active = 0;
  let answered = false;
  let interactive = true;

  const svg = makeSvg(container);
  const barsLayer = el('g', {});
  const cursorLayer = el('g', {});

  // y gridlines + labels (0..cap) on the left margin.
  for (let f = 0; f <= cap; f++) {
    const y = AXIS_Y - f * unitH;
    svg.appendChild(el('line', { x1: MARGIN - 4, y1: y, x2: WIDTH - MARGIN, y2: y, stroke: sc.grid, 'stroke-width': f === 0 ? 0 : 1 }));
    const t = el('text', { x: MARGIN - 8, y: y + 4, 'text-anchor': 'end', fill: sc.label, 'font-size': 10, 'font-family': 'inherit' });
    t.textContent = String(f);
    svg.appendChild(t);
  }
  drawAxis(svg, config, px, sc);
  svg.appendChild(cursorLayer);
  svg.appendChild(barsLayer);

  function redraw(): void {
    barsLayer.textContent = '';
    cursorLayer.textContent = '';
    edges.forEach((e, i) => {
      const left = px(e.x0);
      const right = px(e.x1);
      if (interactive && i === active) {
        cursorLayer.appendChild(el('rect', { x: left, y: TOP_PAD, width: Math.max(0, right - left), height: AXIS_Y - TOP_PAD, fill: sc.cursorBg }));
      }
      const f = bins[i]!;
      if (f > 0) {
        barsLayer.appendChild(el('rect', { x: left, y: AXIS_Y - f * unitH, width: Math.max(0, right - left), height: f * unitH, fill: FILL, stroke: sc.ink, 'stroke-width': 1.5 }));
      }
    });
  }

  function change(fromKeyboard: boolean): void {
    redraw();
    hooks.onChange?.({ fromKeyboard });
  }

  const binAtX = (x: number): number => {
    for (let i = 0; i < edges.length; i++) {
      if (x >= px(edges[i]!.x0) - 0.5 && x < px(edges[i]!.x1) + 0.5) return i;
    }
    return x < px(min) ? 0 : edges.length - 1;
  };

  const onPointerDown = (evt: PointerEvent): void => {
    if (!interactive) return;
    evt.preventDefault();
    container.focus();
    const { x, y } = pointerToVb(svg, evt);
    active = binAtX(x);
    // Frequency = height of the click above the axis, snapped to a whole count.
    bins[active] = Math.max(0, Math.min(cap, Math.round((AXIS_Y - y) / unitH)));
    answered = true;
    change(false);
  };
  svg.addEventListener('pointerdown', onPointerDown);

  const onKeyDown = (e: KeyboardEvent): void => {
    if (!interactive) return;
    if (e.key === 'ArrowLeft') { active = Math.max(0, active - 1); e.preventDefault(); change(true); }
    else if (e.key === 'ArrowRight') { active = Math.min(edges.length - 1, active + 1); e.preventDefault(); change(true); }
    else if (e.key === 'ArrowUp' || e.key === '+') { bins[active] = Math.min(cap, bins[active]! + 1); answered = true; e.preventDefault(); change(true); }
    else if (e.key === 'ArrowDown' || e.key === '-') { bins[active] = Math.max(0, bins[active]! - 1); answered = true; e.preventDefault(); change(true); }
  };
  container.addEventListener('keydown', onKeyDown);

  redraw();

  return {
    getBins: () => bins.slice(),
    getActive: () => ({ bin: active, freq: bins[active] ?? 0 }),
    hasAnswered: () => answered,
    setBins(next: number[]): void {
      for (let i = 0; i < bins.length; i++) bins[i] = Math.max(0, Math.min(cap, next[i] ?? 0));
      answered = true;
      change(false);
    },
    setInteractive(on: boolean): void { interactive = on; redraw(); },
    destroy(): void {
      svg.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('keydown', onKeyDown);
      svg.remove();
    },
  };
}

// ---- Box-plot board (drag five clamped, tick-snapping handles) ---------------

export interface FiveHandles {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}
export interface BoxplotBoardController {
  getFive(): FiveHandles;
  getActive(): { label: string; value: number };
  hasAnswered(): boolean;
  setFive(five: FiveHandles): void;
  setInteractive(on: boolean): void;
  destroy(): void;
}

const BOX_LABELS = ['minimum', 'Q1', 'median', 'Q3', 'maximum'];

export function createBoxplotBoard(
  container: HTMLElement,
  config: DataPlotBoardConfig,
  hooks: DataPlotBoardHooks = {},
): BoxplotBoardController {
  const sc = structuralColors(detectBoardTheme(container));
  const min = config.min;
  const max = config.max > min ? config.max : min + 10;
  const span = max - min;
  const step = config.tickStep > 0 ? config.tickStep : 1;
  const minors = config.minorTicksPerStep >= 0 ? Math.floor(config.minorTicksPerStep) : 0;
  const snapUnit = minors > 0 ? step / (minors + 1) : step;
  const { px, vx } = makeScaler(min, max);
  const cy = Math.round((TOP_PAD + AXIS_Y) / 2);
  const half = 24;

  const snap = (v: number): number => (config.snapToTick ? Math.round((v - min) / snapUnit) * snapUnit + min : v);
  const clampRange = (v: number): number => Math.min(Math.max(v, min), max);

  // Start the five handles evenly spread across the axis (a valid box), snapped.
  const h: number[] = [0, 0.25, 0.5, 0.75, 1].map((f) => clampRange(snap(min + f * span)));
  let active = 0;
  let answered = false;
  let interactive = true;
  let dragging = -1;

  const svg = makeSvg(container);
  const boxLayer = el('g', {});
  drawAxis(svg, config, px, sc);
  svg.appendChild(boxLayer);

  // Keep h[i] within its neighbors so the box is always well-formed.
  function clampNeighbors(i: number, v: number): number {
    let x = clampRange(v);
    if (i > 0) x = Math.max(x, h[i - 1]!);
    if (i < 4) x = Math.min(x, h[i + 1]!);
    return x;
  }

  function redraw(): void {
    boxLayer.textContent = '';
    const [x0, xq1, xmed, xq3, x4] = h.map(px) as [number, number, number, number, number];
    const g = `stroke="${sc.ink}" stroke-width="2"`;
    boxLayer.innerHTML =
      `<line x1="${x0}" y1="${cy}" x2="${xq1}" y2="${cy}" ${g}/>` +
      `<line x1="${xq3}" y1="${cy}" x2="${x4}" y2="${cy}" ${g}/>` +
      `<line x1="${x0}" y1="${cy - 12}" x2="${x0}" y2="${cy + 12}" ${g}/>` +
      `<line x1="${x4}" y1="${cy - 12}" x2="${x4}" y2="${cy + 12}" ${g}/>` +
      `<rect x="${xq1}" y="${cy - half}" width="${Math.max(0, xq3 - xq1)}" height="${2 * half}" fill="${FILL}" ${g}/>` +
      `<line x1="${xmed}" y1="${cy - half}" x2="${xmed}" y2="${cy + half}" ${g}/>`;
    // Draggable handles on top.
    h.forEach((v, i) => {
      const c = el('circle', {
        cx: px(v), cy, r: i === active ? 8 : 6,
        fill: ANSWER_COLOR, stroke: sc.openFill, 'stroke-width': 2,
      });
      boxLayer.appendChild(c);
    });
  }

  function change(fromKeyboard: boolean): void {
    redraw();
    hooks.onChange?.({ fromKeyboard });
  }

  const nearestHandle = (x: number): number => {
    let best = 0, bestD = Infinity;
    h.forEach((v, i) => { const d = Math.abs(px(v) - x); if (d < bestD) { bestD = d; best = i; } });
    return best;
  };

  const onPointerDown = (evt: PointerEvent): void => {
    if (!interactive) return;
    evt.preventDefault();
    container.focus();
    const { x } = pointerToVb(svg, evt);
    active = nearestHandle(x);
    dragging = active;
    h[active] = clampNeighbors(active, snap(vx(x)));
    answered = true;
    change(false);
  };
  const onPointerMove = (evt: PointerEvent): void => {
    if (dragging < 0 || !interactive) return;
    const { x } = pointerToVb(svg, evt);
    h[dragging] = clampNeighbors(dragging, snap(vx(x)));
    change(false);
  };
  const onPointerUp = (): void => { dragging = -1; };
  svg.addEventListener('pointerdown', onPointerDown);
  svg.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  const onKeyDown = (e: KeyboardEvent): void => {
    if (!interactive) return;
    if (e.key === 'Tab') {
      const next = active + (e.shiftKey ? -1 : 1);
      if (next >= 0 && next < 5) { active = next; e.preventDefault(); change(true); }
      return;
    }
    if (e.key === 'ArrowLeft') { h[active] = clampNeighbors(active, snap(h[active]! - snapUnit)); answered = true; e.preventDefault(); change(true); }
    else if (e.key === 'ArrowRight') { h[active] = clampNeighbors(active, snap(h[active]! + snapUnit)); answered = true; e.preventDefault(); change(true); }
  };
  container.addEventListener('keydown', onKeyDown);

  redraw();

  const five = (): FiveHandles => ({ min: h[0]!, q1: h[1]!, median: h[2]!, q3: h[3]!, max: h[4]! });

  return {
    getFive: five,
    getActive: () => ({ label: BOX_LABELS[active]!, value: h[active]! }),
    hasAnswered: () => answered,
    setFive(f: FiveHandles): void {
      const vals = [f.min, f.q1, f.median, f.q3, f.max];
      // Re-clamp left→right so a restored summary stays monotonic.
      for (let i = 0; i < 5; i++) h[i] = clampNeighbors(i, clampRange(vals[i]!));
      answered = true;
      change(false);
    },
    setInteractive(on: boolean): void { interactive = on; redraw(); },
    destroy(): void {
      svg.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('keydown', onKeyDown);
      svg.remove();
    },
  };
}
