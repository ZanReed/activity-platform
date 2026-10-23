// =============================================================================
// MixedDone.tsx — the end of a practice (D43 mixed practice, slice 3)
// -----------------------------------------------------------------------------
// Two shapes (mixed-practice.md DM-11 as amended by C-146; slice 3 ruling 3):
//
//   finished   "You got 4 of 6 right." (+ "You skipped 1.") + "See you next
//              lesson." In a class recording a score, ONE more line: "Practice
//              score: 4 of 6 (you answered 5 of 6)." The score appears only
//              here. Then DM-7: "Practise again" only when the server can plan
//              at least one more question, else "That's everything for today."
//   stopped    Stop for now: the session stays open for later today. The
//              counts cover what was tried; no score line, no Practise again.
//
// The words never say "session", "mixed", "planned" or "graded" (DM-13).
// =============================================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BTN_PRIMARY } from '../components/AuthScreens';
import { previewMixed } from '../lib/mixedPractice';
import { Card } from './PracticeCard';

export interface MixedTally {
    /** finished: the questions in the practice; stopped: the ones tried. */
    of: number;
    right: number;
    /** Tried and not skipped. */
    answered: number;
    skipped: number;
}

export type MixedDoneProps =
    | {
          kind: 'finished';
          tally: MixedTally;
          graded: boolean;
          classId: string;
          onAgain: () => void;
      }
    | { kind: 'stopped'; tally: MixedTally };

export default function MixedDone(props: MixedDoneProps) {
    const { tally } = props;
    const skippedLine =
        tally.skipped > 0 ? (
            <p className="mt-2 text-base text-muted">You skipped {tally.skipped}.</p>
        ) : null;

    if (props.kind === 'stopped') {
        return (
            <Card title="Stopped for now">
                {tally.of > 0 ? (
                    <p className="mt-2 text-base text-strong" data-testid="mx-done-right">
                        You got {tally.right} of {tally.of} right.
                    </p>
                ) : (
                    <p className="mt-2 text-base text-strong">Nothing answered yet.</p>
                )}
                {skippedLine}
                <p className="mt-2 text-base text-muted">You can carry on later today.</p>
                <Link to="/" className={`mt-4 inline-block w-full ${BTN_PRIMARY}`}>
                    Go to your classes
                </Link>
            </Card>
        );
    }

    return (
        <Card title="Practice done">
            <p className="mt-2 text-base text-strong" data-testid="mx-done-right">
                You got {tally.right} of {tally.of} right.
            </p>
            {skippedLine}
            {props.graded ? (
                <p className="mt-2 text-base text-strong" data-testid="mx-done-score">
                    Practice score: {tally.right} of {tally.of} (you answered {tally.answered} of {tally.of}).
                </p>
            ) : null}
            <p className="mt-2 text-base text-muted">See you next lesson.</p>
            <Again classId={props.classId} onAgain={props.onAgain} />
            <Link to="/" className={`mt-4 inline-block w-full ${BTN_PRIMARY}`}>
                Go to your classes
            </Link>
        </Card>
    );
}

/** DM-7: asks the server (a preview writes nothing) whether one more question
 * can be planned. Until it answers, nothing is shown; a failed read shows
 * nothing too, since the class link offers it again next time. */
function Again({ classId, onAgain }: { classId: string; onAgain: () => void }) {
    const [more, setMore] = useState<boolean | null>(null);
    useEffect(() => {
        let live = true;
        previewMixed(classId).then(
            (p) => live && setMore(p.state === 'ready' && p.planned > 0),
            () => live && setMore(null),
        );
        return () => {
            live = false;
        };
    }, [classId]);
    if (more === null) return null;
    if (!more) return <p className="mt-2 text-base text-muted">That’s everything for today.</p>;
    return (
        <button type="button" className="mt-2 min-h-11 text-sm font-medium text-strong underline" onClick={onAgain}>
            Practise again
        </button>
    );
}
