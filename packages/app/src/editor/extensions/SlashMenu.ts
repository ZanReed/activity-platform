import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import SlashMenuPopover, {
    type SlashMenuPopoverRef,
} from '../SlashMenuPopover';
import { slashMenuItems, type SlashMenuItem } from '../slashMenuItems';
import { armSettle } from './SettleMotion';
import { isTopLevelStack } from '../strictGrid';

export const SlashMenu = Extension.create({
    name: 'slashMenu',

    addProseMirrorPlugins() {
        return [
            Suggestion<SlashMenuItem>({
                editor: this.editor,
                char: '/',
                startOfLine: true,

                items: ({ query, editor }) => {
                    const q = query.toLowerCase();
                    // Strict grid: every caret is nested in a column, so raw
                    // depth no longer distinguishes the section flow from a real
                    // container. `topLevelOnly` structural blocks (section break,
                    // columns) show ONLY in the top-level 1-col stack — hidden in
                    // a multi-col cell, a nested container (worked example, list),
                    // or the reference panel. Same rule the "Add a block" window
                    // uses.
                    const nested = !isTopLevelStack(editor.state.selection.$from);
                    return slashMenuItems.filter(
                        (item) =>
                        // Contextual items (e.g. Answer blank, only valid
                        // inside a problem) are hidden where they can't apply.
                        (item.isEnabled?.(editor) ?? true) &&
                        !(item.topLevelOnly && nested) &&
                        (item.title.toLowerCase().includes(q) ||
                        (item.keywords?.some((kw) => kw.includes(q)) ?? false)),
                    );
                },

                command: ({ editor, range, props }) => {
                    // The item's command builds its own chain, so the settle
                    // tag is an arm on the next doc-changing transaction.
                    // 'Text' items are block-style TRANSFORMS of an existing
                    // block, not placements — they don't settle (parity with
                    // the toolbar's TextStylePicker, which never arms).
                    if (props.group !== 'Text') armSettle('insert');
                    props.command({ editor, range });
                },

                render: () => {
                    let component: ReactRenderer<SlashMenuPopoverRef> | null = null;
                    let popup: TippyInstance | null = null;

                    return {
                        onStart: (props) => {
                            component = new ReactRenderer(SlashMenuPopover, {
                                props,
                                editor: props.editor,
                            });

                            if (!props.clientRect) return;

                            popup = tippy(document.body, {
                                getReferenceClientRect: props.clientRect as () => DOMRect,
                                          appendTo: () => document.body,
                                          content: component.element,
                                          showOnCreate: true,
                                          interactive: true,
                                          trigger: 'manual',
                                          placement: 'bottom-start',
                                          theme: 'slash-menu',
                                          arrow: false,
                            });
                        },

                        onUpdate: (props) => {
                            component?.updateProps(props);
                            if (props.clientRect && popup) {
                                popup.setProps({
                                    getReferenceClientRect: props.clientRect as () => DOMRect,
                                });
                            }
                        },

                        onKeyDown: (props) => {
                            if (props.event.key === 'Escape') {
                                popup?.hide();
                                return true;
                            }
                            return component?.ref?.onKeyDown(props) ?? false;
                        },

                        onExit: () => {
                            popup?.destroy();
                            component?.destroy();
                        },
                    };
                },
            }),
        ];
    },
});
