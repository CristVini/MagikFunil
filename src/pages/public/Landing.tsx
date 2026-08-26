"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { getSubdomain } from "@lib/utils";
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME } from "@packages/theme";
import { ArrowRight, Sparkles, Brain, Zap, Shield, ChevronRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { GridPattern } from "@components/ui";
import { ScienceSection } from "@components/Science";

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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Carregando...</p>
        </div>
      </div>
    );
  }

  const headline = theme.headline || DEFAULT_TENANT_THEME.headline;
  const subheadline = theme.subheadline || DEFAULT_TENANT_THEME.subheadline;
  const ctaText = theme.ctaText || DEFAULT_TENANT_THEME.ctaText;
  const primaryColor = theme.colors.primary;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--theme-background)]" />
      <GridPattern />

      {/* Navbar */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
              {theme.name}
            </span>
          </div>
          <Link to={`/f/${tenant?.slug || slug}/quiz`} className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-[var(--theme-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
            {ctaText}
            <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-sm font-medium mb-6">
              <Zap size={14} />
              Simples, rápido e pensado para você
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-stone-950 leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
              {headline}
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-8 max-w-2xl mx-auto lg:mx-0" style={{ fontFamily: "var(--font-serif)" }}>
              {subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to={`/f/${tenant?.slug || slug}/quiz`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--theme-primary)] text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/25"
              >
                {ctaText}
                <ArrowRight size={20} />
              </Link>
              <Link
                to={`/f/${tenant?.slug || slug}/quiz`}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-stone-200 text-stone-700 rounded-2xl font-semibold text-lg hover:bg-stone-50 transition-colors"
              >
                Como funciona
              </Link>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-stone-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                    <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Brain size={28} className="text-amber-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-stone-950">Um momento com você</h3>
                      <p className="text-sm text-stone-500">Algumas perguntas simples, em menos de 2 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                    <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center">
                      <Sparkles size={28} className="text-pink-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-stone-950">Feito pra você</h3>
                      <p className="text-sm text-stone-500">Recomendações pensadas para a sua rotina</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                    <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Shield size={28} className="text-green-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-stone-950">Tranquilidade</h3>
                      <p className="text-sm text-stone-500">Produtos que não exigem receita, com acompanhamento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section className="relative z-10 py-20 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-950 mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Como funciona em 3 passos
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">Três passos simples, sem complicação</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "1. Responda algumas perguntas",
                desc: "Fale sobre a sua rotina e o que você sente. São perguntas simples, levam menos de 2 minutos.",
              },
              {
                icon: Sparkles,
                title: "2. Receba sua recomendação",
                desc: "Com base nas suas respostas, mostramos o cuidado que mais combina com o seu momento.",
              },
              {
                icon: Zap,
                title: "3. Comece o seu cuidado",
                desc: "Um protocolo simples de produtos, para você começar a se sentir melhor ainda hoje.",
              },
            ].map((step, i) => (
              <div key={i} className="text-center p-8 bg-white rounded-2xl border border-stone-200 hover:border-amber-200 hover:shadow-lg transition-all">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <step.icon size={32} className="text-amber-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-stone-950 mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  {step.title}
                </h3>
                <p className="text-stone-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que confiar section */}
      <section className="relative z-10 py-20 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-950 mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Cuidado de verdade, com segurança
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">Cada recomendação é pensada para o seu momento, com produtos confiáveis e acompanhamento.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Cuidados", value: "8", desc: "Para diferentes momentos da vida" },
              { label: "Perguntas", value: "14", desc: "Simples e rápidas de responder" },
              { label: "Produtos", value: "20+", desc: "Selecionados com critério" },
              { label: "Cuidado", value: "100%", desc: "Com acompanhamento de farmacêutico" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 text-center">
                <div className="text-4xl font-bold text-amber-500 mb-2">{stat.value}</div>
                <div className="font-semibold text-stone-950 mb-1">{stat.label}</div>
                <div className="text-sm text-stone-500">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloco 4.2 — Ciência / Prova (blueprint) */}
      <ScienceSection onExplore={() => { window.location.href = `/f/${tenant?.slug || slug}/quiz`; }} />

      {/* CTA Final */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-12 md:p-16 shadow-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Pronto para descobrir o cuidado certo pra você?
            </h2>
            <p className="text-amber-100 text-lg mb-8 max-w-xl mx-auto">
              Responda algumas perguntas simples e comece a se sentir melhor hoje. Sem compromisso, do seu jeito.
            </p>
            <Link
              to={`/f/${tenant?.slug || slug}/quiz`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-2xl font-semibold text-lg hover:bg-amber-50 transition-all hover:scale-[1.02]"
            >
              {ctaText}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-stone-500 text-sm">
          <p>MagikFunil - Cuidado personalizado para farmácias de manipulação</p>
          <p className="mt-2">
            Suplementos e cuidados que não exigem receita. Converse sempre com o seu farmacêutico.
          </p>
        </div>
      </footer>
    </div>
  );
}