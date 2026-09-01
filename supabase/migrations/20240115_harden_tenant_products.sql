-- ============================================================
-- MIGRAÇÃO 15 - Endurecimento da monetização (promo + limite no servidor)
-- MagikFunil
-- 1) upsert_tenant_product passa a exigir auth.uid() = tenant (ou admin) —
--    impede um usuário sobrescrever produtos de OUTRO tenant via RPC.
-- 2) Trigger em tenant_products impõe, na origem (qualquer road de escrita):
--      - promoção (show_promo/promo_price_cents) apenas p/ Enterprise;
--      - limite max_products do plano (não ativar além);
--      - autorização: tenant_id da linha deve ser o usuário logado (ou admin).
-- ============================================================

-- Guarda de autorização + promo + limite
create or replace function public.tenant_products_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_can_promo boolean;
  v_max_products integer;
  v_active integer;
  v_owner uuid;
begin
  -- Autorização: só o dono (auth.uid() = tenant_id) ou admin pode escrever
  v_owner := new.tenant_id;
  if not (public.is_admin() or auth.uid() = v_owner) then
    raise exception 'Acesso negado: operacao permitida apenas ao dono do tenant';
  end if;

  select public.tenant_can_promo(v_owner) into v_can_promo;

  -- Trava de promoção: não-Enterprise não guarda preço/show de promo
  if not v_can_promo then
    new.show_promo := false;
    new.promo_price_cents := null;
  end if;

  -- Limite do plano: impede ativar mais produtos que o max_products
  if new.enabled then
    select max_products into v_max_products
    from subscriptions s join plans pl on pl.id = s.plan_id
    where s.tenant_id = v_owner order by s.created_at desc limit 1;

    if v_max_products is not null and v_max_products > 0 then
      select count(*) into v_active
      from tenant_products
      where tenant_id = v_owner and enabled = true and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

      if v_active >= v_max_products then
        raise exception 'Limite do plano atingido: maximo de % produtos ativos', v_max_products;
      end if;
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_tenant_products_guard on tenant_products;
create trigger trg_tenant_products_guard
before insert or update on tenant_products
for each row execute function public.tenant_products_guard();

-- upsert_tenant_product: valida que o chamador é o dono (ou admin)
create or replace function public.upsert_tenant_product(
  p_tenant_id uuid, p_product_id uuid, p_redirect_url text,
  p_enabled boolean default true, p_position integer default 0,
  p_kit_name text default null, p_support_text text default null,
  p_price_cents integer default null, p_promo_price_cents integer default null,
  p_show_promo boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_can_promo boolean;
  v_row jsonb;
begin
  -- autorização: dono ou admin
  if not (public.is_admin() or auth.uid() = p_tenant_id) then
    raise exception 'Acesso negado: este tenant nao pertence a voce';
  end if;

  if not exists (select 1 from tenants where id = p_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  v_can_promo := public.tenant_can_promo(p_tenant_id);
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
    redirect_url = excluded.redirect_url, enabled = excluded.enabled, position = excluded.position,
    kit_name = excluded.kit_name, support_text = excluded.support_text,
    price_cents = excluded.price_cents, promo_price_cents = excluded.promo_price_cents,
    show_promo = excluded.show_promo, updated_at = now();

  select jsonb_build_object(
    'tenant_id', tp.tenant_id, 'product_id', tp.product_id, 'redirect_url', tp.redirect_url,
    'enabled', tp.enabled, 'kit_name', tp.kit_name, 'support_text', tp.support_text,
    'price_cents', tp.price_cents, 'promo_price_cents', tp.promo_price_cents,
    'show_promo', tp.show_promo, 'tenant_can_promo', v_can_promo
  ) into v_row
  from tenant_products tp
  where tp.tenant_id = p_tenant_id and tp.product_id = p_product_id;

  return v_row;
end;
$function$;

grant execute on function public.upsert_tenant_product(uuid,uuid,text,boolean,integer,text,text,integer,integer,boolean) to authenticated;