// @vitest-environment jsdom
// The editor's axis cells refuse an edit that would EMPTY the window (Y7 T1):
// the schema's AxisConfig refine would otherwise fail every autosave.
import { describe, expect, it, vi } from 'vitest';
import { act, render, renderHook } from '@testing-library/react';
import {
    AxisWindowError,
    EMPTY_AXIS_WINDOW_MESSAGE,
    isEmptyAxisWindow,
    useAxisWindowGuard,
} from '../editor/components/axisWindow';

const W = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

describe('axis window guard', () => {
    it('recognizes an empty window on either axis', () => {
        expect(isEmptyAxisWindow(W)).toBe(false);
        expect(isEmptyAxisWindow({ ...W, xMax: -5 })).toBe(true);
        expect(isEmptyAxisWindow({ ...W, yMin: 6 })).toBe(true);
    });

    it('does NOT write an emptying edit, and says why; a good edit clears the error', () => {
        const write = vi.fn();
        const { result } = renderHook(() => useAxisWindowGuard(write));
        act(() => result.current.write({ ...W, xMin: 5 }));
        expect(write).not.toHaveBeenCalled();
        expect(result.current.error).toBe(EMPTY_AXIS_WINDOW_MESSAGE);

        act(() => result.current.write({ ...W, xMin: -3 }));
        expect(write).toHaveBeenCalledWith({ ...W, xMin: -3 });
        expect(result.current.error).toBeNull();
    });

    it('renders the error as an alert, and nothing without one', () => {
        const { container, rerender } = render(<AxisWindowError error={null} />);
        expect(container.textContent).toBe('');
        rerender(<AxisWindowError error={EMPTY_AXIS_WINDOW_MESSAGE} />);
        expect(container.querySelector('[role="alert"]')?.textContent).toBe(EMPTY_AXIS_WINDOW_MESSAGE);
    });
});
