import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@lib/supabase";
import type { Profile, QuizQuestion, QuizAnswer } from "@packages/quiz-engine";

interface QuizState {
  questions: QuizQuestion[];
  profiles: Record<string, Profile>;
  protocol: Record<string, any[]>; // perfil -> produtos recomendados
  currentStep: number;
  scores: Record<string, number>;
  answers: QuizAnswer[];
  loading: boolean;
  error: string | null;
  tenantId: string | null;
  templateId: string | null;
  leadId: string | null;

  fetchQuiz: (templateSlug: string) => Promise<void>;
  answer: (profileIds: string[]) => void;
  next: () => void;
  previous: () => void;
  finish: () => Promise<void>;
  reset: () => void;
  getResult: () => { winner: Profile | null; runnerUp: Profile | null; ranking: Profile[]; scores: Record<string, number> };
  getRecommendedProducts: (profileId: string) => any[];
  trackEvent: (kind: string, payload?: Record<string, any>) => Promise<void>;
}

export const useQuiz = create<QuizState>((set, get) => ({
  questions: [],
  profiles: {},
  protocol: {},
  currentStep: 0,
  scores: {},
  answers: [],
  loading: true,
  error: null,
  tenantId: null,
  templateId: null,
  leadId: null,

  fetchQuiz: async (templateSlug: string) => {
    set({ loading: true, error: null });
    try {
      // Busca tudo do funil via RPC get_funnel (uma chamada)
      const { data: funnel, error: funnelError } = await supabase
        .rpc("get_funnel", { p_template_slug: templateSlug });

      if (funnelError) throw funnelError;
      if (!funnel || funnel.error === "template_not_found") throw new Error("Template não encontrado");

      // Monta perfis (key = uuid)
      const profilesMap: Record<string, Profile> = {};
      (funnel.profiles as any[] || []).forEach((p: any) => { profilesMap[p.id] = p as Profile; });

      // Monta protocolo: perfil (uuid) -> produtos
      const protocol: Record<string, any[]> = {};
      (funnel.protocol as any[] || []).forEach((pr: any) => {
        protocol[pr.profile_id] = pr.products || [];
      });

      set({
        questions: (funnel.questions as any[]) || [],
        profiles: profilesMap,
        protocol,
        templateId: funnel.template?.id,
        tenantId: null,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Erro ao carregar quiz", loading: false });
    }
  },

  answer: (profileIds: string[]) => {
    const { currentStep, scores, answers, questions } = get();
    const question = questions[currentStep];
    if (!question) return;

    const newScores = { ...scores };
    profileIds.forEach((pid) => {
      newScores[pid] = (newScores[pid] || 0) + (question.weight || 1);
    });

    const newAnswers = [
      ...answers,
      {
        question_id: question.id,
        option_text: profileIds.join(","),
        profile_ids: profileIds,
        step: currentStep,
      },
    ];

    set({ scores: newScores, answers: newAnswers });
  },

  next: () => {
    const { questions } = get();
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, questions.length - 1) }));
  },

  previous: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  finish: async () => {
    const { answers, scores, tenantId, templateId, leadId } = get();
    try {
      const result = get().getResult();

      let finalLeadId = leadId;
      if (!finalLeadId && tenantId && isSupabaseConfigured) {
        const { data: lead } = await supabase
          .from("leads")
          .insert({
            tenant_id: tenantId,
            template_id: templateId,
            winner_profile: result.winner?.id,
            scores,
            answers,
          })
          .select("id")
          .single();
        finalLeadId = lead?.id;
      }

      await get().trackEvent("quiz_complete", {
        winner_profile: result.winner?.id,
        scores,
      });
    } catch (err) {
      console.error("Erro ao finalizar quiz:", err);
    }
  },

  reset: () => {
    set({
      currentStep: 0,
      scores: {},
      answers: [],
      leadId: null,
      loading: false,
      error: null,
    });
  },

  getResult: () => {
    const { scores, profiles } = get();
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([id, score]) => ({ ...profiles[id], score }));

    return {
      winner: sorted[0] || null,
      runnerUp: sorted[1] || null,
      ranking: sorted,
      scores,
    };
  },

  getRecommendedProducts: (profileId: string) => {
    // Produtos do protocol resultando do get_funnel (key = uuid do perfil)
    const { protocol } = get();
    return protocol[profileId] || [];
  },

  trackEvent: async (kind: string, payload?: Record<string, any>) => {
    try {
      if (!isSupabaseConfigured) return; // sem backend: não rastreia (não trava o quiz)
      await supabase.from("events").insert({
        kind,
        payload: payload || {},
        quiz_id: get().questions[0]?.id,
      });
    } catch (err) {
      console.error("Erro ao rastrear evento:", err);
    }
  },
}));