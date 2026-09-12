import { create } from "zustand";
import { supabase } from "@lib/supabase";

/**
 * Estado global do funil atualmente selecionado no painel do cliente.
 * O tenant pode ter vários funis; todas as telas do dashboard devem
 * operar sobre o funil ativo. `loadFunnels` busca via list_tenant_funnels.
 */
export interface TenantFunnel {
  id: string;
  tenant_id: string;
  template_id: string;
  slug: string;
  enabled: boolean;
  is_primary: boolean;
  template_name: string;
  template_niche?: string;
  template_slug: string;
  item_count?: number;
  profiles?: number;
}

interface FunnelState {
  funnels: TenantFunnel[];
  activeFunnelId: string | null;
  maxFunnels: number | null;
  loading: boolean;
  error: string | null;
  loadFunnels: () => Promise<void>;
  setActiveFunnel: (id: string) => void;
  getActive: () => TenantFunnel | null;
}

export const useFunnel = create<FunnelState>()((set, get) => ({
  funnels: [],
  activeFunnelId: null,
  maxFunnels: null,
  loading: false,
  error: null,

  loadFunnels: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.rpc("list_tenant_funnels");
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    const funnels: TenantFunnel[] = data?.funnels || [];
    const maxFunnels: number | null = data?.max_funnels ?? null;

    // seleciona o ativo atual (ou o primary, ou o primeiro)
    let active = get().activeFunnelId;
    if (!active || !funnels.some((f) => f.id === active)) {
      const primary = funnels.find((f) => f.is_primary) || funnels.find((f) => f.enabled) || funnels[0];
      active = primary?.id ?? null;
    }

    set({
      funnels,
      maxFunnels,
      activeFunnelId: active,
      loading: false,
    });
  },

  setActiveFunnel: (id: string) => set({ activeFunnelId: id }),

  getActive: () => {
    const { funnels, activeFunnelId } = get();
    return funnels.find((f) => f.id === activeFunnelId) ?? null;
  },
}));