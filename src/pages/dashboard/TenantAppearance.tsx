import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { useAuth } from '@hooks/useAuth';
import { Loader2, Palette, Image, Type, Save, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME, AVAILABLE_FONTS } from '@packages/theme';
import { cn } from '@lib/utils';

export function TenantAppearance() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    headline: '',
    subheadline: '',
    cta_text: '',
    primary_color: '#16A34A',
    secondary_color: '#EC4899',
    accent_color: '#F59E0B',
    primary_font: 'inter',
    display_font: 'playfair',
    logo_url: '',
    whatsapp: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const tenantId = user?.user_metadata?.tenant_id;

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
          name: data.name || '',
          headline: data.headline || DEFAULT_TENANT_THEME.headline,
          subheadline: data.subheadline || DEFAULT_TENANT_THEME.subheadline,
          cta_text: data.cta_text || DEFAULT_TENANT_THEME.ctaText,
          primary_color: data.primary_color || DEFAULT_TENANT_THEME.colors.primary,
          secondary_color: data.secondary_color || DEFAULT_TENANT_THEME.colors.secondary,
          accent_color: data.accent_color || DEFAULT_TENANT_THEME.colors.accent,
          primary_font: data.primary_font || 'inter',
          display_font: data.display_font || 'playfair',
          logo_url: data.logo_url || '',
          whatsapp: data.whatsapp || '',
        });
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
    } catch (err) {
      console.error('Erro ao carregar tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Preview em tempo real
    const previewTheme = createThemeFromTenant({ ...formData, [key]: value });
    applyTheme(previewTheme);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo deve ter no máximo 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      setFormData(prev => ({ ...prev, logo_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const saveChanges = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('tenants').update({
        name: formData.name,
        headline: formData.headline,
        subheadline: formData.subheadline,
        cta_text: formData.cta_text,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        primary_font: formData.primary_font,
        display_font: formData.display_font,
        logo_url: formData.logo_url,
        whatsapp: formData.whatsapp,
      }).eq('id', tenantId);

      if (error) throw error;

      // Aplicar tema salvo
      const savedTheme = createThemeFromTenant(formData);
      applyTheme(savedTheme);

      alert('Alterações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const exitPreview = () => {
    setPreviewMode(false);
    // Restaurar tema real do tenant
    if (tenant) {
      const realTheme = createThemeFromTenant(tenant);
      applyTheme(realTheme);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
              Preview do Funil Público
            </h2>
            <button onClick={exitPreview} className="p-2 text-stone-400 hover:text-stone-600">
              <ChevronLeft size={24} />
            </button>
          </div>
          <iframe
            src={`/f/${tenant?.slug}`}
            className="w-full h-[600px] rounded-xl border border-stone-200"
            title="Preview do funil"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
            Aparência do Funil
          </h1>
          <p className="text-stone-500 mt-1">Personalize a identidade visual do seu funil público</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const previewTheme = createThemeFromTenant(formData);
              applyTheme(previewTheme);
              setPreviewMode(true);
            }}
            className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
          >
            <Eye size={18} />
            Ver Preview
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna 1: Cores */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-950 mb-6 flex items-center gap-2">
              <Palette size={20} className="text-amber-500" />
              Paleta de Cores
            </h2>
            <div className="space-y-4">
              {[
                { key: 'primary_color', label: 'Cor Primária', desc: 'Botões principais, CTAs, destaques' },
                { key: 'secondary_color', label: 'Cor Secundária', desc: 'Elementos de apoio, badges' },
                { key: 'accent_color', label: 'Cor de Acento', desc: 'Detalhes, hover, indicadores' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-stone-700">
                    {label}
                    <span className="text-stone-400 font-normal ml-1">({formData[key]})</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData[key]}
                      onChange={e => handleColorChange(key, e.target.value)}
                      className="w-12 h-12 rounded-lg border border-stone-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData[key]}
                      onChange={e => handleColorChange(key, e.target.value)}
                      className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-xs text-stone-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tipografia */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-950 mb-6 flex items-center gap-2">
              <Type size={20} className="text-amber-500" />
              Tipografia
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Fonte de Destaque (Títulos, serif)</label>
                <select
                  value={formData.display_font}
                  onChange={e => { handleInputChange('display_font', e.target.value); handleColorChange('display_font', e.target.value); }}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {AVAILABLE_FONTS.display.map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
                <p className="text-xs text-stone-500 mt-1">Usada nos títulos grandes, nome do perfil e headline</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Fonte de Texto (Corpo, sem serifa)</label>
                <select
                  value={formData.primary_font}
                  onChange={e => { handleInputChange('primary_font', e.target.value); handleColorChange('primary_font', e.target.value); }}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {AVAILABLE_FONTS.sans.map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
                <p className="text-xs text-stone-500 mt-1">Usada em parágrafos, botões e textos de apoio</p>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-950 mb-6 flex items-center gap-2">
              <Image size={20} className="text-amber-500" />
              Logo da Marca
            </h2>
            <div className="space-y-4">
              <div className="aspect-video bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-32 object-contain" />
                ) : (
                  <div className="text-center text-stone-500 py-8">
                    <Image size={32} className="mx-auto mb-2 text-stone-300" />
                    <p>Nenhuma logo enviada</p>
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="sr-only"
                  id="logo-upload"
                />
                <button className="w-full px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors">
                  {logoPreview ? 'Alterar Logo' : 'Enviar Logo'}
                </button>
                <p className="text-xs text-stone-500 text-center">PNG/SVG/JPG • Máx. 2MB • Proporção livre</p>
              </label>
            </div>
          </div>
        </div>

        {/* Coluna 2: Textos + Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Textos */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-950 mb-6 flex items-center gap-2">
              <Type size={20} className="text-amber-500" />
              Textos do Funil
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Nome da Marca *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Farmácia Vida Natural"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Headline Principal *</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={e => handleInputChange('headline', e.target.value)}
                  placeholder="Ex: Descubra seu protocolo personalizado"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-stone-500 mt-1">Título principal que aparece no hero do funil</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Subheadline</label>
                <textarea
                  value={formData.subheadline}
                  onChange={e => handleInputChange('subheadline', e.target.value)}
                  placeholder="Ex: Responda ao quiz e receba recomendações baseadas em ciência para seu objetivo"
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
                <p className="text-xs text-stone-500 mt-1">Texto de apoio abaixo da headline</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Texto do Botão (CTA) *</label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={e => handleInputChange('cta_text', e.target.value)}
                  placeholder="Ex: Começar agora"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">WhatsApp (opcional)</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={e => handleInputChange('whatsapp', e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 11999999999"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  maxLength={11}
                />
                <p className="text-xs text-stone-500 mt-1">Apenas números (DDD + número). Usado no botão de WhatsApp do resultado.</p>
              </div>
            </div>
          </div>

          {/* Preview Mini */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-950 flex items-center gap-2">
                <Eye size={20} className="text-amber-500" />
                Preview Rápido (Hero)
              </h2>
              <button
                onClick={() => {
                  const previewTheme = createThemeFromTenant(formData);
                  applyTheme(previewTheme);
                  setPreviewMode(true);
                }}
                className="px-3 py-1.5 bg-amber-500 text-stone-950 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
              >
                Ver Completo
              </button>
            </div>
            <div className="aspect-video bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl border border-stone-200 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="relative z-10 max-w-xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-6">
                  <span>Baseado em ciência • Personalizado</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-bold text-stone-950 leading-tight mb-4" style={{ fontFamily: 'var(--font-display)', color: formData.primary_color }}>
                  {formData.headline || DEFAULT_TENANT_THEME.headline}
                </h1>
                <p className="text-lg md:text-xl text-stone-600 mb-8 max-w-xl mx-auto">
                  {formData.subheadline || DEFAULT_TENANT_THEME.subheadline}
                </p>
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold uppercase tracking-wider shadow-lg" style={{ backgroundColor: formData.primary_color, color: '#fff' }}>
                  {formData.cta_text || DEFAULT_TENANT_THEME.ctaText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => loadTenant()}
          className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
        >
          Descartar alterações
        </button>
        <button
          onClick={saveChanges}
          disabled={saving}
          className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar alterações'}
        </button>
      </div>
    </div>
  );
}