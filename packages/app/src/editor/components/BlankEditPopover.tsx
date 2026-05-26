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
// Editing model — save-on-blur with force-commit-before-close:
//   onBlur of each field commits the value via onChange. This is the normal
//   path: user types, tabs away or clicks another field, value commits.
//
//   But if the user types in a field then immediately closes the popover
//   (Escape, outside click, selection moves), the input would unmount before
//   blur fires — the typed value would be lost. To prevent this, we mirror
//   the latest local state into refs, and explicitly flush those refs via
//   the commit functions at every close path. As a safety net, we also
//   flush on unmount (catches selection-change unmounts the popover can't
//   intercept).
//
// Closing paths (all flush state before closing):
//   - Escape — keydown handler flushes then calls onClose
//   - Outside click — document mousedown handler flushes then calls onClose
//   - Enter on single-line inputs — explicit per-field commit then onClose
//   - Selection moving away — host unmounts; effect cleanup flushes via refs
//
// Why refs + state instead of just state?
//   React state updates are async; reading state inside a closure captures
//   the value at closure creation, not at call time. Refs hold the current
//   value at call time, which is what flush handlers need. We keep state
//   for rendering and refs for flushing.
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

    // Mirror state into refs for synchronous reads during close/unmount.
    // State updates async; refs hold latest value synchronously.
    const answerRef = useRef(initialAnswer);
    const acceptableRef = useRef<string[]>(initialAcceptableAnswers);
    const hintRef = useRef<string>(initialHint ?? '');
    const feedbackRef = useRef<MistakeFeedbackPair[]>(initialMistakeFeedback ?? []);

    // Mirror initial-values into refs for diff comparison at flush time.
    // These don't change between flushes; they reset only when props change
    // (e.g., a new chip is selected).
    const initialAnswerRef = useRef(initialAnswer);
    const initialAcceptableRef = useRef<string[]>(initialAcceptableAnswers);
    const initialHintRef = useRef<string | undefined>(initialHint);
    const initialFeedbackRef = useRef<MistakeFeedbackPair[] | undefined>(
        initialMistakeFeedback,
    );

    // onChange ref — captures the current onChange handler so flushes from
    // effects can call the latest callback without re-registering effects
    // on every render.
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const answerInputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Keep state and refs in sync after each render.
    useEffect(() => {
        answerRef.current = answer;
    }, [answer]);
    useEffect(() => {
        acceptableRef.current = acceptableAnswers;
    }, [acceptableAnswers]);
    useEffect(() => {
        hintRef.current = hint;
    }, [hint]);
    useEffect(() => {
        feedbackRef.current = mistakeFeedback;
    }, [mistakeFeedback]);

    // Reset state + initial refs when popover opens for a new chip / attrs.
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
            // Reset refs too — these track the baseline for commit diffs.
            answerRef.current = initialAnswer;
            acceptableRef.current = initialAcceptableAnswers;
            hintRef.current = initialHint ?? '';
            feedbackRef.current = initialMistakeFeedback ?? [];
            initialAnswerRef.current = initialAnswer;
            initialAcceptableRef.current = initialAcceptableAnswers;
            initialHintRef.current = initialHint;
            initialFeedbackRef.current = initialMistakeFeedback;
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

    // Flush all current field state through onChange. Called before every
    // close path, and on unmount as a safety net. Reads from refs (which
    // hold the latest values synchronously) and diffs against initial refs
    // to avoid no-op transactions. Bundles all pending field changes into a
    // single onChange call so the host only dispatches one transaction.
    const flushAll = () => {
        const updates: Partial<{
            answer: string;
            acceptableAnswers: string[];
            hint: string | undefined;
            mistakeFeedback: MistakeFeedbackPair[] | undefined;
        }> = {};

        // Answer: skip if empty (would fail schema validation). The
        // close-on-empty-answer case keeps the initial value implicitly.
        const trimmedAnswer = answerRef.current.trim();
        if (
            trimmedAnswer.length > 0 &&
            trimmedAnswer !== initialAnswerRef.current
        ) {
            updates.answer = trimmedAnswer;
        }

        // Acceptable answers: strip empties, compare to initial.
        const strippedAcceptable = acceptableRef.current
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        const initialAcc = initialAcceptableRef.current;
        const acceptableSame =
            strippedAcceptable.length === initialAcc.length &&
            strippedAcceptable.every((v, i) => v === initialAcc[i]);
        if (!acceptableSame) {
            updates.acceptableAnswers = strippedAcceptable;
        }

        // Hint: trim, empty → undefined.
        const trimmedHint = hintRef.current.trim();
        const hintValue = trimmedHint.length > 0 ? trimmedHint : undefined;
        if (hintValue !== initialHintRef.current) {
            updates.hint = hintValue;
        }

        // Mistake feedback: strip incomplete pairs, compare to initial.
        const strippedFeedback = feedbackRef.current
            .map((p) => ({ match: p.match.trim(), feedback: p.feedback.trim() }))
            .filter((p) => p.match.length > 0 && p.feedback.length > 0);
        const feedbackValue =
            strippedFeedback.length > 0 ? strippedFeedback : undefined;
        const initialFb = initialFeedbackRef.current ?? [];
        const feedbackSame =
            strippedFeedback.length === initialFb.length &&
            strippedFeedback.every(
                (p, i) =>
                    p.match === initialFb[i]?.match &&
                    p.feedback === initialFb[i]?.feedback,
            );
        if (!feedbackSame) {
            updates.mistakeFeedback = feedbackValue;
        }

        if (Object.keys(updates).length > 0) {
            onChangeRef.current(updates);
        }
    };

    // Flush on unmount as a safety net. Selection-change unmounts the
    // popover via the host's state machine, and the popover doesn't get a
    // chance to intercept that path explicitly. The unmount cleanup runs
    // synchronously before React tears down the DOM, which is in time for
    // the editor command to dispatch.
    useEffect(() => {
        return () => {
            flushAll();
        };
        // Empty deps: this cleanup runs exactly once on unmount. flushAll
        // reads from refs, so its closure capturing the initial function
        // identity is fine — refs always point to the latest values.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Escape closes — flush then close.
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                flushAll();
                onClose();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, onClose]);

    // Outside click closes — flush then close.
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            if (popoverRef.current && popoverRef.current.contains(target)) {
                return;
            }
            if (referenceElement && referenceElement.contains(target)) {
                return;
            }
            flushAll();
            onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Answer handlers — explicit save on blur for the visible "I tabbed away
    // so this is final" UX, plus flushAll covers the close paths.
    // -----------------------------------------------------------------------
    const handleAnswerBlur = () => {
        const trimmed = answer.trim();
        if (trimmed.length === 0) {
            setAnswer(initialAnswerRef.current);
            answerRef.current = initialAnswerRef.current;
            setAnswerError('Answer cannot be empty');
            window.setTimeout(() => setAnswerError(null), 2000);
            return;
        }
        if (trimmed !== initialAnswerRef.current) {
            onChange({ answer: trimmed });
            initialAnswerRef.current = trimmed;
        }
    };

    const handleAnswerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAnswerBlur();
            flushAll();
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
        initialAcceptableRef.current = stripped;
    };

    const commitAcceptable = () => {
        const stripped = acceptableAnswers
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        const initialAcc = initialAcceptableRef.current;
        const same =
            stripped.length === initialAcc.length &&
            stripped.every((v, i) => v === initialAcc[i]);
        if (!same) {
            onChange({ acceptableAnswers: stripped });
            initialAcceptableRef.current = stripped;
        }
    };

    const handleAcceptableKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitAcceptable();
            flushAll();
            onClose();
        }
    };

    // -----------------------------------------------------------------------
    // Hint handlers.
    // -----------------------------------------------------------------------
    const commitHint = () => {
        const trimmed = hint.trim();
        const nextValue = trimmed.length > 0 ? trimmed : undefined;
        if (nextValue !== initialHintRef.current) {
            onChange({ hint: nextValue });
            initialHintRef.current = nextValue;
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
        const nextValue = stripped.length > 0 ? stripped : undefined;
        onChange({ mistakeFeedback: nextValue });
        initialFeedbackRef.current = nextValue;
    };

    const commitFeedback = () => {
        const stripped = mistakeFeedback
            .map((p) => ({ match: p.match.trim(), feedback: p.feedback.trim() }))
            .filter((p) => p.match.length > 0 && p.feedback.length > 0);
        const nextValue = stripped.length > 0 ? stripped : undefined;
        const initialFb = initialFeedbackRef.current ?? [];
        const same =
            stripped.length === initialFb.length &&
            stripped.every(
                (p, i) =>
                    p.match === initialFb[i]?.match &&
                    p.feedback === initialFb[i]?.feedback,
            );
        if (!same) {
            onChange({ mistakeFeedback: nextValue });
            initialFeedbackRef.current = nextValue;
        }
    };

    const handleFeedbackMatchKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitFeedback();
            flushAll();
            onClose();
        }
    };

    const setRefs = (node: HTMLDivElement | null) => {
        refs.setFloating(node);
        popoverRef.current = node;
    };

    return createPortal(
        <div
            ref={setRefs}
            className="blank-edit-popover"
            style={floatingStyles}
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
