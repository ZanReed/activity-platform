import { Node } from '@tiptap/core';

// =============================================================================
// Doc — the strict-grid top node.
// -----------------------------------------------------------------------------
// The editor tree now IS the stored rows-of-columns model (the strict-grid
// migration): the document is a stream of `sectionBreak` markers and `row`
// nodes, and every leaf block lives inside a `column` (row > column > block+).
// There are NO bare top-level blocks anymore — a section is normally ONE `row`
// whose ONE `column` stacks all its blocks (A1), so serialize is near-passthrough.
//
// This replaces StarterKit's Document (content `block+`) — buildEditorExtensions
// passes `document: false` to StarterKit and registers this instead. Naming the
// two allowed children explicitly (rather than a shared group) keeps a leaf
// block from ever landing at doc top level: `block` is the column-cell group,
// `row` is its own group, and `sectionBreak` is named here directly.
//
// Mirrors @tiptap/extension-document (name 'doc', topNode) — recreated here
// rather than imported so the app takes no new direct dependency on that package
// (it is only present transitively via StarterKit).
// =============================================================================

export const Doc = Node.create({
    name: 'doc',
    topNode: true,
    // `row` FIRST so it is the content-match default type: when ProseMirror must
    // fill the doc (e.g. after deleting everything), it creates a `row` (which
    // fills to row > column > paragraph — a clean cursor home), not a bare
    // `sectionBreak`. Order only affects the fill preference, not what's allowed.
    content: '(row | sectionBreak)+',
});
