import { useState } from "react";
import { Building2, AtSign, Phone, User, Key, Save, Loader2 as LoaderIcon, CheckCircle2 } from "lucide-react";
import { MOCK_TENANT, MOCK_AUTH_USER } from "./mockData";

// Face 2.8 — Configuração: dados da conta da marca + usuário.
export function TenantConfiguration() {
  const [form, setForm] = useState({
    name: MOCK_TENANT.name,
    slug: MOCK_TENANT.slug,
    email: MOCK_AUTH_USER.email,
    whatsapp: MOCK_TENANT.whatsapp,
  });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || "seudominio.com";

  const save = (field: string) => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  const changePassword = () => {
    if (password.length < 6) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPassword("");
      alert("Senha atualizada com sucesso!");
    }, 600);
  };

  const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  return (
    <div className="space-y-6 max-w-3xl" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
            Configuração
          </h1>
          <p className="text-stone-500 mt-1">Dados da sua marca e da conta do painel</p>
        </div>
        {saved && (
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200">
            <CheckCircle2 size={16} /> Salvo
          </span>
        )}
      </div>

      {/* Identidade da marca */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-5 flex items-center gap-2">
          <Building2 size={20} className="text-amber-500" />
          Identidade da Marca
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Nome da marca</label>
            <div className="flex gap-3">
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
              <button onClick={() => save("name")} className="shrink-0 px-4 py-3 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
                {saving ? <LoaderIcon size={16} className="animate-spin" /> : <Save size={16} />} Salvar
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Subdomínio do funil</label>
            <div className="flex items-center gap-3">
              <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className={inputCls} />
              <span className="text-stone-500 text-sm whitespace-nowrap">.{rootDomain}</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">Link público: <code className="bg-stone-100 px-1.5 py-0.5 rounded">{form.slug}.{rootDomain}</code></p>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-5 flex items-center gap-2">
          <AtSign size={20} className="text-amber-500" />
          Contato
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
              <User size={14} /> Email de contato (financeiro/notificações)
            </label>
            <div className="flex gap-3">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
              <button onClick={() => save("email")} className="shrink-0 px-4 py-3 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
                {saving ? <LoaderIcon size={16} className="animate-spin" /> : <Save size={16} />} Salvar
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
              <Phone size={14} /> WhatsApp (CTA do resultado)
            </label>
            <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, "") })} className={inputCls} maxLength={11} />
            <p className="text-xs text-stone-500 mt-2">Apenas números (DDD + número)</p>
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-5 flex items-center gap-2">
          <Key size={20} className="text-amber-500" />
          Segurança
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Usuário do painel</label>
            <p className="text-sm text-stone-500">{MOCK_AUTH_USER.email}</p>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Nova senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
            </div>
            <button onClick={changePassword} disabled={password.length < 6} className="shrink-0 px-4 py-3 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50">
              Alterar senha
            </button>
          </div>
          <p className="text-xs text-stone-500">Mínimo de 6 caracteres</p>
        </div>
      </div>
    </div>
  );
}