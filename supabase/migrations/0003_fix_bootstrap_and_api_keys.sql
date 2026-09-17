-- Fix workspace bootstrap RLS + API key verification RPC
-- Project: xxyhztviztdhvjzdfdmb

drop policy if exists workspaces_insert on public.workspaces;
create policy workspaces_insert on public.workspaces
  for insert to authenticated with check (true);

drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships
  for select using (public.is_workspace_member(workspace_id) or user_id = auth.uid());

drop policy if exists memberships_update on public.memberships;
create policy memberships_update on public.memberships
  for update using (public.is_workspace_member(workspace_id));

drop policy if exists memberships_delete on public.memberships;
create policy memberships_delete on public.memberships
  for delete using (public.is_workspace_member(workspace_id));

create index if not exists api_keys_key_hash_idx on public.api_keys(key_hash);
create index if not exists api_keys_workspace_id_idx on public.api_keys(workspace_id);

create or replace function public.verify_api_key(p_key_hash text)
returns table (workspace_id uuid, key_id uuid, key_prefix text)
language sql
stable
security definer
set search_path = public
as $$
  select k.workspace_id, k.id as key_id, k.key_prefix
  from public.api_keys k
  where k.key_hash = p_key_hash
    and k.revoked_at is null
  limit 1;
$$;

revoke all on function public.verify_api_key(text) from public;
grant execute on function public.verify_api_key(text) to anon, authenticated, service_role;
