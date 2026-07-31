// =============================================================================
// blocks/GraphFigure.tsx — static graph figure (S3)
// -----------------------------------------------------------------------------
// KIT-FREE by design, which is the whole reason this block exists separately
// from a display-mode interactive_graph. It renders plain SVG with no
// JSXGraph, so it works in the reference panel, in print, and on a page that
// never loads the graph chunk at all. Pulling the kit in here would quietly
// undo that — and would surface as a print-parity failure in T8, long after
// the cause.
//
// It draws the same drawable vocabulary the schema defines, minus `curve` and
// `expression`: those need a function evaluator (the kit's math engine), which
// is exactly the dependency this block refuses. An authored figure using them
// renders its axes without the curve rather than importing a math engine —
// the graph-figure authoring UI only offers kit-free drawables, so this is a
// guard against future drift, not a live gap.
// =============================================================================

import type { GraphFigureBlock } from '@activity/schema';
import type { BlockComponentProps } from '../registry/types.js';

const SIZE = 320; // viewBox units; the SVG scales to its container
const PAD = 8;

export default function GraphFigure({ block }: BlockComponentProps<GraphFigureBlock>) {
  const { axis } = block;
  const spanX = axis.xMax - axis.xMin || 1;
  const spanY = axis.yMax - axis.yMin || 1;

  // Graph units → SVG units. y flips: SVG grows downward, graphs upward.
  const sx = (x: number) => PAD + ((x - axis.xMin) / spanX) * (SIZE - 2 * PAD);
  const sy = (y: number) => PAD + ((axis.yMax - y) / spanY) * (SIZE - 2 * PAD);

  const gridLines: React.ReactNode[] = [];
  if (axis.showGrid) {
    for (let x = Math.ceil(axis.xMin / axis.xGridStep) * axis.xGridStep; x <= axis.xMax; x += axis.xGridStep) {
      gridLines.push(
        <line key={`gx${x}`} x1={sx(x)} y1={sy(axis.yMin)} x2={sx(x)} y2={sy(axis.yMax)} className="viewer-figure__grid" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />,
      );
    }
    for (let y = Math.ceil(axis.yMin / axis.yGridStep) * axis.yGridStep; y <= axis.yMax; y += axis.yGridStep) {
      gridLines.push(
        <line key={`gy${y}`} x1={sx(axis.xMin)} y1={sy(y)} x2={sx(axis.xMax)} y2={sy(y)} className="viewer-figure__grid" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />,
      );
    }
  }

  return (
    <figure className="viewer-figure" data-block-type="graph_figure">
      <svg
        className="viewer-figure__svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%"
        style={{ maxWidth: '20rem', aspectRatio: '1 / 1' }}
        // A figure is decorative chrome around authored content; the caption
        // or surrounding prose carries the meaning. Marking it img with an
        // empty label would announce an unnamed graphic.
        role="img"
        aria-label="Graph figure"
      >
        {gridLines}
        {/* Axes, drawn only when zero is inside the window. */}
        {axis.yMin <= 0 && axis.yMax >= 0 ? (
          <line x1={sx(axis.xMin)} y1={sy(0)} x2={sx(axis.xMax)} y2={sy(0)} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} />
        ) : null}
        {axis.xMin <= 0 && axis.xMax >= 0 ? (
          <line x1={sx(0)} y1={sy(axis.yMin)} x2={sx(0)} y2={sy(axis.yMax)} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} />
        ) : null}

        {block.drawables.map((d, i) => {
          switch (d.kind) {
            case 'point': {
              // `?? 0` rather than a non-null assertion: the SANITIZED
              // projection widens tuples to arrays, so these read as
              // `number | undefined` under noUncheckedIndexedAccess. Repo rule
              // is to fix the call site, never disable the flag.
              const [px = 0, py = 0] = d.at;
              return (
                <circle key={i} cx={sx(px)} cy={sy(py)} r={4} fill="currentColor" data-drawable="point" />
              );
            }
            case 'segment': {
              const [x1 = 0, y1 = 0] = d.from;
              const [x2 = 0, y2 = 0] = d.to;
              return (
                <line key={i} x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke="currentColor" strokeWidth={2} data-drawable="segment" />
              );
            }
            case 'ray': {
              // Extend from `from` through `through` to the window edge.
              const [fx = 0, fy = 0] = d.from;
              const [tx = 0, ty = 0] = d.through;
              const dx = tx - fx;
              const dy = ty - fy;
              // Largest t keeping the point inside the window.
              const ts = [
                dx > 0 ? (axis.xMax - fx) / dx : dx < 0 ? (axis.xMin - fx) / dx : Infinity,
                dy > 0 ? (axis.yMax - fy) / dy : dy < 0 ? (axis.yMin - fy) / dy : Infinity,
              ].filter((t) => Number.isFinite(t) && t > 0);
              const t = ts.length > 0 ? Math.min(...ts) : 1;
              return (
                <line key={i} x1={sx(fx)} y1={sy(fy)} x2={sx(fx + dx * t)} y2={sy(fy + dy * t)} stroke="currentColor" strokeWidth={2} data-drawable="ray" />
              );
            }
            case 'polygon':
              return (
                <polygon key={i} points={d.vertices.map(([x = 0, y = 0]) => `${sx(x)},${sy(y)}`).join(' ')} fill="currentColor" fillOpacity={0.15} stroke="currentColor" strokeWidth={2} data-drawable="polygon" />
              );
            default:
              // curve / expression need a function evaluator — see the header.
              return null;
          }
        })}
      </svg>
    </figure>
  );
}
