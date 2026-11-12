-- verify-0085.sql — service_role can write the misconception list (migration
-- 0085). Run with `pnpm verify:auth --target live|local`. §A reads the catalog
-- only; §B writes inside an EXPECTED-ROLLBACK block, so nothing persists (P7).

-- @section A-catalog-posture
-- @expect-rows
select 'service_role_can_upsert',
       has_table_privilege('service_role', 'misconception_registry', 'select')
       and has_table_privilege('service_role', 'misconception_registry', 'insert')
       and has_table_privilege('service_role', 'misconception_registry', 'update'),
       '0085: the importer''s mirror is an upsert as service_role; without insert+update a fresh database mirrors nothing';
select 'clients_unchanged',
       has_table_privilege('authenticated', 'misconception_registry', 'select')
       and not has_table_privilege('authenticated', 'misconception_registry', 'insert')
       and not has_table_privilege('authenticated', 'misconception_registry', 'update')
       and not has_table_privilege('authenticated', 'misconception_registry', 'delete')
       and not has_table_privilege('anon', 'misconception_registry', 'select'),
       '0042 §C posture: teachers read the list, no client writes it';

-- @section B-upsert-as-service-role
-- @expect-error EXPECTED ROLLBACK
-- The P3 liveness leg: the grant is exercised, not just read off the catalog.
do $vfy$
begin
  set local role service_role;
  insert into misconception_registry (id, description)
  values ('mis.vfy0085.probe', 'first')
  on conflict (id) do update set description = excluded.description;
  insert into misconception_registry (id, description)
  values ('mis.vfy0085.probe', 'second')
  on conflict (id) do update set description = excluded.description;
  if (select description from misconception_registry where id = 'mis.vfy0085.probe') <> 'second' then
    raise exception 'FAIL B1: the upsert did not update';
  end if;
  raise exception 'EXPECTED ROLLBACK >>> B-upsert: 1/1';
end
$vfy$;
