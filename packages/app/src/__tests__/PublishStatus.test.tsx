// @vitest-environment jsdom
// =============================================================================
// PublishStatus.test.tsx — the published-status line (S9 Drop 1)
// -----------------------------------------------------------------------------
// The line's contract after the publish rewrite: the share link IS the viewer
// URL `${origin}/a/${activityId}` — no env, no R2. The critical regression
// this pins (eng test plan): the line renders for a PRIOR publish (version
// unknown → "Live") with no environment configured at all, where the old
// implementation silently hid the affordance when VITE_PUBLISHED_URL_BASE was
// unset.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';

import PublishStatus, { viewerShareUrl } from '../components/PublishStatus';

const ACTIVITY_ID = 'aaaaaaaa-0000-4000-8000-000000000001';

beforeEach(() => {
    vi.useFakeTimers();
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('viewerShareUrl', () => {
    it('builds the viewer route on the current origin', () => {
        expect(viewerShareUrl(ACTIVITY_ID)).toBe(
            `${window.location.origin}/a/${ACTIVITY_ID}`,
        );
    });
});

describe('PublishStatus', () => {
    it('renders Open pointing at the viewer URL, with "Published v{N}" for a fresh publish', () => {
        render(<PublishStatus activityId={ACTIVITY_ID} version={3} />);
        expect(screen.getByText('Published v3')).toBeTruthy();
        const open = screen.getByRole('link', { name: /open/i });
        expect(open.getAttribute('href')).toBe(
            `${window.location.origin}/a/${ACTIVITY_ID}`,
        );
    });

    it('renders "Live" for a prior publish (version unknown), with NO env configured', () => {
        // No published-URL env exists anymore; the line must render anyway —
        // the old env-gated `return null` hid a live activity's link.
        render(<PublishStatus activityId={ACTIVITY_ID} version={null} />);
        expect(screen.getByText('Live')).toBeTruthy();
        expect(screen.getByRole('link', { name: /open/i })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Copy link' })).toBeTruthy();
    });

    it('copies the viewer URL and flips the button label temporarily', async () => {
        const writeText = vi.fn(() => Promise.resolve());
        Object.assign(navigator, { clipboard: { writeText } });

        render(<PublishStatus activityId={ACTIVITY_ID} version={1} />);
        // Let the async clipboard promise settle inside act before asserting.
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
        });
        expect(screen.getByText('Copied!')).toBeTruthy();
        expect(writeText).toHaveBeenCalledWith(
            `${window.location.origin}/a/${ACTIVITY_ID}`,
        );
        act(() => {
            vi.advanceTimersByTime(1600);
        });
        expect(screen.getByRole('button', { name: 'Copy link' })).toBeTruthy();
    });
});
