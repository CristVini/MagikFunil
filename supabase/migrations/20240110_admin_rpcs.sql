-- ============================================================
-- MIGRAÇÃO 10 - RPCs admin (get_admin_data, get_admin_plans)
-- MagikFunil
-- SECURITY DEFINER + checagem de role admin no corpo. Devolve dados
-- reais para as telas de Admin: tenants (com plano/assinatura/leads),
-- templates (com counts), e planos.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1 from auth.users
    where id = auth.uid() and raw_user_meta_data ->> 'role' = 'admin'
  );
$function$;

grant execute on function public.is_admin() to authenticated, anon;

-- Dados agregados para o Admin (exige role admin)
create or replace function public.get_admin_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_json jsonb;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado: requer role admin';
  end if;

  select jsonb_build_object(
    'tenants', coalesce((
      select jsonb_agg(t.order by t.created_at desc)
      from (
        select jsonb_build_object(
          'id', tn.id,
          'name', tn.name,
          'slug', tn.slug,
          'delivery_status', tn.status,
          'email', '',
          'created_at', tn.created_at,
          'plan_id', (select s.plan_id from subscriptions s where s.tenant_id = tn.id order by s.created_at desc limit 1),
          'plan_slug', (select pl.slug from subscriptions s join plans pl on pl.id = s.plan_id where s.tenant_id = tn.id order by s.created_at desc limit 1),
          'plan_name', (select pl.name from subscriptions s join plans pl on pl.id = s.plan_id where s.tenant_id = tn.id order by s.created_at desc limit 1),
          'plan_price', (select pl.price_monthly_cents from subscriptions s join plans pl on pl.id = s.plan_id where s.tenant_id = tn.id order by s.created_at desc limit 1),
          'billing_status', (select s.status from subscriptions s where s.tenant_id = tn.id order by s.created_at desc limit 1),
          'leads', (select count(*) from leads l where l.tenant_id = tn.id)
        ) t
        from tenants tn
      ) t
    ), '[]'::jsonb),
    'templates', coalesce((
      select jsonb_agg(t.order by t.created_at)
      from (
        select jsonb_build_object(
          'id', tp.id,
          'name', tp.name,
          'slug', tp.slug,
          'niche', tp.niche,
          'created_at', tp.created_at,
          'profiles', (select count(*) from profiles p where p.template_id = tp.id),
          'questions', (select count(*) from quiz_questions q where q.template_id = tp.id),
          'products', (select count(*) from products pr where pr.template_id = tp.id),
          'tenants', (select count(*) from tenants tn where tn.template_id = tp.id)
        ) t
        from templates tp
      ) t
    ), '[]'::jsonb)
  ) into v_json;

  return v_json;
end;
$function$;

grant execute on function public.get_admin_data() to authenticated, anon;

-- Planos para o Admin (tela de planos + selects)
create or replace function public.get_admin_plans()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado: requer role admin';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', pl.id,
      'slug', pl.slug,
      'name', pl.name,
      'price_monthly_cents', pl.price_monthly_cents,
      'max_products', pl.max_products,
      'max_clicks_month', pl.max_clicks_month,
      'custom_domain', pl.custom_domain,
      'multi_user', pl.multi_user,
      'trial_days', pl.trial_days
    ) order by pl.position)
    from plans pl
  ), '[]'::jsonb);
end;
$function$;

grant execute on function public.get_admin_plans() to authenticated, anon;