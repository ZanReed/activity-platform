import { useMemo, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { renderDataPlotSvg, fiveNumberSummary } from '@activity/renderer';
import { QuestionSettingsSummary } from '../components/QuestionSettings';
import { usePreviewToggle } from '../components/usePreviewToggle';
import PromptField from '../components/PromptField';
import type { InlineNodes } from '../../lib/serialize';
import { problemNumberAt } from '../problemNumbering';
import { figureSizingStyle, readSizingAttrs } from '../figureSizingStyle';
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

const labelStyle = { fontSize: '0.8rem', color: 'var(--ed-text-secondary)' } as const;

export default function DataPlotView({
    node,
    editor,
    getPos,
    updateAttributes,
    selected,
}: NodeViewProps) {
    const data = node.attrs.data as number[];
    const config = node.attrs.config as DataPlotConfigAttr;
    const interaction = node.attrs.interaction as DataPlotInteractionAttr;
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const sizing = readSizingAttrs(node.attrs);
    const isEditable = editor.isEditable;
    const isGraded = interaction.type !== 'display';
    const chart = chartOf(interaction);

    // The dataset field is free text so the author can type mid-value without the
    // parse fighting them; committed to attrs.data whenever it parses non-empty.
    const [dataText, setDataText] = useState(() => data.join(', '));

    // Preview-as-student: hide all authoring chrome (type picker, data input,
    // helper text, settings summary), keep the prompt + the rendered figure.
    const { preview } = usePreviewToggle((node.attrs.id as string) ?? '');

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

    // The prompt/caption (the block's editable content hole). Graded = the
    // question, ABOVE the chart (read the question, then the plot — like the
    // interactive graph). Display = a caption, BELOW the figure (convention).
    const promptSection = (
        <div style={{ marginTop: '0.5rem', marginBottom: isGraded ? '0.5rem' : 0 }}>
            <span
                contentEditable={false}
                style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--ed-faint)' }}
            >
                {isGraded ? 'Question prompt' : 'Caption (optional)'}
            </span>
            <PromptField
                node={node}
                className="data-plot-block__prompt"
                placeholder={isGraded ? 'Type the question…' : 'Add a caption…'}
            />
        </div>
    );

    return (
        <NodeViewWrapper
            className={`data-plot-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div contentEditable={false} style={{ userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--ed-text-strong)' }}>
                        {isGraded ? `${problemNumber}. ` : ''}Data plot
                    </strong>
                    {!preview && (
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
                    )}
                </div>
            </div>

            {/* Graded: the question prompt sits ABOVE the chart. */}
            {isGraded && promptSection}

            <div contentEditable={false} style={{ userSelect: 'none' }}>
                {!preview && (
                    <label style={{ ...labelStyle, display: 'block', marginBottom: '0.35rem' }}>
                        Data{isGraded ? ' (students plot this; the correct plot is computed from it)' : ''}:{' '}
                        <input
                            type="text"
                            value={dataText}
                            disabled={!isEditable}
                            placeholder="e.g. 3, 5, 5, 6, 8"
                            style={{
                                width: '18rem',
                                maxWidth: '100%',
                                padding: '0.25rem 0.4375rem',
                                border: '1px solid var(--ed-border-strong)',
                                borderRadius: '0.3125rem',
                                background: 'var(--ed-canvas)',
                                color: 'var(--ed-text)',
                                fontSize: '0.8125rem',
                            }}
                            onChange={(e) => onDataText(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </label>
                )}

                <div
                    contentEditable={false}
                    style={{ border: '1px solid var(--ed-border)', borderRadius: 6, background: '#fff', padding: '0.4rem', maxWidth: '34rem', ...figureSizingStyle(sizing.width, sizing.align) }}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
                {!preview && interaction.type === 'build_boxplot' && data.length > 0 && (() => {
                    const s = fiveNumberSummary(data);
                    return (
                        <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: 'var(--ed-text-secondary)' }}>
                            Target (TI-84): min {s.min} · Q1 {s.q1} · median {s.median} · Q3 {s.q3} · max {s.max}
                        </p>
                    );
                })()}
                {!preview && (
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: 'var(--ed-text-muted)' }}>
                        {isGraded
                            ? `Students build this ${chart === 'histogram' ? 'histogram' : chart === 'boxplot' ? 'box plot' : 'dot plot'}; it is scored against the data above.`
                            : 'A static figure students read (pair it with a question block to grade).'}
                    </p>
                )}
            </div>

            {/* Display: the caption sits BELOW the figure (convention). */}
            {!isGraded && promptSection}

            {isGraded && !preview && (
                <QuestionSettingsSummary
                    hasSolution={solution.length > 0}
                    hasConfidenceRating={hasConfidenceRating}
                    workSpace={null}
                />
            )}
        </NodeViewWrapper>
    );
}
