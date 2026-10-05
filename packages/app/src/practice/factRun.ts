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
//
// THE SPRINT (D43 slice 2; SP-8, SP-9, SP-11, SP-12) is the same machine with
// `sprint` options. What they change, and nothing else:
//   - no intro card (the entry screen is the student's Start); the warm-up
//     runs only when the session has no typing baseline;
//   - a STRATEGY card for each family the server marked, before the facts;
//   - after a wrong or skipped answer the fact stays up with the correct
//     answer until the student goes on (FEEDBACK; untimed), and it is asked
//     ONCE more, at least `reaskGap` facts later (never a second time);
//   - in a strategy-mode family the card can be reopened from a fact: the
//     attempt in progress is stored as interrupted, so that time is not
//     counted;
//   - a TIME BOX on the time spent answering: once it has passed, the fact
//     just answered was the last. No clock is ever shown.
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
    /** 1 or 2 in a two-part check (migration 0047); absent means one part. */
    part?: number;
    /** The fact family (sprint sessions only). */
    family_id?: string;
}

/** A family's strategy text, as the registry carries it: no markup. */
export interface StrategyText {
    intro: string | null;
    lines: { label: string; text: string }[];
    example: string | null;
}

/** One family in a sprint session, as fact_sprint_payload returns it. */
export interface SprintFamily {
    family_id: string;
    name: string;
    mode: 'review' | 'practice' | 'strategy';
    show_strategy: boolean;
    strategy: StrategyText | null;
}

export interface SprintOptions {
    /** The time box, on time spent answering (sprint_minutes). */
    boxMs: number;
    /** A missed fact returns at least this many facts later (sprint_reask_gap). */
    reaskGap: number;
    families: SprintFamily[];
    /** What the server already holds of this session (a resume). */
    saved?: { n: number; reask: boolean; missed: boolean }[];
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
    /** The one repeat of a missed fact (sprint only). */
    reask?: boolean;
}

export type Phase =
    | { kind: 'intro' }
    | { kind: 'resume' }
    | { kind: 'warmup' }
    | { kind: 'warmupDone' }
    | { kind: 'item' }
    | { kind: 'paused' }
    /** Between the parts of a two-part check: a break, then Part 2 on the
     *  student's own action — now, or on another day (the run resumes). */
    | { kind: 'partBreak' }
    /** Sprint: a family's strategy, before the facts or reopened from one. */
    | { kind: 'strategy'; familyId: string }
    /** Sprint: the fact just missed, with its answer, until the student goes on. */
    | { kind: 'feedback'; item: ProbeItem }
    | { kind: 'done' };

export type Hint = null | 'empty' | 'stuck' | { retype: string };

export interface RunOptions {
    items: ProbeItem[];
    ceilingS: number;
    rng?: () => number;
    /** Called once per finished attempt, in order. The demo passes none. */
    onAttempt?: (attempt: AttemptRecord) => void;
    /**
     * Continue a run the server already holds part of (the entry's `resume`
     * state): skip the intro and the warm-up, start at `index`, and use the
     * baselines stored with the first save. A resume is not a restart (ER-21).
     */
    resume?: {
        index: number;
        baselines: Baselines;
        prior: { right: number; skipped: number; notCounted: number };
    };
    /** Run as a sprint session (see the header). */
    sprint?: SprintOptions;
}

interface Slot {
    item: ProbeItem;
    reask: boolean;
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

    private prior = { right: 0, skipped: 0, notCounted: 0 };
    private breakPending = false;

    // The order facts are asked in. For the check it is `items`, one each; a
    // sprint adds a slot when a fact is missed.
    private queue: Slot[];
    readonly sprint: SprintOptions | null;
    private strategiesDue: string[] = [];
    private answeringMs = 0;

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
        this.queue = this.items.map((item) => ({ item, reask: false }));
        this.sprint = options.sprint ?? null;
        if (this.sprint) {
            this.baselines = options.resume?.baselines ?? this.baselines;
            this.startSprint(this.sprint);
            return;
        }
        if (options.resume) {
            this.itemIndex = Math.min(Math.max(0, options.resume.index), this.items.length);
            this.baselines = options.resume.baselines;
            this.prior = options.resume.prior;
            // The card comes first: an item is painted only by a student
            // action (DR-10).
            this.phase = { kind: 'resume' };
        }
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
        return this.phase.kind === 'item' ? this.queue[this.itemIndex]?.item ?? null : null;
    }
    /** Sprint: the family of the fact on screen, when its strategy can be reopened. */
    get reopenableStrategy(): SprintFamily | null {
        const item = this.currentItem;
        if (!item || !this.sprint) return null;
        return this.strategyFamily(item.family_id, true);
    }
    /** Sprint: the family a strategy card is showing. */
    get shownStrategy(): SprintFamily | null {
        return this.phase.kind === 'strategy' ? this.strategyFamily(this.phase.familyId, false) : null;
    }
    /** Sprint: on the feedback card, the family whose strategy can be opened. */
    get feedbackStrategy(): SprintFamily | null {
        return this.phase.kind === 'feedback' ? this.strategyFamily(this.phase.item.family_id, true) : null;
    }
    /** How many parts this check has (1 or 2). */
    get partCount(): number {
        return new Set(this.items.map((i) => i.part ?? 1)).size;
    }
    /** The part the next item belongs to (or the last item's, at the end). */
    get currentPart(): number {
        const item = this.items[Math.min(this.itemIndex, this.items.length - 1)];
        return item?.part ?? 1;
    }
    /** How many items a part has. */
    partSize(part: number): number {
        return this.items.filter((i) => (i.part ?? 1) === part).length;
    }
    /** Progress WITHIN the current part, for the bar: it fills at the break
     *  (interrupted items are not re-asked, so they count as done). */
    get progress(): { done: number; total: number } {
        const part = this.currentPart;
        const before = this.items.slice(0, this.itemIndex).filter((i) => (i.part ?? 1) === part).length;
        return { done: before, total: this.partSize(part) };
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

    /** "Warm-up done" card → first fact; Paused or Welcome-back card → next fact. */
    proceed(): void {
        if (
            this.phase.kind !== 'warmupDone' &&
            this.phase.kind !== 'paused' &&
            this.phase.kind !== 'resume' &&
            this.phase.kind !== 'partBreak' &&
            this.phase.kind !== 'strategy' &&
            this.phase.kind !== 'feedback'
        ) {
            return;
        }
        if (this.sprint) {
            this.advanceSprint();
            return;
        }
        // An interruption on the LAST fact of Part 1: the Paused card came
        // first; the break between the parts still follows it.
        if (this.phase.kind === 'paused' && this.breakPending) {
            this.breakPending = false;
            this.phase = { kind: 'partBreak' };
            this.changed();
            return;
        }
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
        if (this.phase.kind !== 'item') return;
        if (this.paintedAt === null) {
            // Hidden BEFORE this fact's clock started: the student never saw
            // it. It is not consumed and not timed — the Paused card shows,
            // and the same fact is painted after "Keep going". (Without this
            // a hide in the gap after an answer was ignored, and the next
            // fact was then timed while the student was away.)
            this.phase = { kind: 'paused' };
            this.changed();
            return;
        }
        this.finishAttempt(t, { skipped: false, interrupted: true });
        if (this.phase.kind === 'item') this.phase = { kind: 'paused' };
        this.changed();
    }

    /** Sprint: open the strategy from the fact on screen or from the feedback
     *  card. From a fact, the attempt in progress is stored as interrupted
     *  (SP-9): time with the card open is never counted. */
    openStrategy(t: number): void {
        if (!this.sprint) return;
        if (this.phase.kind === 'feedback') {
            const family = this.feedbackStrategy;
            if (!family) return;
            this.phase = { kind: 'strategy', familyId: family.family_id };
            this.changed();
            return;
        }
        const family = this.reopenableStrategy;
        if (!family) return;
        if (this.paintedAt !== null) this.finishAttempt(t, { skipped: false, interrupted: true });
        this.phase = { kind: 'strategy', familyId: family.family_id };
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
        // A resumed run adds what the server already counted for the earlier part.
        let { right, skipped, notCounted } = this.prior;
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

    // ---- the sprint ---------------------------------------------------------------
    private strategyFamily(familyId: string | undefined, strategyModeOnly: boolean): SprintFamily | null {
        const family = this.sprint?.families.find((f) => f.family_id === familyId) ?? null;
        if (!family || !family.strategy) return null;
        return strategyModeOnly && family.mode !== 'strategy' ? null : family;
    }

    private startSprint(sprint: SprintOptions): void {
        // A resume: what the server holds is done; a miss whose repeat has not
        // been asked gets its repeat, after the gap.
        const saved = sprint.saved ?? [];
        const done = new Set(saved.filter((a) => !a.reask).map((a) => a.n));
        const repeated = new Set(saved.filter((a) => a.reask).map((a) => a.n));
        this.queue = this.queue.filter((slot) => !done.has(slot.item.n));
        for (const a of saved) {
            if (a.reask || !a.missed || repeated.has(a.n)) continue;
            const item = this.items.find((i) => i.n === a.n);
            if (item) this.queue.splice(Math.min(this.queue.length, sprint.reaskGap), 0, { item, reask: true });
        }
        this.strategiesDue =
            saved.length > 0
                ? []
                : sprint.families.filter((f) => f.show_strategy && f.strategy).map((f) => f.family_id);
        const hasBaseline = this.baselines.keyboard !== null || this.baselines.keypad !== null;
        if (!hasBaseline && this.queue.length > 0) {
            this.trials = warmupPlan(this.rng, this.specials);
            this.phase = { kind: 'warmup' };
            return;
        }
        this.advanceSprint(false);
    }

    /** The next thing a sprint shows: a strategy still due, the next fact, or done. */
    private advanceSprint(notify = true): void {
        this.resetEntry();
        const next = this.strategiesDue.shift();
        if (next !== undefined) this.phase = { kind: 'strategy', familyId: next };
        else if (this.itemIndex >= this.queue.length || this.answeringMs >= (this.sprint?.boxMs ?? Infinity)) {
            this.phase = { kind: 'done' };
        } else this.phase = { kind: 'item' };
        if (notify) this.changed();
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
            if (this.sprint) this.advanceSprint(false);
            else this.phase = { kind: 'warmupDone' };
        }
    }

    private finishAttempt(t: number, flags: { skipped: boolean; interrupted: boolean }): void {
        const slot = this.queue[this.itemIndex]!;
        const item = slot.item;
        const attempt: AttemptRecord = {
            ...(this.sprint ? { reask: slot.reask } : {}),
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
        if (this.sprint) {
            this.answeringMs += attempt.rtMs;
            const missed = !flags.interrupted && (flags.skipped || !answersMatch(attempt.typed, item.answer));
            // SP-11: a missed FIRST ask returns once, at least reaskGap facts later.
            // With nothing left to ask in between, a repeat would only be
            // copying the answer just shown, so there is none.
            if (missed && !slot.reask && this.itemIndex < this.queue.length) {
                const at = Math.min(this.queue.length, this.itemIndex + this.sprint.reaskGap);
                this.queue.splice(at, 0, { item, reask: true });
            }
            this.resetEntry();
            if (missed) this.phase = { kind: 'feedback', item };
            else if (flags.interrupted) this.phase = { kind: 'paused' };
            else this.advanceSprint(false);
            return;
        }
        this.resetEntry();
        const next = this.items[this.itemIndex];
        const atBoundary = next !== undefined && (next.part ?? 1) !== (item.part ?? 1);
        if (this.itemIndex >= this.items.length && !flags.interrupted) this.phase = { kind: 'done' };
        else if (atBoundary && flags.interrupted) this.breakPending = true;
        else if (atBoundary) this.phase = { kind: 'partBreak' };
    }
}
