// ============================================================
// Face 3 — Mock de Demonstração do ADMIN (nossa empresa)
// Dados fictícios REALISTAS da nossa própria operação.
// Front-end puro: nada vem do Supabase; tudo aqui é simulado.
// ============================================================

// Usuário admin mock para liberar as rotas /admin em modo demo
export const MOCK_ADMIN_USER = {
  id: "mock-admin",
  email: "admin@magikfunil.com",
  user_metadata: {
    role: "admin",
    name: "Equipe MagikFunil",
  },
};

// ============================================================
// PLANOS (3.4) — o que vendemos
// ============================================================
export interface AdminPlan {
  id: string;
  name: string;
  price_monthly_cents: number;
  max_products: number;
  max_leads_per_month: number;
  custom_domain: boolean;
  trial_days: number;
  features: string[];
}

export const MOCK_PLANS: AdminPlan[] = [
  { id: "plan-basic", name: "Basic", price_monthly_cents: 27890, max_products: 4, max_leads_per_month: 1500, custom_domain: false, trial_days: 30, features: ["1 funil público", "Até 4 produtos", "1.500 leads/mês", "WhatsApp integrado"] },
  { id: "plan-pro", name: "Pro", price_monthly_cents: 36900, max_products: 6, max_leads_per_month: 3000, custom_domain: false, trial_days: 30, features: ["1 funil público", "Até 6 produtos", "3.000 leads/mês", "Relatório de perfil dominante", "Export CSV"] },
  { id: "plan-enterprise", name: "Enterprise", price_monthly_cents: 39700, max_products: 99, max_leads_per_month: 10000, custom_domain: true, trial_days: 30, features: ["Domínio próprio customizado", "Produtos ilimitados", "Analytics de decisão", "Next-best-offer", "Suporte prioritário"] },
];

// ============================================================
// TENANTS (3.2) — marcas que usam a plataforma
// ============================================================
export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
  delivery_status: "active" | "paused" | "blocked";
  billing_status: "active" | "unpaid" | "trial";
  created_at: string;
  leads: number;
  conversion: number;
  email: string;
}

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * DAY).toISOString();

export const MOCK_TENANTS: AdminTenant[] = [
  { id: "tenant-farmacia-vida", name: "Farmácia Vida Natural", slug: "farmacia-vida", plan_id: "plan-pro", delivery_status: "active", billing_status: "trial", created_at: iso(12), leads: 1284, conversion: 35.4, email: "contato@farmaciavida.com.br" },
  { id: "tenant-saude-mais", name: "Saúde+ Manipulação", slug: "saude-mais", plan_id: "plan-basic", delivery_status: "active", billing_status: "active", created_at: iso(45), leads: 862, conversion: 28.1, email: "contato@saudemais.com.br" },
  { id: "tenant-drogaria-central", name: "Drogaria Central", slug: "drogaria-central", plan_id: "plan-enterprise", delivery_status: "active", billing_status: "active", created_at: iso(90), leads: 3105, conversion: 41.7, email: "gerencia@drogaria-central.com.br" },
  { id: "tenant-vita-manip", name: "Vita Manipulados", slug: "vita-manip", plan_id: "plan-basic", delivery_status: "paused", billing_status: "unpaid", created_at: iso(150), leads: 410, conversion: 22.0, email: "contato@vitamanip.com.br" },
  { id: "tenant-natural-life", name: "Natural Life Farm", slug: "natural-life", plan_id: "plan-pro", delivery_status: "active", billing_status: "active", created_at: iso(22), leads: 1544, conversion: 33.9, email: "oi@naturallife.com.br" },
  { id: "tenant-bem-viver", name: "Bem Viver Fórmulas", slug: "bem-viver", plan_id: "plan-basic", delivery_status: "blocked", billing_status: "unpaid", created_at: iso(200), leads: 198, conversion: 18.3, email: "atendimento@bemviver.com.br" },
];

// ============================================================
// TEMPLATES (3.3) — o cérebro do produto
// ============================================================
export interface AdminProfile {
  id: string;
  name: string;
  archetype: string;
  color: string;
  scientific_basis: string;
  products: string[];
}

export interface AdminTemplate {
  id: string;
  slug: string;
  name: string;
  niche: string;
  tenants: number;
  status: "active" | "draft";
  profiles: AdminProfile[];
  question_count: number;
  product_count: number;
  questions?: string[];
}

export const MOCK_TEMPLATES: AdminTemplate[] = [
  {
    id: "tpl-encapsulados",
    slug: "encapsulados-nutraceuticos",
    name: "Encapsulados Nutracêuticos",
    niche: "Farmácia de manipulação",
    tenants: 5,
    status: "active",
    question_count: 14,
    product_count: 20,
    questions: [
      "Como você quer se sentir nas próximas semanas?",
      "Qual sua maior dificuldade hoje?",
      "Como está sua energia durante o dia?",
      "Sua imunidade costuma precisar de reforço?",
      "Que tipo de descanso você deseja?",
      "Como está sua digestão?",
      "O que mais te incomoda no espelho?",
      "Qual objetivo é prioridade agora?",
      "Sua pele e cabelo pedem mais cuidado?",
      "Você sente fome fora de hora?",
      "Como você lida com o estresse?",
      "Qual rotina você quer construir?",
      "O que te impede de começar?",
      "Qual estilo de vida combina com você?",
    ],
    profiles: [
      { id: "p-descanso", name: "Modo Descansar", archetype: "Sono & Relaxamento", color: "#6D28D9", scientific_basis: "Magnésio e melatonina no ritmo circadiano", products: ["Kit Sono Tranquilo", "Magnésio Relax"] },
      { id: "p-imunidade", name: "Modo Protegido", archetype: "Imunidade", color: "#0EA5E9", scientific_basis: "Vitamina C, zinco e vitamina D na resposta imune", products: ["Defesas do Corpo"] },
      { id: "p-beleza", name: "Modo Brilho", archetype: "Beleza de dentro pra fora", color: "#EC4899", scientific_basis: "Colágeno + vitamina C na síntese de colágeno", products: ["Colágeno + Brilho", "Sérum de Vitamina C"] },
      { id: "p-digestao", name: "Modo Leve", archetype: "Intestino saudável", color: "#14B8A6", scientific_basis: "Probióticos e enzimas digestivas", products: ["Barriga Leve"] },
      { id: "p-energia", name: "Modo Energizar", archetype: "Energia total", color: "#F59E0B", scientific_basis: "Vitaminas do complexo B no metabolismo energético", products: ["Energia do Dia"] },
    ],
  },
  {
    id: "tpl-dermocosmeticos",
    slug: "dermocosmeticos-face",
    name: "Dermocosméticos Facial",
    niche: "Farmácia de manipulação",
    tenants: 2,
    status: "draft",
    question_count: 10,
    product_count: 12,
    profiles: [
      { id: "d-hidratacao", name: "Hidratação Profunda", archetype: "Pele seca", color: "#7C3AED", scientific_basis: "Ácido hialurônico na retenção hídrica", products: ["Hidratante Facial"] },
      { id: "d-antiage", name: "Anticidade", archetype: "Pele madura", color: "#EE6C4D", scientific_basis: "Retinol e peptídeos no remodelamento dérmico", products: ["Creme Antirrugas"] },
    ],
  },
];

// ============================================================
// ASSINATURAS / BILLING (3.4)
// ============================================================
export interface AdminSubscription {
  tenant_id: string;
  tenant_name: string;
  plan_id: string;
  status: "active" | "trial" | "unpaid" | "canceled";
  provider: "manual" | "stripe";
  current_period_start: string;
  current_period_end: string;
}

export const MOCK_SUBSCRIPTIONS: AdminSubscription[] = [
  { tenant_id: "tenant-farmacia-vida", tenant_name: "Farmácia Vida Natural", plan_id: "plan-pro", status: "trial", provider: "manual", current_period_start: iso(12), current_period_end: iso(-18) },
  { tenant_id: "tenant-saude-mais", tenant_name: "Saúde+ Manipulação", plan_id: "plan-basic", status: "active", provider: "manual", current_period_start: iso(2), current_period_end: iso(-28) },
  { tenant_id: "tenant-drogaria-central", tenant_name: "Drogaria Central", plan_id: "plan-enterprise", status: "active", provider: "manual", current_period_start: iso(5), current_period_end: iso(-25) },
  { tenant_id: "tenant-vita-manip", tenant_name: "Vita Manipulados", plan_id: "plan-basic", status: "unpaid", provider: "manual", current_period_start: iso(20), current_period_end: iso(-10) },
  { tenant_id: "tenant-natural-life", tenant_name: "Natural Life Farm", plan_id: "plan-pro", status: "active", provider: "manual", current_period_start: iso(1), current_period_end: iso(-29) },
  { tenant_id: "tenant-bem-viver", tenant_name: "Bem Viver Fórmulas", plan_id: "plan-basic", status: "canceled", provider: "manual", current_period_start: iso(40), current_period_end: iso(-11) },
];

export interface AdminBillingEvent {
  id: string;
  tenant_name: string;
  type: "trial_start" | "payment" | "invoice_paid" | "invoice_failed" | "plan_change" | "refund";
  amount_cents: number;
  created_at: string;
  description: string;
}

export const MOCK_BILLING_EVENTS: AdminBillingEvent[] = [
  { id: "be-1", tenant_name: "Farmácia Vida Natural", type: "trial_start", amount_cents: 0, created_at: iso(12), description: "Início do trial de 30 dias" },
  { id: "be-2", tenant_name: "Drogaria Central", type: "invoice_paid", amount_cents: 39700, created_at: iso(2), description: "Fatura Enterprise paga" },
  { id: "be-3", tenant_name: "Natural Life Farm", type: "invoice_paid", amount_cents: 36900, created_at: iso(3), description: "Fatura Pro paga" },
  { id: "be-4", tenant_name: "Vita Manipulados", type: "invoice_failed", amount_cents: 27890, created_at: iso(9), description: "Tentativa de cobrança recusada" },
  { id: "be-5", tenant_name: "Bem Viver Fórmulas", type: "invoice_failed", amount_cents: 27890, created_at: iso(15), description: "Cobrança recusada (2ª tentativa)" },
  { id: "be-6", tenant_name: "Farmácia Vida Natural", type: "plan_change", amount_cents: 0, created_at: iso(20), description: "Upgrade para o plano Pro" },
];

// ============================================================
// VISÃO GERAL ADMIN (3.1) — métricas da plataforma
// ============================================================
export const MOCK_ADMIN_KPIS = {
  mrrCents: 36900 * 3 + 27890 * 2,  // 3 Pro ativos + 2 Basic pagos = 166,480
  activeTenants: 4,
  trialTenants: 1,
  totalLeads: 7431,
  totalTemplates: 2,
};

export const MOCK_MRR_BY_MONTH = [
  { month: "Fev", value: 55780 },
  { month: "Mar", value: 55780 },
  { month: "Abr", value: 83670 },
  { month: "Mai", value: 83670 },
  { month: "Jun", value: 111560 },
  { month: "Jul", value: 166480 },
];

export const MOCK_LEADS_BY_TENANT = [
  { tenant: "Drogaria Central", leads: 3105, color: "#16A34A" },
  { tenant: "Natural Life Farm", leads: 1544, color: "#EC4899" },
  { tenant: "Farmácia Vida Natural", leads: 1284, color: "#F59E0B" },
  { tenant: "Saúde+ Manipulação", leads: 862, color: "#0EA5E9" },
  { tenant: "Vita Manipulados", leads: 410, color: "#78716C" },
  { tenant: "Bem Viver Fórmulas", leads: 198, color: "#A8A29E" },
];

export const MOCK_TOP_PRODUCTS_GLOBAL = [
  { name: "Kit Sono Tranquilo", clicks: 320 },
  { name: "Magnésio Relax", clicks: 241 },
  { name: "Defesas do Corpo", clicks: 198 },
  { name: "Colágeno + Brilho", clicks: 156 },
  { name: "Barriga Leve", clicks: 122 },
];