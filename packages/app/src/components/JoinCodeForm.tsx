/**
 * The join-by-code input (design §12, OV#7's interaction spec): visible
 * label, uppercase-on-input, 6-char gate on the button, Enter submits, paste
 * trimmed, disabled + "Joining…" while in flight, inline per-case error with
 * the typed code PRESERVED. Used by the student Home (both states) — the
 * /join/:code route auto-submits and only needs the error rendering.
 */
import { useState, type FormEvent } from 'react';
import { joinClass, type JoinedClass } from '../lib/classes';
import { classifyJoinError, JOIN_ERROR_COPY } from '../lib/authMessages';
import { BTN_PRIMARY } from './AuthScreens';

export const JOIN_CODE_LENGTH = 6;

/** Uppercase, strip whitespace (paste tolerance), cap at 6. */
export function normalizeJoinCodeInput(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, '').slice(0, JOIN_CODE_LENGTH);
}

export function JoinCodeForm({
  onJoined,
  centered,
  inputId,
}: {
  onJoined: (joined: JoinedClass) => void;
  centered?: boolean;
  inputId: string;
}) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorCopy, setErrorCopy] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || code.length !== JOIN_CODE_LENGTH) return;
    setBusy(true);
    setErrorCopy(null);
    try {
      const joined = await joinClass(code);
      setCode('');
      onJoined(joined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // The code stays in the input — retyping it is the punishment the
      // design forbids (OV#1).
      setErrorCopy(JOIN_ERROR_COPY[classifyJoinError(message)]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={centered ? 'text-center' : ''}>
      <label
        htmlFor={inputId}
        className={`mb-1 block text-sm font-semibold text-ink ${centered ? 'text-center' : ''}`}
      >
        Class code
      </label>
      <div className={`flex items-center gap-2.5 ${centered ? 'justify-center' : ''}`}>
        <input
          id={inputId}
          value={code}
          onChange={(e) => setCode(normalizeJoinCodeInput(e.target.value))}
          placeholder="ABC123"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="w-[11ch] rounded-md border border-line-strong bg-canvas px-3 py-2 text-center font-mono text-xl uppercase tracking-[0.35em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
        <button
          type="submit"
          disabled={busy || code.length !== JOIN_CODE_LENGTH}
          className={`${BTN_PRIMARY} disabled:opacity-50`}
        >
          {busy ? 'Joining…' : 'Join'}
        </button>
      </div>
      {errorCopy ? (
        <p role="alert" className={`mt-2 text-sm text-danger ${centered ? 'text-center' : 'text-left'}`}>
          {errorCopy}
        </p>
      ) : null}
    </form>
  );
}
