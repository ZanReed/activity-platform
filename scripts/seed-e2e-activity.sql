-- seed-e2e-activity.sql — a DRAFT activity for the end-to-end manual test.
-- -----------------------------------------------------------------------------
-- Seeds ONE draft activity owned by the dev user (same owner as
-- seed-test-data.sql). It is a DRAFT (no version, not on R2) on purpose: open
-- it in the editor and click Publish to exercise the real publish-activity ->
-- R2 path, then open the returned URL as a student.
--
-- Coverage: 2 sections (both checkpoints), 2 fill-in-blank problems, rich hint
-- + targeted mistake feedback + a worked solution, one block with a confidence
-- rating, inline math, acceptable-answer alternates. submissionMode = free.
-- (Re-publish from the editor with mode switched to 'locked' for the locked
-- pass — no second seed needed.)
--
-- Re-runnable: the teardown removes the prior copy and any submissions first.
-- Teardown only:
--   delete from public.submissions where activity_id = 'e0000000-0000-4000-8000-000000000001';
--   delete from public.activities  where id          = 'e0000000-0000-4000-8000-000000000001';
-- =============================================================================
begin;
delete from public.submissions where activity_id = 'e0000000-0000-4000-8000-000000000001';
delete from public.activities  where id          = 'e0000000-0000-4000-8000-000000000001';
insert into public.activities
  (id, owner_id, title, slug, status, visibility, draft_content)
values
  ('e0000000-0000-4000-8000-000000000001', '184464c4-8b8b-4820-aea5-51c34f361bfc', '[TEST] E2E Coverage', 'zz-test-e2e', 'draft', 'unlisted',
   $json${"schemaVersion":1,"meta":{"title":"[TEST] E2E Coverage","course":"Algebra II","submissionMode":"free","revisionMode":"free","gradingMode":"auto","activityType":"worksheet","answerFeedback":"on_check","skills":[],"print":{"paperSize":"letter","columns":1,"workSpace":0,"fontSize":11,"problemSpacing":1,"margin":0.5,"gridLines":false,"header":{"name":true,"date":true,"period":false,"class":false,"score":false,"custom":[]}}},"sections":[{"id":"e0000000-0000-4000-8000-0000000000a1","title":"Warm-up","isCheckpoint":true,"blocks":[{"id":"e0000000-0000-4000-8000-0000000000d1","type":"paragraph","content":[{"type":"text","text":"Factor each quadratic. Use the hint (?) if you get stuck.","marks":[]}]},{"id":"e0000000-0000-4000-8000-0000000000b1","type":"fill_in_blank","number":1,"content":[{"type":"text","text":"Factor ","marks":[]},{"type":"math_inline","latex":"x^2 + 5x + 6"},{"type":"text","text":" = ( x + ","marks":[]},{"type":"blank","id":"e0000000-0000-4000-8000-0000000000c1","answer":"2","acceptableAnswers":[],"hint":[{"type":"text","text":"What two numbers multiply to 6 and add to 5? Try factors of ","marks":[]},{"type":"math_inline","latex":"6"},{"type":"text","text":".","marks":[]}],"mistakeFeedback":[{"match":"6","feedback":[{"type":"text","text":"6 multiplies to 6 but ","marks":[]},{"type":"text","text":"does not add to 5","marks":["italic"]},{"type":"text","text":" — try a smaller pair.","marks":[]}]}]},{"type":"text","text":" )( x + ","marks":[]},{"type":"blank","id":"e0000000-0000-4000-8000-0000000000c2","answer":"3","acceptableAnswers":[]},{"type":"text","text":" )","marks":[]}],"solution":[{"type":"text","text":"Two numbers that multiply to 6 and add to 5: ","marks":[]},{"type":"text","text":"2 and 3","marks":["bold"]},{"type":"text","text":". So ","marks":[]},{"type":"math_inline","latex":"x^2 + 5x + 6 = (x+2)(x+3)"},{"type":"text","text":".","marks":[]}],"hasConfidenceRating":true,"skills":[]}]},{"id":"e0000000-0000-4000-8000-0000000000a2","title":"Practice","isCheckpoint":true,"blocks":[{"id":"e0000000-0000-4000-8000-0000000000b2","type":"fill_in_blank","number":2,"content":[{"type":"text","text":"Simplify ","marks":[]},{"type":"math_inline","latex":"x^2 \\cdot x"},{"type":"text","text":" = ","marks":[]},{"type":"blank","id":"e0000000-0000-4000-8000-0000000000c3","answer":"x^3","acceptableAnswers":["x*x*x","x \\cdot x \\cdot x"],"hint":[{"type":"text","text":"Add the exponents when multiplying like bases.","marks":[]}]},{"type":"text","text":"  and  2x + 3x = ","marks":[]},{"type":"blank","id":"e0000000-0000-4000-8000-0000000000c4","answer":"5x","acceptableAnswers":[]}],"hasConfidenceRating":false,"skills":[]}]}]}$json$::jsonb);
commit;
