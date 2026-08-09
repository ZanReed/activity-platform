import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { signOutEverything, watchIdleSignOut } from '../lib/studentAuth';
import { markIdleSignOut, consumeIdleSignOutFlag, signInWithGoogle } from '../lib/auth';
import { useSession } from '../lib/SessionContext';
import { useSlowFlag } from '../lib/slowLoad';
import { listMyClasses, type JoinedClass } from '../lib/classes';
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
  // Consumed once per mount; survives the idle-sign-out redirect (board 1d).
  const [idleSignedOut] = useState(() => consumeIdleSignOutFlag());
  const gateActive = loading || (session !== null && roleStatus === 'loading');
  const slow = useSlowFlag(gateActive);

  const signIn = () => {
    // The shared entry point (P3/E-6): no district hint on Home — teachers
    // sign in here too.
    void signInWithGoogle({ redirectTo: window.location.origin }).then(({ error }) => {
      if (error) console.error('Sign-in failed:', error);
    });
  };

  let body;
  if (loading) {
    body = <NeutralGateCard slow={slow} />;
  } else if (!session) {
    body = callbackError ? (
      // Home is teacher-and-student shared, so the GENERIC frame (P3) — a
      // refused teacher here must not be told to use a student account.
      <SignInFailedCard studentSurface={false} redirectTo={window.location.origin} />
    ) : (
      <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm">
        {idleSignedOut ? (
          <p className="mb-4 rounded-md bg-surface-2 px-3 py-2 text-sm text-muted">
            You were signed out after being away. Your work is saved.
          </p>
        ) : null}
        <h2 className="text-lg font-bold text-ink">Sign in to continue</h2>
        <button type="button" onClick={signIn} className={`mt-4 w-full ${BTN_PRIMARY}`}>
          Sign in with Google
        </button>
      </div>
    );
  } else if (roleStatus === 'loading' || roleStatus === 'idle') {
    // Neutral until the role resolves — never a flash of the wrong shell (E-4).
    body = <NeutralGateCard slow={slow} onRetry={retryRole} />;
  } else if (roleStatus === 'error') {
    body = (
      <div className="rounded-lg border border-line bg-canvas p-6 shadow-sm">
        <p className="text-muted">We couldn&apos;t load your account just now.</p>
        <button type="button" onClick={retryRole} className={`mt-3 ${BTN_SECONDARY}`}>
          Try again
        </button>
      </div>
    );
  } else if (roleStatus === 'empty') {
    // Zero users row (E-11): honest dead-end, never a retry loop.
    body = <AccountUnavailableCard onSignOut={() => void signOut()} />;
  } else if (role === 'student') {
    body = <StudentHome email={session.user.email ?? ''} />;
  } else {
    body = <TeacherHome email={session.user.email ?? ''} />;
  }

  const isStudent = session !== null && role === 'student' && roleStatus === 'ready';

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
        {!isStudent && !loading && session && roleStatus === 'ready' ? (
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

/**
 * The student shell (B12/E-5, board frames 1a/1b): joined classes first,
 * join-another second; the empty state IS the hero. The activity list is
 * deliberately absent until S9 — teachers share activities as links.
 */
function StudentHome({ email }: { email: string }) {
  void email; // identity lives in the topbar (OV#9); param kept for symmetry
  const [state, setState] = useState<ClassesState>({ phase: 'loading' });
  const [idlePrompt, setIdlePrompt] = useState(false);

  const load = useCallback(() => {
    setState({ phase: 'loading' });
    listMyClasses()
      .then((classes) => setState({ phase: 'ready', classes }))
      .catch(() => setState({ phase: 'error' }));
  }, []);

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
          <ul className="mt-2 divide-y divide-line">
            {joined.map((c) => (
              // Inert rows by design in v1 (no class page yet — OV#19): no
              // hover affordance, nothing to click.
              <li key={c.classId} className="py-3">
                <p className="font-medium text-strong">{c.name}</p>
                <p className="text-sm text-muted">
                  Joined{' '}
                  {new Date(c.joinedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Your teacher shares activities as links — open them from wherever your
            teacher posts links.
          </p>
          <h3 className="mt-6 mb-1 text-sm font-semibold text-ink">Join another class</h3>
          <JoinCodeForm inputId="join-code" onJoined={load} />
        </div>
      )}
    </div>
  );
}
