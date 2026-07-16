import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import DraftNumberInput from './DraftNumberInput';
import { renderSolutionField } from './QuestionSettings';
import type {
    DataPlotConfigAttr,
    DataPlotInteractionAttr,
} from '../extensions/DataPlot';

// Write a node attr at `pos` (inlined to avoid a circular import with
// blockControls, which imports this module's render fn).
function setNodeAttr(
    editor: Editor,
    pos: number,
    key: string,
    value: unknown,
): void {
    editor
        .chain()
        .command(({ tr }) => {
            tr.setNodeAttribute(pos, key, value);
            return true;
        })
        .run();
}

// ============================================================================
// DataPlotSettings — the data_plot block's settings, rendered as a single
// `custom` drawer field (blockControls). The fields are interaction-dependent
// (bin width only for histograms, tolerance only for boxplots, worked
// solution/confidence only when graded), which the static typed-field model
// can't express — so the panel branches on the live node. Replaces the block's
// old inline "⚙ Advanced settings" disclosure; reached now via the quick-bar ⚙.
// ============================================================================

function chartOf(
    interaction: DataPlotInteractionAttr,
): 'dotplot' | 'histogram' | 'boxplot' {
    if (interaction.type === 'display') return interaction.chart;
    if (interaction.type === 'build_histogram') return 'histogram';
    if (interaction.type === 'build_boxplot') return 'boxplot';
    return 'dotplot';
}

const rowStyle = { display: 'flex', gap: '0.3rem', alignItems: 'center' } as const;

function DataPlotSettingsPanel({
    editor,
    node,
    pos,
}: {
    editor: Editor;
    node: PMNode;
    pos: number;
}) {
    const config = node.attrs.config as DataPlotConfigAttr;
    const interaction = node.attrs.interaction as DataPlotInteractionAttr;
    const isEditable = editor.isEditable;
    const isGraded = interaction.type !== 'display';
    const chart = chartOf(interaction);

    const setConfig = (patch: Partial<DataPlotConfigAttr>): void =>
        setNodeAttr(editor, pos, 'config', { ...config, ...patch });

    return (
        <div className="data-plot-settings">
            <div className="data-plot-settings__row">
                <label style={rowStyle}>
                    Min:
                    <DraftNumberInput
                        value={config.min}
                        disabled={!isEditable}
                        style={{ width: '4rem' }}
                        onCommit={(v) => setConfig({ min: v })}
                        ariaLabel="Axis minimum"
                    />
                </label>
                <label style={rowStyle}>
                    Max:
                    <DraftNumberInput
                        value={config.max}
                        disabled={!isEditable}
                        style={{ width: '4rem' }}
                        onCommit={(v) => setConfig({ max: v })}
                        ariaLabel="Axis maximum"
                    />
                </label>
                <label style={rowStyle}>
                    Tick step:
                    <DraftNumberInput
                        value={config.tickStep}
                        min={0.0001}
                        disabled={!isEditable}
                        style={{ width: '4rem' }}
                        onCommit={(v) => setConfig({ tickStep: v })}
                        ariaLabel="Tick step"
                    />
                </label>
                {chart === 'histogram' && (
                    <label style={rowStyle}>
                        Bin width:
                        <DraftNumberInput
                            value={config.binWidth ?? config.tickStep}
                            min={0.0001}
                            disabled={!isEditable}
                            style={{ width: '4rem' }}
                            onCommit={(v) => setConfig({ binWidth: v })}
                            ariaLabel="Bin width"
                        />
                    </label>
                )}
                {interaction.type === 'build_boxplot' && (
                    <label style={rowStyle}>
                        Tolerance:
                        {/* Blank tolerance reads as 0 (exact match). */}
                        <DraftNumberInput
                            value={interaction.tolerance}
                            min={0}
                            onEmpty={0}
                            disabled={!isEditable}
                            style={{ width: '4rem' }}
                            onCommit={(v) =>
                                setNodeAttr(editor, pos, 'interaction', {
                                    ...interaction,
                                    tolerance: v,
                                })
                            }
                            ariaLabel="Tolerance"
                        />
                    </label>
                )}
            </div>

            {isGraded && (
                <>
                    <div className="data-plot-settings__group-title">Grading</div>
                    {renderSolutionField({ editor, node, pos })}
                    <label
                        className="block-advanced-drawer__field block-advanced-drawer__field--toggle"
                    >
                        <input
                            type="checkbox"
                            checked={Boolean(node.attrs.hasConfidenceRating)}
                            disabled={!isEditable}
                            onChange={(e) =>
                                setNodeAttr(
                                    editor,
                                    pos,
                                    'hasConfidenceRating',
                                    e.target.checked,
                                )
                            }
                        />
                        <span className="block-advanced-drawer__field-text">
                            <span className="block-advanced-drawer__label">
                                Ask for a confidence rating
                            </span>
                        </span>
                    </label>
                </>
            )}
        </div>
    );
}

/** The data_plot `custom` drawer field. */
export function renderDataPlotSettings(ctx: {
    editor: Editor;
    node: PMNode;
    pos: number;
}): ReactNode {
    return <DataPlotSettingsPanel {...ctx} />;
}
