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
import InlineRichTextEditor from './InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';

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
    feedback: InlineNodes;
}

interface ChangeOptions {
    preserveSelection?: boolean;
}

interface BlankEditPopoverProps {
    referenceElement: HTMLElement | null;
    isOpen: boolean;
    // Identifies the blank currently being edited. Used to key the nested
    // rich-text editors so they remount (and reload content) when the popover
    // retargets a different chip without closing.
    blankId: string;
    initialAnswer: string;
    initialAcceptableAnswers: string[];
    initialHint: InlineNodes | undefined;
    initialMistakeFeedback: MistakeFeedbackPair[] | undefined;
    onChange: (
        attrs: Partial<{
            answer: string;
            acceptableAnswers: string[];
            hint: InlineNodes | undefined;
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
    blankId,
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
    // hint + mistake feedback are rich (InlineNode[]) and commit live through
    // the nested editors, so they aren't held as draft string state here —
    // mistakeFeedback is kept only to drive the row UI (match inputs + which
    // rows exist); each feedback body is owned by its nested editor.
    const [mistakeFeedback, setMistakeFeedback] = useState<MistakeFeedbackPair[]>(
        initialMistakeFeedback ?? [],
    );

    const [hintExpanded, setHintExpanded] = useState(false);
    const [feedbackExpanded, setFeedbackExpanded] = useState(false);

    const [maxHeight, setMaxHeight] = useState<number | null>(null);

    const answerRef = useRef(initialAnswer);
    const acceptableRef = useRef<string[]>(initialAcceptableAnswers);

    const initialAnswerRef = useRef(initialAnswer);
    const initialAcceptableRef = useRef<string[]>(initialAcceptableAnswers);

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
        if (isOpen) {
            setAnswer(initialAnswer);
            setAnswerError(null);
            setAcceptableAnswers(initialAcceptableAnswers);
            setMistakeFeedback(initialMistakeFeedback ?? []);
            setHintExpanded(Boolean(initialHint && initialHint.length > 0));
            setFeedbackExpanded(
                Boolean(initialMistakeFeedback && initialMistakeFeedback.length > 0),
            );
            answerRef.current = initialAnswer;
            acceptableRef.current = initialAcceptableAnswers;
            initialAnswerRef.current = initialAnswer;
            initialAcceptableRef.current = initialAcceptableAnswers;
        }
        // Reset drafts only when the popover opens or retargets a different
        // blank — NOT on every initial* identity change. hint + mistake
        // feedback commit live, which mutates those props each keystroke;
        // re-syncing here would clobber a half-typed feedback row.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, blankId]);

    useEffect(() => {
        if (!isOpen) return;
        const raf = requestAnimationFrame(() => {
            answerInputRef.current?.focus();
            answerInputRef.current?.select();
        });
        return () => cancelAnimationFrame(raf);
    }, [isOpen]);

    // Only answer + acceptableAnswers are draft-then-flush; hint and mistake
    // feedback commit live through the nested editors (see commitHintNodes /
    // commitFeedback). flushAll runs on close to push any pending string edits.
    const flushAll = () => {
        const updates: Partial<{
            answer: string;
            acceptableAnswers: string[];
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
            // The MathLive virtual keyboard mounts on document.body (outside
            // the popover) when a nested inline-math field is focused. Clicking
            // its keys must not be treated as an outside-click close.
            if (
                target instanceof Element &&
                target.closest('.ML__keyboard')
            ) {
                return;
            }
            flushAll();
            onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
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
        () => [...mistakeFeedback, { match: '', feedback: [] }],
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

    // The hint editor owns its content; we just forward each change to the
    // blank's attrs. Empty → undefined so the schema doesn't carry an empty
    // array.
    const commitHintNodes = (nodes: InlineNodes) => {
        onChange({ hint: nodes.length > 0 ? nodes : undefined });
    };

    // Sets the draft rows AND commits the filtered result. A row needs both a
    // non-empty match string and non-empty feedback content to be carried;
    // half-finished rows stay in the draft (so the UI keeps them) but are
    // dropped from the committed attr until complete.
    const commitFeedback = (next: MistakeFeedbackPair[]) => {
        setMistakeFeedback(next);
        const stripped = next
            .map((p) => ({ match: p.match.trim(), feedback: p.feedback }))
            .filter((p) => p.match.length > 0 && p.feedback.length > 0);
        onChange({
            mistakeFeedback: stripped.length > 0 ? stripped : undefined,
        });
    };

    const updateFeedbackMatch = (index: number, value: string) => {
        const next = [...mistakeFeedback];
        if (index < next.length) {
            next[index] = { ...next[index]!, match: value };
        } else {
            next.push({ match: value, feedback: [] });
        }
        commitFeedback(next);
    };

    const updateFeedbackContent = (index: number, nodes: InlineNodes) => {
        const next = [...mistakeFeedback];
        if (index < next.length) {
            next[index] = { ...next[index]!, feedback: nodes };
        } else {
            next.push({ match: '', feedback: nodes });
        }
        commitFeedback(next);
    };

    const removeFeedbackRow = (index: number) => {
        commitFeedback(mistakeFeedback.filter((_, i) => i !== index));
    };

    const handleFeedbackMatchKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
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
                            <div className="blank-edit-popover__sublabel">
                                Shown when the student clicks the ? button.
                                Supports bold, italic, and inline math.
                            </div>
                            <InlineRichTextEditor
                                key={`hint-${blankId}`}
                                value={initialHint ?? []}
                                onChange={commitHintNodes}
                                ariaLabel="Hint"
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
                                                        updateFeedbackMatch(
                                                            index,
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={
                                                        handleFeedbackMatchKeyDown
                                                    }
                                                    aria-label="Wrong answer to match"
                                                />
                                                <InlineRichTextEditor
                                                    key={`fb-${blankId}-${index}`}
                                                    value={pair.feedback}
                                                    onChange={(nodes) =>
                                                        updateFeedbackContent(
                                                            index,
                                                            nodes,
                                                        )
                                                    }
                                                    ariaLabel="Feedback to show"
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
