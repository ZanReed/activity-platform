// The number-facts runner's rules, on a fake clock (D43 slice 1; T5's
// "unit tests on a fake clock"). Every timestamp below is passed explicitly —
// the same way the React layer passes each DOM event's own timeStamp.
import { describe, expect, it } from 'vitest';
import { ANSWER_MAX, answersMatch, applyKey, canSubmit, displayAnswer, keystrokesFor } from '../practice/answerInput';
import { baselineFor, baselineForAttempt, warmupPlan, type TrialResult } from '../practice/baseline';
import { FactRun, GUARD_MS, type AttemptRecord, type ProbeItem } from '../practice/factRun';

const digit = (d: string) => ({ kind: 'digit' as const, digit: d });

/** A seeded generator, so warm-up plans are the same every run. */
function seeded(seed = 1) {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

const ITEMS: ProbeItem[] = [
    { n: 1, display: '7 × 8 = __', spoken: 'seven times eight', answer: '56' },
    { n: 2, display: '−3 − (−5) = __', spoken: 'negative three minus negative five', answer: '2' },
    { n: 3, display: '3/4 = __ as a decimal', spoken: 'three quarters as a decimal', answer: '0.75' },
];

function typeAll(run: FactRun, text: string, source: 'keyboard' | 'keypad', t: number) {
    for (const ch of text) {
        run.key(ch === '-' ? { kind: 'minus' } : ch === '.' ? { kind: 'point' } : digit(ch), source, t);
    }
}

/** Runs the warm-up to the "Warm-up done" card: every trial typed right, at
 *  `perKeyMs` per keystroke, from `source`. Returns the clock after it. */
function warmUp(run: FactRun, source: 'keyboard' | 'keypad', perKeyMs: number, start = 0): number {
    let t = start;
    run.begin();
    while (run.phase.kind === 'warmup') {
        const target = run.currentTrial!.target;
        run.painted(t);
        typeAll(run, target, source, t + 50);
        t += Math.max(GUARD_MS, perKeyMs * (target.length + 1));
        run.enter(source, t);
        t += 10;
    }
    return t;
}

describe('answer entry (CR-16, CR-17)', () => {
    it('toggles a leading minus, allows one point, caps at 8, needs a digit', () => {
        let a = '';
        a = applyKey(a, { kind: 'minus' });
        expect(a).toBe('-');
        expect(canSubmit(a)).toBe(false);
        for (const d of '12') a = applyKey(a, digit(d));
        a = applyKey(a, { kind: 'point' });
        a = applyKey(a, { kind: 'point' });
        a = applyKey(a, digit('5'));
        expect(a).toBe('-12.5');
        a = applyKey(a, { kind: 'minus' });
        expect(a).toBe('12.5');
        for (const d of '99999999') a = applyKey(a, digit(d));
        expect(a.length).toBe(ANSWER_MAX);
        expect(displayAnswer('-24')).toBe('−24');
        expect(keystrokesFor('-24')).toBe(4);
    });

    it('compares numerically (CR-18)', () => {
        expect(answersMatch('.75', '0.75')).toBe(true);
        expect(answersMatch('0.750', '0.75')).toBe(true);
        expect(answersMatch('-24', '-24')).toBe(true);
        expect(answersMatch('24', '-24')).toBe(false);
        expect(answersMatch('-', '0')).toBe(false);
    });
});

describe('the warm-up and the typing baseline (CR-1–CR-4, CR-20, ER-20)', () => {
    it('plans fifteen trials, five per digit count, five carrying a minus or point when the scope uses them', () => {
        const plain = warmupPlan(seeded(), []);
        expect(plain).toHaveLength(15);
        for (const d of [1, 2, 3]) expect(plain.filter((t) => t.digits === d)).toHaveLength(5);
        expect(plain.some((t) => /[-.]/.test(t.target))).toBe(false);
        const special = warmupPlan(seeded(), ['minus', 'point']);
        expect(special.filter((t) => /[-.]/.test(t.target))).toHaveLength(5);
        expect(special.some((t) => t.target.startsWith('-'))).toBe(true);
        expect(special.some((t) => t.target.includes('.') && !t.target.endsWith('0'))).toBe(true);
    });

    it('is the median per keystroke (Enter counts) and needs six valid trials in a modality', () => {
        const trial = (target: string) => ({ target, digits: 2 as const });
        const r = (rtMs: number, modality: 'keyboard' | 'keypad', valid = true): TrialResult => ({
            trial: trial('47'),
            rtMs,
            modality,
            valid,
        });
        const five = [300, 330, 360, 390, 420].map((ms) => r(ms, 'keyboard'));
        expect(baselineFor(five, 'keyboard')).toBeNull();
        const six = [...five, r(450, 'keyboard'), r(9000, 'keyboard', false), r(600, 'keypad')];
        // per keystroke = rt / 3 ("47" + Enter): 100..150, median of six = 125
        expect(baselineFor(six, 'keyboard')).toBe(125);
        expect(baselineFor(six, 'keypad')).toBeNull();
    });

    it('a mistyped trial says "Type 47", is not counted, and is repeated', () => {
        const run = new FactRun({ items: ITEMS, ceilingS: 15, rng: seeded() });
        run.begin();
        const target = run.currentTrial!.target;
        run.painted(0);
        typeAll(run, '9', 'keyboard', 10);
        run.enter('keyboard', 400);
        expect(run.hint).toEqual({ retype: target });
        expect(run.answer).toBe('');
        expect(run.currentTrial!.target).toBe(target);
        typeAll(run, target, 'keyboard', 500);
        run.enter('keyboard', 900);
        const t = warmUp(run, 'keyboard', 150, 1000);
        expect(t).toBeGreaterThan(0);
        // 15 planned + 1 repeat
        expect(run.trialIndex).toBe(16);
    });

    it('sets a baseline for the modality used, none for the other', () => {
        const run = new FactRun({ items: ITEMS, ceilingS: 15, rng: seeded() });
        warmUp(run, 'keypad', 400);
        expect(run.phase.kind).toBe('warmupDone');
        expect(run.baselines.keypad).toBe(400);
        expect(run.baselines.keyboard).toBeNull();
        expect(baselineForAttempt(run.baselines, 'keyboard')).toEqual({ msPerKey: 400, flagged: true });
    });
});

describe('the facts (the measurement, DR-10, DR-11, ER-12, ER-23)', () => {
    function ready(onAttempt?: (a: AttemptRecord) => void) {
        const run = new FactRun({ items: ITEMS, ceilingS: 15, rng: seeded(), ...(onAttempt ? { onAttempt } : {}) });
        warmUp(run, 'keyboard', 200);
        run.proceed();
        return run;
    }

    it('times from paint to the submit event, with the offset from the first paint', () => {
        const got: AttemptRecord[] = [];
        const run = ready((a) => got.push(a));
        run.painted(10_000);
        typeAll(run, '56', 'keyboard', 10_500);
        run.enter('keyboard', 11_234);
        run.painted(11_300);
        typeAll(run, '2', 'keyboard', 11_400);
        run.enter('keyboard', 12_000);
        expect(got).toEqual([
            { n: 1, typed: '56', skipped: false, interrupted: false, rtMs: 1234, offsetMs: 0, modality: 'keyboard' },
            { n: 2, typed: '2', skipped: false, interrupted: false, rtMs: 700, offsetMs: 1300, modality: 'keyboard' },
        ]);
    });

    it('ignores Enter and Skip inside the 300 ms guard, and held keys', () => {
        const run = ready();
        run.painted(1000);
        typeAll(run, '56', 'keyboard', 1050);
        run.enter('keyboard', 1000 + GUARD_MS - 1);
        run.skip(1000 + GUARD_MS - 1);
        expect(run.attempts).toHaveLength(0);
        run.key(digit('6'), 'keyboard', 1100, true);
        expect(run.answer).toBe('56');
        run.enter('keyboard', 1400, true);
        expect(run.attempts).toHaveLength(0);
        run.enter('keyboard', 1400);
        expect(run.attempts).toHaveLength(1);
    });

    it('Enter on an empty answer only hints (DR-11); Skip records a skip', () => {
        const run = ready();
        run.painted(0);
        run.enter('keyboard', 500);
        expect(run.hint).toBe('empty');
        expect(run.attempts).toHaveLength(0);
        run.skip(800);
        expect(run.attempts[0]).toMatchObject({ n: 1, skipped: true, rtMs: 800 });
    });

    it('records modality from the source of the keys: keypad, keyboard, or mixed', () => {
        const run = ready();
        run.painted(0);
        typeAll(run, '5', 'keypad', 100);
        typeAll(run, '6', 'keyboard', 200);
        run.enter('keypad', 400);
        expect(run.attempts[0]!.modality).toBe('mixed');
        run.painted(500);
        typeAll(run, '2', 'keypad', 600);
        run.enter('keypad', 900);
        expect(run.attempts[1]!.modality).toBe('keypad');
    });

    it('a hidden page interrupts the fact, shows Paused, and does not ask it again (DR-10)', () => {
        const run = ready();
        run.painted(0);
        typeAll(run, '5', 'keyboard', 100);
        run.interrupt(2000);
        expect(run.phase.kind).toBe('paused');
        expect(run.attempts[0]).toMatchObject({ n: 1, interrupted: true });
        run.proceed();
        expect(run.currentItem!.n).toBe(2);
    });

    it('a page hidden BEFORE a fact is painted pauses without consuming or timing it', () => {
        const run = ready();
        run.painted(0);
        typeAll(run, '56', 'keyboard', 100);
        run.enter('keyboard', 500);
        // Item 2 is committed but its clock has not started when the page hides.
        run.interrupt(520);
        expect(run.phase.kind).toBe('paused');
        expect(run.attempts).toHaveLength(1);
        // A late paint callback while paused starts nothing.
        run.painted(600);
        expect(run.isPainted).toBe(false);
        run.proceed();
        expect(run.currentItem!.n).toBe(2);
        run.painted(9000);
        typeAll(run, '2', 'keyboard', 9100);
        run.enter('keyboard', 9800);
        expect(run.attempts[1]).toMatchObject({ n: 2, interrupted: false, rtMs: 800 });
    });

    it('"Stuck? Skip is fine." at the ceiling on NET time (CR-11)', () => {
        const run = ready();
        // keyboard baseline: 200 ms a keystroke; nothing typed = 1 keystroke (Enter)
        run.painted(0);
        expect(run.stuckAt(15_000)).toBe(false); // net 14 800
        expect(run.stuckAt(15_200)).toBe(true); // net 15 000
        expect(run.tick(15_200)).toBe(true);
        expect(run.hint).toBe('stuck');
    });

    it('the done screen counts right-and-within-the-ceiling, skips, and not-counted (DR-3, CR-6)', () => {
        const run = ready();
        run.painted(0);
        typeAll(run, '56', 'keyboard', 100);
        run.enter('keyboard', 40_000); // right but over the ceiling: not counted right
        run.painted(40_100);
        run.skip(41_000);
        run.painted(41_100);
        typeAll(run, '.75', 'keyboard', 41_200);
        run.enter('keyboard', 42_000);
        expect(run.phase.kind).toBe('done');
        expect(run.summary()).toEqual({ right: 1, skipped: 1, notCounted: 0 });
    });
});

describe('a two-part check (migration 0047)', () => {
    const TWO: ProbeItem[] = [
        { n: 1, display: '7 × 8 = __', spoken: 'seven times eight', answer: '56', part: 1 },
        { n: 2, display: '9 × 6 = __', spoken: 'nine times six', answer: '54', part: 1 },
        { n: 3, display: '3/4 = __ %', spoken: 'three quarters as a percentage', answer: '75', part: 2 },
        { n: 4, display: '−3 − 8 = __', spoken: 'negative three minus eight', answer: '-11', part: 2 },
        { n: 5, display: '1 cm = __ mm', spoken: 'one centimetre is how many millimetres', answer: '10', part: 2 },
    ];
    function ready() {
        const run = new FactRun({ items: TWO, ceilingS: 15, rng: seeded() });
        warmUp(run, 'keyboard', 200);
        run.proceed();
        return run;
    }
    const answer = (run: FactRun, text: string, t: number) => {
        run.painted(t);
        typeAll(run, text, 'keyboard', t + 100);
        run.enter('keyboard', t + 500);
    };

    it('knows its parts, and one-part lists are unchanged', () => {
        const run = ready();
        expect(run.partCount).toBe(2);
        expect([run.partSize(1), run.partSize(2)]).toEqual([2, 3]);
        expect(new FactRun({ items: ITEMS, ceilingS: 15 }).partCount).toBe(1);
    });

    it('stops for a break after the last fact of Part 1 and starts Part 2 only on request', () => {
        const run = ready();
        expect(run.progress).toEqual({ done: 0, total: 2 });
        answer(run, '56', 0);
        expect(run.phase.kind).toBe('item');
        expect(run.progress).toEqual({ done: 1, total: 2 });
        answer(run, '54', 1000);
        expect(run.phase.kind).toBe('partBreak');
        expect(run.currentPart).toBe(2);
        // Nothing is painted or timed during the break.
        run.painted(50_000);
        expect(run.isPainted).toBe(false);
        expect(run.attempts).toHaveLength(2);
        run.proceed();
        expect(run.phase.kind).toBe('item');
        expect(run.currentItem!.n).toBe(3);
        // The bar starts again for Part 2.
        expect(run.progress).toEqual({ done: 0, total: 3 });
        // The break is not counted in the next fact's time.
        answer(run, '75', 900_000);
        expect(run.attempts[2]).toMatchObject({ n: 3, rtMs: 500 });
    });

    it('an interruption on the last fact of Part 1 shows Paused, then the break', () => {
        const run = ready();
        answer(run, '56', 0);
        run.painted(1000);
        run.interrupt(2000);
        expect(run.phase.kind).toBe('paused');
        run.proceed();
        expect(run.phase.kind).toBe('partBreak');
        run.proceed();
        expect(run.currentItem!.n).toBe(3);
    });

    it('runs through Part 2 to the done screen, counting both parts', () => {
        const run = ready();
        answer(run, '56', 0);
        answer(run, '54', 1000);
        run.proceed();
        answer(run, '75', 5000);
        answer(run, '-11', 6000);
        answer(run, '10', 7000);
        expect(run.phase.kind).toBe('done');
        expect(run.summary()).toEqual({ right: 5, skipped: 0, notCounted: 0 });
    });
});

// ---- the sprint (D43 slice 2; SP-8, SP-9, SP-11, SP-12) -------------------------
describe('a sprint session', () => {
    const FAMILY = {
        family_id: 'fam.a', name: 'Fam A', mode: 'strategy' as const, show_strategy: true,
        strategy: { intro: 'Think.', lines: [], example: null },
    };
    const items = (count: number): ProbeItem[] =>
        Array.from({ length: count }, (_, i) => ({
            n: i + 1, display: `${i + 1} + 0 = __`, spoken: `fact ${i + 1}`, answer: String(i + 1), family_id: 'fam.a',
        }));
    function sprint(count: number, extra: Partial<NonNullable<ConstructorParameters<typeof FactRun>[0]['sprint']>> = {}, baselines: { keyboard: number | null; keypad: number | null } = { keyboard: 200, keypad: null }) {
        const saved: AttemptRecord[] = [];
        const run = new FactRun({
            items: items(count), ceilingS: 15, rng: seeded(),
            onAttempt: (a) => saved.push(a),
            resume: { index: 0, baselines, prior: { right: 0, skipped: 0, notCounted: 0 } },
            sprint: { boxMs: 300_000, reaskGap: 3, families: [FAMILY], ...extra },
        });
        return { run, saved };
    }
    /** Answers the fact on screen; returns the clock after it. */
    function answer(run: FactRun, typed: string | null, t: number, rt = 1000): number {
        run.painted(t);
        if (typed === null) run.skip(t + rt);
        else {
            typeAll(run, typed, 'keyboard', t + 100);
            run.enter('keyboard', t + rt);
        }
        return t + rt + 10;
    }

    it('shows the marked strategy before the first fact, and no intro or warm-up when a baseline exists', () => {
        const { run } = sprint(3);
        expect(run.phase).toEqual({ kind: 'strategy', familyId: 'fam.a' });
        expect(run.shownStrategy?.name).toBe('Fam A');
        run.proceed();
        expect(run.phase.kind).toBe('item');
        expect(run.currentItem?.n).toBe(1);
    });

    it('runs the warm-up first when the session has no baseline at all', () => {
        const { run } = sprint(3, { families: [] }, { keyboard: null, keypad: null });
        expect(run.phase.kind).toBe('warmup');
    });

    it('a miss shows the answer until the student goes on, and the fact returns ONCE, three facts later (SP-11)', () => {
        const { run, saved } = sprint(6, { families: [] });
        let t = answer(run, '99', 0); // fact 1: wrong
        expect(run.phase).toMatchObject({ kind: 'feedback', item: { n: 1 } });
        run.proceed();
        const order: string[] = [];
        while (run.phase.kind !== 'done') {
            if (run.phase.kind === 'feedback') { run.proceed(); continue; }
            const item = run.currentItem!;
            order.push(String(item.n));
            // the repeat of fact 1 is missed AGAIN: it must not come back a third time
            t = answer(run, item.n === 1 ? '98' : item.answer, t);
        }
        expect(order.join(',')).toBe('2,3,4,1,5,6');
        expect(saved.filter((a) => a.n === 1).map((a) => a.reask)).toEqual([false, true]);
        expect(saved.filter((a) => a.n !== 1).every((a) => a.reask === false)).toBe(true);
    });

    it('a skip is a miss; a miss on the last fact has no repeat (it would only be copying)', () => {
        const { run, saved } = sprint(2, { families: [] });
        const t = answer(run, '1', 0);
        answer(run, null, t); // skip the last fact
        expect(run.phase).toMatchObject({ kind: 'feedback', item: { n: 2 } });
        run.proceed();
        expect(run.phase.kind).toBe('done');
        expect(saved).toHaveLength(2);
    });

    it('the time box: once the answering time has passed, the fact just answered was the last (SP-12)', () => {
        const { run, saved } = sprint(10, { families: [], boxMs: 2500 });
        let t = 0;
        while (run.phase.kind === 'item') t = answer(run, run.currentItem!.answer, t, 1000);
        // 1000 + 1000 + 1000 >= 2500 → three facts, then done
        expect(run.phase.kind).toBe('done');
        expect(saved).toHaveLength(3);
    });

    it('reopening the strategy from a fact stores the attempt as interrupted and returns to the next fact (SP-9)', () => {
        const { run, saved } = sprint(3);
        run.proceed();
        run.painted(0);
        expect(run.reopenableStrategy?.family_id).toBe('fam.a');
        run.openStrategy(4000);
        expect(run.phase).toEqual({ kind: 'strategy', familyId: 'fam.a' });
        expect(saved).toEqual([expect.objectContaining({ n: 1, interrupted: true, reask: false })]);
        run.proceed();
        expect(run.currentItem?.n).toBe(2);
    });

    it('a family in practice mode cannot reopen its strategy from a fact', () => {
        const { run } = sprint(2, { families: [{ ...FAMILY, mode: 'practice' }] });
        run.proceed();
        expect(run.reopenableStrategy).toBeNull();
    });

    it('a resume skips what is saved, shows no strategy again, and still owes a missed fact its repeat', () => {
        const { run } = sprint(6, { saved: [{ n: 1, reask: false, missed: true }, { n: 2, reask: false, missed: false }] });
        const order: number[] = [];
        let t = 0;
        while (run.phase.kind !== 'done') {
            order.push(run.currentItem!.n);
            t = answer(run, run.currentItem!.answer, t);
        }
        expect(order).toEqual([3, 4, 5, 1, 6]);
    });

    it('the check is unchanged: no feedback, no repeat, attempts carry no reask', () => {
        const saved: AttemptRecord[] = [];
        const run = new FactRun({ items: ITEMS, ceilingS: 15, rng: seeded(), onAttempt: (a) => saved.push(a) });
        const t = warmUp(run, 'keyboard', 200);
        run.proceed();
        answer(run, '99', t);
        expect(run.phase.kind).toBe('item');
        expect(run.currentItem?.n).toBe(2);
        expect('reask' in saved[0]!).toBe(false);
    });
});
