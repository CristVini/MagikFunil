import { useMemo, useState } from "react";
import { Link2, ExternalLink, Package, ShieldAlert, CheckCircle2, Loader2, Lock, Crown } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_PLANS, MOCK_PLAN } from "./mockData";

// Face 2.3 — Produtos: o cliente ativa itens do catálogo pré-criado e
// cola o link de venda de cada um, agrupados pelo protocolo do funil
// (2 produtos + 1 kit por perfil). Limite é o max_products do plano.
export function TenantProducts() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [plan, setPlan] = useState(MOCK_PLAN); // demo: trocar pra Enterprise destrava a promo
  const [search, setSearch] = useState("");
  const [savingUrl, setSavingUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const maxProducts = plan.max_products;
  const activeCount = products.filter(p => p.enabled).length;
  const atLimit = activeCount >= maxProducts;
  const enabledPromo = plan.allowsPromo; // recurso premium: promoção exclusiva do Enterprise

  // Agrupa por perfil preservando a ordem do mock (protocolo do funil)
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: typeof products }>();
    products.forEach(p => {
      if (!map.has(p.profile)) map.set(p.profile, { label: p.profileLabel, items: [] });
      map.get(p.profile)!.items.push(p);
    });
    return Array.from(map.values());
  }, [products]);

  const filteredGroups = groups
    .map(g => ({
      label: g.label,
      items: g.items.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || g.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(g => g.items.length > 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleEnabled = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    // Não pode ativar além do limite do plano
    if (!target.enabled && atLimit) {
      showToast(`Seu plano ${plan.name} permite até ${maxProducts} produtos ativos. Faça upgrade para ativar mais.`);
      return;
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    showToast(target.enabled ? "Item desativado do funil" : (target.is_kit ? "Kit ativado no funil" : "Produto ativado no funil"));
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

  const setShowPromo = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, show_promo: !p.show_promo } : p));
    showToast("Preferência de promoção atualizada");
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
          <p className="text-stone-500 mt-1">O protocolo que o quiz recomenda — ative cada item e cole o link de venda</p>
        </div>

        {/* Seletor de plano (demo) — trocar pra Enterprise destrava a promoção */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-stone-200 p-1.5 shadow-sm">
          {MOCK_PLANS.map((p) => {
            const isActive = plan.name === p.name;
            return (
              <button
                key={p.name}
                onClick={() => setPlan(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? p.name === "Enterprise"
                      ? "bg-stone-950 text-amber-400 shadow"
                      : "bg-amber-500 text-white shadow"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                {p.name === "Enterprise" && <Crown size={14} />}
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Indicador de limite do plano */}
        <div className="px-4 py-3 bg-white rounded-2xl border border-stone-200 flex items-center gap-3">
          <Package size={20} className="text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-stone-950">
              {activeCount}/{maxProducts} itens ativos
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
            <p className="font-medium text-red-900">Você atingiu o limite de itens ativos do plano {plan.name}</p>
            <p className="text-sm text-red-700">Desative um item ou faça upgrade para ativar mais do protocolo.</p>
          </div>
          <button className="shrink-0 px-3 py-1.5 bg-stone-950 text-stone-50 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors">
            Fazer upgrade
          </button>
        </div>
      )}

      {/* Busca */}
      <div className="relative max-w-md">
        <Link2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar produto, kit ou perfil..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Protocolos por perfil */}
      {filteredGroups.map((group) => (
        <div key={group.label} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-200 flex items-center gap-2 bg-stone-50/50">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="font-display text-lg font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
              {group.label}
            </h2>
            <span className="text-xs text-stone-400">Protocolo recomendado pelo funil</span>
          </div>

          <div className="divide-y divide-stone-100">
            {group.items.map((p) => (
              <div key={p.id} className={`p-5 flex flex-col lg:flex-row lg:items-center gap-4 transition-colors ${p.enabled ? "bg-amber-50/30" : ""}`}>
                {/* Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${p.is_kit ? "bg-violet-500/10 text-violet-600" : p.enabled ? "bg-amber-500/10 text-amber-600" : "bg-stone-100 text-stone-400"}`}>
                    <Package size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-stone-950 truncate">{p.name}</h3>
                      {p.is_kit && (
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0">Kit</span>
                      )}
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px] capitalize">{p.category.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{p.description}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      De <span className="text-amber-600 font-medium">{p.profileLabel}</span>
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
                    placeholder={p.is_kit ? "https://seusite.com/kit" : "https://seusite.com/produto"}
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

                {/* Recurso premium: Exibir promoção (exclusivo Enterprise) */}
                {enabledPromo ? (
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={p.show_promo}
                      disabled={!p.enabled}
                      onChange={() => setShowPromo(p.id)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-violet-500 transition-colors ${p.show_promo && p.enabled ? "bg-violet-500" : "bg-stone-300"}`}>
                      <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${p.show_promo && p.enabled ? "translate-x-5" : ""}`} />
                    </div>
                    <span className="ml-3 text-sm text-stone-600 w-24">
                      {p.enabled ? (p.show_promo ? p.promo_price_cents ? `Promo R$ ${(p.promo_price_cents / 100).toFixed(2).replace('.', ',')}` : "Promo" : "Promo OFF") : "Promo"}
                    </span>
                  </label>
                ) : (
                  // Travado — disponível apenas no Enterprise (vitrine de upgrade)
                  <button
                    onClick={() => showToast("Exibir promoção é um recurso do plano Enterprise.")}
                    className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-stone-300 text-stone-400 hover:border-violet-400 hover:text-violet-600 transition-colors group"
                    title="Recurso exclusivo do plano Enterprise"
                  >
                    <Lock size={14} className="group-hover:text-violet-500" />
                    <span className="text-sm font-medium hidden sm:inline">Promo</span>
                    <span className="text-xs text-violet-600 font-semibold hidden sm:inline">Enterprise</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredGroups.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
          Nenhum produto ou kit encontrado para "{search}"
        </div>
      )}

      {/* Legenda */}
      <div className="text-xs text-stone-500 bg-white rounded-xl border border-stone-200 p-4 space-y-1.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
          Os itens ativados com link aparecem no resultado do quiz, na ordem do protocolo (2 produtos + 1 kit) de cada perfil.
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-violet-500/10 inline-flex items-center justify-center shrink-0"><Package size={10} className="text-violet-600" /></span>
          <span>O <strong>kit</strong> combina os dois produtos do perfil — é destacado para aumentar o ticket médio. Sem preço configurado: a venda fecha no seu link/WhatsApp.</span>
        </div>
      </div>
    </div>
  );
}