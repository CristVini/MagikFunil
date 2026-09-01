-- ============================================================
-- MIGRAÇÃO 16 - P2: impedir auto-admin no signup
-- MagikFunil
-- O role admin deve viver APENAS em app_metadata (server-controlled).
-- GoTrue não permite o cliente setar app_metadata via signup —
-- apenas user_metadata (forjável). is_admin() lê SÓ app_metadata
-- (SEM fallback p/ user_metadata, que deixaria o vetor aberto).
-- Migra admins legados de user_metadata -> app_metadata.
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
    where id = auth.uid()
      and raw_app_meta_data ->> 'role' = 'admin'
  );
$function$;

-- Migra o role de admins existentes que ainda estão só em user_metadata
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where raw_user_meta_data ->> 'role' = 'admin';