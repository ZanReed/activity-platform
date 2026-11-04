// =============================================================================
// periodSizes.ts — the "Items per session" helper line (period assembly PA-10)
// -----------------------------------------------------------------------------
// The curriculum side's period shapes as a suggestion. It never sets anything:
// the class's number stays the teacher's. Suggested sizes use the slower end of
// `mixed_seconds_per_item`, as their §17 says, and count only whole questions
// that fit, so 8–10 minutes at 90 seconds is "6", not "5–7".
// =============================================================================

import type { PeriodShapes } from '../lib/mixedTeacher';

function questions(minutes: [number, number], seconds: number): string {
    const lo = Math.ceil((minutes[0] * 60) / seconds);
    const hi = Math.floor((minutes[1] * 60) / seconds);
    return lo >= hi ? String(hi) : `${lo}–${hi}`;
}

/** The line, or null with nothing to go on. */
export function periodSizesLine(
    shapes: PeriodShapes | null | undefined,
    secondsPerItem: [number, number] | null | undefined,
    factsOn: boolean,
): string | null {
    const seconds = secondsPerItem?.[1];
    if (!shapes?.lengths || !seconds) return null;
    const parts: string[] = [];
    let fluency: [number, number] | null = null;
    for (const length of Object.keys(shapes.lengths).sort((a, b) => Number(a) - Number(b))) {
        const blocks = shapes.lengths[length] ?? [];
        const mixed = blocks.filter((b) => b.kind === 'mixed' && Array.isArray(b.minutes));
        const first = mixed[0]?.minutes;
        if (!Array.isArray(first)) continue;
        const each = questions(first, seconds);
        parts.push(`${each}${mixed.length > 1 ? ' a block' : ''} for ${length} minutes`);
        const f = blocks.find((b) => b.kind === 'fluency')?.minutes;
        if (Array.isArray(f)) fluency = f;
    }
    if (parts.length === 0) return null;
    const line = `Suggested: ${parts.join(', ')}.`;
    if (factsOn || !fluency) return line;
    return `${line} About ${Math.round((fluency[1] * 60) / seconds)} more with number facts off.`;
}
