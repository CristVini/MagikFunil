// Dados MOCK do template "encapsulados-nutraceuticos"
// Pegada inspirada no Candle: objetivos/estados de vida acolhedores,
// perguntas sobre a situação da pessoa, e protocolo de 3 produtos por situação.
import type { Profile, QuizQuestion } from "@packages/quiz-engine";

export const MOCK_TEMPLATE = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "encapsulados-nutraceuticos",
  name: "Encapsulados Nutracêuticos",
  tenant_id: "00000000-0000-0000-0000-000000000002",
};

// ============================================================
// OBJETIVOS (personas acolhedoras, inspiradas nos "Modos" do Candle)
// ============================================================
export const MOCK_PROFILES: Profile[] = [
  {
    id: "descanso",
    template_id: MOCK_TEMPLATE.id,
    name: "Modo Descansar",
    archetype: "Sono reparador e mente tranquila",
    description: "Para quem termina o dia exausto, acorda cansado e sente que a mente não desacelera à noite. O objetivo é devolver aquele sono que descansa de verdade.",
    scientific_basis: "Auxiliam o relaxamento e a chegada do sono de forma natural, com nutrientes que o corpo usa para produzir novas energias e acalmar o sistema nervoso.",
    expected_effect: "Pegar no sono mais rápido, acordar com mais vontade e sentir a mente menos acelerada com o passar dos dias.",
    references: [
      "PMID:35123456 (apoio ao relaxamento)",
      "PMID:33789012 (magnésio e bem-estar)",
      "PMID:31987654 (calmantes naturais)",
    ],
    notes: ["Magnésio", "Camomila", "Passiflora", "L-teanina"],
    color: "#6D28D9",
    display_order: 1,
  },
  {
    id: "energia",
    template_id: MOCK_TEMPLATE.id,
    name: "Modo Energizar",
    archetype: "Disposição do início ao fim do dia",
    description: "Para quem vive no cansaço, usa o café como muleta e sente que a energia acaba cedo. O objetivo é ter fôlego de verdade, sem depender de estimulantes.",
    scientific_basis: "Nutrientes que ajudam seu corpo a transformar alimento em energia de forma eficiente e a combater o cansaço físico e mental no dia a dia.",
    expected_effect: "Mais disposição pela manhã, menos cansaço no meio da tarde e aquela sensação de ter energia guardada.",
    references: [
      "PMID:32123456 (vitamina do complexo B e energia)",
      "PMID:29456789 (coenzima Q10 e disposição)",
      "PMID:30765432 (ajuda natural contra o cansaço)",
    ],
    notes: ["Complexo B", "Coenzima Q10", "Rhodiola", "Ginseng"],
    color: "#F59E0B",
    display_order: 2,
  },
  {
    id: "imunidade",
    template_id: MOCK_TEMPLATE.id,
    name: "Modo Protegido",
    archetype: "Mais forte de dentro pra fora",
    description: "Para quem sente que pega tudo, demora pra se recuperar e quer reforçar as defesas do corpo de forma natural. O objetivo é se sentir mais forte.",
    scientific_basis: "Vitaminas e minerais que fortalecem as defesas naturais do corpo e ajudam na recuperação, sempre dentro da dose diária recomendada.",
    expected_effect: "Sentir que o corpo está mais preparado para a mudança de estação e se recuperar mais rápido.",
    references: [
      "PMID:28167890 (vitamina D e defesas)",
      "PMID:28901234 (zinco e recuperação)",
      "PMID:32123456 (própolis e proteção)",
    ],
    notes: ["Vitamina D", "Zinco", "Vitamina C", "Própolis"],
    color: "#0EA5E9",
    display_order: 3,
  },
  {
    id: "digestao",
    template_id: MOCK_TEMPLATE.id,
    name: "Modo Leve",
    archetype: "Barriga tranquila e digestão confortável",
    description: "Para quem sofre com inchaço, gases e aquela sensação de estômago pesado depois de comer. O objetivo é fazer a digestão ser leve e sem desconforto.",
    scientific_basis: "Probióticos e enzimas que ajudam seu intestino a trabalhar melhor, favorecendo uma flora saudável e uma digestão mais confortável.",
    expected_effect: "Menos inchaço depois das refeições, barriga mais leve e intestino mais regular.",
    references: [
      "PMID:32123456 (probióticos e intestino)",
      "PMID:33456789 (prebióticos e digestão)",
      "PMID:28123456 (glutamina e conforto intestinal)",
    ],
    notes: ["Probióticos", "Prebióticos", "Enzimas digestivas", "Glutamina"],
    color: "#14B8A6",
    display_order: 4,
  },
  {
    id: "beleza",
    template_id: MOCK_TEMPLATE.id,
    name: "Modo Brilho",
    archetype: "Pele, cabelo e unhas com vida",
    description: "Para quem sente a pele opaca, o cabelo fraco e as unhas quebrando. O objetivo é nutrir de dentro pra fora e devolver o viço.",
    scientific_basis: "Colágeno e nutrientes que o próprio corpo usa para manter pele firme, cabelos fortes e unhas resistentes, de forma natural e gradual.",
    expected_effect: "Pele com mais viço, cabelo menos quebradiço e unhas mais fortes ao longo das semanas.",
    references: [
      "PMID:30765432 (colágeno e pele)",
      "PMID:33456789 (nutrição para pele e cabelo)",
      "PMID:29123456 (biotina e unhas)",
    ],
    notes: ["Colágeno", "Biotina", "Zinco", "Vitamina C"],
    color: "#EC4899",
    display_order: 5,
  },
  {
    id: "equilibrio",
    template_id: MOCK_TEMPLATE.id,
    name: "Modo Equilíbrio",
    archetype: "Humor estável e leveza emocional",
    description: "Para quem sente o humor oscilando, estresse acumulado e aquela sensação de 'não estou no meu eixo'. O objetivo é encontrar estabilidade e leveza.",
    scientific_basis: "Nutrientes e ervas que ajudam o corpo a lidar melhor com o estresse do dia a dia e a manter o humor mais estável, sempre como suplemento.",
    expected_effect: "Menos oscilação de humor, mais calma diante do estresse e aquela sensação de estar em equilíbrio.",
    references: [
      "PMID:30876543 (ashwagandha e estresse)",
      "PMID:29456789 (magnésio e humor)",
      "PMID:30765432 (vitex e TPM)",
    ],
    notes: ["Ashwagandha", "Magnésio", "Vitex", "Zinco"],
    color: "#8B5CF6",
    display_order: 6,
  },
  {
    id: "performance",
    template_id: MOCK_TEMPLATE.id,
    name: "Modo Força",
    archetype: "Pré-treino limpo e recuperação acelerada",
    description: "Para quem treina, quer evoluir no desempenho e sente que demora pra se recuperar. O objetivo é dar ao músculo o que ele precisa para crescer e se recuperar.",
    scientific_basis: "Nutrientes que apoiam a construção muscular, a força e a recuperação após o treino — creatina, proteínas e aminoácidos em dose adequada.",
    expected_effect: "Mais força nos treinos, menos dor após o exercício e recuperação mais rápida.",
    references: [
      "PMID:29456789 (proteína e músculo)",
      "PMID:33789012 (creatina e força)",
      "PMID:30876543 (aminoácidos e recuperação)",
    ],
    notes: ["Creatina", "Whey Protein", "BCAA", "Glutamina"],
    color: "#EF4444",
    display_order: 7,
  },
  {
    id: "emagrecimento",
    template_id: MOCK_TEMPLATE.id,
    name: "Modo Metabolismo Ativo",
    archetype: "Apoio natural para o controle de peso",
    description: "Para quem já tentou emagrecer, sente fome demais ou metabolismo lento. O objetivo é dar um apoio natural para o corpo trabalhar a favor, junto com a dieta.",
    scientific_basis: "Nutrientes que ajudam a controlar o apetite e o corpo a gastar energia de forma equilibrada, sempre como um apoio, nunca substituindo alimentação.",
    expected_effect: "Fome mais controlada, menos desejo por doces e apoio para o corpo trabalhar melhor junto com a dieta.",
    references: [
      "PMID:21270366 (chá verde e energia)",
      "PMID:25678901 (fibra e saciedade)",
      "PMID:24567890 (cromo e vontade de doce)",
    ],
    notes: ["Cafeína natural", "Fibra solúvel", "Cromo", "Inositol"],
    color: "#16A34A",
    display_order: 8,
  },
];

// ============================================================
// QUIZ — perguntas sobre a SITUAÇÃO de vida da pessoa
// ============================================================
export const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1", position: 1,
    text: "Quando você para um momento e escuta seu corpo, o que ele mais te pede?",
    options: [
      { text: "Um descanso de verdade, sem a mente acelerada", profile_ids: ["descanso"], position: 1 },
      { text: "Mais disposição pra dar conta do dia", profile_ids: ["energia"], position: 2 },
      { text: "Sentir que meu corpo está mais forte e protegido", profile_ids: ["imunidade"], position: 3 },
      { text: "Uma barriga menos estufada e mais leve", profile_ids: ["digestao"], position: 4 },
    ],
  },
  {
    id: "q2", position: 2,
    text: "Como está a sua energia quando você acorda?",
    options: [
      { text: "Acordo cansado(a), como se não tivesse dormido", profile_ids: ["descanso"], position: 1 },
      { text: "Acordo, mas logo a energia acaba", profile_ids: ["energia"], position: 2 },
      { text: "Vou levando, mas sinto falta de mais pique", profile_ids: ["energia"], position: 3 },
      { text: "Me sinto bem na maior parte do tempo", profile_ids: [], position: 4 },
    ],
  },
  {
    id: "q3", position: 3,
    text: "O que mais tem pesado na sua rotina ultimamente?",
    options: [
      { text: "Não conseguir pegar no sono ou acordar de madrugada", profile_ids: ["descanso"], position: 1 },
      { text: "Cansaço que nem o café consegue resolver", profile_ids: ["energia"], position: 2 },
      { text: "Pegar qualquer doença que aparece", profile_ids: ["imunidade"], position: 3 },
      { text: "Inchaço e desconforto depois de comer", profile_ids: ["digestao"], position: 4 },
    ],
  },
  {
    id: "q4", position: 4,
    text: "Se você pudesse mudar UMA coisa no seu corpo hoje, seria:",
    options: [
      { text: "Dormir profundamente e acordar renovado(a)", profile_ids: ["descanso"], position: 1 },
      { text: "Ter energia de sobra pra tudo", profile_ids: ["energia"], position: 2 },
      { text: "Sentir minhas defesas mais altas", profile_ids: ["imunidade"], position: 3 },
      { text: "Pele e cabelo com mais vida e brilho", profile_ids: ["beleza"], position: 4 },
    ],
  },
  {
    id: "q5", position: 5,
    text: "O que mais tem consumido sua energia ultimamente?",
    options: [
      { text: "Noites mal dormidas e preocupações", profile_ids: ["descanso", "equilibrio"], position: 1 },
      { text: "Um ritmo de vida corrido demais", profile_ids: ["energia"], position: 2 },
      { text: "Me recuperar de gripes ou resfriados", profile_ids: ["imunidade"], position: 3 },
      { text: "Estresse acumulado que mexe com meu humor", profile_ids: ["equilibrio"], position: 4 },
    ],
  },
  {
    id: "q6", position: 6,
    text: "Como você se sente na maioria das vezes, no fim do dia?",
    options: [
      { text: "Exausto(a) e com a mente acelerada", profile_ids: ["descanso"], position: 1 },
      { text: "No zero, sem energia sobrando", profile_ids: ["energia"], position: 2 },
      { text: "Com a barriga estufada e pesada", profile_ids: ["digestao"], position: 3 },
      { text: "Cansado(a), mas em equilíbrio", profile_ids: [], position: 4 },
    ],
  },
  {
    id: "q7", position: 7,
    text: "Qual dessas situações mais se parece com a sua realidade?",
    options: [
      { text: "Minha mente não desacelera quando chega a noite", profile_ids: ["descanso"], position: 1 },
      { text: "Eu começo o dia com gás, mas desmorono à tarde", profile_ids: ["energia"], position: 2 },
      { text: "Eu sempre vivo gripado ou resfriado", profile_ids: ["imunidade"], position: 3 },
      { text: "Sinto a pele e o cabelo sem vida", profile_ids: ["beleza"], position: 4 },
    ],
  },
  {
    id: "q8", position: 8,
    text: "O que você sente que está faltando no seu dia a dia?",
    options: [
      { text: "Paz e um bom descanso", profile_ids: ["descanso", "equilibrio"], position: 1 },
      { text: "Disposição e vontade", profile_ids: ["energia"], position: 2 },
      { text: "Saúde e proteção", profile_ids: ["imunidade"], position: 3 },
      { text: "Leveza e conforto", profile_ids: ["digestao", "beleza"], position: 4 },
    ],
  },
  {
    id: "q9", position: 9,
    text: "Quando olha no espelho, o que mais te incomoda?",
    options: [
      { text: "Pele opaca ou com aspecto cansado", profile_ids: ["beleza"], position: 1 },
      { text: "Cabelo fraco ou unhas quebrando", profile_ids: ["beleza"], position: 2 },
      { text: "Vontade de estar mais em forma", profile_ids: ["emagrecimento"], position: 3 },
      { text: "Não me incomodo, estou em busca de bem-estar", profile_ids: [], position: 4 },
    ],
  },
  {
    id: "q10", position: 10,
    text: "Como está a sua relação com a balança e a alimentação?",
    options: [
      { text: "Tenho dificuldade pra controlar a fome", profile_ids: ["emagrecimento"], position: 1 },
      { text: "Vivo com vontade de doce ou beliscando", profile_ids: ["emagrecimento"], position: 2 },
      { text: "Sinto que meu metabolismo é lento", profile_ids: ["emagrecimento"], position: 3 },
      { text: "Está em equilíbrio, meu foco é outro", profile_ids: [], position: 4 },
    ],
  },
  {
    id: "q11", position: 11,
    text: "Você pratica atividade física regularmente?",
    options: [
      { text: "Sim, e quero evoluir na força e na recuperação", profile_ids: ["performance"], position: 1 },
      { text: "Sim, mas sinto que demoro pra me recuperar", profile_ids: ["performance"], position: 2 },
      { text: "Quero começar e preciso de mais energia", profile_ids: ["energia"], position: 3 },
      { text: "Ainda não, mas é um desejo futuro", profile_ids: [], position: 4 },
    ],
  },
  {
    id: "q12", position: 12,
    text: "Como está o seu humor e o seu stress ultimamente?",
    options: [
      { text: "Sinto o humor oscilando com frequência", profile_ids: ["equilibrio"], position: 1 },
      { text: "O stress tem me tirado do eixo", profile_ids: ["equilibrio"], position: 2 },
      { text: "O stress atrapalha meu sono e meu descanso", profile_ids: ["descanso", "equilibrio"], position: 3 },
      { text: "Estou bem, em equilíbrio emocional", profile_ids: [], position: 4 },
    ],
  },
  {
    id: "q13", position: 13,
    text: "Se você pudesse acordar amanhã sentindo algo diferente, seria:",
    options: [
      { text: "Descansado(a) e com a mente leve", profile_ids: ["descanso"], position: 1 },
      { text: "Cheio(a) de energia e vontade", profile_ids: ["energia"], position: 2 },
      { text: "Forte e protegido(a)", profile_ids: ["imunidade"], position: 3 },
      { text: "Leve, com a barriga tranquila", profile_ids: ["digestao"], position: 4 },
    ],
  },
  {
    id: "q14", position: 14, weight: 2,
    text: "Qual dessas frases mais combina com o que você está buscando agora?",
    options: [
      { text: "\"Eu preciso descansar de verdade\"", profile_ids: ["descanso"], position: 1 },
      { text: "\"Eu preciso ter mais energia\"", profile_ids: ["energia"], position: 2 },
      { text: "\"Eu preciso me sentir mais forte\"", profile_ids: ["imunidade"], position: 3 },
      { text: "\"Eu preciso de mais leveza\"", profile_ids: ["digestao"], position: 4 },
      { text: "\"Eu quero me sentir bonito(a) por dentro e por fora\"", profile_ids: ["beleza"], position: 5 },
      { text: "\"Eu quero equilíbrio e paz de espírito\"", profile_ids: ["equilibrio"], position: 6 },
      { text: "\"Eu quero evoluir fisicamente\"", profile_ids: ["performance"], position: 7 },
      { text: "\"Eu quero cuidar melhor do meu corpo\"", profile_ids: ["emagrecimento"], position: 8 },
    ],
  },
];

// ============================================================
// PROTOCOLO — 3 produtos escolhidos para cada objetivo
// (espelhando o "ritual de 3 velas" do Candle, aplicado a encapsulados)
// ============================================================
export const MOCK_PRODUCTS_BY_PROFILE: Record<string, any[]> = {
  "descanso": [
    { id: "prod-sono", name: "Kit Sono Tranquilo", category: "suplemento_oral", description: "Para ajudar a mente a desacelerar e o corpo a entrar no ritmo certo do sono. Uma combinação calma para a noite.", image_url: null, key_actives: { Magnésio: "200mg", Camomila: "", Passiflora: "", "L-teanina": "" } },
    { id: "prod-magnesio", name: "Magnésio Relax", category: "suplemento_oral", description: "O clássico aliado do descanso. Ajuda a relaxar a musculatura e acalmar o sistema nervoso ao fim do dia.", image_url: null, key_actives: { "Magnésio quelado": "200mg", "Vit B6": "20mg" } },
    { id: "kit-noite", name: "Kit Noite Reparadora", category: "kit_mensal", description: "Os dois anteriores juntos em um protocolo de 30 dias para noites mais profundas e manhãs com mais vontade.", image_url: null, key_actives: { "Kit": "2 produtos", "Meses": "30 dias" }, promo_price_cents: 8990, show_promo: true },
  ],
  "energia": [
    { id: "prod-energia", name: "Energia do Dia", category: "suplemento_oral", description: "Nutrientes que ajudam seu corpo a transformar alimento em energia de verdade, sem depender só de café.", image_url: null, key_actives: { "Complexo B": "", "Coenzima Q10": "100mg", "Ginseng": "" } },
    { id: "prod-rodiola", name: "Disposição Natural", category: "suplemento_oral", description: "Uma ajuda natural contra o cansaço físico e mental, para os dias mais corridos.", image_url: null, key_actives: { Rhodiola: "300mg", Taurina: "" } },
    { id: "kit-dia", name: "Kit Dia Cheio", category: "kit_mensal", description: "Os dois maiores aliados da disposição em um único protocolo para enfrentar a rotina com mais gás.", image_url: null, key_actives: { "Kit": "2 produtos", "Meses": "30 dias" } },
  ],
  "imunidade": [
    { id: "prod-imuno", name: "Defesas do Corpo", category: "suplemento_oral", description: "Vitaminas e minerais que fortalecem suas defesas naturais, dentro da dose diária recomendada.", image_url: null, key_actives: { "Vit D": "2000UI", Zinco: "15mg", "Vit C": "1g", "Propolis": "" }, promo_price_cents: 13490, show_promo: true },
    { id: "prod-zinco", name: "Proteção Diária", category: "suplemento_oral", description: "Zinco e vitaminas que ajudam na recuperação e deixam o corpo mais preparado para as mudanças de estação.", image_url: null, key_actives: { Zinco: "15mg", "Vit C": "1g", "Selênio": "" } },
    { id: "kit-imuno", name: "Kit Proteção Total", category: "kit_mensal", description: "O reforço completo para sentir o corpo mais forte e protegido o mês inteiro.", image_url: null, key_actives: { "Kit": "2 produtos", "Meses": "30 dias" } },
  ],
  "digestao": [
    { id: "prod-intestino", name: "Barriga Leve", category: "suplemento_oral", description: "Probióticos e enzimas que ajudam seu intestino a trabalhar melhor e a digestão a ficar mais confortável.", image_url: null, key_actives: { "Probióticos": "25bi", "Enzimas": "", Glutamina: "5g" } },
    { id: "prod-prebiotico", name: "Flora em Equilíbrio", category: "suplemento_oral", description: "Prebióticos e fibras que alimentam as bactérias boas do intestino, promovendo leveza e regularidade.", image_url: null, key_actives: { "Prebióticos": "3g", "Fibras": "", Psyllium: "" } },
    { id: "kit-digestao", name: "Kit Leve & Equilibrado", category: "kit_mensal", description: "A dupla perfeita para dizer adeus ao inchaço e curtir as refeições sem desconforto.", image_url: null, key_actives: { "Kit": "2 produtos", "Meses": "30 dias" } },
  ],
  "beleza": [
    { id: "prod-colageno", name: "Colágeno + Brilho", category: "suplemento_oral", description: "Colágeno hidrolisado com vitamina C para ajudar a pele a ficar mais firme e luminosa.", image_url: null, key_actives: { "Colágeno": "2.5g", "Vit C": "500mg", "Biotina": "" } },
    { id: "prod-serum", name: "Sérum de Vitamina C", category: "dermocosmetico", description: "O toque externo que potencializa o cuidado: um sérum leve com vitamina C para o rosto.", image_url: null, key_actives: { "Vit C": "20%", "Ac. Ferúlico": "0.5%" } },
    { id: "kit-beleza", name: "Kit Pele de Dentro pra Fora", category: "kit_mensal", description: "O cuidado completo: colágeno por dentro e o sérum por fora, para um brilho de verdade.", image_url: null, key_actives: { "Kit": "2 produtos", "Meses": "30 dias" } },
  ],
  "equilibrio": [
    { id: "prod-equilibrio", name: "Equilíbrio do Dia", category: "suplemento_oral", description: "Uma combinação de ervas e nutrientes que ajudam o corpo a lidar melhor com o estresse do dia a dia.", image_url: null, key_actives: { Ashwagandha: "300mg", Magnésio: "200mg" } },
    { id: "prod-humor", name: "Bom Humor Natural", category: "suplemento_oral", description: "Magnésio e vitaminas que ajudam a manter o humor mais estável, principalmente naqueles dias difíceis.", image_url: null, key_actives: { "Magnésio": "200mg", "Vit B6": "20mg", Zinco: "" } },
    { id: "kit-equilibrio", name: "Kit Centro em Equilíbrio", category: "kit_mensal", description: "Para encontrar estabilidade emocional e leveza mesmo nos dias mais intensos.", image_url: null, key_actives: { "Kit": "2 produtos", "Meses": "30 dias" } },
  ],
  "performance": [
    { id: "prod-creatina", name: "Creatina Força", category: "suplemento_oral", description: "Creatina monoidratada para ajudar na força, na potência e no ganho de massa magra.", image_url: null, key_actives: { Creatina: "3g" } },
    { id: "prod-whey", name: "Recuperação Muscular", category: "suplemento_oral", description: "Proteína e aminoácidos que ajudam o músculo a se recuperar e crescer após o treino.", image_url: null, key_actives: { Whey: "25g", BCAA: "5g", Glutamina: "" } },
    { id: "kit-performance", name: "Kit Treino Completo", category: "kit_mensal", description: "Creatina + recuperação juntas para evoluir no treino e recuperar mais rápido.", image_url: null, key_actives: { "Kit": "2 produtos", "Meses": "30 dias" } },
  ],
  "emagrecimento": [
    { id: "prod-termogenico", name: "Metabolismo em Dia", category: "suplemento_oral", description: "Uma ajuda natural para o corpo gastar energia de forma equilibrada, junto com a dieta.", image_url: null, key_actives: { "Cafeína": "", "Chá verde": "", Cromo: "" } },
    { id: "prod-saciedade", name: "Controle da Fome", category: "suplemento_oral", description: "Fibras que dão saciedade e ajudam a segurar a fome entre as refeições, sem beliscar.", image_url: null, key_actives: { "Fibra solúvel": "", Psyllium: "", Cromo: "" } },
    { id: "kit-emagrece", name: "Kit Metabolismo Ativo", category: "kit_mensal", description: "A dupla que apoia seu corpo a trabalhar a favor da dieta, com fome controlada e mais energia.", image_url: null, key_actives: { "Kit": "2 produtos", "Meses": "30 dias" } },
  ],
};

// ============================================================
// ATIVOS-CHAVE (Biblioteca de Itens — Bloco 4.1)
// Dicionário de ativos usado no modal (Arquitetura de Ativos).
// Cada nota do perfil abre um modal no estilo Ingredient do Candle,
// com benefício + descrição científica + micro-CTA "Pedir este cuidado".
// ============================================================
export interface Ativo {
  name: string;
  benefit: string;
  description: string;
  scientific_basis: string;
}

export const MOCK_INGREDIENTS: Record<string, Ativo> = {
  "Magnésio": {
    name: "Magnésio",
    benefit: "Descanso",
    description: "Um dos minerais mais importantes do corpo, envolvido em centenas de reações e muito ligado ao relaxamento muscular e mental.",
    scientific_basis: "Contribui para a redução do cansaço e da fadiga, além de ajudar a manter o equilíbrio eletrolítico e o funcionamento normal do sistema nervoso.",
  },
  "Camomila": {
    name: "Camomila",
    benefit: "Calma",
    description: "Flor milenar conhecida por seu efeito relaxante e por preparar o corpo para um descanso mais profundo.",
    scientific_basis: "Tradicionalmente utilizada para apoiar o relaxamento e a qualidade do sono, com substâncias que ajudam a acalmar o organismo.",
  },
  "Passiflora": {
    name: "Passiflora",
    benefit: "Serenidade",
    description: "A flor da paixão, associada à tranquilidade e à mente menos acelerada ao fim do dia.",
    scientific_basis: "Uso tradicional como calmante natural, ajudando a reduzir a sensação de agitação e a favorecer o descanso.",
  },
  "L-teanina": {
    name: "L-teanina",
    benefit: "Foco calmo",
    description: "Aminoácido encontrado no chá verde, conhecido por gerar um estado de calma sem sonolência.",
    scientific_basis: "Apoia o relaxamento mental mantendo a vigília tranquila, beneficiando quem precisa desacelerar sem perder o equilíbrio.",
  },
  "Complexo B": {
    name: "Complexo B",
    benefit: "Energia",
    description: "Grupo de vitaminas essenciais que o corpo usa para transformar o que você come em energia.",
    scientific_basis: "As vitaminas do complexo B contribuem para o metabolismo energético normal e para a redução do cansaço e da fadiga.",
  },
  "Coenzima Q10": {
    name: "Coenzima Q10",
    benefit: "Vitalidade",
    description: "Presente naturalmente nas células, ajuda o corpo a produzir energia para a vida diária.",
    scientific_basis: "Atua como um apoio ao processo de produção de energia celular, favorecendo a disposição física.",
  },
  "Rhodiola": {
    name: "Rhodiola",
    benefit: "Resistência",
    description: "Planta adaptógena usada há séculos para ajudar o corpo a lidar com o cansaço.",
    scientific_basis: "Ajuda o corpo a se adaptar a esforços físicos e mentais, favorecendo a sensação de resistência e disposição.",
  },
  "Vitamina D": {
    name: "Vitamina D",
    benefit: "Proteção",
    description: "A 'vitamina do sol', essencial para as defesas do corpo e para o bom funcionamento como um todo.",
    scientific_basis: "Contribui para o funcionamento normal do sistema imunológico e para a manutenção de ossos e dentes saudáveis.",
  },
  "Zinco": {
    name: "Zinco",
    benefit: "Recuperação",
    description: "Mineral que apoia as defesas naturais e os processos de recuperação do organismo.",
    scientific_basis: "Contribui para o funcionamento normal do sistema imunológico e para a proteção das células contra estresses.",
  },
  "Vitamina C": {
    name: "Vitamina C",
    benefit: "Defesas",
    description: "A vitamina clássica da proteção, que ajuda o corpo a se manter forte em todas as estações.",
    scientific_basis: "Apoia o funcionamento do sistema imunológico e contribui para a proteção das células contra o estresse oxidativo.",
  },
  "Probióticos": {
    name: "Probióticos",
    benefit: "Leveza",
    description: "Bactérias boas que vivem no intestino e ajudam na digestão e no bem-estar.",
    scientific_basis: "Contribuem para o equilíbrio da flora intestinal, favorecendo uma digestão confortável.",
  },
  "Glutamina": {
    name: "Glutamina",
    benefit: "Intestino",
    description: "Aminoácido importante para a saúde do intestino e para a recuperação do corpo.",
    scientific_basis: "Nutre as células do intestino, apoiando sua integridade e o conforto digestivo.",
  },
  "Colágeno": {
    name: "Colágeno",
    benefit: "Firmeza",
    description: "A proteína que dá estrutura e sustentação à pele, unindo cabelos e unhas.",
    scientific_basis: "Os peptídeos de colágeno apoiam a elasticidade e a hidratação da pele, contribuindo para sua aparência.",
  },
  "Biotina": {
    name: "Biotina",
    benefit: "Força",
    description: "Vitaminarela que participa da manutenção de cabelos e unhas saudáveis.",
    scientific_basis: "Contribui para a manutenção de cabelos e unhas normais, apoiando a aparência saudável.",
  },
  "Ashwagandha": {
    name: "Ashwagandha",
    benefit: "Equilíbrio",
    description: "Erva adaptógena tradicional, conhecida por ajudar o corpo a encarar o estresse do dia a dia.",
    scientific_basis: "Ajuda o corpo a se adaptar ao estresse e favorece o equilíbrio emocional e a sensação de bem-estar.",
  },
  "Creatina": {
    name: "Creatina",
    benefit: "Força",
    description: "Substância que o corpo já produz e usa para gerar energia rápida nos músculos.",
    scientific_basis: "Contribui para o aumento da força e da potência em treinos de alta intensidade, apoiando o desempenho físico.",
  },
  "Cafeína": {
    name: "Cafeína",
    benefit: "Disposição",
    description: "O estimulante natural mais conhecido, que ajuda a combater a sonolência e a melhorar o foco.",
    scientific_basis: "Auxilia na melhora da atenção e do estado de alerta, favorecendo a disposição ao longo do dia.",
  },
  "Cromo": {
    name: "Cromo",
    benefit: "Equilíbrio",
    description: "Mineral que ajuda o corpo a lidar com a vontade de doce e o apetite.",
    scientific_basis: "Contribui para a manutenção dos níveis normais de glicose no sangue, ajudando a controlar a vontade de doce.",
  },
};