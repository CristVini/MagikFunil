"use client";

import { useState } from "react";
import { FileText, Users, HelpCircle, Package, ChevronRight, Plus, ArrowLeft, MessageCircleQuestion, ClipboardList, X } from "lucide-react";
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

// Modal genérico de criação de item (perfil / pergunta / produto)
function CreateItemModal({ tab, onClose, onCreate }: {
  tab: "perfis" | "quiz" | "catalogo";
  onClose: () => void;
  onCreate: (name: string, extra?: Record<string, any>) => void;
}) {
  const [name, setName] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});

  const labels: Record<string, { title: string; placeholder: string; extraLabel?: string }> = {
    perfis: { title: "Novo perfil", placeholder: "Nome do perfil (ex: Modo Vitalidade)", extraLabel: "Arquétipo (ex: Energia & Performance)" },
    quiz: { title: "Nova pergunta", placeholder: "Texto da pergunta…" },
    catalogo: { title: "Novo produto", placeholder: "Nome do produto (ex: Vitamina D3)", extraLabel: "Categoria (ex: suplemento_oral)" },
  };
  const L = labels[tab];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-950">{L.title}</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{tab === "quiz" ? "Pergunta" : "Nome"}</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={L.placeholder}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          {L.extraLabel && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Complemento</label>
              <input value={extra.extra || ""} onChange={e => setExtra({ extra: e.target.value })} placeholder={L.extraLabel}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200">Cancelar</button>
          <button onClick={() => { if (name.trim()) { onCreate(name.trim(), extra); onClose(); } }}
            className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400">Adicionar</button>
        </div>
      </div>
    </div>
  );
}

function TemplateDetail({ tpl, onBack, onAddItem }: {
  tpl: AdminTemplate;
  onBack: () => void;
  onAddItem: (tab: "perfis" | "quiz" | "catalogo", name: string, extra?: Record<string, any>) => void;
}) {
  const [tab, setTab] = useState<"perfis" | "quiz" | "catalogo">("perfis");
  const [showModal, setShowModal] = useState(false);

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
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 self-start">
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
            {tpl.questions?.map((q, i) => (
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

      {showModal && tab === "perfis" && (
        <CreateItemModal tab="perfis" onClose={() => setShowModal(false)}
          onCreate={(name, extra) => onAddItem("perfis", name, extra)} />
      )}
      {showModal && tab === "quiz" && (
        <CreateItemModal tab="quiz" onClose={() => setShowModal(false)}
          onCreate={(name) => onAddItem("quiz", name)} />
      )}
      {showModal && tab === "catalogo" && (
        <CreateItemModal tab="catalogo" onClose={() => setShowModal(false)}
          onCreate={(name, extra) => onAddItem("catalogo", name, extra)} />
      )}
    </div>
  );
}

// Modal de novo template
function CreateTemplateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (t: { name: string; slug: string; niche: string }) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [niche, setNiche] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-950">Novo Template</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Exame de Vista"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Slug</label>
            <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="exame-de-vista"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nicho</label>
            <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Ex: Farmácia de manipulação"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200">Cancelar</button>
          <button onClick={() => { if (name.trim()) { onCreate({ name: name.trim(), slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"), niche: niche.trim() }); onClose(); } }}
            className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400">Criar</button>
        </div>
      </div>
    </div>
  );
}

export function AdminTemplates() {
  const [templates, setTemplates] = useState<AdminTemplate[]>(MOCK_TEMPLATES);
  const [selected, setSelected] = useState<AdminTemplate | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = (t: { name: string; slug: string; niche: string }) => {
    const novoTemplate: AdminTemplate = {
      id: `tpl-${Date.now()}`,
      slug: t.slug || "novo-template",
      name: t.name,
      niche: t.niche || "Geral",
      tenants: 0,
      status: "draft",
      profiles: [],
      question_count: 0,
      product_count: 0,
      questions: [],
    };
    setTemplates(prev => [...prev, novoTemplate]);
  };

  const handleAddItem = (templateId: string, tab: "perfis" | "quiz" | "catalogo", name: string, extra?: Record<string, any>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const updated: AdminTemplate = { ...t, questions: t.questions ?? MOCK_QUESTIONS.slice(0, t.question_count) };
      if (tab === "perfis") {
        updated.profiles = [...updated.profiles, {
          id: `p-${Date.now()}`,
          name,
          archetype: extra?.extra || "Novo arquétipo",
          color: "#8B5CF6",
          scientific_basis: "Base científica a ser definida",
          products: [],
        }];
      } else if (tab === "quiz") {
        updated.questions = [...(updated.questions ?? []), name];
        updated.question_count += 1;
      } else {
        updated.product_count += 1;
      }
      return updated;
    }));
  };

  if (selected) {
    return (
      <TemplateDetail
        tpl={selected}
        onBack={() => setSelected(null)}
        onAddItem={(tab, name, extra) => handleAddItem(selected.id, tab, name, extra)}
      />
    );
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
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 self-start">
          <Plus size={18} /> Novo template
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {templates.map(tpl => (
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

      {showCreate && <CreateTemplateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}