// The browser's own IANA zone, read in ONE place (review C10). Not a date
// formatter: it names a zone, it never formats a time, so it is kept out of
// lib/dates.ts (which rides on the student landing's budget) and allowed by
// name in __tests__/dates.test.ts's ratchet.

/** "Pacific/Auckland", or null when the platform can't say. */
export function browserTimeZone(): string | null {
    try {
        const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return typeof z === 'string' && z.includes('/') ? z : null;
    } catch {
        return null;
    }
}
