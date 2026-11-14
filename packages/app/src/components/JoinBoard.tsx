// =============================================================================
// JoinBoard.tsx — a class's join code, full screen, for the projector
// -----------------------------------------------------------------------------
// Day one of a class is thirty students typing a code off the board. The card's
// code chip is sized for the teacher's screen, so this shows it large, with the
// link, on a plain full-window sheet. Copy instructions gives the same words
// as text to post (a class page, an email). Lazy: only a click loads it, so it
// costs the Classes journey nothing.
// =============================================================================

import { useRef, useState } from 'react';
import { useDialogFocus } from '../lib/useDialogFocus';

export default function JoinBoard({
    className,
    code,
    url,
    instructions,
    onClose,
}: {
    className: string;
    code: string;
    url: string;
    /** joinInstructions(...), built by the caller (keeps this chunk free of
     *  lib/classTeacher, which would otherwise fold into the Classes chunk). */
    instructions: string;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const onKeyDown = useDialogFocus(ref, onClose, '[data-board-close]');
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(instructions);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard unavailable: the words are on screen to read.
        }
    };
    return (
        <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={`Join code for ${className}`}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-canvas p-6 text-center outline-none"
            data-join-board
        >
            <p className="text-2xl font-semibold text-strong">Join {className}</p>
            <p className="text-lg text-muted">Go to</p>
            <p className="break-all font-mono text-3xl font-semibold text-ink">{url.replace(/^https?:\/\//, '')}</p>
            <p className="text-lg text-muted">and sign in with your school Google account. The class code is</p>
            <p className="font-mono text-7xl font-bold tracking-[0.25em] text-ink sm:text-9xl">{code}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => void copy()}
                    className="min-h-[44px] rounded-md border border-line-strong px-4 text-sm font-medium text-ink transition hover:bg-surface"
                >
                    {copied ? 'Copied' : 'Copy instructions'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    data-board-close
                    className="min-h-[44px] rounded-md bg-ink px-4 text-sm font-semibold text-canvas"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
