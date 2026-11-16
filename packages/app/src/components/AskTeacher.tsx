// =============================================================================
// components/AskTeacher.tsx — "Ask my teacher" in a check group's footer
// (S9, docs/design/ask-my-teacher.md ST-7/9/10)
// -----------------------------------------------------------------------------
// Drawn by StudentViewer through ViewerContainer's `groupAside`, LAZILY: the
// shell carries only the state read (lib/helpRequests.ts), and this chunk
// loads once there is someone to ask. A request is about the group's FIRST
// section (the group is what one Check covers).
//
// ONE button whose label changes ("Ask my teacher" ⇄ "I've got it now"), so a
// keyboard user's focus stays put when it flips. It is never `disabled`
// while a call is in flight: disabling the focused button sends focus to the
// body (the trap ViewerContainer's D6 describes), so busy is `aria-disabled`
// plus an early return. The note beside it is the live region that says what
// happened. The words promise only that the teacher CAN see it, never that
// they will come (ST-8).
// =============================================================================

import { useState } from 'react';
import type { HelpState } from '../lib/helpRequests';
import { askErrorWords, askTeacher, withdrawHelp } from '../lib/helpRequestsAsk';

export default function AskTeacher({
    versionId,
    sectionId,
    state,
    onState,
}: {
    versionId: string;
    sectionId: string;
    state: HelpState;
    onState: (next: HelpState) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [withdrew, setWithdrew] = useState(false);
    const asked = state.open.has(sectionId);
    const note =
        error ??
        (asked
            ? 'Asked. Your teacher can see this.'
            : withdrew
              ? 'OK, you’re not asking now.'
              : state.done.has(sectionId)
                ? 'Your teacher marked this done.'
                : '');
    const press = () => {
        if (busy) return;
        setBusy(true);
        setError(null);
        const wasAsked = asked;
        (wasAsked ? withdrawHelp(versionId, sectionId) : askTeacher(versionId, sectionId)).then(
            (next) => {
                setBusy(false);
                setWithdrew(wasAsked);
                onState(next);
            },
            (e: unknown) => {
                setBusy(false);
                setError(askErrorWords(e instanceof Error ? e.message : ''));
            },
        );
    };
    return (
        <div className="viewer-ask" data-ask-teacher={asked ? 'asked' : 'idle'}>
            <p className="viewer-ask__note" aria-live="polite">
                {note}
            </p>
            <button
                type="button"
                className="viewer-ask__button"
                aria-disabled={busy || undefined}
                onClick={press}
            >
                {asked ? 'I’ve got it now' : 'Ask my teacher'}
            </button>
        </div>
    );
}
