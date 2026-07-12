// =============================================================================
// number-line-svg.ts — server-rendered static 1-D number line (print / no-JS)
// -----------------------------------------------------------------------------
// The 1-D analogue of graph-svg.ts. Emits a horizontal number line: an axis
// with arrowheads (it extends past the window), labeled ticks + optional minor
// ticks, and — in the answer-key print variant — the plotted point(s) or the
// interval/ray drawn with open (hollow) / closed (filled) endcaps. Pure string
// output, no DOM, aria-hidden (the block shell owns the accessible name).
//
// This is what the print path and the no-JS / no-kit fallback show; the kit's
// interactive board replaces it on hydrate. Kept kit-free by design so paper
// and JS-off browsers work (same contract as renderGraphSvg).
// =============================================================================
import type { NumberLineConfig, NumberLineInterval } from '@activity/schema';
import { attr, escape } from './html.js';

const WIDTH = 500;
const HEIGHT = 90;
const MARGIN = 24; // px inset on each end so end-arrows + edge labels fit
const AXIS_Y = 44; // baseline y of the number line
const TICK = 7; // labeled-tick half-height
const MINOR_TICK = 4; // minor-tick half-height
const MARK_Y = AXIS_Y - 16; // y of drawn points / interval bar (above the axis)

const AXIS_COLOR = '#64748b';
const LABEL_COLOR = '#475569';
const INK = '#1e293b';
const DOT_R = 6;

// One thing to draw on the line: a plotted point, or an interval/ray.
export type NumberLineMark =
  | { kind: 'point'; x: number }
  | ({ kind: 'interval' } & NumberLineInterval);

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000);
}

// Value → viewBox px. min at the left inset, max at the right inset.
function scaler(config: NumberLineConfig): (v: number) => number {
  const span = config.max - config.min;
  return (v) => MARGIN + ((v - config.min) / span) * (WIDTH - 2 * MARGIN);
}

// Positions of labeled ticks from min, stepping by tickStep and including max
// when it lands on a step (guarded against runaway loops on a tiny step).
function tickPositions(config: NumberLineConfig): number[] {
  const out: number[] = [];
  const step = config.tickStep > 0 ? config.tickStep : 1;
  const maxCount = 200;
  for (let i = 0, v = config.min; v <= config.max + 1e-9 && i < maxCount; i++) {
    out.push(Math.round(v * 1e6) / 1e6);
    v += step;
  }
  return out;
}

function renderAxisAndTicks(
  config: NumberLineConfig,
  px: (v: number) => number,
  markerId: string,
): string {
  const labeled = tickPositions(config);
  const step = config.tickStep > 0 ? config.tickStep : 1;
  const minors = config.minorTicksPerStep;

  // The axis line with an arrowhead at each end (the line continues past the
  // window). marker-start/-end via a shared marker (auto-start-reverse).
  let out =
    `<line x1="${MARGIN - 8}" y1="${AXIS_Y}" x2="${WIDTH - MARGIN + 8}" y2="${AXIS_Y}"` +
    ` stroke="${AXIS_COLOR}" stroke-width="1.5"` +
    ` marker-start="url(#${attr(markerId)})" marker-end="url(#${attr(markerId)})"/>`;

  // Minor ticks between labeled steps (unlabeled, shorter).
  if (minors > 0) {
    let m = '';
    for (let i = 0; i + 1 < labeled.length; i++) {
      const a = labeled[i]!;
      for (let k = 1; k <= minors; k++) {
        const v = a + (step * k) / (minors + 1);
        if (v > config.max + 1e-9) break;
        const x = px(v);
        m += `<line x1="${x}" y1="${AXIS_Y - MINOR_TICK}" x2="${x}" y2="${AXIS_Y + MINOR_TICK}"/>`;
      }
    }
    if (m) out += `<g stroke="${AXIS_COLOR}" stroke-width="1">${m}</g>`;
  }

  // Labeled ticks + numeric labels below the axis.
  let ticks = '';
  let labels = '';
  for (const v of labeled) {
    const x = px(v);
    ticks += `<line x1="${x}" y1="${AXIS_Y - TICK}" x2="${x}" y2="${AXIS_Y + TICK}"/>`;
    labels +=
      `<text x="${x}" y="${AXIS_Y + TICK + 14}" text-anchor="middle"` +
      ` fill="${LABEL_COLOR}" font-size="13" font-family="inherit">${escape(fmt(v))}</text>`;
  }
  out += `<g stroke="${AXIS_COLOR}" stroke-width="1.5">${ticks}</g>`;
  out += labels;
  return out;
}

function pointDot(x: number, open = false): string {
  return (
    `<circle cx="${x}" cy="${AXIS_Y}" r="${DOT_R}"` +
    ` fill="${open ? '#fff' : INK}" stroke="${INK}" stroke-width="2"/>`
  );
}

function renderMark(
  px: (v: number) => number,
  mark: NumberLineMark,
  markerId: string,
): string {
  if (mark.kind === 'point') return pointDot(px(mark.x));

  // Interval / ray. A present bound draws an open/closed endcap; an absent bound
  // means the bar runs to that edge with an arrowhead (unbounded ray).
  const hasMin = mark.min !== undefined;
  const hasMax = mark.max !== undefined;
  const leftX = hasMin ? px(mark.min!) : MARGIN - 8;
  const rightX = hasMax ? px(mark.max!) : WIDTH - MARGIN + 8;

  const markerStart = hasMin ? '' : ` marker-start="url(#${attr(markerId)})"`;
  const markerEnd = hasMax ? '' : ` marker-end="url(#${attr(markerId)})"`;
  let out =
    `<line x1="${leftX}" y1="${MARK_Y}" x2="${rightX}" y2="${MARK_Y}"` +
    ` stroke="${INK}" stroke-width="3"${markerStart}${markerEnd}/>`;

  // Endcaps: hollow circle for open (excluded), filled for closed (included).
  if (hasMin) {
    const open = mark.minStyle === 'open';
    out +=
      `<circle cx="${leftX}" cy="${MARK_Y}" r="${DOT_R - 1}"` +
      ` fill="${open ? '#fff' : INK}" stroke="${INK}" stroke-width="2"/>`;
  }
  if (hasMax) {
    const open = mark.maxStyle === 'open';
    out +=
      `<circle cx="${rightX}" cy="${MARK_Y}" r="${DOT_R - 1}"` +
      ` fill="${open ? '#fff' : INK}" stroke="${INK}" stroke-width="2"/>`;
  }
  return out;
}

export function renderNumberLineSvg(
  config: NumberLineConfig,
  marks: NumberLineMark[],
  uid: string,
): string {
  if (!(config.max > config.min)) return '';
  const px = scaler(config);
  const markerId = 'nlarrow-' + uid;
  const marksHtml = marks.map((m) => renderMark(px, m, markerId)).join('');

  return (
    `<svg class="number-line-paper" viewBox="0 0 ${WIDTH} ${HEIGHT}"` +
    ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<defs>' +
    `<marker id="${attr(markerId)}" viewBox="0 0 10 10" refX="8" refY="5"` +
    ` markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0 0L10 5L0 10Z" fill="${AXIS_COLOR}"/></marker>` +
    '</defs>' +
    renderAxisAndTicks(config, px, markerId) +
    marksHtml +
    '</svg>'
  );
}

// Convert a block's answer key into the marks the print answer-key variant
// draws (the number-line twin of answerKeyDrawables). plot_point → one dot per
// correct position; plot_interval → the interval/ray.
export function answerKeyMarks(
  interaction:
    | { type: 'plot_point'; correctPoints: number[] }
    | { type: 'plot_interval'; correctInterval: NumberLineInterval },
): NumberLineMark[] {
  if (interaction.type === 'plot_point') {
    return interaction.correctPoints.map((x) => ({ kind: 'point', x }));
  }
  return [{ kind: 'interval', ...interaction.correctInterval }];
}
