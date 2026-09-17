-- LeadPilot init desk schema (matches applied migration leadpilot_init_desk)
-- Project: xxyhztviztdhvjzdfdmb (eu-central-1)
-- Multi-tenant Client Operations Desk + modules (created as wp_plugins; renamed in 0002)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Core tenancy
-- ---------------------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists memberships_workspace_id_idx on public.memberships(workspace_id);

-- ---------------------------------------------------------------------------
-- Modules table (install / activate / deactivate; renamed to modules in 0002)
-- status: installed | active | inactive
-- ---------------------------------------------------------------------------
create table if not exists public.wp_plugins (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plugin_slug text not null,
  status text not null default 'inactive'
    check (status in ('installed', 'active', 'inactive')),
  config jsonb not null default '{}'::jsonb,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, plugin_slug)
);

create index if not exists wp_plugins_workspace_id_idx on public.wp_plugins(workspace_id);
create index if not exists wp_plugins_status_idx on public.wp_plugins(workspace_id, status);

-- ---------------------------------------------------------------------------
-- Desk entities
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  industry text,
  domain text,
  created_at timestamptz not null default now()
);

create index if not exists companies_workspace_id_idx on public.companies(workspace_id);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  title text,
  email text,
  phone text,
  source text,
  score numeric,
  channel text,
  outcome text,
  message text,
  channel_probs jsonb,
  -- Flexible features / scoring / demo flags live in payload
  -- e.g. { "industry": "...", "isDemoSample": true, "probability": 0.42, ... }
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_workspace_id_idx on public.leads(workspace_id);
create index if not exists leads_score_idx on public.leads(workspace_id, score desc nulls last);
create index if not exists leads_email_idx on public.leads(workspace_id, email);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  channel text not null,
  subject text not null default '',
  unread int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists threads_workspace_id_idx on public.threads(workspace_id);
create index if not exists threads_lead_id_idx on public.threads(lead_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  thread_id uuid not null references public.threads(id) on delete cascade,
  direction text not null check (direction in ('in', 'out', 'system')),
  body text not null default '',
  at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);

create index if not exists messages_thread_id_idx on public.messages(thread_id);
create index if not exists messages_workspace_id_idx on public.messages(workspace_id);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  title text not null,
  amount numeric not null default 0,
  stage text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists deals_workspace_id_idx on public.deals(workspace_id);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  due_at timestamptz,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_workspace_id_idx on public.tasks(workspace_id);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  type text not null,
  title text not null,
  detail text,
  at timestamptz not null default now()
);

create index if not exists activities_workspace_id_idx on public.activities(workspace_id);
create index if not exists activities_lead_id_idx on public.activities(lead_id);

-- ---------------------------------------------------------------------------
-- Connectors + API keys
-- ---------------------------------------------------------------------------
create table if not exists public.connector_installs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  connector_id text not null,
  enabled boolean not null default false,
  secrets jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, connector_id)
);

create index if not exists connector_installs_workspace_id_idx
  on public.connector_installs(workspace_id);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists api_keys_workspace_id_idx on public.api_keys(workspace_id);
create index if not exists api_keys_prefix_idx on public.api_keys(key_prefix);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.workspaces enable row level security;
alter table public.memberships enable row level security;
alter table public.wp_plugins enable row level security;
alter table public.companies enable row level security;
alter table public.leads enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.deals enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;
alter table public.connector_installs enable row level security;
alter table public.api_keys enable row level security;

-- Workspaces: members can read; owners/admins update; authenticated insert (bootstrap)
drop policy if exists workspaces_select on public.workspaces;
create policy workspaces_select on public.workspaces
  for select using (public.is_workspace_member(id));

drop policy if exists workspaces_insert on public.workspaces;
create policy workspaces_insert on public.workspaces
  for insert to authenticated with check (true);

drop policy if exists workspaces_update on public.workspaces;
create policy workspaces_update on public.workspaces
  for update using (public.is_workspace_member(id));

-- Memberships
drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships
  for select using (public.is_workspace_member(workspace_id) or user_id = auth.uid());

drop policy if exists memberships_insert on public.memberships;
create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_workspace_member(workspace_id));

drop policy if exists memberships_update on public.memberships;
create policy memberships_update on public.memberships
  for update using (public.is_workspace_member(workspace_id));

drop policy if exists memberships_delete on public.memberships;
create policy memberships_delete on public.memberships
  for delete using (public.is_workspace_member(workspace_id));

-- Generic tenant CRUD helper policies
do $$
declare
  t text;
begin
  foreach t in array array[
    'wp_plugins','companies','leads','threads','messages',
    'deals','tasks','activities','connector_installs','api_keys'
  ]
  loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format(
      'create policy %I_select on public.%I for select using (public.is_workspace_member(workspace_id))',
      t, t
    );
    execute format('drop policy if exists %I_insert on public.%I', t, t);
    execute format(
      'create policy %I_insert on public.%I for insert with check (public.is_workspace_member(workspace_id))',
      t, t
    );
    execute format('drop policy if exists %I_update on public.%I', t, t);
    execute format(
      'create policy %I_update on public.%I for update using (public.is_workspace_member(workspace_id))',
      t, t
    );
    execute format('drop policy if exists %I_delete on public.%I', t, t);
    execute format(
      'create policy %I_delete on public.%I for delete using (public.is_workspace_member(workspace_id))',
      t, t
    );
  end loop;
end $$;
