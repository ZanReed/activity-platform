// =============================================================================
// FactsDemoTeacher.tsx — the demo's second step: what the teacher sees (DR-4)
// -----------------------------------------------------------------------------
// Loaded only when someone presses "See what your teacher sees (demo data)" on
// the demo's done screen. It renders the REAL results screen on invented data
// (practice/demoResults.ts) under a banner that says so. Like the rest of the
// demo it reads and sends nothing.
//
// It is a SEPARATE step on purpose: showing a rate against a floor on the done
// screen itself would break the no-comparison rule for anyone who opens the
// public link (DR-4 amended the first wording for exactly that).
// =============================================================================

import { DEMO_RESULTS } from '../practice/demoResults';
import { Results } from './FactsTeacher';
import '../practice/factsTeacher.css';

export default function FactsDemoTeacher({ onBack }: { onBack: () => void }) {
    return (
        <main className="ft-page">
            <div className="ft-wrap">
                <p className="ft-note" role="note" style={{ marginTop: 0 }}>
                    This is a demo. The class, the names and every number below are invented.
                    Nothing you did in the demo is shown here, because nothing was saved.
                </p>
                <h1 className="ft-h1" style={{ marginTop: 16 }}>
                    Number facts snapshot
                </h1>
                <Results data={DEMO_RESULTS} onBack={onBack} backLabel="← Back to the demo" />
            </div>
        </main>
    );
}
