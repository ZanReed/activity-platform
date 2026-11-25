// @vitest-environment jsdom
// =============================================================================
// ungraded-choices.test.ts — an ungraded board reports the student's CHOICES
// -----------------------------------------------------------------------------
// The viewer always mounts the ungraded mode (no answer key on the client),
// and the server grades what the board reports. Until 2026-11-26 the code that
// reported a ray's or segment's shape and endpoint styles, and an inequality's
// line style and shaded side, sat inside `if (key)` branches, so an ungraded
// board reported none of them: the server called every ray and segment
// unanswered and every inequality wrong. A vertical boundary also offered
// "Shade above/below", because which way it runs was read from the key.
//
// JSXGraph mounts in jsdom (it logs that matchMedia is missing), so these rows
// drive the real board by its own pills.
// =============================================================================
import { afterEach, describe, expect, it } from 'vitest';
import { mountGraphQuestion } from '../src/graph-question.js';

const axisConfig = { xMin: -5, xMax: 5, yMin: -5, yMax: 5, xGridStep: 1, yGridStep: 1 };

afterEach(() => {
  document.body.innerHTML = '';
});

async function board(interactionType: string, questionShape?: { family?: string }) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const handle = await mountGraphQuestion(el, { interactionType, axisConfig, questionShape });
  const pills = () => [...el.querySelectorAll('button')];
  return {
    handle,
    labels: () => pills().map((b) => b.textContent),
    click(prefix: string) {
      const b = pills().find((x) => x.textContent?.startsWith(prefix));
      if (!b) throw new Error(`no "${prefix}" in ${pills().map((x) => x.textContent).join(' | ')}`);
      b.click();
    },
  };
}

describe('an ungraded board reports what the student chose', () => {
  it('plot_segment: the shape and both endpoint styles', async () => {
    const b = await board('plot_segment');
    b.click('Segment');
    b.click('Left');
    expect(b.handle.getResponse()).toMatchObject({
      scored: false,
      shape: 'segment',
      endpoints: ['open', 'closed'],
    });
  });

  it('plot_ray: the direction and its endpoint style', async () => {
    const b = await board('plot_ray');
    b.click('Ray');
    b.click('Endpoint');
    expect(b.handle.getResponse()).toMatchObject({
      scored: false,
      shape: 'ray_positive',
      fromStyle: 'open',
    });
  });

  it('graph_inequality: the line style and the side; no side until one is picked', async () => {
    const b = await board('graph_inequality', { family: 'linear' });
    b.click('Dotted line');
    expect(b.handle.getResponse()).toMatchObject({ strict: true });
    expect(b.handle.getResponse().side).toBeUndefined();
    b.click('Shade below');
    expect(b.handle.getResponse()).toMatchObject({ scored: false, strict: true, side: 'below' });
  });

  it('a vertical boundary is shaded left or right, from the served question shape', async () => {
    const b = await board('graph_inequality', { family: 'vertical' });
    expect(b.labels()).toContain('Shade left');
    expect(b.labels()).not.toContain('Shade above');
    b.click('Shade right');
    expect(b.handle.getResponse().side).toBe('right');
  });
});
