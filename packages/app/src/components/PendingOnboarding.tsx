// =============================================================================
// PendingOnboarding — the pending-role fork + teacher attestation (0033 R5-DR)
// -----------------------------------------------------------------------------
// WHAT THIS IS. A signed-in account with role='pending' holds nothing: 0033
// admits unknown Google sign-ins into a contained role, and TWO audited RPCs
// promote them. This component is the surface for both promotions.
//
// WHERE IT SITS IN THE FLOW (R5-DR). Most users never see it. The ruled path is
// a PRE-AUTH fork: the signed-out landing carries a code door and a teacher
// door, intent rides the redirect URL, and a code-carrying student lands on
// /join/<CODE> which auto-redeems. This screen is the SAFETY NET for sign-ins
// that arrive with no intent (direct OAuth, a stale bookmark) — which is why
// the fork here is weighted to the dominant journey rather than symmetric.
//
// COMPOSITION (design board row 1, variant A). Code-first: the class-code field
// and its primary action own the visual weight; the teacher path is a quiet
// text link. Students never mis-tap into attestation, and an adult scanning for
// their path reads one line of text. Two views, one card:
//
//     fork ──[I'm a teacher]──> attest ──[Back]──> fork
//       │                          │
//       └──[Join your class]       └──[Continue as a teacher]
//              │                          │
//              ▼                          ▼
//        redeem_join_code            claim_teacher
//        (promote+join)              (promote+attest)
//
// A11Y (R5-DR block, asserted by the a11y lane): 16px+ code input so iOS does
// not zoom, autocapitalize/autocorrect off, ONE paste-friendly field (not
// per-character boxes), Enter submits, 44px targets, announcements through a
// role=status live region using ADMISSION_ANNOUNCEMENTS strings, focus to the
// code input on refusal. Copy and announcement strings come from the contract,
// never inline literals.
// =============================================================================

import { useRef, useState } from 'react';
import { claimTeacher, redeemJoinCode } from '../lib/classes';
import {
  ADMISSION_ANNOUNCEMENTS,
  CLAIM_ERROR_COPY,
  ONBOARDING_COPY,
  REDEEM_ERROR_COPY,
  classifyClaimError,
  classifyRedeemError,
} from '../lib/authMessages';

const BTN_PRIMARY =
  'flex min-h-[44px] w-full items-center justify-center rounded-md bg-ink px-4 font-semibold text-canvas hover:bg-strong disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';
const BTN_QUIET =
  'min-h-[44px] w-full text-sm text-muted underline underline-offset-2 hover:text-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

export interface PendingOnboardingProps {
  email: string;
  /** Called after a successful promotion so the shell can re-read the role. */
  onPromoted: () => void;
  onSignOut: () => void;
  /** Pre-fills the code (the /join/:code deep link hands it over). */
  initialCode?: string;
}

export function PendingOnboarding({
  email,
  onPromoted,
  onSignOut,
  initialCode = '',
}: PendingOnboardingProps) {
  const [view, setView] = useState<'fork' | 'attest'>('fork');
  const [code, setCode] = useState(initialCode);
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const codeRef = useRef<HTMLInputElement | null>(null);

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy || code.trim().length === 0) return;
    setBusy(true);
    setError(null);
    setAnnouncement(ADMISSION_ANNOUNCEMENTS.redeeming);
    try {
      await redeemJoinCode(code);
      setAnnouncement(ADMISSION_ANNOUNCEMENTS.redeemed);
      onPromoted();
    } catch (err) {
      // The refusal text REACHES us here — that transport is why admission
      // moved into an RPC (R2). Classify against the wire contract, render the
      // student-facing copy, never the raw message.
      setError(REDEEM_ERROR_COPY[classifyRedeemError(String(err))]);
      setAnnouncement(ADMISSION_ANNOUNCEMENTS.redeemFailed);
      // Focus back to the field so a retry is one keystroke away (DR-14).
      codeRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !attested) return;
    setBusy(true);
    setError(null);
    setAnnouncement(ADMISSION_ANNOUNCEMENTS.claiming);
    try {
      await claimTeacher();
      setAnnouncement(ADMISSION_ANNOUNCEMENTS.claimed);
      onPromoted();
    } catch (err) {
      setError(CLAIM_ERROR_COPY[classifyClaimError(String(err))]);
      setAnnouncement(ADMISSION_ANNOUNCEMENTS.claimFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 shadow-sm"
      data-onboarding={view}
    >
      {view === 'fork' ? (
        <>
          <h2 className="text-xl font-bold text-ink">{ONBOARDING_COPY.forkTitle}</h2>
          <p className="mt-1 text-sm text-muted">{ONBOARDING_COPY.forkBody}</p>

          <form onSubmit={submitCode} className="mt-5">
            <label htmlFor="onboarding-code" className="block text-sm font-semibold text-strong">
              {ONBOARDING_COPY.codeLabel}
            </label>
            <input
              id="onboarding-code"
              ref={codeRef}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              // ONE paste-friendly field, deliberately not per-character boxes:
              // a student pasting a code from chat is the common case.
              // text-lg keeps it >=16px so iOS Safari does not zoom on focus.
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5 text-center text-lg font-semibold uppercase tracking-[0.35em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              maxLength={6}
              placeholder="ABC123"
              aria-describedby={error ? 'onboarding-error' : undefined}
            />
            <button type="submit" disabled={busy || code.trim().length === 0} className={`${BTN_PRIMARY} mt-3`}>
              {ONBOARDING_COPY.codeAction}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={() => {
              setView('attest');
              setError(null);
            }}
            className={BTN_QUIET}
          >
            {ONBOARDING_COPY.teacherAction}
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-ink">{ONBOARDING_COPY.claimTitle}</h2>
          <p className="mt-1 text-sm text-muted">{ONBOARDING_COPY.claimBody}</p>

          <form onSubmit={submitClaim} className="mt-5">
            {/* Unchecked by default and never sticky (the 3.1C age-assertion
                rule, mirrored): an attestation the user did not actively make
                is not an attestation. */}
            <label className="flex items-start gap-2.5 text-sm text-strong">
              <input
                type="checkbox"
                checked={attested}
                onChange={(e) => setAttested(e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] shrink-0"
              />
              <span>{ONBOARDING_COPY.claimAttestation}</span>
            </label>
            <button type="submit" disabled={busy || !attested} className={`${BTN_PRIMARY} mt-4`}>
              {ONBOARDING_COPY.claimAction}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setView('fork');
              setError(null);
            }}
            className={`${BTN_QUIET} mt-2`}
          >
            {ONBOARDING_COPY.claimBack}
          </button>
        </>
      )}

      {error ? (
        <p id="onboarding-error" role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {/* The announcement region the a11y lane asserts. Visually hidden: the
          visible states already say these things; this is the screen-reader
          channel for the same transitions. */}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <p className="mt-5 text-center text-xs text-muted">
        {ONBOARDING_COPY.signedInAs} {email}
        {' · '}
        <button type="button" onClick={onSignOut} className="underline underline-offset-2 hover:text-strong">
          Sign out
        </button>
      </p>
    </div>
  );
}
