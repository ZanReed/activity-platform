import { useEffect, useRef, useState, useMemo } from 'react';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    size,
} from '@floating-ui/react';
import { createPortal } from 'react-dom';
import { FocusTrap } from 'focus-trap-react';

// ============================================================================
// BlankEditPopover — popover UI for editing a blank's per-blank fields.
// ----------------------------------------------------------------------------
// Editing model — save-on-blur with force-commit-before-close:
//   onBlur of each field commits the value via onChange (normal path).
//   On close (Escape, outside click, Enter), flushAll() commits any
//   pending field state in a single bundled onChange call.
//
//   The close-flush passes options.preserveSelection: false so the
//   resulting transaction doesn't re-assert NodeSelection on the chip.
//   This lets onClose's setTextSelection move selection cleanly in
//   one click.
//
// Positioning:
//   floating-ui's `size` middleware dynamically sets max-height based
//   on available viewport space. `flip()` picks the placement (above
//   vs below the chip) with more space, so tall popovers near the
//   page bottom anchor above.
//
// Focus management:
//   FocusTrap (focus-trap-react) wraps the popover content. Tab cycles
//   between fields within the popover; can't escape into the editor or
//   page chrome until Escape / outside-click closes the popover.
//
//   - initialFocus: false — we keep our own rAF-based answer field focus
//     so it works consistently with the popover open/reuse cycle (FocusTrap's
//     initial focus runs synchronously on mount; ours runs after floating-ui
//     has positioned the popover, which avoids a tiny flash of focus state).
//   - returnFocusOnDeactivate: true — when the popover unmounts, focus
//     returns to whatever held it before (typically the chip), important
//     for screen reader continuity.
//   - allowOutsideClick: true — our document-level mousedown handler
//     handles outside-click closure; FocusTrap shouldn't swallow these.
//   - escapeDeactivates: false — our document-level Escape handler runs
//     flushAll() before close, which FocusTrap's default escape would
//     bypass. Disabling FocusTrap's escape lets ours run.
// ============================================================================

interface MistakeFeedbackPair {
    match: string;
    feedback: string;
}

interface ChangeOptions {
    preserveSelection?: boolean;
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
        options?: ChangeOptions,
    ) => void;
    onClose: () => void;
}

const MIN_POPOVER_HEIGHT = 200;
const VIEWPORT_PADDING = 12;

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

    const [maxHeight, setMaxHeight] = useState<number | null>(null);

    const answerRef = useRef(initialAnswer);
    const acceptableRef = useRef<string[]>(initialAcceptableAnswers);
    const hintRef = useRef<string>(initialHint ?? '');
    const feedbackRef = useRef<MistakeFeedbackPair[]>(initialMistakeFeedback ?? []);

    const initialAnswerRef = useRef(initialAnswer);
    const initialAcceptableRef = useRef<string[]>(initialAcceptableAnswers);
    const initialHintRef = useRef<string | undefined>(initialHint);
    const initialFeedbackRef = useRef<MistakeFeedbackPair[] | undefined>(
        initialMistakeFeedback,
    );

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const answerInputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

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

    const flushAll = () => {
        const updates: Partial<{
            answer: string;
            acceptableAnswers: string[];
            hint: string | undefined;
            mistakeFeedback: MistakeFeedbackPair[] | undefined;
        }> = {};

        const trimmedAnswer = answerRef.current.trim();
        if (
            trimmedAnswer.length > 0 &&
            trimmedAnswer !== initialAnswerRef.current
        ) {
            updates.answer = trimmedAnswer;
        }

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

        const trimmedHint = hintRef.current.trim();
        const hintValue = trimmedHint.length > 0 ? trimmedHint : undefined;
        if (hintValue !== initialHintRef.current) {
            updates.hint = hintValue;
        }

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
            onChangeRef.current(updates, { preserveSelection: false });
        }
    };

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
        middleware: [
            offset(4),
            flip(),
            shift({ padding: 8 }),
            size({
                padding: VIEWPORT_PADDING,
                apply({ availableHeight }) {
                    setMaxHeight(
                        Math.max(MIN_POPOVER_HEIGHT, Math.floor(availableHeight)),
                    );
                },
            }),
        ],
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

    const commitHint = () => {
        const trimmed = hint.trim();
        const nextValue = trimmed.length > 0 ? trimmed : undefined;
        if (nextValue !== initialHintRef.current) {
            onChange({ hint: nextValue });
            initialHintRef.current = nextValue;
        }
    };

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

    const popoverStyle: React.CSSProperties = {
        ...floatingStyles,
        ...(maxHeight !== null ? { maxHeight: `${maxHeight}px` } : {}),
    };

    return createPortal(
        <FocusTrap
            active={isOpen}
            focusTrapOptions={{
                // We handle initial focus ourselves via the rAF effect above.
                // FocusTrap's default focuses synchronously, which can race
                // with floating-ui's positioning and cause a brief visual
                // flash. Setting initialFocus: false defers to our logic.
                initialFocus: false,
                // Return focus to whatever held it before the popover opened
                // (the chip, typically). Important for screen reader continuity
                // and keyboard-only workflows.
                returnFocusOnDeactivate: true,
                // Our document-level mousedown handler handles outside-click
                // closing. FocusTrap shouldn't swallow these clicks.
                allowOutsideClick: true,
                // Our document-level Escape handler runs flushAll() before
                // close. FocusTrap's default Escape would call its own
                // deactivate, bypassing our flush. Disabling it lets ours run.
                escapeDeactivates: false,
                // Don't error if no focusable element exists at trap-time
                // (defensive — shouldn't happen in practice).
                fallbackFocus: () => popoverRef.current ?? document.body,
            }}
        >
            <div
                ref={setRefs}
                className="blank-edit-popover"
                style={popoverStyle}
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
                            const isTrailingEmpty =
                                index === acceptableAnswers.length;
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
                                            updateAcceptableRow(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                        onBlur={commitAcceptable}
                                        onKeyDown={handleAcceptableKeyDown}
                                    />
                                    {!isTrailingEmpty && (
                                        <button
                                            type="button"
                                            className="blank-edit-popover__remove"
                                            onClick={() =>
                                                removeAcceptableRow(index)
                                            }
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
                                If the student types one of these wrong
                                answers, show the matching feedback instead
                                of the generic hint.
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
            </div>
        </FocusTrap>,
        document.body,
    );
}
