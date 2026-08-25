import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { useQuiz } from '@hooks/useQuiz';
import { ShoppingBag, ArrowRight, Brain, Zap, Wind, RotateCcw, Info, Sparkles } from 'lucide-react';

export function Result() {
  const { slug } = useParams<{ slug: string }>();
  const { getResult, reset, fetchQuiz } = useQuiz(slug!);
  const [result, setResult] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchQuiz(slug!).then(() => {
      const r = useQuiz.getState().getResult();
      setResult(r);
    });
  }, [slug]);

  // Buscar tenant para tema
  useEffect(() => {
    supabase.from('tenants').select('*').eq('slug', slug).single().then(({ data }) => {
      if (data) setTenant(data);
    });
  }, [slug]);

  if (!result?.winner) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="animate-pulse-soft text-stone-500">Calculando seu resultado...</div>
      </div>
    );
  }

  const winner = result.winner;
  const runnerUp = result.runnerUp;
  const ranking = result.ranking;

  // Buscar produtos recomendados para o perfil vencedor
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from('template_profile_products')
      .select(`
        position,
        is_primary,
        products (*)
      `)
      .eq('template_id', useQuiz.getState().questions[0]?.template_id || '')
      .eq('profile_id', winner.id)
      .order('position')
      .then(({ data }) => {
        if (data) setRecommendedProducts(data.map(d => d.products).filter(Boolean));
      });
  }, [winner.id]);

  const whatsappUrl = tenant?.whatsapp 
    ? `https://wa.me/55${tenant.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Concluí meu quiz e meu perfil é: ${winner.name}. Gostaria de saber mais sobre meu protocolo personalizado!`)}`
    : '#';

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.08)]">
          <div className="p-8 md:p-12">
            {/* Header com perfil vencedor */}
            <div className="grid lg:grid-cols-3 gap-12 mb-12">
              {/* Coluna 1: Identidade do Perfil */}
              <div className="lg:border-r lg:border-stone-200 lg:pr-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse"></div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.5em]">Perfil Identificado</span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-display font-bold text-stone-950 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {winner.name}
                  </h2>
                  <p className="text-amber-500/80 text-xl font-light italic tracking-wide">
                    {winner.archetype}
                  </p>

                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-stone-500">
                        <Brain size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Base Científica</span>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed italic">
                        {winner.scientific_basis}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-stone-500">
                        <Zap size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Efeito Esperado</span>
                      </div>
                      <p className="text-stone-700 text-sm font-medium leading-relaxed">
                        {winner.expected_effect}
                      </p>
                    </div>

                    {runnerUp && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Influência secundária</span>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          Com forte inclinação para <span className="text-amber-600 font-medium">{runnerUp.name}</span> ({runnerUp.archetype}).
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {runnerUp.notes?.map((note: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-full text-[10px] text-stone-600 font-medium">
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={reset}
                  className="mt-8 flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors text-[10px] font-bold uppercase tracking-widest w-fit"
                >
                  <RotateCcw size={12} />
                  Refazer Análise
                </button>
              </div>

              {/* Coluna 2: Ativos-chave */}
              <div className="lg:border-r lg:border-stone-200 lg:px-8">
                <div className="flex items-center gap-3 text-stone-500 mb-6">
                  <Wind size={16} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Ativos-Chave do Protocolo</span>
                </div>
                <div className="flex flex-col gap-3">
                  {winner.notes?.map((note: string, i: number) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedProduct({ name: note, description: `Ativo essencial para ${winner.name}.`, benefit: winner.expected_effect })}
                      className="group relative flex items-center gap-4 p-4 bg-stone-50 border border-stone-200 rounded-2xl transition-all duration-300 hover:border-amber-300 hover:bg-amber-50/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 text-xs font-bold group-hover:text-amber-500 group-hover:border-amber-300 transition-colors">
                        {i + 1 < 10 ? `0${i + 1}` : i + 1}
                      </div>
                      <span className="text-lg font-serif text-stone-800 group-hover:text-stone-950 transition-colors">{note}</span>
                      <Info size={14} className="ml-auto text-stone-300 group-hover:text-amber-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Coluna 3: Protocolo + CTA */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 text-amber-500/60">
                  <Sparkles size={16} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Seu Protocolo Recomendado</span>
                </div>

                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {recommendedProducts.length > 0 ? (
                    recommendedProducts.map((prod: any, i: number) => (
                      <div key={prod.id || i} className="flex gap-4 group">
                        <div className="shrink-0 w-12 h-12 rounded-xl border border-stone-200 flex items-center justify-center bg-stone-50 group-hover:border-amber-300 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300">
                          <Sparkles size={20} className="text-amber-500" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <h5 className="text-stone-950 text-sm font-bold uppercase tracking-wider truncate">
                            {prod.name}
                          </h5>
                          <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                            {prod.description || winner.expected_effect}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {prod.key_actives && Object.entries(prod.key_actives).slice(0, 3).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-medium">
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-stone-500">
                      <p>Nenhum produto configurado para este perfil ainda.</p>
                    </div>
                  )}
                </div>

                {/* CTA WhatsApp */}
                <div className="pt-6 border-t border-stone-200">
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-4 bg-stone-950 text-stone-50 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-[0.2em] hover:bg-stone-800 hover:scale-[1.02] transition-all shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
                  >
                    <ShoppingBag size={18} />
                    Falar com especialista no WhatsApp
                    <ArrowRight size={18} />
                  </Link>
                  <p className="text-center text-stone-500 text-xs mt-3">
                    Ou acesse seu painel para ver todos os produtos e links de compra
                  </p>
                </div>
              </div>
            </div>

            {/* Ranking completo */}
            <div className="pt-8 border-t border-stone-200">
              <h3 className="text-lg font-display font-bold text-stone-950 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Ranking completo dos seus perfis
              </h3>
              <div className="flex flex-wrap gap-2">
                {ranking.map((profile: any, i: number) => (
                  <span 
                    key={profile.id}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      i === 0 
                        ? 'bg-amber-500 text-stone-950' 
                        : i === 1 
                          ? 'bg-stone-200 text-stone-700' 
                          : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {i + 1}. {profile.name} {result.scores[profile.id] && `(${result.scores[profile.id]} pts)`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
                {selectedProduct.name}
              </h3>
              <button onClick={() => setSelectedProduct(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <Info size={20} />
              </button>
            </div>
            <p className="text-stone-600 text-sm mb-4">{selectedProduct.description}</p>
            <p className="text-stone-500 text-xs"><strong>Benefício:</strong> {selectedProduct.benefit}</p>
            <button onClick={() => setSelectedProduct(null)} className="mt-6 w-full py-2 px-4 bg-stone-950 text-stone-50 rounded-lg font-medium hover:bg-stone-800 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import useState
import { useState } from 'react';