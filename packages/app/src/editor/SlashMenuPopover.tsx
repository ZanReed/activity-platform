import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { SlashMenuItem } from './slashMenuItems';


export interface SlashMenuPopoverRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

type SlashMenuPopoverProps = SuggestionProps<SlashMenuItem>;

const SlashMenuPopover = forwardRef<SlashMenuPopoverRef, SlashMenuPopoverProps>(
    ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

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
            <div ref={containerRef} className="slash-menu">
            {items.length === 0 ? (
                <div className="slash-menu-empty">No matches</div>
            ) : (
                items.map((item, index) => (
                    <button
                    key={item.title}
                    type="button"
                    onClick={() => selectItem(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`slash-menu-item ${
                        index === selectedIndex ? 'is-selected' : ''
                    }`}
                    >
                    <div className="slash-menu-item-title">{item.title}</div>
                    <div className="slash-menu-item-desc">{item.description}</div>
                    </button>
                ))
            )}
            </div>
        );
});

SlashMenuPopover.displayName = 'SlashMenuPopover';

export default SlashMenuPopover;
