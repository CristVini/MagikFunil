import { Link } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck, TrendingUp } from "lucide-react";

const PLANS = [
  {
    name: "Basic",
    price: "R$ 278,90",
    tagline: "Funciona e cabe no orçamento.",
    features: ["1 funil público", "Até 4 produtos", "1.500 leads/mês", "WhatsApp integrado"],
  },
  {
    name: "Enterprise",
    price: "R$ 397,00",
    tagline: "O funil que decide com você.",
    featured: true,
    features: [
      "Domínio próprio",
      "Produtos ilimitados",
      "Analytics de decisão",
      "Perfil de cliente dominante",
      "Next-best-offer",
      "Relatório de ROI",
    ],
    cta: "Conversar com o time",
  },
  {
    name: "Pro",
    price: "R$ 369,00",
    tagline: "Mais produtos e volume de leads.",
    features: ["Até 6 produtos", "3.000 leads/mês", "Métricas de conversão", "Export CSV"],
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 overflow-x-hidden" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ===== Fundo vivo: orbs brilhantes animadas ===== */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-1/4 -right-40 w-[450px] h-[450px] rounded-full bg-violet-600/25 blur-[120px] animate-float" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/15 blur-[120px] animate-float-slow" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
      </div>

      {/* NAV */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-stone-950 grid place-items-center font-bold shadow-lg shadow-amber-500/30">✓</div>
          <span className="font-display font-bold text-stone-50 tracking-tight text-lg">MagikFunil</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/login" className="text-sm text-stone-400 hover:text-stone-200 transition-colors">Admin</Link>
          <Link to="/login" className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-amber-500/40 transition-all hover:-translate-y-0.5">
            Entrar
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="max-w-3xl mx-auto px-6 pt-20 md:pt-28 pb-16 text-center animate-slide-up">
        <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 uppercase tracking-[0.2em] mb-5">
          Funis que transformam visitantes em clientes
        </p>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6 text-stone-50">
          Cada cliente chega sabendo o que{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 animate-gradient-x bg-[length:200%_200%]">
            comprar de você
          </span>
        </h1>
        <p className="text-lg text-stone-400 max-w-xl mx-auto mb-10">
          Um quiz curto identifica a necessidade de quem te visita, recomenda o produto certo e leva
          direto à compra. <span className="text-stone-200 font-medium">Você fecha mais venda com o tráfego que já tem.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 rounded-2xl font-bold hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
            Criar meu funil <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/f/encapsulados-nutraceuticos" className="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur text-stone-100 rounded-2xl font-semibold hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
            Ver exemplo real
          </Link>
        </div>
      </header>

      {/* UMA FRASE — card glass */}
      <section className="max-w-5xl mx-auto px-6 pb-12 animate-fade-in">
        <div className="relative rounded-3xl p-10 md:p-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" />
          <p className="text-amber-300 text-sm font-bold uppercase tracking-widest mb-3">Em uma frase</p>
          <p className="font-display text-2xl md:text-3xl font-medium leading-snug text-stone-50 max-w-3xl">
            Um funil inteligente vende seu catálogo do mesmo jeito que o melhor vendedor:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">entendendo o cliente antes de recomendar.</span>
          </p>
        </div>
      </section>

      {/* O QUE MUDA */}
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-stone-50 mb-8">O que muda no seu resultado</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { v: "Mais conversão", d: "Quem chega e ia embora agora recebe uma recomendação e uma ação. Menos abandono, mais decisão.", c: "from-amber-400/20 to-transparent", a: "0s" },
            { v: "Cliente que entendeu o valor", d: "Ele escolhe o produto porque foi a escolha certa pra ele — não porque foi empurrado.", c: "from-emerald-400/20 to-transparent", a: "0.15s" },
            { v: "Decisão por dados", d: "Você enxerga o produto mais clicado, o perfil mais comum e onde a venda trava.", c: "from-violet-400/20 to-transparent", a: "0.3s" },
          ].map((b, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gradient-to-br border border-white/10 hover:border-white/25 hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: b.a }}>
              <p className="font-bold text-stone-50 mb-2 text-lg">{b.v}</p>
              <p className="text-sm text-stone-400 leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FUNCIONA EM QUALQUER CATÁLOGO */}
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-stone-50 mb-8">Funciona em qualquer catálogo</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {["Farmácias e manipulação", "Clínicas e serviços", "E-commerce e consultorias"].map((x, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5 text-stone-100 font-medium">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 grid place-items-center shrink-0"><Check size={14} className="text-emerald-400" /></span>
              {x}
            </div>
          ))}
        </div>
        <p className="text-sm text-stone-500 mt-4">
          Cada um com um funil sob medida. Nós montamos o quiz e as recomendações; você só cola os links pro seu WhatsApp ou loja.
        </p>
      </section>

      {/* PLANOS */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-stone-50 animate-slide-up">Escolha o seu plano</h2>
          <p className="text-stone-400 mt-2">Trial de 30 dias. Sem plano gratuito.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch" style={{ perspective: '1000px' }}>
          {/* Basic */}
          <div className="p-7 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:border-white/25 hover:-translate-y-1 transition-all duration-300 animate-slide-up">
            <h3 className="font-bold text-stone-100">Basic</h3>
            <p className="text-3xl font-bold mt-2 tracking-tight text-stone-50">R$ 278,90<span className="text-base font-normal text-stone-500">/mês</span></p>
            <p className="text-sm text-stone-400 mt-1 mb-6">{PLANS[0].tagline}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {PLANS[0].features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-stone-300">
                  <Check size={16} className="text-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/login" className="block text-center py-3 border border-white/20 text-stone-100 rounded-xl font-semibold hover:bg-white/10 hover:border-white/30 transition-colors">
              Começar
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="relative p-8 rounded-3xl flex flex-col border border-transparent overflow-hidden md:-mt-4 md:-mb-4 animate-slide-up bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-amber-500 text-stone-950 shadow-[0_0_60px_rgba(245,158,11,0.45)]">
            {/* brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent bg-[length:200%_100%] animate-gradient-x pointer-events-none" />
            <div className="relative">
              <span className="inline-block px-3 py-1 bg-stone-950/90 text-amber-300 text-xs font-bold rounded-full mb-3">Mais escolhido</span>
              <h3 className="font-bold text-stone-950 text-2xl">Enterprise</h3>
              <p className="text-4xl font-bold mt-2 tracking-tight text-stone-950">R$ 397,00<span className="text-base font-semibold text-stone-900/70">/mês</span></p>
              <p className="text-sm font-medium text-stone-900 mt-1 mb-6">{PLANS[1].tagline}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {PLANS[1].features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-stone-950">
                    <Check size={16} className="text-stone-950 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block text-center py-3.5 bg-stone-950 text-amber-400 rounded-xl font-bold hover:bg-stone-900 hover:-translate-y-0.5 transition-all">
                Conversar com o time
              </Link>
            </div>
          </div>

          {/* Pro */}
          <div className="p-7 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:border-white/25 hover:-translate-y-1 transition-all duration-300 animate-slide-up">
            <h3 className="font-bold text-stone-100">Pro</h3>
            <p className="text-3xl font-bold mt-2 tracking-tight text-stone-50">R$ 369,00<span className="text-base font-normal text-stone-500">/mês</span></p>
            <p className="text-sm text-stone-400 mt-1 mb-6">{PLANS[2].tagline}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {PLANS[2].features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-stone-300">
                  <Check size={16} className="text-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/login" className="block text-center py-3 border border-white/20 text-stone-100 rounded-xl font-semibold hover:bg-white/10 hover:border-white/30 transition-colors">
              Começar
            </Link>
          </div>
        </div>
      </section>

      {/* POR QUE FICAM */}
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-stone-50 mb-8">Por que os clientes ficam</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-start gap-4 hover:border-white/25 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 grid place-items-center shrink-0"><ShieldCheck size={20} className="text-emerald-400" /></div>
            <div>
              <p className="font-bold text-stone-50">Credibilidade na recomendação</p>
              <p className="text-sm text-stone-400 mt-1">Recomendações com base e referências — essencial onde a confiança decide a compra.</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-start gap-4 hover:border-white/25 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 grid place-items-center shrink-0"><TrendingUp size={20} className="text-amber-400" /></div>
            <div>
              <p className="font-bold text-stone-50">Sua marca, do início ao fim</p>
              <p className="text-sm text-stone-400 mt-1">Funil white-label no seu domínio. Ninguém vê a plataforma, só a sua marca.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center animate-slide-up">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-stone-50 mb-4">
          Quer fechar mais venda com o <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">tráfego que já tem?</span>
        </h2>
        <p className="text-stone-400 text-lg mb-8">Monte seu funil em minutos. Trial de 30 dias.</p>
        <Link to="/register" className="px-9 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 rounded-2xl font-bold hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-1 transition-all inline-flex items-center gap-2 group">
          Criar conta <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 text-stone-950 grid place-items-center text-sm font-bold">✓</div>
            <span className="font-display font-bold text-stone-200">MagikFunil</span>
          </div>
          <p className="text-sm text-stone-500">© 2026 MagikFunil</p>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-stone-500 hover:text-stone-200">Área do cliente</Link>
            <Link to="/admin/login" className="text-stone-500 hover:text-stone-200">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}