-- ============================================================
-- MIGRAÇÃO 17 - Itens do cliente (cadastro livre, por perfil)
-- MagikFunil
--
-- IDEIA CENTRAL: nosso funil AQUECE o visitante; o CLIENTE coloca
-- os produtos DELE (que fazem sentido pro cliente dele) para o
-- visitante VISUALIZAR e COMPRAR depois.
--
-- O que esta migração faz:
--  1) Nova tabela `tenant_items`: cadastro LIVRE de itens pelo cliente,
--     vinculado a um perfil (benefício) do funil. Campos próprios
--     (nome, descrição, composição, preço opcional, link de venda).
--  2) Nova coluna `plans.max_products_per_profile`: limite de itens
--     POR PERFIL (Basic=1, Pro=2, Enterprise=6). Substitui o teto global
--     `max_products` na regra de itens.
--  3) Trigger `tenant_items_guard`: impõe, na origem (qualquer escrita):
--        - autorização (dono do tenant ou admin);
--        - limite de itens ativos POR PERFIL do plano.
--  4) RPC `upsert_tenant_item`: cadastro/edição de item pelo cliente,
--     validando auth.uid() e o limite por perfil.
--
-- O catálogo do template (`products`/`tenant_products`) permanece
-- intacto como REFERÊNCIA/EXEMPLO durante a migração gradual da UI.
-- ============================================================

-- ============================================================
-- 1) Nova coluna de limite por perfil no plano
-- ============================================================
alter table public.plans
  add column if not exists max_products_per_profile integer;

-- Basic=1, Pro=2, Enterprise=6 (conforme regra de negócio)
update public.plans set max_products_per_profile = 1 where slug = 'basic';
update public.plans set max_products_per_profile = 2 where slug = 'pro';
update public.plans set max_products_per_profile = 6 where slug = 'enterprise';

-- ============================================================
-- 2) Tabela de itens do cliente (cadastro livre por perfil)
-- ============================================================
create table if not exists public.tenant_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  key_actives jsonb,          -- composição (ativo(s) do item)
  support_text text,          -- texto de apoio
  price_cents integer,        -- opcional: se null, venda fecha no canal/WhatsApp
  redirect_url text,          -- canal de venda (WhatsApp, loja, etc.)
  enabled boolean not null default true,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tenant_items_tenant on public.tenant_items(tenant_id);
create index if not exists idx_tenant_items_profile on public.tenant_items(profile_id);
create index if not exists idx_tenant_items_enabled on public.tenant_items(tenant_id, profile_id, enabled);

alter table public.tenant_items enable row level security;

-- Tenant vê/edita só os próprios itens
create policy "ti_select_own" on public.tenant_items
  for select using (tenant_id = auth.uid());

create policy "ti_insert_own" on public.tenant_items
  for insert with check (tenant_id = auth.uid());

create policy "ti_update_own" on public.tenant_items
  for update using (tenant_id = auth.uid());

create policy "ti_delete_own" on public.tenant_items
  for delete using (tenant_id = auth.uid());

-- Admin vê/edita tudo
create policy "ti_all_admin" on public.tenant_items
  for all using (public.is_admin());

-- ============================================================
-- 3) Trigger: autorização + limite por perfil
-- ============================================================
create or replace function public.tenant_items_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_owner uuid;
  v_limit integer;
  v_active integer;
begin
  -- Autorização: só o dono (auth.uid() = tenant_id) ou admin
  v_owner := new.tenant_id;
  if not (public.is_admin() or auth.uid() = v_owner) then
    raise exception 'Acesso negado: operacao permitida apenas ao dono do tenant';
  end if;

  -- Limite POR PERFIL, sempre (mesmo se o item for inserido desativado,
  -- a regra vale para itens enabled=true).
  if new.enabled then
    select pl.max_products_per_profile into v_limit
    from subscriptions s
    join plans pl on pl.id = s.plan_id
    where s.tenant_id = v_owner
    order by s.created_at desc
    limit 1;

    if v_limit is not null and v_limit > 0 then
      select count(*) into v_active
      from tenant_items
      where tenant_id = v_owner
        and profile_id = new.profile_id
        and enabled = true
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

      if v_active >= v_limit then
        raise exception 'Limite do plano atingido: máximo de % itens ativos para este perfil', v_limit;
      end if;
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_tenant_items_guard on public.tenant_items;
create trigger trg_tenant_items_guard
before insert or update on public.tenant_items
for each row execute function public.tenant_items_guard();

-- ============================================================
-- 4) RPC: cadastro/edição de item pelo cliente
-- ============================================================
create or replace function public.upsert_tenant_item(
  p_tenant_id uuid,
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
  -- autorização: dono ou admin
  if not (public.is_admin() or auth.uid() = p_tenant_id) then
    raise exception 'Acesso negado: este tenant nao pertence a voce';
  end if;

  if not exists (select 1 from tenants where id = p_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  if not exists (select 1 from profiles where id = p_profile_id) then
    raise exception 'Perfil nao encontrado';
  end if;

  -- Update de item existente
  if p_item_id is not null then
    update tenant_items set
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
    -- Insert de novo item
    insert into tenant_items
      (tenant_id, profile_id, name, description, key_actives, support_text,
       price_cents, redirect_url, enabled, position)
    values
      (p_tenant_id, p_profile_id, p_name, p_description, p_key_actives, p_support_text,
       p_price_cents, p_redirect_url, p_enabled, p_position);
  end if;

  select jsonb_build_object(
    'id', ti.id,
    'tenant_id', ti.tenant_id,
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
     or (p_item_id is null and ti.tenant_id = p_tenant_id and ti.name = p_name)
  order by ti.created_at desc
  limit 1;

  return v_row;
end;
$function$;

grant execute on function public.upsert_tenant_item(uuid,uuid,text,text,jsonb,text,integer,text,boolean,integer,uuid) to authenticated;

-- ============================================================
-- 5) RPC: listar itens do tenant + limite por perfil (para a UI)
-- ============================================================
create or replace function public.get_tenant_items()
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
begin
  if v_tenant_id is null then raise exception 'Nao autenticado'; end if;
  if not exists (select 1 from tenants where id = v_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  select pl.max_products_per_profile into v_limit
  from subscriptions s join plans pl on pl.id = s.plan_id
  where s.tenant_id = v_tenant_id order by s.created_at desc limit 1;

  select coalesce(jsonb_agg(item order by position), '[]'::jsonb) into v_items
  from (
    select jsonb_build_object(
      'id', ti.id,
      'profile_id', ti.profile_id,
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
    where ti.tenant_id = v_tenant_id
  ) x;

  -- Perfis do funil (para a UI listar as seções, o dropdown de vínculo
  -- e o botão "Ver perfil" — conteúdo completo para o cliente entender
  -- o que aquele resultado significa pro visitante)
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
    join tenants t on t.template_id = p.template_id
    where t.id = v_tenant_id
  ) y;

  return jsonb_build_object(
    'per_profile_limit', coalesce(v_limit, 0),
    'profiles', v_profiles,
    'items', v_items
  );
end;
$function$;

grant execute on function public.get_tenant_items() to authenticated;