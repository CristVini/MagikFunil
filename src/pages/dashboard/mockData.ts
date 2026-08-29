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
  is_kit: boolean;
  enabled: boolean;
  redirect_url: string;
  clicks: number;
  profile: string;
  profileLabel: string;
  // Texto de apoio (kits) — editável pelo cliente no dashboard, reflete no funil
  support_text?: string;
  // Preços (kits) — editáveis pelo cliente. Em promoção, o preço normal
  // aparece riscado e o promocional em destaque no funil.
  price_cents?: number;        // preço normal (aparece com risco quando há promo)
  promo_price_cents: number | null; // preço promocional
  show_promo: boolean;         // exibir a promoção (premium Enterprise)
}

// Espelha o protocolo do funil (MOCK_PRODUCTS_BY_PROFILE): cada perfil tem
// 2 produtos + 1 kit que os combina. O tenant edita o link de cada item, e
// o kit reaproveita o mesmo redirect_url — sem campo de preço (MVP).
export const MOCK_PRODUCTS: TenantMockProduct[] = [
  // Modo Descansar
  { id: "prod-sono", name: "Kit Sono Tranquilo", category: "suplemento_oral", description: "Para ajudar a mente a desacelerar e o corpo a entrar no ritmo certo do sono.", is_kit: false, enabled: true, redirect_url: "https://wa.me/5511999990000?text=Kit%20Sono", promo_price_cents: null, show_promo: false, clicks: 148, profile: "descanso", profileLabel: "Modo Descansar" },
  { id: "prod-magnesio", name: "Magnésio Relax", category: "suplemento_oral", description: "O clássico aliado do descanso. Ajuda a relaxar a musculatura e o sistema nervoso.", is_kit: false, enabled: true, redirect_url: "https://wa.me/5511999990000?text=Magn%C3%A9sio", promo_price_cents: null, show_promo: false, clicks: 96, profile: "descanso", profileLabel: "Modo Descansar" },
  { id: "kit-noite", name: "Kit Noite Reparadora", category: "kit_mensal", description: "Os dois anteriores em um protocolo de 30 dias para noites mais profundas.", support_text: "Noites mais profundas e manhãs com mais disposição.", is_kit: true, enabled: true, redirect_url: "https://wa.me/5511999990000?text=Kit%20Noite", price_cents: 11990, promo_price_cents: 8990, show_promo: true, clicks: 51, profile: "descanso", profileLabel: "Modo Descansar" },
  // Modo Protegido
  { id: "prod-imuno", name: "Defesas do Corpo", category: "suplemento_oral", description: "Vitaminas e minerais que fortalecem as defesas naturais do corpo.", is_kit: false, enabled: true, redirect_url: "https://wa.me/5511999990000?text=Defesas", promo_price_cents: 13490, show_promo: true, clicks: 82, profile: "imunidade", profileLabel: "Modo Protegido" },
  { id: "prod-zinco", name: "Proteção Diária", category: "suplemento_oral", description: "Zinco e vitaminas que ajudam na recuperação e nas mudanças de estação.", is_kit: false, enabled: false, redirect_url: "https://wa.me/5511999990000?text=Prote%C3%A7%C3%A3o", promo_price_cents: null, show_promo: false, clicks: 39, profile: "imunidade", profileLabel: "Modo Protegido" },
  { id: "kit-imuno", name: "Kit Proteção Total", category: "kit_mensal", description: "O reforço completo para sentir o corpo mais forte e protegido o mês inteiro.", support_text: "O corpo mais forte e protegido durante todo o mês.", is_kit: true, enabled: false, redirect_url: "https://wa.me/5511999990000?text=Kit%20Prote%C3%A7%C3%A3o", price_cents: 16990, promo_price_cents: null, show_promo: false, clicks: 22, profile: "imunidade", profileLabel: "Modo Protegido" },
  // Modo Brilho
  { id: "prod-colageno", name: "Colágeno + Brilho", category: "suplemento_oral", description: "Colágeno com vitamina C para pele firme e luminosa.", is_kit: false, enabled: true, redirect_url: "https://wa.me/5511999990000?text=Col%C3%A1geno", promo_price_cents: null, show_promo: false, clicks: 71, profile: "beleza", profileLabel: "Modo Brilho" },
  { id: "prod-serum", name: "Sérum de Vitamina C", category: "dermocosmetico", description: "Sérum leve com vitamina C para o rosto.", is_kit: false, enabled: false, redirect_url: "https://wa.me/5511999990000?text=S%C3%A9rum", promo_price_cents: null, show_promo: false, clicks: 33, profile: "beleza", profileLabel: "Modo Brilho" },
  { id: "kit-beleza", name: "Kit Pele de Dentro pra Fora", category: "kit_mensal", description: "Colágeno por dentro e o sérum por fora, para um brilho de verdade.", support_text: "Pele firme e luminosa, cuidada por dentro e por fora.", is_kit: true, enabled: false, redirect_url: "", price_cents: 14990, promo_price_cents: null, show_promo: false, clicks: 0, profile: "beleza", profileLabel: "Modo Brilho" },
  // Modo Leve
  { id: "prod-intestino", name: "Barriga Leve", category: "suplemento_oral", description: "Probióticos e enzimas para uma digestão confortável.", is_kit: false, enabled: true, redirect_url: "https://wa.me/5511999990000?text=Barriga", promo_price_cents: null, show_promo: false, clicks: 58, profile: "digestao", profileLabel: "Modo Leve" },
  { id: "prod-prebiotico", name: "Flora em Equilíbrio", category: "suplemento_oral", description: "Prebióticos e fibras que alimentam as bactérias boas do intestino.", is_kit: false, enabled: false, redirect_url: "https://wa.me/5511999990000?text=Flora", promo_price_cents: null, show_promo: false, clicks: 27, profile: "digestao", profileLabel: "Modo Leve" },
  { id: "kit-digestao", name: "Kit Leve & Equilibrado", category: "kit_mensal", description: "A dupla perfeita para dizer adeus ao inchaço e curtir as refeições sem desconforto.", support_text: "Refeições sem inchaço e um intestino em equilíbrio.", is_kit: true, enabled: false, redirect_url: "", price_cents: 13990, promo_price_cents: null, show_promo: false, clicks: 0, profile: "digestao", profileLabel: "Modo Leve" },
  // Modo Energizar
  { id: "prod-energia", name: "Energia do Dia", category: "suplemento_oral", description: "Nutrientes que transformam alimento em energia.", is_kit: false, enabled: false, redirect_url: "", promo_price_cents: null, show_promo: false, clicks: 0, profile: "energia", profileLabel: "Modo Energizar" },
  { id: "prod-rodiola", name: "Disposição Natural", category: "suplemento_oral", description: "Uma ajuda natural contra o cansaço físico e mental.", is_kit: false, enabled: false, redirect_url: "https://wa.me/5511999990000?text=Disposi%C3%A7%C3%A3o", promo_price_cents: null, show_promo: false, clicks: 19, profile: "energia", profileLabel: "Modo Energizar" },
  { id: "kit-dia", name: "Kit Dia Cheio", category: "kit_mensal", description: "Os dois maiores aliados da disposição em um único protocolo.", support_text: "Energia em alta do início ao fim do dia.", is_kit: true, enabled: false, redirect_url: "", price_cents: 12990, promo_price_cents: null, show_promo: false, clicks: 0, profile: "energia", profileLabel: "Modo Energizar" },
  // Modo Equilíbrio
  { id: "prod-equilibrio", name: "Equilíbrio do Dia", category: "suplemento_oral", description: "Ervas e nutrientes para lidar melhor com o estresse.", is_kit: false, enabled: false, redirect_url: "", promo_price_cents: null, show_promo: false, clicks: 0, profile: "equilibrio", profileLabel: "Modo Equilíbrio" },
  { id: "prod-humor", name: "Bom Humor Natural", category: "suplemento_oral", description: "Magnésio e vitaminas para manter o humor mais estável.", is_kit: false, enabled: false, redirect_url: "", promo_price_cents: null, show_promo: false, clicks: 0, profile: "equilibrio", profileLabel: "Modo Equilíbrio" },
  { id: "kit-equilibrio", name: "Kit Centro em Equilíbrio", category: "kit_mensal", description: "Para encontrar estabilidade e leveza mesmo nos dias intensos.", support_text: "Mente estável e leveza mesmo nos dias intensos.", is_kit: true, enabled: false, redirect_url: "", price_cents: 14990, promo_price_cents: null, show_promo: false, clicks: 0, profile: "equilibrio", profileLabel: "Modo Equilíbrio" },
  // Modo Força
  { id: "prod-creatina", name: "Creatina Força", category: "suplemento_oral", description: "Ajuda na força e na recuperação muscular.", is_kit: false, enabled: false, redirect_url: "", promo_price_cents: null, show_promo: false, clicks: 0, profile: "performance", profileLabel: "Modo Força" },
  { id: "prod-whey", name: "Recuperação Muscular", category: "suplemento_oral", description: "Proteína e aminoácidos para o músculo se recuperar após o treino.", is_kit: false, enabled: false, redirect_url: "", promo_price_cents: null, show_promo: false, clicks: 0, profile: "performance", profileLabel: "Modo Força" },
  { id: "kit-performance", name: "Kit Treino Completo", category: "kit_mensal", description: "Creatina + recuperação juntas para evoluir no treino.", support_text: "Treinos mais fortes e recuperação mais rápida.", is_kit: true, enabled: false, redirect_url: "", price_cents: 17990, promo_price_cents: null, show_promo: false, clicks: 0, profile: "performance", profileLabel: "Modo Força" },
  // Modo Metabolismo Ativo
  { id: "prod-termogenico", name: "Metabolismo em Dia", category: "suplemento_oral", description: "Apoio natural para o controle de peso.", is_kit: false, enabled: false, redirect_url: "", promo_price_cents: null, show_promo: false, clicks: 0, profile: "emagrecimento", profileLabel: "Modo Metabolismo Ativo" },
  { id: "prod-saciedade", name: "Controle da Fome", category: "suplemento_oral", description: "Fibras que dão saciedade e ajudam a segurar a fome.", is_kit: false, enabled: false, redirect_url: "", promo_price_cents: null, show_promo: false, clicks: 0, profile: "emagrecimento", profileLabel: "Modo Metabolismo Ativo" },
  { id: "kit-emagrece", name: "Kit Metabolismo Ativo", category: "kit_mensal", description: "A dupla que apoia o corpo a trabalhar a favor da dieta.", support_text: "Corpo trabalhando a favor da dieta, com fome controlada.", is_kit: true, enabled: false, redirect_url: "", price_cents: 13990, promo_price_cents: null, show_promo: false, clicks: 0, profile: "emagrecimento", profileLabel: "Modo Metabolismo Ativo" },
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
  allowsPromo: false, // recurso premium: promoção exclusiva do Enterprise
  allowsKits: true,
};

// Plano Enterprise — usado para testar o recurso premium de promoção.
export const MOCK_PLAN_ENTERPRISE = {
  name: "Enterprise",
  price_monthly_cents: 39700,
  max_products: 99,
  max_leads_per_month: 100000,
  custom_domain: true,
  allowsPromo: true, // recurso premium ativo
  allowsKits: true,
};

// Seletor de planos disponíveis na demo (trocar entre Pro e Enterprise)
export const MOCK_PLANS = [MOCK_PLAN, MOCK_PLAN_ENTERPRISE];

export const MOCK_SUBSCRIPTION = {
  status: "active",
  current_period_end: new Date(now + 12 * DAY).toISOString(),
  trial: true,
  trial_days_remaining: 12,
  billing_history: [
    { date: iso(30), type: "trial_start", amount_cents: 0, description: "Início do período de teste (30 dias)" },
  ],
};