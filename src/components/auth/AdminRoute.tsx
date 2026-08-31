import { useAuth } from "@hooks/useAuth";
import { Navigate } from "react-router-dom";
import React from "react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, userRole } = useAuth();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}