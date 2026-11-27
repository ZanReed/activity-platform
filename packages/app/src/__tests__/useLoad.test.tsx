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
import {
    RETURN_REFRESH_MS,
    reloadKey,
    updateLoaded,
    useLoad,
    type LoadKey,
    type LoadOptions,
} from '../lib/useLoad';
import { SessionContext } from '../lib/sessionContextObject';
import type { SessionContextValue } from '../lib/SessionContext';
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

// Slice 2 (decisions 5 and 6): one copy per key, remembered lists, reloadKey /
// updateLoaded, and the re-read on a tab return. forgetLoads runs after every
// test (src/test/forgetLoads.setup.ts).
function Shared({ k, loader, opts, id }: { k: LoadKey; loader: () => Promise<string>; opts?: LoadOptions; id: string }) {
    const loaded = useLoad(k, loader, opts);
    return <p data-testid={id}>{loaded.data ?? (loaded.failed ? 'failed' : 'loading')}</p>;
}

function returnToTab() {
    act(() => {
        window.dispatchEvent(new Event('focus'));
    });
}

describe('useLoad — one copy per key (slice 2)', () => {
    it('S1. two screens showing one key make ONE read and both show it', async () => {
        const d = deferred<string>();
        const loader = vi.fn(() => d.promise);
        render(
            <>
                <Shared id="a" k={['classes']} loader={loader} />
                <Shared id="b" k={['classes']} loader={loader} />
            </>,
        );
        await act(async () => d.resolve('7A, 7B'));
        expect(loader).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('a').textContent).toBe('7A, 7B');
        expect(screen.getByTestId('b').textContent).toBe('7A, 7B');
    });

    it('S2. a remembered key shows its last answer AT ONCE on the way back, and re-reads behind it', async () => {
        const first = render(<Shared id="a" k={['classes']} loader={async () => 'old'} opts={{ remember: true }} />);
        expect(await screen.findByText('old')).toBeTruthy();
        first.unmount();
        const d = deferred<string>();
        render(<Shared id="a" k={['classes']} loader={() => d.promise} opts={{ remember: true }} />);
        expect(screen.getByTestId('a').textContent).toBe('old'); // no Loading… in between
        await act(async () => d.resolve('new'));
        expect(screen.getByTestId('a').textContent).toBe('new');
    });

    it('S3. an unremembered key is dropped with its last screen', async () => {
        const first = render(<Shared id="a" k={['progress', 1]} loader={async () => 'grid'} />);
        expect(await screen.findByText('grid')).toBeTruthy();
        first.unmount();
        render(<Shared id="a" k={['progress', 1]} loader={() => new Promise(() => undefined)} />);
        expect(screen.getByTestId('a').textContent).toBe('loading');
    });

    it('S4. reloadKey re-reads once for every screen showing the key', async () => {
        let n = 0;
        const loader = vi.fn(async () => `v${++n}`);
        render(
            <>
                <Shared id="a" k={['classes']} loader={loader} />
                <Shared id="b" k={['classes']} loader={loader} />
            </>,
        );
        expect(await screen.findAllByText('v1')).toHaveLength(2);
        await act(async () => reloadKey(['classes']));
        expect(screen.getByTestId('a').textContent).toBe('v2');
        expect(screen.getByTestId('b').textContent).toBe('v2');
        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('S5. updateLoaded writes an edit into every screen, and a read already in flight cannot undo it', async () => {
        const reads = [deferred<string>(), deferred<string>()];
        let i = 0;
        const loader = () => reads[i++]!.promise;
        render(
            <>
                <Shared id="a" k={['classes']} loader={loader} />
                <Shared id="b" k={['classes']} loader={loader} />
            </>,
        );
        await act(async () => reads[0]!.resolve('7A'));
        act(() => reloadKey(['classes'])); // a refresh starts…
        act(() => updateLoaded<string>(['classes'], (prev) => `${prev} (renamed)`)); // …then an edit
        await act(async () => reads[1]!.resolve('7A')); // the refresh's older answer arrives
        expect(screen.getByTestId('a').textContent).toBe('7A (renamed)');
        expect(screen.getByTestId('b').textContent).toBe('7A (renamed)');
    });

    it('S5b. the dropped read is started again, so a new row it was fetching still arrives', async () => {
        const reads = [deferred<string>(), deferred<string>(), deferred<string>()];
        let i = 0;
        const loader = vi.fn(() => reads[i++]!.promise);
        render(<Shared id="a" k={['classes']} loader={loader} />);
        await act(async () => reads[0]!.resolve('7A'));
        act(() => reloadKey(['classes']));
        act(() => updateLoaded<string>(['classes'], (prev) => `${prev} (renamed)`));
        expect(loader).toHaveBeenCalledTimes(3);
        await act(async () => reads[2]!.resolve('7A (renamed), 7C'));
        expect(screen.getByTestId('a').textContent).toBe('7A (renamed), 7C');
    });

    it('S5c. a read hung past SLOW_LOAD_MS is not joined: the next arrival starts its own', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        const loader = vi.fn(() => new Promise<string>(() => undefined));
        const first = render(<Shared id="a" k={['classes']} loader={loader} opts={{ remember: true }} />);
        first.unmount();
        render(<Shared id="a" k={['classes']} loader={loader} opts={{ remember: true }} />);
        expect(loader).toHaveBeenCalledTimes(1); // joined: still fresh
        cleanup();
        vi.setSystemTime(Date.now() + SLOW_LOAD_MS + 1);
        render(<Shared id="a" k={['classes']} loader={loader} opts={{ remember: true }} />);
        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('S6. a tab return re-reads after RETURN_REFRESH_MS, not before, and never while the page is busy', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        const loader = vi.fn(async () => 'list');
        render(
            <>
                <Shared id="a" k={['classes']} loader={loader} opts={{ refreshOnReturn: true }} />
                <input aria-label="name" />
            </>,
        );
        await act(async () => undefined);
        expect(loader).toHaveBeenCalledTimes(1);
        returnToTab();
        expect(loader).toHaveBeenCalledTimes(1); // too soon
        vi.setSystemTime(Date.now() + RETURN_REFRESH_MS + 1);
        screen.getByLabelText('name').focus(); // typing
        returnToTab();
        expect(loader).toHaveBeenCalledTimes(1);
        screen.getByLabelText('name').blur();
        const dialog = document.body.appendChild(document.createElement('div'));
        dialog.setAttribute('role', 'dialog'); // a dialog is open
        returnToTab();
        expect(loader).toHaveBeenCalledTimes(1);
        dialog.remove();
        returnToTab();
        await act(async () => undefined);
        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('S6b. a screen that did not ask for it never re-reads on a tab return', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        const loader = vi.fn(async () => 'grid');
        render(<Shared id="a" k={['progress', 2]} loader={loader} />);
        await act(async () => undefined);
        vi.setSystemTime(Date.now() + RETURN_REFRESH_MS + 1);
        returnToTab();
        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('S7. a different signed-in user never sees the last one\'s remembered copy', async () => {
        const as = (id: string) => ({ session: { user: { id } } }) as unknown as SessionContextValue;
        const view = (id: string, loader: () => Promise<string>) => (
            <SessionContext.Provider value={as(id)}>
                <Shared id="a" k={['classes']} loader={loader} opts={{ remember: true }} />
            </SessionContext.Provider>
        );
        const first = render(view('teacher-1', async () => "teacher 1's classes"));
        expect(await screen.findByText("teacher 1's classes")).toBeTruthy();
        first.unmount();
        render(view('teacher-2', () => new Promise(() => undefined)));
        expect(screen.getByTestId('a').textContent).toBe('loading');
    });

    it('S7b. a user switch on a MOUNTED screen drops the copy and reads again for the new user', async () => {
        const as = (id: string) => ({ session: { user: { id } } }) as unknown as SessionContextValue;
        const loader = vi
            .fn<() => Promise<string>>()
            .mockResolvedValueOnce("teacher 1's classes")
            .mockImplementation(() => second.promise);
        const second = deferred<string>();
        const view = (id: string) => (
            <SessionContext.Provider value={as(id)}>
                <Shared id="a" k={['classes']} loader={loader} opts={{ remember: true }} />
            </SessionContext.Provider>
        );
        const { rerender } = render(view('teacher-1'));
        expect(await screen.findByText("teacher 1's classes")).toBeTruthy();
        rerender(view('teacher-2'));
        await act(async () => undefined);
        expect(screen.getByTestId('a').textContent).toBe('loading');
        expect(loader).toHaveBeenCalledTimes(2);
        await act(async () => second.resolve("teacher 2's classes")); // and it reaches the screen
        expect(screen.getByTestId('a').textContent).toBe("teacher 2's classes");
    });

    it('S8. a remembered FAILURE is not kept: the next arrival starts at Loading…', async () => {
        const first = render(
            <Shared id="a" k={['classes']} loader={() => Promise.reject(new Error('offline'))} opts={{ remember: true }} />,
        );
        expect(await screen.findByText('failed')).toBeTruthy();
        first.unmount();
        const frames: string[] = [];
        function Spy() {
            const loaded = useLoad(['classes'], () => new Promise<string>(() => undefined), { remember: true });
            frames.push(loaded.failed ? 'failed' : 'loading');
            return null;
        }
        render(<Spy />);
        expect(frames).not.toContain('failed'); // not even the first frame
    });
});
