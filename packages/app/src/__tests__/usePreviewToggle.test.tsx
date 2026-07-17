// @vitest-environment jsdom
// =============================================================================
// usePreviewToggle — the id-keyed preview store shared by the graphing NodeViews
// and the quick-bar. Guards: state is per-id and ephemeral, the hook reflects
// store changes reactively, and an empty id is an inert no-op.
// =============================================================================

import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import {
    usePreviewToggle,
    isPreviewing,
    togglePreview,
} from '../editor/components/usePreviewToggle';

afterEach(() => {
    cleanup();
    // Reset any ids touched by these tests.
    ['a', 'b', ''].forEach((id) => {
        if (isPreviewing(id)) togglePreview(id);
    });
});

describe('preview store', () => {
    it('is off by default and flips per id', () => {
        expect(isPreviewing('a')).toBe(false);
        togglePreview('a');
        expect(isPreviewing('a')).toBe(true);
        expect(isPreviewing('b')).toBe(false); // independent per id
        togglePreview('a');
        expect(isPreviewing('a')).toBe(false);
    });

    it('ignores an empty id (no active block)', () => {
        togglePreview('');
        expect(isPreviewing('')).toBe(false);
    });
});

describe('usePreviewToggle hook', () => {
    it('starts off and reflects a toggle', () => {
        const { result } = renderHook(() => usePreviewToggle('a'));
        expect(result.current.preview).toBe(false);
        act(() => result.current.toggle());
        expect(result.current.preview).toBe(true);
    });

    it('a store toggle from elsewhere updates every subscriber of that id', () => {
        const { result } = renderHook(() => usePreviewToggle('a'));
        expect(result.current.preview).toBe(false);
        act(() => togglePreview('a')); // e.g. the quick-bar toggling it
        expect(result.current.preview).toBe(true);
    });
});
