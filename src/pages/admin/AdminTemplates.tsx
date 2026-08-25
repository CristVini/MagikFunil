import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { Loader2, FileText, Brain, Plus, Search, Edit, Trash2, Eye, MoreVertical, Zap, Shield, Crown } from 'lucide-react';
import { formatCurrency } from '@lib/utils';
import { cn } from '@lib/utils';

interface Template {
  id: string;
  slug: string;
  name: string;
  niche: string;
  description: string | null;
  version: number;
  is_active: boolean;
  created_at: string;
  _count?: {
    profiles: number;
    questions: number;
    products: number;
  };
}

export function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    niche: 'farmacia-manipulacao',
    description: '',
    version: 1,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'builder'>('list');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('templates')
        .select(`
          *,
          profiles (id),
          quiz_questions (id),
          products (id)
        `)
        .order('created_at', { ascending: false });
      
      const enriched = (data || []).map(t => ({
        ...t,
        _count: {
          profiles: t.profiles?.length || 0,
          questions: t.quiz_questions?.length || 0,
          products: t.products?.length || 0,
        },
      }));
      setTemplates(enriched);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({ name: '', slug: '', niche: 'farmacia-manipulacao', description: '', version: 1, is_active: true });
    setShowCreateModal(true);
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setFormData({ name: template.name, slug: template.slug, niche: template.niche, description: template.description || '', version: template.version, is_active: template.is_active });
    setShowCreateModal(true);
  };

  const openViewModal = (template: Template) => {
    setViewingTemplate(template);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTemplate(null);
  };

  const closeViewModal = () => {
    setViewingTemplate(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      alert('Nome e slug são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('templates')
          .update({
            name: formData.name,
            niche: formData.niche,
            description: formData.description,
            version: formData.version,
            is_active: formData.is_active,
          })
          .eq('id', editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('templates')
          .insert({
            name: formData.name,
            slug: formData.slug,
            niche: formData.niche,
            description: formData.description,
            version: formData.version,
            is_active: formData.is_active,
          });
        if (error) throw error;
      }
      await loadTemplates();
      closeModal();
    } catch (err) {
      console.error('Erro ao salvar template:', err);
      alert('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (templateId: string, currentStatus: boolean) => {
    try {
      await supabase.from('templates').update({ is_active: !currentStatus }).eq('id', templateId);
      setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, is_active: !currentStatus } : t));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (search) {
      const s = search.toLowerCase();
      return t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s) || t.niche.toLowerCase().includes(s);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
            Templates
          </h1>
          <p className="text-stone-500 mt-1">Gerencie os funis disponíveis para os tenants</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openCreateModal} className="px-4 py-2 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors flex items-center gap-2">
            <Plus size={18} />
            Novo Template
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-amber-500 text-stone-950' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            Lista
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'builder' ? 'bg-amber-500 text-stone-950' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <Brain size={14} className="inline mr-1" />
            Construtor Visual
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nome, slug, nicho..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Templates Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Template</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Nicho</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Perfis</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Perguntas</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Produtos</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Versão</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">Criado</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-stone-500">Nenhum template cadastrado</td>
                    </tr>
                  ) : (
                    templates
                      .filter(t => {
                        if (search) {
                          const s = search.toLowerCase();
                          return t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s) || t.niche.toLowerCase().includes(s);
                        }
                        return true;
                      })
                      .map(template => (
                        <tr key={template.id} className="hover:bg-stone-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-stone-950">{template.name}</p>
                              <p className="text-sm text-stone-500 font-mono">{template.slug}</p>
                            </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium capitalize">
                              {template.niche.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-stone-950 font-medium">{template._count?.profiles || 0}</td>
                          <td className="px-6 py-4 text-center text-stone-950 font-medium">{template._count?.questions || 0}</td>
                          <td className="px-6 py-4 text-center text-stone-950 font-medium">{template._count?.products || 0}</td>
                          <td className="px-6 py-4 text-center text-stone-500">v{template.version}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${template.is_active ? 'bg-green-500/10 text-green-600' : 'bg-stone-500/10 text-stone-600'}`}>
                              {template.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-stone-500">
                            {new Date(template.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => openViewModal(template)} className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors mr-2" title="Visualizar">
                              <Eye size={18} />
                            </button>
                            <button onClick={() => openEditModal(template)} className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors mr-2" title="Editar">
                              <Edit size={18} />
                            </button>
                            <button className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
                Construtor Visual de Template
              </h2>
              <p className="text-stone-500 mt-2">Crie e edite templates visualmente: perfis, quiz, produtos e mapeamentos</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Sidebar: Estrutura */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-stone-50 rounded-xl p-4">
                  <h3 className="font-semibold text-stone-950 mb-3 flex items-center gap-2">
                    <Brain size={18} className="text-amber-500" />
                    Estrutura do Template
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200">
                      <Brain size={16} className="text-green-500" />
                      <span className="text-stone-700">Perfis (<span className="font-medium">0</span>)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200">
                      <Zap size={16} className="text-blue-500" />
                      <span className="text-stone-700">Quiz (<span className="font-medium">0</span> perguntas)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200">
                      <Shield size={16} className="text-purple-500" />
                      <span className="text-stone-700">Produtos (<span className="font-medium">0</span>)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200">
                      <Crown size={16} className="text-amber-500" />
                      <span className="text-stone-700">Mapeamentos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main: Editor */}
              <div className="lg:col-span-2 bg-stone-50 rounded-xl p-6 min-h-[500px]">
                <div className="text-center py-12 text-stone-500">
                  <Brain size={48} className="mx-auto mb-4 text-stone-300" />
                  <h3 className="text-xl font-semibold text-stone-950 mb-2">Construtor Visual</h3>
                  <p className="text-stone-500 mb-6">Em desenvolvimento. Aqui você poderá:</p>
                  <ul className="text-left max-w-md mx-auto space-y-2 text-stone-600">
                    <li className="flex items-center gap-2"><Check className="text-amber-500" size={18} /> Criar perfis com base científica obrigatória</li>
                    <li className="flex items-center gap-2"><Check className="text-amber-500" size={18} /> Montar quiz arrastando perguntas</li>
                    <li className="flex items-center gap-2"><Check className="text-amber-500" size={18} /> Definir produtos e ativos-chave</li>
                    <li className="flex items-center gap-2"><Check className="text-amber-500" size={18} /> Mapear perfil → produtos recomendados</li>
                    <li className="flex items-center gap-2"><Check className="text-amber-500" size={18} /> Validar base científica obrigatória</li>
                    <li className="flex items-center gap-2"><Check className="text-amber-500" size={18} /> Publicar template para tenants</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </h2>
              <button onClick={() => { setShowCreateModal(false); setEditingTemplate(null); }} className="p-1 text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="encapsulados-nutraceuticos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Nicho</label>
                <select
                  value={formData.niche}
                  onChange={e => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="farmacia-manipulacao">Farmácia de Manipulação</option>
                  <option value="nutraceuticos">Nutracêuticos</option>
                  <option value="dermocosmeticos">Dermocosméticos</option>
                  <option value="suplementos-esportivos">Suplementos Esportivos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Versão</label>
                  <input
                    type="number"
                    value={formData.version}
                    onChange={e => setFormData(prev => ({ ...prev, version: parseInt(e.target.value) || 1 }))}
                    min={1}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-stone-700">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setEditingTemplate(null); }}
                  className="flex-1 py-3 px-4 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : (editingTemplate ? 'Salvar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}