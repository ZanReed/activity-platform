// =============================================================================
// MixedRunner.tsx — one practice question per screen (D43 mixed practice, slice 3)
// -----------------------------------------------------------------------------
// docs/design/mixed-practice.md DM-2, 5, 6, 10, 14, 16, 17, 19 and the slice 3
// rulings (author, 2026-10-23). LAZY: FactsEntry imports it with React.lazy,
// so it and mixed.css load only when a student presses Start or Carry on.
//
// EACH QUESTION IS THE VIEWER'S OWN DOCUMENT. The server sends one sanitized
// one-section document per slot (DM-19); this renders it with ViewerContainer
// and the viewer's own store, so a question looks and answers exactly as it
// does in an activity (DM-14). Two things differ:
//
//   - The runner draws Check / Skip / Next in ONE bar (ruling 1, DM-16: pinned
//     above the keyboard on a phone), so the container renders no Check of its
//     own (`externalCheck`). Check still goes through the store's
//     checkSection, whose CheckService here is check-activity's `practice`
//     mode for THIS slot: the request carries a session id and a slot, never
//     an item (ER-1).
//   - The document is served as `locked`, which is the viewer's existing
//     freeze: the question cannot change once Check is pressed. One try
//     (MP-9).
//
// FEEDBACK (ruling 2). The mistake note stays where the viewer's block puts it,
// beside the answer. The panel under the question holds the verdict ("✓ Right."
// / "✕ Not this time. The answer is 5 cups." / "Skipped. …"), then the
// worked solution, which is taken OUT of the store's result so the block does
// not show it as well: open after a wrong try or a skip, behind "See the
// working" after a right one. The student always presses Next (DM-10).
//
// OFFLINE (DM-5). A Check that cannot reach the server keeps going (retryLoop):
// the item and the typed answer stay, the button reads "Checking…", and after
// 10 s a quiet line says so with "Try again". Signed out → "Sign in again";
// the typed answer is held in sessionStorage for this slot, so the round trip
// returns to it (resume card → Carry on → the same question).
// =============================================================================

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type FocusEvent,
    type ReactNode,
    type RefObject,
} from 'react';
import {
    CHECK_WIRE_VERSION,
    InlineContent,
    VIEWER_STORAGE_PREFIX,
    ViewerContainer,
    createViewerStore,
    emptySectionResponses,
    indexDocument,
    isSectionUntouched,
    preloadGraphKitIfNeeded,
    preloadMathIfNeeded,
    type CheckService,
    type PracticeItemResult,
    type PracticeServedItem,
    type PracticeSession,
    type ViewerStore,
} from '@activity/viewer';
import '@activity/viewer/tokens.css';
import '@activity/viewer/viewer.css';
import { BTN_PRIMARY } from '../components/AuthScreens';
import { signInWithGoogle } from '../lib/auth';
import { checkPracticeItem, NOTHING_ANSWERED } from '../lib/mixedPractice';
import MixedDone, { type MixedTally } from './MixedDone';
import { RetryLoop } from './retryLoop';
import { heldKey } from './saveQueue';
import './practice.css';
import './mixed.css';

export const OFFLINE_NOTICE_MS = 10_000;

export interface MixedRunnerProps {
    session: PracticeSession;
    userId: string;
    classId: string;
    /** DM-7's "Practise again", from the done screen. */
    onAgain: () => void;
    /** The practice ended under the student (its day passed, or they left the
     * class): read the entry again. */
    onEnded: () => void;
    /** D65 slice 2: the same runner for a DoL's targeted practice — its own
     * check mode, and its own done screen (TP-5: never scored). */
    checkMode?: 'practice' | 'dol-practice';
    done?: (tally: MixedTally) => ReactNode;
}

/** The counts the done screen shows, from the tries seen (all of them are
 * recorded on the server before a result arrives, ER-9). */
export function tallyOf(results: Iterable<PracticeItemResult>, of: number | null): MixedTally {
    let tried = 0;
    let right = 0;
    let skipped = 0;
    for (const r of results) {
        tried += 1;
        if (r.correct) right += 1;
        if (r.skipped) skipped += 1;
    }
    return { of: of ?? tried, right, skipped, answered: tried - skipped };
}

export default function MixedRunner({ session, userId, classId, onAgain, onEnded, checkMode, done }: MixedRunnerProps) {
    const items = session.items;
    const [results, setResults] = useState<Map<number, PracticeItemResult>>(
        () => new Map(items.flatMap((i) => (i.result ? [[i.seq, i.result] as const] : []))),
    );
    // DM-6: start at the first question not yet tried.
    const [index, setIndex] = useState(() => {
        const first = items.findIndex((i) => !i.result);
        return first === -1 ? items.length : first;
    });
    const [stopped, setStopped] = useState(false);

    useEffect(() => {
        for (const item of items) {
            preloadMathIfNeeded(item.document);
            preloadGraphKitIfNeeded(item.document);
        }
    }, [items]);

    if (stopped) {
        if (done) return <>{done(tallyOf(results.values(), null))}</>;
        return <MixedDone kind="stopped" tally={tallyOf(results.values(), null)} />;
    }
    const item = items[index];
    if (!item) {
        if (done) return <>{done(tallyOf(results.values(), session.planned))}</>;
        return (
            <MixedDone
                kind="finished"
                tally={tallyOf(results.values(), session.planned)}
                graded={session.graded}
                classId={classId}
                onAgain={onAgain}
            />
        );
    }
    return (
        <PracticeItem
            key={item.seq}
            item={item}
            position={index + 1}
            total={items.length}
            tried={results.size}
            sessionId={session.sessionId}
            userId={userId}
            checkMode={checkMode}
            onResult={(r) => setResults((m) => new Map(m).set(item.seq, r))}
            onNext={() => setIndex((i) => i + 1)}
            onStop={() => setStopped(true)}
            onEnded={onEnded}
        />
    );
}

// ---- one question -------------------------------------------------------------

/** The served question as the runner shows it: `locked` (the viewer's freeze
 * at Check) and every block's label `none` (the schema's own "show nothing,
 * take no number"). Copies; the served object is never changed. */
export function practiceDocument(document: PracticeServedItem['document']): PracticeServedItem['document'] {
    return {
        ...document,
        meta: { ...document.meta, submissionMode: 'locked' },
        sections: document.sections.map((section) => ({
            ...section,
            rows: section.rows.map((row) => ({
                ...row,
                columns: row.columns.map((column) => ({
                    ...column,
                    blocks: column.blocks.map((block) => ({ ...block, label: { mode: 'none' } }) as typeof block),
                })),
            })),
        })),
    };
}

interface PracticeItemProps {
    item: PracticeServedItem;
    position: number;
    total: number;
    tried: number;
    sessionId: string;
    userId: string;
    checkMode?: 'practice' | 'dol-practice';
    onResult: (result: PracticeItemResult) => void;
    onNext: () => void;
    onStop: () => void;
    onEnded: () => void;
}

function safeSessionStorage(): Storage | null {
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

function PracticeItem({
    item,
    position,
    total,
    tried,
    sessionId,
    userId,
    checkMode,
    onResult,
    onNext,
    onStop,
    onEnded,
}: PracticeItemProps) {
    const [result, setResult] = useState<PracticeItemResult | null>(null);
    const [note, setNote] = useState<string | null>(null);
    const [, rerender] = useState(0);
    const skipRef = useRef(false);
    const lastAction = useRef<'check' | 'skip'>('check');
    const resultRef = useRef(onResult);
    resultRef.current = onResult;

    // The served document, frozen at Check by the viewer's own `locked` mode,
    // and with no problem numbers: every question is its own one-question
    // document, so each would read "1." — a counter, which DM-2 rules out
    // (the place is said once, to screen readers, by the heading above).
    const doc = useMemo(() => practiceDocument(item.document), [item.document]);
    const section = useMemo(() => indexDocument(doc).sections[0], [doc]);

    const loop = useMemo(() => new RetryLoop(() => rerender((n) => n + 1)), []);
    useEffect(() => {
        loop.start();
        return () => loop.stop();
    }, [loop]);

    const storageKey = heldKey(VIEWER_STORAGE_PREFIX, userId, `mx:${sessionId}:${item.seq}`);
    const store: ViewerStore = useMemo(() => {
        const service: CheckService = {
            async checkSection(request) {
                const skip = skipRef.current;
                skipRef.current = false;
                const stored = await loop.run(() =>
                    checkPracticeItem({
                        sessionId,
                        seq: item.seq,
                        responses: skip ? emptySectionResponses() : request.responses,
                        ...(skip ? { skip: true } : {}),
                        ...(checkMode ? { mode: checkMode } : {}),
                    }),
                );
                setResult(stored);
                resultRef.current(stored);
                // The working shows in the panel, never in the block too.
                return { wireVersion: CHECK_WIRE_VERSION, sectionId: request.sectionId, items: stored.items, solutions: {} };
            },
            fetchReleasedFeedback: async () => ({ graded: false, blocks: {} }),
        };
        return createViewerStore({
            userId,
            activityId: sessionId,
            versionId: `${sessionId}:${item.seq}`,
            checkService: service,
        });
    }, [userId, sessionId, item.seq, loop, checkMode]);

    // DM-5: the typed answer survives a sign-in round trip (sessionStorage is
    // per tab, and the sign-in returns to this tab).
    useEffect(() => {
        const storage = safeSessionStorage();
        if (!storage || !section) return;
        try {
            store.hydrate(storage.getItem(storageKey));
            // A check queued before the reload has nothing to fire it: the
            // student presses Check again.
            store.dropPendingCheck(section.sectionId);
        } catch {
            // A stale or foreign blob is not worth failing the question over.
        }
        return store.subscribe(() => {
            const phase = store.getState().sections[section.sectionId]?.phase;
            try {
                if (phase === 'checked') storage.removeItem(storageKey);
                else storage.setItem(storageKey, store.serialize());
            } catch {
                // Full or blocked storage: the answer stays on screen.
            }
        });
    }, [store, storageKey, section]);

    const sectionId = section?.sectionId ?? '';
    const status = useSyncExternalStore(
        store.subscribe,
        () => store.getState().sections[sectionId],
        () => store.getState().sections[sectionId],
    );
    const phase = status?.phase ?? 'unchecked';
    const checking = phase === 'checking';
    const failed = phase === 'error' ? status : null;

    // DM-5's quiet line, after 10 s without the server.
    const [slow, setSlow] = useState(false);
    useEffect(() => {
        const timer = window.setInterval(() => {
            const since = loop.failingSince;
            setSlow(since !== null && Date.now() - since >= OFFLINE_NOTICE_MS);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [loop]);

    const questionRef = useRef<HTMLHeadingElement>(null);
    const verdictRef = useRef<HTMLHeadingElement>(null);
    const fire = (action: 'check' | 'skip') => {
        if (!section || checking || result) return;
        lastAction.current = action;
        if (action === 'check' && isSectionUntouched(store.getState(), section.sectionId, section.items)) {
            setNote(NOTHING_ANSWERED);
            return;
        }
        setNote(null);
        // Take focus out of the answer BEFORE it freezes: Chromium fires no
        // blur when a focused input becomes disabled, so the blank's ² ³ tray
        // (which closes on blur) would stay up beside a frozen answer. The
        // question's own heading holds focus until the verdict takes it.
        questionRef.current?.focus();
        skipRef.current = action === 'skip';
        void store.checkSection(section.sectionId, section.items);
    };

    // Focus: the question's own heading when it arrives (Tab then reaches the
    // answer), the verdict when it lands (DM-17).
    useEffect(() => {
        questionRef.current?.focus();
    }, []);
    useEffect(() => {
        if (result) verdictRef.current?.focus();
    }, [result]);

    // A phone keyboard covers the lower half: bring the focused input up.
    const onFocusCapture = (event: FocusEvent) => {
        const target = event.target as HTMLElement;
        if (window.innerWidth >= 640 || !target.matches('input, textarea, math-field, [contenteditable]')) return;
        target.scrollIntoView?.({ block: 'center' });
    };

    return (
        <div className="mx-runner">
            <div className="mx-top">
                <div className="fx-bar mx-bar" aria-hidden="true">
                    <span style={{ width: `${Math.round((tried / Math.max(1, total)) * 100)}%` }} />
                </div>
                {/* Not while a Check is out: its try may still land (P3). */}
                <button type="button" className="mx-stop" disabled={checking} onClick={onStop}>
                    Stop for now
                </button>
            </div>
            <h2 className="fx-sr" tabIndex={-1} ref={questionRef}>
                Question {position} of {total}
            </h2>
            <form
                className="mx-item"
                onFocusCapture={onFocusCapture}
                onSubmit={(event) => {
                    event.preventDefault();
                    fire('check');
                }}
            >
                <ViewerContainer document={doc} store={store} externalCheck />
                {!result ? (
                    <div className="mx-actions">
                        <button type="button" className="mx-skip" disabled={checking} onClick={() => fire('skip')}>
                            Skip
                        </button>
                        <button type="submit" className={BTN_PRIMARY} disabled={checking}>
                            {checking ? 'Checking…' : 'Check'}
                        </button>
                    </div>
                ) : null}
            </form>

            <div aria-live="polite">
                {note ? <p className="mx-note">{note}</p> : null}
                {checking && slow ? (
                    <p className="mx-note">
                        Not connected. Keep this page open; we’ll keep trying.{' '}
                        <button type="button" className="mx-link" onClick={() => loop.poke()}>
                            Try again
                        </button>
                    </p>
                ) : null}
                {failed && !result ? (
                    <FailedLine
                        kind={failed.phase === 'error' ? failed.kind : undefined}
                        message={failed.phase === 'error' ? failed.message : ''}
                        onRetry={() => fire(lastAction.current)}
                        onEnded={onEnded}
                    />
                ) : null}
                {result ? <Feedback result={result} doc={doc} headingRef={verdictRef} /> : null}
            </div>

            {result ? (
                <div className="mx-actions">
                    <button type="button" className={BTN_PRIMARY} onClick={onNext}>
                        Next
                    </button>
                </div>
            ) : null}
        </div>
    );
}

/** A Check the server answered with a failure: the sentence depends on the
 * kind, and a retry is offered only where one can work. */
function FailedLine({
    kind,
    message,
    onRetry,
    onEnded,
}: {
    kind: string | undefined;
    message: string;
    onRetry: () => void;
    onEnded: () => void;
}) {
    if (message === NOTHING_ANSWERED) return <p className="mx-note">{NOTHING_ANSWERED}</p>;
    if (kind === 'unauthenticated') {
        return (
            <p className="mx-note">
                Your sign-in has ended. Your answer is kept.{' '}
                <button
                    type="button"
                    className="mx-link"
                    onClick={() => void signInWithGoogle({ redirectTo: window.location.href, includeDistrictHint: true })}
                >
                    Sign in again
                </button>
            </p>
        );
    }
    if (kind === 'unavailable') {
        return (
            <p className="mx-note">
                This practice has ended.{' '}
                <button type="button" className="mx-link" onClick={onEnded}>
                    See what is next
                </button>
            </p>
        );
    }
    if (kind === 'stale_client') {
        return (
            <p className="mx-note">
                This page is out of date.{' '}
                <button type="button" className="mx-link" onClick={() => window.location.reload()}>
                    Reload
                </button>
            </p>
        );
    }
    return (
        <p className="mx-note">
            That did not check.{' '}
            <button type="button" className="mx-link" onClick={onRetry}>
                Try again
            </button>
        </p>
    );
}

// ---- the feedback panel (DM-10, ruling 2) -----------------------------------------

type InlineNodes = Parameters<typeof InlineContent>[0]['nodes'];

/** Find a multiple-choice block anywhere in a served document. */
function findChoiceBlock(value: unknown, id: string): { choices: { id: string; content: InlineNodes }[] } | null {
    if (Array.isArray(value)) {
        for (const v of value) {
            const hit = findChoiceBlock(v, id);
            if (hit) return hit;
        }
        return null;
    }
    if (value && typeof value === 'object') {
        const o = value as Record<string, unknown>;
        if (o.id === id && o.type === 'multiple_choice' && Array.isArray(o.choices)) {
            return o as unknown as { choices: { id: string; content: InlineNodes }[] };
        }
        for (const v of Object.values(o)) {
            const hit = findChoiceBlock(v, id);
            if (hit) return hit;
        }
    }
    return null;
}

/** The answers in words: each blank's answer with its unit, and the text of
 * each correct choice. A block type with no answer in words (a graph) adds
 * nothing; the working says it instead. */
export function answerPieces(result: PracticeItemResult, doc: unknown): ReactNode[] {
    const pieces: ReactNode[] = [];
    for (const [id, a] of Object.entries(result.answers.blanks)) {
        pieces.push(<span key={`b:${id}`}>{a.unit ? `${a.answer} ${a.unit}` : a.answer}</span>);
    }
    for (const [blockId, ids] of Object.entries(result.answers.choices)) {
        const block = findChoiceBlock(doc, blockId);
        for (const choiceId of ids) {
            const choice = block?.choices.find((c) => c.id === choiceId);
            if (choice && choice.content.length > 0) {
                pieces.push(
                    <span key={`c:${choiceId}`}>
                        <InlineContent nodes={choice.content} />
                    </span>,
                );
            }
        }
    }
    return pieces;
}

function joinPieces(pieces: ReactNode[]): ReactNode {
    return pieces.map((p, i) => (
        <span key={i}>
            {i === 0 ? '' : i === pieces.length - 1 ? ' and ' : ', '}
            {p}
        </span>
    ));
}

function Feedback({
    result,
    doc,
    headingRef,
}: {
    result: PracticeItemResult;
    doc: unknown;
    headingRef: RefObject<HTMLHeadingElement | null>;
}) {
    const pieces = answerPieces(result, doc);
    const answer =
        pieces.length === 0 ? null : (
            <>
                {' '}
                The {pieces.length === 1 ? 'answer is' : 'answers are'} {joinPieces(pieces)}.
            </>
        );
    const working = Object.entries(result.solutions);
    const [open, setOpen] = useState(!result.correct);

    return (
        <div className="mx-feedback" data-verdict={result.correct ? 'right' : result.skipped ? 'skipped' : 'wrong'}>
            <h2 className="mx-verdict" tabIndex={-1} ref={headingRef}>
                {result.correct ? (
                    <>
                        <span aria-hidden="true">✓ </span>Right.
                    </>
                ) : result.skipped ? (
                    <>Skipped.{answer}</>
                ) : (
                    <>
                        <span aria-hidden="true">✕ </span>Not this time.{answer}
                    </>
                )}
            </h2>
            {working.length > 0 ? (
                <>
                    {result.correct ? (
                        <button
                            type="button"
                            className="mx-link"
                            aria-expanded={open}
                            onClick={() => setOpen((o) => !o)}
                        >
                            See the working
                        </button>
                    ) : null}
                    {open ? (
                        <div className="mx-working" data-testid="mx-working">
                            {working.map(([blockId, nodes]) => (
                                <div key={blockId}>
                                    <InlineContent nodes={nodes} />
                                </div>
                            ))}
                        </div>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}
