import { useEffect, useState, type ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import DraftNumberInput from './DraftNumberInput';
import { BlockSizingField } from './BlockSizingField';
import { renderSolutionField } from './QuestionSettings';
import type {
    DataPlotConfigAttr,
    DataPlotInteractionAttr,
} from '../extensions/DataPlot';
import type { SectionBreakStorage } from '../extensions/SectionBreak';

/** The activity's `sample` variable names, live (Editor.tsx writes them into
 *  SectionBreak storage; a drawer panel has no other route to the activity). */
function useSampleNames(editor: Editor): string[] {
    const storage = (editor.storage as { sectionBreak?: SectionBreakStorage }).sectionBreak;
    const [names, setNames] = useState<string[]>(() => storage?.seedSampleNames ?? []);
    useEffect(() => {
        if (!storage) return;
        const update = () => setNames([...(storage.seedSampleNames ?? [])]);
        storage.listeners.add(update);
        update();
        return () => {
            storage.listeners.delete(update);
        };
    }, [storage]);
    return names;
}

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
// solution only when graded), which the static typed-field model
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
    // GUI sweep item 7 (ruled 2026-11-13): plot a seeded `sample` variable.
    const samples = useSampleNames(editor);
    const dataVar = typeof node.attrs.dataVar === 'string' && node.attrs.dataVar !== '' ? (node.attrs.dataVar as string) : null;
    const missing = dataVar !== null && !samples.includes(dataVar);

    const setConfig = (patch: Partial<DataPlotConfigAttr>): void =>
        setNodeAttr(editor, pos, 'config', { ...config, ...patch });

    const axisField = (
        label: string,
        ariaLabel: string,
        value: number,
        onCommit: (v: number) => void,
        opts?: { min?: number; onEmpty?: 0 },
    ) => (
        <label className="graph-settings__axis-field">
            <span className="block-advanced-drawer__label">{label}</span>
            <DraftNumberInput
                value={value}
                min={opts?.min}
                onEmpty={opts?.onEmpty}
                disabled={!isEditable}
                className="block-advanced-drawer__control graph-settings__axis-num"
                onCommit={onCommit}
                ariaLabel={ariaLabel}
            />
        </label>
    );

    return (
        <div className="graph-settings">
            <BlockSizingField editor={editor} node={node} pos={pos} />
            {(samples.length > 0 || dataVar !== null) && (
                <div className="block-advanced-drawer__group">
                    <div className="block-advanced-drawer__group-title">Data</div>
                    <label className="block-advanced-drawer__field">
                        <span className="block-advanced-drawer__label">Plot</span>
                        <select
                            className="block-advanced-drawer__control"
                            disabled={!isEditable}
                            value={dataVar ?? ''}
                            onChange={(e) => setNodeAttr(editor, pos, 'dataVar', e.target.value === '' ? null : e.target.value)}
                        >
                            <option value="">These numbers</option>
                            {samples.map((name) => (
                                <option key={name} value={name}>
                                    Seeded variable {name} (different for each student)
                                </option>
                            ))}
                            {missing && <option value={dataVar}>{dataVar} (no longer declared)</option>}
                        </select>
                        <span className="block-advanced-drawer__help">
                            {dataVar === null
                                ? 'Students see the numbers in the block.'
                                : 'Each student gets their own draw; the numbers in the block are only the preview.'}
                        </span>
                    </label>
                    {missing && (
                        <p role="alert" className="block-advanced-drawer__help" data-testid="dataplot-var-missing">
                            “{dataVar}” is not a sample variable in Seeded variables any more. Declare it there, or choose
                            another source.
                        </p>
                    )}
                </div>
            )}
            <div className="block-advanced-drawer__group">
                <div className="block-advanced-drawer__group-title">Chart</div>
                <div className="graph-settings__axis-grid">
                    {axisField('Min', 'Axis minimum', config.min, (v) => setConfig({ min: v }))}
                    {axisField('Max', 'Axis maximum', config.max, (v) => setConfig({ max: v }))}
                    {axisField('Tick step', 'Tick step', config.tickStep, (v) => setConfig({ tickStep: v }), { min: 0.0001 })}
                    {chart === 'histogram' &&
                        axisField('Bin width', 'Bin width', config.binWidth ?? config.tickStep, (v) => setConfig({ binWidth: v }), { min: 0.0001 })}
                    {interaction.type === 'build_boxplot' &&
                        axisField('Tolerance', 'Tolerance', interaction.tolerance, (v) =>
                            setNodeAttr(editor, pos, 'interaction', { ...interaction, tolerance: v }),
                        { min: 0, onEmpty: 0 })}
                </div>
            </div>

            {isGraded && (
                <div className="block-advanced-drawer__group">
                    <div className="block-advanced-drawer__group-title">Grading</div>
                    {renderSolutionField({ editor, node, pos })}
                </div>
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
