'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userStorage, StoredUser } from '@/lib/storage';
import { userStatsService, storageModeService } from '@/lib/hybrid-storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (userStorage.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Senha deve ter pelo menos 4 caracteres.');
      setIsLoading(false);
      return;
    }

    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Demo mode authentication - create user and store locally
    const user: StoredUser = {
      id: `user_${Date.now()}`,
      email: email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: 'manager',
    };

    userStorage.set(user);

    // Update user stats in Supabase (async, don't block login)
    userStatsService.upsertUserStats(user).catch((err) => {
      console.error('Failed to update user stats:', err);
    });

    router.push('/dashboard');
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
            Entre na sua conta
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-accent-error/10 text-accent-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-textMuted hover:text-neutral-textSecondary"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-neutral-border text-primary-main focus:ring-primary-main" />
                <span className="ml-2 text-sm text-neutral-textSecondary">Lembrar de mim</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-main hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-main text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-textSecondary">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-primary-main font-medium hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Storage Mode Notice */}
        <div className="mt-6 bg-secondary-main/20 rounded-xl p-4 text-center">
          <p className="text-sm text-neutral-textSecondary">
            <strong>Plano Gratuito:</strong> Use qualquer email e senha para testar.
            {storageModeService.isStatsTrackingEnabled() && (
              <span className="block mt-1 text-xs text-green-600">
                Estatisticas de uso sincronizadas com o servidor.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
