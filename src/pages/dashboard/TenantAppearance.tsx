import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { useAuth } from '@hooks/useAuth';
import { useParams } from 'react-router-dom';
import { Loader2, Palette, Image, Type, Save, Eye, ChevronLeft, ChevronRight, FolderOpen, Trash2, Undo2 } from 'lucide-react';
import { applyTheme, createThemeFromTenant, DEFAULT_TENANT_THEME, AVAILABLE_FONTS } from '@packages/theme';
import { cn } from '@lib/utils';

export function TenantAppearance() {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const tenantId = user?.user_metadata?.tenant_id;
  const STORAGE_KEY = tenantId ? `aparencia-draft-${tenantId}` : 'aparencia-draft';
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const loadDraft = (): Record<string, any> => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveDraft = (data: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  };

  const clearDraft = () => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const draft = loadDraft();
    return {
      name: '',
      headline: draft.headline || '',
      subheadline: draft.subheadline || '',
      cta_text: draft.cta_text || '',
      primary_color: draft.primary_color || '#16A34A',
      secondary_color: draft.secondary_color || '#EC4899',
      accent_color: draft.accent_color || '#F59E0B',
      primary_font: draft.primary_font || 'inter',
      display_font: draft.display_font || 'playfair',
      logo_url: draft.logo_url || '',
      whatsapp: draft.whatsapp || '',
      background_color: draft.background_color || '#FAFAF9',
      surface_color: draft.surface_color || '#FFFFFF',
      dark_background: draft.dark_background || '#020617',
      dark_surface: draft.dark_surface || '#0F172A',
      text_color: draft.text_color || '#1C1917',
      text_muted: draft.text_muted || '#78716C',
      border_color: draft.border_color || '#E7E5E4',
      content_background: draft.content_background || '#f5f5f4',
    };
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
          background_color: data.background_color || '#FAFAF9',
          surface_color: data.surface_color || '#FFFFFF',
          dark_background: data.dark_background || '#020617',
          dark_surface: data.dark_surface || '#0F172A',
          text_color: data.text_color || '#1C1917',
          text_muted: data.text_muted || '#78716C',
          border_color: data.border_color || '#E7E5E4',
          content_background: data.content_background || '#f5f5f4',
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
    saveDraft(formData);
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
        background_color: formData.background_color,
        surface_color: formData.surface_color,
        dark_background: formData.dark_background,
        dark_surface: formData.dark_surface,
        text_color: formData.text_color,
        text_muted: formData.text_muted,
        border_color: formData.border_color,
        content_background: formData.content_background,
      }).eq('id', tenantId);

      if (error) throw error;

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
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('previewTheme');
      window.sessionStorage.removeItem('previewSlug');
    }
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
                { key: 'background_color', label: 'Background Claro', desc: 'Fundo principal do funil (modo claro)' },
                { key: 'surface_color', label: 'Superfície Clara', desc: 'Cards, modais, áreas de conteúdo (modo claro)' },
                { key: 'dark_background', label: 'Background do Funil', desc: 'Fundo principal das telas públicas (Landing, Quiz, Resultado)' },
                { key: 'dark_surface', label: 'Superfície', desc: 'Cards e áreas de conteúdo (modo escuro)' },
                { key: 'text_color', label: 'Cor do Texto', desc: 'Texto principal em modo claro' },
                { key: 'text_muted', label: 'Texto Secundário', desc: 'Textos de apoio e legendas' },
                { key: 'border_color', label: 'Bordas', desc: 'Contorno de cards e inputs' },
                { key: 'content_background', label: 'Background do Conteúdo', desc: 'Fundo das seções internas do funil' },
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
        </div>

        {/* Coluna 2 */}
        <div className="lg:col-span-2 space-y-6">
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
                  if (typeof window !== 'undefined' && tenant?.slug) {
                    window.sessionStorage.setItem('previewTheme', JSON.stringify(formData));
                    window.sessionStorage.setItem('previewSlug', tenant.slug);
                  }
                  setPreviewMode(true);
                }}
                className="px-3 py-1.5 bg-amber-500 text-stone-950 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
              >
                Ver Completo
              </button>
            </div>
            <div className="aspect-video rounded-2xl border relative overflow-hidden" style={{ backgroundColor: formData.background_color || '#FAFAF9', borderColor: formData.surface_color || '#FFFFFF' }}>
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="relative z-10 max-w-xl mx-auto text-center p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: `${formData.accent_color}20`, color: formData.accent_color || '#F59E0B' }}>
                  <span>Baseado em ciência • Personalizado</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-4" style={{ fontFamily: 'var(--font-display)', color: formData.primary_color || '#16A34A' }}>
                  {formData.headline || DEFAULT_TENANT_THEME.headline}
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto" style={{ color: formData.accent_color || '#78716C' }}>
                  {formData.subheadline || DEFAULT_TENANT_THEME.subheadline}
                </p>
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold uppercase tracking-wider shadow-lg" style={{ backgroundColor: formData.primary_color || '#16A34A', color: '#fff' }}>
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
          onClick={() => {
            const lastSaved = loadDraft();
            const restored = { ...formData, ...lastSaved };
            setFormData(restored);
            const theme = createThemeFromTenant(restored);
            applyTheme(theme);
          }}
          className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center gap-2"
        >
          <Undo2 size={18} />
          Descartar alterações
        </button>
        <button
          onClick={saveChanges}
          disabled={saving}
          className="px-6 py-3 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Salvar alterações</>}
        </button>
      </div>
    </div>
  );
}