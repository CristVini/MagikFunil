-- ============================================================
-- MIGRAÇÃO INICIAL - MagikFunil
-- Schema completo para plataforma whitelabel multi-tenant
-- Execute no Supabase SQL Editor
-- ============================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type tenant_status as enum ('active', 'paused', 'blocked_billing');
create type subscription_status as enum ('trial', 'active', 'past_due', 'paused', 'canceled');
create type plan_dashboard_level as enum ('basic', 'advanced', 'decision');
create type support_level as enum ('standard', 'priority', 'dedicated');
create type lead_status as enum ('new', 'contacted', 'won', 'lost');

-- ============================================================
-- TABELAS PRINCIPAIS
-- ============================================================

-- TENANTS (clientes/marcas)
create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  primary_color text,
  secondary_color text,
  accent_color text,
  logo_url text,
  headline text,
  subheadline text,
  cta_text text,
  whatsapp text,
  custom_domain text,
  status tenant_status not null default 'paused',
  template_id uuid, -- FK para templates (adicionado depois)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TEMPLATES (funis pré-criados - nosso IP)
create table templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  niche text not null,
  description text,
  version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PERFIS (resultados do quiz - pertencem ao template)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade not null,
  name text not null,
  archetype text not null,
  description text not null,
  scientific_basis text not null,
  expected_effect text not null,
  "references" text[],
  notes text[],
  color text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- PERGUNTAS DO QUIZ (pertenecem ao template)
create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade not null,
  text text not null,
  position int not null default 0,
  weight int not null default 1,
  created_at timestamptz default now()
);

-- OPÇÕES DAS PERGUNTAS (pontuam para 1+ perfis)
create table quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references quiz_questions(id) on delete cascade not null,
  text text not null,
  profile_ids text[] not null,
  position int not null default 0
);

-- PRODUTOS DO CATÁLOGO (pertencem ao template)
create table products (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade not null,
  name text not null,
  category text not null, -- suplemento_oral, dermocosmetico, kit_mensal
  description text,
  key_actives jsonb,
  image_url text,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- MAPEAMENTO PERFIL → PRODUTOS (template_profile_products)
create table template_profile_products (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  position int not null default 0,
  is_primary boolean not null default true,
  unique (template_id, profile_id, product_id)
);

-- PRODUTOS ATIVADOS PELO TENANT + LINK DE REDIRECIONAMENTO
create table tenant_products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  redirect_url text not null,
  enabled boolean not null default true,
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, product_id)
);

-- PLANOS (catálogo de monetização)
create table plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, -- 'basic' | 'pro' | 'enterprise'
  name text not null,
  price_monthly_cents int not null,
  dashboard_level plan_dashboard_level not null default 'basic',
  max_products int,
  max_clicks_month int,
  custom_domain boolean not null default false,
  multi_user boolean not null default false,
  brand_free boolean not null default true,
  support_level support_level not null default 'standard',
  trial_days int not null default 30,
  position int not null default 0,
  created_at timestamptz default now()
);

-- ASSINATURAS (cobrança - independente de tenants.status)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid unique references tenants(id) on delete cascade not null,
  plan_id uuid references plans(id) not null,
  status subscription_status not null default 'trial',
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  provider text not null default 'manual', -- manual | stripe | ...
  provider_id text, -- subscription_id do Stripe, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LEADS capturados (criado ANTES de events, pois events.lead_id a referencia)
create table leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  name text,
  phone text,
  winning_profile uuid references profiles(id),
  secondary_profile uuid references profiles(id),
  answers jsonb,
  source_url text,
  status lead_status not null default 'new',
  created_at timestamptz default now()
);

-- EVENTOS GRANAULARES (alimenta analytics de DECISÃO do Enterprise)
create table events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  lead_id uuid references leads(id) on delete set null,
  kind text not null, -- funnel_view | quiz_start | quiz_question | quiz_complete | recommendation_view | product_click
  product_id uuid references products(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  source_url text,
  referrer text,
  payload jsonb,
  created_at timestamptz default now()
);

-- EVENTOS DE BILLING (auditoria)
create table billing_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  subscription_id uuid references subscriptions(id) on delete set null,
  kind text not null, -- trial_started | subscribed | payment_failed | canceled | renewed
  amount_cents int,
  provider text,
  provider_event_id text,
  payload jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- FOREIGN KEYS ADICIONAIS (template_id em tenants)
-- ============================================================
alter table tenants
  add constraint fk_tenants_template
  foreign key (template_id) references templates(id) on delete set null;

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================
create index idx_tenants_slug on tenants(slug);
create index idx_tenants_status on tenants(status);
create index idx_tenants_template on tenants(template_id);

create index idx_profiles_template on profiles(template_id);
create index idx_profiles_order on profiles(template_id, display_order);

create index idx_quiz_questions_template on quiz_questions(template_id);
create index idx_quiz_options_question on quiz_options(question_id);

create index idx_products_template on products(template_id);
create index idx_products_category on products(template_id, category);

create index idx_template_profile_products_template on template_profile_products(template_id);
create index idx_template_profile_products_profile on template_profile_products(profile_id);

create index idx_tenant_products_tenant on tenant_products(tenant_id);
create index idx_tenant_products_enabled on tenant_products(tenant_id, enabled);

create index idx_subscriptions_tenant on subscriptions(tenant_id);
create index idx_subscriptions_status on subscriptions(status);

create index idx_events_tenant_kind_created on events(tenant_id, kind, created_at);
create index idx_events_tenant_created on events(tenant_id, created_at);
create index idx_events_lead on events(lead_id);

create index idx_leads_tenant on leads(tenant_id);
create index idx_leads_status on leads(tenant_id, status);
create index idx_leads_created on leads(tenant_id, created_at);

create index idx_billing_events_tenant on billing_events(tenant_id);
create index idx_billing_events_subscription on billing_events(subscription_id);

-- ============================================================
-- TRIGGERS PARA updated_at
-- ============================================================
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_tenants_updated_at
  before update on tenants
  for each row execute function update_updated_at_column();

create trigger update_tenant_products_updated_at
  before update on tenant_products
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at_column();

create trigger update_templates_updated_at
  before update on templates
  for each row execute function update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table tenants enable row level security;
alter table templates enable row level security;
alter table profiles enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table products enable row level security;
alter table template_profile_products enable row level security;
alter table tenant_products enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table events enable row level security;
alter table leads enable row level security;
alter table billing_events enable row level security;

-- Políticas para TENANTS (cada tenant vê só o seu)
create policy "tenant_select_own" on tenants
  for select using (auth.uid()::text = id::text or auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

create policy "tenant_insert_admin" on tenants
  for insert with check (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

create policy "tenant_update_own_or_admin" on tenants
  for update using (auth.uid()::text = id::text or auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

-- Políticas para TEMPLATES (público para leitura de ativos, admin escreve)
create policy "template_select_active" on templates
  for select using (is_active = true);

create policy "template_all_admin" on templates
  for all using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

-- Políticas para PERFIS, QUIZ, PRODUCTS (público leitura via template ativo, admin escreve)
create policy "profile_select_via_template" on profiles
  for select using (exists (select 1 from templates t where t.id = template_id and t.is_active = true));

create policy "profile_all_admin" on profiles
  for all using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

create policy "quiz_q_select_via_template" on quiz_questions
  for select using (exists (select 1 from templates t where t.id = template_id and t.is_active = true));

create policy "quiz_q_all_admin" on quiz_questions
  for all using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

create policy "quiz_opt_select_via_question" on quiz_options
  for select using (exists (select 1 from quiz_questions q join templates t on t.id = q.template_id where q.id = question_id and t.is_active = true));

create policy "quiz_opt_all_admin" on quiz_options
  for all using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

create policy "product_select_via_template" on products
  for select using (exists (select 1 from templates t where t.id = template_id and t.is_active = true));

create policy "product_all_admin" on products
  for all using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

create policy "tpp_select_via_template" on template_profile_products
  for select using (exists (select 1 from templates t where t.id = template_id and t.is_active = true));

create policy "tpp_all_admin" on template_profile_products
  for all using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

-- Políticas para TENANT_PRODUCTS (tenant vê/edita só os seus)
create policy "tp_select_own" on tenant_products
  for select using (tenant_id in (select id from tenants where auth.uid()::text = id::text));

create policy "tp_update_own" on tenant_products
  for update using (tenant_id in (select id from tenants where auth.uid()::text = id::text));

create policy "tp_insert_admin" on tenant_products
  for insert with check (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

-- Políticas para PLANS (público leitura, admin escreve)
create policy "plan_select" on plans for select using (true);
create policy "plan_all_admin" on plans for all using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

-- Políticas para SUBSCRIPTIONS (tenant vê a sua, admin vê todas)
create policy "sub_select_own" on subscriptions
  for select using (tenant_id in (select id from tenants where auth.uid()::text = id::text));

create policy "sub_all_admin" on subscriptions
  for all using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

-- Políticas para EVENTS (sistema escreve, tenant lê os seus, admin lê todos)
create policy "event_insert_system" on events
  for insert with check (true); -- service role

create policy "event_select_own" on events
  for select using (tenant_id in (select id from tenants where auth.uid()::text = id::text));

create policy "event_select_admin" on events
  for select using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

-- Políticas para LEADS (tenant lê/edita os seus, sistema cria)
create policy "lead_select_own" on leads
  for select using (tenant_id in (select id from tenants where auth.uid()::text = id::text));

create policy "lead_update_own" on leads
  for update using (tenant_id in (select id from tenants where auth.uid()::text = id::text));

create policy "lead_insert_system" on leads
  for insert with check (true); -- service role

create policy "lead_select_admin" on leads
  for select using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

-- Políticas para BILLING_EVENTS (admin only)
create policy "be_select_admin" on billing_events
  for select using (auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin'));

create policy "be_insert_system" on billing_events
  for insert with check (true); -- service role

-- ============================================================
-- DADOS INICIAIS: PLANOS (preços definidos)
-- ============================================================
insert into plans (id, slug, name, price_monthly_cents, dashboard_level, max_products, max_clicks_month, custom_domain, multi_user, brand_free, support_level, trial_days, position) values
('11111111-1111-1111-1111-111111111111', 'basic', 'Básico', 27890, 'basic', null, null, false, false, true, 'standard', 30, 0),
('22222222-2222-2222-2222-222222222222', 'pro', 'Pro', 36900, 'advanced', null, null, false, true, true, 'priority', 30, 1),
('33333333-3333-3333-3333-333333333333', 'enterprise', 'Enterprise', 39700, 'decision', null, null, true, true, false, 'dedicated', 30, 2)
on conflict (slug) do nothing;

-- ============================================================
-- FUNÇÃO HELPER: Criar tenant com assinatura trial automática
-- ============================================================
create or replace function create_tenant_with_trial(
  p_slug text,
  p_name text,
  p_template_id uuid,
  p_primary_color text default '#16A34A',
  p_secondary_color text default '#EC4899',
  p_accent_color text default '#F59E0B'
) returns uuid language plpgsql as $$
declare
  v_tenant_id uuid;
  v_basic_plan_id uuid;
begin
  select id into v_basic_plan_id from plans where slug = 'basic' limit 1;
  
  insert into tenants (slug, name, template_id, primary_color, secondary_color, accent_color, status)
  values (p_slug, p_name, p_template_id, p_primary_color, p_secondary_color, p_accent_color, 'active')
  returning id into v_tenant_id;
  
  insert into subscriptions (tenant_id, plan_id, status, current_period_start, current_period_end)
  values (v_tenant_id, v_basic_plan_id, 'trial', now(), now() + interval '30 days');
  
  return v_tenant_id;
end;
$$ security definer;

-- ============================================================
-- FUNÇÃO HELPER: Registrar evento (para ser chamada via RPC)
-- ============================================================
create or replace function track_event(
  p_tenant_id uuid,
  p_kind text,
  p_lead_id uuid default null,
  p_product_id uuid default null,
  p_profile_id uuid default null,
  p_source_url text default null,
  p_referrer text default null,
  p_payload jsonb default null
) returns void language plpgsql as $$
begin
  insert into events (tenant_id, lead_id, kind, product_id, profile_id, source_url, referrer, payload)
  values (p_tenant_id, p_lead_id, p_kind, p_product_id, p_profile_id, p_source_url, p_referrer, p_payload);
end;
$$ security definer;

-- ============================================================
-- FUNÇÃO HELPER: Finalizar quiz e criar lead
-- ============================================================
create or replace function complete_quiz(
  p_tenant_id uuid,
  p_template_id uuid,
  p_winning_profile uuid,
  p_secondary_profile uuid,
  p_answers jsonb,
  p_source_url text
) returns uuid language plpgsql as $$
declare
  v_lead_id uuid;
begin
  insert into leads (tenant_id, winning_profile, secondary_profile, answers, source_url, status)
  values (p_tenant_id, p_winning_profile, p_secondary_profile, p_answers, p_source_url, 'new')
  returning id into v_lead_id;
  
  return v_lead_id;
end;
$$ security definer;