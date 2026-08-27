// ============================================================
// Formato canônico de funil ("Funil como Arquivo")
// Valida um JSON de funil e o converte num AdminTemplate.
// Equipe + IA produzem o JSON; o Admin importa.
// ============================================================

export interface FunilJSON {
  schema_version?: string;
  meta?: {
    nome?: string;
    slug?: string;
    nicho?: string;
    descricao?: string;
  };
  quiz?: {
    pergunta?: string;
    opcoes?: { texto?: string; pontua?: string[] }[];
  }[];
  perfis?: {
    id?: string;
    nome?: string;
    arquetipo?: string;
    cor?: string;
    base_cientifica?: string;
    referencias?: string[];
    produtos?: string[];
  }[];
  produtos?: {
    id?: string;
    nome?: string;
    categoria?: string;
    descricao?: string;
    ativos?: Record<string, string>;
  }[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Campos obrigatórios por seção
const REQUIRED_META = ['nome', 'slug', 'nicho'] as const;
const REQUIRED_PERFIL = ['id', 'nome'] as const;
const REQUIRED_PRODUTO = ['id', 'nome'] as const;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function validarFunil(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['O arquivo deve ser um objeto JSON.'], warnings };
  }

  const f = input as FunilJSON;

  // meta
  if (!f.meta || typeof f.meta !== 'object') {
    errors.push('Falta a seção "meta" (nome, slug, nicho).');
  } else {
    for (const k of REQUIRED_META) {
      if (!isNonEmptyString((f.meta as any)[k])) {
        errors.push(`meta.${k} é obrigatório.`);
      }
    }
  }

  // perfis
  const perfis = Array.isArray(f.perfis) ? f.perfis : [];
  if (perfis.length === 0) {
    errors.push('O funil precisa de ao menos 1 perfil em "perfis".');
  }
  const perfilIds = new Set<string>();
  perfis.forEach((p, i) => {
    for (const k of REQUIRED_PERFIL) {
      if (!isNonEmptyString((p as any)[k])) {
        errors.push(`perfis[${i}].${k} é obrigatório.`);
      }
    }
    if (isNonEmptyString(p.id)) {
      if (perfilIds.has(p.id)) warnings.push(`Perfil "${p.id}" duplicado.`);
      perfilIds.add(p.id);
      // base científica / referências são obrigatórias por compliance
      if (!isNonEmptyString(p.base_cientifica)) {
        warnings.push(`Perfil "${p.id}" sem base_cientifica (obrigatório por compliance).`);
      }
      if (!p.referencias || p.referencias.length === 0) {
        warnings.push(`Perfil "${p.id}" sem referencias PMID (obrigatório por compliance).`);
      }
    }
  });

  // produtos
  const produtos = Array.isArray(f.produtos) ? f.produtos : [];
  if (produtos.length === 0) {
    warnings.push('Nenhum produto em "produtos" — o funil terá catálogo vazio.');
  }
  const produtoIds = new Set<string>();
  produtos.forEach((p, i) => {
    for (const k of REQUIRED_PRODUTO) {
      if (!isNonEmptyString((p as any)[k])) {
        errors.push(`produtos[${i}].${k} é obrigatório.`);
      }
    }
    if (isNonEmptyString(p.id)) {
      if (produtoIds.has(p.id)) warnings.push(`Produto "${p.id}" duplicado.`);
      produtoIds.add(p.id);
    }
  });

  // quiz
  const quiz = Array.isArray(f.quiz) ? f.quiz : [];
  if (quiz.length === 0) {
    errors.push('O funil precisa de ao menos 1 pergunta em "quiz".');
  }
  quiz.forEach((q, i) => {
    if (!isNonEmptyString(q.pergunta)) {
      errors.push(`quiz[${i}].pergunta é obrigatória.`);
    }
    if (!q.opcoes || q.opcoes.length < 2) {
      errors.push(`quiz[${i}] precisa de ao menos 2 opções.`);
    } else {
      q.opcoes.forEach((o, j) => {
        if (!isNonEmptyString(o.texto)) {
          errors.push(`quiz[${i}].opcoes[${j}].texto é obrigatório.`);
        }
        if (!o.pontua || o.pontua.length === 0) {
          warnings.push(`quiz[${i}].opcoes[${j}]: sem "pontua" (não pontua nenhum perfil).`);
        } else {
          o.pontua.forEach(id => {
            if (!perfilIds.has(id)) {
              errors.push(`quiz[${i}].opcoes[${j}] pontua "${id}", mas esse perfil não existe.`);
            }
          });
        }
      });
    }
  });

  // referências de produtos nos perfis
  perfis.forEach(p => {
    (p.produtos || []).forEach(pid => {
      if (!produtoIds.has(pid)) {
        errors.push(`Perfil "${p.id}" referencia produto "${pid}" inexistente.`);
      }
    });
  });

  return { valid: errors.length === 0, errors, warnings };
}

// Converte um FunilJSON validado num AdminTemplate
export function funilParaTemplate(f: FunilJSON) {
  const perfis = (f.perfis || []).map(p => ({
    id: p.id!,
    name: p.nome!,
    archetype: p.arquetipo || '—',
    color: p.cor || '#8B5CF6',
    scientific_basis: p.base_cientifica || '',
    products: p.produtos || [],
  }));

  const produtos = f.produtos || [];

  return {
    id: `tpl-import-${Date.now()}`,
    slug: f.meta?.slug || 'funil-importado',
    name: f.meta?.nome || 'Funil Importado',
    niche: f.meta?.nicho || 'Geral',
    tenants: 0,
    status: 'draft' as const,
    profiles: perfis,
    question_count: (f.quiz || []).length,
    product_count: produtos.length,
    questions: (f.quiz || []).map(q => q.pergunta || ''),
    // mantém os dados brutos para o catálogo completo (produtos com descrição/ativos)
    catalog: produtos.map(p => ({
      id: p.id || `prod-${Date.now()}`,
      nome: p.nome || 'Produto',
      categoria: p.categoria || 'suplemento_oral',
      descricao: p.descricao || '',
      ativos: p.ativos,
    })),
  };
}

// Template de exemplo para copiar/criar funis
export const FUNIL_EXEMPLO: string = JSON.stringify({
  schema_version: "1.0",
  meta: {
    nome: "Meu Funil de Exemplo",
    slug: "meu-funil-exemplo",
    nicho: "Farmácia de manipulação",
    descricao: "Quiz de perfil para recomendação de suplementos"
  },
  quiz: [
    {
      pergunta: "O que você busca hoje?",
      opcoes: [
        { texto: "Um sono mais profundo", pontua: ["sono"] },
        { texto: "Mais energia no dia", pontua: ["energia"] }
      ]
    }
  ],
  perfis: [
    {
      id: "sono",
      nome: "Modo Descansar",
      arquetipo: "Sono & Relaxamento",
      cor: "#6D28D9",
      base_cientifica: "Magnésio e melatonina na regulação do sono",
      referencias: ["PMID 1186010"],
      produtos: ["prod-sono"]
    },
    {
      id: "energia",
      nome: "Modo Energizar",
      arquetipo: "Energia & Vitalidade",
      cor: "#F59E0B",
      base_cientifica: "Vitaminas do complexo B no metabolismo energético",
      referencias: ["PMID 2588277"],
      produtos: ["prod-energia"]
    }
  ],
  produtos: [
    {
      id: "prod-sono",
      nome: "Kit Sono",
      categoria: "suplemento_oral",
      descricao: "Blend de magnésio e melatonina",
      ativos: { "Magnésio": "200mg", "Melatonina": "0.5mg" }
    },
    {
      id: "prod-energia",
      nome: "Energia do Dia",
      categoria: "suplemento_oral",
      descricao: "Complexo B e coenzima Q10",
      ativos: { "Vitamina B12": "2.4mcg" }
    }
  ]
}, null, 2);