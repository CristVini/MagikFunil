import { useState } from "react";
import { Search, Link2, ExternalLink, Trash2, Package, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_PLAN } from "./mockData";

// Face 2.3 — Produtos: o cliente ativa itens do catálogo pré-criado e
// cola o link de venda de cada um. Limite é o max_products do plano.
export function TenantProducts() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [savingUrl, setSavingUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeCount = products.filter(p => p.enabled).length;
  const maxProducts = MOCK_PLAN.max_products;
  const atLimit = activeCount >= maxProducts;

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.profileLabel.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleEnabled = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    // Não pode ativar além do limite do plano
    if (!target.enabled && atLimit) {
      showToast(`Seu plano ${MOCK_PLAN.name} permite até ${maxProducts} produtos ativos. Faça upgrade para ativar mais.`);
      return;
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    showToast(target.enabled ? "Produto desativado do funil" : "Produto ativado no funil");
  };

  const setUrl = (id: string, url: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, redirect_url: url } : p));
  };

  const saveUrl = (id: string) => {
    setSavingUrl(id);
    setTimeout(() => {
      setSavingUrl(null);
      showToast("Link de venda salvo");
    }, 500);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-stone-950 text-stone-50 px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="text-amber-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
            Meus Produtos
          </h1>
          <p className="text-stone-500 mt-1">Ative os produtos do catálogo e cole o link de venda de cada um</p>
        </div>

        {/* Indicador de limite do plano */}
        <div className="px-4 py-3 bg-white rounded-2xl border border-stone-200 flex items-center gap-3">
          <Package size={20} className="text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-stone-950">
              {activeCount}/{maxProducts} produtos ativos
            </p>
            <div className="w-32 h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(activeCount / maxProducts) * 100}%`, backgroundColor: atLimit ? "#EF4444" : "#F59E0B" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aviso de limite */}
      {atLimit && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <ShieldAlert size={20} className="text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Você atingiu o limite do plano {MOCK_PLAN.name}</p>
            <p className="text-sm text-red-700">Desative um produto ou faça upgrade para ativar mais do catálogo.</p>
          </div>
          <button className="shrink-0 px-3 py-1.5 bg-stone-950 text-stone-50 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors">
            Fazer upgrade
          </button>
        </div>
      )}

      {/* Busca */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar produto ou perfil..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Lista de produtos */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-950">Catálogo do Template</h2>
          <p className="text-sm text-stone-500 mt-1">Produtos pré-configurados — defina o link de venda de cada ativo</p>
        </div>

        <div className="divide-y divide-stone-200">
          {filteredProducts.map((p) => (
            <div key={p.id} className={`p-5 flex flex-col lg:flex-row lg:items-center gap-4 transition-colors ${p.enabled ? "bg-amber-50/30" : ""}`}>
              {/* Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${p.enabled ? "bg-amber-500/10 text-amber-600" : "bg-stone-100 text-stone-400"}`}>
                  <Package size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-stone-950 truncate">{p.name}</h3>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px] capitalize">{p.category.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{p.description}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Para <span className="text-amber-600 font-medium">{p.profileLabel}</span>
                    {p.clicks > 0 && <span className="ml-2">• {p.clicks} cliques</span>}
                  </p>
                </div>
              </div>

              {/* Link de venda */}
              <div className="flex items-center gap-2 flex-1 lg:flex-none lg:w-80">
                <Link2 size={16} className="text-stone-400 shrink-0" />
                <input
                  type="url"
                  value={p.redirect_url}
                  onChange={e => setUrl(p.id, e.target.value)}
                  onBlur={() => saveUrl(p.id)}
                  placeholder="https://seusite.com/produto"
                  disabled={!p.enabled}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    p.enabled
                      ? "bg-stone-50 border-stone-200 text-stone-950 placeholder-stone-400"
                      : "bg-stone-50 opacity-50 border-stone-200 text-stone-400 placeholder-stone-400 cursor-not-allowed"
                  }`}
                />
                {savingUrl === p.id ? (
                  <Loader2 size={16} className="text-amber-500 animate-spin" />
                ) : p.redirect_url ? (
                  <a href={p.redirect_url} target="_blank" rel="noopener noreferrer" className="p-2 text-stone-400 hover:text-amber-500 transition-colors">
                    <ExternalLink size={16} />
                  </a>
                ) : null}
              </div>

              {/* Toggle ativo */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" checked={p.enabled} onChange={() => toggleEnabled(p.id)} className="sr-only peer" />
                <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-focus:ring-offset-2 transition-colors ${p.enabled ? "bg-amber-500" : "bg-stone-300"}`}>
                  <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${p.enabled ? "translate-x-5" : ""}`} />
                </div>
                <span className="ml-3 text-sm text-stone-600 w-20">{p.enabled ? "Ativo" : "Inativo"}</span>
              </label>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-stone-500">Nenhum produto encontrado para "{search}"</div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="text-xs text-stone-500 bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-2">
        <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
        Os produtos ativados com link aparecem no resultado do quiz, na ordem do protocolo recomendado para cada perfil.
      </div>
    </div>
  );
}