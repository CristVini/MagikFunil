"use client";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { useQuiz } from "@hooks/useQuiz";
import { ArrowRight, ShoppingBag, CheckCircle, Sparkles, Loader2, ExternalLink } from "lucide-react";

export function ProductCapture() {
  const { slug } = useParams<{ slug: string }>();
  const { fetchQuiz } = useQuiz();
  const [tenant, setTenant] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuiz(slug!);
  }, [slug]);

  useEffect(() => {
    supabase.from("tenants").select("*").eq("slug", slug).single().then(({ data }: { data: any }) => {
      if (data) setTenant(data);
    });
  }, [slug]);

  // Buscar produto via query param ou sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product_id");
    const productName = params.get("product_name");

    if (productId) {
      supabase.from("products").select("*").eq("id", productId).single().then(({ data }: { data: any }) => {
        if (data) setProduct(data);
      });
    } else if (productName) {
      supabase.from("products").select("*").ilike("name", `%${productName}%`).single().then(({ data }: { data: any }) => {
        if (data) setProduct(data);
      });
    }
  }, []);

  const handleRedirect = async () => {
    if (!tenant || !product) return;

    setRedirecting(true);

    try {
      const result = useQuiz.getState().getResult();
      const winnerProfile = result.winner?.id;

      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", slug)
        .single();

      if (tenantData) {
        await supabase.from("events").insert({
          tenant_id: tenantData.id,
          kind: "product_click",
          product_id: product.id,
          profile_id: null,
          source_url: window.location.href,
          referrer: document.referrer,
          payload: {
            product_name: product.name,
            product_category: product.category,
            redirect_url: product.redirect_url,
          },
        });
      }

      if (product.redirect_url) {
        window.location.href = product.redirect_url;
      } else {
        setError("Link de redirecionamento não configurado para este produto");
      }
    } catch (err) {
      console.error("Erro ao redirecionar:", err);
      setError("Erro ao processar redirecionamento");
    } finally {
      setRedirecting(false);
    }
  };

  if (!tenant) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-stone-500">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="absolute inset-0 flex items-center justify-center z-10 text-center px-6">
          <div className="max-w-md">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-display font-bold text-stone-950 mb-3">Produto não encontrado</h1>
            <p className="text-stone-500 mb-6">Não foi possível identificar o produto selecionado.</p>
            <Link
              to={`/f/${slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-stone-50 rounded-full font-semibold hover:bg-stone-800 transition-colors"
            >
              Voltar ao Início
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const winner = useQuiz.getState().getResult().winner;

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-[0_0_100px_rgba(0,0,0,0.06)] text-center animate-in fade-in zoom-in-98 duration-700">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-95 duration-500">
                <CheckCircle size={32} className="text-green-500" />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
                <Sparkles size={16} />
                <span>Redirecionando para seu produto</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-950 leading-tight">
                {product.name}
              </h1>

              <p className="text-stone-600 text-sm">
                {product.description || "Seu produto recomendado baseado no seu perfil"}
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-6 mb-8 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <Sparkles size={24} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-950">{product.name}</h3>
                  <p className="text-sm text-stone-500 capitalize">{product.category}</p>
                </div>
              </div>

              {product.key_actives && (
                <div className="mb-4">
                  <p className="text-xs text-stone-500 mb-2">Ativos principais:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(product.key_actives || {}).slice(0, 5).map(([k, v]: [string, any]) => (
                      <span key={k} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-medium">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-stone-500">
                <strong>Seu perfil:</strong> {winner?.name || "Não identificado"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
            )}

            <button
              onClick={handleRedirect}
              disabled={redirecting}
              className="w-full py-4 px-6 bg-stone-950 text-stone-50 rounded-xl font-bold text-lg uppercase tracking-wider hover:bg-stone-800 transition-colors shadow-[0_20px_80px_rgba(0,0,0,0.15)] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {redirecting ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <ShoppingBag size={22} />
              )}
              {redirecting ? "Redirecionando..." : "Ir para página do produto"}
              <ExternalLink size={20} />
            </button>

            <p className="mt-4 text-xs text-stone-500">
              Você será redirecionado para a página de compra do produto na loja da farmácia.
            </p>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <Link
                to={`/f/${slug}/resultado`}
                className="text-stone-500 hover:text-amber-600 text-sm font-medium"
              >
                ← Voltar ao resultado completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}