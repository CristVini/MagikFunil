import { useEffect, useState } from "react";
import { Globe, Copy, ExternalLink, AlertCircle, CheckCircle, WifiOff, Loader2 as LoaderIcon, Check } from "lucide-react";
import { supabase } from "@lib/supabase";
import { useAuth } from "@hooks/useAuth";

// Face 2.6 — Publicação: subir/descer o funil, copiar link, validar produtos.
export function TenantPublication() {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id || user?.id;
  const [tenant, setTenant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [status, setStatus] = useState<"draft" | "published" | "paused">("draft");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.rpc("get_tenant_overview"),
      supabase.rpc("get_tenant_catalog"),
    ]).then(([over, cat]: any) => {
      if (over.data?.tenant) {
        setTenant(over.data.tenant);
        setStatus(over.data.tenant.status || "draft");
      }
      if (cat.data?.products) setProducts(cat.data.products);
      setLoading(false);
    });
  }, []);

  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || "seudominio.com";
  const slug = tenant?.slug || "";
  const finalUrl = `https://${slug}.${rootDomain}`;
  const isPublished = status === "published";

  // Validação: produtos ativos precisam de link de venda
  const activeWithoutLink = products.filter(p => p.enabled && !p.redirect_url);
  const canPublish = activeWithoutLink.length === 0;

  const copyLink = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const changeStatus = async (s: "draft" | "published" | "paused") => {
    setChecking(true);
    await supabase.from("tenants").update({ status: s }).eq("id", tenantId);
    setStatus(s);
    setChecking(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="flex flex-col items-center gap-3">
          <LoaderIcon className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-stone-500">Carregando publicação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
          Publicação do Funil
        </h1>
        <p className="text-stone-500 mt-1">Configure o endereço público do seu funil</p>
      </div>

      {/* Status atual */}
      <div className={`bg-white rounded-2xl border p-6 transition-colors ${isPublished ? "border-amber-300 bg-amber-500/5" : "border-stone-200"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isPublished ? "bg-green-500/20 text-green-600" : "bg-stone-500/20 text-stone-600"}`}>
              {isPublished ? <CheckCircle size={24} /> : <WifiOff size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-950">
                {isPublished ? "Funil Publicado 🎉" : "Funil Não Publicado"}
              </h2>
              <p className="text-stone-500">
                {isPublished
                  ? `Seu funil está no ar em: ${finalUrl}`
                  : "Seu funil não está acessível publicamente. Publique para começar a receber leads."}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              {copied ? "Copiado!" : "Copiar Link"}
            </button>
            {isPublished && (
              <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors flex items-center gap-2">
                <ExternalLink size={18} />
                Ver Funil
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Link do funil */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4 flex items-center gap-2">
          <Globe size={20} className="text-amber-500" />
          Endereço do seu funil
        </h2>
        <div className="flex items-center gap-3">
          <code className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 font-mono break-all">
            {finalUrl}
          </code>
          <button
            onClick={copyLink}
            className="shrink-0 px-4 py-3 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
        <p className="text-sm text-stone-500 mt-3">
          Esse é o link que você deve divulgar nas redes sociais, no Google e nos seus materiais.
        </p>
      </div>

      {/* Validação para publicar */}
      {!canPublish && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle size={20} className="text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Não é possível publicar ainda</p>
            <p className="text-sm text-red-700 mt-1">
              <strong>{activeWithoutLink.length} produto(s) ativo(s)</strong> sem link de venda:
              {activeWithoutLink.map(p => ` ${p.name} (${p.profileLabel})`).join(", ")}.
            </p>
            <button className="mt-2 text-sm text-red-700 underline hover:text-red-900 font-medium">
              Ir para Produtos e adicionar links
            </button>
          </div>
        </div>
      )}

      {/* Controles de status */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4">Status do Funil</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "draft", label: "Rascunho", desc: "Privado, só você acessa", color: "border-stone-200" },
            { value: "published", label: "Publicado", desc: "No ar para todos", color: "border-green-500" },
            { value: "paused", label: "Pausado", desc: "Offline temporariamente", color: "border-amber-500" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => changeStatus(opt.value as any)}
              disabled={checking || (opt.value === "published" && !canPublish) || status === opt.value}
              className={`flex-1 min-w-[160px] p-6 rounded-2xl border-2 transition-all ${status === opt.value ? "border-amber-500 bg-amber-500/5" : "border-stone-200 hover:border-stone-300"} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 justify-center mb-2">
                {opt.value === "draft" ? <WifiOff size={18} className={status === opt.value ? "text-amber-500" : "text-stone-500"} /> :
                 opt.value === "published" ? <CheckCircle size={18} className={status === opt.value ? "text-amber-500" : "text-green-600"} /> :
                 <WifiOff size={18} className={status === opt.value ? "text-amber-500" : "text-amber-600"} />}
                <span className="font-semibold text-stone-950">{opt.label}</span>
                {status === opt.value && <span className="px-2 py-0.5 bg-amber-500 text-stone-950 rounded text-[10px] font-bold">Atual</span>}
              </div>
              <p className="text-sm text-stone-500 text-center">{opt.desc}</p>
              {opt.value === "published" && !canPublish && (
                <p className="text-xs text-red-500 text-center mt-2">Adicione os links de venda</p>
              )}
            </button>
          ))}
        </div>
        {checking && (
          <p className="mt-3 flex items-center gap-2 text-sm text-amber-600">
            <LoaderIcon size={16} className="animate-spin" /> Atualizando status...
          </p>
        )}
      </div>

      {/* Teste rápido */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4 flex items-center gap-2">
          <ExternalLink size={20} className="text-amber-500" />
          Teste Rápido
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors text-center flex items-center justify-center gap-2">
            <ExternalLink size={18} /> Abrir Funil Público
          </a>
          <a href={`${finalUrl}/quiz`} target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 bg-stone-950 text-stone-50 rounded-xl font-semibold hover:bg-stone-800 transition-colors text-center flex items-center justify-center gap-2">
            Abrir Quiz Direto
          </a>
        </div>
      </div>
    </div>
  );
}