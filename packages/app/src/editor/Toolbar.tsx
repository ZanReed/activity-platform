import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

// editor.isActive(markName) returns false when a mark is "armed" on a collapsed
// cursor — ProseMirror's stored-marks state, applied to the next typed character.
// For toolbar UX we want both states to show as active: the button reflects
// "mark will apply to what you type / is applied to what's selected," which
// matches how Word, Google Docs, and most editors visualize it.
function isMarkActive(editor: Editor, markName: string): boolean {
    if (editor.isActive(markName)) return true;
    return editor.state.storedMarks?.some((m) => m.type.name === markName) ?? false;
}

interface ToolbarProps {
    editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
    if (!editor) return null;

    // Context check for the Blank button: only enabled when cursor is inside
    // a fillInBlank body. isActive walks the selection's parent chain so this
    // returns true for any cursor position inside the block, regardless of
    // depth (e.g., cursor between two text runs inside the body still counts).
    const isInFillInBlank = editor.isActive('fillInBlank');

    return (
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={isMarkActive(editor, 'bold')}
            >
                <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={isMarkActive(editor, 'italic')}
            >
                <em>I</em>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                active={isMarkActive(editor, 'code')}
            >
                <code>{'<>'}</code>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                active={isMarkActive(editor, 'subscript')}
            >
                X<sub>2</sub>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                active={isMarkActive(editor, 'superscript')}
            >
                X<sup>2</sup>
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().insertMathInline('x^2').run()}
            >
                ƒx
            </ToolbarButton>

            <ToolbarButton
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .insertMathBlock('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}')
                        .run()
                }
            >
                Σ
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
            >
                H1
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
            >
                H2
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
            >
                H3
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
            >
                • List
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
            >
                1. List
            </ToolbarButton>

            <Divider />

            {/*
              Question group (Stage 13.5 Drop 3).
              - Problem: inserts an empty fill_in_blank block. Always enabled;
                authors can drop one anywhere a block can go.
              - Blank: inserts an inline blank with placeholder answer "?".
                Enabled only when cursor is inside a fill_in_blank body (the
                schema's content spec wouldn't allow it elsewhere). The
                placeholder answer is schema-compliant (min 1 char) and gets
                immediately replaced when the auto-opening popover focuses
                the answer field.
            */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().insertFillInBlank().run()
                }
                title="Insert a fill-in-the-blank problem"
            >
                Problem
            </ToolbarButton>
            <ToolbarButton
                onClick={() => {
                    // Insert the blank with a placeholder answer. The chain
                    // command sets cursor position after insertion; we then
                    // explicitly select the just-inserted node so
                    // BlankPopoverHost opens the popover for editing.
                    //
                    // Why two steps?
                    //   insertContent leaves the selection AFTER the inserted
                    //   node by default (text cursor, not node selection).
                    //   We want the popover to open, which requires a
                    //   NodeSelection on the blank. We compute the inserted
                    //   blank's position from the pre-insertion selection
                    //   position, then setNodeSelection there.
                    const { from } = editor.state.selection;
                    editor
                        .chain()
                        .focus()
                        .insertBlank({ answer: '?' })
                        .run();
                    // After insertion, the blank lives at the previous cursor
                    // position. setNodeSelection makes it the active node
                    // selection so BlankPopoverHost opens the popover.
                    // Wrap in rAF so ProseMirror has finished the insertion
                    // transaction before we select.
                    requestAnimationFrame(() => {
                        // Defensive: confirm a blank node exists at the
                        // expected position before selecting. If something
                        // unexpected happened (e.g., the insert was rejected
                        // by the content spec), don't blow up.
                        const node = editor.state.doc.nodeAt(from);
                        if (node && node.type.name === 'blank') {
                            editor.commands.setNodeSelection(from);
                        }
                    });
                }}
                disabled={!isInFillInBlank}
                title={
                    isInFillInBlank
                        ? 'Insert an answer blank at the cursor'
                        : 'Position cursor inside a problem to insert a blank'
                }
            >
                Blank
            </ToolbarButton>
        </div>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: ReactNode;
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    title,
    children,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium transition ${
                disabled
                    ? 'cursor-not-allowed bg-white text-slate-300'
                    : active
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="mx-1 w-px self-stretch bg-slate-300" />;
}
