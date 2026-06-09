// =============================================================================
// document.ts — Top-level ActivityDocument and Section schemas
// -----------------------------------------------------------------------------
// ActivityDocument is what gets stored in activities.draft_content and
// activity_versions.content. The shape lives in this package as the single
// source of truth — the renderer parses it, the editor produces it via the
// serialize layer, the database stores it as jsonb.
//
// schemaVersion is the migration anchor. When a future schema needs a
// non-trivial migration (e.g., changing how marks are represented), bump
// the version and write a migrate(N -> N+1) function. Old versions in
// activity_versions stay at their original schemaVersion forever; migrations
// happen on read, never by mutating stored versions.
// =============================================================================

import { z } from 'zod';
import { Block } from './blocks/index.js';

// Section: a collection of blocks with an optional title. Sections are
// organizational only — they don't constrain content or layout. Phase 2+
// may add per-section tinting (color background) but Phase 1 is plain.
//
// isCheckpoint marks this section as having a "Check this section" button at
// its bottom in the published HTML. Only meaningful when the activity's
// submissionMode is 'locked' or 'free' (ignored in 'single' mode — no
// checkpoint buttons render anywhere).
export const Section = z.object({
  id: z.string().uuid(),
                                title: z.string().optional(),
                                isCheckpoint: z.boolean().default(false),
                                blocks: z.array(Block),
});
export type Section = z.infer<typeof Section>;

// Meta: the activity's title, course, unit, etc. Not used in rendering of
// the body — drives the published HTML's <title> and header banner.
//
// submissionMode controls the student-facing flow:
//   'single' — one submit at the end, no checkpoints (the original Phase 1 model)
//   'locked' — per-section checkpoints; inputs freeze after each section is checked
//   'free'   — per-section checkpoints; student can revise any checked section freely
//
// revisionMode controls post-submission behavior:
//   'free'   — after final submit, student can revise and resubmit (new attempt row)
//   'locked' — final submit is final; no resubmissions
// revisionMode is ignored when submissionMode === 'single'.
//
// gradingMode controls who scores the activity:
//   'auto'   — Phase 1 default. Runtime computes scores client-side from
//              answer keys baked into the published HTML.
//   'manual' — Phase 2.6+. No auto-scoring; submissions land in the
//              teacher dashboard pending rubric application.
//   'mixed'  — Phase 2.6+. Some blocks auto-graded, some manually graded
//              (e.g., 5 MC questions + 1 essay). Final score combines both.
// Inert in Phase 1 — no manual-graded block types exist yet, so the
// runtime treats 'manual'/'mixed' the same as 'auto' until Phase 2.6
// lands per-block grading metadata. Field exists now so existing stored
// documents parse cleanly when those block types arrive.
//
// activityType drives presentation: an exit_ticket renders as a single-page
// focused layout; a worksheet renders with full section navigation; etc.
//
// answerFeedback controls WHEN a blank's correct/incorrect signal (the
// green/red border + aria-invalid + targeted mistake feedback) becomes
// visible to the student:
//   'immediate' — the blank self-checks on blur, so the student sees
//                 correct/incorrect as soon as they leave the field. A
//                 self-check practice experience.
//   'on_check'  — correctness is hidden until the student checks the section
//                 (locked/free) or submits (single). An assessment-style
//                 experience that doesn't leak answers before the gate.
// Orthogonal to submissionMode — any checkpoint behavior can pair with
// either feedback timing (the same reason revisionMode is its own field).
// Default 'on_check': the checkpoint model implies "answer, then check",
// and leaking correctness on blur undercut that. NOTE the runtime defaults a
// MISSING answerFeedback (activities published before this field existed) to
// 'immediate', preserving their original behavior — the schema default and
// the runtime back-compat fallback differ on purpose.
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
//   workSpace      — rem of blank space below each problem for hand-working.
//                    Activity-level default; a fill-in-blank block may override
//                    it per-problem via FillInBlankBlock.workSpace.
//   fontSize       — pt. Applied to .activity-container in print only.
//   problemSpacing — rem of vertical margin around each problem in print.
//   margin         — inches. The @page margin (literal, like paperSize).
//   header         — see PrintHeader.
//
// columns/workSpace/fontSize/problemSpacing ride as --print-* CSS vars on the
// container (normal selectors can read them); paperSize/margin are emitted as
// a per-document literal @page rule.
export const PrintConfig = z.object({
  paperSize: z.enum(['letter', 'a4']).default('letter'),
                                     columns: z.number().int().min(1).max(3).default(1),
                                     workSpace: z.number().min(0).default(0),
                                     fontSize: z.number().positive().default(11),
                                     problemSpacing: z.number().min(0).default(1),
                                     margin: z.number().min(0).default(0.5),
                                     header: PrintHeader.default({}),
});
export type PrintConfig = z.infer<typeof PrintConfig>;

export const ActivityMeta = z.object({
  title: z.string().min(1),
                                     course: z.string().default('Algebra II'),
                                     unit: z.string().optional(),
                                     submissionMode: z.enum(['single', 'locked', 'free']).default('free'),
                                     revisionMode: z.enum(['free', 'locked']).default('free'),
                                     gradingMode: z.enum(['auto', 'manual', 'mixed']).default('auto'),
                                     activityType: z.enum(['worksheet', 'exit_ticket', 'warm_up', 'review']).default('worksheet'),
                                     answerFeedback: z.enum(['immediate', 'on_check']).default('on_check'),
                                     skills: z.array(z.string()).default([]),
                                     print: PrintConfig.default({}),
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
export const ActivityDocument = z.object({
  schemaVersion: z.literal(1),
                                         meta: ActivityMeta,
                                         sections: z.array(Section),
                                         referencePanel: ReferencePanel.optional(),
});
export type ActivityDocument = z.infer<typeof ActivityDocument>;
