export interface QuizOption {
  text: string;
  profile_ids: string[];
  position: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  position: number;
  weight?: number;
  options: QuizOption[];
}

export interface Profile {
  id: string;
  template_id?: string;
  name: string;
  archetype: string;
  description: string;
  scientific_basis: string;
  expected_effect: string;
  references: string[];
  notes: string[];
  color: string;
  display_order: number;
}

export interface QuizAnswer {
  question_id: string;
  option_text: string;
  profile_ids: string[];
}

export interface QuizResult {
  winner: Profile;
  runner_up?: Profile;
  ranking: Profile[];
  scores: Record<string, number>;
  answers: QuizAnswer[];
}

export function calculateScores(
  answers: QuizAnswer[],
  questions: QuizQuestion[],
  profiles: Record<string, Profile>
): Record<string, number> {
  const scores: Record<string, number> = {};
  
  answers.forEach((answer) => {
    const question = questions.find(q => q.id === answer.question_id);
    const weight = question?.weight || 1;
    
    answer.profile_ids.forEach((profileId) => {
      scores[profileId] = (scores[profileId] || 0) + weight;
    });
  });
  
  return scores;
}

export function getRanking(
  scores: Record<string, number>,
  profiles: Record<string, Profile>
): Profile[] {
  const entries = Object.entries(scores);
  
  if (entries.length === 0) {
    // Fallback: retorna perfil padrão (energia-total)
    const defaultProfile = profiles['energia-total'];
    return defaultProfile ? [defaultProfile] : [];
  }
  
  // Ordena por pontuação decrescente, tie-break por display_order
  return entries
    .sort((a, b) => {
      const scoreDiff = b[1] - a[1];
      if (scoreDiff !== 0) return scoreDiff;
      const profileA = profiles[a[0]];
      const profileB = profiles[b[0]];
      return (profileA?.display_order || 999) - (profileB?.display_order || 999);
    })
    .map(([id]) => profiles[id])
    .filter(Boolean);
}

export function processQuizResult(
  answers: QuizAnswer[],
  questions: QuizQuestion[],
  profiles: Record<string, Profile>
): QuizResult {
  const scores = calculateScores(answers, questions, profiles);
  const ranking = getRanking(scores, profiles);
  
  return {
    winner: ranking[0],
    runner_up: ranking[1],
    ranking,
    scores,
    answers,
  };
}

export function validateQuizStructure(
  questions: QuizQuestion[],
  profiles: Record<string, Profile>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (questions.length === 0) {
    errors.push('Quiz deve ter pelo menos 1 pergunta');
  }
  
  if (Object.keys(profiles).length === 0) {
    errors.push('Deve haver pelo menos 1 perfil');
  }
  
  questions.forEach((q, i) => {
    if (!q.text?.trim()) {
      errors.push(`Pergunta ${i + 1}: texto é obrigatório`);
    }
    if (q.options.length === 0) {
      errors.push(`Pergunta ${i + 1}: deve ter pelo menos 1 opção`);
    }
    q.options.forEach((opt, j) => {
      if (!opt.text?.trim()) {
        errors.push(`Pergunta ${i + 1}, opção ${j + 1}: texto é obrigatório`);
      }
      if (opt.profile_ids.length === 0) {
        errors.push(`Pergunta ${i + 1}, opção ${j + 1}: deve pontuar pelo menos 1 perfil`);
      }
      opt.profile_ids.forEach((pid) => {
        if (!profiles[pid]) {
          errors.push(`Pergunta ${i + 1}, opção ${j + 1}: perfil "${pid}" não existe`);
        }
      });
    });
  });
  
  return { valid: errors.length === 0, errors };
}