// =============================================================================
// math-retry.test.ts — a failed math load is tried again (2026-11-26)
// -----------------------------------------------------------------------------
// `loadMathRenderer` kept its promise in `loading ??= …`, so a load that FAILED
// was remembered for the life of the page: one dropped request on school Wi-Fi
// left every equation as raw LaTeX until a manual reload. The callers also had
// no catch. Two things are pinned here: the loader forgets a failure, and
// `whenMathReady` asks again by itself and stops when cancelled.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let failures = 0;
let imports = 0;

vi.mock('katex/dist/katex.min.css', () => ({}));
vi.mock('katex', () => ({
  get default() {
    imports += 1;
    if (failures > 0) {
      failures -= 1;
      throw new Error('chunk failed to load');
    }
    return { renderToString: (tex: string) => `<math>${tex}</math>` };
  },
}));

const { loadMathRenderer, setMathRenderer, whenMathReady } = await import('../src/inline/math.js');

const cancels: Array<() => void> = [];
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

beforeEach(() => {
  setMathRenderer(null);
  failures = 0;
  imports = 0;
});
afterEach(() => {
  // No wait from one case may fire inside the next.
  for (const cancel of cancels.splice(0)) cancel();
});

describe('loadMathRenderer', () => {
  it('forgets a failed load, so the next call tries again and can succeed', async () => {
    failures = 1;
    await expect(loadMathRenderer()).rejects.toThrow('chunk failed to load');
    const render = await loadMathRenderer();
    expect(render('x', false)).toBe('<math>x</math>');
    expect(imports).toBe(2);
  });

  it('shares one in-flight load between callers', async () => {
    const [a, b] = await Promise.all([loadMathRenderer(), loadMathRenderer()]);
    expect(a).toBe(b);
    expect(imports).toBe(1);
  });
});

describe('whenMathReady', () => {
  it('tries again after a failure and then renders', async () => {
    failures = 2;
    const ready = vi.fn();
    cancels.push(whenMathReady(ready, [1, 1, 1]));
    await vi.waitFor(() => expect(ready).toHaveBeenCalledTimes(1));
    expect(imports).toBe(3);
  });

  it('gives up after the last delay, with no unhandled rejection', async () => {
    failures = 99;
    const ready = vi.fn();
    cancels.push(whenMathReady(ready, [1]));
    await pause(40);
    expect(ready).not.toHaveBeenCalled();
    expect(imports).toBe(2);
  });

  it('a cancelled wait neither retries nor renders', async () => {
    failures = 1;
    const ready = vi.fn();
    const cancel = whenMathReady(ready, [5]);
    cancel();
    await pause(40);
    expect(ready).not.toHaveBeenCalled();
    expect(imports).toBe(1);
  });
});
