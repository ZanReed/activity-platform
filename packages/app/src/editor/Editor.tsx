import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Plus } from 'lucide-react';
import {
    useEditor,
    EditorContent,
    type Editor as TiptapEditor,
    type JSONContent,
} from '@tiptap/react';
import type { Typography } from '@activity/schema';
import { fontFamilyValue } from '@activity/renderer';
import { ensureActivityFontLoaded } from '../lib/fonts';
import DragHandle from '@tiptap/extension-drag-handle-react';
import Toolbar from './Toolbar';
import './editor.css';
import 'mathlive';
import { buildEditorExtensions } from './editorExtensions';
import { columnsNestedDragOptions } from './dragHandleNested';
import BlockInsertModal from './components/BlockInsertModal';
import type { SlashMenuItem } from './slashMenuItems';
import BlankPopoverHost from './components/BlankPopoverHost';
import ImagePopoverHost from './components/ImagePopoverHost';
import DefinitionPopoverHost from './components/DefinitionPopoverHost';

interface EditorProps {
    initialContent: JSONContent;
    onUpdate?: (json: JSONContent) => void;
    // Activity-wide default a columns block's gridLines:'inherit' resolves to
    // (meta.print.gridLines). Fixed at editor mount — Tiptap configures
    // extensions once, so changing the activity default takes effect on reload;
    // the published output is always authoritative. Defaults to false (the
    // playground passes nothing).
    gridLinesDefault?: boolean;
    // Activity being edited — forwarded to the image popover's Upload tab so it
    // can POST to the upload-image Edge Function. Undefined in the playground,
    // where uploads are disabled (URL paste only).
    activityId?: string;
    // Surfaces the live editor instance to the parent (null until mounted) so
    // activity-level header actions — e.g. markdown import — can drive editor
    // commands. The editor itself stays the owner of the useEditor instance.
    onEditorReady?: (editor: TiptapEditor | null) => void;
    // Activity-wide typography (meta.typography) — applied LIVE to the canvas
    // via the same --activity-font-* vars the published page uses (editor.css
    // reads them on .ProseMirror), with the family itself loaded through the
    // app-side fontsource path (lib/fonts.ts) so authoring is WYSIWYG without
    // an R2 round trip. Undefined = the default look (playground, old docs).
    typography?: Typography;
}

export default function Editor({
    initialContent,
    onUpdate,
    gridLinesDefault = false,
    activityId,
    onEditorReady,
    typography,
}: EditorProps) {
    // Force re-render on every editor transaction. Tiptap React's built-in
    // re-render hook misses pure storedMarks transactions (e.g., toggling a
    // mark on an empty cursor), so toolbar active states would lag behind
    // editor state without this nudge.
    const [, forceTick] = useState(0);
    const editor = useEditor({
        // The extension list lives in editorExtensions.ts so tests can build
        // the real ProseMirror schema (blockTypeGuards.test.ts).
        extensions: buildEditorExtensions({ gridLinesDefault }),
        content: initialContent,
        onCreate: ({ editor }) => {
            onUpdate?.(editor.getJSON());
        },
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getJSON());
        },
        onTransaction: () => {
            forceTick((t) => t + 1);
        },
    });

    // Canvas wrapper — the insert-line overlay is positioned against it, so it
    // needs a ref and `position: relative`.
    const canvasRef = useRef<HTMLDivElement>(null);

    // The insert line follows the top-level block under the cursor: positioned
    // (canvas-relative px) at that block's top edge. Clicking it opens the
    // window to insert ABOVE that block — which also covers a line above the
    // very first block. Driven by the drag-handle's onNodeChange.
    const [insertLine, setInsertLine] = useState<{
        top: number;
        left: number;
        width: number;
        pos: number;
    } | null>(null);

    // The open "Add a block" window and the doc position a pick lands at. null
    // = closed.
    const [insertPos, setInsertPos] = useState<number | null>(null);

    // The top-level block the line currently targets — guards against
    // re-rendering on every mousemove within the same block.
    const lineTargetRef = useRef<number | null>(null);

    // Self-contained hover tracking (independent of the drag-handle's internal
    // mousemove logic): find the top-level block under the cursor and place the
    // line at its top edge. Insert lands ABOVE that block — which also gives a
    // line above the very first block.
    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!editor || !canvasRef.current) return;
        const hit = editor.view.posAtCoords({
            left: e.clientX,
            top: e.clientY,
        });
        if (!hit) return; // keep the last line sticky
        const $pos = editor.state.doc.resolve(hit.pos);
        // Target the block that is a direct child of the doc OR a column cell:
        // walk up from the cursor, stopping at the first block whose parent is a
        // `column` (so the line lands INSIDE a cell) or the doc (top level).
        // Without this, hovering inside columns jumps up to the whole block and
        // there's no way to insert into a cell.
        let d = $pos.depth;
        while (d > 1 && $pos.node(d - 1).type.name !== 'column') d--;
        const targetPos = d >= 1 ? $pos.before(d) : hit.pos;
        if (lineTargetRef.current === targetPos) return;
        const dom = editor.view.nodeDOM(targetPos);
        if (!(dom instanceof HTMLElement)) return;
        lineTargetRef.current = targetPos;
        const cr = canvasRef.current.getBoundingClientRect();
        const blockBox = dom.getBoundingClientRect();
        // Span the full width of the containing column — a cell inside a columns
        // block, or the whole page when not (the implicit "column of one") —
        // rather than the hovered block's own width. Reads as "insert into this
        // column here", and stays full-width even above a narrow block (image,
        // centered math). The block's parent element is the column's contentDOM
        // (or .ProseMirror at top level).
        let left = blockBox.left - cr.left;
        let width = blockBox.width;
        const container = dom.parentElement;
        if (container) {
            const cbox = container.getBoundingClientRect();
            const cs = getComputedStyle(container);
            const padL = parseFloat(cs.paddingLeft) || 0;
            const padR = parseFloat(cs.paddingRight) || 0;
            left = cbox.left + padL - cr.left;
            width = cbox.width - padL - padR;
        }
        setInsertLine({
            top: blockBox.top - cr.top,
            left,
            width,
            pos: targetPos,
        });
    };

    const clearInsertLine = () => {
        lineTargetRef.current = null;
        setInsertLine(null);
    };

    // Insert a block at `pos`; if the doc was just the initial empty paragraph,
    // drop that leftover empty line so a fresh activity starts clean.
    const runInsert = (pos: number, item: SlashMenuItem) => {
        if (!editor) return;
        const before = editor.state.doc;
        const wasEmpty =
            before.childCount === 1 &&
            before.firstChild?.type.name === 'paragraph' &&
            before.firstChild.content.size === 0;
        editor.commands.setTextSelection(Math.min(pos, before.content.size));
        item.command({ editor });
        if (wasEmpty) {
            const first = editor.state.doc.firstChild;
            if (
                editor.state.doc.childCount > 1 &&
                first &&
                first.type.name === 'paragraph' &&
                first.content.size === 0
            ) {
                editor.chain().deleteRange({ from: 0, to: first.nodeSize }).run();
            }
        }
        setInsertPos(null);
    };

    // Dev-only escape hatch: expose the live editor so scripted browser
    // checks (and quick console experiments) can set content / inspect state.
    // Stripped from production builds by the DEV guard.
    useEffect(() => {
        if (import.meta.env.DEV) {
            (window as unknown as { __tiptapEditor?: unknown }).__tiptapEditor =
                editor;
        }
    }, [editor]);

    // Load the selected activity font into the app when it changes (no-op for
    // 'default'/undefined; idempotent per family). The vars below apply
    // immediately either way — font-display swap semantics via the fallback
    // stack until the file lands.
    useEffect(() => {
        if (typography) void ensureActivityFontLoaded(typography.font);
    }, [typography?.font]); // eslint-disable-line react-hooks/exhaustive-deps

    // The canvas half of the WYSIWYG contract: the same CSS vars the published
    // page sets on :root, scoped to this editor card. editor.css consumes them
    // on .ProseMirror (family + base size; headings there are em-relative like
    // the published blocks, so they scale identically).
    const typographyVars: CSSProperties | undefined = typography
        ? ({
              '--activity-font-family':
                  fontFamilyValue(typography.font) ?? undefined,
              '--activity-font-size': `${typography.fontSize}px`,
          } as CSSProperties)
        : undefined;

    // Hand the live instance up to the parent's header actions (e.g. the
    // markdown-import button gates on it). Only ever report a NON-NULL editor and
    // never null it on cleanup: that guarantees once the editor exists the parent
    // stays enabled, with no window — under StrictMode the dev double-mount, and
    // on a keyed remount, the intermediate cleanup would otherwise null the
    // parent's lifted ref and leave header actions stuck disabled. The parent
    // unmounts as a whole when navigating away, so a stale ref here is harmless.
    useEffect(() => {
        if (editor) onEditorReady?.(editor);
    }, [editor, onEditorReady]);

    return (
        // No overflow-hidden here: it would establish this card as the
        // toolbar's containing scroll box and silently disable its
        // position:sticky against the window scroll. Corner rounding is
        // handled per-edge instead (toolbar rounds its own top corners).
        <div
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
            style={typographyVars}
        >
            <Toolbar editor={editor} />
            <div
                ref={canvasRef}
                className="relative p-6"
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={clearInsertLine}
            >
                <DragHandle editor={editor} nested={columnsNestedDragOptions}>
                    <button
                        type="button"
                        className="drag-handle-button"
                        tabIndex={-1}
                        aria-label="Drag to reorder block"
                        title="Drag to reorder"
                    >
                        <svg
                            width="12"
                            height="20"
                            viewBox="0 0 12 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <circle cx="3" cy="4" r="1.5" />
                            <circle cx="9" cy="4" r="1.5" />
                            <circle cx="3" cy="10" r="1.5" />
                            <circle cx="9" cy="10" r="1.5" />
                            <circle cx="3" cy="16" r="1.5" />
                            <circle cx="9" cy="16" r="1.5" />
                        </svg>
                    </button>
                </DragHandle>
                {/* Between-block insert line: appears at the top edge of the
                    hovered block (also covers a line above the first block).
                    Clicking opens the window to insert above that block. */}
                {insertLine && insertPos === null ? (
                    <button
                        type="button"
                        className="block-insert-line"
                        style={{
                            top: `${insertLine.top}px`,
                            left: `${insertLine.left}px`,
                            width: `${insertLine.width}px`,
                        }}
                        aria-label="Insert a block here"
                        title="Insert a block here"
                        onClick={() => setInsertPos(insertLine.pos)}
                    >
                        <span className="block-insert-line__plus">
                            <Plus size={12} aria-hidden="true" />
                        </span>
                    </button>
                ) : null}
                <EditorContent editor={editor} />
                {/* Persistent "add block" square at the end of the document —
                    also the sole affordance on a brand-new empty activity.
                    Appends at the very end. */}
                <button
                    type="button"
                    className="block-insert-end"
                    aria-label="Add a block"
                    title="Add a block"
                    onClick={() =>
                        editor &&
                        setInsertPos(editor.state.doc.content.size)
                    }
                >
                    <Plus size={16} aria-hidden="true" />
                </button>
                {editor && insertPos !== null ? (
                    <BlockInsertModal
                        editor={editor}
                        insertPos={insertPos}
                        onInsert={(item) => runInsert(insertPos, item)}
                        onClose={() => setInsertPos(null)}
                    />
                ) : null}
                {/*
                  BlankPopoverHost sits as a sibling of EditorContent. It
                  watches the editor's selection and shows a popover when a
                  blank node is currently selected. Single instance — no
                  per-chip mounting. The popover itself portals to
                  document.body for stacking-context independence.
                */}
                <BlankPopoverHost editor={editor} />
                {/*
                  ImagePopoverHost — sibling host watching the selection for a
                  node-selected image block, showing the anchored edit popover.
                  Single instance, same pattern as BlankPopoverHost.
                */}
                <ImagePopoverHost editor={editor} activityId={activityId} />
                {/*
                  DefinitionPopoverHost — sibling host watching the selection
                  for the inline `definition` mark, showing the anchored edit
                  popover. Single instance, same pattern as the hosts above
                  (mark-based rather than node-based).
                */}
                <DefinitionPopoverHost editor={editor} activityId={activityId} />
            </div>
        </div>
    );
}
