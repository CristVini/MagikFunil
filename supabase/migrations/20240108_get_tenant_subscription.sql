-- ============================================================
-- MIGRAÇÃO 8 - RPC get_tenant_subscription (assinatura + plano do tenant)
-- MagikFunil
-- SECURITY DEFINER: resolve pela subscription do tenant (auth.uid()),
-- traz plano + contagens de uso reais (produtos ativos, leads no mês).
-- ============================================================
create or replace function public.get_tenant_subscription()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant_id uuid := auth.uid();
  v_active_products integer;
  v_leads_month integer;
begin
  if v_tenant_id is null then
    raise exception 'Nao autenticado';
  end if;
  if not exists (select 1 from tenants where id = v_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  select count(*) into v_active_products from tenant_products where tenant_id = v_tenant_id and enabled = true;
  select count(*) into v_leads_month from leads where tenant_id = v_tenant_id and created_at >= date_trunc('month', now());

  return jsonb_build_object(
    'tenant', (select jsonb_build_object('id', id, 'name', name, 'slug', slug) from tenants where id = v_tenant_id),
    'subscription', (
      select jsonb_build_object(
        'id', s.id,
        'status', s.status,
        'current_period_end', s.current_period_end,
        'canceled_at', s.canceled_at
      )
      from subscriptions s
      where s.tenant_id = v_tenant_id
      order by s.created_at desc
      limit 1
    ),
    'plan', (
      select jsonb_build_object(
        'slug', pl.slug,
        'name', pl.name,
        'price_monthly_cents', pl.price_monthly_cents,
        'max_products', pl.max_products,
        'max_clicks_month', pl.max_clicks_month,
        'custom_domain', pl.custom_domain,
        'trial_days', pl.trial_days
      )
      from subscriptions s
      join plans pl on pl.id = s.plan_id
      where s.tenant_id = v_tenant_id
      order by s.created_at desc
      limit 1
    ),
    'usage', jsonb_build_object(
      'activeProducts', v_active_products,
      'leadsThisMonth', v_leads_month
    ),
    'billing_history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', be.created_at,
        'type', be.kind,
        'description', case be.kind
          when 'subscription_start' then 'Início do período'
          when 'payment_received' then 'Pagamento recebido'
          when 'trial_start' then 'Início do período de teste'
          else be.kind
        end,
        'amount_cents', coalesce(be.amount_cents, 0)
      ) order by be.created_at desc)
      from billing_events be
      where be.tenant_id = v_tenant_id
      limit 20
    ), '[]'::jsonb)
  );
end;
$function$;

grant execute on function public.get_tenant_subscription() to authenticated, anon;

-- Limites de uso por plano (Basic 3 / Pro 6 / Enterprise 99 produtos)
update plans set max_products = case slug when 'basic' then 3 when 'pro' then 6 when 'enterprise' then 99 end,
max_clicks_month = case slug when 'basic' then 1000 when 'pro' then 5000 when 'enterprise' then 100000 end
where slug in ('basic','pro','enterprise');