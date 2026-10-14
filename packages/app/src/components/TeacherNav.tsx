import { NavLink } from 'react-router';
import { signOutEverything } from '../lib/studentAuth';

// The teacher's three top-level pages, linked from each other (author's
// walkthrough bug, 2026-10-14: Classes had no link out at all, and Activities
// reached only the Bank). Rendered on /activities, /classes and /bank ONLY —
// the editor and its sub-pages are focused workspaces with their own back
// links, ruled 2026-10-14. Labels match Home's hub buttons so a teacher reads
// one vocabulary everywhere. Guard: __tests__/TeacherNav.test.tsx.
export const TEACHER_NAV_LINKS = [
    { to: '/activities', label: 'My activities' },
    { to: '/classes', label: 'My classes' },
    { to: '/bank', label: 'Activity Bank' },
] as const;

// signOutEverything, not supabase.auth.signOut (ruling S6-6, same as Home).
// RequireAuth bounces the now-signed-out page to "/".
async function signOut() {
    try {
        await signOutEverything();
    } catch (error) {
        console.error('Sign-out failed:', error);
    }
}

export function TeacherNav() {
    return (
        <nav
        aria-label="Teacher pages"
        className="mb-6 flex items-center justify-between gap-3 border-b border-line pb-3 text-sm"
        >
        <ul className="flex items-center gap-3 whitespace-nowrap">
        {TEACHER_NAV_LINKS.map((l) => (
            <li key={l.to}>
            <NavLink
            to={l.to}
            end
            className={({ isActive }) =>
                isActive
                    ? 'font-semibold text-ink'
                    : 'font-medium text-muted underline-offset-2 hover:text-strong hover:underline'
            }
            >
            {l.label}
            </NavLink>
            </li>
        ))}
        </ul>
        <button
        type="button"
        onClick={() => void signOut()}
        className="whitespace-nowrap font-medium text-muted underline-offset-2 hover:text-strong hover:underline"
        >
        Sign out
        </button>
        </nav>
    );
}
