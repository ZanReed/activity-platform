// =============================================================================
// factRun.ts — one student's run through the number-facts check (D43 slice 1)
// -----------------------------------------------------------------------------
// A pure state machine: every input carries its own timestamp, so the runner's
// timing rules are tested on a fake clock and the React layer only wires DOM
// events to it. Rulings, all in docs/design/practice-blocks.md:
//
//   - The clock starts when an item is PAINTED and stops at the submit event's
//     own timestamp (the measurement). An item is painted only as the direct
//     result of a student action (DR-10).
//   - No feedback during the facts; the warm-up alone says "Type 47" (DR-13).
//   - Enter on an empty answer does nothing but hint (DR-11); Enter, the
//     keypad's Enter AND Skip are ignored for GUARD_MS after paint (ER-23);
//     a held key (auto-repeat) is ignored (ER-12).
//   - Modality per attempt from the SOURCE of its keystrokes: keyboard, keypad,
//     or mixed (ER-12).
//   - The page hidden or focus lost during a fact: the attempt is stored as
//     INTERRUPTED, the runner shows the Paused card, and that fact is NOT asked
//     again (DR-10).
//   - "Stuck? Skip is fine." once NET time reaches the ceiling (CR-11); a
//     timeout itself is decided when results are read, never here (CR-10).
//   - The done screen's count uses the one meaning of "correct": right AND
//     within the ceiling on net time (CR-6). The server derives the stored
//     `correct` (ER-6); this count is the browser's own, for the screen only.
// =============================================================================

import {
    answersMatch,
    applyKey,
    canSubmit,
    keystrokesFor,
    type AnswerKey,
} from './answerInput';
import {
    MAX_EXTRA_PER_DIGIT_COUNT,
    baselineForAttempt,
    baselinesFrom,
    makeTrial,
    warmupPlan,
    type Baselines,
    type Modality,
    type TrialResult,
    type WarmupTrial,
} from './baseline';

export const GUARD_MS = 300;

/** One item as the probe row stores it (ER-6): finished strings, no grammar. */
export interface ProbeItem {
    n: number;
    display: string;
    spoken: string;
    answer: string;
}

/** What the runner hands the save port: the client's FACTS about an attempt.
 *  `correct` is not here — the server derives it (ER-6). */
export interface AttemptRecord {
    n: number;
    typed: string;
    skipped: boolean;
    interrupted: boolean;
    rtMs: number;
    offsetMs: number;
    modality: Modality | 'mixed' | null;
}

export type Phase =
    | { kind: 'intro' }
    | { kind: 'warmup' }
    | { kind: 'warmupDone' }
    | { kind: 'item' }
    | { kind: 'paused' }
    | { kind: 'done' };

export type Hint = null | 'empty' | 'stuck' | { retype: string };

export interface RunOptions {
    items: ProbeItem[];
    ceilingS: number;
    rng?: () => number;
    /** Called once per finished attempt, in order. The demo passes none. */
    onAttempt?: (attempt: AttemptRecord) => void;
}

export class FactRun {
    readonly items: ProbeItem[];
    readonly ceilingMs: number;
    readonly specials: ('minus' | 'point')[];
    private readonly rng: () => number;
    private readonly onAttempt: ((a: AttemptRecord) => void) | undefined;

    phase: Phase = { kind: 'intro' };
    answer = '';
    hint: Hint = null;
    baselines: Baselines = { keyboard: null, keypad: null };
    readonly attempts: AttemptRecord[] = [];

    // warm-up
    private trials: WarmupTrial[] = [];
    trialIndex = 0;
    private readonly trialResults: TrialResult[] = [];
    private trialInvalid = false;
    private readonly extras = { 1: 0, 2: 0, 3: 0 };

    // the current trial or fact
    itemIndex = 0;
    private paintedAt: number | null = null;
    private firstPaint: number | null = null;
    private sources = new Set<Modality>();

    private listeners = new Set<() => void>();

    constructor(options: RunOptions) {
        this.items = options.items;
        this.ceilingMs = options.ceilingS * 1000;
        this.rng = options.rng ?? Math.random;
        this.onAttempt = options.onAttempt;
        const specials: ('minus' | 'point')[] = [];
        if (this.items.some((i) => i.answer.startsWith('-'))) specials.push('minus');
        if (this.items.some((i) => i.answer.includes('.'))) specials.push('point');
        this.specials = specials;
    }

    // ---- subscription (for useSyncExternalStore) -----------------------------
    subscribe = (fn: () => void) => {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    };
    version = 0;
    private changed() {
        this.version++;
        for (const fn of this.listeners) fn();
    }

    // ---- what is on screen ----------------------------------------------------
    get currentTrial(): WarmupTrial | null {
        return this.phase.kind === 'warmup' ? this.trials[this.trialIndex] ?? null : null;
    }
    get currentItem(): ProbeItem | null {
        return this.phase.kind === 'item' ? this.items[this.itemIndex] ?? null : null;
    }
    /** Items left to ask, for the progress bar (interrupted ones are not re-asked). */
    get progress(): { done: number; total: number } {
        return { done: this.itemIndex, total: this.items.length };
    }
    /** True once the clock for the thing on screen has started. */
    get isPainted(): boolean {
        return this.paintedAt !== null;
    }

    // ---- transitions ----------------------------------------------------------
    /** Intro → warm-up (the Start button). */
    begin(): void {
        if (this.phase.kind !== 'intro') return;
        this.trials = warmupPlan(this.rng, this.specials);
        this.trialIndex = 0;
        this.resetEntry();
        this.phase = { kind: 'warmup' };
        this.changed();
    }

    /** "Warm-up done" card → first fact; Paused card → next fact. */
    proceed(): void {
        if (this.phase.kind !== 'warmupDone' && this.phase.kind !== 'paused') return;
        this.resetEntry();
        this.phase = this.itemIndex >= this.items.length ? { kind: 'done' } : { kind: 'item' };
        this.changed();
    }

    /** The trial or fact is now on screen: its clock starts at `t`. */
    painted(t: number): void {
        if (this.phase.kind !== 'warmup' && this.phase.kind !== 'item') return;
        if (this.paintedAt !== null) return;
        this.paintedAt = t;
        if (this.phase.kind === 'item' && this.firstPaint === null) this.firstPaint = t;
    }

    key(k: AnswerKey, source: Modality, t: number, repeat = false): void {
        if (repeat || !this.accepting()) return;
        void t;
        this.sources.add(source);
        const next = applyKey(this.answer, k);
        if (next === this.answer) return;
        this.answer = next;
        if (this.hint === 'empty') this.hint = null;
        this.changed();
    }

    enter(source: Modality, t: number, repeat = false): void {
        if (repeat || !this.accepting() || this.paintedAt === null) return;
        if (t - this.paintedAt < GUARD_MS) return;
        if (!canSubmit(this.answer)) {
            // Keep a warm-up's "Type 47": it is the more useful of the two.
            if (!(this.hint && typeof this.hint === 'object')) this.hint = 'empty';
            this.changed();
            return;
        }
        this.sources.add(source);
        if (this.phase.kind === 'warmup') this.submitTrial(t);
        else this.finishAttempt(t, { skipped: false, interrupted: false });
        this.changed();
    }

    skip(t: number): void {
        if (this.phase.kind !== 'item' || this.paintedAt === null) return;
        if (t - this.paintedAt < GUARD_MS) return;
        this.finishAttempt(t, { skipped: true, interrupted: false });
        this.changed();
    }

    /** The page was hidden or lost focus at `t`. */
    interrupt(t: number): void {
        if (this.phase.kind === 'warmup') {
            this.trialInvalid = true;
            return;
        }
        if (this.phase.kind !== 'item' || this.paintedAt === null) return;
        this.finishAttempt(t, { skipped: false, interrupted: true });
        if (this.phase.kind === 'item') this.phase = { kind: 'paused' };
        this.changed();
    }

    /** Whether "Stuck? Skip is fine." should show at `t` (CR-11). */
    stuckAt(t: number): boolean {
        if (this.phase.kind !== 'item' || this.paintedAt === null) return false;
        const raw = t - this.paintedAt;
        const { msPerKey } = baselineForAttempt(this.baselines, this.modality());
        const net = msPerKey === null ? raw : raw - msPerKey * keystrokesFor(this.answer);
        return net >= this.ceilingMs;
    }

    /** Raise the stuck hint if due; returns true when it changed. */
    tick(t: number): boolean {
        if (this.hint === null && this.stuckAt(t)) {
            this.hint = 'stuck';
            this.changed();
            return true;
        }
        return false;
    }

    // ---- the done screen ------------------------------------------------------
    summary(): { right: number; skipped: number; notCounted: number } {
        let right = 0;
        let skipped = 0;
        let notCounted = 0;
        for (const a of this.attempts) {
            if (a.interrupted) {
                notCounted++;
                continue;
            }
            if (a.skipped) {
                skipped++;
                continue;
            }
            const item = this.items.find((i) => i.n === a.n);
            if (!item || !answersMatch(a.typed, item.answer)) continue;
            const { msPerKey } = baselineForAttempt(this.baselines, a.modality);
            const net = msPerKey === null ? a.rtMs : Math.max(0, a.rtMs - msPerKey * keystrokesFor(a.typed));
            if (net <= this.ceilingMs) right++;
        }
        return { right, skipped, notCounted };
    }

    // ---- internals --------------------------------------------------------------
    private accepting(): boolean {
        return this.phase.kind === 'warmup' || this.phase.kind === 'item';
    }

    private modality(): Modality | 'mixed' | null {
        if (this.sources.size === 0) return null;
        if (this.sources.size > 1) return 'mixed';
        return [...this.sources][0]!;
    }

    private resetEntry(): void {
        this.answer = '';
        this.hint = null;
        this.paintedAt = null;
        this.sources = new Set();
        this.trialInvalid = false;
    }

    private submitTrial(t: number): void {
        const trial = this.trials[this.trialIndex]!;
        if (this.answer !== trial.target) {
            // DR-13: the number stays with "Type 47" until it is typed right;
            // this trial's time no longer measures typing, so it is repeated.
            this.trialInvalid = true;
            this.answer = '';
            this.hint = { retype: trial.target };
            return;
        }
        const rtMs = t - this.paintedAt!;
        const modality = this.modality() ?? 'keyboard';
        const valid = !this.trialInvalid && modality !== 'mixed' && rtMs <= this.ceilingMs;
        this.trialResults.push({ trial, rtMs, modality, valid });
        if (!valid && this.extras[trial.digits] < MAX_EXTRA_PER_DIGIT_COUNT) {
            this.extras[trial.digits]++;
            const special = trial.target.startsWith('-')
                ? 'minus'
                : trial.target.includes('.')
                  ? 'point'
                  : null;
            this.trials.push(makeTrial(this.rng, trial.digits, special));
        }
        this.trialIndex++;
        this.resetEntry();
        if (this.trialIndex >= this.trials.length) {
            this.baselines = baselinesFrom(this.trialResults);
            this.phase = { kind: 'warmupDone' };
        }
    }

    private finishAttempt(t: number, flags: { skipped: boolean; interrupted: boolean }): void {
        const item = this.items[this.itemIndex]!;
        const attempt: AttemptRecord = {
            n: item.n,
            typed: this.answer,
            skipped: flags.skipped,
            interrupted: flags.interrupted,
            rtMs: Math.max(1, Math.round(t - this.paintedAt!)),
            offsetMs: Math.max(0, Math.round(this.paintedAt! - (this.firstPaint ?? this.paintedAt!))),
            modality: this.modality(),
        };
        this.attempts.push(attempt);
        this.onAttempt?.(attempt);
        this.itemIndex++;
        this.resetEntry();
        if (this.itemIndex >= this.items.length && !flags.interrupted) this.phase = { kind: 'done' };
    }
}
