/**
 * The identity slice's auth-state cards (design §12 board frames 1c/1d/3/4).
 * Shared by Home, /join/:code, and the StudentViewer pre-auth gate so the
 * P3 route split is a prop, not a fork: student surfaces render the
 * school-account guidance, Home renders the generic frame.
 */
import { useMemo, useState } from 'react';
import { readAuthCallbackError, SIGN_IN_FAILED_COPY } from '../lib/authMessages';
import { signInWithGoogle } from '../lib/auth';
import { districtHint } from '../lib/supabase';

const BTN_PRIMARY =
  'rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-11';
const BTN_SECONDARY =
  'rounded-md border border-line-strong bg-canvas px-4 py-2.5 text-sm font-medium text-strong shadow-sm transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink min-h-11';

export { BTN_PRIMARY, BTN_SECONDARY };

/**
 * Read the OAuth callback error ONCE per mount (hash and query forms — the
 * E-7 parser; the raw value is logged, never rendered: GoTrue's text is
 * generic and unhelpful to students).
 */
export function useAuthCallbackError(): string | null {
  return useMemo(() => {
    const err = readAuthCallbackError(new URL(window.location.href));
    if (err) console.warn('Auth callback error:', err);
    return err;
  }, []);
}

/**
 * The sign-in-failed card (frame 3; P1 cause-agnostic). `studentSurface`
 * adds the school-account guidance; retry ALWAYS forces the account picker
 * (OV#4 — without it Google reuses the rejected account and the retry loops).
 */
export function SignInFailedCard({
  studentSurface,
  redirectTo,
}: {
  studentSurface: boolean;
  redirectTo: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm">
      <h2 className="text-lg font-bold text-ink">{SIGN_IN_FAILED_COPY.title}</h2>
      {studentSurface ? (
        <p className="mt-2 text-base text-muted">
          {SIGN_IN_FAILED_COPY.studentGuidance}{' '}
          <strong className="text-strong">@{districtHint ?? 'your school'}</strong>.
        </p>
      ) : (
        <p className="mt-2 text-base text-muted">{SIGN_IN_FAILED_COPY.genericBody}</p>
      )}
      <button
        type="button"
        disabled={busy}
        className={`mt-4 w-full ${BTN_PRIMARY}`}
        onClick={() => {
          setBusy(true);
          void signInWithGoogle({
            redirectTo,
            includeDistrictHint: studentSurface,
            forceAccountPicker: true,
          }).finally(() => setBusy(false));
        }}
      >
        {SIGN_IN_FAILED_COPY.retry}
      </button>
      {studentSurface ? (
        <p className="mt-3 text-sm text-muted">{SIGN_IN_FAILED_COPY.fallback}</p>
      ) : null}
    </div>
  );
}

/** Frame 4 — the E-11 zero-rows state: honest dead-end, sign-out only. */
export function AccountUnavailableCard({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm">
      <h2 className="text-lg font-bold text-ink">This account isn&apos;t active</h2>
      <p className="mt-2 text-base text-muted">
        Your account exists but isn&apos;t active right now. Ask your teacher to check with
        the school.
      </p>
      <button type="button" className={`mt-4 ${BTN_SECONDARY}`} onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}

/** Frame 1c — the neutral role/session gate with the shared slow escalation. */
export function NeutralGateCard({ slow, onRetry }: { slow: boolean; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-line bg-canvas p-6 shadow-sm" role="status">
      {slow ? (
        <p className="text-muted">
          This is taking longer than usual.{' '}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="underline underline-offset-2 hover:text-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Retry
            </button>
          ) : null}
        </p>
      ) : (
        <p className="text-muted">Checking session…</p>
      )}
    </div>
  );
}
