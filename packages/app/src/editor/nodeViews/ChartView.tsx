import { Suspense, lazy } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

// ============================================================================
// ChartView — the chart block's NodeView, as a LAZY boundary.
//
// The real view (ChartViewBody) carries the static chart engine and the
// ```chart fence parser. Importing them here would put both in the editor
// chunk, and that chunk's ledger row (scripts/perf-budgets.mjs, `prosemirror`)
// was already at its cap; the row's own comment pre-chose the answer for the
// next editor feature: a lazily-registered chunk. So an editor that never
// shows a chart never downloads the chart code.
//
// The fallback keeps the node's wrapper and block type, so selection, drag and
// the block-type styling work while the chunk is in flight.
// ============================================================================

const ChartViewBody = lazy(() => import('./ChartViewBody'));

export default function ChartView(props: NodeViewProps) {
    return (
        <Suspense
            fallback={
                <NodeViewWrapper className="graph-figure-view chart-view" data-block-type="chart">
                    <p className="graph-figure-source__warn" contentEditable={false} role="status">
                        Loading chart…
                    </p>
                </NodeViewWrapper>
            }
        >
            <ChartViewBody {...props} />
        </Suspense>
    );
}
