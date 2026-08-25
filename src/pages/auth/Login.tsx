import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <Sparkles size={32} className="text-amber-500" />
            <span className="text-2xl font-display font-bold text-stone-950" style={{ fontFamily: 'var(--font-display)' }}>
              MagikFunil
            </span>
          </Link>
          <p className="text-stone-500 mt-2">Entre no seu painel</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500" />
                <span className="text-sm text-stone-600">Lembrar-me</span>
              </label>
              <Link to="/recuperar-senha" className="text-sm text-amber-600 hover:text-amber-500 font-medium">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-stone-950 text-stone-50 rounded-xl font-semibold text-base uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-stone-500 text-sm">
            Não tem conta?{' '}
            <Link to="/register" className="text-amber-600 hover:text-amber-500 font-medium">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}