// =============================================================================
// grading/graphs.ts — the graph family, dispatched to graph-kit's pure scorers
// -----------------------------------------------------------------------------
// interactive_graph / number_line / data_plot. This module is deliberately THIN:
// it decodes the wire's `GraphWork` into each scorer's argument shape and calls
// the kit. It contains no geometry of its own, because the kit's scorers are
// already pure, DOM-free, and shared with the published page — importing them
// is what makes graph grading identical on both surfaces by construction rather
// than by corpus agreement.
//
// The wire carries ONE `GraphWork` shape for all three block types (a number
// line is a 1-D graph; a data plot is a categorical one), so the encodings
// differ per family and are decoded here:
//
//   interactive_graph  points = [x, y] pairs, as drawn
//   number_line        points = [value, 0]   — 1-D value in the shared 2-D slot
//   data_plot          points = [index, height] — dotplot values / bin counts /
//                                                 the five box-plot handles
//
// UNANSWERED IS UNSCORED, as everywhere else in the engine: a canvas the
// student never touched returns null, not `false`. `answered` is not on the
// wire, so "no points and no explicit no-solution claim" is the proxy — which
// is exactly right, since an untouched canvas has no handles placed.
// =============================================================================

import {
  scoreBoxplot,
  scoreDotplot,
  scoreFunction,
  scoreFunctionSystem,
  scoreHistogram,
  scoreInequality,
  scoreInequalitySystem,
  scoreNumberLineInterval,
  scoreNumberLinePoints,
  scorePoints,
  scoreRay,
  scoreRegion,
  scoreSegment,
} from '@activity/graph-kit';
import type { GraphWork } from '../../check/wire.js';
import type { ItemVerdict } from './choices.js';

/** The raw (unsanitized) graph-family block, narrowed to what grading reads.
 * Typed loosely on purpose: this walks the raw document, where a block's
 * interaction is a discriminated union the server dispatches by string. */
export interface RawGraphBlock {
  type: string;
  interaction?: Record<string, unknown> & { type?: string };
  /** interactive_graph only. */
  allowNoSolution?: boolean;
  noSolutionCorrect?: boolean;
  /** data_plot only — its answer key is COMPUTED from the dataset. */
  data?: number[];
  config?: Record<string, unknown>;
}

const values1D = (work: GraphWork): number[] =>
  work.points.map(([value]) => value);

const heights = (work: GraphWork): number[] =>
  work.points.map(([, height]) => height);

/** Did the student do anything at all on this canvas? */
function isUntouched(work: GraphWork): boolean {
  if (work.noSolution === true) return false; // an explicit claim IS an answer
  if (work.points.length > 0) return false;
  if (work.parts?.some((p) => (p.points?.length ?? 0) > 0)) return false;
  // An interval answer can be a single dragged bound with no "points".
  if (work.domain && (work.domain.minX !== undefined || work.domain.maxX !== undefined)) {
    return false;
  }
  return true;
}

/**
 * Score one graph-family block.
 *
 * Returns null when the block is unanswered OR when its interaction is a
 * display variant (which takes no input and is not gradable). A caller that
 * receives null must NOT report a verdict for the block.
 */
export function scoreGraphBlock(
  block: RawGraphBlock,
  work: GraphWork,
): ItemVerdict {
  const interaction = block.interaction;
  const type = interaction?.type;
  if (!interaction || !type || type === 'display') return null;

  // The served interaction is the authority. A payload naming a different
  // interaction than the block was served with is a malformed request, not a
  // wrong answer — the handler rejects it before we get here, and this guard
  // means a bug there can never silently mark a student wrong.
  if (work.interaction && work.interaction !== type) return null;

  if (isUntouched(work)) return null;

  // "No solution" is its own answer, gradable only where the author enabled it.
  if (work.noSolution === true) {
    if (block.allowNoSolution !== true) return false;
    return block.noSolutionCorrect === true;
  }

  switch (block.type) {
    case 'interactive_graph':
      return scoreInteractiveGraph(interaction, type, work);
    case 'number_line':
      return scoreNumberLine(interaction, type, work);
    case 'data_plot':
      return scoreDataPlot(block, interaction, type, work);
    default:
      return null;
  }
}

// ---- interactive_graph ------------------------------------------------------

function scoreInteractiveGraph(
  interaction: Record<string, unknown>,
  type: string,
  work: GraphWork,
): ItemVerdict {
  switch (type) {
    case 'plot_point': {
      const correctPoints = interaction.correctPoints as
        | [number, number][]
        | undefined;
      if (!correctPoints?.length) return false;
      return scorePoints(
        { correctPoints, tolerance: num(interaction.tolerance, 0.1) },
        work.points,
      );
    }

    case 'plot_function': {
      const models = interaction.models as GraphModel[] | undefined;
      if (!models?.length) return false;
      // One model = one curve. Several = a system ("graph both lines"), where
      // the student's curves are matched to the models order-independently.
      if (models.length === 1) {
        return scoreFunction(models[0] as never, curveOf(work));
      }
      const curves = (work.parts ?? []).map((p) => p.points ?? []);
      return scoreFunctionSystem(
        models as never[],
        curves.length ? curves : [work.points],
      ).correct;
    }

    case 'graph_inequality': {
      const keys = interaction.inequalities as InequalityKey[] | undefined;
      if (!keys?.length) return false;
      const parts = (work.parts ?? []).map((p) => ({
        points: p.points ?? work.points,
        strict: p.strict === true,
        side: (p.side ?? '') as InequalitySide,
      }));
      if (keys.length === 1) {
        const only = parts[0];
        if (!only) return false;
        return scoreInequality(keys[0] as never, only as never);
      }
      return scoreInequalitySystem(keys as never[], parts as never[]).correct;
    }

    case 'shade_region': {
      const regions = interaction.regions as RegionKey[] | undefined;
      if (!regions?.length) return false;
      // A single authored region is the common case; a system scores when the
      // student's polygon satisfies every target.
      return regions.every((region) => scoreRegion(region as never, work.points));
    }

    case 'plot_ray':
    case 'plot_segment': {
      // The shape and endpoint styles ARE the answer here (a ray pointing the
      // other way is a different claim; open vs closed is the difference
      // between x > 2 and x ≥ 2). Absent shape means the student never chose
      // one — unanswered, not wrong.
      if (work.shape === undefined) return null;
      const piece = {
        points: work.points,
        shape: work.shape,
        endpointStyles: work.endpointStyles ?? [],
      };
      if (type === 'plot_ray') {
        const rays = interaction.rays as unknown[] | undefined;
        if (!rays?.length) return false;
        return rays.every((ray) => scoreRay(ray as never, piece as never));
      }
      const segments = interaction.segments as unknown[] | undefined;
      if (!segments?.length) return false;
      return segments.every((seg) => scoreSegment(seg as never, piece as never));
    }

    default:
      return null;
  }
}

/** A domain-restricted plot_function sends its curve as points; a system sends
 * parts. Either way the single-curve scorer wants one point list. */
function curveOf(work: GraphWork): [number, number][] {
  const first = work.parts?.[0]?.points;
  return first?.length ? first : work.points;
}

// ---- number_line ------------------------------------------------------------

function scoreNumberLine(
  interaction: Record<string, unknown>,
  type: string,
  work: GraphWork,
): ItemVerdict {
  switch (type) {
    case 'plot_point': {
      const correctPoints = interaction.correctPoints as number[] | undefined;
      if (!correctPoints?.length) return false;
      return scoreNumberLinePoints(
        { correctPoints, tolerance: num(interaction.tolerance, 0.1) },
        values1D(work),
      );
    }

    case 'plot_interval': {
      const correctInterval = interaction.correctInterval as
        | Record<string, unknown>
        | undefined;
      if (!correctInterval) return false;
      // Endpoint STYLES ride in `domain` rather than as loose points because
      // they are part of the answer: "2 ≤ x < 7" ≠ "2 < x < 7".
      const d = work.domain ?? {};
      return scoreNumberLineInterval(
        {
          correctInterval: correctInterval as never,
          tolerance: num(interaction.tolerance, 0.1),
        },
        {
          ...(d.minX !== undefined ? { min: d.minX } : {}),
          ...(d.minStyle !== undefined ? { minStyle: d.minStyle } : {}),
          ...(d.maxX !== undefined ? { max: d.maxX } : {}),
          ...(d.maxStyle !== undefined ? { maxStyle: d.maxStyle } : {}),
        },
      );
    }

    default:
      return null;
  }
}

// ---- data_plot --------------------------------------------------------------

function scoreDataPlot(
  block: RawGraphBlock,
  interaction: Record<string, unknown>,
  type: string,
  work: GraphWork,
): ItemVerdict {
  // The answer key is NOT authored — it is computed from the dataset the
  // student was given. That is why `data` is deliberately not stripped by the
  // sanitizer (the registry's documented `derivableFromServed` residual): the
  // student needs the numbers to build the chart. Server-authoritative grading
  // is what stops the client scoring itself from them.
  const data = block.data;
  if (!data?.length) return false;

  switch (type) {
    case 'build_dotplot':
      return scoreDotplot(data, heights(work));

    case 'build_histogram': {
      const config = (block.config ?? {}) as {
        binWidth?: number;
        tickStep?: number;
        min?: number;
        max?: number;
      };
      return scoreHistogram(data, config as never, heights(work));
    }

    case 'build_boxplot': {
      const h = heights(work);
      // Five handles, in order: min, Q1, median, Q3, max. Fewer means the
      // student hasn't placed them all — unanswered rather than wrong.
      if (h.length < 5) return null;
      return scoreBoxplot(data, num(interaction.tolerance, 0.5), {
        min: h[0] as number,
        q1: h[1] as number,
        median: h[2] as number,
        q3: h[3] as number,
        max: h[4] as number,
      });
    }

    default:
      return null;
  }
}

// ---- helpers ----------------------------------------------------------------

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && isFinite(value) ? value : fallback;
}

interface GraphModel {
  family: string;
}
interface InequalityKey {
  boundary: GraphModel;
  strict: boolean;
  shadeSide: string;
}
interface RegionKey {
  correctVertices: [number, number][];
  minOverlap: number;
}
type InequalitySide = 'above' | 'below' | 'left' | 'right';
