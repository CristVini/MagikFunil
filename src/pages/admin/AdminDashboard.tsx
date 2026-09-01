import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, DollarSign, Crown, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { supabase } from "@lib/supabase";
import { formatCurrency } from '@lib/utils';

interface AdminDashboardData {
  kpis: { mrrCents: number; activeTenants: number; trialTenants: number; totalLeads: number };
  leads_by_tenant: { tenant: string; leads: number; color: string }[];
  top_products: { name: string; clicks: number }[];
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [tenantsRecent, setTenantsRecent] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([supabase.rpc("get_admin_dashboard"), supabase.rpc("get_admin_data")]).then(([d, ad]: any) => {
      if (d.error) { setError(d.error.message); return; }
      setData(d.data);
      if (ad.data?.tenants) setTenantsRecent(ad.data.tenants.slice(0, 5));
    });
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center" style={{ fontFamily: 'var(--font-sans)' }}>
        <p className="font-medium text-red-700">Não foi possível carregar o dashboard admin.</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-stone-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const { kpis, leads_by_tenant, top_products } = data;

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
          Dashboard Admin
        </h1>
        <p className="text-stone-500 mt-1">Visão geral da plataforma MagikFunil</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita Mensal (MRR)', value: formatCurrency(kpis.mrrCents / 100), icon: DollarSign, color: 'bg-amber-500/10 text-amber-600' },
          { label: 'Tenants Ativos', value: kpis.activeTenants, icon: Building2, color: 'bg-green-500/10 text-green-600' },
          { label: 'Em Trial', value: kpis.trialTenants, icon: Crown, color: 'bg-purple-500/10 text-purple-600' },
          { label: 'Leads totais', value: kpis.totalLeads.toLocaleString('pt-BR'), icon: Users, color: 'bg-blue-500/10 text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-stone-300 transition-colors">
            <div className={`p-3 rounded-xl inline-flex ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <p className="text-3xl font-bold text-stone-950 mt-4">{stat.value}</p>
            <p className="text-stone-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Leads por tenant */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Leads por Tenant</h3>
          {leads_by_tenant.length === 0 ? (
            <p className="text-sm text-stone-500 py-16 text-center">Nenhum lead registrado.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leads_by_tenant} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis type="number" tick={{ fill: '#78716C', fontSize: 12 }} />
                  <YAxis type="category" dataKey="tenant" width={140} tick={{ fill: '#57534E', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="leads" radius={[0, 6, 6, 0]} barSize={20}>
                    {leads_by_tenant.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top produtos */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Top Produtos (cliques)</h3>
          {top_products.length === 0 ? (
            <p className="text-sm text-stone-500 py-16 text-center">Nenhum clique registrado.</p>
          ) : (
            <div className="space-y-3">
              {top_products.map(p => {
                const max = top_products[0].clicks;
                return (
                  <div key={p.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-stone-700">{p.name}</span>
                      <span className="text-stone-500">{p.clicks} cliques</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(p.clicks / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tenants recentes */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-950">Tenants Recentes</h2>
          <Link to="/admin/tenants" className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors text-sm flex items-center gap-1">
            Ver todos <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="divide-y divide-stone-100">
          {tenantsRecent.length === 0 && <p className="px-6 py-8 text-center text-stone-500 text-sm">Nenhum tenant ainda.</p>}
          {tenantsRecent.map((t: any) => (
            <div key={t.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-stone-50">
              <div>
                <p className="font-medium text-stone-950 text-sm">{t.name}</p>
                <p className="text-xs text-stone-500">{t.slug}.seudominio.com</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                t.delivery_status === 'active' ? 'bg-green-500/10 text-green-600' :
                t.delivery_status === 'paused' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
              }`}>
                {t.delivery_status === 'active' ? 'Ativo' : t.delivery_status === 'paused' ? 'Pausado' : 'Bloqueado'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}