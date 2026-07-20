import { z } from 'zod';
import { InlineNode } from '../inline.js';
import { labelFields } from '../label.js';
import { EndpointStyle } from './interactive-graph.js';
import { sizingFields } from '../sizing.js';

// =============================================================================
// number-line.ts — the number_line block (1-D graded, K-8 / early algebra)
// -----------------------------------------------------------------------------
// The 1-D sibling of interactive_graph. The student's answer is GEOMETRIC — a
// point (or several) plotted on a single number line, or an interval/ray with
// open/closed endpoints ("graph x >= -2"). Same three structural consequences
// as the graph block (see docs/design/number-line-block.md): a structured
// answer with its OWN submission map (numberLineResponses, not the blanks map),
// tolerance-based geometric scoring done by the lazy graph-kit (not the
// runtime's string strategies), and a widget that rides @activity/graph-kit.
//
// A SEPARATE block family, not a GraphInteraction variant (author call, STATE
// 2026-07-10): number lines are 1-D and must not be forced under the graph
// block's 2-D AxisConfig. EndpointStyle is shared from interactive-graph.ts —
// it was reserved there "for the future number-line family" from Drop 2.
//
// Slice 1 ships TWO interactions (plot_point, plot_interval), discriminated on
// `type` from day one so plot_ray / display slot in additively later, exactly
// how GraphInteraction grows.
// =============================================================================

// ---- Line configuration -----------------------------------------------------
// The 1-D analogue of AxisConfig. Line units throughout — tolerance and tick
// steps are in the same units, never pixels, so a page that re-lays-out at a
// different width still scores identically.
export const NumberLineConfig = z.object({
  min: z.number(),
  max: z.number(),
  // Spacing between LABELED ticks (line units).
  tickStep: z.number().positive().default(1),
  // Unlabeled minor ticks drawn between each pair of labeled ticks (0 = none).
  // Visual only — never scored.
  minorTicksPerStep: z.number().int().nonnegative().default(0),
  // When true, a dragged handle snaps to the nearest tick (minor if present,
  // else the labeled step). Keyboard nudge always moves by one tick regardless
  // (Shift = fine, one-tenth of a tick).
  snapToTick: z.boolean().default(true),
});
export type NumberLineConfig = z.infer<typeof NumberLineConfig>;

// ---- Interaction variants ---------------------------------------------------
// plot_point: the student places one or more points on the line. Multi-point
// ("plot -2 and 5") is scored consume-once, all-or-nothing — every correct
// position must be matched (mirrors the graph block's N-handle plot_point).
export const NumberLinePointInteraction = z.object({
  type: z.literal('plot_point'),
  // Correct positions in line units. A single point is the common case.
  correctPoints: z.array(z.number()).min(1),
  // Match radius in line units (a point is correct within +/- tolerance).
  tolerance: z.number().nonnegative().default(0.1),
});
export type NumberLinePointInteraction = z.infer<
  typeof NumberLinePointInteraction
>;

// An interval or ray on the line. A present bound carries an open/closed style
// (the inequality distinction: x > 3 open vs x >= 3 closed). An ABSENT bound is
// unbounded that direction — so a ray is just an interval with one side omitted
// ("x >= 3" = min 3 closed, no max; "x < 5" = max 5 open, no min). The shaded
// region is unambiguous from which bounds are present, so no separate side flag
// is needed (unlike the 2-D graph inequality). At least one bound must be
// present (a two-sided-unbounded interval is the whole line — meaningless); the
// factory + author UI guarantee it and the scorer assumes it.
export const NumberLineInterval = z.object({
  min: z.number().optional(),
  minStyle: EndpointStyle.optional(),
  max: z.number().optional(),
  maxStyle: EndpointStyle.optional(),
});
export type NumberLineInterval = z.infer<typeof NumberLineInterval>;

export const NumberLineIntervalInteraction = z.object({
  type: z.literal('plot_interval'),
  correctInterval: NumberLineInterval,
  // Match radius in line units, applied to each present endpoint.
  tolerance: z.number().nonnegative().default(0.1),
});
export type NumberLineIntervalInteraction = z.infer<
  typeof NumberLineIntervalInteraction
>;

// Discriminated on `type` so consumers branch uniformly and the wire format
// always carries it. Growing a variant is a new member here + a new scorer
// branch in the kit — no other block touched.
export const NumberLineInteraction = z.discriminatedUnion('type', [
  NumberLinePointInteraction,
  NumberLineIntervalInteraction,
]);
export type NumberLineInteraction = z.infer<typeof NumberLineInteraction>;

// ---- The block --------------------------------------------------------------
// Auto-numbered like the other question blocks. hasConfidenceRating + skills +
// solution follow the same opt-in patterns FillInBlankBlock / InteractiveGraph
// established. Deliberately LEAN for slice 1 (no partialCredit / allowNoSolution
// / mistakeFeedback) — all-or-nothing scoring (design decision 6); those fields
// are additive later if asked for (YAGNI), exactly as the graph block reserved
// them across drops.
export const NumberLineBlock = z.object({
  id: z.string().uuid(),
  type: z.literal('number_line'),
  number: z.number().int().positive().optional(),
  ...labelFields,
  prompt: z.array(InlineNode),
  config: NumberLineConfig,
  interaction: NumberLineInteraction,
  solution: z.array(InlineNode).optional(),
  hasConfidenceRating: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  // Additive/optional — no schemaVersion bump.
  ...sizingFields,
});
export type NumberLineBlock = z.infer<typeof NumberLineBlock>;
