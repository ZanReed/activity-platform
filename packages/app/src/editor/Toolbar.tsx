import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

interface ToolbarProps {
    editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        >
        <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        >
        <em>I</em>
        </ToolbarButton>
        <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        >
        <code>{'<>'}</code>
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
