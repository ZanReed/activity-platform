# Stress-test brief (AI build route)

How the 2026-11-20 stress test was made, so it can be made again from scratch.
In a new activity, open **Import**, press **Copy AI prompt**, paste that into
ChatGPT or Claude, then paste this request under it:

> Make me a stress-test activity for a Year 8–9 maths class that uses EVERY
> kind of block, question and option your instructions describe, each at least
> once — every blank variant (text, alternates, tilde order, ^ case, numeric,
> tolerance, units incl. !unit-missing/!unit-wrong, ==, ===, hints, !mistake
> feedback), gaps and form gaps, definitions (inline and fence), every graph
> answer kind (line, inequality, points, ray, segment, region, none, vector,
> transform with type-equation, show: figures, mistakes), number lines (points
> and intervals), and every fenced block type and option the instructions
> mention, plus activity settings (meta) and a teacher guide. Use several
> checkpoint sections, including a DoL one if the instructions allow it. Keep
> the maths correct and age-appropriate — linear equations, area, ratios,
> transformations, data. It should take a strong student about 40 minutes.

Use the chat's **Copy** button on the reply and paste it into Import. The
reply should start with a line of four backticks (````markdown); if it starts
with three, the chat's copy will be cut short at the first block inside it.

`stress-test.md` beside this file is the reply a model gave on 2026-11-20,
kept so the walkthrough can run without a chatbot. It was written from the AI
prompt alone and is NOT a reference for correct syntax: the walkthrough's
known-problems list in TODOS.md says which of its blocks came out wrong.
Video clips and practice banks are left out on purpose (catalogue-only), and
the photo question is left out unless you are a photo pilot.
