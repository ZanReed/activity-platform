import { useMemo, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import type { EditorOrderItem } from '../extensions/Ordering';
import { problemNumberAt } from '../problemNumbering';

// ============================================================================
// OrderingView — NodeView for the ordering block.
// ----------------------------------------------------------------------------
// Layout mirrors MultipleChoiceView (and reuses its mc-block CSS). The
// teacher lists items in the CORRECT order (up/down buttons re-order); the
// hint line says students see them shuffled. Items are a structured node
// attr; every edit writes through updateAttributes.
// ============================================================================

export default function OrderingView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);

    const items = (node.attrs.items as EditorOrderItem[]) ?? [];
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

    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // editor.state (not editor) is the real dependency — same as
        // MultipleChoiceView.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );

    const commitItems = (next: EditorOrderItem[]) => {
        updateAttributes({ items: next });
    };

    const setContent = (itemId: string, content: InlineNodes) => {
        commitItems(
            items.map((i) => (i.id === itemId ? { ...i, content } : i)),
        );
    };

    const move = (index: number, delta: -1 | 1) => {
        const to = index + delta;
        if (to < 0 || to >= items.length) return;
        const next = items.slice();
        const [item] = next.splice(index, 1);
        if (!item) return;
        next.splice(to, 0, item);
        commitItems(next);
    };

    const addItem = () => {
        commitItems([...items, { id: crypto.randomUUID(), content: [] }]);
    };

    const removeItem = (itemId: string) => {
        if (items.length <= 2) return;
        commitItems(items.filter((i) => i.id !== itemId));
    };

    return (
        <NodeViewWrapper
            className={`mc-block ordering-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div className="mc-block__number" contentEditable={false}>
                {problemNumber}.
            </div>
            <div className="mc-block__body">
                <NodeViewContent className="mc-block__prompt" />
                <div className="mc-block__controls" contentEditable={false}>
                    <div className="mc-block__section-label">
                        List the items in the CORRECT order — students see them
                        shuffled and drag them back into sequence.
                    </div>
                    <div className="mc-block__choices">
                        {items.map((item, index) => (
                            <div className="mc-block__choice" key={item.id}>
                                <div className="mc-block__choice-row">
                                    <span className="mc-block__letter">
                                        {index + 1}.
                                    </span>
                                    <div className="mc-block__choice-content">
                                        <InlineRichTextEditor
                                            key={`order-${item.id}`}
                                            value={(item.content as InlineNodes) ?? []}
                                            onChange={(nodes) =>
                                                setContent(item.id, nodes)
                                            }
                                            ariaLabel={`Step ${index + 1}`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() => move(index, -1)}
                                        aria-label={`Move step ${index + 1} up`}
                                        title="Move up"
                                        disabled={!isEditable || index === 0}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() => move(index, 1)}
                                        aria-label={`Move step ${index + 1} down`}
                                        title="Move down"
                                        disabled={
                                            !isEditable || index === items.length - 1
                                        }
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Remove step ${index + 1}`}
                                        title={
                                            items.length <= 2
                                                ? 'An ordering question needs at least two items'
                                                : 'Remove item'
                                        }
                                        disabled={!isEditable || items.length <= 2}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="mc-block__add-choice"
                        onClick={addItem}
                        disabled={!isEditable}
                    >
                        + Add item
                    </button>
                </div>
                {showFooter && (
                    <div
                        className="fill-in-blank-block__settings"
                        contentEditable={false}
                    >
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
                                                updateAttributes({ workSpace: null });
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
