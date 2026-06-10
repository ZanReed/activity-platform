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
              - Problem: inserts an empty fill_in_blank block. Always enabled.
              - Blank: inserts an inline blank with placeholder answer "?".
                Enabled only when cursor is inside a fill_in_blank body.
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
                    const { from } = editor.state.selection;
                    editor
                        .chain()
                        .focus()
                        .insertBlank({ answer: '?' })
                        .run();
                    requestAnimationFrame(() => {
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

            <Divider />

            {/*
              Structure group (Stage 13.5 polish).
              - Section: inserts a section break. The SectionBreakView
                renders an inline title input and Checkpoint checkbox, so
                authors edit those by clicking into the inserted break.
                Always enabled — section breaks are top-level structural
                blocks that can go anywhere at doc level.
            */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().insertSectionBreak().run()
                }
                title="Insert a section break"
            >
                Section
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().insertColumns(2).run()}
                title="Insert a two-column layout"
            >
                Columns
            </ToolbarButton>
            {/*
              Grid-lines toggle — contextual: enabled only when the selection
              is inside a columns block. Cycles the block's tri-state
              (inherit → on → off → inherit). The label reflects the current
              state so the author sees whether the block defers to the activity
              default ("Grid: auto") or overrides it ("Grid: on"/"Grid: off").
              Active styling lights up only for an explicit "on".
            */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().cycleColumnsGridLines().run()
                }
                disabled={!editor.isActive('columns')}
                active={
                    editor.isActive('columns') &&
                    editor.getAttributes('columns').gridLines === 'on'
                }
                title="Cycle grid lines on the selected columns block (auto → on → off)"
            >
                {editor.isActive('columns')
                    ? `Grid: ${
                          editor.getAttributes('columns').gridLines === 'on'
                              ? 'on'
                              : editor.getAttributes('columns').gridLines ===
                                  'off'
                                ? 'off'
                                : 'auto'
                      }`
                    : 'Grid'}
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
