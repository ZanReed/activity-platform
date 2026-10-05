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

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { VIEWER_STORAGE_PREFIX } from '@activity/viewer';
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
import { useSession } from '../lib/SessionContext';
import { useSlowFlag } from '../lib/slowLoad';
import { signOutEverything } from '../lib/studentAuth';
import FactRunner from '../practice/FactRunner';
import { FactSaveQueue, heldKey } from '../practice/saveQueue';

const CARD = 'mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm';
export const WAIT_POLL_MS = 10_000;
export const WAIT_LIMIT_MS = 10 * 60_000;
export const OFFLINE_NOTICE_MS = 10_000;

type Runnable = Extract<EntryState, { state: 'ready' | 'resume' }>;
/** The practice states that have a screen of their own. */
type SprintPractice = Extract<SprintEntry, { state: 'ready' | 'resume' | 'nothing_due' }>;

type View =
    | { kind: 'loading' }
    | { kind: 'failed' }
    /** `sprint` is set when no check is open and the class's practice is on. */
    | { kind: 'entry'; entry: EntryState; sprint?: SprintPractice }
    | { kind: 'sprintClosed'; saved: number }
    | { kind: 'joining' }
    | { kind: 'joinFailed'; copy: string }
    | { kind: 'closed'; saved: number };

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className={CARD}>
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            {children}
        </div>
    );
}

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
    const [starting, setStarting] = useState(false);
    const activeRef = useRef(false);
    activeRef.current = active !== null || sprintRun !== null;

    // ---- the entry read ---------------------------------------------------------
    const enter = useCallback(async () => {
        if (activeRef.current) return null;
        try {
            const entry = await fetchEntry(code);
            // No check to do: is the class's daily practice on? (A database
            // without it, or any failure, reads as "off": the check's own
            // screens are still right.)
            let sprint: SprintPractice | undefined;
            if (entry.state === 'none_open' || entry.state === 'finished' || entry.state === 'closed') {
                try {
                    const s = await fetchSprintEntry(code);
                    if (s.state === 'ready' || s.state === 'resume' || s.state === 'nothing_due') sprint = s;
                } catch {
                    sprint = undefined;
                }
            }
            if (!activeRef.current) setView({ kind: 'entry', entry, ...(sprint ? { sprint } : {}) });
            return entry;
        } catch {
            if (!activeRef.current) setView({ kind: 'failed' });
            return null;
        }
    }, [code]);

    useEffect(() => {
        if (!userId || !roleReady || activeRef.current) return;
        setView({ kind: 'loading' });
        void enter();
        // Keyed on the USER and the code — never on the session object, whose
        // identity can change under a student who is answering.
    }, [userId, roleReady, enter]);

    // ---- the waiting room (DR-15) -----------------------------------------------
    const waiting = view.kind === 'entry' && view.entry.state === 'none_open' && !view.sprint;
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

    // ---- screens ---------------------------------------------------------------
    let body: ReactNode;
    if (sprintRun && userId) {
        body = (
            <SprintRun
                key={sprintRun.session_id}
                session={sprintRun}
                userId={userId}
                onClosed={(saved) => {
                    setSprintRun(null);
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
