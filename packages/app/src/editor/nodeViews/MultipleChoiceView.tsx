import { useMemo, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import { renderGraphSvg, type AxisConfig, type Drawable } from '@activity/renderer';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import DrawableListEditor, {
    NumCell,
    ALL_DRAWABLE_KINDS,
} from '../components/DrawableListEditor';
import type { InlineNodes } from '../../lib/serialize';
import type { EditorMcChoice } from '../extensions/MultipleChoice';
import type { GraphAxisConfig } from '../extensions/InteractiveGraph';
import { problemNumberAt } from '../problemNumbering';

// ============================================================================
// MultipleChoiceView — NodeView for the multiple_choice block.
// ----------------------------------------------------------------------------
// Layout mirrors FillInBlankView: number gutter + editable prompt
// (NodeViewContent), then a contentEditable={false} choice list the NodeView
// owns — each row is [correct marker] [letter] [rich content editor]
// [feedback toggle] [remove]. Choices are a structured node attr; every edit
// writes through updateAttributes (document state, not React state — the
// only React state here is which feedback disclosures are open + the
// settings footer, per the 5-commitments rule).
//
// Correctness marking:
//   Single-select: marking a choice correct clears the others (radio
//   semantics). Multi-select: independent toggles. Switching multi → single
//   keeps only the FIRST correct choice. No choice marked correct is legal
//   to SAVE (mid-edit drafts must autosave) but is surfaced as an inline
//   warning — the published block would score every selection wrong.
//
// Minimum choices: the schema requires 2+, so the remove button disables at
// two rows rather than letting serialize face an invalid shape.
// ============================================================================

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Choice-figure graphs are rendered kit-free on the published page
// (renderGraphSvg), which cannot evaluate freeform formulas — so the
// `expression` drawable is not offered here (it would silently draw nothing).
const MC_DRAWABLE_KINDS = ALL_DRAWABLE_KINDS.filter((k) => k !== 'expression');

// A compact default window for a choice-sized figure (the block-level graph
// default of ±10 reads cramped at ~11rem).
function defaultChoiceAxis(): GraphAxisConfig {
    return {
        xMin: -5, xMax: 5, yMin: -5, yMax: 5,
        xGridStep: 1, yGridStep: 1,
        showGrid: true, snapToGrid: true,
    };
}

function isValidUrl(s: string): boolean {
    try {
        new URL(s);
        return true;
    } catch {
        return false;
    }
}

// Anything carrying the optional figure slot (MC choices, matching items and
// targets — the shapes are structural twins).
export interface FigureHolder {
    id: string;
    image?: EditorMcChoice['image'];
    graph?: EditorMcChoice['graph'];
}

// The per-figure panel (image URL/alt or a static graph). Module-scope so
// element identity survives the parent's re-renders, same rule as NumCell.
// Exported for MatchingView, which reuses it per item/target row.
export function ChoiceFigureEditor({
    choice,
    label,
    disabled,
    onImage,
    onGraph,
}: {
    choice: FigureHolder;
    /** e.g. "choice B" / "item 2" — completes "Figure under …". */
    label: string;
    disabled: boolean;
    onImage: (image: EditorMcChoice['image'] | undefined) => void;
    onGraph: (graph: EditorMcChoice['graph'] | undefined) => void;
}) {
    const { image, graph } = choice;
    // Live preview through the EXACT engine the published page uses — the
    // renderer is pure, so this is a string transform, no I/O. The editor-side
    // attr types are structural twins of the schema shapes (the save boundary
    // re-validates), hence the casts.
    const previewSvg = useMemo(
        () =>
            graph
                ? renderGraphSvg(
                      graph.axis as AxisConfig,
                      graph.drawables as Drawable[],
                      'mcfig-' + choice.id,
                  )
                : '',
        [graph, choice.id],
    );
    const setAxis = (patch: Partial<GraphAxisConfig>): void => {
        if (graph) onGraph({ ...graph, axis: { ...graph.axis, ...patch } });
    };

    return (
        <div className="mc-block__figure">
            <span className="mc-block__figure-label">
                Figure under {label} (shown to students)
            </span>
            {!image && !graph && (
                <div className="mc-block__figure-actions">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onImage({ src: '', alt: '' })}
                    >
                        + Image (URL)
                    </button>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                            onGraph({ axis: defaultChoiceAxis(), drawables: [] })
                        }
                    >
                        + Graph
                    </button>
                </div>
            )}
            {image && (
                <div className="mc-block__figure-section">
                    <label className="mc-block__figure-field">
                        <span>Image URL</span>
                        <input
                            type="url"
                            value={image.src}
                            placeholder="https://…"
                            disabled={disabled}
                            onChange={(e) =>
                                onImage({ ...image, src: e.target.value })
                            }
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </label>
                    <label className="mc-block__figure-field">
                        <span>Alt text</span>
                        <input
                            type="text"
                            value={image.alt}
                            placeholder="Describe the picture"
                            disabled={disabled}
                            onChange={(e) =>
                                onImage({ ...image, alt: e.target.value })
                            }
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </label>
                    {!isValidUrl(image.src) && (
                        <span className="mc-block__figure-hint">
                            Paste a full image URL — the figure is left off the
                            published page until it&apos;s valid.
                        </span>
                    )}
                    {isValidUrl(image.src) && image.alt.trim() === '' && (
                        <span className="mc-block__figure-hint">
                            Add alt text so screen-reader users can compare the
                            choices.
                        </span>
                    )}
                    {isValidUrl(image.src) && (
                        <img
                            className="mc-block__figure-preview"
                            src={image.src}
                            alt={image.alt}
                        />
                    )}
                    <button
                        type="button"
                        className="mc-block__figure-remove"
                        disabled={disabled}
                        onClick={() => onImage(undefined)}
                    >
                        Remove image
                    </button>
                </div>
            )}
            {graph && (
                <div className="mc-block__figure-section">
                    {previewSvg !== '' && (
                        <div
                            className="mc-block__figure-preview"
                            aria-hidden="true"
                            dangerouslySetInnerHTML={{ __html: previewSvg }}
                        />
                    )}
                    <div className="mc-block__figure-axis">
                        {(['xMin', 'xMax', 'yMin', 'yMax'] as const).map((k) => (
                            <label key={k}>
                                {k}
                                <NumCell
                                    value={graph.axis[k]}
                                    disabled={disabled}
                                    onChange={(v) => setAxis({ [k]: v })}
                                />
                            </label>
                        ))}
                        {(['xGridStep', 'yGridStep'] as const).map((k) => (
                            <label key={k}>
                                {k === 'xGridStep' ? 'x grid' : 'y grid'}
                                <NumCell
                                    value={graph.axis[k]}
                                    disabled={disabled}
                                    onChange={(v) => {
                                        if (v > 0) setAxis({ [k]: v });
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                    <DrawableListEditor
                        drawables={graph.drawables}
                        disabled={disabled}
                        onChange={(drawables) => onGraph({ ...graph, drawables })}
                        kinds={MC_DRAWABLE_KINDS}
                    />
                    <button
                        type="button"
                        className="mc-block__figure-remove"
                        disabled={disabled}
                        onClick={() => onGraph(undefined)}
                    >
                        Remove graph
                    </button>
                </div>
            )}
        </div>
    );
}

export default function MultipleChoiceView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [openFeedback, setOpenFeedback] = useState<Record<string, boolean>>({});
    const [openFigure, setOpenFigure] = useState<Record<string, boolean>>({});

    const choices = (node.attrs.choices as EditorMcChoice[]) ?? [];
    const multiSelect = Boolean(node.attrs.multiSelect);
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasSolution = solution.length > 0;
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const workSpace =
        typeof node.attrs.workSpace === 'number'
            ? (node.attrs.workSpace as number)
            : null;
    const isEditable = editor.isEditable;
    const isConfigured = hasSolution || hasConfidenceRating || workSpace !== null;
    const showFooter = isEditable || isConfigured;
    const noneCorrect = choices.length > 0 && choices.every((c) => !c.correct);

    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // editor.state (not editor) is the real dependency — recompute when
        // the document changes, same as FillInBlankView.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );

    const commitChoices = (next: EditorMcChoice[]) => {
        updateAttributes({ choices: next });
    };

    const setCorrect = (choiceId: string, correct: boolean) => {
        commitChoices(
            choices.map((c) => {
                if (c.id === choiceId) return { ...c, correct };
                // Radio semantics for single-select: one winner.
                return multiSelect || !correct ? c : { ...c, correct: false };
            }),
        );
    };

    const setContent = (choiceId: string, content: InlineNodes) => {
        commitChoices(
            choices.map((c) => (c.id === choiceId ? { ...c, content } : c)),
        );
    };

    const setFeedback = (choiceId: string, feedback: InlineNodes) => {
        commitChoices(
            choices.map((c) => {
                if (c.id !== choiceId) return c;
                if (feedback.length > 0) return { ...c, feedback };
                // Cleared feedback drops the key entirely (serialize omits
                // empty feedback anyway; keep the attr shape canonical).
                const cleared = { ...c };
                delete cleared.feedback;
                return cleared;
            }),
        );
    };

    const setImage = (
        choiceId: string,
        image: EditorMcChoice['image'] | undefined,
    ) => {
        commitChoices(
            choices.map((c) => {
                if (c.id !== choiceId) return c;
                const next = { ...c };
                if (image) next.image = image;
                else delete next.image;
                return next;
            }),
        );
    };

    const setGraph = (
        choiceId: string,
        graph: EditorMcChoice['graph'] | undefined,
    ) => {
        commitChoices(
            choices.map((c) => {
                if (c.id !== choiceId) return c;
                const next = { ...c };
                if (graph) next.graph = graph;
                else delete next.graph;
                return next;
            }),
        );
    };

    const addChoice = () => {
        commitChoices([
            ...choices,
            { id: crypto.randomUUID(), content: [], correct: false },
        ]);
    };

    const removeChoice = (choiceId: string) => {
        if (choices.length <= 2) return;
        commitChoices(choices.filter((c) => c.id !== choiceId));
    };

    const toggleMultiSelect = (next: boolean) => {
        if (!next) {
            // Multi → single keeps only the first correct choice.
            let seen = false;
            const collapsed = choices.map((c) => {
                if (!c.correct) return c;
                if (seen) return { ...c, correct: false };
                seen = true;
                return c;
            });
            updateAttributes({ multiSelect: false, choices: collapsed });
        } else {
            updateAttributes({ multiSelect: true });
        }
    };

    return (
        <NodeViewWrapper
            className={`mc-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div className="mc-block__number" contentEditable={false}>
                {problemNumber}.
            </div>
            <div className="mc-block__body">
                <NodeViewContent className="mc-block__prompt" />
                <div className="mc-block__controls" contentEditable={false}>
                    <label className="mc-block__multi-toggle">
                        <input
                            type="checkbox"
                            checked={multiSelect}
                            onChange={(e) => toggleMultiSelect(e.target.checked)}
                            onKeyDown={(e) => e.stopPropagation()}
                            disabled={!isEditable}
                        />
                        <span>Multiple answers (“select all that apply”)</span>
                    </label>
                    {noneCorrect && (
                        <div className="mc-block__warning" role="alert">
                            Mark at least one choice as correct — right now every
                            answer would score wrong.
                        </div>
                    )}
                    <div className="mc-block__choices">
                        {choices.map((choice, index) => (
                            <div className="mc-block__choice" key={choice.id}>
                                <div className="mc-block__choice-row">
                                    <input
                                        type={multiSelect ? 'checkbox' : 'radio'}
                                        className="mc-block__correct-toggle"
                                        title="Correct answer"
                                        aria-label={`Choice ${
                                            LETTERS[index % 26]
                                        } is correct`}
                                        checked={choice.correct}
                                        onChange={(e) =>
                                            setCorrect(choice.id, e.target.checked)
                                        }
                                        onClick={() => {
                                            // Radios don't fire change when
                                            // already checked; allow un-marking
                                            // in single-select via click.
                                            if (!multiSelect && choice.correct) {
                                                setCorrect(choice.id, false);
                                            }
                                        }}
                                        disabled={!isEditable}
                                    />
                                    <span className="mc-block__letter">
                                        {LETTERS[index % 26]}.
                                    </span>
                                    <div className="mc-block__choice-content">
                                        <InlineRichTextEditor
                                            key={`choice-${choice.id}`}
                                            value={
                                                (choice.content as InlineNodes) ??
                                                []
                                            }
                                            onChange={(nodes) =>
                                                setContent(choice.id, nodes)
                                            }
                                            ariaLabel={`Choice ${
                                                LETTERS[index % 26]
                                            }`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() =>
                                            setOpenFeedback((prev) => ({
                                                ...prev,
                                                [choice.id]: !prev[choice.id],
                                            }))
                                        }
                                        aria-expanded={
                                            openFeedback[choice.id] ??
                                            Boolean(choice.feedback?.length)
                                        }
                                        title="Feedback shown when this choice is picked"
                                        disabled={!isEditable}
                                    >
                                        {choice.feedback?.length ? '💬' : '💬＋'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() =>
                                            setOpenFigure((prev) => ({
                                                ...prev,
                                                [choice.id]: !prev[choice.id],
                                            }))
                                        }
                                        aria-expanded={
                                            openFigure[choice.id] ??
                                            Boolean(choice.image || choice.graph)
                                        }
                                        title="Image or graph shown under this choice"
                                        disabled={!isEditable}
                                    >
                                        {choice.image || choice.graph
                                            ? '🖼'
                                            : '🖼＋'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() => removeChoice(choice.id)}
                                        aria-label={`Remove choice ${
                                            LETTERS[index % 26]
                                        }`}
                                        title={
                                            choices.length <= 2
                                                ? 'A question needs at least two choices'
                                                : 'Remove choice'
                                        }
                                        disabled={!isEditable || choices.length <= 2}
                                    >
                                        ×
                                    </button>
                                </div>
                                {(openFigure[choice.id] ??
                                    Boolean(choice.image || choice.graph)) && (
                                    <ChoiceFigureEditor
                                        choice={choice}
                                        label={`choice ${LETTERS[index % 26] ?? 'A'}`}
                                        disabled={!isEditable}
                                        onImage={(image) =>
                                            setImage(choice.id, image)
                                        }
                                        onGraph={(graph) =>
                                            setGraph(choice.id, graph)
                                        }
                                    />
                                )}
                                {(openFeedback[choice.id] ??
                                    Boolean(choice.feedback?.length)) && (
                                    <div className="mc-block__feedback">
                                        <span className="mc-block__feedback-label">
                                            Feedback when picked (shown after
                                            checking)
                                        </span>
                                        <InlineRichTextEditor
                                            key={`fb-${choice.id}`}
                                            value={
                                                (choice.feedback as InlineNodes) ??
                                                []
                                            }
                                            onChange={(nodes) =>
                                                setFeedback(choice.id, nodes)
                                            }
                                            ariaLabel={`Feedback for choice ${
                                                LETTERS[index % 26]
                                            }`}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="mc-block__add-choice"
                        onClick={addChoice}
                        disabled={!isEditable}
                    >
                        + Add choice
                    </button>
                </div>
                {showFooter && (
                    <div className="fill-in-blank-block__settings" contentEditable={false}>
                        <button
                            type="button"
                            className="fill-in-blank-block__settings-toggle"
                            onClick={() => setSettingsOpen((open) => !open)}
                            aria-expanded={settingsOpen}
                            disabled={!isEditable}
                        >
                            <span aria-hidden="true">⚙</span> Settings
                            {!settingsOpen && isConfigured && (
                                <span className="fill-in-blank-block__settings-badge">
                                    {[
                                        hasSolution && 'solution',
                                        hasConfidenceRating && 'confidence',
                                        workSpace !== null && 'work space',
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </span>
                            )}
                        </button>
                        {settingsOpen && (
                            <div className="fill-in-blank-block__settings-panel">
                                <div className="fill-in-blank-block__settings-field">
                                    <span className="fill-in-blank-block__settings-label">
                                        Worked solution
                                    </span>
                                    <span className="fill-in-blank-block__settings-help">
                                        Shown to students after the section is
                                        checked. Supports bold, italic, and inline
                                        math.
                                    </span>
                                    <InlineRichTextEditor
                                        value={solution}
                                        onChange={(nodes) =>
                                            updateAttributes({
                                                solution:
                                                    nodes.length > 0 ? nodes : null,
                                            })
                                        }
                                        ariaLabel="Worked solution"
                                    />
                                </div>
                                <label className="fill-in-blank-block__settings-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={hasConfidenceRating}
                                        onChange={(e) =>
                                            updateAttributes({
                                                hasConfidenceRating:
                                                    e.target.checked,
                                            })
                                        }
                                        onKeyDown={(e) => e.stopPropagation()}
                                        disabled={!isEditable}
                                    />
                                    <span>Ask for a confidence rating</span>
                                </label>
                                <div className="fill-in-blank-block__settings-field">
                                    <span className="fill-in-blank-block__settings-label">
                                        Print work space
                                    </span>
                                    <span className="fill-in-blank-block__settings-help">
                                        Blank space left below this problem when
                                        printed (in rem). Leave empty to use the
                                        worksheet default.
                                    </span>
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.5}
                                        className="fill-in-blank-block__settings-number"
                                        value={workSpace ?? ''}
                                        placeholder="default"
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (v === '') {
                                                updateAttributes({
                                                    workSpace: null,
                                                });
                                                return;
                                            }
                                            const n = Number(v);
                                            if (Number.isFinite(n) && n >= 0) {
                                                updateAttributes({ workSpace: n });
                                            }
                                        }}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        disabled={!isEditable}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
}
