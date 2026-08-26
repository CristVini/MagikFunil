"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@lib/supabase";
import { Loader2, Building2, Users, Shield, Crown, Plus, Search, Edit, Trash2, Activity, X } from "lucide-react";
import { formatCurrency } from "@lib/utils";
import { cn } from "@lib/utils";

type TenantStatus = "active" | "paused" | "blocked_billing";

interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: "active" | "paused" | "blocked_billing";
  template_id: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  created_at: string;
  subscriptions: {
    id: string;
    status: string;
    plans: { name: string; slug: string; price_monthly_cents: number } | null;
  } | null;
}

export function AdminTenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    primary_color: "#16A34A",
    secondary_color: "#EC4899",
    accent_color: "#F59E0B",
    template_id: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("tenants")
        .select(`
          *,
          subscriptions (
            id,
            status,
            plans (name, slug, price_monthly_cents)
          )
        `)
        .order("created_at", { ascending: false });
      setTenants(data || []);
    } catch (err) {
      console.error("Erro ao carregar tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTenant(null);
    setFormData({
      name: "",
      slug: "",
      primary_color: "#16A34A",
      secondary_color: "#EC4899",
      accent_color: "#F59E0B",
      template_id: "",
      status: "active",
    });
    setShowCreateModal(true);
  };

  const openEditModal = (tenant: any) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      primary_color: tenant.primary_color || "#16A34A",
      secondary_color: tenant.secondary_color || "#EC4899",
      accent_color: tenant.accent_color || "#F59E0B",
      template_id: tenant.template_id || "",
      status: tenant.status,
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTenant(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Nome e slug são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      if (editingTenant) {
        const { error } = await supabase
          .from("tenants")
          .update({
            name: formData.name,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            accent_color: formData.accent_color,
            template_id: formData.template_id || null,
            status: formData.status,
          })
          .eq("id", editingTenant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tenants")
          .insert({
            name: formData.name,
            slug: formData.slug,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            accent_color: formData.accent_color,
            template_id: formData.template_id || null,
            status: formData.status,
          });
        if (error) throw error;
      }
      await loadTenants();
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar tenant:", err);
      alert("Erro ao salvar tenant");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (tenantId: string, newStatus: string) => {
    try {
      await supabase.from("tenants").update({ status: newStatus }).eq("id", tenantId);
      setTenants((prev: any[]) => prev.map((t: any) => t.id === tenantId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro ao atualizar status");
    }
  };

  const filteredTenants = useMemo(() => {
    return tenants.filter((t: any) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s);
      }
      return true;
    });
  }, [tenants, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Build tenant rows as an array (função normal, não-hook)
  const renderTenantRows = () => {
    const rows: React.ReactElement[] = [];
    const tenantsArray = Array.from(tenants);
    for (let i = 0; i < tenantsArray.length; i++) {
      const tenant = tenantsArray[i];
      rows.push(
        React.createElement(
          "tr",
          { key: tenant.id, className: "hover:bg-stone-50" },
          React.createElement(
            "td",
            { className: "px-6 py-4" },
            React.createElement(
              "div",
              { className: "flex items-center gap-3" },
              React.createElement(
                "div",
                { className: "w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center" },
                React.createElement(Building2, { size: 20, className: "text-stone-600" })
              ),
              React.createElement(
                "div",
                null,
                React.createElement("p", { className: "font-medium text-stone-950" }, tenant.name),
                React.createElement("p", { className: "text-sm text-stone-500" }, tenant.slug + ".seudominio.com")
              )
            )
          ),
          React.createElement(
            "td",
            { className: "px-6 py-4" },
            React.createElement(
              "span",
              { className: "px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium" },
              tenant.subscriptions?.[0]?.plans?.name || "Sem plano"
            )
          ),
          React.createElement(
            "td",
            { className: "px-6 py-4" },
            React.createElement(
              "select",
              {
                value: tenant.status,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => updateStatus(tenant.id, e.target.value),
                className: "px-3 py-1.5 rounded-full text-xs font-semibold border"
              },
              React.createElement("option", { value: "active" }, "Ativo"),
              React.createElement("option", { value: "paused" }, "Pausado"),
              React.createElement("option", { value: "blocked_billing" }, "Bloqueado (billing)")
            )
          ),
          React.createElement("td", { className: "px-6 py-4 text-sm text-stone-500" }, tenant.template_id || "—"),
          React.createElement("td", { className: "px-6 py-4 text-sm text-stone-500" }, new Date(tenant.created_at).toLocaleDateString("pt-BR")),
          React.createElement(
            "td",
            { className: "px-6 py-4 text-right" },
            React.createElement(
              "button",
              {
                onClick: () => { setEditingTenant(tenant); setShowCreateModal(true); },
                className: "p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors mr-2",
                title: "Editar"
              },
              React.createElement(Edit, { size: 18 })
            ),
            React.createElement(
              "button",
              { className: "p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors", title: "Excluir" },
              React.createElement(Trash2, { size: 18 })
            )
          )
        )
      );
    }
    return rows;
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
            Tenants
          </h1>
          <p className="text-stone-500 mt-1">Gerencie clientes da plataforma</p>
        </div>
        <button onClick={() => { setEditingTenant(null); setFormData({ name: "", slug: "", primary_color: "#16A34A", secondary_color: "#EC4899", accent_color: "#F59E0B", template_id: "", status: "active" }); setShowCreateModal(true); }} className="px-4 py-2 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Novo Tenant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { status: "active", label: "Ativos", color: "bg-green-500/10 text-green-600", icon: Activity },
          { status: "paused", label: "Pausados", color: "bg-amber-500/10 text-amber-600", icon: Users },
          { status: "blocked_billing", label: "Bloqueados", color: "bg-red-500/10 text-red-600", icon: Shield },
          { label: "Total", color: "bg-blue-500/10 text-blue-600", icon: Building2 },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-stone-950">
              {stat.label === "Total" ? tenants.length : tenants.filter((t: any) => t.status === stat.status).length}
            </p>
            <p className="text-xs text-stone-500 capitalize">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, slug..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="blocked_billing">Bloqueado (billing)</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Criado em</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">Nenhum tenant cadastrado</td>
                </tr>
              ) : (
                renderTenantRows()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTenant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
                {editingTenant ? "Editar Tenant" : "Novo Tenant"}
              </h2>
              <button onClick={() => { setShowCreateModal(false); setEditingTenant(null); }} className="p-1 text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="meu-funil"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="active">Ativo</option>
                  <option value="paused">Pausado</option>
                  <option value="blocked_billing">Bloqueado (billing)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={e => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-12 rounded-lg border border-stone-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={e => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Template ID</label>
                <input
                  type="text"
                  value={formData.template_id}
                  onChange={e => setFormData(prev => ({ ...prev, template_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="encapsulados-nutraceuticos"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setEditingTenant(null); }}
                  className="flex-1 py-3 px-4 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : (editingTenant ? "Salvar" : "Criar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}