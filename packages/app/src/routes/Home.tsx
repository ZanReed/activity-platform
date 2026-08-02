import { Link } from 'react-router';
import { supabase } from '../lib/supabase';
import { signOutEverything } from '../lib/studentAuth';
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

    // signOutEverything, not supabase.auth.signOut: this is the ONLY sign-out
    // control in the app today, so it is also the only place the shared-device
    // guarantees can be honored. The raw call left viewer-namespaced work on
    // the device and — worse — left the session itself alive whenever the
    // network call failed, because auth-js returns early without clearing it
    // (ruling S6-6). Every sign-out control added later must call this one too.
    const signOut = async () => {
      try {
        await signOutEverything();
      } catch (error) {
        console.error('Sign-out failed:', error);
      }
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
          <Link
          to="/classes"
          className="rounded-md border border-line-strong bg-canvas px-4 py-2 text-sm font-medium text-strong shadow-sm transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
          My classes
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
