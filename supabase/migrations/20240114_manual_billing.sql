-- ============================================================
-- MIGRAÇÃO 14 - Cobrança manual (upgrade sem Stripe)
-- MagikFunil
-- Fluxo: tenant solicita troca de plano -> status past_due (aguardando
-- pagamento) + billing_event plan_change_requested. Admin aprova
-- manualmente (marca pago) -> subscription trocada + billing_event payment_received.
-- ============================================================

-- Tenant solicita upgrade/downgrade de plano (resolve por auth.uid())
create or replace function public.request_plan_change(p_plan_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant_id uuid := auth.uid();
  v_plan_id uuid;
  v_plan_name text;
  v_plan_price integer;
  v_sub_id uuid;
begin
  if v_tenant_id is null then raise exception 'Nao autenticado'; end if;
  if not exists (select 1 from tenants where id = v_tenant_id) then raise exception 'Tenant nao encontrado'; end if;

  select id, name, price_monthly_cents into v_plan_id, v_plan_name, v_plan_price
  from plans where slug = p_plan_slug;
  if v_plan_id is null then raise exception 'Plano nao encontrado'; end if;

  select id into v_sub_id from subscriptions where tenant_id = v_tenant_id order by created_at desc limit 1;

  -- marca como aguardando pagamento
  if v_sub_id is not null then
    update subscriptions set status = 'past_due' where id = v_sub_id;
  end if;

  insert into billing_events (tenant_id, subscription_id, kind, amount_cents, provider, payload)
  values (v_tenant_id, v_sub_id, 'plan_change_requested', v_plan_price, 'manual',
          jsonb_build_object('to_plan', p_plan_slug, 'to_plan_id', v_plan_id, 'to_plan_name', v_plan_name));

  return jsonb_build_object('ok', true, 'plan', v_plan_slug, 'status', 'past_due');
end;
$function$;

grant execute on function public.request_plan_change(text) to authenticated;

-- Admin: lista tenants com troca de plano pendente (status past_due + pedido recente)
create or replace function public.admin_get_pending_plan_changes()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
begin
  if not public.is_admin() then raise exception 'Acesso negado: requer role admin'; end if;

  return coalesce((
    select jsonb_agg(row)
    from (
      select jsonb_build_object(
        'tenant_id', s.tenant_id,
        'tenant_name', tn.name,
        'plan_slug', s.to_plan_slug,
        'plan_name', s.to_plan_name,
        'amount_cents', s.amount_cents,
        'requested_at', s.created_at
      ) as row
      from (
        select distinct on (be.tenant_id)
          be.tenant_id,
          be.payload->>'to_plan' as to_plan_slug,
          be.payload->>'to_plan_name' as to_plan_name,
          be.amount_cents,
          be.created_at
        from billing_events be
        where be.kind = 'plan_change_requested'
        order by be.tenant_id, be.created_at desc
      ) s
      join tenants tn on tn.id = s.tenant_id
      join subscriptions sub on sub.tenant_id = s.tenant_id and sub.status = 'past_due'
      order by s.created_at desc
    ) sub
  ), '[]'::jsonb);
end;
$function$;

grant execute on function public.admin_get_pending_plan_changes() to authenticated;

-- Admin: aprova manualmente (ativa a subscription do plano pedido + registra pagamento)
create or replace function public.admin_apply_manual_payment(p_tenant_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_plan_id uuid;
  v_plan_name text;
  v_plan_price integer;
  v_sub_id uuid;
begin
  if not public.is_admin() then raise exception 'Acesso negado: requer role admin'; end if;

  -- pega o pedido mais recente
  select be.payload->>'to_plan_id', be.payload->>'to_plan_name', be.amount_cents
    into v_plan_id, v_plan_name, v_plan_price
  from billing_events be
  where be.tenant_id = p_tenant_id and be.kind = 'plan_change_requested'
  order by be.created_at desc limit 1;

  if v_plan_id is null then raise exception 'Nenhum pedido pendente'; end if;

  select id into v_sub_id from subscriptions where tenant_id = p_tenant_id order by created_at desc limit 1;

  update subscriptions set
    plan_id = v_plan_id::uuid,
    status = 'active',
    current_period_start = now(),
    current_period_end = now() + interval '30 days'
  where id = v_sub_id;

  insert into billing_events (tenant_id, subscription_id, kind, amount_cents, provider, payload)
  values (p_tenant_id, v_sub_id, 'payment_received', v_plan_price, 'manual',
          jsonb_build_object('approved_by', 'admin', 'note', 'Pagamento manual confirmado'));

  return jsonb_build_object('ok', true, 'tenant_id', p_tenant_id, 'plan', v_plan_name);
end;
$function$;

grant execute on function public.admin_apply_manual_payment(uuid) to authenticated;