import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';
import { MOCK_ADMIN_USER } from '@pages/admin/mockData';
import { isSupabaseConfigured } from '@lib/supabase';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signOut, setUser, setUserRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Informe e-mail e senha para entrar.');
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Modo demo: qualquer e-mail e senha autenticam como administrador
        setUser(MOCK_ADMIN_USER as any);
        setUserRole('admin');
        navigate('/admin', { replace: true });
        return;
      }

      // Supabase real: autentica e exige papel admin
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError('Credenciais inválidas. Verifique e-mail e senha.');
        setLoading(false);
        return;
      }

      const { userRole } = useAuth.getState();
      if (userRole !== 'admin') {
        await signOut();
        setError('Acesso restrito: este e-mail não é administrador.');
        setLoading(false);
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Erro ao entrar. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* bg decorativo */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-stone-50" style={{ fontFamily: 'var(--font-display)' }}>
            MagikFunil Admin
          </h1>
          <p className="text-stone-500 mt-2">Área restrita — equipe MagikFunil</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8">
          <div className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              Modo demo: qualquer e-mail e senha permitem entrar como administrador.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-stone-400 mb-2">E-mail da equipe</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                <input
                  id="adminEmail"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-800/60 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="voce@magikfunil.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-stone-400 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-stone-800/60 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-amber-500 text-stone-950 rounded-xl font-semibold uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Entrando...' : 'Entrar no Admin'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-stone-500 text-sm">
            <Link to="/login" className="text-stone-400 hover:text-amber-400 font-medium">
              ← Ir para o acesso do cliente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}