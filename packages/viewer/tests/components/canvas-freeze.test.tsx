// @vitest-environment jsdom
// =============================================================================
// canvas-freeze.test.tsx — a frozen section freezes its boards (2026-11-26)
// -----------------------------------------------------------------------------
// A locked or DoL-frozen section is a `<fieldset disabled>`, which stops every
// form control. A graph, a number line and a data plot are not form controls:
// their boards kept taking pointer and keyboard input after "Check and lock",
// so the screen, the saved buffer and the "N answered" count could all drift
// from what the server had graded. `setLocked` existed on the kit and on the
// seam, and nothing called it.
//
// One row per canvas block: locked at mount when the section is already frozen
// (and only AFTER the saved work is restored), locked when it freezes later,
// released when it thaws.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
  setDataPlotSurface,
  setGraphSurface,
  setNumberLineSurface,
} from '../../src/index.js';
import { SectionFrozenContext } from '../../src/container/context.js';
import InteractiveGraph from '../../src/blocks/InteractiveGraph.js';
import NumberLine from '../../src/blocks/NumberLine.js';
import DataPlot from '../../src/blocks/DataPlot.js';
import { sanitizedVariantFixtures } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const variantOf = (type: 'interactive_graph' | 'number_line' | 'data_plot', interaction: string) =>
  sanitizedVariantFixtures(type).find(
    (b) => (b as unknown as { interaction: { type: string } }).interaction.type === interaction,
  )! as unknown as { id: string };

/** A surface that records, in order, every restore and lock it is asked for. */
function recordingSurface() {
  const log: string[] = [];
  const surface = vi.fn(async () => ({
    getResponse: () => ({ points: [], answered: false }),
    restore: () => log.push('restore'),
    setLocked: (locked: boolean) => log.push(locked ? 'lock' : 'unlock'),
    destroy: () => {},
  }));
  return { surface, log };
}

const CASES = [
  {
    name: 'interactive_graph',
    Component: InteractiveGraph,
    block: variantOf('interactive_graph', 'plot_point'),
    install: (s: unknown) => setGraphSurface(s as never),
  },
  {
    name: 'number_line',
    Component: NumberLine,
    block: variantOf('number_line', 'plot_point'),
    install: (s: unknown) => setNumberLineSurface(s as never),
  },
  {
    name: 'data_plot',
    Component: DataPlot,
    block: variantOf('data_plot', 'build_dotplot'),
    install: (s: unknown) => setDataPlotSurface(s as never),
  },
] as const;

function tree(Component: (typeof CASES)[number]['Component'], block: { id: string }, frozen: boolean, seeded: boolean) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
    checkService: createMockCheckService(),
  });
  if (seeded) store.setGraphWork(block.id, { interaction: 'seeded', points: [[1, 2]] });
  const ui = (isFrozen: boolean) => (
    <ViewerProvider store={store} defaultSectionId="sec-1">
      <SectionFrozenContext.Provider value={isFrozen}>
        <Component block={block as never} mode="screen" />
      </SectionFrozenContext.Provider>
    </ViewerProvider>
  );
  const utils = render(ui(frozen));
  return { rerender: (isFrozen: boolean) => utils.rerender(ui(isFrozen)) };
}

afterEach(() => {
  setGraphSurface(null);
  setNumberLineSurface(null);
  setDataPlotSurface(null);
});

describe.each(CASES)('$name in a frozen section', ({ Component, block, install }) => {
  it('mounts locked, after the saved work is restored', async () => {
    const fake = recordingSurface();
    install(fake.surface);
    tree(Component, block, true, true);
    await waitFor(() => expect(fake.log).toContain('lock'));
    expect(fake.log.indexOf('restore')).toBeGreaterThanOrEqual(0);
    expect(fake.log.indexOf('restore')).toBeLessThan(fake.log.indexOf('lock'));
  });

  it('is not locked while the section is open', async () => {
    const fake = recordingSurface();
    install(fake.surface);
    // Seeded, so the mount's own continuation is observable: once 'restore' is
    // in the log, the line that would lock has run and chose not to.
    tree(Component, block, false, true);
    await waitFor(() => expect(fake.log).toContain('restore'));
    expect(fake.log).not.toContain('lock');
  });

  it('locks when the section freezes, and releases when it thaws', async () => {
    const fake = recordingSurface();
    install(fake.surface);
    const view = tree(Component, block, false, false);
    await waitFor(() => expect(fake.surface).toHaveBeenCalled());
    await Promise.resolve();

    view.rerender(true);
    await waitFor(() => expect(fake.log[fake.log.length - 1]).toBe('lock'));
    view.rerender(false);
    await waitFor(() => expect(fake.log[fake.log.length - 1]).toBe('unlock'));
  });
});
