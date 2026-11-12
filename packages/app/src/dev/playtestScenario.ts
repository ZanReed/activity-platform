// The scenario file format for record/replay (see playtestTraffic.ts). Kept
// DOM-free so the dev-server plugin (vite.playtest.ts, node tsconfig) can share
// it with the browser half.

export interface RecordedEntry {
    /** The signed-in person's email, from the bearer JWT; 'anon' without one. */
    who: string;
    method: string;
    /** Path + query, origin stripped (origins differ between record and replay). */
    path: string;
    body: string | null;
    status: number;
    headers: Record<string, string>;
    response: string;
}

export interface ScenarioPerson {
    email: string;
    /** The supabase-js session object as stored in localStorage. */
    session: Record<string, unknown>;
}

export interface Scenario {
    name: string;
    recordedAt: string;
    people: ScenarioPerson[];
    entries: RecordedEntry[];
}

export const SCENARIO_NAME_RE = /^[a-z0-9][a-z0-9-]{0,59}$/;
