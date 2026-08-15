import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { signOutEverything, watchIdleSignOut } from '../lib/studentAuth';
import { PendingOnboarding } from '../components/PendingOnboarding';
import { SignedOutLanding } from '../components/SignedOutLanding';
import { markIdleSignOut, consumeIdleSignOutFlag } from '../lib/auth';
import { useSession } from '../lib/SessionContext';
import { useSlowFlag } from '../lib/slowLoad';
import { listMyClasses, type JoinedClass } from '../lib/classes';
import {
  formatListDate,
  listClassActivities,
  type StudentClassActivity,
} from '../lib/classActivities';
import {
  AccountUnavailableCard,
  NeutralGateCard,
  SignInFailedCard,
  useAuthCallbackError,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from '../components/AuthScreens';
import { JoinCodeForm } from '../components/JoinCodeForm';

// signOutEverything, not supabase.auth.signOut: shared-device sweep + the
// failed-network session clear (ruling S6-6). Every sign-out control in the
// app calls this — the quiet links below included.
async function signOut() {
  try {
    await signOutEverything();
  } catch (error) {
    console.error('Sign-out failed:', error);
  }
}

export default function Home() {
  const { session, loading, role, roleStatus, retryRole } = useSession();
  const callbackError = useAuthCallbackError();
  // The idle-escalation flag is consumed when the SIGNED-OUT state renders,
  // not at mount: idle sign-out happens while Home is already mounted, so a
  // mount-time read would race the escalation and the banner would never
  // show (caught by the s1:9 e2e row).
  const [idleSignedOut, setIdleSignedOut] = useState(false);
  useEffect(() => {
    if (!loading && !session && consumeIdleSignOutFlag()) setIdleSignedOut(true);
  }, [loading, session]);
  const gateActive = loading || (session !== null && roleStatus === 'loading');
  const slow = useSlowFlag(gateActive);
  // The teacher door's routing hint (R5-DR): it only chooses which view of the
  // onboarding card opens first. Read once, like useAuthCallbackError — and
  // deliberately NOT trusted for anything else: promotion is claim_teacher's
  // job, behind its attestation and its caps.
  const teacherIntent = useMemo(
    () => new URL(window.location.href).searchParams.get('intent') === 'teacher',
    [],
  );

  let body;
  if (loading) {
    body = <NeutralGateCard slow={slow} />;
  } else if (!session) {
    body = callbackError ? (
      // Home is teacher-and-student shared, so the GENERIC frame (P3) — a
      // refused teacher here must not be told to use a student account.
      <SignInFailedCard studentSurface={false} redirectTo={window.location.origin} />
    ) : (
      // The R5-DR pre-auth fork (board Row 0) — the dominant journey. It
      // replaced a lone "Sign in to continue" button, which forced every
      // student through Google before they could say why they were here.
      <SignedOutLanding idleSignedOut={idleSignedOut} />
    );
  } else if (roleStatus === 'loading' || roleStatus === 'idle') {
    // Neutral until the role resolves — never a flash of the wrong shell (E-4).
    body = <NeutralGateCard slow={slow} onRetry={retryRole} />;
  } else if (roleStatus === 'error') {
    body = (
      <div className="rounded-lg border border-line bg-canvas p-6 shadow-sm">
        <p className="text-muted">We couldn&apos;t load your account just now.</p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={retryRole} className={BTN_SECONDARY}>
            Try again
          </button>
          {/* Shared-device escape hatch: a failing role fetch must never
              trap a signed-in session on a cart Chromebook (the S6-6
              guarantee reaches every state Home can be in). */}
          <button type="button" onClick={() => void signOut()} className={BTN_SECONDARY}>
            Sign out
          </button>
        </div>
      </div>
    );
  } else if (roleStatus === 'empty') {
    // Zero users row (E-11): honest dead-end, never a retry loop.
    body = <AccountUnavailableCard onSignOut={() => void signOut()} />;
  } else if (role === 'pending') {
    // 0033 R5-DR safety net: an account admitted with no role yet. A student
    // who used the code door is on /join/<CODE> auto-redeeming and never sees
    // this; a teacher who used the teacher door arrives with ?intent=teacher
    // and opens straight on the attestation card. What is left for this screen
    // is the intent-less arrival (direct OAuth, a stale bookmark).
    body = (
      <PendingOnboarding
        email={session.user.email ?? ''}
        onPromoted={retryRole}
        onSignOut={() => void signOut()}
        initialView={teacherIntent ? 'attest' : 'fork'}
      />
    );
  } else if (role === 'student') {
    body = <StudentHome email={session.user.email ?? ''} />;
  } else {
    body = <TeacherHome email={session.user.email ?? ''} />;
  }

  const isStudent = session !== null && role === 'student' && roleStatus === 'ready';
  const isPending = session !== null && role === 'pending' && roleStatus === 'ready';

  return (
    <main className="min-h-screen bg-surface p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-bold text-ink">Activity Platform</h1>
          {isStudent ? (
            <span className="flex items-baseline gap-3 text-sm text-muted">
              {session.user.email}
              <button
                type="button"
                onClick={() => void signOut()}
                className="px-1.5 py-2.5 underline underline-offset-2 hover:text-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Sign out
              </button>
            </span>
          ) : null}
        </div>
        {!isStudent && !isPending && !loading && session && roleStatus === 'ready' ? (
          <p className="mt-2 text-muted">
            Build interactive activities and share them with your students.
          </p>
        ) : null}
        <div className="mt-8">{body}</div>
      </div>
    </main>
  );
}

function TeacherHome({ email }: { email: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas p-6 shadow-sm">
      <div className="space-y-4">
        <p className="text-strong">
          Signed in as <span className="font-medium">{email}</span>
        </p>
        <div className="flex items-center gap-3">
          <Link to="/activities" className={BTN_PRIMARY}>
            My activities
          </Link>
          <Link to="/classes" className={BTN_SECONDARY}>
            My classes
          </Link>
          <button type="button" onClick={() => void signOut()} className={BTN_SECONDARY}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

type ClassesState =
  | { phase: 'loading' }
  | { phase: 'error' }
  | { phase: 'ready'; classes: JoinedClass[] };

type ActivitiesState =
  | { phase: 'loading' }
  | { phase: 'error' }
  | { phase: 'ready'; rows: StudentClassActivity[] };

/**
 * The student shell (B12/E-5 → S9 Drop 2, board frames 1a/1b + 4a/4b):
 * joined classes with their teacher-added activities nested under each
 * header (the E-5 deferral come due), join-another second; the empty state
 * IS the hero. The activity list is a SEPARATE fetch with its own retry —
 * a failed list never hides classes or the join form (degraded, not broken).
 */
function StudentHome({ email }: { email: string }) {
  void email; // identity lives in the topbar (OV#9); param kept for symmetry
  const [state, setState] = useState<ClassesState>({ phase: 'loading' });
  const [activities, setActivities] = useState<ActivitiesState>({ phase: 'loading' });
  const [idlePrompt, setIdlePrompt] = useState(false);

  const loadActivities = useCallback(() => {
    setActivities({ phase: 'loading' });
    listClassActivities()
      .then((rows) => setActivities({ phase: 'ready', rows }))
      .catch(() => setActivities({ phase: 'error' }));
  }, []);

  const load = useCallback(() => {
    setState({ phase: 'loading' });
    listMyClasses()
      .then((classes) => setState({ phase: 'ready', classes }))
      .catch(() => setState({ phase: 'error' }));
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    load();
  }, [load]);

  // The 2.4A idle wiring (D-10, closes cutover gate C2): prompt after the
  // quiet stretch, escalate to a full sign-out — a live session on a shared
  // Chromebook cart between periods is the threat model. The flag makes the
  // signed-out Home explain what happened (board 1d).
  useEffect(() => {
    const watcher = watchIdleSignOut({
      onPrompt: () => setIdlePrompt(true),
      onDismiss: () => setIdlePrompt(false),
      onEscalate: async () => {
        markIdleSignOut();
        await signOutEverything();
      },
    });
    return () => watcher.stop();
  }, []);

  const joined = state.phase === 'ready' ? state.classes : [];

  if (state.phase === 'loading') {
    return (
      <div className="rounded-lg border border-line bg-canvas p-6 shadow-sm" role="status">
        <p className="text-muted">Loading your classes…</p>
      </div>
    );
  }
  if (state.phase === 'error') {
    return (
      <div className="rounded-lg border border-line bg-canvas p-6 shadow-sm">
        <p className="text-muted">We couldn&apos;t load your classes just now.</p>
        <button type="button" onClick={load} className={`mt-3 ${BTN_SECONDARY}`}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {idlePrompt ? (
        <div className="rounded-lg border border-line bg-canvas p-4 shadow-sm" role="alert">
          <p className="text-sm text-strong">
            Still there? You&apos;ll be signed out soon to keep this device safe.
          </p>
        </div>
      ) : null}
      {joined.length === 0 ? (
        <div className="rounded-lg border border-line bg-canvas px-6 py-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-ink">Join your first class</h2>
          <p className="mx-auto mt-2 max-w-md text-base text-muted">
            Your teacher gave you a 6-character class code. Enter it here, or open the
            join link they shared.
          </p>
          <div className="mt-4">
            <JoinCodeForm inputId="join-code-empty" centered onJoined={load} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-canvas p-6 shadow-sm">
          <h2 className="text-xl font-bold text-ink">Your classes</h2>
          {/* Class headers ALWAYS render (DR-9d — they confirm the join
              worked), even while activities load or fail; the per-class
              empty line is THE empty state. Headers stay non-links: no
              class page exists (ruled, not an oversight). */}
          {joined.map((c) => {
            const rows =
              activities.phase === 'ready'
                ? activities.rows.filter((r) => r.classId === c.classId)
                : [];
            return (
              <div key={c.classId} className="mt-3">
                <h3 className="font-bold text-ink">{c.name}</h3>
                <p className="text-xs text-muted">
                  Joined {formatListDate(c.joinedAt)}
                </p>
                {activities.phase === 'ready' &&
                  (rows.length === 0 ? (
                    <p className="ml-5 py-1.5 text-sm text-muted">
                      Nothing here yet — your teacher hasn&apos;t added activities.
                    </p>
                  ) : (
                    <ul className="mt-1">
                      {rows.map((r) => (
                        <li key={r.activityId}>
                          <Link
                            to={`/a/${r.activityId}`}
                            className="ml-3 flex min-h-[44px] flex-wrap items-center justify-between gap-x-3 rounded-r-md border-l-2 border-line py-1.5 pl-3 pr-2 hover:bg-surface"
                          >
                            <span className="line-clamp-2 min-w-0 text-sm font-medium text-ink underline underline-offset-2">
                              {r.title}
                            </span>
                            <span className="shrink-0 text-xs text-muted">
                              Added {formatListDate(r.addedAt)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
              </div>
            );
          })}
          {/* ONE status line for the whole list, below ALL headers (DR-9e —
              an indented spinner read as "the first class is loading").
              Loading carries its OWN selector, never the ready-state class. */}
          {activities.phase === 'loading' && (
            <p
              className="mt-2 flex items-center gap-2 text-sm text-muted"
              role="status"
              data-list-loading
            >
              <span
                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-ink"
                aria-hidden="true"
              />
              Loading activities…
            </p>
          )}
          {activities.phase === 'error' && (
            <p className="mt-2 text-sm text-muted">
              We couldn&apos;t load activities just now.{' '}
              <button
                type="button"
                onClick={loadActivities}
                className="font-medium text-ink underline underline-offset-2"
              >
                Try again
              </button>
            </p>
          )}
          <h3 className="mt-6 mb-1 text-sm font-semibold text-ink">Join another class</h3>
          <JoinCodeForm inputId="join-code" onJoined={load} />
        </div>
      )}
    </div>
  );
}
