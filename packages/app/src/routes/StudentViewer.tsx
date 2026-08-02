// =============================================================================
// StudentViewer — the student-facing route (S3)
// -----------------------------------------------------------------------------
// The thing every other S3 piece was built for: a real activity, fetched from
// the read API, mounted for a signed-in student.
//
// The screens, in the order a student meets them (design rulings in brackets):
//
//  1. PRE-AUTH [3.2A] — signed out, we still show WHAT this is: "Mrs Jafari's
//     Linear Systems", from the anonymous meta endpoint. A bare sign-in wall
//     tells a student nothing about whether they even have the right link.
//  2. SKELETON [1.2A] — a paper card with shimmer rows while content loads,
//     escalating after ~8s to "this is taking longer than usual" + Retry,
//     because a spinner that never resolves is indistinguishable from a hang.
//  3. THE WORKSHEET — ViewerContainer over the served document.
//  4. FAILURE STATES [Q3A] — one screen per ViewerErrorKind, each saying what
//     happened and what to do. Never a white screen, never a raw status.
//
// Checking uses the real HTTP client against the grading endpoint, which does
// not exist until S4. That is deliberate and visible: a check attempt fails
// into the store's designed "Couldn't check — try again" state while every
// answer stays intact. Reading and answering work today; grading lights up
// when the RPC deploys, with no change here.
// =============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
  PrintButton,
  ViewerContainer,
  ViewerLoadError,
  createHttpCheckService,
  createReadClient,
  createViewerStore,
} from '@activity/viewer';
import type {
  ActivityMeta,
  ServedActivity,
  ViewerErrorKind,
} from '@activity/viewer';
import '@activity/viewer/tokens.css';
import '@activity/viewer/viewer.css';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
/** How long before we admit the load is slow (ruling 1.2A). */
const SLOW_LOAD_MS = 8000;

type LoadState =
  | { phase: 'loading' }
  | { phase: 'ready'; served: ServedActivity }
  | { phase: 'error'; kind: ViewerErrorKind; message: string };

export default function StudentViewer() {
  const { activityId = '' } = useParams();
  const { session, loading: sessionLoading } = useSession();
  const [state, setState] = useState<LoadState>({ phase: 'loading' });
  const [meta, setMeta] = useState<ActivityMeta | null>(null);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const getAccessToken = useCallback(
    () => session?.access_token ?? null,
    [session],
  );

  const readClient = useMemo(
    () =>
      createReadClient({
        baseUrl: `${FUNCTIONS_BASE}/get-activity`,
        getAccessToken,
      }),
    [getAccessToken],
  );

  // Pre-auth metadata: fetched WITHOUT a session so the signed-out screen can
  // name the activity. Harmless to fetch when signed in too (it is the same
  // two fields), but we only need it before sign-in.
  useEffect(() => {
    if (!activityId || session) return;
    let cancelled = false;
    void readClient
      .fetchMeta(activityId)
      .then((m) => {
        if (!cancelled) setMeta(m);
      })
      .catch(() => {
        // A failed meta lookup is not worth a screen of its own — the sign-in
        // prompt still works, just without the activity's name.
      });
    return () => {
      cancelled = true;
    };
  }, [activityId, session, readClient]);

  // Content load, once signed in.
  useEffect(() => {
    if (sessionLoading || !session || !activityId) return;
    let cancelled = false;
    setState({ phase: 'loading' });
    setSlow(false);
    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlow(true);
    }, SLOW_LOAD_MS);

    void readClient
      .load(activityId)
      .then((served) => {
        if (!cancelled) setState({ phase: 'ready', served });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const kind =
          err instanceof ViewerLoadError ? err.kind : ('unknown' as ViewerErrorKind);
        setState({
          phase: 'error',
          kind,
          message: err instanceof Error ? err.message : 'Something went wrong',
        });
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [activityId, session, sessionLoading, readClient, attempt]);

  // One store per served VERSION: a republish mid-session means different
  // content, and carrying a store across that would attach answers to blocks
  // that may no longer exist.
  const versionId = state.phase === 'ready' ? state.served.versionId : null;
  // Identity is part of the store (S6-1): it keys the local-first buffer and
  // is re-checked when a persisted blob comes back in, so one student can
  // never resume another's work on a shared Chromebook.
  const userId = session?.user.id ?? null;
  const store = useMemo(() => {
    if (!versionId || state.phase !== 'ready' || !userId) return null;
    return createViewerStore({
      userId,
      activityId,
      versionId,
      checkService: createHttpCheckService({
        checkUrl: `${FUNCTIONS_BASE}/check-section`,
        feedbackUrl: `${FUNCTIONS_BASE}/get-feedback`,
        getAccessToken,
      }),
    });
    // state.phase is read above; versionId + userId are the identities that
    // matter (a different student on the same tab must get a different store).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, versionId, userId, getAccessToken]);

  if (sessionLoading) return <Centered>Loading…</Centered>;
  if (!activityId) return <Centered>No activity in this link.</Centered>;

  if (!session) return <PreAuth meta={meta} />;

  if (state.phase === 'loading') return <Skeleton slow={slow} onRetry={() => setAttempt((n) => n + 1)} />;

  if (state.phase === 'error') {
    return <Failure kind={state.kind} message={state.message} onRetry={() => setAttempt((n) => n + 1)} />;
  }

  if (!store) return <Skeleton slow={false} onRetry={() => setAttempt((n) => n + 1)} />;

  return (
    <>
      <header className="viewer-topbar">
        <h1>{state.served.title}</h1>
        {/* Ruling 7.3A wants this in the completion panel and the chip menu;
            neither exists yet, so it lives in the bar that does (S5-3). The
            action is the same one those will call. */}
        <PrintButton />
      </header>
      <ViewerContainer
        document={state.served.document}
        store={store}
        versionId={state.served.versionId}
      />
    </>
  );
}

/* ---- Screens -------------------------------------------------------------- */

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="viewer-centered" role="status">
      {children}
    </div>
  );
}

/**
 * A teacher's display name is only shown if it IS a name. Live check against
 * the deployed meta endpoint returned `zanreed@gmail.com` — the users row's
 * display_name is whatever the Google sign-up trigger stored, which for this
 * account is the email. This screen is ANONYMOUS: anyone holding the link,
 * signed in or not, sees it. Publishing a teacher's email address to an
 * unauthenticated page is not what ruling 3.2A meant by "teacher display
 * name", so an email-shaped value is suppressed rather than rendered.
 *
 * ⚠ The real fix is server-side (display_name should hold a name, or the RPC
 * should derive one) — recorded in STATE. This guard stays regardless: the
 * client should not print an address it was handed by accident.
 */
function looksLikeEmail(value: string): boolean {
  return /\S+@\S+\.\S+/.test(value);
}

/** Ruling 3.2A: say what this is before asking who they are. */
function PreAuth({ meta }: { meta: ActivityMeta | null }) {
  const teacher =
    meta?.teacherName && !looksLikeEmail(meta.teacherName)
      ? meta.teacherName
      : null;
  return (
    <div className="viewer-centered">
      <div className="viewer-gate">
        {meta ? (
          <>
            <p className="viewer-gate__eyebrow">
              {teacher ? `${teacher} shared` : 'You were sent'}
            </p>
            <h1 className="viewer-gate__title">{meta.title}</h1>
          </>
        ) : (
          <h1 className="viewer-gate__title">Sign in to open this activity</h1>
        )}
        <p className="viewer-gate__body">
          Sign in with your school Google account to start.
        </p>
        <button
          type="button"
          className="viewer-section__check"
          onClick={() => {
            void supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.href },
            });
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

/** Ruling 1.2A: a paper skeleton, escalating when it gets slow. */
function Skeleton({ slow, onRetry }: { slow: boolean; onRetry: () => void }) {
  return (
    <div className="viewer">
      <section className="viewer-section" aria-busy="true">
        <p className="viewer-visually-hidden" role="status">
          Loading your activity
        </p>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="viewer-skeleton__row" data-skeleton-row={i} />
        ))}
        {slow ? (
          <div className="viewer-section__footer">
            <p className="viewer-section__status">
              This is taking longer than usual.
            </p>
            <button type="button" className="viewer-section__check" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

const FAILURE_COPY: Record<ViewerErrorKind, { title: string; body: string; retry: boolean }> = {
  unauthenticated: {
    title: 'Please sign in again',
    body: 'Your session expired. Signing back in keeps any work you have saved.',
    retry: true,
  },
  unavailable: {
    title: 'This activity isn’t available',
    body: 'It may have been unpublished, or the link may be wrong. Check with your teacher.',
    retry: false,
  },
  unservable: {
    title: 'This activity couldn’t be opened',
    body: 'Something is wrong with it on our side, not with anything you did. Your teacher has a way to fix this.',
    retry: true,
  },
  offline: {
    title: 'You appear to be offline',
    body: 'We couldn’t reach the server. Check your connection and try again.',
    retry: true,
  },
  unknown: {
    title: 'Something went wrong',
    body: 'We couldn’t open this activity. Trying again often works.',
    retry: true,
  },
};

function Failure({
  kind,
  message,
  onRetry,
}: {
  kind: ViewerErrorKind;
  message: string;
  onRetry: () => void;
}) {
  const copy = FAILURE_COPY[kind];
  return (
    <div className="viewer-centered">
      <div className="viewer-gate" role="alert" data-failure={kind}>
        <h1 className="viewer-gate__title">{copy.title}</h1>
        <p className="viewer-gate__body">{copy.body}</p>
        {copy.retry ? (
          <button type="button" className="viewer-section__check" onClick={onRetry}>
            Try again
          </button>
        ) : null}
        {/* The raw message is for whoever a student shows this to, not for the
            student — small, muted, and never the headline. */}
        <p className="viewer-gate__detail">{message}</p>
      </div>
    </div>
  );
}
