import { useAuth } from '@hooks/useAuth';
import { LayoutDashboard, Package, Users, Palette, CreditCard, Globe, TrendingUp, Target, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@lib/utils';

const KPI_CARDS = [
  { label: 'Leads Totais', value: '0', icon: Users, color: 'bg-blue-500/10 text-blue-600', change: '+12%', trend: 'up' },
  { label: 'Quiz Completados', value: '0', icon: Target, color: 'bg-purple-500/10 text-purple-600', change: '+8%', trend: 'up' },
  { label: 'Taxa de Conversão', value: '0%', icon: TrendingUp, color: 'bg-green-500/10 text-green-600', change: '+2.3%', trend: 'up' },
  { label: 'Cliques em Produtos', value: '0', icon: Package, color: 'bg-amber-500/10 text-amber-600', change: '+15%', trend: 'up' },
];

export function TenantDashboard() {
  const { user } = useAuth();
  const tenantName = user?.user_metadata?.tenant_name || 'Sua Marca';

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
            Olá, {tenantName} 👋
          </h1>
          <p className="text-stone-500 mt-1">Aqui está o que está acontecendo no seu funil hoje</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors">
            Ver Funil Público
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                <span>{kpi.change}</span>
                <span className="text-stone-400">vs mês passado</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-stone-950">{kpi.value}</p>
              <p className="text-stone-500 text-sm mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}

      {/* Charts Placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Funil de Conversão</h3>
          <div className="h-64 flex items-center justify-center text-stone-400">
            <p>Gráfico do funil: Visitas → Quiz Iniciado → Quiz Concluído → Cliques</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Leads por Dia (últimos 30 dias)</h3>
          <div className="h-64 flex items-center justify-center text-stone-400">
            <p>Gráfico de barras/linha de leads diários</p>
          </div>
        </div>
      </div>

      {/* Top Products & Profiles */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Produtos Mais Clicados</h3>
          <div className="space-y-3">
            <p className="text-stone-500 text-center py-8">Nenhum dado ainda. Ative produtos e divulgue seu funil.</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Perfil Dominante</h3>
          <div className="space-y-3">
            <p className="text-stone-500 text-center py-8">Aguarde leads completarem o quiz para ver o perfil mais frequente.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-950 mb-4">Ações Rápidas</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/dashboard/produtos" className="p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-center">
            <Package size={24} className="text-amber-500 mx-auto mb-2" />
            <p className="font-medium text-stone-950">Gerenciar Produtos</p>
            <p className="text-xs text-stone-500">Ativar/desativar, links</p>
          </a>
          <a href="/dashboard/aparencia" className="p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-center">
            <Palette size={24} className="text-amber-500 mx-auto mb-2" />
            <p className="font-medium text-stone-950">Personalizar Visual</p>
            <p className="text-xs text-stone-500">Cores, logo, textos</p>
          </a>
          <a href="/dashboard/assinatura" className="p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-center">
            <CreditCard size={24} className="text-amber-500 mx-auto mb-2" />
            <p className="font-medium text-stone-950">Ver Assinatura</p>
            <p className="text-xs text-stone-500">Plano, limites, billing</p>
          </a>
          <a href="/dashboard/publicacao" className="p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-center">
            <Globe size={24} className="text-amber-500 mx-auto mb-2" />
            <p className="font-medium text-stone-950">Publicar Funil</p>
            <p className="text-xs text-stone-500">Subdomínio, status</p>
          </a>
        </div>
      </div>
    </div>
  );
}