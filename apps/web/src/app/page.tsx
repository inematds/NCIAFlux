'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-main to-primary-dark">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-main font-bold text-lg">
              M
            </div>
            <span className="text-2xl font-bold text-white">MentesBrilhantes</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/demo"
              className="text-white/90 hover:text-white transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/login"
              className="text-white/90 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-white text-primary-main px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Produtividade que
            <span className="text-secondary-main"> entende voce</span>
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Sistema completo de organizacao pessoal baseado em neurociencia.
            Brain Dump, Rotinas, Cronotipos e muito mais para você fazer mais com menos estresse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="bg-secondary-main text-neutral-textPrimary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-secondary-light transition-colors"
            >
              Experimentar Gratis
            </Link>
            <Link
              href="/register"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon="📝"
            title="Brain Dump"
            description="Capture todos os pensamentos e organize com triagem inteligente. Defina seu Top 1 diario."
          />
          <FeatureCard
            icon="🔄"
            title="Rotinas Adaptativas"
            description="Crie rotinas matinais e noturnas com decisoes condicionais que se adaptam ao seu dia."
          />
          <FeatureCard
            icon="🧠"
            title="Cronotipos"
            description="Descubra seu perfil de produtividade e receba dicas personalizadas para seu ritmo."
          />
        </div>

        {/* More Features */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <FeatureCard
            icon="📅"
            title="Planner Diario"
            description="Organize seu dia em blocos de tempo com check-in de humor e energia."
          />
          <FeatureCard
            icon="📁"
            title="Projetos"
            description="Agrupe tarefas por projetos e acompanhe o progresso visualmente."
          />
          <FeatureCard
            icon="📓"
            title="Notas"
            description="Capture ideias rapidamente com inbox e organize em pastas."
          />
          <FeatureCard
            icon="📊"
            title="Revisoes"
            description="Reflita semanalmente sobre vitorias, desafios e aprendizados."
          />
        </div>

        {/* CTA */}
        <div className="mt-24 bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para transformar sua produtividade?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Experimente gratuitamente com dados de exemplo ou crie sua conta para comecar do zero.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="bg-white text-primary-main px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              Ver Demo
            </Link>
            <Link
              href="/register"
              className="bg-secondary-main text-neutral-textPrimary px-8 py-3 rounded-xl font-semibold hover:bg-secondary-light transition-colors"
            >
              Criar Conta Gratis
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-12 border-t border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60">
            © 2024 MentesBrilhantes. Produtividade que entende voce.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
              Privacidade
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors">
              Termos
            </Link>
            <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
}

