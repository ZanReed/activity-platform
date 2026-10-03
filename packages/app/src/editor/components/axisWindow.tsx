import { useState } from 'react';

// ============================================================================
// axisWindow — refuse an EMPTY axis window at the editor's axis cells.
// ----------------------------------------------------------------------------
// The schema rejects a window whose maximum is not greater than its minimum
// (AxisConfig's refine, Y7 geometry slice T1 — the TODOS "degenerate axis"
// entry). Letting the editor write one would make every autosave fail
// validation, so each axis surface (graph settings, graph figure, choice
// figure) routes its window edits through this guard: an edit that would empty
// the window is NOT written, and an inline error says why.
// ============================================================================

interface Window4 {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

export const EMPTY_AXIS_WINDOW_MESSAGE =
    'Each maximum must be greater than its minimum — that change was not applied.';

export function isEmptyAxisWindow(a: Window4): boolean {
    return !(a.xMax > a.xMin) || !(a.yMax > a.yMin);
}

/** Wrap an axis writer: refuses (and reports) an edit that empties the window. */
export function useAxisWindowGuard<A extends Window4>(write: (next: A) => void) {
    const [error, setError] = useState<string | null>(null);
    const guarded = (next: A): void => {
        if (isEmptyAxisWindow(next)) {
            setError(EMPTY_AXIS_WINDOW_MESSAGE);
            return;
        }
        setError(null);
        write(next);
    };
    return { error, write: guarded };
}

export function AxisWindowError({ error }: { error: string | null }) {
    if (!error) return null;
    return (
        <p className="axis-window-error" role="alert">
            {error}
        </p>
    );
}
