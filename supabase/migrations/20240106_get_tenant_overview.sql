-- ============================================================
-- MIGRAÇÃO 6 - RPCs de analytics do dashboard do tenant
-- MagikFunil
-- Ownership: tenants.id = auth.uid() (o tenant É o usuário dono)
-- Todas são SECURITY DEFINER e resolvem o tenant por auth.uid(),
-- impedindo uma pessoa de ler dados de outro tenant.
-- ============================================================

-- Visão geral: KPI + funil + leads/dia + distribuição de perfis + top produtos
create or replace function public.get_tenant_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant_id uuid := auth.uid();
  v_json jsonb;
  v_total_leads integer;
  v_quiz_completed integer;
  v_clicks integer;
  v_last30_leads integer;
begin
  if v_tenant_id is null then
    raise exception 'Nao autenticado';
  end if;

  if not exists (select 1 from tenants where id = v_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  select count(*) into v_total_leads from leads where tenant_id = v_tenant_id;
  select count(*) into v_quiz_completed from events where tenant_id = v_tenant_id and kind = 'quiz_complete';
  select count(*) into v_clicks from events where tenant_id = v_tenant_id and kind = 'product_click';
  select count(*) into v_last30_leads from leads where tenant_id = v_tenant_id and created_at >= now() - interval '30 days';

  select jsonb_build_object(
    'tenant', (
      select jsonb_build_object('id', id, 'name', name, 'slug', slug, 'whatsapp', whatsapp, 'status', status)
      from tenants where id = v_tenant_id
    ),
    'kpis', jsonb_build_object(
      'totalLeads', v_total_leads,
      'quizCompleted', v_quiz_completed,
      'productClicks', v_clicks,
      'conversionRate', case when v_total_leads = 0 then 0
                              else round((v_last30_leads::numeric / v_total_leads) * 100, 1) end
    ),
    'funnel', jsonb_build_array(
      jsonb_build_object('stage', 'Visitas', 'value', v_total_leads, 'color', '#A8A29E'),
      jsonb_build_object('stage', 'Quiz iniciado', 'value', v_total_leads, 'color', '#16A34A'),
      jsonb_build_object('stage', 'Quiz concluído', 'value', v_quiz_completed, 'color', '#EC4899'),
      jsonb_build_object('stage', 'Cliques', 'value', v_clicks, 'color', '#F59E0B')
    ),
    'leads_by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', to_char(created_at, 'DD/MM'), 'leads', cnt) order by d)
      from (
        select date_trunc('day', created_at) as d, count(*) as cnt
        from leads
        where tenant_id = v_tenant_id and created_at >= now() - interval '15 days'
        group by date_trunc('day', created_at)
        order by d
      ) sub
    ), '[]'::jsonb),
    'profile_distribution', coalesce((
      select jsonb_agg(jsonb_build_object(
        'label', coalesce(p.name, 'Outros'),
        'count', cnt,
        'color', coalesce(p.color, '#78716C')
      ) order by cnt desc)
      from (
        select coalesce(winning_profile, '00000000-0000-0000-0000-000000000000') as pid, count(*) as cnt
        from leads
        where tenant_id = v_tenant_id
        group by winning_profile
      ) l
      left join profiles p on p.id = l.pid::uuid
    ), '[]'::jsonb),
    'top_products', coalesce((
      select jsonb_agg(jsonb_build_object('id', e.product_id, 'name', coalesce(pr.name, 'Produto'), 'clicks', cnt))
      from (
        select product_id, count(*) as cnt
        from events
        where tenant_id = v_tenant_id and kind = 'product_click' and product_id is not null
        group by product_id
        order by cnt desc
        limit 5
      ) e
      left join products pr on pr.id = e.product_id
    ), '[]'::jsonb)
  ) into v_json;

  return v_json;
end;
$function$;

grant execute on function public.get_tenant_overview() to authenticated;
grant execute on function public.get_tenant_overview() to anon;