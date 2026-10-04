// =============================================================================
// demoItems.ts — the fixed item list /facts/demo runs (the preview, X2)
// -----------------------------------------------------------------------------
// The SAME shape a real probe row stores (ER-6): finished display and spoken
// strings and an answer, filled once by the importer's expander (CR-21). These
// ten were copied from the live mirror's rows (revision ac8f9fd2…) so the demo
// shows exactly what students will see, including the true minus, a bracketed
// negative, a decimal answer and a listed unit fact. Short on purpose: a
// rehearsal, not a probe. Nothing here is ever saved (no save port).
// =============================================================================

import type { ProbeItem } from './factRun';

export const DEMO_ITEMS: ProbeItem[] = [
    { n: 1, display: '7 × 8 = __', spoken: 'seven times eight', answer: '56' },
    { n: 2, display: '63 ÷ 9 = __', spoken: 'sixty-three divided by nine', answer: '7' },
    { n: 3, display: '12² = __', spoken: 'twelve squared', answer: '144' },
    { n: 4, display: '3/4 = __ as a decimal', spoken: 'three quarters as a decimal', answer: '0.75' },
    { n: 5, display: '−3 − (−5) = __', spoken: 'negative three minus negative five', answer: '2' },
    { n: 6, display: '√81 = __', spoken: 'the square root of eighty-one', answer: '9' },
    { n: 7, display: '6 × (−4) = __', spoken: 'six times negative four', answer: '-24' },
    { n: 8, display: '1 m = __ cm', spoken: 'one metre is how many centimetres', answer: '100' },
    { n: 9, display: '2/5 = __ %', spoken: 'two fifths as a percentage', answer: '40' },
    { n: 10, display: '4³ = __', spoken: 'four cubed', answer: '64' },
];

/** The demo's ceiling: the registry's interim value (their item 15). */
export const DEMO_CEILING_S = 15;
