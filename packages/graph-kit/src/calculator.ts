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
import { evaluate, compileFunction } from './evaluate.js';
// Type-only — erased at build time, so the static JSXGraph dependency in
// board.ts stays in its own lazily-imported chunk (the lazy-split).
import type { BoardController } from './board.js';

export interface CalculatorConfig {
  mode?: 'scientific' | 'graphing';
  allowTrig?: boolean;
  allowLogExp?: boolean;
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
}

function readConfig(raw: unknown): Required<CalculatorConfig> {
  const c = (typeof raw === 'object' && raw !== null ? raw : {}) as CalculatorConfig;
  return {
    mode: c.mode === 'graphing' ? 'graphing' : 'scientific',
    allowTrig: c.allowTrig !== false, // permissive default
    allowLogExp: c.allowLogExp !== false,
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

export function mountCalculator(
  mount: HTMLElement,
  rawConfig?: unknown,
  hooks: MountHooks = {},
): CalculatorHandle {
  injectStyles();
  configureMathLive();
  const cfg = readConfig(rawConfig);
  const graphing = cfg.mode === 'graphing';
  // Radians is the sensible default for plotting (sin(x) over [-10,10] in degrees
  // is nearly flat); degrees is friendlier for a scientific calculator.
  let angle: 'deg' | 'rad' = graphing ? 'rad' : 'deg';
  let open = false;

  const panel = el('div', 'gk-cal', {
    role: 'dialog',
    'aria-label': 'Calculator',
  });

  // Header: title + deg/rad toggle + close
  const header = el('div', 'gk-cal-header');
  const title = el('span', 'gk-cal-title');
  title.textContent = 'Calculator';
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
  header.append(title, angleBtn, closeBtn);

  // Input/display
  const field = new MathfieldElement();
  field.className = 'gk-cal-field';
  // Our keypad + the physical keyboard are the input; suppress MathLive's own
  // on-screen keyboard so it doesn't fight the calculator's keypad.
  field.mathVirtualKeyboardPolicy = 'manual';

  // Output: scientific shows a numeric result; graphing shows a plot board.
  const result = el('div', 'gk-cal-result', { 'aria-live': 'polite' });
  const graphEl = el('div', 'gk-cal-graph');
  let boardController: BoardController | null = null;

  // Keypad
  const keypad = el('div', 'gk-cal-keypad');

  function recompute(): void {
    const ascii = field.getValue('ascii-math');
    const opts = {
      angleMode: angle,
      allowTrig: cfg.allowTrig,
      allowLogExp: cfg.allowLogExp,
    };
    if (graphing) {
      if (!boardController) return; // board still lazy-loading
      // Everything plots as y = f(x); a constant expression is a horizontal line.
      boardController.plot(compileFunction(ascii, opts));
      return;
    }
    const r = evaluate(ascii, opts);
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
    const a = key.action;
    if ('insert' in a) field.insert(a.insert);
    else if ('cmd' in a) field.executeCommand(a.cmd);
    else if ('clear' in a) field.value = '';
    else if ('equals' in a) {
      const r = evaluate(field.getValue('ascii-math'), {
        angleMode: angle,
        allowTrig: cfg.allowTrig,
        allowLogExp: cfg.allowLogExp,
      });
      if (r.ok) field.value = formatValue(r.value); // chain from the result
    }
    field.focus();
    recompute();
  }

  // Graphing mode needs an `x` variable key; swap it in for the rarely-used
  // factorial so the 5-column grid stays even.
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
  // Equals spans the bottom row.
  const equalsBtn = el('button', 'gk-cal-key gk-cal-equals', { type: 'button' });
  equalsBtn.dataset.variant = 'equals';
  equalsBtn.textContent = '=';
  equalsBtn.addEventListener('click', () =>
    runKey({ label: '=', action: { equals: true } }),
  );
  keypad.appendChild(equalsBtn);

  panel.append(header, field, graphing ? graphEl : result, keypad);

  field.addEventListener('input', recompute);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    }
  });
  angleBtn.addEventListener('click', () => {
    angle = angle === 'deg' ? 'rad' : 'deg';
    angleBtn.textContent = angle.toUpperCase();
    field.focus();
    recompute();
  });
  closeBtn.addEventListener('click', () => setOpen(false));

  mount.appendChild(panel);

  // Graphing mode: lazy-import the board layer (JSXGraph in its own chunk) now
  // that graphEl is in the DOM and sized. A failure leaves a clear message; the
  // rest of the calculator (input, keypad) still works.
  if (graphing) {
    graphEl.textContent = 'Loading graph…';
    import('./board.js')
      .then(({ createBoard }) => {
        graphEl.textContent = '';
        boardController = createBoard(graphEl);
        recompute();
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
    if (v) field.focus();
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
      // Blur the math-field BEFORE removing it. Removing a focused MathLive
      // field makes its onBlur fire against a half-torn-down model
      // ("Cannot read properties of undefined (reading 'options')"). Blurring
      // while still connected runs that teardown cleanly.
      try {
        field.blur();
      } catch {
        /* already detached — nothing to blur */
      }
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
.gk-cal-header { display: flex; align-items: center; gap: 0.5rem; }
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
  border: 1px solid #cbd5e1; border-radius: 6px; background: #fff;
  touch-action: none; /* JSXGraph owns touch pan/zoom */
  display: flex; align-items: center; justify-content: center;
  color: #64748b; font-size: 0.85rem; overflow: hidden;
}
.gk-cal-keypad {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.3rem;
}
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
