import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { useAuth } from '@hooks/useAuth';
import { Loader2, CreditCard, Shield, Crown, ArrowUp, Check, X, Loader2 as LoaderIcon } from 'lucide-react';
import { formatCurrency } from '@lib/utils';

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_monthly_cents: number;
  dashboard_level: 'basic' | 'advanced' | 'decision';
  max_products: number | null;
  max_clicks_month: number | null;
  custom_domain: boolean;
  multi_user: boolean;
  brand_free: boolean;
  support_level: 'standard' | 'priority' | 'dedicated';
  trial_days: number;
  position: number;
}

interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'paused' | 'canceled';
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  provider: string;
  provider_id: string | null;
  plans: Plan;
}

const PLAN_FEATURES = {
  basic: [
    { name: 'Funil ilimitado', included: true },
    { name: 'Dashboard básico (visitas, leads, cliques)', included: true },
    { name: 'Histórico e exportação', included: false },
    { name: 'Insights (produto/perfil mais clicado)', included: false },
    { name: 'Infográficos de decisão (ROI, funil, melhor horário)', included: false },
    { name: 'Domínio próprio', included: false },
    { name: 'Multi-usuário', included: false },
    { name: 'Remover "Powered by MagikFunil"', included: false },
    { name: 'Suporte', included: true, detail: 'Standard' },
  ],
  advanced: [
    { name: 'Funil ilimitado', included: true },
    { name: 'Dashboard básico', included: true },
    { name: 'Histórico e exportação', included: true },
    { name: 'Insights (produto/perfil mais clicado)', included: true },
    { name: 'Infográficos de decisão', included: false },
    { name: 'Domínio próprio', included: false },
    { name: 'Multi-usuário (até 2)', included: true },
    { name: 'Remover "Powered by MagikFunil"', included: false },
    { name: 'Suporte', included: true, detail: 'Priority' },
  ],
  decision: [
    { name: 'Funil ilimitado', included: true },
    { name: 'Dashboard completo', included: true },
    { name: 'Histórico e exportação', included: true },
    { name: 'Insights avançados', included: true },
    { name: 'Infográficos de decisão (ROI, funil, melhor horário, recomendação)', included: true },
    { name: 'Domínio próprio', included: true },
    { name: 'Multi-usuário ilimitado', included: true },
    { name: 'Remover "Powered by MagikFunil"', included: true },
    { name: 'Suporte', included: true, detail: 'Dedicated' },
  ],
};

export function TenantSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const tenantId = user?.user_metadata?.tenant_id;

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // Buscar subscription do tenant
      const { data: sub } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (*)
        `)
        .eq('tenant_id', tenantId)
        .single();

      // Buscar todos os planos
      const { data: allPlans } = await supabase
        .from('plans')
        .select('*')
        .order('position');

      setSubscription(sub);
      setPlans(allPlans || []);
    } catch (err) {
      console.error('Erro ao carregar assinatura:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      // TODO: Integrar com Stripe / gateway de pagamento
      // Por enquanto, simula upgrade imediato
      const { error } = await supabase
        .from('subscriptions')
        .update({ plan_id: planId, status: 'active' })
        .eq('tenant_id', tenantId);

      if (error) throw error;
      
      await loadData();
      alert('Plano atualizado com sucesso! Em produção, isso redirecionaria para o checkout do Stripe.');
    } catch (err) {
      console.error('Erro ao atualizar plano:', err);
      alert('Erro ao atualizar plano. Tente novamente.');
    } finally {
      setUpgrading(null);
    }
  };

  const currentPlan = subscription?.plans;
  const currentPlanSlug = currentPlan?.slug || 'basic';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const currentLevel = currentPlanSlug as 'basic' | 'advanced' | 'decision';

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
            Assinatura & Plano
          </h1>
          <p className="text-stone-500 mt-1">Gerencie seu plano e limites</p>
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className={`p-6 ${currentLevel === 'decision' ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5' : currentLevel === 'advanced' ? 'bg-gradient-to-r from-purple-500/10 to-purple-500/5' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                currentLevel === 'decision' ? 'bg-amber-500/20 text-amber-600' :
                currentLevel === 'advanced' ? 'bg-purple-500/20 text-purple-600' :
                'bg-blue-500/20 text-blue-600'
              }`}>
                {currentLevel === 'decision' && <Crown size={24} />}
                {currentLevel === 'advanced' && <Shield size={24} />}
                {currentLevel === 'basic' && <CreditCard size={24} />}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
                  {currentPlan?.name || 'Básico'}
                </h2>
                <p className="text-stone-500">
                  {subscription?.status === 'trial' ? 'Em período de teste' : 'Ativo'}
                  {subscription?.current_period_end && (
                    <> • Renovação: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-stone-950">
                {formatCurrency((currentPlan?.price_monthly_cents || 0) / 100)}/mês
              </span>
              {subscription?.status === 'past_due' && (
                <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-sm font-medium">
                  Pagamento pendente
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status & Limits */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-sm text-stone-500">Status</p>
          <p className="text-2xl font-bold text-stone-950 mt-1 capitalize">{subscription?.status || 'trial'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-sm text-stone-500">Produtos ativos</p>
          <p className="text-2xl font-bold text-stone-950 mt-1">
            {currentPlan?.max_products ? `${currentPlan.max_products}` : 'Ilimitado'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-sm text-stone-500">Cliques/mês</p>
          <p className="text-2xl font-bold text-stone-950 mt-1">
            {currentPlan?.max_clicks_month ? currentPlan.max_clicks_month.toLocaleString('pt-BR') : 'Ilimitado'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-sm text-stone-500">Dashboard</p>
          <p className="text-2xl font-bold text-stone-950 mt-1 capitalize">
            {currentPlan?.dashboard_level || 'basic'}
          </p>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-950">Comparar Planos</h2>
          <p className="text-stone-500 mt-1">Escolha o plano ideal para seu momento</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider w-48">Recurso</th>
                {plans.map(plan => (
                  <th key={plan.id} className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                    plan.slug === currentLevel ? 'text-amber-600 bg-amber-500/5' : 'text-stone-500'
                  }`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-lg">{plan.name}</span>
                      <span className="text-sm font-normal">{formatCurrency(plan.price_monthly_cents / 100)}/mês</span>
                      {plan.slug === currentLevel && (
                        <span className="px-2 py-0.5 bg-amber-500 text-stone-950 rounded text-[10px] font-bold">Atual</span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.basic.map((feature, i) => (
                <tr key={feature.name} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-6 py-3 text-sm font-medium text-stone-700">{feature.name}</td>
                  {plans.map(plan => {
                    const levelFeatures = PLAN_FEATURES[plan.slug as keyof typeof PLAN_FEATURES] || [];
                    const feat = levelFeatures[i];
                    return (
                      <td key={plan.id} className="px-6 py-3 text-center">
                        {feat?.included ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-stone-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upgrade Actions */}
        <div className="p-6 border-t border-stone-200">
          <div className="grid sm:grid-cols-3 gap-4">
            {plans
              .filter(p => p.slug !== currentLevel)
              .map(plan => (
                <div key={plan.id} className={`relative p-6 rounded-2xl border-2 ${
                  plan.slug === 'decision' ? 'border-amber-500 bg-amber-500/5' :
                  plan.slug === 'advanced' ? 'border-purple-500 bg-purple-500/5' :
                  'border-stone-200'
                }`}>
                  {plan.slug === 'decision' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-stone-950 rounded-full text-[10px] font-bold">
                      MAIS POPULAR
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-stone-950 mb-1">{plan.name}</h3>
                  <p className="text-2xl font-bold text-stone-950 mb-1">{formatCurrency(plan.price_monthly_cents / 100)}<span className="text-sm font-normal text-stone-500">/mês</span></p>
                  <p className="text-sm text-stone-500 mb-4">Dashboard {plan.dashboard_level} + {plan.dashboard_level === 'decision' ? 'Infográficos de decisão' : plan.dashboard_level === 'advanced' ? 'Insights + Export' : 'Básico'}</p>
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                    className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${
                      plan.slug === 'decision' ? 'bg-amber-500 text-stone-950 hover:bg-amber-400' :
                      plan.slug === 'advanced' ? 'bg-purple-500 text-white hover:bg-purple-600' :
                      'bg-stone-950 text-stone-50 hover:bg-stone-800'
                    }`}
                  >
                    {upgrading === plan.id ? <LoaderIcon className="w-5 h-5 mx-auto animate-spin" /> : `Assinar ${plan.name}`}
                  </button>
                  <p className="text-xs text-stone-500 mt-2 text-center">
                    {plan.trial_days} dias de teste grátis
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Billing Info */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-950 mb-4">Informações de Cobrança</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-500">Provedor</p>
            <p className="font-medium capitalize">{subscription?.provider || 'manual'}</p>
          </div>
          <div>
            <p className="text-stone-500">ID da Assinatura</p>
            <p className="font-medium font-mono text-xs">{subscription?.provider_id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-stone-500">Início do Período</p>
            <p className="font-medium">{subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString('pt-BR') : 'N/A'}</p>
          </div>
          <div>
            <p className="text-stone-500">Fim do Período</p>
            <p className="font-medium">{subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR') : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}