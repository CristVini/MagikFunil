"use client";

import React, { useState } from "react";
import { Building2, Plus, Search, Edit, Trash2, Mail, Eye } from "lucide-react";
import { MOCK_TENANTS, MOCK_PLANS } from "./mockData";
import { formatCurrency } from "@lib/utils";
import { cn } from "@lib/utils";

type DeliveryStatus = "active" | "paused" | "blocked";
type BillingStatus = "active" | "unpaid" | "trial";

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
  delivery_status: DeliveryStatus;
  billing_status: BillingStatus;
  created_at: string;
  leads: number;
  conversion: number;
  email: string;
}

const planName = (id: string) => MOCK_PLANS.find(p => p.id === id)?.name || "—";
const planPrice = (id: string) => MOCK_PLANS.find(p => p.id === id)?.price_monthly_cents || 0;

const DELIVERY_LABEL: Record<DeliveryStatus, string> = { active: "Ativo", paused: "Pausado", blocked: "Bloqueado" };
const BILLING_LABEL: Record<BillingStatus, string> = { active: "Pago", unpaid: "Em atraso", trial: "Trial" };
const DELIVERY_STYLE: Record<DeliveryStatus, string> = {
  active: "bg-green-500/10 text-green-600",
  paused: "bg-amber-500/10 text-amber-600",
  blocked: "bg-red-500/10 text-red-600",
};
const BILLING_STYLE: Record<BillingStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  unpaid: "bg-red-500/10 text-red-600",
  trial: "bg-purple-500/10 text-purple-600",
};

// Modal de criar/editar tenant
function TenantModal({ initial, onClose, onSave }: { initial: TenantRow | null; onClose: () => void; onSave: (t: TenantRow) => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    email: initial?.email || "",
    plan_id: initial?.plan_id || MOCK_PLANS[0].id,
    delivery_status: initial?.delivery_status || "active",
    billing_status: initial?.billing_status || "trial",
  });

  const submit = () => {
    const slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") || "tenant";
    onSave({
      id: initial?.id || `tenant-${Date.now()}`,
      name: form.name || "Novo Tenant",
      slug,
      plan_id: form.plan_id,
      delivery_status: form.delivery_status,
      billing_status: form.billing_status,
      created_at: initial?.created_at || new Date().toISOString(),
      leads: initial?.leads || 0,
      conversion: initial?.conversion || 0,
      email: form.email,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-950">{initial ? "Editar Tenant" : "Novo Tenant"}</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600">
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome da marca</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Farmácia Vida Natural"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Subdomínio</label>
            <div className="flex items-center">
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="farmacia-vida"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-l-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <span className="px-3 py-3 bg-stone-100 border border-l-0 border-stone-200 rounded-r-xl text-sm text-stone-500 whitespace-nowrap">.seudominio.com</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Contato</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contato@marca.com.br"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Plano</label>
            <select value={form.plan_id} onChange={e => setForm({ ...form, plan_id: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500">
              {MOCK_PLANS.map(p => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price_monthly_cents / 100)}/mês</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Entrega (funil)</label>
              <select value={form.delivery_status} onChange={e => setForm({ ...form, delivery_status: e.target.value as DeliveryStatus })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Pagamento</label>
              <select value={form.billing_status} onChange={e => setForm({ ...form, billing_status: e.target.value as BillingStatus })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="active">Pago</option>
                <option value="unpaid">Em atraso</option>
                <option value="trial">Trial</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-stone-500 bg-stone-50 rounded-xl p-3">
            Entrega e pagamento são estados <strong>independentes</strong>: é possível, por exemplo, um funil ativo com pagamento em atraso.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors">Cancelar</button>
          <button onClick={submit} className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors">Salvar</button>
        </div>
      </div>
    </div>
  );
}

export function AdminTenants() {
  const [tenants, setTenants] = useState<TenantRow[]>(MOCK_TENANTS as any);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DeliveryStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TenantRow | null>(null);

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || t.delivery_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (t: TenantRow) => {
    setTenants(prev => editing ? prev.map(x => x.id === t.id ? t : x) : [t, ...prev]);
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remover este tenant?")) return;
    setTenants(prev => prev.filter(x => x.id !== id));
  };

  const counts = {
    total: tenants.length,
    active: tenants.filter(t => t.delivery_status === "active").length,
    paused: tenants.filter(t => t.delivery_status === "paused").length,
    blocked: tenants.filter(t => t.delivery_status === "blocked").length,
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
            Tenants
          </h1>
          <p className="text-stone-500 mt-1">Gestão das marcas que usam a plataforma</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
          <Plus size={18} /> Criar tenant
        </button>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, style: 'text-stone-950' },
          { label: 'Ativos', value: counts.active, style: 'text-green-600' },
          { label: 'Pausados', value: counts.paused, style: 'text-amber-600' },
          { label: 'Bloqueados', value: counts.blocked, style: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className={`text-3xl font-bold ${s.style}`}>{s.value}</p>
            <p className="text-stone-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-md flex-1">
          <Search size={18} className="absolute left-3.5 top-3.5 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, subdomínio ou e-mail…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "paused", "blocked"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                statusFilter === s ? "bg-stone-950 text-stone-50" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50")}>
              {s === "all" ? "Todos" : DELIVERY_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Entrega</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Leads</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-500">Nenhum tenant encontrado</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-stone-950 text-sm">{t.name}</p>
                        <p className="text-xs text-stone-500">{t.slug}.seudominio.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">{planName(t.plan_id)}</span>
                    {planPrice(t.plan_id) > 0 && <p className="text-xs text-stone-400 mt-1">{formatCurrency(planPrice(t.plan_id) / 100)}/mês</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", DELIVERY_STYLE[t.delivery_status])}>{DELIVERY_LABEL[t.delivery_status]}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", BILLING_STYLE[t.billing_status])}>{BILLING_LABEL[t.billing_status]}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-950">{t.leads.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-stone-500">{t.conversion}% conv.</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <a href={`/f/${t.slug}`} target="_blank" rel="noreferrer" title="Ver funil" className="p-2 text-stone-400 hover:text-blue-500 rounded-lg transition-colors"><Eye size={17} /></a>
                      <a href={`mailto:${t.email}`} title="E-mail" className="p-2 text-stone-400 hover:text-blue-500 rounded-lg transition-colors"><Mail size={17} /></a>
                      <button onClick={() => { setEditing(t); setShowModal(true); }} title="Editar" className="p-2 text-stone-400 hover:text-amber-500 rounded-lg transition-colors"><Edit size={17} /></button>
                      <button onClick={() => handleDelete(t.id)} title="Remover" className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <TenantModal initial={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}