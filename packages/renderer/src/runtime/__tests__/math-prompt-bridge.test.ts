/**
 * @vitest-environment jsdom
 */
// =============================================================================
// math-prompt-bridge.test.ts — Model A kit hand-off wiring (MA-T5b)
// -----------------------------------------------------------------------------
// The real MathLive mount can't run in jsdom (web component), so — like Model B
// mocked mathEquivalent and calculator-summon isn't unit-tested for its import —
// we unit-test the INJECTABLE core: wireMathPromptBlock, with a stub mount. It
// pins the seam the real kit relies on: correct latex + restored initial values
// handed in, and the onValue write-back landing in the mirror + firing `input`
// (so the runtime's existing blank autosave/clear-result runs). The live
// mount/swap is owner-verified on a published page (MA-T6 test strategy).
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  wireMathPromptBlock,
  type MathPromptMountOptions,
} from '../math-prompt-bridge.js';

function blockWith(mirrors: { id: string; value?: string }[]): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-math-prompt-latex', 'x=\\placeholder[denom]{}');
  const group = document.createElement('span');
  group.className = 'math-prompt-mirrors';
  group.hidden = true;
  for (const m of mirrors) {
    const wrap = document.createElement('span');
    wrap.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank math-prompt-blank';
    input.setAttribute('data-blank-id', m.id);
    input.setAttribute('data-blank-strategy', 'math');
    if (m.value !== undefined) input.value = m.value;
    wrap.appendChild(input);
    group.appendChild(wrap);
  }
  el.appendChild(group);
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('wireMathPromptBlock', () => {
  it('mounts with the raw latex and the mirrors’ restored values', () => {
    const el = blockWith([{ id: 'denom', value: '2a' }]);
    const mount = vi.fn();
    wireMathPromptBlock(el, mount);

    expect(mount).toHaveBeenCalledTimes(1);
    const [host, opts] = mount.mock.calls[0] as [HTMLElement, MathPromptMountOptions];
    expect(host).toBe(el);
    expect(opts.latex).toBe('x=\\placeholder[denom]{}');
    expect(opts.initialValues).toEqual({ denom: '2a' }); // hydrate from the mirror
  });

  it('onValue writes ascii into the mirror and fires a bubbling input event', () => {
    const el = blockWith([{ id: 'denom', value: '' }]);
    const mirror = el.querySelector<HTMLInputElement>('.blank.math-prompt-blank')!;
    const inputSpy = vi.fn();
    mirror.addEventListener('input', inputSpy);

    let captured: MathPromptMountOptions | null = null;
    wireMathPromptBlock(el, (_host, opts) => {
      captured = opts;
    });
    captured!.onValue('denom', 'a+a'); // student types in the (would-be) field

    expect(mirror.value).toBe('a+a');
    expect(inputSpy).toHaveBeenCalledTimes(1); // reuses the runtime's blank autosave
    expect((inputSpy.mock.calls[0][0] as Event).bubbles).toBe(true);
  });

  it('onValue is a no-op when the value is unchanged (no redundant input event)', () => {
    const el = blockWith([{ id: 'denom', value: '2a' }]);
    const mirror = el.querySelector<HTMLInputElement>('.blank.math-prompt-blank')!;
    const inputSpy = vi.fn();
    mirror.addEventListener('input', inputSpy);

    let captured: MathPromptMountOptions | null = null;
    wireMathPromptBlock(el, (_host, opts) => {
      captured = opts;
    });
    captured!.onValue('denom', '2a'); // same value
    expect(inputSpy).not.toHaveBeenCalled();
  });

  it('is a no-op with no latex attr or no mirrors (never calls mount)', () => {
    const noLatex = document.createElement('div');
    const mount1 = vi.fn();
    wireMathPromptBlock(noLatex, mount1);
    expect(mount1).not.toHaveBeenCalled();

    const noMirrors = document.createElement('div');
    noMirrors.setAttribute('data-math-prompt-latex', 'x');
    const mount2 = vi.fn();
    wireMathPromptBlock(noMirrors, mount2);
    expect(mount2).not.toHaveBeenCalled();
  });
});
