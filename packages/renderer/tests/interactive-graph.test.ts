import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  createInteractiveGraphBlock,
  createSection,
  type ActivityDocument,
  type InteractiveGraphBlock,
} from '@activity/schema';
import { renderActivity, renderBody, renderActivityForPrint, type RenderContext } from '../src/index.js';

const ctx: RenderContext = {
  activityId: '00000000-0000-0000-0000-000000000001',
  versionNum: 1,
  submissionEndpoint: 'https://example.com/submit',
  calculatorKitUrl: 'https://cdn.example.com/graph-kit-ABC123.js',
};

function docWith(graph: InteractiveGraphBlock): ActivityDocument {
  const doc = createEmptyDocument({ title: 'Graphing' });
  const section = createSection('Plot it');
  section.blocks = [graph];
  doc.sections = [section];
  return doc;
}

describe('renderInteractiveGraph (via renderBody)', () => {
  it('emits the block shell with the core data-attributes', () => {
    const graph = createInteractiveGraphBlock();
    graph.id = '11111111-1111-1111-1111-111111111111';
    const html = renderBody(docWith(graph), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toContain('class="block block-interactive-graph"');
    expect(html).toContain('data-block-type="interactive_graph"');
    expect(html).toContain('data-graph-block-id="11111111-1111-1111-1111-111111111111"');
    expect(html).toContain('data-graph-interaction-type="plot_point"');
    expect(html).toContain('role="application"');
    expect(html).toContain('class="js-graph-feedback"');
  });

  it('encodes the axis config and answer key as JSON attributes', () => {
    const graph = createInteractiveGraphBlock();
    graph.axisConfig = { xMin: -6, xMax: 6, yMin: -6, yMax: 6, xGridStep: 2, yGridStep: 2, showGrid: true, snapToGrid: false };
    graph.interaction = { type: 'plot_point', correctPoints: [[3, 4]], tolerance: 0.25 };
    const html = renderBody(docWith(graph), { graphKitUrl: ctx.calculatorKitUrl });
    // Attribute JSON is HTML-escaped (" -> &quot;); assert on the decoded fields.
    expect(html).toMatch(/data-graph-config="[^"]*&quot;xMin&quot;:-6/);
    expect(html).toMatch(/data-graph-answer-key="[^"]*&quot;correctPoints&quot;:\[\[3,4\]\]/);
    expect(html).toMatch(/data-graph-answer-key="[^"]*&quot;tolerance&quot;:0\.25/);
    // The answer key must NOT carry the interaction discriminant.
    expect(html).not.toMatch(/data-graph-answer-key="[^"]*plot_point/);
  });

  it('emits data-graph-kit-src only when a kit URL is available', () => {
    const graph = createInteractiveGraphBlock();
    const withKit = renderBody(docWith(graph), { graphKitUrl: ctx.calculatorKitUrl });
    expect(withKit).toContain('data-graph-kit-src="https://cdn.example.com/graph-kit-ABC123.js"');
    const withoutKit = renderBody(docWith(graph));
    expect(withoutKit).not.toContain('data-graph-kit-src');
    // The block still renders (a graded question can't be silently dropped).
    expect(withoutKit).toContain('block-interactive-graph');
  });

  it('renders a confidence fieldset only when opted in', () => {
    const off = createInteractiveGraphBlock();
    expect(renderBody(docWith(off))).not.toContain('js-confidence-rating');
    const on = createInteractiveGraphBlock();
    on.hasConfidenceRating = true;
    const html = renderBody(docWith(on));
    expect(html).toContain('data-has-confidence-rating="true"');
    expect(html).toContain('class="js-confidence-rating"');
  });

  it('renders the solution slot hidden (fail-closed)', () => {
    const graph = createInteractiveGraphBlock();
    graph.solution = [{ type: 'text', text: 'It is the origin.', marks: [] }];
    const html = renderBody(docWith(graph));
    expect(html).toMatch(/<div class="js-solution"[^>]*hidden>/);
    expect(html).toContain('It is the origin.');
  });

  it('emits mistake feedback: match attr + index-aligned templates (Drop B)', () => {
    const graph = createInteractiveGraphBlock();
    graph.mistakeFeedback = [
      { match: '(4, 3)', feedback: [{ type: 'text', text: 'Coordinates are (x, y).', marks: [] }] },
      { match: '(-3, 4)', feedback: [{ type: 'text', text: 'Check your signs.', marks: [] }] },
    ];
    const html = renderBody(docWith(graph), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toMatch(/data-graph-mistakes="[^"]*&quot;\(4, 3\)&quot;/);
    const templates = html.match(/<template class="js-graph-mistake-content">/g);
    expect(templates).toHaveLength(2);
    expect(html).toContain('Coordinates are (x, y).');
    expect(html).toContain('Check your signs.');
  });

  it('omits mistake markup entirely when none are authored', () => {
    const html = renderBody(docWith(createInteractiveGraphBlock()), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).not.toContain('data-graph-mistakes');
    expect(html).not.toContain('js-graph-mistake-content');
    // builtinFeedback default true -> attribute omitted (omit-when-default).
    expect(html).not.toContain('data-graph-builtin-feedback');
  });

  it('emits data-graph-builtin-feedback="false" only when disabled', () => {
    const graph = createInteractiveGraphBlock();
    graph.builtinFeedback = false;
    const html = renderBody(docWith(graph), { graphKitUrl: ctx.calculatorKitUrl });
    expect(html).toContain('data-graph-builtin-feedback="false"');
  });

  it('is auto-numbered in the shared problem sequence', () => {
    const graph = createInteractiveGraphBlock();
    const html = renderBody(docWith(graph));
    expect(html).toMatch(/<div class="block-problem-number">1\.<\/div>/);
  });
});

describe('renderActivity / print', () => {
  it('threads calculatorKitUrl to the graph block on the published page', () => {
    const graph = createInteractiveGraphBlock();
    const html = renderActivity(docWith(graph), ctx);
    expect(html).toContain('data-graph-kit-src="https://cdn.example.com/graph-kit-ABC123.js"');
  });

  it('omits the kit src on the print path (static hand-plot box)', () => {
    const graph = createInteractiveGraphBlock();
    const html = renderActivityForPrint(docWith(graph), { showAnswers: false });
    expect(html).toContain('block-interactive-graph');
    expect(html).not.toContain('data-graph-kit-src');
  });
});
