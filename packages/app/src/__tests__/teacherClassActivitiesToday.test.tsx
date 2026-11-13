// @vitest-environment jsdom
// =============================================================================
// DD-2 + its Fable review: the class panel needs the class's today BEFORE any
// row has a date, or "That day has passed." never shows for a teacher's first
// date (the first build fetched it only when a dated row existed).
// =============================================================================

import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({ today: vi.fn(async () => '2026-11-13') }));
vi.mock('../lib/classActivities', async (orig) => ({
    ...(await orig<typeof import('../lib/classActivities')>()),
    listTeacherClassActivities: async () => [
        { classId: 'c1', activityId: 'a1', title: 'Ratios', addedAt: '2026-11-01T00:00:00Z', published: true, dueOn: null },
    ],
    listPublishedActivities: async () => [],
}));
vi.mock('../lib/dueDates', async (orig) => ({
    ...(await orig<typeof import('../lib/dueDates')>()),
    classLocalDate: h.today,
}));

import { useTeacherClassActivities } from '../components/ClassActivitiesPanel';

describe('useTeacherClassActivities', () => {
    it('knows the class’s today even when no activity has a date yet', async () => {
        const { result } = renderHook(() => useTeacherClassActivities());
        await waitFor(() => expect(result.current.today).toBe('2026-11-13'));
        expect(h.today).toHaveBeenCalledWith('c1');
    });
});
