-- ============================================================
-- MIGRAÇÃO 19 - Multi-funil por cliente
-- MagikFunil
--
-- O cliente pode ter VÁRIOS funis ATIVOS ao mesmo tempo, cada um
-- com a própria URL pública. O admin atribui QUAIS templates (funis)
-- o cliente pode usar + limita o total via plans.max_funnels.
--
-- O "funil" = template (nosso IP: perfis + quiz + catálogo ref.).
-- A "instância de funil do cliente" = tenant_funnels.
-- tenant_items (produtos do cliente) passam a ser POR FUNIL (isolados).
-- ============================================================

-- ============================================================
-- 1) plans.max_funnels (limite de funis por cliente)
--    Basic=1, Pro=2, Enterprise=6 (null = ilimitado)
-- ============================================================
alter table public.plans
  add column if not exists max_funnels integer;

update public.plans set max_funnels = 1 where slug = 'basic';
update public.plans set max_funnels = 2 where slug = 'pro';
update public.plans set max_funnels = 6 where slug = 'enterprise';

-- ============================================================
-- 2) Tabela tenant_funnels (instância de funil do cliente)
-- ============================================================
create table if not exists public.tenant_funnels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  template_id uuid references public.templates(id) on delete cascade not null,
  slug text not null,                        -- slug público (único global)
  enabled boolean not null default true,     -- "no ar"
  is_primary boolean not null default false, -- funil padrão do cliente
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, template_id),
  unique (slug)
);

create index if not exists idx_tenant_funnels_tenant on public.tenant_funnels(tenant_id);
create index if not exists idx_tenant_funnels_template on public.tenant_funnels(template_id);
create index if not exists idx_tenant_funnels_slug on public.tenant_funnels(slug);

alter table public.tenant_funnels enable row level security;

-- Tenant vê/edita só os seus funis
create policy "tf_select_own" on public.tenant_funnels
  for select using (tenant_id = auth.uid() or public.is_admin());
create policy "tf_insert_own" on public.tenant_funnels
  for insert with check (tenant_id = auth.uid() or public.is_admin());
create policy "tf_update_own" on public.tenant_funnels
  for update using (tenant_id = auth.uid() or public.is_admin());
create policy "tf_delete_own" on public.tenant_funnels
  for delete using (tenant_id = auth.uid() or public.is_admin());

create trigger trg_tenant_funnels_updated_at
  before update on public.tenant_funnels
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- 3) tenant_items.funnel_id (isolamento por funil)
-- ============================================================
alter table public.tenant_items
  add column if not exists funnel_id uuid references public.tenant_funnels(id) on delete cascade;

create index if not exists idx_tenant_items_funnel on public.tenant_items(funnel_id);

-- ============================================================
-- 4) BACKFILL: cria tenant_funnels a partir do tenants.template_id
--    existente e migra tenant_items → funnel_id.
-- ============================================================
do $$
declare
  r record;
  v_funnel_id uuid;
begin
  for r in
    select id, template_id, slug, status from tenants where template_id is not null
  loop
    -- cria a instância (primeiro funil = primary), se ainda não existir
    if not exists (
      select 1 from tenant_funnels where tenant_id = r.id and template_id = r.template_id
    ) then
      insert into tenant_funnels (tenant_id, template_id, slug, enabled, is_primary)
      values (r.id, r.template_id, r.slug, (r.status = 'active'), true)
      returning id into v_funnel_id;
    else
      select id into v_funnel_id from tenant_funnels
      where tenant_id = r.id and template_id = r.template_id limit 1;
    end if;

    -- migra os itens do tenant p/ o funil criado
    update tenant_items
    set funnel_id = v_funnel_id
    where tenant_id = r.id and funnel_id is null;
  end loop;
end $$;

-- ============================================================
-- 5) Trigger guard de funil: impõe plans.max_funnels na criação
-- ============================================================
create or replace function public.tenant_funnels_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_limit integer;
  v_count integer;
begin
  if not (public.is_admin() or auth.uid() = new.tenant_id) then
    raise exception 'Acesso negado: operação permitida apenas ao dono ou admin';
  end if;

  select pl.max_funnels into v_limit
  from subscriptions s
  join plans pl on pl.id = s.plan_id
  where s.tenant_id = new.tenant_id
  order by s.created_at desc
  limit 1;

  if v_limit is not null and v_limit > 0 then
    select count(*) into v_count
    from tenant_funnels
    where tenant_id = new.tenant_id
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if v_count >= v_limit then
      raise exception 'Limite do plano atingido: máximo de % funil(is)', v_limit;
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_tenant_funnels_guard on public.tenant_funnels;
create trigger trg_tenant_funnels_guard
before insert on public.tenant_funnels
for each row execute function public.tenant_funnels_guard();

-- ============================================================
-- 6) RPCs admin: assign / unassign / list
-- ============================================================
create or replace function public.assign_funnel_to_tenant(
  p_tenant_id uuid,
  p_template_id uuid,
  p_slug text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_funnel_id uuid;
  v_slug text;
  v_tpl_slug text;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado: requer role admin';
  end if;

  if not exists (select 1 from tenants where id = p_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  select slug into v_tpl_slug from templates where id = p_template_id;
  if v_tpl_slug is null then
    raise exception 'Template nao encontrado';
  end if;

  if exists (select 1 from tenant_funnels where tenant_id = p_tenant_id and template_id = p_template_id) then
    raise exception 'Este funil já foi atribuído a este cliente';
  end if;

  -- slug: fornecido ou derivado <tenant_slug>-<template_slug> (garante unicidade)
  v_slug := coalesce(p_slug, (select slug || '-' || v_tpl_slug from tenants where id = p_tenant_id));

  insert into tenant_funnels (tenant_id, template_id, slug, enabled, is_primary)
  values (p_tenant_id, p_template_id, v_slug, true, false)
  returning id into v_funnel_id;

  return jsonb_build_object('funnel_id', v_funnel_id, 'slug', v_slug);
end;
$function$;

grant execute on function public.assign_funnel_to_tenant(uuid, uuid, text) to authenticated;

-- Remove (soft: desabilita) um funil do cliente
create or replace function public.unassign_funnel(p_funnel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $function$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado: requer role admin';
  end if;
  update tenant_funnels set enabled = false where id = p_funnel_id;
end;
$function$;

grant execute on function public.unassign_funnel(uuid) to authenticated;

-- Lista funis de um tenant (para admin e para o painel do cliente)
create or replace function public.list_tenant_funnels(p_tenant_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant uuid := coalesce(p_tenant_id, auth.uid());
begin
  if not (public.is_admin() or auth.uid() = v_tenant) then
    raise exception 'Acesso negado';
  end if;

  return jsonb_build_object(
    'funnels', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', tf.id,
        'tenant_id', tf.tenant_id,
        'template_id', tf.template_id,
        'slug', tf.slug,
        'enabled', tf.enabled,
        'is_primary', tf.is_primary,
        'template_name', tp.name,
        'template_niche', tp.niche,
        'template_slug', tp.slug,
        'item_count', (select count(*) from tenant_items ti where ti.funnel_id = tf.id),
        'profiles', (select count(*) from profiles p where p.template_id = tf.template_id)
      ) order by tf.is_primary desc, tf.created_at)
      from tenant_funnels tf
      join templates tp on tp.id = tf.template_id
      where tf.tenant_id = v_tenant
    ), '[]'::jsonb),
    'max_funnels', (
      select pl.max_funnels
      from subscriptions s join plans pl on pl.id = s.plan_id
      where s.tenant_id = v_tenant order by s.created_at desc limit 1
    )
  );
end;
$function$;

grant execute on function public.list_tenant_funnels(uuid) to authenticated;

-- ============================================================
-- 7) RPCs de itens passam a ser POR FUNIL
-- ============================================================

-- get_tenant_items agora filtra por funil e devolve a lista de funis
create or replace function public.get_tenant_items(p_funnel_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant_id uuid := auth.uid();
  v_limit integer;
  v_items jsonb;
  v_profiles jsonb;
  v_funnel uuid;
  v_template_id uuid;
begin
  if v_tenant_id is null then raise exception 'Nao autenticado'; end if;
  if not exists (select 1 from tenants where id = v_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  -- resolve o funil alvo (default: primary do tenant)
  if p_funnel_id is null then
    select id into v_funnel from tenant_funnels
    where tenant_id = v_tenant_id order by is_primary desc, created_at limit 1;
  else
    select id into v_funnel from tenant_funnels
    where id = p_funnel_id and tenant_id = v_tenant_id;
  end if;

  if v_funnel is null then
    return jsonb_build_object(
      'per_profile_limit', 0,
      'funnels', '[]'::jsonb,
      'profiles', '[]'::jsonb,
      'items', '[]'::jsonb,
      'funnel', null
    );
  end if;

  select pl.max_products_per_profile into v_limit
  from subscriptions s join plans pl on pl.id = s.plan_id
  where s.tenant_id = v_tenant_id order by s.created_at desc limit 1;

  -- template do funil
  select tf.template_id into v_template_id from tenant_funnels where id = v_funnel;

  select coalesce(jsonb_agg(item order by position), '[]'::jsonb) into v_items
  from (
    select jsonb_build_object(
      'id', ti.id,
      'profile_id', ti.profile_id,
      'funnel_id', ti.funnel_id,
      'name', ti.name,
      'description', ti.description,
      'key_actives', ti.key_actives,
      'support_text', ti.support_text,
      'price_cents', ti.price_cents,
      'redirect_url', ti.redirect_url,
      'enabled', ti.enabled,
      'position', ti.position
    ) as item,
    ti.position
    from tenant_items ti
    where ti.tenant_id = v_tenant_id and ti.funnel_id = v_funnel
  ) x;

  -- perfis do template do funil (conteúdo completo p/ "Ver perfil")
  select coalesce(jsonb_agg(prof order by display_order), '[]'::jsonb) into v_profiles
  from (
    select jsonb_build_object(
             'id', p.id,
             'name', p.name,
             'color', p.color,
             'archetype', p.archetype,
             'description', p.description,
             'scientific_basis', p.scientific_basis,
             'expected_effect', p.expected_effect
           ) as prof,
           p.display_order
    from profiles p
    where p.template_id = v_template_id
  ) y;

  return jsonb_build_object(
    'per_profile_limit', coalesce(v_limit, 0),
    'funnels', (select public.list_tenant_funnels(v_tenant_id) -> 'funnels'),
    'profiles', v_profiles,
    'items', v_items,
    'funnel', (select to_jsonb(tf) from tenant_funnels tf where tf.id = v_funnel)
  );
end;
$function$;

grant execute on function public.get_tenant_items(uuid) to authenticated;

-- upsert_tenant_item ganha p_funnel_id (obrigatório)
create or replace function public.upsert_tenant_item(
  p_tenant_id uuid,
  p_funnel_id uuid,
  p_profile_id uuid,
  p_name text,
  p_description text default null,
  p_key_actives jsonb default null,
  p_support_text text default null,
  p_price_cents integer default null,
  p_redirect_url text default '',
  p_enabled boolean default true,
  p_position integer default 0,
  p_item_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_row jsonb;
begin
  if not (public.is_admin() or auth.uid() = p_tenant_id) then
    raise exception 'Acesso negado: este tenant nao pertence a voce';
  end if;

  if not exists (select 1 from tenants where id = p_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  if not exists (select 1 from tenant_funnels where id = p_funnel_id and tenant_id = p_tenant_id) then
    raise exception 'Funil nao encontrado para este tenant';
  end if;

  if not exists (select 1 from profiles where id = p_profile_id) then
    raise exception 'Perfil nao encontrado';
  end if;

  if p_item_id is not null then
    update tenant_items set
      funnel_id = p_funnel_id,
      profile_id = p_profile_id,
      name = p_name,
      description = p_description,
      key_actives = p_key_actives,
      support_text = p_support_text,
      price_cents = p_price_cents,
      redirect_url = p_redirect_url,
      enabled = p_enabled,
      position = p_position,
      updated_at = now()
    where id = p_item_id and tenant_id = p_tenant_id;

    if not found then
      raise exception 'Item nao encontrado';
    end if;
  else
    insert into tenant_items
      (tenant_id, funnel_id, profile_id, name, description, key_actives, support_text,
       price_cents, redirect_url, enabled, position)
    values
      (p_tenant_id, p_funnel_id, p_profile_id, p_name, p_description, p_key_actives, p_support_text,
       p_price_cents, p_redirect_url, p_enabled, p_position);
  end if;

  select jsonb_build_object(
    'id', ti.id,
    'tenant_id', ti.tenant_id,
    'funnel_id', ti.funnel_id,
    'profile_id', ti.profile_id,
    'name', ti.name,
    'description', ti.description,
    'key_actives', ti.key_actives,
    'support_text', ti.support_text,
    'price_cents', ti.price_cents,
    'redirect_url', ti.redirect_url,
    'enabled', ti.enabled,
    'position', ti.position
  ) into v_row
  from tenant_items ti
  where (p_item_id is not null and ti.id = p_item_id)
     or (p_item_id is null and ti.tenant_id = p_tenant_id and ti.funnel_id = p_funnel_id and ti.name = p_name)
  order by ti.created_at desc
  limit 1;

  return v_row;
end;
$function$;

grant execute on function public.upsert_tenant_item(uuid,uuid,uuid,text,text,jsonb,text,integer,text,boolean,integer,uuid) to authenticated;

-- ============================================================
-- 8) get_funnel resolve por funnel slug (multi-funil)
-- ============================================================
create or replace function public.get_funnel(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant_id uuid;
  v_funnel_id uuid;
  v_template_id uuid;
  v_template jsonb;
  v_profiles jsonb;
  v_questions jsonb;
  v_protocol jsonb;
begin
  -- 1) resolve por tenant_funnels.slug com tenant ativo
  select tf.id, tf.tenant_id, tf.template_id into v_funnel_id, v_tenant_id, v_template_id
  from tenant_funnels tf
  join tenants tn on tn.id = tf.tenant_id
  where tf.slug = p_slug and tf.enabled = true and tn.status = 'active';

  -- 2) fallback: preview/seed direto pelo template slug
  if v_template_id is null then
    select t.id into v_template_id from templates t
    where t.slug = p_slug and t.is_active = true;
    if v_template_id is null then
      return jsonb_build_object('error', 'template_not_found');
    end if;
  end if;

  select jsonb_build_object('id', t.id, 'slug', t.slug, 'name', t.name,
    'niche', t.niche, 'description', t.description) into v_template
  from templates t where t.id = v_template_id;

  select coalesce(jsonb_agg(pb order by (pb->>'display_order')::int), '[]'::jsonb) into v_profiles
  from (
    select jsonb_build_object('id', p.id, 'name', p.name, 'archetype', p.archetype,
      'description', p.description, 'scientific_basis', p.scientific_basis,
      'expected_effect', p.expected_effect, 'references', to_jsonb(p."references"),
      'notes', to_jsonb(p.notes), 'color', p.color, 'display_order', p.display_order) as pb
    from profiles p where p.template_id = v_template_id
  ) pb;

  select coalesce(jsonb_agg(qb order by (qb->>'position')::int), '[]'::jsonb) into v_questions
  from (
    select jsonb_build_object('id', q.id, 'text', q.text, 'position', q.position,
      'weight', q.weight,
      'options', (select coalesce(jsonb_agg(ob order by (ob->>'position')::int), '[]'::jsonb)
        from (select jsonb_build_object('id', o.id, 'text', o.text,
          'profile_ids', to_jsonb(o.profile_ids), 'position', o.position) as ob
          from quiz_options o where o.question_id = q.id) ob)) as qb
    from quiz_questions q where q.template_id = v_template_id
  ) qb;

  -- protocolo: itens do cliente POR FUNIL (se aplicável)
  if v_funnel_id is not null and v_tenant_id is not null then
    select coalesce(jsonb_agg(pr), '[]'::jsonb) into v_protocol
    from (
      select jsonb_build_object(
        'profile_id', ti.profile_id,
        'products', coalesce(jsonb_agg(jsonb_build_object(
          'id', ti.id, 'name', ti.name, 'description', ti.description,
          'key_actives', ti.key_actives, 'support_text', ti.support_text,
          'price_cents', ti.price_cents, 'redirect_url', ti.redirect_url,
          'is_kit', false, 'profile_id', ti.profile_id, 'source', 'tenant_item'
        ) order by ti.position, ti.created_at), '[]'::jsonb)) as pr
      from tenant_items ti
      where ti.tenant_id = v_tenant_id and ti.funnel_id = v_funnel_id and ti.enabled = true
      group by ti.profile_id
    ) pr;

    if v_protocol = '[]'::jsonb or v_protocol is null then
      select coalesce(jsonb_agg(pr), '[]'::jsonb) into v_protocol
      from (
        select jsonb_build_object(
          'profile_id', tpp.profile_id,
          'products', coalesce(jsonb_agg(jsonb_build_object(
            'id', prd.id, 'name', prd.name, 'category', prd.category,
            'description', prd.description, 'is_kit', prd.is_kit,
            'price_cents', prd.price_cents, 'support_text', prd.support_text,
            'source', 'template_catalog'
          ) order by tpp.position), '[]'::jsonb)) as pr
        from template_profile_products tpp
        join products prd on prd.id = tpp.product_id
        where tpp.template_id = v_template_id
        group by tpp.profile_id
      ) pr;
    end if;
  else
    select coalesce(jsonb_agg(pr), '[]'::jsonb) into v_protocol
    from (
      select jsonb_build_object(
        'profile_id', tpp.profile_id,
        'products', coalesce(jsonb_agg(jsonb_build_object(
          'id', prd.id, 'name', prd.name, 'category', prd.category,
          'description', prd.description, 'is_kit', prd.is_kit,
          'price_cents', prd.price_cents, 'support_text', prd.support_text,
          'source', 'template_catalog'
        ) order by tpp.position), '[]'::jsonb)) as pr
      from template_profile_products tpp
      join products prd on prd.id = tpp.product_id
      where tpp.template_id = v_template_id
      group by tpp.profile_id
    ) pr;
  end if;

  return jsonb_build_object(
    'template', v_template,
    'tenant_id', v_tenant_id,
    'funnel_id', v_funnel_id,
    'tenant', (select jsonb_build_object('id', id, 'name', name, 'slug', slug, 'whatsapp', whatsapp)
      from tenants where id = v_tenant_id),
    'profiles', v_profiles,
    'questions', v_questions,
    'protocol', v_protocol
  );
end;
$function$;

grant execute on function public.get_funnel(text) to anon, authenticated;

-- create_tenant_with_trial agora cria também o 1º tenant_funnel (primary)
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
  v_funnel_id uuid;
begin
  select id into v_basic_plan_id from plans where slug = 'basic' limit 1;

  insert into tenants (slug, name, template_id, primary_color, secondary_color, accent_color, status)
  values (p_slug, p_name, p_template_id, p_primary_color, p_secondary_color, p_accent_color, 'active')
  returning id into v_tenant_id;

  insert into subscriptions (tenant_id, plan_id, status, current_period_start, current_period_end)
  values (v_tenant_id, v_basic_plan_id, 'trial', now(), now() + interval '30 days');

  -- cria o primeiro funil (primary), reusando o slug do tenant
  insert into tenant_funnels (tenant_id, template_id, slug, enabled, is_primary)
  values (v_tenant_id, p_template_id, p_slug, true, true);

  return v_tenant_id;
end;
$$ security definer;