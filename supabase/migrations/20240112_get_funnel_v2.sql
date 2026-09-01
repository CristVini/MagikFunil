-- ============================================================
-- MIGRAÇÃO 12 - get_funnel v2 (tenant-scoped)
-- MagikFunil
-- O funil público agora é servido por TENANT, não por template.
-- Resolve o tenant pelo slug (a longo prazo virá do subdomínio);
-- usa o template do tenant + o protocolo REAL do tenant (produtos
-- ativados com redirect_url / preços personalizados).
-- Fallback: se não existe tenant, devolve o template de exemplo
-- (para preview/onboarding) com tenant_id null.
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
  -- Tenta resolver um tenant pelo slug
  select id, template_id into v_tenant_id, v_template_id
  from tenants where slug = p_slug and status = 'active';

  if v_tenant_id is null then
    -- Fallback: template de exemplo (mesmo slug)
    select t.id into v_template_id from templates t where t.slug = p_slug and t.is_active = true;
    if v_template_id is null then
      return jsonb_build_object('error', 'template_not_found');
    end if;
  end if;

  select jsonb_build_object(
    'id', t.id, 'slug', t.slug, 'name', t.name, 'niche', t.niche, 'description', t.description
  ) into v_template from templates t where t.id = v_template_id;

  select coalesce(jsonb_agg(pb order by (pb->>'display_order')::int), '[]'::jsonb) into v_profiles
  from (
    select jsonb_build_object(
      'id', p.id, 'name', p.name, 'archetype', p.archetype,
      'description', p.description, 'scientific_basis', p.scientific_basis,
      'expected_effect', p.expected_effect,
      'references', to_jsonb(p."references"), 'notes', to_jsonb(p.notes),
      'color', p.color, 'display_order', p.display_order
    ) as pb
    from profiles p where p.template_id = v_template_id
  ) pb;

  select coalesce(jsonb_agg(qb order by (qb->>'position')::int), '[]'::jsonb) into v_questions
  from (
    select jsonb_build_object(
      'id', q.id, 'text', q.text, 'position', q.position, 'weight', q.weight,
      'options', (
        select coalesce(jsonb_agg(ob order by (ob->>'position')::int), '[]'::jsonb)
        from (
          select jsonb_build_object(
            'id', o.id, 'text', o.text, 'profile_ids', to_jsonb(o.profile_ids), 'position', o.position
          ) as ob
          from quiz_options o where o.question_id = q.id
        ) ob
      )
    ) as qb
    from quiz_questions q where q.template_id = v_template_id
  ) qb;

  -- Protocolo: se tenant, usa os produtos ativados do tenant (com redirect/preços/kits);
  -- se fallback (sem tenant), usa o protocolo padrão do template.
  if v_tenant_id is not null then
    select coalesce(jsonb_agg(pr), '[]'::jsonb) into v_protocol
    from (
      select jsonb_build_object(
        'profile_id', tpp.profile_id,
        'products', coalesce(jsonb_agg(
          jsonb_build_object(
            'id', prd.id,
            'name', coalesce(tp.kit_name, prd.name),
            'category', prd.category, 'description', prd.description,
            'is_kit', prd.is_kit,
            'price_cents', coalesce(tp.price_cents, prd.price_cents),
            'promo_price_cents', tp.promo_price_cents,
            'show_promo', coalesce(tp.show_promo, false),
            'support_text', coalesce(tp.support_text, prd.support_text),
            'redirect_url', coalesce(tp.redirect_url, '')
          ) order by coalesce(tp.position, tpp.position)
        ), '[]'::jsonb)
      ) as pr
      from template_profile_products tpp
      join products prd on prd.id = tpp.product_id
      left join tenant_products tp on tp.product_id = prd.id and tp.tenant_id = v_tenant_id
      where tpp.template_id = v_template_id and tp.enabled = true
      group by tpp.profile_id
    ) pr;
  else
    select coalesce(jsonb_agg(pr), '[]'::jsonb) into v_protocol
    from (
      select jsonb_build_object(
        'profile_id', tpp.profile_id,
        'products', coalesce(jsonb_agg(pb order by tpp.position), '[]'::jsonb)
      ) as pr
      from template_profile_products tpp
      join products prd on prd.id = tpp.product_id
      cross join lateral (
        select jsonb_build_object(
          'id', prd.id, 'name', prd.name, 'category', prd.category,
          'description', prd.description, 'is_kit', prd.is_kit,
          'price_cents', prd.price_cents, 'support_text', prd.support_text
        ) as pb
      ) pb
      where tpp.template_id = v_template_id
      group by tpp.profile_id
    ) pr;
  end if;

  return jsonb_build_object(
    'template', v_template,
    'tenant_id', v_tenant_id,
    'tenant', (
      select jsonb_build_object('id', id, 'name', name, 'slug', slug, 'whatsapp', whatsapp)
      from tenants where id = v_tenant_id
    ),
    'profiles', v_profiles,
    'questions', v_questions,
    'protocol', v_protocol
  );
end;
$function$;

grant execute on function public.get_funnel(text) to authenticated, anon;