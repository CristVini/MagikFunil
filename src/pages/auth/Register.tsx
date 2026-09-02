import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp, verifyOtp, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);

    const { error, needsConfirmation: needsEmail } = await signUp(
      email,
      password,
      { name },
    );
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (needsEmail) {
      setNeedsConfirmation(true);
      setLoading(false);
      setOtp("");
    } else {
      navigate("/onboarding", { replace: true });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Digite o código de 6 dígitos que enviamos para seu e-mail.");
      return;
    }
    setError("");
    setVerifying(true);
    const { error } = await verifyOtp(email, otp);
    setVerifying(false);
    if (error) {
      setError(error.message || "Código inválido ou expirado. Tente reenviar.");
    } else {
      navigate("/onboarding", { replace: true });
    }
  };

  const handleResend = async () => {
    setError("");
    setResent(false);
    const { error } = await resendConfirmation(email);
    if (error)
      setError(error.message || "Não foi possível reenviar. Tente novamente.");
    else {
      setResent(true);
      setOtp("");
    }
  };

  return (
    <div
      className="min-h-screen bg-stone-50 flex items-center justify-center px-4"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1
            className="text-2xl font-display font-bold text-stone-950"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <Sparkles size={32} className="text-amber-500 inline" />
            MagikFunil
          </h1>
          <p className="text-stone-500 mt-2">Crie sua conta e comece agora</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {needsConfirmation && (
            <div className="mb-6 p-5 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 text-sm">
              <p className="font-semibold mb-1">
                Conta criada! Confirme seu e-mail.
              </p>
              <p className="mb-4">
                Enviamos um <strong>código de 6 dígitos</strong> para{" "}
                <strong>{email}</strong>. Digite o código abaixo para ativar sua
                conta.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl text-stone-950 text-center text-2xl font-bold tracking-[0.5em] placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={6}
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {verifying ? "Confirmando..." : "Confirmar código"}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full py-2 text-purple-700 hover:text-purple-900 font-medium text-sm"
                >
                  {resent
                    ? "Código reenviado! Verifique seu e-mail."
                    : "Reenviar código"}
                </button>
              </form>
              {resent && (
                <p className="mt-2 text-xs text-purple-600">
                  Se não encontrar o e-mail, confira a caixa de spam.
                </p>
              )}
            </div>
          )}

          {!needsConfirmation && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Nome completo
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={20}
                  />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={20}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={20}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Mínimo 8 caracteres"
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={20}
                  />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-stone-950 text-stone-50 rounded-xl font-semibold text-base uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "Criando conta..." : "Criar conta"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-stone-500 text-sm">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-amber-600 hover:text-amber-500 font-medium"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
