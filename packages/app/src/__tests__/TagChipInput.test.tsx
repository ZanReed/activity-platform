// @vitest-environment jsdom
// =============================================================================
// TagChipInput.test.tsx — the tags authoring control (taxonomy R4/R5)
// -----------------------------------------------------------------------------
// The contract these pin: what the author commits is what gets STORED (normalize
// runs on commit, not on render), duplicates are a silent no-op rather than an
// error, and no committed text is ever lost — including the case the review
// called out, a typed-but-not-Entered tag when the drawer closes.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import TagChipInput from '../components/TagChipInput';

afterEach(cleanup);

function setup(tags: string[] = [], vocabulary: string[] = []) {
    const onChange = vi.fn();
    const utils = render(
        <TagChipInput
            tags={tags}
            onChange={onChange}
            vocabulary={vocabulary}
        />,
    );
    const input = screen.getByPlaceholderText('Add a tag…') as HTMLInputElement;
    return { onChange, input, ...utils };
}

describe('TagChipInput', () => {
    it('commits on Enter', () => {
        const { onChange, input } = setup();
        fireEvent.change(input, { target: { value: 'factoring' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(['factoring']);
    });

    it('commits on comma, without leaving the comma in the field', () => {
        const { onChange, input } = setup();
        fireEvent.change(input, { target: { value: 'graphing' } });
        fireEvent.keyDown(input, { key: ',' });
        expect(onChange).toHaveBeenCalledWith(['graphing']);
        expect(input.value).toBe('');
    });

    // The review's named loss case: close the drawer with text still typed.
    it('commits on blur so a typed-but-uncommitted tag is not lost', () => {
        const { onChange, input } = setup();
        fireEvent.change(input, { target: { value: 'word problems' } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledWith(['word problems']);
    });

    it('normalizes on commit — the chip is the stored form', () => {
        const { onChange, input } = setup();
        fireEvent.change(input, { target: { value: '  Word   Problems ' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(['word problems']);
    });

    it('appends to existing tags rather than replacing them', () => {
        const { onChange, input } = setup(['factoring']);
        fireEvent.change(input, { target: { value: 'graphing' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(['factoring', 'graphing']);
    });

    it('is a silent no-op when the tag is already applied (post-normalize)', () => {
        const { onChange, input } = setup(['factoring']);
        fireEvent.change(input, { target: { value: 'Factoring' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).not.toHaveBeenCalled();
        expect(input.value).toBe('');
    });

    it('ignores an empty or whitespace-only commit', () => {
        const { onChange, input } = setup();
        fireEvent.keyDown(input, { key: 'Enter' });
        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('removes a chip through its labelled remove button', () => {
        const { onChange } = setup(['factoring', 'graphing']);
        fireEvent.click(screen.getByLabelText('Remove tag factoring'));
        expect(onChange).toHaveBeenCalledWith(['graphing']);
    });

    it('removes the last chip on Backspace in an empty field', () => {
        const { onChange, input } = setup(['factoring', 'graphing']);
        fireEvent.keyDown(input, { key: 'Backspace' });
        expect(onChange).toHaveBeenCalledWith(['factoring']);
    });

    it('does NOT remove a chip when Backspace edits typed text', () => {
        const { onChange, input } = setup(['factoring']);
        fireEvent.change(input, { target: { value: 'gra' } });
        fireEvent.keyDown(input, { key: 'Backspace' });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('offers vocabulary suggestions, minus what is already applied', () => {
        const { container } = setup(['factoring'], [
            'factoring',
            'graphing',
            'word problems',
        ]);
        const options = Array.from(
            container.querySelectorAll('datalist option'),
        ).map((o) => (o as HTMLOptionElement).value);
        expect(options).toEqual(['graphing', 'word problems']);
    });

    it('renders no chip list when there are no tags', () => {
        const { container } = setup();
        expect(container.querySelector('ul')).toBeNull();
    });
});
