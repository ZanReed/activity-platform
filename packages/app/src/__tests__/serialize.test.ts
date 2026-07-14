// =============================================================================
// serialize.test.ts — Round-trip tests for serialize/deserialize
// -----------------------------------------------------------------------------
// Core invariant: activityToTiptap(tiptapToActivity(x)) ≈ x for any Tiptap
// doc made up of supported types. Tests start from the Tiptap side because
// Tiptap doesn't have UUIDs, so structural equality after round-trip is
// strict deep-equal — no ID stripping needed.
// =============================================================================

import { describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import {
    ActivityDocument,
    ActivityMeta,
    ReferencePanel,
    type Block,
    type Section,
    type CalculatorTool,
} from '@activity/schema';
import {
    activityToTiptap,
    tiptapToActivity,
    referencePanelToTiptap,
    tiptapToReferencePanel,
} from '../lib/serialize';

const META = ActivityMeta.parse({
    title: 'Test Activity',
    course: 'Algebra II',
});

// A section's blocks flattened across its rows/columns. Single-column content
// lives in one 1-col row (the Option-A bridge), so for the many single-column
// assertions this reads exactly like the old `section.blocks`. Empty sections
// (no rows) flatten to [].
function flatBlocks(section: Section): Block[] {
    return section.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks));
}

// Round-trip from the Tiptap side.
function roundTrip(input: JSONContent): JSONContent {
    return activityToTiptap(tiptapToActivity(input, META));
}

describe('empty doc', () => {
    it('round-trips an empty doc', () => {
        const empty: JSONContent = { type: 'doc', content: [] };
        expect(roundTrip(empty)).toEqual(empty);
    });
});

describe('interactive graph block', () => {
    const graphNode: JSONContent = {
        type: 'interactiveGraph',
        attrs: {
            id: 'ignored-regenerated',
            axisConfig: {
                xMin: -6, xMax: 6, yMin: -6, yMax: 6,
                xGridStep: 2, yGridStep: 2, showGrid: true, snapToGrid: false,
            },
            interaction: { type: 'plot_point', correctPoints: [[3, 4]], tolerance: 0.25 },
            solution: [{ type: 'text', text: 'It is up and to the right.', marks: [] }],
            hasConfidenceRating: true,
            skills: ['plotting points'],
        },
        content: [{ type: 'text', text: 'Plot the point (3, 4).' }],
    };
    const doc: JSONContent = { type: 'doc', content: [graphNode] };

    it('round-trips axis config, interaction, prompt, solution, and flags', () => {
        const out = roundTrip(doc);
        const g = out.content!.find((n) => n.type === 'interactiveGraph')!;
        expect(g.attrs!.axisConfig).toEqual(graphNode.attrs!.axisConfig);
        expect(g.attrs!.interaction).toEqual(graphNode.attrs!.interaction);
        expect(g.attrs!.hasConfidenceRating).toBe(true);
        expect(g.attrs!.skills).toEqual(['plotting points']);
        expect(g.attrs!.solution).toEqual(graphNode.attrs!.solution);
        expect(g.content).toEqual([{ type: 'text', text: 'Plot the point (3, 4).' }]);
    });

    it('round-trips a plot_function (linear) interaction', () => {
        const funcNode: JSONContent = {
            type: 'interactiveGraph',
            attrs: {
                id: 'x',
                axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true },
                interaction: {
                    type: 'plot_function',
                    models: [{ family: 'linear', slope: 2, intercept: 3, slopeTolerance: 0.1, interceptTolerance: 0.1 }],
                },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Graph y = 2x + 3.' }],
        };
        const out = roundTrip({ type: 'doc', content: [funcNode] });
        const g = out.content!.find((n) => n.type === 'interactiveGraph')!;
        expect(g.attrs!.interaction).toEqual(funcNode.attrs!.interaction);
        // schema-valid
        const activity = tiptapToActivity({ type: 'doc', content: [funcNode] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips a shade_region interaction', () => {
        const regionNode: JSONContent = {
            type: 'interactiveGraph',
            attrs: {
                id: 'r',
                axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true },
                interaction: {
                    type: 'shade_region',
                    regions: [{ correctVertices: [[0, 0], [4, 0], [2, 4]], minOverlap: 0.9 }],
                },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Shade the triangle.' }],
        };
        const out = roundTrip({ type: 'doc', content: [regionNode] });
        const g = out.content!.find((n) => n.type === 'interactiveGraph')!;
        expect(g.attrs!.interaction).toEqual(regionNode.attrs!.interaction);
        const activity = tiptapToActivity({ type: 'doc', content: [regionNode] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips mistake feedback + the builtin toggle (Drop B)', () => {
        const node: JSONContent = {
            type: 'interactiveGraph',
            attrs: {
                id: 'm',
                axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true },
                interaction: { type: 'plot_point', correctPoints: [[3, 4]], tolerance: 0.25 },
                builtinFeedback: false,
                mistakeFeedback: [
                    { match: '(4, 3)', feedback: [{ type: 'text', text: 'x comes first.', marks: [] }] },
                ],
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Plot the point (3, 4).' }],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const g = out.content!.find((n) => n.type === 'interactiveGraph')!;
        expect(g.attrs!.builtinFeedback).toBe(false);
        expect(g.attrs!.mistakeFeedback).toEqual(node.attrs!.mistakeFeedback);
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips plot_ray and plot_segment interactions (Drop C)', () => {
        const mk = (interaction: unknown): JSONContent => ({
            type: 'interactiveGraph',
            attrs: {
                id: 'rs',
                axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true },
                interaction,
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Draw it.' }],
        });
        const ray = { type: 'plot_ray', rays: [{ from: [1, 2], through: [3, 4], fromStyle: 'open', tolerance: 0.25 }] };
        const seg = { type: 'plot_segment', segments: [{ from: [-2, 0], to: [3, 2], endpoints: ['closed', 'open'], tolerance: 0.25 }] };
        for (const interaction of [ray, seg]) {
            const out = roundTrip({ type: 'doc', content: [mk(interaction)] });
            const g = out.content!.find((n) => n.type === 'interactiveGraph')!;
            expect(g.attrs!.interaction).toEqual(interaction);
            const activity = tiptapToActivity({ type: 'doc', content: [mk(interaction)] }, META);
            expect(ActivityDocument.safeParse(activity).success).toBe(true);
        }
    });

    it('serializes to a schema-valid interactive_graph block', () => {
        const activity = tiptapToActivity(doc, META);
        const parsed = ActivityDocument.safeParse(activity);
        expect(parsed.success).toBe(true);
        const block = flatBlocks(activity.sections[0]!).find(
            (b) => b.type === 'interactive_graph',
        );
        expect(block).toBeDefined();
        if (block && block.type === 'interactive_graph') {
            expect(block.interaction).toEqual({
                type: 'plot_point',
                correctPoints: [[3, 4]],
                tolerance: 0.25,
            });
            expect(block.axisConfig.snapToGrid).toBe(false);
        }
    });

    it('round-trips a display (static) interaction with mixed drawables', () => {
        const displayNode: JSONContent = {
            type: 'interactiveGraph',
            attrs: {
                id: 'd',
                axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true },
                interaction: {
                    type: 'display',
                    drawables: [
                        { kind: 'point', at: [2, 3], label: 'A' },
                        { kind: 'curve', model: { family: 'linear', slope: 1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 } },
                        { kind: 'segment', from: [0, 0], to: [4, 4] },
                        { kind: 'polygon', vertices: [[0, 0], [4, 0], [2, 3]], filled: true },
                    ],
                },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Use the graph below.' }],
        };
        const out = roundTrip({ type: 'doc', content: [displayNode] });
        const g = out.content!.find((n) => n.type === 'interactiveGraph')!;
        expect(g.attrs!.interaction).toEqual(displayNode.attrs!.interaction);
        const activity = tiptapToActivity({ type: 'doc', content: [displayNode] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips a display graph with an empty prompt (standalone exemplar)', () => {
        const exemplar: JSONContent = {
            type: 'interactiveGraph',
            attrs: {
                id: 'e',
                axisConfig: { xMin: -5, xMax: 5, yMin: -5, yMax: 5, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true },
                interaction: { type: 'display', drawables: [] },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
        };
        const activity = tiptapToActivity({ type: 'doc', content: [exemplar] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
        const block = flatBlocks(activity.sections[0]!).find((b) => b.type === 'interactive_graph');
        if (block && block.type === 'interactive_graph') {
            expect(block.interaction.type).toBe('display');
            expect(block.prompt).toEqual([]);
        }
    });
});

describe('number line block', () => {
    const pointNode: JSONContent = {
        type: 'numberLine',
        attrs: {
            id: 'ignored-regenerated',
            config: { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true },
            interaction: { type: 'plot_point', correctPoints: [3], tolerance: 0.1 },
            solution: [{ type: 'text', text: 'Three tick marks right of zero.', marks: [] }],
            hasConfidenceRating: true,
            skills: ['number line'],
        },
        content: [{ type: 'text', text: 'Plot the point at 3.' }],
    };
    const doc: JSONContent = { type: 'doc', content: [pointNode] };

    it('round-trips config, interaction, prompt, solution, and flags', () => {
        const out = roundTrip(doc);
        const n = out.content!.find((x) => x.type === 'numberLine')!;
        expect(n.attrs!.config).toEqual(pointNode.attrs!.config);
        expect(n.attrs!.interaction).toEqual(pointNode.attrs!.interaction);
        expect(n.attrs!.hasConfidenceRating).toBe(true);
        expect(n.attrs!.skills).toEqual(['number line']);
        expect(n.attrs!.solution).toEqual(pointNode.attrs!.solution);
        expect(n.content).toEqual([{ type: 'text', text: 'Plot the point at 3.' }]);
    });

    it('round-trips a plot_interval (closed/open) interaction', () => {
        const node: JSONContent = {
            type: 'numberLine',
            attrs: {
                id: 'i',
                config: { min: -10, max: 10, tickStep: 2, minorTicksPerStep: 0, snapToTick: true },
                interaction: {
                    type: 'plot_interval',
                    correctInterval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' },
                    tolerance: 0.1,
                },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Graph -2 <= x < 4.' }],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const n = out.content!.find((x) => x.type === 'numberLine')!;
        expect(n.attrs!.interaction).toEqual(node.attrs!.interaction);
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips a one-sided ray interval (unbounded max omitted)', () => {
        const node: JSONContent = {
            type: 'numberLine',
            attrs: {
                id: 'r',
                config: { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true },
                interaction: {
                    type: 'plot_interval',
                    correctInterval: { min: 3, minStyle: 'closed' },
                    tolerance: 0.1,
                },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Graph x >= 3.' }],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const n = out.content!.find((x) => x.type === 'numberLine')!;
        expect(n.attrs!.interaction).toEqual(node.attrs!.interaction);
    });

    it('serializes to a schema-valid number_line block', () => {
        const activity = tiptapToActivity(doc, META);
        const block = flatBlocks(activity.sections[0]!).find(
            (b) => b.type === 'number_line',
        );
        expect(block).toBeDefined();
        if (block && block.type === 'number_line') {
            expect(block.interaction.type).toBe('plot_point');
        }
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });
});

describe('data plot block', () => {
    const buildNode: JSONContent = {
        type: 'dataPlot',
        attrs: {
            id: 'ignored-regenerated',
            data: [3, 5, 5, 6, 8],
            config: { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true },
            interaction: { type: 'build_dotplot' },
            solution: [{ type: 'text', text: 'Stack the dots per value.', marks: [] }],
            hasConfidenceRating: true,
            skills: ['statistics'],
        },
        content: [{ type: 'text', text: 'Build a dot plot of the data.' }],
    };
    const doc: JSONContent = { type: 'doc', content: [buildNode] };

    it('round-trips data, config, interaction, prompt, solution, and flags', () => {
        const out = roundTrip(doc);
        const n = out.content!.find((x) => x.type === 'dataPlot')!;
        expect(n.attrs!.data).toEqual([3, 5, 5, 6, 8]);
        expect(n.attrs!.config).toEqual(buildNode.attrs!.config);
        expect(n.attrs!.interaction).toEqual(buildNode.attrs!.interaction);
        expect(n.attrs!.hasConfidenceRating).toBe(true);
        expect(n.attrs!.skills).toEqual(['statistics']);
        expect(n.attrs!.solution).toEqual(buildNode.attrs!.solution);
        expect(n.content).toEqual([{ type: 'text', text: 'Build a dot plot of the data.' }]);
    });

    it('round-trips a display box plot (chart carried, ungraded)', () => {
        const node: JSONContent = {
            type: 'dataPlot',
            attrs: {
                id: 'd',
                data: [2, 4, 4, 6, 7, 9],
                config: { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true },
                interaction: { type: 'display', chart: 'boxplot' },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Box plot of the sample:' }],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const n = out.content!.find((x) => x.type === 'dataPlot')!;
        expect(n.attrs!.interaction).toEqual({ type: 'display', chart: 'boxplot' });
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('serializes to a schema-valid data_plot block', () => {
        const activity = tiptapToActivity(doc, META);
        const block = flatBlocks(activity.sections[0]!).find((b) => b.type === 'data_plot');
        expect(block).toBeDefined();
        if (block && block.type === 'data_plot') {
            expect(block.interaction.type).toBe('build_dotplot');
            expect(block.data).toEqual([3, 5, 5, 6, 8]);
        }
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips a build_histogram interaction', () => {
        const node: JSONContent = {
            type: 'dataPlot',
            attrs: {
                id: 'h',
                data: [0, 4, 5, 9, 10],
                config: { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true, binWidth: 5 },
                interaction: { type: 'build_histogram' },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Build a histogram.' }],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const n = out.content!.find((x) => x.type === 'dataPlot')!;
        expect(n.attrs!.interaction).toEqual({ type: 'build_histogram' });
        expect(n.attrs!.config).toEqual(node.attrs!.config);
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips a build_boxplot interaction with tolerance', () => {
        const node: JSONContent = {
            type: 'dataPlot',
            attrs: {
                id: 'b',
                data: [1, 2, 3, 4, 5, 6, 7],
                config: { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true },
                interaction: { type: 'build_boxplot', tolerance: 0.25 },
                solution: null,
                hasConfidenceRating: false,
                skills: [],
            },
            content: [{ type: 'text', text: 'Build a box plot.' }],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const n = out.content!.find((x) => x.type === 'dataPlot')!;
        expect(n.attrs!.interaction).toEqual({ type: 'build_boxplot', tolerance: 0.25 });
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });
});

describe('reference panel (opaque carry)', () => {
    // The panel is authored on its own surface and threaded into
    // tiptapToActivity as a third argument — it is never encoded in the main
    // editor's Tiptap doc. These tests pin the pass-through contract that closes
    // the latent drop-bug (a stored panel discarded on the next save).
    const PANEL: ReferencePanel = {
        title: 'Formula reference',
        blocks: [
            {
                id: '11111111-1111-4111-8111-111111111111',
                type: 'heading',
                level: 2,
                content: [{ type: 'text', text: 'Key formulas', marks: [] }],
            },
            {
                id: '22222222-2222-4222-8222-222222222222',
                type: 'math_block',
                latex: 'a^2 + b^2 = c^2',
            },
        ],
    };
    const body: JSONContent = {
        type: 'doc',
        content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Body' }] },
        ],
    };

    it('carries the reference panel through verbatim when provided', () => {
        const result = tiptapToActivity(body, META, PANEL);
        expect(result.referencePanel).toEqual(PANEL);
    });

    it('omits the reference panel when not provided', () => {
        const result = tiptapToActivity(body, META);
        expect(result.referencePanel).toBeUndefined();
    });

    it('carries a panel with no title verbatim', () => {
        const panelNoTitle: ReferencePanel = { blocks: PANEL.blocks };
        const result = tiptapToActivity(body, META, panelNoTitle);
        expect(result.referencePanel).toEqual(panelNoTitle);
        expect(result.referencePanel?.title).toBeUndefined();
    });

    it('produces a schema-valid document with a panel', () => {
        const result = tiptapToActivity(body, META, PANEL);
        expect(ActivityDocument.safeParse(result).success).toBe(true);
    });
});

describe('calculator (opaque carry)', () => {
    // Like the reference panel, the calculator config is activity-level editor
    // state threaded into tiptapToActivity (4th arg), never encoded in the Tiptap
    // doc. Pins the same pass-through contract.
    const CALC: CalculatorTool = {
        enabled: true,
        restrictions: {
            mode: 'scientific',
            allowTrig: false,
            allowLogExp: true,
            allowInequalities: true,
            allowedRegressionModels: ['linear', 'quadratic', 'exponential'],
        },
    };
    const body: JSONContent = {
        type: 'doc',
        content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Body' }] },
        ],
    };

    it('carries the calculator through verbatim when provided', () => {
        const result = tiptapToActivity(body, META, undefined, CALC);
        expect(result.calculator).toEqual(CALC);
    });

    it('omits the calculator when not provided', () => {
        expect(tiptapToActivity(body, META).calculator).toBeUndefined();
    });

    it('carries a disabled calculator verbatim (config preserved while off)', () => {
        const off: CalculatorTool = { ...CALC, enabled: false };
        expect(tiptapToActivity(body, META, undefined, off).calculator).toEqual(off);
    });

    it('carries the panel AND the calculator together', () => {
        const panel: ReferencePanel = { blocks: [] };
        const result = tiptapToActivity(body, META, panel, CALC);
        expect(result.referencePanel).toEqual(panel);
        expect(result.calculator).toEqual(CALC);
    });

    it('produces a schema-valid document with a calculator', () => {
        const result = tiptapToActivity(body, META, undefined, CALC);
        expect(ActivityDocument.safeParse(result).success).toBe(true);
    });
});

describe('reference panel ⇄ tiptap', () => {
    // The panel editor produces a FLAT Tiptap doc (no sectionBreak); these
    // bridge it to ReferencePanel.blocks, with the title threaded separately.
    const tiptap: JSONContent = {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Formulas' }],
            },
            { type: 'mathBlock', attrs: { latex: 'a^2+b^2=c^2' } },
            { type: 'paragraph', content: [{ type: 'text', text: 'A note.' }] },
        ],
    };

    it('maps a flat Tiptap doc to a panel and back (no sections)', () => {
        const panel = tiptapToReferencePanel(tiptap, 'Reference');
        expect(panel.title).toBe('Reference');
        expect(panel.blocks.map((b) => b.type)).toEqual([
            'heading',
            'math_block',
            'paragraph',
        ]);
        // Tiptap-side round-trip is exact (no UUIDs on the Tiptap side).
        expect(referencePanelToTiptap(panel)).toEqual(tiptap);
    });

    it('omits a blank/whitespace title', () => {
        expect(tiptapToReferencePanel(tiptap, '   ').title).toBeUndefined();
        expect(tiptapToReferencePanel(tiptap).title).toBeUndefined();
    });

    it('produces a schema-valid ReferencePanel', () => {
        expect(
            ReferencePanel.safeParse(tiptapToReferencePanel(tiptap, 'T')).success,
        ).toBe(true);
    });

    it('round-trips an empty doc to a panel with no blocks', () => {
        const empty: JSONContent = { type: 'doc', content: [] };
        const panel = tiptapToReferencePanel(empty);
        expect(panel.blocks).toEqual([]);
        expect(referencePanelToTiptap(panel)).toEqual(empty);
    });
});

describe('paragraphs', () => {
    it('round-trips an empty paragraph', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [] }],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips a paragraph with plain text', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Hello world' }],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves bold marks', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'bold',
                            marks: [{ type: 'bold' }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves subscript marks', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'H' },
                        {
                            type: 'text',
                            text: '2',
                            marks: [{ type: 'subscript' }],
                        },
                        { type: 'text', text: 'O' },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves superscript marks', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'x' },
                        {
                            type: 'text',
       text: '2',
       marks: [{ type: 'superscript' }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves underline marks', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'key term',
                            marks: [{ type: 'underline' }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves a definition mark with its rich content', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'factor',
                            marks: [{ type: 'definition', attrs: { content: [{ type: 'text', text: 'a number that divides another exactly', marks: [] }] } }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves a definition mark image + glossaryKey', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'hypotenuse',
                            marks: [{ type: 'definition', attrs: { content: [{ type: 'text', text: 'the longest side', marks: [] }], image: { src: 'https://example.com/triangle.png', alt: 'a right triangle' }, glossaryKey: 'factor-noun' } }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('drops an empty definition mark (no content and no image)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'factor', marks: [{ type: 'definition', attrs: { content: [] } }] },
                    ],
                },
            ],
        };
        const result = tiptapToActivity(doc, META);
        const block = flatBlocks(result.sections[0]!)[0]!;
        if (block.type !== 'paragraph') throw new Error('expected paragraph');
        const text = block.content[0]!;
        if (text.type !== 'text') throw new Error('expected text node');
        expect(text.marks).toEqual([]);
    });

    it('keeps a definition mark that has only an image (no text)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'parabola', marks: [{ type: 'definition', attrs: { content: [], image: { src: 'https://example.com/parabola.png', alt: 'a U-shaped curve' } } }] },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves multiple marks on one text run', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'bold italic',
                            marks: [{ type: 'bold' }, { type: 'italic' }],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves mixed plain and marked runs in one paragraph', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'plain ' },
                        {
                            type: 'text',
                            text: 'bold',
                            marks: [{ type: 'bold' }],
                        },
                        { type: 'text', text: ' end' },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves a hard break between text runs', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Blah blah blah. Hello!' },
                        { type: 'hardBreak' },
                        { type: 'text', text: 'Hope this works' },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });
});

describe('headings', () => {
    it.each([1, 2, 3] as const)('round-trips heading level %i', (level) => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level },
                    content: [{ type: 'text', text: `Heading ${level}` }],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('clamps invalid heading levels to 1', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 5 },
                    content: [{ type: 'text', text: 'Too deep' }],
                },
            ],
        };
        const result = roundTrip(doc);
        expect((result.content?.[0] as JSONContent).attrs?.level).toBe(1);
    });
});

describe('math', () => {
    it('round-trips inline math inside a paragraph', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'The formula is ' },
                        {
                            type: 'mathInline',
                            attrs: { latex: 'x^2 + y^2 = z^2' },
                        },
                        { type: 'text', text: '.' },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips block math', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'mathBlock',
                    attrs: {
                        latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
                    },
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });
});

describe('multi-block doc', () => {
    it('round-trips a representative worksheet', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: 'Worksheet 1' }],
                },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Solve for ' },
                        { type: 'mathInline', attrs: { latex: 'x' } },
                        { type: 'text', text: ':' },
                    ],
                },
                {
                    type: 'mathBlock',
                    attrs: { latex: '2x + 3 = 11' },
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });
});

describe('graceful degradation', () => {
    it('skips unknown block types without throwing', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'before' }],
                },
                // horizontalRule is in StarterKit defaults but not in our
                // schema — exactly the "real but unsupported" case the
                // graceful-degradation path is designed for.
                { type: 'horizontalRule' } as JSONContent,
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'after' }],
                },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(flatBlocks(result.sections[0]!)).toHaveLength(2);
        expect(flatBlocks(result.sections[0]!)[0]!.type).toBe('paragraph');
        expect(flatBlocks(result.sections[0]!)[1]!.type).toBe('paragraph');
    });

    it('drops unsupported marks (e.g., strike) silently', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'mixed',
                            marks: [{ type: 'strike' }, { type: 'bold' }],
                        },
                    ],
                },
            ],
        };
        const result = tiptapToActivity(doc, META);
        const block = flatBlocks(result.sections[0]!)[0]!;
        if (block.type !== 'paragraph') throw new Error('expected paragraph');
        const text = block.content[0]!;
        if (text.type !== 'text') throw new Error('expected text node');
        expect(text.marks).toEqual([{ type: 'bold' }]);
    });
});

describe('schema validity', () => {
    it('produces output that parses against ActivityDocument', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Hi' }],
                },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'mathInline', attrs: { latex: 'x' } },
                    ],
                },
                { type: 'mathBlock', attrs: { latex: 'y' } },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });
});

describe('meta and sections', () => {
    it('preserves meta in the result', () => {
        const doc: JSONContent = { type: 'doc', content: [] };
        const meta = { ...META, title: 'Quadratic Equations', unit: 'Polynomials' };
        const result = tiptapToActivity(doc, meta);
        expect(result.meta).toEqual(meta);
    });

    it('wraps blocks in exactly one section with a uuid id', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [] }],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(1);
        expect(result.sections[0]!.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
    });
});

describe('section breaks', () => {
    it('produces single implicit section with defaults when no sectionBreak present', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [] }],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(1);
        expect(result.sections[0]!.title).toBeUndefined();
        expect(result.sections[0]!.isCheckpoint).toBe(false);
    });

    it('first section takes the leading sectionBreak attrs when doc starts with one', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: 'Warm-up', isCheckpoint: true } },
                { type: 'paragraph', content: [] },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(1);
        expect(result.sections[0]!.title).toBe('Warm-up');
        expect(result.sections[0]!.isCheckpoint).toBe(true);
        expect(flatBlocks(result.sections[0]!)).toHaveLength(1);
    });

    it('splits content at a mid-doc sectionBreak', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'part 1' }] },
                { type: 'sectionBreak', attrs: { title: 'Practice', isCheckpoint: false } },
                { type: 'paragraph', content: [{ type: 'text', text: 'part 2' }] },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(2);
        expect(result.sections[0]!.title).toBeUndefined();
        expect(result.sections[0]!.isCheckpoint).toBe(false);
        expect(flatBlocks(result.sections[0]!)).toHaveLength(1);
        expect(result.sections[1]!.title).toBe('Practice');
        expect(flatBlocks(result.sections[1]!)).toHaveLength(1);
    });

    it('produces a trailing empty section for a trailing sectionBreak', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [] },
                { type: 'sectionBreak', attrs: { title: 'Last', isCheckpoint: false } },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(2);
        expect(result.sections[1]!.title).toBe('Last');
        expect(flatBlocks(result.sections[1]!)).toHaveLength(0);
    });

    it('handles consecutive sectionBreaks — empty first, second carries the latter break', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: 'A', isCheckpoint: false } },
                { type: 'sectionBreak', attrs: { title: 'B', isCheckpoint: true } },
                { type: 'paragraph', content: [] },
            ],
        };
        const result = tiptapToActivity(doc, META);
        expect(result.sections).toHaveLength(2);
        expect(result.sections[0]!.title).toBe('A');
        expect(flatBlocks(result.sections[0]!)).toHaveLength(0);
        expect(result.sections[1]!.title).toBe('B');
        expect(result.sections[1]!.isCheckpoint).toBe(true);
        expect(flatBlocks(result.sections[1]!)).toHaveLength(1);
    });

    it('round-trip: doc without sectionBreaks (default first section)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'plain' }] }],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trip: doc with leading sectionBreak (first section has title)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: 'Warm-up', isCheckpoint: false } },
                { type: 'paragraph', content: [] },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trip: first section with isCheckpoint: true but no title', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'sectionBreak', attrs: { title: null, isCheckpoint: true } },
                { type: 'paragraph', content: [] },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trip: three-section worksheet with mixed metadata', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'intro' }] },
                { type: 'sectionBreak', attrs: { title: 'Practice', isCheckpoint: true } },
                { type: 'paragraph', content: [{ type: 'text', text: 'work' }] },
                { type: 'sectionBreak', attrs: { title: 'Reflect', isCheckpoint: false } },
                { type: 'paragraph', content: [{ type: 'text', text: 'how did it go' }] },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });
});


describe('lists', () => {
    it('round-trips a simple bullet list', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
                            ],
                        },
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'two' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips an ordered list', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'orderedList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'first' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('preserves marks inside list items', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [
                                        { type: 'text', text: 'plain ' },
                                        { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips inline math inside a list item', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [
                                        { type: 'text', text: 'solve ' },
                                        { type: 'mathInline', attrs: { latex: 'x + 1' } },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips nested bullet lists', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'outer' }] },
                                {
                                    type: 'bulletList',
                                    content: [
                                        {
                                            type: 'listItem',
                                            content: [
                                                { type: 'paragraph', content: [{ type: 'text', text: 'inner' }] },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('round-trips mixed bullet/ordered nesting', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'orderedList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'Step 1' }] },
                                {
                                    type: 'bulletList',
                                    content: [
                                        {
                                            type: 'listItem',
                                            content: [
                                                { type: 'paragraph', content: [{ type: 'text', text: 'detail a' }] },
                                            ],
                                        },
                                        {
                                            type: 'listItem',
                                            content: [
                                                { type: 'paragraph', content: [{ type: 'text', text: 'detail b' }] },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(roundTrip(doc)).toEqual(doc);
    });

    it('produces a schema-valid intermediate for a list', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [{ type: 'paragraph', content: [] }],
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });
    describe('fill_in_blank with blanks', () => {
        it('round-trips a fillInBlank with one blank carrying all four fields', () => {
            const blankAttrs = {
                id: 'blank-1',
                answer: '2x + 6',
                acceptableAnswers: ['2x+6', '6 + 2x'],
                interchangeableWithPrevious: false,
                answerType: 'text',
                hint: [{ type: 'text', text: 'Distribute the 2.', marks: [] }],
                mistakeFeedback: [
                    {
                        match: '2x + 3',
                        feedback: [
                            {
                                type: 'text',
                                text: 'Did you forget to distribute to the 3?',
                                marks: [],
                            },
                        ],
                    },
                    {
                        match: 'x + 6',
                        feedback: [
                            { type: 'text', text: 'Distribute the 2 to both terms.', marks: [] },
                        ],
                    },
                ],
            };
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-1' },
                        content: [
                            { type: 'text', text: 'Simplify: 2(x + 3) = ' },
           { type: 'blank', attrs: blankAttrs },
                        ],
                    },
                ],
            };
            const result = roundTrip(doc);
            // fillInBlank.attrs.id is intentionally re-minted by tiptapBlockToActivity
            // (per the file header convention); assert on content shape rather than
            // full doc equality. Blank ids ARE preserved.
            const fib = result.content?.[0] as JSONContent;
            expect(fib.type).toBe('fillInBlank');
            expect(fib.content).toEqual([
                { type: 'text', text: 'Simplify: 2(x + 3) = ' },
                                        { type: 'blank', attrs: blankAttrs },
            ]);
        });

        it('round-trips a fillInBlank with a blank that has no optional fields', () => {
            const blankAttrs = {
                id: 'blank-2',
                answer: '5',
                acceptableAnswers: [],
                interchangeableWithPrevious: false,
                answerType: 'text',
            };
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-2' },
                        content: [
                            { type: 'text', text: 'Solve: x = ' },
                            { type: 'blank', attrs: blankAttrs },
                        ],
                    },
                ],
            };
            const result = roundTrip(doc);
            const fib = result.content?.[0] as JSONContent;
            expect(fib.type).toBe('fillInBlank');
            expect(fib.content).toEqual([
                { type: 'text', text: 'Solve: x = ' },
                { type: 'blank', attrs: blankAttrs },
            ]);
        });

        it('round-trips a numeric blank with tolerance', () => {
            const blankAttrs = {
                id: 'blank-3',
                answer: '3.14',
                acceptableAnswers: [],
                interchangeableWithPrevious: false,
                answerType: 'numeric',
                tolerance: 0.01,
            };
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-3' },
                        content: [
                            { type: 'text', text: 'Pi is about ' },
                            { type: 'blank', attrs: blankAttrs },
                        ],
                    },
                ],
            };
            const result = roundTrip(doc);
            const fib = result.content?.[0] as JSONContent;
            expect(fib.content).toEqual([
                { type: 'text', text: 'Pi is about ' },
                { type: 'blank', attrs: blankAttrs },
            ]);
        });

        it('round-trips a multiple_choice block (choices, multiSelect, feedback, solution)', () => {
            const choiceA = '550e8400-e29b-41d4-a716-446655440101';
            const choiceB = '550e8400-e29b-41d4-a716-446655440102';
            const attrs = {
                id: 'mc-1',
                choices: [
                    {
                        id: choiceA,
                        content: [{ type: 'text', text: '4', marks: [] }],
                        correct: true,
                        feedback: [
                            { type: 'text', text: 'Right — 2 + 2 = 4.', marks: [] },
                        ],
                    },
                    {
                        id: choiceB,
                        content: [{ type: 'math_inline', latex: '\\sqrt{25}' }],
                        correct: false,
                    },
                ],
                multiSelect: false,
                solution: [{ type: 'text', text: 'Add them.', marks: [] }],
                hasConfidenceRating: true,
                skills: [],
                workSpace: null,
            };
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'multipleChoice',
                        attrs,
                        content: [{ type: 'text', text: 'What is 2 + 2?' }],
                    },
                ],
            };
            const result = roundTrip(doc);
            const mc = result.content?.[0] as JSONContent;
            expect(mc.type).toBe('multipleChoice');
            // Block id is re-minted (file-header convention); choice ids are
            // preserved — they key the submission's choices map.
            expect(mc.attrs).toMatchObject({
                choices: attrs.choices,
                multiSelect: false,
                solution: attrs.solution,
                hasConfidenceRating: true,
            });
            expect(mc.content).toEqual([
                { type: 'text', text: 'What is 2 + 2?' },
            ]);
        });

        it('pads a multiple_choice below two choices instead of dropping it', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'multipleChoice',
                        attrs: {
                            id: 'mc-2',
                            choices: [
                                {
                                    id: '550e8400-e29b-41d4-a716-446655440103',
                                    content: [],
                                    correct: true,
                                },
                            ],
                            multiSelect: false,
                        },
                        content: [],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = flatBlocks(activity.sections[0]!)[0]!;
            expect(block.type).toBe('multiple_choice');
            if (block.type === 'multiple_choice') {
                expect(block.choices).toHaveLength(2);
            }
        });

        it('round-trips a matching block (items, targets, key, reuse, figure)', () => {
            const i1 = '550e8400-e29b-41d4-a716-446655440201';
            const i2 = '550e8400-e29b-41d4-a716-446655440202';
            const t1 = '550e8400-e29b-41d4-a716-446655440211';
            const t2 = '550e8400-e29b-41d4-a716-446655440212';
            const t3 = '550e8400-e29b-41d4-a716-446655440213';
            const attrs = {
                id: 'match-1',
                items: [
                    {
                        id: i1,
                        content: [{ type: 'text', text: 'y = 2x', marks: [] }],
                        image: { src: 'https://example.com/a.png', alt: 'line' },
                    },
                    {
                        id: i2,
                        content: [{ type: 'math_inline', latex: 'y = -x' }],
                    },
                ],
                targets: [
                    { id: t1, content: [{ type: 'text', text: '2', marks: [] }] },
                    { id: t2, content: [{ type: 'text', text: '-1', marks: [] }] },
                    { id: t3, content: [{ type: 'text', text: '0', marks: [] }] },
                ],
                key: { [i1]: t1, [i2]: t2 },
                allowTargetReuse: false,
                solution: [{ type: 'text', text: 'Read the slope.', marks: [] }],
                hasConfidenceRating: true,
                skills: [],
                workSpace: null,
            };
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'matching',
                        attrs,
                        content: [{ type: 'text', text: 'Match each slope.' }],
                    },
                ],
            };
            const result = roundTrip(doc);
            const match = result.content?.[0] as JSONContent;
            expect(match.type).toBe('matching');
            // Block id is re-minted; item/target ids are preserved — they key
            // the submission's pairs map.
            expect(match.attrs).toMatchObject({
                items: attrs.items,
                targets: attrs.targets,
                key: attrs.key,
                allowTargetReuse: false,
                solution: attrs.solution,
                hasConfidenceRating: true,
            });
            expect(match.content).toEqual([
                { type: 'text', text: 'Match each slope.' },
            ]);
        });

        it('sanitizes a matching key: dangling refs dropped; duplicate targets collapsed without reuse', () => {
            const i1 = '550e8400-e29b-41d4-a716-446655440221';
            const i2 = '550e8400-e29b-41d4-a716-446655440222';
            const t1 = '550e8400-e29b-41d4-a716-446655440231';
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'matching',
                        attrs: {
                            id: 'match-2',
                            items: [
                                { id: i1, content: [] },
                                { id: i2, content: [] },
                            ],
                            targets: [
                                { id: t1, content: [] },
                                {
                                    id: '550e8400-e29b-41d4-a716-446655440232',
                                    content: [],
                                },
                            ],
                            key: {
                                [i1]: t1,
                                [i2]: t1, // duplicate use without reuse
                                'not-an-item': t1, // dangling item
                            },
                            allowTargetReuse: false,
                        },
                        content: [],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = flatBlocks(activity.sections[0]!)[0]!;
            expect(block.type).toBe('matching');
            if (block.type === 'matching') {
                expect(block.key).toEqual({ [i1]: t1 });
            }
        });

        it('round-trips an ordering block (authored order preserved)', () => {
            const o1 = '550e8400-e29b-41d4-a716-446655440241';
            const o2 = '550e8400-e29b-41d4-a716-446655440242';
            const o3 = '550e8400-e29b-41d4-a716-446655440243';
            const attrs = {
                id: 'order-1',
                items: [
                    { id: o1, content: [{ type: 'text', text: 'Subtract 3', marks: [] }] },
                    { id: o2, content: [{ type: 'text', text: 'Divide by 2', marks: [] }] },
                    { id: o3, content: [{ type: 'text', text: 'Check', marks: [] }] },
                ],
                solution: null,
                hasConfidenceRating: false,
                skills: [],
                workSpace: null,
            };
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'ordering',
                        attrs,
                        content: [{ type: 'text', text: 'Order the steps.' }],
                    },
                ],
            };
            const result = roundTrip(doc);
            const ordering = result.content?.[0] as JSONContent;
            expect(ordering.type).toBe('ordering');
            expect(ordering.attrs).toMatchObject({ items: attrs.items });
            expect(ordering.content).toEqual([
                { type: 'text', text: 'Order the steps.' },
            ]);
        });

        it('drops a stray tolerance on a text blank (meaningless without numeric)', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-4' },
                        content: [
                            {
                                type: 'blank',
                                attrs: {
                                    id: 'blank-4',
                                    answer: 'five',
                                    acceptableAnswers: [],
                                    interchangeableWithPrevious: false,
                                    answerType: 'text',
                                    tolerance: 0.5,
                                },
                            },
                        ],
                    },
                ],
            };
            const result = roundTrip(doc);
            const fib = result.content?.[0] as JSONContent;
            const blank = fib.content?.[0] as JSONContent;
            expect(blank.attrs).not.toHaveProperty('tolerance');
            expect(blank.attrs).toMatchObject({ answerType: 'text' });
        });
    });

    describe('fill_in_blank block-level fields (Stage 15)', () => {
        it('round-trips solution, hasConfidenceRating, and skills', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: {
                            id: 'fib-1',
                            solution: [
                                {
                                    type: 'text',
                                    text: 'Distribute the 2 to get 2x + 6.',
                                    marks: [],
                                },
                            ],
                            hasConfidenceRating: true,
                            skills: ['distributing', 'simplifying'],
                        },
                        content: [
                            { type: 'text', text: 'Simplify: 2(x + 3) = ' },
                            {
                                type: 'blank',
                                attrs: {
                                    id: 'blank-1',
                                    answer: '2x + 6',
                                    acceptableAnswers: [],
                                },
                            },
                        ],
                    },
                ],
            };
            const result = roundTrip(doc);
            const fib = result.content?.[0] as JSONContent;
            expect(fib.attrs?.solution).toEqual([
                { type: 'text', text: 'Distribute the 2 to get 2x + 6.', marks: [] },
            ]);
            expect(fib.attrs?.hasConfidenceRating).toBe(true);
            expect(fib.attrs?.skills).toEqual(['distributing', 'simplifying']);
        });

        it('passes block fields into the ActivityDocument', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: {
                            id: 'fib-1',
                            solution: [
                                { type: 'text', text: 'Worked answer.', marks: [] },
                            ],
                            hasConfidenceRating: true,
                            skills: ['factoring'],
                        },
                        content: [
                            {
                                type: 'blank',
                                attrs: {
                                    id: 'b1',
                                    answer: '5',
                                    acceptableAnswers: [],
                                },
                            },
                        ],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = flatBlocks(activity.sections[0]!)[0]!;
            expect(block.type).toBe('fill_in_blank');
            if (block.type !== 'fill_in_blank') throw new Error('unreachable');
            expect(block.solution).toEqual([
                { type: 'text', text: 'Worked answer.', marks: [] },
            ]);
            expect(block.hasConfidenceRating).toBe(true);
            expect(block.skills).toEqual(['factoring']);
        });

        it('defaults block fields when the attrs are absent', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-1' },
                        content: [
                            {
                                type: 'blank',
                                attrs: {
                                    id: 'b1',
                                    answer: '5',
                                    acceptableAnswers: [],
                                },
                            },
                        ],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = flatBlocks(activity.sections[0]!)[0]!;
            if (block.type !== 'fill_in_blank') throw new Error('unreachable');
            expect(block.solution).toBeUndefined();
            expect(block.hasConfidenceRating).toBe(false);
            expect(block.skills).toEqual([]);

            // And the reverse direction emits explicit defaults for the editor.
            const back = roundTrip(doc);
            const fib = back.content?.[0] as JSONContent;
            expect(fib.attrs?.solution).toBeNull();
            expect(fib.attrs?.hasConfidenceRating).toBe(false);
            expect(fib.attrs?.skills).toEqual([]);
            expect(fib.attrs?.workSpace).toBeNull();
        });
    });

    describe('fill_in_blank workSpace override (Drop B)', () => {
        it('round-trips a per-problem work-space override', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-1', workSpace: 3 },
                        content: [
                            {
                                type: 'blank',
                                attrs: { id: 'b1', answer: '5', acceptableAnswers: [] },
                            },
                        ],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = flatBlocks(activity.sections[0]!)[0]!;
            if (block.type !== 'fill_in_blank') throw new Error('unreachable');
            expect(block.workSpace).toBe(3);

            const back = roundTrip(doc);
            const fib = back.content?.[0] as JSONContent;
            expect(fib.attrs?.workSpace).toBe(3);
        });

        it('leaves workSpace off the block when absent (inherits default)', () => {
            const doc: JSONContent = {
                type: 'doc',
                content: [
                    {
                        type: 'fillInBlank',
                        attrs: { id: 'fib-1' },
                        content: [
                            {
                                type: 'blank',
                                attrs: { id: 'b1', answer: '5', acceptableAnswers: [] },
                            },
                        ],
                    },
                ],
            };
            const activity = tiptapToActivity(doc, META);
            const block = flatBlocks(activity.sections[0]!)[0]!;
            if (block.type !== 'fill_in_blank') throw new Error('unreachable');
            expect(block.workSpace).toBeUndefined();
        });
    });
});

describe('rows (multi-column layout)', () => {
    it('round-trips a two-column block preserving cell content and order', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1' },
                    content: [
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'left' }] },
                            ],
                        },
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'right' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        // columns.attrs.id is re-minted by tiptapBlockToActivity (file-header
        // convention), so assert on the content shape rather than the id.
        const result = roundTrip(doc);
        const cols = result.content?.[0] as JSONContent;
        expect(cols.type).toBe('row');
        expect(cols.content).toEqual([
            {
                type: 'column',
                attrs: {},
                content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'left' }] },
                ],
            },
            {
                type: 'column',
                attrs: {},
                content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'right' }] },
                ],
            },
        ]);
    });

    it('round-trips an interactive_graph inside a column (Drop 1)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1' },
                    content: [
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                {
                                    type: 'interactiveGraph',
                                    attrs: {
                                        id: 'g',
                                        axisConfig: {
                                            xMin: -6, xMax: 6, yMin: -6, yMax: 6,
                                            xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true,
                                        },
                                        interaction: { type: 'plot_point', correctPoints: [[1, 2]], tolerance: 0.1 },
                                        solution: null,
                                        hasConfidenceRating: false,
                                        skills: [],
                                    },
                                    content: [{ type: 'text', text: 'Plot (1, 2).' }],
                                },
                            ],
                        },
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'Notes' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        // The graph survives the round-trip inside the cell...
        const back = roundTrip(doc);
        const cols = back.content?.[0] as JSONContent;
        const firstCell = cols.content?.[0] as JSONContent;
        expect(firstCell.content?.[0]?.type).toBe('interactiveGraph');
        expect(firstCell.content?.[0]?.attrs?.interaction).toEqual({
            type: 'plot_point', correctPoints: [[1, 2]], tolerance: 0.1,
        });
        // ...and the assembled activity is schema-valid (the ColumnCellBlock
        // union now admits interactive_graph).
        const activity = tiptapToActivity(doc, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
        const block = activity.sections[0]!.rows[0]!;
        expect(block.columns[0]!.blocks[0]!.type).toBe('interactive_graph');
    });

    it('preserves a per-column width weight', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1' },
                    content: [
                        {
                            type: 'column',
                            attrs: { width: 2 },
                            content: [{ type: 'paragraph', content: [] }],
                        },
                        {
                            type: 'column',
                            attrs: {},
                            content: [{ type: 'paragraph', content: [] }],
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.rows[0]!;
        expect(block.columns[0]!.width).toBe(2);
        expect(block.columns[1]!.width).toBeUndefined();

        const back = roundTrip(doc);
        const cols = back.content?.[0] as JSONContent;
        const cells = cols.content as JSONContent[];
        expect(cells[0]!.attrs).toEqual({ width: 2 });
        expect(cells[1]!.attrs).toEqual({});
    });

    it('numbers nested fill-in-blanks column-major in the ActivityDocument', () => {
        const fib = (id: string): JSONContent => ({
            type: 'fillInBlank',
            attrs: { id },
            content: [
                { type: 'blank', attrs: { id: id + '-b', answer: '1', acceptableAnswers: [] } },
            ],
        });
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1' },
                    content: [
                        { type: 'column', attrs: {}, content: [fib('a'), fib('b')] },
                        { type: 'column', attrs: {}, content: [fib('c')] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.rows[0]!;
        // Column-major cell order is structural here; the renderer assigns the
        // visible numbers by walking cells in array order (verified in the
        // renderer's columns.test.ts). This asserts the serialize layer keeps
        // cells and their blocks in that order.
        expect(block.columns[0]!.blocks.map((b) => b.type)).toEqual([
            'fill_in_blank',
            'fill_in_blank',
        ]);
        expect(block.columns[1]!.blocks.map((b) => b.type)).toEqual([
            'fill_in_blank',
        ]);
    });

    it('produces a schema-valid intermediate for a columns block', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1' },
                    content: [
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('emits a `row` node with one cell per column for a multi-column Row', () => {
        // Load direction: a stored multi-column Row becomes a `row` node whose
        // cells are `column` nodes, one per schema Column, content preserved.
        const activity = ActivityDocument.parse({
            schemaVersion: 2,
            meta: META,
            sections: [
                {
                    id: crypto.randomUUID(),
                    isCheckpoint: false,
                    rows: [
                        {
                            id: crypto.randomUUID(),
                            gridLines: 'inherit',
                            columns: [
                                {
                                    id: crypto.randomUUID(),
                                    blocks: [
                                        { id: crypto.randomUUID(), type: 'paragraph', content: [] },
                                    ],
                                },
                                {
                                    id: crypto.randomUUID(),
                                    blocks: [
                                        {
                                            id: crypto.randomUUID(),
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'x', marks: [] }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        const tiptap = activityToTiptap(activity);
        const row = tiptap.content?.[0] as JSONContent;
        expect(row.type).toBe('row');
        const cells = row.content as JSONContent[];
        expect(cells).toHaveLength(2);
        expect(cells[0]!.type).toBe('column');
    });

    it('round-trips an explicit gridLines override', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1', gridLines: 'on' },
                    content: [
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.rows[0]!;
        expect(block.gridLines).toBe('on');

        const back = roundTrip(doc);
        const cols = back.content?.[0] as JSONContent;
        expect(cols.attrs?.gridLines).toBe('on');
    });

    it("defaults gridLines to 'inherit' when the attr is absent", () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1' },
                    content: [
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.rows[0]!;
        expect(block.gridLines).toBe('inherit');
    });

    it("falls back to 'inherit' for an unknown gridLines attr", () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1', gridLines: 'bogus' },
                    content: [
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                        { type: 'column', attrs: {}, content: [{ type: 'paragraph', content: [] }] },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.rows[0]!;
        expect(block.gridLines).toBe('inherit');
    });
});

// Reshape pin (Option A pragmatic bridge): the editor keeps a bare block stream
// for single-column content; serialize wraps it into a clean 1-col schema Row on
// save and unwraps it back on load. Round-trip must be lossless.
describe('rows-of-columns bridge (single-column ↔ bare blocks)', () => {
    const paras = (...texts: string[]): JSONContent[] =>
        texts.map((t) => ({ type: 'paragraph', content: [{ type: 'text', text: t }] }));

    it('wraps consecutive bare top-level blocks into ONE full-width 1-col Row', () => {
        const doc: JSONContent = { type: 'doc', content: paras('a', 'b', 'c') };
        const activity = tiptapToActivity(doc, META);
        const section = activity.sections[0]!;
        expect(section.rows).toHaveLength(1);
        expect(section.rows[0]!.columns).toHaveLength(1);
        expect(section.rows[0]!.columns[0]!.blocks.map((b) => b.type)).toEqual([
            'paragraph',
            'paragraph',
            'paragraph',
        ]);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('unwraps a 1-col Row back to a bare block stream (no `row` node)', () => {
        const activity = tiptapToActivity({ type: 'doc', content: paras('x', 'y') }, META);
        const tiptap = activityToTiptap(activity);
        expect(tiptap.content?.map((n) => n.type)).toEqual(['paragraph', 'paragraph']);
    });

    it('is lossless across a bare-blocks + multi-col-row round-trip', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                ...paras('intro'),
                {
                    type: 'row',
                    attrs: { id: 'r1' },
                    content: [
                        { type: 'column', attrs: {}, content: paras('left') },
                        { type: 'column', attrs: {}, content: paras('right') },
                    ],
                },
                ...paras('outro'),
            ],
        };
        const back = roundTrip(doc);
        expect(back.content?.map((n) => n.type)).toEqual([
            'paragraph', // intro (unwrapped 1-col row)
            'row', // the authored multi-col region
            'paragraph', // outro (unwrapped 1-col row)
        ]);
    });
});

describe('image', () => {
    it('round-trips src + alt + caption', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'image',
                    attrs: {
                        id: 'img-1',
                        src: 'https://example.com/photo.png',
                        alt: 'A photo',
                        caption: 'Figure 1',
                    },
                },
            ],
        };
        // id is re-minted by tiptapBlockToActivity (file-header convention), so
        // assert on the content-bearing attrs rather than the id.
        const back = roundTrip(doc);
        const img = back.content?.[0] as JSONContent;
        expect(img.type).toBe('image');
        expect(img.attrs?.src).toBe('https://example.com/photo.png');
        expect(img.attrs?.alt).toBe('A photo');
        expect(img.attrs?.caption).toBe('Figure 1');
    });

    it('omits caption when empty (round-trip yields empty-string caption)', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'image',
                    attrs: {
                        id: 'img-1',
                        src: 'https://example.com/photo.png',
                        alt: '',
                        caption: '',
                    },
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type !== 'image') throw new Error('unreachable');
        expect(block.caption).toBeUndefined();

        // The editor direction always emits a caption attr (defaulting to '')
        // so the node's attr shape is stable.
        const back = roundTrip(doc);
        const img = back.content?.[0] as JSONContent;
        expect(img.attrs?.caption).toBe('');
    });

    it('drops an image with an empty src', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                { type: 'image', attrs: { id: 'img-1', src: '', alt: '', caption: '' } },
                { type: 'paragraph', content: [{ type: 'text', text: 'after' }] },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const types = flatBlocks(activity.sections[0]!).map((b) => b.type);
        expect(types).toEqual(['paragraph']);
    });

    it('produces a schema-valid intermediate', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'image',
                    attrs: {
                        id: 'img-1',
                        src: 'https://example.com/photo.png',
                        alt: 'alt',
                        caption: '',
                    },
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('round-trips an image nested inside a column', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'row',
                    attrs: { id: 'cols-1' },
                    content: [
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                {
                                    type: 'image',
                                    attrs: {
                                        id: 'img-1',
                                        src: 'https://example.com/a.png',
                                        alt: 'a',
                                        caption: '',
                                    },
                                },
                            ],
                        },
                        {
                            type: 'column',
                            attrs: {},
                            content: [
                                { type: 'paragraph', content: [{ type: 'text', text: 'right' }] },
                            ],
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = activity.sections[0]!.rows[0]!;
        expect(block.columns[0]!.blocks.map((b) => b.type)).toEqual(['image']);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });
});

describe('attrs-stored inline content sanitize', () => {
    // Regression for the markdown-importer bug (fixed at the importer in
    // aa8ffd3): Tiptap-shaped inline nodes stored in attrs — no `marks`
    // array, `mathInline` instead of `math_inline` — crashed
    // activityInlineToTiptap and the renderer. The serialize boundary now
    // validates every attrs-stored InlineNode[] with the schema: malformed
    // entries drop, valid ones keep, and the marks default fills in.
    const tiptapShapedContent = [
        { type: 'text', text: 'kept, marks filled' }, // no marks — valid, default fills
        { type: 'mathInline', attrs: { latex: 'x^2' } }, // Tiptap name — dropped
        { type: 'text', text: 42 }, // wrong text type — dropped
        { type: 'math_inline', latex: '\\pi' }, // canonical — kept
    ];
    const sanitized = [
        { type: 'text', text: 'kept, marks filled', marks: [] },
        { type: 'math_inline', latex: '\\pi' },
    ];

    it('sanitizes multiple_choice choice content, feedback, and solution', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'multipleChoice',
                    attrs: {
                        choices: [
                            {
                                id: '550e8400-e29b-41d4-a716-446655440301',
                                content: tiptapShapedContent,
                                correct: true,
                                feedback: tiptapShapedContent,
                            },
                            {
                                id: '550e8400-e29b-41d4-a716-446655440302',
                                // Entirely malformed feedback sanitizes to
                                // empty → the optional key is omitted.
                                content: [],
                                correct: false,
                                feedback: [{ type: 'mathInline' }],
                            },
                        ],
                        solution: tiptapShapedContent,
                    },
                    content: [],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type !== 'multiple_choice') throw new Error('unreachable');
        expect(block.choices[0]!.content).toEqual(sanitized);
        expect(block.choices[0]!.feedback).toEqual(sanitized);
        expect(block.choices[1]!.feedback).toBeUndefined();
        expect(block.solution).toEqual(sanitized);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('sanitizes matching item/target content and ordering item content', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'matching',
                    attrs: {
                        items: [
                            { id: '550e8400-e29b-41d4-a716-446655440401', content: tiptapShapedContent },
                            { id: '550e8400-e29b-41d4-a716-446655440402', content: [] },
                        ],
                        targets: [
                            { id: '550e8400-e29b-41d4-a716-446655440411', content: tiptapShapedContent },
                            { id: '550e8400-e29b-41d4-a716-446655440412', content: [] },
                        ],
                        key: {},
                        solution: tiptapShapedContent,
                    },
                    content: [],
                },
                {
                    type: 'ordering',
                    attrs: {
                        items: [
                            { id: '550e8400-e29b-41d4-a716-446655440421', content: tiptapShapedContent },
                            { id: '550e8400-e29b-41d4-a716-446655440422', content: 'not-an-array' },
                        ],
                        solution: tiptapShapedContent,
                    },
                    content: [],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const [matching, ordering] = flatBlocks(activity.sections[0]!);
        if (matching?.type !== 'matching') throw new Error('unreachable');
        expect(matching.items[0]!.content).toEqual(sanitized);
        expect(matching.targets[0]!.content).toEqual(sanitized);
        expect(matching.solution).toEqual(sanitized);
        if (ordering?.type !== 'ordering') throw new Error('unreachable');
        expect(ordering.items[0]!.content).toEqual(sanitized);
        expect(ordering.items[1]!.content).toEqual([]);
        expect(ordering.solution).toEqual(sanitized);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('sanitizes interactive_graph solution and mistakeFeedback', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'interactiveGraph',
                    attrs: {
                        solution: tiptapShapedContent,
                        mistakeFeedback: [
                            { match: '(1, 2)', feedback: tiptapShapedContent },
                            { match: 42, feedback: [] }, // bad match — dropped
                            'garbage', // not an object — dropped
                            // Same drop rules as the blank path (shared
                            // sanitizeMistakeFeedback): empty match and
                            // feedback that sanitizes to empty both drop.
                            { match: '', feedback: tiptapShapedContent },
                            { match: 'y = x', feedback: [{ type: 'mathInline' }] },
                        ],
                    },
                    content: [],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type !== 'interactive_graph') throw new Error('unreachable');
        expect(block.solution).toEqual(sanitized);
        expect(block.mistakeFeedback).toEqual([
            { match: '(1, 2)', feedback: sanitized },
        ]);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('sanitizes blank hint and mistakeFeedback', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'fillInBlank',
                    attrs: { solution: tiptapShapedContent },
                    content: [
                        {
                            type: 'blank',
                            attrs: {
                                id: '550e8400-e29b-41d4-a716-446655440303',
                                answer: '7',
                                hint: tiptapShapedContent,
                                mistakeFeedback: [
                                    { match: '5', feedback: tiptapShapedContent },
                                    // Feedback sanitizes to empty → entry drops
                                    // (same posture as empty-feedback entries).
                                    { match: '6', feedback: [{ type: 'mathInline' }] },
                                ],
                            },
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type !== 'fill_in_blank') throw new Error('unreachable');
        expect(block.solution).toEqual(sanitized);
        const blank = block.content[0]!;
        if (blank.type !== 'blank') throw new Error('unreachable');
        expect(blank.hint).toEqual(sanitized);
        expect(blank.mistakeFeedback).toEqual([
            { match: '5', feedback: sanitized },
        ]);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('sanitizes definition mark content', () => {
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'vertex',
                            marks: [
                                {
                                    type: 'definition',
                                    attrs: { content: tiptapShapedContent },
                                },
                            ],
                        },
                        {
                            type: 'text',
                            text: 'slope',
                            marks: [
                                {
                                    type: 'definition',
                                    // Entirely malformed content sanitizes to
                                    // empty; with no image the mark drops.
                                    attrs: { content: [{ type: 'mathInline' }] },
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type !== 'paragraph') throw new Error('unreachable');
        const [vertex, slope] = block.content;
        if (vertex?.type !== 'text') throw new Error('unreachable');
        expect(vertex.marks).toEqual([
            { type: 'definition', content: sanitized },
        ]);
        if (slope?.type !== 'text') throw new Error('unreachable');
        expect(slope.marks).toEqual([]);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });

    it('definition content rejects what InlineNode allows (no nested definitions)', () => {
        // Pins the narrowness of sanitizeDefinitionContent: a text node
        // carrying a nested definition mark is valid InlineNode content but
        // NOT valid DefinitionContentInline (SimpleMark only), so it drops
        // from a popover while plain text beside it survives. Guards against
        // accidentally swapping in the wider InlineNode schema.
        const nested = [
            { type: 'text', text: 'plain survives', marks: [] },
            {
                type: 'text',
                text: 'nested definition drops',
                marks: [
                    { type: 'definition', content: [{ type: 'text', text: 'inner', marks: [] }] },
                ],
            },
        ];
        const doc: JSONContent = {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'radius',
                            marks: [{ type: 'definition', attrs: { content: nested } }],
                        },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity(doc, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type !== 'paragraph') throw new Error('unreachable');
        const [radius] = block.content;
        if (radius?.type !== 'text') throw new Error('unreachable');
        expect(radius.marks).toEqual([
            {
                type: 'definition',
                content: [{ type: 'text', text: 'plain survives', marks: [] }],
            },
        ]);
        expect(() => ActivityDocument.parse(activity)).not.toThrow();
    });
});

describe('content blocks — learning_objectives + worked_example', () => {
    it('round-trips a learning-objectives block (title + items)', () => {
        const node: JSONContent = {
            type: 'learningObjectives',
            attrs: { id: 'ignored-regenerated', title: 'Goals for today' },
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Solve linear equations' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'Graph a line' }] },
            ],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const lo = out.content!.find((n) => n.type === 'learningObjectives')!;
        expect(lo.attrs!.title).toBe('Goals for today');
        expect(lo.content).toEqual(node.content);
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips a worked-example block with nested content', () => {
        const node: JSONContent = {
            type: 'workedExample',
            attrs: { id: 'ignored-regenerated', title: 'Solving 2x + 3 = 11' },
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Subtract 3 from both sides.' }] },
                { type: 'mathBlock', attrs: { latex: 'x = 4' } },
            ],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const we = out.content!.find((n) => n.type === 'workedExample')!;
        expect(we.attrs!.title).toBe('Solving 2x + 3 = 11');
        expect(we.content!.map((c) => c.type)).toEqual(['paragraph', 'mathBlock']);
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips a self-explanation block (prompt + placeholder)', () => {
        const node: JSONContent = {
            type: 'selfExplanation',
            attrs: { id: 'ignored', placeholder: 'I know this because…' },
            content: [{ type: 'text', text: 'Explain your reasoning.' }],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const se = out.content!.find((n) => n.type === 'selfExplanation')!;
        expect(se.attrs!.placeholder).toBe('I know this because…');
        expect(se.content).toEqual([
            { type: 'text', text: 'Explain your reasoning.' },
        ]);
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('drops an empty placeholder from a self-explanation block', () => {
        const node: JSONContent = {
            type: 'selfExplanation',
            attrs: { id: 'x', placeholder: '' },
            content: [{ type: 'text', text: 'Explain.' }],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        expect(block.type).toBe('self_explanation');
        if (block.type === 'self_explanation') {
            expect(block.placeholder).toBeUndefined();
        }
    });

    it('round-trips a short-answer block (prompt + placeholder)', () => {
        const node: JSONContent = {
            type: 'shortAnswer',
            attrs: { id: 'x', placeholder: 'In your own words…' },
            content: [{ type: 'text', text: 'Summarize the passage.' }],
        };
        const out = roundTrip({ type: 'doc', content: [node] });
        const sa = out.content!.find((n) => n.type === 'shortAnswer')!;
        expect(sa.attrs!.placeholder).toBe('In your own words…');
        expect(sa.content).toEqual([{ type: 'text', text: 'Summarize the passage.' }]);
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips an essay block with a word-count target', () => {
        const node: JSONContent = {
            type: 'essay',
            attrs: { id: 'x', placeholder: '', wordMin: 200, wordMax: 300 },
            content: [{ type: 'text', text: 'Write a persuasive essay.' }],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        expect(block.type).toBe('essay');
        if (block.type === 'essay') {
            expect(block.wordCountHint).toEqual({ min: 200, max: 300 });
        }
        // And back to Tiptap with the targets intact.
        const out = activityToTiptap(activity);
        const es = out.content!.find((n) => n.type === 'essay')!;
        expect(es.attrs!.wordMin).toBe(200);
        expect(es.attrs!.wordMax).toBe(300);
    });

    it('round-trips a rubric on a short-answer block', () => {
        const rubric = {
            criteria: [
                {
                    id: '11111111-1111-4111-8111-111111111111',
                    label: 'Thesis clarity',
                    maxPoints: 4,
                },
                {
                    id: '11111111-1111-4111-8111-111111111112',
                    label: 'Evidence',
                    maxPoints: 6,
                    description: 'Cites two sources.',
                },
            ],
        };
        const node: JSONContent = {
            type: 'shortAnswer',
            attrs: { id: 'x', placeholder: '', rubric },
            content: [{ type: 'text', text: 'Summarize.' }],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type === 'short_answer') {
            expect(block.rubric).toEqual(rubric);
        }
        const out = activityToTiptap(activity);
        const sa = out.content!.find((n) => n.type === 'shortAnswer')!;
        expect(sa.attrs!.rubric).toEqual(rubric);
    });

    it('sanitizes a rubric per criterion — invalid ones drop, valid survive', () => {
        const node: JSONContent = {
            type: 'essay',
            attrs: {
                id: 'x',
                placeholder: '',
                wordMin: null,
                wordMax: null,
                rubric: {
                    criteria: [
                        { id: '11111111-1111-4111-8111-111111111111', label: 'Valid', maxPoints: 4 },
                        { id: '11111111-1111-4111-8111-111111111112', label: '', maxPoints: 4 }, // empty label mid-edit
                        { id: 'not-a-uuid', label: 'Bad id', maxPoints: 2 },
                    ],
                },
            },
            content: [{ type: 'text', text: 'Write.' }],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type === 'essay') {
            expect(block.rubric?.criteria.map((c) => c.label)).toEqual(['Valid']);
        }
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('drops a rubric entirely when no valid criterion remains', () => {
        const node: JSONContent = {
            type: 'shortAnswer',
            attrs: { id: 'x', placeholder: '', rubric: { criteria: [{ label: '' }] } },
            content: [{ type: 'text', text: 'Q' }],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        if (block.type === 'short_answer') {
            expect(block.rubric).toBeUndefined();
        }
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('drops an inverted essay word-count range on publish (schema refine)', () => {
        const node: JSONContent = {
            type: 'essay',
            attrs: { id: 'x', placeholder: '', wordMin: 300, wordMax: 200 },
            content: [{ type: 'text', text: 'Write.' }],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        // serialize drops the invalid hint rather than emit a block that fails Zod.
        if (block.type === 'essay') {
            expect(block.wordCountHint).toBeUndefined();
        }
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
    });

    it('round-trips a faded worked example with a fill_in_blank step', () => {
        const node: JSONContent = {
            type: 'fadedWorkedExample',
            attrs: { id: 'ignored-regenerated', title: 'Guided practice' },
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'First, subtract 3.' }] },
                {
                    type: 'fillInBlank',
                    attrs: { id: 'ignored' },
                    content: [
                        { type: 'text', text: 'x = ' },
                        { type: 'blank', attrs: { answer: '4', acceptableAnswers: [] } },
                    ],
                },
            ],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        expect(block.type).toBe('faded_worked_example');
        if (block.type === 'faded_worked_example') {
            expect(block.content.map((c) => c.type)).toEqual(['paragraph', 'fill_in_blank']);
        }
        // Absent showStepLabels attr defaults to true (older docs stay labelled).
        if (block.type === 'faded_worked_example') {
            expect(block.showStepLabels).toBe(true);
        }
        // And the block survives a full round-trip back to Tiptap.
        const out = activityToTiptap(activity);
        const fwe = out.content!.find((n) => n.type === 'fadedWorkedExample')!;
        expect(fwe.attrs!.title).toBe('Guided practice');
        expect(fwe.attrs!.showStepLabels).toBe(true);
        expect(fwe.content!.map((c) => c.type)).toEqual(['paragraph', 'fillInBlank']);
    });

    it('round-trips showStepLabels:false on a faded worked example', () => {
        const node: JSONContent = {
            type: 'fadedWorkedExample',
            attrs: { id: 'x', title: 'Guided practice', showStepLabels: false },
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Step.' }] },
            ],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        expect(block.type).toBe('faded_worked_example');
        if (block.type === 'faded_worked_example') {
            expect(block.showStepLabels).toBe(false);
        }
        const out = activityToTiptap(activity);
        const fwe = out.content!.find((n) => n.type === 'fadedWorkedExample')!;
        expect(fwe.attrs!.showStepLabels).toBe(false);
    });

    it('drops a non-content child from a worked example (content-only union)', () => {
        // A fillInBlank pasted into a worked example must not survive to the doc —
        // the schema's WorkedExampleChild union rejects it.
        const node: JSONContent = {
            type: 'workedExample',
            attrs: { id: 'x', title: 'WE' },
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'ok' }] },
                { type: 'fillInBlank', attrs: { id: 'q' }, content: [{ type: 'text', text: 'x=' }] },
            ],
        };
        const activity = tiptapToActivity({ type: 'doc', content: [node] }, META);
        expect(ActivityDocument.safeParse(activity).success).toBe(true);
        const block = flatBlocks(activity.sections[0]!)[0]!;
        expect(block.type).toBe('worked_example');
        if (block.type === 'worked_example') {
            expect(block.content.map((c) => c.type)).toEqual(['paragraph']);
        }
    });
});
