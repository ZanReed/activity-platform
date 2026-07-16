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
import {
    computeFlush,
    resolveAnswerBlur,
    resolveAcceptableCommit,
    resolveToleranceCommit,
    filterFeedbackForCommit,
    stripList,
    type MistakeFeedbackPair,
} from './blankPopoverLogic';

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
    initialInterchangeable: boolean;
    initialAnswerType: 'text' | 'numeric';
    initialTolerance: number | undefined;
    // Whether a previous blank exists in this block; gates the grouping
    // checkbox (the first blank in a block has nothing to group with).
    canGroupWithPrevious: boolean;
    onChange: (
        attrs: Partial<{
            answer: string;
            acceptableAnswers: string[];
            interchangeableWithPrevious: boolean;
            answerType: 'text' | 'numeric';
            tolerance: number | undefined;
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
    initialInterchangeable,
    initialAnswerType,
    initialTolerance,
    canGroupWithPrevious,
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
    // Grouping flag commits immediately on toggle (no draft/flush), like the
    // acceptable-answer remove path.
    const [interchangeable, setInterchangeable] = useState(initialInterchangeable);
    // Numeric mode commits immediately on toggle (like grouping); tolerance is
    // draft-then-flush (like answer) since it's typed.
    const [isNumeric, setIsNumeric] = useState(initialAnswerType === 'numeric');
    const [toleranceDraft, setToleranceDraft] = useState(
        initialTolerance !== undefined ? String(initialTolerance) : '',
    );

    // Answer-matching controls (answer, numeric, acceptable answers, group
    // ordering) are ALL always visible — they're core answer config a teacher
    // sets while authoring. Only the pedagogical extras (hint + mistake
    // feedback) collapse, under one "Advanced options" disclosure. Auto-opens
    // when the blank already carries a hint or feedback.
    const [advancedExpanded, setAdvancedExpanded] = useState(false);

    const [maxHeight, setMaxHeight] = useState<number | null>(null);

    const answerRef = useRef(initialAnswer);
    const acceptableRef = useRef<string[]>(initialAcceptableAnswers);
    const toleranceRef = useRef(
        initialTolerance !== undefined ? String(initialTolerance) : '',
    );
    const isNumericRef = useRef(initialAnswerType === 'numeric');

    const initialAnswerRef = useRef(initialAnswer);
    const initialAcceptableRef = useRef<string[]>(initialAcceptableAnswers);
    const initialToleranceRef = useRef<number | undefined>(initialTolerance);

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
        toleranceRef.current = toleranceDraft;
    }, [toleranceDraft]);
    useEffect(() => {
        isNumericRef.current = isNumeric;
    }, [isNumeric]);

    useEffect(() => {
        if (isOpen) {
            setAnswer(initialAnswer);
            setAnswerError(null);
            setAcceptableAnswers(initialAcceptableAnswers);
            setMistakeFeedback(initialMistakeFeedback ?? []);
            setInterchangeable(initialInterchangeable);
            setIsNumeric(initialAnswerType === 'numeric');
            setToleranceDraft(
                initialTolerance !== undefined ? String(initialTolerance) : '',
            );
            setAdvancedExpanded(
                Boolean(initialHint && initialHint.length > 0) ||
                    Boolean(
                        initialMistakeFeedback &&
                            initialMistakeFeedback.length > 0,
                    ),
            );
            answerRef.current = initialAnswer;
            acceptableRef.current = initialAcceptableAnswers;
            toleranceRef.current =
                initialTolerance !== undefined ? String(initialTolerance) : '';
            isNumericRef.current = initialAnswerType === 'numeric';
            initialAnswerRef.current = initialAnswer;
            initialAcceptableRef.current = initialAcceptableAnswers;
            initialToleranceRef.current = initialTolerance;
        }
        // Reset drafts only when the popover opens or retargets a different
        // blank — NOT on every initial* identity change. hint + mistake
        // feedback commit live, which mutates those props each keystroke;
        // re-syncing here would clobber a half-typed feedback row.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, blankId]);

    const { refs, floatingStyles, isPositioned } = useFloating({
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

    // Focus only after floating-ui has anchored the popover, and never let the
    // focus itself scroll — same scroll-to-top fix as ImageEditPopover (a
    // popover focused before positioning sits at the body's top-left, so the
    // browser scrolled the window to the top of the page).
    useEffect(() => {
        if (!isOpen || !isPositioned) return;
        const raf = requestAnimationFrame(() => {
            answerInputRef.current?.focus({ preventScroll: true });
            answerInputRef.current?.select();
        });
        return () => cancelAnimationFrame(raf);
    }, [isOpen, isPositioned]);

    // Only answer + acceptableAnswers are draft-then-flush; hint and mistake
    // feedback commit live through the nested editors (see commitHintNodes /
    // commitFeedback). flushAll runs on close to push any pending string edits.
    const flushAll = () => {
        const { updates, hasUpdates } = computeFlush({
            answer: answerRef.current,
            initialAnswer: initialAnswerRef.current,
            acceptable: acceptableRef.current,
            initialAcceptable: initialAcceptableRef.current,
        });
        // Tolerance rides the same close-time flush (it's a typed draft like
        // the answer field), but only while numeric mode is on — toggling
        // numeric off already cleared the attr.
        const tolerance = isNumericRef.current
            ? resolveToleranceCommit(
                  toleranceRef.current,
                  initialToleranceRef.current,
              )
            : { changed: false, value: undefined };
        if (hasUpdates || tolerance.changed) {
            onChangeRef.current(
                {
                    ...updates,
                    ...(tolerance.changed ? { tolerance: tolerance.value } : {}),
                },
                { preserveSelection: false },
            );
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
            // The top toolbar formats the popover's rich fields (hint,
            // feedback) — its buttons preventDefault on mousedown so the field
            // keeps focus; clicking them must not close the popover.
            if (
                target instanceof Element &&
                target.closest('.editor-toolbar')
            ) {
                return;
            }
            flushAll();
            onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, onClose, referenceElement]);

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
        const result = resolveAnswerBlur(answer, initialAnswerRef.current);
        if (result.action === 'revert') {
            setAnswer(initialAnswerRef.current);
            answerRef.current = initialAnswerRef.current;
            setAnswerError('Answer cannot be empty');
            window.setTimeout(() => setAnswerError(null), 2000);
            return;
        }
        if (result.action === 'commit') {
            onChange({ answer: result.value });
            initialAnswerRef.current = result.value;
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
        // Removal always changes the list, so commit unconditionally.
        const stripped = stripList(next);
        onChange({ acceptableAnswers: stripped });
        initialAcceptableRef.current = stripped;
    };

    const commitAcceptable = () => {
        const { changed, stripped } = resolveAcceptableCommit(
            acceptableAnswers,
            initialAcceptableRef.current,
        );
        if (changed) {
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
        onChange({ mistakeFeedback: filterFeedbackForCommit(next) });
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

    const handleInterchangeableToggle = (checked: boolean) => {
        setInterchangeable(checked);
        // Commit immediately; preserveSelection (default) keeps the popover open.
        onChange({ interchangeableWithPrevious: checked });
    };

    const handleNumericToggle = (checked: boolean) => {
        setIsNumeric(checked);
        if (checked) {
            onChange({ answerType: 'numeric' });
        } else {
            // Turning numeric off also clears the tolerance — it's meaningless
            // on a text blank and would silently reappear if numeric came back.
            setToleranceDraft('');
            onChange({ answerType: 'text', tolerance: undefined });
            initialToleranceRef.current = undefined;
        }
    };

    const commitTolerance = () => {
        const result = resolveToleranceCommit(
            toleranceDraft,
            initialToleranceRef.current,
        );
        if (result.changed) {
            onChange({ tolerance: result.value });
            initialToleranceRef.current = result.value;
        }
        // Normalize the draft to what's actually committed (reverts an
        // unparseable or negative entry, mirroring the answer-revert rule).
        setToleranceDraft(
            initialToleranceRef.current !== undefined
                ? String(initialToleranceRef.current)
                : '',
        );
    };

    const handleToleranceKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitTolerance();
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
        // Invisible (but measurable) until anchored — never paint at (0,0).
        ...(isPositioned ? {} : { visibility: 'hidden' as const }),
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
                    <label className="blank-edit-popover__checkbox">
                        <input
                            type="checkbox"
                            checked={isNumeric}
                            onChange={(e) =>
                                handleNumericToggle(e.target.checked)
                            }
                        />
                        <span className="blank-edit-popover__label">
                            Numeric answer
                        </span>
                    </label>
                    {isNumeric && (
                        <div className="blank-edit-popover__sublabel">
                            Equivalent forms count as correct — 0.5, 1/2, and
                            .50 all match. Fractions and mixed numbers work.
                        </div>
                    )}
                    {isNumeric && (
                        <label className="blank-edit-popover__field">
                            <span className="blank-edit-popover__label">
                                Tolerance (±)
                            </span>
                            <input
                                type="text"
                                inputMode="decimal"
                                className="blank-edit-popover__input"
                                value={toleranceDraft}
                                placeholder="0 (exact)"
                                onChange={(e) =>
                                    setToleranceDraft(e.target.value)
                                }
                                onBlur={commitTolerance}
                                onKeyDown={handleToleranceKeyDown}
                                aria-label="Numeric tolerance"
                            />
                        </label>
                    )}
                </div>

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
                                                    onKeyDown={
                                                        handleAcceptableKeyDown
                                                    }
                                                />
                                                {!isTrailingEmpty && (
                                                    <button
                                                        type="button"
                                                        className="blank-edit-popover__remove"
                                                        onClick={() =>
                                                            removeAcceptableRow(
                                                                index,
                                                            )
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

                            {canGroupWithPrevious && (
                                <div className="blank-edit-popover__field">
                                    <label className="blank-edit-popover__checkbox">
                                        <input
                                            type="checkbox"
                                            checked={interchangeable}
                                            onChange={(e) =>
                                                handleInterchangeableToggle(
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span className="blank-edit-popover__label">
                                            Accept in any order
                                        </span>
                                    </label>
                                    <div className="blank-edit-popover__sublabel">
                                        This blank and the one before it may be
                                        answered in either order (e.g.
                                        factoring). Each correct answer still
                                        counts once.
                                    </div>
                                </div>
                            )}

                {advancedExpanded ? (
                    <>
                        <div className="blank-edit-popover__field">
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
                        </div>

                        <div className="blank-edit-popover__field">
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
                        </div>
                    </>
                ) : (
                    <div className="blank-edit-popover__field">
                        <button
                            type="button"
                            className="blank-edit-popover__add-section"
                            onClick={() => setAdvancedExpanded(true)}
                        >
                            + Advanced options (hint, mistake feedback)
                        </button>
                    </div>
                )}

                <div className="blank-edit-popover__hint-text">
                    Press Escape or click outside to close.
                </div>
            </div>
        </FocusTrap>,
        document.body,
    );
}
