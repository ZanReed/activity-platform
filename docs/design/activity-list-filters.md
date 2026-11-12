# Activity list filters — one bar, not a chip cloud (design pass, 2026-11-13)

Status: **RULED 2026-11-13 (author: "Yes to all") and BUILT** (c5ea6731).
As built: the status menu's first option reads "All activities"; a topic's
checkbox is named "<topic> (<count>)"; the Bank keeps "any of" for topics
(My activities keeps "all of"), as each page did before. Trigger: the
author, 2026-11-13: "our current filter system is clunky … take up less screen
space but still inform teachers of their options and make it easy to manage".

## Today

My activities (`routes/Activities.tsx`) draws, above the list:
- a "Recently edited" strip (5 pills, wraps to two lines);
- the search box;
- a dashed "drafts" chip, then one chip per topic tag, most-used first, capped
  at 12, with "More tags (N)" opening all of them. 59 tags from the live
  catalogue fill seven lines of the screen, and every new unit adds more.

The Bank (`routes/Bank.tsx`) has the same chip cloud plus course and author
selects, role chips and a "Has a teacher guide" checkbox. Filter state is
React state only, so it is lost on Back or refresh.

## Decisions

**F-1. Topics become one button.** Recommended:
- "Topics (59) ▾" sits on the search line and opens a panel with:
  - its own "Find a topic" box;
  - topics grouped under the unit they appear in, each with a count;
  - checkboxes.
- A topic used in several units is listed under each of them.
- At rest this takes no rows. The count in the label tells the teacher the
  options are there.

**F-2. Chosen topics show as removable chips.** Recommended: one line under
the bar, only while something is chosen, each chip with an ×, then **Clear**.
The "5 of 21 shown" line stays and stays announced.

**F-3. The main search also matches topics.** Recommended: typing "area" finds
activities tagged *area* as well as titles containing it, so a quick find
needs no panel.

**F-4. Status becomes a menu.** Recommended: the dashed "drafts" chip is
replaced by a Status menu with four choices:
- All
- Drafts
- Published
- Changed since publish

The last also gives a home to UI-review item 10, where a teacher can't tell
which published activities have unpublished edits.

**F-5. Recently edited fits one line.** Recommended: three pills, then "+2".
The +2 opens the rest. The strip no longer wraps.

**F-6. The Bank gets the same bar, and both remember filters in the URL.**
Recommended:
- The Bank bar holds Search, Course, Author, Type (lesson / review /
  practice; today's role chips), Topics, and a "Has a teacher guide" toggle.
- Filters live in the query string (`?topic=area&status=drafts`), so Back,
  refresh and a shared link keep them.

## Cost

App-only: no migration, no schema change and no deploy. Teacher-side, so the
student spend meter is unaffected. Tests go red with each control removed.
