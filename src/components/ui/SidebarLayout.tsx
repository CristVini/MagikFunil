import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface SidebarNavItem {
  path: string;
  label: string;
  icon: any;
}

interface SidebarLayoutProps {
  navItems: SidebarNavItem[];
  roleLabel: string;
  brandSubtitle: string;
}

export function SidebarLayout({ navItems, roleLabel, brandSubtitle }: SidebarLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar colapsada (desktop) e drawer aberto (mobile)
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o drawer ao trocar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Título atual da página a partir da rota
  const currentTitle = navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-stone-50 lg:ml-0" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ===== Sidebar (desktop / e drawer mobile) ===== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-stone-950 border-r border-stone-800
          flex flex-col transition-all duration-300
          ${mobileOpen ? 'translate-x-0 w-64' : collapsed ? 'w-16 -translate-x-full lg:translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo + collapse (desktop) */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-display font-bold text-amber-400 truncate">MagikFunil</h1>
            <p className="text-xs text-stone-500 mt-0.5 truncate">{collapsed && !mobileOpen ? '' : brandSubtitle}</p>
          </div>
          {mobileOpen ? (
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 text-stone-400 hover:text-stone-100">
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 text-stone-400 hover:text-stone-100"
              title={collapsed ? 'Expandir' : 'Recolher'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-stone-800/50 text-amber-300 border border-stone-700'
                    : 'text-stone-400 hover:bg-stone-800/30 hover:text-stone-100'
                } ${collapsed && !mobileOpen ? 'justify-center' : ''}`
              }
            >
              <item.icon size={18} strokeWidth={2} className="shrink-0" />
              {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User / Sign out */}
        <div className="p-3 border-t border-stone-800">
          <div className={`flex items-center gap-3 px-2 py-2 text-stone-400 text-sm ${collapsed && !mobileOpen ? 'justify-center' : ''}`}>
            {(!collapsed || mobileOpen) && (
              <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 shrink-0">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            {(!collapsed || mobileOpen) ? (
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-stone-100">{user?.email}</p>
                <p className="truncate text-xs">{roleLabel}</p>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 shrink-0">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors shrink-0"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop (mobile) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== Conteúdo ===== */}
      <main className={`min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header (mobile: hambúrguer; desktop: título) */}
        <header className="sticky top-0 z-30 bg-stone-50/80 backdrop-blur-sm border-b border-stone-200">
          <div className="px-4 sm:px-6 py-3.5 lg:py-4 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
              title="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg sm:text-2xl font-display font-bold text-stone-950 truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {currentTitle}
            </h2>
          </div>
        </header>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}