/**
 * /join/:code — the shareable join deep link (B12/E-9, design board frames
 * 2a/2b/2c + 3). Signed-out: the viewer-gate composition with the code
 * echoed (the class NAME is unknowable pre-auth — RLS; S9's meta endpoint is
 * the recorded fix). Student: auto-join AFTER the role resolves (E-4 gate),
 * then the success card with the quiet undo line (P2). Teacher: the
 * explanatory screen — never a raw join_class error (E-9).
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useSession } from '../lib/SessionContext';
import { useSlowFlag } from '../lib/slowLoad';
import { signInWithGoogle } from '../lib/auth';
import { signOutEverything } from '../lib/studentAuth';
import { joinClass, redeemJoinCode, type JoinedClass } from '../lib/classes';
import { fetchClassMeta, type ClassMetaResult } from '../lib/classActivities';
import { classifyRedeemError, LANDING_COPY, REDEEM_ERROR_COPY } from '../lib/authMessages';
import { normalizeJoinCodeInput } from '../components/JoinCodeForm';
import {
  AccountUnavailableCard,
  NeutralGateCard,
  SignInFailedCard,
  useAuthCallbackError,
  BTN_PRIMARY,
} from '../components/AuthScreens';

type JoinPhase =
  | { phase: 'joining' }
  | { phase: 'joined'; joined: JoinedClass }
  | { phase: 'failed'; copy: string };

export default function JoinClass() {
  const { code: rawCode } = useParams();
  const code = normalizeJoinCodeInput(rawCode ?? '');
  const { session, loading, role, roleStatus, retryRole } = useSession();
  const callbackError = useAuthCallbackError();
  const navigate = useNavigate();
  const [join, setJoin] = useState<JoinPhase>({ phase: 'joining' });
  const attemptedFor = useRef<string | null>(null);
  const isStudent = session !== null && roleStatus === 'ready' && role === 'student';
  // 0033 R2/R5-DR: a PENDING account arriving with a code auto-redeems, which
  // promotes and joins in one audited call. This is the flow's dominant path
  // under self-serve admission — a stranger clicking a teacher's join link has
  // no role until this fires — so it shares the auto-attempt machinery below
  // (once per code, never mid-role-fetch, never twice on re-render) rather
  // than growing a parallel one.
  const isPending = session !== null && roleStatus === 'ready' && role === 'pending';
  const canAttempt = isStudent || isPending;
  const gateActive =
    loading || (session !== null && roleStatus === 'loading') ||
    (canAttempt && join.phase === 'joining');
  const slow = useSlowFlag(gateActive);

  // The pre-auth class-name lookup (S9 Drop 2, D-3 — the fix this file's
  // header recorded). THREE outcomes by design (DR-6): the name fills the
  // reserved title slot; a DEFINITIVE no-such-class warns BEFORE OAuth
  // (sign-in stays enabled — the lookup could be stale; an anon endpoint
  // never hard-blocks); a network failure keeps the silent neutral state.
  const [meta, setMeta] = useState<ClassMetaResult | null>(null);
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    void fetchClassMeta(code).then((m) => {
      if (!cancelled) setMeta(m);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    // Auto-join exactly once per code, and only as a resolved student —
    // never mid-role-fetch, never for teachers (E-9), never twice on a
    // re-render (the double-click class of bug, e2e-pinned).
    if (!canAttempt || attemptedFor.current === code) return;
    attemptedFor.current = code;
    setJoin({ phase: 'joining' });
    // A pending account must REDEEM (promote + join); an already-student joins.
    // Both raise the same wire strings for the shared refusals, so one copy
    // table serves both — redeem's classifier is a superset of join's.
    const attempt = isPending ? redeemJoinCode(code) : joinClass(code);
    attempt
      .then((joined) => {
        setJoin({ phase: 'joined', joined });
        // The role just changed under us; re-read it so the shell that renders
        // after this screen is the student one, not the pending onboarding.
        if (isPending) retryRole();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        setJoin({ phase: 'failed', copy: REDEEM_ERROR_COPY[classifyRedeemError(message)] });
      });
  }, [canAttempt, isPending, code, retryRole]);

  let body;
  if (loading || (session && (roleStatus === 'loading' || roleStatus === 'idle'))) {
    body = <NeutralGateCard slow={slow} onRetry={session ? retryRole : undefined} />;
  } else if (!session) {
    body = callbackError ? (
      // Student entry point → the school-account frame (P3).
      <SignInFailedCard studentSurface redirectTo={window.location.href} />
    ) : (
      // ONE composition in every state (DR-4, no-jump by construction):
      // eyebrow / title slot reserved at TWO lines / chip row ALWAYS present
      // / button. The class name replaces the title TEXT, never the
      // structure; the chip stays — the code is what the student verifies
      // against the board.
      <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          You&apos;re joining a class
        </p>
        <h1 className="mt-1.5 flex min-h-16 items-center justify-center text-2xl font-bold text-ink">
          <span className="line-clamp-2">
            {meta?.kind === 'name' ? meta.name : 'Join your class'}
          </span>
        </h1>
        <p className="mt-2">
          <span className="rounded border border-line bg-surface-2 px-2 py-0.5 font-mono text-base tracking-[0.15em]">
            {code}
          </span>
        </p>
        <p className="mt-2 text-base text-muted">
          Sign in with your school Google account to join.
        </p>
        {meta?.kind === 'none' && (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-900">
            {LANDING_COPY.codeNotFound}
          </p>
        )}
        <button
          type="button"
          className={`mt-4 w-full ${BTN_PRIMARY}`}
          onClick={() => {
            // redirectTo = THIS url: the code survives the OAuth round-trip
            // (B12; the dashboard redirect-URL allowlist must cover /join/* —
            // Probe 1 in the plan's runbook proves it live).
            void signInWithGoogle({
              redirectTo: window.location.href,
              includeDistrictHint: true,
            });
          }}
        >
          Sign in with Google
        </button>
      </div>
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
  } else if (!isStudent) {
    // Signed-in teacher/admin hit their own posted link (E-9): explain, never
    // call join_class, never bounce silently.
    body = (
      <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 shadow-sm">
        <h1 className="text-lg font-bold text-ink">Join links are for student accounts</h1>
        <p className="mt-2 text-base text-muted">
          You&apos;re signed in as a teacher. Your class and its code live in your
          Classes page.
        </p>
        <Link to="/classes" className={`mt-4 inline-block ${BTN_PRIMARY}`}>
          Open Classes
        </Link>
      </div>
    );
  } else if (join.phase === 'joining') {
    body = (
      <div
        className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm"
        role="status"
      >
        <p className="text-muted">
          {slow ? 'This is taking longer than usual…' : `Joining class ${code}…`}
        </p>
      </div>
    );
  } else if (join.phase === 'failed') {
    body = (
      <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm">
        <p role="alert" className="text-base text-strong">
          {join.copy}
        </p>
        <Link to="/" className={`mt-4 inline-block ${BTN_PRIMARY}`}>
          Go to your classes
        </Link>
      </div>
    );
  } else {
    body = (
      <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-ink">You&apos;re in ✓</h1>
        <p className="mt-2 text-base text-muted">
          You joined <strong className="text-strong">{join.joined.name}</strong>.
        </p>
        <button
          type="button"
          className={`mt-4 w-full ${BTN_PRIMARY}`}
          onClick={() => void navigate('/')}
        >
          Go to your classes
        </button>
        <p className="mt-3 text-sm text-muted">
          Wrong class? Ask your teacher to remove you.
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-8">
      <div className="w-full max-w-md">{body}</div>
    </main>
  );
}
