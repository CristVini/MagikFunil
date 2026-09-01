-- ============================================================
-- MIGRAÇÃO 9 - RPC get_tenant_catalog (catálogo do tenant: produtos + plano)
-- MagikFunil
-- SECURITY DEFINER: resolve tenant por auth.uid(). Devolve os produtos do
-- template com as overrides do tenant (enabled, redirect, kit, preços, promo)
-- agrupados por perfil, + o plano com limites (max_products, allowsPromo).
-- ============================================================
create or replace function public.get_tenant_catalog()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant_id uuid := auth.uid();
  v_plan_slug text;
  v_max_products integer;
  v_allows_promo boolean;
  v_template_id uuid;
  v_produtos jsonb;
begin
  if v_tenant_id is null then raise exception 'Nao autenticado'; end if;
  if not exists (select 1 from tenants where id = v_tenant_id) then raise exception 'Tenant nao encontrado'; end if;

  select pl.slug, pl.max_products, (pl.slug = 'enterprise')
    into v_plan_slug, v_max_products, v_allows_promo
  from subscriptions s join plans pl on pl.id = s.plan_id
  where s.tenant_id = v_tenant_id order by s.created_at desc limit 1;

  select template_id into v_template_id from tenants where id = v_tenant_id;

  select coalesce(jsonb_agg(item order by prof_order, pr_order), '[]'::jsonb) into v_produtos
  from (
    select
      jsonb_build_object(
        'id', pr.id,
        'name', coalesce(tp.kit_name, pr.name),
        'category', pr.category,
        'description', pr.description,
        'is_kit', pr.is_kit,
        'enabled', coalesce(tp.enabled, false),
        'redirect_url', coalesce(tp.redirect_url, ''),
        'position', coalesce(tp.position, pr.display_order),
        'support_text', coalesce(tp.support_text, pr.support_text),
        'price_cents', coalesce(tp.price_cents, pr.price_cents),
        'promo_price_cents', tp.promo_price_cents,
        'show_promo', coalesce(tp.show_promo, false),
        'profile', p.id,
        'profileLabel', p.name,
        'display_order', pr.display_order,
        'prof_order', p.display_order,
        'pr_order', pr.display_order
      ) as item,
      p.display_order as prof_order,
      pr.display_order as pr_order
    from products pr
    left join template_profile_products tpp on tpp.product_id = pr.id
    left join profiles p on p.id = tpp.profile_id
    left join tenant_products tp on tp.product_id = pr.id and tp.tenant_id = v_tenant_id
    where pr.template_id = v_template_id
  ) t;

  if v_produtos is null then v_produtos := '[]'::jsonb; end if;

  return jsonb_build_object(
    'tenant', (select jsonb_build_object('id', id, 'name', name, 'slug', slug) from tenants where id = v_tenant_id),
    'plan', jsonb_build_object('name', v_plan_slug, 'max_products', coalesce(v_max_products, 0), 'allowsPromo', coalesce(v_allows_promo, false)),
    'products', v_produtos
  );
end;
$function$;

grant execute on function public.get_tenant_catalog() to authenticated, anon;