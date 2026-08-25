import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Landing } from './pages/public/Landing';
import { Quiz } from './pages/public/Quiz';
import { Result } from './pages/public/Result';
import { ProductCapture } from './pages/public/ProductCapture';
import { FunnelUnavailable } from './pages/public/FunnelUnavailable';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { TenantDashboard } from './pages/dashboard/TenantDashboard';
import { TenantProducts } from './pages/dashboard/TenantProducts';
import { TenantLeads } from './pages/dashboard/TenantLeads';
import { TenantAppearance } from './pages/dashboard/TenantAppearance';
import { TenantSubscription } from './pages/dashboard/TenantSubscription';
import { TenantPublication } from './pages/dashboard/TenantPublication';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTenants } from './pages/admin/AdminTenants';
import { AdminTemplates } from './pages/admin/AdminTemplates';
import { AdminPlans } from './pages/admin/AdminPlans';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

function App() {
  return (
    <Routes>
      {/* ===== PÚBLICO (funil do visitante) ===== */}
      <Route element={<PublicLayout />}>
        <Route path="/f/:slug" element={<Landing />} />
        <Route path="/f/:slug/quiz" element={<Quiz />} />
        <Route path="/f/:slug/resultado" element={<Result />} />
        <Route path="/f/:slug/produto" element={<ProductCapture />} />
        <Route path="/f/:slug/indisponivel" element={<FunnelUnavailable />} />
      </Route>

      {/* ===== AUTH ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ===== DASHBOARD DO TENANT ===== */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<TenantDashboard />} />
        <Route path="/dashboard/produtos" element={<TenantProducts />} />
        <Route path="/dashboard/leads" element={<TenantLeads />} />
        <Route path="/dashboard/aparencia" element={<TenantAppearance />} />
        <Route path="/dashboard/assinatura" element={<TenantSubscription />} />
        <Route path="/dashboard/publicacao" element={<TenantPublication />} />
      </Route>

      {/* ===== ADMIN ===== */}
      <Route element={<ProtectedRoute><AdminRoute><AdminLayout /></AdminRoute></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tenants" element={<AdminTenants />} />
        <Route path="/admin/templates" element={<AdminTemplates />} />
        <Route path="/admin/planos" element={<AdminPlans />} />
      </Route>

      {/* ===== REDIRECTS ===== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;