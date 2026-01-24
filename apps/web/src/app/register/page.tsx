'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userStorage, StoredUser } from '@/lib/storage';
import { userStatsService, storageModeService } from '@/lib/hybrid-storage';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'manager' | 'admin',
    company: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (userStorage.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create user and store locally
    const user: StoredUser = {
      id: `user_${Date.now()}`,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      company: formData.company || undefined,
    };

    userStorage.set(user);

    // Save user stats to Supabase (async, don't block registration)
    userStatsService.upsertUserStats(user).catch((err) => {
      console.error('Failed to save user stats:', err);
    });

    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary-main">NCIAFlux</h1>
          </Link>
          <p className="text-neutral-textSecondary mt-2">
            Crie sua conta
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-accent-error/10 text-accent-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Empresa (opcional)
              </label>
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Tipo de conta
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent bg-white"
              >
                <option value="user">Usuário Individual (apenas minhas tarefas)</option>
                <option value="manager">Gestor / Líder (gerencia equipes)</option>
                <option value="admin">Administrador (acesso total)</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-textMuted hover:text-neutral-textSecondary"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-main text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-textSecondary">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary-main font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Storage Mode Notice */}
        <div className="mt-6 bg-secondary-main/20 rounded-xl p-4 text-center">
          <p className="text-sm text-neutral-textSecondary">
            <strong>Plano Gratuito:</strong> Seus dados ficam salvos localmente no navegador.
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
