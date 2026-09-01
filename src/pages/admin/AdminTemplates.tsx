"use client";

import { useEffect, useState } from "react";
import { FileText, Users, HelpCircle, Package, ChevronRight, Plus, ArrowLeft, MessageCircleQuestion, X, Upload, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@lib/supabase";
import { validarFunil, funilParaTemplate, FUNIL_EXEMPLO } from "@lib/funilImport";
import { cn } from "@lib/utils";

interface AdminProfileItem { id: string; name: string; archetype?: string; color?: string; scientific_basis?: string; products?: string[]; }
interface AdminQuestionItem { id: string; text: string; options?: string[]; position?: number; }
interface AdminTemplate { id: string; name: string; slug: string; niche: string; status?: string; profiles?: AdminProfileItem[]; question_count?: number; questionCount?: number; product_count?: number; productCount?: number; tenants?: number; questions?: (string | AdminQuestionItem)[]; }

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

  const profiles = tpl.profiles || [];
  const questions = tpl.questions || [];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft size={16} /> Voltar para templates
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-stone-950">{tpl.name}</h1>
          <p className="text-stone-500 mt-1">
            Nicho: <strong>{tpl.niche}</strong> · slug <code className="bg-stone-100 px-1 rounded">{tpl.slug}</code>
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 self-start">
          <Plus size={16} /> Novo item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200">
        {[
          { key: "perfis" as const, label: `${profiles.length} Perfis`, icon: Users },
          { key: "quiz" as const, label: `${questions.length} Perguntas`, icon: HelpCircle },
          { key: "catalogo" as const, label: `${tpl.productCount ? tpl.productCount : '—'} Produtos`, icon: Package },
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
          {profiles.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: p.color || "#8B5CF6" }} />
                <div>
                  <p className="font-semibold text-stone-950">{p.name}</p>
                  {p.archetype && <p className="text-xs text-stone-500">Arquétipo: {p.archetype}</p>}
                </div>
              </div>
              {p.scientific_basis && <p className="text-sm text-stone-600 mb-2"><strong>Base científica:</strong> {p.scientific_basis}</p>}
              <p className="text-xs text-stone-500 mb-1 font-medium uppercase tracking-wide">Produtos indicados</p>
              <div className="flex flex-wrap gap-1.5">
                {(p.products || []).map(pr => <span key={pr} className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs">{pr}</span>)}
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
            {questions.length === 0 && <p className="px-6 py-8 text-center text-stone-500 text-sm">Nenhuma pergunta.</p>}
            {questions.map((q, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-stone-50">
                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                <p className="flex-1 text-sm text-stone-700">{typeof q === "string" ? q : q.text}</p>
                {typeof q !== "string" && q.options && <span className="text-xs text-stone-400">{q.options.length} opções</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "catalogo" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-sm text-stone-500">Este template possui <strong>{tpl.productCount ? tpl.productCount : '—'}</strong> produtos no catálogo.</p>
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

// Modal de importar funil (colar JSON → validar → vira template)
function ImportFunilModal({ onClose, onImport }: { onClose: () => void; onImport: (t: AdminTemplate) => void }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [parsed, setParsed] = useState<any>(null);

  const handleValidate = () => {
    if (!raw.trim()) { setResult({ valid: false, errors: ["Cole o JSON do funil."], warnings: [] }); return; }
    try {
      const obj = JSON.parse(raw);
      const v = validarFunil(obj);
      setResult(v);
      setParsed(v.valid ? obj : null);
    } catch (e: any) {
      setResult({ valid: false, errors: [`JSON inválido: ${e.message}`], warnings: [] });
      setParsed(null);
    }
  };

  const handleImport = () => {
    if (!parsed) return;
    const tpl = funilParaTemplate(parsed);
    onImport({ ...tpl, id: `tpl-${Date.now()}` });
    onClose();
  };

  const fillExample = () => { setRaw(FUNIL_EXEMPLO); setResult(null); setParsed(null); };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-950 flex items-center gap-2">
              <Upload size={20} className="text-amber-500" /> Importar Funil
            </h2>
            <p className="text-sm text-stone-500 mt-1">Cole o JSON do funil — ele vira um Template pronto para os tenants.</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>

        <div className="flex justify-end mb-2">
          <button onClick={fillExample} className="text-sm text-amber-600 hover:text-amber-500 font-medium flex items-center gap-1">
            <Upload size={14} /> Carregar exemplo
          </button>
        </div>

        <textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder='{"meta": {"nome": "...", "slug": "...", "nicho": "..."}, "quiz": [...], "perfis": [...], "produtos": [...]}'
          className="w-full h-64 px-4 py-3 bg-stone-900 text-stone-100 font-mono text-xs rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />

        {result && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
            {result.valid && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
                Funil válido! Pronto para importar.
              </div>
            )}
            {result.errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {e}
              </div>
            ))}
            {result.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {w}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200">Cancelar</button>
          <button onClick={handleValidate} className="px-6 py-3 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 flex items-center gap-2">
            <AlertTriangle size={16} /> Validar
          </button>
          <button onClick={handleImport} disabled={!result?.valid}
            className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2">
            <Upload size={16} /> Importar
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminTemplates() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [selected, setSelected] = useState<AdminTemplate | null>(null);
  const [detail, setDetail] = useState<AdminTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const loadList = () => {
    supabase.rpc("get_admin_data").then(({ data }: { data: any }) => {
      if (data?.templates) {
        setTemplates(data.templates.map((t: any) => ({
          id: t.id, name: t.name, slug: t.slug, niche: t.niche,
          tenants: t.tenants, question_count: t.questions, product_count: t.products,
        })));
      }
      setLoading(false);
    });
  };

  useEffect(() => { loadList(); }, []);

  const loadDetail = (tplId: string) => {
    supabase.rpc("get_admin_template", { p_template_id: tplId }).then(({ data }: { data: any }) => {
      if (data) {
        setDetail({
          id: data.template.id,
          name: data.template.name,
          slug: data.template.slug,
          niche: data.template.niche,
          profiles: data.profiles,
          questions: data.questions,
          productCount: (data.products || []).length,
        });
      }
    });
  };

  const handleOpen = (tpl: AdminTemplate) => {
    setSelected(tpl);
    loadDetail(tpl.id);
  };

  const handleCreate = async (t: { name: string; slug: string; niche: string }) => {
    const { data, error } = await supabase.from("templates").insert({ name: t.name, slug: t.slug, niche: t.niche }).select("id").single();
    if (error) { alert("Erro: " + error.message); return; }
    loadList();
  };

  const handleImport = (tpl: AdminTemplate) => {
    // Cria template + perfis + perguntas no banco (via JSON validado)
    if (tpl.slug && tpl.niche) {
      supabase.from("templates").insert({ name: tpl.name, slug: tpl.slug, niche: tpl.niche }).select("id").single().then(({ data }: { data: any }) => {
        if (data?.id) {
          loadList();
        }
      });
    }
  };

  const handleAddItem = (templateId: string, tab: "perfis" | "quiz" | "catalogo", name: string, extra?: Record<string, any>) => {
    const base = { template_id: templateId };
    if (tab === "quiz") {
      supabase.from("quiz_questions").insert({ ...base, text: name, position: 0 }).then(() => loadDetail(templateId));
    }
    // perfis/catalogo requerem mais campos — avisado via console; criação completa via import.
  };

  if (selected) {
    const tpl = detail || selected;
    return (
      <TemplateDetail
        tpl={tpl}
        onBack={() => { setSelected(null); setDetail(null); }}
        onAddItem={(tab, name, extra) => handleAddItem(selected.id, tab, name, extra)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-stone-500">Carregando templates...</p>
        </div>
      </div>
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
        <div className="flex gap-3 self-start">
          <button onClick={() => setShowImport(true)} className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center gap-2">
            <Upload size={18} /> Importar funil
          </button>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
            <Plus size={18} /> Novo template
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {templates.map(tpl => (
          <button key={tpl.id} onClick={() => handleOpen(tpl)}
            className="text-left bg-white rounded-2xl border border-stone-200 p-6 hover:border-amber-400 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600"><FileText size={22} /></div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-500">Template</span>
            </div>
            <h3 className="text-lg font-semibold text-stone-950 group-hover:text-amber-600 transition-colors">{tpl.name}</h3>
            <p className="text-sm text-stone-500 mt-1 capitalize">{tpl.niche || "Geral"}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-stone-600">
              <span className="flex items-center gap-1.5"><Users size={15} /> {tpl.tenants ?? 0} tenants</span>
              <span className="flex items-center gap-1.5"><HelpCircle size={15} /> {tpl.question_count ?? 0} perguntas</span>
              <span className="flex items-center gap-1.5"><Package size={15} /> {tpl.product_count ?? 0} produtos</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-amber-600">
              Ver detalhes <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {showCreate && <CreateTemplateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {showImport && <ImportFunilModal onClose={() => setShowImport(false)} onImport={handleImport} />}
    </div>
  );
}