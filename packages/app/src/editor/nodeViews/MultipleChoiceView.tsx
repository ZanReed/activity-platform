import { useMemo, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import type { EditorMcChoice } from '../extensions/MultipleChoice';
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

export default function MultipleChoiceView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [openFeedback, setOpenFeedback] = useState<Record<string, boolean>>({});

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
