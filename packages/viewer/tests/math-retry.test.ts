// @vitest-environment jsdom
// =============================================================================
// math-retry.test.ts — the page's ONE math retry schedule
// -----------------------------------------------------------------------------
// What these can and cannot see. They pin the SCHEDULE: one shared run of tries
// for the whole page, bounded, claimed while it runs, handed to the app's
// recovery when it gives up. They cannot see whether a try actually reaches the
// network — the test runner's `import()` is not a browser's, and the browser
// trap (a failed URL is never fetched again) is invisible here. That half is
// lazy/retryableChunk.ts, pinned in retryable-chunk.test.ts and, at production
// values in real Chromium, by app/e2e/sw/math-chunk.e2e.ts. The 2026-11-26
// version of this file passed while the retry did nothing in a browser.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let failures = 0;
let imports = 0;

vi.mock('katex/dist/katex.min.css', () => ({}));
vi.mock('katex', () => ({
  // A failure here is a failure of the whole load, which is what the schedule
  // sees from a failed chunk.
  get default() {
    imports += 1;
    if (failures > 0) {
      failures -= 1;
      throw new Error('chunk failed to load');
    }
    return { renderToString: (tex: string) => `<math>${tex}</math>` };
  },
}));

const { loadMathRenderer, setMathRenderer, setMathRetryDelays, whenMathReady } = await import(
  '../src/inline/math.js'
);
const { isChunkFailureClaimed } = await import('../src/lazy/retryableChunk.js');

const cancels: Array<() => void> = [];
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
const gaveUp: unknown[] = [];
const onPreloadError = (event: Event) => gaveUp.push((event as Event & { payload?: unknown }).payload);

beforeEach(() => {
  setMathRetryDelays([1, 1, 1]);
  setMathRenderer(null);
  failures = 0;
  imports = 0;
  gaveUp.length = 0;
  window.addEventListener('vite:preloadError', onPreloadError);
});
afterEach(() => {
  for (const cancel of cancels.splice(0)) cancel();
  window.removeEventListener('vite:preloadError', onPreloadError);
  setMathRetryDelays(null);
});

describe('loadMathRenderer', () => {
  it('tries again after a failure, by itself, and resolves', async () => {
    failures = 2;
    const render = await loadMathRenderer();
    expect(render('x', false)).toBe('<math>x</math>');
    expect(imports).toBe(3);
    expect(gaveUp).toHaveLength(0);
  });

  it('shares ONE schedule between every caller on the page', async () => {
    failures = 1;
    const all = await Promise.all([loadMathRenderer(), loadMathRenderer(), loadMathRenderer()]);
    expect(new Set(all).size).toBe(1);
    // Two tries in all, not two per caller: twenty equations must not each
    // run their own retries.
    expect(imports).toBe(2);
  });

  it('gives up after the last delay: one more try than delays, then the failure goes to the app, unclaimed', async () => {
    failures = 99;
    await expect(loadMathRenderer()).rejects.toThrow('chunk failed to load');
    expect(imports).toBe(4);
    expect(gaveUp).toHaveLength(1);
    expect(isChunkFailureClaimed(gaveUp[0]), 'handed back for the Refresh notice').toBe(false);
  });

  it('a call after giving up starts a fresh schedule', async () => {
    failures = 4;
    await expect(loadMathRenderer()).rejects.toThrow();
    const render = await loadMathRenderer();
    expect(render('y', true)).toBe('<math>y</math>');
    expect(imports).toBe(5);
  });
});

describe('whenMathReady', () => {
  it('renders once the shared load has succeeded', async () => {
    failures = 2;
    const ready = vi.fn();
    cancels.push(whenMathReady(ready));
    await vi.waitFor(() => expect(ready).toHaveBeenCalledTimes(1));
  });

  it('a failed load leaves the LaTeX, with no unhandled rejection', async () => {
    failures = 99;
    const ready = vi.fn();
    cancels.push(whenMathReady(ready));
    await pause(40);
    expect(ready).not.toHaveBeenCalled();
  });

  it('a cancelled wait does not render', async () => {
    failures = 1;
    const ready = vi.fn();
    const cancel = whenMathReady(ready);
    cancel();
    await pause(40);
    expect(ready).not.toHaveBeenCalled();
  });
});
