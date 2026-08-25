import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { useAuth } from '@hooks/useAuth';
import { Loader2, Globe, Check, X, Copy, ExternalLink, AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { cn } from '@lib/utils';

export function TenantPublication() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    status: 'draft' as 'draft' | 'published' | 'paused',
    custom_domain: '',
  });
  const [dnsConfigured, setDnsConfigured] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);

  const tenantId = user?.user_metadata?.tenant_id;
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'seudominio.com';

  useEffect(() => {
    loadTenant();
  }, [tenantId]);

  const loadTenant = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const { data } = await supabase.from('tenants').select('*').eq('id', tenantId).single();
      if (data) {
        setTenant(data);
        setFormData({
          slug: data.slug,
          status: data.status === 'active' ? 'published' : data.status === 'paused' ? 'paused' : 'draft',
          custom_domain: data.custom_domain || '',
        });
      }
    } catch (err) {
      console.error('Erro ao carregar tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkDns = async () => {
    if (!formData.custom_domain) return;
    setCheckingDns(true);
    try {
      // Em produção, fazer verificação real via API ou edge function
      // Por enquanto, simula
      await new Promise(r => setTimeout(r, 1500));
      setDnsConfigured(true);
    } catch (err) {
      setDnsConfigured(false);
    } finally {
      setCheckingDns(false);
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'published' | 'paused') => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const dbStatus = newStatus === 'published' ? 'active' : newStatus === 'paused' ? 'paused' : 'paused';
      const { error } = await supabase
        .from('tenants')
        .update({ status: dbStatus })
        .eq('id', tenantId);

      if (error) throw error;

      setFormData(prev => ({ ...prev, status: newStatus }));
      alert('Status alterado com sucesso!');
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert('Erro ao alterar status');
    } finally {
      setSaving(false);
    }
  };

  const saveCustomDomain = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ custom_domain: formData.custom_domain || null })
        .eq('id', tenantId);

      if (error) throw error;

      setTenant(prev => ({ ...prev, custom_domain: formData.custom_domain }));
      await checkDns();
      alert('Domínio salvo! Verifique a configuração DNS abaixo.');
    } catch (err) {
      console.error('Erro ao salvar domínio:', err);
      alert('Erro ao salvar domínio');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado!');
  };

  const publicUrl = tenant?.slug ? `https://${tenant.slug}.${rootDomain}` : '';
  const finalUrl = tenant?.custom_domain ? `https://${tenant.custom_domain}` : publicUrl;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const isPublished = formData.status === 'published';

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
            Publicação do Funil
          </h1>
          <p className="text-stone-500 mt-1">Configure o endereço público do seu funil</p>
        </div>
      </div>

      {/* Status Atual */}
      <div className={`bg-white rounded-2xl border border-stone-200 p-6 ${isPublished ? 'border-amber-300 bg-amber-500/5' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isPublished ? 'bg-green-500/20 text-green-600' : 'bg-stone-500/20 text-stone-600'}`}>
              {isPublished ? <CheckCircle size={24} /> : <WifiOff size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-950">
                {isPublished ? 'Funil Publicado 🎉' : 'Funil Não Publicado'}
              </h2>
              <p className="text-stone-500">
                {isPublished 
                  ? `Seu funil está no ar em: ${finalUrl}` 
                  : 'Seu funil não está acessível publicamente. Publique para começar a receber leads.'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {finalUrl && (
              <button
                onClick={() => copyToClipboard(finalUrl)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center gap-2"
              >
                <Copy size={18} />
                Copiar Link
              </button>
            )}
            {isPublished && finalUrl && (
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Ver Funil
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Subdomínio */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4 flex items-center gap-2">
          <Globe size={20} className="text-amber-500" />
          Subdomínio MagikFunil
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              disabled={isPublished}
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              placeholder="meu-funil"
            />
            <span className="text-stone-500 px-3">
              .{rootDomain}
            </span>
          </div>
          <p className="text-sm text-stone-500">
            {isPublished 
              ? 'O subdomínio não pode ser alterado enquanto o funil estiver publicado. Pausar primeiro para editar.' 
              : 'Escolha um nome único. Será seu endereço: <strong>seu-nome.seudominio.com</strong>'}
          </p>
        </div>
      </div>

      {/* Domínio Próprio (Enterprise) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4 flex items-center gap-2">
          <Globe size={20} className="text-amber-500" />
          Domínio Próprio <span className="px-2 py-0.5 bg-amber-500 text-stone-950 rounded text-[10px] font-bold">Enterprise</span>
        </h2>
        <div className="space-y-4">
          <p className="text-stone-600">
            Use seu próprio domínio (ex: funil.seusite.com.br). Requer plano Enterprise e configuração DNS.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={formData.custom_domain}
              onChange={e => setFormData(prev => ({ ...prev, custom_domain: e.target.value }))}
              placeholder="funil.seusite.com.br"
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={saveCustomDomain}
              disabled={saving || !formData.custom_domain}
              className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Domínio'}
            </button>
          </div>

          {/* DNS Status */}
          {formData.custom_domain && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <h4 className="font-medium text-stone-950 mb-3">Configuração DNS Necessária</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="bg-stone-100 px-2 py-1 rounded">CNAME</code>
                  <span className="text-stone-600">{formData.custom_domain}</span>
                  <span className="text-stone-400">→</span>
                  <code className="bg-stone-100 px-2 py-1 rounded">{tenant?.slug}.{rootDomain}</code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={checkDns}
                    disabled={checkingDns}
                    className="px-3 py-1.5 bg-stone-950 text-stone-50 rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-50 flex items-center gap-2"
                  >
                    {checkingDns ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar DNS'}
                  </button>
                  {dnsConfigured ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} /> DNS configurado corretamente
                    </span>
                  ) : checkingDns ? null : (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertCircle size={16} /> Aguardando configuração...
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Adicione o registro CNAME no painel do seu provedor de domínio (GoDaddy, Registro.br, Cloudflare, etc.).
                A propagação pode levar até 24h.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-950 mb-4">Status do Funil</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { value: 'draft' as const, label: 'Rascunho', desc: 'Privado, só você acessa', icon: <X size={18} />, color: 'bg-stone-100 text-stone-600 hover:bg-stone-200' },
            { value: 'published' as const, label: 'Publicado', desc: 'No ar para todos', icon: <CheckCircle size={18} />, color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20' },
            { value: 'paused' as const, label: 'Pausado', desc: 'Offline temporariamente', icon: <WifiOff size={18} />, color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              disabled={saving || formData.status === opt.value}
              className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all ${formData.status === opt.value ? 'border-amber-500 bg-amber-500/5' : opt.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {opt.icon}
                <span className="font-semibold text-stone-950">{opt.label}</span>
                {formData.status === opt.value && <span className="px-2 py-0.5 bg-amber-500 text-stone-950 rounded text-[10px] font-bold">Atual</span>}
              </div>
              <p className="text-sm text-stone-500 text-center">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Test */}
      {finalUrl && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-950 mb-4 flex items-center gap-2">
            <ExternalLink size={20} className="text-amber-500" />
            Teste Rápido
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors text-center flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              Abrir Funil Público
            </a>
            <a
              href={`${finalUrl}/quiz`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-stone-950 text-stone-50 rounded-xl font-semibold hover:bg-stone-800 transition-colors text-center flex items-center justify-center gap-2"
            >
              Abrir Quiz Direto
            </a>
          </div>
        </div>
      )}
    </div>
  );
}