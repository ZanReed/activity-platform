// The editor's keyboard shortcuts, as ShortcutsDialog lists them (2026-11-15).
// Every row is a shortcut that exists today. ⌘D is pressed in a real editor
// by editorBatch6.test.tsx; ⌘F and ⌘/ are Editor.tsx's key handler; the rest
// are ProseMirror's own or the toolbar's button titles (Toolbar.tsx). Adding a
// shortcut means adding its row.

export const SHORTCUT_GROUPS: ReadonlyArray<{ title: string; rows: ReadonlyArray<[keys: string, what: string]> }> = [
    {
        title: 'Blocks',
        rows: [
            ['/', 'Insert a block (typed at the start of a line)'],
            ['Esc', 'Select the block the cursor is in'],
            ['⌘⇧↑  ⌘⇧↓', 'Move the block up or down'],
            ['⌘D', 'Duplicate the block'],
            ['Delete', 'Delete the selected block'],
        ],
    },
    {
        title: 'Text',
        rows: [
            ['⌘Z  ⌘⇧Z', 'Undo, redo'],
            ['⌘B  ⌘I  ⌘U', 'Bold, italic, underline'],
            ['⌘E', 'Code'],
            ['⌘,  ⌘.', 'Subscript, superscript'],
        ],
    },
    {
        title: 'Questions',
        rows: [['⌘⇧B', 'Add a blank (in a fill-in-the-blank)']],
    },
    {
        title: 'Find',
        rows: [
            ['⌘F', 'Find and replace'],
            ['⌘/', 'This list'],
        ],
    },
];
