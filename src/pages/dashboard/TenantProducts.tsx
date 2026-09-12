import { useEffect, useMemo, useState } from "react";
import {
  Link2,
  ExternalLink,
  Package,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Lock,
  Plus,
  Trash2,
  X,
  MessageCircle,
  Store,
  Eye,
  Brain,
} from "lucide-react";
import { supabase } from "@lib/supabase";
import { useAuth } from "@hooks/useAuth";
import { useFunnel } from "@hooks/useFunnel";

// Face 2.3 — Produtos: o cliente cadastra LIVREMENTE os itens que fazem
// sentido para o visitante comprar depois de aquecido pelo funil.
// Cada item pertence a um perfil (benefício) do funil.
// Limite POR PERFIL: Basic=1, Pro=2, Enterprise=6 (max_products_per_profile).

interface TenantItem {
  id: string;
  profile_id: string;
  funnel_id?: string;
  name: string;
  description: string;
  key_actives: string[] | null;
  support_text: string | null;
  price_cents: number | null;
  redirect_url: string;
  enabled: boolean;
  position: number;
}

interface Profile {
  id: string;
  name: string;
  color: string;
  archetype?: string;
  description?: string;
  scientific_basis?: string;
  expected_effect?: string;
}

function formatPrice(cents?: number | null): string {
  if (cents == null) return "";
  const reais = (cents / 100).toFixed(2).replace(".", ",");
  return reais.endsWith(",00") ? reais.slice(0, -3) : reais;
}

export function TenantProducts() {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id || user?.id;
  const { activeFunnelId } = useFunnel();
  const [items, setItems] = useState<TenantItem[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [perProfileLimit, setPerProfileLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Formulário de cadastro/edição
  const [editing, setEditing] = useState<{
    profileId: string;
    itemId: string | null;
  } | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    key_actives: "",
    price: "",
    redirect_url: "",
    channel: "whatsapp" as "whatsapp" | "store",
  });

  const reload = () => {
    supabase
      .rpc("get_tenant_items", { p_funnel_id: activeFunnelId ?? undefined })
      .then(({ data, error: err }: { data: any; error: any }) => {
        if (err) {
          setError(err.message);
          setLoading(false);
          return;
        }
        setItems(data?.items || []);
        setProfiles(data?.profiles || []);
        setPerProfileLimit(data?.per_profile_limit || 0);
        setLoading(false);
      });
  };

  useEffect(reload, [activeFunnelId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const openNew = (profileId: string) => {
    setForm({
      name: "",
      description: "",
      key_actives: "",
      price: "",
      redirect_url: "",
      channel: "whatsapp",
    });
    setEditing({ profileId, itemId: null });
  };

  const openEdit = (item: TenantItem) => {
    setForm({
      name: item.name,
      description: item.description || "",
      key_actives: (item.key_actives || []).join(", "),
      price: item.price_cents != null ? formatPrice(item.price_cents) : "",
      redirect_url: item.redirect_url || "",
      channel: /wa\.me|whatsapp|api.whatsapp/i.test(item.redirect_url || "")
        ? "whatsapp"
        : "store",
    });
    setEditing({ profileId: item.profile_id, itemId: item.id });
  };

  const closeForm = () => setEditing(null);

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!form.name.trim()) {
      showToast("Dê um nome ao item");
      return;
    }

    setSavingId(editing.itemId || "new");
    const keyActives = form.key_actives
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Monta o link do canal de venda
    let redirectUrl = form.redirect_url.trim();
    if (!redirectUrl && form.channel === "whatsapp") {
      // sem número preenchido, mantém vazio (venda fecha onde o cliente quiser)
      redirectUrl = "";
    }

    const priceCents = form.price
      ? Math.round(
          parseFloat(form.price.replace(/\./g, "").replace(",", ".")) * 100,
        )
      : null;

    const { error: err } = await supabase.rpc("upsert_tenant_item", {
      p_tenant_id: tenantId,
      p_funnel_id: activeFunnelId,
      p_profile_id: editing.profileId,
      p_name: form.name.trim(),
      p_description: form.description || null,
      p_key_actives: keyActives.length ? keyActives : null,
      p_support_text: null,
      p_price_cents: priceCents,
      p_redirect_url: redirectUrl,
      p_enabled: true,
      p_position: 0,
      p_item_id: editing.itemId,
    });

    setSavingId(null);
    if (err) {
      showToast(err.message);
    } else {
      closeForm();
      reload();
      showToast(
        editing.itemId ? "Item atualizado" : "Item adicionado ao funil",
      );
    }
  };

  const toggleEnabled = async (item: TenantItem) => {
    const { error: err } = await supabase.rpc("upsert_tenant_item", {
      p_tenant_id: tenantId,
      p_funnel_id: activeFunnelId,
      p_profile_id: item.profile_id,
      p_name: item.name,
      p_description: item.description,
      p_key_actives: item.key_actives,
      p_support_text: item.support_text,
      p_price_cents: item.price_cents,
      p_redirect_url: item.redirect_url,
      p_enabled: !item.enabled,
      p_position: item.position,
      p_item_id: item.id,
    });
    if (err) showToast(err.message);
    else {
      reload();
      showToast(item.enabled ? "Item desativado" : "Item ativado");
    }
  };

  const deleteItem = async (item: TenantItem) => {
    if (!window.confirm(`Remover "${item.name}"?`)) return;
    const { error: err } = await supabase
      .from("tenant_items")
      .delete()
      .eq("id", item.id);
    if (err) showToast(err.message);
    else {
      reload();
      showToast("Item removido");
    }
  };

  const itemsByProfile = useMemo(() => {
    const map = new Map<string, TenantItem[]>();
    items.forEach((i) => {
      if (!map.has(i.profile_id)) map.set(i.profile_id, []);
      map.get(i.profile_id)!.push(i);
    });
    return map;
  }, [items]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-32"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-stone-500">Carregando seus itens...</p>
        </div>
      </div>
    );
  }

  if (!activeFunnelId) {
    return (
      <div
        className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <p className="font-medium text-amber-800">
          Nenhum funil disponível.
        </p>
        <p className="text-sm text-amber-700 mt-1">
          Você ainda não tem nenhum funil atribuído à sua conta.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <p className="font-medium text-red-700">
          Não foi possível carregar seus itens.
        </p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  const ChannelIcon = ({ url }: { url: string }) =>
    /wa\.me|whatsapp|api.whatsapp/i.test(url) ? (
      <MessageCircle size={16} />
    ) : (
      <Store size={16} />
    );

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-stone-950 text-stone-50 px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-2 text-sm max-w-sm">
          <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-display font-bold text-stone-950"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Meus Produtos
          </h1>
          <p className="text-stone-500 mt-1">
            Cadastre os itens que fazem sentido para o seu cliente, para cada
            resultado do funil.
          </p>
        </div>
        <div className="px-4 py-3 bg-white rounded-2xl border border-stone-200 flex items-center gap-3">
          <Package size={20} className="text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-stone-950">
              Até {perProfileLimit} item(ns) por perfil
            </p>
            <p className="text-xs text-stone-500">
              {profiles.length} perfis no seu funil
            </p>
          </div>
        </div>
      </div>

      {/* Seções por perfil */}
      {profiles.map((profile) => {
        const profileItems = itemsByProfile.get(profile.id) || [];
        const activeCount = profileItems.filter((i) => i.enabled).length;
        const atLimit = perProfileLimit > 0 && activeCount >= perProfileLimit;

        return (
          <div
            key={profile.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between gap-3 bg-stone-50/50">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: profile.color || "#F59E0B" }}
                />
                <h2
                  className="font-display text-lg font-bold text-stone-950"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {profile.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold ${atLimit ? "text-red-600" : "text-stone-500"}`}
                >
                  {activeCount}/{perProfileLimit} itens
                </span>
                <button
                  onClick={() => setViewingProfile(profile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 hover:border-stone-300 transition-colors"
                  title="Ver o que este perfil representa para o visitante"
                >
                  <Eye size={15} />
                  Ver perfil
                </button>
                <button
                  onClick={() => openNew(profile.id)}
                  disabled={atLimit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-stone-950 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={15} />
                  Adicionar item
                </button>
              </div>
            </div>

            {/* Formulário de cadastro/edição */}
            {editing?.profileId === profile.id && (
              <form
                onSubmit={saveItem}
                className="p-5 bg-amber-500/[0.03] border-b border-stone-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-950">
                    {editing.itemId ? "Editar item" : "Novo item"} —{" "}
                    {profile.name}
                  </p>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Nome do item *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Ex: Magnésio Dimalato + Triptofano"
                    className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Descrição
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="O que este item faz pelo cliente?"
                    className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Composição (ativos, separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={form.key_actives}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, key_actives: e.target.value }))
                    }
                    placeholder="Ex: Magnésio, Vitamina B6, Triptofano"
                    className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Preço (opcional — em R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="Ex: 119,90 (deixe vazio se não quiser definir)"
                    className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Canal de venda *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, channel: "whatsapp" }))
                      }
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${form.channel === "whatsapp" ? "border-amber-500 bg-amber-500/10 text-amber-700" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, channel: "store" }))
                      }
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${form.channel === "store" ? "border-amber-500 bg-amber-500/10 text-amber-700" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                    >
                      <Store size={16} /> Loja
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.redirect_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, redirect_url: e.target.value }))
                    }
                    placeholder={
                      form.channel === "whatsapp"
                        ? "Link do WhatsApp (ex: https://wa.me/5511999999999)"
                        : "Link da loja (ex: https://sualoja.com.br/produto)"
                    }
                    className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingId !== null}
                    className="flex-1 px-4 py-2.5 bg-stone-950 text-stone-50 rounded-xl font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingId !== null ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    {editing.itemId
                      ? "Salvar alterações"
                      : "Adicionar ao funil"}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2.5 text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Lista de itens do perfil */}
            {profileItems.length === 0 && !editing ? (
              <div className="p-8 text-center text-stone-400 text-sm">
                Nenhum item cadastrado para este perfil ainda.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {profileItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 flex flex-col lg:flex-row lg:items-center gap-4 transition-colors ${item.enabled ? "" : "opacity-60"}`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.enabled ? "bg-amber-500/10 text-amber-600" : "bg-stone-100 text-stone-400"}`}
                      >
                        <Package size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-stone-950 truncate">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.key_actives && item.key_actives.length > 0 && (
                          <p className="text-xs text-stone-400 mt-0.5">
                            Contém: {item.key_actives.join(", ")}
                          </p>
                        )}
                        {item.price_cents != null && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            R$ {formatPrice(item.price_cents)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Link de venda / canal */}
                    <div className="flex items-center gap-2 flex-1 lg:flex-none lg:w-64">
                      {item.redirect_url ? (
                        <>
                          <span className="text-stone-400 shrink-0">
                            <ChannelIcon url={item.redirect_url} />
                          </span>
                          <a
                            href={item.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm text-amber-600 hover:text-amber-700 truncate font-medium"
                          >
                            {/wa\.me/i.test(item.redirect_url)
                              ? "WhatsApp"
                              : "Loja"}
                          </a>
                          <a
                            href={item.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-stone-400 hover:text-amber-500 transition-colors"
                            title="Abrir"
                          >
                            <ExternalLink size={15} />
                          </a>
                        </>
                      ) : (
                        <span className="text-xs text-stone-400 italic">
                          Sem link de venda
                        </span>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors"
                      >
                        Editar
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => toggleEnabled(item)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-10 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-amber-500 transition-colors ${item.enabled ? "bg-amber-500" : "bg-stone-300"}`}
                        >
                          <span
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${item.enabled ? "translate-x-4" : ""}`}
                          />
                        </div>
                        <span className="ml-2 text-sm text-stone-600 w-14">
                          {item.enabled ? "Ativo" : "Inativo"}
                        </span>
                      </label>
                      <button
                        onClick={() => deleteItem(item)}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Legenda */}
      <div className="text-xs text-stone-500 bg-white rounded-xl border border-stone-200 p-4 space-y-1.5">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-stone-400 shrink-0" />
          Cada perfil do funil tem um limite de itens. Itens ativados aparecem
          no resultado do quiz para o visitante.
        </div>
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-stone-400 shrink-0" />O limite é por
          perfil: Basic (1), Pro (2), Enterprise (6). Use o botão "Adicionar
          item" em cada perfil para cadastrar.
        </div>
      </div>

      {/* Modal: Ver perfil — prévia fiel da Coluna 1 (Identidade) da tela de Resultado */}
      {viewingProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
          onClick={() => setViewingProfile(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto border rounded-[40px] p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300 shadow-[0_0_100px_rgba(0,0,0,0.6)]"
            style={{
              backgroundColor: "var(--theme-dark-surface)",
              borderColor: "var(--theme-dark-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingProfile(null)}
              className="absolute top-6 right-6 z-50 p-3 bg-black/80 text-white rounded-full hover:bg-stone-100 hover:text-stone-950 transition-all border border-stone-800"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {/* ===== Mesma renderização da Coluna 1 do Result ===== */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "var(--theme-accent)",
                    boxShadow: "0 0 15px var(--theme-accent)",
                  }}
                ></div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.5em]"
                  style={{ color: "var(--theme-dark-text-muted)" }}
                >
                  Diagnóstico Identificado
                </span>
              </div>

              <div className="space-y-2">
                <h2
                  className="text-4xl md:text-6xl font-serif tracking-tighter leading-none"
                  style={{
                    color: "var(--theme-dark-text)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {viewingProfile.name}
                </h2>
                <p
                  className="text-xl font-light italic tracking-wide"
                  style={{ color: "var(--theme-accent)" }}
                >
                  {viewingProfile.archetype || ""}
                </p>
              </div>

              <div className="space-y-5 pt-3">
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-2"
                    style={{ color: "var(--theme-dark-text-muted)" }}
                  >
                    <Brain size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      Base Científica
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed italic"
                    style={{ color: "var(--theme-dark-text-muted)" }}
                  >
                    {viewingProfile.scientific_basis ||
                      viewingProfile.description ||
                      "—"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div
                    className="flex items-center gap-2"
                    style={{ color: "var(--theme-dark-text-muted)" }}
                  >
                    <Eye size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      Efeito Esperado
                    </span>
                  </div>
                  <p
                    className="text-sm font-medium leading-relaxed"
                    style={{ color: "var(--theme-dark-text)" }}
                  >
                    {viewingProfile.expected_effect || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t" style={{ borderColor: "var(--theme-dark-border)" }}>
              <button
                onClick={() => setViewingProfile(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--theme-dark-text)",
                  color: "var(--theme-dark-background)",
                }}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
