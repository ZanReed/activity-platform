import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import SlashMenuPopover, {
    type SlashMenuPopoverRef,
} from '../SlashMenuPopover';
import { slashMenuItems, type SlashMenuItem } from '../slashMenuItems';

export const SlashMenu = Extension.create({
    name: 'slashMenu',

    addProseMirrorPlugins() {
        return [
            Suggestion<SlashMenuItem>({
                editor: this.editor,
                char: '/',
                startOfLine: true,

                items: ({ query }) => {
                    const q = query.toLowerCase();
                    return slashMenuItems.filter(
                        (item) =>
                        item.title.toLowerCase().includes(q) ||
                        (item.keywords?.some((kw) => kw.includes(q)) ?? false),
                    );
                },

                command: ({ editor, range, props }) => {
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
