/**
 * @vitest-environment jsdom
 */
// =============================================================================
// reference-panel.test.ts — JSDOM tests for the floating reference-panel sidecar
// -----------------------------------------------------------------------------
// Covers the interactive contract: summon opens the panel (button hides, focus
// moves in), × / Escape close it (button returns, focus restored), a
// defaultPrevented Escape is respected, and the header drag pins left/top.
// Pixel geometry (getBoundingClientRect) is a no-op under JSDOM, so the drag
// test asserts the anchor switch + inline styles, not real coordinates — the
// browser pass covers the feel.
// =============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { setupReferenceTool } from '../reference-panel.js';

// Mirrors renderReferenceTool's output (render.ts) — keep in sync.
const TOOL_HTML =
  '<div class="reference-tool" data-block-category="scaffold">' +
  '<button type="button" class="reference-summon"' +
  ' aria-haspopup="dialog" aria-expanded="false">Formulas</button>' +
  '<aside class="reference-float" role="dialog" aria-label="Formulas"' +
  ' tabindex="-1" hidden>' +
  '<div class="reference-float-header">' +
  '<span class="reference-float-title">Formulas</span>' +
  '<button type="button" class="reference-float-close"' +
  ' aria-label="Close reference panel">&times;</button>' +
  '</div>' +
  '<div class="reference-float-body"><p>a&sup2;+b&sup2;=c&sup2;</p></div>' +
  '</aside>' +
  '</div>';

function mount(html: string = TOOL_HTML): void {
  document.body.innerHTML = html;
  setupReferenceTool();
}

const q = <T extends HTMLElement>(sel: string): T =>
  document.querySelector<T>(sel)!;

describe('reference-panel sidecar (floating tool)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('summon click opens the panel, hides the button, and moves focus in', () => {
    mount();
    const button = q<HTMLButtonElement>('.reference-summon');
    const panel = q('.reference-float');
    button.click();
    expect(panel.hidden).toBe(false);
    expect(button.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(panel);
  });

  it('the × closes the panel, restores the button, and returns focus', () => {
    mount();
    const button = q<HTMLButtonElement>('.reference-summon');
    button.click();
    q<HTMLButtonElement>('.reference-float-close').click();
    expect(q('.reference-float').hidden).toBe(true);
    expect(button.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('Escape inside the panel closes it', () => {
    mount();
    q<HTMLButtonElement>('.reference-summon').click();
    const panel = q('.reference-float');
    panel.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(panel.hidden).toBe(true);
  });

  it('a defaultPrevented Escape (consumed by an inner widget) does NOT close', () => {
    mount();
    q<HTMLButtonElement>('.reference-summon').click();
    const panel = q('.reference-float');
    const e = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    e.preventDefault(); // an inner popover already handled this Escape
    panel.dispatchEvent(e);
    expect(panel.hidden).toBe(false);
  });

  it('reopening keeps working (open → close → open)', () => {
    mount();
    const button = q<HTMLButtonElement>('.reference-summon');
    button.click();
    q<HTMLButtonElement>('.reference-float-close').click();
    button.click();
    expect(q('.reference-float').hidden).toBe(false);
    expect(button.hidden).toBe(true);
  });

  it('header drag pins left/top and releases the bottom anchor', () => {
    mount();
    q<HTMLButtonElement>('.reference-summon').click();
    const panel = q('.reference-float');
    const header = q('.reference-float-header');
    // JSDOM has no pointer-capture; stub it so the handler runs to completion.
    header.setPointerCapture = () => {};
    header.releasePointerCapture = () => {};
    header.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 60 }),
    );
    expect(panel.style.bottom).toBe('auto');
    expect(panel.style.right).toBe('auto');
    header.dispatchEvent(
      new MouseEvent('pointermove', { bubbles: true, clientX: 150, clientY: 90 }),
    );
    expect(panel.style.left).not.toBe('');
    expect(panel.style.top).not.toBe('');
    header.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
  });

  it('a pointerdown on the × never starts a drag', () => {
    mount();
    q<HTMLButtonElement>('.reference-summon').click();
    const panel = q('.reference-float');
    q<HTMLButtonElement>('.reference-float-close').dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true }),
    );
    // The early return means the anchors were never pinned.
    expect(panel.style.bottom).toBe('');
    expect(panel.style.left).toBe('');
  });

  it('is inert (no throw) on a page without the tool or with partial markup', () => {
    expect(() => mount('<main></main>')).not.toThrow();
    expect(() =>
      mount('<div class="reference-tool"><aside class="reference-float"></aside></div>'),
    ).not.toThrow();
  });
});
