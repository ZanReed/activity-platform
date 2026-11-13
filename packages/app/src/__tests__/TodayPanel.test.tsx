// @vitest-environment jsdom
// The teacher's Today panel (period assembly PA-3, PA-8; the day card, period
// planner PP-8), bound to rendered output.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import TodayPanel from '../practice/TodayPanel';

const api = vi.hoisted(() => ({ fetchClassToday: vi.fn(), setClassToday: vi.fn() }));
vi.mock('../lib/classToday', async (orig) => ({
    ...(await orig<typeof import('../lib/classToday')>()),
    ...api,
}));
const listTeacherClassActivities = vi.hoisted(() => vi.fn());
vi.mock('../lib/classActivities', () => ({ listTeacherClassActivities }));
const fetchMyChainHooks = vi.hoisted(() => vi.fn());
vi.mock('../lib/chainHooks', async (orig) => ({
    ...(await orig<typeof import('../lib/chainHooks')>()),
    fetchMyChainHooks,
}));
// PP-8: the day's detail. Rejected by default, so the card falls back to titles.
const fetchClassPlan = vi.hoisted(() => vi.fn());
vi.mock('../lib/classPlan', async (orig) => ({
    ...(await orig<typeof import('../lib/classPlan')>()),
    fetchClassPlan,
}));
vi.mock('../lib/mixedTeacher', () => ({ fetchMixedSummary: async () => { throw new Error('off'); } }));

/** The card, top to bottom: "label|minutes" per block. */
const card = () =>
    [...(screen.getByRole('list', { name: "Today's period" }).querySelectorAll('li'))].map(
        (li) => [...li.querySelectorAll('span')].map((s) => s.textContent).join('|'),
    );

const A = { activity_id: 'a', title: 'Unit rates' };
const B = { activity_id: 'b', title: 'Ratios' };
const row = (id: string, title: string, classId = 'c1', published = true) => ({
    classId,
    activityId: id,
    title,
    addedAt: '2026-11-01T00:00:00Z',
    published,
});
const show = (sprintOn = true, mixedOn = true) =>
    render(
        <MemoryRouter>
            <TodayPanel classId="c1" sprintOn={sprintOn} mixedOn={mixedOn} />
        </MemoryRouter>,
    );

beforeEach(() => {
    api.fetchClassToday.mockReset().mockResolvedValue({ on_date: '2026-11-04', activities: [] });
    api.setClassToday.mockReset();
    listTeacherClassActivities.mockReset().mockResolvedValue([
        row('a', 'Unit rates'),
        row('b', 'Ratios'),
        row('c', 'Scale'),
        row('x', 'Another class', 'c2'),
        row('d', 'Unpublished', 'c1', false),
    ]);
    fetchMyChainHooks.mockReset().mockResolvedValue({ activityChains: {}, chains: {} });
    fetchClassPlan.mockReset().mockRejectedValue(new Error('no detail'));
});
afterEach(cleanup);

describe('TodayPanel', () => {
    it('says nothing is picked, and offers only this class\'s published activities', async () => {
        show();
        fireEvent.click(await screen.findByRole('button', { name: "Pick today's activity" }));
        await screen.findByRole('button', { name: 'Use today: Unit rates' });
        expect(screen.getByText(/No activity picked for today/)).toBeTruthy();
        expect(screen.queryByText('Another class')).toBeNull();
        expect(screen.queryByText('Unpublished')).toBeNull();
    });

    it('picks an activity and shows the period line from the server\'s answer', async () => {
        api.setClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A] });
        show();
        fireEvent.click(await screen.findByRole('button', { name: "Pick today's activity" }));
        fireEvent.click(await screen.findByRole('button', { name: 'Use today: Unit rates' }));
        await screen.findByRole('list', { name: "Today's period" });
        expect(card()).toEqual(['Number facts|about 5 min', 'Unit rates|time not set', 'Practice|about 6–9 min']);
        expect(api.setClassToday).toHaveBeenCalledWith('c1', 'a', true);
        expect(screen.getByRole('button', { name: 'Remove from today: Unit rates' })).toBeTruthy();
    });

    it('removes a pick', async () => {
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A] });
        api.setClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [] });
        show();
        fireEvent.click(await screen.findByRole('button', { name: 'Change' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Remove from today: Unit rates' }));
        await screen.findByText(/No activity picked for today/);
        expect(api.setClassToday).toHaveBeenCalledWith('c1', 'a', false);
    });

    it('stops a seventh pick, but still lets a pick be removed', async () => {
        const six = [A, B, ...[3, 4, 5, 6].map((n) => ({ activity_id: `f${n}`, title: `Filler ${n}` }))];
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: six });
        show();
        fireEvent.click(await screen.findByRole('button', { name: 'Change' }));
        const third = (await screen.findByRole('button', { name: 'Use today: Scale' })) as HTMLButtonElement;
        expect(third.disabled).toBe(true);
        expect((screen.getByRole('button', { name: 'Remove from today: Ratios' }) as HTMLButtonElement).disabled).toBe(false);
        expect(screen.getByText(/Six is the most/)).toBeTruthy();
    });

    it('explains the refusal if another tab filled the day, and shows what it picked', async () => {
        api.setClassToday.mockRejectedValue(new Error('today_full'));
        show();
        fireEvent.click(await screen.findByRole('button', { name: "Pick today's activity" }));
        const scale = await screen.findByRole('button', { name: 'Use today: Scale' });
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A, B] });
        fireEvent.click(scale);
        expect((await screen.findByRole('alert')).textContent).toMatch(/6 activities at most/);
        await screen.findByRole('button', { name: 'Remove from today: Ratios' });
    });

    it('says an activity has gone, not that the connection failed, and reloads the list', async () => {
        api.setClassToday.mockRejectedValue(new Error('not_in_class'));
        show();
        fireEvent.click(await screen.findByRole('button', { name: "Pick today's activity" }));
        const scale = await screen.findByRole('button', { name: 'Use today: Scale' });
        listTeacherClassActivities.mockResolvedValue([row('a', 'Unit rates')]);
        fireEvent.click(scale);
        expect((await screen.findByRole('alert')).textContent).toMatch(/isn't available/);
        await waitFor(() => expect(screen.queryByText('Scale')).toBeNull());
    });

    it('starts clean on another class, without the last class\'s list', async () => {
        const view = show();
        fireEvent.click(await screen.findByRole('button', { name: "Pick today's activity" }));
        await screen.findByRole('button', { name: 'Use today: Scale' });
        listTeacherClassActivities.mockResolvedValue([row('z', 'Other class work', 'c2')]);
        view.rerender(
            <MemoryRouter>
                <TodayPanel classId="c2" sprintOn mixedOn />
            </MemoryRouter>,
        );
        fireEvent.click(await screen.findByRole('button', { name: "Pick today's activity" }));
        await screen.findByRole('button', { name: 'Use today: Other class work' });
        expect(screen.queryByText('Scale')).toBeNull();
    });

    it('says when a save failed, and keeps the plan on screen', async () => {
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A] });
        api.setClassToday.mockRejectedValue(new Error('network'));
        show();
        fireEvent.click(await screen.findByRole('button', { name: 'Change' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Use today: Ratios' }));
        expect((await screen.findByRole('alert')).textContent).toMatch(/didn't save/);
        expect(card()).toEqual(['Number facts|about 5 min', 'Unit rates|time not set', 'Practice|about 6–9 min']);
    });

    it('links the hook page only when the pick has a chain', async () => {
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A] });
        fetchMyChainHooks.mockResolvedValue({ activityChains: { a: 'chain.rates' }, chains: {} });
        show();
        const link = (await screen.findByRole('link', { name: 'Hooks for this unit' })) as HTMLAnchorElement;
        expect(link.getAttribute('href')).toBe('/chains/chain.rates');
    });

    it('has no hook link without a chain, and a failed hook read costs nothing', async () => {
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A] });
        fetchMyChainHooks.mockRejectedValue(new Error('network'));
        show();
        await screen.findByRole('list', { name: "Today's period" });
        await waitFor(() => expect(fetchMyChainHooks).toHaveBeenCalled());
        expect(screen.queryByRole('link', { name: 'Hooks for this unit' })).toBeNull();
        // PP-1: "Plan ahead" is always there, to this class's Plan page.
        expect(screen.getByRole('link', { name: 'Plan ahead' }).getAttribute('href')).toMatch(/\/classes\/[^/]+\/plan$/);
    });

    it('says so when the plan can\'t load, without blocking the page', async () => {
        api.fetchClassToday.mockRejectedValue(new Error('network'));
        show();
        await screen.findByText(/couldn't load/);
    });

    it('PP-8: the card names only what is on, each block with its time, then the total', async () => {
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A, B] });
        fetchClassPlan.mockResolvedValue({
            today: '2026-11-04',
            limit: '2026-12-18',
            days: [
                {
                    on_date: '2026-11-04',
                    activities: [
                        { activity_id: 'a', title: 'Unit rates', minutes: 25, position: 1, available: true },
                        { activity_id: 'b', title: 'Ratios', minutes: null, position: 2, available: true },
                    ],
                    hook_ids: ['hook.rates.1'],
                },
            ],
            last_day: null,
        });
        fetchMyChainHooks.mockResolvedValue({
            activityChains: { a: 'chain.rates' },
            chains: { 'chain.rates': [{ id: 'hook.rates.1', connects_to: [], prompt: 'Which is the better deal, and how do you know?', note: '' }] },
        });
        show(true, false);
        await waitFor(() => expect(card()).toContain('Unit rates|about 25 min'));
        expect(card()).toEqual([
            'Number facts|about 5 min',
            // The hook by its first eight words (RT1's short name).
            'Hook: Which is the better deal, and how do…|about 2–3 min',
            'Unit rates|about 25 min',
            'Ratios|time not set',
        ]);
        expect(screen.getByText('About 32–33 min + Ratios (time not set)')).toBeTruthy();
        expect(screen.getByRole('link', { name: /^Hook: Which is the better deal/ }).getAttribute('href')).toBe('/chains/chain.rates');
    });

    it('PP-2: Carry on today puts last time\'s activity on today', async () => {
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [] });
        fetchClassPlan.mockResolvedValue({
            today: '2026-11-04',
            limit: '2026-12-18',
            days: [],
            last_day: {
                on_date: '2026-11-03',
                activities: [
                    { activity_id: 'c', title: 'Scale', minutes: 30, position: 1, available: true },
                    { activity_id: 'g', title: 'Gone', minutes: null, position: 2, available: false },
                ],
            },
        });
        api.setClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [{ activity_id: 'c', title: 'Scale' }] });
        show();
        const carryOn = await screen.findByRole('button', { name: 'Carry on Scale today' });
        expect(screen.getByText('Last time (Tue 3 Nov):')).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Carry on Gone today' })).toBeNull();
        fireEvent.click(carryOn);
        await waitFor(() => expect(api.setClassToday).toHaveBeenCalledWith('c1', 'c', true));
        // Once it is on today, it is no longer offered.
        await waitFor(() => expect(screen.queryByRole('button', { name: 'Carry on Scale today' })).toBeNull());
    });

    it('after a pick, the card never shows stale detail: titles until the re-read matches', async () => {
        const plan = (acts: { activity_id: string; title: string; minutes: number | null }[]) => ({
            today: '2026-11-04',
            limit: '2026-12-18',
            days: [{ on_date: '2026-11-04', activities: acts.map((a, i) => ({ ...a, position: i + 1, available: true })), hook_ids: [] }],
            last_day: null,
        });
        api.fetchClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A] });
        fetchClassPlan.mockResolvedValueOnce(plan([{ ...A, minutes: 25 }]));
        // The re-read after the pick never lands.
        fetchClassPlan.mockReturnValueOnce(new Promise(() => undefined));
        api.setClassToday.mockResolvedValue({ on_date: '2026-11-04', activities: [A, B] });
        show(false, false);
        await waitFor(() => expect(card()).toEqual(['Unit rates|about 25 min']));
        fireEvent.click(screen.getByRole('button', { name: 'Change' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Use today: Ratios' }));
        await waitFor(() => expect(card()).toEqual(['Unit rates|time not set', 'Ratios|time not set']));
    });
});
