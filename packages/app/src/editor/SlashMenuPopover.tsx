import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { SlashMenuItem } from './slashMenuItems';


export interface SlashMenuPopoverRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

type SlashMenuPopoverProps = SuggestionProps<SlashMenuItem>;

const SlashMenuPopover = forwardRef<SlashMenuPopoverRef, SlashMenuPopoverProps>(
    ({ items, command, editor }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listId = useId();
    const optionId = (index: number) => `${listId}-opt-${index}`;

    // D-4 (ui-review-group-d.md): focus stays in the editor while the teacher
    // arrows through the menu, so the EDITOR points at the highlighted option
    // (aria-activedescendant); a screen reader reads it as it moves. Removed
    // when the menu closes, so a stale id never outlives the list.
    useEffect(() => {
        const dom = editor.view.dom;
        dom.setAttribute('aria-controls', listId);
        if (items.length > 0) dom.setAttribute('aria-activedescendant', optionId(selectedIndex));
        else dom.removeAttribute('aria-activedescendant');
        return () => {
            dom.removeAttribute('aria-controls');
            dom.removeAttribute('aria-activedescendant');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, listId, items.length, selectedIndex]);

    // Reset selection when filtering changes the list.
    useEffect(() => {
        setSelectedIndex(0);
    }, [items]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep the selected item visible during keyboard navigation.
    useEffect(() => {
        if (!containerRef.current) return;
        const selectedEl = containerRef.current.querySelectorAll(
            '.slash-menu-item',
        )[selectedIndex];
        selectedEl?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const selectItem = (index: number) => {
        const item = items[index];
        if (item) command(item);
    };

        useImperativeHandle(
            ref,
            () => ({
                onKeyDown: ({ event }) => {
                    if (event.key === 'ArrowDown') {
                        setSelectedIndex((i) => (i + 1) % items.length);
                        return true;
                    }
                    if (event.key === 'ArrowUp') {
                        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
                        return true;
                    }
                    if (event.key === 'Enter') {
                        selectItem(selectedIndex);
                        return true;
                    }
                    return false;
                },
            }),
            [items, selectedIndex],
        );

        return (
            <div ref={containerRef} className="slash-menu" role="listbox" id={listId} aria-label="Blocks">
            {items.length === 0 ? (
                <div className="slash-menu-empty" role="option" aria-disabled="true" aria-selected="false">
                    No matches
                </div>
            ) : (
                items.map((item, index) => (
                    <div
                    key={item.title}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === selectedIndex}
                    // Keep the caret in the editor (as the old buttons'
                    // focus-less click effectively did).
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectItem(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`slash-menu-item ${
                        index === selectedIndex ? 'is-selected' : ''
                    }`}
                    >
                    <div className="slash-menu-item-title">{item.title}</div>
                    <div className="slash-menu-item-desc">{item.description}</div>
                    </div>
                ))
            )}
            </div>
        );
});

SlashMenuPopover.displayName = 'SlashMenuPopover';

export default SlashMenuPopover;
