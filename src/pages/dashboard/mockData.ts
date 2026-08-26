// ============================================================
// Face 2 — Mock de Demonstração do Tenant
// Dados fictícios REALISTAS para o dashboard do cliente ver/comprar.
// Front-end puro: nada vem do Supabase; tudo aqui é simulado.
// ============================================================

export const MOCK_TENANT = {
  id: "tenant-farmacia-vida",
  name: "Farmácia Vida Natural",
  slug: "farmacia-vida",
  primary_color: "#16A34A",
  secondary_color: "#EC4899",
  accent_color: "#F59E0B",
  whatsapp: "5511999990000",
  status: "active",
  trial_days_remaining: 12,
};

// Usuário mock para liberar as rotas privadas (ProtectedRoute) em modo demo
export const MOCK_AUTH_USER = {
  id: "mock-user-farmacia",
  email: "contato@farmaciavida.com.br",
  user_metadata: {
    tenant_id: MOCK_TENANT.id,
    tenant_name: MOCK_TENANT.name,
    role: "tenant_user",
  },
};

// ============================================================
// PRODUTOS — catálogo pré-criado do template encapsulados
// ============================================================
export interface TenantMockProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  redirect_url: string;
  clicks: number;
  profile: string;
  profileLabel: string;
}

export const MOCK_PRODUCTS: TenantMockProduct[] = [
  { id: "prod-sono", name: "Kit Sono Tranquilo", category: "suplemento_oral", description: "Para acalmar a mente e entrar no ritmo certo do sono.", enabled: true, redirect_url: "https://wa.me/5511999990000?text=Kit%20Sono", clicks: 148, profile: "descanso", profileLabel: "Modo Descansar" },
  { id: "prod-magnesio", name: "Magnésio Relax", category: "suplemento_oral", description: "Aliado do descanso e do relaxamento muscular.", enabled: true, redirect_url: "https://wa.me/5511999990000?text=Magn%C3%A9sio", clicks: 96, profile: "descanso", profileLabel: "Modo Descansar" },
  { id: "prod-imuno", name: "Defesas do Corpo", category: "suplemento_oral", description: "Vitaminas e minerais para reforçar as defesas naturais.", enabled: true, redirect_url: "https://wa.me/5511999990000?text=Defesas", clicks: 82, profile: "imunidade", profileLabel: "Modo Protegido" },
  { id: "prod-colageno", name: "Colágeno + Brilho", category: "suplemento_oral", description: "Colágeno com vitamina C para pele firme e luminosa.", enabled: true, redirect_url: "https://wa.me/5511999990000?text=Col%C3%A1geno", clicks: 71, profile: "beleza", profileLabel: "Modo Brilho" },
  { id: "prod-intestino", name: "Barriga Leve", category: "suplemento_oral", description: "Probióticos e enzimas para uma digestão confortável.", enabled: true, redirect_url: "https://wa.me/5511999990000?text=Barriga", clicks: 58, profile: "digestao", profileLabel: "Modo Leve" },
  { id: "prod-energia", name: "Energia do Dia", category: "suplemento_oral", description: "Nutrientes que transformam alimento em energia.", enabled: false, redirect_url: "", clicks: 0, profile: "energia", profileLabel: "Modo Energizar" },
  { id: "prod-creatina", name: "Creatina Força", category: "suplemento_oral", description: "Ajuda na força e na recuperação muscular.", enabled: false, redirect_url: "", clicks: 0, profile: "performance", profileLabel: "Modo Força" },
  { id: "prod-termogenico", name: "Metabolismo em Dia", category: "suplemento_oral", description: "Apoio natural para o controle de peso.", enabled: false, redirect_url: "", clicks: 0, profile: "emagrecimento", profileLabel: "Modo Metabolismo Ativo" },
  { id: "prod-serum", name: "Sérum de Vitamina C", category: "dermocosmetico", description: "Sérum leve com vitamina C para o rosto.", enabled: false, redirect_url: "", clicks: 0, profile: "beleza", profileLabel: "Modo Brilho" },
  { id: "prod-equilibrio", name: "Equilíbrio do Dia", category: "suplemento_oral", description: "Ervas e nutrientes para lidar melhor com o estresse.", enabled: false, redirect_url: "", clicks: 0, profile: "equilibrio", profileLabel: "Modo Equilíbrio" },
];

// ============================================================
// LEADS — histórico fictício dos últimos 30 dias
// ============================================================
export interface TenantMockLead {
  id: string;
  name: string;
  phone: string;
  created_at: string; // ISO
  winner_profile: string;
  profileLabel: string;
  product_clicked: string;
  status: "new" | "contacted" | "won" | "lost";
  answers: Record<string, string>;
}

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * DAY).toISOString();

export const MOCK_LEADS: TenantMockLead[] = [
  { id: "lead-1", name: "Mariana Souza", phone: "(11) 98765-1234", created_at: iso(0), winner_profile: "descanso", profileLabel: "Modo Descansar", product_clicked: "Kit Sono Tranquilo", status: "new", answers: { q1: "Um descanso de verdade", q2: "Acordo cansada" } },
  { id: "lead-2", name: "Carlos Pereira", phone: "(11) 97654-2345", created_at: iso(0), winner_profile: "imunidade", profileLabel: "Modo Protegido", product_clicked: "Defesas do Corpo", status: "new", answers: { q1: "Corpo forte e protegido", q4: "Defesas mais altas" } },
  { id: "lead-3", name: "Ana Beatriz Lima", phone: "(11) 96543-3456", created_at: iso(1), winner_profile: "beleza", profileLabel: "Modo Brilho", product_clicked: "Colágeno + Brilho", status: "contacted", answers: { q9: "Pele opaca" } },
  { id: "lead-4", name: "João Almeida", phone: "(11) 95432-4567", created_at: iso(2), winner_profile: "digestao", profileLabel: "Modo Leve", product_clicked: "Barriga Leve", status: "contacted", answers: { q3: "Inchaço depois de comer" } },
  { id: "lead-5", name: "Fernanda Costa", phone: "(11) 94321-5678", created_at: iso(3), winner_profile: "descanso", profileLabel: "Modo Descansar", product_clicked: "Magnésio Relax", status: "won", answers: { q1: "Descanso de verdade", q14: "Preciso descansar" } },
  { id: "lead-6", name: "Ricardo Santos", phone: "(11) 93210-6789", created_at: iso(4), winner_profile: "energia", profileLabel: "Modo Energizar", product_clicked: "", status: "new", answers: { q2: "Acordo sem energia" } },
  { id: "lead-7", name: "Patrícia Rocha", phone: "(11) 92109-7890", created_at: iso(5), winner_profile: "imunidade", profileLabel: "Modo Protegido", product_clicked: "Defesas do Corpo", status: "won", answers: { q3: "Pego tudo" } },
  { id: "lead-8", name: "Eduardo Gomes", phone: "(11) 98765-8901", created_at: iso(6), winner_profile: "emagrecimento", profileLabel: "Modo Metabolismo Ativo", product_clicked: "", status: "contacted", answers: { q10: "Dificuldade pra controlar fome" } },
  { id: "lead-9", name: "Juliana Martins", phone: "(11) 97654-9012", created_at: iso(8), winner_profile: "beleza", profileLabel: "Modo Brilho", product_clicked: "Colágeno + Brilho", status: "new", answers: { q9: "Cabelo fraco" } },
  { id: "lead-10", name: "Thiago Nunes", phone: "(11) 96543-0123", created_at: iso(9), winner_profile: "descanso", profileLabel: "Modo Descansar", product_clicked: "Kit Sono Tranquilo", status: "lost", answers: { q1: "Mente não desacelera" } },
  { id: "lead-11", name: "Larissa Campos", phone: "(11) 95432-1234", created_at: iso(10), winner_profile: "equilibrio", profileLabel: "Modo Equilíbrio", product_clicked: "", status: "new", answers: { q12: "Stress me tira do eixo" } },
  { id: "lead-12", name: "André Ribeiro", phone: "(11) 94321-2345", created_at: iso(12), winner_profile: "digestao", profileLabel: "Modo Leve", product_clicked: "Barriga Leve", status: "won", answers: { q3: "Barriga estufada" } },
];

// ============================================================
// KPIs derivados + séries p/ gráficos
// ============================================================
export const MOCK_KPIS = {
  totalLeads: 1284,
  quizCompleted: 1142,
  productClicks: 455,
  conversionRate: 35.4,
};

export const MOCK_FUNNEL = [
  { stage: "Visitas", value: 3620, color: "#A8A29E" },
  { stage: "Quiz iniciado", value: 1984, color: "#16A34A" },
  { stage: "Quiz concluído", value: 1142, color: "#EC4899" },
  { stage: "Cliques", value: 455, color: "#F59E0B" },
];

export const MOCK_LEADS_BY_DAY = [
  { day: "01/07", leads: 18 }, { day: "02/07", leads: 24 }, { day: "03/07", leads: 21 },
  { day: "04/07", leads: 27 }, { day: "05/07", leads: 32 }, { day: "06/07", leads: 29 },
  { day: "07/07", leads: 35 }, { day: "08/07", leads: 30 }, { day: "09/07", leads: 38 },
  { day: "10/07", leads: 34 }, { day: "11/07", leads: 41 }, { day: "12/07", leads: 36 },
  { day: "13/07", leads: 44 }, { day: "14/07", leads: 40 }, { day: "15/07", leads: 47 },
];

// Distribuição de perfis (dominante)
export const MOCK_PROFILE_DISTRIBUTION = [
  { label: "Modo Descansar", count: 320, color: "#6D28D9" },
  { label: "Modo Protegido", count: 210, color: "#0EA5E9" },
  { label: "Modo Leve", count: 168, color: "#14B8A6" },
  { label: "Modo Brilho", count: 145, color: "#EC4899" },
  { label: "Modo Equilíbrio", count: 112, color: "#8B5CF6" },
  { label: "Outros", count: 187, color: "#78716C" },
];

// Plano / assinatura
export const MOCK_PLAN = {
  name: "Pro",
  price_monthly_cents: 36900,
  max_products: 6,
  max_leads_per_month: 3000,
  custom_domain: false,
};

export const MOCK_SUBSCRIPTION = {
  status: "active",
  current_period_end: new Date(now + 12 * DAY).toISOString(),
  trial: true,
  trial_days_remaining: 12,
  billing_history: [
    { date: iso(30), type: "trial_start", amount_cents: 0, description: "Início do período de teste (30 dias)" },
  ],
};