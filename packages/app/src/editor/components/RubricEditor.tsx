import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { Rubric, RubricCriterion } from '@activity/schema';

// ============================================================================
// RubricEditor — the shared rubric builder. Extracted from FreeResponseView so
// the SAME UI backs both the block's inline options and the slice-6 Advanced
// drawer (a `custom` field). Pure controlled component: given `rubric` + an
// onChange, it edits criteria; the caller owns where the value is stored.
//
// New criteria are seeded VALID (non-empty label, positive points) so a fresh
// rubric survives an immediate autosave — serialize drops invalid criteria.
// ============================================================================

interface RubricEditorProps {
    rubric: Rubric | null;
    isEditable: boolean;
    onChange: (next: Rubric | null) => void;
    /** GUI sweep item 8 (ruled 2026-11-13): a DoL rubric's lines carry the
     *  level they evidence. Shown only in a DoL section. */
    showLevels?: boolean;
    /** The levels already used in this activity, offered as suggestions. A
     *  teacher may type any other (8 characters at most): levels are never
     *  fixed to one school system's words (ruling 8b). */
    knownLevels?: readonly string[];
}

export default function RubricEditor({
    rubric,
    isEditable,
    onChange,
    showLevels = false,
    knownLevels = [],
}: RubricEditorProps) {
    const listId = `rubric-levels-${rubric?.criteria[0]?.id ?? 'new'}`;
    const addCriterion = () => {
        const n = (rubric?.criteria.length ?? 0) + 1;
        const fresh: RubricCriterion = {
            id: crypto.randomUUID(),
            label: `Criterion ${n}`,
            maxPoints: 4,
        };
        onChange({ criteria: [...(rubric?.criteria ?? []), fresh] });
    };
    const updateCriterion = (id: string, patch: Partial<RubricCriterion>) => {
        if (!rubric) return;
        onChange({
            criteria: rubric.criteria.map((c) =>
                c.id === id ? { ...c, ...patch } : c,
            ),
        });
    };
    const removeCriterion = (id: string) => {
        if (!rubric) return;
        const remaining = rubric.criteria.filter((c) => c.id !== id);
        onChange(remaining.length > 0 ? { criteria: remaining } : null);
    };
    const totalPoints =
        rubric?.criteria.reduce((sum, c) => sum + c.maxPoints, 0) ?? 0;

    return (
        <div className="free-response-block__rubric">
            <div className="free-response-block__rubric-head">
                <span>Rubric</span>
                {rubric && (
                    <span className="free-response-block__rubric-total">
                        {totalPoints} pts total
                    </span>
                )}
            </div>
            {rubric?.criteria.map((c) => (
                <div
                    key={c.id}
                    className={`free-response-block__criterion${showLevels ? ' free-response-block__criterion--levels' : ''}`}
                >
                    <input
                        type="text"
                        className="free-response-block__criterion-label"
                        value={c.label}
                        placeholder="Criterion"
                        aria-label="Criterion label"
                        disabled={!isEditable}
                        onChange={(e) =>
                            updateCriterion(c.id, { label: e.target.value })
                        }
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                    <input
                        type="number"
                        className="free-response-block__criterion-points"
                        min={0.5}
                        step={0.5}
                        value={c.maxPoints}
                        aria-label="Points"
                        disabled={!isEditable}
                        onChange={(e) => {
                            const n = Number(e.target.value);
                            if (Number.isFinite(n) && n > 0)
                                updateCriterion(c.id, { maxPoints: n });
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                    <input
                        type="text"
                        className="free-response-block__criterion-desc"
                        value={c.description ?? ''}
                        placeholder="What does full credit look like? (optional)"
                        aria-label="Criterion description"
                        disabled={!isEditable}
                        onChange={(e) =>
                            updateCriterion(c.id, {
                                description: e.target.value || undefined,
                            })
                        }
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                    {showLevels && (
                        <input
                            type="text"
                            className="free-response-block__criterion-level"
                            value={c.level ?? ''}
                            maxLength={8}
                            list={listId}
                            placeholder="Level"
                            aria-label="Level this line shows"
                            disabled={!isEditable}
                            onChange={(e) => {
                                const level = e.target.value.trim();
                                updateCriterion(c.id, { level: level === '' ? undefined : level });
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    )}
                    <button
                        type="button"
                        className="free-response-block__criterion-remove"
                        aria-label="Remove criterion"
                        disabled={!isEditable}
                        onClick={() => removeCriterion(c.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
            {showLevels && (
                <datalist id={listId}>
                    {knownLevels.map((l) => (
                        <option key={l} value={l} />
                    ))}
                </datalist>
            )}
            {showLevels && (
                <p className="free-response-block__rubric-levels-help">
                    Level: the grade or standard each line shows, in your school’s words. “DoL passed” is
                    pre-ticked only for lines at level A.
                </p>
            )}
            <button
                type="button"
                className="free-response-block__rubric-add"
                disabled={!isEditable}
                onClick={addCriterion}
            >
                {rubric ? '+ Add criterion' : '+ Add rubric'}
            </button>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Adapter for the Advanced drawer's `custom` field: reads the node's `rubric`
// attr and writes it back through an editor command (no blockControls import,
// so there's no cycle with the descriptor registry).
// ----------------------------------------------------------------------------
export function renderRubricField({
    editor,
    node,
    pos,
}: {
    editor: Editor;
    node: PMNode;
    pos: number;
}): ReactNode {
    const rubric = (node.attrs.rubric as Rubric | null) ?? null;
    // In a DoL section? The nearest section break above this block says.
    let inDol = false;
    const known = new Set<string>();
    editor.state.doc.descendants((n, p) => {
        if (n.type.name === 'sectionBreak' && p < pos) inDol = Boolean(n.attrs.dol);
        const r = n.attrs?.rubric as Rubric | null | undefined;
        for (const c of r?.criteria ?? []) if (c.level) known.add(c.level);
        return true;
    });
    const onChange = (next: Rubric | null) => {
        editor
            .chain()
            .command(({ tr }) => {
                tr.setNodeAttribute(pos, 'rubric', next);
                return true;
            })
            .run();
    };
    return (
        <RubricEditor
            rubric={rubric}
            isEditable={editor.isEditable}
            onChange={onChange}
            showLevels={inDol}
            knownLevels={[...known].sort()}
        />
    );
}
