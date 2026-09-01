"use client";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { useQuiz } from "@hooks/useQuiz";
import { ArrowRight, ShoppingBag, CheckCircle, Sparkles, Loader2, ExternalLink, User, Phone, ShieldCheck } from "lucide-react";

export function ProductCapture() {
  const { slug } = useParams<{ slug: string }>();
  const { fetchQuiz } = useQuiz();
  const [tenant, setTenant] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);

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

  const saveLead = async () => {
    if (!tenant) return;
    const result = useQuiz.getState().getResult();
    const winner = result.winner;

    // Grava o lead direto no Supabase (persistência real)
    const leadPayload = {
      tenant_id: tenant.id,
      name: leadName,
      phone: leadPhone,
      winning_profile: winner?.id || null,
      product_name: product?.name || null,
      source_url: window.location.href,
      referrer: document.referrer,
    };

    try {
      await supabase.from("leads").insert(leadPayload);
      console.info("[MagikFunil] Lead capturado:", leadPayload);
    } catch (err) {
      console.warn("Não foi possível persistir o lead:", err);
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || leadPhone.replace(/\D/g, "").length < 10) {
      setError("Por favor, informe seu nome e um telefone válido (com DDD).");
      return;
    }
    setError(null);
    setLeadCaptured(true);
    await saveLead();
    await handleRedirect();
  };

  const handleRedirect = async () => {
    if (!tenant || !product) return;

    setRedirecting(true);

    try {
      const result = useQuiz.getState().getResult();
      const winnerProfile = result.winner?.id;

      let redirectUrl = product.redirect_url;
      // O link real de venda é o do tenant_products (configurado pelo cliente)
      const { data: tenantProd } = await supabase
        .from("tenant_products")
        .select("redirect_url")
        .eq("tenant_id", tenant.id)
        .eq("product_id", product.id)
        .single();
      if (tenantProd?.redirect_url) redirectUrl = tenantProd.redirect_url;

      await supabase.from("events").insert({
        tenant_id: tenant.id,
        kind: "product_click",
        product_id: product.id,
        profile_id: winnerProfile || null,
        source_url: window.location.href,
        referrer: document.referrer,
        payload: {
          product_name: product.name,
          product_category: product.category,
          redirect_url: redirectUrl,
        },
      });

      if (redirectUrl) {
        window.location.href = redirectUrl;
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
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-[0_0_100px_rgba(0,0,0,0.06)] animate-in fade-in zoom-in-98 duration-700">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-95 duration-500">
                <CheckCircle size={32} className="text-green-500" />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mx-auto block w-fit">
                <Sparkles size={16} />
                <span>Seu produto recomendado</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-950 leading-tight text-center">
                {product.name}
              </h1>

              <p className="text-stone-600 text-sm text-center">
                {product.description || "Seu produto recomendado baseado no seu perfil"}
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-6 mb-6 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <Sparkles size={24} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-950">{product.name}</h3>
                  <p className="text-sm text-stone-500 capitalize">{product.category}</p>
                </div>
              </div>
              <p className="text-xs text-stone-500">
                <strong>Seu perfil:</strong> {winner?.name || "Não identificado"}
              </p>
            </div>

            {leadCaptured ? (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                  <ShieldCheck size={28} className="text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">Lead registrado!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Obrigado, <strong>{leadName}</strong>! Estamos direcionando você ao produto.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-4 mb-6">
                <div className="bg-amber-500/5 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  Preencha seus dados para a farmácia entrar em contato e personalizar sua compra:
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
                    <User size={15} className="text-stone-400" /> Seu nome
                  </label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1.5">
                    <Phone size={15} className="text-stone-400" /> Seu WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={e => setLeadPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="(11) 99999-9999"
                    maxLength={11}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </form>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
            )}

            {leadCaptured ? (
              <button
                onClick={handleRedirect}
                disabled={redirecting}
                className="w-full py-4 px-6 bg-stone-950 text-stone-50 rounded-xl font-bold text-lg uppercase tracking-wider hover:bg-stone-800 transition-colors shadow-[0_20px_80px_rgba(0,0,0,0.15)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {redirecting ? <Loader2 size={22} className="animate-spin" /> : <ShoppingBag size={22} />}
                {redirecting ? "Redirecionando..." : "Continuar para o produto"}
                <ExternalLink size={20} />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmitLead}
                className="w-full py-4 px-6 bg-stone-950 text-stone-50 rounded-xl font-bold text-lg uppercase tracking-wider hover:bg-stone-800 transition-colors shadow-[0_20px_80px_rgba(0,0,0,0.15)] flex items-center justify-center gap-3"
              >
                <ShoppingBag size={22} />
                Receber e continuar
              </button>
            )}

            <p className="mt-4 text-xs text-stone-500 text-center">
              Seus dados são usados apenas para que a farmácia fale sobre seu protocolo.
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