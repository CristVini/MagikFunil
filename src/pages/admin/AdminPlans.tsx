"use client";

import { useState, useEffect } from "react";
import { supabase } from "@lib/supabase";
import { Loader2, CreditCard, Shield, Crown, Plus, Search, Edit, Trash2, MoreVertical, ArrowUp, Check, X, Loader2 as LoaderIcon } from "lucide-react";
import { formatCurrency } from "@lib/utils";
import { cn } from "@lib/utils";

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_monthly_cents: number;
  dashboard_level: "basic" | "advanced" | "decision";
  max_products: number | null;
  max_clicks_month: number | null;
  custom_domain: boolean;
  multi_user: boolean;
  brand_free: boolean;
  support_level: "standard" | "priority" | "dedicated";
  trial_days: number;
  position: number;
  created_at: string;
}

const LEVEL_LABELS = {
  basic: "Básico",
  advanced: "Avançado",
  decision: "Decisão",
};

const SUPPORT_LABELS = {
  standard: "Standard",
  priority: "Priority",
  dedicated: "Dedicated",
};

export function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price_monthly_cents: 0,
    dashboard_level: "basic" as "basic" | "advanced" | "decision",
    max_products: null as number | null,
    max_clicks_month: null as number | null,
    custom_domain: false,
    multi_user: false,
    brand_free: true,
    support_level: "standard" as "standard" | "priority" | "dedicated",
    trial_days: 30,
    position: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("plans")
        .select("*")
        .order("position");
      setPlans(data || []);
    } catch (err) {
      console.error("Erro ao carregar planos:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      slug: "",
      price_monthly_cents: 0,
      dashboard_level: "basic",
      max_products: null,
      max_clicks_month: null,
      custom_domain: false,
      multi_user: false,
      brand_free: true,
      support_level: "standard",
      trial_days: 30,
      position: plans.length,
    });
    setShowCreateModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price_monthly_cents: plan.price_monthly_cents,
      dashboard_level: plan.dashboard_level,
      max_products: plan.max_products,
      max_clicks_month: plan.max_clicks_month,
      custom_domain: plan.custom_domain,
      multi_user: plan.multi_user,
      brand_free: plan.brand_free,
      support_level: plan.support_level,
      trial_days: plan.trial_days,
      position: plan.position,
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || formData.price_monthly_cents <= 0) {
      alert("Nome, slug e preço são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      if (editingPlan) {
        const { error } = await supabase
          .from("plans")
          .update({
            name: formData.name,
            price_monthly_cents: formData.price_monthly_cents,
            dashboard_level: formData.dashboard_level,
            max_products: formData.max_products,
            max_clicks_month: formData.max_clicks_month,
            custom_domain: formData.custom_domain,
            multi_user: formData.multi_user,
            brand_free: formData.brand_free,
            support_level: formData.support_level,
            trial_days: formData.trial_days,
            position: formData.position,
          })
          .eq("id", editingPlan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("plans")
          .insert({
            name: formData.name,
            slug: formData.slug,
            price_monthly_cents: formData.price_monthly_cents,
            dashboard_level: formData.dashboard_level,
            max_products: formData.max_products,
            max_clicks_month: formData.max_clicks_month,
            custom_domain: formData.custom_domain,
            multi_user: formData.multi_user,
            brand_free: formData.brand_free,
            support_level: formData.support_level,
            trial_days: formData.trial_days,
            position: formData.position,
          });
        if (error) throw error;
      }
      await loadPlans();
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar plano:", err);
      alert("Erro ao salvar plano");
    } finally {
      setSaving(false);
    }
  };

  const togglePosition = async (planId: string, direction: "up" | "down") => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    const targetPosition = direction === "up" ? plan.position - 1 : plan.position + 1;
    const targetPlan = plans.find(p => p.position === targetPosition);
    if (!targetPlan) return;

    try {
      await supabase.from("plans").update({ position: targetPosition }).eq("id", planId);
      await supabase.from("plans").update({ position: plan.position }).eq("id", targetPlan.id);
      await loadPlans();
    } catch (err) {
      console.error("Erro ao reordenar:", err);
    }
  };

  const renderPlansTableBody = () => {
    if (plans.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center text-stone-500">Nenhum plano cadastrado</td>
        </tr>
      );
    }

    return plans.map(plan => (
      <tr key={plan.id} className="hover:bg-stone-50">
        <td className="px-6 py-4">
          <div>
            <p className="font-medium text-stone-950">{plan.name}</p>
            <p className="text-sm text-stone-500 font-mono">{plan.slug}</p>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="font-semibold text-stone-950">{formatCurrency(plan.price_monthly_cents / 100)}</span>
          <p className="text-xs text-stone-500">/mês</p>
        </td>
        <td className="px-6 py-4 text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.dashboard_level === "decision" ? "bg-amber-500/10 text-amber-600" : plan.dashboard_level === "advanced" ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600"}`}>
            {LEVEL_LABELS[plan.dashboard_level]}
          </span>
        </td>
        <td className="px-6 py-4 text-center text-sm text-stone-600">
          <div className="space-y-1">
            <span>Produtos: {plan.max_products ? plan.max_products : "∞"}</span>
            <span>Cliques: {plan.max_clicks_month ? plan.max_clicks_month.toLocaleString("pt-BR") : "∞"}/mês</span>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            {plan.custom_domain && <Shield size={14} className="text-green-500" aria-label="Domínio próprio" />}
            {plan.multi_user && <Crown size={14} className="text-purple-500" aria-label="Multi-usuário" />}
            {!plan.brand_free && <Shield size={14} className="text-amber-500" aria-label="Sem 'Powered by'" />}
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">
            {plan.trial_days} dias
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {plan.position > 0 && (
              <button
                onClick={() => togglePosition(plan.id, "up")}
                className="p-1 text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 rounded transition-colors"
                title="Subir"
              >
                <ArrowUp size={16} className="rotate-180" />
              </button>
            )}
            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-xs font-mono">
              #{plan.position + 1}
            </span>
            {plan.position < plans.length - 1 && (
              <button
                onClick={() => togglePosition(plan.id, "down")}
                className="p-1 text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 rounded transition-colors"
                title="Descer"
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <button
            onClick={() => openEditModal(plan)}
            className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors mr-2"
            title="Editar"
          >
            <Edit size={18} />
          </button>
          <button className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
            <Trash2 size={18} />
          </button>
        </td>
      </tr>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
            Planos & Precificação
          </h1>
          <p className="text-stone-500 mt-1">Gerencie planos, preços e limites</p>
        </div>
        <button onClick={openCreateModal} className="px-4 py-2 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Novo Plano
        </button>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Dashboard</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Limites</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Recursos</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Trial</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Posição</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {renderPlansTableBody()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features Explanation */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4">Legenda dos Recursos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
            <CreditCard size={18} className="text-amber-500" />
            <span className="text-stone-700">Dashboard Levels: Básico / Avançado / Decisão</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
            <Shield size={18} className="text-green-500" />
            <span className="text-stone-700">Custom Domain = domínio próprio (Enterprise)</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
            <Crown size={18} className="text-purple-500" />
            <span className="text-stone-700">Multi-user = múltiplos usuários no dashboard</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
            <Shield size={18} className="text-amber-500" />
            <span className="text-stone-700">Brand Free = remove 'Powered by MagikFunil'</span>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPlan) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
                {editingPlan ? "Editar Plano" : "Novo Plano"}
              </h2>
              <button onClick={closeModal} className="p-1 text-stone-400 hover:text-stone-600">
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
                  placeholder="basic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Preço (centavos) *</label>
                <input
                  type="number"
                  value={formData.price_monthly_cents}
                  onChange={e => setFormData(prev => ({ ...prev, price_monthly_cents: parseInt(e.target.value) || 0 }))}
                  required
                  min={0}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="27890"
                />
                <p className="text-xs text-stone-500 mt-1">Ex: 27890 = R$ 278,90</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Nível do Dashboard *</label>
                <select
                  value={formData.dashboard_level}
                  onChange={e => setFormData(prev => ({ ...prev, dashboard_level: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="basic">Básico</option>
                  <option value="advanced">Avançado</option>
                  <option value="decision">Decisão</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Máx. Produtos</label>
                  <input
                    type="number"
                    value={formData.max_products || ""}
                    onChange={e => setFormData(prev => ({ ...prev, max_products: e.target.value ? parseInt(e.target.value) : null }))}
                    min={1}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Ilimitado (vazio)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Máx. Cliques/mês</label>
                  <input
                    type="number"
                    value={formData.max_clicks_month || ""}
                    onChange={e => setFormData(prev => ({ ...prev, max_clicks_month: e.target.value ? parseInt(e.target.value) : null }))}
                    min={1}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Ilimitado (vazio)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Trial (dias)</label>
                  <input
                    type="number"
                    value={formData.trial_days}
                    onChange={e => setFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) || 30 }))}
                    min={0}
                    max={30}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-xs text-stone-500 mt-1">Máx 30 dias</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Posição</label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={e => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                    min={0}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Suporte</label>
                <select
                  value={formData.support_level}
                  onChange={e => setFormData(prev => ({ ...prev, support_level: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="standard">Standard</option>
                  <option value="priority">Priority</option>
                  <option value="dedicated">Dedicated</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.custom_domain}
                    onChange={e => setFormData(prev => ({ ...prev, custom_domain: e.target.checked }))}
                    className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-stone-700">Domínio próprio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.multi_user}
                    onChange={e => setFormData(prev => ({ ...prev, multi_user: e.target.checked }))}
                    className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-stone-700">Multi-usuário</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.brand_free}
                    onChange={e => setFormData(prev => ({ ...prev, brand_free: e.target.checked }))}
                    className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-stone-700">Mostrar "Powered by MagikFunil"</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : (editingPlan ? "Salvar" : "Criar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}