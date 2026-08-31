-- ============================================================
-- MIGRAÇÃO 7 - RPC get_tenant_leads (leads do tenant logado)
-- MagikFunil
-- SECURITY DEFINER: resolve tenant por auth.uid(), traz as respostas
-- e o nome/cor do perfil vencedor via join em profiles.
-- ============================================================
create or replace function public.get_tenant_leads()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant_id uuid := auth.uid();
begin
  if v_tenant_id is null then
    raise exception 'Nao autenticado';
  end if;
  if not exists (select 1 from tenants where id = v_tenant_id) then
    raise exception 'Tenant nao encontrado';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', l.id,
      'name', l.name,
      'phone', l.phone,
      'created_at', l.created_at,
      'status', l.status,
      'profileLabel', coalesce(p.name, 'Outros'),
      'profile_color', p.color,
      'product_clicked', null,
      'answers', l.answers,
      'winner_profile', l.winning_profile,
      'source_url', l.source_url
    ) order by l.created_at desc)
    from leads l
    left join profiles p on p.id = l.winning_profile
    where l.tenant_id = v_tenant_id
  ), '[]'::jsonb);
end;
$function$;

grant execute on function public.get_tenant_leads() to authenticated, anon;