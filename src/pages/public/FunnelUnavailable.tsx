"use client";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { Lock, AlertCircle, Clock, ExternalLink, RefreshCw, ArrowRight, Building2, CreditCard, Shield, Crown } from "lucide-react";
import { Fireflies } from "../public/Landing";
import { Link } from "react-router-dom";

export function FunnelUnavailable() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<"unpublished" | "paused" | "blocked_billing" | "not_found">("not_found");

  useEffect(() => {
    async function loadTenant() {
      const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || "seudominio.com";
      const hostname = window.location.hostname;
      const subdomain = hostname.replace(`.${rootDomain}`, "").replace(`www.${rootDomain}`, "");
      const lookupSlug = slug || subdomain;

      try {
        const { data } = await supabase
          .from("tenants")
          .select("*")
          .eq("slug", lookupSlug)
          .single();

        if (data) {
          setTenant(data);
          
          // Determinar razão
          if (data.status === "active") {
            setReason("unpublished"); // ativo mas funil não publicado (status delivery vs billing)
          } else if (data.status === "paused") {
            setReason("paused");
          } else if (data.status === "blocked_billing") {
            setReason("blocked_billing");
          }
        } else {
          setReason("not_found");
        }
      } catch {
        setReason("not_found");
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
        <Fireflies />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500">Verificando funil...</p>
          </div>
        </div>
      </div>
    );
  }

  const reasonConfig = {
    unpublished: {
      icon: Clock,
      title: "Funil ainda não publicado",
      description: "Este funil existe mas ainda não foi publicado pelo proprietário. Volte em breve!",
      actionLabel: "Verificar novamente",
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-200",
    },
    paused: {
      icon: Clock,
      title: "Funil pausado temporariamente",
      description: "O proprietário pausou este funil temporariamente. Ele voltará em breve.",
      actionLabel: "Verificar novamente",
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-200",
    },
    blocked_billing: {
      icon: CreditCard,
      title: "Acesso restrito — pagamento pendente",
      description: "Este funil foi bloqueado por questão de cobrança. O proprietário precisa regularizar a assinatura para reativar.",
      actionLabel: "Contatar suporte",
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-200",
    },
    not_found: {
      icon: AlertCircle,
      title: "Funil não encontrado",
      description: "Não existe nenhum funil configurado para este endereço. Verifique a URL ou entre em contato conosco.",
      actionLabel: "Voltar ao início",
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-200",
    },
  };

  const config = reasonConfig[reason];

  if (!tenant) {
    // Mesmo com not_found, mostramos a página com config padrão
  }

  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || "seudominio.com";
  const publicUrl = tenant ? `https://${tenant.slug}.${rootDomain}` : null;

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "var(--font-sans)" }}>
      <Fireflies className="fixed inset-0 -z-10" />

      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl border border-stone-200 p-10 shadow-[0_0_100px_rgba(0,0,0,0.06)] text-center animate-in fade-in zoom-in-98 duration-700">
            
            {/* Tenant Brand (se existir) */}
            {tenant && (
              <div className="mb-8">
                {tenant.logo_url && (
                  <img src={tenant.logo_url} alt={tenant.name} className="h-16 w-auto mx-auto mb-4" />
                )}
                <h2 className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
                  {tenant.name}
                </h2>
                <p className="text-stone-500 text-sm mt-1">{tenant.slug}.{import.meta.env.VITE_ROOT_DOMAIN || "seudominio.com"}</p>
              </div>
            )}

            {/* Main Icon & Message */}
            <div className="mb-8">
              <div className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-6 animate-in zoom-in-95 duration-500`}>
                <config.icon size={32} className={config.iconColor} />
              </div>
              
              <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-950 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                {config.title}
              </h1>
              
              <p className="text-stone-600 leading-relaxed max-w-lg mx-auto">
                {config.description}
              </p>
            </div>

            {/* Tenant Info (se blocked_billing) */}
            {reason === "blocked_billing" && tenant && (
              <div className="mb-8 p-6 bg-red-500/5 border border-red-200 rounded-2xl">
                <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <CreditCard size={18} /> Como resolver
                </h3>
                <div className="space-y-2 text-sm text-red-600 text-left">
                  <p>• O proprietário deve acessar o painel em <code className="bg-red-100 px-1 rounded">{tenant.slug}.seudominio.com/dashboard/assinatura</code></p>
                  <p>• Regularizar o pagamento na aba "Assinatura"</p>
                  <p>• O funil será reativado automaticamente após confirmação do pagamento</p>
                </div>
                <div className="mt-4 pt-4 border-t border-red-200">
                  <a
                    href={`mailto:suporte@seudominio.com?subject=Reativação funil ${tenant.slug}&body=Olá, gostaria de regularizar a assinatura do funil ${tenant.name} (${tenant.slug}) para reativar o funil público.`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    <CreditCard size={18} />
                    Contatar suporte para reativar
                  </a>
                </div>
              </div>
            )}

            {/* Tenant Info (se paused) */}
            {reason === "paused" && tenant && (
              <div className="mb-8 p-6 bg-amber-500/5 border border-amber-200 rounded-2xl">
                <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <Clock size={18} /> Funil pausado pelo proprietário
                </h3>
                <p className="text-amber-600 text-sm">
                  O funil foi pausado intencionalmente. O proprietário pode reativá-lo a qualquer momento no painel de controle.
                </p>
              </div>
            )}

            {/* Tenant Info (se unpublished) */}
            {reason === "unpublished" && tenant && (
              <div className="mb-8 p-6 bg-amber-500/5 border border-amber-200 rounded-2xl">
                <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <Clock size={18} /> Funil pronto, mas não publicado
                </h3>
                <p className="text-amber-600 text-sm">
                  O funil está configurado e pronto, mas o proprietário ainda não clicou em "Publicar" no painel.
                </p>
                <p className="text-amber-600 text-sm mt-2">
                  Assim que publicado, o funil ficará disponível em:
                </p>
                <code className="block mt-2 px-3 py-2 bg-stone-100 rounded-lg text-sm font-mono text-stone-700">
                  https://{tenant.slug}.{import.meta.env.VITE_ROOT_DOMAIN || "seudominio.com"}
                </code>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 px-6 bg-stone-950 text-stone-50 rounded-xl font-bold text-lg uppercase tracking-wider hover:bg-stone-800 transition-colors shadow-[0_20px_80px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3"
              >
                <RefreshCw size={20} />
                {config.actionLabel}
              </button>

              {tenant && (
                <a
                  href={`https://${tenant.slug}.{import.meta.env.VITE_ROOT_DOMAIN || "seudominio.com"}/dashboard`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors text-center"
                >
                  <Building2 size={18} />
                  Acessar painel do proprietário
                </a>
              )}

              {!tenant && (
                <Link
                  to="/"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors text-center"
                >
                  <ArrowRight size={18} />
                  Voltar ao início
                </Link>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-10 pt-8 border-t border-stone-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-stone-50 rounded-xl">
                  <Shield size={24} className="text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Seguro e privado</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl">
                  <Crown size={24} className="text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Plataforma MagikFunil</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl">
                  <Building2 size={24} className="text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Powered by MagikFunil</p>
                </div>
              </div>
              
              <p className="mt-6 text-xs text-stone-500 text-center">
                © 2024 MagikFunil. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}