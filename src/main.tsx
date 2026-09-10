import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useAuthInit } from './hooks/useAuth';
import { applyTheme, DEFAULT_TENANT_THEME } from './packages/theme';
import './index.css';

// Garante as CSS vars de tema (incl. superfície escura --theme-dark-*) no root,
// para qualquer tela (dashboard incl.) poder renderizar prévias fiéis do funil.
applyTheme(DEFAULT_TENANT_THEME);

// Inicializa a autenticação (sessão real do Supabase)
function AuthBootstrap() {
  useAuthInit();
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthBootstrap />
    </BrowserRouter>
  </StrictMode>
);