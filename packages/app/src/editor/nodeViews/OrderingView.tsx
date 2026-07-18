import { useMemo } from 'react';
import {
    NodeViewWrapper,
    type NodeViewProps,
} from '@tiptap/react';
import PromptField from '../components/PromptField';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import type { EditorOrderItem } from '../extensions/Ordering';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { QuestionSettingsSummary } from '../components/QuestionSettings';
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
    const items = (node.attrs.items as EditorOrderItem[]) ?? [];
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasSolution = solution.length > 0;
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const workSpace =
        typeof node.attrs.workSpace === 'number'
            ? (node.attrs.workSpace as number)
            : null;
    const isEditable = editor.isEditable;

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
                <PromptField
                    node={node}
                    className="mc-block__prompt"
                    placeholder="Type the question…"
                />
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
                                        <ArrowUp size={14} aria-hidden="true" />
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
                                        <ArrowDown size={14} aria-hidden="true" />
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
                                        <X size={14} aria-hidden="true" />
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
                <QuestionSettingsSummary
                    hasSolution={hasSolution}
                    hasConfidenceRating={hasConfidenceRating}
                    workSpace={workSpace}
                />
            </div>
        </NodeViewWrapper>
    );
}
