// =============================================================================
// FactsEntry.tsx — /facts/:code, the student's ONE link (D43 slice 1; DR-1)
// -----------------------------------------------------------------------------
// The teacher shares `/facts/CODE`, where CODE is the class JOIN CODE — a link a
// student can type from the board. One link takes a student from sign-in,
// through joining, to the first fact. Opening it calls ONE entry RPC, which
// returns a named state; each state has its own screen, shown BEFORE the runner
// starts (ER-15, DR-15, DR-16):
//
//   signed out   the route's own gate (the /join/:code shape)
//   teacher      "This link is for students", with a way into the demo
//   not_member   "Join this class first" → joins (a pending account is
//                promoted and joined in one step), then re-enters
//   none_open    a WAITING ROOM: re-checks every 10 s for 10 minutes, then
//                "Check now". It shows the intro when a check opens and never
//                starts by itself.
//   ready        the intro, then the warm-up, then the facts
//   resume       "Welcome back. You have done 15 of 30."
//   finished     the done screen, from the server's own counts
//   closed       "Your teacher has finished this. Your 15 answers were saved."
//
// THE DAILY PRACTICE (D43 slice 2, SP-1) lives at the same link. A check comes
// first: only when no check is open for this student (none_open, finished or
// closed) is the practice asked about, with ONE more RPC. If the class has it
// switched on, its screens replace the check's resting ones:
//
//   practice ready     what it is, about how long, and Start (which is what
//                      creates the session — asking never does)
//   practice resume    "Welcome back" for today's unfinished session
//   nothing to do      "Nothing to practise right now"
//
// MIXED PRACTICE (D43 mixed practice slice 3, DM-1) lives here too, read beside
// the number facts: the class behind the code, then start_mixed_session's
// PREVIEW (it writes nothing). When both are on, a chooser comes first
// ("Number facts · about 5 min" / "Practice · about 6–9 min"); when one is on
// the link goes straight there. /practice/:code is the same page. Its screens:
//
//   ready              the start card (DM-12 as amended by C-146), then Start
//   resume             "You stopped at question 4 of 6": Carry on / Finish here
//   nothing_taught     "Nothing to practise yet. …" (DM-4)
//   nothing_due        "Nothing to practise today. …"
//   done_today         "You've done today's practice." (DM-7)
//
// The runner itself (practice/MixedRunner.tsx) is a LAZY chunk of its own.
//
// SAVING (G1, ER-19, DR-14) is silent: one queue (practice/saveQueue.ts) saves
// after every item and when the page is hidden. One quiet line appears under
// the keypad after 10 s of failure; a retry state appears only on the done
// screen. A save refused because the check closed goes straight to `closed`.
//
// ⚠ Once the runner is on screen NOTHING here re-fetches or rebuilds it (the
// author's no-reload rule): the entry is read again only from a card or the
// waiting room, never under a student who is answering. Effects key on the
// user id, never on the session object.
// =============================================================================

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { VIEWER_STORAGE_PREFIX, type PracticeSession } from '@activity/viewer';
import {
    AccountUnavailableCard,
    BTN_PRIMARY,
    NeutralGateCard,
    SignInFailedCard,
    useAuthCallbackError,
} from '../components/AuthScreens';
import { normalizeJoinCodeInput } from '../components/JoinCodeForm';
import { signInWithGoogle } from '../lib/auth';
import { classifyRedeemError, REDEEM_ERROR_COPY } from '../lib/authMessages';
import { joinClass, redeemJoinCode } from '../lib/classes';
import { fetchEntry, saveAttempts, type EntryState } from '../lib/factProbe';
import {
    fetchSprintEntry,
    saveSprintAttempts,
    type SprintEntry,
    type SprintSaveResult,
    type SprintSession,
} from '../lib/factSprint';
import {
    finishMixed,
    lookupPracticeClass,
    practiceMinutes,
    previewMixed,
    startMixed,
    type MixedPreview,
} from '../lib/mixedPractice';
import { useSession } from '../lib/SessionContext';
import { useSlowFlag } from '../lib/slowLoad';
import { signOutEverything } from '../lib/studentAuth';
import FactRunner from '../practice/FactRunner';
import MixedDone, { type MixedTally } from '../practice/MixedDone';
import { CARD, Card } from '../practice/PracticeCard';
import { FactSaveQueue, heldKey } from '../practice/saveQueue';

// Its own chunk: only a student who presses Start or Carry on loads it.
const MixedRunner = lazy(() => import('../practice/MixedRunner'));

export const WAIT_POLL_MS = 10_000;
export const WAIT_LIMIT_MS = 10 * 60_000;
export const OFFLINE_NOTICE_MS = 10_000;

type Runnable = Extract<EntryState, { state: 'ready' | 'resume' }>;
/** The practice states that have a screen of their own. */
type SprintPractice = Extract<SprintEntry, { state: 'ready' | 'resume' | 'nothing_due' }>;
/** Mixed practice, when the class has it on: its class and the preview. */
interface MixedEntry {
    classId: string;
    preview: Exclude<MixedPreview, { state: 'off' }>;
}

type View =
    | { kind: 'loading' }
    | { kind: 'failed' }
    /** `sprint` is set when no check is open and the class's practice is on. */
    | { kind: 'entry'; entry: EntryState; sprint?: SprintPractice; mixed?: MixedEntry }
    | { kind: 'sprintClosed'; saved: number }
    | { kind: 'joining' }
    | { kind: 'joinFailed'; copy: string }
    | { kind: 'closed'; saved: number }
    /** Finish here (DM-6): the server's counts for the session just closed. */
    | { kind: 'mixedFinished'; tally: MixedTally; graded: boolean; classId: string };

export default function FactsEntry() {
    const { code: rawCode } = useParams();
    const code = normalizeJoinCodeInput(rawCode ?? '');
    const { session, loading, role, roleStatus, retryRole } = useSession();
    const callbackError = useAuthCallbackError();
    const userId = session?.user.id ?? null;
    const roleReady = roleStatus === 'ready';
    const [view, setView] = useState<View>({ kind: 'loading' });
    const slow = useSlowFlag(view.kind === 'loading' || view.kind === 'joining');

    // A run on screen is NEVER torn down by anything but the student's own
    // sign-out: not a role re-read, not a second entry read (the no-reload
    // rule). `active` is the run this page is showing, if any.
    const active: Runnable | null =
        view.kind === 'entry' && (view.entry.state === 'ready' || view.entry.state === 'resume')
            ? view.entry
            : null;
    // The practice session on screen, if any: the same rule.
    const [sprintRun, setSprintRun] = useState<SprintSession | null>(null);
    // A mixed practice on screen: the same rule.
    const [mixedRun, setMixedRun] = useState<{ session: PracticeSession; classId: string } | null>(null);
    // DM-1: which practice the chooser picked, when both are on.
    const [choice, setChoice] = useState<'facts' | 'practice' | null>(null);
    const [starting, setStarting] = useState(false);
    const activeRef = useRef(false);
    activeRef.current = active !== null || sprintRun !== null || mixedRun !== null;

    // ---- the entry read ---------------------------------------------------------
    // The last entry state seen. When it was one that leads to the practice
    // read (the waiting room's polls, a re-entry after a check), the two reads
    // run side by side instead of one after the other (efficiency audit #13).
    // The FIRST read stays sequential, so a day with a check open costs one
    // request, not two. fact_sprint_entry without p_start has no side effects.
    const lastStateRef = useRef<string | null>(null);
    const enter = useCallback(async () => {
        if (activeRef.current) return null;
        const leadsToSprint = (state: string) =>
            state === 'none_open' || state === 'finished' || state === 'closed';
        const sprintRead = () =>
            fetchSprintEntry(code).then(
                (s): SprintPractice | undefined =>
                    s.state === 'ready' || s.state === 'resume' || s.state === 'nothing_due' ? s : undefined,
                // A database without it, or any failure, reads as "off": the
                // check's own screens are still right.
                () => undefined,
            );
        // Mixed practice: the class behind the code, then the preview. Off, or
        // any failure, reads as "not on" (the sprint's posture above).
        const mixedRead = async (): Promise<MixedEntry | undefined> => {
            try {
                const cls = await lookupPracticeClass(code);
                if (!cls?.mixedOn) return undefined;
                const preview = await previewMixed(cls.id);
                return preview.state === 'off' ? undefined : { classId: cls.id, preview };
            } catch {
                return undefined;
            }
        };
        const bothReads = () => Promise.all([sprintRead(), mixedRead()]);
        try {
            let entry: Awaited<ReturnType<typeof fetchEntry>>;
            let sprint: SprintPractice | undefined;
            let mixed: MixedEntry | undefined;
            if (lastStateRef.current !== null && leadsToSprint(lastStateRef.current)) {
                const [e, [s, m]] = await Promise.all([fetchEntry(code), bothReads()]);
                entry = e;
                [sprint, mixed] = leadsToSprint(e.state) ? [s, m] : [undefined, undefined];
            } else {
                entry = await fetchEntry(code);
                // No check to do: is either practice on?
                [sprint, mixed] = leadsToSprint(entry.state) ? await bothReads() : [undefined, undefined];
            }
            lastStateRef.current = entry.state;
            if (!activeRef.current) {
                setView({ kind: 'entry', entry, ...(sprint ? { sprint } : {}), ...(mixed ? { mixed } : {}) });
            }
            return entry;
        } catch {
            if (!activeRef.current) setView({ kind: 'failed' });
            return null;
        }
    }, [code]);

    useEffect(() => {
        if (!userId || !roleReady || activeRef.current) return;
        setView({ kind: 'loading' });
        lastStateRef.current = null; // a new user or code: the first read is sequential
        void enter();
        // Keyed on the USER and the code — never on the session object, whose
        // identity can change under a student who is answering.
    }, [userId, roleReady, enter]);

    // ---- the waiting room (DR-15) -----------------------------------------------
    const waiting = view.kind === 'entry' && view.entry.state === 'none_open' && !view.sprint && !view.mixed;
    const [waitExpired, setWaitExpired] = useState(false);
    useEffect(() => {
        if (!waiting) return;
        setWaitExpired(false);
        const started = Date.now();
        const timer = window.setInterval(() => {
            if (Date.now() - started >= WAIT_LIMIT_MS) {
                window.clearInterval(timer);
                setWaitExpired(true);
                return;
            }
            if (document.visibilityState === 'visible') void enter();
        }, WAIT_POLL_MS);
        return () => window.clearInterval(timer);
    }, [waiting, enter]);

    // ---- joining ---------------------------------------------------------------
    const join = async () => {
        setView({ kind: 'joining' });
        try {
            // A pending account REDEEMS (promote + join); a student joins.
            await (role === 'pending' ? redeemJoinCode(code) : joinClass(code));
            if (role === 'pending') retryRole();
            await enter();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setView({ kind: 'joinFailed', copy: REDEEM_ERROR_COPY[classifyRedeemError(message)] });
        }
    };

    // ---- starting the practice (the student's Start) ------------------------------
    const startSprint = async () => {
        setStarting(true);
        try {
            const s = await fetchSprintEntry(code, true);
            if ((s.state === 'ready' || s.state === 'resume') && s.session) setSprintRun(s.session);
            else await enter();
        } catch {
            setView({ kind: 'failed' });
        } finally {
            setStarting(false);
        }
    };

    // ---- mixed practice: Start / Carry on / Finish here ----------------------------
    // Leave a practice run for the resting screens. `activeRef` is written
    // during render, so it is cleared HERE too: otherwise the entry read that
    // follows sees the run still "on screen" and returns without reading
    // (Fable review 2026-10-23, P1). The chooser is offered again (P2).
    const leaveRun = () => {
        setMixedRun(null);
        setChoice(null);
        activeRef.current = active !== null || sprintRun !== null;
    };
    const startPractice = async (classId: string) => {
        setStarting(true);
        try {
            const r = await startMixed(classId);
            if ((r.state === 'started' || r.state === 'resume') && r.session) {
                setMixedRun({ session: r.session, classId });
            } else {
                leaveRun();
                setView({ kind: 'loading' });
                await enter();
            }
        } catch {
            // From the runner's done screen (Practise again) too: a failure
            // must show, never leave the done screen up as if nothing happened.
            leaveRun();
            setView({ kind: 'failed' });
        } finally {
            setStarting(false);
        }
    };
    const finishPractice = async (classId: string, sessionId: string) => {
        setStarting(true);
        try {
            const f = await finishMixed(sessionId);
            setView({
                kind: 'mixedFinished',
                classId,
                graded: f.graded,
                tally: { of: f.planned, right: f.right, answered: f.answered, skipped: f.skipped },
            });
        } catch {
            setView({ kind: 'failed' });
        } finally {
            setStarting(false);
        }
    };
    const reenter = () => {
        leaveRun();
        setView({ kind: 'loading' });
        void enter();
    };

    // ---- screens ---------------------------------------------------------------
    let body: ReactNode;
    if (mixedRun && userId) {
        body = (
            <Suspense fallback={<div className={CARD} role="status"><p className="text-muted">Getting things ready…</p></div>}>
                <MixedRunner
                    key={mixedRun.session.sessionId}
                    session={mixedRun.session}
                    userId={userId}
                    classId={mixedRun.classId}
                    onAgain={() => void startPractice(mixedRun.classId)}
                    onEnded={reenter}
                />
            </Suspense>
        );
    } else if (sprintRun && userId) {
        body = (
            <SprintRun
                key={sprintRun.session_id}
                session={sprintRun}
                userId={userId}
                onClosed={(saved) => {
                    setSprintRun(null);
                    setChoice(null);
                    setView({ kind: 'sprintClosed', saved });
                }}
            />
        );
    } else if (active && userId) {
        // Before every gate below: see `active`.
        body = (
            <Run
                key={active.probe_id}
                entry={active}
                userId={userId}
                onClosed={(saved) => setView({ kind: 'closed', saved })}
            />
        );
    } else if (loading || (session && (roleStatus === 'loading' || roleStatus === 'idle'))) {
        body = <NeutralGateCard slow={slow} onRetry={session ? retryRole : undefined} />;
    } else if (!session) {
        body = callbackError ? (
            <SignInFailedCard studentSurface redirectTo={window.location.href} />
        ) : (
            <Card title="Quick number facts">
                <p className="mt-2 text-base text-muted">
                    Sign in with your school Google account to start.
                </p>
                <button
                    type="button"
                    className={`mt-4 w-full ${BTN_PRIMARY}`}
                    onClick={() => {
                        // redirectTo = THIS url, so the code survives the
                        // sign-in round trip (the allowlist is an origin
                        // wildcard; /facts/* needs no dashboard change).
                        void signInWithGoogle({
                            redirectTo: window.location.href,
                            includeDistrictHint: true,
                        });
                    }}
                >
                    Sign in with Google
                </button>
            </Card>
        );
    } else if (roleStatus === 'error') {
        body = <NeutralGateCard slow onRetry={retryRole} />;
    } else if (roleStatus === 'empty') {
        body = (
            <AccountUnavailableCard
                onSignOut={() => {
                    void signOutEverything().catch((e) => console.error('Sign-out failed:', e));
                }}
            />
        );
    } else if (view.kind === 'loading' || view.kind === 'joining') {
        body = (
            <div className={CARD} role="status" aria-live="polite">
                <p className="text-muted">Getting things ready…</p>
                {slow ? (
                    <>
                        <p className="mt-2 text-sm text-muted">This is taking longer than usual.</p>
                        <button type="button" className={`mt-3 ${BTN_PRIMARY}`} onClick={() => void enter()}>
                            Retry
                        </button>
                    </>
                ) : null}
            </div>
        );
    } else if (view.kind === 'failed') {
        body = (
            <Card title="That did not load">
                <p role="alert" className="mt-2 text-base text-muted">
                    Check your connection, then try again.
                </p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => { setView({ kind: 'loading' }); void enter(); }}>
                    Try again
                </button>
            </Card>
        );
    } else if (view.kind === 'joinFailed') {
        body = (
            <Card title="Could not join">
                <p role="alert" className="mt-2 text-base text-strong">{view.copy}</p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => void join()}>
                    Try again
                </button>
            </Card>
        );
    } else if (view.kind === 'closed') {
        body = <ClosedCard saved={view.saved} />;
    } else if (view.kind === 'mixedFinished') {
        body = (
            <MixedDone
                kind="finished"
                tally={view.tally}
                graded={view.graded}
                classId={view.classId}
                onAgain={() => void startPractice(view.classId)}
            />
        );
    } else if (view.kind === 'sprintClosed') {
        body = (
            <Card title="That session has ended">
                <p className="mt-2 text-base text-muted">
                    Your {view.saved} answer{view.saved === 1 ? ' was' : 's were'} saved.
                </p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => { setView({ kind: 'loading' }); void enter(); }}>
                    See what is next
                </button>
            </Card>
        );
    } else if (view.mixed && view.sprint && choice === null) {
        // DM-1: both on, so the student chooses. Each line says about how long.
        const sprint = view.sprint;
        const planned = view.mixed.preview.planned;
        body = (
            <Card title="Practice">
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => setChoice('facts')} autoFocus>
                    Number facts · about {sprint.state === 'ready' ? (sprint.minutes ?? 5) : 5} min
                </button>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => setChoice('practice')}>
                    Practice{planned > 0 ? ` · about ${practiceMinutes(planned)} min` : ''}
                </button>
            </Card>
        );
    } else if (view.mixed && (!view.sprint || choice === 'practice')) {
        body = (
            <MixedEntryCard
                mixed={view.mixed}
                starting={starting}
                onStart={() => void startPractice(view.mixed!.classId)}
                onFinish={(sessionId) => void finishPractice(view.mixed!.classId, sessionId)}
            />
        );
    } else if (view.sprint) {
        const sprint = view.sprint;
        if (sprint.state === 'nothing_due') {
            body = (
                <Card title="Nothing to practise right now">
                    <p className="mt-2 text-base text-muted">
                        {sprint.done_today > 0
                            ? 'You have done today’s number facts practice. Come back tomorrow.'
                            : 'There are no number facts for you to practise today.'}
                    </p>
                    <Link to="/" className={`mt-4 inline-block w-full ${BTN_PRIMARY}`}>
                        Go to your classes
                    </Link>
                </Card>
            );
        } else if (sprint.state === 'resume') {
            body = (
                <Card title="Welcome back">
                    <p className="mt-2 text-base text-muted">
                        You started today’s number facts practice. Your answers so far are saved.
                    </p>
                    <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => setSprintRun(sprint.session)} autoFocus>
                        Keep going
                    </button>
                </Card>
            );
        } else {
            body = (
                <Card title="Number facts practice">
                    <p className="mt-2 text-base text-strong">
                        {sprint.done_today > 0 ? 'You can practise again. ' : ''}
                        About {sprint.minutes ?? 5} minutes, or less if you finish first.
                    </p>
                    <p className="mt-2 text-base text-muted">
                        These are the facts you are still learning, and a few to keep fresh. It is
                        not marked. If you miss one you will see the answer, and it will come up
                        again.
                    </p>
                    <p className="mt-2 text-base text-muted">
                        You can type on your keyboard or tap the number keys on the screen. Stick
                        with the one you start with.
                    </p>
                    <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} disabled={starting} onClick={() => void startSprint()}>
                        {starting ? 'Starting…' : 'Start'}
                    </button>
                </Card>
            );
        }
    } else {
        const entry = view.entry;
        if (entry.state === 'teacher') {
            body = (
                <Card title="This link is for students">
                    <p className="mt-2 text-base text-muted">
                        You are signed in as a teacher. Students open this link to do the number
                        facts. You can try it yourself in the demo.
                    </p>
                    <Link to="/facts/demo" className={`mt-4 inline-block ${BTN_PRIMARY}`}>
                        Try the demo
                    </Link>
                </Card>
            );
        } else if (entry.state === 'not_member') {
            body = (
                <Card title="Join this class first">
                    <p className="mt-2">
                        <span className="rounded border border-line bg-surface-2 px-2 py-0.5 font-mono text-base tracking-[0.15em]">
                            {code}
                        </span>
                    </p>
                    <p className="mt-2 text-base text-muted">
                        Check the code matches the one on the board.
                    </p>
                    <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => void join()}>
                        Join the class and start
                    </button>
                </Card>
            );
        } else if (entry.state === 'none_open') {
            body = (
                <Card title="Nothing to do yet">
                    <p className="mt-2 text-base text-muted" role="status">
                        Your teacher has not started this yet.{' '}
                        {waitExpired ? 'Press the button to check again.' : 'This page checks again by itself.'}
                    </p>
                    {waitExpired ? (
                        <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => void enter()}>
                            Check now
                        </button>
                    ) : null}
                </Card>
            );
        } else if (entry.state === 'closed') {
            body = <ClosedCard saved={entry.saved} />;
        } else if (entry.state === 'finished') {
            body = (
                <Card title="All done">
                    <p className="mt-2 text-base text-strong">
                        You got {entry.counts.right} right.
                        {entry.counts.skipped > 0 ? ` You skipped ${entry.counts.skipped}.` : ''}
                    </p>
                    {entry.counts.not_counted > 0 ? (
                        <p className="mt-2 text-base text-muted">
                            {entry.counts.not_counted} {entry.counts.not_counted === 1 ? 'was' : 'were'}{' '}
                            not counted because you left the page.
                        </p>
                    ) : null}
                    <p className="mt-2 text-base text-muted">Your answers are saved. This is not marked.</p>
                    <Link to="/" className={`mt-4 inline-block w-full ${BTN_PRIMARY}`}>
                        Go to your classes
                    </Link>
                </Card>
            );
        } else {
            // ready or resume is `active` and was handled first; the runner
            // shows its own intro (or Welcome-back card), so nothing starts
            // by itself.
            body = null;
        }
    }

    return <main className="fx-stage">{body}</main>;
}

/** Mixed practice's resting screens (DM-4, DM-6, DM-12 as amended by C-146).
 * The words never say "mixed", "session", "due" or "planned" (DM-13). */
function MixedEntryCard({
    mixed,
    starting,
    onStart,
    onFinish,
}: {
    mixed: MixedEntry;
    starting: boolean;
    onStart: () => void;
    onFinish: (sessionId: string) => void;
}) {
    const p = mixed.preview;
    const home = (
        <Link to="/" className={`mt-4 inline-block w-full ${BTN_PRIMARY}`}>
            Go to your classes
        </Link>
    );
    if (p.state === 'nothing_taught') {
        return (
            <Card title="Nothing to practise yet">
                <p className="mt-2 text-base text-muted">
                    It starts the day after you check your first activity.
                </p>
                {home}
            </Card>
        );
    }
    if (p.state === 'nothing_due') {
        return (
            <Card title="Nothing to practise today">
                <p className="mt-2 text-base text-muted">Come back next lesson.</p>
                {home}
            </Card>
        );
    }
    if (p.state === 'done_today') {
        return (
            <Card title="You’ve done today’s practice">
                <p className="mt-2 text-base text-muted">That’s everything for today.</p>
                {home}
            </Card>
        );
    }
    if (p.state === 'resume') {
        return (
            <Card title="Welcome back">
                <p className="mt-2 text-base text-strong">
                    You stopped at question {p.nextSeq ?? 1} of {p.planned}.
                </p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} disabled={starting} onClick={onStart} autoFocus>
                    {starting ? 'Starting…' : 'Carry on'}
                </button>
                {p.sessionId ? (
                    <button
                        type="button"
                        className="mt-2 min-h-11 text-sm font-medium text-strong underline"
                        disabled={starting}
                        onClick={() => onFinish(p.sessionId!)}
                    >
                        Finish here
                    </button>
                ) : null}
            </Card>
        );
    }
    // ready (the first today, or DM-7's again)
    return (
        <Card title="Practice">
            <p className="mt-2 text-base text-strong">
                {p.planned} question{p.planned === 1 ? '' : 's'} · about {practiceMinutes(p.planned)} minutes.
            </p>
            <p className="mt-2 text-base text-muted">
                One try each. Have a go even if you’re unsure. A wrong try still helps you remember.
                You can see the working after every answer.
            </p>
            {p.graded ? (
                <p className="mt-2 text-base text-strong">Your teacher is recording a practice score today.</p>
            ) : null}
            <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} disabled={starting} onClick={onStart} autoFocus>
                {starting ? 'Starting…' : 'Start'}
            </button>
        </Card>
    );
}

function ClosedCard({ saved }: { saved: number }) {
    return (
        <Card title="Your teacher has finished this">
            <p className="mt-2 text-base text-muted">
                Your {saved} answer{saved === 1 ? ' was' : 's were'} saved.
            </p>
            <Link to="/" className={`mt-4 inline-block w-full ${BTN_PRIMARY}`}>
                Go to your classes
            </Link>
        </Card>
    );
}

// ---- a practice session, with its save queue --------------------------------------

function SprintRun({
    session,
    userId,
    onClosed,
}: {
    session: SprintSession;
    userId: string;
    onClosed: (saved: number) => void;
}) {
    const navigate = useNavigate();
    const [, rerender] = useState(0);
    const last = useRef<SprintSaveResult | null>(null);
    const closedRef = useRef(onClosed);
    closedRef.current = onClosed;

    const queue = useMemo(() => {
        let storage: Storage | null = null;
        try {
            storage = window.sessionStorage;
        } catch {
            storage = null;
        }
        return new FactSaveQueue({
            storage,
            storageKey: heldKey(VIEWER_STORAGE_PREFIX, userId, session.session_id),
            port: async (attempts, options) => {
                const outcome = await saveSprintAttempts(session.session_id, attempts, options);
                last.current = outcome;
                return outcome;
            },
            onClosed: () => closedRef.current(last.current?.saved ?? session.saved.length),
            onChange: () => rerender((n) => n + 1),
        });
    }, [session, userId]);

    useEffect(() => {
        void queue.flush();
        const onHidden = () => {
            if (document.visibilityState === 'hidden') void queue.flush();
        };
        document.addEventListener('visibilitychange', onHidden);
        return () => document.removeEventListener('visibilitychange', onHidden);
    }, [queue]);

    const [offline, setOffline] = useState(false);
    useEffect(() => {
        const timer = window.setInterval(() => {
            const since = queue.failingSince;
            setOffline(since !== null && Date.now() - since >= OFFLINE_NOTICE_MS);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [queue]);

    // SP-14: the count and the best are the SERVER's, from the finishing save.
    const result = queue.settled ? last.current : null;
    const quick = result?.quick_right ?? null;
    const isBest = quick !== null && quick > 0 && quick > (result?.best_before ?? -1);
    const pending = queue.pending;
    const doneHeadline =
        quick !== null ? (
            <>
                <p className="mt-2 text-base text-strong" data-testid="fx-quick-right">
                    Quick and right today: {quick}
                </p>
                {isBest ? <p className="mt-1 text-base text-strong">Your best so far.</p> : null}
            </>
        ) : queue.status === 'failing' || queue.status === 'refused' ? (
            <div className="mt-2">
                <p role="alert" className="text-base text-strong">
                    We could not save your last {pending === 1 ? 'answer' : `${pending} answers`}. Keep
                    this page open and we will keep trying.
                </p>
                <button type="button" className="mt-2 text-sm font-medium text-strong underline" onClick={() => void queue.flush()}>
                    Try now
                </button>
            </div>
        ) : (
            <p className="mt-2 text-base text-muted" role="status">
                Saving your last answers…
            </p>
        );

    return (
        <FactRunner
            items={session.items}
            ceilingS={session.ceiling_s}
            sprint={{
                boxMs: session.minutes * 60_000,
                reaskGap: session.reask_gap,
                families: session.families,
                saved: session.saved,
                baselines: session.baselines,
            }}
            onAttempt={(attempt, baselines) => queue.enqueue(attempt, baselines)}
            onDone={() => queue.finish()}
            notice={offline ? 'Not connected. Keep going; your answers are kept on this device.' : null}
            savedLine=""
            doneHeadline={doneHeadline}
            doneSlot={<p className="mt-2 text-base text-muted">This is not marked.</p>}
            doneAction={{ label: 'Go to your classes', onClick: () => navigate('/') }}
        />
    );
}

// ---- a run, with its save queue ------------------------------------------------

function Run({
    entry,
    userId,
    onClosed,
}: {
    entry: Runnable;
    userId: string;
    onClosed: (saved: number) => void;
}) {
    const navigate = useNavigate();
    const [, rerender] = useState(0);
    const savedSoFar = useRef(entry.saved);
    const closedRef = useRef(onClosed);
    closedRef.current = onClosed;

    const queue = useMemo(() => {
        let storage: Storage | null = null;
        try {
            storage = window.sessionStorage;
        } catch {
            storage = null;
        }
        return new FactSaveQueue({
            storage,
            storageKey: heldKey(VIEWER_STORAGE_PREFIX, userId, entry.probe_id),
            port: async (attempts, options) => {
                const outcome = await saveAttempts(entry.probe_id, attempts, options);
                savedSoFar.current = outcome.saved;
                return outcome;
            },
            onClosed: () => closedRef.current(savedSoFar.current),
            onChange: () => rerender((n) => n + 1),
        });
        // One queue per run: the probe and the student never change under it.
    }, [entry.probe_id, userId]);

    // Anything held from before a reload goes out at once; and the page being
    // hidden is a save point (ER-19).
    useEffect(() => {
        void queue.flush();
        const onHidden = () => {
            if (document.visibilityState === 'hidden') void queue.flush();
        };
        document.addEventListener('visibilitychange', onHidden);
        return () => document.removeEventListener('visibilitychange', onHidden);
    }, [queue]);

    // One quiet line after 10 s of failing saves (DR-14).
    const [offline, setOffline] = useState(false);
    useEffect(() => {
        const timer = window.setInterval(() => {
            const since = queue.failingSince;
            setOffline(since !== null && Date.now() - since >= OFFLINE_NOTICE_MS);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [queue]);

    const pending = queue.pending;
    const doneSlot = queue.settled ? (
        <p className="mt-2 text-base text-muted">Your answers are saved. This is not marked.</p>
    ) : queue.status === 'failing' || queue.status === 'refused' ? (
        <div className="mt-2">
            <p role="alert" className="text-base text-strong">
                We could not save your last {pending === 1 ? 'answer' : `${pending} answers`}. Keep this
                page open and we will keep trying.
            </p>
            <button type="button" className="mt-2 text-sm font-medium text-strong underline" onClick={() => void queue.flush()}>
                Try now
            </button>
        </div>
    ) : (
        <p className="mt-2 text-base text-muted" role="status">
            Saving your last answers…
        </p>
    );

    return (
        <FactRunner
            items={entry.items}
            ceilingS={entry.ceiling_s}
            {...(entry.state === 'resume'
                ? {
                      resume: {
                          saved: entry.saved,
                          nextN: entry.next_n,
                          baselines: entry.baselines,
                          counts: entry.counts,
                      },
                  }
                : {})}
            onAttempt={(attempt, baselines) => queue.enqueue(attempt, baselines)}
            onDone={() => queue.finish()}
            notice={offline ? 'Not connected. Keep going; your answers are kept on this device.' : null}
            savedLine="Your answers are saved. This is not marked."
            doneSlot={doneSlot}
            doneAction={{ label: 'Go to your classes', onClick: () => navigate('/') }}
        />
    );
}
