-- ============================================================
-- MIGRAÇÃO 4 - Função get_funnel (núcleo do funil público)
-- MagikFunil - sa-east-1
-- Devolve, num único RPC, tudo que o front precisa para renderizar
-- o funil: template + perfis + perguntas/opções + protocolo (produtos por perfil).
-- ============================================================

create or replace function get_funnel(p_template_slug text)
returns jsonb language plpgsql as $$
declare
  v_template jsonb;
  v_profiles jsonb;
  v_questions jsonb;
  v_protocol jsonb;
begin
  select jsonb_build_object(
    'id', t.id, 'slug', t.slug, 'name', t.name, 'niche', t.niche, 'description', t.description
  ) into v_template
  from templates t where t.slug = p_template_slug and t.is_active = true;

  if v_template is null then
    return jsonb_build_object('error', 'template_not_found');
  end if;

  select coalesce(jsonb_agg(pb order by (pb->>'display_order')::int), '[]'::jsonb) into v_profiles
  from (
    select jsonb_build_object(
      'id', p.id, 'name', p.name, 'archetype', p.archetype,
      'description', p.description, 'scientific_basis', p.scientific_basis,
      'expected_effect', p.expected_effect,
      'references', to_jsonb(p."references"), 'notes', to_jsonb(p.notes),
      'color', p.color, 'display_order', p.display_order
    ) as pb
    from profiles p where p.template_id = (v_template->>'id')::uuid
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
    from quiz_questions q where q.template_id = (v_template->>'id')::uuid
  ) qb;

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
    where tpp.template_id = (v_template->>'id')::uuid
    group by tpp.profile_id
  ) pr;

  return jsonb_build_object(
    'template', v_template,
    'profiles', v_profiles,
    'questions', v_questions,
    'protocol', v_protocol
  );
end;
$$ security definer;