import { useEffect, useRef, useState, useMemo } from 'react';
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
// Layout:
//   - Answer (always visible) — single text input, auto-focused on open
//   - Acceptable answers (always visible) — list of inputs + empty add slot
//   - Hint (collapsible, expanded if non-empty) — multi-line textarea
//   - Mistake feedback (collapsible, expanded if non-empty) — list of
//     {match, feedback} pairs stacked, each with × remove
//
// Editing model:
//   All fields save on blur with empty-stripping at save time. The popover
//   maintains local state for each field, then propagates via onChange
//   (which dispatches updateBlankAttrs in BlankPopoverHost).
//
// Closing behavior:
//   - Escape closes (calls onClose)
//   - Enter on single-line inputs (answer, acceptable answers) saves + closes
//   - Enter on textareas (hint, mistake feedback) inserts newline — does NOT
//     close, because those fields are multi-line by design
//   - Mousedown anywhere outside the popover root closes (handled by a
//     document-level listener — covers clicks on page chrome / empty page
//     areas where ProseMirror's selection-change wouldn't fire)
//   - Clicks inside the popover are stopped via onMouseDown stopPropagation
//     on the root, so they don't trigger the document-level close listener
// ============================================================================

interface MistakeFeedbackPair {
    match: string;
    feedback: string;
}

interface BlankEditPopoverProps {
    referenceElement: HTMLElement | null;
    isOpen: boolean;
    initialAnswer: string;
    initialAcceptableAnswers: string[];
    initialHint: string | undefined;
    initialMistakeFeedback: MistakeFeedbackPair[] | undefined;
    onChange: (
        attrs: Partial<{
            answer: string;
            acceptableAnswers: string[];
            hint: string | undefined;
            mistakeFeedback: MistakeFeedbackPair[] | undefined;
        }>,
    ) => void;
    onClose: () => void;
}

export default function BlankEditPopover({
    referenceElement,
    isOpen,
    initialAnswer,
    initialAcceptableAnswers,
    initialHint,
    initialMistakeFeedback,
    onChange,
    onClose,
}: BlankEditPopoverProps) {
    const [answer, setAnswer] = useState(initialAnswer);
    const [answerError, setAnswerError] = useState<string | null>(null);
    const [acceptableAnswers, setAcceptableAnswers] = useState<string[]>(
        initialAcceptableAnswers,
    );
    const [hint, setHint] = useState<string>(initialHint ?? '');
    const [mistakeFeedback, setMistakeFeedback] = useState<MistakeFeedbackPair[]>(
        initialMistakeFeedback ?? [],
    );

    const [hintExpanded, setHintExpanded] = useState(false);
    const [feedbackExpanded, setFeedbackExpanded] = useState(false);

    const answerInputRef = useRef<HTMLInputElement>(null);
    // Ref to the popover root so the document-level mousedown listener can
    // check whether a click landed inside or outside it.
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setAnswer(initialAnswer);
            setAnswerError(null);
            setAcceptableAnswers(initialAcceptableAnswers);
            setHint(initialHint ?? '');
            setMistakeFeedback(initialMistakeFeedback ?? []);
            setHintExpanded(Boolean(initialHint && initialHint.length > 0));
            setFeedbackExpanded(
                Boolean(initialMistakeFeedback && initialMistakeFeedback.length > 0),
            );
        }
    }, [
        isOpen,
        initialAnswer,
        initialAcceptableAnswers,
        initialHint,
        initialMistakeFeedback,
    ]);

    useEffect(() => {
        if (!isOpen) return;
        const raf = requestAnimationFrame(() => {
            answerInputRef.current?.focus();
            answerInputRef.current?.select();
        });
        return () => cancelAnimationFrame(raf);
    }, [isOpen]);

    // Escape closes.
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

    // Document-level mousedown listener: close on clicks outside the popover.
    // Covers clicks on page chrome, empty page areas, the editor toolbar, etc.
    // — anywhere ProseMirror's selection-change wouldn't fire to unmount us.
    //
    // Clicks INSIDE the popover are stopped via onMouseDown stopPropagation on
    // the root element, so they never reach this listener.
    //
    // Clicks on the chip itself shouldn't close the popover (the chip stays
    // selected). We check whether the click target is inside the chip
    // (referenceElement) too, and skip closing in that case.
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            // Click inside the popover — ignore (handled by stopPropagation
            // on the popover root, but this is a defensive double-check).
            if (popoverRef.current && popoverRef.current.contains(target)) {
                return;
            }
            // Click on the chip we're anchored to — don't close. The chip's
            // own mousedown will be handled by ProseMirror and may move/keep
            // selection, but we don't want to close from here.
            if (referenceElement && referenceElement.contains(target)) {
                return;
            }
            onClose();
        };
        // Mousedown (not click) so we close before the click registers on the
        // editor — matches typical popover-dismiss UX.
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, onClose, referenceElement]);

    const { refs, floatingStyles } = useFloating({
        elements: { reference: referenceElement },
        placement: 'bottom-start',
        middleware: [offset(4), flip(), shift({ padding: 8 })],
                                                 whileElementsMounted: autoUpdate,
                                                     open: isOpen,
    });

    const acceptableRows = useMemo(
        () => [...acceptableAnswers, ''],
                                   [acceptableAnswers],
    );
    const feedbackRows = useMemo<MistakeFeedbackPair[]>(
        () => [...mistakeFeedback, { match: '', feedback: '' }],
                                                        [mistakeFeedback],
    );

    if (!isOpen) return null;

    // -----------------------------------------------------------------------
    // Answer handlers.
    // -----------------------------------------------------------------------
    const handleAnswerBlur = () => {
        const trimmed = answer.trim();
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

    // -----------------------------------------------------------------------
    // Acceptable answers handlers.
    // -----------------------------------------------------------------------
    const updateAcceptableRow = (index: number, value: string) => {
        setAcceptableAnswers((prev) => {
            if (index < prev.length) {
                const next = [...prev];
                next[index] = value;
                return next;
            }
            return [...prev, value];
        });
    };

    const removeAcceptableRow = (index: number) => {
        const next = acceptableAnswers.filter((_, i) => i !== index);
        setAcceptableAnswers(next);
        const stripped = next.map((s) => s.trim()).filter((s) => s.length > 0);
        onChange({ acceptableAnswers: stripped });
    };

    const commitAcceptable = () => {
        const stripped = acceptableAnswers
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
        const same =
        stripped.length === initialAcceptableAnswers.length &&
        stripped.every((v, i) => v === initialAcceptableAnswers[i]);
        if (!same) {
            onChange({ acceptableAnswers: stripped });
        }
    };

    // Enter in a single-line acceptable answer input commits + closes,
    // matching the answer field's behavior. Useful when authoring rapidly:
    // type answer, Enter; type acceptable, Enter; done.
    const handleAcceptableKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitAcceptable();
            onClose();
        }
    };

    // -----------------------------------------------------------------------
    // Hint handlers.
    // -----------------------------------------------------------------------
    const commitHint = () => {
        const trimmed = hint.trim();
        const nextValue = trimmed.length > 0 ? trimmed : undefined;
        if (nextValue !== initialHint) {
            onChange({ hint: nextValue });
        }
    };

    // -----------------------------------------------------------------------
    // Mistake feedback handlers.
    // -----------------------------------------------------------------------
    const updateFeedbackRow = (
        index: number,
        field: 'match' | 'feedback',
        value: string,
    ) => {
        setMistakeFeedback((prev) => {
            if (index < prev.length) {
                const next = [...prev];
                const existing = next[index] ?? { match: '', feedback: '' };
                next[index] = { ...existing, [field]: value };
                return next;
            }
            const newPair: MistakeFeedbackPair =
            field === 'match'
        ? { match: value, feedback: '' }
        : { match: '', feedback: value };
        return [...prev, newPair];
        });
    };

    const removeFeedbackRow = (index: number) => {
        const next = mistakeFeedback.filter((_, i) => i !== index);
        setMistakeFeedback(next);
        const stripped = next
        .map((p) => ({ match: p.match.trim(), feedback: p.feedback.trim() }))
        .filter((p) => p.match.length > 0 && p.feedback.length > 0);
        onChange({
            mistakeFeedback: stripped.length > 0 ? stripped : undefined,
        });
    };

    const commitFeedback = () => {
        const stripped = mistakeFeedback
        .map((p) => ({ match: p.match.trim(), feedback: p.feedback.trim() }))
        .filter((p) => p.match.length > 0 && p.feedback.length > 0);
        const nextValue = stripped.length > 0 ? stripped : undefined;
        const initialNorm = initialMistakeFeedback ?? [];
        const same =
        stripped.length === initialNorm.length &&
        stripped.every(
            (p, i) =>
            p.match === initialNorm[i]?.match &&
            p.feedback === initialNorm[i]?.feedback,
        );
        if (!same) {
            onChange({ mistakeFeedback: nextValue });
        }
    };

    // Enter in the single-line "match" input commits the feedback and closes.
    // Enter in the feedback textarea is NOT handled here — textareas need
    // newlines and don't get Enter-to-close.
    const handleFeedbackMatchKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitFeedback();
            onClose();
        }
    };

    // Combine floating-ui's ref with our local popoverRef so we can both
    // anchor positioning AND check click-outside containment.
    const setRefs = (node: HTMLDivElement | null) => {
        refs.setFloating(node);
        popoverRef.current = node;
    };

    return createPortal(
        <div
        ref={setRefs}
        className="blank-edit-popover"
        style={floatingStyles}
        // Stop mousedowns inside the popover from triggering the
        // document-level outside-click listener and from being treated
        // by ProseMirror as a click that should move selection.
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Edit blank"
        >
        {/* Answer (always visible) */}
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

        {/* Acceptable answers (always visible) */}
        <div className="blank-edit-popover__field">
        <span className="blank-edit-popover__label">
        Acceptable answers
        </span>
        <div className="blank-edit-popover__list">
        {acceptableRows.map((value, index) => {
            const isTrailingEmpty = index === acceptableAnswers.length;
            return (
                <div
                className="blank-edit-popover__list-row"
                key={`acc-${index}`}
                >
                <input
                type="text"
                className="blank-edit-popover__input"
                value={value}
                placeholder={
                    isTrailingEmpty
                    ? 'Add another acceptable answer'
            : undefined
                }
                onChange={(e) =>
                    updateAcceptableRow(index, e.target.value)
                }
                onBlur={commitAcceptable}
                onKeyDown={handleAcceptableKeyDown}
                />
                {!isTrailingEmpty && (
                    <button
                    type="button"
                    className="blank-edit-popover__remove"
                    onClick={() => removeAcceptableRow(index)}
                    aria-label="Remove acceptable answer"
                    title="Remove"
                    >
                    ×
                    </button>
                )}
                </div>
            );
        })}
        </div>
        </div>

        {/* Hint (collapsible) */}
        <div className="blank-edit-popover__field">
        {hintExpanded ? (
            <>
            <span className="blank-edit-popover__label">Hint</span>
            <textarea
            className="blank-edit-popover__textarea"
            rows={2}
            value={hint}
            placeholder="Optional nudge shown when the student clicks the ? button"
            onChange={(e) => setHint(e.target.value)}
            onBlur={commitHint}
            />
            </>
        ) : (
            <button
            type="button"
            className="blank-edit-popover__add-section"
            onClick={() => setHintExpanded(true)}
            >
            + Add hint
            </button>
        )}
        </div>

        {/* Mistake feedback (collapsible) */}
        <div className="blank-edit-popover__field">
        {feedbackExpanded ? (
            <>
            <span className="blank-edit-popover__label">
            Mistake feedback
            </span>
            <div className="blank-edit-popover__sublabel">
            If the student types one of these wrong answers,
            show the matching feedback instead of the generic
            hint.
            </div>
            <div className="blank-edit-popover__list">
            {feedbackRows.map((pair, index) => {
                const isTrailingEmpty =
                index === mistakeFeedback.length;
                return (
                    <div
                    className="blank-edit-popover__feedback-row"
                    key={`fb-${index}`}
                    >
                    <div className="blank-edit-popover__feedback-row-inner">
                    <input
                    type="text"
                    className="blank-edit-popover__input"
                    value={pair.match}
                    placeholder={
                        isTrailingEmpty
                        ? 'Wrong answer to match'
                : undefined
                    }
                    onChange={(e) =>
                        updateFeedbackRow(
                            index,
                            'match',
                            e.target.value,
                        )
                    }
                    onBlur={commitFeedback}
                    onKeyDown={
                        handleFeedbackMatchKeyDown
                    }
                    aria-label="Wrong answer to match"
                    />
                    <textarea
                    className="blank-edit-popover__textarea"
                    rows={2}
                    value={pair.feedback}
                    placeholder={
                        isTrailingEmpty
                        ? 'Feedback to show'
                : undefined
                    }
                    onChange={(e) =>
                        updateFeedbackRow(
                            index,
                            'feedback',
                            e.target.value,
                        )
                    }
                    onBlur={commitFeedback}
                    aria-label="Feedback to show"
                    />
                    </div>
                    {!isTrailingEmpty && (
                        <button
                        type="button"
                        className="blank-edit-popover__remove"
                        onClick={() =>
                            removeFeedbackRow(index)
                        }
                        aria-label="Remove mistake feedback"
                        title="Remove"
                        >
                        ×
                        </button>
                    )}
                    </div>
                );
            })}
            </div>
            </>
        ) : (
            <button
            type="button"
            className="blank-edit-popover__add-section"
            onClick={() => setFeedbackExpanded(true)}
            >
            + Add mistake feedback
            </button>
        )}
        </div>

        <div className="blank-edit-popover__hint-text">
        Press Escape or click outside to close.
        </div>
        </div>,
        document.body,
    );
}
