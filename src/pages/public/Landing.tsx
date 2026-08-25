import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { getSubdomain } from '@lib/utils';
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME } from '@packages/theme';
import { ArrowRight, Sparkles, Brain, Zap, Shield, ChevronRight } from 'lucide-react';

export function Landing() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(DEFAULT_TENANT_THEME);

  useEffect(() => {
    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
    const hostname = window.location.hostname;
    const subdomain = getSubdomain(hostname, rootDomain);

    async function loadTenant() {
      if (!slug && !subdomain) {
        applyTheme(DEFAULT_TENANT_THEME);
        setTheme(DEFAULT_TENANT_THEME);
        setLoading(false);
        return;
      }

      const lookupSlug = slug || subdomain;
      try {
        const { data } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', lookupSlug)
          .single();

        if (data) {
          setTenant(data);
          const tenantTheme = createThemeFromTenant(data);
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

    loadTenant();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="animate-pulse-soft text-stone-500">Carregando...</div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-stone-950 mb-4">Funil não encontrado</h1>
          <p className="text-stone-500">Este subdomínio não está configurado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>Baseado em ciência • Personalizado para você</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-stone-950 leading-[1.1] mb-8 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {tenant.headline || 'Descubra seu protocolo personalizado'}
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            {tenant.subheadline || 'Responda ao quiz e receba recomendações baseadas em ciência para seu objetivo'}
          </p>

          {/* CTA */}
          <Link
            to={`/f/${slug}/quiz`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-stone-950 text-stone-50 rounded-full text-lg font-semibold uppercase tracking-wider hover:bg-stone-800 hover:scale-[1.02] transition-all shadow-[0_20px_80px_rgba(0,0,0,0.15)]"
          >
            {tenant.ctaText || 'Começar agora'}
            <ArrowRight size={20} />
          </Link>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-stone-500 text-sm">
            <div className="flex items-center gap-2">
              <Brain size={16} />
              <span>Base científica validada</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} />
              <span>Resultados em minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span>Fórmulas manipuladas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features / How it works */}
      <section className="py-20 bg-stone-50 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-950 text-center mb-16" style={{ fontFamily: 'var(--font-display)' }}>
            Como funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: '1. Quiz Inteligente', desc: '14 perguntas baseadas em ciência para mapear seu perfil único' },
              { icon: Zap, title: '2. Análise Personalizada', desc: 'Algoritmo identifica seu perfil dominante e necessidades específicas' },
              { icon: Shield, title: '3. Protocolo Sob Medida', desc: 'Kit mensal com suplementos manipulados para seu objetivo' },
            ].map((step, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl border border-stone-200 hover:border-amber-300 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                  <step.icon size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-display font-bold text-stone-950 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  {step.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-stone-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-50 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Pronto para descobrir seu protocolo?
          </h2>
          <p className="text-stone-400 mb-8 text-lg">
            Leva menos de 3 minutos. Receba recomendações baseadas em ciência para seu objetivo.
          </p>
          <Link
            to={`/f/${slug}/quiz`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-amber-500 text-stone-950 rounded-full text-lg font-semibold uppercase tracking-wider hover:bg-amber-400 hover:scale-[1.02] transition-all"
          >
            {tenant.ctaText || 'Começar meu quiz'}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-stone-950 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-6 text-center text-stone-500 text-sm">
          <p>© 2024 {tenant.name || 'MagikFunil'}. Todos os direitos reservados.</p>
          <p className="mt-2">Fórmulas manipuladas sob responsabilidade do farmacêutico. Consulte seu médico.</p>
        </div>
      </footer>
    </div>
  );
}