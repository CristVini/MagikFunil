import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useAuthInit } from './hooks/useAuth';
import './index.css';

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