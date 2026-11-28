// @vitest-environment jsdom
// =============================================================================
// retryable-chunk.test.ts — fetch a failed lazy chunk again under a NEW url
// -----------------------------------------------------------------------------
// The browser half of this (a failed URL is refused without a request, in
// Chromium AND WebKit) cannot happen here; app/e2e/sw/math-chunk.e2e.ts proves
// it against the production build. What is pinned here is the logic around it:
// where the URL comes from, that a retry never re-asks for the failed URL, the
// stylesheet path that Vite's own retry gets wrong, and the claim.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CHUNK_FAILURE_CLAIMED,
  claimChunkFailure,
  isChunkFailureClaimed,
  reportChunkGaveUp,
  retryUrl,
  retryableModule,
  retryableStylesheet,
  specifierInSource,
  urlInError,
  withRetrySchedule,
} from '../src/lazy/retryableChunk.js';

const BASE = 'https://app.test/assets/index-abc.js';

/** An importer whose SOURCE is what the production build writes (copied from
 * dist/assets/index-*.js, 2026-11-28), and which fails like a dropped request. */
function builtImporter(result: () => Promise<unknown>) {
  const importer = () => result();
  importer.toString = () => '()=>Z(()=>import("./katex-DkKDou_j.js"),[])';
  return importer;
}

describe('where the retry URL comes from', () => {
  it('reads the one specifier the bundler wrote into the importer', () => {
    expect(specifierInSource('()=>Z(()=>import("./katex-DkKDou_j.js"),[])')).toBe('./katex-DkKDou_j.js');
    // Vite's dev server writes an absolute path; that works the same way.
    expect(specifierInSource('() => import("/node_modules/.vite/deps/katex.js?v=1a2b")')).toBe(
      '/node_modules/.vite/deps/katex.js?v=1a2b',
    );
  });

  it('refuses a bare package name and an ambiguous source', () => {
    expect(specifierInSource("() => import('katex')")).toBeNull();
    expect(specifierInSource('() => Promise.all([import("./a.js"), import("./b.js")])')).toBeNull();
    expect(specifierInSource('() => __vi_ssr_dynamic_import__("katex")')).toBeNull();
  });

  it('refuses a widget folded into a shared chunk: its namespace is not the module (build shapes, 2026-11-28)', () => {
    // Copied from dist/assets/index-*.js. A native import of that URL would
    // return the shared chunk, without the `.D` that is the real module.
    expect(specifierInSource('()=>Z(()=>import("./graph-question-DEAPcdm6.js").then(n=>n.D),__vite__mapDeps([1,2]))')).toBeNull();
    expect(specifierInSource('()=>Z(()=>import("./number-line-question-DK5N8aiC.js").then(n=>n.n),__vite__mapDeps([3]))')).toBeNull();
    // The plain ones keep their retry.
    expect(specifierInSource('()=>Z(()=>import("./data-plot-question-D3wN_sQ1.js"),__vite__mapDeps([4]))')).toBe(
      './data-plot-question-D3wN_sQ1.js',
    );
    expect(specifierInSource('()=>Z(()=>import("./calculator-Uj2nsuxZ.js"),__vite__mapDeps([5]))')).toBe(
      './calculator-Uj2nsuxZ.js',
    );
  });

  it("reads Chromium's and Vite's error messages, and gets nothing from WebKit's", () => {
    expect(
      urlInError(new TypeError('Failed to fetch dynamically imported module: http://localhost:5175/assets/katex-DkKDou_j.js')),
    ).toBe('http://localhost:5175/assets/katex-DkKDou_j.js');
    expect(urlInError(new Error('Unable to preload CSS for /assets/katex-CfVKi3_s.css'))).toBe(
      '/assets/katex-CfVKi3_s.css',
    );
    // Measured in WebKit 2026-11-28: no URL at all. Hence the importer source.
    expect(urlInError(new TypeError('Importing a module script failed.'))).toBeNull();
  });

  it('a retry URL is the same file with ?retry=n, other query kept', () => {
    expect(retryUrl('https://app.test/assets/katex-x.js', 1)).toBe('https://app.test/assets/katex-x.js?retry=1');
    expect(retryUrl('/assets/katex-x.css', 2, 'https://app.test/a/1')).toBe('https://app.test/assets/katex-x.css?retry=2');
    expect(retryUrl('https://app.test/deps/katex.js?v=9', 3)).toBe('https://app.test/deps/katex.js?v=9&retry=3');
  });
});

describe('retryableModule', () => {
  it('after a failure, asks for the chunk under a new URL each time, never the failed one again', async () => {
    let calls = 0;
    const importer = builtImporter(() => {
      calls += 1;
      return Promise.reject(new TypeError('Importing a module script failed.'));
    });
    const importUrl = vi.fn((url: string) =>
      url.endsWith('retry=2') ? Promise.resolve({ ok: url }) : Promise.reject(new TypeError('again')),
    );
    const load = retryableModule(importer, BASE, { importUrl });

    await expect(load()).rejects.toThrow();
    await expect(load()).rejects.toThrow('again');
    await expect(load()).resolves.toEqual({ ok: 'https://app.test/assets/katex-DkKDou_j.js?retry=2' });
    // The bundler's import ran once; every later try was a new URL.
    expect(calls).toBe(1);
    expect(importUrl.mock.calls.map(([u]) => u)).toEqual([
      'https://app.test/assets/katex-DkKDou_j.js?retry=1',
      'https://app.test/assets/katex-DkKDou_j.js?retry=2',
    ]);
    // A success is kept.
    await load();
    expect(importUrl).toHaveBeenCalledTimes(2);
  });

  it("falls back to the error's URL when the source names none", async () => {
    const importer = () =>
      Promise.reject(new TypeError('Failed to fetch dynamically imported module: https://app.test/assets/x-1.js'));
    const importUrl = vi.fn(() => Promise.resolve('mod'));
    const load = retryableModule(importer, BASE, { importUrl });
    await expect(load()).rejects.toThrow();
    await load();
    expect(importUrl).toHaveBeenCalledWith('https://app.test/assets/x-1.js?retry=1');
  });

  it('with no URL anywhere, calls the importer again (the old behaviour, no worse)', async () => {
    let calls = 0;
    const importer = () => (calls++ === 0 ? Promise.reject(new TypeError('Importing a module script failed.')) : Promise.resolve('m'));
    const importUrl = vi.fn();
    const load = retryableModule(importer, BASE, { importUrl });
    await expect(load()).rejects.toThrow();
    await expect(load()).resolves.toBe('m');
    expect(importUrl).not.toHaveBeenCalled();
  });

  it('shares one request between concurrent callers', async () => {
    let calls = 0;
    const load = retryableModule(() => {
      calls += 1;
      return Promise.resolve('m');
    }, BASE);
    await Promise.all([load(), load(), load()]);
    expect(calls).toBe(1);
  });
});

describe('retryableStylesheet', () => {
  it("after Vite's failed <link>, attaches a fresh one under a new URL", async () => {
    const importer = vi.fn(() => Promise.reject(new Error('Unable to preload CSS for /assets/katex-CfVKi3_s.css')));
    const attach = vi.fn(() => Promise.resolve());
    const load = retryableStylesheet(importer, { attach });
    await expect(load()).rejects.toThrow();
    await load();
    // Not Vite's importer again: it would find the failed <link> by its href
    // and report success with no styles.
    expect(importer).toHaveBeenCalledTimes(1);
    expect(attach).toHaveBeenCalledWith(`${location.origin}/assets/katex-CfVKi3_s.css?retry=1`);
    await load();
    expect(attach).toHaveBeenCalledTimes(1);
  });

  it('the real attach removes a <link> that failed, so a later try adds its own', async () => {
    const load = retryableStylesheet(() => Promise.reject(new Error('Unable to preload CSS for /assets/k.css')));
    await expect(load()).rejects.toThrow();
    const second = load();
    const link = document.head.querySelector<HTMLLinkElement>('link[href$="k.css?retry=1"]');
    expect(link).not.toBeNull();
    link!.dispatchEvent(new Event('error'));
    await expect(second).rejects.toThrow('Unable to load stylesheet');
    expect(document.head.querySelector('link[href$="k.css?retry=1"]')).toBeNull();
    const third = load();
    const next = document.head.querySelector<HTMLLinkElement>('link[href$="k.css?retry=2"]');
    next!.dispatchEvent(new Event('load'));
    await expect(third).resolves.toBeUndefined();
    next!.remove();
  });
});

describe('the claim and the schedule', () => {
  afterEach(() => vi.useRealTimers());

  it('a claimed failure carries the shared mark; giving up clears it and raises vite:preloadError', () => {
    const error = new Error('x');
    claimChunkFailure(error);
    expect(isChunkFailureClaimed(error)).toBe(true);
    expect((error as unknown as Record<symbol, unknown>)[Symbol.for('activity:chunk-failure-claimed')]).toBe(true);
    expect(CHUNK_FAILURE_CLAIMED).toBe(Symbol.for('activity:chunk-failure-claimed'));

    const seen: unknown[] = [];
    const listener = (event: Event) => seen.push((event as Event & { payload?: unknown }).payload);
    window.addEventListener('vite:preloadError', listener);
    reportChunkGaveUp(error);
    window.removeEventListener('vite:preloadError', listener);
    expect(seen).toEqual([error]);
    expect(isChunkFailureClaimed(error)).toBe(false);
  });

  it('claims a failure BEFORE the next task, which is when the app reads it', async () => {
    const error = new Error('dropped');
    const schedule = withRetrySchedule(() => Promise.reject(error), () => [50]);
    const running = schedule();
    // What the app's recovery does with Vite's event: look one task later.
    const readLater = await new Promise<boolean>((r) => setTimeout(() => r(isChunkFailureClaimed(error)), 0));
    expect(readLater).toBe(true);
    await expect(running).rejects.toBe(error);
  });

  it('is bounded: one try plus one per delay, then it stops and hands the failure back', async () => {
    vi.useFakeTimers();
    let tries = 0;
    const gaveUp = vi.fn();
    window.addEventListener('vite:preloadError', gaveUp);
    const schedule = withRetrySchedule(() => {
      tries += 1;
      return Promise.reject(new Error(`try ${tries}`));
    }, () => [2000, 5000, 15000]);
    const running = schedule();
    running.catch(() => {});
    await vi.advanceTimersByTimeAsync(2000 + 5000 + 15000 + 60_000);
    await expect(running).rejects.toThrow('try 4');
    expect(tries).toBe(4);
    expect(gaveUp).toHaveBeenCalledTimes(1);
    window.removeEventListener('vite:preloadError', gaveUp);
  });
});
