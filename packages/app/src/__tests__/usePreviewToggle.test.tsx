// @vitest-environment jsdom
// =============================================================================
// usePreviewToggle.test.tsx — the shared "preview as student" eye toggle used by
// the three graphing NodeViews (interactive_graph / number_line / data_plot).
// -----------------------------------------------------------------------------
// Guards the button's accessible state (label + aria-pressed + is-on accent)
// and that the hook's state is ephemeral (starts off, flips on toggle). The
// per-block chrome-hiding itself is exercised by the NodeViews; here we pin the
// reusable primitive so a rename/regression is caught without a full editor.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook } from '@testing-library/react';
import { usePreviewToggle, PreviewEyeButton } from '../editor/components/usePreviewToggle';

afterEach(cleanup);

describe('usePreviewToggle hook', () => {
    it('starts off and flips on toggle (ephemeral session state)', () => {
        const { result } = renderHook(() => usePreviewToggle());
        expect(result.current.preview).toBe(false);
        act(() => result.current.toggle());
        expect(result.current.preview).toBe(true);
        act(() => result.current.toggle());
        expect(result.current.preview).toBe(false);
    });
});

describe('PreviewEyeButton', () => {
    it('off state: labelled "Preview as student", not pressed, no accent', () => {
        const { getByRole } = render(
            <PreviewEyeButton preview={false} onToggle={() => {}} />,
        );
        const btn = getByRole('button', { name: 'Preview as student' });
        expect(btn.getAttribute('aria-pressed')).toBe('false');
        expect(btn.classList.contains('is-on')).toBe(false);
    });

    it('on state: labelled "Back to editing", pressed, accent class', () => {
        const { getByRole } = render(
            <PreviewEyeButton preview={true} onToggle={() => {}} />,
        );
        const btn = getByRole('button', { name: 'Back to editing' });
        expect(btn.getAttribute('aria-pressed')).toBe('true');
        expect(btn.classList.contains('is-on')).toBe(true);
    });

    it('fires onToggle when clicked', () => {
        const onToggle = vi.fn();
        const { getByRole } = render(
            <PreviewEyeButton preview={false} onToggle={onToggle} />,
        );
        fireEvent.click(getByRole('button'));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });
});
