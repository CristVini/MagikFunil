"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { useQuiz } from "@hooks/useQuiz";
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";

export function Quiz() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { questions, currentStep, scores, answer, next, previous, finish, loading, fetchQuiz } = useQuiz();
  const [tenant, setTenant] = useState<any>(null);
  const [theme, setTheme] = useState<any>(null);
  const question = questions[currentStep];

  useEffect(() => {
    // Load tenant for theme
    supabase.from("tenants").select("*").eq("slug", slug).single().then(({ data }: { data: any }) => {
      if (data) setTenant(data);
    });
  }, [slug]);

  useEffect(() => {
    fetchQuiz(slug!);
  }, [slug]);

  if (loading || !question) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-stone-500">Preparando seu quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionClick = (profileIds: string[]) => {
    answer(profileIds);
    if (currentStep === questions.length - 1) {
      finish();
      // Navega para o resultado após responder a última pergunta
      setTimeout(() => navigate(`/f/${slug}/resultado`), 400);
    } else {
      next();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "var(--font-sans)" }}>

      {/* Progress Bar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 px-6 py-4">
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
              className="bg-amber-500 h-full origin-left transition-transform duration-500 ease-out"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        </div>
      </div>

      <main className="pt-24 pb-20 px-6" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="animate-in fade-in duration-300">
            {/* Question */}
            <h2 className="text-3xl md:text-5xl font-display font-bold text-stone-950 text-center leading-tight mb-12 px-4" style={{ fontFamily: "var(--font-display)" }}>
              {question.text}
            </h2>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {question.options.map((option, index) => (
                <button
                  key={`${currentStep}-${index}`}
                  onClick={() => handleOptionClick(option.profile_ids)}
                  disabled={false}
                  className="group relative w-full text-left p-6 md:p-8 bg-white border border-stone-200 rounded-2xl md:rounded-3xl hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-base md:text-lg text-stone-700 group-hover:text-stone-950 transition-colors leading-relaxed">
                      {option.text}
                    </span>
                    {/* Animated underline */}
                    <div className="h-[1px] w-6 bg-stone-200 group-hover:w-full group-hover:bg-amber-400 transition-[width,background-color] duration-400" />
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-12 flex justify-center md:justify-between gap-4">
              {currentStep > 0 && (
                <button
                  onClick={previous}
                  className="px-6 py-3 bg-white border border-stone-200 rounded-full text-stone-600 font-medium hover:bg-stone-50 hover:border-stone-300 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Voltar
                </button>
              )}
              {currentStep === questions.length - 1 && (
                <button
                  onClick={() => {
                    // The last answer click triggers finish via handleOptionClick
                    // This is just a visual placeholder - actual submit happens on option click
                  }}
                  className="px-8 py-3 bg-stone-950 text-stone-50 rounded-full font-semibold text-base uppercase tracking-wider hover:bg-stone-800 transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
                >
                  Selecione uma opção acima
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}