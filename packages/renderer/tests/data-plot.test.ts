import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  createDataPlotBlock,
  createSection,
  type ActivityDocument,
  type DataPlotBlock,
} from '@activity/schema';
import {
  renderActivity,
  renderBody,
  renderActivityForPrint,
  dotCounts,
  histogramBins,
  fiveNumberSummary,
  type RenderContext,
} from '../src/index.js';

const ctx: RenderContext = {
  activityId: '00000000-0000-0000-0000-000000000001',
  versionNum: 1,
  submissionEndpoint: 'https://example.com/submit',
  calculatorKitUrl: 'https://cdn.example.com/graph-kit-ABC123.js',
};

function docWith(dp: DataPlotBlock): ActivityDocument {
  const doc = createEmptyDocument({ title: 'Data plots' });
  const section = createSection('Plot it');
  section.blocks = [dp];
  doc.sections = [section];
  return doc;
}

describe('renderDataPlot — build_dotplot (via renderBody)', () => {
  it('emits the graded block shell with the core data-attributes', () => {
    const dp = createDataPlotBlock();
    dp.id = '11111111-1111-1111-1111-111111111111';
    const html = renderBody(docWith(dp), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toContain('class="block block-data-plot"');
    expect(html).toContain('data-block-category="question"');
    expect(html).toContain('data-block-type="data_plot"');
    expect(html).toContain(
      'data-dataplot-block-id="11111111-1111-1111-1111-111111111111"',
    );
    expect(html).toContain('data-dataplot-interaction-type="build_dotplot"');
    expect(html).toContain('role="application"');
    expect(html).toContain('class="js-dataplot-feedback"');
  });

  it('bakes the dataset in as the answer source (data-dataplot-data)', () => {
    const dp = createDataPlotBlock();
    dp.data = [2, 4, 4, 5];
    const html = renderBody(docWith(dp), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toMatch(/data-dataplot-data="[^"]*\[2,4,4,5\]/);
    // and shows the sorted values to the student
    expect(html).toContain('Make a dot plot of these values: 2, 4, 4, 5');
  });

  it('emits the kit src only when a kit URL is available', () => {
    const dp = createDataPlotBlock();
    const withKit = renderBody(docWith(dp), { graphKitUrl: ctx.calculatorKitUrl });
    expect(withKit).toContain(
      'data-dataplot-kit-src="https://cdn.example.com/graph-kit-ABC123.js"',
    );
    const withoutKit = renderBody(docWith(dp));
    expect(withoutKit).not.toContain('data-dataplot-kit-src');
    expect(withoutKit).toContain('block-data-plot');
  });

  it('is auto-numbered in the shared problem sequence', () => {
    const html = renderBody(docWith(createDataPlotBlock()));
    expect(html).toMatch(/<div class="block-problem-number">1\.<\/div>/);
  });

  it('ships the static dot-plot SVG fallback (empty axis) for no-JS / print', () => {
    const html = renderBody(docWith(createDataPlotBlock()));
    expect(html).toContain('class="data-plot-paper"');
    expect(html).toContain('class="data-plot-nojs"');
  });

  it('draws the computed dots onto the SVG in the showAnswers print variant', () => {
    const dp = createDataPlotBlock();
    dp.data = [3, 5, 5];
    const withKey = renderActivityForPrint(docWith(dp), { showAnswers: true });
    const withoutKey = renderActivityForPrint(docWith(dp), { showAnswers: false });
    const countKey = (withKey.match(/<circle/g) ?? []).length;
    const countBlank = (withoutKey.match(/<circle/g) ?? []).length;
    expect(countKey).toBeGreaterThan(countBlank);
    expect(countKey).toBe(3); // one dot per value
  });
});

describe('renderDataPlot — histogram + box builds (via renderBody)', () => {
  it('emits build_histogram with the right interaction type + verb', () => {
    const dp = createDataPlotBlock();
    dp.interaction = { type: 'build_histogram' };
    dp.config = { ...dp.config, binWidth: 5, maxFrequency: 5 };
    const html = renderBody(docWith(dp), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toContain('data-dataplot-interaction-type="build_histogram"');
    expect(html).toContain('Make a histogram of these values');
    expect(html).toContain('role="application"');
    // No answer-key attr for the exact frequency build.
    expect(html).not.toContain('data-dataplot-answer-key');
  });

  it('emits build_boxplot with the tolerance answer key', () => {
    const dp = createDataPlotBlock();
    dp.interaction = { type: 'build_boxplot', tolerance: 0.25 };
    const html = renderBody(docWith(dp), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toContain('data-dataplot-interaction-type="build_boxplot"');
    expect(html).toContain('Make a box plot of these values');
    expect(html).toMatch(/data-dataplot-answer-key="[^"]*&quot;tolerance&quot;:0\.25/);
  });

  it('is auto-numbered like any graded build', () => {
    const dp = createDataPlotBlock();
    dp.interaction = { type: 'build_boxplot', tolerance: 0.5 };
    const html = renderBody(docWith(dp));
    expect(html).toMatch(/<div class="block-problem-number">1\.<\/div>/);
  });
});

describe('renderDataPlot — display (via renderBody)', () => {
  const displayPlot = (chart: 'dotplot' | 'histogram' | 'boxplot'): DataPlotBlock => {
    const dp = createDataPlotBlock();
    dp.interaction = { type: 'display', chart };
    dp.data = [1, 2, 2, 3, 5, 8];
    return dp;
  };

  it('renders as ungraded content (role=img, no number, no kit)', () => {
    const html = renderBody(docWith(displayPlot('boxplot')), {
      graphKitUrl: ctx.calculatorKitUrl,
    });
    expect(html).toContain('class="block block-data-plot block-data-plot-display"');
    expect(html).toContain('data-block-category="content"');
    expect(html).toContain('role="img"');
    expect(html).not.toContain('block-problem-number');
    expect(html).not.toContain('data-dataplot-kit-src');
    expect(html).not.toContain('js-dataplot-feedback');
  });

  it('does not consume a problem number (a following block is #1)', () => {
    const doc = createEmptyDocument({ title: 'Mixed' });
    const section = createSection('S');
    const graded = createDataPlotBlock();
    section.blocks = [displayPlot('dotplot'), graded];
    doc.sections = [section];
    const html = renderBody(doc);
    expect(html).toMatch(/<div class="block-problem-number">1\.<\/div>/);
    expect(html).not.toMatch(/<div class="block-problem-number">2\.<\/div>/);
  });

  it('draws a box plot (rect + median line) statically', () => {
    const html = renderBody(docWith(displayPlot('boxplot')));
    expect(html).toContain('class="data-plot-paper"');
    expect(html).toContain('<rect');
  });
});

describe('renderActivity threads the kit url on the published page', () => {
  it('build block gets the kit src', () => {
    const html = renderActivity(docWith(createDataPlotBlock()), ctx);
    expect(html).toContain(
      'data-dataplot-kit-src="https://cdn.example.com/graph-kit-ABC123.js"',
    );
  });
});

describe('statistics helpers (pure)', () => {
  it('dotCounts groups and sorts by value', () => {
    expect(dotCounts([5, 3, 5, 3, 3])).toEqual([
      { value: 3, count: 3 },
      { value: 5, count: 2 },
    ]);
  });

  it('histogramBins bins with the final bin inclusive of max', () => {
    const bins = histogramBins([0, 4, 5, 9, 10], {
      min: 0,
      max: 10,
      tickStep: 1,
      minorTicksPerStep: 0,
      snapToTick: true,
      binWidth: 5,
    });
    // bins: [0,5) has 0,4 → 2 ; [5,10] has 5,9,10 → 3
    expect(bins.map((b) => b.count)).toEqual([2, 3]);
  });

  it('fiveNumberSummary uses the exclusive-median (TI-84) method', () => {
    // 1,2,3,4,5,6,7 → median 4; lower {1,2,3} Q1=2; upper {5,6,7} Q3=6
    expect(fiveNumberSummary([7, 1, 3, 5, 2, 6, 4])).toEqual({
      min: 1,
      q1: 2,
      median: 4,
      q3: 6,
      max: 7,
    });
  });
});
