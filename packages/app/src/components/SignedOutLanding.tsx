// =============================================================================
// SignedOutLanding — the PRE-AUTH admission fork (0033 R5-DR, board Row 0)
// -----------------------------------------------------------------------------
// WHY THIS EXISTS AT ALL. The design review verified DeltaMath live and found
// they have NO post-signup role fork: users self-select by entry door, before
// authentication. R5-DR ruled the same shape here, which makes this screen the
// dominant journey and demotes PendingOnboarding to the safety net for
// intent-less arrivals (direct OAuth, a stale bookmark).
//
// HOW INTENT TRAVELS. Exactly like the join code already does — on the redirect
// URL, as a ROUTING HINT and never an admission input:
//
//     code door     → redirectTo = /join/<CODE>   → JoinClass auto-redeems
//     teacher door  → redirectTo = /?intent=teacher → onboarding opens on attest
//
// Admission stays where 0033 put it: the trigger admits every unknown Google
// sign-in as `pending`, and the two audited RPCs promote. Nothing on this
// screen can grant a role — a forged ?intent=teacher gets a user the
// attestation checkbox one step earlier, which is the same checkbox the
// safety-net fork shows anyway.
//
// THE PRE-GOOGLE CODE CHECK (DR-6). A bad code is caught HERE, before the OAuth
// round trip, through the same anonymous meta endpoint /join/:code uses. It
// warns; it does not hard-block: the endpoint can be stale and an anonymous
// lookup is never allowed to be the final word on whether a class exists, so a
// second press proceeds regardless.
//
// A11Y (R5-DR block). ONE paste-friendly code field (deliberately not Desmos's
// six boxes), >=16px so iOS Safari does not zoom on focus, autocapitalize and
// autocorrect off, Enter submits, 44px targets, refusal moves focus back to the
// field (DR-14), and every transition is announced through a role=status region
// using contract strings.
// =============================================================================

import { useRef, useState, type FormEvent } from 'react';
import { signInWithGoogle } from '../lib/auth';
import { fetchClassMeta } from '../lib/classActivities';
import { LANDING_ANNOUNCEMENTS, LANDING_COPY } from '../lib/authMessages';
import { JOIN_CODE_LENGTH, normalizeJoinCodeInput } from './JoinCodeForm';
import { BTN_PRIMARY } from './AuthScreens';

/** Where the student door lands after Google. Exported so the test asserts the
 *  real construction rather than a retyped copy of it (P2). */
export function studentRedirectUrl(code: string, origin: string): string {
  return `${origin}/join/${code}`;
}

/** The teacher door's routing hint. Read back by Home (TEACHER_INTENT_PARAM). */
export function teacherRedirectUrl(origin: string): string {
  return `${origin}/?intent=teacher`;
}

export function SignedOutLanding({ idleSignedOut }: { idleSignedOut: boolean }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [warned, setWarned] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const codeRef = useRef<HTMLInputElement | null>(null);
  // Which code the warning belongs to: retyping after a warning must re-check
  // rather than sail through on the previous code's second press.
  const warnedFor = useRef<string | null>(null);

  const ready = code.length === JOIN_CODE_LENGTH;

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    if (busy || !ready) return;
    setBusy(true);

    // Second press on a code we already warned about: the student insists, and
    // the anonymous lookup does not get to overrule them (DR-6).
    if (warnedFor.current === code) {
      setAnnouncement(LANDING_ANNOUNCEMENTS.continuing);
      await signInWithGoogle({
        redirectTo: studentRedirectUrl(code, window.location.origin),
        includeDistrictHint: true,
      });
      return;
    }

    setAnnouncement(LANDING_ANNOUNCEMENTS.checking);
    const meta = await fetchClassMeta(code);
    // 'error' (network/5xx) proceeds silently: an indistinct failure is not
    // evidence against the class, and stranding the student is the worse bug.
    if (meta.kind === 'none') {
      setWarned(true);
      warnedFor.current = code;
      setAnnouncement(LANDING_ANNOUNCEMENTS.notFound);
      setBusy(false);
      codeRef.current?.focus();
      return;
    }
    setAnnouncement(LANDING_ANNOUNCEMENTS.continuing);
    await signInWithGoogle({
      redirectTo: studentRedirectUrl(code, window.location.origin),
      includeDistrictHint: true,
    });
  }

  function goTeacher() {
    if (busy) return;
    setBusy(true);
    // No district hint: teachers are not district students, and Home's shared
    // entry point has always passed false here (E-6).
    void signInWithGoogle({ redirectTo: teacherRedirectUrl(window.location.origin) }).then(
      ({ error }) => {
        if (error) {
          console.error('Sign-in failed:', error);
          setBusy(false);
        }
      },
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 shadow-sm">
      {idleSignedOut ? (
        <p className="mb-4 rounded-md bg-surface-2 px-3 py-2 text-sm text-muted">
          You were signed out after being away. Your work is saved.
        </p>
      ) : null}

      {/* The page already leads with the product wordmark, so the board's
          placeholder headline resolves to the lede alone (R5-DR copy note). */}
      <p className="text-base text-muted">{LANDING_COPY.lede}</p>

      <form onSubmit={submitCode} className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          {LANDING_COPY.studentHeading}
        </h2>
        <label htmlFor="landing-code" className="mt-1.5 block text-sm font-semibold text-strong">
          {LANDING_COPY.codeLabel}
        </label>
        <input
          id="landing-code"
          ref={codeRef}
          value={code}
          onChange={(e) => {
            setCode(normalizeJoinCodeInput(e.target.value));
            if (warned) setWarned(false);
          }}
          className="mt-1.5 w-full rounded-md border border-line-strong px-3 py-2.5 text-center text-lg font-semibold uppercase tracking-[0.35em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          maxLength={JOIN_CODE_LENGTH}
          placeholder="ABC123"
          aria-describedby={warned ? 'landing-code-warning' : undefined}
        />
        {warned ? (
          <p
            id="landing-code-warning"
            role="alert"
            className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-900"
          >
            {LANDING_COPY.codeNotFound} {LANDING_COPY.codeNotFoundContinue}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || !ready}
          className={`mt-3 w-full ${BTN_PRIMARY} disabled:opacity-50`}
        >
          {LANDING_COPY.studentAction}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* Action first, explanation under it (board Row 0). A heading here would
          just say the link's own words back to the reader. */}
      <button
        type="button"
        onClick={goTeacher}
        disabled={busy}
        className="min-h-[44px] w-full text-sm font-semibold text-strong underline underline-offset-2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
      >
        {LANDING_COPY.teacherAction}
      </button>
      <p className="mt-1 text-center text-sm text-muted">{LANDING_COPY.teacherBody}</p>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
