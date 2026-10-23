// @vitest-environment jsdom
// Mixed practice's runner (D43 slice 3), bound to RENDERED output: one
// question per screen through the viewer's own blocks, Check / Skip / Next,
// the feedback panel (DM-10 + ruling 2), the done screens (DM-11 as amended,
// ruling 3), offline and signed-out holds (DM-5), and resume (DM-6).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CheckError, type PracticeSession } from '@activity/viewer';
import {
    PX_BLANK_ID,
    PX_CLASS_ID,
    PX_SESSION_ID,
    pxCheckResult,
    pxSession,
} from '../test/practiceFixtures';

const api = vi.hoisted(() => ({ checkPracticeItem: vi.fn(), previewMixed: vi.fn() }));
vi.mock('../lib/mixedPractice', async (orig) => ({
    ...(await orig<typeof import('../lib/mixedPractice')>()),
    ...api,
}));
const auth = vi.hoisted(() => ({ signInWithGoogle: vi.fn(async () => ({ error: null })) }));
vi.mock('../lib/auth', () => auth);

import MixedRunner from '../practice/MixedRunner';

const onAgain = vi.fn();
const onEnded = vi.fn();

function runner(session: PracticeSession = pxSession()) {
    return render(
        <MemoryRouter>
            <main className="fx-stage">
                <MixedRunner session={session} userId="student-1" classId={PX_CLASS_ID} onAgain={onAgain} onEnded={onEnded} />
            </main>
        </MemoryRouter>,
    );
}

const blank = () => screen.getByRole('textbox') as HTMLInputElement;
const type = (value: string) => fireEvent.change(blank(), { target: { value } });
const press = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));

beforeEach(() => {
    api.checkPracticeItem.mockReset();
    api.previewMixed.mockReset().mockResolvedValue({ state: 'done_today', doneToday: 1, graded: false, itemsPerSession: 2, planned: 0 });
    auth.signInWithGoogle.mockClear();
    onAgain.mockReset();
    onEnded.mockReset();
    sessionStorage.clear();
});
afterEach(cleanup);

describe('MixedRunner — one question', () => {
    it('shows the question through the viewer, its place for screen readers only, and no score or counter (DM-2, DM-17)', () => {
        const view = runner();
        expect(view.container.textContent).toContain('For 20 muffins you need');
        expect(screen.getByRole('heading', { name: 'Question 1 of 2' }).className).toContain('fx-sr');
        expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Question 1 of 2' }));
        expect(screen.getByRole('button', { name: 'Check' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Skip' })).toBeTruthy();
        // No problem number: each question is its own document, so it would
        // always read "1." (a counter, DM-2) — neither shown nor announced.
        expect(view.container.querySelector('.viewer-block__number')).toBeNull();
        expect(screen.queryByRole('group', { name: '1.' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Stop for now' })).toBeTruthy();
        // The viewer's own Check is not drawn (ruling 1): exactly one Check.
        expect(screen.getAllByRole('button', { name: /check/i })).toHaveLength(1);
        expect(view.container.querySelector('.viewer-check-group__footer')).toBeNull();
        // Visible text only: the sr-only place line is the one "n of N" allowed.
        const visible = view.container.cloneNode(true) as HTMLElement;
        visible.querySelectorAll('.fx-sr, style').forEach((el) => el.remove());
        expect(visible.textContent).not.toMatch(/\d+ of \d+|score|right so far/i);
    });

    it('an empty Check sends nothing and asks for an answer or a skip', () => {
        runner();
        press('Check');
        expect(api.checkPracticeItem).not.toHaveBeenCalled();
        expect(screen.getByText('Answer the question, or skip it.')).toBeTruthy();
    });

    it('a wrong try: the slot\'s request, the answer in words, the mistake note at the blank, the working open in the panel only', async () => {
        api.checkPracticeItem.mockResolvedValue(pxCheckResult(1, 'wrong'));
        const view = runner();
        type('8');
        blank().focus();
        press('Check');
        // Focus left the answer before it froze (the ² ³ tray closes on blur;
        // Chromium sends none to a focused input that becomes disabled).
        expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Question 1 of 2' }));
        const verdict = await screen.findByRole('heading', { name: /Not this time/ });
        expect(api.checkPracticeItem).toHaveBeenCalledWith(
            expect.objectContaining({ sessionId: PX_SESSION_ID, seq: 1, responses: expect.objectContaining({ blanks: { [PX_BLANK_ID]: '8' } }) }),
        );
        expect(api.checkPracticeItem.mock.calls[0]![0].skip).toBeUndefined();
        expect(verdict.textContent).toBe('✕ Not this time. The answer is 5.');
        expect(document.activeElement).toBe(verdict);
        // Ruling 2: the mistake note stays with the block…
        expect(view.container.querySelector('[data-feedback="server"]')?.textContent).toContain('added 8 instead of scaling');
        // …the working is in the panel, open, and NOT also in the block.
        expect(screen.getByTestId('mx-working').textContent).toContain('20 × 0.25 = 5 cups');
        expect(view.container.textContent!.match(/20 × 0.25 = 5 cups/g)).toHaveLength(1);
        expect(screen.queryByText('Show solution')).toBeNull();
        // One try: the question is frozen, Check and Skip are gone, Next is here.
        expect(blank().matches(':disabled')).toBe(true);
        expect(screen.queryByRole('button', { name: 'Check' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Skip' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
    });

    it('a right try: "✓ Right." and the working behind "See the working" (aria-expanded)', async () => {
        api.checkPracticeItem.mockResolvedValue(pxCheckResult(1, 'right'));
        runner();
        type('5');
        fireEvent.submit(blank().form!); // Enter in the answer box checks (DM-17)
        const verdict = await screen.findByRole('heading', { name: /Right/ });
        expect(verdict.textContent).toBe('✓ Right.');
        const toggle = screen.getByRole('button', { name: 'See the working' });
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(screen.queryByTestId('mx-working')).toBeNull();
        fireEvent.click(toggle);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByTestId('mx-working')).toBeTruthy();
    });

    it('Skip spends the try with no answer, and says the answer', async () => {
        api.checkPracticeItem.mockResolvedValue(pxCheckResult(1, 'skipped'));
        runner();
        type('8'); // typed, then skipped: the typed text is not sent
        press('Skip');
        const verdict = await screen.findByRole('heading', { name: /Skipped/ });
        expect(verdict.textContent).toBe('Skipped. The answer is 5.');
        const sent = api.checkPracticeItem.mock.calls[0]![0];
        expect(sent.skip).toBe(true);
        expect(Object.values(sent.responses).every((m) => Object.keys(m as object).length === 0)).toBe(true);
    });

    it('a multiple-choice answer is said in the choice\'s own words', async () => {
        api.checkPracticeItem.mockResolvedValue(pxCheckResult(2, 'skipped'));
        runner(pxSession({ items: [pxSession().items[1]!], planned: 1 }));
        press('Skip');
        const verdict = await screen.findByRole('heading', { name: /Skipped/ });
        expect(verdict.textContent).toBe('Skipped. The answer is Doubling x doubles y.');
    });
});

describe('MixedRunner — the end', () => {
    async function playBoth(graded: boolean) {
        api.checkPracticeItem
            .mockResolvedValueOnce(pxCheckResult(1, 'right'))
            .mockResolvedValueOnce(pxCheckResult(2, 'skipped'));
        const view = runner(pxSession({ graded }));
        type('5');
        press('Check');
        await screen.findByRole('heading', { name: /Right/ });
        press('Next');
        expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Question 2 of 2' }));
        press('Skip');
        await screen.findByRole('heading', { name: /Skipped/ });
        press('Next');
        await screen.findByRole('heading', { name: 'Practice done' });
        return view;
    }

    it('ungraded: "You got 1 of 2 right." and "You skipped 1.", no score line (DM-11 as amended)', async () => {
        const view = await playBoth(false);
        expect(screen.getByTestId('mx-done-right').textContent).toBe('You got 1 of 2 right.');
        expect(view.container.textContent).toContain('You skipped 1.');
        expect(view.container.textContent).toContain('See you next lesson.');
        expect(screen.queryByTestId('mx-done-score')).toBeNull();
        expect(await screen.findByText('That’s everything for today.')).toBeTruthy();
    });

    it('graded: one more line, "Practice score: 1 of 2 (you answered 1 of 2)."', async () => {
        await playBoth(true);
        expect(screen.getByTestId('mx-done-score').textContent).toBe('Practice score: 1 of 2 (you answered 1 of 2).');
    });

    it('"Practise again" only when the server can plan another question (DM-7)', async () => {
        api.previewMixed.mockResolvedValue({ state: 'ready', doneToday: 1, graded: false, itemsPerSession: 2, planned: 2 });
        await playBoth(false);
        fireEvent.click(await screen.findByRole('button', { name: 'Practise again' }));
        expect(onAgain).toHaveBeenCalledTimes(1);
        expect(api.previewMixed).toHaveBeenCalledWith(PX_CLASS_ID);
    });

    it('Stop for now: counts what was tried, no score line even when graded, no Practise again (ruling 3)', async () => {
        api.checkPracticeItem.mockResolvedValueOnce(pxCheckResult(1, 'wrong'));
        const view = runner(pxSession({ graded: true }));
        type('8');
        press('Check');
        await screen.findByRole('heading', { name: /Not this time/ });
        press('Stop for now');
        expect(screen.getByRole('heading', { name: 'Stopped for now' })).toBeTruthy();
        expect(screen.getByTestId('mx-done-right').textContent).toBe('You got 0 of 1 right.');
        expect(view.container.textContent).toContain('You can carry on later today.');
        expect(screen.queryByTestId('mx-done-score')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Practise again' })).toBeNull();
        expect(api.previewMixed).not.toHaveBeenCalled();
    });

    it('resume starts at the first question not tried, and counts the earlier try (DM-6)', async () => {
        const session = pxSession();
        session.items[0]!.result = pxCheckResult(1, 'right');
        runner(session);
        expect(screen.getByRole('heading', { name: 'Question 2 of 2' })).toBeTruthy();
        press('Stop for now');
        expect(screen.getByTestId('mx-done-right').textContent).toBe('You got 1 of 1 right.');
    });
});

describe('MixedRunner — no connection, signed out (DM-5)', () => {
    it('a Check that cannot reach the server keeps the answer, says "Checking…", and lands when it can', async () => {
        api.checkPracticeItem
            .mockRejectedValueOnce(new CheckError('offline', 'Could not reach the server.'))
            .mockResolvedValueOnce(pxCheckResult(1, 'right'));
        runner();
        type('5');
        press('Check');
        expect(await screen.findByRole('button', { name: 'Checking…' })).toBeTruthy();
        expect(blank().value).toBe('5');
        // Not while a try is out: it may still land (Fable review P3).
        expect((screen.getByRole('button', { name: 'Stop for now' }) as HTMLButtonElement).disabled).toBe(true);
        // The retry fires by itself (1 s), the same request again.
        await screen.findByRole('heading', { name: /Right/ }, { timeout: 3000 });
        expect(api.checkPracticeItem).toHaveBeenCalledTimes(2);
        expect(api.checkPracticeItem.mock.calls[1]![0]).toEqual(api.checkPracticeItem.mock.calls[0]![0]);
    });

    it('the same under StrictMode: a remount never leaves the retry stopped (regression, e2e 2026-10-23)', async () => {
        api.checkPracticeItem
            .mockRejectedValueOnce(new CheckError('offline', 'Could not reach the server.'))
            .mockResolvedValueOnce(pxCheckResult(1, 'right'));
        render(
            <StrictMode>
                <MemoryRouter>
                    <MixedRunner session={pxSession()} userId="student-1" classId={PX_CLASS_ID} onAgain={onAgain} onEnded={onEnded} />
                </MemoryRouter>
            </StrictMode>,
        );
        type('5');
        press('Check');
        await screen.findByRole('heading', { name: /Right/ }, { timeout: 3000 });
        expect(api.checkPracticeItem).toHaveBeenCalledTimes(2);
    });

    it('after 10 s without the server: the quiet line, and "Try again" sends now', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        try {
            let reachable = false;
            api.checkPracticeItem.mockImplementation(async () => {
                if (!reachable) throw new CheckError('offline', 'Could not reach the server.');
                return pxCheckResult(1, 'right');
            });
            runner();
            type('5');
            press('Check');
            await act(async () => {
                await vi.advanceTimersByTimeAsync(11_000);
            });
            expect(screen.getByText(/Not connected\. Keep this page open; we’ll keep trying\./)).toBeTruthy();
            const calls = api.checkPracticeItem.mock.calls.length;
            reachable = true;
            press('Try again');
            await act(async () => {
                await vi.advanceTimersByTimeAsync(50);
            });
            expect(api.checkPracticeItem.mock.calls.length).toBe(calls + 1);
            await screen.findByRole('heading', { name: /Right/ });
        } finally {
            vi.useRealTimers();
        }
    });

    it('signed out: "Sign in again" returns here, and the typed answer comes back with the question', async () => {
        api.checkPracticeItem.mockRejectedValue(new CheckError('unauthenticated', 'Your session has expired.'));
        runner();
        type('7');
        press('Check');
        fireEvent.click(await screen.findByRole('button', { name: 'Sign in again' }));
        expect(auth.signInWithGoogle).toHaveBeenCalledWith(expect.objectContaining({ redirectTo: window.location.href }));
        // The page goes away for the sign-in; a new one comes back to question 1.
        cleanup();
        runner();
        await waitFor(() => expect(blank().value).toBe('7'));
        expect(blank().matches(':disabled')).toBe(false);
    });

    it('a practice that ended under the student says so and reads the entry again', async () => {
        api.checkPracticeItem.mockRejectedValue(new CheckError('unavailable', 'This activity is not available.'));
        runner();
        type('5');
        press('Check');
        fireEvent.click(await screen.findByRole('button', { name: 'See what is next' }));
        expect(onEnded).toHaveBeenCalledTimes(1);
    });
});
