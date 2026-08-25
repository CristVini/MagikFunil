import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { useQuiz } from '@hooks/useQuiz';
import { ArrowRight, ChevronLeft } from 'lucide-react';

export function Quiz() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { questions, currentStep, scores, answer, next, previous, finish, loading } = useQuiz(slug!);
  const question = questions[currentStep];

  if (loading || !question) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="animate-pulse-soft text-stone-500">Carregando quiz...</div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionClick = (profileIds: string[]) => {
    answer(profileIds);
    if (currentStep === questions.length - 1) {
      finish();
    } else {
      next();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-stone-50 border-b border-stone-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-6 bg-stone-300" />
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Pergunta {currentStep + 1} de {questions.length}
            </span>
            <div className="h-[1px] w-6 bg-stone-300" />
          </div>
          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <main className="pt-24 pb-20 px-6" style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="animate-in fade-in duration-300">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-stone-950 text-center leading-tight mb-12 px-4" style={{ fontFamily: 'var(--font-display)' }}>
              {question.text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option.profile_ids)}
                  disabled={loading}
                  className="group relative w-full text-left p-6 md:p-8 bg-white border border-stone-200 rounded-2xl hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-base md:text-lg text-stone-700 group-hover:text-stone-950 transition-colors leading-relaxed">
                      {option.text}
                    </span>
                    <div className="h-[1px] w-6 bg-stone-200 group-hover:w-full group-hover:bg-amber-400 transition-[width,background-color] duration-300" />
                  </div>
                </button>
              ))}
            </div>

            {currentStep > 0 && (
              <button
                onClick={previous}
                className="mt-8 w-full md:w-auto mx-auto md:mx-0 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-full text-stone-600 font-medium hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                <ChevronLeft size={18} />
                Voltar
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}