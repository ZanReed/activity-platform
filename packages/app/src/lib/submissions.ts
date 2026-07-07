// =============================================================================
// submissions.ts — pure helpers for the submissions dashboard (Stage 16)
// -----------------------------------------------------------------------------
// Two jobs, both pure and unit-tested:
//
//   1. groupSubmissions() — collapse a flat list of submission rows into one
//      group per student (Phase 1 link-share: keyed by exact display_name).
//      Each group exposes the latest attempt (the dashboard's headline) and
//      the best-scoring attempt (shown secondarily), plus the full attempt
//      list for the all-attempts view.
//
//   2. buildActivityIndex() — walk an ActivityDocument and produce lookup maps
//      from blank.id and section.id to human-readable info, so the drill-down
//      can show "Problem 3: simplify ____" and the canonical answer next to a
//      student's response instead of a raw UUID. Best-effort: a submission may
//      reference a blank that a later document edit removed; such blanks simply
//      aren't in the map and the UI labels them as no-longer-present.
//
// Grouping by display_name accepts that "Bob S" and "Bobby Smith" become two
// students — roster-canonical identity is a Phase 3 concern. opaque_token is
// null until Phase 3; when it exists it takes precedence as the grouping key.
// =============================================================================

import type { ActivityDocument } from '@activity/schema';

// ---- Raw row shape (mirrors the columns the dashboard selects) --------------

export interface SubmissionRow {
    id: string;
    display_name: string | null;
    opaque_token: string | null;
    responses: unknown; // raw jsonb; migrate on read at the consumer
    score: number | null; // 0..1, or null if the runtime couldn't score
    submitted_at: string; // ISO timestamp
    attempt_number: number;
    activity_version_id: string | null; // version answered against; null for legacy rows
}

// ---- Grouping ---------------------------------------------------------------

export interface StudentGroup {
    key: string; // stable grouping key (token, else display_name, else row id)
    label: string; // what to show as the student's name
    attempts: SubmissionRow[]; // ascending by attempt_number
    latest: SubmissionRow; // highest attempt_number (tie-break: latest submitted_at)
    best: SubmissionRow; // highest score (null score sorts lowest)
    count: number;
}

// Score for comparison: treat a null (unscored) submission as below any real
// score so it never wins "best", but still picks something deterministic.
function scoreValue(row: SubmissionRow): number {
    return row.score ?? -1;
}

// Is `a` a later attempt than `b`? Primary: attempt_number. Tie-break:
// submitted_at, so two rows that somehow share an attempt number still order
// deterministically.
function isLaterAttempt(a: SubmissionRow, b: SubmissionRow): boolean {
    if (a.attempt_number !== b.attempt_number) {
        return a.attempt_number > b.attempt_number;
    }
    return a.submitted_at > b.submitted_at;
}

function isBetterScore(a: SubmissionRow, b: SubmissionRow): boolean {
    const sa = scoreValue(a);
    const sb = scoreValue(b);
    if (sa !== sb) return sa > sb;
    // Equal scores: prefer the later attempt as the representative "best".
    return isLaterAttempt(a, b);
}

// Collapse rows into per-student groups. Groups are returned sorted by their
// latest attempt's submitted_at, descending — the most recently active student
// first, which is what a teacher scanning a fresh dashboard wants.
export function groupSubmissions(rows: SubmissionRow[]): StudentGroup[] {
    const byKey = new Map<string, SubmissionRow[]>();

    for (const row of rows) {
        const key = row.opaque_token ?? row.display_name ?? row.id;
        const bucket = byKey.get(key);
        if (bucket) bucket.push(row);
        else byKey.set(key, [row]);
    }

    const groups: StudentGroup[] = [];
    for (const [key, bucket] of byKey) {
        const attempts = [...bucket].sort(
            (a, b) => a.attempt_number - b.attempt_number,
        );
        let latest = bucket[0]!;
        let best = bucket[0]!;
        for (const row of bucket) {
            if (isLaterAttempt(row, latest)) latest = row;
            if (isBetterScore(row, best)) best = row;
        }
        const first = bucket[0]!;
        const label = first.display_name ?? first.opaque_token ?? 'Unnamed student';
        groups.push({ key, label, attempts, latest, best, count: bucket.length });
    }

    groups.sort((a, b) => {
        if (a.latest.submitted_at !== b.latest.submitted_at) {
            return a.latest.submitted_at > b.latest.submitted_at ? -1 : 1;
        }
        return a.label.localeCompare(b.label);
    });

    return groups;
}

// ---- Activity index (blank.id / section.id -> readable info) ----------------

export interface BlankInfo {
    blankId: string;
    problemId: string;
    problemNumber: number | null; // FillInBlankBlock.number, if authored
    problemPrompt: string; // reconstructed prompt with ____ where blanks sit
    canonicalAnswer: string; // primary answer + acceptable alternates
    blankOrder: number; // 0-based position among blanks in its problem
    // When this blank is part of an order-independent group (2+ adjacent
    // interchangeable blanks), the canonical answers of every group member, in
    // document order — so the dashboard can show "2 or 3 (any order)" instead of
    // this slot's answer alone (which may differ from the student's correct
    // entry). null when the blank is ungrouped.
    groupAnswers: string[] | null;
    sectionId: string;
    sectionTitle: string | null;
}

export interface SectionInfo {
    sectionId: string;
    title: string | null;
    order: number; // 1-based position in the document
}

// One interactive_graph block, for reading its submission back (Stage 5).
export interface GraphInfo {
    blockId: string;
    problemNumber: number | null;
    problemPrompt: string; // reconstructed from the block's prompt inline nodes
    interactionType: string; // 'plot_point' | 'plot_function'
    // Human-readable answer key next to what the student plotted — a point list
    // "(3, 4)" for plot_point, "y = 2x + 3" for a linear plot_function.
    answerSummary: string;
    sectionId: string;
    sectionTitle: string | null;
}

// "y = 2x + 3" / "y = -x" from slope + intercept.
function formatLinear(slope: number, intercept: number): string {
    const m = Math.round(slope * 100) / 100;
    const b = Math.round(intercept * 100) / 100;
    const bPart = b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${Math.abs(b)}`;
    return `y = ${m}x${bPart}`;
}

export interface ActivityIndex {
    blanks: Map<string, BlankInfo>;
    graphs: Map<string, GraphInfo>;
    sections: Map<string, SectionInfo>;
}

// Render a fill-in-blank block's inline content to a plain-text prompt. Blanks
// become "____" so the teacher reads the problem the way the student saw it;
// inline math is shown as its LaTeX source (no KaTeX in a text summary).
function reconstructPrompt(
    content: ReadonlyArray<{ type: string; [k: string]: unknown }>,
): string {
    const parts: string[] = [];
    for (const node of content) {
        if (node.type === 'text' && typeof node.text === 'string') {
            parts.push(node.text);
        } else if (node.type === 'math_inline' && typeof node.latex === 'string') {
            parts.push(node.latex);
        } else if (node.type === 'hard_break') {
            parts.push(' ');
        } else if (node.type === 'blank') {
            parts.push('____');
        }
    }
    return parts.join('').replace(/\s+/g, ' ').trim();
}

function canonicalAnswer(answer: string, acceptable: string[]): string {
    return [answer, ...acceptable].filter((s) => s.length > 0).join(' / ');
}

// Walk the document once, producing the two lookup maps. Only fill_in_blank
// blocks carry blanks in Phase 1, so other block types are skipped.
export function buildActivityIndex(doc: ActivityDocument): ActivityIndex {
    const blanks = new Map<string, BlankInfo>();
    const graphs = new Map<string, GraphInfo>();
    const sections = new Map<string, SectionInfo>();

    doc.sections.forEach((section, idx) => {
        sections.set(section.id, {
            sectionId: section.id,
            title: section.title ?? null,
            order: idx + 1,
        });

        for (const block of section.blocks) {
            if (block.type === 'interactive_graph') {
                let answerSummary = '—';
                if (block.interaction.type === 'plot_point') {
                    answerSummary = block.interaction.correctPoints
                        .map((p) => `(${p[0]}, ${p[1]})`)
                        .join(', ');
                } else if (
                    block.interaction.type === 'plot_function' &&
                    block.interaction.model.family === 'linear'
                ) {
                    answerSummary = formatLinear(
                        block.interaction.model.slope,
                        block.interaction.model.intercept,
                    );
                } else if (block.interaction.type === 'shade_region') {
                    const verts = block.interaction.correctVertices;
                    answerSummary = `region (${verts.length} vertices): ${verts
                        .map((p) => `(${p[0]}, ${p[1]})`)
                        .join(', ')}`;
                }
                graphs.set(block.id, {
                    blockId: block.id,
                    problemNumber: block.number ?? null,
                    problemPrompt: reconstructPrompt(block.prompt),
                    interactionType: block.interaction.type,
                    answerSummary,
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
                continue;
            }
            if (block.type !== 'fill_in_blank') continue;
            const prompt = reconstructPrompt(block.content);

            // Collect the block's blanks in document order (narrowed to
            // BlankToken via the discriminant).
            const blockBlanks = [];
            for (const node of block.content) {
                if (node.type === 'blank') blockBlanks.push(node);
            }

            // Order-independent grouping: a maximal run of adjacent blanks each
            // flagged interchangeableWithPrevious shares the full set of member
            // canonical answers (mirrors the renderer's run detection). Lone
            // blanks get null.
            const groupAnswersByIndex: (string[] | null)[] = new Array(
                blockBlanks.length,
            ).fill(null);
            let i = 0;
            while (i < blockBlanks.length) {
                const start = i;
                i++;
                while (
                    i < blockBlanks.length &&
                    blockBlanks[i]?.interchangeableWithPrevious
                ) {
                    i++;
                }
                if (i - start >= 2) {
                    const members = blockBlanks
                        .slice(start, i)
                        .map((b) => canonicalAnswer(b.answer, b.acceptableAnswers));
                    for (let k = start; k < i; k++) {
                        groupAnswersByIndex[k] = members;
                    }
                }
            }

            blockBlanks.forEach((node, blankOrder) => {
                blanks.set(node.id, {
                    blankId: node.id,
                    problemId: block.id,
                    problemNumber: block.number ?? null,
                    problemPrompt: prompt,
                    canonicalAnswer: canonicalAnswer(
                        node.answer,
                        node.acceptableAnswers,
                    ),
                    blankOrder,
                    groupAnswers: groupAnswersByIndex[blankOrder] ?? null,
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
            });
        }
    });

    return { blanks, graphs, sections };
}

// ---- Score formatting -------------------------------------------------------

// 0..1 score → "85%". Null (unscored) → "—".
export function formatScore(score: number | null): string {
    if (score === null) return '—';
    // Snap to the stored 4-decimal precision before scaling so binary-float
    // noise (e.g. 0.575 * 100 === 57.4999…) doesn't drop a half-percent.
    const percent = Math.round(score * 10000) / 100;
    return `${Math.round(percent)}%`;
}
