// =============================================================================
// calculator.ts — mountCalculator: the scientific-calculator widget (Stage 1)
// -----------------------------------------------------------------------------
// Framework-agnostic. The published page lazy-imports this on the first summon
// click (via the renderer's calculator-summon sidecar); the editor preview
// imports it directly so an author sees exactly what a student gets. One
// implementation, two consumers.
//
// A MathLive math-field for input/display, a scientific keypad, a live result,
// a deg/rad toggle, and restriction-flag gating. The math itself goes through
// the engine-agnostic evaluate() seam (math.js under the hood). Self-contained:
// it injects its own <style> once, so it needs nothing from the host page's CSS.
//
// Non-modal (the rest of the page stays interactive — it's a scaffold, summoned
// over the work). Esc or the × button closes; the caller returns focus to the
// summon button via the onToggle hook.
// =============================================================================

import { MathfieldElement } from 'mathlive';
import { evaluate } from './evaluate.js';
import { fitModel, type RegressionModel } from './regression.js';
import { equationText, r2Text } from './fit-format.js';
import { createDataTable, type DataTableHandle } from './data-table.js';
import { createExpressionList } from './expression-list.js';
// Type-only — erased at build time, so the static JSXGraph dependency in
// board.ts stays in its own lazily-imported chunk (the lazy-split).
import type { BoardController, PlotItem } from './board.js';

export interface CalculatorConfig {
  mode?: 'scientific' | 'graphing';
  allowTrig?: boolean;
  allowLogExp?: boolean;
  /** Stage 3: fit models the data panel offers; empty = no data panel. */
  allowedRegressionModels?: RegressionModel[];
  /** Stage 4: cap on graphing expression rows; absent = unlimited. */
  maxExpressions?: number;
}

export interface CalculatorHandle {
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  toggle(): void;
  /** Tear down the widget (for React unmount in the editor preview). */
  destroy(): void;
}

interface MountHooks {
  /** Called whenever the open/closed state changes (incl. self-close via Esc/×). */
  onToggle?: (open: boolean) => void;
  /**
   * Float the panel as a draggable window fixed to the viewport (the published
   * page / dev harness). Default false keeps it in-flow so the editor preview
   * renders it inline inside the settings panel, not pinned to a screen corner.
   */
  floating?: boolean;
}

const ALL_REGRESSION_MODELS: RegressionModel[] = [
  'linear',
  'quadratic',
  'exponential',
];

// Like CalculatorConfig but with every gate resolved to a concrete value.
// (Not Required<CalculatorConfig>: maxExpressions stays possibly-undefined —
// undefined IS its resolved "unlimited" value.)
interface ResolvedConfig {
  mode: 'scientific' | 'graphing';
  allowTrig: boolean;
  allowLogExp: boolean;
  allowedRegressionModels: RegressionModel[];
  maxExpressions: number | undefined;
}

function readConfig(raw: unknown): ResolvedConfig {
  const c = (typeof raw === 'object' && raw !== null ? raw : {}) as CalculatorConfig;
  const rawModels = c.allowedRegressionModels;
  const rawMax = c.maxExpressions;
  return {
    mode: c.mode === 'graphing' ? 'graphing' : 'scientific',
    allowTrig: c.allowTrig !== false, // permissive default
    allowLogExp: c.allowLogExp !== false,
    // Filter against the known set (canonical order, unknowns dropped); a
    // missing/garbled value falls back to all models — permissive, like the
    // boolean gates.
    allowedRegressionModels: Array.isArray(rawModels)
      ? ALL_REGRESSION_MODELS.filter((m) => rawModels.includes(m))
      : ALL_REGRESSION_MODELS,
    // Garbled cap → unlimited (permissive).
    maxExpressions:
      typeof rawMax === 'number' && Number.isInteger(rawMax) && rawMax >= 1
        ? rawMax
        : undefined,
  };
}

// Round away binary float noise (0.1 + 0.2) without losing real precision, then
// drop trailing zeros. 12 significant digits comfortably covers a calculator.
function formatValue(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  return String(Number.parseFloat(n.toPrecision(12)));
}

// ---- Keypad definition ------------------------------------------------------
// Each key inserts LaTeX into the field, runs a field command, clears, or
// evaluates. `gate` marks keys disabled by a restriction flag.
type KeyAction =
  | { insert: string }
  | { cmd: 'deleteBackward' }
  | { clear: true }
  | { equals: true };
interface Key {
  label: string;
  action: KeyAction;
  gate?: 'trig' | 'logexp';
  variant?: 'fn' | 'op' | 'num' | 'accent' | 'equals';
}

const KEYPAD: Key[] = [
  { label: 'sin', action: { insert: '\\sin(' }, gate: 'trig', variant: 'fn' },
  { label: 'cos', action: { insert: '\\cos(' }, gate: 'trig', variant: 'fn' },
  { label: 'tan', action: { insert: '\\tan(' }, gate: 'trig', variant: 'fn' },
  { label: 'ln', action: { insert: '\\ln(' }, gate: 'logexp', variant: 'fn' },
  { label: 'log', action: { insert: '\\log(' }, gate: 'logexp', variant: 'fn' },

  { label: 'x²', action: { insert: '^{2}' }, variant: 'fn' },
  { label: 'xʸ', action: { insert: '^{#?}' }, variant: 'fn' },
  { label: '√', action: { insert: '\\sqrt{#?}' }, variant: 'fn' },
  { label: 'π', action: { insert: '\\pi' }, variant: 'fn' },
  { label: 'e', action: { insert: 'e' }, variant: 'fn' },

  { label: '7', action: { insert: '7' }, variant: 'num' },
  { label: '8', action: { insert: '8' }, variant: 'num' },
  { label: '9', action: { insert: '9' }, variant: 'num' },
  { label: '(', action: { insert: '(' }, variant: 'op' },
  { label: ')', action: { insert: ')' }, variant: 'op' },

  { label: '4', action: { insert: '4' }, variant: 'num' },
  { label: '5', action: { insert: '5' }, variant: 'num' },
  { label: '6', action: { insert: '6' }, variant: 'num' },
  { label: '×', action: { insert: '\\times' }, variant: 'op' },
  { label: '÷', action: { insert: '\\div' }, variant: 'op' },

  { label: '1', action: { insert: '1' }, variant: 'num' },
  { label: '2', action: { insert: '2' }, variant: 'num' },
  { label: '3', action: { insert: '3' }, variant: 'num' },
  { label: '+', action: { insert: '+' }, variant: 'op' },
  { label: '−', action: { insert: '-' }, variant: 'op' },

  { label: '0', action: { insert: '0' }, variant: 'num' },
  { label: '.', action: { insert: '.' }, variant: 'num' },
  { label: '!', action: { insert: '!' }, variant: 'op' },
  { label: 'C', action: { clear: true }, variant: 'accent' },
  { label: '⌫', action: { cmd: 'deleteBackward' }, variant: 'accent' },
];

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  attrs: Record<string, string> = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// MathLive resolves its glyph fonts (and keypress sounds) relative to a
// configured directory. On a published page the kit is lazy-loaded from R2, so
// the default relative path won't find them; we point at the version-matched
// jsDelivr CDN — the same source the renderer already uses for KaTeX fonts, and
// the one font source that works identically on published pages AND in the
// editor preview without detecting which context we're in. Bump the version
// alongside the `mathlive` dependency. Sounds are disabled (a calculator that
// beeps on every key is noise in a classroom, and it avoids extra fetches).
const MATHLIVE_VERSION = '0.109.2';
let mathliveConfigured = false;
function configureMathLive(): void {
  if (mathliveConfigured) return;
  mathliveConfigured = true;
  MathfieldElement.fontsDirectory = `https://cdn.jsdelivr.net/npm/mathlive@${MATHLIVE_VERSION}/dist/fonts`;
  MathfieldElement.soundsDirectory = null;
}

let stylesInjected = false;
function injectStyles(): void {
  if (stylesInjected || document.getElementById('graph-kit-styles')) {
    stylesInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = 'graph-kit-styles';
  style.textContent = KIT_CSS;
  document.head.appendChild(style);
  stylesInjected = true;
}

// Remembered floating-panel geometry for the current page session — position,
// size, and the list/graph split. Module-level so it survives a React re-mount
// (config change) but NOT a reload; deliberately not localStorage (calculator
// state persistence is deferred by design, and would live in its own key).
interface PanelGeom {
  left?: number;
  top?: number;
  width?: string;
  height?: string;
  splitBasis?: string;
}
const remembered: PanelGeom = {};

// Minimal view of MathLive's global virtual-keyboard singleton (graphing mode
// configures it to render inside the panel with a single, matrix-free layout).
interface VirtualKeyboardConfig {
  layouts: unknown;
  container: HTMLElement | null;
}
function virtualKeyboard(): VirtualKeyboardConfig | undefined {
  return (window as unknown as { mathVirtualKeyboard?: VirtualKeyboardConfig })
    .mathVirtualKeyboard;
}

export function mountCalculator(
  mount: HTMLElement,
  rawConfig?: unknown,
  hooks: MountHooks = {},
): CalculatorHandle {
  injectStyles();
  configureMathLive();
  const cfg = readConfig(rawConfig);
  const graphing = cfg.mode === 'graphing';
  const floating = hooks.floating ?? false;
  // Radians is the sensible default for plotting (sin(x) over [-10,10] in degrees
  // is nearly flat); degrees is friendlier for a scientific calculator.
  let angle: 'deg' | 'rad' = graphing ? 'rad' : 'deg';
  let open = false;

  const panel = el('div', 'gk-cal', {
    role: 'dialog',
    'aria-label': 'Calculator',
  });
  // Floating = a draggable window pinned to the viewport (published page); the
  // default keeps it in-flow for the inline editor preview.
  if (floating) panel.classList.add('gk-cal-floating');

  // Data/regression panel (Stage 3): graphing mode only, and only when at
  // least one fit model is allowed (empty allowedRegressionModels = off).
  const regressionModels = graphing ? cfg.allowedRegressionModels : [];
  const hasDataPanel = regressionModels.length > 0;

  // Header: title + data-view toggle + deg/rad toggle + close
  const header = el('div', 'gk-cal-header');
  const title = el('span', 'gk-cal-title');
  title.textContent = 'Calculator';
  const dataBtn = el('button', 'gk-cal-data-btn', {
    type: 'button',
    'aria-pressed': 'false',
    'aria-label': 'Toggle the data and regression panel',
  });
  dataBtn.textContent = 'Data';
  const angleBtn = el('button', 'gk-cal-angle', {
    type: 'button',
    'aria-label': 'Toggle degrees or radians',
  });
  angleBtn.textContent = angle.toUpperCase();
  const closeBtn = el('button', 'gk-cal-close', {
    type: 'button',
    'aria-label': 'Close calculator',
  });
  closeBtn.textContent = '×';
  if (hasDataPanel) header.append(title, dataBtn, angleBtn, closeBtn);
  else header.append(title, angleBtn, closeBtn);

  // Input/display
  const field = new MathfieldElement();
  field.className = 'gk-cal-field';
  // Our keypad + the physical keyboard are the input; suppress MathLive's own
  // on-screen keyboard so it doesn't fight the calculator's keypad.
  field.mathVirtualKeyboardPolicy = 'manual';
  // (MathLive's ☰ menu toggle is hidden via CSS ::part(menu-toggle) — setting
  // .menuItems here throws "not mounted" on a freshly-created field.)

  // Output: scientific shows a numeric result; graphing shows a plot board.
  const result = el('div', 'gk-cal-result', { 'aria-live': 'polite' });
  const graphEl = el('div', 'gk-cal-graph');
  let boardController: BoardController | null = null;

  // ---- Expression list (Stage 4, graphing only) -----------------------------
  // The single field is scientific-mode input; graphing replaces it with the
  // multi-row list. Plots emitted before the board's lazy chunk arrives are
  // parked in pendingPlots and applied on load.
  let pendingPlots: PlotItem[] | null = null;
  // Which MathLive field the keypad types into: the single field (scientific)
  // or whichever list row last took focus (graphing).
  let activeField: MathfieldElement | null = graphing ? null : field;
  const exprList = graphing
    ? createExpressionList({
        opts: () => ({
          angleMode: angle,
          allowTrig: cfg.allowTrig,
          allowLogExp: cfg.allowLogExp,
        }),
        maxRows: cfg.maxExpressions,
        onPlotsChange: (items) => {
          if (boardController) boardController.setPlots(items);
          else pendingPlots = items;
        },
        onScopeDrag: () => boardController?.refresh(),
        onFieldFocus: (f) => {
          activeField = f;
        },
      })
    : null;

  // ---- Data/regression section (built only when the panel is available) ----
  const dataSection = el('div', 'gk-cal-data');
  dataSection.hidden = true;
  let dataTable: DataTableHandle | null = null;
  let currentModel: RegressionModel = regressionModels[0] ?? 'linear';
  const fitResults = el('div', 'gk-cal-fit', { 'aria-live': 'polite' });

  function updateData(): void {
    if (!dataTable) return;
    const points = dataTable.getPoints();
    boardController?.setScatter(points);
    const outcome = fitModel(currentModel, points);
    fitResults.textContent = '';
    if (outcome.ok) {
      boardController?.plotFit(outcome.predict);
      const eq = el('div', 'gk-fit-eq');
      eq.textContent = equationText(outcome.fit);
      const r2 = el('div', 'gk-fit-r2');
      r2.textContent = r2Text(outcome.fit);
      fitResults.append(eq, r2);
      fitResults.dataset.state = 'ok';
    } else {
      boardController?.plotFit(null);
      fitResults.textContent = outcome.error;
      // Too few points is the resting state while typing, not a mistake —
      // style it as a hint; real data problems (all-same x, y ≤ 0) go red.
      const enough = points.length >= (currentModel === 'quadratic' ? 3 : 2);
      fitResults.dataset.state = enough ? 'err' : 'hint';
    }
  }

  if (hasDataPanel) {
    const tableScroll = el('div', 'gk-data-scroll');
    dataTable = createDataTable(tableScroll, updateData);

    const controls = el('div', 'gk-fit-controls');
    const modelSelect = el('select', 'gk-fit-model', {
      'aria-label': 'Regression model',
    });
    for (const m of regressionModels) {
      const option = el('option', '');
      option.value = m;
      option.textContent = m.charAt(0).toUpperCase() + m.slice(1);
      modelSelect.appendChild(option);
    }
    modelSelect.addEventListener('change', () => {
      currentModel = regressionModels.find((m) => m === modelSelect.value) ?? currentModel;
      updateData();
    });
    const fitViewBtn = el('button', 'gk-fit-view-btn', {
      type: 'button',
      'aria-label': 'Fit the view to the data points',
    });
    fitViewBtn.textContent = 'Fit view';
    fitViewBtn.addEventListener('click', () => {
      if (dataTable) boardController?.fitView(dataTable.getPoints());
    });
    controls.append(modelSelect, fitViewBtn);
    dataSection.append(tableScroll, controls, fitResults);
  }

  let dataViewOn = false;
  function setDataView(v: boolean): void {
    dataViewOn = v;
    dataBtn.setAttribute('aria-pressed', String(v));
    panel.dataset.view = v ? 'data' : 'expr';
    dataSection.hidden = !v;
    if (v) updateData();
  }
  dataBtn.addEventListener('click', () => setDataView(!dataViewOn));

  // Keypad
  const keypad = el('div', 'gk-cal-keypad');

  // Scientific-mode evaluation (graphing plots through the expression list).
  function recompute(): void {
    if (graphing) return;
    const ascii = field.getValue('ascii-math');
    const r = evaluate(ascii, {
      angleMode: angle,
      allowTrig: cfg.allowTrig,
      allowLogExp: cfg.allowLogExp,
    });
    if (r.ok) {
      result.textContent = '= ' + formatValue(r.value);
      result.dataset.state = 'ok';
    } else if (r.error) {
      result.textContent = r.error;
      result.dataset.state = 'err';
    } else {
      result.textContent = '';
      delete result.dataset.state;
    }
  }

  function runKey(key: Key): void {
    // Graphing with no row focused yet: type into the first row.
    const target =
      activeField ??
      (exprList
        ? exprList.root.querySelector<MathfieldElement>('math-field')
        : null);
    if (!target) return;
    const a = key.action;
    if ('insert' in a) target.insert(a.insert);
    else if ('cmd' in a) target.executeCommand(a.cmd);
    else if ('clear' in a) target.value = '';
    else if ('equals' in a) {
      const r = evaluate(target.getValue('ascii-math'), {
        angleMode: angle,
        allowTrig: cfg.allowTrig,
        allowLogExp: cfg.allowLogExp,
      });
      if (r.ok) target.value = formatValue(r.value); // chain from the result
    }
    target.focus();
    if (graphing) exprList?.rebuild();
    else recompute();
  }

  // Graphing swaps two keys: `x` (the plot variable) replaces the rarely-used
  // factorial, `=` on the keypad INSERTS = (for `y =` and slider rows like
  // `a = 3`) instead of evaluating — a graphing calculator has no “equals”.
  const keypadKeys: Key[] = graphing
    ? KEYPAD.map((k) =>
        k.label === '!'
          ? { label: 'x', action: { insert: 'x' }, variant: 'fn' }
          : k,
      )
    : KEYPAD;

  for (const key of keypadKeys) {
    const btn = el('button', 'gk-cal-key', { type: 'button' });
    if (key.variant) btn.dataset.variant = key.variant;
    btn.textContent = key.label;
    const disabled =
      (key.gate === 'trig' && !cfg.allowTrig) ||
      (key.gate === 'logexp' && !cfg.allowLogExp);
    if (disabled) {
      btn.disabled = true;
      btn.title = 'Turned off for this activity';
    } else {
      btn.addEventListener('click', () => runKey(key));
    }
    keypad.appendChild(btn);
  }
  // Equals spans the bottom row (insert-`=` in graphing, evaluate otherwise).
  const equalsBtn = el('button', 'gk-cal-key gk-cal-equals', { type: 'button' });
  equalsBtn.dataset.variant = 'equals';
  equalsBtn.textContent = '=';
  equalsBtn.addEventListener('click', () =>
    runKey(
      graphing
        ? { label: '=', action: { insert: '=' } }
        : { label: '=', action: { equals: true } },
    ),
  );
  keypad.appendChild(equalsBtn);

  // Graphing is two-column (Stage 4): the left column holds the expression
  // list + keypad (or, in data view, the data section — CSS toggles which),
  // the board fills the right. One DOM, CSS-only view switches — no
  // reparenting, which JSXGraph dislikes. Scientific keeps the Stage 1 card.
  panel.dataset.mode = cfg.mode;
  if (graphing && exprList) {
    const body = el('div', 'gk-cal-body');
    const left = el('div', 'gk-cal-left');
    // Graphing drops the custom button pad — input is the MathLive field plus
    // its virtual keyboard (toggled per row), configured just below.
    left.append(exprList.root, dataSection);
    // Draggable splitter: rebalance the list column vs the board. Sets the
    // list's flex-basis in px; remembered for the session.
    const splitter = el('div', 'gk-cal-splitter', {
      role: 'separator',
      'aria-orientation': 'vertical',
      'aria-label': 'Resize the expression list',
    });
    let splitting = false;
    splitter.addEventListener('pointerdown', (e) => {
      splitting = true;
      splitter.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    splitter.addEventListener('pointermove', (e) => {
      if (!splitting) return;
      const bodyRect = body.getBoundingClientRect();
      // Clamp so neither side collapses (≥7rem list, ≥8rem board).
      const basis = Math.min(
        Math.max(e.clientX - bodyRect.left, 112),
        bodyRect.width - 128,
      );
      left.style.flexBasis = basis + 'px';
      remembered.splitBasis = basis + 'px';
    });
    const endSplit = (e: PointerEvent): void => {
      splitting = false;
      try {
        splitter.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    };
    splitter.addEventListener('pointerup', endSplit);
    splitter.addEventListener('pointercancel', endSplit);
    if (remembered.splitBasis) left.style.flexBasis = remembered.splitBasis;
    body.append(left, splitter, graphEl);
    panel.append(header, body);
    panel.dataset.view = 'expr';
  } else {
    panel.append(header, field, result, keypad);
  }

  if (!graphing) field.addEventListener('input', recompute);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    }
  });
  angleBtn.addEventListener('click', () => {
    angle = angle === 'deg' ? 'rad' : 'deg';
    angleBtn.textContent = angle.toUpperCase();
    if (graphing) {
      exprList?.reclassifyAll(); // compiled rows captured the old angle mode
    } else {
      field.focus();
      recompute();
    }
  });
  closeBtn.addEventListener('click', () => setOpen(false));

  // Drag-to-move (floating only): grab the header bar to slide the panel off
  // the work, Desmos-style. Starts from the CSS default corner; on first drag
  // we pin left/top and clamp so the header can never be lost off-screen. Drags
  // that begin on a header control (Data/angle/×) are ignored so those still
  // click normally.
  if (floating) {
    let dragDX = 0;
    let dragDY = 0;
    let dragging = false;
    header.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      panel.style.left = r.left + 'px';
      panel.style.top = r.top + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      dragDX = e.clientX - r.left;
      dragDY = e.clientY - r.top;
      header.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    header.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const w = panel.offsetWidth;
      const left = Math.min(
        Math.max(e.clientX - dragDX, 8 - w + 64), // keep ≥64px on screen
        window.innerWidth - 64,
      );
      const top = Math.min(
        Math.max(e.clientY - dragDY, 8),
        window.innerHeight - 40,
      );
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      remembered.left = left;
      remembered.top = top;
    });
    const endDrag = (e: PointerEvent): void => {
      dragging = false;
      try {
        header.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    };
    header.addEventListener('pointerup', endDrag);
    header.addEventListener('pointercancel', endDrag);

    // Restore this session's remembered size + position (a prior drag/resize).
    if (remembered.width) panel.style.width = remembered.width;
    if (remembered.height) panel.style.height = remembered.height;
    if (remembered.left != null && remembered.top != null) {
      panel.style.left = remembered.left + 'px';
      panel.style.top = remembered.top + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
  }

  mount.appendChild(panel);

  // Graphing input relies on MathLive's virtual keyboard (the custom pad is
  // gone). Render it INSIDE the panel (not docked at the screen bottom) and use
  // a single built-in layout so there's no matrix/greek/text layout switcher.
  // The VK is a global singleton, so this configures whichever calculator was
  // last opened — fine for the one-calculator-per-page reality.
  if (graphing) {
    const vk = virtualKeyboard();
    if (vk) {
      try {
        vk.layouts = ['numeric'];
        vk.container = panel;
      } catch {
        /* unexpected MathLive VK shape — fall back to its defaults */
      }
    }
  }

  // Graphing mode: lazy-import the board layer (JSXGraph in its own chunk) now
  // that graphEl is in the DOM and sized. A failure leaves a clear message; the
  // rest of the calculator (input, keypad) still works.
  if (graphing) {
    graphEl.textContent = 'Loading graph…';
    import('./board.js')
      .then(({ createBoard }) => {
        graphEl.textContent = '';
        boardController = createBoard(graphEl);
        if (pendingPlots) {
          boardController.setPlots(pendingPlots); // rows typed before load
          pendingPlots = null;
        }
        if (dataViewOn) updateData(); // scatter/fit typed in before board load
      })
      .catch((err) => {
        graphEl.textContent = 'Graph failed to load';
        console.error('Calculator board failed to load', err);
      });
  }

  function setOpen(v: boolean): void {
    if (v === open) return;
    open = v;
    mount.hidden = !v;
    if (v) {
      if (graphing) {
        (
          activeField ??
          exprList?.root.querySelector<MathfieldElement>('math-field')
        )?.focus();
      } else {
        field.focus();
      }
    }
    hooks.onToggle?.(v);
  }

  // Mounted open: the summon click (or the editor preview) wants it visible now.
  // We deliberately do NOT steal focus here: on a remount (config change), the
  // previous field is mid-teardown, and focusing the new field makes MathLive's
  // focus manager blur that stale field against a dead model and throw. The user
  // focuses by clicking the field or any keypad key (runKey focuses it); an
  // explicit open() via the summon toggle focuses too (no stale field by then).
  open = true;
  mount.hidden = false;
  hooks.onToggle?.(true);

  return {
    get isOpen() {
      return open;
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!open),
    destroy: () => {
      // Remember the session's size (the native resize handle writes inline
      // width/height) so a re-open keeps it.
      if (floating) {
        if (panel.style.width) remembered.width = panel.style.width;
        if (panel.style.height) remembered.height = panel.style.height;
      }
      // Blur math-fields BEFORE removing them. Removing a focused MathLive
      // field makes its onBlur fire against a half-torn-down model
      // ("Cannot read properties of undefined (reading 'options')"). Blurring
      // while still connected runs that teardown cleanly.
      try {
        field.blur();
      } catch {
        /* already detached — nothing to blur */
      }
      exprList?.destroy(); // blurs its row fields the same way
      boardController?.destroy();
      panel.remove();
    },
  };
}

// Own visual identity (the "visual stranger" half of the legal posture): a plain
// neutral card with a blue accent — deliberately not a Desmos palette clone.
const KIT_CSS = `
.gk-cal {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 17rem;
  padding: 0.6rem;
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
/* Floating window (published page): pinned to a viewport corner by default,
   draggable by its header. The in-flow default (editor preview) is unchanged. */
.gk-cal-floating {
  position: fixed; right: 1rem; bottom: 1rem;
  z-index: 120; /* above the reference bar; the summon button hides while open */
  max-height: 92vh;
}
.gk-cal-header { display: flex; align-items: center; gap: 0.5rem; }
.gk-cal-floating .gk-cal-header {
  cursor: move; user-select: none; touch-action: none; /* header owns the drag */
}
.gk-cal-floating .gk-cal-header button { cursor: pointer; } /* controls still click */
.gk-cal-title { font-weight: 600; font-size: 0.9rem; flex: 1; }
.gk-cal-angle {
  font: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
  cursor: pointer; padding: 0.15rem 0.5rem; border-radius: 999px;
  border: 1px solid #2563eb; background: #eff6ff; color: #2563eb;
}
.gk-cal-close {
  font-size: 1.25rem; line-height: 1; cursor: pointer; border: none;
  background: none; color: #64748b; padding: 0 0.2rem;
}
.gk-cal-close:hover { color: #1e293b; }
.gk-cal-field {
  width: 100%; min-height: 2.4rem; padding: 0.3rem 0.4rem;
  border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1.1rem;
  background: #f8fafc;
}
.gk-cal-result {
  min-height: 1.4rem; text-align: right; font-size: 1.05rem;
  font-variant-numeric: tabular-nums; padding: 0 0.2rem; color: #0f172a;
}
.gk-cal-result[data-state='err'] { color: #b91c1c; font-size: 0.85rem; }
.gk-cal-graph {
  width: 100%; height: 200px;
  position: relative; /* anchors the on-graph nav buttons */
  border: 1px solid #cbd5e1; border-radius: 6px; background: #fff;
  touch-action: none; /* JSXGraph owns touch pan/zoom */
  display: flex; align-items: center; justify-content: center;
  color: #64748b; font-size: 0.85rem; overflow: hidden;
}
.gk-board-nav {
  position: absolute; right: 0.4rem; bottom: 0.4rem; z-index: 2;
  display: flex; flex-direction: column; gap: 0.25rem;
}
.gk-board-nav button {
  width: 1.7rem; height: 1.7rem; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #cbd5e1; border-radius: 6px;
  background: rgba(255, 255, 255, 0.92); color: #334155;
  font: inherit; font-size: 1rem; line-height: 1; cursor: pointer;
}
.gk-board-nav button:hover { background: #e2e8f0; }
.gk-board-readout {
  position: absolute; left: 0.4rem; top: 0.4rem; z-index: 2;
  padding: 0.15rem 0.4rem; border-radius: 6px;
  background: rgba(255, 255, 255, 0.92); border: 1px solid #cbd5e1;
  font-size: 0.8rem; color: #0f172a; font-variant-numeric: tabular-nums;
  pointer-events: none; /* never intercept a pan/trace */
}
.gk-cal-keypad {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.3rem;
}
/* ---- Graphing layout (Stage 4): expression list | board, two columns ---- */
.gk-cal[data-mode='graphing'] {
  width: 30rem; height: 26rem;
  /* Native drag-resize (bottom-right handle) — an enhancement, never a
     prerequisite: the default size is fully usable. JSXGraph's own
     ResizeObserver re-fits the board as the graph cell grows. */
  resize: both; overflow: hidden;
  min-width: 24rem; min-height: 20rem; max-width: 95vw; max-height: 92vh;
}
.gk-cal-body { display: flex; flex-direction: row; align-items: stretch; gap: 0.5rem; min-width: 0; flex: 1 1 auto; min-height: 0; }
.gk-cal-left { display: flex; flex-direction: column; gap: 0.5rem; flex: 0 0 14rem; min-width: 0; min-height: 0; }
.gk-cal-splitter {
  flex: 0 0 6px; align-self: stretch; cursor: col-resize;
  border-radius: 3px; background: #e2e8f0; touch-action: none;
}
.gk-cal-splitter:hover { background: #cbd5e1; }
.gk-cal[data-mode='graphing'] .gk-cal-graph { height: auto; min-height: 0; flex: 1 1 auto; }
/* Data view (Stage 3): the left column swaps list+keypad for the data section */
.gk-cal[data-view='data'] .gk-exprlist,
.gk-cal[data-view='data'] .gk-cal-keypad { display: none; }
/* ---- Expression list (Stage 4) ---- */
.gk-exprlist { display: flex; flex-direction: column; gap: 0.3rem; flex: 1 1 auto; min-height: 0; overflow-y: auto; }
.gk-exprlist-rows { display: flex; flex-direction: column; gap: 0.3rem; }
.gk-exprrow-line { display: flex; align-items: center; gap: 0.35rem; }
.gk-exprrow-dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; flex: none; }
.gk-exprfield {
  flex: 1 1 auto; min-width: 0; min-height: 2.5rem; padding: 0.35rem 0.4rem;
  display: flex; align-items: center; /* vertically center tall math (fractions, xⁿ) */
  border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1.05rem; background: #f8fafc;
}
/* Hide MathLive's ☰ menu toggle (matrix/text/colour/variants — out of scope)
   and its built-in in-field keyboard toggle (we supply our own ⌨ button at the
   field's right edge). !important beats MathLive's internal part styling. */
.gk-exprfield::part(menu-toggle),
.gk-cal-field::part(menu-toggle),
.gk-exprfield::part(virtual-keyboard-toggle),
.gk-cal-field::part(virtual-keyboard-toggle) { display: none !important; }
.gk-exprrow-remove {
  border: none; background: none; color: #94a3b8; cursor: pointer;
  font-size: 1rem; line-height: 1; padding: 0 0.25rem; flex: none;
}
.gk-exprrow-remove:hover { color: #b91c1c; }
.gk-exprrow-kb {
  border: none; background: none; color: #64748b; cursor: pointer;
  font-size: 1rem; line-height: 1; padding: 0 0.2rem; flex: none;
}
.gk-exprrow-kb:hover { color: #2563eb; }
/* MathLive renders its virtual keyboard into the panel (container = panel).
   Keep it inside the popup's rounded frame and above the board. */
.gk-cal-floating .ML__keyboard { position: absolute; z-index: 130; }
.gk-exprrow-note { font-size: 0.78rem; padding-left: 0.95rem; }
.gk-exprrow-note:empty { display: none; }
.gk-exprrow-note[data-kind='error'] { color: #b91c1c; }
.gk-exprrow-note[data-kind='calc'] {
  color: #0f172a; font-size: 0.95rem; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.gk-exprrow-slider { display: flex; gap: 0.4rem; align-items: center; padding-left: 0.95rem; }
.gk-exprrow-slider[hidden] { display: none; }
.gk-slider-label {
  font-size: 0.8rem; color: #334155; min-width: 3.5rem;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.gk-slider-range { flex: 1; min-width: 0; }
.gk-exprlist-cap { font-size: 0.72rem; color: #64748b; }
.gk-cal-data-btn {
  font: inherit; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
  cursor: pointer; padding: 0.15rem 0.5rem; border-radius: 999px;
  border: 1px solid #cbd5e1; background: #f8fafc; color: #475569;
}
.gk-cal-data-btn[aria-pressed='true'] {
  border-color: #16a34a; background: #f0fdf4; color: #15803d;
}
.gk-cal-data { display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; min-height: 0; flex: 1 1 auto; }
.gk-cal-data[hidden] { display: none; }
.gk-data-scroll {
  overflow-y: auto; flex: 1 1 auto; min-height: 0;
  border: 1px solid #e2e8f0; border-radius: 6px;
}
.gk-data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.gk-data-table th {
  text-align: center; font-weight: 600; padding: 0.15rem;
  background: #f8fafc; position: sticky; top: 0;
}
.gk-data-table td { padding: 0.1rem; }
.gk-data-input {
  width: 100%; font: inherit; font-size: 0.85rem; padding: 0.2rem 0.3rem;
  border: 1px solid #e2e8f0; border-radius: 4px;
  appearance: textfield; -moz-appearance: textfield;
}
.gk-data-input::-webkit-outer-spin-button,
.gk-data-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.gk-data-remove {
  border: none; background: none; color: #94a3b8; cursor: pointer;
  font-size: 1rem; line-height: 1; padding: 0 0.25rem;
}
.gk-data-remove:hover { color: #b91c1c; }
.gk-fit-controls { display: flex; gap: 0.4rem; align-items: center; }
.gk-fit-model {
  flex: 1; min-width: 0; font: inherit; font-size: 0.85rem; padding: 0.25rem;
  border: 1px solid #cbd5e1; border-radius: 6px; background: #fff;
}
.gk-fit-view-btn {
  font: inherit; font-size: 0.72rem; font-weight: 600; cursor: pointer;
  padding: 0.25rem 0.5rem; border-radius: 6px;
  border: 1px solid #cbd5e1; background: #f8fafc; color: #475569;
  white-space: nowrap;
}
.gk-fit-view-btn:hover { background: #e2e8f0; }
.gk-cal-fit {
  min-height: 2.2rem; font-size: 0.9rem; padding: 0 0.1rem;
  font-variant-numeric: tabular-nums;
}
.gk-cal-fit[data-state='hint'] { color: #64748b; font-size: 0.8rem; }
.gk-cal-fit[data-state='err'] { color: #b91c1c; font-size: 0.8rem; }
.gk-fit-eq { font-weight: 600; color: #15803d; } /* matches the fit curve */
.gk-fit-r2 { color: #334155; }
.gk-cal-key {
  font: inherit; font-size: 0.95rem; cursor: pointer; padding: 0.55rem 0;
  border: 1px solid #e2e8f0; border-radius: 6px; background: #f1f5f9;
  color: #1e293b; min-height: 44px;
}
.gk-cal-key:hover:not(:disabled) { background: #e2e8f0; }
.gk-cal-key:active:not(:disabled) { transform: translateY(1px); }
.gk-cal-key:disabled { opacity: 0.4; cursor: not-allowed; }
.gk-cal-key[data-variant='fn'] { background: #eef2ff; color: #4338ca; font-size: 0.85rem; }
.gk-cal-key[data-variant='op'] { background: #e2e8f0; font-weight: 600; }
.gk-cal-key[data-variant='accent'] { background: #fef2f2; color: #b91c1c; }
.gk-cal-key[data-variant='equals'] {
  grid-column: 1 / -1; background: #2563eb; color: #fff; font-weight: 700;
}
.gk-cal-key[data-variant='equals']:hover { background: #1d4ed8; }
`;
