// The playtest bar's local-URL check is a browser-side copy of the seed
// script's (the script imports node:child_process, so the app cannot import
// it). P2: the copy is not trusted — both answer one case table here, so a
// change to either that the other does not share goes red.
import { describe, expect, it } from 'vitest';
import { isLocalSupabaseUrl } from '../dev/mountPlaytest';
// @ts-expect-error — a plain .mjs node script with no type declarations
import { isLocalUrl } from '../../../../scripts/playtest.mjs';
import { LOCAL_SUPABASE_URL } from '../../e2e/integration/contract';

const CASES: Array<[string | undefined, boolean]> = [
    [LOCAL_SUPABASE_URL, true],
    ['http://localhost:54321', true],
    ['http://[::1]:54321', true],
    ['https://abcdefghijkl.supabase.co', false],
    ['http://127.0.0.1.evil.example:54321', false],
    ['http://localhost.evil.example', false],
    ['', false],
    ['not a url', false],
    [undefined, false],
];

describe('playtest local-URL refusal', () => {
    it.each(CASES)('%s → %s in the bar AND the seed script', (url, expected) => {
        expect(isLocalSupabaseUrl(url)).toBe(expected);
        expect((isLocalUrl as (u: unknown) => boolean)(url)).toBe(expected);
    });
});
