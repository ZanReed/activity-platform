// @vitest-environment jsdom
// =============================================================================
// ConfirmDialog.test.tsx — the shared "say the cost first" dialog (UI review
// group A). Cancel takes focus so Enter on a misclick never goes through; Tab
// stays inside; Escape cancels without reaching anything behind it; a failed
// action is shown inside the dialog, which stays open; focus goes back to the
// opener on close.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

afterEach(cleanup);

function Harness({ onConfirm, outerKey }: { onConfirm: () => Promise<void>; outerKey?: () => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div onKeyDown={outerKey}>
            <button type="button" onClick={() => setOpen(true)}>
                Open
            </button>
            {open && (
                <ConfirmDialog title="Do it?" confirmLabel="Do it" onCancel={() => setOpen(false)} onConfirm={onConfirm}>
                    <p>It costs something.</p>
                </ConfirmDialog>
            )}
        </div>
    );
}

describe('ConfirmDialog', () => {
    it('focuses Cancel, keeps Tab inside, and Escape cancels without bubbling', () => {
        const outer = vi.fn();
        render(<Harness onConfirm={async () => {}} outerKey={outer} />);
        const opener = screen.getByRole('button', { name: 'Open' });
        opener.focus();
        fireEvent.click(opener);
        const cancel = screen.getByRole('button', { name: 'Cancel' });
        const ok = screen.getByRole('button', { name: 'Do it' });
        expect(cancel).toHaveFocus();
        ok.focus();
        fireEvent.keyDown(ok, { key: 'Tab' });
        expect(cancel).toHaveFocus();
        fireEvent.keyDown(cancel, { key: 'Tab', shiftKey: true });
        expect(ok).toHaveFocus();
        outer.mockClear();
        fireEvent.keyDown(ok, { key: 'Escape' });
        expect(screen.queryByRole('alertdialog')).toBeNull();
        expect(outer).not.toHaveBeenCalled();
        expect(opener).toHaveFocus();
    });

    it('Escape still cancels when focus has fallen to the page (a click on the text)', () => {
        render(<Harness onConfirm={async () => {}} />);
        fireEvent.click(screen.getByRole('button', { name: 'Open' }));
        (document.activeElement as HTMLElement | null)?.blur();
        expect(document.activeElement).toBe(document.body);
        fireEvent.keyDown(document.body, { key: 'Tab' });
        expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
        (document.activeElement as HTMLElement | null)?.blur();
        fireEvent.keyDown(document.body, { key: 'Escape' });
        expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('a failed action shows its error and the dialog stays open', async () => {
        render(<Harness onConfirm={async () => { throw new Error('No connection'); }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Open' }));
        fireEvent.click(screen.getByRole('button', { name: 'Do it' }));
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No connection'));
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
});
