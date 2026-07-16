import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import DraftNumberInput from './DraftNumberInput';
import { ToggleRow, renderSolutionField } from './QuestionSettings';
import type {
    NumberLineConfigAttr,
    NumberLineInteractionAttr,
} from '../extensions/NumberLine';

// ============================================================================
// NumberLineSettings — the number_line block's settings, rendered as a single
// `custom` drawer field (blockControls). Same pattern as GraphSettings /
// DataPlotSettings: reads node.attrs, writes via a pos-based setNodeAttr,
// themed with the AdvancedDrawer field classes. Replaces the block's old inline
// "⚙ Advanced settings" disclosure.
// ============================================================================

// Inlined to avoid a circular import with blockControls (which imports this
// module's render fn).
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

function NumberLineSettingsPanel({
    editor,
    node,
    pos,
}: {
    editor: Editor;
    node: PMNode;
    pos: number;
}) {
    const config = node.attrs.config as NumberLineConfigAttr;
    const interaction = node.attrs.interaction as NumberLineInteractionAttr;
    const isEditable = editor.isEditable;

    const setConfig = (patch: Partial<NumberLineConfigAttr>): void =>
        setNodeAttr(editor, pos, 'config', { ...config, ...patch });

    return (
        <div className="graph-settings">
            <div className="block-advanced-drawer__group">
                <div className="block-advanced-drawer__group-title">Number line</div>
                <div className="graph-settings__axis-grid">
                    <label className="graph-settings__axis-field">
                        <span className="block-advanced-drawer__label">Min</span>
                        <DraftNumberInput
                            value={config.min}
                            disabled={!isEditable}
                            className="block-advanced-drawer__control graph-settings__axis-num"
                            onCommit={(v) => setConfig({ min: v })}
                            ariaLabel="Line minimum"
                        />
                    </label>
                    <label className="graph-settings__axis-field">
                        <span className="block-advanced-drawer__label">Max</span>
                        <DraftNumberInput
                            value={config.max}
                            disabled={!isEditable}
                            className="block-advanced-drawer__control graph-settings__axis-num"
                            onCommit={(v) => setConfig({ max: v })}
                            ariaLabel="Line maximum"
                        />
                    </label>
                    <label className="graph-settings__axis-field">
                        <span className="block-advanced-drawer__label">Tick step</span>
                        <DraftNumberInput
                            value={config.tickStep}
                            min={0.0001}
                            disabled={!isEditable}
                            className="block-advanced-drawer__control graph-settings__axis-num"
                            onCommit={(v) => setConfig({ tickStep: v })}
                            ariaLabel="Tick step"
                        />
                    </label>
                    <label className="graph-settings__axis-field">
                        <span className="block-advanced-drawer__label">Tolerance</span>
                        {/* Blank tolerance reads as 0 (exact match). */}
                        <DraftNumberInput
                            value={interaction.tolerance}
                            min={0}
                            onEmpty={0}
                            disabled={!isEditable}
                            className="block-advanced-drawer__control graph-settings__axis-num"
                            onCommit={(v) =>
                                setNodeAttr(editor, pos, 'interaction', {
                                    ...interaction,
                                    tolerance: v,
                                })
                            }
                            ariaLabel="Tolerance"
                        />
                    </label>
                </div>
                <ToggleRow
                    checked={config.snapToTick}
                    disabled={!isEditable}
                    onChange={(v) => setConfig({ snapToTick: v })}
                    label="Snap to tick"
                />
            </div>

            <div className="block-advanced-drawer__group">
                <div className="block-advanced-drawer__group-title">Grading</div>
                {renderSolutionField({ editor, node, pos })}
                <ToggleRow
                    checked={Boolean(node.attrs.hasConfidenceRating)}
                    disabled={!isEditable}
                    onChange={(v) => setNodeAttr(editor, pos, 'hasConfidenceRating', v)}
                    label="Ask for a confidence rating"
                />
            </div>
        </div>
    );
}

/** The number_line `custom` drawer field. */
export function renderNumberLineSettings(ctx: {
    editor: Editor;
    node: PMNode;
    pos: number;
}): ReactNode {
    return <NumberLineSettingsPanel {...ctx} />;
}
