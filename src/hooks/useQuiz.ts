import { create } from 'zustand';
import { supabase } from '@lib/supabase';
import type { Profile, QuizQuestion, QuizOption, QuizAnswer } from '@packages/quiz-engine';

interface QuizState {
  questions: QuizQuestion[];
  profiles: Record<string, Profile>;
  currentStep: number;
  scores: Record<string, number>;
  answers: QuizAnswer[];
  loading: boolean;
  error: string | null;
  
  fetchQuiz: (templateSlug: string) => Promise<void>;
  answer: (profileIds: string[]) => void;
  next: () => void;
  previous: () => void;
  finish: () => void;
  reset: () => void;
  getResult: () => { winner: Profile | null; runnerUp: Profile | null; ranking: Profile[]; scores: Record<string, number> };
}

export const useQuiz = create<QuizState>((set, get) => ({
  questions: [],
  profiles: {},
  currentStep: 0,
  scores: {},
  answers: [],
  loading: true,
  error: null,

  fetchQuiz: async (templateSlug: string) => {
    set({ loading: true, error: null });
    try {
      // Buscar template
      const { data: template } = await supabase
        .from('templates')
        .select('id')
        .eq('slug', templateSlug)
        .single();

      if (!template) throw new Error('Template não encontrado');

      // Buscar perguntas
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quiz_options (*)
        `)
        .eq('template_id', template.id)
        .order('position');

      // Buscar perfis
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('template_id', template.id)
        .order('display_order');

      if (!questions || !profiles) throw new Error('Dados do quiz incompletos');

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
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar quiz', loading: false });
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
      option_text: question.options.find(o => o.profile_ids.some(pid => profileIds.includes(pid)))?.text || '',
      profile_ids: profileIds,
    }];

    set({ scores: newScores, answers: newAnswers });
  },

  next: () => set(state => ({ currentStep: Math.min(state.currentStep + 1, state.questions.length - 1) })),
  previous: () => set(state => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  finish: () => {
    // Salvar lead + events no Supabase
    const { answers, scores, questions, profiles } = get();
    const ranking = Object.entries(scores)
      .sort((a, b) => b[1] - a[1] || (profiles[a[0]]?.display_order || 999) - (profiles[b[0]]?.display_order || 999))
      .map(([id]) => profiles[id])
      .filter(Boolean);

    // TODO: Implementar salvamento do lead e events
    console.log('Quiz finalizado:', { winner: ranking[0], runnerUp: ranking[1], ranking, scores, answers });
  },

  reset: () => set({
    currentStep: 0,
    scores: {},
    answers: [],
  }),

  getResult: () => {
    const { scores, profiles, answers } = get();
    const ranking = Object.entries(scores)
      .sort((a, b) => b[1] - a[1] || (profiles[a[0]]?.display_order || 999) - (profiles[b[0]]?.display_order || 999))
      .map(([id]) => profiles[id])
      .filter(Boolean);
    
    return {
      winner: ranking[0] || null,
      runnerUp: ranking[1] || null,
      ranking,
      scores,
    };
  },
}));