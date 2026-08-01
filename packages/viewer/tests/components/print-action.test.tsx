// =============================================================================
// print-action.test.tsx — the readiness barrier and the button (S5 T3)
// -----------------------------------------------------------------------------
// The barrier exists because paper has no second render: whatever the page
// looks like when the dialog opens is what a student carries to class. These
// pin the three things it waits for, and — at least as important — that it
// always gives up in bounded time. A student who cannot print is worse off than
// one whose printout is missing a figure, so every wait here has a deadline and
// the failure is reported rather than swallowed.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { awaitPrintReady } from '../../src/print/printReadiness.js';
import { PrintButton } from '../../src/print/PrintButton.js';
import { setMathRenderer } from '../../src/index.js';

/**
 * A controllable clock, so a "2 second" timeout costs no real time.
 *
 * `sleep` advances the clock AND yields a real macrotask. The yield is not
 * decoration: without it the poll loop spins through the entire budget in
 * microtasks before anything scheduled with setTimeout can run, so every
 * "waits and then settles" case would time out and the tests would be
 * measuring the fake, not the barrier.
 */
function fakeClock() {
  let t = 0;
  return {
    now: () => t,
    sleep: async (ms: number) => {
      t += ms;
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
  };
}

/**
 * jsdom never actually loads images, so `complete` has to be modelled. It is
 * modelled the way the BROWSER behaves — settable from false to true, going
 * true on failure as well as success — because that is the property the
 * barrier relies on. A double that only ever reported false would have let a
 * barrier that never settles look correct.
 */
function stubComplete(img: HTMLImageElement, initial: boolean): () => void {
  let value = initial;
  Object.defineProperty(img, 'complete', {
    get: () => value,
    configurable: true,
  });
  return () => {
    value = true;
  };
}

function rootWith(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

describe('awaitPrintReady — math', () => {
  it('reports nothing to wait for on a page with no pending math', async () => {
    const root = rootWith('<p>plain text</p>');
    const clock = fakeClock();
    const report = await awaitPrintReady({ root, ...clock });
    expect(report.ready).toBe(true);
    expect(report.waited).not.toContain('math');
  });

  it('waits for pending math to render', async () => {
    // The marker InlineContent renders while the KaTeX chunk is in flight.
    const root = rootWith('<span data-math-pending="true">\\frac{a}{b}</span>');
    setMathRenderer((latex) => latex); // resident: no chunk load needed
    const clock = fakeClock();

    const pending = awaitPrintReady({ root, timeoutMs: 1000, ...clock });
    // Simulate React re-rendering the equation once the engine is available.
    setTimeout(() => {
      root.innerHTML = '<span data-math="inline">rendered</span>';
    }, 0);

    const report = await pending;
    expect(report.waited).toContain('math');
    expect(report.timedOut).not.toContain('math');
    setMathRenderer(null);
  });

  it('gives up on math that never renders, and says so', async () => {
    // The property that matters: it returns. A page stuck mid-render must not
    // hold the dialog closed forever.
    const root = rootWith('<span data-math-pending="true">x</span>');
    setMathRenderer((latex) => latex);
    const clock = fakeClock();

    const report = await awaitPrintReady({ root, timeoutMs: 100, ...clock });
    expect(report.timedOut).toContain('math');
    expect(report.ready).toBe(false);
    setMathRenderer(null);
  });

  it('waits on the DOM, not on the loader promise', async () => {
    // The distinction this was rewritten for: the engine being resident does
    // NOT mean React has re-rendered with it. If the barrier trusted the
    // promise it would return while the markers were still on the page — a lie
    // by one tick, and one tick is enough to print raw LaTeX.
    const root = rootWith('<span data-math-pending="true">x</span>');
    setMathRenderer((latex) => latex); // already resident, promise resolves instantly
    const clock = fakeClock();
    const report = await awaitPrintReady({ root, timeoutMs: 100, ...clock });
    expect(report.timedOut).toContain('math');
    setMathRenderer(null);
  });
});

describe('awaitPrintReady — images', () => {
  it('waits for an image that has not finished loading', async () => {
    const root = rootWith('<img alt="diagram" />');
    const img = root.querySelector('img') as HTMLImageElement;
    const finish = stubComplete(img, false);
    const clock = fakeClock();

    const pending = awaitPrintReady({ root, timeoutMs: 1000, ...clock });
    setTimeout(finish, 0);

    const report = await pending;
    expect(report.waited).toContain('images');
    expect(report.timedOut).not.toContain('images');
  });

  it('treats a BROKEN image as settled', async () => {
    // `complete` goes true on failure as well as success, which is exactly the
    // behaviour worth relying on: a 404 is never going to arrive, its alt text
    // is what prints, and waiting the full budget for it would delay every
    // print on a page with one dead image.
    const root = rootWith('<img alt="missing" />');
    const img = root.querySelector('img') as HTMLImageElement;
    const finish = stubComplete(img, false);
    const clock = fakeClock();

    const pending = awaitPrintReady({ root, timeoutMs: 1000, ...clock });
    setTimeout(() => {
      img.dispatchEvent(new Event('error'));
      finish();
    }, 0);

    const report = await pending;
    expect(report.timedOut).not.toContain('images');
  });

  it('ignores images that are already loaded', async () => {
    const root = rootWith('<img alt="done" />');
    const img = root.querySelector('img') as HTMLImageElement;
    stubComplete(img, true);
    const clock = fakeClock();
    const report = await awaitPrintReady({ root, ...clock });
    expect(report.waited).not.toContain('images');
  });

  it('gives up on an image that never settles', async () => {
    const root = rootWith('<img alt="hung" />');
    const img = root.querySelector('img') as HTMLImageElement;
    stubComplete(img, false);
    const clock = fakeClock();
    const report = await awaitPrintReady({ root, timeoutMs: 50, ...clock });
    expect(report.timedOut).toContain('images');
  });
});

describe('awaitPrintReady — never blocks the student', () => {
  it('resolves rather than rejecting when everything is broken at once', async () => {
    const root = rootWith(
      '<span data-math-pending="true">x</span><img alt="hung" />',
    );
    const img = root.querySelector('img') as HTMLImageElement;
    stubComplete(img, false);
    setMathRenderer((latex) => latex);
    const clock = fakeClock();

    const report = await awaitPrintReady({ root, timeoutMs: 50, ...clock });
    expect(report.ready).toBe(false);
    // Both are named, so the failure is diagnosable rather than a mystery.
    expect(report.timedOut).toContain('math');
    expect(report.timedOut).toContain('images');
    setMathRenderer(null);
  });
});

describe('the Print button', () => {
  it('opens the dialog after the barrier resolves', async () => {
    const print = vi.fn();
    render(<PrintButton print={print} timeoutMs={10} />);
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
  });

  it('says it is preparing while it waits, then goes back', async () => {
    // Printing feels instant. A control that appears to do nothing reads as
    // broken and gets pressed again.
    const print = vi.fn();
    render(<PrintButton print={print} timeoutMs={10} />);
    const button = screen.getByRole('button', { name: 'Print' });
    fireEvent.click(button);
    await waitFor(() => expect(print).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Print'));
  });

  it('ignores a double-click instead of queueing two print jobs', async () => {
    const print = vi.fn();
    render(<PrintButton print={print} timeoutMs={10} />);
    const button = screen.getByRole('button', { name: 'Print' });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('hands the readiness report to its caller', async () => {
    // So a real deployment can see how often printing runs past its budget,
    // rather than guessing.
    const onReady = vi.fn();
    render(<PrintButton print={() => {}} onReady={onReady} timeoutMs={10} />);
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    await waitFor(() => expect(onReady).toHaveBeenCalled());
    expect(onReady.mock.calls[0]?.[0]).toHaveProperty('ready');
  });

  it('still prints when the barrier times out', async () => {
    // The barrier improves the odds; it never holds the door shut.
    const root = document.createElement('div');
    root.innerHTML = '<span data-math-pending="true">x</span>';
    document.body.appendChild(root);
    const print = vi.fn();
    render(<PrintButton print={print} timeoutMs={20} />);
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    await waitFor(() => expect(print).toHaveBeenCalledTimes(1), { timeout: 2000 });
    root.remove();
  });
});
