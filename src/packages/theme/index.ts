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
  // Identidade visual "dark" — superfície escura usada em telas de destaque
  // (ex.: Resultado). O cliente pode personalizar o ACENTO e a COR PRIMÁRIA
  // (via colors acima); a superfície escura é a identidade base do template.
  dark?: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    onPrimary: string;
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
    primary: '#15803D',      // green-700 (contraste ≥4.5 com texto branco nos CTAs)
    secondary: '#EC4899',    // pink-500
    accent: '#F59E0B',       // amber-500
    background: '#0C0A09',   // stone-950 (escuro rico — identidade base)
    surface: '#1C1917',      // stone-900
    text: '#FAFAF9',         // stone-50
    textMuted: '#A8A29E',    // stone-400
    border: '#292524',       // stone-800
    profile: {
      'descanso': '#6D28D9',
      'energia': '#F59E0B',
      'imunidade': '#0EA5E9',
      'digestao': '#14B8A6',
      'beleza': '#EC4899',
      'equilibrio': '#8B5CF6',
      'performance': '#EF4444',
      'emagrecimento': '#16A34A',
    },
  },
  // Superfície escura (identidade base para telas de destaque como o Resultado)
  dark: {
    background: '#0C0A09',   // stone-950
    surface: '#1C1917',      // stone-900
    text: '#FAFAF9',         // stone-50
    textMuted: '#A8A29E',    // stone-400
    border: '#292524',       // stone-800
    onPrimary: '#0C0A09',    // texto sobre cor primária no escuro
  },
  fonts: {
    sans: 'Manrope, system-ui, sans-serif',
    serif: 'Lora, Georgia, serif',
    display: 'Lora, Georgia, serif',
  },
  name: 'MagikFunil',
  headline: 'Descubra o cuidado certo pra você',
  subheadline: 'Responda algumas perguntas e receba um protocolo feito para a sua rotina',
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

    // Superfície escura (telas de destaque: Resultado, modais)
    if (theme.dark) {
      root.style.setProperty('--theme-dark-background', theme.dark.background);
      root.style.setProperty('--theme-dark-surface', theme.dark.surface);
      root.style.setProperty('--theme-dark-text', theme.dark.text);
      root.style.setProperty('--theme-dark-text-muted', theme.dark.textMuted);
      root.style.setProperty('--theme-dark-border', theme.dark.border);
      root.style.setProperty('--theme-dark-on-primary', theme.dark.onPrimary);
    }

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
  background_color?: string;
  surface_color?: string;
  logo_url?: string;
  name?: string;
  headline?: string;
  subheadline?: string;
  cta_text?: string;
  primary_font?: string;
  display_font?: string;
  whatsapp?: string;
  dark_background?: string;
  dark_surface?: string;
}): TenantTheme {
  // Mapa de fontes curado — o cliente escolhe de um conjunto, nunca digita livre
  const SERIF_FONTS: Record<string, string> = {
    playfair: 'Playfair Display, Georgia, serif',
    serif4: 'Georgia, "Times New Roman", serif',
    lora: 'Lora, Georgia, serif',
    merriweather: 'Merriweather, Georgia, serif',
  };
  const SANS_FONTS: Record<string, string> = {
    inter: 'Inter, system-ui, sans-serif',
    poppins: 'Poppins, system-ui, sans-serif',
    opensans: '"Open Sans", system-ui, sans-serif',
    manrope: 'Manrope, system-ui, sans-serif',
  };

  // Resolve a fonte display: se o tenant enviar uma chave conhecida, usa; se enviar uma URL de fonte,
  // preserva; senão cai no padrão (Playfair).
  const resolveDisplay = (value?: string) =>
    (value && SERIF_FONTS[value]) || value || DEFAULT_TENANT_THEME.fonts.display;
  const resolveSans = (value?: string) =>
    (value && SANS_FONTS[value]) || value || DEFAULT_TENANT_THEME.fonts.sans;

  return {
    ...DEFAULT_TENANT_THEME,
    colors: {
      ...DEFAULT_TENANT_THEME.colors,
      primary: tenant.primary_color || DEFAULT_TENANT_THEME.colors.primary,
      secondary: tenant.secondary_color || DEFAULT_TENANT_THEME.colors.secondary,
      accent: tenant.accent_color || DEFAULT_TENANT_THEME.colors.accent,
      background: tenant.background_color || DEFAULT_TENANT_THEME.colors.background,
      surface: tenant.surface_color || DEFAULT_TENANT_THEME.colors.surface,
    },
    fonts: {
      sans: resolveSans(tenant.primary_font),
      serif: resolveDisplay(tenant.display_font),
      display: resolveDisplay(tenant.display_font),
    },
    dark: {
      background: tenant.dark_background || DEFAULT_TENANT_THEME.dark!.background,
      surface: tenant.dark_surface || DEFAULT_TENANT_THEME.dark!.surface,
      text: DEFAULT_TENANT_THEME.dark!.text,
      textMuted: DEFAULT_TENANT_THEME.dark!.textMuted,
      border: DEFAULT_TENANT_THEME.dark!.border,
      onPrimary: DEFAULT_TENANT_THEME.dark!.onPrimary,
    },
    logo: tenant.logo_url,
    name: tenant.name || DEFAULT_TENANT_THEME.name,
    headline: tenant.headline || DEFAULT_TENANT_THEME.headline,
    subheadline: tenant.subheadline || DEFAULT_TENANT_THEME.subheadline,
    ctaText: tenant.cta_text || DEFAULT_TENANT_THEME.ctaText,
    whatsapp: tenant.whatsapp,
  };
}

// Fontes disponíveis para o cliente customizar (opções curadas que aparecem no painel)
export const AVAILABLE_FONTS = {
  display: [
    { key: 'playfair', label: 'Playfair Display' },
    { key: 'serif4', label: 'Georgia' },
    { key: 'lora', label: 'Lora' },
  ],
  sans: [
    { key: 'inter', label: 'Inter' },
    { key: 'poppins', label: 'Poppins' },
    { key: 'opensans', label: 'Open Sans' },
  ],
};