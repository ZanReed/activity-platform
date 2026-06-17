// @vitest-environment jsdom
// =============================================================================
// ImportMarkdownDialog.test.tsx — dialog behavior + StrictMode regression guard
// -----------------------------------------------------------------------------
// The dialog once vanished the instant it opened: FocusTrap's onDeactivate was
// wired to onClose, and React StrictMode's dev double-mount unmounts the trap,
// firing onDeactivate → closing the dialog. The first test below reproduces
// that exact condition (renders under <StrictMode>) and asserts the dialog
// STAYS open — so re-introducing the bug (e.g. onDeactivate: onClose) turns it
// red. The rest pin the close paths and the import + copy-prompt flows.
// =============================================================================

import { StrictMode, useState } from 'react';
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
// The /vitest entry extends vitest's own `expect` (this project doesn't enable
// global expect) AND augments its Assertion types with the jest-dom matchers.
import '@testing-library/jest-dom/vitest';
import type { JSONContent } from '@tiptap/react';
import ImportMarkdownDialog from '../components/ImportMarkdownDialog';
import { MARKDOWN_IMPORT_AI_PROMPT } from '../lib/markdownImportPrompt';

afterEach(cleanup);

// A parent that owns `open` and unmounts the dialog when onClose fires — so a
// dialog that closes itself becomes observable (the dialog leaves the DOM).
function Harness({
    onImport = vi.fn(),
}: {
    onImport?: (blocks: JSONContent[]) => void;
}) {
    const [open, setOpen] = useState(true);
    if (!open) return null;
    return (
        <ImportMarkdownDialog onClose={() => setOpen(false)} onImport={onImport} />
    );
}

const renderDialog = (onImport?: (b: JSONContent[]) => void) =>
    render(
        <StrictMode>
            <Harness onImport={onImport} />
        </StrictMode>,
    );

describe('StrictMode', () => {
    it('stays open after mount (regression: trap onDeactivate must not close it)', () => {
        renderDialog();
        // After render, StrictMode's mount→unmount→mount has already run. If
        // close were tied to the trap's lifecycle, the dialog would be gone.
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});

describe('close paths', () => {
    it('Escape closes the dialog', () => {
        renderDialog();
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('a backdrop click closes; a click inside the panel does not', () => {
        renderDialog();
        const dialog = screen.getByRole('dialog');
        const backdrop = dialog.parentElement!;

        // Inside the panel → target !== backdrop → stays open.
        fireEvent.mouseDown(dialog);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // On the backdrop itself → closes.
        fireEvent.mouseDown(backdrop);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('Cancel closes the dialog', () => {
        renderDialog();
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});

describe('import flow', () => {
    it('converts pasted markdown and hands the blocks to onImport, then closes', async () => {
        const onImport = vi.fn();
        renderDialog(onImport);

        fireEvent.change(screen.getByLabelText('Markdown to import'), {
            target: { value: '# Title\n\nThe capital of France is {{Paris}}.' },
        });

        // The importer lazy-loads markdown-it; Import enables once it parses.
        const importBtn = screen.getByRole('button', { name: 'Import' });
        await waitFor(() => expect(importBtn).toBeEnabled());

        fireEvent.click(importBtn);

        expect(onImport).toHaveBeenCalledTimes(1);
        const blocks = onImport.mock.calls[0]![0] as JSONContent[];
        expect(blocks.some((b) => b.type === 'heading')).toBe(true);
        expect(blocks.some((b) => b.type === 'fillInBlank')).toBe(true);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('Import stays disabled when there is nothing to import', async () => {
        renderDialog();
        // Wait for the importer to load so "disabled" reflects an empty parse,
        // not just the loading state.
        await waitFor(() =>
            expect(screen.getByText('Nothing to import yet.')).toBeInTheDocument(),
        );
        expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
    });
});

describe('copy AI prompt', () => {
    it('copies the canonical prompt constant to the clipboard', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            configurable: true,
        });

        renderDialog();
        fireEvent.click(screen.getByRole('button', { name: 'Copy AI prompt' }));

        expect(writeText).toHaveBeenCalledWith(MARKDOWN_IMPORT_AI_PROMPT);
        // Label flips to confirm.
        await screen.findByRole('button', { name: 'Copied!' });
    });
});
