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

const SVGNS = 'http://www.w3.org/2000/svg';

const WIDTH = 500;
const HEIGHT = 200;
const MARGIN = 28;
const AXIS_Y = 168;
const TOP_PAD = 18;
const TICK = 6;
const MINOR_TICK = 3;
const DOT_R = 6;

const AXIS_COLOR = '#64748b';
const LABEL_COLOR = '#475569';
const INK = '#1e293b';
const ANSWER_COLOR = '#7c3aed'; // student dots (kit "your answer" purple)
const CURSOR_COLOR = '#c4b5fd';

export interface DataPlotBoardConfig {
  min: number;
  max: number;
  tickStep: number;
  minorTicksPerStep: number;
  snapToTick: boolean;
  maxFrequency?: number;
}

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
        stroke: AXIS_COLOR,
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
          stroke: AXIS_COLOR,
          'stroke-width': isLabeled ? 1.5 : 1,
        }),
      );
      if (isLabeled) {
        const label = el('text', {
          x,
          y: AXIS_Y + TICK + 14,
          'text-anchor': 'middle',
          fill: LABEL_COLOR,
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
            stroke: INK,
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
      redrawDots();
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
