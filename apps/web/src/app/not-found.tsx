import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-main mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-textPrimary mb-4">
          Página não encontrada
        </h2>
        <p className="text-neutral-textSecondary mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary-main text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
