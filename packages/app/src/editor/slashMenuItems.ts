import type { Editor, Range } from '@tiptap/core';

export interface SlashMenuItem {
    title: string;
    description: string;
    command: (props: { editor: Editor; range: Range }) => void;
}

export const slashMenuItems: SlashMenuItem[] = [
    {
        title: 'Heading 1',
        description: 'Large section heading',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
        },
    },
{
    title: 'Heading 2',
    description: 'Medium section heading',
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
},
{
    title: 'Heading 3',
    description: 'Small section heading',
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
},
{
    title: 'Paragraph',
    description: 'Plain text',
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run();
    },
},
{
    title: 'Bullet list',
    description: 'Unordered list',
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
},
{
    title: 'Numbered list',
    description: 'Ordered list',
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
},
{
    title: 'Quote',
    description: 'Indented quote block',
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
},
{
    title: 'Inline math',
    description: 'Math expression that flows with text',
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertMathInline('x^2').run();
    },
},
{
    title: 'Block math',
    description: 'Centered displayed math equation',
    command: ({ editor, range }) => {
        editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertMathBlock('\\sum_{i=1}^{n} i')
        .run();
    },
},
{
    title: 'Section break',
    description: 'Start a new section. Optionally a checkpoint.',
    keywords: ['section', 'break', 'divider', 'checkpoint'],
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertSectionBreak().run();
    },
},
];
