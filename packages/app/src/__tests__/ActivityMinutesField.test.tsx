// @vitest-environment jsdom
// =============================================================================
// ActivityMinutesField.test.tsx — the drawer's "About how long" (PP-5, 0088)
// -----------------------------------------------------------------------------
// Bound to what is SAVED: the field commits through onCommit (its own write,
// never autosave), on blur or Enter, blank clears, out-of-range is named and
// not saved, and the saved state is visible.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ActivityMinutesField from '../components/ActivityMinutesField';
import {
    formatActivityMinutes,
    mergeImportedMinutes,
    minutesUpdate,
    parseMinutesInput,
} from '../lib/activityMinutes';

afterEach(cleanup);

describe('ActivityMinutesField', () => {
    it('commits a whole number on blur and shows Saved', async () => {
        const onCommit = vi.fn(async () => {});
        render(<ActivityMinutesField minutes={null} onCommit={onCommit} fromFile={false} />);
        const input = screen.getByLabelText('About how long');
        fireEvent.change(input, { target: { value: '30' } });
        fireEvent.blur(input);
        await waitFor(() => expect(screen.getByText('Saved')).toBeTruthy());
        expect(onCommit).toHaveBeenCalledWith(30);
    });

    it('Enter commits; blank clears to null', async () => {
        const onCommit = vi.fn(async () => {});
        render(<ActivityMinutesField minutes={25} onCommit={onCommit} fromFile={false} />);
        const input = screen.getByLabelText('About how long');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(onCommit).toHaveBeenCalledWith(null));
    });

    it('an unchanged value saves nothing', () => {
        const onCommit = vi.fn(async () => {});
        render(<ActivityMinutesField minutes={25} onCommit={onCommit} fromFile={false} />);
        fireEvent.blur(screen.getByLabelText('About how long'));
        expect(onCommit).not.toHaveBeenCalled();
    });

    it('out of range or not whole is named and NOT saved', () => {
        const onCommit = vi.fn(async () => {});
        render(<ActivityMinutesField minutes={null} onCommit={onCommit} fromFile={false} />);
        const input = screen.getByLabelText('About how long');
        for (const bad of ['0', '121', '2.5', 'ten']) {
            fireEvent.change(input, { target: { value: bad } });
            fireEvent.blur(input);
            expect(screen.getByRole('alert').textContent).toMatch(/Whole minutes, 1 to 120/);
        }
        expect(onCommit).not.toHaveBeenCalled();
    });

    it('a failed save says so and keeps the typed value', async () => {
        const onCommit = vi.fn(async () => {
            throw new Error('offline');
        });
        render(<ActivityMinutesField minutes={null} onCommit={onCommit} fromFile={false} />);
        const input = screen.getByLabelText('About how long') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '40' } });
        fireEvent.blur(input);
        await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/Not saved: offline/));
        expect(input.value).toBe('40');
    });

    it('a catalogue activity says the next import replaces an app edit', () => {
        render(<ActivityMinutesField minutes={30} onCommit={async () => {}} fromFile />);
        expect(screen.getByText(/next import replaces this with its value/)).toBeTruthy();
    });
});

describe('activityMinutes', () => {
    it('parses the field', () => {
        expect(parseMinutesInput(' 45 ')).toEqual({ ok: true, minutes: 45 });
        expect(parseMinutesInput('')).toEqual({ ok: true, minutes: null });
        expect(parseMinutesInput('120').ok).toBe(true);
        for (const bad of ['0', '121', '1e2', '-3', '4.0']) expect(parseMinutesInput(bad).ok).toBe(false);
    });

    it('a paste fills an unset time only (D16), and says when it kept yours', () => {
        expect(mergeImportedMinutes(30, null)).toEqual({ write: 30, warning: null });
        expect(mergeImportedMinutes(30, 30)).toEqual({ write: undefined, warning: null });
        expect(mergeImportedMinutes(undefined, null)).toEqual({ write: undefined, warning: null });
        const kept = mergeImportedMinutes(30, 45);
        expect(kept.write).toBeUndefined();
        expect(kept.warning).toMatch(/kept the time you already set \(45 min\)/);
    });

    it('the own write sends minutes ALONE (no draft, no updated_at)', () => {
        expect(minutesUpdate(30)).toEqual({ minutes: 30 });
        expect(minutesUpdate(null)).toEqual({ minutes: null });
    });

    it('formats', () => {
        expect(formatActivityMinutes(30)).toBe('about 30 min');
    });
});
