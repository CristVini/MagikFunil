"use client";

import { Outlet, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME } from '@packages/theme';
import { getSubdomain, cn, funnelPath } from '@lib/utils';

export function PublicLayout() {
  const [theme, setTheme] = useState(DEFAULT_TENANT_THEME);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const { slug: paramSlug } = useParams<{ slug: string }>();

  const layoutSlug = paramSlug || getSubdomain(window ? window.location.hostname : '', import.meta.env.VITE_ROOT_DOMAIN || 'localhost') || undefined;

  useEffect(() => {
    async function loadTenant() {
      try {
        const previewRaw = window.sessionStorage.getItem('previewTheme');
        const previewSlug = window.sessionStorage.getItem('previewSlug');
        const isPreview = !!previewRaw && previewSlug === layoutSlug;

        if (isPreview && previewRaw) {
          const previewData = JSON.parse(previewRaw);
          const previewTheme = createThemeFromTenant(previewData);
          applyTheme(previewTheme);
          setTheme(previewTheme);
          setTenant(previewData);
          setLoading(false);
          return;
        }

        // Sem slug na URL nem subdomínio: usa o tema padrão (sem tenant)
        if (!layoutSlug) {
          applyTheme(DEFAULT_TENANT_THEME);
          setTheme(DEFAULT_TENANT_THEME);
          setLoading(false);
          return;
        }

        // Resolve funil/tenant/template pelo slug (tenant_funnels.slug ou template.slug)
        const { data } = await supabase.rpc('get_funnel', { p_slug: layoutSlug });

        if (data && !data.error && data.tenant) {
          const tenantData = data.tenant;
          setTenant(tenantData);
          const tenantTheme = createThemeFromTenant(tenantData);
          applyTheme(tenantTheme);
          setTheme(tenantTheme);

          const isAvailable = data.tenant_id != null;
          const currentPath = window.location.pathname;
          const isUnavailablePage = currentPath.includes('/indisponivel');

          if (!isAvailable && !isUnavailablePage) {
            setRedirectTo(funnelPath(layoutSlug, 'indisponivel'));
          } else if (isAvailable && isUnavailablePage) {
            setRedirectTo(funnelPath(layoutSlug));
          }
        } else {
          applyTheme(DEFAULT_TENANT_THEME);
          setTheme(DEFAULT_TENANT_THEME);
          setRedirectTo(funnelPath(layoutSlug, 'indisponivel'));
        }
      } catch {
        applyTheme(DEFAULT_TENANT_THEME);
        setTheme(DEFAULT_TENANT_THEME);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [layoutSlug]);

  if (loading) {
    return (
      <div className={cn("min-h-screen bg-stone-50 flex items-center justify-center")} style={{ fontFamily: "var(--font-sans)" }}>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-pulse text-stone-500">Carregando...</div>
        </div>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-sans)" }}>
      <Outlet />
    </div>
  );
}