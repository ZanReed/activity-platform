// Public privacy policy page (no auth). Ruling D7/3.2A: the student-side
// fineprint and the auth screens need a real URL to point at.
//
// SOURCE OF TRUTH: docs/compliance/privacy-policy.md — this page is its
// rendered form. Update BOTH together and bump POLICY_VERSION; the guard test
// (privacy.version.test.ts) fails if the version strings drift apart.
// Placeholder ⟨…⟩ values in the doc render here as "(to be finalized)" —
// they must be resolved before any real student signs in.

import { POLICY_VERSION } from '../lib/policyVersion';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-strong">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <main className="min-h-screen bg-surface p-8 print:p-0">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">
          Version {POLICY_VERSION} · Draft pending district review
        </p>

        <div className="mt-6 rounded-lg border border-line bg-canvas p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">The short version</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-strong">
            <li>
              We store the minimum needed to run class activities: your school
              email, your name as Google provides it, which classes you joined,
              and the answers you submit.
            </li>
            <li>
              Your teacher sees your work. We don't sell data, show ads, or
              track you across the web. There are no third-party trackers.
            </li>
            <li>
              Answer keys never leave the server — checking happens there.
            </li>
            <li>
              When your class ends and the retention window passes, your work
              is deleted on a schedule.
            </li>
          </ul>
        </div>

        <Section title="Who can use this">
          <p>
            Student accounts are for students 13 or older whose school uses the
            platform. Your teacher confirms this when they create a class. If
            you're under 13, don't sign in — ask your teacher for a paper copy.
          </p>
        </Section>

        <Section title="What we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium">School email + display name</span>{' '}
              — from Google sign-in, so you can sign in and your teacher
              recognizes your work.
            </li>
            <li>
              <span className="font-medium">Class memberships</span> —
              created when you join a class with a join code.
            </li>
            <li>
              <span className="font-medium">
                Your responses, scores, and attempt counts
              </span>{' '}
              — the classwork itself, for your teacher to review.
            </li>
            <li>
              <span className="font-medium">
                A one-way hash of your IP address and your browser type
              </span>{' '}
              — abuse detection only, never your raw IP, deleted after 30 days.
            </li>
          </ul>
          <p>
            We do <span className="font-medium">not</span> collect: age or
            birthdate, location, contacts, photos, browsing history, or
            anything from your Google account beyond email and name. Cookies
            are used only to keep you signed in.
          </p>
        </Section>

        <Section title="Who sees what">
          <p>
            Your teacher sees your name, responses, scores, and grades for
            their own classes — not other teachers' classes. Other students
            see nothing of yours. The platform operator can access the
            database for maintenance and security; that access is logged. Data
            is stored with Supabase (database and sign-in) and Cloudflare
            (page hosting), who process it for us and have no right to use it
            otherwise. Nobody else — no sale, no ads, no data brokers.
          </p>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              See, export, or delete your work: ask your teacher, or contact
              the operator <span className="text-muted">(contact to be finalized)</span>.
            </li>
            <li>
              On shared computers, use the sign-out button in the account menu
              — it clears everything stored on that machine.
            </li>
          </ul>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes in a way that matters, the version string at
            the top changes and teachers are notified before students see the
            new terms.
          </p>
        </Section>
      </div>
    </main>
  );
}
