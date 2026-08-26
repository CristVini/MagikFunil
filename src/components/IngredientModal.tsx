"use client";

import { X, Sparkles, Droplets, Wind, ArrowRight, Brain, Zap, ShoppingBag } from "lucide-react";

interface ModalIngredient {
  name: string;
  benefit: string;
  description: string;
  scientific_basis?: string;
  key_actives?: Record<string, string>;
}

interface IngredientModalProps {
  ingredient: ModalIngredient | null;
  onClose: () => void;
  whatsappNumber?: string;
  // O que será "pedido" no micro-CTA (ex: "este cuidado", "a vela essência")
  requestNoun?: string;
}

/**
 * Modal estilo Candle (escuro, sofisticado).
 * Cada nota/ativo/produto abre este modal com benefício + descrição
 * científica + micro-CTA "Pedir ..." — transformando cada item em
 * um ponto de conversão, não só o CTA final.
 */
export function IngredientModal({ ingredient, onClose, whatsappNumber, requestNoun = "este cuidado" }: IngredientModalProps) {
  if (!ingredient) return null;

  const phone = whatsappNumber || "5511999999999";
  const message = `Olá! Concluí meu diagnóstico e gostaria de pedir: ${ingredient.name}. Podem me ajudar?`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] border rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
        style={{ backgroundColor: "var(--theme-dark-surface)", borderColor: "var(--theme-dark-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-3 bg-stone-950/80 text-white rounded-full hover:bg-stone-100 hover:text-stone-950 transition-all border border-stone-800 shadow-xl"
        >
          <X size={24} />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 md:p-14 space-y-8 relative z-10 bg-stone-900">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-stone-100 text-stone-950 rounded-[20px] flex items-center justify-center shrink-0 shadow-2xl">
                <Droplets size={28} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.4em]">Ativo do cuidado</span>
                <h3 className="text-4xl md:text-5xl font-serif text-stone-100 leading-tight">{ingredient.name}</h3>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-800 border border-stone-700 text-stone-100 text-[11px] font-bold rounded-full uppercase tracking-widest shadow-inner">
              <Sparkles size={14} className="text-stone-400" />
              Benefício: {ingredient.benefit}
            </div>

            <div className="space-y-6">
              <p className="text-stone-200 leading-relaxed text-xl md:text-2xl font-light italic font-serif">
                "{ingredient.description}"
              </p>

              {ingredient.scientific_basis && (
                <div className="pt-6 border-t border-stone-800/50 space-y-3">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Brain size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Por que isso ajuda</span>
                  </div>
                  <p className="text-stone-400 text-sm leading-relaxed">{ingredient.scientific_basis}</p>
                </div>
              )}

              {ingredient.key_actives && Object.keys(ingredient.key_actives).length > 0 && (
                <div className="pt-6 border-t border-stone-800/50 space-y-3">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Wind size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Composição</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ingredient.key_actives).map(([k, v]) => (
                      <span key={k} className="px-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-[12px] text-stone-300 font-medium">
                        {k}{v ? ` ${v}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-stone-800/50 space-y-6">
                <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-prose">
                  Este ativo trabalha especialmente o estado de <span className="text-stone-100 font-medium">{ingredient.benefit.toLowerCase()}</span>, de forma natural e com acompanhamento do farmacêutico.
                </p>

                {/* Micro-CTA por item — a essência do funil: cada item converte */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 w-full bg-stone-100 text-stone-950 p-6 md:p-8 rounded-[24px] font-bold text-xs md:text-sm uppercase tracking-[0.3em] hover:bg-white transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-3 flex-1 justify-center">
                    <ShoppingBag size={18} />
                    Pedir {requestNoun}
                  </span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}