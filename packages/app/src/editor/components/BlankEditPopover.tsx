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
    resolveUnitCommit,
    unitDraftFrom,
    filterFeedbackForCommit,
    stripList,
    type MistakeFeedbackPair,
    FORM_WRONG_MATCH,
    formWrongOf,
    mistakeRowsOf,
} from './blankPopoverLogic';
import MisconceptionField from './MisconceptionField';

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
    initialAnswerType: 'text' | 'numeric' | 'math';
    initialTolerance: number | undefined;
    initialUnit: string | undefined;
    initialAcceptableUnits: string[] | undefined;
    initialEquivalence: 'value' | 'form' | undefined;
    // Whether a previous blank exists in this block; gates the grouping
    // checkbox (the first blank in a block has nothing to group with).
    canGroupWithPrevious: boolean;
    // Model A: reuse this popover to configure an in-equation math prompt's
    // grading. Hides the fill-in-blank-only parts (the Answer field — the answer
    // is typed in the gap; the answer-type radios — a gap is always math; hint /
    // mistake feedback / grouping) and keeps Equivalence / Tolerance / Acceptable
    // answers. See docs/design/math-blanks.md (MA-DR2).
    mathPromptMode?: boolean;
    onChange: (
        attrs: Partial<{
            answer: string;
            acceptableAnswers: string[];
            interchangeableWithPrevious: boolean;
            answerType: 'text' | 'numeric' | 'math';
            tolerance: number | undefined;
            unit: string | undefined;
            acceptableUnits: string[] | undefined;
            equivalence: 'value' | 'form' | undefined;
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
    initialUnit,
    initialAcceptableUnits,
    initialEquivalence,
    canGroupWithPrevious,
    mathPromptMode = false,
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
    // The reserved `!form-wrong` entry (form grading, FG-5) is NOT a row: it
    // has its own field under the mistakes list, so the rows hold the rest and
    // every commit puts the two back together (commitFeedback).
    // Only a MATH blank splits it out: on a text blank a literal "form-wrong"
    // is an ordinary row the teacher can see and delete (step-4 review).
    const [mistakeFeedback, setMistakeFeedback] = useState<MistakeFeedbackPair[]>(
        initialAnswerType === 'math'
            ? mistakeRowsOf(initialMistakeFeedback)
            : (initialMistakeFeedback ?? []),
    );
    const [formWrong, setFormWrong] = useState<MistakeFeedbackPair | undefined>(
        initialAnswerType === 'math' ? formWrongOf(initialMistakeFeedback) : undefined,
    );
    // Grouping flag commits immediately on toggle (no draft/flush), like the
    // acceptable-answer remove path.
    const [interchangeable, setInterchangeable] = useState(initialInterchangeable);
    // Answer mode (text/numeric/math) commits immediately on change (like
    // grouping); tolerance is draft-then-flush (like answer) since it's typed.
    // Equivalence (math only) also commits immediately.
    const [answerType, setAnswerType] = useState<'text' | 'numeric' | 'math'>(
        initialAnswerType,
    );
    const [equivalence, setEquivalence] = useState<'value' | 'form'>(
        initialEquivalence === 'form' ? 'form' : 'value',
    );
    const [toleranceDraft, setToleranceDraft] = useState(
        initialTolerance !== undefined ? String(initialTolerance) : '',
    );
    // Unit (numeric only): one field holds "canonical, alternate, alternate".
    // Draft-then-flush like tolerance.
    const [unitDraft, setUnitDraft] = useState(
        unitDraftFrom(initialUnit, initialAcceptableUnits),
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
    const answerTypeRef = useRef<'text' | 'numeric' | 'math'>(initialAnswerType);
    const unitRef = useRef(unitDraftFrom(initialUnit, initialAcceptableUnits));

    const initialAnswerRef = useRef(initialAnswer);
    const initialAcceptableRef = useRef<string[]>(initialAcceptableAnswers);
    const initialToleranceRef = useRef<number | undefined>(initialTolerance);
    const initialUnitRef = useRef<string | undefined>(initialUnit);
    const initialAcceptableUnitsRef = useRef<string[] | undefined>(
        initialAcceptableUnits,
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
        toleranceRef.current = toleranceDraft;
    }, [toleranceDraft]);
    useEffect(() => {
        unitRef.current = unitDraft;
    }, [unitDraft]);
    useEffect(() => {
        answerTypeRef.current = answerType;
    }, [answerType]);

    useEffect(() => {
        if (isOpen) {
            setAnswer(initialAnswer);
            setAnswerError(null);
            setAcceptableAnswers(initialAcceptableAnswers);
            setMistakeFeedback(
                initialAnswerType === 'math'
                    ? mistakeRowsOf(initialMistakeFeedback)
                    : (initialMistakeFeedback ?? []),
            );
            setFormWrong(
                initialAnswerType === 'math' ? formWrongOf(initialMistakeFeedback) : undefined,
            );
            setInterchangeable(initialInterchangeable);
            setAnswerType(initialAnswerType);
            setEquivalence(
                initialEquivalence === 'form' ? 'form' : 'value',
            );
            setToleranceDraft(
                initialTolerance !== undefined ? String(initialTolerance) : '',
            );
            setUnitDraft(unitDraftFrom(initialUnit, initialAcceptableUnits));
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
            unitRef.current = unitDraftFrom(initialUnit, initialAcceptableUnits);
            answerTypeRef.current = initialAnswerType;
            initialAnswerRef.current = initialAnswer;
            initialAcceptableRef.current = initialAcceptableAnswers;
            initialToleranceRef.current = initialTolerance;
            initialUnitRef.current = initialUnit;
            initialAcceptableUnitsRef.current = initialAcceptableUnits;
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
        // the answer field), but only while numeric OR math mode is on —
        // switching back to text already cleared the attr.
        const tolerance =
            answerTypeRef.current === 'numeric' || answerTypeRef.current === 'math'
                ? resolveToleranceCommit(
                      toleranceRef.current,
                      initialToleranceRef.current,
                  )
                : { changed: false, value: undefined };
        // The unit field is numeric-only; switching away already cleared it.
        const unit =
            answerTypeRef.current === 'numeric'
                ? resolveUnitCommit(
                      unitRef.current,
                      initialUnitRef.current,
                      initialAcceptableUnitsRef.current,
                  )
                : { changed: false, unit: undefined, acceptableUnits: undefined };
        if (hasUpdates || tolerance.changed || unit.changed) {
            onChangeRef.current(
                {
                    ...updates,
                    ...(tolerance.changed ? { tolerance: tolerance.value } : {}),
                    ...(unit.changed
                        ? { unit: unit.unit, acceptableUnits: unit.acceptableUnits }
                        : {}),
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

    // Sets the draft rows AND commits the filtered result. A row needs a
    // non-empty match string and feedback content or a misconception id;
    // half-finished rows stay in the draft (so the UI keeps them) but are
    // dropped from the committed attr until complete.
    const commitFeedback = (
        next: MistakeFeedbackPair[],
        nextFormWrong: MistakeFeedbackPair | undefined = formWrong,
    ) => {
        setMistakeFeedback(next);
        setFormWrong(nextFormWrong);
        // A row whose match is the reserved word never doubles the wrong-form
        // entry: while the field owns it, such a row is not committed.
        const rows = nextFormWrong ? mistakeRowsOf(next) : next;
        onChange({
            mistakeFeedback: filterFeedbackForCommit(
                nextFormWrong ? [...rows, nextFormWrong] : rows,
            ),
        });
    };

    // The wrong-form message (FG-5): writes the reserved `!form-wrong` entry.
    // Empty prose and no misconception = no entry, so the student gets the
    // built-in line.
    const updateFormWrongFeedback = (nodes: InlineNodes) => {
        commitFeedback(mistakeFeedback, {
            match: FORM_WRONG_MATCH,
            feedback: nodes,
            ...(formWrong?.misconceptionId ? { misconceptionId: formWrong.misconceptionId } : {}),
        });
    };
    const updateFormWrongMisconception = (id: string | undefined) => {
        commitFeedback(mistakeFeedback, {
            match: FORM_WRONG_MATCH,
            feedback: formWrong?.feedback ?? [],
            ...(id ? { misconceptionId: id } : {}),
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

    const updateFeedbackMisconception = (index: number, id: string | undefined) => {
        const next = [...mistakeFeedback];
        const row = next[index];
        if (!row) return;
        const updated: MistakeFeedbackPair = { match: row.match, feedback: row.feedback };
        if (id) updated.misconceptionId = id;
        next[index] = updated;
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

    const handleAnswerTypeChange = (next: 'text' | 'numeric' | 'math') => {
        if (next === answerType) return;
        setAnswerType(next);
        // Leaving math leaves form grading: the reserved wrong-form entry goes
        // with the equivalence (it could never fire on a text/numeric blank).
        const dropFormWrong =
            next !== 'math' && formWrong
                ? { mistakeFeedback: filterFeedbackForCommit(mistakeFeedback) }
                : {};
        if (next !== 'math') setFormWrong(undefined);
        if (next === 'text') {
            // Text clears tolerance + equivalence + unit — all meaningless on a
            // text blank and would silently reappear if numeric/math came back.
            setToleranceDraft('');
            setUnitDraft('');
            setEquivalence('value');
            onChange({
                answerType: 'text',
                tolerance: undefined,
                unit: undefined,
                acceptableUnits: undefined,
                equivalence: undefined,
                ...dropFormWrong,
            });
            initialToleranceRef.current = undefined;
            initialUnitRef.current = undefined;
            initialAcceptableUnitsRef.current = undefined;
        } else if (next === 'numeric') {
            // Numeric keeps tolerance; equivalence is math-only → cleared.
            setEquivalence('value');
            onChange({ answerType: 'numeric', equivalence: undefined, ...dropFormWrong });
        } else {
            // Math: default equivalence to 'value' (stored as absent). Tolerance
            // carries over (it's valid for both numeric and math); the unit is
            // numeric-only and clears.
            setUnitDraft('');
            setEquivalence(
                initialEquivalence === 'form' ? 'form' : 'value',
            );
            onChange({
                answerType: 'math',
                unit: undefined,
                acceptableUnits: undefined,
            });
            initialUnitRef.current = undefined;
            initialAcceptableUnitsRef.current = undefined;
        }
    };

    const handleEquivalenceChange = (next: 'value' | 'form') => {
        setEquivalence(next);
        // 'value' is the default → store as undefined so value-mode blanks stay
        // attr-free (round-trip parity); 'form' is stored explicitly. Going
        // back to "Any equal form" is the REMOVE path (form-grading.md, The
        // GUI): the form flag and the wrong-form entry both go.
        if (next === 'value' && formWrong) {
            setFormWrong(undefined);
            onChange({
                equivalence: undefined,
                mistakeFeedback: filterFeedbackForCommit(mistakeFeedback),
            });
            return;
        }
        onChange({ equivalence: next === 'form' ? 'form' : undefined });
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

    const commitUnit = () => {
        const result = resolveUnitCommit(
            unitDraft,
            initialUnitRef.current,
            initialAcceptableUnitsRef.current,
        );
        if (result.changed) {
            onChange({
                unit: result.unit,
                acceptableUnits: result.acceptableUnits,
            });
            initialUnitRef.current = result.unit;
            initialAcceptableUnitsRef.current = result.acceptableUnits;
        }
        // Normalize the draft to the committed form (trims stray commas).
        setUnitDraft(
            unitDraftFrom(
                initialUnitRef.current,
                initialAcceptableUnitsRef.current,
            ),
        );
    };

    const handleUnitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitUnit();
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
                {!mathPromptMode && (
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
                )}

                <div className="blank-edit-popover__field">
                    <span className="blank-edit-popover__label">
                        {mathPromptMode ? 'Grading' : 'Answer type'}
                    </span>
                    {!mathPromptMode && (
                        <div
                            className="blank-edit-popover__seg"
                            role="radiogroup"
                            aria-label="Answer type"
                        >
                            {(['text', 'numeric', 'math'] as const).map((t) => (
                                <label
                                    key={t}
                                    className="blank-edit-popover__seg-option"
                                >
                                    <input
                                        type="radio"
                                        name={`answer-type-${blankId}`}
                                        checked={answerType === t}
                                        onChange={() => handleAnswerTypeChange(t)}
                                    />
                                    <span>
                                        {t === 'text'
                                            ? 'Text'
                                            : t === 'numeric'
                                              ? 'Numeric'
                                              : 'Math'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                    {answerType === 'numeric' && (
                        <div className="blank-edit-popover__sublabel">
                            Equivalent forms count as correct — 0.5, 1/2, and
                            .50 all match. Fractions and mixed numbers work.
                        </div>
                    )}
                    {answerType === 'math' && !mathPromptMode && (
                        <div className="blank-edit-popover__sublabel">
                            Graded as a math expression — 2a, a*2, and a+a all
                            match. Type the answer as plain math (e.g. 2a,
                            (a+b)/2, sqrt(x)).
                        </div>
                    )}
                    {answerType === 'math' && (
                        <label className="blank-edit-popover__field">
                            <span className="blank-edit-popover__label">
                                Equivalence
                            </span>
                            <select
                                className="blank-edit-popover__input"
                                value={equivalence}
                                onChange={(e) =>
                                    handleEquivalenceChange(
                                        e.target.value === 'form'
                                            ? 'form'
                                            : 'value',
                                    )
                                }
                                aria-label="Math equivalence mode"
                            >
                                <option value="value">
                                    Any equal form
                                </option>
                                <option value="form">
                                    Equal, and in this form
                                </option>
                            </select>
                        </label>
                    )}
                    {answerType === 'math' && equivalence === 'form' && (
                        <div className="blank-edit-popover__sublabel" data-form-help="true">
                            The answer and each acceptable answer are the forms
                            you’ll accept — order and spacing don’t matter, but
                            2(9x-6) is wrong for 6(3x-2). Say the form in the
                            question.
                        </div>
                    )}
                    {(answerType === 'numeric' || answerType === 'math') && (
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
                                aria-label="Comparison tolerance"
                            />
                        </label>
                    )}
                    {answerType === 'numeric' && !mathPromptMode && (
                        <label className="blank-edit-popover__field">
                            <span className="blank-edit-popover__label">
                                Unit
                            </span>
                            <input
                                type="text"
                                className="blank-edit-popover__input"
                                value={unitDraft}
                                placeholder="none — e.g. km/h, kph"
                                onChange={(e) => setUnitDraft(e.target.value)}
                                onBlur={commitUnit}
                                onKeyDown={handleUnitKeyDown}
                                aria-label="Required unit (comma-separated alternates)"
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

                {!mathPromptMode && (advancedExpanded ? (
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
                                {answerType === 'math' && equivalence === 'form'
                                    ? ' A wrong answer matches in any order, not only as typed.'
                                    : ''}
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
                                                {!isTrailingEmpty && (
                                                    <MisconceptionField
                                                        value={pair.misconceptionId}
                                                        onChange={(id) =>
                                                            updateFeedbackMisconception(index, id)
                                                        }
                                                        context={`the wrong answer “${pair.match}”`}
                                                    />
                                                )}
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

                        {answerType === 'math' && equivalence === 'form' && (
                            <div className="blank-edit-popover__field" data-form-wrong-field="true">
                                <span className="blank-edit-popover__label">
                                    If it’s equal but in the wrong form
                                </span>
                                <div className="blank-edit-popover__sublabel">
                                    Shown when the answer is right but not in an
                                    accepted form. Leave empty to show: “That’s
                                    equal to the answer, but it isn’t in the form
                                    the question asks for.”
                                </div>
                                <InlineRichTextEditor
                                    key={`fw-${blankId}`}
                                    value={formWrong?.feedback ?? []}
                                    onChange={updateFormWrongFeedback}
                                    ariaLabel="Wrong-form message"
                                />
                                <MisconceptionField
                                    value={formWrong?.misconceptionId}
                                    onChange={updateFormWrongMisconception}
                                    context="an equal answer in the wrong form"
                                />
                            </div>
                        )}
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
                ))}

                <div className="blank-edit-popover__hint-text">
                    Press Escape or click outside to close.
                </div>
            </div>
        </FocusTrap>,
        document.body,
    );
}
