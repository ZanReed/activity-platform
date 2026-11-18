// =============================================================================
// PhotoHandoff.tsx — the phone's page for "Use my phone" (/h#<code>)
// (media submissions slice 2c; docs/design/media-submissions.md §4.1, MS-3)
// -----------------------------------------------------------------------------
// A student on a Chromebook shows a QR code; a phone opens this page from it.
// The phone is NOT signed in and never asks to be: the person holding it may
// be a parent or a classmate. So this page:
//
//   * reads the code from the URL FRAGMENT, then removes it from the address
//     bar and the phone's history (replaceState) — a fragment never reaches a
//     server, and now it does not linger on the phone either;
//   * makes no Supabase call and touches no session: its only requests are
//     two multipart POSTs to the photo-handoff function (peek, upload), whose
//     code in the body is the only credential;
//   * shows the activity's title and the question's prompt, and never the
//     student's name (the function returns none to show);
//   * re-encodes every photo on the phone first (the same reencodePhoto as the
//     block: EXIF and GPS are gone before a byte is sent; the function strips
//     any a modified page sends anyway).
//
// Lazy, outside RequireAuth (App.tsx). The phone downloads the student shell
// plus this chunk; nothing on it renders a worksheet.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { PhotoError, photoErrorText, reencodePhoto, PHOTO_HANDOFF_PATH } from '@activity/viewer/photo-handoff';
import { PHOTO_HANDOFF_FUNCTION, edgeFunctionUrl } from '../lib/edgeFunctions';
import { functionsBase } from '../lib/supabase';

export const NO_CODE_TEXT = 'This link is missing its code. Scan the QR code on the Chromebook again.';
export const PRIVACY_TEXT = 'Photograph only your working. Keep faces and names out of the picture.';
export const ALL_SENT_TEXT = 'All sent. You can close this page.';

/** The function's refusals, in words a phone holder can act on. */
export function handoffErrorText(code: string): string {
  switch (code) {
    case 'handoff_expired':
      return 'This code has stopped working. Ask for a new one on the Chromebook.';
    case 'handoff_full':
      return ALL_SENT_TEXT;
    case 'handoff_not_here':
      return 'Phones aren’t used in a quiz or an exam.';
    case 'photos_off':
      return 'Photo answers aren’t turned on yet.';
    case 'not_in_class':
    case 'not_available':
      return 'This question can’t take a photo right now. Try Add a photo on the Chromebook.';
    case 'photo_cap':
      // The per-day or per-question cap: waiting a minute would not help.
      return 'This question has had a lot of photos today. Remove one on the Chromebook, or try again tomorrow.';
    case 'handoff_busy':
      return 'Too many photos are being sent right now. Wait a minute and try again.';
    case 'too_big':
      return photoErrorText('too_big');
    case 'not_a_photo':
      return photoErrorText('not_an_image');
    default:
      return 'The photo didn’t send. Check your connection and try again.';
  }
}

interface Peek {
  title: string;
  prompt: string;
  slotsLeft: number;
}

async function post(fields: Record<string, string | Blob>): Promise<{ ok: boolean; body: Record<string, unknown> }> {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  const res = await fetch(edgeFunctionUrl(functionsBase(), PHOTO_HANDOFF_FUNCTION), { method: 'POST', body: form });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, body };
}

/** The code from the fragment, taken once; the address bar keeps none of it.
 *  Kept for the page's life, so a second mount (StrictMode calls a state
 *  initializer twice; a remount under Suspense) still has it after the
 *  fragment is gone. A new fragment (a second scan in the same tab) wins. */
let takenCode: string | null = null;
export function takeCode(): string | null {
  if (typeof window === 'undefined') return null;
  const fragment = window.location.hash.replace(/^#/, '');
  if (fragment) {
    window.history.replaceState(null, '', PHOTO_HANDOFF_PATH);
    takenCode = /^[A-Za-z0-9_-]{43}$/.test(fragment) ? fragment : null;
  }
  return takenCode;
}

type Phase =
  | { kind: 'loading' }
  | { kind: 'ready' }
  | { kind: 'sending' }
  | { kind: 'stopped'; text: string };

export default function PhotoHandoff() {
  const [code] = useState(takeCode);
  const [peek, setPeek] = useState<Peek | null>(null);
  const [phase, setPhase] = useState<Phase>(code ? { kind: 'loading' } : { kind: 'stopped', text: NO_CODE_TEXT });
  const [sent, setSent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!code) return;
    let alive = true;
    post({ action: 'peek', code })
      .then(({ ok, body }) => {
        if (!alive) return;
        if (!ok) {
          setPhase({ kind: 'stopped', text: handoffErrorText(String(body['error'] ?? '')) });
          return;
        }
        const next: Peek = {
          title: String(body['title'] ?? ''),
          prompt: String(body['prompt'] ?? ''),
          slotsLeft: Number(body['slots_left'] ?? 0),
        };
        setPeek(next);
        setPhase(next.slotsLeft > 0 ? { kind: 'ready' } : { kind: 'stopped', text: ALL_SENT_TEXT });
      })
      .catch(() => alive && setPhase({ kind: 'stopped', text: handoffErrorText('failed') }));
    return () => {
      alive = false;
    };
  }, [code]);

  async function onPick(files: FileList | null) {
    const file = files?.[0];
    if (input.current) input.current.value = '';
    if (!file || !code || !peek) return;
    setError(null);
    setPhase({ kind: 'sending' });
    try {
      const jpeg = await reencodePhoto(file);
      const { ok, body } = await post({ action: 'upload', code, photo: jpeg });
      if (!ok) {
        const reason = String(body['error'] ?? '');
        // A code that has stopped or filled up stops the page; anything else
        // is worth another try with the same code.
        if (['handoff_expired', 'handoff_full', 'handoff_not_here', 'photos_off'].includes(reason)) {
          setPhase({ kind: 'stopped', text: handoffErrorText(reason) });
        } else {
          setError(handoffErrorText(reason));
          setPhase({ kind: 'ready' });
        }
        return;
      }
      const left = Number(body['slots_left'] ?? 0);
      setSent((n) => n + 1);
      setPeek({ ...peek, slotsLeft: left });
      setPhase(left > 0 ? { kind: 'ready' } : { kind: 'stopped', text: ALL_SENT_TEXT });
    } catch (err) {
      setError(err instanceof PhotoError ? photoErrorText(err.code) : handoffErrorText('failed'));
      setPhase({ kind: 'ready' });
    }
  }

  return (
    <main className="min-h-screen bg-surface p-4">
      <div className="mx-auto max-w-md rounded-lg border border-line bg-canvas p-5 shadow-sm" data-photo-handoff>
        <h1 className="text-xl font-bold text-ink">Send a photo of your working</h1>
        {peek ? (
          <div className="mt-3">
            {peek.title ? <p className="text-sm font-medium text-ink">{peek.title}</p> : null}
            {peek.prompt ? <p className="mt-1 text-sm text-muted">{peek.prompt}</p> : null}
          </div>
        ) : null}

        {phase.kind === 'loading' ? <p className="mt-3 text-sm text-muted">Opening…</p> : null}

        {sent > 0 ? (
          <p className="mt-3 text-sm text-ink" aria-live="polite">
            {sent === 1 ? 'Sent. It’s on the Chromebook now.' : `${sent} photos sent.`}
          </p>
        ) : null}

        {phase.kind === 'stopped' ? (
          <p className="mt-3 text-sm text-ink" role="status">{phase.text}</p>
        ) : null}

        {error ? <p className="mt-3 text-sm text-danger" role="alert">{error}</p> : null}

        {phase.kind === 'ready' || phase.kind === 'sending' ? (
          <>
            <p className="mt-3 text-sm text-muted">{PRIVACY_TEXT}</p>
            <input
              ref={input}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => void onPick(e.target.files)}
            />
            <button
              type="button"
              disabled={phase.kind === 'sending'}
              onClick={() => input.current?.click()}
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {phase.kind === 'sending' ? 'Sending…' : sent > 0 ? 'Take another photo' : 'Take a photo'}
            </button>
            {peek && peek.slotsLeft > 1 ? (
              <p className="mt-2 text-xs text-muted">You can send {peek.slotsLeft} more.</p>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
