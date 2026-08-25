"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { getSubdomain } from "@lib/utils";
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME } from "@packages/theme";
import { ArrowRight, Sparkles, Brain, Zap, Shield, ChevronRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function Landing() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(DEFAULT_TENANT_THEME);

  useEffect(() => {
    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || "localhost";
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
          .from("tenants")
          .select("*")
          .eq("slug", lookupSlug)
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
        <Fireflies />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-pulse-soft text-stone-500 text-lg">Carregando seu funil...</div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
        <Fireflies />
        <div className="absolute inset-0 flex items-center justify-center z-10 text-center px-6">
          <div className="max-w-md">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-stone-950 mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Funil não encontrado
            </h1>
            <p className="text-stone-500 mb-6">Este subdomínio não está configurado ou não existe.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-stone-50 rounded-full font-semibold hover:bg-stone-800 transition-colors"
            >
              Voltar ao início
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPublished = tenant.status === "active";
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || "seudominio.com";
  const publicUrl = `https://${tenant.slug}.${rootDomain}`;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Fireflies Background */}
      <Fireflies className="fixed inset-0 -z-10" primaryColor={theme.colors.primary} />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 -z-10 opacity-3" style={{ backgroundImage: "url('/grid.svg')" }} />

      {/* Navigation Bar (minimal) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tenant.logo_url && (
              <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-auto" />
            )}
            <span className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
              {tenant.name}
            </span>
          </div>
          {isPublished && (
            <Link
              to={`/f/${tenant.slug}/quiz`}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-stone-950 text-stone-50 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors"
            >
              Começar Quiz
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-10 animate-in fade-in duration-500">
            <Sparkles size={16} />
            <span>Baseado em ciência • Personalizado para você</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-stone-950 leading-[1.1] mb-8 tracking-tight animate-in slide-up duration-700 delay-100" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
            {tenant.headline || "Descubra seu protocolo personalizado"}
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-stone-600 max-w-3xl mx-auto mb-14 font-light leading-relaxed animate-in slide-up duration-700 delay-200" style={{ color: "var(--theme-text-muted)" }}>
            {tenant.subheadline || "Responda ao quiz e receba recomendações baseadas em ciência para seu objetivo"}
          </p>

          {/* Primary CTA */}
          <Link
            to={`/f/${tenant.slug}/quiz`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-stone-950 text-stone-50 rounded-full text-lg font-semibold uppercase tracking-wider hover:bg-stone-800 hover:scale-[1.02] transition-all shadow-[0_20px_80px_rgba(0,0,0,0.15)] animate-in slide-up duration-700 delay-300"
            style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
          >
            {tenant.ctaText || "Começar agora"}
            <ArrowRight size={20} />
          </Link>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-stone-500 text-sm animate-in fade-in duration-700 delay-400">
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

          {/* Published Badge */}
          {isPublished && (
            <div className="mt-10 animate-in fade-in duration-700 delay-500">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                <CheckCircle size={16} />
                Funil publicado e no ar em <span className="font-mono font-semibold">{publicUrl}</span>
              </span>
            </div>
          )}
        </div>
      </main>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-stone-50 border-y border-stone-200 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-in fade-in duration-700">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-950 mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
              Como funciona
            </h2>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">Seu caminho para o protocolo ideal em 3 passos simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Brain, 
                number: "01", 
                title: "Quiz Inteligente", 
                desc: "14 perguntas baseadas em ciência para mapear seu perfil único e necessidades reais" 
              },
              { 
                icon: Zap, 
                number: "02", 
                title: "Análise Personalizada", 
                desc: "Algoritmo identifica seu perfil dominante e recomenda o protocolo ideal para seu objetivo" 
              },
              { 
                icon: Shield, 
                number: "03", 
                title: "Protocolo Sob Medida", 
                desc: "Kit mensal com suplementos manipulados selecionados para seu perfil, prontos para pedir" 
              },
            ].map((step, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)] transition-all duration-500 animate-in slide-up duration-700" style={{ transitionDelay: `${100 * (i + 1)}ms` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{step.number}</span>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <step.icon size={24} className="text-amber-600" />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-stone-950 mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
                  {step.title}
                </h3>
                <p className="text-stone-600 leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section className="py-20 md:py-28 bg-stone-950 relative z-10">
        <Fireflies className="fixed inset-0 -z-10 opacity-20" primaryColor="#F59E0B" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>Ciência por trás do método</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-50 mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Cada recomendação tem base científica
          </h2>
          <p className="text-stone-400 text-lg mb-12 max-w-2xl mx-auto">
            Não chutamos. Cada ativo, dose e combinação no seu protocolo é respaldada por estudos clínicos e literatura médica. Veja a ciência por trás de cada perfil no seu resultado.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Brain, label: "Literatura Médica", desc: "PubMed, Cochrane, JAMA" },
              { icon: Zap, label: "Estudos Clínicos", desc: "Randomizados, duplo-cego" },
              { icon: Shield, label: "Dosagens Validadas", desc: "Baseadas em meta-análises" },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-stone-900/50 border border-stone-800 rounded-2xl hover:border-amber-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-amber-500" />
                </div>
                <h4 className="text-stone-100 font-semibold mb-2">{item.label}</h4>
                <p className="text-stone-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-stone-50 border-y border-stone-200 relative z-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-950 mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--theme-text)" }}>
            Pronto para descobrir seu protocolo?
          </h2>
          <p className="text-stone-500 mb-8 text-lg max-w-xl mx-auto">
            Leva menos de 3 minutos. Receba recomendações baseadas em ciência para seu objetivo, com ativos validados e dosagens precisas.
          </p>
          <Link
            to={`/f/${tenant.slug}/quiz`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-stone-950 text-stone-50 rounded-full text-lg font-semibold uppercase tracking-wider hover:bg-stone-800 hover:scale-[1.02] transition-all shadow-[0_20px_80px_rgba(0,0,0,0.15)]"
            style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
          >
            {tenant.ctaText || "Começar meu quiz"}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-stone-950 border-t border-stone-800 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center text-stone-500 text-sm">
          <p className="mb-2">© 2024 {tenant.name || "MagikFunil"}. Todos os direitos reservados.</p>
          <p>Fórmulas manipuladas sob responsabilidade do farmacêutico responsável. Consulte seu médico.</p>
          <p className="mt-2 text-xs text-stone-600">
            Powered by <span className="font-medium">MagikFunil</span>
          </p>
        </div>
      </footer>
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