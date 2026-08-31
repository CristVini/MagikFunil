-- ============================================================
-- MIGRAÇÃO 2 - Kits, preços e promoção (recurso premium)
-- MagikFunil - sa-east-1
-- Evolui a migration base com as features de produtos/kits
-- que vieram do front (mock) para o backend.
-- ============================================================

-- 1) PRODUTOS: flag is_kit + preço normal + texto de apoio (valores-padrão do template)
alter table products
  add column if not exists is_kit          boolean not null default false,
  add column if not exists price_cents     integer,
  add column if not exists support_text    text;

-- 2) TENANT_PRODUCTS: override do cliente (reflete no funil)
alter table tenant_products
  add column if not exists kit_name        text,               -- nome do kit (override)
  add column if not exists support_text    text,               -- texto de apoio (override)
  add column if not exists price_cents     integer,            -- preço normal (override)
  add column if not exists promo_price_cents integer,          -- preço promocional
  add column if not exists show_promo      boolean not null default false; -- exibir promoção

-- 3) Índice para resolução rápida do funil (tenant + produto ativo)
create index if not exists idx_tenant_products_promo
  on tenant_products (tenant_id, enabled, show_promo);

-- 4) Policy: tenant pode INSERT nos seus próprios productos ativados
-- (no onboarding, o tenant cria o vínculo produto ← tenant)
create policy "tp_insert_own" on tenant_products
  for insert with check (tenant_id in (select id from tenants where auth.uid()::text = id::text));

-- 5) Função helper: tenant pode usar promoção? (recurso EXCLUSIVO Enterprise)
--    Usada na trava de escrita (upsert) e na leitura (get_funnel).
create or replace function tenant_can_promo(p_tenant uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from subscriptions s
    join plans p on p.id = s.plan_id
    where s.tenant_id = p_tenant
      and p.slug = 'enterprise'
      and s.status in ('trial', 'active')
  );
$$;

-- 6) Função: upsert de tenant_product com TRAVA de plano para promoção.
--    - Se o cliente tenta setar promo/show_promo sem plano Enterprise, ignora a promo.
--    - Devolve a linha final (com ou sem promo), p/ o front mostrar o que valeu.
create or replace function upsert_tenant_product(
  p_tenant_id uuid,
  p_product_id uuid,
  p_redirect_url text,
  p_enabled boolean default true,
  p_position int default 0,
  p_kit_name text default null,
  p_support_text text default null,
  p_price_cents integer default null,
  p_promo_price_cents integer default null,
  p_show_promo boolean default false
) returns jsonb language plpgsql as $$
declare
  v_can_promo boolean;
  v_row jsonb;
begin
  v_can_promo := tenant_can_promo(p_tenant_id);

  -- Trava: sem Enterprise, promoção é ignorada (nunca confia só na UI)
  if not v_can_promo then
    p_promo_price_cents := null;
    p_show_promo := false;
  end if;

  insert into tenant_products
    (tenant_id, product_id, redirect_url, enabled, position,
     kit_name, support_text, price_cents, promo_price_cents, show_promo)
  values
    (p_tenant_id, p_product_id, p_redirect_url, p_enabled, p_position,
     p_kit_name, p_support_text, p_price_cents, p_promo_price_cents, p_show_promo)
  on conflict (tenant_id, product_id) do update set
    redirect_url = excluded.redirect_url,
    enabled = excluded.enabled,
    position = excluded.position,
    kit_name = excluded.kit_name,
    support_text = excluded.support_text,
    price_cents = excluded.price_cents,
    promo_price_cents = excluded.promo_price_cents,
    show_promo = excluded.show_promo,
    updated_at = now();

  select jsonb_build_object(
    'tenant_id', tp.tenant_id,
    'product_id', tp.product_id,
    'redirect_url', tp.redirect_url,
    'enabled', tp.enabled,
    'kit_name', tp.kit_name,
    'support_text', tp.support_text,
    'price_cents', tp.price_cents,
    'promo_price_cents', tp.promo_price_cents,
    'show_promo', tp.show_promo,
    'tenant_can_promo', v_can_promo
  ) into v_row
  from tenant_products tp
  where tp.tenant_id = p_tenant_id and tp.product_id = p_product_id;

  return v_row;
end;
$$ language plpgsql security definer;