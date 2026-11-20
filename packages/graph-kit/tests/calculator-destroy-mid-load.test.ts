/**
 * @vitest-environment jsdom
 */
// =============================================================================
// calculator-destroy-mid-load.test.ts — destroy() before the board chunk lands
// -----------------------------------------------------------------------------
// The graphing calculator returns its handle BEFORE `import('./board.js')`
// resolves, so its caller cancels explicitly with destroy() (the editor
// drawer's remount on a restriction change, StrictMode's mount→cleanup→mount,
// the viewer's ToolCluster unmounting). That used to reach JSXGraph with the
// panel already removed and log "Calculator board failed to load … HTML
// container element 'gk-board-N' not found" on every remount. A destroyed
// calculator now stops quietly; one detached WITHOUT destroy() still reports.
//
// MathLive's custom element does not load under jsdom, so `mathlive` is
// replaced by an inert stand-in — the board race under test never touches it.
// =============================================================================
import { describe, expect, it, vi } from 'vitest';

vi.mock('mathlive', () => {
  class MathfieldElement extends HTMLElement {
    static fontsDirectory: string | null = null;
    static soundsDirectory: string | null = null;
    value = '';
    getValue(): string {
      return this.value;
    }
    setValue(v: string): void {
      this.value = v;
    }
    executeCommand(): boolean {
      return true;
    }
    insert(): boolean {
      return true;
    }
  }
  if (!customElements.get('math-field')) customElements.define('math-field', MathfieldElement);
  return { MathfieldElement };
});

const { mountCalculator } = await import('../src/calculator.js');
const { JSXGraph } = await import('jsxgraph');

interface Race {
  /** The calculator's own "failed to load" reports. */
  failures: unknown[][];
  /** How many times the board layer reached JSXGraph.initBoard. */
  initBoardCalls: number;
}

/** Mount a graphing calculator, optionally destroy it, detach it, let board.js land. */
async function raceBoardLoad(destroyFirst: boolean): Promise<Race> {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const errors: unknown[][] = [];
  const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errors.push(args);
  });
  const init = vi.spyOn(JSXGraph, 'initBoard');
  try {
    const handle = mountCalculator(el, { mode: 'graphing' });
    if (destroyFirst) handle.destroy(); // the caller's cleanup, before board.js resolves
    else el.remove(); // detached with NO destroy: a genuine failure
    await import('../src/board.js'); // the chunk the calculator is waiting on
    await new Promise((r) => setTimeout(r, 0)); // its .then / .catch
  } finally {
    spy.mockRestore();
  }
  const initBoardCalls = init.mock.calls.length;
  init.mockRestore();
  return {
    failures: errors.filter((a) => String(a[0]).includes('Calculator board failed to load')),
    initBoardCalls,
  };
}

describe('the graphing calculator and its lazy board', () => {
  it('destroyed mid-load: never reaches JSXGraph and logs nothing', async () => {
    const race = await raceBoardLoad(true);
    expect(race.initBoardCalls).toBe(0);
    expect(race.failures).toEqual([]);
  });

  it('detached mid-load WITHOUT destroy: still reports the failure', async () => {
    // The other half of the contract: the guard is the caller's explicit
    // cancellation, not "the panel is not in the document", so a real failure
    // to build the board is never silenced.
    const race = await raceBoardLoad(false);
    expect(race.initBoardCalls).toBe(1);
    expect(race.failures).toHaveLength(1);
  });
});
