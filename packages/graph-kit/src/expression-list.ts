// =============================================================================
// expression-list.ts — the multi-expression list (Stage 4, the tool shell)
// -----------------------------------------------------------------------------
// N rows, each a MathLive field with a color dot: a `y = f(x)` (or bare f(x))
// row plots a curve, a `(a, b)` row plots a point, an `a = 3` row becomes a
// slider other rows can reference. The Desmos-defining surface, calculator-only
// (layer 3a) — the graded block never imports this.
//
// Dataflow: rows classify lazily (only when their text changes) via
// classifyExpression(); slider values live in ONE stable scope object that the
// plot closures capture, so a slider drag mutates the scope and asks the board
// for a cheap refresh() — no reclassification, no object churn. Everything
// else (row edits, add/remove, angle-mode flips) rebuilds the plot list.
//
// Auto-append matches the data table: typing in the last row grows the list —
// capped by the teacher's maxExpressions restriction when set.
// =============================================================================

import { MathfieldElement } from 'mathlive';
import { classifyExpression, type EvalOptions, type ExpressionRow } from './evaluate.js';
import type { PlotItem } from './board.js';

export interface ExpressionListDeps {
  /** Read fresh per classification — the deg/rad toggle changes it. */
  opts(): EvalOptions;
  /** Teacher cap on rows; undefined = unlimited. */
  maxRows: number | undefined;
  /** Full plot rebuild (row text/add/remove/angle change). */
  onPlotsChange(items: PlotItem[]): void;
  /** Slider drag — scope already mutated; just re-sample the board. */
  onScopeDrag(): void;
  /** Keypad targeting: the row field that last took focus. */
  onFieldFocus(field: MathfieldElement): void;
}

export interface ExpressionListHandle {
  root: HTMLElement;
  /** Re-read rows and rebuild the plots. Cheap: only rows whose text changed
   * reclassify. The calculator calls this after keypad inserts (MathLive's
   * programmatic insert doesn't reliably fire 'input'). */
  rebuild(): void;
  /** Drop every row's classification cache and rebuild (angle-mode change). */
  reclassifyAll(): void;
  destroy(): void;
}

const PALETTE = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#d97706', '#0891b2'];

interface Row {
  wrap: HTMLDivElement;
  field: MathfieldElement;
  color: string;
  note: HTMLDivElement;
  sliderBox: HTMLDivElement;
  lastText: string | null; // null = classification cache invalid
  classified: ExpressionRow;
  dragValue: number | null; // slider override from dragging (survives rebuilds)
}

// Slider bounds: [-10, 10] unless the typed value doesn't fit — then widen to
// twice the value so the handle never starts pinned at an end.
function sliderBounds(value: number): { min: number; max: number } {
  const span = Math.max(10, Math.ceil(Math.abs(value) * 2));
  return { min: -span, max: span };
}

export function createExpressionList(deps: ExpressionListDeps): ExpressionListHandle {
  const root = document.createElement('div');
  root.className = 'gk-exprlist';
  const rowsHost = document.createElement('div');
  rowsHost.className = 'gk-exprlist-rows';
  const capNote = document.createElement('div');
  capNote.className = 'gk-exprlist-cap';
  capNote.hidden = true;
  root.append(rowsHost, capNote);

  const rows: Row[] = [];
  let colorSeq = 0;
  // THE stable scope: plot closures capture it; sliders mutate it in place.
  const scope: Record<string, number> = {};

  const atCap = (): boolean =>
    deps.maxRows !== undefined && rows.length >= deps.maxRows;

  function updateCapNote(): void {
    if (deps.maxRows !== undefined && atCap()) {
      capNote.hidden = false;
      capNote.textContent = `Expression limit for this activity: ${deps.maxRows}`;
    } else {
      capNote.hidden = true;
    }
  }

  function rebuild(): void {
    // Pass 0 — keep one trailing empty row available (Desmos-style growth),
    // whatever the input source (typing fires 'input'; keypad inserts reach
    // here via the handle's rebuild()). Capped by the teacher's limit.
    const last = rows[rows.length - 1];
    if (last && last.field.getValue('ascii-math') !== '' && !atCap()) {
      addRow();
    }
    // Pass 1 — (re)classify rows whose text changed since last look.
    for (const row of rows) {
      const text = row.field.getValue('ascii-math');
      if (text !== row.lastText) {
        row.classified = classifyExpression(text, deps.opts());
        row.lastText = text;
        row.dragValue = null; // typed edit wins over a previous drag
      }
    }
    // Pass 2 — rebuild the slider scope in place (stable identity).
    for (const key of Object.keys(scope)) delete scope[key];
    for (const row of rows) {
      if (row.classified.kind === 'slider') {
        scope[row.classified.name] = row.dragValue ?? row.classified.value;
      }
    }
    // Pass 3 — per-row UI + the plot list.
    const items: PlotItem[] = [];
    for (const row of rows) {
      const c = row.classified;
      row.note.textContent = c.kind === 'error' ? c.message : '';
      row.sliderBox.hidden = c.kind !== 'slider';
      if (c.kind === 'slider') renderSlider(row, c.name);
      else row.sliderBox.textContent = '';
      if (c.kind === 'function') {
        const fn = c.fn;
        items.push({ kind: 'curve', color: row.color, fn: (x) => fn(x, scope) });
      } else if (c.kind === 'point') {
        const { px, py } = c;
        items.push({
          kind: 'point',
          color: row.color,
          px: () => px(scope),
          py: () => py(scope),
        });
      }
    }
    updateCapNote();
    deps.onPlotsChange(items);
  }

  function renderSlider(row: Row, name: string): void {
    const current = scope[name] ?? 0;
    let range = row.sliderBox.querySelector('input');
    let label = row.sliderBox.querySelector('span');
    if (!range || !label) {
      row.sliderBox.textContent = '';
      label = document.createElement('span');
      label.className = 'gk-slider-label';
      range = document.createElement('input');
      range.type = 'range';
      range.className = 'gk-slider-range';
      range.addEventListener('input', () => {
        const v = Number(range!.value);
        row.dragValue = v;
        // Mutate the shared scope directly — the closures see it; the board
        // just needs a re-sample. (Name read fresh: the row may have been
        // retyped as a different slider since this input was created.)
        if (row.classified.kind === 'slider') {
          scope[row.classified.name] = v;
          label!.textContent = `${row.classified.name} = ${v}`;
        }
        deps.onScopeDrag();
      });
      row.sliderBox.append(label, range);
    }
    const { min, max } = sliderBounds(row.dragValue ?? current);
    range.min = String(min);
    range.max = String(max);
    range.step = String((max - min) / 200);
    range.value = String(current);
    range.setAttribute('aria-label', `Value of ${name}`);
    label.textContent = `${name} = ${current}`;
  }

  function addRow(): void {
    const row: Row = {
      wrap: document.createElement('div'),
      field: new MathfieldElement(),
      color: PALETTE[colorSeq++ % PALETTE.length] ?? '#2563eb',
      note: document.createElement('div'),
      sliderBox: document.createElement('div'),
      lastText: null,
      classified: { kind: 'empty' },
      dragValue: null,
    };
    row.wrap.className = 'gk-exprrow';
    row.note.className = 'gk-exprrow-note';
    row.sliderBox.className = 'gk-exprrow-slider';
    row.sliderBox.hidden = true;

    const line = document.createElement('div');
    line.className = 'gk-exprrow-line';
    const dot = document.createElement('span');
    dot.className = 'gk-exprrow-dot';
    dot.style.background = row.color;
    row.field.className = 'gk-exprfield';
    row.field.mathVirtualKeyboardPolicy = 'manual';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'gk-exprrow-remove';
    removeBtn.setAttribute('aria-label', 'Remove expression');
    removeBtn.textContent = '×';

    row.field.addEventListener('focus', () => deps.onFieldFocus(row.field));
    row.field.addEventListener('input', rebuild);
    removeBtn.addEventListener('click', () => {
      if (rows.length > 1) {
        const i = rows.indexOf(row);
        if (i !== -1) rows.splice(i, 1);
        try {
          row.field.blur(); // blur-before-remove (the MathLive teardown rule)
        } catch {
          /* already detached */
        }
        row.wrap.remove();
      } else {
        row.field.value = '';
        row.lastText = null;
      }
      rebuild();
    });

    line.append(dot, row.field, removeBtn);
    row.wrap.append(line, row.sliderBox, row.note);
    rows.push(row);
    rowsHost.appendChild(row.wrap);
    updateCapNote();
  }

  addRow(); // start with one empty row

  return {
    root,
    rebuild,
    reclassifyAll() {
      for (const row of rows) row.lastText = null;
      rebuild();
    },
    destroy() {
      for (const row of rows) {
        try {
          row.field.blur();
        } catch {
          /* already detached */
        }
      }
      root.remove();
    },
  };
}
