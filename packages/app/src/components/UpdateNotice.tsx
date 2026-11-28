import { useEffect, useState } from 'react';
import { isUpdateReady, onUpdateReady, updateCause, type UpdateCause } from '../lib/swRegistration';

// =============================================================================
// UpdateNotice — "this page has been updated; refresh when you are ready"
// -----------------------------------------------------------------------------
// Shown when a newer build has arrived under an open tab that is in use
// (touched, or simply open past its first seconds) (lib/swRegistration.ts, job 4),
// or when a part of the page would not load (a lazy chunk); that case gets
// its own sentence, true whether the cause was a deploy or the network. The page is NEVER
// reloaded for them (author ruling, 2026-10-04): they are told, advised to keep
// a copy of anything unsaved, and given the button.
//
// Inline styles on purpose: this sits in the student shell, whose stylesheet
// has about 300 bytes of headroom, and it is one bar.
// =============================================================================

/** A part of the page failed to load: a deploy or the network, so the words
 *  must be true of both. The author chose this wording on 2026-11-28 (option A of three). */
const PART_TEXT =
  'Part of this page didn’t load. Finish what you are doing and copy anything you have not saved, then refresh to try again.';

export default function UpdateNotice() {
  // The cause, not a flag: a real update arriving after a failed part must
  // change the words of a notice that is already up.
  const [cause, setCause] = useState(() => (isUpdateReady() ? updateCause() : null));
  // "Later" hides THIS cause only: a real update arriving after a dismissed
  // failed part is news, and shows (Fable review, 2026-11-28).
  const [dismissed, setDismissed] = useState<UpdateCause | null>(null);
  useEffect(() => onUpdateReady(() => setCause(updateCause())), []);
  if (!cause || dismissed === cause) return null;

  return (
    <div
      role="status"
      data-update-notice=""
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '1rem',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        maxWidth: 'min(40rem, calc(100vw - 2rem))',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.5rem 0.75rem',
        padding: '0.6rem 0.9rem',
        borderRadius: '0.5rem',
        background: '#0f172a',
        color: '#f8fafc',
        boxShadow: '0 4px 16px rgb(0 0 0 / 0.3)',
        fontSize: '0.9rem',
        lineHeight: 1.35,
      }}
    >
      <span style={{ flex: '1 1 16rem' }}>
        {cause === 'update'
          ? 'This page has been updated. Finish what you are doing and copy anything you have not saved, then refresh to get the new version.'
          : PART_TEXT}
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          padding: '0.35rem 0.8rem',
          borderRadius: '0.375rem',
          border: '1px solid #f8fafc',
          background: '#f8fafc',
          color: '#0f172a',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Refresh now
      </button>
      <button
        type="button"
        onClick={() => setDismissed(cause)}
        style={{
          padding: '0.35rem 0.6rem',
          borderRadius: '0.375rem',
          border: '1px solid #64748b',
          background: 'transparent',
          color: '#f8fafc',
          cursor: 'pointer',
        }}
      >
        Later
      </button>
    </div>
  );
}
