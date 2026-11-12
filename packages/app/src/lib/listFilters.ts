// =============================================================================
// listFilters.ts — the filter bar on My activities and the Bank
// (docs/design/activity-list-filters.md, F-1 … F-6, author 2026-11-13)
// -----------------------------------------------------------------------------
// Pure helpers: topics grouped by the unit they appear in (F-1), a search that
// matches titles AND topic names (F-3), the activity status menu (F-4), and
// the URL keys every filter lives under so Back, refresh and a shared link
// keep them (F-6).
// =============================================================================

export interface TopicGroup {
    /** The unit the topics appear in; null = "No unit" (always last). */
    unit: string | null;
    topics: { tag: string; count: number }[];
}

/**
 * Topics (tags) grouped under each unit they appear in, units in the order
 * the items first show them, topics most-used first then A–Z. A topic used in
 * several units is listed under each, with that unit's count.
 */
export function topicGroups<T>(
    items: readonly T[],
    tagsOf: (item: T) => readonly string[] | null | undefined,
    unitOf: (item: T) => string | null,
): TopicGroup[] {
    const byUnit = new Map<string | null, Map<string, number>>();
    for (const item of items) {
        const tags = tagsOf(item) ?? [];
        if (tags.length === 0) continue;
        const unit = unitOf(item);
        const counts = byUnit.get(unit) ?? new Map<string, number>();
        byUnit.set(unit, counts);
        for (const tag of new Set(tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    const groups = [...byUnit.entries()].map(([unit, counts]) => ({
        unit,
        topics: [...counts.entries()]
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
    }));
    return [...groups.filter((g) => g.unit !== null), ...groups.filter((g) => g.unit === null)];
}

/** How many distinct topics are in use (the button's count). */
export function topicCount(groups: readonly TopicGroup[]): number {
    return new Set(groups.flatMap((g) => g.topics.map((t) => t.tag))).size;
}

/** F-3: the search matches the title or any topic, case-insensitively. */
export function matchesQuery(title: string, tags: readonly string[] | null | undefined, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    if (title.toLowerCase().includes(q)) return true;
    return (tags ?? []).some((t) => t.toLowerCase().includes(q));
}

/** F-4: the status menu on My activities. */
export type StatusFilter = 'all' | 'drafts' | 'published' | 'changed';
export const STATUS_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All activities' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'published', label: 'Published' },
    { value: 'changed', label: 'Changed since publish' },
];

export function parseStatus(raw: string | null): StatusFilter {
    return STATUS_OPTIONS.some((o) => o.value === raw) ? (raw as StatusFilter) : 'all';
}

/** F-6: the query-string keys. One place, so the two pages agree. */
export const FILTER_KEYS = {
    query: 'q',
    topic: 'topic',
    status: 'status',
    course: 'course',
    author: 'author',
    type: 'type',
    guide: 'guide',
} as const;
