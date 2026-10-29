// =============================================================================
// DolPractice.tsx — targeted practice between DoL tries (D65 slice 2)
// -----------------------------------------------------------------------------
// docs/design/dol-targeted-practice.md TP-1, TP-5, TP-6. LAZY (App.tsx): the
// student reaches it only from the DoL's "Practise this skill first", so none
// of it is in the shell.
//
// /a/:activityId/practice/:versionId. The server decides everything
// (start_dol_practice, as the caller): whether practice is open at all (a
// first try in, not passed, a retake left — one "Not available" otherwise),
// the 4 questions (the first try's misconceptions first), and their numbers.
// The questions run in mixed practice's runner on its own check mode; there
// is no score (TP-5), and the done screen points back to the DoL.
// =============================================================================

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { CheckError, type DolPracticeStartResult, type PracticeSession } from '@activity/viewer';
import { useSession } from '../lib/SessionContext';
import { startDolPractice } from '../lib/mixedPractice';
import MixedRunner from '../practice/MixedRunner';
import type { MixedTally } from '../practice/MixedDone';
import { CARD } from '../practice/PracticeCard';
import '../practice/practice.css';
import '../practice/mixed.css';

type State =
    | { kind: 'loading' }
    | { kind: 'closed' }
    | { kind: 'nothing' }
    | { kind: 'error' }
    | { kind: 'ready'; session: PracticeSession };

export const DOL_PRACTICE_COPY = {
    title: 'Practise this skill',
    closed: 'This practice isn’t open. It opens after your first try at the check, until you pass it or use your new version.',
    nothing: 'There’s nothing to practise on this skill yet.',
    error: 'Couldn’t load the practice. Go back and try again.',
    back: 'Back to the activity',
    done: (t: MixedTally) => `You tried ${t.answered + t.skipped} of ${t.of}${t.right > 0 ? `, ${t.right} right` : ''}.`,
    next: 'Your new version of the check opens on your next practice day.',
} as const;

/** The runner's session shape from the DoL start (TP-5: no score, no day). */
function asRunnerSession(result: DolPracticeStartResult): PracticeSession | null {
    const s = result.session;
    if (!s) return null;
    return {
        sessionId: s.sessionId,
        practiceDay: '',
        planned: s.planned,
        graded: false,
        scoreRight: 0,
        scoreAnswered: 0,
        finished: s.finished,
        items: s.items,
    };
}

export default function DolPractice() {
    const { activityId = '', versionId = '' } = useParams();
    const { session } = useSession();
    const userId = session?.user.id ?? null;
    const [state, setState] = useState<State>({ kind: 'loading' });

    const load = useCallback(async () => {
        setState({ kind: 'loading' });
        try {
            const result = await startDolPractice(activityId, versionId);
            if (result.state === 'nothing_to_practise') return setState({ kind: 'nothing' });
            const runner = asRunnerSession(result);
            setState(runner ? { kind: 'ready', session: runner } : { kind: 'error' });
        } catch (err) {
            setState({ kind: err instanceof CheckError && err.kind === 'unavailable' ? 'closed' : 'error' });
        }
    }, [activityId, versionId]);

    useEffect(() => {
        if (userId) void load();
    }, [userId, load]);

    const back = (
        <Link to={`/a/${activityId}`} className="mx-link">
            {DOL_PRACTICE_COPY.back}
        </Link>
    );
    const frame = (body: ReactNode) => (
        <main className="fx-stage" aria-labelledby="dol-practice-h">
            <h1 id="dol-practice-h" className="sr-only">
                {DOL_PRACTICE_COPY.title}
            </h1>
            {body}
        </main>
    );

    const card = (body: ReactNode, alert = false) =>
        frame(
            <div className={CARD} {...(alert ? { role: 'alert' } : {})}>
                {body}
            </div>,
        );
    if (!userId || state.kind === 'loading') return card(<p role="status" className="text-muted">Getting things ready…</p>);
    if (state.kind === 'closed') return card(<><p className="text-base text-strong">{DOL_PRACTICE_COPY.closed}</p>{back}</>);
    if (state.kind === 'nothing') return card(<><p className="text-base text-strong">{DOL_PRACTICE_COPY.nothing}</p>{back}</>);
    if (state.kind === 'error') return card(<><p className="text-base text-strong">{DOL_PRACTICE_COPY.error}</p>{back}</>, true);
    return frame(
        <MixedRunner
            session={state.session}
            userId={userId}
            classId=""
            checkMode="dol-practice"
            onAgain={() => void load()}
            onEnded={() => void load()}
            done={(tally) => (
                <div className={CARD} aria-live="polite">
                    <p className="text-base text-strong">{DOL_PRACTICE_COPY.done(tally)}</p>
                    <p className="mt-2 text-base text-muted">{DOL_PRACTICE_COPY.next}</p>
                    {back}
                </div>
            )}
        />,
    );
}
