import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from './supabase';

interface SessionContextValue {
    session: Session | null;
    loading: boolean;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // No Supabase env configured: stay signed-out instead of taking the
        // whole app down at mount. This is the clean-clone case — `pnpm dev`
        // with no .env.local — where the Supabase-free dev routes (notably
        // /dev/viewer, the S3 component harness) must still boot (ruling D10).
        // Any real auth action still throws the loud, instructive error from
        // lib/supabase.ts; what this avoids is a blank page for routes that
        // never needed auth at all.
        if (!supabaseConfigured) {
            setLoading(false);
            return;
        }

        // getSession() covers two cases: a normal reload while signed in (reads
        // the persisted session), and the OAuth callback (Supabase parses the URL
        // fragment and stores the session before getSession() resolves).
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        // Subsequent auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, …) keep
        // React state in sync with the client's internal auth state.
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <SessionContext.Provider value={{ session, loading }}>
        {children}
        </SessionContext.Provider>
    );
}

// Throws if used outside the provider — turns a missing-provider mistake into
// an immediate, obvious error instead of a silent null.
export function useSession(): SessionContextValue {
    const ctx = useContext(SessionContext);
    if (ctx === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return ctx;
}
