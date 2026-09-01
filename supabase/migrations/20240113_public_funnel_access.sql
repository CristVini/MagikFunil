-- ============================================================
-- MIGRAÇÃO 13 - Acesso do funil público (grants + RLS corrigidos)
-- MagikFunil
-- PROBLEMA: anon inserindo lead/event no funil público quebrava com
-- "permission denied" porque (a) faltavam grants e (b) policies admin
-- faziam subselect em auth.users (que anon não lê).
-- CORREÇÃO: policies admin usam public.is_admin() (security definer);
-- anon recebe grants mínimos de INSERT/SELECT nas tabelas públicas.
-- ============================================================

-- --- 1. Ajusta policies para usar is_admin() (não subselect em auth.users)
drop policy if exists plan_all_admin on plans;
create policy plan_all_admin on plans for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_all_admin on products;
create policy product_all_admin on products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists profile_all_admin on profiles;
create policy profile_all_admin on profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists quiz_opt_all_admin on quiz_options;
create policy quiz_opt_all_admin on quiz_options for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists quiz_q_all_admin on quiz_questions;
create policy quiz_q_all_admin on quiz_questions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists sub_all_admin on subscriptions;
create policy sub_all_admin on subscriptions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists tpp_all_admin on template_profile_products;
create policy tpp_all_admin on template_profile_products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists template_all_admin on templates;
create policy template_all_admin on templates for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists tenant_insert_admin on tenants;
create policy tenant_insert_admin on tenants for insert to authenticated with check (public.is_admin());

drop policy if exists tp_insert_admin on tenant_products;
create policy tp_insert_admin on tenant_products for insert to authenticated with check (public.is_admin());

drop policy if exists lead_select_admin on leads;
create policy lead_select_admin on leads for select to authenticated using (public.is_admin());

drop policy if exists event_select_admin on events;
create policy event_select_admin on events for select to authenticated using (public.is_admin());

drop policy if exists be_select_admin on billing_events;
create policy be_select_admin on billing_events for select to authenticated using (public.is_admin());

drop policy if exists tenant_select_own on tenants;
create policy tenant_select_own on tenants for select to authenticated using (public.is_admin() or (auth.uid())::text = (id)::text);

drop policy if exists tenant_update_own_or_admin on tenants;
create policy tenant_update_own_or_admin on tenants for update to authenticated using (public.is_admin() or (auth.uid())::text = (id)::text) with check (public.is_admin() or (auth.uid())::text = (id)::text);

-- --- 2. Grants mínimos ao anon (funil público escreve lead/event; resolve tenant)
grant select on public.tenants to anon;
grant select on public.templates to anon;
grant select on public.profiles to anon;
grant select on public.quiz_questions to anon;
grant select on public.quiz_options to anon;
grant select on public.products to anon;
grant select on public.template_profile_products to anon;
grant insert, select, update on public.leads to anon;
grant insert, select on public.events to anon;

-- --- 3. Grants base para authenticated (admin via RLS is_admin(); tenant via policies own)
grant select, insert, update, delete on public.templates to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.quiz_questions to authenticated;
grant select, insert, update, delete on public.quiz_options to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.template_profile_products to authenticated;
grant select, insert, update, delete on public.plans to authenticated;
grant select, insert, update, delete on public.tenants to authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select, insert, update, delete on public.tenant_products to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.billing_events to authenticated;