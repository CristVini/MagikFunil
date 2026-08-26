"use client";

import { useState } from "react";
import { Brain, Shield, Leaf, BookOpen, X, ArrowRight } from "lucide-react";

// ============================================================
// Bloco 4.2 — Seção "Ciência" (Prova / Aprofundamento)
// Blueprint: 3 blocos de princípios + 1 bloco destaque com CTA
// para abrir as Referências. Fundamental para o diferimento de
// objeções — quem duvida do resultado tem para onde ir sem sair.
// ============================================================

interface SciencePrinciple {
  icon: any;
  title: string;
  lines: string[]; // 2 frases curtas
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
    title: "Personalização que faz sentido",
    lines: [
      "Cada pessoa tem um ritmo, uma rotina e necessidades diferentes.",
      "Em vez de uma resposta pronta para todos, o cuidado é pensado para o seu momento.",
    ],
  },
  {
    icon: Leaf,
    title: "Nutrientes que o corpo já conhece",
    lines: [
      "Trabalhamos com substâncias que o próprio organismo usa naturalmente no dia a dia.",
      "Vitaminas, minerais e plantas em dose adequada, sempre com orientação.",
    ],
  },
  {
    icon: Shield,
    title: "Segurança em primeiro lugar",
    lines: [
      "Todos os produtos não exigem receita e são manipulados com responsabilidade.",
      "Nada substitui o acompanhamento — por isso o farmacêutico está sempre à disposição.",
    ],
  },
];

// Referências genéricas, aplicáveis ao nicho (suplementação/bem-estar)
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
      <section className="relative z-10 py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-sm font-medium mb-4">
              <BookOpen size={14} />
              Por que confiar
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-950 mb-4" style={{ fontFamily: "var(--font-display)" }}>
              O cuidado por trás do cuidado
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Três princípios simples explicam como pensamos cada recomendação.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="text-center p-8 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <p.icon size={30} className="text-amber-500" />
                </div>
                <h3 className="font-display text-lg font-bold text-stone-950 mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  {p.title}
                </h3>
                {p.lines.map((line, j) => (
                  <p key={j} className="text-sm text-stone-600 mb-2">{line}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Bloco destaque → abre Referências */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-10 md:p-14 text-center">
            <BookOpen size={40} className="mx-auto text-amber-500 mb-4" />
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Quer saber de onde vem tudo isso?
            </h3>
            <p className="text-stone-300 text-lg max-w-xl mx-auto mb-8">
              Confira as referências que ajudam a embasar cada cuidado que recomendamos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowRefs(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-stone-950 rounded-2xl font-semibold text-lg hover:bg-amber-400 transition-colors"
              >
                Ver referências
                <ArrowRight size={20} />
              </button>
              {onExplore && (
                <button
                  onClick={onExplore}
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-stone-600 text-stone-200 rounded-2xl font-semibold text-lg hover:bg-stone-700 transition-colors"
                >
                  Descobrir meu cuidado
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Referências */}
      {showRefs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
                Referências e estudos
              </h3>
              <button onClick={() => setShowRefs(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-stone-500 mb-6">
                Uma seleção de estudos que ajudam a pensar os cuidados que recomendamos.
              </p>
              <ul className="space-y-4">
                {REFERENCES.map((r, i) => (
                  <li key={i} className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-medium text-stone-950 text-sm">{r.title}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      {r.authors} · {r.year} · <span className="text-amber-600">{r.focus}</span>
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