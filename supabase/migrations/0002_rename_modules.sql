-- Rename wp_plugins → modules, plugin_slug → module_slug
-- Install / activate / deactivate workspace modules (clean name; no product branding).
-- Idempotent for environments already mid-migration.

do $$
begin
  if to_regclass('public.wp_plugins') is not null
     and to_regclass('public.modules') is null then
    alter table public.wp_plugins rename to modules;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'modules'
      and column_name = 'plugin_slug'
  ) then
    alter table public.modules rename column plugin_slug to module_slug;
  end if;
end $$;

-- Indexes
do $$
begin
  if exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = 'public' and c.relname = 'wp_plugins_workspace_id_idx') then
    alter index public.wp_plugins_workspace_id_idx rename to modules_workspace_id_idx;
  end if;
  if exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = 'public' and c.relname = 'wp_plugins_status_idx') then
    alter index public.wp_plugins_status_idx rename to modules_status_idx;
  end if;
end $$;

-- Unique constraint may keep an auto name from wp_plugins; ensure a clean name
do $$
declare
  cname text;
begin
  select con.conname into cname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'modules'
    and con.contype = 'u'
    and pg_get_constraintdef(con.oid) like '%module_slug%';
  if cname is not null and cname <> 'modules_workspace_id_module_slug_key' then
    execute format('alter table public.modules rename constraint %I to modules_workspace_id_module_slug_key', cname);
  end if;
exception when others then
  -- constraint rename is best-effort; unique still enforced
  null;
end $$;

-- Recreate RLS policies under modules_* names (table rename keeps old policy names)
do $$
begin
  if to_regclass('public.modules') is null then
    raise notice 'public.modules missing — skip RLS rename';
    return;
  end if;

  drop policy if exists wp_plugins_select on public.modules;
  drop policy if exists wp_plugins_insert on public.modules;
  drop policy if exists wp_plugins_update on public.modules;
  drop policy if exists wp_plugins_delete on public.modules;
  drop policy if exists modules_select on public.modules;
  drop policy if exists modules_insert on public.modules;
  drop policy if exists modules_update on public.modules;
  drop policy if exists modules_delete on public.modules;

  create policy modules_select on public.modules
    for select using (public.is_workspace_member(workspace_id));
  create policy modules_insert on public.modules
    for insert with check (public.is_workspace_member(workspace_id));
  create policy modules_update on public.modules
    for update using (public.is_workspace_member(workspace_id));
  create policy modules_delete on public.modules
    for delete using (public.is_workspace_member(workspace_id));
end $$;

comment on table public.modules is
  'Workspace modules (install / activate / deactivate). module_slug is the registry id.';
