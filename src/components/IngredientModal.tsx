"use client";

import { Info, ChevronRight, Brain, Zap, CheckCircle, ExternalLink } from "lucide-react";

interface IngredientModalProps {
  ingredient: {
    name: string;
    description: string;
    benefit: string;
    scientific_basis?: string;
    references?: string[];
    key_actives?: Record<string, string>;
  } | null;
  onClose: () => void;
}

export function IngredientModal({ ingredient, onClose }: IngredientModalProps) {
  if (!ingredient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-bold text-stone-950">
            {ingredient.name}
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600">
            <ChevronRight size={24} className="rotate-90" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-stone-600 text-sm">{ingredient.description}</p>
          
          <div className="pt-2 border-t border-stone-200">
            <p className="text-stone-500 text-xs"><strong>Benefício:</strong> {ingredient.benefit}</p>
          </div>

          {ingredient.key_actives && (
            <div className="pt-2 border-t border-stone-200">
              <p className="text-stone-500 text-xs mb-2"><strong>Ativos-chave:</strong></p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(ingredient.key_actives).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-medium">
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ingredient.scientific_basis && (
            <div className="pt-2 border-t border-stone-200">
              <div className="flex items-center gap-2 text-stone-500 mb-2">
                <Brain size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Base Científica</span>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed italic">
                {ingredient.scientific_basis}
              </p>
            </div>
          )}

          {ingredient.references && ingredient.references.length > 0 && (
            <div className="pt-2 border-t border-stone-200">
              <div className="flex items-center gap-2 text-stone-500 mb-2">
                <CheckCircle size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Referências</span>
              </div>
              <ul className="space-y-1 text-xs text-stone-600">
                {ingredient.references.map((ref: string, i: number) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span className="text-stone-600">{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={onClose} className="mt-6 w-full py-2 px-4 bg-stone-950 text-stone-50 rounded-lg font-medium hover:bg-stone-800 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}