import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSession } from '../lib/SessionContext';

export default function RequireAuth({ children }: { children: ReactNode }) {
    const { session, loading } = useSession();

    // Without this guard, a signed-in user hitting /activities directly would
    // briefly have session === null (before getSession resolves) and get
    // bounced to "/". Wait for the check to finish first.
    if (loading) {
        return (
            <main className="min-h-screen bg-surface p-8">
            <p className="text-muted">Checking session…</p>
            </main>
        );
    }

    // replace: the gated URL doesn't land in history, so Back doesn't re-bounce.
    if (!session) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
