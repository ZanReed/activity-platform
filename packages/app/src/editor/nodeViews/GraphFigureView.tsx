import { useMemo, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { renderGraphSvg } from '@activity/graph-kit/static-svg';
import type { AxisConfig, Drawable } from '@activity/schema';
import DrawableListEditor, {
    ALL_DRAWABLE_KINDS,
    NumCell,
} from '../components/DrawableListEditor';
import type { GraphAxisConfig, DrawableAttr } from '../extensions/InteractiveGraph';

// ============================================================================
// GraphFigureView — NodeView for the static graph-figure block (reference-
// panel content). The preview IS the published output: renderGraphSvg is the
// exact kit-free engine the published page uses (the renderer is pure, so
// this is a string transform, no I/O).
//
// Authoring mirrors the MC choice-figure panel: axis-window NumCells +
// DrawableListEditor, minus the `expression` kind (kit-free SVG can't sample
// formulas — it would silently draw nothing).
//
// Editing controls are gated by LOCAL React state (the Edit figure / Done
// toggle), NOT ProseMirror's `selected` — typing in an inner input drops node
// selection, so selection-gated controls collapse after one keystroke (the
// documented NodeView hazard).
// ============================================================================

const FIGURE_DRAWABLE_KINDS = ALL_DRAWABLE_KINDS.filter(
    (k) => k !== 'expression',
);

export default function GraphFigureView({
    node,
    updateAttributes,
    editor,
}: NodeViewProps) {
    const [editing, setEditing] = useState(false);
    const axis = node.attrs.axis as GraphAxisConfig;
    const drawables = node.attrs.drawables as DrawableAttr[];
    const id = (node.attrs.id as string) || 'figure';
    const disabled = !editor.isEditable;

    const previewSvg = useMemo(
        () =>
            renderGraphSvg(
                axis as AxisConfig,
                drawables as Drawable[],
                'edfig-' + id,
            ),
        [axis, drawables, id],
    );

    const setAxis = (patch: Partial<GraphAxisConfig>): void =>
        updateAttributes({ axis: { ...axis, ...patch } });

    return (
        <NodeViewWrapper className="graph-figure-view" data-block-type="graph_figure">
            <div
                className="graph-figure-view__preview"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
            />
            {!editing && (
                <div
                    className="graph-figure-view__actions"
                    contentEditable={false}
                >
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setEditing(true)}
                    >
                        Edit figure
                    </button>
                </div>
            )}
            {editing && (
                <div className="graph-figure-view__editor" contentEditable={false}>
                    <div className="graph-figure-view__axis">
                        {(['xMin', 'xMax', 'yMin', 'yMax'] as const).map((k) => (
                            <label key={k}>
                                {k}
                                <NumCell
                                    value={axis[k]}
                                    disabled={disabled}
                                    onChange={(v) => setAxis({ [k]: v })}
                                />
                            </label>
                        ))}
                        {(['xGridStep', 'yGridStep'] as const).map((k) => (
                            <label key={k}>
                                {k === 'xGridStep' ? 'x grid' : 'y grid'}
                                <NumCell
                                    value={axis[k]}
                                    disabled={disabled}
                                    onChange={(v) => {
                                        if (v > 0) setAxis({ [k]: v });
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                    <DrawableListEditor
                        drawables={drawables}
                        disabled={disabled}
                        onChange={(next) => updateAttributes({ drawables: next })}
                        kinds={FIGURE_DRAWABLE_KINDS}
                    />
                    <div className="graph-figure-view__done-row">
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}
