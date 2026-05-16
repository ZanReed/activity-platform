import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';
import { useState } from 'react';

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
        </div>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    active?: boolean;
    children: ReactNode;
}

function ToolbarButton({ onClick, active, children }: ToolbarButtonProps) {
    return (
        <button
        type="button"
        onClick={onClick}
        className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium transition ${
            active
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
