"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuiz } from "@hooks/useQuiz";
import {
  ShoppingBag, RotateCcw, Info, Sparkles, Wind, Moon, Sun, Coffee,
  ArrowRight, Brain, Zap, Flame,
} from "lucide-react";
import { supabase } from "@lib/supabase";
import { IngredientModal } from "@components/IngredientModal";
import { resolveCTAAction, buildCtaDestination, CTAAction } from "@packages/cta";

// Lê a personalização do kit (nome, texto de apoio, preços) feita pelo cliente no dashboard
const KITS_STORAGE_KEY = "magikfunil-kits";
function getKitOverride(id: string): { kit_name?: string; support_text?: string; price_cents?: number; promo_price_cents?: number } {
  try {
    const raw = localStorage.getItem(KITS_STORAGE_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw);
    return all[id] || {};
  } catch {
    return {};
  }
}

// Formata centavos -> "R$ 89,90"
const brl = (cents?: number | null) =>
  cents == null ? "" : `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

interface QuizResult {
  winner: any | null;
  runnerUp: any | null;
  ranking: any[];
  scores: Record<string, number>;
}

export function Result() {
  const { slug } = useParams<{ slug: string }>();
  const { reset, fetchQuiz, getRecommendedProducts, scores } = useQuiz();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<any | null>(null);
  const [showScienceModal, setShowScienceModal] = useState(false);

  useEffect(() => {
    fetchQuiz(slug!).then(() => {
      const r = useQuiz.getState().getResult();
      setResult(r);
      // O tenant dono do funil já vem no get_funnel (se for cliente real).
      // Usa-o; a query abaixo é reforço quando o slug não resolveu tenant.
      if (useQuiz.getState().tenant) setTenant(useQuiz.getState().tenant);
    });
    if (!useQuiz.getState().tenant) {
      supabase.from("tenants").select("*").eq("slug", slug).single().then(({ data }: { data: any }) => {
        if (data) setTenant(data);
      });
    }
  }, [slug]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-dark-background)]" style={{ fontFamily: "var(--font-sans)" }}>
        <p className="text-stone-400 animate-pulse">Calculando seu resultado...</p>
      </div>
    );
  }

  const { winner, runnerUp, ranking } = result;
  const recommendedProducts = getRecommendedProducts(winner?.id || "");

  // Resolve o detalhe do ativo a partir da lista de notas do perfil.
  // Dados reais vêm do get_funnel (notes do perfil). Quando não há detalhe
  // específico do ativo, usa copy neutra de apresentação (não é dado de negócio).
  const activeNotes = ((winner?.notes || []) as string[]).map((note: string) => ({
    name: note,
    benefit: "Bem-estar",
    description: "Ativo que apoia o cuidado recomendado para o seu momento.",
    scientific_basis: "",
  }));

  const handleIngredientClick = (note: any) => {
    setSelectedIngredient(note);
    useQuiz.getState().trackEvent("product_click", { profile_id: winner?.id, note: note.name });
  };

  const handleCtaClick = () => {
    const winnerScore = scores[winner?.id] || 0;
    const ctaAction: CTAAction = resolveCTAAction(
      { type: "whatsapp" },
      tenant?.whatsapp,
      winner?.name
    );
    const destination = buildCtaDestination(ctaAction, {
      profile: winner?.id || "",
      profileName: winner?.name || "",
      score: winnerScore,
      slug: slug || "",
      source: "quiz",
    });
    useQuiz.getState().trackEvent("cta_click", { type: ctaAction.type, profile: winner?.id });
    window.open(destination, "_blank", "noopener,noreferrer");
  };

  const getIcon = (index: number) => {
    if (index === 0) return <Sun size={20} className="text-amber-400" />;
    if (index === 1) return <Coffee size={20} className="text-amber-200" />;
    return <Moon size={20} className="text-amber-500" />;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-dark-background)] to-[var(--theme-dark-surface)]" />

      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--theme-primary)", color: "var(--theme-dark-on-primary)" }}>
              <Sparkles size={20} />
            </div>
            <span className="font-display font-bold text-xl text-[var(--theme-dark-text)]" style={{ fontFamily: "var(--font-display)" }}>
              {tenant?.name || "MagikFunil"}
            </span>
          </div>
        </nav>
      </header>

      <main className="relative z-10 px-4 sm:px-6 py-6 mb-6">
        <div className="w-full max-w-7xl mx-auto border rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-98 duration-1000 backdrop-blur-2xl" style={{ backgroundColor: "var(--theme-dark-surface)", borderColor: "var(--theme-dark-border)" }}>
          <div className="p-8 md:p-14 flex flex-col space-y-12">
            {/* Grid Principal de 3 Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">

              {/* Coluna 1: Identidade do Perfil */}
              <div className="flex flex-col justify-between space-y-10 lg:border-r lg:pr-10" style={{ borderColor: "var(--theme-dark-border)" }}>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--theme-accent)", boxShadow: "0 0 15px var(--theme-accent)" }}></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: "var(--theme-dark-text-muted)" }}>Diagnóstico Identificado</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl md:text-6xl font-serif tracking-tighter leading-none" style={{ color: "var(--theme-dark-text)", fontFamily: "var(--font-display)" }}>
                      {winner?.name}
                    </h2>
                    <p className="text-xl font-light italic tracking-wide" style={{ color: "var(--theme-accent)" }}>
                      {winner?.archetype}
                    </p>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2" style={{ color: "var(--theme-dark-text-muted)" }}>
                        <Brain size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Base Científica</span>
                      </div>
                      <p className="text-sm leading-relaxed italic" style={{ color: "var(--theme-dark-text-muted)" }}>
                        {winner?.scientific_basis}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2" style={{ color: "var(--theme-dark-text-muted)" }}>
                        <Zap size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Efeito Esperado</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--theme-dark-text)" }}>
                        {winner?.expected_effect}
                      </p>
                    </div>

                    {runnerUp && runnerUp.score > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--theme-accent)" }}></div>
                          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--theme-dark-text-muted)" }}>Influência secundária</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--theme-dark-text-muted)" }}>
                          Com forte inclinação para <span className="font-medium" style={{ color: "var(--theme-accent)" }}>{runnerUp.name}</span> ({runnerUp.archetype}). Considere combinar os dois cuidados para uma experiência completa.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group w-fit transition-colors"
                  style={{ color: "var(--theme-dark-text-muted)" }}
                >
                  <RotateCcw size={12} className="group-hover:rotate-[-45deg] transition-transform" />
                  Refazer Diagnóstico
                </button>
              </div>

              {/* Coluna 2: Arquitetura de Ativos (notas clicáveis) */}
              <div className="space-y-8 lg:border-r lg:pr-10" style={{ borderColor: "var(--theme-dark-border)" }}>
                <div className="flex items-center gap-3" style={{ color: "var(--theme-dark-text-muted)" }}>
                  <Wind size={16} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Arquitetura de Ativos</span>
                </div>

                <div className="flex flex-col gap-4">
                  {activeNotes.map((note: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleIngredientClick(note)}
                      className="group relative flex items-center gap-6 p-6 border rounded-[24px] transition-all duration-500 hover:border-amber-500/30 hover:bg-amber-500/5"
                      style={{ backgroundColor: "rgba(0,0,0,0.4)", borderColor: "var(--theme-dark-border)" }}
                    >
                      <div className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-colors group-hover:text-amber-500" style={{ borderColor: "var(--theme-dark-border)", color: "var(--theme-dark-text-muted)" }}>
                        0{i + 1}
                      </div>
                      <span className="text-xl md:text-2xl font-serif group-hover:translate-x-1 transition-all duration-500" style={{ color: "var(--theme-dark-text)", fontFamily: "var(--font-display)" }}>{note.name}</span>
                      <span className="ml-auto text-[10px] uppercase tracking-widest transition-colors group-hover:text-amber-500" style={{ color: "var(--theme-dark-border)" }}>{note.benefit}</span>
                      <Info size={14} className="transition-colors group-hover:text-amber-500/50" style={{ color: "var(--theme-dark-border)" }} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowScienceModal(true)}
                  className="flex items-center gap-2 transition-colors text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--theme-dark-text-muted)" }}
                >
                  <Brain size={12} />
                  Ver referências científicas
                </button>
              </div>

              {/* Coluna 3: Kits Recomendados (produtos + kit em destaque) */}
              <div className="space-y-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-3" style={{ color: "var(--theme-accent)" }}>
                    <Sparkles size={16} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Kits recomendados</span>
                  </div>
                  <p className="text-sm font-light" style={{ color: "var(--theme-dark-text-muted)" }}>
                    Este é o passo a passo pensado para o seu momento. O kit é a forma mais completa (e com melhor custo) de começar.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {recommendedProducts.map((prod, i) =>
                    prod.show_promo && prod.promo_price_cents != null ? (
                      // ===== Item em PROMOÇÃO — destaque grande =====
                      <div key={prod.id} className="relative rounded-3xl p-6 overflow-hidden border-2 animate-in fade-in zoom-in-95 duration-500"
                        style={{
                          borderColor: "var(--theme-primary)",
                          background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                          boxShadow: "0 20px 60px -20px var(--theme-primary)",
                        }}
                      >
                        {/* Cantos/gradiente sutil */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: "var(--theme-primary)", opacity: 0.18 }} />

                        <div className="relative flex flex-col gap-4">
                          {/* Topo: badge PROMO grande */}
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                              style={{ backgroundColor: "var(--theme-primary)", color: "var(--theme-dark-on-primary)", boxShadow: "0 4px 16px -4px var(--theme-primary)" }}>
                              <Flame size={14} /> Promoção
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--theme-dark-text-muted)" }}>
                              Passo {i + 1} · {prod.category.replace("_", " ")}
                            </span>
                          </div>

                          {/* Nome + preços */}
                          <div className="flex items-end justify-between gap-4 flex-wrap">
                            <div className="min-w-0">
                              <h4 className="text-2xl font-display font-bold leading-tight" style={{ color: "var(--theme-dark-text)", fontFamily: "var(--font-display)" }}>
                                {getKitOverride(prod.id).kit_name || prod.name}
                              </h4>
                              <p className="text-sm font-light mt-1" style={{ color: "var(--theme-dark-text-muted)" }}>
                                {getKitOverride(prod.id).support_text || prod.support_text || "Protocolo de 30 dias · os produtos não precisam de receita"}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-end gap-1.5" style={{ color: "var(--theme-dark-text-muted)" }}>
                                Por apenas
                              </p>
                              <div className="flex items-end justify-end gap-2">
                                {(() => {
                                  const o = getKitOverride(prod.id);
                                  const promo = o.promo_price_cents ?? prod.promo_price_cents;
                                  const normal = o.price_cents ?? prod.price_cents;
                                  if (normal && promo && normal > promo) {
                                    // Preço normal riscado + promocional grande
                                    return (
                                      <>
                                        <span className="text-2xl font-semibold line-through opacity-70" style={{ color: "var(--theme-dark-text-muted)" }}>
                                          {brl(normal)}
                                        </span>
                                        <span className="text-4xl font-black tracking-tight leading-none" style={{ color: "var(--theme-primary)" }}>
                                          {brl(promo)}
                                        </span>
                                      </>
                                    );
                                  }
                                  if (promo) {
                                    return (
                                      <span className="text-4xl font-black tracking-tight leading-none" style={{ color: "var(--theme-primary)" }}>
                                        {brl(promo)}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Descrição */}
                          <p className="text-sm leading-relaxed font-light" style={{ color: "var(--theme-dark-text-muted)" }}>
                            {prod.description}
                          </p>

                          {/* Ação */}
                          <button
                            onClick={() => handleIngredientClick({
                              name: prod.name,
                              benefit: "Kit em promoção",
                              description: prod.description,
                              scientific_basis: `${Object.entries(prod.key_actives || {}).map(([k, v]) => `${k}${v ? " " + v : ""}`).join(" + ")}`,
                              key_actives: prod.key_actives,
                            })}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-transform"
                            style={{ backgroundColor: "var(--theme-primary)", color: "var(--theme-dark-on-primary)", boxShadow: "0 8px 30px -8px var(--theme-primary)" }}
                          >
                            Peça este kit hoje
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ===== Item normal (Passo X) =====
                      <div key={prod.id} className="flex gap-5 group/step">
                        <div className="shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500" style={{ borderColor: "var(--theme-dark-border)", backgroundColor: "var(--theme-dark-background)" }}>
                          {getIcon(i)}
                        </div>
                        <button
                          onClick={() => handleIngredientClick({
                            name: prod.name,
                            benefit: "Cuidado",
                            description: prod.description,
                            scientific_basis: `${Object.entries(prod.key_actives || {}).map(([k, v]) => `${k}${v ? " " + v : ""}`).join(" + ")}`,
                            key_actives: prod.key_actives,
                          })}
                          className="space-y-1.5 text-left group/step"
                        >
                          <h5 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--theme-dark-text)" }}>
                            Passo {i + 1}
                          </h5>
                          <p className="text-sm leading-relaxed font-light" style={{ color: "var(--theme-dark-text-muted)" }}>
                            <span className="font-medium" style={{ color: "var(--theme-accent)" }}>{prod.name}:</span> {prod.description}
                          </p>
                        </button>
                      </div>
                    )
                  )}
                  {recommendedProducts.length === 0 && (
                    <p className="text-sm" style={{ color: "var(--theme-dark-text-muted)" }}>Carregando protocolo recomendado...</p>
                  )}
                </div>

                {/* Ranking pequeno */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--theme-dark-border)" }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--theme-dark-text-muted)" }}>Outros cuidados que combinam</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ranking.slice(1, 5).map((p) => (
                      <span key={p.id} className="px-3 py-1.5 border rounded-full text-[10px] font-medium" style={{ backgroundColor: "var(--theme-dark-background)", borderColor: "var(--theme-dark-border)", color: "var(--theme-dark-text-muted)" }}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer: CTA */}
            <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-8 border-t" style={{ borderColor: "var(--theme-dark-border)" }}>
              <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--theme-dark-text-muted)" }}>Próximo Passo</p>
                <p className="text-xl font-light max-w-md" style={{ color: "var(--theme-dark-text)" }}>
                  Fale com nosso especialista para garantir seu cuidado personalizado.
                </p>
              </div>

              <button
                onClick={handleCtaClick}
                className="w-full md:w-auto flex items-center justify-center gap-4 md:gap-8 px-8 py-5 md:px-14 md:py-7 rounded-full font-bold text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.4em] hover:scale-[1.02] transition-all active:scale-95 group"
                style={{ backgroundColor: "var(--theme-dark-text)", color: "var(--theme-dark-background)" }}
              >
                <ShoppingBag size={18} className="md:w-5 md:h-5" />
                Garantir meu Protocolo
                <ArrowRight size={18} className="md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal do Ativo/Produto */}
      <IngredientModal
        ingredient={selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
        whatsappNumber={tenant?.whatsapp}
        requestNoun="este cuidado"
      />

      {/* Modal de Referências */}
      {showScienceModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl max-h-[90vh] border overflow-y-auto p-8 md:p-12 animate-in zoom-in-95 duration-300" style={{ backgroundColor: "var(--theme-dark-surface)", borderColor: "var(--theme-dark-border)", borderRadius: "40px" }}>
            <button
              onClick={() => setShowScienceModal(false)}
              className="absolute top-6 right-6 z-50 p-3 bg-black/80 text-white rounded-full hover:bg-stone-100 hover:text-stone-950 transition-all border border-stone-800"
            >
              <RotateCcw size={20} />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: "var(--theme-dark-text-muted)" }}>Base Científica</span>
            <h3 className="text-3xl font-serif leading-tight mt-2 mb-6" style={{ color: "var(--theme-dark-text)", fontFamily: "var(--font-display)" }}>{winner?.name}</h3>
            <p className="text-sm leading-relaxed mb-6 italic" style={{ color: "var(--theme-dark-text-muted)" }}>{winner?.scientific_basis}</p>

            <div className="flex items-center gap-2 mb-3" style={{ color: "var(--theme-dark-text-muted)" }}>
              <Brain size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Referências</span>
            </div>
            <ul className="space-y-2 text-sm" style={{ color: "var(--theme-dark-text-muted)" }}>
              {(winner?.references || []).map((ref: string, i: number) => (
                <li key={i} className="leading-relaxed">• {ref}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}