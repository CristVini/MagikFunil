"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Crown,
  Plus,
  Edit,
  Trash2,
  Check,
  HandCoins,
  Loader2,
} from "lucide-react";
import { supabase } from "@lib/supabase";
import { formatCurrency } from "@lib/utils";
import { cn } from "@lib/utils";

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  trial: "Trial",
  unpaid: "Em atraso",
  canceled: "Cancelada",
};
const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  trial: "bg-purple-500/10 text-purple-600",
  unpaid: "bg-red-500/10 text-red-600",
  canceled: "bg-stone-100 text-stone-600",
};

const EVENT_LABEL: Record<string, string> = {
  trial_start: "Início de trial",
  payment: "Pagamento",
  invoice_paid: "Fatura paga",
  invoice_failed: "Fatura recusada",
  plan_change: "Mudança de plano",
  refund: "Reembolso",
};
const EVENT_STYLE: Record<string, string> = {
  trial_start: "bg-purple-500/10 text-purple-600",
  payment: "bg-green-500/10 text-green-600",
  invoice_paid: "bg-green-500/10 text-green-600",
  invoice_failed: "bg-red-500/10 text-red-600",
  plan_change: "bg-amber-500/10 text-amber-600",
  refund: "bg-stone-100 text-stone-600",
};

interface AdminPlan {
  id: string;
  name: string;
  price_monthly_cents: number;
  max_products: number;
  max_leads_per_month: number;
  custom_domain: boolean;
  trial_days: number;
  slug?: string;
}

function PlanModal({
  initial,
  onClose,
  onSave,
}: {
  initial: AdminPlan | null;
  onClose: () => void;
  onSave: (p: AdminPlan) => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    price_monthly_cents: initial?.price_monthly_cents ?? 27890,
    max_products: initial?.max_products ?? 4,
    max_leads_per_month: initial?.max_leads_per_month ?? 1500,
    custom_domain: initial?.custom_domain ?? false,
    trial_days: initial?.trial_days ?? 30,
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-950">
            {initial ? "Editar Plano" : "Novo Plano"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Nome
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Growth"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Preço mensal (R$)
            </label>
            <input
              type="number"
              value={(form.price_monthly_cents / 100).toFixed(2)}
              onChange={(e) =>
                setForm({
                  ...form,
                  price_monthly_cents: Math.round(
                    parseFloat(e.target.value || "0") * 100,
                  ),
                })
              }
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Máx. produtos
              </label>
              <input
                type="number"
                value={form.max_products}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_products: parseInt(e.target.value || "0"),
                  })
                }
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Máx. leads/mês
              </label>
              <input
                type="number"
                value={form.max_leads_per_month}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_leads_per_month: parseInt(e.target.value || "0"),
                  })
                }
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Dias de trial
              </label>
              <input
                type="number"
                value={form.trial_days}
                onChange={(e) =>
                  setForm({
                    ...form,
                    trial_days: parseInt(e.target.value || "0"),
                  })
                }
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <label className="flex items-end gap-2 pb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.custom_domain}
                onChange={(e) =>
                  setForm({ ...form, custom_domain: e.target.checked })
                }
                className="w-5 h-5 rounded border-stone-300 accent-amber-500"
              />
              <span className="text-sm text-stone-700">Domínio próprio</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave({
                id: initial?.id || `plan-${Date.now()}`,
                name: form.name || "Novo Plano",
                price_monthly_cents: form.price_monthly_cents,
                max_products: form.max_products,
                max_leads_per_month: form.max_leads_per_month,
                custom_domain: form.custom_domain,
                trial_days: form.trial_days,
              });
            }}
            className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminPlans() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [billingEvents, setBillingEvents] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  const [tab, setTab] = useState<
    "planos" | "assinaturas" | "billing" | "pedidos"
  >("planos");
  const [processing, setProcessing] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      supabase.rpc("get_admin_data"),
      supabase.rpc("get_admin_plans"),
      supabase.rpc("admin_get_pending_plan_changes"),
    ]).then(([d, p, pe]: any) => {
      if (d.data) {
        if (d.data.subscriptions) setSubscriptions(d.data.subscriptions);
        if (d.data.billing_events) setBillingEvents(d.data.billing_events);
      }
      if (p.data) setPlans(p.data);
      if (pe.data) setPending(pe.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (p: AdminPlan) => {
    const isNew = !editing?.id || String(p.id).startsWith("plan-");
    if (isNew) {
      const { data, error } = await supabase
        .from("plans")
        .insert({
          name: p.name,
          slug: p.name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          price_monthly_cents: p.price_monthly_cents,
          max_products: p.max_products,
          max_clicks_month: p.max_leads_per_month * 2,
          custom_domain: p.custom_domain,
          trial_days: p.trial_days,
        })
        .select("id")
        .single();
      if (error) alert("Erro: " + error.message);
      else {
        setShowModal(false);
        setEditing(null);
        load();
      }
    } else {
      const { error } = await supabase
        .from("plans")
        .update({
          name: p.name,
          price_monthly_cents: p.price_monthly_cents,
          max_products: p.max_products,
          custom_domain: p.custom_domain,
          trial_days: p.trial_days,
        })
        .eq("id", p.id);
      if (error) alert("Erro: " + error.message);
      else {
        setShowModal(false);
        setEditing(null);
        load();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este plano?")) return;
    await supabase.from("plans").delete().eq("id", id);
    setPlans((prev) => prev.filter((x) => x.id !== id));
  };

  const approve = async (tenantId: string) => {
    setProcessing(tenantId);
    const { error } = await supabase.rpc("admin_apply_manual_payment", {
      p_tenant_id: tenantId,
    });
    setProcessing(null);
    if (error) {
      setNotice("Erro ao aprovar: " + error.message);
    } else {
      setNotice("Pagamento confirmado! Assinatura ativada.");
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-stone-500">Carregando planos e billing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-display font-bold text-stone-950"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Planos & Billing
          </h1>
          <p className="text-stone-500 mt-1">
            Monetização e status financeiro dos tenants
          </p>
        </div>
        {tab === "planos" && (
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 self-start"
          >
            <Plus size={18} /> Novo plano
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200">
        {[
          { key: "planos" as const, label: "Planos", icon: Crown },
          {
            key: "assinaturas" as const,
            label: "Assinaturas",
            icon: CreditCard,
          },
          {
            key: "billing" as const,
            label: "Eventos de billing",
            icon: HandCoins,
          },
          {
            key: "pedidos" as const,
            label: pending.length ? `Pedidos (${pending.length})` : "Pedidos",
            icon: HandCoins,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key
                ? "border-amber-500 text-stone-950"
                : "border-transparent text-stone-500 hover:text-stone-800",
            )}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {notice && (
        <div className="rounded-2xl border bg-green-50 border-green-200 p-4 text-green-800 text-sm">
          {notice}
        </div>
      )}

      {tab === "pedidos" && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-semibold text-stone-950 flex items-center gap-2">
              <HandCoins size={18} className="text-amber-500" /> Pedidos de
              troca de plano (aguardando pagamento)
            </h3>
            <span className="text-xs text-stone-400">Cobrança manual</span>
          </div>
          <div className="divide-y divide-stone-100">
            {pending.length === 0 && (
              <p className="px-6 py-8 text-center text-stone-500 text-sm">
                Nenhum pedido pendente.
              </p>
            )}
            {pending.map((r) => (
              <div
                key={r.tenant_id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-stone-50 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900">
                    {r.tenant_name}
                  </p>
                  <p className="text-xs text-stone-500">
                    Solicita <strong>{r.plan_name}</strong> ·{" "}
                    {formatCurrency(r.amount_cents / 100)}/mês
                  </p>
                </div>
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 font-medium">
                  Aguardando pagamento
                </span>
                <button
                  onClick={() => approve(r.tenant_id)}
                  disabled={processing === r.tenant_id}
                  className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing === r.tenant_id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Confirmar pagamento
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "planos" && (
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                  <Crown size={22} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setShowModal(true);
                    }}
                    className="p-2 text-stone-400 hover:text-amber-500 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-stone-950">{p.name}</h3>
              <p className="text-3xl font-bold text-stone-950 mt-2">
                {formatCurrency(p.price_monthly_cents / 100)}
                <span className="text-base font-medium text-stone-400">
                  /mês
                </span>
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {p.trial_days} dias de trial • sem plano gratuito
              </p>
              <ul className="mt-4 space-y-2 flex-1">
                {[
                  `Até ${p.max_products} produtos`,
                  `${p.max_leads_per_month.toLocaleString("pt-BR")} leads/mês`,
                  p.custom_domain
                    ? "Domínio próprio"
                    : "Subdomínio .seudominio.com",
                ].map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-stone-700"
                  >
                    <Check size={15} className="text-green-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === "assinaturas" && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Renovação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {subscriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-stone-500"
                    >
                      Nenhuma assinatura ativa
                    </td>
                  </tr>
                )}
                {subscriptions.map((s, i) => (
                  <tr key={s.tenant_id + i} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-950 text-sm">
                        {s.tenant_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">
                        {s.plan_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          STATUS_STYLE[s.status] || STATUS_STYLE.active,
                        )}
                      >
                        {STATUS_LABEL[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-stone-600">
                        <HandCoins size={14} className="text-stone-400" />{" "}
                        {s.provider === "manual" ? "Manual" : "Stripe"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {s.current_period_end
                        ? new Date(s.current_period_end).toLocaleDateString(
                            "pt-BR",
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-semibold text-stone-950 flex items-center gap-2">
              <HandCoins size={18} className="text-amber-500" /> Histórico de
              cobrança
            </h3>
            <span className="text-xs text-stone-400">
              Modo: cobrança manual (Stripe no futuro)
            </span>
          </div>
          <div className="divide-y divide-stone-100">
            {billingEvents.length === 0 && (
              <p className="px-6 py-8 text-center text-stone-500 text-sm">
                Nenhum evento de cobrança.
              </p>
            )}
            {billingEvents.map((e) => (
              <div
                key={e.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-stone-50"
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    EVENT_STYLE[e.type] || "bg-stone-100",
                  )}
                >
                  <HandCoins size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900">
                    {EVENT_LABEL[e.type] || e.type} — {e.tenant_name}
                  </p>
                  <p className="text-xs text-stone-500">{e.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-stone-950">
                    {e.amount_cents > 0
                      ? formatCurrency(e.amount_cents / 100)
                      : "—"}
                  </p>
                  <p className="text-xs text-stone-400">
                    {new Date(e.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <PlanModal
          initial={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
