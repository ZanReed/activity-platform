/**
 * @vitest-environment jsdom
 */
// =============================================================================
// mount-after-unmount.test.ts — a host torn down while the board chunk loads
// -----------------------------------------------------------------------------
// Every editor open in dev threw "JSXGraph: HTML container element
// 'gk-answer-N' not found" ~17 times (2026-11-20): React StrictMode mounts,
// cleans up and remounts each figure's effect, and the FIRST mount's
// `await import('./board.js')` resolved after its container had been removed.
// JSXGraph looks the container up by id in the document, so it threw from
// inside the promise — an unhandled rejection the caller could not catch. The
// same race exists in production when a figure unmounts during its first load.
// Each mount now checks its container is still in the document after the
// await and returns an inert handle instead.
// =============================================================================
import { describe, expect, it } from 'vitest';
import {
  HostDetachedError,
  mountGraphAuthor,
  mountGraphDisplay,
  mountGraphFunctionSystemQuestion,
  mountGraphQuestion,
  mountGraphSystemQuestion,
} from '../src/graph-question.js';
import { mountNumberLineAuthor, mountNumberLineQuestion } from '../src/number-line-question.js';

/** Start a mount on a connected host, then unmount it before the import resolves. */
async function unmountMidLoad<T extends { destroy(): void }>(
  start: (el: HTMLElement) => Promise<T>,
): Promise<{ el: HTMLElement; handle: T }> {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const pending = start(el);
  el.remove(); // the effect's cleanup, run before the chunk lands
  const handle = await pending; // must resolve, not reject
  return { el, handle };
}

const axisConfig = { xMin: -5, xMax: 5, yMin: -5, yMax: 5, xGridStep: 1, yGridStep: 1 };

describe('a mount whose host left the document mid-load', () => {
  it('mountGraphAuthor resolves to an inert handle', async () => {
    const { el, handle } = await unmountMidLoad((el) =>
      mountGraphAuthor(el, { interactionType: 'plot_point', axisConfig, correctPoints: [[1, 2]] }),
    );
    expect(handle.getPoints()).toEqual([]);
    expect(() => handle.destroy()).not.toThrow();
    expect(el.childElementCount).toBe(0); // nothing built into the dead host
  });

  it('mountGraphDisplay resolves to an inert handle', async () => {
    const { el, handle } = await unmountMidLoad((el) =>
      mountGraphDisplay(el, { axisConfig, drawables: [] }),
    );
    expect(() => handle.destroy()).not.toThrow();
    expect(el.childElementCount).toBe(0);
  });

  it('mountNumberLineAuthor resolves to an inert handle', async () => {
    const { el, handle } = await unmountMidLoad((el) =>
      mountNumberLineAuthor(el, {
        interactionType: 'plot_point',
        config: { min: 0, max: 10, tickStep: 1 },
        correctPoints: [3],
      }),
    );
    expect(() => handle.destroy()).not.toThrow();
    expect(el.childElementCount).toBe(0);
  });
});

// The STUDENT mounts reject by name instead of resolving inert: the kit cannot
// tell "the block unmounted" from "the host was detached for a moment and the
// caller still wants a board", and the viewer's `.catch` already can — it
// reads its own `cancelled` flag (silent) or shows its mount-failed fallback.
// An inert handle would turn the second case into a blank board with no error.
// See HostDetachedError in graph-question.ts.
describe('a STUDENT mount whose host left the document mid-load', () => {
  /** Same race as unmountMidLoad, but the mount is expected to reject. */
  async function rejectionOf(start: (el: HTMLElement) => Promise<unknown>) {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const pending = start(el);
    el.remove();
    const err = await pending.then(
      () => null,
      (e: unknown) => e,
    );
    return { el, err };
  }

  function expectNamedDetach(err: unknown, el: HTMLElement): void {
    expect(err).toBeInstanceOf(HostDetachedError);
    expect((err as Error).name).toBe('HostDetachedError');
    expect(el.childElementCount).toBe(0); // nothing built into the dead host
  }

  it('mountGraphQuestion rejects with HostDetachedError', async () => {
    const { el, err } = await rejectionOf((el) =>
      mountGraphQuestion(el, { interactionType: 'plot_point', axisConfig }),
    );
    expectNamedDetach(err, el);
  });

  it('mountGraphSystemQuestion rejects with HostDetachedError', async () => {
    const { el, err } = await rejectionOf((el) =>
      mountGraphSystemQuestion(el, {
        interactionType: 'graph_inequality',
        axisConfig,
        answerKey: {
          inequalities: [
            { boundary: { family: 'linear', slope: 1, intercept: 0 }, shadeSide: 'above' },
            { boundary: { family: 'linear', slope: -1, intercept: 2 }, shadeSide: 'below' },
          ],
        },
      }),
    );
    expectNamedDetach(err, el);
  });

  it('mountGraphFunctionSystemQuestion rejects with HostDetachedError', async () => {
    const { el, err } = await rejectionOf((el) =>
      mountGraphFunctionSystemQuestion(el, {
        interactionType: 'plot_function',
        axisConfig,
        answerKey: {
          models: [
            { family: 'linear', slope: 2, intercept: -1 },
            { family: 'linear', slope: -1, intercept: 3 },
          ],
        },
      }),
    );
    expectNamedDetach(err, el);
  });

  it('mountNumberLineQuestion rejects with HostDetachedError', async () => {
    const { el, err } = await rejectionOf((el) =>
      mountNumberLineQuestion(el, {
        interactionType: 'plot_point',
        config: { min: 0, max: 10, tickStep: 1 },
      }),
    );
    expectNamedDetach(err, el);
  });
});

