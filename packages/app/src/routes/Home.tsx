import { Link } from 'react-router';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';

export default function Home() {
  const { session, loading } = useSession();

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // Explicit redirectTo makes dev/prod behavior identical.
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error('Sign-in failed:', error);
  };

    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Sign-out failed:', error);
    };

      return (
        <main className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">Activity Platform</h1>
        <p className="mt-2 text-muted">
        Build interactive activities and share them with your students.
        </p>

        <div className="mt-8 rounded-lg border border-line bg-canvas p-6 shadow-sm">
        {loading ? (
          <p className="text-muted">Checking session…</p>
        ) : session ? (
          <div className="space-y-4">
          <p className="text-strong">
          Signed in as{' '}
          <span className="font-medium">{session.user.email}</span>
          </p>
          <div className="flex items-center gap-3">
          <Link
          to="/activities"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
          My activities
          </Link>
          <button
          type="button"
          onClick={signOut}
          className="rounded-md border border-line-strong bg-canvas px-4 py-2 text-sm font-medium text-strong shadow-sm transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
          Sign out
          </button>
          </div>
          </div>
        ) : (
          <div className="space-y-4">
          <p className="text-strong">You're signed out.</p>
          <button
          type="button"
          onClick={signIn}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
          Sign in with Google
          </button>
          </div>
        )}
        </div>
        </div>
        </main>
      );
}
