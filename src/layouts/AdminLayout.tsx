import { SidebarLayout } from '@components/ui/SidebarLayout';
import { LayoutDashboard, Building2, FileText, DollarSign } from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/tenants', label: 'Tenants', icon: Building2 },
  { path: '/admin/templates', label: 'Templates', icon: FileText },
  { path: '/admin/planos', label: 'Planos & Billing', icon: DollarSign },
];

export function AdminLayout() {
  return <SidebarLayout navItems={ADMIN_NAV_ITEMS} roleLabel="Administrador" brandSubtitle="Admin" />;
}