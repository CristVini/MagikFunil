-- ============================================================
-- MIGRAÇÃO 11 - RPC get_admin_dashboard (KPIs agregados do Admin)
-- MagikFunil
-- SECURITY DEFINER + role admin. MRR (subscriptions ativas * plano),
-- tenants ativos/trial, leads totais, leads por tenant, top produtos.
-- ============================================================
create or replace function public.get_admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_mrr integer;
  v_active_tenants integer;
  v_trial_tenants integer;
  v_leads integer;
begin
  if not public.is_admin() then raise exception 'Acesso negado: requer role admin'; end if;

  select coalesce(sum(pl.price_monthly_cents), 0) into v_mrr
  from subscriptions s join plans pl on pl.id = s.plan_id
  where s.status in ('active','trial');

  select count(*) into v_active_tenants from tenants where status = 'active';
  select count(*) into v_trial_tenants from subscriptions where status = 'trial';
  select count(*) into v_leads from leads;

  return jsonb_build_object(
    'kpis', jsonb_build_object(
      'mrrCents', v_mrr,
      'activeTenants', v_active_tenants,
      'trialTenants', v_trial_tenants,
      'totalLeads', v_leads
    ),
    'leads_by_tenant', coalesce((
      select jsonb_agg(jsonb_build_object('tenant', tn.name, 'leads', cnt, 'color', '#F59E0B') order by cnt desc)
      from (select tenant_id, count(*) as cnt from leads group by tenant_id) l
      join tenants tn on tn.id = l.tenant_id
    ), '[]'::jsonb),
    'top_products', coalesce((
      select jsonb_agg(jsonb_build_object('name', coalesce(pr.name, 'Produto'), 'clicks', cnt) order by cnt desc limit 5)
      from (select product_id, count(*) as cnt from events where product_id is not null group by product_id) e
      left join products pr on pr.id = e.product_id
    ), '[]'::jsonb)
  );
end;
$function$;

grant execute on function public.get_admin_dashboard() to authenticated, anon;