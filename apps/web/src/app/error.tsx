'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-accent-error mb-4">Ops!</h1>
        <h2 className="text-2xl font-semibold text-neutral-textPrimary mb-4">
          Algo deu errado
        </h2>
        <p className="text-neutral-textSecondary mb-8">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-primary-main text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
