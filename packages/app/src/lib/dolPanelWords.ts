// =============================================================================
// dolPanelWords.ts — the section break's DoL panel, in words and numbers
// (GUI amendment 2026-11-12, D-3…D-6; dol-retake.md)
// -----------------------------------------------------------------------------
// The panel (editor/nodeViews/DolPanel.tsx) checks with dolRules.ts, the same
// functions the importer uses, over the section exactly as a save would store
// it (serialize's own tiptapToActivity on that section's slice). This file
// holds the slice, the read and the wording, so each is testable without React.
// =============================================================================

import type { JSONContent } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { ActivityMeta, Section } from '@activity/schema';
import type { BankValueTable } from '@activity/schema/bank-seed';
import { tiptapToActivity } from './serialize';
import { collectSeedRefs, dolItems, dolShapeProblems, stampDolRetake, type DolShapeProblem } from './dolRules';

/** The break at `pos` and its section's rows, as a doc of their own. */
export function dolSectionSlice(doc: PMNode, pos: number): JSONContent {
    const content: JSONContent[] = [];
    let inside = false;
    let done = false;
    doc.forEach((child, offset) => {
        if (done) return;
        if (offset === pos) {
            inside = true;
            content.push(child.toJSON() as JSONContent);
            return;
        }
        if (!inside) return;
        if (child.type.name === 'sectionBreak') {
            done = true;
            return;
        }
        content.push(child.toJSON() as JSONContent);
    });
    return { type: 'doc', content };
}

export interface DolPanelRead {
    /** Gradable items in the section, in order (DL-2). */
    items: number;
    /** What a save would store for `retake` (stampDolRetake). */
    retake: boolean;
    /** Every seed name the section's content references. */
    refs: string[];
}

/** The section as a save stores it. A leftover importer marker
 *  ({ pending: true }) is read as a DoL with no skills, as serialize does. */
export function readDolSection(slice: JSONContent): DolPanelRead {
    const content = (slice.content ?? []).map((node, i) => {
        if (i !== 0 || node.type !== 'sectionBreak') return node;
        const dol = (node.attrs?.dol ?? {}) as { skills?: unknown };
        const skills = Array.isArray(dol.skills) ? dol.skills : [];
        return { ...node, attrs: { ...node.attrs, dol: { retake: false, ...dol, skills } } };
    });
    const doc = tiptapToActivity({ type: 'doc', content }, { title: '' } as unknown as ActivityMeta);
    const section: Section | undefined = doc.sections[0];
    if (!section) return { items: 0, retake: false, refs: [] };
    stampDolRetake([section]);
    return {
        items: dolItems(section).length,
        retake: section.dol?.retake ?? false,
        refs: [...collectSeedRefs(section.rows)],
    };
}

export function shapeText(p: DolShapeProblem): string {
    switch (p.code) {
        case 'no-skills':
            return 'Pick the first item’s skill. The activity can’t be published until the DoL has one.';
        case 'first-skill':
            return `The first skill is “${p.first}”, but the activity’s skill is “${p.primary}”.`;
        case 'item-count':
            return `The section has ${p.items} item${p.items === 1 ? '' : 's'} to grade and ${p.skills} skill${
                p.skills === 1 ? '' : 's'
            }: one skill per item, in order. The first item decides the pass.`;
    }
}

export function activityVarText(names: readonly string[]): string {
    const list = names.map((n) => `{${n}}`).join(', ');
    return `${list} ${names.length === 1 ? 'is a seeded variable' : 'are seeded variables'} of the whole activity. Inside the DoL ${
        names.length === 1 ? 'it gets' : 'they get'
    } no value, so students would see the braces and the answer can't be marked. Use fixed numbers here, or move the question out of the DoL.`;
}

export function shapeTexts(skills: readonly string[], items: number): string[] {
    return dolShapeProblems(skills, items).map(shapeText);
}

/** How many different sets of numbers the DoL can draw: one row per group. */
export function formCount(tables: readonly BankValueTable[]): number {
    return tables.reduce((n, t) => n * t.rows.length, 1);
}

export function attemptsText(tables: readonly BankValueTable[] | undefined, retake: boolean): string {
    if (!tables) {
        return 'One attempt, no retake: this DoL has no seeded numbers, so a second attempt would ask the same questions. A DoL with its own numbers is written in its activity file for now.';
    }
    const forms = formCount(tables);
    const numbers = `Its numbers come from its file: ${forms} version${forms === 1 ? '' : 's'}.`;
    return retake
        ? `${numbers} Two attempts: a student who misses it gets a retake with different numbers.`
        : `${numbers} One attempt: the first item doesn’t use numbers that change, so a retake would ask the same thing.`;
}

export function passNote(isCopy: boolean, primaryLabel: string | null): string {
    if (!isCopy) {
        return 'This DoL won’t record a pass: only catalogue activities and their Bank copies do.';
    }
    const skill = primaryLabel ? `“${primaryLabel}”` : 'its first skill';
    return `A pass on this DoL counts toward ${skill} on the unit tracker, if this activity is that skill’s final part.`;
}
