// =============================================================================
// tiptap-stubs/y-tiptap.ts — the module `@tiptap/y-tiptap` RESOLVES TO
// -----------------------------------------------------------------------------
// THIS FILE IS NOT IMPORTED BY NAME ANYWHERE. A `resolve.alias` entry in
// packages/app/vite.config.ts redirects every import of `@tiptap/y-tiptap`
// here, including the two inside node_modules. Ruling: shell-size review
// T2 / TR3 (docs/design/shell-size-review.md §8), 2026-11-13.
//
// WHY: y-tiptap is Tiptap's binding to Yjs, the live co-editing engine. It,
// yjs, lib0 and y-protocols were ~31 KiB gz of the EDITOR download, and this
// app has no live collaboration (the fall co-ownership arc is async). They
// arrive only because `@tiptap/extension-drag-handle` imports them to keep the
// dragged node's position stable across REMOTE edits, and it reads them only
// after checking for a y-sync plugin in the editor state:
//
//   getRelativePos(state, pos)  → ySyncPluginKey.getState(state) is undefined
//                                  here, so it returns null and never calls on
//   getAbsolutePos(state, rel)  → same check, returns -1
//   isChangeOrigin(tr)          → !!tr.getMeta(ySyncPluginKey), false here
//
// So `ySyncPluginKey` must be a REAL PluginKey (getState/getMeta are called on
// every drag) and everything else may throw, because reaching it means a y-sync
// plugin exists, which this app never installs.
//
// AUDITED AGAINST: @tiptap/extension-drag-handle 3.23.1
//   ^ read mechanically by scripts/tests/tiptap-stub-pin.test.mjs, which fails
//     when the installed drag-handle or extension-collaboration version moves
//     (the Tiptap family is bumped together; re-read both packages' dist then).
//
// THE CONTRACT (names imported from @tiptap/y-tiptap in that version):
//   extension-drag-handle:    absolutePositionToRelativePosition,
//                             relativePositionToAbsolutePosition, ySyncPluginKey
//   extension-collaboration:  ySyncPlugin, yUndoPlugin, yUndoPluginKey, undo,
//                             redo, ySyncPluginKey (+ the two position helpers)
//
// UN-STUBBING: only for live co-editing. Delete the alias, this file, the pin
// test and the yjs absence row in scripts/perf-budgets.mjs together.
// =============================================================================

import { PluginKey } from '@tiptap/pm/state';

const UN_STUB =
    '@tiptap/y-tiptap (the Yjs live-collaboration binding) is STUBBED OUT of this ' +
    'app: it is aliased to packages/app/src/lib/tiptap-stubs/y-tiptap.ts by ' +
    'resolve.alias in packages/app/vite.config.ts. Nothing here installs a y-sync ' +
    'plugin, so this code should be unreachable. Why: docs/design/shell-size-review.md (TR3).';

const wall = (name: string) => (): never => {
    throw new Error(`${name}() — ${UN_STUB}`);
};

/** Real, because drag-handle calls getState()/getMeta() with it on every drag.
 *  No plugin is ever registered under it, so both always come back empty. */
export const ySyncPluginKey = new PluginKey('y-sync');
export const yUndoPluginKey = new PluginKey('y-undo');

export const absolutePositionToRelativePosition = wall('absolutePositionToRelativePosition');
export const relativePositionToAbsolutePosition = wall('relativePositionToAbsolutePosition');
export const ySyncPlugin = wall('ySyncPlugin');
export const yUndoPlugin = wall('yUndoPlugin');
export const undo = wall('undo');
export const redo = wall('redo');
