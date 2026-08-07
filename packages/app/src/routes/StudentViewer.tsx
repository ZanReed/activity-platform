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

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { MARKS, markOnce, preloadGraphKitIfNeeded, preloadMathIfNeeded } from '@activity/viewer';
import { useParams } from 'react-router';
import {
  PrintButton,
  ViewerContainer,
  ViewerLoadError,
  createBrowserConnectivity,
  createCheckQueue,
  createHttpCheckService,
  createReadClient,
  createTabLock,
  createViewerBuffer,
  createViewerStore,
  findUnsentWork,
  indexDocument,
  loadAnyCachedDocument,
  loadCachedDocument,
  saveCachedDocument,
  sweepForeignStorage,
  sweepOrphanVersions,
} from '@activity/viewer';
import type {
  ActivityMeta,
  ServedActivity,
  ViewerErrorKind,
} from '@activity/viewer';
import '@activity/viewer/tokens.css';
import '@activity/viewer/viewer.css';
import { functionsBase, supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';

// functionsBase comes from lib/supabase (A21) — the one env-read site, so
// this route's tests stay env-independent by mocking that module.

/**
 * The one sign-in call, shared by the pre-auth gate and the expired-session
 * banner. `redirectTo` is the current URL so a student lands back on the
 * activity they were doing, not on a dashboard.
 */
function signInWithGoogle(): Promise<unknown> {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href },
  });
}

/** localStorage, or null in a profile that forbids it. Every on-device feature
 * here is an enhancement: none of them may take the worksheet down with them. */
function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
/** How long before we admit the load is slow (ruling 1.2A). */
const SLOW_LOAD_MS = 8000;

type LoadState =
  | { phase: 'loading' }
  | {
      phase: 'ready';
      served: ServedActivity;
      /**
       * How we got this document, which is the only thing distinguishing three
       * screens that otherwise look identical (S6-5 / S6-9):
       *   'network' — normal.
       *   'offline' — served from the on-device copy because the network was
       *      unreachable. The worksheet is real; the banner says why it is not
       *      being refreshed.
       *   'pinned'  — a SUPERSEDED version, rendered on purpose because the
       *      student's unsent work belongs to it. A teacher republished; we do
       *      not throw that work away to show them the newer text.
       */
      source: 'network' | 'offline' | 'pinned';
    }
  | { phase: 'error'; kind: ViewerErrorKind; message: string };

export default function StudentViewer() {
  const { activityId = '' } = useParams();
  const { session, loading: sessionLoading } = useSession();
  const [state, setState] = useState<LoadState>({ phase: 'loading' });
  const [meta, setMeta] = useState<ActivityMeta | null>(null);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  /** Their unsent work belongs to a version this device no longer has. */
  const [strandedNotice, setStrandedNotice] = useState(false);
  /** The session died while they were working (2.3A). Passive, never a modal. */
  const [authExpired, setAuthExpired] = useState(false);

  const getAccessToken = useCallback(
    () => session?.access_token ?? null,
    [session],
  );

  const readClient = useMemo(
    () =>
      createReadClient({
        baseUrl: `${functionsBase()}/get-activity`,
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

    const userId = session.user.id;

    void readClient
      .load(activityId)
      .then((served) => {
        if (cancelled) return;

        // EARLIEST POSSIBLE MOMENT to learn this document needs math (S8 T7).
        // Before this line the KaTeX fetch could not start until React had
        // rendered the tree and a math component had mounted; the document
        // already knew, ~a render earlier. Fire-and-forget, and a no-op for a
        // document with no math — the chunk stays lazy and conditional.
        preloadMathIfNeeded(served.document);
        // The same pattern for the HEAVIER chunk (A20): graph-kit's import
        // used to fire from inside the mounting kit surface, a full render
        // later than the document knowing it holds graph blocks.
        preloadGraphKitIfNeeded(served.document);

        const storage = safeStorage();

        // Keep the document we were just served. This is what makes the
        // offline branch below and the republish branch here possible at all.
        if (storage) saveCachedDocument(storage, userId, served);

        // THE REPUBLISH PATH (ruling S6-9). The student has unsent work — or a
        // queued check — on a version the teacher has since replaced. Its block
        // ids do not exist in the new version, so "just load the new one"
        // silently strands that work.
        const stranded = storage
          ? findUnsentWork(storage, {
              userId,
              activityId,
              versionId: served.versionId,
            })
          : null;
        if (stranded && storage) {
          const pinned = loadCachedDocument(
            storage,
            userId,
            activityId,
            stranded.versionId,
          );
          if (pinned) {
            // Their pinned version is a DIFFERENT document from the one just
            // served, so ask it about math too rather than assuming the two
            // versions agree. Idempotent when the served copy already started
            // the fetch.
            preloadMathIfNeeded(pinned.document);
            preloadGraphKitIfNeeded(pinned.document);
            // We still have their version. Render it, let the queue fire
            // against it (the grader accepts non-current versions by design),
            // and let the stale banner offer the move on THEIR terms.
            setState({
              phase: 'ready',
              source: 'pinned',
              served: {
                activityId,
                versionId: pinned.versionId,
                versionNum: pinned.versionNum,
                title: pinned.title,
                document: pinned.document as ServedActivity['document'],
              },
            });
            return;
          }
          // Their version is gone from this device, so it cannot be rendered.
          // Say so plainly and keep the blob — deleting it here would be the
          // silent loss this whole branch exists to prevent.
          setStrandedNotice(true);
        }

        setState({ phase: 'ready', source: 'network', served });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const kind =
          err instanceof ViewerLoadError ? err.kind : ('unknown' as ViewerErrorKind);

        // OFFLINE BOOT (ruling S6-5). The network is unreachable but this
        // device may still hold the document. A student who reopens on a dead
        // network should see their worksheet and their work, not an error
        // screen telling them something they already know.
        if (kind === 'offline') {
          const storage = safeStorage();
          const cached = storage
            ? loadAnyCachedDocument(storage, session.user.id, activityId)
            : null;
          if (cached) {
            // Worth trying even here: the service worker runtime-caches hashed
            // assets, so a student who has opened a math activity before may
            // well have KaTeX on the device. If not, this fails silently and
            // the readable-LaTeX fallback renders, which is what offline math
            // did before this existed.
            preloadMathIfNeeded(cached.document);
            preloadGraphKitIfNeeded(cached.document);
            setState({
              phase: 'ready',
              source: 'offline',
              served: {
                activityId,
                versionId: cached.versionId,
                versionNum: cached.versionNum,
                title: cached.title,
                document: cached.document as ServedActivity['document'],
              },
            });
            return;
          }
        }

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
        checkUrl: `${functionsBase()}/check-section`,
        feedbackUrl: `${functionsBase()}/get-feedback`,
        getAccessToken,
      }),
    });
    // state.phase is read above; versionId + userId are the identities that
    // matter (a different student on the same tab must get a different store).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, versionId, userId, getAccessToken]);

  const servedDocument = state.phase === 'ready' ? state.served.document : null;

  // Whether THIS tab is the editable one. Starts true so the first paint is
  // the normal worksheet: the lock resolves within a frame in the common
  // single-tab case, and flashing a read-only banner at every student to
  // cover the rare second tab would be the wrong trade.
  const [tabHeld, setTabHeld] = useState(true);
  const [takeOver, setTakeOver] = useState<(() => void) | null>(null);

  /**
   * LOCAL-FIRST MOUNT (S6 V1 + V2). Everything on-device hangs off this one
   * effect so its lifetime is exactly the store's: a new student, or a new
   * version, tears the whole thing down and builds a fresh one.
   *
   *   boot sweeps ──► hydrate ──► subscribe(save) ──► queue.start()
   *
   * Order matters. The sweeps run BEFORE the buffer is read: if the previous
   * student's blob is still on this Chromebook, it has to be gone before
   * anything tries to load work for this activity. Hydrate then runs before
   * the save subscription, so restoring state can't immediately re-persist a
   * copy of what it just read.
   */
  useEffect(() => {
    if (!store || !userId || !versionId || !servedDocument) return;

    const storage = safeStorage();
    if (!storage) return; // locked-down profile: run without a buffer

    // The crash-without-signout path, and the republish accumulation path.
    // The GC deliberately spares a superseded version that still holds unsent
    // work (S6-9) — the load effect above has already decided what to do with
    // it, and collecting it here would undo that decision.
    sweepForeignStorage(storage, userId);
    sweepOrphanVersions(storage, { userId, activityId, versionId });

    // Scoped per (student, activity): a second tab on a DIFFERENT activity is
    // not a conflict, and two students on one machine must not block each
    // other. Version is deliberately out — two tabs on two versions of the
    // same activity still write buffers that would fight.
    const lock = createTabLock({
      name: `activity-viewer:lock:${userId}:${activityId}`,
      onChange: setTabHeld,
    });

    const buffer = createViewerBuffer({
      storage,
      userId,
      activityId,
      versionId,
      serialize: () => store.serialize(),
      // The write gate (outside-voice #7). A tab that lost the lock stops
      // WRITING, not just typing — otherwise closing it hours later would
      // flush its stale state over whatever the live tab has since done.
      canWrite: () => lock.isHeld(),
    });
    const restored = buffer.load();
    if (restored) store.hydrate(restored);

    const unsubscribe = store.subscribe(() => buffer.save());

    const index = indexDocument(servedDocument);
    const queue = createCheckQueue({
      store,
      resolveItems: (sectionId) => index.bySection[sectionId]?.items ?? null,
      connectivity: createBrowserConnectivity(),
      // Refresh before firing, never after a 401 (outside-voice #8). getSession
      // renews an expired token when a refresh token is still valid; a false
      // here parks the queue instead of burning the attempt.
      ensureSession: async () => {
        try {
          const { data } = await supabase.auth.getSession();
          const ok = data.session !== null;
          // A recovered session takes the banner down without the student
          // having to do anything — the common case after a laptop wakes up.
          if (ok) setAuthExpired(false);
          return ok;
        } catch {
          return false;
        }
      },
      // 2.3A: passive banner, never a blocking modal. Their work keeps saving
      // locally the whole time; only the CHECK is waiting on a session.
      onAuthRequired: () => setAuthExpired(true),
    });

    // The OTHER way a session dies: a check the student pressed themselves
    // comes back 401. That is the same event as the queue's — "you are signed
    // out" — and 2.3A says a student meets it as one passive banner, not as a
    // per-section error in one case and a banner in the other. Watching the
    // store here is what makes the two paths converge.
    const unwatchAuth = store.subscribe(() => {
      const expired = Object.values(store.getState().sections).some(
        (status) => status.phase === 'error' && status.kind === 'unauthenticated',
      );
      if (expired) setAuthExpired(true);
    });
    queue.start();

    setTakeOver(() => () => lock.takeOver());

    return () => {
      queue.stop();
      unsubscribe();
      unwatchAuth();
      buffer.dispose(); // flushes whatever the debounce still owed
      lock.dispose();
      setTakeOver(null);
    };
  }, [store, userId, activityId, versionId, servedDocument]);

  // The signed-in half of the S8 timing contract (ruling D2). Fires on the
  // commit in which the worksheet itself first renders: `store` is non-null
  // only when a served document, a version and a user all exist, which is
  // exactly the condition guarding the ViewerContainer return below.
  //
  // Declared HERE, above every early return, because hook order must not
  // depend on load state — the branches below return different trees for
  // loading, error and pre-auth, and a hook placed after them would be skipped
  // on some renders and crash on the next.
  //
  // HONEST SCOPE: this marks "the worksheet is on screen and answerable". A
  // section that happens to contain a lazy heavy block (a graph) may still be
  // resolving its own chunk — that cost is measured separately by the chunk
  // ledger and the math-rendered mark, rather than smuggled into this number.
  const worksheetReady = state.phase === 'ready' && store !== null;
  useLayoutEffect(() => {
    if (worksheetReady) markOnce(MARKS.worksheetInteractive);
  }, [worksheetReady]);

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
      {/* BANNER ORDER IS THE DEDUP RULE (outside-voice finding 13). At most
          ONE of these shows at a time, most-actionable first: a dead session
          blocks checking entirely, a stranded version needs a decision, and
          "you're offline" is merely context. Stacking all three would turn
          three sentences a student can act on into a wall they skip. The
          per-section pill remains the persistent state; these are transitions. */}
      {authExpired ? (
        <div className="viewer-banner" role="status" data-banner="session-expired">
          <span>Your sign-in expired. Your work is saved on this device.</span>
          <button
            type="button"
            className="viewer-banner-action"
            onClick={() => {
              void signInWithGoogle();
            }}
          >
            Sign in again
          </button>
        </div>
      ) : strandedNotice ? (
        <div className="viewer-banner" role="status" data-banner="work-stranded">
          <span>
            Your teacher updated this activity, so an earlier check couldn’t
            run. Your answers are still saved.
          </span>
        </div>
      ) : state.source === 'offline' ? (
        <div className="viewer-banner" role="status" data-banner="offline-copy">
          <span>
            You’re offline — this is the copy saved on this device. Your work is
            being saved here too.
          </span>
        </div>
      ) : state.source === 'pinned' ? (
        <div className="viewer-banner" role="status" data-banner="pinned-version">
          <span>
            Your teacher updated this activity. You’re still on your version so
            your unsent work isn’t lost.
          </span>
        </div>
      ) : null}
      <ViewerContainer
        document={state.served.document}
        store={store}
        versionId={state.served.versionId}
        readOnly={!tabHeld}
        {...(takeOver ? { onTakeOver: takeOver } : {})}
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
 * The server-side fix landed as migration 0021 (trigger stores a name or
 * NULL, the RPC refuses to return an email-shaped value, bad rows backfilled).
 * This guard stays regardless — same regex, third layer: the client should
 * not print an address it was handed by accident.
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

  // The anonymous half of the S8 timing contract. Stamped in a layout effect so
  // the mark lands when this screen is COMMITTED to the DOM and its sign-in
  // button is clickable — which is the promise being measured, not the moment
  // React decided to render. Fires on the first commit and never again, even
  // though `meta` arriving later re-renders this screen with a real title:
  // the student could already act before the title resolved, and moving the
  // mark forward to the prettier render would silently flatter the number.
  useLayoutEffect(() => {
    markOnce(MARKS.preAuthInteractive);
  }, []);

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
            void signInWithGoogle();
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
