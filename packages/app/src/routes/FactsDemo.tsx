// =============================================================================
// FactsDemo.tsx — /facts/demo, the public preview of the number-facts check
// -----------------------------------------------------------------------------
// D43 slice 1, the scope review's preview mode as amended by DR-4: the SAME
// runner a student uses, on a fixed demo list, under a banner saying nothing is
// saved. It stores and uploads NOTHING — no save port, no sessionStorage — so
// it is the rehearsal surface for a teacher ("Try the demo first") and the
// account-free target for end-to-end tests. It ends on the student's own done
// screen. (DR-4's second step, "See what your teacher sees (demo data)", comes
// with the teacher results screen.)
//
// Public and lazy: no RequireAuth, nothing read from the session. Join codes
// never contain the letter O, so "demo" can never be a real class code once
// /facts/:CODE exists (ruling S-7 ships that route after migration 0045).
// =============================================================================

import { useState } from 'react';
import FactRunner from '../practice/FactRunner';
import { DEMO_CEILING_S, DEMO_ITEMS } from '../practice/demoItems';

export default function FactsDemo() {
    // A new key remounts the runner: "Run the demo again" starts from the intro.
    const [round, setRound] = useState(0);
    return (
        <main className="fx-stage">
            <p className="fx-banner" role="note">
                This is a demo. Nothing you type is saved.
            </p>
            <FactRunner
                key={round}
                items={DEMO_ITEMS}
                ceilingS={DEMO_CEILING_S}
                savedLine="This was the demo, so nothing was saved. It is not marked."
                doneAction={{ label: 'Run the demo again', onClick: () => setRound((r) => r + 1) }}
            />
        </main>
    );
}
