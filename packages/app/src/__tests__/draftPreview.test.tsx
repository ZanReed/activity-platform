// @vitest-environment jsdom
// draftPreview.test.tsx — the editor's "Preview as student" overlay (S8): the
// draft in the real viewer, a checkable question, and a way out. The serving
// and grading rules are the viewer's draft-preview.test.ts.
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ActivityDocument } from '@activity/schema';
import DraftPreview from '../components/DraftPreview';

afterEach(cleanup);
const t = (text: string) => ({ type: 'text', text, marks: [] });
const uuid = () => crypto.randomUUID();
const C1 = uuid();
const C2 = uuid();

const DRAFT = ActivityDocument.parse({
    schemaVersion: 2,
    meta: { title: 'P', course: 'Y7' },
    sections: [{ id: uuid(), rows: [{ id: uuid(), columns: [{ id: uuid(), blocks: [
        { id: uuid(), type: 'multiple_choice', prompt: [t('Which is even?')], multiSelect: false, skills: [], hint: [t('Halve it.')],
          choices: [{ id: C1, content: [t('4')], correct: true }, { id: C2, content: [t('7')], correct: false }] },
    ] }] }] }],
});

describe('Preview as student', () => {
    it('shows the draft, checks a wrong answer for real, and closes', async () => {
        const onClose = vi.fn();
        render(<DraftPreview draft={DRAFT} activityId="a1" onClose={onClose} />);
        expect(screen.getByRole('dialog', { name: 'Student preview' })).toHaveTextContent('nothing is saved');
        expect(screen.getByText('Which is even?')).toBeInTheDocument();
        // The hint is not on the page before a check.
        expect(screen.queryByText('Halve it.')).toBeNull();
        fireEvent.click(screen.getByRole('radio', { name: /7/ }));
        fireEvent.click(screen.getAllByRole('button', { name: /^Check/ })[0]!);
        await waitFor(() => expect(screen.getByText('Halve it.')).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
        expect(onClose).toHaveBeenCalled();
    });
});
