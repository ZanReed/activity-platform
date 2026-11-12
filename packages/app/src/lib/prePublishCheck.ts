// =============================================================================
// prePublishCheck.ts — what must be fixed before an activity can be published
// (UI review G-2; the seed of group B item 8's pre-publish check)
// -----------------------------------------------------------------------------
// The schema lets a DRAFT hold a blank with no answer (so nothing the teacher
// made is lost on save); publishing must not. This walks the saved draft and
// names each problem with the id the editor can select. Built to take more
// rules (group B): each rule adds a `kind`.
// =============================================================================

export type PublishProblem = { kind: 'empty-blank'; blankId: string };

/** Every problem in a draft, in document order. Walks the whole JSON so a
 *  blank inside any block (columns, tables, worked steps, callouts) is found. */
export function findPublishProblems(draft: unknown): PublishProblem[] {
    const problems: PublishProblem[] = [];
    const walk = (value: unknown): void => {
        if (Array.isArray(value)) {
            for (const v of value) walk(v);
            return;
        }
        if (typeof value !== 'object' || value === null) return;
        const node = value as Record<string, unknown>;
        if (node.type === 'blank' && typeof node.id === 'string' && typeof node.answer === 'string') {
            if (node.answer.trim().length === 0) problems.push({ kind: 'empty-blank', blankId: node.id });
            return;
        }
        for (const v of Object.values(node)) walk(v);
    };
    walk(draft);
    return problems;
}

export function publishProblemsSentence(problems: readonly PublishProblem[]): string {
    const n = problems.filter((p) => p.kind === 'empty-blank').length;
    return n === 1
        ? 'A blank has no answer yet, so nothing was published.'
        : `${n} blanks have no answer yet, so nothing was published.`;
}
