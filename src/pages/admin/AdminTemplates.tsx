"use client";

import { useState } from "react";
import { FileText, Users, HelpCircle, Package, ChevronRight, Plus, ArrowLeft, MessageCircleQuestion, ClipboardList } from "lucide-react";
import { MOCK_TEMPLATES, AdminTemplate } from "./mockData";
import { cn } from "@lib/utils";

// Perguntas do quiz (mock representativo do template de encapsulados)
const MOCK_QUESTIONS = [
  "Como você quer se sentir nas próximas semanas?",
  "Qual sua maior dificuldade hoje?",
  "Como está sua energia durante o dia?",
  "Sua imunidade costuma precisar de reforço?",
  "Que tipo de descanso você deseja?",
  "Como está sua digestão?",
  "O que mais te incomoda no espelho?",
  "Qual objetivo é prioridade agora?",
  "Sua pele e cabelo pedem mais cuidado?",
  "Você sente fome fora de hora?",
  "Como você lida com o estresse?",
  "Qual rotina você quer construir?",
  "O que te impede de começar?",
  "Qual estilo de vida combina com você?",
];

function TemplateDetail({ tpl, onBack }: { tpl: AdminTemplate; onBack: () => void }) {
  const [tab, setTab] = useState<"perfis" | "quiz" | "catalogo">("perfis");

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft size={16} /> Voltar para templates
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-stone-950">{tpl.name}</h1>
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", tpl.status === "active" ? "bg-green-500/10 text-green-600" : "bg-stone-100 text-stone-600")}>
              {tpl.status === "active" ? "Em produção" : "Rascunho"}
            </span>
          </div>
          <p className="text-stone-500 mt-1">
            Nicho: <strong>{tpl.niche}</strong> · {tpl.tenants} tenants usam · slug <code className="bg-stone-100 px-1 rounded">{tpl.slug}</code>
          </p>
        </div>
        <button className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 self-start">
          <Plus size={16} /> Novo item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200">
        {[
          { key: "perfis" as const, label: `${tpl.profiles.length} Perfis`, icon: Users },
          { key: "quiz" as const, label: `${tpl.question_count} Perguntas`, icon: HelpCircle },
          { key: "catalogo" as const, label: `${tpl.product_count} Produtos`, icon: Package },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-amber-500 text-stone-950" : "border-transparent text-stone-500 hover:text-stone-800")}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "perfis" && (
        <div className="grid md:grid-cols-2 gap-4">
          {tpl.profiles.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: p.color }} />
                <div>
                  <p className="font-semibold text-stone-950">{p.name}</p>
                  <p className="text-xs text-stone-500">Arquétipo: {p.archetype}</p>
                </div>
              </div>
              <p className="text-sm text-stone-600 mb-2"><strong>Base científica:</strong> {p.scientific_basis}</p>
              <p className="text-xs text-stone-500 mb-1 font-medium uppercase tracking-wide">Produtos indicados</p>
              <div className="flex flex-wrap gap-1.5">
                {p.products.map(pr => <span key={pr} className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs">{pr}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "quiz" && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center gap-2">
            <MessageCircleQuestion size={18} className="text-amber-500" />
            <h3 className="font-semibold text-stone-950">Perguntas do quiz (ordem)</h3>
          </div>
          <div className="divide-y divide-stone-100">
            {MOCK_QUESTIONS.map((q, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-stone-50">
                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                <p className="flex-1 text-sm text-stone-700">{q}</p>
                <span className="text-xs text-stone-400">4 opções</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "catalogo" && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center gap-2">
            <ClipboardList size={18} className="text-amber-500" />
            <h3 className="font-semibold text-stone-950">Catálogo de produtos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Perfis</th>
              </tr></thead>
              <tbody className="divide-y divide-stone-100">
                {tpl.profiles.flatMap(p => p.products.map(pr => ({ pr, p }))).map(({ pr, p }, i) => (
                  <tr key={i} className="hover:bg-stone-50">
                    <td className="px-6 py-3.5 text-sm font-medium text-stone-900">{pr}</td>
                    <td className="px-6 py-3.5 text-sm text-stone-500">Suplemento oral</td>
                    <td className="px-6 py-3.5 text-sm"><span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${p.color}22`, color: p.color }}>{p.name}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminTemplates() {
  const [selected, setSelected] = useState<AdminTemplate | null>(null);

  if (selected) {
    return <TemplateDetail tpl={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
            Templates
          </h1>
          <p className="text-stone-500 mt-1">O cérebro do produto: perfis, quiz e catálogo que vendemos</p>
        </div>
        <button className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 self-start">
          <Plus size={18} /> Novo template
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {MOCK_TEMPLATES.map(tpl => (
          <button key={tpl.id} onClick={() => setSelected(tpl)}
            className="text-left bg-white rounded-2xl border border-stone-200 p-6 hover:border-amber-400 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600"><FileText size={22} /></div>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", tpl.status === "active" ? "bg-green-500/10 text-green-600" : "bg-stone-100 text-stone-500")}>
                {tpl.status === "active" ? "Em produção" : "Rascunho"}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-stone-950 group-hover:text-amber-600 transition-colors">{tpl.name}</h3>
            <p className="text-sm text-stone-500 mt-1">{tpl.niche}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-stone-600">
              <span className="flex items-center gap-1.5"><Users size={15} /> {tpl.tenants} tenants</span>
              <span className="flex items-center gap-1.5"><HelpCircle size={15} /> {tpl.question_count} perguntas</span>
              <span className="flex items-center gap-1.5"><Package size={15} /> {tpl.product_count} produtos</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-amber-600">
              Ver detalhes <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}