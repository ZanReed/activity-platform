// @vitest-environment jsdom
// moveStudent.test.tsx — "Move" on a roster row (0089, schema-shortlist.md
// S5): pick another of the teacher's classes, confirm, and the roster and the
// page's counts are re-read. The server half is scripts/verify-0089.sql.
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
    members: vi.fn(),
    move: vi.fn(),
}));
vi.mock('../lib/classes', async (orig) => ({
    ...(await orig<typeof import('../lib/classes')>()),
    listClassMembers: h.members,
    moveClassMember: h.move,
}));

const { default: Roster } = await import('../components/ClassRoster');

afterEach(cleanup);

const INFO = {
    id: 'k7a', name: '7A', joinCode: 'ABC234', expectedDomain: null, ageAssertionAt: '2026-11-01T00:00:00Z',
    assertionTextVersion: 'v1', includesUnder13: false, helpRequestsOn: true, createdAt: '2026-11-01T00:00:00Z',
};
const MAYA = { studentId: 'stu-1', displayName: 'Maya', email: 'maya@school.example', joinedAt: '2026-11-02T00:00:00Z', removedAt: null };

function renderRoster(targets: { id: string; name: string }[], onMoved = vi.fn()) {
    h.members.mockResolvedValue([MAYA]);
    render(<Roster info={INFO} onCodeChange={() => {}} onCount={() => {}} moveTargets={targets} onMoved={onMoved} />);
    return onMoved;
}

describe('Move on a roster row', () => {
    it('moves to the chosen class, then re-reads the roster and tells the page', async () => {
        h.move.mockResolvedValue(undefined);
        const onMoved = renderRoster([{ id: 'k7b', name: '7B' }, { id: 'k9', name: '9 Maths' }]);
        fireEvent.click(await screen.findByRole('button', { name: 'Move Maya to another class' }));
        const dialog = screen.getByRole('dialog', { name: 'Move Maya' });
        expect(dialog).toHaveTextContent('Their checked work stays with them');
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'k9' } });
        fireEvent.click(screen.getByRole('button', { name: 'Move to 9 Maths' }));
        await waitFor(() => expect(onMoved).toHaveBeenCalled());
        expect(h.move).toHaveBeenCalledWith('stu-1', 'k7a', 'k9');
        expect(h.members).toHaveBeenCalledTimes(2);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('a refusal (a full class) shows in the dialog, which stays open', async () => {
        h.move.mockRejectedValue(new Error('That class is full'));
        renderRoster([{ id: 'k7b', name: '7B' }]);
        fireEvent.click(await screen.findByRole('button', { name: 'Move Maya to another class' }));
        fireEvent.click(screen.getByRole('button', { name: 'Move to 7B' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('That class is full');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('a teacher with one class has no Move', async () => {
        renderRoster([]);
        await screen.findByText('Maya');
        expect(screen.queryByRole('button', { name: /Move Maya/ })).toBeNull();
    });
});
