// @vitest-environment jsdom
// =============================================================================
// TimezoneControl.test.tsx — the teacher's day zone (PP-11, 0088)
// -----------------------------------------------------------------------------
// Bound to what is SENT: set_my_timezone with the chosen zone, never a write
// without a click; the warning that a change moves every class's day is shown
// before anything is saved.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
    MY_TIMEZONE_RPC,
    SET_MY_TIMEZONE_RPC,
    offerZone,
    zoneCity,
    zoneOptions,
} from '../lib/teacherTimezone';

const h = vi.hoisted(() => ({
    rpc: vi.fn(),
    zone: { zone: 'America/Chicago', is_set: false } as { zone: string; is_set: boolean },
}));
vi.mock('../lib/supabase', () => ({ supabase: { rpc: h.rpc } }));

import TimezoneControl from '../components/TimezoneControl';

function setBrowserZone(zone: string) {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
        timeZone: zone,
    } as Intl.ResolvedDateTimeFormatOptions);
}

beforeEach(() => {
    h.zone = { zone: 'America/Chicago', is_set: false };
    h.rpc.mockReset();
    h.rpc.mockImplementation(async (name: string, args?: { p_zone: string }) => {
        if (name === MY_TIMEZONE_RPC) return { data: h.zone, error: null };
        if (name === SET_MY_TIMEZONE_RPC) {
            if (args?.p_zone === 'Mars/Olympus') return { data: null, error: { message: 'bad_zone' } };
            h.zone = { zone: args!.p_zone, is_set: true };
            return { data: h.zone, error: null };
        }
        return { data: null, error: { message: `unexpected ${name}` } };
    });
});
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('TimezoneControl', () => {
    it('unset + a different browser zone: offers it, writes nothing until clicked', async () => {
        setBrowserZone('Pacific/Auckland');
        render(<TimezoneControl />);
        await screen.findByText(/Your classes follow Chicago time\. Use Auckland time\?/);
        expect(screen.getAllByText(/moves the day for all your classes/).length).toBeGreaterThan(0);
        expect(h.rpc).not.toHaveBeenCalledWith(SET_MY_TIMEZONE_RPC, expect.anything());
        fireEvent.click(screen.getByRole('button', { name: 'Use Auckland time' }));
        await waitFor(() => expect(h.rpc).toHaveBeenCalledWith(SET_MY_TIMEZONE_RPC, { p_zone: 'Pacific/Auckland' }));
        await screen.findByText('Auckland');
        expect(screen.queryByText(/Use Auckland time\?/)).toBeNull();
    });

    it('a set zone makes no offer, even when the browser differs', async () => {
        h.zone = { zone: 'America/New_York', is_set: true };
        setBrowserZone('Pacific/Auckland');
        render(<TimezoneControl />);
        await screen.findByText('New York');
        expect(screen.queryByText(/Use Auckland time\?/)).toBeNull();
        expect(screen.queryByText(/\(the default\)/)).toBeNull();
    });

    it('Change: pick a zone, see the warning, Save sends it', async () => {
        setBrowserZone('America/Chicago');
        render(<TimezoneControl />);
        fireEvent.click(await screen.findByRole('button', { name: 'Change your timezone' }));
        expect(screen.getByText(/moves the day for all your classes/)).toBeTruthy();
        fireEvent.change(screen.getByLabelText('Days follow'), { target: { value: 'America/Denver' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(h.rpc).toHaveBeenCalledWith(SET_MY_TIMEZONE_RPC, { p_zone: 'America/Denver' }));
        await screen.findByText('Denver');
    });

    it('a zone the server refuses is named and nothing changes', async () => {
        setBrowserZone('America/Chicago');
        render(<TimezoneControl />);
        fireEvent.click(await screen.findByRole('button', { name: 'Change your timezone' }));
        const select = screen.getByLabelText('Days follow') as HTMLSelectElement;
        const opt = document.createElement('option');
        opt.value = 'Mars/Olympus';
        select.appendChild(opt);
        fireEvent.change(select, { target: { value: 'Mars/Olympus' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect((await screen.findByRole('alert')).textContent).toMatch(/isn’t a timezone the server knows/);
        // Still editing, nothing saved: the form is open and the select holds the refused zone.
        expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
        expect(h.zone.zone).toBe('America/Chicago');
    });
});

describe('TimezoneControl edges', () => {
    it('a teacher on the Chicago default can confirm it (Save enabled while unset)', async () => {
        setBrowserZone('America/Chicago');
        render(<TimezoneControl />);
        fireEvent.click(await screen.findByRole('button', { name: 'Change your timezone' }));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(h.rpc).toHaveBeenCalledWith(SET_MY_TIMEZONE_RPC, { p_zone: 'America/Chicago' }));
        await waitFor(() => expect(screen.queryByText(/\(the default\)/)).toBeNull());
        // Focus goes back to Change, and the save is announced.
        await waitFor(() => expect(document.activeElement?.textContent).toBe('Change'));
        expect(screen.getByRole('status').textContent).toMatch(/days now follow Chicago time/);
    });

    it('a load failure says so instead of a wrong zone', async () => {
        h.rpc.mockImplementation(async () => ({ data: null, error: { message: 'offline' } }));
        render(<TimezoneControl />);
        expect((await screen.findByText(/couldn’t be loaded/)).textContent).toMatch(/offline/);
    });

    it('a refused offer shows the error and leaves the offer up', async () => {
        setBrowserZone('Pacific/Auckland');
        h.rpc.mockImplementation(async (name: string) =>
            name === MY_TIMEZONE_RPC
                ? { data: { zone: 'America/Chicago', is_set: false }, error: null }
                : { data: null, error: { message: 'Only teachers set a timezone' } },
        );
        render(<TimezoneControl />);
        fireEvent.click(await screen.findByRole('button', { name: 'Use Auckland time' }));
        expect((await screen.findByRole('alert')).textContent).toMatch(/Only teachers/);
        expect(screen.getByRole('button', { name: 'Use Auckland time' })).toBeTruthy();
    });
});

describe('teacherTimezone', () => {
    it('names a zone by its city', () => {
        expect(zoneCity('Pacific/Auckland')).toBe('Auckland');
        expect(zoneCity('America/Argentina/Buenos_Aires')).toBe('Buenos Aires');
    });
    it('offers only when unset and different', () => {
        expect(offerZone({ zone: 'America/Chicago', isSet: false }, 'Pacific/Auckland')).toBe('Pacific/Auckland');
        expect(offerZone({ zone: 'America/Chicago', isSet: false }, 'America/Chicago')).toBeNull();
        expect(offerZone({ zone: 'America/Chicago', isSet: true }, 'Pacific/Auckland')).toBeNull();
        expect(offerZone({ zone: 'America/Chicago', isSet: false }, null)).toBeNull();
    });
    it('always lists the current zone', () => {
        expect(zoneOptions('Etc/Unknown_Zone')).toContain('Etc/Unknown_Zone');
    });
});
