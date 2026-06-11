import type { Editor, Range } from '@tiptap/core';

export interface SlashMenuItem {
    title: string;
    description: string;
    keywords?: string[];
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
{
    title: 'Fill in the blank',
    description: 'Problem with editable blanks. Type {{answer|alt}} inside to insert blanks.',
    keywords: ['fill', 'blank', 'cloze', 'question', 'problem', 'fitb'],
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertFillInBlank().run();
    },
},
{
    title: '2 columns',
    description: 'Two side-by-side columns of blocks',
    keywords: ['column', 'columns', 'two', 'layout', 'side', 'grid'],
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertColumns(2).run();
    },
},
{
    title: '3 columns',
    description: 'Three side-by-side columns of blocks',
    keywords: ['column', 'columns', 'three', 'layout', 'side', 'grid'],
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertColumns(3).run();
    },
},
{
    title: 'Image',
    description: 'Insert an image. Paste a URL in the popup.',
    keywords: ['image', 'picture', 'photo', 'figure', 'img', 'media'],
    command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertImage().run();
    },
},
];
