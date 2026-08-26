import { useState } from "react";
import { CreditCard, Crown, Shield, Check, Lock, Zap, Loader2 as LoaderIcon } from "lucide-react";
import { MOCK_PLAN, MOCK_SUBSCRIPTION, MOCK_KPIS, MOCK_PRODUCTS, MOCK_LEADS } from "./mockData";

// Face 2.7 — Assinatura / Plano (sisual do tenant)
const PLANS = [
  {
    slug: "basic",
    name: "Basic",
    price: "R$ 278,90",
    period: "/mês",
    palette: "from-stone-100 to-stone-200 border-stone-300",
    features: [
      { name: "Funil ilimitado", ok: true },
      { name: "Dashboard básico (visitas, leads, cliques)", ok: true },
      { name: "Histórico e exportação", ok: false },
      { name: "Infográficos de decisão (ROI, funil, horário)", ok: false },
      { name: "Domínio próprio", ok: false },
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    price: "R$ 369,00",
    period: "/mês",
    palette: "from-amber-100 to-amber-200 border-amber-400 ring-2 ring-amber-300",
    current: true,
    features: [
      { name: "Funil ilimitado", ok: true },
      { name: "Dashboard avançado + insights", ok: true },
      { name: "Histórico e exportação", ok: true },
      { name: "Infográficos de decisão (ROI, funil, horário)", ok: true },
      { name: "Domínio próprio", ok: false },
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "R$ 397,00",
    period: "/mês",
    palette: "from-stone-950 to-stone-800 border-stone-950",
    dark: true,
    features: [
      { name: "Funil ilimitado", ok: true },
      { name: "Analytics de decisão (perfil dominante, ROI, LTV) ⭐", ok: true },
      { name: "Histórico e exportação avançada", ok: true },
      { name: "Domínio próprio + multi-usuário", ok: true },
      { name: "Suporte dedicado", ok: true },
    ],
  },
];

export function TenantSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const activeProducts = MOCK_PRODUCTS.filter(p => p.enabled).length;
  const leadsThisMonth = MOCK_KPIS.quizCompleted;
  const maxLeads = MOCK_PLAN.max_leads_per_month;

  const planLabel = MOCK_SUBSCRIPTION.trial ? "Teste (trial)" : MOCK_PLAN.name;
  const daysLeft = MOCK_SUBSCRIPTION.trial_days_remaining;

  const upgrade = (slug: string) => {
    setSelectedPlan(slug);
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSelectedPlan(null);
    }, 900);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
          Assinatura e Plano
        </h1>
        <p className="text-stone-500 mt-1">Gerencie seu plano, limites e forma de pagamento</p>
      </div>

      {/* Plano atual */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
              <Crown size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500">Plano atual</p>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-stone-950">{MOCK_PLAN.name}</h2>
                {MOCK_SUBSCRIPTION.trial && (
                  <span className="px-2 py-0.5 bg-amber-500 text-stone-950 rounded-full text-xs font-bold">Trial · {daysLeft} dias restantes</span>
                )}
              </div>
              <p className="text-stone-500 mt-1">
                {(MOCK_PLAN.price_monthly_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês · Renovação em {new Date(MOCK_SUBSCRIPTION.current_period_end).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
            <Shield size={16} />
            <span className="text-sm font-medium">Pagamento ativo</span>
          </div>
        </div>
      </div>

      {/* Uso vs limite */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-500">Produtos ativos</p>
            <p className="font-semibold text-stone-950">{activeProducts}/{MOCK_PLAN.max_products}</p>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(activeProducts / MOCK_PLAN.max_products) * 100}%` }} />
          </div>
          <p className="text-xs text-stone-500 mt-2">Limite do plano {MOCK_PLAN.name}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-500">Leads por mês</p>
            <p className="font-semibold text-stone-950">{leadsThisMonth.toLocaleString("pt-BR")}/{maxLeads.toLocaleString("pt-BR")}</p>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((leadsThisMonth / maxLeads) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-stone-500 mt-2">{(leadsThisMonth / maxLeads * 100).toFixed(0)}% do plano utilizado</p>
        </div>
      </div>

      {/* Planos para upgrade */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-amber-500" />
          Planos Disponíveis
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.slug} className={`relative rounded-2xl border bg-gradient-to-b p-6 ${plan.palette}`}>
              {(plan as any).current && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-stone-950 rounded-full text-[10px] font-bold">Atual</span>
              )}
              <h3 className={`text-2xl font-display font-bold ${(plan as any).dark ? "text-white" : "text-stone-950"}`} style={{ fontFamily: "var(--font-display)" }}>
                {plan.name}
              </h3>
              <p className={`mt-1 ${(plan as any).dark ? "text-stone-300" : "text-stone-500"}`}>
                <span className="text-2xl font-bold text-stone-950">{plan.price}</span>
                <span className="text-sm"> {plan.period}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${(plan as any).dark ? "text-stone-200" : "text-stone-700"}`}>
                    {f.ok
                      ? <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                      : <Check size={16} className="text-stone-300 shrink-0 mt-0.5" />}
                    <span className={f.ok ? "" : "opacity-60"}>{f.name}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => upgrade(plan.slug)}
                disabled={processing || (plan as any).current}
                className={`mt-5 w-full py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 ${(plan as any).dark ? "bg-white text-stone-950 hover:bg-stone-100" : "bg-stone-950 text-white hover:bg-stone-800"}`}
              >
                {selectedPlan === plan.slug ? <LoaderIcon size={18} className="mx-auto animate-spin" /> : (plan as any).current ? "Plano atual" : "Escolher plano"}
              </button>
            </div>
          ))}
        </div>
        {processing && <p className="mt-4 text-sm text-amber-600">Processando alteração de plano...</p>}
      </div>

      {/* Histórico de cobrança */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4">Histórico de Cobrança</h2>
        <div className="space-y-2">
          {MOCK_SUBSCRIPTION.billing_history.map((b, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
              <div>
                <p className="font-medium text-stone-950">{b.description}</p>
                <p className="text-xs text-stone-500">{new Date(b.date).toLocaleDateString("pt-BR")}</p>
              </div>
              <p className="font-semibold text-stone-950">{(b.amount_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}