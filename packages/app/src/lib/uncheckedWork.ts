// =============================================================================
// uncheckedWork.ts — what signing out would cost a student (UI review G-1)
// -----------------------------------------------------------------------------
// Kept out of studentAuth.ts on purpose: that module is in the student shell,
// and these are read only by Home and the idle bar (lazy routes), so they
// would otherwise spend shell bytes every student downloads (shell-size
// review spend meter).
// =============================================================================

import { countUncheckedActivities } from '@activity/viewer';

/**
 * UI review G-1: how many of this student's activities on this device hold
 * answers they haven't checked (or a check still waiting to send) — exactly
 * what signOutEverything would clear. 0 when storage can't be read.
 */
export function uncheckedActivitiesOnDevice(userId: string): number {
    try {
        return countUncheckedActivities(window.localStorage, userId);
    } catch {
        return 0;
    }
}

/** The sentence both the sign-out confirm and the idle bar use for that cost. */
export function uncheckedCostSentence(count: number): string {
    return count === 1
        ? 'You have answers you haven’t checked in 1 activity. Signing out clears them from this device.'
        : `You have answers you haven’t checked in ${count} activities. Signing out clears them from this device.`;
}
