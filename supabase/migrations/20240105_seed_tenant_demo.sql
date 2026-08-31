-- ============================================================
-- MIGRAÇÃO 5 - Seed do tenant de demonstração (dashboard)
-- MagikFunil - sa-east-1
-- Cria um tenant demo (Plano Pro, trial 12 dias) + produtos ativados
-- (mesmos 6 do mock do dashboard) com links de redirecionamento.
-- ============================================================

insert into tenants (id, slug, name, status, template_id, primary_color, accent_color)
values ('20000000-0000-0000-0000-000000000001', 'farmacia-vida-natural', 'Farmácia Vida Natural',
        'active', '10000000-0000-0000-0000-000000000001', '#16A34A', '#F59E0B')
on conflict (slug) do nothing;

insert into subscriptions (tenant_id, plan_id, status, current_period_start, current_period_end)
values ('20000000-0000-0000-0000-000000000001',
        (select id from plans where slug='pro'), 'trial', now(), now() + interval '12 days')
on conflict (tenant_id) do nothing;

insert into tenant_products (id, tenant_id, product_id, redirect_url, enabled, position) values
('6dbb8e79-8686-4179-41c5-522d89891d88', '20000000-0000-0000-0000-000000000001', '7361d2f3-a57e-4194-e16c-e4feab524eae', 'https://wa.me/5511999990000?text=Kit%20Sono', true, 0),
('892bda4d-6ef5-42f0-a7a5-798183c99da3', '20000000-0000-0000-0000-000000000001', '957d0208-b19a-4ed6-b999-f726262137b5', 'https://wa.me/5511999990000?text=Magn%C3%A9sio', true, 1),
('40bf2ec5-ac6f-4525-b644-3512b1945960', '20000000-0000-0000-0000-000000000001', 'df748341-8233-45f8-5f32-565ee04a9a83', 'https://wa.me/5511999990000?text=Kit%20Noite', true, 2),
('40ef0655-e732-4eb5-63bd-45421f78c516', '20000000-0000-0000-0000-000000000001', '0022a3a8-67e8-4651-a183-8e4e17b57e02', 'https://wa.me/5511999990000?text=Defesas', true, 3),
('b7f8d53c-480e-4014-3762-7da75ac95d97', '20000000-0000-0000-0000-000000000001', 'ca1c1842-9165-47d4-81e6-1e25eba78db0', 'https://wa.me/5511999990000?text=Col%C3%A1geno', true, 4),
('ceb70196-e05f-4a7a-0ee7-926fe3246e49', '20000000-0000-0000-0000-000000000001', 'c4c49202-d729-4320-e1b9-e8715381184f', 'https://wa.me/5511999990000?text=Barriga', true, 5)
on conflict (tenant_id, product_id) do nothing;