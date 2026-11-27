// @vitest-environment jsdom
// useLoad + LoadStatus (review C5 slice 1; docs/design/shared-data-loading.md
// decisions 1a and 4), bound to RENDERED output: each row drives a tiny screen
// that loads through the hook and draws LoadStatus, and asserts what a teacher
// would read. The progress pages' own rows (ClassProgress.test.tsx 2 and 3)
// cover the same states on the real screens.
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import LoadStatus from '../components/LoadStatus';
import { useLoad, type LoadKey } from '../lib/useLoad';
import { SLOW_LOAD_MS } from '../lib/slowLoad';

function deferred<T>() {
    let resolve!: (v: T) => void;
    let reject!: (e: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function Screen({ k, loader }: { k: LoadKey | null; loader: () => Promise<string> }) {
    const loaded = useLoad(k, loader);
    if (!loaded.data) return <LoadStatus state={loaded} what="classes" refusedText="Not your class." />;
    return (
        <div>
            <p data-testid="data">{loaded.data}</p>
            {loaded.refreshFailed && <p>Couldn't refresh</p>}
            <button type="button" onClick={loaded.reload}>
                Refresh
            </button>
        </div>
    );
}

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
    warn.mockRestore();
});

describe('useLoad + LoadStatus', () => {
    it('1. shows Loading…, then the data', async () => {
        const d = deferred<string>();
        render(<Screen k={['classes']} loader={() => d.promise} />);
        expect(screen.getByRole('status').textContent).toBe('Loading…');
        await act(async () => d.resolve('three classes'));
        expect(screen.getByTestId('data').textContent).toBe('three classes');
    });

    it('2. a failed first load: plain sentence + Try again; the server text only under Details', async () => {
        const loader = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error('JWT expired'))
            .mockResolvedValueOnce('back');
        render(<Screen k={['classes']} loader={loader} />);
        const alert = await screen.findByRole('alert');
        expect(alert.textContent).toBe("Couldn't load classes. Check your connection, then try again.");
        expect(alert.textContent).not.toContain('JWT');
        expect(screen.getByText('Details')).toBeTruthy();
        expect(screen.getByText('JWT expired').closest('details')).not.toBeNull();
        expect(warn).toHaveBeenCalledWith('[load] classes: load_failed', expect.any(Error));
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        expect((await screen.findByTestId('data')).textContent).toBe('back');
    });

    it('3. a refusal gives the caller its own sentence, and no Try again or Details', async () => {
        render(<Screen k={['classes']} loader={() => Promise.reject(new Error('not_class_teacher'))} />);
        expect((await screen.findByRole('alert')).textContent).toBe('Not your class.');
        expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
        expect(screen.queryByText('Details')).toBeNull();
        expect(warn).toHaveBeenCalledWith('[load] classes: refused', expect.any(Error));
    });

    it('4. a failed refresh keeps the last good data', async () => {
        const loader = vi
            .fn<() => Promise<string>>()
            .mockResolvedValueOnce('first')
            .mockRejectedValueOnce(new Error('offline'));
        render(<Screen k={['classes']} loader={loader} />);
        await screen.findByTestId('data');
        fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
        expect(await screen.findByText("Couldn't refresh")).toBeTruthy();
        expect(screen.getByTestId('data').textContent).toBe('first');
        expect(warn).toHaveBeenCalledWith('[load] classes: refresh_failed', expect.any(Error));
    });

    it('5. a load with nothing on screen says it is slow after SLOW_LOAD_MS, with Try again', async () => {
        vi.useFakeTimers();
        render(<Screen k={['classes']} loader={() => new Promise<string>(() => undefined)} />);
        act(() => vi.advanceTimersByTime(SLOW_LOAD_MS - 1));
        expect(screen.queryByText(/Taking longer than usual/)).toBeNull();
        act(() => vi.advanceTimersByTime(1));
        expect(screen.getByText(/Taking longer than usual/)).toBeTruthy();
        // Try again restarts the wait: the screen visibly goes back to Loading…
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        expect(screen.getByRole('status').textContent).toBe('Loading…');
        act(() => vi.advanceTimersByTime(SLOW_LOAD_MS));
        expect(screen.getByText(/Taking longer than usual/)).toBeTruthy();
    });

    it('6. latest-wins across a key change: the old key answering late never lands', async () => {
        const a = deferred<string>();
        const b = deferred<string>();
        const { rerender } = render(<Screen k={['classes', 'A']} loader={() => a.promise} />);
        rerender(<Screen k={['classes', 'B']} loader={() => b.promise} />);
        await act(async () => b.resolve('B data'));
        await act(async () => a.resolve('A data'));
        expect(screen.getByTestId('data').textContent).toBe('B data');
    });

    it('7. latest-wins across reloads: an older reload answering last never lands', async () => {
        const answers = [deferred<string>(), deferred<string>(), deferred<string>()];
        let n = 0;
        render(<Screen k={['classes']} loader={() => answers[n++]!.promise} />);
        await act(async () => answers[0]!.resolve('first'));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
        await act(async () => answers[2]!.resolve('newest'));
        await act(async () => answers[1]!.resolve('older'));
        expect(screen.getByTestId('data').textContent).toBe('newest');
    });

    it('8. a screen already left ignores its late failure (nothing reported)', async () => {
        const d = deferred<string>();
        const { unmount } = render(<Screen k={['classes']} loader={() => d.promise} />);
        unmount();
        await act(async () => d.reject(new Error('late')));
        expect(warn).not.toHaveBeenCalled();
    });

    it('9. a null key loads nothing', () => {
        const loader = vi.fn(() => Promise.resolve('x'));
        render(<Screen k={null} loader={loader} />);
        expect(loader).not.toHaveBeenCalled();
    });

    it('11. under StrictMode (mount, cleanup, mount) it still lands the data once', async () => {
        const loader = vi.fn(() => Promise.resolve('strict'));
        render(
            <StrictMode>
                <Screen k={['classes']} loader={loader} />
            </StrictMode>,
        );
        expect((await screen.findByTestId('data')).textContent).toBe('strict');
    });

    it('12. a refusal clears when the key moves on to something allowed', async () => {
        const { rerender } = render(
            <Screen k={['classes', 'theirs']} loader={() => Promise.reject(new Error('not_class_teacher'))} />,
        );
        expect((await screen.findByRole('alert')).textContent).toBe('Not your class.');
        rerender(<Screen k={['classes', 'mine']} loader={() => Promise.resolve('mine')} />);
        expect((await screen.findByTestId('data')).textContent).toBe('mine');
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('13. a refusal on a REFRESH is logged as what the teacher saw: a failed refresh', async () => {
        const loader = vi
            .fn<() => Promise<string>>()
            .mockResolvedValueOnce('first')
            .mockRejectedValueOnce(new Error('not_class_teacher'));
        render(<Screen k={['classes']} loader={loader} />);
        await screen.findByTestId('data');
        fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
        expect(await screen.findByText("Couldn't refresh")).toBeTruthy();
        expect(warn).toHaveBeenCalledWith('[load] classes: refresh_failed', expect.any(Error));
    });

    it('10. a loader that throws before returning a promise is a failed load, not a crash', async () => {
        render(
            <Screen
                k={['classes']}
                loader={() => {
                    throw new Error('sync');
                }}
            />,
        );
        expect((await screen.findByRole('alert')).textContent).toContain("Couldn't load classes");
    });
});
