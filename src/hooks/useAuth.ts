import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  userRole: 'admin' | 'tenant_user' | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setUserRole: (role: 'admin' | 'tenant_user' | null) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      initialized: false,
      userRole: null,

      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? new Error(error.message) : null };
      },

      signUp: async (email: string, password: string, metadata?: any) => {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
        return { error: error ? new Error(error.message) : null };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, userRole: null });
      },

      initialize: async () => {
        if (get().initialized) return;
        
        const { data: { session } } = await supabase.auth.getSession();
        const role = session?.user?.user_metadata?.role || 'tenant_user';
        set({ session, user: session?.user ?? null, loading: false, initialized: true, userRole: role });

        supabase.auth.onAuthStateChange((_event: string, session: any) => {
          const role = session?.user?.user_metadata?.role || 'tenant_user';
          set({ session, user: session?.user ?? null, loading: false, userRole: role });
        });
      },

      setUser: (user: User | null) => set({ user }),
      setSession: (session: any | null) => set({ session }),
      setUserRole: (role: 'admin' | 'tenant_user' | null) => set({ userRole: role }),
    }),
    {
      name: 'magikfunil-auth',
      partialize: (state) => ({ user: state.user, session: state.session, userRole: state.userRole }),
    }
  )
);

// Hook para inicializar auth uma vez na app
export function useAuthInit() {
  const initialize = useAuth((state) => state.initialize);
  
  React.useEffect(() => {
    initialize();
  }, [initialize]);
}