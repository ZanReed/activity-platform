// =============================================================================
// baseline.ts — the warm-up's trials and the typing baseline (CR-1–CR-4, CR-20)
// -----------------------------------------------------------------------------
// The warm-up is copy-typing: "Type the number you see, then press Enter." It
// measures how long a keystroke takes this student on this device, so net time
// (raw time minus the baseline per keystroke × keystrokes) can be judged
// against a criterion that is about recall, not typing (curriculum item 14).
//
//   - 15 trials: five 1-digit, five 2-digit, five 3-digit numbers (ER-20).
//   - When the probe's scope uses the minus or the point, 5 of the 15 include
//     them, so the baseline covers every key an answer can contain (CR-20).
//   - A mistyped, interrupted or over-ceiling trial is REPEATED, at most two
//     extra per digit count (ER-20).
//   - ONE baseline per modality: the median, over that modality's valid
//     trials, of trial time ÷ keystrokes, where keystrokes are the characters
//     typed PLUS one for Enter (CR-1, CR-2, CR-19). It needs SIX valid trials
//     in that modality (CR-4); with fewer there is no baseline there.
// =============================================================================

export type Modality = 'keyboard' | 'keypad';

export const TRIALS_PER_DIGIT_COUNT = 5;
export const MAX_EXTRA_PER_DIGIT_COUNT = 2;
export const MIN_VALID_TRIALS = 6;

export interface WarmupTrial {
    /** The number to type, as typed (ASCII "-"). */
    target: string;
    /** 1, 2 or 3 — which digit-count group it belongs to, for repeats. */
    digits: 1 | 2 | 3;
}

export interface TrialResult {
    trial: WarmupTrial;
    rtMs: number;
    /** 'mixed' when one trial used both sources; never counted. */
    modality: Modality | 'mixed';
    valid: boolean;
}

const randomInt = (rng: () => number, min: number, max: number) =>
    min + Math.floor(rng() * (max - min + 1));

function numberWithDigits(rng: () => number, digits: 1 | 2 | 3): string {
    const min = digits === 1 ? 1 : 10 ** (digits - 1);
    return String(randomInt(rng, min, 10 ** digits - 1));
}

/** One trial of a digit count, optionally carrying a minus or a point. */
export function makeTrial(
    rng: () => number,
    digits: 1 | 2 | 3,
    special: 'minus' | 'point' | null,
): WarmupTrial {
    let target = numberWithDigits(rng, digits);
    // A decimal never ends in 0 ("0.60" is not a number anyone types).
    while (special === 'point' && target.endsWith('0')) target = numberWithDigits(rng, digits);
    if (special === 'minus') target = `-${target}`;
    if (special === 'point') {
        // "0.25"-shaped for one or two digits, "1.25"-shaped for three.
        target = digits === 3 ? `${target[0]}.${target.slice(1)}` : `0.${target}`;
    }
    return { target, digits };
}

/**
 * The fifteen trials. `specials` lists which of minus and point the scope
 * uses; when any, five trials (spread across the digit counts) carry one,
 * alternating between them.
 */
export function warmupPlan(
    rng: () => number,
    specials: ('minus' | 'point')[],
): WarmupTrial[] {
    const trials: WarmupTrial[] = [];
    // Positions of the special trials within each digit-count group of five.
    const specialSlots = new Set(['1:4', '2:2', '2:4', '3:2', '3:4']);
    let next = 0;
    for (const digits of [1, 2, 3] as const) {
        for (let i = 0; i < TRIALS_PER_DIGIT_COUNT; i++) {
            const special =
                specials.length > 0 && specialSlots.has(`${digits}:${i}`)
                    ? specials[next++ % specials.length]!
                    : null;
            trials.push(makeTrial(rng, digits, special));
        }
    }
    // Interleave the digit counts so the warm-up does not run 1, 1, 1, 2, 2…
    for (let i = trials.length - 1; i > 0; i--) {
        const j = randomInt(rng, 0, i);
        [trials[i], trials[j]] = [trials[j]!, trials[i]!];
    }
    return trials;
}

function median(values: number[]): number | null {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Milliseconds per keystroke for one modality, or null below six valid trials. */
export function baselineFor(results: TrialResult[], modality: Modality): number | null {
    const perKey = results
        .filter((r) => r.valid && r.modality === modality)
        .map((r) => r.rtMs / (r.trial.target.length + 1));
    if (perKey.length < MIN_VALID_TRIALS) return null;
    const m = median(perKey);
    return m === null ? null : Math.round(m);
}

export interface Baselines {
    keyboard: number | null;
    keypad: number | null;
}

export function baselinesFrom(results: TrialResult[]): Baselines {
    return { keyboard: baselineFor(results, 'keyboard'), keypad: baselineFor(results, 'keypad') };
}

/**
 * The baseline to deduct for an attempt (CR-3): its own modality's, else the
 * session's other one; a mixed attempt takes whichever exists, keyboard first.
 * Null when the session has none. `flagged` says the deduction was borrowed.
 */
export function baselineForAttempt(
    baselines: Baselines,
    modality: Modality | 'mixed' | null,
): { msPerKey: number | null; flagged: boolean } {
    if (modality === 'keyboard' || modality === 'keypad') {
        const own = baselines[modality];
        if (own !== null) return { msPerKey: own, flagged: false };
        const other = baselines[modality === 'keyboard' ? 'keypad' : 'keyboard'];
        return { msPerKey: other, flagged: other !== null };
    }
    const any = baselines.keyboard ?? baselines.keypad;
    return { msPerKey: any, flagged: any !== null };
}
