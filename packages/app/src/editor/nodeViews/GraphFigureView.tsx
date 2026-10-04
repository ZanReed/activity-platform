import { useMemo, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { renderGraphSvg } from '@activity/graph-kit/static-svg';
import type { AxisConfig, Drawable } from '@activity/schema';
import DrawableListEditor, {
    ALL_DRAWABLE_KINDS,
    NumCell,
} from '../components/DrawableListEditor';
import type { GraphAxisConfig, DrawableAttr } from '../extensions/InteractiveGraph';
import { AxisWindowError, useAxisWindowGuard } from '../components/axisWindow';
import { formatFigureSource, parseFigureSource } from '../../lib/figureSource';

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
    // The "figure source" popover (Y7 T7, Q8 + ER-10): the figure as GENERATED
    // ```figure text — never stored — re-parsed by the importer's own parser
    // on Apply. Local React state, like `editing` (the NodeView selection
    // hazard: selection-gated controls collapse after one keystroke).
    const [source, setSource] = useState<{ text: string; lossy: string[] } | null>(null);
    const [sourceProblems, setSourceProblems] = useState<string[]>([]);
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
                undefined,
                // The preview shows the figure as the student will see it:
                // plane-less (Y7) when the block says so.
                { plane: node.attrs.plane !== false },
            ),
        [axis, drawables, id, node.attrs.plane],
    );

    const axisGuard = useAxisWindowGuard<GraphAxisConfig>((next) =>
        updateAttributes({ axis: next }),
    );
    const setAxis = (patch: Partial<GraphAxisConfig>): void =>
        axisGuard.write({ ...axis, ...patch });

    return (
        <NodeViewWrapper className="graph-figure-view" data-block-type="graph_figure">
            {typeof node.attrs.caption === 'string' && node.attrs.caption !== '' && (
                // The figure's caption (the letter a question names it by),
                // above the picture as the student sees it.
                <div
                    className="graph-figure-view__caption"
                    contentEditable={false}
                    style={{ fontWeight: 700, textAlign: 'center', maxWidth: '16rem' }}
                >
                    {node.attrs.caption as string}
                </div>
            )}
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
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            setSourceProblems([]);
                            setSource(
                                formatFigureSource({
                                    axis,
                                    drawables,
                                    alt: node.attrs.alt as string | null,
                                    caption: node.attrs.caption as string | null,
                                    plane: node.attrs.plane !== false,
                                    toScale: node.attrs.toScale === true,
                                }),
                            );
                        }}
                    >
                        Figure source
                    </button>
                </div>
            )}
            {source && (
                <div className="graph-figure-source" contentEditable={false}>
                    <label className="graph-figure-source__label">
                        Figure source — the same lines a ```figure fence takes
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
                            Applying will drop what these lines cannot spell: {source.lossy.join('; ')}.
                        </p>
                    )}
                    {sourceProblems.length > 0 && (
                        <ul className="graph-figure-source__problems" role="alert">
                            {sourceProblems.map((p) => (
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
                                const parsed = parseFigureSource(source.text);
                                setSourceProblems(parsed.problems);
                                if (!parsed.attrs) return;
                                updateAttributes({
                                    axis: parsed.attrs.axis,
                                    drawables: parsed.attrs.drawables,
                                    alt: parsed.attrs.alt ?? null,
                                    caption: parsed.attrs.caption ?? null,
                                    plane: parsed.attrs.plane,
                                    toScale: parsed.attrs.toScale,
                                });
                                // Clean apply closes; problems keep it open so
                                // the teacher sees which lines were skipped.
                                if (parsed.problems.length === 0) setSource(null);
                            }}
                        >
                            Apply
                        </button>
                    </div>
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
                    <AxisWindowError error={axisGuard.error} />
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
