import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { isSupabaseConfigured } from '@lib/supabase';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-pulse-soft text-stone-500">Verificando autenticação...</div>
      </div>
    );
  }

  // Em modo demo (front-end puro), libera acesso ao dashboard sem login obrigatório
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}