import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { useAuth } from '@hooks/useAuth';
import { Loader2, Building2, Users, TrendingUp, DollarSign, Activity, MoreVertical, Edit, Trash2, Plus, Search, Filter, Shield, Crown } from 'lucide-react';
import { formatCurrency } from '@lib/utils';
import { cn } from '@lib/utils';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: 'active' | 'paused' | 'blocked_billing';
  template_id: string | null;
  created_at: string;
  subscriptions: {
    id: string;
    status: string;
    plans: { name: string; slug: string } | null;
  } | null;
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    trialTenants: 0,
    totalRevenue: 0,
  });
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Total tenants
      const { count: total } = await supabase.from('tenants').select('*', { count: 'exact', head: true });
      
      // Active tenants
      const { count: active } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Recent tenants
      const { data: recent } = await supabase
        .from('tenants')
        .select(`
          *,
          subscriptions (
            id,
            status,
            plans (name, slug)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Revenue (simplified)
      const { data: subs } = await supabase
        .from('subscriptions')
        .select(`
          status,
          plans (price_monthly_cents)
        `)
        .eq('status', 'active');

      const revenue = (subs || []).reduce((sum: number, s: any) => sum + (s.plans?.price_monthly_cents || 0), 0);

      setStats({
        totalTenants: total || 0,
        activeTenants: active || 0,
        trialTenants: (total || 0) - (active || 0),
        totalRevenue: revenue,
      });
      setRecentTenants(recent || []);
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
          Dashboard Admin
        </h1>
        <p className="text-stone-500 mt-1">Visão geral da plataforma</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tenants', value: stats.totalTenants, icon: Building2, color: 'bg-blue-500/10 text-blue-600' },
          { label: 'Ativos', value: stats.activeTenants, icon: Activity, color: 'bg-green-500/10 text-green-600' },
          { label: 'Em Trial', value: stats.trialTenants, icon: Crown, color: 'bg-purple-500/10 text-purple-600' },
          { label: 'Receita Mensal', value: formatCurrency(stats.totalRevenue / 100), icon: DollarSign, color: 'bg-amber-500/10 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-stone-950">{stat.value}</p>
              <p className="text-stone-500 text-sm mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Tenants por Status</h3>
          <div className="h-64 flex items-center justify-center text-stone-400">
            <p>Gráfico: Ativos / Pausados / Bloqueados / Trial</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Receita por Mês</h3>
          <div className="h-64 flex items-center justify-center text-stone-400">
            <p>Gráfico de linha: MRR ao longo do tempo</p>
          </div>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-stone-950">Tenants Recentes</h2>
          <a href="/admin/tenants" className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors text-sm">
            Ver todos
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Criado em</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {recentTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-500">Nenhum tenant cadastrado ainda</td>
                </tr>
              ) : (
                recentTenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-stone-950">{tenant.name}</p>
                        <p className="text-sm text-stone-500">{tenant.slug}.seudominio.com</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">
                        {tenant.subscriptions?.plans?.name || 'Sem plano'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tenant.status === 'active' ? 'bg-green-500/10 text-green-600' :
                        tenant.status === 'paused' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {tenant.status === 'active' ? 'Ativo' : tenant.status === 'paused' ? 'Pausado' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}