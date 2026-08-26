import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { useAuth } from '@hooks/useAuth';
import { Plus, Link2, ExternalLink, Edit, Trash2, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@lib/utils';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  key_actives: Record<string, string> | null;
}

interface TenantProduct {
  id: string;
  tenant_id: string;
  product_id: string;
  redirect_url: string;
  enabled: boolean;
  position: number;
  products: Product;
}

export function TenantProducts() {
  const { user } = useAuth();
  const [tenantProducts, setTenantProducts] = useState<TenantProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<Product | null>(null);
  const [newProductUrl, setNewProductUrl] = useState('');

  const tenantId = user?.user_metadata?.tenant_id;

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      // Carregar produtos do tenant (com redirect_url)
      const { data: tp } = await supabase
        .from('tenant_products')
        .select(`
          *,
          products (*)
        `)
        .eq('tenant_id', tenantId)
        .order('position');

      // Carregar todos os produtos disponíveis do template
      const { data: templateId } = await supabase
        .from('tenants')
        .select('template_id')
        .eq('id', tenantId)
        .single();

      if (templateId?.template_id) {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('template_id', templateId.template_id)
          .order('display_order');
        
        setAvailableProducts(products || []);
      }

      setTenantProducts((tp || []).map((t: any) => ({ ...t, products: t.products as Product })));
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async (tp: TenantProduct) => {
    setSaving(tp.id);
    try {
      await supabase
        .from('tenant_products')
        .update({ enabled: !tp.enabled })
        .eq('id', tp.id);
      
      setTenantProducts(prev => prev.map(p => 
        p.id === tp.id ? { ...p, enabled: !p.enabled } : p
      ));
    } catch (err) {
      console.error('Erro ao alternar produto:', err);
    } finally {
      setSaving(null);
    }
  };

  const updateRedirectUrl = async (tp: TenantProduct, url: string) => {
    setSaving(tp.id);
    try {
      await supabase
        .from('tenant_products')
        .update({ redirect_url: url })
        .eq('id', tp.id);
      
      setTenantProducts(prev => prev.map(p => 
        p.id === tp.id ? { ...p, redirect_url: url } : p
      ));
    } catch (err) {
      console.error('Erro ao atualizar URL:', err);
    } finally {
      setSaving(null);
    }
  };

  const addProduct = async (product: Product) => {
    if (!tenantId) return;
    
    setSaving(product.id);
    try {
      const maxPos = Math.max(...tenantProducts.map(p => p.position), 0);
      const { error } = await supabase
        .from('tenant_products')
        .insert({
          tenant_id: tenantId,
          product_id: product.id,
          redirect_url: newProductUrl,
          enabled: true,
          position: maxPos + 1,
        });

      if (!error) {
        await loadData();
        setShowModal(null);
        setNewProductUrl('');
      }
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
    } finally {
      setSaving(null);
    }
  };

  const removeProduct = async (tpId: string) => {
    setSaving(tpId);
    try {
      await supabase.from('tenant_products').delete().eq('id', tpId);
      setTenantProducts(prev => prev.filter(p => p.id !== tpId));
    } catch (err) {
      console.error('Erro ao remover produto:', err);
    } finally {
      setSaving(null);
    }
  };

  const getActivatedProductIds = () => tenantProducts.map(p => p.product_id);

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
            Meus Produtos
          </h1>
          <p className="text-stone-500 mt-1">
            Ative os produtos do catálogo e cole o link de venda de cada um
          </p>
        </div>
        {availableProducts.some(p => !getActivatedProductIds().includes(p.id)) && (
          <button
            onClick={() => setShowModal(availableProducts.find(p => !getActivatedProductIds().includes(p.id))!)}
            className="px-4 py-2 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar Produto
          </button>
        )}
      </div>

      {/* Produtos Ativados */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-950">
            Produtos Ativos ({tenantProducts.filter(p => p.enabled).length}/{tenantProducts.length})
          </h2>
        </div>

        {tenantProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="mb-4">Nenhum produto ativado ainda.</p>
            <button
              onClick={() => setShowModal(availableProducts[0])}
              className="px-4 py-2 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors"
            >
              Adicionar primeiro produto
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {tenantProducts.map((tp) => (
              <div key={tp.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-stone-600">
                      {tp.position}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-stone-950 truncate">{tp.products.name}</h3>
                    <p className="text-sm text-stone-500 capitalize">{tp.products.category}</p>
                    <p className="text-xs text-stone-400 mt-1 truncate max-w-xs">{tp.products.description}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 sm:flex-none">
                  {/* URL Input */}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="url"
                      value={tp.redirect_url}
                      onChange={(e) => updateRedirectUrl(tp, e.target.value)}
                      placeholder="https://seusite.com/produto"
                      disabled={saving === tp.id}
                      className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    {tp.redirect_url && (
                      <a
                        href={tp.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-stone-400 hover:text-amber-500 transition-colors"
                        title="Testar link"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>

                  {/* Toggle Ativo */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tp.enabled}
                      onChange={() => toggleProduct(tp)}
                      disabled={saving === tp.id}
                      className="sr-only peer"
                    />
                    <div className={cn(
                      'w-11 h-6 rounded-full peer transition-colors',
                      'peer-checked:bg-amber-500 peer-unchecked:bg-stone-300',
                      'peer-focus:ring-2 peer-focus:ring-amber-500 peer-focus:ring-offset-2',
                      'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed'
                    )}>
                      <span className={cn(
                        'absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        'peer-checked:translate-x-5'
                      )} />
                    </div>
                  </label>

                  {/* Remover */}
                  <button
                    onClick={() => removeProduct(tp.id)}
                    disabled={saving === tp.id}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remover produto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Produtos Disponíveis para Adicionar */}
        {availableProducts.some(p => !getActivatedProductIds().includes(p.id)) && (
          <div className="p-6 border-t border-stone-200">
            <h3 className="text-lg font-semibold text-stone-950 mb-4">
              Disponíveis no Catálogo ({availableProducts.filter(p => !getActivatedProductIds().includes(p.id)).length})
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableProducts
                .filter(p => !getActivatedProductIds().includes(p.id))
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => { setShowModal(product); setNewProductUrl(''); }}
                    className="p-4 bg-stone-50 border border-stone-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-left"
                  >
                    <h4 className="font-medium text-stone-950">{product.name}</h4>
                    <p className="text-xs text-stone-500 capitalize mt-1">{product.category}</p>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Adicionar Produto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
                Adicionar Produto
              </h3>
              <button onClick={() => setShowModal(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-stone-950">{showModal.name}</h4>
                <p className="text-sm text-stone-500 capitalize">{showModal.category}</p>
                <p className="text-sm text-stone-600 mt-1 line-clamp-2">{showModal.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Link de Venda (redirect_url) *
                </label>
                <input
                  type="url"
                  value={newProductUrl}
                  onChange={(e) => setNewProductUrl(e.target.value)}
                  placeholder="https://seusite.com/produto"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 py-2 px-4 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => addProduct(showModal)}
                  disabled={saving === showModal.id || !newProductUrl}
                  className="flex-1 py-2 px-4 bg-amber-500 text-stone-950 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {saving === showModal.id ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}