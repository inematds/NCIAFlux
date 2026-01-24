'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-main to-primary-dark">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            NCIAFlux
          </div>
          <div className="flex items-center gap-4">
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
            Gestão Inteligente para
            <span className="text-secondary-main"> TDAH</span>
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Plataforma completa para profissionais e gestores acompanharem
            e apoiarem pessoas com TDAH no ambiente de trabalho.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-secondary-main text-neutral-textPrimary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-secondary-light transition-colors"
            >
              Começar Gratuitamente
            </Link>
            <Link
              href="/demo"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Ver Demonstração
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon="📊"
            title="Dashboard Inteligente"
            description="Visualize métricas de produtividade e bem-estar da sua equipe em tempo real."
          />
          <FeatureCard
            icon="📋"
            title="Gestão de Tarefas"
            description="Acompanhe tarefas e projetos com visibilidade clara do progresso."
          />
          <FeatureCard
            icon="📈"
            title="Relatórios Detalhados"
            description="Relatórios personalizados para entender padrões e melhorar resultados."
          />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-24 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <StatCard value="95%" label="Satisfação" />
          <StatCard value="+40%" label="Produtividade" />
          <StatCard value="10k+" label="Usuários" />
          <StatCard value="500+" label="Empresas" />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-12 border-t border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60">
            © 2024 NCIAFlux. Todos os direitos reservados.
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

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white">{value}</div>
      <div className="text-white/60 mt-1">{label}</div>
    </div>
  );
}
