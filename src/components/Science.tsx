"use client";

import { useState } from "react";
import { Brain, Shield, Leaf, BookOpen, X, ArrowRight } from "lucide-react";

// ============================================================
// Bloco 4.2 — Seção "Ciência" (Prova / Aprofundamento)
// Usa o tema escuro modular: orbs discretas, glassmorphism,
// copy direta — sem bordas finas + sombras largas (slop de IA).
// ============================================================

interface SciencePrinciple {
  icon: any;
  title: string;
  lines: string[];
}

interface Reference {
  authors: string;
  year: string;
  title: string;
  focus: string;
}

const PRINCIPLES: SciencePrinciple[] = [
  {
    icon: Brain,
    title: "Recomendação por perfil",
    lines: [
      "Cada pessoa tem um ritmo e necessidades diferentes.",
      "O quiz identifica sinais da sua rotina antes de recomendar — sem achismo.",
    ],
  },
  {
    icon: Leaf,
    title: "Base em evidência",
    lines: [
      "Os perfis foram criados com referências científicas (estudos com PMID).",
      "A recomendação nasce da literatura, não de moda.",
    ],
  },
  {
    icon: Shield,
    title: "Segurança e clareza",
    lines: [
      "Você recebe um diagnóstico inicial entendível + a base para ele.",
      "Isso remove a sensação de 'chute' e aumenta a confiança para decidir.",
    ],
  },
];

const REFERENCES: Reference[] = [
  { authors: "Am J Clin Nutr", year: "2011", title: "Catequinas do chá verde e gasto energético", focus: "Apoio ao metabolismo" },
  { authors: "Cochrane Database", year: "2017", title: "Zinco e duração de resfriados", focus: "Defesas naturais" },
  { authors: "Nutrients Journal", year: "2021", title: "Magnésio e qualidade do sono", focus: "Descanso" },
  { authors: "Am J Clin Nutr", year: "2015", title: "Fibra solúvel e saciedade", focus: "Controle de apetite" },
  { authors: "J Int Soc Sports Nutr", year: "2018", title: "Proteína e recuperação muscular", focus: "Performance" },
  { authors: "Skin Pharmacol Physiol", year: "2019", title: "Colágeno e elasticidade da pele", focus: "Bem-estar da pele" },
  { authors: "J Clin Psychiatry", year: "2019", title: "Ashwagandha e estresse", focus: "Equilíbrio emocional" },
  { authors: "Gut Microbes", year: "2021", title: "Prebióticos e saúde intestinal", focus: "Digestão" },
];

export function ScienceSection({ onExplore }: { onExplore?: () => void }) {
  const [showRefs, setShowRefs] = useState(false);

  return (
    <>
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-sm font-medium mb-4 border border-amber-500/20">
              <BookOpen size={14} />
              Base científica
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
              Por que esse funil entrega mais do que um formulário
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: "var(--theme-text-muted)" }}>
              Ele entende o que você precisa antes de recomendar — não só o que você quer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-white/25 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <p.icon size={24} className="text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display text-base font-bold" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
                      {p.title}
                    </h3>
                    <div className="mt-2 space-y-2">
                      {p.lines.map((line, j) => (
                        <p key={j} className="text-sm leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bloco destaque → abre Referências */}
          <div className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="relative">
              <BookOpen size={40} className="mx-auto text-amber-400 mb-4" />
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
                Quer ver a base por trás dessas recomendações?
              </h3>
              <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: "var(--theme-text-muted)" }}>
                Veja exemplos de estudos e referências que contribuem para montar perfis mais assertivos e seguros.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowRefs(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--theme-primary)] text-white rounded-2xl font-semibold text-lg hover:brightness-110 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/30"
                >
                  Ver referências
                  <ArrowRight size={20} />
                </button>
                {onExplore && (
                  <button
                    onClick={onExplore}
                    className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all"
                    style={{ color: "var(--theme-text)" }}
                  >
                    Fazer o quiz agora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Referências */}
      {showRefs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--theme-surface)] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--theme-border)" }}>
              <h3 className="font-display text-xl font-bold" style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}>
                Referências e estudos
              </h3>
              <button onClick={() => setShowRefs(false)} className="p-1 hover:opacity-70" style={{ color: "var(--theme-text-muted)" }}>
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm mb-6" style={{ color: "var(--theme-text-muted)" }}>
                Uma seleção de estudos usada como referência para construir os perfis e entender os efeitos dos cuidados recomendados.
              </p>
              <ul className="space-y-4">
                {REFERENCES.map((r, i) => (
                  <li key={i} className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <p className="font-medium text-sm" style={{ color: "var(--theme-text)" }}>{r.title}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--theme-text-muted)" }}>
                      {r.authors} · {r.year} · <span className="text-amber-400">{r.focus}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}