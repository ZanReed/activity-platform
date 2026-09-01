// =============================================================================
// document.ts — Top-level ActivityDocument and Section schemas
// -----------------------------------------------------------------------------
// ActivityDocument is what gets stored in activities.draft_content and
// activity_versions.content. The shape lives in this package as the single
// source of truth — the renderer parses it, the editor produces it via the
// serialize layer, the database stores it as jsonb.
//
// schemaVersion is the migration anchor. It is currently 2. The 1→2 reshape
// (block-stream sections → rows-of-columns) was a GREENFIELD HARD-CUT: there was
// no production data to preserve, so there is deliberately NO migrate(1→2) and
// NO migrate-on-read — the parser is z.literal(2) and REJECTS a v1 document
// (a stray v1 fails loudly at parse rather than mis-parsing into garbage).
// When a FUTURE schema needs a non-trivial migration against real stored data,
// bump the version and add a migrate(N -> N+1) that runs on read (old
// activity_versions rows stay at their original schemaVersion forever; migrate
// on read, never by mutating stored versions). The greenfield hard-cut is a
// one-time exception, not the general policy.
// =============================================================================

import { z } from 'zod';
import { SeedVars } from './seed-vars.js';
import { Block } from './blocks/index.js';
import { Row } from './layout.js';

// Section: a collection of ROWS with an optional title. Sections are the
// vertical checkpoint primitive; rows are the horizontal-split primitive
// (layout.ts). A section is usually one 1-column row whose column stacks many
// blocks; a columned region is a multi-column row. Sections are organizational
// only — they don't constrain content beyond holding rows.
//
// isCheckpoint is the `{checkpoint}` marker, and it is where CHECKING HAPPENS
// (activity flow modes, R1). A checkpoint section's Check covers EVERY SECTION
// SINCE THE PREVIOUS CHECKPOINT, inclusive — not just itself — and THE END OF
// THE ACTIVITY IS ALWAYS A CHECKPOINT, so no trailing section is ever left
// un-checkable and a document with no marker at all degrades to exactly one
// Check at the end. Ignored entirely when submissionMode is 'single'.
//
// The fold that turns these into check groups is
// packages/viewer/src/container/checkGroups.ts; the guard that binds it to
// rendered output is tests/components/check-groups.test.tsx (a Check button
// exists in the DOM for every section, in every mode).
export const Section = z.object({
  id: z.string().uuid(),
                                title: z.string().optional(),
                                isCheckpoint: z.boolean().default(false),
                                rows: z.array(Row),
});
export type Section = z.infer<typeof Section>;

// Meta: the activity's title, course, unit, etc. Not used in rendering of
// the body — drives the published HTML's <title> and header banner.
//
// submissionMode controls the student-facing flow. Two real behaviours and one
// authoring convenience (activity flow modes, R2):
//   'free'   (default) — checkpoints per R1; a group may be re-checked freely
//   'locked' — checkpoints per R1; a group's inputs FREEZE the moment its
//              check is pressed, and the SERVER refuses a second check for a
//              section that already has one (record_check's p_locked, 0040 —
//              derived from THIS field, never from anything the client sends).
//              ⚠ There is no unlock in v1: not for the student, not for the
//              teacher. A republish mints a new version and resets everyone,
//              and that is the only unlock there is.
//   'single' — no mid-activity checkpoints; the end-of-activity Check is the
//              only one. Redundant with 'free' + no markers under R1, and kept
//              because it says the intent plainly at authoring time.
//
// activityType is a LABEL (R5): it renders as text beside course/unit, on
// screen and on paper — "Exit ticket" / "Warm-up" / "Review"; 'worksheet' is
// the unmarked default and renders nothing. It drives no layout. It used to
// claim it did ("an exit_ticket renders as a single-page focused layout; a
// worksheet renders with full section navigation") and that was never built in
// the viewer, which has ONE layout and no section navigation. It is also NOT
// the catalog facet — that is `pedagogical_role` (0037), a different axis on
// purpose (see packages/app/src/lib/pedagogicalRole.ts).
//
// answerFeedback controls WHEN a correct/incorrect signal becomes visible:
//   'on_check'  — hidden until the student checks. THE ONLY LIVE VALUE, and
//                 the treatment for a missing field.
//   'immediate' — RESERVED, NOT YET ACTIVE (R3, deferred to its own slice).
//                 The editor greys it, the importer warns, and the viewer
//                 treats it as 'on_check'. It is not built because nothing to
//                 hang it on exists yet: all eleven input components write to
//                 the store per keystroke, so there is no commit seam; only
//                 the server scorers know what "answered" means (the sanitizer
//                 strips the expected count, so the client cannot know an
//                 ordering or a graph is complete); and the re-fire rule after
//                 a correction is undesigned. `immediate` + `locked` is
//                 refused at authoring, because the server cannot tell an
//                 auto-check from a press.
//
// ⚠ THE OLD "the runtime defaults a MISSING answerFeedback to 'immediate'"
// NOTE IS DEAD (OV#20). It described `packages/renderer`'s runtime, which was
// deleted at S9 Drop 4. Missing means 'on_check', the same as the schema
// default — there is no longer a back-compat fallback that differs.
//
// ⚰ revisionMode and gradingMode were DELETED in the activity-flow-modes slice
// (R4, 2026-08-24) and must not come back speculatively. revisionMode governed
// "after final submit, may the student resubmit" — and there is no submit in
// the viewer, so it had no referent; re-checking is submissionMode's job.
// gradingMode is DERIVED, not authored: the server already records free text as
// "your teacher will review" and grades everything else purely from block
// types, so 'manual' on an all-MC activity would be a lie and 'auto' on an
// essay would be ignored. When per-block grading metadata lands (the
// teacher-grading slice's own design says it needs it), it lands at the BLOCK
// grain, not here. Old stored documents carrying either field parse fine —
// zod .object() strips unknown keys, so they vanish on the next save.
//
// skills is an array of universal skill tags describing what the activity
// teaches. Action-oriented, framework-neutral: "simplifying rational
// expressions", "factoring quadratics", "graphing parabolas". A teacher who
// wants to use TEKS or CCSS codes can — the field doesn't validate against
// any framework. Phase 5 marketplace adds controlled vocabulary on top.
//
// print is the teacher-configurable print layer (see PrintConfig below). It
// is always present after parse (default {}), so every consumer can read
// doc.meta.print.* without an undefined check; documents stored before this
// field existed get the defaults applied on read. The defaults keep the
// Stage 11 baseline page geometry (single column, 0.5in margin, letter) and
// add the print typography Stage 11 deliberately deferred to this feature
// (11pt body, 1rem problem spacing) — so a freshly published page prints in a
// sensible default style, and the teacher tunes from there.

// PrintHeader: which labeled fill-in lines appear at the top of a printed
// sheet. Name + Date are the near-universal pair, so they default on; the
// rest default off. custom holds extra teacher-authored labels (e.g.
// "Block", "Teacher") rendered as their own fill-in lines. The header is
// print-only — it never shows on screen (the on-screen identity prompt is the
// live name field); see renderPrintHeader + the @media print rules.
export const PrintHeader = z.object({
  name: z.boolean().default(true),
                                    date: z.boolean().default(true),
                                    period: z.boolean().default(false),
                                    class: z.boolean().default(false),
                                    score: z.boolean().default(false),
                                    custom: z.array(z.string()).default([]),
});
export type PrintHeader = z.infer<typeof PrintHeader>;

// PrintConfig: the teacher's print settings for an activity. Every field is
// defaulted so PrintConfig.parse({}) yields a complete, baseline-equivalent
// config — that is what ActivityMeta.print falls back to.
//
//   paperSize      — 'letter' | 'a4'. Drives the @page size keyword. Default
//                    letter for now (NZ/A4 is a one-line flip later); emitted
//                    as a LITERAL @page rule, never a CSS var, because @page
//                    rules cannot reliably read custom properties.
//   columns        — 1..3. column-count in print; 1 is a no-op (single col).
//                    DORMANT: the author-facing control was retired when
//                    structural authored columns (the Row/Column layout
//                    primitive) landed — a multi-column row renders consistently
//                    on screen, in worksheet print, and inside a foldable, so
//                    this per-mode print setting became redundant. The field +
//                    its renderer var/CSS are kept (not deleted) so values
//                    already saved on existing activities keep printing as
//                    authored, and so the control can be re-exposed later with
//                    no schema/renderer change. New activities default to 1.
//   workSpace      — rem of blank space below each problem for hand-working.
//                    Activity-level default; a fill-in-blank block may override
//                    it per-problem via FillInBlankBlock.workSpace.
//   fontSize       — pt. Applied to .activity-container in print only.
//   problemSpacing — rem of vertical margin around each problem in print.
//   margin         — inches. The @page margin (literal, like paperSize).
//   gridLines      — activity-wide default for ruled rows. A Row with
//                    gridLines:'inherit' (the per-row default) resolves to this;
//                    'on'/'off' on a row override it. Off by default — ruled
//                    grids are opt-in.
//   printReferencePanel — whether the activity's reference panel prints as a
//                    box at the top of the worksheet. On by default; a teacher
//                    with a class set of charts can turn it off so it isn't
//                    reprinted per activity. Gates PRINT alone, and as of
//                    2026-08-23 that is true again rather than merely claimed:
//                    the panel's SCREEN surface is back (a summoned panel in
//                    the viewer), so turning this off means screen-only instead
//                    of invisible-everywhere. Between S9 Drop 4 and that slice
//                    print WAS the only surface, which made this flag a trap.
//                    Read by the viewer's print layer; not a container CSS var.
//   printDefinitionGlossary — whether inline vocabulary definitions print as a
//                    glossary appendix at the END of the worksheet. OFF by
//                    default, unlike printReferencePanel: on screen a definition
//                    is a popover a student opens on demand, and most are a
//                    short gloss that would only pad the printout. A teacher who
//                    has put a formula or a diagram in a definition turns this
//                    on so it survives on paper (definition popovers are
//                    display:none in print). Read by the renderer to decide
//                    whether to emit the appendix; not a container CSS var.
//   header         — see PrintHeader.
//
// columns/workSpace/fontSize/problemSpacing ride as --print-* CSS vars on the
// container (normal selectors can read them); paperSize/margin are emitted as
// a per-document literal @page rule. gridLines is not a container var — it is
// resolved per row at render time (see renderRow).
export const PrintConfig = z.object({
  paperSize: z.enum(['letter', 'a4']).default('letter'),
                                     columns: z.number().int().min(1).max(3).default(1),
                                     workSpace: z.number().min(0).default(0),
                                     fontSize: z.number().positive().default(11),
                                     problemSpacing: z.number().min(0).default(1),
                                     margin: z.number().min(0).default(0.5),
                                     gridLines: z.boolean().default(false),
                                     printReferencePanel: z.boolean().default(true),
                                     printDefinitionGlossary: z.boolean().default(false),
                                     header: PrintHeader.default({}),
});
export type PrintConfig = z.infer<typeof PrintConfig>;

// Typography: the activity-wide font + base body size (author-approved
// 2026-07-08). ONE font and ONE base size for the whole activity — published
// page, editor canvas, and print view all read the same config so authoring is
// WYSIWYG. Optional and additive: documents stored before this field existed
// parse unchanged (no schemaVersion bump), and the editor omits the field
// entirely while it holds the defaults so untouched documents stay
// structurally identical.
//
//   font     — an id into the renderer's FONT_REGISTRY (the CSS specifics —
//              family name, fallback stack, WOFF2 files — live renderer-side;
//              the schema only constrains the menu). 'default' = the current
//              system stack, no font download. The other four are SIL OFL
//              faces self-hosted as WOFF2 on R2 (no Google CDN dependency on
//              published pages).
//   fontSize — base BODY size in px, applied on screen via
//              --activity-font-size. Print body sizing stays owned by
//              meta.print.fontSize (pt) — the @media print rule overrides the
//              screen size, so the two never fight. Headings are em-relative
//              and scale off whichever base is in effect.
//
// Per-span font/size marks are PARKED but designed for: this activity-wide
// layer only sets CSS vars + @font-face, so a future `textStyle` mark can
// slot in additively (span-level inline styles win the cascade; the
// renderer's fontFaceCss already takes a LIST of families to embed).
export const ActivityFont = z.enum([
  'default',
  'lexend',
  'atkinson-hyperlegible',
  'andika',
  'comic-neue',
]);
export type ActivityFont = z.infer<typeof ActivityFont>;

export const Typography = z.object({
  font: ActivityFont.default('default'),
                                     fontSize: z.number().min(12).max(24).default(16),
});
export type Typography = z.infer<typeof Typography>;

export const ActivityMeta = z.object({
  title: z.string().min(1),
                                     // .min(1): course is stamped into the
                                     // activities.course column at publish
                                     // (0037, taxonomy R1) where it is `not
                                     // null` — a blank course would publish an
                                     // empty facet into the catalog. The editor
                                     // falls back to the default rather than
                                     // ever sending a blank (ActivityEditor
                                     // save(), same guard title already has).
                                     course: z.string().min(1).default('Algebra II'),
                                     unit: z.string().optional(),
                                     submissionMode: z.enum(['single', 'locked', 'free']).default('free'),
                                     activityType: z.enum(['worksheet', 'exit_ticket', 'warm_up', 'review']).default('worksheet'),
                                     answerFeedback: z.enum(['immediate', 'on_check']).default('on_check'),
                                     skills: z.array(z.string()).default([]),
                                     print: PrintConfig.default({}),
                                     typography: Typography.optional(),
                                     // Seeded per-student variables (wishlist
                                     // #6). Optional with NO default (R11): a
                                     // .default([]) would materialize on every
                                     // parse→save and trip the batch importer's
                                     // hand-edit fingerprint on every file.
                                     seedVars: SeedVars.optional(),
});
export type ActivityMeta = z.infer<typeof ActivityMeta>;

// The top-level document. Always validate user-facing input through this
// before storing. The Edge Functions parse incoming drafts with this schema
// and reject malformed documents with a 400.
// ReferencePanel: optional sticky-sidebar content students consult while
// working — formula charts, periodic tables, vocabulary lists, conversion
// tables, unit-circle diagrams, sentence-stem prompts, foreign-language
// verb tables, primary-source excerpts, maps. The blocks array uses the
// same Block schema as section content; no new block types are needed
// for the panel.
//
// Phase 1: the schema accepts the field as forward-compat; the editor
// doesn't surface it, and the renderer ignores it. Phase 2 wires up the
// authoring UI and the sidebar layout in published HTML. Field is
// optional with no default on ActivityDocument, so existing stored
// documents parse cleanly.
//
// Renderer will treat reference content as data-block-category="scaffold"
// (Phase 2+) — doesn't contribute to scoring or checkpoint behavior.
export const ReferencePanel = z.object({
  title: z.string().optional(),
                                       blocks: z.array(Block),
});
export type ReferencePanel = z.infer<typeof ReferencePanel>;

// Calculator tool: an activity-level scaffold, a sibling to the reference
// panel — a teacher-configurable on-screen calculator a student summons while
// working (like the calculator allowed on a digital SAT). It is NEVER scored,
// produces no submission, and carries no answer key; the renderer treats it as
// data-block-category="scaffold" (outside any .activity-section, so the scoring
// runtime never sees it). It travels in the wire format, configured once per
// activity, and is optional so existing stored documents parse unchanged — no
// schemaVersion bump (same forward-compat story as referencePanel/print).
//
// Restrictions are PERMISSIVE by default: an enabled-but-unconfigured
// calculator is a full tool; teachers opt INTO restrictions, never out of
// capability. Later flags (lockViewport, allowedRegressionModels,
// maxExpressions…) are added additively as graphing-track stages land — all
// optional/defaulted, so still no schemaVersion bump.
//
// `mode` is the capability ceiling. The enum carries the full contract now, but
// the default is 'scientific' because that is the only capability Stage 1
// implements — an enabled calculator does exactly what is built. The default
// may flip to 'graphing' once the board layer lands (Stage 2).
// Stage 3: which fit models the graphing calculator's data/regression panel
// offers. Permissive default (all three); an EMPTY array turns regression off
// entirely (no data panel). Only meaningful under mode 'graphing' — the
// 'scientific' ceiling already excludes the board the fits draw on.
// 'logarithmic' joined 2026-07-11 (calculator-parity batch): the kit computed
// log fits all along; the enum was the only gap. NOTE a stored doc that carries
// the explicit three-model array stays three-model (indistinguishable from a
// deliberate restriction) until the teacher touches the config — accepted at
// the design pass; the permissive default only applies when the field is absent.
export const RegressionModel = z.enum([
  'linear',
  'quadratic',
  'exponential',
  'logarithmic',
]);
export type RegressionModel = z.infer<typeof RegressionModel>;

export const CalculatorRestrictions = z.object({
  mode: z.enum(['scientific', 'graphing']).default('scientific'),
  allowTrig: z.boolean().default(true),
  allowLogExp: z.boolean().default(true),
  // Inequality rows in the graphing expression list (calculator-parity batch).
  // Additive + defaulted like the other gates — no schemaVersion bump; the kit
  // reads a missing value as permissive, so old published pages stay full-tool.
  allowInequalities: z.boolean().default(true),
  allowedRegressionModels: z
    .array(RegressionModel)
    .default(['linear', 'quadratic', 'exponential', 'logarithmic']),
  // Stage 4: cap on the graphing expression list. ABSENT = unlimited (the
  // permissive default — optional, not defaulted, so it stays out of stored
  // docs unless a teacher sets it). Graphing mode only.
  maxExpressions: z.number().int().min(1).max(50).optional(),
});
export type CalculatorRestrictions = z.infer<typeof CalculatorRestrictions>;

export const CalculatorTool = z.object({
  enabled: z.boolean().default(false),
  restrictions: CalculatorRestrictions.default({}),
});
export type CalculatorTool = z.infer<typeof CalculatorTool>;

// The explicit type + z.ZodType annotation (instead of z.infer) exists because
// the fully inferred document type outgrew tsc's declaration-serialization
// limit (TS7056) when the Block union reached 14 members. Structurally
// identical to what inference produced; nothing here loses type safety —
// the annotation is checked against the object schema.
export interface ActivityDocument {
  schemaVersion: 2;
  meta: ActivityMeta;
  sections: Section[];
  referencePanel?: ReferencePanel;
  calculator?: CalculatorTool;
}
export const ActivityDocument: z.ZodType<ActivityDocument, z.ZodTypeDef, unknown> =
  z.object({
    schemaVersion: z.literal(2),
    meta: ActivityMeta,
    sections: z.array(Section),
    referencePanel: ReferencePanel.optional(),
    calculator: CalculatorTool.optional(),
  });
