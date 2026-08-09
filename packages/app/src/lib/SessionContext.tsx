import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from './supabase';

export type UserRole = 'teacher' | 'student' | 'admin';

/**
 * Role fetch lifecycle (identity slice E-4/E-11):
 *   idle    — signed out, nothing to fetch
 *   loading — select in flight; the shell holds its neutral state (never a
 *             flash of the wrong Home)
 *   ready   — role known
 *   empty   — signed in but NO users row came back. Distinct from error on
 *             purpose: it is the "account unavailable" state (E-11) — a
 *             retry loop would spin forever, a defaulted shell would lie.
 *   error   — the select failed (network); retryRole() re-runs it
 */
export type RoleStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

interface SessionContextValue {
    session: Session | null;
    loading: boolean;
    /** UX-only trust: every data surface stays RLS-gated server-side. A stale
     * role after a manual DB demotion mis-renders chrome at worst — RLS cuts
     * real access immediately (E-4's accepted window). */
    role: UserRole | null;
    roleStatus: RoleStatus;
    retryRole: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<UserRole | null>(null);
    const [roleStatus, setRoleStatus] = useState<RoleStatus>('idle');
    // Fetch once per signed-in USER, not per auth event: TOKEN_REFRESHED fires
    // hourly (plus focus events) and must reuse the cached role (E-4).
    const fetchedForUser = useRef<string | null>(null);

    const fetchRole = useCallback(async (userId: string) => {
        setRoleStatus('loading');
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .maybeSingle();
        // A sign-out can race the select; only the current user's answer counts.
        if (fetchedForUser.current !== userId) return;
        if (error) {
            setRole(null);
            setRoleStatus('error');
            return;
        }
        if (!data) {
            setRole(null);
            setRoleStatus('empty');
            return;
        }
        setRole(data.role as UserRole);
        setRoleStatus('ready');
    }, []);

    const syncRole = useCallback(
        (nextSession: Session | null) => {
            const userId = nextSession?.user.id ?? null;
            if (userId === fetchedForUser.current) return;
            fetchedForUser.current = userId;
            if (!userId) {
                setRole(null);
                setRoleStatus('idle');
                return;
            }
            void fetchRole(userId);
        },
        [fetchRole],
    );

    const retryRole = useCallback(() => {
        const userId = fetchedForUser.current;
        if (userId) void fetchRole(userId);
    }, [fetchRole]);

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
            syncRole(data.session);
        });

        // Subsequent auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, …) keep
        // React state in sync with the client's internal auth state.
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            syncRole(newSession);
        });

        return () => subscription.unsubscribe();
    }, [syncRole]);

    return (
        <SessionContext.Provider value={{ session, loading, role, roleStatus, retryRole }}>
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
