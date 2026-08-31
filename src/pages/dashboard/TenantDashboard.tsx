import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, Palette, CreditCard, Globe, TrendingUp, Target,
  AlertTriangle, ExternalLink, ArrowUpRight, ChevronRight, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  AreaChart, Area, CartesianGrid, PieChart, Pie,
} from "recharts";
import { supabase } from "@lib/supabase";

interface Overview {
  tenant: { id: string; name: string; slug: string; whatsapp?: string; status: string };
  kpis: { totalLeads: number; quizCompleted: number; productClicks: number; conversionRate: number };
  funnel: { stage: string; value: number; color: string }[];
  leads_by_day: { day: string; leads: number }[];
  profile_distribution: { label: string; count: number; color: string }[];
  top_products: { id: string; name: string; clicks: number }[];
}

export function TenantDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("get_tenant_overview").then(({ data: res, error: err }: { data: any; error: any }) => {
      if (err) { setError(err.message); return; }
      setData(res);
    });
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center" style={{ fontFamily: "var(--font-sans)" }}>
        <p className="font-medium text-red-700">Não foi possível carregar seu dashboard.</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-32" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-stone-500">Carregando seu funil...</p>
        </div>
      </div>
    );
  }

  const { tenant, kpis, funnel, leads_by_day, profile_distribution, top_products } = data;
  const topProducts = top_products || [];
  const maxProductClicks = Math.max(...topProducts.map(p => p.clicks), 1);
  const dominantProfile = (profile_distribution || [])[0];
  const trialEnding = false; // gerenciado na tela de assinatura a partir da subscription real

  const quickActions = [
    { path: "/dashboard/produtos", label: "Gerenciar Produtos", desc: "Ativar, links, ordem", icon: Package },
    { path: "/dashboard/aparencia", label: "Personalizar Visual", desc: "Cores, logo, textos", icon: Palette },
    { path: "/dashboard/assinatura", label: "Ver Assinatura", desc: "Plano, limites", icon: CreditCard },
    { path: "/dashboard/publicacao", label: "Publicar Funil", desc: "Subdomínio, status", icon: Globe },
  ];

  const kpiCards = [
    { label: "Leads Totais", value: kpis.totalLeads.toLocaleString("pt-BR"), icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: "Quiz Completados", value: kpis.quizCompleted.toLocaleString("pt-BR"), icon: Target, color: "bg-purple-500/10 text-purple-600" },
    { label: "Taxa de Conversão", value: `${kpis.conversionRate}%`, icon: TrendingUp, color: "bg-green-500/10 text-green-600" },
    { label: "Cliques em Produtos", value: kpis.productClicks.toLocaleString("pt-BR"), icon: Package, color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <div className="space-y-8" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
            Olá, {tenant.name} 👋
          </h1>
          <p className="text-stone-500 mt-1">Aqui está o que está acontecendo no seu funil hoje</p>
        </div>
        <Link
          to={`/f/${tenant.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors"
        >
          <ExternalLink size={18} />
          Ver Funil Público
        </Link>
      </div>

      {trialEnding && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">Seu período de teste termina em breve</p>
            <p className="text-sm text-amber-700">Escolha um plano para não interromper o funcionamento do seu funil.</p>
          </div>
          <Link to="/dashboard/assinatura" className="shrink-0 px-3 py-1.5 bg-amber-500 text-stone-950 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors">
            Escolher plano
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-stone-300 transition-colors">
            <div className={`p-3 rounded-xl ${kpi.color} w-fit`}>
              <kpi.icon size={24} />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-stone-950">{kpi.value}</p>
              <p className="text-stone-500 text-sm mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Funil de conversão */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Funil de Conversão</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="stage" width={90} tick={{ fill: "#78716C", fontSize: 12 }} />
                <Tooltip formatter={(v: any) => Number(v).toLocaleString("pt-BR")} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={26}>
                  {funnel.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads por dia */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Leads por Dia (últimos 15 dias)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leads_by_day} margin={{ left: -16 }}>
                <defs>
                  <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#78716C", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#78716C", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: any) => `${v} leads`} />
                <Area type="monotone" dataKey="leads" stroke="#16A34A" strokeWidth={2} fill="url(#leadsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products & Perfil Dominante */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top produtos */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-stone-950">Produtos Mais Clicados</h3>
            <Link to="/dashboard/produtos" className="text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 && <p className="text-sm text-stone-500">Nenhum clique registrado ainda.</p>}
            {topProducts.map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-stone-800">{p.name}</span>
                  <span className="text-stone-500">{p.clicks} cliques</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(p.clicks / maxProductClicks) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Perfil dominante */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-950 mb-4">Perfil Dominante</h3>
          {dominantProfile ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={profile_distribution} dataKey="count" nameKey="label" innerRadius={50} outerRadius={72} paddingAngle={2} stroke="none">
                      {profile_distribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-sm text-amber-500 font-semibold uppercase tracking-widest">Mais comum</p>
                <p className="text-2xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
                  {dominantProfile.label}
                </p>
                <p className="text-sm text-stone-500">{dominantProfile.count} leads</p>
                <Link to="/dashboard/leads" className="mt-2 inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Ver leads deste perfil <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500">Sem leads registrados ainda. Compartilhe seu funil para começar.</p>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-950 mb-4">Ações Rápidas</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.path} to={a.path} className="p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-center">
              <a.icon size={24} className="text-amber-500 mx-auto mb-2" />
              <p className="font-medium text-stone-950">{a.label}</p>
              <p className="text-xs text-stone-500">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}