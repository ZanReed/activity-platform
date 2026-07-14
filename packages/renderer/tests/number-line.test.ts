import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  createNumberLineBlock,
  createSection,
  type ActivityDocument,
  type NumberLineBlock,
} from '@activity/schema';
import {
  renderActivity,
  renderBody,
  renderActivityForPrint,
  type RenderContext,
} from '../src/index.js';

const ctx: RenderContext = {
  activityId: '00000000-0000-0000-0000-000000000001',
  versionNum: 1,
  submissionEndpoint: 'https://example.com/submit',
  calculatorKitUrl: 'https://cdn.example.com/graph-kit-ABC123.js',
};

function docWith(nl: NumberLineBlock): ActivityDocument {
  const doc = createEmptyDocument({ title: 'Number lines' });
  const section = createSection('Mark it');
  section.rows[0]!.columns[0]!.blocks = [nl];
  doc.sections = [section];
  return doc;
}

describe('renderNumberLine (via renderBody)', () => {
  it('emits the block shell with the core data-attributes', () => {
    const nl = createNumberLineBlock();
    nl.id = '11111111-1111-1111-1111-111111111111';
    const html = renderBody(docWith(nl), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toContain('class="block block-number-line"');
    expect(html).toContain('data-block-type="number_line"');
    expect(html).toContain(
      'data-numberline-block-id="11111111-1111-1111-1111-111111111111"',
    );
    expect(html).toContain('data-numberline-interaction-type="plot_point"');
    expect(html).toContain('role="application"');
    expect(html).toContain('class="js-numberline-feedback"');
  });

  it('encodes the config and answer key as JSON attributes (no discriminant)', () => {
    const nl = createNumberLineBlock();
    nl.config = { min: -5, max: 5, tickStep: 1, minorTicksPerStep: 0, snapToTick: true };
    nl.interaction = { type: 'plot_point', correctPoints: [3], tolerance: 0.25 };
    const html = renderBody(docWith(nl), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toMatch(/data-numberline-config="[^"]*&quot;min&quot;:-5/);
    expect(html).toMatch(
      /data-numberline-answer-key="[^"]*&quot;correctPoints&quot;:\[3\]/,
    );
    expect(html).toMatch(/data-numberline-answer-key="[^"]*&quot;tolerance&quot;:0\.25/);
    expect(html).not.toMatch(/data-numberline-answer-key="[^"]*plot_point/);
  });

  it('encodes a plot_interval answer key with open/closed styles', () => {
    const nl = createNumberLineBlock();
    nl.interaction = {
      type: 'plot_interval',
      correctInterval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' },
      tolerance: 0.1,
    };
    const html = renderBody(docWith(nl), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toContain('data-numberline-interaction-type="plot_interval"');
    expect(html).toMatch(/data-numberline-answer-key="[^"]*&quot;minStyle&quot;:&quot;closed&quot;/);
  });

  it('emits the kit src only when a kit URL is available', () => {
    const nl = createNumberLineBlock();
    const withKit = renderBody(docWith(nl), { graphKitUrl: ctx.calculatorKitUrl });
    expect(withKit).toContain(
      'data-numberline-kit-src="https://cdn.example.com/graph-kit-ABC123.js"',
    );
    const withoutKit = renderBody(docWith(nl));
    expect(withoutKit).not.toContain('data-numberline-kit-src');
    // The graded block still renders (never silently dropped).
    expect(withoutKit).toContain('block-number-line');
  });

  it('renders a confidence fieldset only when opted in', () => {
    expect(renderBody(docWith(createNumberLineBlock()))).not.toContain(
      'js-confidence-rating',
    );
    const on = createNumberLineBlock();
    on.hasConfidenceRating = true;
    const html = renderBody(docWith(on));
    expect(html).toContain('data-has-confidence-rating="true"');
    expect(html).toContain('class="js-confidence-rating"');
  });

  it('renders the solution slot hidden (fail-closed)', () => {
    const nl = createNumberLineBlock();
    nl.solution = [{ type: 'text', text: 'It is five.', marks: [] }];
    const html = renderBody(docWith(nl));
    expect(html).toMatch(/<div class="js-solution"[^>]*hidden>/);
    expect(html).toContain('It is five.');
  });

  it('is auto-numbered in the shared problem sequence', () => {
    const html = renderBody(docWith(createNumberLineBlock()));
    expect(html).toMatch(/<div class="block-problem-number">1\.<\/div>/);
  });

  it('ships the static number-line SVG fallback for no-JS / print', () => {
    const html = renderBody(docWith(createNumberLineBlock()));
    expect(html).toContain('class="number-line-paper"');
    expect(html).toContain('class="number-line-nojs"');
  });
});

describe('renderActivity / print', () => {
  it('threads the kit url on the published page', () => {
    const html = renderActivity(docWith(createNumberLineBlock()), ctx);
    expect(html).toContain(
      'data-numberline-kit-src="https://cdn.example.com/graph-kit-ABC123.js"',
    );
  });

  it('omits the kit src on the print path (static hand-mark line)', () => {
    const html = renderActivityForPrint(docWith(createNumberLineBlock()), {
      showAnswers: false,
    });
    expect(html).toContain('block-number-line');
    expect(html).not.toContain('data-numberline-kit-src');
    expect(html).toContain('class="number-line-paper"');
  });

  it('draws the answer key onto the SVG in the showAnswers print variant', () => {
    const nl = createNumberLineBlock();
    nl.interaction = { type: 'plot_point', correctPoints: [5], tolerance: 0.1 };
    const withKey = renderActivityForPrint(docWith(nl), { showAnswers: true });
    const withoutKey = renderActivityForPrint(docWith(nl), { showAnswers: false });
    // The answer-key variant draws an extra filled dot (a <circle>) that the
    // blank variant does not.
    const countKey = (withKey.match(/<circle/g) ?? []).length;
    const countBlank = (withoutKey.match(/<circle/g) ?? []).length;
    expect(countKey).toBeGreaterThan(countBlank);
  });
});
