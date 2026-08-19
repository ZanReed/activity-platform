// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import {
    __clearScrollMemory,
    useScrollMemory,
} from '../lib/useScrollMemory';

// D7: returning from the editor must land where you left, not at the top of a
// 150-row outline. The `ready` gate is the load-bearing part — restoring
// before the rows render would clamp to 0, because the page has no height yet.

function Probe({ k, ready }: { k: string; ready: boolean }) {
    useScrollMemory(k, ready);
    return <div>probe</div>;
}

let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
    __clearScrollMemory();
    scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', {
        value: scrollTo,
        writable: true,
        configurable: true,
    });
    Object.defineProperty(window, 'scrollY', {
        value: 0,
        writable: true,
        configurable: true,
    });
    // Run rAF callbacks synchronously so assertions don't need timers.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        cb(0);
        return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

function setScrollY(y: number) {
    Object.defineProperty(window, 'scrollY', {
        value: y,
        writable: true,
        configurable: true,
    });
}

describe('useScrollMemory', () => {
    it('does not scroll on a first visit (nothing remembered)', () => {
        render(<Probe k="k1" ready={true} />);
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('restores the remembered position once ready flips true', () => {
        const first = render(<Probe k="k1" ready={true} />);
        setScrollY(640);
        window.dispatchEvent(new Event('scroll'));
        first.unmount();

        // Re-entering the same history entry, still loading: no scroll yet.
        const second = render(<Probe k="k1" ready={false} />);
        expect(scrollTo).not.toHaveBeenCalled();

        // Content arrived — now the position exists to scroll to.
        second.rerender(<Probe k="k1" ready={true} />);
        expect(scrollTo).toHaveBeenCalledWith(0, 640);
    });

    // The gate is the whole point: without it the restore fires against a
    // one-line page and silently clamps to the top.
    it('never restores while ready stays false', () => {
        const first = render(<Probe k="k2" ready={true} />);
        setScrollY(300);
        window.dispatchEvent(new Event('scroll'));
        first.unmount();

        render(<Probe k="k2" ready={false} />);
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('restores at most once per history entry', () => {
        const first = render(<Probe k="k3" ready={true} />);
        setScrollY(200);
        window.dispatchEvent(new Event('scroll'));
        first.unmount();

        const second = render(<Probe k="k3" ready={false} />);
        second.rerender(<Probe k="k3" ready={true} />);
        expect(scrollTo).toHaveBeenCalledTimes(1);

        // A later re-render (an autosave refetch, say) must NOT yank the
        // viewport back while the teacher is reading somewhere else.
        second.rerender(<Probe k="k3" ready={false} />);
        second.rerender(<Probe k="k3" ready={true} />);
        expect(scrollTo).toHaveBeenCalledTimes(1);
    });

    it('keeps positions per history entry, not globally', () => {
        const a = render(<Probe k="entry-a" ready={true} />);
        setScrollY(500);
        window.dispatchEvent(new Event('scroll'));
        a.unmount();

        // A different entry has nothing remembered.
        render(<Probe k="entry-b" ready={true} />);
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('does not scroll when the remembered position is the top', () => {
        const first = render(<Probe k="k4" ready={true} />);
        setScrollY(0);
        window.dispatchEvent(new Event('scroll'));
        first.unmount();

        const second = render(<Probe k="k4" ready={false} />);
        second.rerender(<Probe k="k4" ready={true} />);
        expect(scrollTo).not.toHaveBeenCalled();
    });

    // The last scroll event can predate the click that navigates away.
    it('captures the position at unmount, not only on scroll events', () => {
        const first = render(<Probe k="k5" ready={true} />);
        setScrollY(880); // no scroll event dispatched
        first.unmount();

        const second = render(<Probe k="k5" ready={false} />);
        second.rerender(<Probe k="k5" ready={true} />);
        expect(scrollTo).toHaveBeenCalledWith(0, 880);
    });
});
