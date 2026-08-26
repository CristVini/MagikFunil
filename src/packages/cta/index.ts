// ============================================================
// Bloco 5 — Ação (CTA plugável)
// Blueprint: "Quiz → Perfil → Prova → Ação"
// O CTA é um módulo plugável — o comprador do funil escolhe o
// destino (checkout, agendamento, formulário, WhatsApp, custom)
// por perfil. O contexto do resultado SEMPRE viaja junto na ação,
// transformando o quiz em pré-qualificação (perfil → próxima etapa).
// ============================================================

export type CTAActionType =
  | "checkout"   // redireciona para checkout com o perfil pré-selecionado
  | "schedule"   // formulário de agendamento (ex: consulta com farmacêutico)
  | "form"       // captura de lead (nome/telefone/e-mail) + CRM
  | "whatsapp"   // conversa no WhatsApp (padrão)
  | "custom";    // qualquer outra URL

export interface CTAAction {
  label: string;          // texto do botão (ex: "Garantir meu protocolo")
  type: CTAActionType;
  target: string;         // URL base do destino (link wa.me, checkout, agendamento...)
  description?: string;   // texto abaixo do botão
}

/**
 * Contexto do resultado que viaja junto na ação (pré-qualificação).
 * A próxima etapa (venda, atendimento, follow-up) já sabe o perfil
 * identificado e o score, sem precisar refazer o quiz.
 */
export interface CTAContext {
  profile: string;         // id do perfil vencedor
  profileName: string;     // nome legível (ex: "Modo Descansar")
  score: number;           // pontuação do perfil vencedor
  slug: string;            // tenant/domínio (subdomínio)
  source: "quiz";          // origem — facilita atribuição no CRM
}

/**
 * Monta a URL final da ação anexando o contexto do resultado.
 * Ex (WhatsApp): https://wa.me/5511...?text=Olá! Meu perfil é Modo Descansar...&profile=descanso&score=11
 * Ex (checkout): https://loja.exemplo.com/checkout?profile=descanso&score=11&slug=farmacia
 */
export function buildCtaDestination(action: CTAAction, ctx: CTAContext): string {
  const params = new URLSearchParams();
  params.set("profile", ctx.profile);
  params.set("profileName", ctx.profileName);
  params.set("score", String(ctx.score));
  params.set("slug", ctx.slug);
  params.set("source", ctx.source);

  // Separa a base da querystring existente, se houver
  const hasQuery = action.target.includes("?");
  const sep = hasQuery ? "&" : "?";

  switch (action.type) {
    case "whatsapp": {
      // wa.me recebe o texto com o perfil + contexto via querystring
      const text = `Olá! Fiz o quiz e meu cuidado é *${ctx.profileName}*. Gostaria de saber mais.`;
      const waParams = new URLSearchParams();
      waParams.set("text", text);
      // copia o contexto
      params.forEach((v, k) => waParams.set(k, v));
      return `${action.target}${action.target.includes("?") ? "&" : "?"}${waParams.toString()}`;
    }
    case "checkout":
    case "schedule":
    case "form":
    case "custom":
    default:
      return `${action.target}${sep}${params.toString()}`;
  }
}

/**
 * Resolve o CTA a partir da configuração do funil + perfil vencedor.
 * Se nenhuma config de CTA for encontrada, usa o WhatsApp como padrão.
 */
export function resolveCTAAction(
  config: Partial<CTAAction> | undefined,
  whatsappNumber: string | undefined,
  profileName: string
): CTAAction {
  const defaultNumber = whatsappNumber || "5511999999999";
  const defaultAction: CTAAction = {
    label: "Quero meu protocolo no WhatsApp",
    type: "whatsapp",
    target: `https://wa.me/${defaultNumber}`,
  };

  if (!config || !config.type) return defaultAction;

  return {
    label: config.label || (config.type === "checkout" ? "Finalizar meu cuidado" : "Continuar"),
    type: config.type,
    target: config.target || defaultAction.target,
    description: config.description,
  };
}