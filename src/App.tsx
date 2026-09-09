import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Helper: React.lazy exige default export; adapta o named export da página
const lazyPage = <T extends Record<string, any>>(
  importFn: () => Promise<T>,
  name: keyof T
) => lazy(() => importFn().then(m => ({ default: m[name] })));

// ===== Code-splitting: cada tela carrega só quando é necessária =====
// Páginas públicas (leves)
const Landing = lazyPage(() => import('./pages/public/Landing'), 'Landing');
const Quiz = lazyPage(() => import('./pages/public/Quiz'), 'Quiz');
const Result = lazyPage(() => import('./pages/public/Result'), 'Result');
const ProductCapture = lazyPage(() => import('./pages/public/ProductCapture'), 'ProductCapture');
const FunnelUnavailable = lazyPage(() => import('./pages/public/FunnelUnavailable'), 'FunnelUnavailable');

// Auth + onboarding
const HomePage = lazyPage(() => import('./pages/HomePage'), 'HomePage');
const Login = lazyPage(() => import('./pages/auth/Login'), 'Login');
const Register = lazyPage(() => import('./pages/auth/Register'), 'Register');
const Onboarding = lazyPage(() => import('./pages/auth/Onboarding'), 'Onboarding');
const AdminLogin = lazyPage(() => import('./pages/auth/AdminLogin'), 'AdminLogin');

// Dashboard do tenant (recharts carregado aqui, fora do bundle inicial)
const TenantDashboard = lazyPage(() => import('./pages/dashboard/TenantDashboard'), 'TenantDashboard');
const TenantProducts = lazyPage(() => import('./pages/dashboard/TenantProducts'), 'TenantProducts');
const TenantLeads = lazyPage(() => import('./pages/dashboard/TenantLeads'), 'TenantLeads');
const TenantAppearance = lazyPage(() => import('./pages/dashboard/TenantAppearance'), 'TenantAppearance');
const TenantSubscription = lazyPage(() => import('./pages/dashboard/TenantSubscription'), 'TenantSubscription');
const TenantPublication = lazyPage(() => import('./pages/dashboard/TenantPublication'), 'TenantPublication');
const TenantConfiguration = lazyPage(() => import('./pages/dashboard/TenantConfiguration'), 'TenantConfiguration');

// Admin (recharts carregado aqui, fora do bundle inicial)
const AdminDashboard = lazyPage(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const AdminTenants = lazyPage(() => import('./pages/admin/AdminTenants'), 'AdminTenants');
const AdminTemplates = lazyPage(() => import('./pages/admin/AdminTemplates'), 'AdminTemplates');
const AdminPlans = lazyPage(() => import('./pages/admin/AdminPlans'), 'AdminPlans');

// Fallback suave enquanto a página carrega
function PageLoader() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="animate-pulse-soft text-stone-400">Carregando…</div>
    </div>
  );
}

// Redireciona links antigos /f/:slug/...  ->  /<slug>/funil/...
function LegacyFunnelRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const rest = location.pathname.replace(`/f/${slug}`, '');
  const target = slug ? `/${slug}/funil${rest}` : '/';
  return <Navigate to={target} replace />;
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ===== PÚBLICO (funil do visitante) ===== */}
        {/* Canonical: /<slug>/funil/...  (o slug do cliente vive na raiz) */}
        <Route element={<PublicLayout />}>
          <Route path="/:slug/funil" element={<Landing />} />
          <Route path="/:slug/funil/quiz" element={<Quiz />} />
          <Route path="/:slug/funil/resultado" element={<Result />} />
          <Route path="/:slug/funil/produto" element={<ProductCapture />} />
          <Route path="/:slug/funil/indisponivel" element={<FunnelUnavailable />} />
        </Route>

        {/* Legado: /f/:slug/...  ->  redireciona para a nova forma (links antigos continuam ok) */}
        <Route element={<LegacyFunnelRedirect />}>
          <Route path="/f/:slug" />
          <Route path="/f/:slug/quiz" />
          <Route path="/f/:slug/resultado" />
          <Route path="/f/:slug/produto" />
          <Route path="/f/:slug/indisponivel" />
        </Route>

        {/* ===== AUTH ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== ONBOARDING (pós-cadastro do cliente) ===== */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* ===== ADMIN LOGIN (equipe) ===== */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ===== DASHBOARD DO TENANT ===== */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<TenantDashboard />} />
          <Route path="/dashboard/produtos" element={<TenantProducts />} />
          <Route path="/dashboard/leads" element={<TenantLeads />} />
          <Route path="/dashboard/aparencia" element={<TenantAppearance />} />
          <Route path="/dashboard/assinatura" element={<TenantSubscription />} />
          <Route path="/dashboard/publicacao" element={<TenantPublication />} />
          <Route path="/dashboard/configuracao" element={<TenantConfiguration />} />
        </Route>

        {/* ===== ADMIN ===== */}
        <Route element={<ProtectedRoute><AdminRoute><AdminLayout /></AdminRoute></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tenants" element={<AdminTenants />} />
          <Route path="/admin/templates" element={<AdminTemplates />} />
          <Route path="/admin/planos" element={<AdminPlans />} />
        </Route>

        {/* ===== REDIRECTS ===== */}
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;