// =============================================================================
// batchImportPipeline.ts — the node-side seam for the batch importer
// -----------------------------------------------------------------------------
// scripts/batch-import.mjs esbuild-bundles THIS module (see ruling D4 in
// docs/design/batch-importer.md) and imports the result. It exists so the
// script has one narrow, TYPECHECKED entry point into the app's conversion
// pipeline instead of reaching into four files by path.
//
// Why it lives in packages/app/src/lib and not in scripts/: there is no root
// tsconfig and no root eslint config — `pnpm typecheck` and `pnpm lint` are
// both `pnpm -r`, so a .ts file under scripts/ is checked by nothing. A seam
// the type checker cannot see is a seam that rots.
//
// ---- The pipeline this exposes ----------------------------------------------
//
//   .md text
//      │
//      ▼  getMarkdownImporter()          markdown-it → Tiptap block JSON
//   ImportResult { blocks, referencePanel?, meta?, warnings }
//      │
//      ├─ meta ──▶ applyImportedMeta()   the NEVER-CLOBBER merge (D16)
//      │                                 reused, never reimplemented
//      ▼
//   wrapBlocksStrict(blocks)             blocks → rows/columns doc
//      │
//      ▼  tiptapToActivity(doc, meta)
//   ActivityDocument ──▶ ActivityDocument.safeParse()  ──▶ activities.draft_content
//
// EVERY EXPORT HERE IS A RE-EXPORT. This module adds no behaviour on purpose:
// the moment it transforms something, the script and the editor are running
// different importers, which is the whole failure the shared pipeline exists to
// prevent.
// =============================================================================

export { getMarkdownImporter } from './markdownToTiptap';
export type { ImportResult, ImportedMeta } from './markdownToTiptap';

export { wrapBlocksStrict } from '../editor/strictGrid';

export {
    tiptapToActivity,
    activityToTiptap,
    // The ```reference fence hands back Tiptap JSON; ReferencePanel.blocks is
    // schema Block[]. This is the converter the editor's own save path uses
    // (ActivityEditor.tsx panelFromEditor) — the script must not hand-roll a
    // second one, or an imported reference sheet and an authored one would be
    // two different shapes in the same column.
    tiptapToReferencePanel,
} from './serialize';

export {
    applyImportedMeta,
    DEFAULT_COURSE,
    DEFAULT_TITLE,
} from './applyImportedMeta';
export type { ImportMetaTarget, ImportMetaOutcome } from './applyImportedMeta';

export { slugify, slugWithSuffix } from './slug';

export { normalizeTags } from './normalizeTags';

// The zod schema, not just the type. The script validates before it writes:
// draft_content is the column the editor loads on next open, so a document
// that fails validation must never reach it.
export { ActivityDocument } from '@activity/schema';

/**
 * The canonical blank meta, so the script never hand-rolls schema defaults.
 *
 * It did, until 2026-08-21, and the bill arrived the moment `applyImportedMeta`
 * learned to read a NESTED field: the literal carried title/course/the four
 * settings and no `print` at all, so the first fence to say `work:` crashed on
 * `meta.print.workSpace`. Zod had been papering over it (PrintConfig is
 * `.default({})`, so the written document was always fine) — which is exactly
 * why the gap survived to be found by a crash rather than by a test.
 */
export { createEmptyDocument } from '@activity/schema';
export type { ActivityMeta } from '@activity/schema';

/**
 * The numeric parser the SERVER grades with.
 *
 * Re-exported so the batch importer's dead-binding check can ask "would this
 * mistake match score as correct?" with the same arithmetic that decides real
 * marks. That question is numeric on a `{{=…}}` blank — `!0.5` against an
 * answer of `1/2` is the same value, so the mistake can never fire even though
 * the strings differ — and answering it with a SECOND copy of the parser is how
 * the check starts lying: `numeric.ts` is itself a parity port kept
 * character-for-character on purpose, and a third copy drifting means the
 * importer reports live bindings as dead (or misses dead ones) with nothing to
 * catch it. The module is a pure leaf (zero imports), so bundling it for node
 * costs nothing.
 */
export {
    parseNumericValue,
    coerceTolerance,
    numericallyClose,
} from '../../../viewer/src/server/grading/numeric';
