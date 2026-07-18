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
import { solveForY, curveSide, verticalSide, inDomain, type ParsedDomain } from './solve.js';
import type { PlotItem } from './board.js';
import { EXPRESSION_PALETTE, CURVE } from './graph-colors.js';

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

// EXPRESSION_PALETTE / CURVE imported from graph-colors.js (top of file).

// MathLive's virtual keyboard is a global singleton. Minimal view of what we
// touch (show/hide/visible); container + layouts are configured once in
// calculator.ts. Cast rather than depend on the full MathLive VK typings.
interface VirtualKeyboard {
  visible: boolean;
  show(): void;
  hide(): void;
}
function virtualKeyboard(): VirtualKeyboard | undefined {
  return (window as unknown as { mathVirtualKeyboard?: VirtualKeyboard })
    .mathVirtualKeyboard;
}

// Round away float noise (0.1 + 0.2) then drop trailing zeros — 12 sig figs
// comfortably covers a calculator result. (Mirrors calculator.ts formatValue.)
function formatNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  return String(Number.parseFloat(n.toPrecision(12)));
}

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

// NaN outside the domain — the board renders that as a break, and the
// half-plane fill collapses unshaded there.
function clipToDomain(
  fn: (x: number) => number,
  domain?: ParsedDomain,
): (x: number) => number {
  if (!domain) return fn;
  return (x) => (inDomain(x, domain) ? fn(x) : NaN);
}

// Solve one inequality row against the live slider scope: boundary fn / x are
// closures over the scope (drags track free); side + strict are fixed until
// the next rebuild. Returns the plot item, or the row-note error string.
function solveInequalityItem(
  c: Extract<ExpressionRow, { kind: 'inequality' }>,
  scope: Record<string, number>,
  color: string,
): PlotItem | string {
  const g = (x: number, y: number): number => c.g(x, y, scope);
  const solved = solveForY(g);
  if (solved.kind === 'error') return solved.message;
  const strict = c.op === '<' || c.op === '>';
  if (solved.kind === 'vertical') {
    if (c.domain) {
      return "A 'for x …' restriction doesn't apply to a vertical boundary";
    }
    return {
      kind: 'inequality',
      color,
      strict,
      side: verticalSide(g, solved.x, c.op),
      boundary: {
        type: 'vertical',
        // Recomputed per sample so `x > a` follows its slider mid-drag.
        x: () => {
          const h0 = g(0, 0);
          const s = g(1, 0) - h0;
          return Math.abs(s) < 1e-12 ? NaN : -h0 / s;
        },
      },
    };
  }
  return {
    kind: 'inequality',
    color,
    strict,
    side: curveSide(g, solved.fn, c.op),
    boundary: { type: 'fn', fn: clipToDomain(solved.fn, c.domain) },
  };
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
    // Pass 3 — per-row UI + the plot list. Inequality rows solve for y HERE
    // (not at classification) because the boundary can reference sliders, and
    // slider values only exist once the scope is built (pass 2). An unsolvable
    // one surfaces on the row's note line like any other row error.
    const items: PlotItem[] = [];
    for (const row of rows) {
      const c = row.classified;
      let noteError: string | null = null;
      if (c.kind === 'inequality') {
        const item = solveInequalityItem(c, scope, row.color);
        if (typeof item === 'string') noteError = item;
        else items.push(item);
      }
      // The note doubles as the error line and the "= value" calculation
      // readout (a no-variable row), styled apart via data-kind.
      if (c.kind === 'error' || noteError) {
        row.note.textContent = c.kind === 'error' ? c.message : noteError;
        row.note.dataset.kind = 'error';
      } else if (c.kind === 'calculation') {
        row.note.textContent = '= ' + formatNumber(c.value);
        row.note.dataset.kind = 'calc';
      } else {
        row.note.textContent = '';
        delete row.note.dataset.kind;
      }
      row.sliderBox.hidden = c.kind !== 'slider';
      if (c.kind === 'slider') renderSlider(row, c.name);
      else row.sliderBox.textContent = '';
      if (c.kind === 'function') {
        const fn = c.fn;
        items.push({
          kind: 'curve',
          color: row.color,
          fn: clipToDomain((x) => fn(x, scope), c.domain),
        });
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
      color: EXPRESSION_PALETTE[colorSeq++ % EXPRESSION_PALETTE.length] ?? CURVE,
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
    // (MathLive's ☰ menu toggle — matrix/text/colour/variants — is hidden via
    // CSS ::part(menu-toggle); setting .menuItems throws on an unmounted field.)

    // Keyboard toggle pinned to the field's right edge: opens/closes the
    // MathLive virtual keyboard (which renders inside the panel — see
    // calculator.ts). Focuses this row first so the keyboard types here.
    const kbBtn = document.createElement('button');
    kbBtn.type = 'button';
    kbBtn.className = 'gk-exprrow-kb';
    kbBtn.setAttribute('aria-label', 'Show or hide the on-screen keyboard');
    kbBtn.title = 'On-screen keyboard';
    kbBtn.setAttribute('aria-pressed', 'false');
    kbBtn.textContent = '⌨';
    kbBtn.addEventListener('pointerdown', (e) => e.preventDefault()); // keep field focus
    kbBtn.addEventListener('click', () => {
      row.field.focus();
      const vk = virtualKeyboard();
      if (!vk) return;
      if (vk.visible) vk.hide();
      else vk.show();
      // Reflect the new state on every row's button (the keyboard is shared).
      const open = !!virtualKeyboard()?.visible;
      rowsHost
        .querySelectorAll('.gk-exprrow-kb')
        .forEach((b) => b.setAttribute('aria-pressed', String(open)));
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'gk-exprrow-remove';
    removeBtn.setAttribute('aria-label', 'Remove expression');
    removeBtn.textContent = '×';

    row.field.addEventListener('focus', () => deps.onFieldFocus(row.field));
    row.field.addEventListener('input', rebuild);
    // Clicking anywhere in the row (the colour dot, the gaps) focuses the field
    // too — not just landing on the field itself. Buttons and the field's own
    // clicks are left alone. `click` (not pointerdown) so it doesn't race the
    // field's focus handling.
    line.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('button') || t.closest('math-field')) return;
      row.field.focus();
    });
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

    line.append(dot, row.field, kbBtn, removeBtn);
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
