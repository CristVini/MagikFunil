-- ============================================================
-- MIGRAÇÃO 20 - Colunas de tema do tenant (tela Aparência)
-- MagikFunil
--
-- Correção de bug latente: a tela "Aparência" lia/gravava colunas de tema
-- que NÃO existiam em `tenants`, então as personalizações avançadas
-- (fontes, cores de superfície/claro/escuro, texto, bordas, conteúdo)
-- eram sempre descartadas (caíam no default).
--
-- Esta migração adiciona as colunas que faltavam para que o save
-- persista de verdade e o funil público reflita o tema completo.
-- ============================================================

alter table public.tenants
  add column if not exists primary_font text,
  add column if not exists display_font text,
  add column if not exists background_color text,
  add column if not exists surface_color text,
  add column if not exists dark_background text,
  add column if not exists dark_surface text,
  add column if not exists text_color text,
  add column if not exists text_muted text,
  add column if not exists border_color text,
  add column if not exists content_background text;