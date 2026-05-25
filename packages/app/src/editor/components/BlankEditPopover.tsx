import { useEffect, useRef, useState } from 'react';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
} from '@floating-ui/react';
import { createPortal } from 'react-dom';

// ============================================================================
// BlankEditPopover — popover UI for editing a blank's per-blank fields.
// ----------------------------------------------------------------------------
// Drop 2b scope:
//   - Answer field only
//   - Escape to close (calls onClose)
//   - Enter on answer field to save and close
//   - Empty answer reverts to previous value with brief error
//
// Drop 2c will add:
//   - Acceptable answers list (list of inputs + × remove + empty add slot)
//   - Hint textarea (collapsible — Add hint button until set)
//   - Mistake feedback list (collapsible — pairs of match/feedback)
//   - Polished styling
//
// Mount lifecycle:
//   The parent (BlankPopoverHost) only renders this component when a blank
//   is selected (isOpen will always be true when mounted). This is by
//   design — single instance, mount/unmount tied to selection, no permanent
//   per-chip popover instances. The isOpen prop is kept for API symmetry
//   and as a safety net (returns null if false).
//
// Portal target:
//   document.body via createPortal. Avoids stacking-context issues with
//   the editor's overflow/transform. floating-ui's whileElementsMounted
//   handles positioning relative to the referenceElement; default
//   autoUpdate is fine because we only mount once per selection (no
//   permanent-mount lifecycle issues to work around).
// ============================================================================

interface BlankEditPopoverProps {
    referenceElement: HTMLElement | null;
    isOpen: boolean;
    initialAnswer: string;
    /**
     * Currently unused (Drop 2c). Captured here so the host can pass
     * complete attrs without us ignoring the rest of the data.
     */
    initialAcceptableAnswers: string[];
    /** Unused in Drop 2b; wired in 2c. */
    initialHint: string | undefined;
    /** Unused in Drop 2b; wired in 2c. */
    initialMistakeFeedback:
        | Array<{ match: string; feedback: string }>
        | undefined;
    onChange: (
        attrs: Partial<{
            answer: string;
            acceptableAnswers: string[];
            hint: string | undefined;
            mistakeFeedback:
                | Array<{ match: string; feedback: string }>
                | undefined;
        }>,
    ) => void;
    onClose: () => void;
}

export default function BlankEditPopover({
    referenceElement,
    isOpen,
    initialAnswer,
    initialAcceptableAnswers: _initialAcceptableAnswers,
    initialHint: _initialHint,
    initialMistakeFeedback: _initialMistakeFeedback,
    onChange,
    onClose,
}: BlankEditPopoverProps) {
    const [answer, setAnswer] = useState(initialAnswer);
    const [answerError, setAnswerError] = useState<string | null>(null);
    const answerInputRef = useRef<HTMLInputElement>(null);

    // Reset local state when popover opens for a new chip or attrs change.
    useEffect(() => {
        if (isOpen) {
            setAnswer(initialAnswer);
            setAnswerError(null);
        }
    }, [isOpen, initialAnswer]);

    // Auto-focus answer field on open. rAF defers focus past initial
    // render so floating-ui can position the element first.
    useEffect(() => {
        if (!isOpen) return;
        const raf = requestAnimationFrame(() => {
            answerInputRef.current?.focus();
            answerInputRef.current?.select();
        });
        return () => cancelAnimationFrame(raf);
    }, [isOpen]);

    // Escape closes. Document-level listener because input focus prevents
    // key events from bubbling to the popover root.
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const { refs, floatingStyles } = useFloating({
        elements: { reference: referenceElement },
        placement: 'bottom-start',
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
        open: isOpen,
    });

    if (!isOpen) return null;

    const handleAnswerBlur = () => {
        const trimmed = answer.trim();
        // Schema requires answer.min(1). Empty input reverts to initial value
        // with a brief error message rather than committing an invalid state.
        if (trimmed.length === 0) {
            setAnswer(initialAnswer);
            setAnswerError('Answer cannot be empty');
            window.setTimeout(() => setAnswerError(null), 2000);
            return;
        }
        if (trimmed !== initialAnswer) {
            onChange({ answer: trimmed });
        }
    };

    const handleAnswerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAnswerBlur();
            onClose();
        }
    };

    return createPortal(
        <div
            ref={refs.setFloating}
            className="blank-edit-popover"
            style={floatingStyles}
            // Prevent ProseMirror from interpreting popover clicks as
            // document clicks (which would change the selection and close us).
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Edit blank"
        >
            <label className="blank-edit-popover__field">
                <span className="blank-edit-popover__label">Answer</span>
                <input
                    ref={answerInputRef}
                    type="text"
                    className="blank-edit-popover__input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onBlur={handleAnswerBlur}
                    onKeyDown={handleAnswerKeyDown}
                    aria-invalid={answerError ? 'true' : undefined}
                    aria-describedby={
                        answerError ? 'blank-edit-answer-error' : undefined
                    }
                />
                {answerError && (
                    <span
                        id="blank-edit-answer-error"
                        className="blank-edit-popover__error"
                        role="alert"
                    >
                        {answerError}
                    </span>
                )}
            </label>
            <div className="blank-edit-popover__hint-text">
                Press Enter to save and close, Escape to close.
            </div>
        </div>,
        document.body,
    );
}
