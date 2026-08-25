import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { LayoutDashboard, Package, Users, Palette, CreditCard, Globe, LogOut, Settings, BarChart3, Building2, FileText, DollarSign } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { path: '/dashboard/produtos', label: 'Produtos', icon: Package },
  { path: '/dashboard/leads', label: 'Leads', icon: Users },
  { path: '/dashboard/aparencia', label: 'Aparência', icon: Palette },
  { path: '/dashboard/assinatura', label: 'Assinatura', icon: CreditCard },
  { path: '/dashboard/publicacao', label: 'Publicação', icon: Globe },
];

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: 'var(--font-sans)' }}>
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-stone-950 border-r border-stone-800 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-stone-800">
            <h1 className="text-xl font-display font-bold text-amber-400">MagikFunil</h1>
            <p className="text-xs text-stone-500 mt-1">Painel do Cliente</p>
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-stone-800/50 text-amber-300 border border-stone-700'
                      : 'text-stone-400 hover:bg-stone-800/30 hover:text-stone-100'
                  }`
                }
              >
                <item.icon size={18} strokeWidth={2} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User / Sign out */}
          <div className="p-4 border-t border-stone-800">
            <div className="flex items-center gap-3 px-3 py-2 text-stone-400 text-sm">
              <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-stone-100">{user?.email}</p>
                <p className="truncate text-xs">Cliente</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-stone-50/80 backdrop-blur-sm border-b border-stone-200">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-display font-bold text-stone-950">
              {NAV_ITEMS.find(i => window.location.pathname.startsWith(i.path))?.label || 'Dashboard'}
            </h2>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}