// @vitest-environment jsdom
// The Insert dropdown mounts with the toolbar, usually BEFORE the teacher's
// photo-pilot flag is read (0099). It must pick the flag up when it lands, not
// keep the list it memoised at mount (Fable review, 2026-11-19).
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { Editor } from '@tiptap/react';
import InsertMenu from '../editor/components/InsertMenu';
import { setPhotoPilotOffered } from '../editor/slashMenuItems';

afterEach(() => {
    cleanup();
    setPhotoPilotOffered(false);
});

// The menu only reads the editor for each item's isEnabled/isActive: any method
// answers false, and the selection has no position (so nothing is nested).
const fakeEditor = new Proxy(
    { state: { selection: { $from: { depth: 0, node: () => ({ type: { name: 'doc' } }) } } } },
    { get: (t, k) => (k in t ? (t as Record<string | symbol, unknown>)[k] : () => false) },
) as unknown as Editor;

describe('the Insert dropdown and the pilot flag', () => {
    it('hides "Photo of working" for a non-pilot, and shows it once the flag lands, without remounting', () => {
        setPhotoPilotOffered(false);
        render(<InsertMenu editor={fakeEditor} variant="activity" />);
        fireEvent.click(screen.getByTitle('Insert a block'));
        expect(screen.queryByText('Photo of working')).toBeNull();
        expect(screen.getByText('Short answer')).toBeTruthy();
        act(() => setPhotoPilotOffered(true));
        expect(screen.getByText('Photo of working')).toBeTruthy();
    });
});
