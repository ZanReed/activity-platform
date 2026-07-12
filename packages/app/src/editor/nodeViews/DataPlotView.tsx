import { useMemo, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import { renderDataPlotSvg, fiveNumberSummary } from '@activity/renderer';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import { problemNumberAt } from '../problemNumbering';
import {
    defaultDataPlotBuildInteraction,
    defaultDataPlotHistogramInteraction,
    defaultDataPlotBoxplotInteraction,
    defaultDataPlotDisplayInteraction,
    type DataPlotConfigAttr,
    type DataPlotInteractionAttr,
} from '../extensions/DataPlot';

// ============================================================================
// DataPlotView — NodeView for the data_plot block (statistics charts). Authored
// by editing the DATASET (the correct plot is computed from it — no drag board),
// so this is a numeric data-table + a live static preview drawn with the SAME
// renderer routine the published page uses (renderDataPlotSvg). A single
// mode/chart picker chooses build-a-dot-plot (graded) or a display chart (dot /
// histogram / box, ungraded stimulus).
// ============================================================================

// One combined picker value spanning the interaction union.
type Mode =
    | 'build_dotplot'
    | 'build_histogram'
    | 'build_boxplot'
    | 'display:dotplot'
    | 'display:histogram'
    | 'display:boxplot';

const num = (v: string, d: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};

function modeOf(interaction: DataPlotInteractionAttr): Mode {
    return interaction.type === 'display'
        ? (`display:${interaction.chart}` as Mode)
        : (interaction.type as Mode);
}

function chartOf(interaction: DataPlotInteractionAttr): 'dotplot' | 'histogram' | 'boxplot' {
    if (interaction.type === 'display') return interaction.chart;
    if (interaction.type === 'build_histogram') return 'histogram';
    if (interaction.type === 'build_boxplot') return 'boxplot';
    return 'dotplot';
}

// Parse a free-typed "3, 5, 5, 6 8" into numbers (commas and/or whitespace).
function parseData(text: string): number[] {
    return text
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map(Number)
        .filter((n) => Number.isFinite(n));
}

const labelStyle = { fontSize: '0.8rem', color: '#475569' } as const;

export default function DataPlotView({
    node,
    editor,
    getPos,
    updateAttributes,
    selected,
}: NodeViewProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);

    const data = node.attrs.data as number[];
    const config = node.attrs.config as DataPlotConfigAttr;
    const interaction = node.attrs.interaction as DataPlotInteractionAttr;
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const isEditable = editor.isEditable;
    const isGraded = interaction.type !== 'display';
    const chart = chartOf(interaction);

    // The dataset field is free text so the author can type mid-value without the
    // parse fighting them; committed to attrs.data whenever it parses non-empty.
    const [dataText, setDataText] = useState(() => data.join(', '));

    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );

    // Live preview — the exact renderer routine the published page uses.
    const previewHtml = useMemo(
        () => renderDataPlotSvg(config, chart, data, node.attrs.id || 'preview'),
        [config, chart, data, node.attrs.id],
    );

    const setConfig = (patch: Partial<DataPlotConfigAttr>): void => {
        updateAttributes({ config: { ...config, ...patch } });
    };

    const onDataText = (text: string): void => {
        setDataText(text);
        const parsed = parseData(text);
        if (parsed.length > 0) updateAttributes({ data: parsed });
    };

    const switchMode = (mode: Mode): void => {
        if (mode === modeOf(interaction)) return;
        const next: DataPlotInteractionAttr =
            mode === 'build_dotplot'
                ? defaultDataPlotBuildInteraction()
                : mode === 'build_histogram'
                  ? defaultDataPlotHistogramInteraction()
                  : mode === 'build_boxplot'
                    ? defaultDataPlotBoxplotInteraction()
                    : defaultDataPlotDisplayInteraction(
                          mode.split(':')[1] as 'dotplot' | 'histogram' | 'boxplot',
                      );
        updateAttributes({ interaction: next });
    };

    return (
        <NodeViewWrapper
            className={`data-plot-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div contentEditable={false} style={{ userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {isGraded ? `${problemNumber}. ` : ''}Data plot
                    </strong>
                    <label style={labelStyle}>
                        {' '}Type:{' '}
                        <select
                            value={modeOf(interaction)}
                            disabled={!isEditable}
                            onChange={(e) => switchMode(e.target.value as Mode)}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <option value="build_dotplot">Build a dot plot (graded)</option>
                            <option value="build_histogram">Build a histogram (graded)</option>
                            <option value="build_boxplot">Build a box plot (graded)</option>
                            <option value="display:dotplot">Display: dot plot</option>
                            <option value="display:histogram">Display: histogram</option>
                            <option value="display:boxplot">Display: box plot</option>
                        </select>
                    </label>
                </div>

                <label style={{ ...labelStyle, display: 'block', marginBottom: '0.35rem' }}>
                    Data{isGraded ? ' (students plot this; the correct plot is computed from it)' : ''}:{' '}
                    <input
                        type="text"
                        value={dataText}
                        disabled={!isEditable}
                        placeholder="e.g. 3, 5, 5, 6, 8"
                        style={{ width: '18rem', maxWidth: '100%' }}
                        onChange={(e) => onDataText(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                </label>

                <div
                    contentEditable={false}
                    style={{ border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', padding: '0.4rem', maxWidth: '34rem' }}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
                {interaction.type === 'build_boxplot' && data.length > 0 && (() => {
                    const s = fiveNumberSummary(data);
                    return (
                        <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#475569' }}>
                            Target (TI-84): min {s.min} · Q1 {s.q1} · median {s.median} · Q3 {s.q3} · max {s.max}
                        </p>
                    );
                })()}
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    {isGraded
                        ? `Students build this ${chart === 'histogram' ? 'histogram' : chart === 'boxplot' ? 'box plot' : 'dot plot'}; it is scored against the data above.`
                        : 'A static figure students read (pair it with a question block to grade).'}
                </p>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
                <span
                    contentEditable={false}
                    style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#94a3b8' }}
                >
                    {isGraded ? 'Question prompt' : 'Caption (optional)'}
                </span>
                <NodeViewContent className="data-plot-block__prompt" />
            </div>

            {(isEditable || solution.length > 0 || hasConfidenceRating) && (
                <div contentEditable={false} style={{ marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                    <button
                        type="button"
                        onClick={() => setSettingsOpen((o) => !o)}
                        style={{ fontSize: '0.8rem', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <span aria-hidden="true">⚙</span> Advanced settings
                    </button>
                    {settingsOpen && (
                        <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    Min:
                                    <input type="number" value={config.min} disabled={!isEditable} step="any" style={{ width: '4rem' }}
                                        onChange={(e) => setConfig({ min: num(e.target.value, config.min) })}
                                        onKeyDown={(e) => e.stopPropagation()} />
                                </label>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    Max:
                                    <input type="number" value={config.max} disabled={!isEditable} step="any" style={{ width: '4rem' }}
                                        onChange={(e) => setConfig({ max: num(e.target.value, config.max) })}
                                        onKeyDown={(e) => e.stopPropagation()} />
                                </label>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    Tick step:
                                    <input type="number" value={config.tickStep} min={0} disabled={!isEditable} step="any" style={{ width: '4rem' }}
                                        onChange={(e) => setConfig({ tickStep: Math.max(0.0001, num(e.target.value, config.tickStep)) })}
                                        onKeyDown={(e) => e.stopPropagation()} />
                                </label>
                                {chart === 'histogram' && (
                                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                        Bin width:
                                        <input type="number" value={config.binWidth ?? config.tickStep} min={0} disabled={!isEditable} step="any" style={{ width: '4rem' }}
                                            onChange={(e) => setConfig({ binWidth: Math.max(0.0001, num(e.target.value, config.binWidth ?? config.tickStep)) })}
                                            onKeyDown={(e) => e.stopPropagation()} />
                                    </label>
                                )}
                                {interaction.type === 'build_boxplot' && (
                                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                        Tolerance:
                                        <input type="number" value={interaction.tolerance} min={0} disabled={!isEditable} step="any" style={{ width: '4rem' }}
                                            onChange={(e) => updateAttributes({ interaction: { ...interaction, tolerance: Math.max(0, num(e.target.value, interaction.tolerance)) } })}
                                            onKeyDown={(e) => e.stopPropagation()} />
                                    </label>
                                )}
                            </div>

                            {isGraded && (
                                <>
                                    <div>
                                        <span style={{ display: 'block', marginBottom: '0.2rem' }}>Worked solution</span>
                                        <InlineRichTextEditor
                                            value={solution}
                                            onChange={(nodes) => updateAttributes({ solution: nodes.length > 0 ? nodes : null })}
                                            ariaLabel="Worked solution"
                                        />
                                    </div>
                                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                        <input type="checkbox" checked={hasConfidenceRating} disabled={!isEditable}
                                            onChange={(e) => updateAttributes({ hasConfidenceRating: e.target.checked })}
                                            onKeyDown={(e) => e.stopPropagation()} />
                                        Ask for a confidence rating
                                    </label>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}
