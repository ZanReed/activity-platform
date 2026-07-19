// =============================================================================
// math-prompt-bridge.ts — Model A: hand the equation to the lazy kit (MA-T5b)
// -----------------------------------------------------------------------------
// The SWAP's interactive half. init.ts (MA-T5a) already registered each gap's
// hidden mirror <input> as a normal blank, so scoring/gather/restore work with
// NO kit — the static KaTeX gap is fully answerable on paper / offline / before
// the kit lands. This module adds the enhancement: when the lazy graph-kit is
// available, mount an interactive MathLive read-only-with-prompt field over the
// equation and pipe the student's typed value back into the mirror.
//
// The bridge is deliberately dumb about MathLive (the base runtime ships none):
// it lazy-import()s the kit — exactly like calculator-summon — and calls the
// kit's mountMathPrompts, handing it the raw latex, the restored initial values,
// and an onValue callback. On a value change the callback writes the ascii into
// the mirror and dispatches a native `input` event, so the runtime's EXISTING
// blank wiring (autosave + clear-result-on-edit) fires — no per-keystroke
// scoring (P7); the value scores at Check like every other blank.
//
// wireMathPromptBlock is the pure, injectable core (unit-tested with a stub
// mount). attachMathPrompts is the defensive shell (lazy import; a failed load
// leaves the static KaTeX + scoring mirror untouched — the graph-integration
// discipline). See docs/design/math-blanks.md (Model A).
// =============================================================================

import { resolveKitSrc } from './math-blanks.js';
import type { RuntimeState } from './state.js';

export interface MathPromptMountOptions {
  /** Raw latex with `\placeholder[id]{}` markers — MathLive mounts from this. */
  latex: string;
  /** promptId -> restored ascii value, for hydrating the field on load. */
  initialValues: Record<string, string>;
  /** Called when a prompt's value changes: (promptId, ascii). */
  onValue: (promptId: string, ascii: string) => void;
}

// The kit's mount handle (MA-T4). Parallel type (the runtime imports no kit
// code — the actual handle arrives via dynamic import). setResult pushes a gap's
// scored verdict into the MathLive field (MA-D5: setPromptState correct/incorrect
// + lock); reveal/destroy round out the contract.
interface MountedMathPrompts {
  setResult(promptId: string, correct: boolean | null, lock: boolean): void;
  reveal(promptId: string, ascii: string): void;
  destroy(): void;
}

type MountFn = (
  host: HTMLElement,
  opts: MathPromptMountOptions,
) => MountedMathPrompts | undefined;

interface MathPromptKitModule {
  mountMathPrompts: MountFn;
}

// Mounted fields, so render() can push each gap's verdict into its MathLive
// view (MA-D5). One entry per equation; `gaps` maps promptId -> mirror <input>
// (the mirror's `disabled`, set by renderBlank, is the section-locked flag).
const mounted: { handle: MountedMathPrompts; gaps: Map<string, HTMLInputElement> }[] = [];

/** Test-only: clear the mounted registry between cases. */
export function __resetMathPromptMounts(): void {
  mounted.length = 0;
}

/**
 * Wire one math-prompt block to the kit's mount function. Collects the block's
 * mirror inputs, seeds `initialValues` from their (possibly restored) values,
 * builds the write-back `onValue`, and calls `mount`. Pure w.r.t. the kit — the
 * mount is injected, so this is unit-testable with a stub. No-op if the block
 * has no latex attr or no mirrors. Registers the returned handle for
 * renderMathPrompts (MA-D5).
 */
export function wireMathPromptBlock(el: HTMLElement, mount: MountFn): void {
  const latex = el.getAttribute('data-math-prompt-latex');
  if (latex === null) return;

  const mirrors = new Map<string, HTMLInputElement>();
  for (const input of el.querySelectorAll<HTMLInputElement>(
    '.blank.math-prompt-blank',
  )) {
    const id = input.dataset.blankId;
    if (id) mirrors.set(id, input);
  }
  if (mirrors.size === 0) return;

  const initialValues: Record<string, string> = {};
  for (const [id, input] of mirrors) initialValues[id] = input.value;

  const onValue = (promptId: string, ascii: string): void => {
    const mirror = mirrors.get(promptId);
    if (!mirror || mirror.value === ascii) return;
    mirror.value = ascii;
    // Reuse the runtime's own blank wiring: an `input` event triggers autosave
    // and clears the stale result — identical to the student typing in a blank.
    mirror.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const handle = mount(el, { latex, initialValues, onValue });
  if (handle) mounted.push({ handle, gaps: mirrors });
}

/**
 * MA-D5 state->view sync (called from render(), like graphExt.renderGraphs):
 * push each gap's scored verdict into its MathLive field so a checked gap turns
 * green/red and locks in-field. `result` comes from the blank state (the mirror
 * IS the source of truth); `locked` reads the mirror's `disabled`, which
 * renderBlank set from the section-locked flag just before this runs. No-op
 * before the kit mounts (empty registry).
 */
export function renderMathPrompts(state: RuntimeState): void {
  for (const { handle, gaps } of mounted) {
    for (const [id, mirror] of gaps) {
      const result = state.blanks[id]?.result ?? null;
      handle.setResult(id, result, mirror.disabled);
    }
  }
}

/**
 * Fire-and-forget on bootstrap: if the page has any math-prompt block AND a kit
 * URL, lazy-load the kit and upgrade every block to an interactive MathLive
 * field. No math-prompt block, or no kit (print / offline / dev-without-R2) →
 * no-op, and the static KaTeX gaps stay fully answerable + scorable (MA-T5a).
 * `onUpdate` re-renders once the fields mount, so any already-scored verdict
 * (e.g. a restored/checked state) syncs into the new MathLive views (MA-D5).
 */
export function attachMathPrompts(onUpdate: () => void): void {
  const blocks = document.querySelectorAll<HTMLElement>(
    '[data-math-prompt-latex]',
  );
  if (blocks.length === 0) return;
  const src = resolveKitSrc();
  if (!src) return;

  import(/* @vite-ignore */ src)
    .then((mod: MathPromptKitModule) => {
      if (typeof mod.mountMathPrompts !== 'function') return;
      blocks.forEach((el) => wireMathPromptBlock(el, mod.mountMathPrompts));
      onUpdate();
    })
    .catch((err) => {
      // Kit failed (offline, blocked CDN, bad URL). The static equation + its
      // scoring mirror keep working; the student loses only the WYSIWYG field.
      console.error('[activity-runtime] math prompt kit failed to load', err);
    });
}
