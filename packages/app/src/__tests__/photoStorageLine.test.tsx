// @vitest-environment jsdom
// The teacher's photo storage line on My classes (0098; author ruling
// 2026-11-19). The RPC is faked at the lib boundary; its server half
// (owner-only, Storage's own sizes) is verify-0098.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('../lib/photoUsage', async (orig) => ({
    ...(await orig<typeof import('../lib/photoUsage')>()),
    fetchMyPhotoUsage: h.fetch,
}));

import PhotoStorageLine from '../components/PhotoStorageLine';
import { formatBytes, photoUsageText } from '../lib/photoUsage';

afterEach(() => {
    cleanup();
    h.fetch.mockReset();
});

describe('the words', () => {
    it('counts photos and sizes bytes, and says how long they are kept', () => {
        expect(photoUsageText({ photos: 12, attached: 10, bytes: 4.2 * 1024 * 1024 })).toBe(
            "Students' photos of working: 12 photos, 4.2 MB stored. Kept until 30 days after a grade is released, and never past the end of the school year.",
        );
        expect(photoUsageText({ photos: 1, attached: 1, bytes: 300 * 1024 })).toMatch(/^Students' photos of working: 1 photo, 300 KB stored\./);
        expect(formatBytes(1.3 * 1024 ** 3)).toBe('1.3 GB');
    });
    it('no photo: no line at all', () => {
        expect(photoUsageText({ photos: 0, attached: 0, bytes: 0 })).toBeNull();
    });
});

describe('the line', () => {
    it('shows the teacher their own figure', async () => {
        h.fetch.mockResolvedValue({ photos: 3, attached: 3, bytes: 2 * 1024 * 1024 });
        render(<PhotoStorageLine />);
        expect(await screen.findByText(/3 photos, 2\.0 MB stored/)).toBeTruthy();
    });
    it('shows nothing with no photos, and nothing on a failed read', async () => {
        h.fetch.mockResolvedValue({ photos: 0, attached: 0, bytes: 0 });
        const { container, unmount } = render(<PhotoStorageLine />);
        await waitFor(() => expect(h.fetch).toHaveBeenCalled());
        expect(container.textContent).toBe('');
        unmount();
        h.fetch.mockRejectedValue(new Error('down'));
        const second = render(<PhotoStorageLine />);
        await waitFor(() => expect(h.fetch).toHaveBeenCalledTimes(2));
        expect(second.container.textContent).toBe('');
    });
});
