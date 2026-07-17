import { useMemo, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import type { EditorMatchSide } from '../extensions/Matching';
import { Image as ImageIcon, ImagePlus, X } from 'lucide-react';
import { ChoiceFigureEditor, ChoiceFigureThumbnail } from './MultipleChoiceView';
import { QuestionSettingsSummary } from '../components/QuestionSettings';
import { problemNumberAt } from '../problemNumbering';

// ============================================================================
// MatchingView — NodeView for the matching block.
// ----------------------------------------------------------------------------
// Layout mirrors MultipleChoiceView (and reuses its mc-block CSS): number
// gutter + editable prompt, then a contentEditable={false} panel the NodeView
// owns — the ITEMS list (each row: position, rich content, "matches" picker,
// figure toggle, remove) and the OPTIONS list (targets; extra ones are
// distractors). Items/targets/key are structured node attrs; every edit
// writes through updateAttributes.
//
// The key picker labels targets by a TEXT PREVIEW, never by a letter:
// published letters follow the publish-time shuffle, so editor letters would
// teach the teacher an arrangement students won't see.
//
// An incomplete key (some item unmatched, or pointing at a deleted target)
// is legal to SAVE (mid-edit drafts must autosave) but is surfaced as an
// inline warning — unmatched items score wrong for every student.
// ============================================================================

function inlinePreview(content: unknown[]): string {
    let out = '';
    for (const node of content as Array<{
        type?: string;
        text?: string;
        latex?: string;
    }>) {
        if (!node || typeof node !== 'object') continue;
        if (node.type === 'text' && typeof node.text === 'string') {
            out += node.text;
        } else if (node.type === 'math_inline' && typeof node.latex === 'string') {
            out += node.latex;
        }
        if (out.length > 40) break;
    }
    out = out.trim();
    if (out.length === 0) return '(empty)';
    return out.length > 40 ? out.slice(0, 37) + '…' : out;
}

export default function MatchingView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const [openFigure, setOpenFigure] = useState<Record<string, boolean>>({});

    const items = (node.attrs.items as EditorMatchSide[]) ?? [];
    const targets = (node.attrs.targets as EditorMatchSide[]) ?? [];
    const key = (node.attrs.key as Record<string, string>) ?? {};
    const allowTargetReuse = Boolean(node.attrs.allowTargetReuse);
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasSolution = solution.length > 0;
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const workSpace =
        typeof node.attrs.workSpace === 'number'
            ? (node.attrs.workSpace as number)
            : null;
    const isEditable = editor.isEditable;

    const targetIds = new Set(targets.map((t) => t.id));
    const unmatched = items.filter(
        (item) => !key[item.id] || !targetIds.has(key[item.id]!),
    );

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

    const patchSide = (
        which: 'items' | 'targets',
        id: string,
        patch: (side: EditorMatchSide) => EditorMatchSide,
    ) => {
        const list = which === 'items' ? items : targets;
        updateAttributes({
            [which]: list.map((s) => (s.id === id ? patch(s) : s)),
        });
    };

    const setKeyFor = (itemId: string, targetId: string) => {
        const next = { ...key };
        if (targetId === '') {
            delete next[itemId];
        } else {
            if (!allowTargetReuse) {
                // One-to-one: the picked target leaves any other item.
                for (const [otherItem, otherTarget] of Object.entries(next)) {
                    if (otherTarget === targetId && otherItem !== itemId) {
                        delete next[otherItem];
                    }
                }
            }
            next[itemId] = targetId;
        }
        updateAttributes({ key: next });
    };

    const addItem = () => {
        updateAttributes({
            items: [...items, { id: crypto.randomUUID(), content: [] }],
        });
    };

    const addTarget = () => {
        updateAttributes({
            targets: [...targets, { id: crypto.randomUUID(), content: [] }],
        });
    };

    const removeItem = (itemId: string) => {
        if (items.length <= 2) return;
        const nextKey = { ...key };
        delete nextKey[itemId];
        updateAttributes({
            items: items.filter((i) => i.id !== itemId),
            key: nextKey,
        });
    };

    const removeTarget = (targetId: string) => {
        if (targets.length <= 2) return;
        const nextKey: Record<string, string> = {};
        for (const [itemId, t] of Object.entries(key)) {
            if (t !== targetId) nextKey[itemId] = t;
        }
        updateAttributes({
            targets: targets.filter((t) => t.id !== targetId),
            key: nextKey,
        });
    };

    const figureToggle = (side: EditorMatchSide, label: string) => (
        <button
            type="button"
            className={`mc-block__row-btn${
                side.image || side.graph ? ' mc-block__row-btn--on' : ''
            }`}
            onClick={() =>
                setOpenFigure((prev) => ({ ...prev, [side.id]: !prev[side.id] }))
            }
            aria-expanded={openFigure[side.id] ?? false}
            aria-label={`Figure for ${label}`}
            title={`Image or graph shown with ${label}`}
            disabled={!isEditable}
        >
            {side.image || side.graph ? (
                <ImageIcon size={14} aria-hidden="true" />
            ) : (
                <ImagePlus size={14} aria-hidden="true" />
            )}
        </button>
    );

    const figurePanel = (which: 'items' | 'targets', side: EditorMatchSide, label: string) =>
        (openFigure[side.id] ?? false) ? (
            <ChoiceFigureEditor
                choice={side}
                label={label}
                disabled={!isEditable}
                onImage={(image) =>
                    patchSide(which, side.id, (s) => {
                        const next = { ...s };
                        if (image) next.image = image;
                        else delete next.image;
                        return next;
                    })
                }
                onGraph={(graph) =>
                    patchSide(which, side.id, (s) => {
                        const next = { ...s };
                        if (graph) next.graph = graph;
                        else delete next.graph;
                        return next;
                    })
                }
                onDone={() =>
                    setOpenFigure((prev) => ({ ...prev, [side.id]: false }))
                }
            />
        ) : (
            <ChoiceFigureThumbnail
                choice={side}
                label={label}
                disabled={!isEditable}
                onEdit={() =>
                    setOpenFigure((prev) => ({ ...prev, [side.id]: true }))
                }
            />
        );

    return (
        <NodeViewWrapper
            className={`mc-block match-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div className="mc-block__number" contentEditable={false}>
                {problemNumber}.
            </div>
            <div className="mc-block__body">
                <NodeViewContent className="mc-block__prompt" />
                <div className="mc-block__controls" contentEditable={false}>
                    {unmatched.length > 0 && (
                        <div className="mc-block__warning" role="alert">
                            {unmatched.length === 1
                                ? 'One item has no matching option'
                                : `${unmatched.length} items have no matching option`}
                            {' — those items will score wrong for every student.'}
                        </div>
                    )}
                    <div className="mc-block__section-label">Items (left column)</div>
                    <div className="mc-block__choices">
                        {items.map((item, index) => (
                            <div className="mc-block__choice" key={item.id}>
                                <div className="mc-block__choice-row">
                                    <span className="mc-block__letter">
                                        {index + 1}.
                                    </span>
                                    <div className="mc-block__choice-content">
                                        <InlineRichTextEditor
                                            key={`item-${item.id}`}
                                            value={(item.content as InlineNodes) ?? []}
                                            onChange={(nodes) =>
                                                patchSide('items', item.id, (s) => ({
                                                    ...s,
                                                    content: nodes,
                                                }))
                                            }
                                            ariaLabel={`Item ${index + 1}`}
                                        />
                                    </div>
                                    <select
                                        className="match-block__key-picker"
                                        value={
                                            key[item.id] && targetIds.has(key[item.id]!)
                                                ? key[item.id]
                                                : ''
                                        }
                                        onChange={(e) =>
                                            setKeyFor(item.id, e.target.value)
                                        }
                                        aria-label={`Correct match for item ${index + 1}`}
                                        title="The correct option for this item"
                                        disabled={!isEditable}
                                    >
                                        <option value="">match…</option>
                                        {targets.map((t, ti) => (
                                            <option key={t.id} value={t.id}>
                                                {`${ti + 1}: ${inlinePreview(t.content)}`}
                                            </option>
                                        ))}
                                    </select>
                                    {figureToggle(item, `item ${index + 1}`)}
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Remove item ${index + 1}`}
                                        title={
                                            items.length <= 2
                                                ? 'A matching question needs at least two items'
                                                : 'Remove item'
                                        }
                                        disabled={!isEditable || items.length <= 2}
                                    >
                                        <X size={14} aria-hidden="true" />
                                    </button>
                                </div>
                                {figurePanel('items', item, `item ${index + 1}`)}
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
                    <div className="mc-block__section-label">
                        Options (right column — students see these shuffled; extras
                        are distractors)
                    </div>
                    <div className="mc-block__choices">
                        {targets.map((target, index) => (
                            <div className="mc-block__choice" key={target.id}>
                                <div className="mc-block__choice-row">
                                    <span className="mc-block__letter">
                                        {index + 1}.
                                    </span>
                                    <div className="mc-block__choice-content">
                                        <InlineRichTextEditor
                                            key={`target-${target.id}`}
                                            value={(target.content as InlineNodes) ?? []}
                                            onChange={(nodes) =>
                                                patchSide('targets', target.id, (s) => ({
                                                    ...s,
                                                    content: nodes,
                                                }))
                                            }
                                            ariaLabel={`Option ${index + 1}`}
                                        />
                                    </div>
                                    {figureToggle(target, `option ${index + 1}`)}
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() => removeTarget(target.id)}
                                        aria-label={`Remove option ${index + 1}`}
                                        title={
                                            targets.length <= 2
                                                ? 'A matching question needs at least two options'
                                                : 'Remove option'
                                        }
                                        disabled={!isEditable || targets.length <= 2}
                                    >
                                        <X size={14} aria-hidden="true" />
                                    </button>
                                </div>
                                {figurePanel('targets', target, `option ${index + 1}`)}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="mc-block__add-choice"
                        onClick={addTarget}
                        disabled={!isEditable}
                    >
                        + Add option
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
