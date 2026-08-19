// =============================================================================
// useScrollMemory — restore scroll position on back-navigation (D7)
// -----------------------------------------------------------------------------
// Ruled in the list-surface design review (D7). During a bulk-authoring sprint
// the teacher bounces list → editor → list dozens of times; without this, every
// return lands at the top of a 150-row outline and they re-scroll to their unit.
//
// WHY NOT react-router's <ScrollRestoration>: that component requires a DATA
// router (createBrowserRouter). This app mounts <BrowserRouter> + <Routes>
// (main.tsx), so ScrollRestoration is unavailable without a router migration
// that is far outside this slice. This hook is the equivalent, scoped to the
// one route that needs it.
//
// WHY `ready` GATES THE RESTORE — the part that makes this actually work: the
// list fetches its rows asynchronously, so at mount the page is one line tall
// and scrolling to y=800 would clamp to 0. The restore must wait until the
// content that CREATES the scroll height has rendered. Callers pass their own
// loaded flag; the hook restores exactly once per history entry.
//
// Positions live in a module-level Map keyed by history entry, so they survive
// the route unmounting but NOT a full page reload — a fresh load starting at
// the top is correct.
// =============================================================================

import { useEffect, useRef } from 'react';

const positions = new Map<string, number>();

/** Exported for tests — a fresh scenario must not inherit another's scroll. */
export function __clearScrollMemory(): void {
    positions.clear();
}

/**
 * @param key   Stable per history entry — pass `useLocation().key`.
 * @param ready False while the content that creates scroll height is loading.
 */
export function useScrollMemory(key: string, ready: boolean): void {
    // One restore per history entry. Without this, any later `ready` flip (a
    // refetch, an autosave-driven re-render) would yank the viewport back to a
    // stale position while the teacher is reading somewhere else.
    const restored = useRef(false);

    useEffect(() => {
        restored.current = false;
    }, [key]);

    // Record continuously. `passive` keeps the listener off the scroll's
    // critical path; writing a number to a Map is cheap enough not to need
    // throttling, and throttling would risk missing the final position before
    // a navigation.
    useEffect(() => {
        const onScroll = () => {
            if (!restored.current && positions.has(key)) return; // mid-restore
            positions.set(key, window.scrollY);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            // Capture the position at unmount too: the last scroll event may
            // predate the click that navigates away.
            positions.set(key, window.scrollY);
        };
    }, [key]);

    useEffect(() => {
        if (!ready || restored.current) return;
        const y = positions.get(key);
        restored.current = true;
        if (y === undefined || y === 0) return;
        // rAF: let the browser complete the layout pass that the just-rendered
        // content triggered, so the target position actually exists.
        const raf = requestAnimationFrame(() => window.scrollTo(0, y));
        return () => cancelAnimationFrame(raf);
    }, [key, ready]);
}
