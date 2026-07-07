import { useEffect, useMemo, useRef, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import { mountGraphAuthor, type GraphAuthorHandle } from '@activity/graph-kit';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import type {
    GraphAxisConfig,
    GraphInteraction,
} from '../extensions/InteractiveGraph';

// ============================================================================
// InteractiveGraphView — NodeView for the interactive_graph block (Stage 5
// slice 2). "What the teacher sees is what the student gets": the author board
// is the SAME kit board students use (mountGraphAuthor), so dragging a handle
// literally sets the correct answer.
//
// Layout:
//   <NodeViewWrapper>
//     [chrome, contentEditable=false] number · interaction picker · board ·
//        "drag to set the answer" hint · points-count · advanced settings
//     <NodeViewContent /> — the editable prompt (text + inline math)
//
// The board is React-identity-stable but JSXGraph-owned (the 5-commitments
// rule): it remounts only when the axis or the number of handles changes, NOT
// on every drag — drags flow OUT via onChange to updateAttributes and never
// feed back in (which would fight the drag).
// ============================================================================

// The author board, isolated so its async mount + JSXGraph lifecycle is
// self-contained. Remounts on axis / handle-count change only.
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
    // Identity key: only the axis + handle COUNT remount the board. The point
    // VALUES change on every drag and must NOT remount (that would cancel the
    // drag). A ref holds the freshest onChange so the effect needn't depend on it.
    const cbRef = useRef(onPointsChange);
    cbRef.current = onPointsChange;
    const pointsRef = useRef(interaction.correctPoints);
    pointsRef.current = interaction.correctPoints;

    const key = useMemo(
        () => JSON.stringify(axisConfig) + '|' + interaction.correctPoints.length,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            axisConfig.xMin, axisConfig.xMax, axisConfig.yMin, axisConfig.yMax,
            axisConfig.xGridStep, axisConfig.yGridStep, axisConfig.showGrid,
            axisConfig.snapToGrid, interaction.correctPoints.length,
        ],
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        // Fresh inner node per run so React StrictMode's double-invoke can't race
        // two async boards onto the same element.
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
                correctPoints: pointsRef.current,
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

    // The host is just a sized positioning container. The inner board element
    // (created in the effect) is the focusable role=application surface with the
    // keyboard handler — createPointAnswerBoard owns those, so we must NOT set
    // role/tabindex here (a second focusable app region would shadow the real
    // one and swallow arrow keys).
    return (
        <div
            ref={hostRef}
            aria-label="Set the correct answer: drag the point(s), or use arrow keys."
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

    // Number: count preceding numbered question blocks (fill-in-blank + graph),
    // matching the renderer's shared problem sequence.
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
    const setInteraction = (patch: Partial<GraphInteraction>): void =>
        updateAttributes({ interaction: { ...interaction, ...patch } });

    // The author board reports handle positions; they ARE correctPoints.
    const onPointsChange = (points: [number, number][]): void =>
        setInteraction({ correctPoints: points });

    // Add / remove answer handles (how many points the student must plot).
    const setPointCount = (next: number): void => {
        const n = Math.max(1, Math.min(next, 6));
        const cur = interaction.correctPoints;
        if (n === cur.length) return;
        let points: [number, number][];
        if (n < cur.length) {
            points = cur.slice(0, n);
        } else {
            points = [...cur];
            while (points.length < n) points.push([points.length, 0]);
        }
        setInteraction({ correctPoints: points });
    };

    return (
        <NodeViewWrapper
            className={`interactive-graph-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div
                contentEditable={false}
                style={{ userSelect: 'none' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {problemNumber}. Interactive graph
                    </strong>
                    <label style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {' '}Type:{' '}
                        <select
                            value={interaction.type}
                            disabled={!isEditable}
                            onChange={() => { /* only plot_point for now */ }}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <option value="plot_point">Plot a point</option>
                        </select>
                    </label>
                </div>

                <GraphAuthorBoard
                    axisConfig={axisConfig}
                    interaction={interaction}
                    onPointsChange={onPointsChange}
                />

                <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Drag the {interaction.correctPoints.length > 1 ? 'points' : 'point'} to set the
                    correct answer. Answer:{' '}
                    <code>
                        {interaction.correctPoints
                            .map((p) => `(${p[0]}, ${p[1]})`)
                            .join(', ')}
                    </code>
                </p>

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

                            {/* Tolerance — slider + numeric (both, per author pref). */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>Tolerance</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={2}
                                    step={0.05}
                                    value={interaction.tolerance}
                                    disabled={!isEditable}
                                    onChange={(e) => setInteraction({ tolerance: num(e.target.value, interaction.tolerance) })}
                                />
                                <input
                                    type="number"
                                    min={0}
                                    step={0.05}
                                    value={interaction.tolerance}
                                    disabled={!isEditable}
                                    style={{ width: '4rem' }}
                                    onChange={(e) => {
                                        const v = num(e.target.value, interaction.tolerance);
                                        if (v >= 0) setInteraction({ tolerance: v });
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                <span style={{ color: '#94a3b8' }}>graph units</span>
                            </div>

                            <div>
                                <span style={{ display: 'block', marginBottom: '0.2rem' }}>Worked solution</span>
                                <InlineRichTextEditor
                                    value={solution}
                                    onChange={(nodes) =>
                                        updateAttributes({ solution: nodes.length > 0 ? nodes : null })
                                    }
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
