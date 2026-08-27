import { Link } from "react-router-dom";
import { Building2, Users, DollarSign, Crown, TrendingUp, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Cell } from "recharts";
import { MOCK_ADMIN_KPIS, MOCK_MRR_BY_MONTH, MOCK_LEADS_BY_TENANT, MOCK_TOP_PRODUCTS_GLOBAL, MOCK_TENANTS } from "./mockData";
import { formatCurrency } from '@lib/utils';

export function AdminDashboard() {
  // console mock — nada real, tudo visto direto dos mocks
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
          { label: 'Receita Mensal (MRR)', value: formatCurrency(MOCK_ADMIN_KPIS.mrrCents / 100), icon: DollarSign, color: 'bg-amber-500/10 text-amber-600' },
          { label: 'Tenants Ativos', value: MOCK_ADMIN_KPIS.activeTenants, icon: Building2, color: 'bg-green-500/10 text-green-600' },
          { label: 'Em Trial', value: MOCK_ADMIN_KPIS.trialTenants, icon: Crown, color: 'bg-purple-500/10 text-purple-600' },
          { label: 'Leads totais', value: MOCK_ADMIN_KPIS.totalLeads.toLocaleString('pt-BR'), icon: Users, color: 'bg-blue-500/10 text-blue-600' },
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-stone-950">MRR ao longo do tempo</h3>
            <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium flex items-center gap-1">
              <TrendingUp size={13} /> +198%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MRR_BY_MONTH}>
                <defs>
                  <linearGradient id="mrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="month" tick={{ fill: '#78716C', fontSize: 12 }} />
                <YAxis tick={{ fill: '#78716C', fontSize: 12 }} tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`} />
                <Tooltip formatter={(v: any) => formatCurrency(v / 100)} />
                <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} fill="url(#mrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Leads por Tenant</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_LEADS_BY_TENANT} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis type="number" tick={{ fill: '#78716C', fontSize: 12 }} />
                <YAxis type="category" dataKey="tenant" width={140} tick={{ fill: '#57534E', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="leads" radius={[0, 6, 6, 0]} barSize={20}>
                  {MOCK_LEADS_BY_TENANT.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top produtos + Tenants recentes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Top Produtos (cliques)</h3>
          <div className="space-y-3">
            {MOCK_TOP_PRODUCTS_GLOBAL.map(p => {
              const max = MOCK_TOP_PRODUCTS_GLOBAL[0].clicks;
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
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-950">Tenants Recentes</h2>
            <Link to="/admin/tenants" className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors text-sm flex items-center gap-1">
              Ver todos <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            {MOCK_TENANTS.slice(0, 5).map(t => (
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
    </div>
  );
}