# UI review group C — dead ends and missing feedback (design pass, 2026-11-13)

Status: **PROPOSED, awaiting the author's rulings (C-1 … C-10).** Source:
TODOS.md → "UI review 2026-11-13", group C (items 13–21; 19 was fixed with
group A). Each fact below was re-read in the code on 2026-11-13.

## What the code does today

| # | Where | Today |
|---|---|---|
| 13 | Any mistyped URL | blank page: `App.tsx` has no catch-all route |
| 14a | Student viewer, activity won't load | a failure card with no way home, and the raw error text under it |
| 14b | Same, session expired (`unauthenticated`) | "Please sign in again" with a **Try again** button that retries the same dead session |
| 14c | Join a class fails | the reason plus one link home; "Try again" / "Sign in again" are words, not buttons |
| 15 | After a section check | the status line says "Checked." — no tally; the student scans every pill |
| 16a | Viewer on a phone | the top bar (173 px) and the check footer (103 px) are both pinned: a third of an 812 px screen |
| 16b | Viewer status banners (storage full, stale version, session expired) | in the page flow, above the worksheet — not seen once the student scrolls (the idle warning was fixed in G-1) |
| 17 | Teacher Analytics | shows developer text ("run `pnpm backfill:census`", "stale cache rows swept", a maintenance-job line) and groups by block kind ("data plot · build histogram") |
| 18a | Progress / Analytics / Responses | each says "Back to editor" (they're opened from My activities) and none links to the others |
| 18b | Class card | "Today" (and mixed practice) lives behind a link called "Practice" |
| 20 | Fill-in-blank "+ Blank" | its tooltip says "at the cursor"; it inserts at the end of the line |
| 21 | Editor | deleting a block is one click on a hover icon; there are no Undo / Redo buttons (⌘Z only) |

## Decisions

**C-1. A "page not found" screen for any unknown address.** Recommended:
- "This page doesn't exist." with one button home: My activities for a teacher,
  your classes for a student, the sign-in screen when signed out.
- A catch-all route, lazy (no student-shell cost beyond the route entry).

**C-2. A student is never stuck on a failure screen.** Recommended:
- Every failure card gets **Back to my classes** (or **Back to Today** when
  they came from Today).
- The raw error text goes behind a "Details" toggle, for a teacher reading
  over a shoulder; the student sees the plain sentence only.
- Session expired: the button is **Sign in again**, which runs the same Google
  sign-in as the signed-out screen. Today it retries the dead session.
- A failed join: **Try again** re-runs the join for a network-type failure,
  and **Sign in** for a signed-out one, instead of words only.

**C-3. A section check says how it went.** Recommended:
- "Checked: 4 of 6 right." Locked sections read "Checked and locked: 4 of 6
  right."
- Written answers aren't marked by the computer, so they're counted apart:
  "Checked: 4 of 5 right · 1 written answer goes to your teacher."
- Counted from the check's own item verdicts (`correct` / `incorrect` /
  `recorded`); nothing new is fetched.
- The line is the existing announced status, so screen readers hear one
  summary instead of having to walk the pills.

**C-4. On a phone, less of the screen is pinned.** Recommended:
- Under 640 px the top bar scrolls away with the page instead of staying
  pinned; the back link and title are at the top when you start.
- The check footer pins as one compact row (button + a short status), about
  60 px.
- Together that's about 7% of the screen instead of 34%, measured the same
  way as before (the C-4 test re-measures it).
- Chromebook width and up: unchanged.

**C-5. Status banners stay in view.** Recommended: the storage-full,
stale-version and session-expired banners pin to the top of the screen while
they show, as the idle warning does since G-1. One at a time (the existing
order already picks which), above the top bar.

**C-6. Analytics speaks to teachers, not developers.** Recommended:
- Remove the `pnpm backfill:census` hint and the maintenance-job line from the
  teacher page.
- The job-health line stays visible somewhere a person who can fix it looks:
  recommended, a line in the weekly CI-health routine (it runs each Monday but
  checks CI today, so this means editing that routine — done only with your
  OK). The alternative is to show it on the page to your account only.
- The breakdown reads "By question type" with plain names ("Histogram",
  "Plot a point", "Multiple choice").
- A per-question breakdown needs the nightly count to record block ids — a
  migration. Filed in TODOS with a trigger, not built here.

**C-7. One header for an activity's results.** Recommended:
- Progress, Responses and Analytics share a header: "← My activities" (or
  back to the class when opened from one), the activity's title, and tabs
  **Progress · Responses · Analytics · Edit**.
- Replaces the three different "Back to editor" / "Back to progress" links.

**C-8. "Practice" becomes "Today & practice".** Recommended: the class card's
link is renamed, so a teacher looking for Today finds it. The page itself is
unchanged.

**C-9. "+ Blank" goes where the caret is.** Recommended: when the caret is in
that line, the blank goes at the caret; otherwise at the end of the line, as
today. The tooltip says which.

**C-10. Deleting a block can be taken back from the screen.** Recommended:
- After a block is deleted from its quick bar, a toast: "Block deleted ·
  **Undo**" (Undo runs the editor's undo).
- Undo and Redo buttons in the editor toolbar, with ⌘Z / ⌘⇧Z in their
  tooltips.

## Build shape (if all yes)

- **Step 1, student side:** C-1, C-2, C-3, C-4, C-5. The student shell is
  measured (spend meter), and lazy where needed.
- **Step 2, teacher side:** C-6, C-7, C-8.
- **Step 3, editor:** C-9, C-10.
- No migration or deploy. Moving the job-health line into the weekly routine
  is a routine edit, done only with your OK.
- A Fable review per step; each change mutation-tested; browser lanes for the
  student screens and the editor.
