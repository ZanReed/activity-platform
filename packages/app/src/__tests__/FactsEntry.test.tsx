// @vitest-environment jsdom
// /facts/:code — the rule the e2e rows cannot force: once a run is on screen,
// NOTHING but the student's own sign-out tears it down (the author's no-reload
// rule). The session context is mocked so the test can make the role re-read
// mid-run — which is what really happens after a pending account joins (the
// route calls retryRole) and what a slow role fetch can do at any time.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const session = vi.hoisted(() => ({
    value: {
        session: { user: { id: 'student-1' } } as unknown,
        loading: false,
        role: 'student' as string | null,
        roleStatus: 'ready' as string,
        retryRole: vi.fn(),
    },
}));
vi.mock('../lib/SessionContext', () => ({ useSession: () => session.value }));

const api = vi.hoisted(() => ({ fetchEntry: vi.fn(), saveAttempts: vi.fn() }));
vi.mock('../lib/factProbe', async (orig) => ({
    ...(await orig<typeof import('../lib/factProbe')>()),
    ...api,
}));
const sprintApi = vi.hoisted(() => ({ fetchSprintEntry: vi.fn(), saveSprintAttempts: vi.fn() }));
vi.mock('../lib/factSprint', () => sprintApi);
vi.mock('../lib/classes', () => ({ joinClass: vi.fn(), redeemJoinCode: vi.fn() }));
const mixedApi = vi.hoisted(() => ({
    lookupPracticeClass: vi.fn(),
    previewMixed: vi.fn(),
    startMixed: vi.fn(),
    finishMixed: vi.fn(),
    checkPracticeItem: vi.fn(),
}));
vi.mock('../lib/mixedPractice', async (orig) => ({
    ...(await orig<typeof import('../lib/mixedPractice')>()),
    ...mixedApi,
}));
vi.mock('../lib/auth', () => ({ signInWithGoogle: vi.fn() }));
vi.mock('../lib/studentAuth', () => ({ signOutEverything: vi.fn(async () => {}) }));

import FactsEntry, { WAIT_POLL_MS } from '../routes/FactsEntry';

const READY = {
    state: 'ready', probe_id: 'probe-1', total: 2, ceiling_s: 15, saved: 0, next_n: 1,
    counts: { right: 0, skipped: 0, not_counted: 0 },
    baselines: { keyboard: null, keypad: null },
    items: [
        { n: 1, display: '7 × 8 = __', spoken: 'seven times eight', answer: '56' },
        { n: 2, display: '9 × 6 = __', spoken: 'nine times six', answer: '54' },
    ],
};

function page() {
    return render(
        <MemoryRouter initialEntries={['/facts/ABC234']}>
            <Routes>
                <Route path="/facts/:code" element={<FactsEntry />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    api.fetchEntry.mockReset().mockResolvedValue(READY);
    api.saveAttempts.mockReset().mockResolvedValue({ state: 'saved', saved: 1, finished: false });
    sprintApi.fetchSprintEntry.mockReset().mockResolvedValue({ state: 'off' });
    // Mixed practice off unless a test turns it on.
    mixedApi.lookupPracticeClass.mockReset().mockResolvedValue({ id: 'class-1', mixedOn: false });
    mixedApi.previewMixed.mockReset().mockResolvedValue({ state: 'off' });
    mixedApi.startMixed.mockReset();
    mixedApi.finishMixed.mockReset();
    sprintApi.saveSprintAttempts.mockReset().mockResolvedValue({ state: 'saved', saved: 1, finished: false, quick_right: 1, best_before: null });
    session.value = { ...session.value, role: 'student', roleStatus: 'ready', loading: false };
});
afterEach(cleanup);

describe('FactsEntry', () => {
    it('a role re-read while a run is on screen does not tear it down or re-read the entry', async () => {
        const view = page();
        await screen.findByRole('heading', { name: 'Quick number facts' });
        expect(api.fetchEntry).toHaveBeenCalledTimes(1);
        expect(api.fetchEntry).toHaveBeenCalledWith('ABC234');

        // The student starts: the warm-up is on screen and they have typed.
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        // WAIT for the warm-up, do not assume it is there synchronously. The
        // intro arrives from an async load (outside act), so React may not yet
        // have subscribed the runner to its store when the click lands; it
        // re-renders a tick later. Reading the DOM in the same tick failed
        // once on CI (run for a864945, 2026-10-05) and never locally.
        const answer = await screen.findByTestId('fx-answer');
        fireEvent.keyDown(answer, { key: '4' });
        expect(answer.textContent).toBe('4');

        // The role is re-read: loading, then ready again.
        session.value = { ...session.value, roleStatus: 'loading' };
        await act(async () => {
            view.rerender(
                <MemoryRouter initialEntries={['/facts/ABC234']}>
                    <Routes>
                        <Route path="/facts/:code" element={<FactsEntry />} />
                    </Routes>
                </MemoryRouter>,
            );
        });
        // Still the SAME runner, with what was typed — not a gate card.
        expect(screen.getByTestId('fx-answer')).toBe(answer);
        expect(answer.textContent).toBe('4');

        session.value = { ...session.value, roleStatus: 'ready' };
        await act(async () => {
            view.rerender(
                <MemoryRouter initialEntries={['/facts/ABC234']}>
                    <Routes>
                        <Route path="/facts/:code" element={<FactsEntry />} />
                    </Routes>
                </MemoryRouter>,
            );
        });
        expect(screen.getByTestId('fx-answer')).toBe(answer);
        expect(answer.textContent).toBe('4');
        expect(api.fetchEntry).toHaveBeenCalledTimes(1);
    });

    it('shows each named state its own card and never the word "probe"', async () => {
        for (const [entry, heading] of [
            [{ state: 'none_open' }, 'Nothing to do yet'],
            [{ state: 'not_member' }, 'Join this class first'],
            [{ state: 'teacher' }, 'This link is for students'],
            [{ state: 'closed', saved: 15, total: 30, counts: { right: 9, skipped: 1, not_counted: 0 } }, 'Your teacher has finished this'],
            [{ state: 'finished', saved: 30, total: 30, counts: { right: 24, skipped: 2, not_counted: 2 } }, 'All done'],
        ] as const) {
            api.fetchEntry.mockResolvedValue(entry);
            const { container } = page();
            await screen.findByRole('heading', { name: heading });
            expect(container.textContent).not.toMatch(/probe/i);
            if (entry.state === 'closed') expect(container.textContent).toContain('Your 15 answers were saved.');
            if (entry.state === 'finished') {
                expect(container.textContent).toContain('You got 24 right. You skipped 2.');
                expect(container.textContent).toContain('2 were not counted because you left the page.');
                expect(container.textContent).not.toMatch(/out of/);
            }
            cleanup();
        }
    });

    it('a failed entry read says so and retries on request', async () => {
        api.fetchEntry.mockRejectedValueOnce(new Error('fetch failed'));
        page();
        await screen.findByRole('heading', { name: 'That did not load' });
        api.fetchEntry.mockResolvedValue({ state: 'none_open' });
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        });
        await screen.findByRole('heading', { name: 'Nothing to do yet' });
    });

    // ---- the daily practice at the same link (D43 slice 2, SP-1) ----------------
    const SESSION = {
        session_id: 'sess-1', minutes: 5, reask_gap: 3, ceiling_s: 15, total: 3,
        baselines: { keyboard: 200, keypad: null },
        families: [{
            family_id: 'fact.mult.to-12', name: 'Multiplication to 12 × 12', mode: 'strategy', show_strategy: true,
            strategy: { intro: 'Start from a fact you know.', lines: [{ label: '×5', text: 'Half of ×10.' }], example: null },
        }],
        items: [
            { n: 1, family_id: 'fact.mult.to-12', display: '7 × 8 = __', spoken: 'seven times eight', answer: '56' },
            { n: 2, family_id: 'fact.mult.to-12', display: '9 × 6 = __', spoken: 'nine times six', answer: '54' },
            { n: 3, family_id: 'fact.mult.to-12', display: '6 × 6 = __', spoken: 'six times six', answer: '36' },
        ],
        saved: [], best_before: null,
    };
    const COMMON = { done_today: 0, best: null, class_name: '9 Maths B' };

    it('an open check comes first: the practice is not even asked about', async () => {
        page();
        await screen.findByRole('heading', { name: 'Quick number facts' });
        expect(sprintApi.fetchSprintEntry).not.toHaveBeenCalled();
    });

    it('with no check open and the practice on: the practice card; asking does not start, Start does', async () => {
        api.fetchEntry.mockResolvedValue({ state: 'none_open' });
        sprintApi.fetchSprintEntry.mockImplementation(async (_code: string, start = false) =>
            start ? { ...COMMON, state: 'ready', due: 3, session: SESSION } : { ...COMMON, state: 'ready', due: 3, minutes: 5 });
        const { container } = page();
        await screen.findByRole('heading', { name: 'Number facts practice' });
        expect(container.textContent).toContain('About 5 minutes');
        expect(sprintApi.fetchSprintEntry).toHaveBeenCalledTimes(1);
        expect(sprintApi.fetchSprintEntry).toHaveBeenCalledWith('ABC234');
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        });
        expect(sprintApi.fetchSprintEntry).toHaveBeenLastCalledWith('ABC234', true);
        // The family is in strategy mode: its strategy comes before the facts.
        const card = await screen.findByTestId('fx-strategy');
        expect(card.textContent).toContain('Multiplication to 12 × 12');
        expect(card.textContent).toContain('Start from a fact you know.');
        expect(card.textContent).toContain('×5: Half of ×10.');
        expect(container.textContent).not.toMatch(/probe|sprint/i);
    });

    it('the waiting room asks both reads at once on each poll (audit #13)', async () => {
        // The poll is driven by calling its own callback — no fake clock, so the
        // row cannot flake on a loaded machine.
        const intervals = vi.spyOn(window, 'setInterval');
        try {
            api.fetchEntry.mockResolvedValue({ state: 'none_open' });
            page();
            await screen.findByRole('heading', { name: 'Nothing to do yet' });
            // The first read was sequential: entry, then practice.
            expect(api.fetchEntry).toHaveBeenCalledTimes(1);
            expect(sprintApi.fetchSprintEntry).toHaveBeenCalledTimes(1);
            const poll = intervals.mock.calls.find(([, ms]) => ms === WAIT_POLL_MS)?.[0];
            expect(typeof poll).toBe('function');
            // The poll's entry read hangs; the practice read must not wait on it.
            let answer: (v: unknown) => void = () => {};
            api.fetchEntry.mockImplementation(() => new Promise((r) => { answer = r; }));
            await act(async () => {
                (poll as () => void)();
            });
            expect(api.fetchEntry).toHaveBeenCalledTimes(2);
            expect(sprintApi.fetchSprintEntry).toHaveBeenCalledTimes(2);
            await act(async () => answer({ state: 'none_open' }));
            expect(screen.getByRole('heading', { name: 'Nothing to do yet' })).toBeTruthy();
        } finally {
            intervals.mockRestore();
        }
    });

    it('the practice off (or a database without it) leaves the check\'s own screens', async () => {
        api.fetchEntry.mockResolvedValue({ state: 'none_open' });
        sprintApi.fetchSprintEntry.mockRejectedValue(new Error('function fact_sprint_entry does not exist'));
        page();
        await screen.findByRole('heading', { name: 'Nothing to do yet' });
    });

    it('nothing due, and a session to resume, each have their own card', async () => {
        api.fetchEntry.mockResolvedValue({ state: 'finished', saved: 30, total: 30, counts: { right: 24, skipped: 2, not_counted: 0 } });
        sprintApi.fetchSprintEntry.mockResolvedValue({ ...COMMON, done_today: 1, state: 'nothing_due' });
        const first = page();
        await screen.findByRole('heading', { name: 'Nothing to practise right now' });
        expect(first.container.textContent).toContain('Come back tomorrow.');
        cleanup();
        sprintApi.fetchSprintEntry.mockResolvedValue({
            ...COMMON, state: 'resume',
            session: { ...SESSION, families: [], saved: [{ n: 1, reask: false, missed: false }] },
        });
        page();
        await screen.findByRole('heading', { name: 'Welcome back' });
        fireEvent.click(screen.getByRole('button', { name: 'Keep going' }));
        // Item 1 is saved: the session picks up at item 2, with no strategy card.
        await screen.findByTestId('fx-answer');
        expect(screen.getByText('9 × 6 = __')).toBeTruthy();
    });

    // ---- mixed practice at the same link (D43 mixed practice slice 3, DM-1) ------
    const MIXED_READY = { state: 'ready', doneToday: 0, graded: false, itemsPerSession: 6, planned: 6 } as const;
    function practicePage() {
        return render(
            <MemoryRouter initialEntries={['/practice/ABC234']}>
                <Routes>
                    <Route path="/practice/:code" element={<FactsEntry />} />
                </Routes>
            </MemoryRouter>,
        );
    }
    function mixedOn(preview: object = MIXED_READY) {
        api.fetchEntry.mockResolvedValue({ state: 'none_open' });
        mixedApi.lookupPracticeClass.mockResolvedValue({ id: 'class-1', mixedOn: true });
        mixedApi.previewMixed.mockResolvedValue(preview);
    }

    it('mixed practice alone: straight to its start card, minutes from the questions planned; asking writes nothing (DM-1, DM-12)', async () => {
        mixedOn({ ...MIXED_READY, planned: 3 });
        const { container } = practicePage();
        await screen.findByRole('heading', { name: 'Practice' });
        expect(container.textContent).toContain('3 questions · about 3–5 minutes.');
        expect(container.textContent).toContain(
            'One try each. Have a go even if you’re unsure. A wrong try still helps you remember. You can see the working after every answer.',
        );
        expect(container.textContent).not.toContain('recording a practice score');
        expect(mixedApi.lookupPracticeClass).toHaveBeenCalledWith('ABC234');
        expect(mixedApi.previewMixed).toHaveBeenCalledWith('class-1');
        expect(mixedApi.startMixed).not.toHaveBeenCalled();
        // No waiting room under a practice card.
        expect(screen.queryByRole('heading', { name: 'Nothing to do yet' })).toBeNull();
    });

    it('a class recording a score says so on the start card, and Start opens question 1', async () => {
        const { pxStartResult, pxSession } = await import('../test/practiceFixtures');
        mixedOn({ ...MIXED_READY, graded: true, planned: 2 });
        mixedApi.startMixed.mockResolvedValue(pxStartResult(pxSession({ graded: true })));
        practicePage();
        await screen.findByText('Your teacher is recording a practice score today.');
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        });
        expect(mixedApi.startMixed).toHaveBeenCalledWith('class-1');
        await screen.findByRole('heading', { name: 'Question 1 of 2' });
    });

    it('both on: the chooser first, each line with about how long; each leads to its own card (DM-1)', async () => {
        mixedOn();
        sprintApi.fetchSprintEntry.mockResolvedValue({ ...COMMON, state: 'ready', due: 3, minutes: 5 });
        page();
        await screen.findByRole('heading', { name: 'Practice' });
        expect(screen.getByRole('button', { name: 'Number facts · about 5 min' })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Practice · about 6–9 min' }));
        await screen.findByText('6 questions · about 6–9 minutes.');
        cleanup();
        page();
        fireEvent.click(await screen.findByRole('button', { name: 'Number facts · about 5 min' }));
        await screen.findByRole('heading', { name: 'Number facts practice' });
    });

    it('the resume card: where they stopped, Carry on, and Finish here with the server\'s counts (DM-6)', async () => {
        mixedOn({ state: 'resume', doneToday: 0, graded: true, itemsPerSession: 6, planned: 6, nextSeq: 4, sessionId: 'sess-9' });
        mixedApi.finishMixed.mockResolvedValue({ planned: 6, right: 2, answered: 3, skipped: 0, graded: true });
        practicePage();
        await screen.findByText('You stopped at question 4 of 6.');
        expect(screen.getByRole('button', { name: 'Carry on' })).toBeTruthy();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Finish here' }));
        });
        expect(mixedApi.finishMixed).toHaveBeenCalledWith('sess-9');
        await screen.findByRole('heading', { name: 'Practice done' });
        expect(screen.getByTestId('mx-done-right').textContent).toBe('You got 2 of 6 right.');
        expect(screen.getByTestId('mx-done-score').textContent).toBe('Practice score: 2 of 6 (you answered 3 of 6).');
    });

    it('the empty states each say what to do, with a way back to the classes (DM-4)', async () => {
        for (const [state, heading, line] of [
            ['nothing_taught', 'Nothing to practise yet', 'It starts the day after you check your first activity.'],
            ['nothing_due', 'Nothing to practise today', 'Come back next lesson.'],
            ['done_today', 'You’ve done today’s practice', 'That’s everything for today.'],
        ] as const) {
            mixedOn({ state, doneToday: 1, graded: false, itemsPerSession: 6, planned: 0 });
            const { container } = practicePage();
            await screen.findByRole('heading', { name: heading });
            expect(container.textContent).toContain(line);
            expect(screen.getByRole('link', { name: 'Go to your classes' }).getAttribute('href')).toBe('/');
            cleanup();
        }
    });

    it('mixed practice off, or its read failing, leaves the check\'s own screens', async () => {
        api.fetchEntry.mockResolvedValue({ state: 'none_open' });
        mixedApi.lookupPracticeClass.mockResolvedValue({ id: 'class-1', mixedOn: true });
        mixedApi.previewMixed.mockRejectedValue(new Error('network'));
        page();
        await screen.findByRole('heading', { name: 'Nothing to do yet' });
    });

    // ---- Fable review 2026-10-23 regressions ---------------------------------------
    it('P1: "Practise again" that fails shows the failure, not the done screen it was pressed on', async () => {
        const { pxStartResult, pxSession, pxCheckResult } = await import('../test/practiceFixtures');
        mixedOn({ ...MIXED_READY, planned: 1 });
        const one = pxSession({ planned: 1, items: [pxSession().items[1]!] });
        mixedApi.startMixed.mockResolvedValueOnce(pxStartResult(one)).mockRejectedValueOnce(new Error('Not available'));
        mixedApi.checkPracticeItem.mockResolvedValue(pxCheckResult(2, 'skipped'));
        mixedApi.previewMixed.mockResolvedValue({ ...MIXED_READY, planned: 1 }); // the done screen may offer again
        practicePage();
        const start = await screen.findByRole('button', { name: 'Start' });
        await act(async () => fireEvent.click(start));
        fireEvent.click(await screen.findByRole('button', { name: 'Skip' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
        const again = await screen.findByRole('button', { name: 'Practise again' });
        await act(async () => fireEvent.click(again));
        await screen.findByRole('heading', { name: 'That did not load' });
        expect(screen.queryByRole('heading', { name: 'Practice done' })).toBeNull();
    });

    it('P1 + P2: a practice that ends under the student reads the entry again and offers the chooser again', async () => {
        const { CheckError } = await import('@activity/viewer');
        const { pxStartResult, pxSession } = await import('../test/practiceFixtures');
        mixedOn();
        sprintApi.fetchSprintEntry.mockResolvedValue({ ...COMMON, state: 'ready', due: 3, minutes: 5 });
        mixedApi.startMixed.mockResolvedValue(pxStartResult(pxSession()));
        mixedApi.checkPracticeItem.mockRejectedValue(new CheckError('unavailable', 'Not available'));
        page();
        fireEvent.click(await screen.findByRole('button', { name: 'Practice · about 6–9 min' }));
        const start = await screen.findByRole('button', { name: 'Start' });
        await act(async () => fireEvent.click(start));
        fireEvent.click(await screen.findByRole('button', { name: 'Skip' }));
        const ended = await screen.findByRole('button', { name: 'See what is next' });
        const reads = api.fetchEntry.mock.calls.length;
        await act(async () => fireEvent.click(ended));
        await screen.findByRole('button', { name: 'Number facts · about 5 min' });
        expect(api.fetchEntry.mock.calls.length).toBe(reads + 1);
    });

    it('mixed practice switched off: the class is read, the preview is never asked', async () => {
        api.fetchEntry.mockResolvedValue({ state: 'none_open' });
        page();
        await screen.findByRole('heading', { name: 'Nothing to do yet' });
        expect(mixedApi.lookupPracticeClass).toHaveBeenCalledWith('ABC234');
        expect(mixedApi.previewMixed).not.toHaveBeenCalled();
    });
});

