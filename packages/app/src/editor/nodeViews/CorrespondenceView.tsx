import { useMemo, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import PromptField from '../components/PromptField';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import type { EditorMatchSide } from '../extensions/Matching';
import type { EditorTargetColumn } from '../extensions/Correspondence';
import { Image as ImageIcon, ImagePlus, X } from 'lucide-react';
import { ChoiceFigureEditor, ChoiceFigureThumbnail } from './MultipleChoiceView';
import { QuestionSettingsSummary } from '../components/QuestionSettings';
import { problemNumberAt } from '../problemNumbering';
import { ProblemNumberGutter } from './problemNumberGutter';

// ============================================================================
// CorrespondenceView — NodeView for the N-way match.
// ----------------------------------------------------------------------------
// MatchingView's layout, one axis deeper: number gutter + editable prompt,
// then a contentEditable={false} panel with the ITEMS list (each row: rich
// content + one "matches" picker PER COLUMN + figure toggle + remove) and one
// OPTIONS section per target column (editable column header + its own card
// pool; extras are distractors). Key pickers label cards by text preview,
// never by a letter — student letters follow the render-time shuffle.
//
// An incomplete key (any CELL unmatched) saves fine (mid-edit drafts must
// autosave) but warns — an unkeyed cell scores wrong for every student.
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

export default function CorrespondenceView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const [openFigure, setOpenFigure] = useState<Record<string, boolean>>({});

    const items = (node.attrs.items as EditorMatchSide[]) ?? [];
    const targetColumns = (node.attrs.targetColumns as EditorTargetColumn[]) ?? [];
    const key = (node.attrs.key as Record<string, Record<string, string>>) ?? {};
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasSolution = solution.length > 0;
    const workSpace =
        typeof node.attrs.workSpace === 'number'
            ? (node.attrs.workSpace as number)
            : null;
    const isEditable = editor.isEditable;

    // A CELL is unmatched when its key entry is missing or points at a card
    // that no longer exists in that column.
    let unmatchedCells = 0;
    for (const item of items) {
        for (const column of targetColumns) {
            const t = key[item.id]?.[column.id];
            if (!t || !column.targets.some((card) => card.id === t)) {
                unmatchedCells += 1;
            }
        }
    }

    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // editor.state (not editor) is the real dependency — MatchingView's rule.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );

    const patchItem = (
        id: string,
        patch: (side: EditorMatchSide) => EditorMatchSide,
    ) => {
        updateAttributes({
            items: items.map((s) => (s.id === id ? patch(s) : s)),
        });
    };

    const patchColumn = (
        columnId: string,
        patch: (column: EditorTargetColumn) => EditorTargetColumn,
    ) => {
        updateAttributes({
            targetColumns: targetColumns.map((c) =>
                c.id === columnId ? patch(c) : c,
            ),
        });
    };

    const setKeyFor = (itemId: string, columnId: string, targetId: string) => {
        const row = { ...(key[itemId] ?? {}) };
        if (targetId === '') delete row[columnId];
        else row[columnId] = targetId;
        const next = { ...key };
        if (Object.keys(row).length === 0) delete next[itemId];
        else next[itemId] = row;
        updateAttributes({ key: next });
    };

    const addItem = () => {
        updateAttributes({
            items: [...items, { id: crypto.randomUUID(), content: [] }],
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

    const addCard = (columnId: string) => {
        patchColumn(columnId, (c) => ({
            ...c,
            targets: [...c.targets, { id: crypto.randomUUID(), content: [] }],
        }));
    };

    const removeCard = (columnId: string, targetId: string) => {
        const column = targetColumns.find((c) => c.id === columnId);
        if (!column || column.targets.length <= 2) return;
        const nextKey: Record<string, Record<string, string>> = {};
        for (const [itemId, row] of Object.entries(key)) {
            const nextRow = { ...row };
            if (nextRow[columnId] === targetId) delete nextRow[columnId];
            if (Object.keys(nextRow).length > 0) nextKey[itemId] = nextRow;
        }
        updateAttributes({
            targetColumns: targetColumns.map((c) =>
                c.id === columnId
                    ? { ...c, targets: c.targets.filter((t) => t.id !== targetId) }
                    : c,
            ),
            key: nextKey,
        });
    };

    const addColumn = () => {
        if (targetColumns.length >= 3) return;
        updateAttributes({
            targetColumns: [
                ...targetColumns,
                {
                    id: crypto.randomUUID(),
                    header: [],
                    targets: [
                        { id: crypto.randomUUID(), content: [] },
                        { id: crypto.randomUUID(), content: [] },
                    ],
                },
            ],
        });
    };

    const removeColumn = (columnId: string) => {
        if (targetColumns.length <= 2) return;
        const nextKey: Record<string, Record<string, string>> = {};
        for (const [itemId, row] of Object.entries(key)) {
            const nextRow = { ...row };
            delete nextRow[columnId];
            if (Object.keys(nextRow).length > 0) nextKey[itemId] = nextRow;
        }
        updateAttributes({
            targetColumns: targetColumns.filter((c) => c.id !== columnId),
            key: nextKey,
        });
    };

    const figureToggle = (
        side: EditorMatchSide,
        label: string,
        onClick: () => void,
    ) => (
        <button
            type="button"
            className={`mc-block__row-btn${
                side.image || side.graph ? ' mc-block__row-btn--on' : ''
            }`}
            onClick={onClick}
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

    const figurePanel = (
        side: EditorMatchSide,
        label: string,
        onPatch: (patch: (s: EditorMatchSide) => EditorMatchSide) => void,
    ) =>
        (openFigure[side.id] ?? false) ? (
            <ChoiceFigureEditor
                choice={side}
                label={label}
                disabled={!isEditable}
                onImage={(image) =>
                    onPatch((s) => {
                        const next = { ...s };
                        if (image) next.image = image;
                        else delete next.image;
                        return next;
                    })
                }
                onGraph={(graph) =>
                    onPatch((s) => {
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
            <ProblemNumberGutter
                label={node.attrs.label as { mode?: string; text?: string } | null}
                problemNumber={problemNumber}
            />
            <div className="mc-block__body">
                <PromptField
                    node={node}
                    className="mc-block__prompt"
                    placeholder="Type the question…"
                />
                <div className="mc-block__controls" contentEditable={false}>
                    {unmatchedCells > 0 && (
                        <div className="mc-block__warning" role="alert">
                            {unmatchedCells === 1
                                ? 'One cell has no matching card'
                                : `${unmatchedCells} cells have no matching card`}
                            {' — those cells will score wrong for every student.'}
                        </div>
                    )}
                    <div className="mc-block__section-label">Items (anchor column)</div>
                    <div className="mc-block__choices">
                        {items.map((item, index) => (
                            <div className="mc-block__choice" key={item.id}>
                                <div className="mc-block__choice-row">
                                    <span className="mc-block__letter">{index + 1}.</span>
                                    <div className="mc-block__choice-content">
                                        <InlineRichTextEditor
                                            key={`item-${item.id}`}
                                            value={(item.content as InlineNodes) ?? []}
                                            onChange={(nodes) =>
                                                patchItem(item.id, (s) => ({
                                                    ...s,
                                                    content: nodes,
                                                }))
                                            }
                                            ariaLabel={`Item ${index + 1}`}
                                        />
                                    </div>
                                    {targetColumns.map((column, ci) => (
                                        <select
                                            key={column.id}
                                            className="match-block__key-picker"
                                            value={
                                                key[item.id]?.[column.id] &&
                                                column.targets.some(
                                                    (t) =>
                                                        t.id ===
                                                        key[item.id]?.[column.id],
                                                )
                                                    ? key[item.id]?.[column.id]
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                setKeyFor(
                                                    item.id,
                                                    column.id,
                                                    e.target.value,
                                                )
                                            }
                                            aria-label={`Correct card from column ${ci + 1} for item ${index + 1}`}
                                            title={`The correct column-${ci + 1} card for this item`}
                                            disabled={!isEditable}
                                        >
                                            <option value="">{`col ${ci + 1}…`}</option>
                                            {column.targets.map((t, ti) => (
                                                <option key={t.id} value={t.id}>
                                                    {`${ti + 1}: ${inlinePreview(t.content)}`}
                                                </option>
                                            ))}
                                        </select>
                                    ))}
                                    {figureToggle(item, `item ${index + 1}`, () =>
                                        setOpenFigure((prev) => ({
                                            ...prev,
                                            [item.id]: !prev[item.id],
                                        })),
                                    )}
                                    <button
                                        type="button"
                                        className="mc-block__row-btn"
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Remove item ${index + 1}`}
                                        title={
                                            items.length <= 2
                                                ? 'A correspondence needs at least two items'
                                                : 'Remove item'
                                        }
                                        disabled={!isEditable || items.length <= 2}
                                    >
                                        <X size={14} aria-hidden="true" />
                                    </button>
                                </div>
                                {figurePanel(item, `item ${index + 1}`, (patch) =>
                                    patchItem(item.id, patch),
                                )}
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
                    {targetColumns.map((column, ci) => (
                        <div key={column.id}>
                            <div className="mc-block__section-label">
                                <span>{`Column ${ci + 1} cards `}</span>
                                <InlineRichTextEditor
                                    key={`header-${column.id}`}
                                    value={(column.header as InlineNodes) ?? []}
                                    onChange={(nodes) =>
                                        patchColumn(column.id, (c) => ({
                                            ...c,
                                            header: nodes,
                                        }))
                                    }
                                    ariaLabel={`Column ${ci + 1} header`}
                                />
                                <button
                                    type="button"
                                    className="mc-block__row-btn"
                                    onClick={() => removeColumn(column.id)}
                                    aria-label={`Remove column ${ci + 1}`}
                                    title={
                                        targetColumns.length <= 2
                                            ? 'A correspondence needs at least two card columns'
                                            : 'Remove this column'
                                    }
                                    disabled={
                                        !isEditable || targetColumns.length <= 2
                                    }
                                >
                                    <X size={14} aria-hidden="true" />
                                </button>
                            </div>
                            <div className="mc-block__choices">
                                {column.targets.map((target, index) => (
                                    <div className="mc-block__choice" key={target.id}>
                                        <div className="mc-block__choice-row">
                                            <span className="mc-block__letter">
                                                {index + 1}.
                                            </span>
                                            <div className="mc-block__choice-content">
                                                <InlineRichTextEditor
                                                    key={`card-${target.id}`}
                                                    value={
                                                        (target.content as InlineNodes) ??
                                                        []
                                                    }
                                                    onChange={(nodes) =>
                                                        patchColumn(column.id, (c) => ({
                                                            ...c,
                                                            targets: c.targets.map(
                                                                (t) =>
                                                                    t.id === target.id
                                                                        ? {
                                                                              ...t,
                                                                              content:
                                                                                  nodes,
                                                                          }
                                                                        : t,
                                                            ),
                                                        }))
                                                    }
                                                    ariaLabel={`Column ${ci + 1} card ${index + 1}`}
                                                />
                                            </div>
                                            {figureToggle(
                                                target,
                                                `column ${ci + 1} card ${index + 1}`,
                                                () =>
                                                    setOpenFigure((prev) => ({
                                                        ...prev,
                                                        [target.id]: !prev[target.id],
                                                    })),
                                            )}
                                            <button
                                                type="button"
                                                className="mc-block__row-btn"
                                                onClick={() =>
                                                    removeCard(column.id, target.id)
                                                }
                                                aria-label={`Remove column ${ci + 1} card ${index + 1}`}
                                                title={
                                                    column.targets.length <= 2
                                                        ? 'A column needs at least two cards'
                                                        : 'Remove card'
                                                }
                                                disabled={
                                                    !isEditable ||
                                                    column.targets.length <= 2
                                                }
                                            >
                                                <X size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                        {figurePanel(
                                            target,
                                            `column ${ci + 1} card ${index + 1}`,
                                            (patch) =>
                                                patchColumn(column.id, (c) => ({
                                                    ...c,
                                                    targets: c.targets.map((t) =>
                                                        t.id === target.id
                                                            ? patch(t)
                                                            : t,
                                                    ),
                                                })),
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="mc-block__add-choice"
                                onClick={() => addCard(column.id)}
                                disabled={!isEditable}
                            >
                                {`+ Add card to column ${ci + 1}`}
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="mc-block__add-choice"
                        onClick={addColumn}
                        disabled={!isEditable || targetColumns.length >= 3}
                        title={
                            targetColumns.length >= 3
                                ? 'A correspondence supports at most three card columns'
                                : 'Add a card column'
                        }
                    >
                        + Add column
                    </button>
                </div>
                <QuestionSettingsSummary
                    hasSolution={hasSolution}
                    workSpace={workSpace}
                />
            </div>
        </NodeViewWrapper>
    );
}
