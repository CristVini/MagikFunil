"use client";

import { useEffect, useState } from "react";
import {
  FileText, Users, HelpCircle, Package, ChevronRight, Plus, ArrowLeft, MessageCircleQuestion,
  X, Upload, AlertTriangle, Loader2, Trash2, Pencil, Copy, Download, Save,
} from "lucide-react";
import { supabase } from "@lib/supabase";
import { validarFunil, FUNIL_EXEMPLO, FunilJSON } from "@lib/funilImport";
import { cn } from "@lib/utils";

interface AdminProfileItem { id: string; name: string; archetype?: string; color?: string; scientific_basis?: string; expected_effect?: string; products?: { id: string; name: string }[]; key_actives?: any[]; }
interface AdminQuestionItem { id: string; text: string; options?: { id: string; text: string; profile_ids: string[] }[]; position?: number; }
interface AdminTemplate { id: string; name: string; slug: string; niche: string; description?: string; profiles?: AdminProfileItem[]; productCount?: number; tenants?: number; questions?: AdminQuestionItem[]; products?: { id: string; name: string; category: string }[]; }

// ---------- helpers ----------
function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16); });
}
const download = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ---------- Modal genérico de criação de item ----------
function CreateItemModal({ title, placeholder, extraLabel, onClose, onCreate }: {
  title: string; placeholder: string; extraLabel?: string;
  onClose: () => void; onCreate: (name: string, extra?: Record<string, any>) => void;
}) {
  const [name, setName] = useState("");
  const [extra, setExtra] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={placeholder}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          {extraLabel && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Complemento</label>
              <input value={extra} onChange={e => setExtra(e.target.value)} placeholder={extraLabel}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200">Cancelar</button>
          <button onClick={() => { if (name.trim()) { onCreate(name.trim(), extra ? { extra } : undefined); onClose(); } }}
            className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400">Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ---------- TemplateDetail: CRUD de perfis, quiz (perguntas+opções) e catálogo ----------
function TemplateDetail({ tplId, name, niche, slug, onBack, onChanged }: {
  tplId: string; name: string; niche: string; slug: string;
  onBack: () => void; onChanged: () => void;
}) {
  const [tpl, setTpl] = useState<AdminTemplate | null>(null);
  const [tab, setTab] = useState<"perfis" | "quiz" | "catalogo">("perfis");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<"perfis" | "quiz" | "catalogo" | null>(null);
  const [editProfileIdx, setEditProfileIdx] = useState<number | null>(null);
  const [editQIdx, setEditQIdx] = useState<number | null>(null);
  const [editOpt, setEditOpt] = useState<{ q: number; o: number } | null>(null);

  const load = () => {
    supabase.rpc("get_admin_template", { p_template_id: tplId }).then(({ data }: { data: any }) => {
      if (data) setTpl({
        id: data.template.id, name: data.template.name, slug: data.template.slug, niche: data.template.niche, description: data.template.description,
        profiles: data.profiles, questions: data.questions, products: data.products, productCount: (data.products || []).length,
      });
      setLoading(false);
    });
  };

  useEffect(load, [tplId]);

  const profiles = tpl?.profiles || [];
  const questions = tpl?.questions || [];
  const productsList = tpl?.products || [];

  // ----- perfis -----
  const addProfile = async (nm: string, extra?: Record<string, any>) => {
    const { data, error } = await supabase.from("profiles").insert({
      template_id: tplId, name: nm, archetype: extra?.extra || "Novo arquétipo",
      description: "A ser definido", scientific_basis: "A ser definido", expected_effect: "A ser definido",
      color: "#8B5CF6", notes: [], references: [], display_order: profiles.length + 1,
    }).select("id").single();
    if (error) { alert("Erro: " + error.message); return; }
    load();
  };

  const saveProfile = async (idx: number) => {
    const p = profiles[idx]; if (!p) return;
    await supabase.from("profiles").update({
      name: p.name, archetype: p.archetype, scientific_basis: p.scientific_basis, expected_effect: p.expected_effect, color: p.color,
    }).eq("id", p.id);
    setEditProfileIdx(null);
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Remover este perfil?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    load();
  };

  const toggleProfileProduct = async (profileId: string, productId: string, isLinked: boolean) => {
    if (isLinked) {
      await supabase.from("template_profile_products").delete().eq("profile_id", profileId).eq("product_id", productId);
    } else {
      await supabase.from("template_profile_products").insert({ template_id: tplId, profile_id: profileId, product_id: productId, position: 0, is_primary: false });
    }
    load();
  };

  // ----- quiz -----
  const addQuestion = async (nm: string) => {
    const { data, error } = await supabase.from("quiz_questions").insert({
      template_id: tplId, text: nm, position: questions.length + 1, weight: 1,
    }).select("id").single();
    if (error) { alert("Erro: " + error.message); return; }
    // cria 4 opções vazias para o usuário preencher
    for (let i = 0; i < 4; i++) {
      await supabase.from("quiz_options").insert({ question_id: data.id, text: "", profile_ids: [], position: i + 1 });
    }
    load();
  };

  const saveQuestion = async (idx: number) => {
    const q = questions[idx]; if (!q) return;
    await supabase.from("quiz_questions").update({ text: q.text }).eq("id", q.id);
    setEditQIdx(null);
  };

  const saveOption = async (qIdx: number, oIdx: number) => {
    const q = questions[qIdx]; const opt = q?.options?.[oIdx]; if (!q || !opt) return;
    await supabase.from("quiz_options").update({ text: opt.text, profile_ids: opt.profile_ids || [] }).eq("id", opt.id);
    setEditOpt(null);
    load();
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Remover esta pergunta e suas opções?")) return;
    await supabase.from("quiz_options").delete().eq("question_id", id);
    await supabase.from("quiz_questions").delete().eq("id", id);
    load();
  };

  const setOptProfile = (qIdx: number, oIdx: number, profileId: string, checked: boolean) => {
    const q = questions[qIdx];
    if (!q || !q.options) return;
    const updated = { ...q, options: q.options.map((o, i) => i === oIdx
      ? { ...o, profile_ids: checked ? Array.from(new Set([...(o.profile_ids || []), profileId])) : (o.profile_ids || []).filter(x => x !== profileId) }
      : o) };
    setTpl(prev => prev ? { ...prev, questions: prev.questions?.map((x, i) => i === qIdx ? updated : x) || [] } : prev);
  };

  // ----- produtos -----
  const addProduct = async (nm: string, extra?: Record<string, any>) => {
    const { data, error } = await supabase.from("products").insert({
      template_id: tplId, name: nm, category: extra?.extra || "suplemento_oral",
      description: "", is_kit: false, display_order: productsList.length + 1,
    }).select("id").single();
    if (error) { alert("Erro: " + error.message); return; }
    load();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Remover este produto?")) return;
    await supabase.from("template_profile_products").delete().eq("product_id", id);
    await supabase.from("tenant_products").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-stone-500">Carregando funil...</p>
        </div>
      </div>
    );
  }

  const saveTemplateMeta = async () => {
    await supabase.from("templates").update({ name: tpl?.name, slug: tpl?.slug, niche: tpl?.niche, description: tpl?.description }).eq("id", tplId);
    onChanged();
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft size={16} /> Voltar para funis
      </button>

      {/* Metadados editáveis */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome do funil</label>
            <input value={tpl?.name || ""} onChange={e => setTpl(p => p ? { ...p, name: e.target.value } : p)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Slug</label>
            <input value={tpl?.slug || ""} onChange={e => setTpl(p => p ? { ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") } : p)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nicho</label>
            <input value={tpl?.niche || ""} onChange={e => setTpl(p => p ? { ...p, niche: e.target.value } : p)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descrição</label>
            <input value={tpl?.description || ""} onChange={e => setTpl(p => p ? { ...p, description: e.target.value } : p)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={saveTemplateMeta} className="px-5 py-2.5 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
            <Save size={16} /> Salvar metadados
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200">
        {[
          { key: "perfis" as const, label: `${profiles.length} Perfis`, icon: Users },
          { key: "quiz" as const, label: `${questions.length} Perguntas`, icon: HelpCircle },
          { key: "catalogo" as const, label: `${productsList.length} Produtos`, icon: Package },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-amber-500 text-stone-950" : "border-transparent text-stone-500 hover:text-stone-800")}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* PERFIS */}
      {tab === "perfis" && (
        <div className="space-y-4">
          <button onClick={() => setShowModal("perfis")} className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
            <Plus size={16} /> Novo perfil
          </button>
          {profiles.length === 0 && <p className="text-sm text-stone-500 py-8 text-center">Nenhum perfil. Crie o primeiro.</p>}
          <div className="grid md:grid-cols-2 gap-4">
            {profiles.map((p, idx) => (
              <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
                {editProfileIdx === idx ? (
                  <>
                    <input value={p.name} onChange={e => { const np = [...profiles]; np[idx] = { ...p, name: e.target.value }; setTpl(t => t ? { ...t, profiles: np } : t); }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 text-sm" placeholder="Nome" />
                    <input value={p.archetype || ""} onChange={e => { const np = [...profiles]; np[idx] = { ...p, archetype: e.target.value }; setTpl(t => t ? { ...t, profiles: np } : t); }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 text-sm" placeholder="Arquétipo" />
                    <textarea value={p.scientific_basis || ""} rows={2} onChange={e => { const np = [...profiles]; np[idx] = { ...p, scientific_basis: e.target.value }; setTpl(t => t ? { ...t, profiles: np } : t); }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 text-xs" placeholder="Base científica" />
                    <div className="flex gap-2">
                      <input type="color" value={p.color || "#8B5CF6"} onChange={e => { const np = [...profiles]; np[idx] = { ...p, color: e.target.value }; setTpl(t => t ? { ...t, profiles: np } : t); }} className="h-10 w-14 rounded cursor-pointer" />
                      <button onClick={() => saveProfile(idx)} className="flex-1 px-3 py-2 bg-amber-500 text-stone-950 rounded-xl font-medium text-sm">Salvar perfil</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: p.color || "#8B5CF6" }} />
                      <div className="flex-1">
                        <p className="font-semibold text-stone-950">{p.name}</p>
                        {p.archetype && <p className="text-xs text-stone-500">{p.archetype}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditProfileIdx(idx)} title="Editar" className="p-2 text-stone-400 hover:text-amber-500"><Pencil size={15} /></button>
                        <button onClick={() => deleteProfile(p.id)} title="Remover" className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </div>
                    {p.scientific_basis && <p className="text-xs text-stone-600"><strong>Base científica:</strong> {p.scientific_basis}</p>}
                    <div>
                      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">Produtos deste perfil</p>
                      <div className="flex flex-wrap gap-1.5">
                        {productsList.map(pr => {
                          const isLinked = (p.products || []).some(x => x.id === pr.id);
                          return (
                            <button key={pr.id} onClick={() => toggleProfileProduct(p.id, pr.id, isLinked)}
                              className={cn("px-2 py-1 rounded-full text-xs transition-colors",
                                isLinked ? "bg-violet-500/15 text-violet-700 font-semibold" : "bg-stone-100 text-stone-500 hover:bg-stone-200")}>
                              {pr.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUIZ */}
      {tab === "quiz" && (
        <div className="space-y-4">
          <button onClick={() => setShowModal("quiz")} className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
            <Plus size={16} /> Nova pergunta
          </button>
          {questions.length === 0 && <p className="text-sm text-stone-500 py-8 text-center">Nenhuma pergunta. Crie a primeira.</p>}
          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={q.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs flex items-center justify-center font-semibold mt-1">{qIdx + 1}</span>
                  {editQIdx === qIdx ? (
                    <div className="flex-1 flex gap-2">
                      <input value={q.text} onChange={e => { const nq = [...questions]; nq[qIdx] = { ...q, text: e.target.value }; setTpl(t => t ? { ...t, questions: nq } : t); }}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 text-sm" />
                      <button onClick={() => saveQuestion(qIdx)} className="px-3 py-2 bg-amber-500 text-stone-950 rounded-xl text-sm font-medium">Salvar</button>
                    </div>
                  ) : (
                    <p className="flex-1 pt-1 text-sm text-stone-700">{q.text}</p>
                  )}
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditQIdx(qIdx)} title="Editar pergunta" className="p-2 text-stone-400 hover:text-amber-500"><Pencil size={15} /></button>
                    <button onClick={() => deleteQuestion(q.id)} title="Remover pergunta" className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>

                {/* Opções */}
                <div className="mt-4 pl-9 space-y-2">
                  {(q.options || []).map((o, oIdx) => (
                    <div key={o.id + oIdx} className="flex flex-col gap-1.5 bg-stone-50 border border-stone-100 rounded-xl p-3">
                      {editOpt?.q === qIdx && editOpt.o === oIdx ? (
                        <>
                          <div className="flex gap-2">
                            <input value={o.text} onChange={e => setOptText(qIdx, oIdx, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-950 text-sm" placeholder="Texto da opção" />
                            <button onClick={() => saveOption(qIdx, oIdx)} className="px-3 py-2 bg-amber-500 text-stone-950 rounded-lg text-xs font-medium">Salvar opção</button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {profiles.map(pf => {
                              const checked = (o.profile_ids || []).includes(pf.id);
                              return (
                                <button key={pf.id} onClick={() => setOptProfile(qIdx, oIdx, pf.id, !checked)}
                                  className={cn("px-2 py-1 rounded-full text-xs transition-colors",
                                    checked ? "bg-violet-500/15 text-violet-700 font-semibold" : "bg-white text-stone-400 border border-stone-200 hover:bg-stone-100")}>
                                  {pf.name}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm flex-1 text-stone-600">{o.text || <em className="text-stone-400">Opção sem texto</em>}</span>
                          <span className="text-xs text-stone-400 truncate max-w-40">{(o.profile_ids || []).map(id => profiles.find(pf => pf.id === id)?.name || id).join(", ") || "—"}</span>
                          <button onClick={() => setEditOpt({ q: qIdx, o: oIdx })} title="Editar opção" className="p-1.5 text-stone-400 hover:text-amber-500"><Pencil size={13} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATÁLOGO */}
      {tab === "catalogo" && (
        <div className="space-y-4">
          <button onClick={() => setShowModal("catalogo")} className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
            <Plus size={16} /> Novo produto
          </button>
          {productsList.length === 0 && <p className="text-sm text-stone-500 py-8 text-center">Nenhum produto. Crie o primeiro.</p>}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Ações</th>
                </tr></thead>
                <tbody className="divide-y divide-stone-100">
                  {productsList.map(pr => (
                    <tr key={pr.id} className="hover:bg-stone-50">
                      <td className="px-6 py-3.5 text-sm font-medium text-stone-900">{pr.name}</td>
                      <td className="px-6 py-3.5 text-sm text-stone-500 capitalize">{pr.category?.replace("_", " ")}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => deleteProduct(pr.id)} title="Remover" className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal === "perfis" && <CreateItemModal title="Novo perfil" placeholder="Nome (ex: Modo Vitalidade)" extraLabel="Arquétipo" onClose={() => setShowModal(null)} onCreate={(n, e) => addProfile(n, e)} />}
      {showModal === "quiz" && <CreateItemModal title="Nova pergunta" placeholder="Texto da pergunta…" onClose={() => setShowModal(null)} onCreate={(n) => addQuestion(n)} />}
      {showModal === "catalogo" && <CreateItemModal title="Novo produto" placeholder="Nome (ex: Vitamina D3)" extraLabel="Categoria (ex: suplemento_oral)" onClose={() => setShowModal(null)} onCreate={(n, e) => addProduct(n, e)} />}
    </div>
  );

  // helper local para editar texto de opção
  function setOptText(qIdx: number, oIdx: number, val: string) {
    const q = questions[qIdx]; if (!q || !q.options) return;
    const updated = { ...q, options: q.options.map((o, i) => i === oIdx ? { ...o, text: val } : o) };
    setTpl(prev => prev ? { ...prev, questions: prev.questions?.map((x, i) => i === qIdx ? updated : x) || [] } : prev);
  }
}

// ---------- Modal de novo template ----------
function CreateTemplateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (t: { name: string; slug: string; niche: string }) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [niche, setNiche] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-950">Novo Funil (Template)</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Vendas de Suplementos"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Slug</label>
            <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="vendas-suplementos"
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

// ---------- Modal de importar funil (colar JSON → validar → grava no banco) ----------
function ImportFunilModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [parsed, setParsed] = useState<FunilJSON | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleImport = async () => {
    if (!parsed) return;
    setSaving(true);
    try {
      // 1. cria o template
      const { data: tpl, error: terr } = await supabase.from("templates").insert({
        name: parsed.meta?.nome || "Funil Importado", slug: parsed.meta?.slug || `funil-${Date.now()}`,
        niche: parsed.meta?.nicho || "Geral", description: parsed.meta?.descricao, is_active: true, version: 1,
      }).select("id").single();
      if (terr || !tpl) throw terr || new Error("template");
      const tid = tpl.id;

      // 2. perfis: mapeia id string -> novo uuid
      const idMap: Record<string, string> = {};
      for (const p of (parsed.perfis || [])) {
        const pid = p.id || uuid();
        const { data: row } = await supabase.from("profiles").insert({
          template_id: tid, name: p.nome || "Perfil", archetype: p.arquetipo || "Novo arquétipo",
          description: "", scientific_basis: p.base_cientifica || "A ser definido", expected_effect: "",
          color: p.cor || "#8B5CF6", notes: [], references: p.referencias || [], display_order: Object.keys(idMap).length + 1,
        }).select("id").single();
        if (row) idMap[pid] = row.id;
      }

      // 3. produtos
      const prodIdMap: Record<string, string> = {};
      for (const pr of (parsed.produtos || [])) {
        const pid = pr.id || uuid();
        const { data: row } = await supabase.from("products").insert({
          template_id: tid, name: pr.nome || "Produto", category: pr.categoria || "suplemento_oral",
          description: pr.descricao || "", is_kit: false, display_order: Object.keys(prodIdMap).length + 1,
        }).select("id").single();
        if (row) prodIdMap[pid] = row.id;
      }

      // 4. quiz: perguntas + opções (mapeando pontua string -> uuid)
      for (const [qi, q] of (parsed.quiz || []).entries()) {
        const { data: qrow } = await supabase.from("quiz_questions").insert({
          template_id: tid, text: q.pergunta || "Pergunta", position: qi + 1, weight: 1,
        }).select("id").single();
        if (!qrow) continue;
        for (const [oi, o] of (q.opcoes || []).entries()) {
          const profileIds = (o.pontua || []).map(pid => idMap[pid]).filter(Boolean);
          await supabase.from("quiz_options").insert({ question_id: qrow.id, text: o.texto || "", profile_ids: profileIds, position: oi + 1 });
        }
      }

      // 5. vínculos perfil <-> produto
      for (const p of (parsed.perfis || [])) {
        const pid = p.id || "";
        if (!idMap[pid]) continue;
        for (const prodRef of (p.produtos || [])) {
          const prodUuid = prodIdMap[prodRef];
          if (!prodUuid) continue;
          await supabase.from("template_profile_products").insert({ template_id: tid, profile_id: idMap[pid], product_id: prodUuid, position: 0, is_primary: false });
        }
      }

      onImported();
      onClose();
    } catch (e: any) {
      alert("Erro ao importar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const fillExample = () => { setRaw(FUNIL_EXEMPLO); setResult(null); setParsed(null); };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-950 flex items-center gap-2"><Upload size={20} className="text-amber-500" /> Importar Funil</h2>
            <p className="text-sm text-stone-500 mt-1">Cole o JSON do funil — ele vira um Template pronto com perfis, quiz e produtos.</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>

        <div className="flex justify-end mb-2">
          <button onClick={fillExample} className="text-sm text-amber-600 hover:text-amber-500 font-medium flex items-center gap-1">
            <Upload size={14} /> Carregar exemplo
          </button>
        </div>

        <textarea value={raw} onChange={e => setRaw(e.target.value)}
          placeholder='{"meta":{"nome":"...","slug":"...","nicho":"..."},"quiz":[...],"perfis":[...],"produtos":[...]}'
          className="w-full h-56 px-4 py-3 bg-stone-900 text-stone-100 font-mono text-xs rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />

        {result && (
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-1">
            {result.valid && <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">Funil válido! Pronto para importar.</div>}
            {result.errors.map((e, i) => <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"><AlertTriangle size={14} className="shrink-0 mt-0.5" /> {e}</div>)}
            {result.warnings.map((w, i) => <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm"><AlertTriangle size={14} className="shrink-0 mt-0.5" /> {w}</div>)}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200">Cancelar</button>
          <button onClick={handleValidate} className="px-6 py-3 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 flex items-center gap-2"><AlertTriangle size={16} /> Validar</button>
          <button onClick={handleImport} disabled={!result?.valid || saving}
            className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Importar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Tela principal: lista de funis ----------
export function AdminTemplates() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [selected, setSelected] = useState<AdminTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const loadList = () => {
    supabase.rpc("get_admin_data").then(({ data }: { data: any }) => {
      if (data?.templates) {
        setTemplates(data.templates.map((t: any) => ({
          id: t.id, name: t.name, slug: t.slug, niche: t.niche,
          tenants: t.tenants, productCount: t.products, description: t.description,
        })));
      }
      setLoading(false);
    });
  };

  useEffect(loadList, []);

  const handleCreate = async (t: { name: string; slug: string; niche: string }) => {
    const { error } = await supabase.from("templates").insert({ name: t.name, slug: t.slug, niche: t.niche, is_active: true, version: 1 });
    if (error) { alert("Erro: " + error.message); return; }
    loadList();
  };

  // Duplica um funil (template + perfis + perguntas/opções + produtos + vínculos)
  const duplicate = async (tpl: AdminTemplate) => {
    if (!confirm(`Duplicar o funil "${tpl.name}"?`)) return;
    const { data: src } = await supabase.rpc("get_admin_template", { p_template_id: tpl.id });
    if (!src) return;
    const { data: newTpl, error } = await supabase.from("templates").insert({
      name: tpl.name + " (cópia)", slug: tpl.slug + "-copia", niche: tpl.niche, description: src.template?.description, is_active: true, version: 1,
    }).select("id").single();
    if (error || !newTpl) { alert("Erro: " + (error?.message || "")); return; }
    const tid = newTpl.id;
    const idMap: Record<string, string> = {};
    for (const p of (src.profiles || [])) {
      const { data: row } = await supabase.from("profiles").insert({
        template_id: tid, name: p.name, archetype: p.archetype, description: p.description, scientific_basis: p.scientific_basis,
        expected_effect: p.expected_effect, color: p.color, notes: p.notes || [], references: p.references || [], display_order: p.display_order,
      }).select("id").single();
      if (row) idMap[p.id] = row.id;
    }
    const prodMap: Record<string, string> = {};
    for (const pr of (src.products || [])) {
      const { data: row } = await supabase.from("products").insert({
        template_id: tid, name: pr.name, category: pr.category, description: pr.description, is_kit: pr.is_kit, display_order: pr.display_order,
      }).select("id").single();
      if (row) prodMap[pr.id] = row.id;
    }
    for (const q of (src.questions || [])) {
      const { data: qrow } = await supabase.from("quiz_questions").insert({ template_id: tid, text: q.text, position: q.position, weight: 1 }).select("id").single();
      if (qrow) for (const o of (q.options || [])) {
        await supabase.from("quiz_options").insert({ question_id: qrow.id, text: o.text, profile_ids: (o.profile_ids || []).map((x: string) => idMap[x]).filter(Boolean), position: o.position });
      }
    }
    // vínculos perfil <-> produto (products vem do RPC dentro de cada perfil)
    for (const p of (src.profiles || [])) {
      const pu = idMap[p.id];
      if (!pu) continue;
      for (const prodRef of (p.products || [])) {
        const prd = prodMap[prodRef];
        if (prd) await supabase.from("template_profile_products").insert({ template_id: tid, profile_id: pu, product_id: prd, position: 0, is_primary: false });
      }
    }
    loadList();
  };

  // Exporta o funil como JSON canônico
  const exportJSON = async (tpl: AdminTemplate) => {
    const { data: src } = await supabase.rpc("get_admin_template", { p_template_id: tpl.id });
    if (!src) return;
    const out: any = {
      schema_version: "1.0",
      meta: { nome: tpl.name, slug: tpl.slug, nicho: tpl.niche, descricao: src.template?.description || "" },
      quiz: (src.questions || []).map((q: any) => ({
        pergunta: q.text,
        opcoes: (q.options || []).map((o: any) => ({ texto: o.text, pontua: (o.profile_ids || []).length ? o.profile_ids : undefined })),
      })),
      perfis: (src.profiles || []).map((p: any) => ({
        id: p.id, nome: p.name, arquetipo: p.archetype, cor: p.color, base_cientifica: p.scientific_basis,
        referencias: p.references || [], produtos: (p.products || []),
      })),
      produtos: (src.products || []).map((pr: any) => ({ id: pr.id, nome: pr.name, categoria: pr.category, descricao: pr.description })),
    };
    download(`${tpl.slug}.funil.json`, JSON.stringify(out, null, 2));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este funil (template) e todo o seu conteúdo?")) return;
    const tenantIds = await tplTenantIds(id);
    if (tenantIds.length) {
      alert(`Este funil está em uso por ${tenantIds.length} tenant(s). Remova ou reassigne os tenants antes de excluir o funil.`);
      return;
    }
    const qids = (await supabase.from("quiz_questions").select("id").eq("template_id", id)).data?.map((q: any) => q.id) || [];
    if (qids.length) await supabase.from("quiz_options").delete().in("question_id", qids);
    await supabase.from("template_profile_products").delete().eq("template_id", id);
    await supabase.from("quiz_questions").delete().eq("template_id", id);
    await supabase.from("profiles").delete().eq("template_id", id);
    await supabase.from("products").delete().eq("template_id", id);
    await supabase.from("templates").delete().eq("id", id);
    loadList();
  };
  // tenant_ids que usavam este template (para limpeza em cascata)
  async function tplTenantIds(templateId: string): Promise<string[]> {
    return (await supabase.from("tenants").select("id").eq("template_id", templateId)).data?.map((t: any) => t.id) || [];
  }

  if (selected) {
    return (
      <TemplateDetail tplId={selected.id} name={selected.name} niche={selected.niche} slug={selected.slug}
        onBack={() => { setSelected(null); loadList(); }}
        onChanged={loadList} />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-stone-500">Carregando funis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>Funis</h1>
          <p className="text-stone-500 mt-1">Os templates que vendemos — edite, duplique, exporte ou importe</p>
        </div>
        <div className="flex gap-3 self-start">
          <button onClick={() => setShowImport(true)} className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center gap-2">
            <Upload size={18} /> Importar JSON
          </button>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
            <Plus size={18} /> Novo funil
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {templates.map(tpl => (
          <div key={tpl.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-amber-400 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600"><FileText size={22} /></div>
              <div className="flex gap-1">
                <button onClick={() => exportJSON(tpl)} title="Exportar JSON" className="p-2 text-stone-400 hover:text-green-500"><Download size={15} /></button>
                <button onClick={() => duplicate(tpl)} title="Duplicar" className="p-2 text-stone-400 hover:text-amber-500"><Copy size={15} /></button>
                <button onClick={() => handleDelete(tpl.id)} title="Remover" className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
            <button onClick={() => setSelected(tpl)} className="text-left w-full">
              <h3 className="text-lg font-semibold text-stone-950 group-hover:text-amber-600 transition-colors">{tpl.name}</h3>
              <p className="text-sm text-stone-500 mt-1 capitalize">{tpl.niche || "Geral"} · <code className="bg-stone-100 px-1 rounded">{tpl.slug}</code></p>
            </button>
            <div className="flex items-center gap-4 mt-4 text-sm text-stone-600">
              <span className="flex items-center gap-1.5"><Users size={15} /> {tpl.tenants ?? 0} tenants</span>
              <span className="flex items-center gap-1.5"><Package size={15} /> {tpl.productCount ?? 0} produtos</span>
            </div>
            <button onClick={() => setSelected(tpl)} className="mt-4 flex items-center gap-1 text-sm font-medium text-amber-600">
              Abrir editor <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {showCreate && <CreateTemplateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {showImport && <ImportFunilModal onClose={() => setShowImport(false)} onImported={loadList} />}
    </div>
  );
}