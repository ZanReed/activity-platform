// =============================================================================
// FactsDemo.tsx — /facts/demo, the public preview of the number-facts check
// -----------------------------------------------------------------------------
// D43 slice 1, the scope review's preview mode as amended by DR-4: the SAME
// runner a student uses, on a fixed demo list, under a banner saying nothing is
// saved. It stores and uploads NOTHING — no save port, no sessionStorage — so
// it is the rehearsal surface for a teacher ("Try the demo first") and the
// account-free target for end-to-end tests.
//
// It ends on the student's OWN done screen: a count, no rate, no floor, no
// comparison. "See what your teacher sees (demo data)" is a separate step
// (FactsDemoTeacher, loaded on demand) showing the real results screen on
// invented data.
//
// Public and lazy: no RequireAuth, nothing read from the session. Join codes
// never contain the letter O, so "demo" can never be a real class code for
// /facts/:code.
// =============================================================================

import { lazy, Suspense, useState } from 'react';
import FactRunner from '../practice/FactRunner';
import { DEMO_CEILING_S, DEMO_ITEMS } from '../practice/demoItems';

const FactsDemoTeacher = lazy(() => import('./FactsDemoTeacher'));

export default function FactsDemo() {
    // A new key remounts the runner: "Run the demo again" starts from the intro.
    const [round, setRound] = useState(0);
    const [teacherView, setTeacherView] = useState(false);

    // The runner stays MOUNTED (hidden) under the teacher view, so "Back to the
    // demo" returns to the same done screen, not to a fresh intro.
    return (
        <>
        {teacherView ? (
            <Suspense fallback={<main className="fx-stage" role="status">Loading…</main>}>
                <FactsDemoTeacher onBack={() => setTeacherView(false)} />
            </Suspense>
        ) : null}
        <main className="fx-stage" hidden={teacherView}>
            <p className="fx-banner" role="note">
                This is a demo. Nothing you type is saved.
            </p>
            <FactRunner
                key={round}
                items={DEMO_ITEMS}
                ceilingS={DEMO_CEILING_S}
                savedLine="This was the demo, so nothing was saved. It is not marked."
                doneSlot={
                    <>
                        <p className="mt-2 text-base text-muted">
                            This was the demo, so nothing was saved. It is not marked.
                        </p>
                        <button type="button" className="fx-skip" onClick={() => setTeacherView(true)}>
                            See what your teacher sees (demo data)
                        </button>
                    </>
                }
                doneAction={{ label: 'Run the demo again', onClick: () => setRound((r) => r + 1) }}
            />
        </main>
        </>
    );
}
