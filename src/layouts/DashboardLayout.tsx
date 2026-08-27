import { SidebarLayout } from '@components/ui/SidebarLayout';
import { LayoutDashboard, Package, Users, Palette, CreditCard, Globe, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { path: '/dashboard/produtos', label: 'Produtos', icon: Package },
  { path: '/dashboard/leads', label: 'Leads', icon: Users },
  { path: '/dashboard/aparencia', label: 'Aparência', icon: Palette },
  { path: '/dashboard/assinatura', label: 'Assinatura', icon: CreditCard },
  { path: '/dashboard/publicacao', label: 'Publicação', icon: Globe },
  { path: '/dashboard/configuracao', label: 'Configuração', icon: Settings },
];

export function DashboardLayout() {
  return <SidebarLayout navItems={NAV_ITEMS} roleLabel="Cliente" brandSubtitle="Painel do Cliente" />;
}