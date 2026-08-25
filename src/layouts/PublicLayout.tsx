import { Outlet } from 'react-router-dom';
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME } from '@packages/theme';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { getSubdomain } from '@lib/utils';

export function PublicLayout() {
  const [theme, setTheme] = useState(DEFAULT_TENANT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
    const slug = getSubdomain(hostname, rootDomain);

    async function loadTheme() {
      if (!slug) {
        applyTheme(DEFAULT_TENANT_THEME);
        setTheme(DEFAULT_TENANT_THEME);
        setLoading(false);
        return;
      }

      try {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (tenant) {
          const tenantTheme = createThemeFromTenant(tenant);
          applyTheme(tenantTheme);
          setTheme(tenantTheme);
        } else {
          applyTheme(DEFAULT_TENANT_THEME);
          setTheme(DEFAULT_TENANT_THEME);
        }
      } catch {
        applyTheme(DEFAULT_TENANT_THEME);
        setTheme(DEFAULT_TENANT_THEME);
      } finally {
        setLoading(false);
      }
    }

    loadTheme();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-pulse-soft text-stone-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-sans)' }}>
      <Outlet />
    </div>
  );
}