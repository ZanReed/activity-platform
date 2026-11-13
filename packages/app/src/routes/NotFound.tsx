// =============================================================================
// NotFound.tsx — any address the app doesn't know (UI review C-1)
// -----------------------------------------------------------------------------
// It used to render a blank page (App.tsx had no catch-all route): a mistyped
// or truncated link — common when a link is copied out of a class chat — left
// a student or teacher with nothing on screen and no way home.
// =============================================================================

import { Link } from 'react-router';
import { useSession } from '../lib/SessionContext';

export default function NotFound() {
    const { session, role } = useSession();
    const teacher = session && role === 'teacher';
    return (
        <main className="min-h-screen bg-surface p-4 sm:p-8">
            <div className="mx-auto max-w-md rounded-lg border border-line bg-canvas p-6 shadow-sm" data-not-found>
                <h1 className="text-xl font-bold text-ink">This page doesn’t exist.</h1>
                <p className="mt-2 text-sm text-muted">The link may be mistyped, or cut short when it was copied.</p>
                <Link
                    to={teacher ? '/activities' : '/'}
                    className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
                >
                    {teacher ? 'Go to My activities' : session ? 'Go to my classes' : 'Go to the start page'}
                </Link>
            </div>
        </main>
    );
}
