import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { supabase } from '@lib/supabase';
import { Sparkles, Building2, Globe, LayoutTemplate, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'encapsulados-nutraceuticos',
    name: 'Encapsulados Nutracêuticos',
    desc: 'Quiz de perfil + catálogo de suplementos e nutracêuticos manipulados',
    emoji: '💊',
    popular: true,
  },
  {
    id: 'dermocosmeticos-face',
    name: 'Dermocosméticos Facial',
    desc: 'Quiz de pele + catálogo de cosméticos manipulados para o rosto',
    emoji: '🧴',
    popular: false,
  },
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [slug, setSlug] = useState('');
  const [templateId, setTemplateId] = useState('encapsulados-nutraceuticos');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSlugChange = (v: string) => {
    const clean = v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setSlug(clean);
  };

  const finish = async () => {
    setLoading(true);
    try {
      // Resolve o template pelo slug para obter o id (uuid)
      const { data: tpl } = await supabase
        .from("templates")
        .select("id")
        .eq("slug", templateId)
        .single();

      if (!tpl?.id) throw new Error("template");

      // Cria o tenant real com trial (RPC security definer no backend)
      const tenantId = await supabase
        .rpc("create_tenant_with_trial", {
          p_slug: slug,
          p_name: brandName,
          p_template_id: tpl.id,
        });

      if (tenantId.error) throw tenantId.error;

      // Atualiza o user com o tenant criado
      const { user: sessionUser } = useAuth.getState();
      const updatedUser = {
        ...(sessionUser || {}),
        user_metadata: {
          ...(sessionUser?.user_metadata || {}),
          tenant_id: tenantId.data,
          tenant_name: brandName,
          role: 'tenant_user',
        },
      };
      await supabase.auth.updateUser({ data: updatedUser.user_metadata });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Não foi possível criar seu funil. Verifique se o endereço já não está em uso e tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          {/* Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= i ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 text-stone-500'}`}>
                  {step > i ? <Check size={16} /> : i}
                </div>
                {i < 2 && <div className={`w-12 h-0.5 rounded ${step > i ? 'bg-amber-500' : 'bg-stone-200'}`} />}
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
            <Sparkles size={32} className="text-amber-500 inline mr-2" />
            Bem-vindo à MagikFunil
          </h1>
          <p className="text-stone-500 mt-2">Configure seu funil em 2 passos rápidos</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                  <Building2 size={16} className="text-amber-500" /> Nome da sua marca *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="Ex: Farmácia Vida Natural"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-stone-500 mt-1">Como seus clientes verão sua marca no funil</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                  <Globe size={16} className="text-amber-500" /> Endereço do seu funil
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="minha-farmacia"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-l-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="px-3 py-3 bg-stone-100 border border-l-0 border-stone-200 rounded-r-xl text-sm text-stone-500 whitespace-nowrap">.seudominio.com</span>
                </div>
                {slug && (
                  <p className="text-xs text-amber-600 mt-1">
                    Link do seu funil: <strong>{slug}.seudominio.com</strong>
                  </p>
                )}
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

              <button
                onClick={() => {
                  if (!brandName.trim()) { setError('Informe o nome da sua marca'); return; }
                  if (!slug.trim()) { setError('Informe o endereço do seu funil'); return; }
                  setError('');
                  setStep(2);
                }}
                className="w-full py-3.5 px-6 bg-stone-950 text-stone-50 rounded-xl font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
              >
                Continuar <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                <LayoutTemplate size={16} className="text-amber-500" /> Escolha um template para seu funil
              </label>
              <div className="space-y-3">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${templateId === t.id ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                  >
                    <span className="text-3xl">{t.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-stone-950">{t.name}</p>
                        {t.popular && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 rounded-full text-xs font-medium">Mais usado</span>}
                      </div>
                      <p className="text-sm text-stone-500 mt-1">{t.desc}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${templateId === t.id ? 'border-amber-500' : 'border-stone-300'}`}>
                      {templateId === t.id && <div className="w-3 h-3 rounded-full bg-amber-500" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> Voltar
                </button>
                <button
                  onClick={finish}
                  disabled={loading}
                  className="flex-1 py-3.5 px-6 bg-amber-500 text-stone-950 rounded-xl font-semibold uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {loading ? 'Criando seu funil...' : 'Criar meu funil'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}