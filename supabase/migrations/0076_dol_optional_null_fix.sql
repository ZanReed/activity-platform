-- 0076_dol_optional_null_fix.sql — dol_optional_block must never return NULL
--
-- 0075's rule returned NULL for a section with no DoL when the block came after
-- that section's first gradable item (NULL AND true). The reads wrap it in NOT,
-- so the row dropped out and class_progress + activity_progress undercounted
-- to_grade on ordinary sections. Found by verify-0061 on live, 2026-11-02.
-- Replacing the function is enough: with it false, the reads' guard is true.
--
-- COMPLIANCE: NO personal data. Data-map draft-42.

create or replace function dol_optional_block(p_section jsonb, p_block_id text)
returns boolean
language sql
immutable
set search_path = public
as $$
  with blocks as (
    select b, row_number() over (order by r.o, c.o, bl.o) as n
    from jsonb_array_elements(coalesce(p_section->'rows', '[]'::jsonb)) with ordinality r(v, o)
    cross join lateral jsonb_array_elements(coalesce(r.v->'columns', '[]'::jsonb)) with ordinality c(v, o)
    cross join lateral jsonb_array_elements(coalesce(c.v->'blocks', '[]'::jsonb)) with ordinality bl(b, o)
  ), gradable as (
    select b, n from blocks
    where b->>'type' in ('fill_in_blank', 'multiple_choice', 'matching', 'correspondence', 'ordering',
                         'number_line', 'self_explanation', 'short_answer', 'essay', 'faded_worked_example')
       or (b->>'type' in ('interactive_graph', 'data_plot') and b->'interaction'->>'type' <> 'display')
       or (b->>'type' = 'math_block' and jsonb_array_length(coalesce(b->'prompts', '[]'::jsonb)) > 0)
       or (b->>'type' = 'table' and jsonb_path_exists(b, '$.**.type ? (@ == "blank")'))
  )
  select coalesce(jsonb_typeof(p_section->'dol') = 'object', false)
     and exists (select 1 from gradable g
                 where g.b->>'id' = p_block_id and g.b->>'type' in ('short_answer', 'essay')
                   and g.n > (select min(n) from gradable));
$$;
