"use client";

import { Outlet, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME } from '@packages/theme';
import { getSubdomain, cn } from '@lib/utils';

export function PublicLayout() {
  const [theme, setTheme] = useState(DEFAULT_TENANT_THEME);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const { slug: paramSlug } = useParams<{ slug: string }>();

  const layoutSlug = paramSlug || getSubdomain(window ? window.location.hostname : '', import.meta.env.VITE_ROOT_DOMAIN || 'localhost') || undefined;

  useEffect(() => {
    const hostname = window.location.hostname;
    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
    const slug = getSubdomain(hostname, rootDomain) || undefined;

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

        if (!slug) {
          applyTheme(DEFAULT_TENANT_THEME);
          setTheme(DEFAULT_TENANT_THEME);
          setLoading(false);
          return;
        }

        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (tenantData) {
          setTenant(tenantData);
          const tenantTheme = createThemeFromTenant(tenantData);
          applyTheme(tenantTheme);
          setTheme(tenantTheme);

          const isAvailable = tenantData.status === 'active';
          const currentPath = window.location.pathname;
          const isUnavailablePage = currentPath.includes('/indisponivel');

          if (!isAvailable && !isUnavailablePage) {
            setRedirectTo(`/f/${slug}/indisponivel`);
          } else if (isAvailable && isUnavailablePage) {
            setRedirectTo(`/f/${slug}`);
          }
        } else {
          applyTheme(DEFAULT_TENANT_THEME);
          setTheme(DEFAULT_TENANT_THEME);
          setRedirectTo(`/f/${slug}/indisponivel`);
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