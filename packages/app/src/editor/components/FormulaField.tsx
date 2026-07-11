import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { MathfieldElement } from 'mathlive';
import {
    formulaToLatex,
    mathFieldAsciiToFormula,
    loadInputMode,
    saveInputMode,
    type FormulaInputMode,
} from '../../lib/mathFormula';

// ============================================================================
// FormulaField — a freeform equation input with commit-on-blur/Enter and an
// inline error line. The teacher types any equation format; `onApply` parses
// it and returns an error string (shown below) or null (accepted).
//
// Shared by the graded interactive-graph answer field and the static-graph
// drawable-list curve row, so a display curve authors with the SAME freeform
// parser as a graded answer instead of a linear-only slope/intercept editor.
//
// Two input modes when `modeKey` is set: MATH renders a MathLive field (the
// LaTeX look teachers expect from equation editors) whose commit path reads
// getValue('ascii-math') — the calculator's proven seam — and TEXT is the
// plain input that also accepts command syntax (`ray (1, 2) through (3, 4)`).
// The √x ⇄ abc toggle persists per modeKey group, so "I author functions as
// text" survives across blocks and sessions. Without a modeKey the field is
// text-only (unchanged legacy behavior).
// ============================================================================

export default function FormulaField({
    value,
    disabled,
    placeholder,
    onApply,
    label,
    containerStyle,
    modeKey,
    defaultMode = 'text',
    mathValue,
}: {
    value: string;
    disabled: boolean;
    placeholder: string;
    onApply: (raw: string) => string | null;
    // Optional leading label (e.g. "Answer:"); omitted for a bare inline field.
    label?: string;
    // Optional container overrides so a compact row can size the field inline.
    containerStyle?: CSSProperties;
    // Enables the math ⇄ text toggle and names the preference group it
    // persists under (e.g. "answer:plot_function", "drawable:add").
    modeKey?: string;
    // Which mode a fresh field opens in when the author has no stored flip.
    defaultMode?: FormulaInputMode;
    // ASCII seed for MATH mode when it differs from `value` — ray/segment
    // answers display the full command text but math-edit as two points.
    mathValue?: string;
}) {
    const [draft, setDraft] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<FormulaInputMode>(() =>
        modeKey ? loadInputMode(modeKey, defaultMode) : 'text',
    );
    const mfRef = useRef<MathfieldElement>(null);
    const committing = useRef(false);
    const mathSeed = mathValue ?? value;

    // Configure + (re)seed the math-field. Reseeds only while unfocused so a
    // teacher's mid-edit content is never clobbered by a re-render.
    useLayoutEffect(() => {
        if (mode !== 'math') return;
        const mf = mfRef.current;
        if (!mf) return;
        mf.mathVirtualKeyboardPolicy = 'manual';
        mf.readOnly = disabled;
        const showKeyboard = () => window.mathVirtualKeyboard?.show();
        const hideKeyboard = () => window.mathVirtualKeyboard?.hide();
        mf.addEventListener('focusin', showKeyboard);
        mf.addEventListener('focusout', hideKeyboard);
        if (document.activeElement !== mf) {
            mf.setValue(mathSeed ? formulaToLatex(mathSeed) : '', {
                silenceNotifications: true,
            });
        }
        return () => {
            mf.removeEventListener('focusin', showKeyboard);
            mf.removeEventListener('focusout', hideKeyboard);
        };
    }, [mode, mathSeed, disabled]);

    const commitText = (): void => {
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

    const commitMath = (): void => {
        if (committing.current) return;
        const mf = mfRef.current;
        if (!mf) return;
        const ascii = mathFieldAsciiToFormula(mf.getValue('ascii-math'));
        if (ascii === '') {
            setError(null);
            return;
        }
        committing.current = true;
        try {
            const err = onApply(ascii);
            setError(err);
            if (!err) {
                // Blur + reset to the seed: an answer field's value prop is
                // about to change (the reseed effect shows the new canonical);
                // an add-box's stays '' (this clears the field for the next
                // entry).
                mf.blur();
                mf.setValue(mathSeed ? formulaToLatex(mathSeed) : '', {
                    silenceNotifications: true,
                });
            }
        } finally {
            committing.current = false;
        }
    };

    const flipMode = (): void => {
        if (!modeKey) return;
        const next: FormulaInputMode = mode === 'math' ? 'text' : 'math';
        setMode(next);
        saveInputMode(modeKey, next);
        setDraft(null);
        setError(null);
    };

    return (
        <div style={{ marginTop: '0.35rem', ...containerStyle }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569' }}>
                {label}
                {mode === 'math' ? (
                    <math-field
                        ref={mfRef}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: '0.95rem',
                            padding: '0 0.2rem',
                            border: error ? '1px solid #dc2626' : '1px solid #cbd5e1',
                            borderRadius: 4,
                        }}
                        onInput={() => setError(null)}
                        onBlur={commitMath}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                commitMath();
                            } else if (e.key === 'Escape') {
                                const mf = e.currentTarget as MathfieldElement;
                                mf.setValue(mathSeed ? formulaToLatex(mathSeed) : '', {
                                    silenceNotifications: true,
                                });
                                setError(null);
                                mf.blur();
                            }
                        }}
                    />
                ) : (
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
                        onBlur={commitText}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                commitText();
                            } else if (e.key === 'Escape') {
                                setDraft(null);
                                setError(null);
                            }
                        }}
                    />
                )}
                {modeKey && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={flipMode}
                        title={mode === 'math' ? 'Switch to text input' : 'Switch to math input'}
                        style={{
                            fontSize: '0.72rem',
                            padding: '0.1rem 0.35rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: 4,
                            background: '#f8fafc',
                            cursor: 'pointer',
                            color: '#64748b',
                            fontFamily: mode === 'math' ? 'ui-monospace, monospace' : 'inherit',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {mode === 'math' ? 'abc' : '√x'}
                    </button>
                )}
            </label>
            {error && (
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#b91c1c' }}>{error}</p>
            )}
        </div>
    );
}
