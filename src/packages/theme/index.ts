export interface TenantTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    profile: Record<string, string>;
  };
  fonts: {
    sans: string;
    serif: string;
    display: string;
  };
  logo?: string;
  name: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  whatsapp?: string;
}

export const DEFAULT_TENANT_THEME: TenantTheme = {
  colors: {
    primary: '#16A34A',      // green-600
    secondary: '#EC4899',    // pink-500
    accent: '#F59E0B',       // amber-500
    background: '#FAFAF9',   // stone-50
    surface: '#FFFFFF',      // white
    text: '#1C1917',         // stone-950
    textMuted: '#78716C',    // stone-500
    border: '#E7E5E4',       // stone-200
    profile: {
      'emagrece-metaboliza': '#16A34A',
      'zen-descanso': '#6D28D9',
      'beleza-dentro-fora': '#EC4899',
      'imuno-forte': '#0EA5E9',
      'energia-total': '#F59E0B',
      'equilibrio-ritmo': '#8B5CF6',
      'performance-musculo': '#EF4444',
      'intestino-saudavel': '#14B8A6',
    },
  },
  fonts: {
    sans: 'Inter, system-ui, sans-serif',
    serif: 'Playfair Display, Georgia, serif',
    display: 'Playfair Display, Georgia, serif',
  },
  name: 'MagikFunil',
  headline: 'Descubra seu protocolo personalizado',
  subheadline: 'Responda ao quiz e receba recomendações baseadas em ciência',
  ctaText: 'Começar agora',
};

export function applyTheme(theme: TenantTheme): void {
  const root = document.documentElement;
  
  // CSS Custom Properties para o tema do tenant
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
  root.style.setProperty('--theme-border', theme.colors.border);
  
  // Fontes
  root.style.setProperty('--font-sans', theme.fonts.sans);
  root.style.setProperty('--font-serif', theme.fonts.serif);
  root.style.setProperty('--font-display', theme.fonts.display);
  
  // Logo
  if (theme.logo) {
    root.style.setProperty('--theme-logo', theme.logo);
  }
  
  // Cores dos perfis
  Object.entries(theme.colors.profile).forEach(([key, value]) => {
    root.style.setProperty(`--theme-profile-${key}`, value);
  });
}

export function createThemeFromTenant(tenant: {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  logo_url?: string;
  name?: string;
  headline?: string;
  subheadline?: string;
  cta_text?: string;
  whatsapp?: string;
}): TenantTheme {
  return {
    ...DEFAULT_TENANT_THEME,
    colors: {
      ...DEFAULT_TENANT_THEME.colors,
      primary: tenant.primary_color || DEFAULT_TENANT_THEME.colors.primary,
      secondary: tenant.secondary_color || DEFAULT_TENANT_THEME.colors.secondary,
      accent: tenant.accent_color || DEFAULT_TENANT_THEME.colors.accent,
    },
    logo: tenant.logo_url,
    name: tenant.name || DEFAULT_TENANT_THEME.name,
    headline: tenant.headline || DEFAULT_TENANT_THEME.headline,
    subheadline: tenant.subheadline || DEFAULT_TENANT_THEME.subheadline,
    ctaText: tenant.cta_text || DEFAULT_TENANT_THEME.ctaText,
    whatsapp: tenant.whatsapp,
  };
}