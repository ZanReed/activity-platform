// =============================================================================
// mountPlaytest — boots the "Playtest as" bar for `vite --mode playtest`
// -----------------------------------------------------------------------------
// Reached ONLY through main.tsx's `import.meta.env.DEV && MODE === 'playtest'`
// dynamic import, which a production build folds to `false` and drops along
// with this whole module graph (guarded by scripts/tests/playtest-guards.test.mjs,
// which builds nothing itself but asserts the gate's exact shape and that no
// production chunk names the bar).
//
// The local backend refuses to act unless the app's Supabase URL is the local
// stack: a mis-set env must never turn this bar into a sign-in form for live.
// =============================================================================

import { createRoot } from 'react-dom/client';
import { supabase } from '../lib/supabase';
import { signOutEverything } from '../lib/studentAuth';
import accounts from './playtestAccounts.json';
import { PlaytestBar, type PlaytestBackend } from './PlaytestBar';

export function isLocalSupabaseUrl(url: string | undefined): boolean {
    if (!url) return false;
    try {
        const { hostname } = new URL(url);
        return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]';
    } catch {
        return false;
    }
}

const localStack: PlaytestBackend = {
    label: 'local stack',
    async currentEmail() {
        const { data } = await supabase.auth.getSession();
        return data.session?.user.email ?? null;
    },
    async signInAs(person) {
        await signOutEverything().catch(() => undefined);
        const { error } = await supabase.auth.signInWithPassword({
            email: person.email,
            password: accounts.password,
        });
        if (error) {
            throw new Error(
                `${error.message} — is the local stack seeded? Run \`pnpm playtest\` (or \`pnpm playtest:seed\`).`,
            );
        }
    },
    async signOut() {
        await signOutEverything();
    },
};

export function mountPlaytest(): void {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!isLocalSupabaseUrl(url)) {
        console.error(
            `[playtest] refusing to mount: VITE_SUPABASE_URL (${url ?? '<unset>'}) is not the local stack. ` +
                'packages/app/.env.playtest should point at http://127.0.0.1:54321.',
        );
        return;
    }
    const host = document.createElement('div');
    host.id = 'playtest-bar-root';
    document.body.appendChild(host);
    createRoot(host).render(<PlaytestBar backend={localStack} />);
}
