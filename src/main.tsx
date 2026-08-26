import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useAuthInit } from './hooks/useAuth';
import './index.css';

// Inicializa a autenticação (Supabase ou, em modo demo/mock, usuário fictício)
function AuthBootstrap() {
  useAuthInit();
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthBootstrap />
    </BrowserRouter>
  </StrictMode>
);