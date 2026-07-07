import { useEffect, useMemo, useRef, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import {
    mountGraphAuthor,
    fitFunction,
    handlesForFamily,
    type GraphAuthorHandle,
} from '@activity/graph-kit';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import {
    defaultFunctionInteraction,
    defaultPointInteraction,
    defaultRegionInteraction,
    type GraphAxisConfig,
    type GraphInteraction,
    type LinearFunctionModel,
} from '../extensions/InteractiveGraph';

type InteractionType = GraphInteraction['type'];

// ============================================================================
// InteractiveGraphView — NodeView for the interactive_graph block (Stage 5).
// "What the teacher sees is what the student gets": the author board is the SAME
// kit board students use. plot_point: drag handle(s) → correctPoints.
// plot_function (2.7b): drag two handles → the line through them; we re-derive
// slope/intercept from the handles with the SAME fit engine that scores it.
// Built B-shaped so quadratic/exponential/logarithmic families slot into the
// picker + the fit engine additively.
// ============================================================================

// Two points on the given line, used to seed the author handles ON the current
// answer when the board mounts.
function functionStartPoints(
    model: LinearFunctionModel,
    axis: GraphAxisConfig,
): [number, number][] {
    const span = axis.xMax - axis.xMin || 1;
    const x1 = axis.xMin + span * 0.3;
    const x2 = axis.xMin + span * 0.7;
    return [
        [x1, model.slope * x1 + model.intercept],
        [x2, model.slope * x2 + model.intercept],
    ];
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

function GraphAuthorBoard({
    axisConfig,
    interaction,
    onPointsChange,
}: {
    axisConfig: GraphAxisConfig;
    interaction: GraphInteraction;
    onPointsChange: (points: [number, number][]) => void;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const cbRef = useRef(onPointsChange);
    cbRef.current = onPointsChange;

    const family =
        interaction.type === 'plot_function' ? interaction.model.family : undefined;
    const count =
        interaction.type === 'plot_function'
            ? handlesForFamily(family!)
            : interaction.type === 'shade_region'
              ? interaction.correctVertices.length
              : interaction.correctPoints.length;
    const startPoints =
        interaction.type === 'plot_function'
            ? functionStartPoints(interaction.model, axisConfig)
            : interaction.type === 'shade_region'
              ? interaction.correctVertices
              : interaction.correctPoints;
    const startRef = useRef(startPoints);
    startRef.current = startPoints;

    // Remount only on axis + interaction type + family + handle count — never on
    // the answer PARAM values (drags update those and must not cancel the drag).
    const key = useMemo(
        () => JSON.stringify([axisConfig, interaction.type, family, count]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            axisConfig.xMin, axisConfig.xMax, axisConfig.yMin, axisConfig.yMax,
            axisConfig.xGridStep, axisConfig.yGridStep, axisConfig.showGrid,
            axisConfig.snapToGrid, interaction.type, family, count,
        ],
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;inset:0;';
        host.appendChild(el);
        let handle: GraphAuthorHandle | null = null;
        let disposed = false;
        void mountGraphAuthor(
            el,
            {
                interactionType: interaction.type,
                axisConfig,
                correctPoints: startRef.current,
                family,
            },
            { onChange: (pts) => cbRef.current(pts) },
        ).then((h) => {
            if (disposed) { h.destroy(); return; }
            handle = h;
        });
        return () => {
            disposed = true;
            handle?.destroy();
            el.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return (
        <div
            ref={hostRef}
            aria-label="Set the correct answer: drag the handle(s), or use arrow keys."
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '22rem',
                aspectRatio: '1 / 1',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                background: '#fff',
                touchAction: 'none',
            }}
        />
    );
}

const num = (v: string, fallback: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

// Format a linear model as "y = mx + b" for the answer readout.
function formatLine(model: LinearFunctionModel): string {
    const m = round2(model.slope);
    const b = round2(model.intercept);
    const bPart = b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${Math.abs(b)}`;
    return `y = ${m}x${bPart}`;
}

export default function InteractiveGraphView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const axisConfig = node.attrs.axisConfig as GraphAxisConfig;
    const interaction = node.attrs.interaction as GraphInteraction;
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const isEditable = editor.isEditable;

    const problemNumber = useMemo(() => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (pos === undefined) return 1;
        let count = 1;
        editor.state.doc.descendants((d, dPos) => {
            if (dPos >= pos) return false;
            if (d.type.name === 'fillInBlank' || d.type.name === 'interactiveGraph') {
                count++;
            }
            return true;
        });
        return count;
    }, [editor.state, getPos]);

    const setAxis = (patch: Partial<GraphAxisConfig>): void =>
        updateAttributes({ axisConfig: { ...axisConfig, ...patch } });

    // Author drags handles → the answer. plot_point: the handles ARE the correct
    // points. plot_function: fit the family curve through the handles and store
    // its parameters (any handles on the same line give the same answer).
    const onPointsChange = (points: [number, number][]): void => {
        if (interaction.type === 'plot_point') {
            updateAttributes({ interaction: { ...interaction, correctPoints: points } });
        } else if (interaction.type === 'shade_region') {
            updateAttributes({ interaction: { ...interaction, correctVertices: points } });
        } else {
            const fit = fitFunction(interaction.model.family, points);
            if (fit && fit.family === 'linear') {
                updateAttributes({
                    interaction: {
                        type: 'plot_function',
                        model: { ...interaction.model, slope: round2(fit.slope), intercept: round2(fit.intercept) },
                    },
                });
            }
        }
    };

    const switchType = (type: InteractionType): void => {
        if (type === interaction.type) return;
        const next =
            type === 'plot_function'
                ? defaultFunctionInteraction()
                : type === 'shade_region'
                  ? defaultRegionInteraction()
                  : defaultPointInteraction();
        updateAttributes({ interaction: next });
    };

    // shade_region: add/remove polygon vertices (3..6).
    const setVertexCount = (next: number): void => {
        if (interaction.type !== 'shade_region') return;
        const n = Math.max(3, Math.min(next, 6));
        const cur = interaction.correctVertices;
        if (n === cur.length) return;
        const verts =
            n < cur.length
                ? cur.slice(0, n)
                : [...cur, ...Array.from({ length: n - cur.length }, (_, i) => [cur.length + i, 0] as [number, number])];
        updateAttributes({ interaction: { ...interaction, correctVertices: verts } });
    };

    const setPointCount = (next: number): void => {
        if (interaction.type !== 'plot_point') return;
        const n = Math.max(1, Math.min(next, 6));
        const cur = interaction.correctPoints;
        if (n === cur.length) return;
        const points =
            n < cur.length
                ? cur.slice(0, n)
                : [...cur, ...Array.from({ length: n - cur.length }, (_, i) => [cur.length + i, 0] as [number, number])];
        updateAttributes({ interaction: { ...interaction, correctPoints: points } });
    };

    const setModel = (patch: Partial<LinearFunctionModel>): void => {
        if (interaction.type !== 'plot_function') return;
        updateAttributes({ interaction: { type: 'plot_function', model: { ...interaction.model, ...patch } } });
    };

    const answerText =
        interaction.type === 'plot_point'
            ? interaction.correctPoints.map((p) => `(${p[0]}, ${p[1]})`).join(', ')
            : interaction.type === 'shade_region'
              ? interaction.correctVertices.map((p) => `(${p[0]}, ${p[1]})`).join(', ')
              : formatLine(interaction.model);

    return (
        <NodeViewWrapper
            className={`interactive-graph-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div contentEditable={false} style={{ userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {problemNumber}. Interactive graph
                    </strong>
                    <label style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {' '}Type:{' '}
                        <select
                            value={interaction.type}
                            disabled={!isEditable}
                            onChange={(e) => switchType(e.target.value as InteractionType)}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <option value="plot_point">Plot a point</option>
                            <option value="plot_function">Plot a line</option>
                            <option value="shade_region">Shade a region</option>
                        </select>
                    </label>
                </div>

                <GraphAuthorBoard
                    axisConfig={axisConfig}
                    interaction={interaction}
                    onPointsChange={onPointsChange}
                />

                <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    {interaction.type === 'plot_point'
                        ? `Drag the ${interaction.correctPoints.length > 1 ? 'points' : 'point'} to set the correct answer. `
                        : interaction.type === 'shade_region'
                          ? 'Drag the vertices to shape the correct region. '
                          : 'Drag the two handles to set the line. '}
                    Answer: <code>{answerText}</code>
                </p>

                {interaction.type === 'plot_point' && (
                    <label style={{ display: 'inline-block', marginTop: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                        Points students plot:{' '}
                        <input
                            type="number"
                            min={1}
                            max={6}
                            value={interaction.correctPoints.length}
                            disabled={!isEditable}
                            style={{ width: '3rem' }}
                            onChange={(e) => setPointCount(Math.trunc(num(e.target.value, 1)))}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </label>
                )}
                {interaction.type === 'shade_region' && (
                    <label style={{ display: 'inline-block', marginTop: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                        Polygon vertices:{' '}
                        <input
                            type="number"
                            min={3}
                            max={6}
                            value={interaction.correctVertices.length}
                            disabled={!isEditable}
                            style={{ width: '3rem' }}
                            onChange={(e) => setVertexCount(Math.trunc(num(e.target.value, 3)))}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </label>
                )}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
                <span
                    contentEditable={false}
                    style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#94a3b8' }}
                >
                    Question prompt
                </span>
                <NodeViewContent className="interactive-graph-block__prompt" />
            </div>

            {(isEditable || solution.length > 0 || hasConfidenceRating) && (
                <div contentEditable={false} style={{ marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                    <button
                        type="button"
                        onClick={() => setSettingsOpen((o) => !o)}
                        aria-expanded={settingsOpen}
                        disabled={!isEditable}
                        style={{ fontSize: '0.8rem', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <span aria-hidden="true">⚙</span> Advanced settings
                    </button>
                    {settingsOpen && (
                        <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#334155' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '0.3rem 0.6rem', alignItems: 'center' }}>
                                {(['xMin', 'xMax', 'yMin', 'yMax'] as const).map((k) => (
                                    <label key={k} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        {k}
                                        <input
                                            type="number"
                                            value={axisConfig[k]}
                                            disabled={!isEditable}
                                            style={{ width: '3.5rem' }}
                                            onChange={(e) => setAxis({ [k]: num(e.target.value, axisConfig[k]) })}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </label>
                                ))}
                                {(['xGridStep', 'yGridStep'] as const).map((k) => (
                                    <label key={k} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        {k === 'xGridStep' ? 'x grid' : 'y grid'}
                                        <input
                                            type="number"
                                            min={0.1}
                                            step={0.5}
                                            value={axisConfig[k]}
                                            disabled={!isEditable}
                                            style={{ width: '3.5rem' }}
                                            onChange={(e) => {
                                                const v = num(e.target.value, axisConfig[k]);
                                                if (v > 0) setAxis({ [k]: v });
                                            }}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </label>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    <input type="checkbox" checked={axisConfig.showGrid} disabled={!isEditable}
                                        onChange={(e) => setAxis({ showGrid: e.target.checked })}
                                        onKeyDown={(e) => e.stopPropagation()} />
                                    Show grid
                                </label>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    <input type="checkbox" checked={axisConfig.snapToGrid} disabled={!isEditable}
                                        onChange={(e) => setAxis({ snapToGrid: e.target.checked })}
                                        onKeyDown={(e) => e.stopPropagation()} />
                                    Snap to grid
                                </label>
                            </div>

                            {/* Tolerance / strictness — differs by interaction. Slider + numeric. */}
                            {interaction.type === 'plot_point' && (
                                <ToleranceRow
                                    label="Tolerance"
                                    value={interaction.tolerance}
                                    disabled={!isEditable}
                                    onChange={(v) => updateAttributes({ interaction: { ...interaction, tolerance: v } })}
                                />
                            )}
                            {interaction.type === 'plot_function' && (
                                <>
                                    <ToleranceRow
                                        label="Slope tolerance"
                                        value={interaction.model.slopeTolerance}
                                        disabled={!isEditable}
                                        onChange={(v) => setModel({ slopeTolerance: v })}
                                    />
                                    <ToleranceRow
                                        label="Intercept tolerance"
                                        value={interaction.model.interceptTolerance}
                                        disabled={!isEditable}
                                        onChange={(v) => setModel({ interceptTolerance: v })}
                                    />
                                </>
                            )}
                            {interaction.type === 'shade_region' && (
                                <ToleranceRow
                                    label="Min. overlap (IoU)"
                                    value={interaction.minOverlap}
                                    max={1}
                                    disabled={!isEditable}
                                    onChange={(v) =>
                                        updateAttributes({
                                            interaction: { ...interaction, minOverlap: Math.min(1, Math.max(0, v)) },
                                        })
                                    }
                                />
                            )}

                            <div>
                                <span style={{ display: 'block', marginBottom: '0.2rem' }}>Worked solution</span>
                                <InlineRichTextEditor
                                    value={solution}
                                    onChange={(nodes) => updateAttributes({ solution: nodes.length > 0 ? nodes : null })}
                                    ariaLabel="Worked solution"
                                />
                            </div>

                            <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={hasConfidenceRating}
                                    disabled={!isEditable}
                                    onChange={(e) => updateAttributes({ hasConfidenceRating: e.target.checked })}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                Ask for a confidence rating
                            </label>
                        </div>
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}

// A tolerance control: slider + numeric input side by side (author preference).
function ToleranceRow({
    label,
    value,
    disabled,
    onChange,
    max = 2,
}: {
    label: string;
    value: number;
    disabled: boolean;
    onChange: (v: number) => void;
    max?: number;
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ minWidth: '9rem' }}>{label}</span>
            <input
                type="range"
                min={0}
                max={max}
                step={0.05}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(num(e.target.value, value))}
            />
            <input
                type="number"
                min={0}
                step={0.05}
                value={value}
                disabled={disabled}
                style={{ width: '4rem' }}
                onChange={(e) => {
                    const v = num(e.target.value, value);
                    if (v >= 0) onChange(v);
                }}
                onKeyDown={(e) => e.stopPropagation()}
            />
        </div>
    );
}
