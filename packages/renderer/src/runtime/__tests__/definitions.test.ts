/**
 * @vitest-environment jsdom
 */
// =============================================================================
// definitions.test.ts — JSDOM tests for the vocabulary-definition sidecar
// -----------------------------------------------------------------------------
// Covers the interactive contract: click / keyboard opens a popover with the
// term's definition; toggling, Escape, and switching terms; an empty term is
// inert. Positioning (getBoundingClientRect) is a no-op under JSDOM, so these
// assert open/close + aria + text, not pixel geometry.
// =============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { setupDefinitions } from '../definitions.js';

const term = (text: string, def: string): string =>
  '<span class="definition" data-definition="' +
  def +
  '" tabindex="0" role="button" aria-haspopup="dialog" aria-expanded="false">' +
  text +
  '</span>';

function mount(html: string): void {
  document.body.innerHTML = html;
  setupDefinitions();
}

const popover = (): HTMLElement | null =>
  document.querySelector<HTMLElement>('.definition-popover');

describe('definitions sidecar', () => {
  beforeEach(() => {
    // Clears terms AND any popover a prior test appended to <body>.
    document.body.innerHTML = '';
  });

  it('opens a popover with the definition text on click', () => {
    mount('<p>' + term('factor', 'a number that divides another exactly') + '</p>');
    const el = document.querySelector<HTMLElement>('.definition')!;
    el.click();
    const pop = popover()!;
    expect(pop).not.toBeNull();
    expect(pop.hidden).toBe(false);
    expect(pop.textContent).toContain('a number that divides another exactly');
    expect(el.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles closed on a second click', () => {
    mount('<p>' + term('factor', 'a divisor') + '</p>');
    const el = document.querySelector<HTMLElement>('.definition')!;
    el.click();
    el.click();
    expect(popover()!.hidden).toBe(true);
    expect(el.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns aria-expanded to false', () => {
    mount('<p>' + term('factor', 'a divisor') + '</p>');
    const el = document.querySelector<HTMLElement>('.definition')!;
    el.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(popover()!.hidden).toBe(true);
    expect(el.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on Enter (keyboard)', () => {
    mount('<p>' + term('factor', 'a divisor') + '</p>');
    const el = document.querySelector<HTMLElement>('.definition')!;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(popover()!.hidden).toBe(false);
    expect(el.getAttribute('aria-expanded')).toBe('true');
  });

  it('is inert for a term with no definition text', () => {
    mount('<p>' + term('factor', '') + '</p>');
    const el = document.querySelector<HTMLElement>('.definition')!;
    el.click();
    const pop = popover();
    expect(pop === null || pop.hidden).toBe(true);
    expect(el.getAttribute('aria-expanded')).toBe('false');
  });

  it('switches the shown definition when a different term is clicked', () => {
    mount(
      '<p>' +
        term('factor', 'a divisor') +
        ' ' +
        term('domain', 'the set of inputs') +
        '</p>',
    );
    const terms = Array.from(document.querySelectorAll<HTMLElement>('.definition'));
    terms[0]!.click();
    terms[1]!.click();
    const pop = popover()!;
    expect(pop.hidden).toBe(false);
    expect(pop.textContent).toContain('the set of inputs');
    expect(terms[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(terms[1]!.getAttribute('aria-expanded')).toBe('true');
  });
});
