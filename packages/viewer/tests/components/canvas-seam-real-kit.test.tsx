// @vitest-environment jsdom
// =============================================================================
// canvas-seam-real-kit.test.tsx — the data-plot seam against the REAL kit
// -----------------------------------------------------------------------------
// Every other canvas test in this package drives a FAKE surface, which is how
// two defects sat in blocks/kitSurfaces.ts unseen (2026-11-26):
//
//   1. A box plot's answer never reached the grader. The kit reports its five
//      handles as an OBJECT; the seam read arrays only, stored [], and the
//      server called every box plot unanswered.
//   2. Restoring ANY data plot was a no-op: the seam handed the kit a number
//      list behind `as never` where it takes an object.
//
// The kit's data-plot boards are hand-drawn SVG (no JSXGraph), so they mount in
// jsdom. Each build variant goes: real kit → seam → the block's wire shape →
// the server grader, which is the whole path a student's answer travels.
// =============================================================================

import { afterEach, describe, expect, it } from 'vitest';
import { dataPlotSurface, setDataPlotSurface } from '../../src/index.js';
import { authoredVariantFixtures } from '../../src/fixtures/index.js';
import { gradeSection } from '../../src/server/grading/index.js';
import { emptySectionResponses } from '../../src/check/wire.js';

type Plot = {
  id: string;
  data: number[];
  config: unknown;
  interaction: { type: string };
};

const variant = (type: string): Plot =>
  authoredVariantFixtures('data_plot').find(
    (b) => (b as unknown as Plot).interaction.type === type,
  ) as unknown as Plot;

/** The right answer for each chart, computed here from the dataset the way a
 * student would: independent of both the kit's and the grader's own scoring. */
function rightAnswer(block: Plot): number[] {
  const data = [...block.data].sort((a, b) => a - b);
  const type = block.interaction.type;
  if (type === 'build_dotplot') return data;
  if (type === 'build_histogram') {
    const c = block.config as { min: number; max: number; binWidth?: number; tickStep?: number };
    const width = c.binWidth ?? c.tickStep ?? 1;
    const bins: number[] = [];
    for (let lo = c.min; lo < c.max; lo += width) {
      const hi = lo + width;
      bins.push(data.filter((v) => v >= lo && (hi >= c.max ? v <= hi : v < hi)).length);
    }
    return bins;
  }
  const n = data.length;
  const mid = Math.floor(n / 2);
  const med = (a: number[]): number => {
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m]! : (a[m - 1]! + a[m]!) / 2;
  };
  const lower = data.slice(0, mid);
  const upper = n % 2 ? data.slice(mid + 1) : data.slice(mid);
  return [data[0]!, med(lower), med(data), med(upper), data[n - 1]!];
}

function gradeAlone(block: Plot, values: number[]) {
  const document = {
    sections: [{ id: 's1', rows: [{ columns: [{ blocks: [block] }] }] }],
  };
  return gradeSection({
    document: document as never,
    sectionId: 's1',
    responses: {
      ...emptySectionResponses(),
      graphs: {
        [block.id]: {
          interaction: block.interaction.type,
          // The wire shape blocks/DataPlot.tsx stores.
          points: values.map((v, i) => [i, v] as [number, number]),
        },
      },
    },
  }).items[block.id];
}

afterEach(() => {
  setDataPlotSurface(null);
  document.body.innerHTML = '';
});

describe.each(['build_dotplot', 'build_histogram', 'build_boxplot'])(
  'data_plot %s through the real kit',
  (type) => {
    it('what the kit reports reaches the grader, and a saved answer is restored', async () => {
      const block = variant(type);
      const host = document.createElement('div');
      document.body.appendChild(host);
      const seen: number[][] = [];

      const handle = await dataPlotSurface()(
        host,
        { interactionType: type, data: block.data, config: block.config },
        { onChange: (r) => seen.push(r.values) },
      );

      // A restore puts the saved answer on the board, and the board shows it.
      // If the restore were still a no-op, the board would show its defaults.
      // The restore reports NOTHING through onChange: the saved work is
      // already in the store, so an echo could only repeat or corrupt it.
      const answer = rightAnswer(block);
      handle.restore(answer);
      expect(seen, 'a restore writes nothing back').toEqual([]);
      const reported = handle.getResponse().values;
      expect(reported.length, 'the seam kept the values').toBeGreaterThan(0);

      expect(gradeAlone(block, reported)?.verdict).toBe('correct');
      handle.destroy();
    });
  },
);

describe('build_boxplot', () => {
  it('carries its five handles in min, Q1, median, Q3, max order', async () => {
    const block = variant('build_boxplot');
    const host = document.createElement('div');
    document.body.appendChild(host);
    const seen: number[][] = [];
    const handle = await dataPlotSurface()(
      host,
      { interactionType: 'build_boxplot', data: block.data, config: block.config },
      { onChange: (r) => seen.push(r.values) },
    );
    const answer = rightAnswer(block);
    handle.restore(answer);
    expect(handle.getResponse().values).toEqual(answer);
    handle.destroy();
  });

  it('restoring fewer than five saved values changes nothing', async () => {
    const block = variant('build_boxplot');
    const host = document.createElement('div');
    document.body.appendChild(host);
    const seen: number[][] = [];
    const handle = await dataPlotSurface()(
      host,
      { interactionType: 'build_boxplot', data: block.data, config: block.config },
      { onChange: (r) => seen.push(r.values) },
    );
    handle.restore([1, 2]);
    expect(seen).toEqual([]);
    handle.destroy();
  });
});

describe('moving the keyboard cursor is not an answer', () => {
  // Arrow keys on a histogram and Tab on a box plot move the active bin or
  // handle and report a change. The report says `answered: false`, and
  // blocks/DataPlot.tsx must not store it: the values are the board's default
  // positions, and stored they would be graded as a wrong answer.
  it.each([
    ['build_histogram', 'ArrowRight'],
    ['build_boxplot', 'Tab'],
  ])('%s: %s reports answered=false', async (type, key) => {
    const block = variant(type);
    const host = document.createElement('div');
    document.body.appendChild(host);
    const seen: Array<{ answered: boolean }> = [];
    const handle = await dataPlotSurface()(
      host,
      { interactionType: type, data: block.data, config: block.config },
      { onChange: (r) => seen.push(r) },
    );
    host.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    expect(seen.length, 'the cursor move was reported').toBeGreaterThan(0);
    expect(seen.every((r) => r.answered === false)).toBe(true);
    handle.destroy();
  });
});
