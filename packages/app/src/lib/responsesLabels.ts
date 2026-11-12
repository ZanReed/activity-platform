// =============================================================================
// responsesLabels.ts: what the Responses page calls a section and a question
// -----------------------------------------------------------------------------
// The grading queue (0034 list_grading_queue) carries ids only. Responses
// printed the section id as its group heading, so a teacher saw an upper-cased
// UUID and never the question (playtest sweep 2026-11-12). The words come from
// the version's own document, read through the page-session cache
// (versionContent.ts), so this adds no request the page doesn't already make.
//
// Keys are `${versionId}:${id}`: section and block ids never cross versions,
// but the version is the honest key for "this document's title".
// No student is passed to servedDocument: a seeded activity keeps its `{name}`
// templates, the same choice the common-wrong-answers panel makes.
// =============================================================================

import { inlineText, servedDocument } from './answerText';
import { getVersionContents } from './versionContent';

export interface QueueLabels {
    /** `${versionId}:${sectionId}` → the section's title ("Section 2" if untitled). */
    sections: Map<string, string>;
    /** `${versionId}:${blockId}` → "Q13 · Explain to Tama why…". */
    questions: Map<string, string>;
}

export function emptyQueueLabels(): QueueLabels {
    return { sections: new Map(), questions: new Map() };
}

/** Labels for one version's stored content. A document this build can't read
 *  contributes nothing; the page then shows no heading rather than an id. */
export function labelsForVersion(versionId: string, content: unknown, into: QueueLabels): void {
    let index;
    try {
        index = servedDocument(content, versionId, null).index;
    } catch {
        return;
    }
    for (const [sectionId, title] of Object.entries(index.sectionTitles)) {
        into.sections.set(`${versionId}:${sectionId}`, title);
    }
    for (const place of Object.values(index.byItem)) {
        const number = index.numbering[place.topBlockId] ?? '';
        const block = place.block as { prompt?: unknown };
        const prompt = inlineText(block.prompt);
        const label = number && prompt ? `${number} · ${prompt}` : number || prompt;
        if (label) into.questions.set(`${versionId}:${place.itemId}`, label);
    }
}

export async function fetchQueueLabels(versionIds: string[]): Promise<QueueLabels> {
    const labels = emptyQueueLabels();
    if (versionIds.length === 0) return labels;
    const contents = await getVersionContents(versionIds);
    for (const [id, version] of contents) labelsForVersion(id, version.content, labels);
    return labels;
}
