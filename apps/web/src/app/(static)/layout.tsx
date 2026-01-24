import Link from 'next/link';

export default function StaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-background">
      {/* Header */}
      <header className="bg-white border-b border-neutral-border">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-main">
              NCIAFlux
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-neutral-textSecondary hover:text-primary-main transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-primary-main text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-border mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-textSecondary">
              © 2024 NCIAFlux. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-neutral-textSecondary hover:text-primary-main transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="text-neutral-textSecondary hover:text-primary-main transition-colors">
                Termos
              </Link>
              <Link href="/contact" className="text-neutral-textSecondary hover:text-primary-main transition-colors">
                Contato
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
