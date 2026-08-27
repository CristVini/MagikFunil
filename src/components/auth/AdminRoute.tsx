import { useAuth } from "@hooks/useAuth";
import { Navigate } from "react-router-dom";
import { isSupabaseConfigured } from "@lib/supabase";
import React from "react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, userRole } = useAuth();

  // Em modo demo (front-end puro), libera acesso ao admin
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}