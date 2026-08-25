"use client";

import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME } from '@packages/theme';
import { getSubdomain } from '@lib/utils';

export function PublicLayout() {
  const [theme, setTheme] = useState(DEFAULT_TENANT_THEME);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hostname = window.location.hostname;
    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
    const slug = getSubdomain(hostname, rootDomain);

    async function loadTenant() {
      if (!slug) {
        applyTheme(DEFAULT_TENANT_THEME);
        setTheme(DEFAULT_TENANT_THEME);
        setLoading(false);
        return;
      }

      try {
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

          // Check if funnel is available
          // Available only if: status === 'active' AND funnel is published
          // For now, we consider 'active' as published. In future, add a 'funnel_published' boolean field.
          const isAvailable = tenantData.status === 'active';
          
          // Check current path
          const currentPath = location.pathname;
          const isUnavailablePage = currentPath.includes('/indisponivel');
          
          if (!isAvailable && !isUnavailablePage) {
            // Redirect to unavailable page
            setShouldRedirect(true);
            return;
          }
          
          if (isAvailable && isUnavailablePage) {
            // If available but on unavailable page, redirect to landing
            setShouldRedirect(true);
            return;
          }
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

    loadTenant();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
        <Fireflies />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-pulse-soft text-stone-500">Carregando...</div>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/f/:slug/indisponivel" replace />;
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-sans)" }}>
      <Outlet />
    </div>
  );
}

/* Fireflies Component - Animated background particles */
function Fireflies({ className = "", primaryColor = "#F59E0B" }) {
  const [fireflies, setFireflies] = useState<Array<{ x: number; y: number; size: number; opacity: number; delay: number }>>([]);

  useEffect(() => {
    const count = 30;
    const newFireflies = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      delay: Math.random() * 5,
    }));
    setFireflies(newFireflies);
  }, []);

  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      {fireflies.map((fly, i) => (
        <div
          key={i}
          className="fixed rounded-full"
          style={{
            left: `${fly.x}%`,
            top: `${fly.y}%`,
            width: `${fly.size}px`,
            height: `${fly.size}px`,
            backgroundColor: primaryColor,
            opacity: fly.opacity,
            animation: `firefly-float ${8 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${fly.delay}s`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes firefly-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(20px, -30px) scale(1.2); opacity: 0.8; }
          50% { transform: translate(-15px, -60px) scale(0.8); opacity: 0.5; }
          75% { transform: translate(-30px, -20px) scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}