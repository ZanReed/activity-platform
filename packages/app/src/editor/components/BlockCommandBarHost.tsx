import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Editor } from '@tiptap/react';
import type { Node as PMNode } from '@tiptap/pm/model';
import { NodeSelection } from 'prosemirror-state';
import { ChevronDown, Settings, Check } from 'lucide-react';
import {
    controlsFor,
    universalActions,
    OPEN_BLOCK_SETTINGS,
    type BlockControls,
    type ControlEntry,
    type AdvancedField,
    type AdvancedGroup,
} from '../blockControls';
import AdvancedDrawer from './AdvancedDrawer';

// What the drawer below the bar is currently showing.
type DrawerContent =
    | null
    | { kind: 'advanced' }
    | { kind: 'field'; field: AdvancedField };

// ============================================================================
// BlockCommandBarHost — root-level docked command bar for the selected block.
// ----------------------------------------------------------------------------
// The slice-6 generalization of BlankPopoverHost: ONE instance at the editor
// root watches the selection and, when a block whose type has a control
// descriptor is NodeSelected, renders the descriptor's command bar anchored to
// that block. Single host, mount-on-selection — never per-block (that is the
// Stage-13.5 reconciliation hazard the whole design is built to avoid).
//
// ANCHORED, not floating (design decision): the bar is positioned absolutely
// inside the canvas (which is `position: relative`), at the selected block's
// top-right. Because it lives in the canvas coordinate space it scrolls WITH
// its block for free — no scroll listener, no floating-ui, no chasing the
// selection. It only recomputes when the selection changes.
//
// STAGE 0: renders `primary` actions + a stub `⌄ Advanced` disclosure (the
// drawer is stage 4). Proven on paragraph/heading (generic) + math_block
// (real primary). The move grip is the gutter cluster (stage 1), not here yet.
// ============================================================================

interface BlockCommandBarHostProps {
    editor: Editor | null;
    /** The `position: relative` canvas the bar is positioned within. */
    canvasRef: RefObject<HTMLDivElement | null>;
}

interface SelectedBlock {
    pos: number;
    typeName: string;
    controls: BlockControls;
}

export default function BlockCommandBarHost({
    editor,
    canvasRef,
}: BlockCommandBarHostProps) {
    const [selected, setSelected] = useState<SelectedBlock | null>(null);
    // Bar position in canvas-relative px, measured in a rAF AFTER selection
    // commits (see below). null until measured — the bar renders only then.
    const [position, setPosition] = useState<{ top: number; left: number } | null>(
        null,
    );
    // Settings mode swaps the bar's action buttons (Duplicate/Delete) for the
    // block's `simple` settings + an Advanced disclosure. drawerContent is what
    // shows below: nothing, the Advanced groups, or one simple field's editor.
    const [settingsMode, setSettingsMode] = useState(false);
    const [drawerContent, setDrawerContent] = useState<DrawerContent>(null);
    // Identity of the last selected block. Settings state resets INLINE when it
    // changes (not a post-render effect) so the quick-bar's ⚙ meta — which
    // arrives in the SAME transaction that selects the block — can set
    // settingsMode true afterward without the reset clobbering it.
    const lastSelKey = useRef<string | null>(null);

    // Phase 1 — detect the selected block. Only pos/type/controls here; NO DOM
    // measurement (measuring inside the transaction handler reads pre-layout
    // geometry and mis-anchors the bar). Keep the state object identity stable
    // across transactions on the same block so phase 2 doesn't thrash.
    useEffect(() => {
        if (!editor) return;

        const update = () => {
            const { selection } = editor.state;
            const node =
                selection instanceof NodeSelection ? selection.node : null;
            const controls = node ? controlsFor(node.type.name) : null;
            const key =
                node && controls ? `${selection.from}:${node.type.name}` : null;
            if (key !== lastSelKey.current) {
                lastSelKey.current = key;
                setSettingsMode(false);
                setDrawerContent(null);
            }
            if (!node || !controls) {
                setSelected((prev) => (prev === null ? prev : null));
                return;
            }
            const pos = selection.from;
            const typeName = node.type.name;
            setSelected((prev) =>
                prev && prev.pos === pos && prev.typeName === typeName
                    ? prev
                    : { pos, typeName, controls },
            );
        };

        // The quick-bar's ⚙ dispatches OPEN_BLOCK_SETTINGS in the same tx that
        // selects the block — open settings mode straight away.
        const onTransaction = ({
            transaction,
        }: {
            transaction: { getMeta: (key: string) => unknown };
        }) => {
            update();
            if (transaction.getMeta(OPEN_BLOCK_SETTINGS)) {
                setSettingsMode(true);
            }
        };

        editor.on('selectionUpdate', update);
        editor.on('transaction', onTransaction);
        update();
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('transaction', onTransaction);
        };
    }, [editor, canvasRef]);

    // Phase 2 — measure the anchor in a rAF, after the selected-node class and
    // any NodeView re-render have painted. Same deferral BlankPopoverHost uses
    // to resolve its chip element. Canvas is the bar's offset parent, so we
    // store canvas-relative px; the bar then scrolls with the block for free.
    useEffect(() => {
        if (!editor || !selected) {
            setPosition(null);
            return;
        }
        const raf = requestAnimationFrame(() => {
            const canvas = canvasRef.current;
            const dom = editor.view.nodeDOM(selected.pos);
            if (!canvas || !(dom instanceof HTMLElement)) {
                setPosition(null);
                return;
            }
            const cr = canvas.getBoundingClientRect();
            const br = dom.getBoundingClientRect();
            setPosition({ top: br.top - cr.top, left: br.right - cr.left });
        });
        return () => cancelAnimationFrame(raf);
    }, [editor, selected, canvasRef]);

    if (!editor || !selected || !position) return null;

    const { primary, simple = [], advanced = [] } = selected.controls;
    const hasSimple = simple.length > 0;
    const hasAdvanced = advanced.length > 0;
    const hasSettings = hasSimple || hasAdvanced;
    // Guard: a block with no settings can't enter settings mode (e.g. the
    // quick-bar ⚙ meta on a paragraph) — fall back to action mode.
    const inSettings = settingsMode && hasSettings;
    const node = editor.state.doc.nodeAt(selected.pos);
    const pos = selected.pos;

    // What the drawer below shows: the Advanced groups, or one simple field's
    // editor, or nothing.
    const drawerGroups: AdvancedGroup[] | null =
        drawerContent === null
            ? null
            : drawerContent.kind === 'advanced'
              ? advanced
              : [{ group: drawerContent.field.label, fields: [drawerContent.field] }];

    return (
        // Anchor holds the position + right-alignment so the bar and the drawer
        // stack together at the block's top-right.
        <div
            className="block-command-bar-anchor"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <div
                className="block-command-bar"
                role="toolbar"
                aria-label="Block controls"
                data-block-type={selected.typeName}
            >
                {primary.map((entry) => (
                    <BarButton
                        key={entry.label}
                        entry={entry}
                        editor={editor}
                        pos={pos}
                        primary
                    />
                ))}
                {primary.length > 0 ? (
                    <span
                        className="block-command-bar__divider"
                        aria-hidden="true"
                    />
                ) : null}

                {!inSettings ? (
                    // Action mode: the universal actions.
                    universalActions.map((entry) => (
                        <BarButton
                            key={entry.label}
                            entry={entry}
                            editor={editor}
                            pos={pos}
                        />
                    ))
                ) : (
                    // Settings mode: simple settings as buttons + the Advanced
                    // disclosure (only when there are advanced settings).
                    <>
                        {node
                            ? simple.map((field) => (
                                  <SimpleSettingButton
                                      key={field.label}
                                      field={field}
                                      editor={editor}
                                      node={node}
                                      pos={pos}
                                      open={
                                          drawerContent?.kind === 'field' &&
                                          drawerContent.field === field
                                      }
                                      onOpenField={() =>
                                          setDrawerContent((cur) =>
                                              cur?.kind === 'field' &&
                                              cur.field === field
                                                  ? null
                                                  : { kind: 'field', field },
                                          )
                                      }
                                  />
                              ))
                            : null}
                        {hasAdvanced ? (
                            <button
                                type="button"
                                className={
                                    'block-command-bar__advanced' +
                                    (drawerContent?.kind === 'advanced'
                                        ? ' block-command-bar__advanced--open'
                                        : '')
                                }
                                aria-expanded={drawerContent?.kind === 'advanced'}
                                onClick={() =>
                                    setDrawerContent((cur) =>
                                        cur?.kind === 'advanced'
                                            ? null
                                            : { kind: 'advanced' },
                                    )
                                }
                            >
                                <ChevronDown size={14} aria-hidden="true" />
                                <span>Advanced</span>
                            </button>
                        ) : null}
                    </>
                )}

                {hasSettings ? (
                    <button
                        type="button"
                        className={
                            'block-command-bar__gear' +
                            (inSettings ? ' block-command-bar__gear--active' : '')
                        }
                        aria-pressed={inSettings}
                        aria-label="Settings"
                        title="Settings"
                        onClick={() => {
                            if (inSettings) {
                                setSettingsMode(false);
                                setDrawerContent(null);
                            } else {
                                setSettingsMode(true);
                            }
                        }}
                    >
                        <Settings size={14} aria-hidden="true" />
                    </button>
                ) : null}
            </div>
            {drawerGroups && node ? (
                <AdvancedDrawer
                    editor={editor}
                    node={node}
                    pos={pos}
                    groups={drawerGroups}
                />
            ) : null}
        </div>
    );
}

interface SimpleSettingButtonProps {
    field: AdvancedField;
    editor: Editor;
    node: PMNode;
    pos: number;
    /** True when this field's editor is currently open in the drawer below. */
    open: boolean;
    onOpenField: () => void;
}

// A `simple` setting as a bar button. A toggle flips in place (with a checkmark
// state); every other kind opens its single-field editor in the drawer below.
function SimpleSettingButton({
    field,
    editor,
    node,
    pos,
    open,
    onOpenField,
}: SimpleSettingButtonProps) {
    if (field.kind === 'toggle') {
        const on = field.get(node);
        return (
            <button
                type="button"
                className={
                    'block-command-bar__setting' +
                    (on ? ' block-command-bar__setting--on' : '')
                }
                aria-pressed={on}
                onClick={() => field.set(editor, pos, !on)}
            >
                {on ? <Check size={13} aria-hidden="true" /> : null}
                <span>{field.label}</span>
            </button>
        );
    }
    return (
        <button
            type="button"
            className={
                'block-command-bar__setting' +
                (open ? ' block-command-bar__setting--open' : '')
            }
            aria-expanded={open}
            onClick={onOpenField}
        >
            <span>{field.label}</span>
            <ChevronDown size={13} aria-hidden="true" />
        </button>
    );
}

interface BarButtonProps {
    entry: ControlEntry;
    editor: Editor;
    pos: number;
    /** Block-specific primary (accent fill) vs a universal action (ghost). */
    primary?: boolean;
}

function BarButton({ entry, editor, pos, primary }: BarButtonProps) {
    const Icon = entry.icon;
    return (
        <button
            type="button"
            className={
                'block-command-bar__action' +
                (primary ? ' block-command-bar__action--primary' : '')
            }
            onClick={() => entry.onActivate(editor, pos)}
        >
            <Icon size={14} aria-hidden="true" />
            <span>{entry.label}</span>
        </button>
    );
}
