import { useEffect, useState, type CSSProperties } from 'react';

// ============================================================================
// DraftNumberInput — a numeric field that holds a free-text DRAFT while you
// edit and only commits on blur / Enter.
// ----------------------------------------------------------------------------
// The bug it fixes: an `<input type="number" value={attr}>` that commits on
// every keystroke fights the author — deleting the last digit to retype snaps
// the old value straight back (you can't get to empty), and intermediate
// states like "0." or "-" get clamped away mid-type. Draft-then-commit lets
// the field be transiently empty/partial; on commit an empty field resolves
// per `onEmpty` (restore the last value, or a fixed fallback like 0 for a
// tolerance) rather than committing NaN.
//
// Same contract the AdvancedDrawer's DraftField uses; standalone so the inline
// NodeView settings (data-plot, graph) can adopt it before those settings
// migrate into the drawer.
// ============================================================================

interface DraftNumberInputProps {
    value: number;
    /** Commit a parsed, in-range value. */
    onCommit: (value: number) => void;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number | 'any';
    placeholder?: string;
    style?: CSSProperties;
    className?: string;
    ariaLabel?: string;
    /**
     * What an empty field resolves to on commit:
     *   'restore' (default) — snap back to the last committed value.
     *   a number — commit it (e.g. 0 so a blank tolerance means "exact").
     */
    onEmpty?: 'restore' | number;
}

export default function DraftNumberInput({
    value,
    onCommit,
    disabled,
    min,
    max,
    step = 'any',
    placeholder,
    style,
    className,
    ariaLabel,
    onEmpty = 'restore',
}: DraftNumberInputProps) {
    const [draft, setDraft] = useState(String(value));

    // Re-sync when the committed value changes from elsewhere (mode switch,
    // another control writing the same attr).
    useEffect(() => {
        setDraft(String(value));
    }, [value]);

    const commit = () => {
        const raw = draft.trim();
        if (raw === '') {
            if (onEmpty === 'restore') {
                setDraft(String(value));
            } else {
                onCommit(onEmpty);
                setDraft(String(onEmpty));
            }
            return;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) {
            setDraft(String(value)); // garbage in → restore
            return;
        }
        let clamped = n;
        if (min !== undefined) clamped = Math.max(min, clamped);
        if (max !== undefined) clamped = Math.min(max, clamped);
        onCommit(clamped);
        // Reflect any clamp back into the field.
        if (clamped !== n) setDraft(String(clamped));
    };

    return (
        <input
            type="number"
            value={draft}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            style={style}
            className={className}
            aria-label={ariaLabel}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                    e.preventDefault();
                    commit();
                }
            }}
        />
    );
}
