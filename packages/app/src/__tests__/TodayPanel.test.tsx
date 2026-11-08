// @vitest-environment jsdom
// The teacher's Today panel (period assembly PA-3, PA-8), bound to rendered output.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import TodayPanel, { periodLine } from '../practice/TodayPanel';

const api = vi.hoisted(() => ({ fetchClassToday: vi.fn(), setClassToday: vi.fn() }));
vi.mock('../lib/classToday', async (orig) => ({
    ...(await orig<typeof import('../lib/classToday')>()),
    ...api,
}));
const listTeacherClassActivities = vi.hoisted(() => vi.fn());
vi.mock('../lib/classActivities', () => ({ listTeacherClassActivities }));
const fetchMyChainHooks = vi.hoisted(() => vi.fn());
vi.mock('../lib/chainHooks', () => ({ fetchMyChainHooks }));

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
});
afterEach(cleanup);

describe('periodLine', () => {
    it('reads in the shape order, naming only what is on', () => {
        expect(periodLine(true, true, ['Unit rates'])).toBe('Number facts 5 · Hook · Unit rates · Practice');
        expect(periodLine(false, false, ['Unit rates'])).toBe('Hook · Unit rates');
    });
    it('has one hook on a double, and practice after each activity', () => {
        expect(periodLine(true, true, ['A', 'B'])).toBe('Number facts 5 · Hook · A · Practice · B · Practice');
    });
});

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
        await screen.findByText('Number facts 5 · Hook · Unit rates · Practice');
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
        expect(screen.getByText('Number facts 5 · Hook · Unit rates · Practice')).toBeTruthy();
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
        await screen.findByText('Number facts 5 · Hook · Unit rates · Practice');
        await waitFor(() => expect(fetchMyChainHooks).toHaveBeenCalled());
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('says so when the plan can\'t load, without blocking the page', async () => {
        api.fetchClassToday.mockRejectedValue(new Error('network'));
        show();
        await screen.findByText(/couldn't load/);
    });
});
