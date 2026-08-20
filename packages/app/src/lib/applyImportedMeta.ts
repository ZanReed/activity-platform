// =============================================================================
// applyImportedMeta.ts — the ```meta fence's NEVER-CLOBBER merge rule (D16)
// -----------------------------------------------------------------------------
// Ruling D16, taxonomy arc Drop 2. The dominant catalogue workflow is
// "new activity → paste → done", where the activity is blank and every possible
// merge rule behaves identically. This function exists for the OTHER case:
// pasting one more section into a finished activity, where the markdown carries
// a meta fence the AI emitted by habit. There, an overwrite would silently
// rewrite metadata the author set by hand.
//
// So: a key lands only where the activity has no value yet, and anything
// skipped comes back as a warning — the author is never silently ignored, and
// never silently overruled. This mirrors the shipped ```reference behavior (its
// title fills an untitled panel and never clobbers a teacher's), so the
// importer stays one mental model rather than two.
//
// TAGS ARE THE EXCEPTION and union in: adding a tag cannot destroy one, so
// there is nothing to protect against. Same reasoning as reference blocks,
// which append rather than replace.
//
// "Has no value yet" per field:
//   unit  — absent (it is genuinely optional)
//   role  — null (unclassified is a real state, not a missing one)
//   course— still the untouched schema default; course always HAS a value, so
//           an absence test would mean the fence could never set it
//   title — still the create-time "Untitled activity" placeholder, or blank
//   the four SETTINGS (submission/revision/type/feedback) — still the schema
//           default, same reasoning as course
//   calculator — undefined (no calculator configured)
//   work space — still the schema default 0, same reasoning as course/settings.
//                NESTED (print.workSpace), so it is the one field here that
//                does not go through applySetting.
// =============================================================================

import {
    createCalculatorTool,
    type ActivityMeta,
    type CalculatorTool,
} from '@activity/schema';
import type { ImportedMeta } from './markdownToTiptap';
import { normalizeTags } from './normalizeTags';
import { describeWorkSpace } from './workSpaceUnits';
import type { PedagogicalRole } from './pedagogicalRole';

/** The schema default for `course`. A row still holding it counts as unset. */
export const DEFAULT_COURSE = 'Algebra II';

/**
 * The placeholder every activity is created with (Activities.tsx instant-create
 * + createEmptyDocument). A title still equal to it means the author has not
 * named this activity, so an imported title may fill it.
 */
export const DEFAULT_TITLE = 'Untitled activity';

export interface ImportMetaTarget {
    meta: ActivityMeta;
    tags: string[];
    pedagogicalRole: PedagogicalRole | null;
    /** Document-level, not part of ActivityMeta. undefined = no calculator. */
    calculator: CalculatorTool | undefined;
}

export interface ImportMetaOutcome {
    meta: ActivityMeta;
    tags: string[];
    pedagogicalRole: PedagogicalRole | null;
    calculator: CalculatorTool | undefined;
    /** Human-readable notes for the dialog's existing warnings list. */
    warnings: string[];
    /** True when anything actually changed — lets callers skip a no-op setState. */
    changed: boolean;
}

export function applyImportedMeta(
    imported: ImportedMeta,
    target: ImportMetaTarget,
): ImportMetaOutcome {
    const warnings: string[] = [];
    let meta = target.meta;
    let pedagogicalRole = target.pedagogicalRole;
    let calculator = target.calculator;
    let changed = false;

    /**
     * The settings share one rule: a schema DEFAULT means "the author never
     * touched this", so the fence may fill it; any other value is a deliberate
     * choice and is kept, with the skip reported. Identical in shape to the
     * course/DEFAULT_COURSE test above — these fields always HAVE a value, so
     * an absence test could never let the fence set them.
     */
    const applySetting = <K extends 'submissionMode' | 'revisionMode' | 'activityType' | 'answerFeedback'>(
        key: K,
        incoming: ActivityMeta[K] | undefined,
        schemaDefault: ActivityMeta[K],
        label: string,
    ): void => {
        if (incoming === undefined) return;
        const current = meta[key];
        if (current === schemaDefault) {
            meta = { ...meta, [key]: incoming };
            changed = true;
        } else if (current !== incoming) {
            warnings.push(
                `Meta: kept the ${label} you already set (“${String(current)}”) — the paste said “${String(incoming)}”.`,
            );
        }
    };

    // Title first — it is the field a catalogue import most needs, and the
    // one whose absence costs a manual rename per activity. "Unset" here means
    // still holding the create-time placeholder, or blank.
    if (imported.title !== undefined) {
        const current = target.meta.title.trim();
        if (current === '' || current === DEFAULT_TITLE) {
            meta = { ...meta, title: imported.title };
            changed = true;
        } else if (current !== imported.title) {
            warnings.push(
                `Meta: kept the name you already gave this activity (“${current}”) — the paste said “${imported.title}”.`,
            );
        }
    }

    if (imported.course !== undefined) {
        if (target.meta.course === DEFAULT_COURSE) {
            meta = { ...meta, course: imported.course };
            changed = true;
        } else if (target.meta.course !== imported.course) {
            warnings.push(
                `Meta: kept the course you already set (“${target.meta.course}”) — the paste said “${imported.course}”.`,
            );
        }
    }

    if (imported.unit !== undefined) {
        if (target.meta.unit === undefined || target.meta.unit === '') {
            meta = { ...meta, unit: imported.unit };
            changed = true;
        } else if (target.meta.unit !== imported.unit) {
            warnings.push(
                `Meta: kept the unit you already set (“${target.meta.unit}”) — the paste said “${imported.unit}”.`,
            );
        }
    }

    if (imported.pedagogicalRole !== undefined) {
        if (target.pedagogicalRole === null) {
            pedagogicalRole = imported.pedagogicalRole;
            changed = true;
        } else if (target.pedagogicalRole !== imported.pedagogicalRole) {
            warnings.push(
                `Meta: kept the Bank role you already set (“${target.pedagogicalRole}”) — the paste said “${imported.pedagogicalRole}”.`,
            );
        }
    }

    // WORK SPACE — the first NESTED knob the fence reaches (print.workSpace),
    // so it cannot use applySetting, which patches flat ActivityMeta keys.
    // Same never-clobber TEST as the flat settings though: the schema default
    // (0) means "the author never touched this". A teacher who deliberately set
    // 0 is indistinguishable from one who never looked — the identical tradeoff
    // course and the four settings already make, and the reason this file
    // explains it once at the top rather than per field.
    if (imported.workSpace !== undefined) {
        const current = meta.print.workSpace;
        if (current === 0) {
            meta = {
                ...meta,
                print: { ...meta.print, workSpace: imported.workSpace },
            };
            changed = true;
        } else if (current !== imported.workSpace) {
            warnings.push(
                `Meta: kept the work space you already set (${describeWorkSpace(current)}) — ` +
                    `the paste said ${describeWorkSpace(imported.workSpace)}.`,
            );
        }
    }

    applySetting('submissionMode', imported.submissionMode, 'free', 'submission mode');
    applySetting('revisionMode', imported.revisionMode, 'free', 'revision mode');
    applySetting('activityType', imported.activityType, 'worksheet', 'activity type');
    applySetting('answerFeedback', imported.answerFeedback, 'on_check', 'answer feedback');

    // Calculator: undefined IS the unset state (no calculator), so 'off' on an
    // untouched activity agrees with reality and changes nothing. Built from
    // the schema factory so restriction defaults are never re-listed here.
    const wantedCalculator = imported.calculatorMode;
    if (wantedCalculator !== undefined) {
        if (calculator === undefined) {
            // 'off' on an activity with no calculator agrees with reality —
            // nothing to change, nothing worth saying.
            if (wantedCalculator !== 'off') {
                const base = createCalculatorTool();
                calculator = {
                    ...base,
                    restrictions: {
                        ...base.restrictions,
                        mode: wantedCalculator,
                    },
                };
                changed = true;
            }
        } else {
            const currentMode = calculator.restrictions.mode;
            if (wantedCalculator === 'off' || currentMode !== wantedCalculator) {
                warnings.push(
                    `Meta: kept the calculator you already set (“${currentMode}”) — the paste said “${wantedCalculator}”.`,
                );
            }
        }
    }

    // Union, always — additive and non-destructive, so there is nothing to
    // protect and no warning to raise.
    let tags = target.tags;
    if (imported.tags && imported.tags.length > 0) {
        const merged = normalizeTags([...target.tags, ...imported.tags]);
        if (merged.length !== target.tags.length) {
            tags = merged;
            changed = true;
        }
    }

    return { meta, tags, pedagogicalRole, calculator, warnings, changed };
}
