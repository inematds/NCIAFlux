'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsLoading(false);
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
            Recuperar senha
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-xl font-semibold text-neutral-textPrimary mb-2">
                Email enviado!
              </h2>
              <p className="text-neutral-textSecondary mb-6">
                Se existe uma conta com o email <strong>{email}</strong>, você receberá um link para redefinir sua senha.
              </p>
              <Link
                href="/login"
                className="inline-block bg-primary-main text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Voltar para login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-neutral-textSecondary text-center mb-4">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-main text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          )}

          {!submitted && (
            <div className="mt-6 text-center">
              <Link href="/login" className="text-primary-main font-medium hover:underline">
                ← Voltar para login
              </Link>
            </div>
          )}
        </div>

        {/* Demo Notice */}
        <div className="mt-6 bg-secondary-main/20 rounded-xl p-4 text-center">
          <p className="text-sm text-neutral-textSecondary">
            <strong>Modo Demo:</strong> Nenhum email será enviado. Use qualquer credencial para login.
          </p>
        </div>
      </div>
    </div>
  );
}
