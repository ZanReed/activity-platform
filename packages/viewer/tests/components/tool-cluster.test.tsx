// =============================================================================
// tool-cluster.test.tsx — the summonable calculator's logic and failure paths
// -----------------------------------------------------------------------------
// The guard bar for this slice (plan §"The guard bar"): asserting that a summon
// button EXISTS is not sufficient — a button is what the dead runtime had. What
// must be asserted is that clicking it puts a usable panel on screen, that an
// activity WITHOUT the flag renders no button at all, and that the two states
// nobody could reach before this slice — a pending load and a REJECTED one —
// resolve into something a student can act on.
//
// Every assertion binds to RENDERED OUTPUT. The fake surface below is not a spy
// that records calls; it appends a real panel element into the real mount, so
// the tests read the DOM the student would see. That is what makes the
// mutation check meaningful: revert a piece of the wiring and these go red for
// the reason a student would notice, not because a mock counter moved.
//
// Split ruled at D12: jsdom owns the logic and the failure paths (here); the
// browser lane owns geometry and the real kit mount (the <480px sheet, focus
// return under a real focus manager). jsdom cannot mount MathLive or JSXGraph,
// which is precisely why the seam is injectable.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToolCluster, setCalculatorSurface } from '../../src/index.js';
import type { CalculatorSurface, CalculatorSurfaceHandle } from '../../src/index.js';

afterEach(() => {
  setCalculatorSurface(null);
});

/** A stand-in for the kit that behaves like it: it renders a panel into the
 * mount, reports its own open/close through onToggle (the kit self-closes via
 * × and Escape, which is how the button learns to come back), and keeps the
 * panel element alive across close() — the property C15 exists to protect. */
function fakeKit(options: { onDestroy?: () => void } = {}) {
  const state = {
    mounts: 0,
    destroys: 0,
    restrictions: undefined as unknown,
    /** Set by the test to stand in for the student's typed expression. */
    panel: null as HTMLElement | null,
    close: (() => {}) as () => void,
  };
  const surface: CalculatorSurface = async (mount, restrictions, hooks) => {
    state.mounts += 1;
    state.restrictions = restrictions;
    const panel = document.createElement('div');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Calculator');
    panel.dataset.testid = 'fake-panel';
    mount.appendChild(panel);
    state.panel = panel;
    let open = true;
    const setOpen = (v: boolean): void => {
      open = v;
      panel.hidden = !v;
      hooks.onToggle?.(v);
    };
    const handle: CalculatorSurfaceHandle = {
      get isOpen() {
        return open;
      },
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen(!open),
      destroy: () => {
        state.destroys += 1;
        panel.remove();
        state.panel = null;
        options.onDestroy?.();
      },
    };
    state.close = () => setOpen(false);
    hooks.onToggle?.(true);
    return handle;
  };
  return { surface, state };
}

const ON = { enabled: true, restrictions: { mode: 'graphing' as const } };

describe('ToolCluster — gating', () => {
  it('renders NOTHING when the activity has no calculator', () => {
    const { container } = render(<ToolCluster />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders NOTHING when a calculator exists but is disabled', () => {
    // The stored-but-off case, which is what an untouched activity looks like:
    // `enabled: false` is the schema default, so a hidden-but-present button
    // here would put a calculator on every worksheet in the platform.
    const { container } = render(
      <ToolCluster calculator={{ enabled: false, restrictions: {} }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders exactly one summon button when the calculator is enabled', () => {
    render(<ToolCluster calculator={ON} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Calculator' })).toBeInTheDocument();
  });
});

describe('ToolCluster — summon', () => {
  it('mounts a usable panel on click and hides the summon behind it', async () => {
    const { surface, state } = fakeKit();
    setCalculatorSurface(surface);
    render(<ToolCluster calculator={ON} />);

    // Before the click: a button, and NO panel. The whole point of summon-on-
    // click is that a document with a calculator available ships no kit until
    // a student asks for one.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Calculator' }));

    const panel = await screen.findByRole('dialog', { name: 'Calculator' });
    expect(panel).toBeVisible();
    // The summon and the panel share the corner, so the button goes away while
    // the tool is up (DECISIONS.md:195, inherited).
    expect(screen.queryByRole('button', { name: 'Calculator' })).not.toBeInTheDocument();
    expect(state.mounts).toBe(1);
  });

  it("hands the teacher's restrictions to the kit verbatim", async () => {
    const { surface, state } = fakeKit();
    setCalculatorSurface(surface);
    const restrictions = { mode: 'graphing', allowTrig: false, maxExpressions: 3 };
    render(<ToolCluster calculator={{ enabled: true, restrictions }} />);

    fireEvent.click(screen.getByRole('button'));
    await screen.findByRole('dialog');
    // A restriction that does not reach the kit is a teacher's setting that
    // silently does nothing — this repo's signature defect, one level down.
    expect(state.restrictions).toEqual(restrictions);
  });

  it('brings the summon back, focused, when the kit self-closes', async () => {
    const { surface, state } = fakeKit();
    setCalculatorSurface(surface);
    render(<ToolCluster calculator={ON} />);

    fireEvent.click(screen.getByRole('button'));
    await screen.findByRole('dialog');

    // × or Escape — the kit closes itself and reports it.
    act(() => state.close());

    const button = await screen.findByRole('button', { name: 'Calculator' });
    // Focus must land back on the summon: without this, focus is stranded on a
    // hidden panel and the next Tab restarts at the top of the worksheet.
    await waitFor(() => expect(button).toHaveFocus());
  });
});

describe('ToolCluster — put away vs tear down (C15)', () => {
  it('CLOSES rather than destroys, so the expression survives a reopen', async () => {
    const { surface, state } = fakeKit();
    setCalculatorSurface(surface);
    render(<ToolCluster calculator={ON} />);

    fireEvent.click(screen.getByRole('button'));
    await screen.findByRole('dialog');

    // Stand in for the student's in-progress work. A destroy() would take the
    // MathLive fields — and this text — with it.
    state.panel!.dataset.expression = '2+2';

    act(() => state.close());
    await screen.findByRole('button', { name: 'Calculator' });
    fireEvent.click(screen.getByRole('button', { name: 'Calculator' }));

    const panel = await screen.findByRole('dialog');
    expect(panel.dataset.expression).toBe('2+2');
    // Re-opened the SAME panel; never built a second one.
    expect(state.mounts).toBe(1);
    expect(state.destroys).toBe(0);
  });

  it('destroys on unmount — the one place destroy belongs', async () => {
    const { surface, state } = fakeKit();
    setCalculatorSurface(surface);
    const { unmount } = render(<ToolCluster calculator={ON} />);

    fireEvent.click(screen.getByRole('button'));
    await screen.findByRole('dialog');
    unmount();

    expect(state.destroys).toBe(1);
    expect(document.querySelector('[data-testid="fake-panel"]')).toBeNull();
  });
});

describe('ToolCluster — the two states nobody could reach before', () => {
  it('shows a pending summon and refuses a second import while loading', async () => {
    // ~515 KiB gz on first click (MathLive + JSXGraph): on school wifi this is
    // the NORMAL path, not a slow-connection edge case.
    let resolveMount: (() => void) | undefined;
    const gate = new Promise<void>((r) => {
      resolveMount = r;
    });
    const { surface, state } = fakeKit();
    let mounts = 0;
    setCalculatorSurface(async (mount, restrictions, hooks) => {
      mounts += 1;
      await gate;
      return surface(mount, restrictions, hooks);
    });
    render(<ToolCluster calculator={ON} />);

    fireEvent.click(screen.getByRole('button'));

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    // Focusable, NOT disabled: disabling blurs a keyboard user out of the
    // corner mid-interaction.
    expect(button).not.toBeDisabled();

    // An impatient second click must not start a second 515 KiB import.
    fireEvent.click(button);
    expect(mounts).toBe(1);

    resolveMount!();
    await screen.findByRole('dialog');
    expect(state.mounts).toBe(1);
  });

  it('recovers from a failed load: message, button back, still retryable', async () => {
    // Offline, or a chunk 404 after a deploy. Before this slice the awaited
    // import had NO catch in any caller, so this rejected unhandled and the
    // pending state ran forever.
    let attempt = 0;
    const { surface, state } = fakeKit();
    setCalculatorSurface(async (mount, restrictions, hooks) => {
      attempt += 1;
      if (attempt === 1) throw new Error('Failed to fetch dynamically imported module');
      return surface(mount, restrictions, hooks);
    });
    render(<ToolCluster calculator={ON} />);

    fireEvent.click(screen.getByRole('button'));

    const note = await screen.findByRole('status');
    expect(note).toHaveTextContent(/unavailable offline/i);
    const button = await screen.findByRole('button', { name: 'Calculator' });
    expect(button).not.toHaveAttribute('aria-busy');
    await waitFor(() => expect(button).toHaveFocus());

    // Retryable — the connection may come back, and the worksheet around it was
    // never affected.
    fireEvent.click(button);
    await screen.findByRole('dialog');
    expect(state.mounts).toBe(1);
  });

  it('destroys a handle that resolves after unmount instead of leaking it', async () => {
    let resolveMount: (() => void) | undefined;
    const gate = new Promise<void>((r) => {
      resolveMount = r;
    });
    const { surface, state } = fakeKit();
    setCalculatorSurface(async (mount, restrictions, hooks) => {
      await gate;
      return surface(mount, restrictions, hooks);
    });
    const { unmount } = render(<ToolCluster calculator={ON} />);

    fireEvent.click(screen.getByRole('button'));
    unmount(); // student navigated away mid-load
    resolveMount!();
    await vi.waitFor(() => expect(state.destroys).toBe(1));

    // Nothing installed into a component that no longer exists, and no orphan
    // panel left in the document.
    expect(document.querySelector('[data-testid="fake-panel"]')).toBeNull();
  });
});
