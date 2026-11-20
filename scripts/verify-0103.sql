-- verify-0103.sql — no IP hash remains in audit_log, and nothing can write
-- one (migration 0103). Run with
-- `pnpm verify:auth --target live|local --only verify-0103`. Reads only.

-- @section A-scrubbed
-- @expect-rows
select 'no_ip_hash_left',
       not exists (select 1 from audit_log where ip_hash is not null),
       'every audit_log.ip_hash is NULL';
-- The guard is bound to the DEPLOYED definitions: a function that names
-- ip_hash could start writing hashes again, and the retention policy would
-- be untrue with no job to clear them.
select 'no_function_writes_ip_hash',
       coalesce(array_agg(p.proname::text order by p.proname), '{}') = '{}',
       'no public function body names ip_hash'
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and pg_get_functiondef(p.oid) ~ 'ip_hash';
