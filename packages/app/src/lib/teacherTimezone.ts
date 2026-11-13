// =============================================================================
// teacherTimezone.ts — the teacher's day zone (period planner PP-11, 0088)
// -----------------------------------------------------------------------------
// `users.timezone` keys every class's day (fact_class_zone): the sprint's and
// mixed practice's practice_day, the unit tracker, first tries, DoL retakes,
// due dates, Today and the planner. Unset, it is analytics_default_zone()
// (America/Chicago) — wrong all school day for an NZ teacher. Read through
// my_timezone(), written through set_my_timezone() (a definer RPC: a direct
// client UPDATE of users dies in the users_update_self recursion).
// =============================================================================

import { supabase } from './supabase';

/** RPC names, exported so test mocks derive from them (policy P2). */
export const MY_TIMEZONE_RPC = 'my_timezone';
export const SET_MY_TIMEZONE_RPC = 'set_my_timezone';

export interface MyTimezone {
    zone: string;
    /** False while the teacher still runs on the default. */
    isSet: boolean;
}

/** "Pacific/Auckland" → "Auckland"; "America/Argentina/Buenos_Aires" → "Buenos Aires". */
export function zoneCity(zone: string): string {
    const last = zone.split('/').pop() ?? zone;
    return last.replace(/_/g, ' ');
}

/** The browser's own zone, or null when the platform can't say. */
export function browserZone(): string | null {
    try {
        const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return typeof z === 'string' && z.includes('/') ? z : null;
    } catch {
        return null;
    }
}

/** Every IANA zone the browser knows, sorted, always including `current`. */
export function zoneOptions(current: string): string[] {
    let zones: string[] = [];
    try {
        const intl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
        zones = intl.supportedValuesOf?.('timeZone') ?? [];
    } catch {
        zones = [];
    }
    return [...new Set([...zones, current])].sort();
}

/**
 * The first-visit offer (PP-11): only when the teacher has never set a zone
 * AND the browser's zone differs from the one in force. Never silent: it is a
 * question with a button, not a write.
 */
export function offerZone(mine: MyTimezone, browser: string | null): string | null {
    if (mine.isSet || browser === null || browser === mine.zone) return null;
    return browser;
}

function parse(data: unknown): MyTimezone {
    const d = (data ?? {}) as { zone?: unknown; is_set?: unknown };
    if (typeof d.zone !== 'string') throw new Error('Unexpected timezone reply');
    return { zone: d.zone, isSet: d.is_set === true };
}

export async function fetchMyTimezone(): Promise<MyTimezone> {
    const { data, error } = await supabase.rpc(MY_TIMEZONE_RPC);
    if (error) throw new Error(error.message);
    return parse(data);
}

export async function saveMyTimezone(zone: string): Promise<MyTimezone> {
    const { data, error } = await supabase.rpc(SET_MY_TIMEZONE_RPC, { p_zone: zone });
    if (error) {
        throw new Error(
            error.message === 'bad_zone' ? `“${zone}” isn’t a timezone the server knows.` : error.message,
        );
    }
    return parse(data);
}
