// =============================================================================
// IdleBar.tsx — the "still there?" warning before an idle sign-out (UI review
// G-1). Fixed to the top of the screen, so a student scrolled to question 12
// still sees it; says what signing out would clear when there is something;
// and has an "I'm still here" button (any tap or key counts — the button just
// makes that obvious). The idle watcher dismisses it on that activity.
// z-[400]: above the viewer's sticky topbar (200) and banners (300), below
// popovers (1000) — viewer tokens.css --z-*.
// =============================================================================

import { uncheckedActivitiesOnDevice, uncheckedCostSentence } from '../lib/uncheckedWork';

export default function IdleBar({ userId }: { userId: string }) {
    const unchecked = uncheckedActivitiesOnDevice(userId);
    return (
        <div
            role="alert"
            data-banner="idle-prompt"
            className="fixed inset-x-0 top-0 z-[400] border-b border-line-strong bg-canvas px-4 py-3 shadow-md"
        >
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-strong">
                    Still there? You’ll be signed out soon to keep this device safe.
                    {unchecked > 0 && <> {uncheckedCostSentence(unchecked)}</>}
                </p>
                <button
                    type="button"
                    className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                    I’m still here
                </button>
            </div>
        </div>
    );
}
