'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userStorage } from '@/lib/storage';

type DemoRole = 'user' | 'manager' | 'admin';

// Usuarios padrao de demonstracao - nao confundir com perfis reais
const DEMO_USERS: Record<DemoRole, { email: string; name: string }> = {
  user: { email: 'UserNF@gmail.com', name: 'Usuario Demo NF' },
  manager: { email: 'gestorNF@gmail.com', name: 'Gestor Demo NF' },
  admin: { email: 'adminNF@gmail.com', name: 'Admin Demo NF' },
};

const roleOptions: { role: DemoRole; icon: string; title: string; desc: string }[] = [
  { role: 'user', icon: '👤', title: 'Usuario', desc: 'Experiencia pessoal completa' },
  { role: 'manager', icon: '👥', title: 'Gestor', desc: 'Gerencia equipes + visao pessoal' },
  { role: 'admin', icon: '🏢', title: 'Admin', desc: 'Administra organizacao completa' },
];

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<DemoRole>('user');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Check if already logged in (but don't redirect - allow switching to demo)
  useEffect(() => {
    const user = userStorage.get();
    if (user) {
      setCurrentUser(user.email);
    }
  }, []);

  function startDemo() {
    setIsLoading(true);

    // Faz logout se estiver logado, para permitir trocar para demo
    if (userStorage.isAuthenticated()) {
      userStorage.remove();
      // Limpa localStorage de dados do usuario anterior, mantendo dados globais
      const keysToKeep = ['nciaflux_demo_user', 'nciaflux_global_teams'];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nciaflux_') && !keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    }

    // Usa navegacao completa para garantir estado limpo
    window.location.href = `/login?demo=${selectedRole}`;
  }

  return (
    <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 justify-center">
            <div className="w-12 h-12 bg-primary-main rounded-xl flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="text-3xl font-bold text-primary-main">MentesBrilhantes</span>
          </Link>
          <p className="text-neutral-textSecondary mt-2">
            Modo Demonstracao
          </p>
        </div>

        {/* Demo Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-neutral-textPrimary text-center mb-6">
            Escolha o tipo de perfil:
          </h2>

          {/* Role Selection */}
          <div className="space-y-3 mb-6">
            {roleOptions.map((option) => (
              <button
                key={option.role}
                onClick={() => setSelectedRole(option.role)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  selectedRole === option.role
                    ? 'border-primary-main bg-primary-main/10'
                    : 'border-neutral-border bg-white hover:border-primary-light'
                }`}
              >
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-textPrimary">{option.title}</h3>
                  <p className="text-sm text-neutral-textSecondary">{option.desc}</p>
                </div>
                {selectedRole === option.role && (
                  <span className="text-primary-main text-xl">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Current user notice */}
          {currentUser && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Voce esta logado como <strong>{currentUser}</strong>.
              Ao entrar no demo, sua sessao atual sera encerrada.
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={startDemo}
            disabled={isLoading}
            className="w-full bg-primary-main text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : currentUser ? 'Trocar para Demo' : 'Entrar no Demo'}
          </button>
        </div>

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-neutral-textSecondary">
            Quer criar sua propria conta?{' '}
            <Link href="/register" className="text-primary-main font-medium hover:underline">
              Criar conta
            </Link>
          </p>
          <p className="text-neutral-textSecondary mt-2">
            Ja tem uma conta?{' '}
            <Link href="/login" className="text-primary-main font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        </div>

        {/* Info */}
        <div className="mt-6 bg-secondary-main/20 rounded-xl p-4">
          <p className="text-sm text-neutral-textSecondary text-center mb-3">
            O demo usa dados de exemplo salvos localmente no navegador.
          </p>
          <div className="text-xs text-neutral-textMuted space-y-1">
            <p><span className="font-medium">Usuario:</span> {DEMO_USERS.user.email}</p>
            <p><span className="font-medium">Gestor:</span> {DEMO_USERS.manager.email}</p>
            <p><span className="font-medium">Admin:</span> {DEMO_USERS.admin.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
