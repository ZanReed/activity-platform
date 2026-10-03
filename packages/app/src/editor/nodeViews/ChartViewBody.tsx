import { useMemo, useState, type CSSProperties } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { renderChartSvg } from '@activity/graph-kit/chart-svg';
import { formatChartSource, parseChartFence, type ChartAttrs } from '../../lib/chartFence';

// ============================================================================
// ChartViewBody — the chart block's NodeView (Y7 charts, T12; Q8), loaded
// LAZILY by ChartView.tsx so the chart engine and the fence parser stay out of
// the editor chunk (the prosemirror ledger row had 0 KiB to spare).
//
// The preview IS the student's picture: renderChartSvg is the engine the
// viewer's Chart block calls. Authoring is a "Chart source" popover holding
// the SAME lines a ```chart fence takes, re-parsed by the importer's own
// parser on Apply — no per-field form (Q8: catalogue activities are
// file-backed, so a form is weeks of UI for a surface they never touch).
//
// The popover is LOCAL React state, not ProseMirror's `selected`: typing in
// the textarea drops node selection, so a selection-gated control collapses
// after one keystroke (the documented NodeView hazard).
// ============================================================================

// The engine's chrome reads --gk-svg-*, which the VIEWER defines per theme and
// the editor does not. Pointing them at the editor's existing board tokens
// here gives the preview the editor's dark mode without a new stylesheet rule.
const PREVIEW_THEME = {
    '--gk-svg-grid': 'var(--ed-border)',
    '--gk-svg-axis': 'var(--gk-board-axis)',
    '--gk-svg-ink': 'var(--gk-board-ink)',
    color: 'var(--gk-board-label)',
} as CSSProperties;

export default function ChartViewBody({ node, updateAttributes, editor }: NodeViewProps) {
    const data = node.attrs.data as ChartAttrs;
    const id = (node.attrs.id as string) || 'chart';
    const disabled = !editor.isEditable;
    const [source, setSource] = useState<{ text: string; lossy: string[] } | null>(null);
    const [problems, setProblems] = useState<string[]>([]);

    const svg = useMemo(() => renderChartSvg(data, 'edchart-' + id), [data, id]);

    return (
        <NodeViewWrapper className="graph-figure-view chart-view" data-block-type="chart">
            {svg ? (
                <div
                    className="chart-view__preview"
                    style={PREVIEW_THEME}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            ) : (
                <p className="graph-figure-source__warn" contentEditable={false}>
                    This chart has nothing to draw. Open Chart source and give it categories and a series.
                </p>
            )}
            {!source && (
                <div className="graph-figure-view__actions" contentEditable={false}>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            setProblems([]);
                            setSource(formatChartSource(data));
                        }}
                    >
                        Chart source
                    </button>
                </div>
            )}
            {source && (
                <div className="graph-figure-source" contentEditable={false}>
                    <label className="graph-figure-source__label">
                        Chart source — the same lines a ```chart fence takes
                        <textarea
                            className="graph-figure-source__text"
                            value={source.text}
                            rows={Math.min(18, source.text.split('\n').length + 2)}
                            spellCheck={false}
                            disabled={disabled}
                            onChange={(e) => setSource({ ...source, text: e.target.value })}
                        />
                    </label>
                    {source.lossy.length > 0 && (
                        <p className="graph-figure-source__warn" role="note">
                            Applying will change what these lines cannot spell: {source.lossy.join('; ')}.
                        </p>
                    )}
                    {problems.length > 0 && (
                        <ul className="graph-figure-source__problems" role="alert">
                            {problems.map((p) => (
                                <li key={p}>{p}</li>
                            ))}
                        </ul>
                    )}
                    <div className="graph-figure-view__done-row">
                        <button type="button" onClick={() => setSource(null)}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                                const parsed = parseChartFence(source.text);
                                setProblems(parsed.problems);
                                if (!parsed.attrs) return;
                                updateAttributes({ data: parsed.attrs });
                                // A clean apply closes; problems keep it open so
                                // the teacher sees which lines were skipped.
                                if (parsed.problems.length === 0) setSource(null);
                            }}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}
