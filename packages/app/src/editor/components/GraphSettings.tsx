import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import {
    parseGraphFormula,
    parsePointList,
    parseRaySegment,
} from '@activity/graph-kit';
import InlineRichTextEditor from './InlineRichTextEditor';
import DraftNumberInput from './DraftNumberInput';
import {
    firstModel,
    firstRay,
    firstRegion,
    firstSegment,
} from '../nodeViews/graphAnswerHelpers';
import type { InlineNodes } from '../../lib/serialize';
import type {
    FunctionModelAttr,
    GraphAxisConfig,
    GraphInteraction,
    GraphMistakeEntry,
} from '../extensions/InteractiveGraph';

// ============================================================================
// GraphSettings — the interactive_graph block's settings, rendered as a single
// `custom` drawer field (blockControls). Relocated verbatim from the NodeView's
// old inline "⚙ Advanced settings" disclosure; the write-path converts from the
// NodeView's `updateAttributes` closure to a pos-based `setNodeAttr` (the drawer
// is a separate React tree at editor root). Interaction-dependent (each type has
// its own tolerance row; display is ungraded → axis only), so it branches on the
// live node rather than being static typed fields.
//
// THE LOAD-BEARING INVARIANT (TEST_SPEC INV1): a settings write never changes
// `interaction.type` and preserves the type's other answer fields — every
// `interaction` write below spreads the current type-narrowed shape.
// ============================================================================

const num = (v: string, d: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};

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

// A tolerance control: slider + numeric input side by side (author preference).
// Behavior preserved verbatim — the axis-field fight fix (DraftNumberInput) is
// scoped to the axis boxes only (ratified D5); the tolerance number is paired
// with a slider, so the raw-commit annoyance has a fallback.
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

function GraphSettingsPanel({
    editor,
    node,
    pos,
}: {
    editor: Editor;
    node: PMNode;
    pos: number;
}) {
    const interaction = node.attrs.interaction as GraphInteraction;
    const axisConfig = node.attrs.axisConfig as GraphAxisConfig;
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const isDisplay = interaction.type === 'display';
    const isEditable = editor.isEditable;

    const setInteraction = (next: GraphInteraction): void =>
        setNodeAttr(editor, pos, 'interaction', next);
    const setAxis = (patch: Partial<GraphAxisConfig>): void =>
        setNodeAttr(editor, pos, 'axisConfig', { ...axisConfig, ...patch });

    // --- Mistake feedback CRUD (relocated; reads the live node) --------------
    const mistakeEntries = (node.attrs.mistakeFeedback ?? []) as GraphMistakeEntry[];
    const setMistakeEntry = (i: number, entry: GraphMistakeEntry): void =>
        setNodeAttr(
            editor,
            pos,
            'mistakeFeedback',
            mistakeEntries.map((m, j) => (j === i ? entry : m)),
        );
    const removeMistakeEntry = (i: number): void =>
        setNodeAttr(
            editor,
            pos,
            'mistakeFeedback',
            mistakeEntries.filter((_, j) => j !== i),
        );
    const addMistakeEntry = (): void =>
        setNodeAttr(editor, pos, 'mistakeFeedback', [
            ...mistakeEntries,
            { match: '', feedback: [] },
        ]);
    const mistakeMatchPlaceholder =
        interaction.type === 'plot_point'
            ? '(4, 3)'
            : interaction.type === 'graph_inequality'
              ? 'y < 2x + 1  (or a boundary like y = 2x + 1)'
              : interaction.type === 'plot_ray' || interaction.type === 'plot_segment'
                ? 'ray (1, 2) through (3, 4)  or  segment (1, 2) to (3, 4)'
                : 'y = x + 2';
    const mistakeMatchError = (raw: string): string | null => {
        if (raw.trim() === '') return 'Type the wrong answer to watch for.';
        if (interaction.type === 'plot_point') {
            return parsePointList(raw) ? null : 'Type coordinates, like (4, 3)';
        }
        if (interaction.type === 'plot_ray' || interaction.type === 'plot_segment') {
            const parsed = parseRaySegment(raw);
            return parsed.kind === 'error' ? parsed.message : null;
        }
        const parsed = parseGraphFormula(raw);
        if (parsed.kind === 'error') return parsed.message;
        if (interaction.type === 'plot_function' && parsed.kind !== 'function') {
            return 'Type an equation, like y = x + 2';
        }
        if (
            interaction.type === 'graph_inequality' &&
            parsed.kind !== 'inequality' &&
            parsed.kind !== 'function'
        ) {
            return 'Type an inequality (y < 2x + 1) or a boundary equation (y = 2x + 1)';
        }
        return null;
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#334155',
            }}
        >
            {/* Axis window — fields converted to DraftNumberInput (ratified D5)
                so clearing a box to retype no longer snaps the old value back. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '0.3rem 0.6rem', alignItems: 'center' }}>
                {(['xMin', 'xMax', 'yMin', 'yMax'] as const).map((k) => (
                    <label key={k} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {k}
                        <DraftNumberInput
                            value={axisConfig[k]}
                            disabled={!isEditable}
                            style={{ width: '3.5rem' }}
                            onCommit={(v) => setAxis({ [k]: v })}
                            ariaLabel={k}
                        />
                    </label>
                ))}
                {(['xGridStep', 'yGridStep'] as const).map((k) => (
                    <label key={k} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {k === 'xGridStep' ? 'x grid' : 'y grid'}
                        <DraftNumberInput
                            value={axisConfig[k]}
                            min={0.1}
                            disabled={!isEditable}
                            style={{ width: '3.5rem' }}
                            onCommit={(v) => setAxis({ [k]: v })}
                            ariaLabel={k === 'xGridStep' ? 'x grid step' : 'y grid step'}
                        />
                    </label>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <input type="checkbox" checked={axisConfig.showGrid} disabled={!isEditable}
                        onChange={(e) => setAxis({ showGrid: e.target.checked })} />
                    Show grid
                </label>
                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <input type="checkbox" checked={axisConfig.snapToGrid} disabled={!isEditable}
                        onChange={(e) => setAxis({ snapToGrid: e.target.checked })} />
                    Snap to grid
                </label>
            </div>

            {/* Tolerance / strictness — differs by interaction. INV1: every
                write spreads the current type-narrowed shape, never changes type. */}
            {interaction.type === 'plot_point' && (
                <ToleranceRow
                    label="Tolerance"
                    value={interaction.tolerance}
                    disabled={!isEditable}
                    onChange={(v) => setInteraction({ ...interaction, tolerance: v })}
                />
            )}
            {interaction.type === 'plot_function' &&
                Object.entries(firstModel(interaction.models))
                    .filter(([k, v]) => k.endsWith('Tolerance') && typeof v === 'number')
                    .map(([k, v]) => (
                        <ToleranceRow
                            key={k}
                            label={
                                k.slice(0, -'Tolerance'.length).charAt(0).toUpperCase() +
                                k.slice(1, -'Tolerance'.length) +
                                ' tolerance'
                            }
                            value={v as number}
                            disabled={!isEditable}
                            onChange={(val) =>
                                setInteraction({
                                    type: 'plot_function',
                                    models: [{ ...firstModel(interaction.models), [k]: val } as FunctionModelAttr],
                                })
                            }
                        />
                    ))}
            {(interaction.type === 'plot_ray' || interaction.type === 'plot_segment') && (
                <ToleranceRow
                    label="Endpoint tolerance"
                    value={
                        interaction.type === 'plot_ray'
                            ? firstRay(interaction.rays).tolerance
                            : firstSegment(interaction.segments).tolerance
                    }
                    disabled={!isEditable}
                    onChange={(v) =>
                        setInteraction(
                            interaction.type === 'plot_ray'
                                ? { type: 'plot_ray', rays: [{ ...firstRay(interaction.rays), tolerance: v }] }
                                : { type: 'plot_segment', segments: [{ ...firstSegment(interaction.segments), tolerance: v }] },
                        )
                    }
                />
            )}
            {interaction.type === 'shade_region' && (
                <ToleranceRow
                    label="Min. overlap (IoU)"
                    value={firstRegion(interaction.regions).minOverlap}
                    max={1}
                    disabled={!isEditable}
                    onChange={(v) =>
                        setInteraction({
                            type: 'shade_region',
                            regions: [
                                { ...firstRegion(interaction.regions), minOverlap: Math.min(1, Math.max(0, v)) },
                            ],
                        })
                    }
                />
            )}

            {/* A static display graph is ungraded — no solution/confidence/mistakes. */}
            {!isDisplay && (
                <>
                    <div>
                        <span style={{ display: 'block', marginBottom: '0.2rem' }}>Worked solution</span>
                        <InlineRichTextEditor
                            value={solution}
                            onChange={(nodes) =>
                                setNodeAttr(editor, pos, 'solution', nodes.length > 0 ? nodes : null)
                            }
                            ariaLabel="Worked solution"
                        />
                    </div>

                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={hasConfidenceRating} disabled={!isEditable}
                            onChange={(e) => setNodeAttr(editor, pos, 'hasConfidenceRating', e.target.checked)} />
                        Ask for a confidence rating
                    </label>

                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={Boolean(node.attrs.partialCredit)} disabled={!isEditable}
                            onChange={(e) => setNodeAttr(editor, pos, 'partialCredit', e.target.checked)} />
                        Partial credit (score each part separately)
                    </label>

                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={Boolean(node.attrs.allowNoSolution)} disabled={!isEditable}
                            onChange={(e) => setNodeAttr(editor, pos, 'allowNoSolution', e.target.checked)} />
                        Offer a “cannot be graphed / no solution” choice
                    </label>

                    {Boolean(node.attrs.allowNoSolution) && (
                        <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginLeft: '1.2rem' }}>
                            <input type="checkbox" checked={Boolean(node.attrs.noSolutionCorrect)} disabled={!isEditable}
                                onChange={(e) => setNodeAttr(editor, pos, 'noSolutionCorrect', e.target.checked)} />
                            “No solution” IS the correct answer (trick question)
                        </label>
                    )}

                    {/* Mistake feedback: built-in classifier toggle (auto-feedback,
                        stays default-on) + authored anticipated mistakes. */}
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem' }}>
                        <span style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>Mistake feedback</span>
                        <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                            <input type="checkbox" checked={node.attrs.builtinFeedback !== false} disabled={!isEditable}
                                onChange={(e) => setNodeAttr(editor, pos, 'builtinFeedback', e.target.checked)} />
                            Built-in nudges for common mistakes (swapped coordinates, wrong side, …)
                        </label>
                        {mistakeEntries.map((entry, i) => (
                            <div key={i} style={{ marginTop: '0.4rem', padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    <span style={{ whiteSpace: 'nowrap' }}>If the answer is</span>
                                    <input
                                        type="text"
                                        value={entry.match}
                                        disabled={!isEditable}
                                        placeholder={mistakeMatchPlaceholder}
                                        spellCheck={false}
                                        style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}
                                        onChange={(e) => setMistakeEntry(i, { ...entry, match: e.target.value })}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        type="button"
                                        disabled={!isEditable}
                                        onClick={() => removeMistakeEntry(i)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.78rem' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                                {mistakeMatchError(entry.match) && (
                                    <p role="status" style={{ margin: 0, fontSize: '0.72rem', color: '#b45309' }}>
                                        {mistakeMatchError(entry.match)}
                                    </p>
                                )}
                                <InlineRichTextEditor
                                    value={entry.feedback}
                                    onChange={(nodes) => setMistakeEntry(i, { ...entry, feedback: nodes })}
                                    ariaLabel={`Feedback for anticipated mistake ${i + 1}`}
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            disabled={!isEditable}
                            onClick={addMistakeEntry}
                            style={{ marginTop: '0.35rem', fontSize: '0.75rem', padding: '0.15rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: 4, background: '#f8fafc', cursor: 'pointer', color: '#334155' }}
                        >
                            + Anticipated mistake
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/** The interactive_graph `custom` drawer field. */
export function renderGraphSettings(ctx: {
    editor: Editor;
    node: PMNode;
    pos: number;
}): ReactNode {
    return <GraphSettingsPanel {...ctx} />;
}
