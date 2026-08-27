"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { getSubdomain } from "@lib/utils";
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME } from "@packages/theme";
import { ArrowRight, Sparkles, Brain, Zap, Shield } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--theme-background)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--theme-text-muted)]">Carregando...</p>
        </div>
      </div>
    );
  }

  const headline = theme.headline || DEFAULT_TENANT_THEME.headline;
  const subheadline = theme.subheadline || DEFAULT_TENANT_THEME.subheadline;
  const ctaText = theme.ctaText || DEFAULT_TENANT_THEME.ctaText;

  const scrollToComoFunciona = () => {
    const el = document.getElementById("como-funciona");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ===== Fundo vivo: background escuro + orbs brilhantes animadas ===== */}
      <div className="absolute inset-0" style={{ background: "var(--theme-background)" }} />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/20 blur-[120px] animate-float-slow" />
      <div className="absolute top-1/4 -right-40 w-[450px] h-[450px] rounded-full bg-[var(--theme-secondary)]/25 blur-[120px] animate-float" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[var(--theme-primary)]/15 blur-[120px] animate-float-slow" />
      <GridPattern />

      {/* Navbar */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shadow-lg shadow-black/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
              {theme.name}
            </span>
          </div>
          <Link
            to={`/f/${tenant?.slug || slug}/quiz`}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-white rounded-xl font-medium hover:brightness-110 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/30"
          >
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-sm font-medium mb-6 border border-amber-500/20">
              <Zap size={14} />
              Simples, rápido e pensado para você
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
              {headline}
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0" style={{ color: "var(--theme-text-muted)", fontFamily: "var(--font-serif)" }}>
              {subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to={`/f/${tenant?.slug || slug}/quiz`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--theme-primary)] text-white rounded-2xl font-semibold text-lg hover:brightness-110 transition-all hover:scale-[1.02] shadow-lg shadow-black/40 group"
              >
                {ctaText}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={scrollToComoFunciona}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[var(--theme-border)] rounded-2xl font-semibold text-lg hover:bg-white/5 hover:border-white/25 transition-all"
                style={{ color: "var(--theme-text)" }}
              >
                Como funciona
              </button>
            </div>
          </div>

          {/* Right: Visual — grupo de items, sem card pai (evita nested-cards) */}
          <div>
            <div className="space-y-4">
              {[
                { icon: Brain, tint: "bg-amber-500/15 text-amber-400", title: "Um momento com você", desc: "Algumas perguntas simples, em menos de 2 minutos" },
                { icon: Sparkles, tint: "bg-[var(--theme-secondary)]/15 text-[var(--theme-secondary)]", title: "Feito pra você", desc: "Recomendações pensadas para a sua rotina" },
                { icon: Shield, tint: "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]", title: "Tranquilidade", desc: "Produtos que não exigem receita, com acompanhamento" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/25 transition-all hover:-translate-y-0.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.tint}`}>
                    <item.icon size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold" style={{ color: "var(--theme-text)" }}>{item.title}</p>
                    <p className="text-sm" style={{ color: "var(--theme-text-muted)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* How it works — 3 passos (glass cards) */}
      <section id="como-funciona" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
              Como funciona em 3 passos
            </h2>
            <p className="text-[var(--theme-text-muted)] max-w-2xl mx-auto">Três passos simples, sem complicação</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "1. Responda algumas perguntas", desc: "Fale sobre a sua rotina e o que você sente. São perguntas simples, levam menos de 2 minutos." },
              { icon: Sparkles, title: "2. Receba sua recomendação", desc: "Com base nas suas respostas, mostramos o cuidado que mais combina com o seu momento." },
              { icon: Zap, title: "3. Comece o seu cuidado", desc: "Um protocolo simples de produtos, para você começar a se sentir melhor ainda hoje." },
            ].map((step, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <step.icon size={24} className="text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display text-lg font-bold" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--theme-text-muted)" }}>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que confiar section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
              Cuidado de verdade, com segurança
            </h2>
            <p className="text-[var(--theme-text-muted)] max-w-2xl mx-auto">Cada recomendação é pensada para o seu momento, com produtos confiáveis e acompanhamento.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Cuidados", value: "8", desc: "Para diferentes momentos da vida" },
              { label: "Perguntas", value: "14", desc: "Simples e rápidas de responder" },
              { label: "Produtos", value: "20+", desc: "Selecionados com critério" },
              { label: "Cuidado", value: "100%", desc: "Com acompanhamento de farmacêutico" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center hover:border-white/25 transition-colors">
                <div className="text-4xl font-bold mb-2 text-amber-400">{stat.value}</div>
                <div className="font-semibold mb-1" style={{ color: "var(--theme-text)" }}>{stat.label}</div>
                <div className="text-sm" style={{ color: "var(--theme-text-muted)" }}>{stat.desc}</div>
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
          <div className="relative rounded-3xl p-12 md:p-16 overflow-hidden bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-primary)] shadow-2xl shadow-black/40">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent bg-[length:200%_100%] animate-gradient-x pointer-events-none" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Pronto para descobrir o cuidado certo pra você?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Responda algumas perguntas simples e comece a se sentir melhor hoje. Sem compromisso, do seu jeito.
              </p>
              <Link
                to={`/f/${tenant?.slug || slug}/quiz`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--theme-primary)] rounded-2xl font-semibold text-lg hover:bg-opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-black/30"
              >
                {ctaText}
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t" style={{ borderColor: "var(--theme-border)" }}>
        <div className="max-w-7xl mx-auto text-center text-sm" style={{ color: "var(--theme-text-muted)" }}>
          <p>MagikFunil - Cuidado personalizado para farmácias de manipulação</p>
          <p className="mt-2">
            Suplementos e cuidados que não exigem receita. Converse sempre com o seu farmacêutico.
          </p>
        </div>
      </footer>
    </div>
  );
}