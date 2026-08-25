import { create } from "zustand";
import { supabase } from "@lib/supabase";
import type { Profile, QuizQuestion, QuizOption, QuizAnswer } from "@packages/quiz-engine";

interface QuizState {
  questions: QuizQuestion[];
  profiles: Record<string, Profile>;
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
  trackEvent: (kind: string, payload?: Record<string, any>) => Promise<void>;
}

export const useQuiz = create<QuizState>((set, get) => ({
  questions: [],
  profiles: {},
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
      // Buscar template
      const { data: template } = await supabase
        .from("templates")
        .select("id, tenant_id")
        .eq("slug", templateSlug)
        .single();

      if (!template) throw new Error("Template não encontrado");

      // Buscar tenant do template (para events)
      const { data: templateWithTenant } = await supabase
        .from("templates")
        .select(`
          id,
          tenants!inner(id, slug)
        `)
        .eq("id", template.id)
        .single();

      const tenantId = templateWithTenant?.tenants?.id;

      // Buscar perguntas
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select(`
          *,
          quiz_options (*)
        `)
        .eq("template_id", template.id)
        .order("position");

      // Buscar perfis
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("template_id", template.id)
        .order("display_order");

      if (!questions || !profiles) throw new Error("Dados do quiz incompletos");

      const profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
      const questionsWithOptions = questions.map(q => ({
        ...q,
        options: q.quiz_options?.sort((a, b) => a.position - b.position).map(opt => ({
          text: opt.text,
          profile_ids: opt.profile_ids,
          position: opt.position,
        })) || [],
      }));

      set({
        questions: questionsWithOptions,
        profiles: profilesMap,
        currentStep: 0,
        scores: {},
        answers: [],
        loading: false,
        tenantId: tenantId,
        templateId: template.id,
        leadId: null,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Erro ao carregar quiz", loading: false });
    }
  },

  answer: (profileIds: string[]) => {
    const { currentStep, questions, answers, scores } = get();
    const question = questions[currentStep];
    const weight = question.weight || 1;

    const newScores = { ...scores };
    profileIds.forEach(pid => {
      newScores[pid] = (newScores[pid] || 0) + weight;
    });

    const newAnswers = [...answers, {
      question_id: question.id,
      option_text: question.options.find(o => o.profile_ids.some(pid => profileIds.includes(pid)))?.text || "",
      profile_ids: profileIds,
    }];

    set({ scores: newScores, answers: newAnswers });
  },

  next: () => set(state => ({ currentStep: Math.min(state.currentStep + 1, state.questions.length - 1) })),
  previous: () => set(state => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  finish: async () => {
    const { answers, scores, questions, profiles, tenantId, templateId } = get();
    
    // Calcular ranking
    const ranking = Object.entries(scores)
      .sort((a, b) => {
        const scoreDiff = b[1] - a[1];
        if (scoreDiff !== 0) return scoreDiff;
        const profileA = profiles[a[0]];
        const profileB = profiles[b[0]];
        return (profileA?.display_order || 999) - (profileB?.display_order || 999);
      })
      .map(([id]) => profiles[id])
      .filter(Boolean);

    if (ranking.length === 0) return;

    const winner = ranking[0];
    const runnerUp = ranking[1];

    // Salvar lead
    if (tenantId && templateId) {
      try {
        const { data: lead, error } = await supabase
          .from("leads")
          .insert({
            tenant_id: tenantId,
            winning_profile: winner.id,
            secondary_profile: runnerUp?.id || null,
            answers: { answers, scores },
            source_url: window.location.href,
            status: "new",
          })
          .select("id")
          .single();

        if (error) throw error;

        const leadId = lead.id;

        // Atualizar estado com leadId
        set({ leadId });

        // Registrar eventos granulares
        const events = answers.map((answer, idx) => ({
          tenant_id: tenantId,
          lead_id: leadId,
          kind: idx === 0 ? "quiz_start" : idx === answers.length - 1 ? "quiz_complete" : "quiz_question",
          product_id: null,
          profile_id: answer.profile_ids[0] || null,
          source_url: window.location.href,
          referrer: document.referrer,
          payload: { 
            question_id: questions[idx]?.id,
            option_text: answer.option_text,
            profile_ids: answer.profile_ids,
            step: idx + 1,
          },
        }));

        // Adicionar evento de recommendation_view
        events.push({
          tenant_id: tenantId,
          lead_id: leadId,
          kind: "recommendation_view",
          product_id: null,
          profile_id: ranking[0]?.id || null,
          source_url: window.location.href,
          referrer: document.referrer,
          payload: { 
            winner_profile: ranking[0]?.id,
            runner_up_profile: ranking[1]?.id,
            ranking: ranking.map(p => p.id),
          },
        });

        // Inserir todos os eventos
        await supabase.from("events").insert(events);

      } catch (err) {
        console.error("Erro ao salvar lead/eventos:", err);
      }
    }

    // Redirecionar para resultado
    // O roteamento será feito pelo componente pai
  },

  reset: () => set({
    currentStep: 0,
    scores: {},
    answers: [],
    leadId: null,
  }),

  getResult: () => {
    const { scores, profiles, answers } = get();
    const ranking = Object.entries(scores)
      .sort((a, b) => {
        const scoreDiff = b[1] - a[1];
        if (scoreDiff !== 0) return scoreDiff;
        const profileA = profiles[a[0]];
        const profileB = profiles[b[0]];
        return (profileA?.display_order || 999) - (profileB?.display_order || 999);
      })
      .map(([id]) => profiles[id])
      .filter(Boolean);
    
    return {
      winner: ranking[0] || null,
      runnerUp: ranking[1] || null,
      ranking,
      scores,
      answers,
    };
  },

  trackEvent: async (kind: string, payload?: Record<string, any>) => {
    const { tenantId, leadId } = get();
    if (!tenantId) return;
    
    await supabase.from("events").insert({
      tenant_id: tenantId,
      lead_id: leadId,
      kind,
      payload,
      source_url: window.location.href,
      referrer: document.referrer,
    });
  },
}));