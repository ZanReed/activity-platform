import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { AdvancedField, AdvancedGroup } from '../blockControls';

// ============================================================================
// AdvancedDrawer — slice-6 stage 4. Renders a selected block's grouped
// Advanced fields from its descriptor. Opened from the command bar's Advanced
// disclosure; docked below the bar (positioned by BlockCommandBarHost, a single
// root host — never per-block). Each field is pure data: it reads its value
// from the live node and writes back through an editor command. Groups render
// most-common-first (the descriptor's order); the drawer stays "a little more",
// not a wall.
// ============================================================================

interface AdvancedDrawerProps {
    editor: Editor;
    node: PMNode;
    pos: number;
    groups: AdvancedGroup[];
}

export default function AdvancedDrawer({
    editor,
    node,
    pos,
    groups,
}: AdvancedDrawerProps) {
    // Custom sub-editors (the rubric builder's multi-column rows) need more room
    // than the simple-field width; widen the drawer when one is present.
    const hasCustom = groups.some((g) =>
        g.fields.some((f) => f.kind === 'custom'),
    );
    return (
        <div
            className={
                'block-advanced-drawer' +
                (hasCustom ? ' block-advanced-drawer--wide' : '')
            }
            role="group"
            aria-label="Advanced settings"
            // Keystrokes/clicks stay in the drawer — they must not reach the
            // editor keymap or move the block selection out from under us.
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            {groups.map((group) => (
                <div key={group.group} className="block-advanced-drawer__group">
                    <div className="block-advanced-drawer__group-title">
                        {group.group}
                    </div>
                    {group.fields.map((field) => (
                        <FieldRow
                            key={field.label}
                            field={field}
                            editor={editor}
                            node={node}
                            pos={pos}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

interface FieldRowProps {
    field: AdvancedField;
    editor: Editor;
    node: PMNode;
    pos: number;
}

function FieldRow({ field, editor, node, pos }: FieldRowProps) {
    if (field.when && !field.when(node)) return null;
    if (field.kind === 'custom') {
        // A complex sub-editor owns its own layout + heading; the drawer just
        // gives it a slot.
        return (
            <div className="block-advanced-drawer__custom">
                {field.render({ editor, node, pos })}
            </div>
        );
    }

    if (field.kind === 'toggle') {
        const value = field.get(node);
        return (
            <label className="block-advanced-drawer__field block-advanced-drawer__field--toggle">
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => field.set(editor, pos, e.target.checked)}
                />
                <span className="block-advanced-drawer__field-text">
                    <span className="block-advanced-drawer__label">
                        {field.label}
                    </span>
                    {field.help ? (
                        <span className="block-advanced-drawer__help">
                            {field.help}
                        </span>
                    ) : null}
                </span>
            </label>
        );
    }

    if (field.kind === 'select') {
        const value = field.get(node);
        return (
            <label className="block-advanced-drawer__field">
                <span className="block-advanced-drawer__label">
                    {field.label}
                </span>
                <select
                    className="block-advanced-drawer__control"
                    value={value}
                    onChange={(e) => field.set(editor, pos, e.target.value)}
                >
                    {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </label>
        );
    }

    // text | number — draft-then-commit (on blur / Enter) so a transaction
    // isn't dispatched on every keystroke. Re-syncs when the node's value
    // changes from elsewhere (e.g. the inline NodeView footer edits the same
    // attr).
    return <DraftField field={field} editor={editor} node={node} pos={pos} />;
}

function DraftField({
    field,
    editor,
    node,
    pos,
}: FieldRowProps & { field: Extract<AdvancedField, { kind: 'text' | 'number' }> }) {
    const external =
        field.kind === 'number'
            ? field.get(node) === null
                ? ''
                : String(field.get(node))
            : field.get(node);
    const [draft, setDraft] = useState(external);
    // B-6: why a typed number wasn't kept (it would be dropped on save).
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        setDraft(external);
    }, [external]);

    const commit = () => {
        if (field.kind === 'number') {
            const raw = draft.trim();
            if (raw === '') {
                setError(null);
                return field.set(editor, pos, null);
            }
            const n = Number(raw);
            if (!Number.isFinite(n)) return;
            const reason =
                field.min !== undefined && n < field.min
                    ? `Can't be less than ${field.min}.`
                    : field.max !== undefined && n > field.max
                      ? `Can't be more than ${field.max}.`
                      : (field.validate?.(node, n) ?? null);
            setError(reason);
            if (reason) return;
            field.set(editor, pos, n);
        } else {
            field.set(editor, pos, draft);
        }
    };

    const errorId = `drawer-field-error-${field.label.replace(/\W+/g, '-')}-${pos}`;
    return (
        <label className="block-advanced-drawer__field">
            <span className="block-advanced-drawer__label">{field.label}</span>
            <input
                className="block-advanced-drawer__control"
                type={field.kind === 'number' ? 'number' : 'text'}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                data-invalid={error ? 'true' : undefined}
                value={draft}
                placeholder={field.placeholder}
                min={field.kind === 'number' ? field.min : undefined}
                max={field.kind === 'number' ? field.max : undefined}
                step={field.kind === 'number' ? field.step : undefined}
                onChange={(e) => {
                    setDraft(e.target.value);
                    if (error) setError(null);
                }}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commit();
                    }
                }}
            />
            {error && (
                <span id={errorId} role="alert" className="block-advanced-drawer__error">
                    {error}
                </span>
            )}
        </label>
    );
}
