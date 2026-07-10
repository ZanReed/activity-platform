import { useState, type CSSProperties } from 'react';

// ============================================================================
// FormulaField — a freeform equation input with commit-on-blur/Enter and an
// inline error line. The teacher types any equation format; `onApply` parses
// it and returns an error string (shown below) or null (accepted).
//
// Shared by the graded interactive-graph answer field and the static-graph
// drawable-list curve row, so a display curve authors with the SAME freeform
// parser as a graded answer instead of a linear-only slope/intercept editor.
// ============================================================================

export default function FormulaField({
    value,
    disabled,
    placeholder,
    onApply,
    label,
    containerStyle,
}: {
    value: string;
    disabled: boolean;
    placeholder: string;
    onApply: (raw: string) => string | null;
    // Optional leading label (e.g. "Answer:"); omitted for a bare inline field.
    label?: string;
    // Optional container overrides so a compact row can size the field inline.
    containerStyle?: CSSProperties;
}) {
    const [draft, setDraft] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const commit = (): void => {
        if (draft === null) return;
        if (draft.trim() === '' || draft === value) {
            setDraft(null);
            setError(null);
            return;
        }
        const err = onApply(draft);
        setError(err);
        if (!err) setDraft(null);
    };
    return (
        <div style={{ marginTop: '0.35rem', ...containerStyle }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569' }}>
                {label}
                <input
                    type="text"
                    value={draft ?? value}
                    placeholder={placeholder}
                    disabled={disabled}
                    spellCheck={false}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: '0.82rem',
                        padding: '0.15rem 0.4rem',
                        border: error ? '1px solid #dc2626' : '1px solid #cbd5e1',
                        borderRadius: 4,
                    }}
                    onChange={(e) => {
                        setDraft(e.target.value);
                        setError(null);
                    }}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            commit();
                        } else if (e.key === 'Escape') {
                            setDraft(null);
                            setError(null);
                        }
                    }}
                />
            </label>
            {error && (
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#b91c1c' }}>{error}</p>
            )}
        </div>
    );
}
