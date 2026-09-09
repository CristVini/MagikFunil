-- ============================================================
-- MIGRAÇÃO 18 - get_funnel v3: funil público servido pelos ITENS DO CLIENTE
-- MagikFunil
--
-- IDEIA CENTRAL: nosso funil AQUEce o visitante (quiz -> perfil) e o
-- CLIENTE cadastrou os produtos DELE (tenant_items). Quando o visitante
-- chega ao resultado, o protocolo mostrado vem dos itens ATIVOS do
-- cliente (cadastro livre), não do catálogo genérico do template.
--
-- Esta versão substitui a montagem do 'protocol' (que lia apenas
-- tenant_products/catálogo) pela combinação:
--   - tenant_items ativos do cliente (vinculados ao perfil)  <- FONTE PRINCIPAL
--   - fallback p/ catálogo do template qdo o tenant ainda não cadastrou nada
--
-- Mantém profiles/questions intactos (o conhecimento do funil = nosso IP).
-- ============================================================

create or replace function public.get_funnel(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_tenant_id uuid;
  v_template_id uuid;
  v_template jsonb;
  v_profiles jsonb;
  v_questions jsonb;
  v_protocol jsonb;
begin
  select id, template_id into v_tenant_id, v_template_id
  from tenants where slug = p_slug and status = 'active';

  -- Se não achou tenant ativo, tenta o template diretamente (preview/seed)
  if v_tenant_id is null then
    select t.id into v_template_id from templates t
    where t.slug = p_slug and t.is_active = true;
    if v_template_id is null then
      return jsonb_build_object('error', 'template_not_found');
    end if;
  end if;

  select jsonb_build_object('id', t.id, 'slug', t.slug, 'name', t.name,
    'niche', t.niche, 'description', t.description) into v_template
  from templates t where t.id = v_template_id;

  select coalesce(jsonb_agg(pb order by (pb->>'display_order')::int), '[]'::jsonb) into v_profiles
  from (
    select jsonb_build_object('id', p.id, 'name', p.name, 'archetype', p.archetype,
      'description', p.description, 'scientific_basis', p.scientific_basis,
      'expected_effect', p.expected_effect, 'references', to_jsonb(p."references"),
      'notes', to_jsonb(p.notes), 'color', p.color, 'display_order', p.display_order) as pb
    from profiles p where p.template_id = v_template_id
  ) pb;

  select coalesce(jsonb_agg(qb order by (qb->>'position')::int), '[]'::jsonb) into v_questions
  from (
    select jsonb_build_object('id', q.id, 'text', q.text, 'position', q.position,
      'weight', q.weight,
      'options', (select coalesce(jsonb_agg(ob order by (ob->>'position')::int), '[]'::jsonb)
        from (select jsonb_build_object('id', o.id, 'text', o.text,
          'profile_ids', to_jsonb(o.profile_ids), 'position', o.position) as ob
          from quiz_options o where o.question_id = q.id) ob)) as qb
    from quiz_questions q where q.template_id = v_template_id
  ) qb;

  -- ===== PROTOCOLO =====
  if v_tenant_id is not null then
    -- FONTE PRINCIPAL: itens ATIVOS cadastrados pelo cliente, agrupados por perfil
    select coalesce(jsonb_agg(pr), '[]'::jsonb) into v_protocol
    from (
      select jsonb_build_object(
        'profile_id', ti.profile_id,
        'products', coalesce(jsonb_agg(jsonb_build_object(
          'id', ti.id,
          'name', ti.name,
          'description', ti.description,
          'key_actives', ti.key_actives,
          'support_text', ti.support_text,
          'price_cents', ti.price_cents,
          'redirect_url', ti.redirect_url,
          'is_kit', false,
          'profile_id', ti.profile_id,
          'source', 'tenant_item'  -- marca que veio do cadastro livre do cliente
        ) order by ti.position, ti.created_at), '[]'::jsonb)) as pr
      from tenant_items ti
      where ti.tenant_id = v_tenant_id and ti.enabled = true
      group by ti.profile_id
    ) pr;

    -- Se o cliente ainda não cadastrou nada, fallback p/ o catálogo do template
    -- (serve de referência/exemplo até o cliente preencher).
    if v_protocol = '[]'::jsonb or v_protocol is null then
      select coalesce(jsonb_agg(pr), '[]'::jsonb) into v_protocol
      from (
        select jsonb_build_object(
          'profile_id', tpp.profile_id,
          'products', coalesce(jsonb_agg(jsonb_build_object(
            'id', prd.id, 'name', prd.name, 'category', prd.category,
            'description', prd.description, 'is_kit', prd.is_kit,
            'price_cents', prd.price_cents, 'support_text', prd.support_text,
            'source', 'template_catalog'  -- referência do template
          ) order by tpp.position), '[]'::jsonb)) as pr
        from template_profile_products tpp
        join products prd on prd.id = tpp.product_id
        where tpp.template_id = v_template_id
        group by tpp.profile_id
      ) pr;
    end if;
  else
    -- Sem tenant (template preview/seed): usa o catálogo do template
    select coalesce(jsonb_agg(pr), '[]'::jsonb) into v_protocol
    from (
      select jsonb_build_object(
        'profile_id', tpp.profile_id,
        'products', coalesce(jsonb_agg(jsonb_build_object(
          'id', prd.id, 'name', prd.name, 'category', prd.category,
          'description', prd.description, 'is_kit', prd.is_kit,
          'price_cents', prd.price_cents, 'support_text', prd.support_text,
          'source', 'template_catalog'
        ) order by tpp.position), '[]'::jsonb)) as pr
      from template_profile_products tpp
      join products prd on prd.id = tpp.product_id
      where tpp.template_id = v_template_id
      group by tpp.profile_id
    ) pr;
  end if;

  return jsonb_build_object(
    'template', v_template,
    'tenant_id', v_tenant_id,
    'tenant', (select jsonb_build_object('id', id, 'name', name, 'slug', slug, 'whatsapp', whatsapp)
      from tenants where id = v_tenant_id),
    'profiles', v_profiles,
    'questions', v_questions,
    'protocol', v_protocol
  );
end;
$function$;

grant execute on function public.get_funnel(text) to anon, authenticated;