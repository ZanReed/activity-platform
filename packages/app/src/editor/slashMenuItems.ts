import type { Editor, Range } from '@tiptap/core';

// ============================================================================
// slashMenuItems — the single source of truth for block insertion.
// ----------------------------------------------------------------------------
// Two surfaces consume this list: the slash menu (SlashMenu extension) and the
// toolbar's "+ Insert" dropdown (InsertMenu). Both reuse each item's title,
// description, and command, so they can never drift — adding a block type is
// one entry here and it appears in both places. The `range` argument is only
// present on the slash path (the typed "/query" to delete); the toolbar calls
// `command({ editor })` and `begin` skips the deleteRange.
// ============================================================================

export interface SlashMenuItem {
    title: string;
    description: string;
    keywords?: string[];
    // Section heading in the "+ Insert" dropdown. The slash menu stays a flat
    // filtered list, but shares the same grouping vocabulary. 'Text' items are
    // block-style TRANSFORMS (setNode/toggle on the current block), not
    // insertions — the toolbar renders them in the TextStylePicker instead of
    // the Insert dropdown, which skips this group.
    group: 'Text' | 'Math' | 'Structure' | 'Questions';
    // Current-state detection for the style picker's trigger label ('Text'
    // items only): does the selection sit in this block style right now?
    isActive?: (editor: Editor) => boolean;
    // Available in the constrained reference-panel editor (which registers no
    // SectionBreak / graph extensions and hides question authoring).
    referenceSafe?: boolean;
    // Excluded from the "+ Insert" dropdown (still in the slash menu) — used
    // for inline inserts that already have a flat toolbar button (ƒx).
    insertMenu?: false;
    // Contextual gate: when it returns false the dropdown renders the item
    // disabled (with disabledHint as the tooltip) and the slash menu hides it.
    isEnabled?: (editor: Editor) => boolean;
    disabledHint?: string;
    command: (props: { editor: Editor; range?: Range }) => void;
}

// Focused chain, with the slash menu's typed "/query" deleted when present.
function begin(editor: Editor, range?: Range) {
    const chain = editor.chain().focus();
    return range ? chain.deleteRange(range) : chain;
}

export const slashMenuItems: SlashMenuItem[] = [
    {
        title: 'Heading 1',
        description: 'Large section heading',
        group: 'Text',
        referenceSafe: true,
        isActive: (editor) => editor.isActive('heading', { level: 1 }),
        command: ({ editor, range }) => {
            begin(editor, range).setNode('heading', { level: 1 }).run();
        },
    },
    {
        title: 'Heading 2',
        description: 'Medium section heading',
        group: 'Text',
        referenceSafe: true,
        isActive: (editor) => editor.isActive('heading', { level: 2 }),
        command: ({ editor, range }) => {
            begin(editor, range).setNode('heading', { level: 2 }).run();
        },
    },
    {
        title: 'Heading 3',
        description: 'Small section heading',
        group: 'Text',
        referenceSafe: true,
        isActive: (editor) => editor.isActive('heading', { level: 3 }),
        command: ({ editor, range }) => {
            begin(editor, range).setNode('heading', { level: 3 }).run();
        },
    },
    {
        title: 'Paragraph',
        description: 'Plain text',
        group: 'Text',
        referenceSafe: true,
        // Only when not in a list: a list item's body is also a paragraph, so
        // without the exclusion both entries would claim the active state.
        isActive: (editor) =>
            editor.isActive('paragraph') &&
            !editor.isActive('bulletList') &&
            !editor.isActive('orderedList'),
        command: ({ editor, range }) => {
            begin(editor, range).setNode('paragraph').run();
        },
    },
    {
        title: 'Bullet list',
        description: 'Unordered list',
        group: 'Text',
        referenceSafe: true,
        isActive: (editor) => editor.isActive('bulletList'),
        command: ({ editor, range }) => {
            begin(editor, range).toggleBulletList().run();
        },
    },
    {
        title: 'Numbered list',
        description: 'Ordered list',
        group: 'Text',
        referenceSafe: true,
        isActive: (editor) => editor.isActive('orderedList'),
        command: ({ editor, range }) => {
            begin(editor, range).toggleOrderedList().run();
        },
    },
    {
        title: 'Inline math',
        description: 'Math expression that flows with text',
        group: 'Math',
        referenceSafe: true,
        // The flat toolbar keeps the ƒx button for this; no dropdown entry.
        insertMenu: false,
        command: ({ editor, range }) => {
            begin(editor, range).insertMathInline('x^2').run();
        },
    },
    {
        title: 'Block math',
        description: 'Centered displayed math equation',
        group: 'Math',
        referenceSafe: true,
        command: ({ editor, range }) => {
            begin(editor, range).insertMathBlock('\\sum_{i=1}^{n} i').run();
        },
    },
    {
        title: 'Section break',
        description: 'Start a new section. Optionally a checkpoint.',
        keywords: ['section', 'break', 'divider', 'checkpoint'],
        group: 'Structure',
        command: ({ editor, range }) => {
            begin(editor, range).insertSectionBreak().run();
        },
    },
    {
        title: '2 columns',
        description: 'Two side-by-side columns of blocks',
        keywords: ['column', 'columns', 'two', 'layout', 'side', 'grid'],
        group: 'Structure',
        referenceSafe: true,
        command: ({ editor, range }) => {
            begin(editor, range).insertColumns(2).run();
        },
    },
    {
        title: '3 columns',
        description: 'Three side-by-side columns of blocks',
        keywords: ['column', 'columns', 'three', 'layout', 'side', 'grid'],
        group: 'Structure',
        referenceSafe: true,
        command: ({ editor, range }) => {
            begin(editor, range).insertColumns(3).run();
        },
    },
    {
        title: 'Image',
        description: 'Insert an image. Paste a URL in the popup.',
        keywords: ['image', 'picture', 'photo', 'figure', 'img', 'media'],
        group: 'Structure',
        referenceSafe: true,
        command: ({ editor, range }) => {
            begin(editor, range).insertImage().run();
        },
    },
    {
        title: 'Learning objectives',
        description: 'A titled list of "students will be able to…" goals.',
        keywords: ['learning', 'objectives', 'goals', 'aims', 'outcomes', 'swbat', 'targets'],
        group: 'Structure',
        command: ({ editor, range }) => {
            begin(editor, range).insertLearningObjectives().run();
        },
    },
    {
        title: 'Worked example',
        description: 'A boxed, fully-worked example for students to study.',
        keywords: ['worked', 'example', 'solution', 'model', 'demonstration', 'sample', 'exemplar'],
        group: 'Structure',
        command: ({ editor, range }) => {
            begin(editor, range).insertWorkedExample().run();
        },
    },
    {
        title: 'Faded worked example',
        description: 'A guided example: shown steps + fill-in-blank steps the student completes.',
        keywords: ['faded', 'worked', 'example', 'guided', 'practice', 'scaffold', 'completion', 'fill', 'blank', 'steps'],
        group: 'Structure',
        command: ({ editor, range }) => {
            begin(editor, range).insertFadedWorkedExample().run();
        },
    },
    {
        title: 'Static graph',
        description: 'A display-only graph — a figure or exemplar. No answer collected.',
        keywords: ['graph', 'static', 'display', 'figure', 'diagram', 'stimulus', 'exemplar', 'chart', 'plot'],
        group: 'Structure',
        command: ({ editor, range }) => {
            begin(editor, range).insertStaticGraph().run();
        },
    },
    {
        title: 'Fill in the blank',
        description: 'Problem with editable blanks. Type {{answer|alt}} inside to insert blanks.',
        keywords: ['fill', 'blank', 'cloze', 'question', 'problem', 'fitb'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertFillInBlank().run();
        },
    },
    {
        title: 'Answer blank',
        description: 'An answer blank at the cursor, inside a problem.',
        keywords: ['blank', 'answer', 'gap', 'input'],
        group: 'Questions',
        isEnabled: (editor) => editor.isActive('fillInBlank'),
        disabledHint: 'Position the cursor inside a problem to insert a blank',
        command: ({ editor, range }) => {
            // Where the blank will land: the slash range collapses to its
            // start on delete; the toolbar path inserts at the cursor.
            const from = range ? range.from : editor.state.selection.from;
            begin(editor, range).insertBlank({ answer: '?' }).run();
            // Select the fresh node so the blank edit popover opens at once
            // (same behavior as the old toolbar Blank button).
            requestAnimationFrame(() => {
                const node = editor.state.doc.nodeAt(from);
                if (node && node.type.name === 'blank') {
                    editor.commands.setNodeSelection(from);
                }
            });
        },
    },
    {
        title: 'Interactive graph',
        description: 'Students plot a point on a coordinate plane. Drag to set the answer.',
        keywords: ['graph', 'plot', 'point', 'coordinate', 'plane', 'graphing', 'chart'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertInteractiveGraph().run();
        },
    },
    {
        title: 'Number line',
        description: 'Students plot a point or graph an interval on a 1-D number line.',
        keywords: ['number', 'line', 'interval', 'inequality', 'ray', 'plot', 'point', 'graph', '1d'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertNumberLine().run();
        },
    },
    {
        title: 'Data plot',
        description: 'A dot plot, histogram, or box plot — graded (students build it) or a static figure.',
        keywords: ['data', 'plot', 'dot', 'histogram', 'box', 'boxplot', 'statistics', 'stats', 'chart', 'distribution'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertDataPlot().run();
        },
    },
    {
        title: 'Multiple choice',
        description: 'A question with answer choices — single answer or select-all-that-apply.',
        keywords: ['multiple', 'choice', 'mc', 'select', 'options', 'quiz', 'radio', 'checkbox'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertMultipleChoice().run();
        },
    },
    {
        title: 'Matching',
        description: 'Students drag lettered options onto items. Extra options are distractors.',
        keywords: ['matching', 'match', 'pairs', 'pair', 'connect', 'drag', 'categorize'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertMatching().run();
        },
    },
    {
        title: 'Ordering',
        description: 'Students drag a shuffled list into the correct sequence.',
        keywords: ['ordering', 'order', 'sequence', 'sequencing', 'sort', 'steps', 'arrange'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertOrdering().run();
        },
    },
    {
        title: 'Self-explanation',
        description: 'Students explain their reasoning in free text. Ungraded — collected for you to read.',
        keywords: ['self', 'explanation', 'explain', 'reflection', 'reflect', 'reasoning', 'writing', 'free', 'text', 'response', 'why'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertSelfExplanation().run();
        },
    },
    {
        title: 'Short answer',
        description: 'A brief free-text response you grade by hand (a few sentences).',
        keywords: ['short', 'answer', 'free', 'text', 'response', 'written', 'graded', 'open', 'question'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertShortAnswer().run();
        },
    },
    {
        title: 'Essay',
        description: 'A long free-text response you grade by hand, with an optional word-count target.',
        keywords: ['essay', 'long', 'writing', 'free', 'text', 'response', 'paragraph', 'graded', 'open', 'word', 'count'],
        group: 'Questions',
        command: ({ editor, range }) => {
            begin(editor, range).insertEssay().run();
        },
    },
];

// Group headings in dropdown display order.
export const slashMenuGroups: ReadonlyArray<SlashMenuItem['group']> = [
    'Text',
    'Math',
    'Structure',
    'Questions',
];
